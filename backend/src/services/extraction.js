/**
 * Content Extraction Service
 *
 * AI-powered extraction of structured data from transcripts and documents
 */

import { buildClientBriefPrompt, buildDocumentSummaryPrompt, buildServiceSuggestionPrompt } from '../config/extractionPrompts.js';
import { callAnthropic, MODELS, parseJSONResponse } from './anthropic.js';
import { log } from '../utils/logger.js';

/**
 * Extract ClientBrief from Fireflies transcript
 */
export async function extractClientBrief(apiKey, transcriptText) {
  log.info('Extraction', 'Starting ClientBrief extraction', {
    transcriptLength: transcriptText.length
  });

  try {
    const prompt = buildClientBriefPrompt(transcriptText);

    const { text } = await callAnthropic(apiKey, {
      messages: [{ role: 'user', content: prompt }],
      model: MODELS.fast,
      maxTokens: 2000,
      temperature: 0.2,
      operationType: 'extract-client-brief'
    });

    const result = parseJSONResponse(text);

    log.info('Extraction', 'ClientBrief extracted successfully', {
      clientName: result.clientName,
      stakeholders: result.stakeholders?.length,
      goals: result.goals?.length,
      servicesNeeded: result.servicesNeeded
    });

    return result;
  } catch (error) {
    log.error('Extraction', 'Failed to extract ClientBrief', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Extract summary from supporting document
 */
export async function extractDocumentSummary(apiKey, documentText, documentType = 'general') {
  log.info('Extraction', 'Starting document summary extraction', {
    documentLength: documentText.length,
    type: documentType
  });

  try {
    const prompt = buildDocumentSummaryPrompt(documentText, documentType);

    const { text } = await callAnthropic(apiKey, {
      messages: [{ role: 'user', content: prompt }],
      model: MODELS.fast,
      maxTokens: 1000,
      temperature: 0.2,
      operationType: 'extract-document-summary'
    });

    const result = parseJSONResponse(text);

    log.info('Extraction', 'Document summary extracted', {
      keyPointsCount: result.keyPoints?.length,
      hasBrandVoice: !!result.brandVoice
    });

    return result;
  } catch (error) {
    log.error('Extraction', 'Failed to extract document summary', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Suggest services based on ClientBrief
 */
export async function suggestServices(apiKey, clientBrief) {
  log.info('Extraction', 'Suggesting services based on brief', {
    clientName: clientBrief.clientName
  });

  try {
    const prompt = buildServiceSuggestionPrompt(clientBrief);

    const { text } = await callAnthropic(apiKey, {
      messages: [{ role: 'user', content: prompt }],
      model: MODELS.fast,
      maxTokens: 1000,
      temperature: 0.3,
      operationType: 'suggest-services'
    });

    const result = parseJSONResponse(text);

    log.info('Extraction', 'Services suggested', {
      recommended: result.recommendedServices,
      highPriority: result.priority?.high
    });

    return result;
  } catch (error) {
    log.error('Extraction', 'Failed to suggest services', {
      error: error.message
    });
    throw error;
  }
}
