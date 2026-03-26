/**
 * Anthropic Claude API Service
 *
 * Shared helper for making requests to the Anthropic Messages API.
 * Replaces the OpenAI integration.
 */

import { log } from '../utils/logger.js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Strip markdown code fences from AI response and parse as JSON.
 * Claude often wraps JSON in ```json ... ``` blocks.
 */
export function parseJSONResponse(text) {
  let cleaned = text.trim();
  // Remove ```json ... ``` or ``` ... ``` wrapping
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(cleaned);
}
const ANTHROPIC_VERSION = '2023-06-01';

// Model mapping
export const MODELS = {
  fast: 'claude-haiku-4-5',     // Cost-effective: extraction, refinement
  standard: 'claude-sonnet-4-5', // High-quality: generation, iteration
};

/**
 * Custom error class for Anthropic API errors
 */
export class AnthropicError extends Error {
  constructor(message, statusCode, errorType, originalError) {
    super(message);
    this.name = 'AnthropicError';
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.originalError = originalError;
    this.isRateLimitError = statusCode === 429;
    this.isAuthError = statusCode === 401;
  }
}

/**
 * Make a request to the Anthropic Messages API
 *
 * @param {string} apiKey - Anthropic API key
 * @param {Object} options
 * @param {string} [options.system] - System prompt (top-level, not in messages)
 * @param {Array} options.messages - Messages array [{role, content}]
 * @param {string} options.model - Model ID
 * @param {number} options.maxTokens - Max output tokens
 * @param {number} [options.temperature] - Temperature (default 0.3)
 * @param {string} [options.operationType] - Label for logging
 * @returns {Promise<{text: string, inputTokens: number, outputTokens: number}>}
 */
export async function callAnthropic(apiKey, {
  system,
  messages,
  model,
  maxTokens,
  temperature = 0.3,
  operationType = 'unknown'
}) {
  const requestId = `${operationType}-${Date.now()}`;

  log.debug('Anthropic', `Starting ${operationType}`, {
    requestId,
    model,
    maxTokens,
    temperature
  });

  const body = {
    model,
    max_tokens: maxTokens,
    temperature,
    messages
  };

  if (system) {
    body.system = system;
  }

  try {
    const startTime = Date.now();

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      log.error('Anthropic', `API Error for ${requestId} (${response.status})`, {
        status: response.status,
        error: errorData,
        elapsed: `${elapsed}ms`
      });

      throw new AnthropicError(
        errorData.error?.message || `API request failed with status ${response.status}`,
        response.status,
        errorData.error?.type,
        errorData
      );
    }

    const data = await response.json();
    const text = data.content[0].text;

    log.info('Anthropic', `${operationType} completed`, {
      requestId,
      elapsed: `${elapsed}ms`,
      inputTokens: data.usage?.input_tokens,
      outputTokens: data.usage?.output_tokens,
      resultLength: text.length
    });

    return {
      text,
      inputTokens: data.usage?.input_tokens || 0,
      outputTokens: data.usage?.output_tokens || 0
    };
  } catch (error) {
    if (error instanceof AnthropicError) throw error;

    log.error('Anthropic', `Unexpected error for ${requestId}`, {
      error: error.message
    });

    throw new AnthropicError(
      error.message,
      null,
      'network_error',
      error
    );
  }
}
