/**
 * Proposal Generation Service
 *
 * Generates proposals section-by-section using AI
 */

import { buildSectionContext, buildGenerateSectionPrompt, buildReviseSectionPrompt } from '../config/sectionPrompts.js';
import { SYSTEM_PROMPT, buildUserPrompt, formatServicesForPrompt } from '../config/unifiedProposalPrompt.js';
import { callAnthropic, MODELS, parseJSONResponse } from './anthropic.js';
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

/**
 * Collect exemplars for a section
 */
async function collectExemplars(sectionId, selectedServiceIds) {
  try {
    const sectionExemplarsData = await sectionExemplars.getBySectionId(sectionId);

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
    const [clientBrief, template, styleCard, services] = await Promise.all([
      clientBriefs.get(clientBriefId),
      proposalTemplates.getDefault(),
      styleCards.getDefault(),
      serviceModules.getByIds(selectedServiceIds)
    ]);

    const exemplars = await collectExemplars(templateSection.id, selectedServiceIds);

    const sectionContext = buildSectionContext(
      templateSection,
      clientBrief,
      services,
      styleCard,
      exemplars
    );

    const prompt = buildGenerateSectionPrompt(sectionContext);

    log.debug('ProposalGen', `Calling AI for section ${templateSection.id}`, {
      promptLength: prompt.length,
      exemplarsCount: exemplars.length
    });

    const { text, inputTokens, outputTokens } = await callAnthropic(apiKey, {
      messages: [{ role: 'user', content: prompt }],
      model: MODELS.standard,
      maxTokens: 2000,
      temperature: 0.3,
      operationType: `generate-section-${templateSection.id}`
    });

    log.info('ProposalGen', `Section generated: ${templateSection.title}`, {
      contentLength: text.length,
      tokens: inputTokens + outputTokens
    });

    const sectionInstance = await proposalSections.create({
      proposalInstanceId,
      sectionId: templateSection.id,
      content: text,
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
    const proposal = await proposalInstances.get(proposalInstanceId);

    if (!proposal) {
      throw new Error('Proposal instance not found');
    }

    const template = await proposalTemplates.get(proposal.templateId);

    const results = [];
    const totalSections = template.sections.length;

    for (let i = 0; i < template.sections.length; i++) {
      const section = template.sections[i];

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
    const currentSection = await proposalSections.get(sectionInstanceId);

    if (!currentSection) {
      throw new Error('Section not found');
    }

    const proposal = await proposalInstances.get(currentSection.proposalInstanceId);
    const clientBrief = await clientBriefs.get(proposal.clientBriefId);
    const styleCard = await styleCards.getDefault();

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

    const { text, inputTokens, outputTokens } = await callAnthropic(apiKey, {
      messages: [{ role: 'user', content: prompt }],
      model: MODELS.standard,
      maxTokens: 2000,
      temperature: 0.3,
      operationType: `revise-section-${currentSection.sectionId}`
    });

    log.info('ProposalGen', 'Section revised', {
      sectionId: currentSection.sectionId,
      newVersion: currentSection.version + 1,
      tokens: inputTokens + outputTokens
    });

    const newSection = await proposalSections.create({
      proposalInstanceId: currentSection.proposalInstanceId,
      sectionId: currentSection.sectionId,
      content: text,
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
 */
export async function generateUnifiedProposal(apiKey, proposalInstanceId, proposalMetadata = {}) {
  log.info('ProposalGen', 'Starting unified proposal generation', { proposalInstanceId });

  try {
    const proposal = await proposalInstances.get(proposalInstanceId);

    if (!proposal) {
      throw new Error('Proposal instance not found');
    }

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

    const formattedServices = formatServicesForPrompt(services, clientBrief);

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

    const { text, inputTokens, outputTokens } = await callAnthropic(apiKey, {
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      model: MODELS.standard,
      maxTokens: 4000,
      temperature: 0.3,
      operationType: 'generate-unified-proposal'
    });

    // Parse JSON response
    let proposalData;
    try {
      proposalData = parseJSONResponse(text);
    } catch (parseError) {
      log.error('ProposalGen', 'Failed to parse AI response as JSON', {
        content: text.substring(0, 500),
        error: parseError.message
      });
      throw new Error('AI returned invalid JSON');
    }

    const { proposal_body_markdown, services: serviceDescriptions } = proposalData;

    if (!proposal_body_markdown) {
      throw new Error('AI response missing proposal_body_markdown');
    }

    const totalTokens = inputTokens + outputTokens;

    log.info('ProposalGen', 'Unified proposal generated successfully', {
      proposalBodyLength: proposal_body_markdown.length,
      servicesCount: serviceDescriptions?.length || 0,
      tokens: totalTokens
    });

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

    await proposalInstances.update(proposalInstanceId, {
      status: 'generated',
      serviceDescriptions: serviceDescriptions || []
    });

    return {
      proposalBody: proposal_body_markdown,
      serviceDescriptions: serviceDescriptions || [],
      sectionInstance,
      tokens: totalTokens
    };
  } catch (error) {
    log.error('ProposalGen', 'Failed to generate unified proposal', {
      error: error.message,
      proposalInstanceId
    });
    throw error;
  }
}
