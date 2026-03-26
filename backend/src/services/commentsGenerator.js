/**
 * Comments Generator Service
 *
 * Scoped AI service that ONLY generates the "Comments from Marketing Lead" section.
 * This is the only AI-generated content in the new proposal system.
 *
 * AI outputs:
 * - Optional proposal title refinement
 * - Comments section with greeting, paragraphs, and signoff
 */

import { log } from '../utils/logger.js';
import { lintComments } from './proposalLinter.js';
import { callAnthropic, MODELS, parseJSONResponse } from './anthropic.js';

/**
 * System prompt for comments generation
 * Strictly scoped to only generate the comments section
 */
const SYSTEM_PROMPT = `You are writing the "Comments from Marketing Lead" section for a marketing proposal from Good Circle Marketing.

Your task is to write a warm, professional introduction that:
1. Acknowledges the client and their situation
2. Briefly summarizes the recommended approach
3. Connects the strategy to their specific goals
4. Sets a collaborative, confident tone

OUTPUT FORMAT:
Return ONLY valid JSON with this exact structure:
{
  "proposalTitle": "Optional custom title for the proposal or null to keep default",
  "comments": {
    "heading": "Comments from Kathryn",
    "greetingLine": "Hi [ClientName],",
    "paragraphs": ["paragraph1", "paragraph2", "paragraph3"],
    "signoff": "Kathryn"
  }
}

RULES:
- Write 2-5 short paragraphs (2-4 sentences each)
- Use professional but warm, conversational tone
- NO em dashes (use regular dashes or commas instead)
- NO pricing information or specific numbers
- NO service descriptions or deliverables (just reference them by name)
- NO terms, conditions, or legal language
- NO signatures beyond the signoff name
- Focus on the "why" - why this approach fits their needs
- Use "we" for the agency, "you" for the client
- Sign off with just the first name (e.g., "Kathryn")
- Make it personal and specific to this client's situation`;

/**
 * Build user prompt for comments generation
 */
function buildUserPrompt({ clientBrief, selectedServiceNames, customInstructions }) {
  const clientName = clientBrief.contactName || clientBrief.clientName || 'the client';
  const clientOrg = clientBrief.clientOrganization || clientBrief.businessName || clientBrief.clientName || '';

  const clientInfo = `
CLIENT: ${clientName}
ORGANIZATION: ${clientOrg}
INDUSTRY: ${clientBrief.industry || 'Not specified'}`;

  const goals = clientBrief.goals?.length > 0
    ? `\nGOALS:\n${clientBrief.goals.map(g => `- ${g}`).join('\n')}`
    : '';

  const challenges = clientBrief.painPoints?.length > 0
    ? `\nCHALLENGES:\n${clientBrief.painPoints.map(p => `- ${p}`).join('\n')}`
    : '';

  const opportunities = clientBrief.opportunities?.length > 0
    ? `\nOPPORTUNITIES:\n${clientBrief.opportunities.map(o => `- ${o}`).join('\n')}`
    : '';

  const services = `\nSELECTED SERVICES (for context only - do not describe in detail):\n${selectedServiceNames.map(s => `- ${s}`).join('\n')}`;

  const instructions = customInstructions
    ? `\nSPECIAL INSTRUCTIONS FROM USER:\n${customInstructions}`
    : '';

  return `Write the Comments section for this marketing proposal.
${clientInfo}
${goals}
${challenges}
${opportunities}
${services}
${instructions}

Remember: Return ONLY valid JSON. No markdown code fences, no backticks.`;
}

/**
 * Generate comments using AI
 */
export async function generateComments(apiKey, {
  clientBrief,
  selectedServiceNames,
  customInstructions = null
}) {
  log.info('CommentsGen', 'Generating comments', {
    clientName: clientBrief.clientName,
    servicesCount: selectedServiceNames.length,
    hasCustomInstructions: !!customInstructions
  });

  const userPrompt = buildUserPrompt({
    clientBrief,
    selectedServiceNames,
    customInstructions
  });

  try {
    const { text, inputTokens, outputTokens } = await callAnthropic(apiKey, {
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
      model: MODELS.standard,
      maxTokens: 1000,
      temperature: 0.4,
      operationType: 'generate-comments'
    });

    // Parse JSON response
    let result;
    try {
      result = parseJSONResponse(text);
    } catch (parseError) {
      log.error('CommentsGen', 'Failed to parse AI response', {
        content: text.substring(0, 500),
        error: parseError.message
      });
      throw new Error('AI returned invalid JSON');
    }

    // Validate structure
    if (!result.comments || !result.comments.paragraphs) {
      throw new Error('AI response missing required comments structure');
    }

    // Apply linting/validation
    const lintedComments = lintComments(result.comments);
    const totalTokens = inputTokens + outputTokens;

    log.info('CommentsGen', 'Comments generated successfully', {
      paragraphCount: lintedComments.paragraphs.length,
      tokens: totalTokens
    });

    return {
      proposalTitle: result.proposalTitle || null,
      comments: lintedComments,
      tokens: totalTokens
    };
  } catch (error) {
    log.error('CommentsGen', 'Failed to generate comments', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Regenerate comments with additional feedback
 */
export async function regenerateComments(apiKey, {
  clientBrief,
  selectedServiceNames,
  currentComments,
  feedback
}) {
  log.info('CommentsGen', 'Regenerating comments with feedback', {
    clientName: clientBrief.clientName,
    feedbackLength: feedback.length
  });

  const customInstructions = `
PREVIOUS VERSION HAD ISSUES. Please improve based on this feedback:
${feedback}

CURRENT VERSION FOR REFERENCE:
Greeting: ${currentComments.greetingLine}
Paragraphs:
${currentComments.paragraphs.map((p, i) => `${i + 1}. ${p}`).join('\n')}
Signoff: ${currentComments.signoff}

Please create an improved version addressing the feedback.`;

  return generateComments(apiKey, {
    clientBrief,
    selectedServiceNames,
    customInstructions
  });
}
