/**
 * Content Extraction Service
 *
 * AI-powered extraction of structured data from transcripts and documents
 */

import { buildClientBriefPrompt, buildDocumentSummaryPrompt, buildServiceSuggestionPrompt } from '../config/extractionPrompts';
import { log } from '../utils/logger';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Extract ClientBrief from Fireflies transcript
 */
export async function extractClientBrief(apiKey, transcriptText) {
  log.info('Extraction', 'Starting ClientBrief extraction', {
    transcriptLength: transcriptText.length
  });

  try {
    const prompt = buildClientBriefPrompt(transcriptText);

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 2000,
        temperature: 0.2,
        response_format: { type: 'json_object' },
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
    const result = JSON.parse(data.choices[0].message.content);

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

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        temperature: 0.2,
        response_format: { type: 'json_object' },
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
    const result = JSON.parse(data.choices[0].message.content);

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

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        temperature: 0.3,
        response_format: { type: 'json_object' },
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
    const result = JSON.parse(data.choices[0].message.content);

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
