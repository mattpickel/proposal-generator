/**
 * Proposal Generation Service
 *
 * Generates proposals section-by-section using AI
 */

import { buildSectionContext, buildGenerateSectionPrompt, buildReviseSectionPrompt } from '../config/sectionPrompts.js';
import { SYSTEM_PROMPT, buildUserPrompt, formatServicesForPrompt } from '../config/unifiedProposalPrompt.js';
import { log } from '../utils/logger.js';
import {
  proposalTemplates,
  styleCards,
  serviceModules,
  sectionExemplars,
  clientBriefs,
  supportingDocuments,
  proposalSections,
  proposalInstances
} from './database.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Collect exemplars for a section
 */
async function collectExemplars(sectionId, selectedServiceIds) {
  try {
    // Get all exemplars for this section
    const sectionExemplarsData = await sectionExemplars.getBySectionId(sectionId);

    // Filter to include:
    // 1. Exemplars with no serviceId (global)
    // 2. Exemplars matching selected services
    const relevant = sectionExemplarsData.filter(ex =>
      !ex.serviceId || selectedServiceIds.includes(ex.serviceId)
    );

    log.debug('ProposalGen', `Collected ${relevant.length} exemplars for section ${sectionId}`, {
      total: sectionExemplarsData.length,
      relevant: relevant.length
    });

    return relevant;
  } catch (error) {
    log.warn('ProposalGen', `Error collecting exemplars for ${sectionId}`, error);
    return [];
  }
}

/**
 * Generate a single section
 */
export async function generateSection(apiKey, {
  templateSection,
  clientBriefId,
  selectedServiceIds,
  proposalInstanceId
}) {
  log.info('ProposalGen', `Generating section: ${templateSection.title}`, {
    sectionId: templateSection.id,
    proposalInstanceId
  });

  try {
    // Load required data
    const [clientBrief, template, styleCard, services] = await Promise.all([
      clientBriefs.get(clientBriefId),
      proposalTemplates.getDefault(),
      styleCards.getDefault(),
      serviceModules.getByIds(selectedServiceIds)
    ]);

    // Collect exemplars
    const exemplars = await collectExemplars(templateSection.id, selectedServiceIds);

    // Build context
    const sectionContext = buildSectionContext(
      templateSection,
      clientBrief,
      services,
      styleCard,
      exemplars
    );

    // Build prompt
    const prompt = buildGenerateSectionPrompt(sectionContext);

    log.debug('ProposalGen', `Calling AI for section ${templateSection.id}`, {
      promptLength: prompt.length,
      exemplarsCount: exemplars.length
    });

    // Call OpenAI
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    log.info('ProposalGen', `Section generated: ${templateSection.title}`, {
      contentLength: content.length,
      tokens: data.usage?.total_tokens
    });

    // Save to database
    const sectionInstance = await proposalSections.create({
      proposalInstanceId,
      sectionId: templateSection.id,
      content,
      version: 1
    });

    return sectionInstance;
  } catch (error) {
    log.error('ProposalGen', `Failed to generate section ${templateSection.id}`, {
      error: error.message
    });
    throw error;
  }
}

/**
 * Generate all sections for a proposal
 */
export async function generateAllSections(apiKey, proposalInstanceId, onProgress) {
  log.info('ProposalGen', 'Starting full proposal generation', { proposalInstanceId });

  try {
    // Get proposal instance
    const proposal = await proposalInstances.get(proposalInstanceId);

    if (!proposal) {
      throw new Error('Proposal instance not found');
    }

    // Get template
    const template = await proposalTemplates.get(proposal.templateId);

    const results = [];
    const totalSections = template.sections.length;

    // Generate each section
    for (let i = 0; i < template.sections.length; i++) {
      const section = template.sections[i];

      // Notify progress
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: totalSections,
          sectionTitle: section.title
        });
      }

      const result = await generateSection(apiKey, {
        templateSection: section,
        clientBriefId: proposal.clientBriefId,
        selectedServiceIds: proposal.serviceIds,
        proposalInstanceId
      });

      results.push(result);
    }

    log.info('ProposalGen', 'All sections generated', {
      proposalInstanceId,
      sectionsCount: results.length
    });

    // Update proposal status
    await proposalInstances.update(proposalInstanceId, {
      status: 'generated'
    });

    return results;
  } catch (error) {
    log.error('ProposalGen', 'Failed to generate all sections', {
      error: error.message,
      proposalInstanceId
    });
    throw error;
  }
}

/**
 * Revise a specific section
 */
export async function reviseSection(apiKey, sectionInstanceId, userComment) {
  log.info('ProposalGen', 'Revising section', { sectionInstanceId });

  try {
    // Get current section
    const currentSection = await proposalSections.get(sectionInstanceId);

    if (!currentSection) {
      throw new Error('Section not found');
    }

    // Get proposal and client brief
    const proposal = await proposalInstances.get(currentSection.proposalInstanceId);
    const clientBrief = await clientBriefs.get(proposal.clientBriefId);
    const styleCard = await styleCards.getDefault();

    // Build revision prompt
    const prompt = buildReviseSectionPrompt(
      currentSection.content,
      clientBrief.clientName,
      styleCard,
      userComment
    );

    log.debug('ProposalGen', 'Calling AI for revision', {
      sectionId: currentSection.sectionId,
      currentVersion: currentSection.version
    });

    // Call OpenAI
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    const revisedContent = data.choices[0].message.content;

    log.info('ProposalGen', 'Section revised', {
      sectionId: currentSection.sectionId,
      newVersion: currentSection.version + 1,
      tokens: data.usage?.total_tokens
    });

    // Create new version
    const newSection = await proposalSections.create({
      proposalInstanceId: currentSection.proposalInstanceId,
      sectionId: currentSection.sectionId,
      content: revisedContent,
      version: currentSection.version + 1,
      comment: userComment
    });

    return newSection;
  } catch (error) {
    log.error('ProposalGen', 'Failed to revise section', {
      error: error.message,
      sectionInstanceId
    });
    throw error;
  }
}

/**
 * Generate a unified proposal using the new single-pass approach
 * This replaces the section-by-section generation with one AI call
 * that produces the entire proposal body + service line descriptions
 */
export async function generateUnifiedProposal(apiKey, proposalInstanceId, proposalMetadata = {}) {
  log.info('ProposalGen', 'Starting unified proposal generation', { proposalInstanceId });

  try {
    // Get proposal instance
    const proposal = await proposalInstances.get(proposalInstanceId);

    if (!proposal) {
      throw new Error('Proposal instance not found');
    }

    // Load client brief and services
    const [clientBrief, services] = await Promise.all([
      clientBriefs.get(proposal.clientBriefId),
      serviceModules.getByIds(proposal.serviceIds)
    ]);

    if (!clientBrief) {
      throw new Error('Client brief not found');
    }

    log.debug('ProposalGen', 'Loaded data for unified generation', {
      clientBriefId: proposal.clientBriefId,
      servicesCount: services.length
    });

    // Format services for the prompt
    const formattedServices = formatServicesForPrompt(services, clientBrief);

    // Build the user prompt
    const userPrompt = buildUserPrompt({
      clientBrief,
      selectedServices: formattedServices,
      proposalMetadata
    });

    log.debug('ProposalGen', 'Calling AI for unified proposal', {
      systemPromptLength: SYSTEM_PROMPT.length,
      userPromptLength: userPrompt.length,
      servicesCount: formattedServices.length
    });

    // Call OpenAI with system + user prompts
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        max_tokens: 4000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response
    let proposalData;
    try {
      proposalData = JSON.parse(content);
    } catch (parseError) {
      log.error('ProposalGen', 'Failed to parse AI response as JSON', {
        content: content.substring(0, 500),
        error: parseError.message
      });
      throw new Error('AI returned invalid JSON');
    }

    const { proposal_body_markdown, services: serviceDescriptions } = proposalData;

    if (!proposal_body_markdown) {
      throw new Error('AI response missing proposal_body_markdown');
    }

    log.info('ProposalGen', 'Unified proposal generated successfully', {
      proposalBodyLength: proposal_body_markdown.length,
      servicesCount: serviceDescriptions?.length || 0,
      tokens: data.usage?.total_tokens
    });

    // Store the proposal body as a single section
    const sectionInstance = await proposalSections.create({
      proposalInstanceId,
      sectionId: 'unified_proposal',
      content: proposal_body_markdown,
      version: 1,
      metadata: {
        serviceDescriptions,
        generatedAt: new Date().toISOString()
      }
    });

    // Update proposal status and store service descriptions
    await proposalInstances.update(proposalInstanceId, {
      status: 'generated',
      serviceDescriptions: serviceDescriptions || []
    });

    return {
      proposalBody: proposal_body_markdown,
      serviceDescriptions: serviceDescriptions || [],
      sectionInstance,
      tokens: data.usage?.total_tokens
    };
  } catch (error) {
    log.error('ProposalGen', 'Failed to generate unified proposal', {
      error: error.message,
      proposalInstanceId
    });
    throw error;
  }
}
