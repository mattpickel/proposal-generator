/**
 * OpenAI API Service
 *
 * Handles all interactions with the OpenAI API.
 * Separated for easy testing and error handling.
 */

import { distillationPrompts, buildProposalPrompt, buildIterationPrompt, modelConfig } from '../config/prompts';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Make a request to OpenAI API
 */
async function callOpenAI(apiKey, messages, config) {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      messages
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Distill content using AI
 * Reduces large content into focused summaries
 */
export async function distillContent(apiKey, content, type) {
  try {
    const promptFn = distillationPrompts[type];
    if (!promptFn) {
      throw new Error(`Unknown distillation type: ${type}`);
    }

    const prompt = promptFn(content);
    const messages = [{ role: 'user', content: prompt }];

    return await callOpenAI(apiKey, messages, modelConfig.distillation);
  } catch (error) {
    console.error(`Error distilling ${type}:`, error);
    // Fallback: just truncate
    return content.substring(0, 2000);
  }
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
  const prompt = buildProposalPrompt(
    firefliesContent,
    examples,
    supportingDocuments,
    userComments
  );

  const messages = [{ role: 'user', content: prompt }];

  return await callOpenAI(apiKey, messages, modelConfig.generation);
}

/**
 * Iterate on an existing proposal
 */
export async function iterateProposal(apiKey, currentProposal, iterationComment) {
  const prompt = buildIterationPrompt(currentProposal, iterationComment);
  const messages = [{ role: 'user', content: prompt }];

  return await callOpenAI(apiKey, messages, modelConfig.iteration);
}
