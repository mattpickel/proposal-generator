/**
 * OpenAI API Service
 *
 * Handles all interactions with the OpenAI API.
 * Separated for easy testing and error handling.
 */

import { distillationPrompts, buildProposalPrompt, buildIterationPrompt, modelConfig } from '../config/prompts.js';
import { log } from '../utils/logger.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Custom error class for OpenAI API errors
 */
export class OpenAIError extends Error {
  constructor(message, statusCode, errorType, originalError) {
    super(message);
    this.name = 'OpenAIError';
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.originalError = originalError;
    this.isRateLimitError = statusCode === 429;
    this.isAuthError = statusCode === 401;
  }
}

/**
 * Make a request to OpenAI API with detailed logging
 */
async function callOpenAI(apiKey, messages, config, operationType) {
  const requestId = `${operationType}-${Date.now()}`;

  log.debug('OpenAI', `Starting ${operationType}`, {
    requestId,
    model: config.model,
    maxTokens: config.maxTokens,
    temperature: config.temperature,
    messageLength: messages[0].content.length
  });

  const requestBody = {
    model: config.model,
    max_tokens: config.maxTokens,
    temperature: config.temperature,
    messages
  };

  log.debug('OpenAI', `Request payload for ${requestId}`, {
    ...requestBody,
    messages: requestBody.messages.map(m => ({
      role: m.role,
      contentPreview: m.content.substring(0, 200) + '...'
    }))
  });

  try {
    const startTime = Date.now();

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      log.error('OpenAI', `API Error for ${requestId} (${response.status})`, {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        elapsed: `${elapsed}ms`
      });

      throw new OpenAIError(
        errorData.error?.message || `API request failed with status ${response.status}`,
        response.status,
        errorData.error?.type,
        errorData
      );
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    log.info('OpenAI', `${operationType} completed`, {
      requestId,
      elapsed: `${elapsed}ms`,
      inputTokens: data.usage?.prompt_tokens,
      outputTokens: data.usage?.completion_tokens,
      totalTokens: data.usage?.total_tokens,
      resultLength: result.length,
      resultPreview: result.substring(0, 100) + '...'
    });

    return result;
  } catch (error) {
    if (error instanceof OpenAIError) {
      throw error;
    }

    log.error('OpenAI', `Unexpected error for ${requestId}`, {
      error: error.message,
      stack: error.stack
    });

    throw new OpenAIError(
      error.message,
      null,
      'network_error',
      error
    );
  }
}

/**
 * Distill content using AI
 * Reduces large content into focused summaries
 * Throws OpenAIError on failure - caller decides how to handle
 */
export async function distillContent(apiKey, content, type) {
  log.info('Distillation', `Starting ${type} distillation`, {
    contentLength: content.length,
    contentPreview: content.substring(0, 100) + '...'
  });

  const promptFn = distillationPrompts[type];
  if (!promptFn) {
    log.error('Distillation', `Unknown distillation type: ${type}`);
    throw new Error(`Unknown distillation type: ${type}`);
  }

  const prompt = promptFn(content);
  const messages = [{ role: 'user', content: prompt }];

  const result = await callOpenAI(apiKey, messages, modelConfig.distillation, `distill-${type}`);

  log.info('Distillation', `${type} distillation completed`, {
    originalLength: content.length,
    distilledLength: result.length,
    compression: `${Math.round((1 - result.length / content.length) * 100)}%`
  });

  return result;
}

/**
 * Generate a complete proposal
 */
export async function generateProposal(apiKey, {
  firefliesContent,
  examples,
  supportingDocuments,
  userComments
}) {
  log.info('Generation', 'Starting proposal generation', {
    hasFireflies: !!firefliesContent,
    firefliesLength: firefliesContent?.length || 0,
    exampleCount: examples.length,
    supportingDocCount: supportingDocuments.length,
    hasComments: !!userComments
  });

  const prompt = buildProposalPrompt(
    firefliesContent,
    examples,
    supportingDocuments,
    userComments
  );

  log.debug('Generation', 'Built proposal prompt', {
    promptLength: prompt.length,
    promptPreview: prompt.substring(0, 300) + '...'
  });

  const messages = [{ role: 'user', content: prompt }];

  return await callOpenAI(apiKey, messages, modelConfig.generation, 'generate-proposal');
}

/**
 * Iterate on an existing proposal
 */
export async function iterateProposal(apiKey, currentProposal, iterationComment) {
  log.info('Iteration', 'Starting proposal iteration', {
    proposalLength: currentProposal.length,
    commentLength: iterationComment.length,
    comment: iterationComment
  });

  const prompt = buildIterationPrompt(currentProposal, iterationComment);
  const messages = [{ role: 'user', content: prompt }];

  return await callOpenAI(apiKey, messages, modelConfig.iteration, 'iterate-proposal');
}
