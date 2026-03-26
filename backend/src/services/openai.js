/**
 * AI API Service
 *
 * Handles AI interactions for proposal generation and iteration.
 * Uses Anthropic Claude API.
 */

import { distillationPrompts, buildProposalPrompt, buildIterationPrompt, modelConfig } from '../config/prompts.js';
import { callAnthropic, AnthropicError, MODELS } from './anthropic.js';
import { log } from '../utils/logger.js';

// Re-export error class with legacy name for backwards compatibility
export { AnthropicError as OpenAIError };

/**
 * Distill content using AI
 * Reduces large content into focused summaries
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

  const { text } = await callAnthropic(apiKey, {
    messages: [{ role: 'user', content: prompt }],
    model: MODELS.fast,
    maxTokens: modelConfig.distillation.maxTokens,
    temperature: modelConfig.distillation.temperature,
    operationType: `distill-${type}`
  });

  log.info('Distillation', `${type} distillation completed`, {
    originalLength: content.length,
    distilledLength: text.length,
    compression: `${Math.round((1 - text.length / content.length) * 100)}%`
  });

  return text;
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

  const { text } = await callAnthropic(apiKey, {
    messages: [{ role: 'user', content: prompt }],
    model: MODELS.standard,
    maxTokens: modelConfig.generation.maxTokens,
    temperature: modelConfig.generation.temperature,
    operationType: 'generate-proposal'
  });

  return text;
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

  const { text } = await callAnthropic(apiKey, {
    messages: [{ role: 'user', content: prompt }],
    model: MODELS.standard,
    maxTokens: modelConfig.iteration.maxTokens,
    temperature: modelConfig.iteration.temperature,
    operationType: 'iterate-proposal'
  });

  return text;
}
