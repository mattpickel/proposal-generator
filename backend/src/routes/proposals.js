/**
 * Proposals V2 API Routes
 *
 * New JSON-first proposal API with deterministic assembly.
 * AI is scoped to only generate comments section.
 */

import express from 'express';
import {
  assembleProposalSkeleton,
  updateCommentsBlock,
  updateServiceOverrides,
  toggleServiceEnabled,
  updateCoverBlock,
  addModule,
  removeModule
} from '../services/proposalAssembly.js';
import { generateComments, regenerateComments } from '../services/commentsGenerator.js';
import { renderProposalToHtml, renderProposalToPlainText, renderProposalBodyHtml } from '../services/proposalRenderer.js';
import { lintProposal, validateProposal } from '../services/proposalLinter.js';
import { proposalInstances, clientBriefs } from '../services/database.js';
import { getServiceFromLibrary, getServiceDisplayNames } from '../data/serviceLibrary.js';
import { log } from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/proposals/v2
 * Create a new proposal (assembles skeleton + generates AI comments)
 */
router.post('/v2', async (req, res, next) => {
  try {
    const {
      apiKey,
      opportunityId,
      clientBriefId,
      selectedServiceIds,
      proposalTitle,
      customInstructions
    } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'Missing required parameter: apiKey' });
    }
    if (!opportunityId) {
      return res.status(400).json({ error: 'Missing required parameter: opportunityId' });
    }
    if (!clientBriefId) {
      return res.status(400).json({ error: 'Missing required parameter: clientBriefId' });
    }
    if (!selectedServiceIds?.length) {
      return res.status(400).json({ error: 'Missing required parameter: selectedServiceIds' });
    }

    log.info('ProposalsRoute', 'Creating new v2 proposal', {
      opportunityId,
      clientBriefId,
      servicesCount: selectedServiceIds.length
    });

    // Step 1: Assemble proposal skeleton (deterministic)
    const proposal = await assembleProposalSkeleton({
      opportunityId,
      clientBriefId,
      selectedServiceIds,
      proposalTitle
    });

    // Step 2: Generate AI comments
    const clientBrief = await clientBriefs.get(clientBriefId);
    const serviceNames = getServiceDisplayNames(selectedServiceIds);

    const commentsResult = await generateComments(apiKey, {
      clientBrief,
      selectedServiceNames: serviceNames,
      customInstructions
    });

    // Step 3: Update proposal with AI-generated comments
    updateCommentsBlock(proposal, commentsResult.comments);
    if (commentsResult.proposalTitle) {
      updateCoverBlock(proposal, { proposalTitle: commentsResult.proposalTitle });
    }

    // Step 4: Lint and validate
    const lintedProposal = lintProposal(proposal);
    const validation = validateProposal(lintedProposal);

    if (!validation.valid) {
      log.warn('ProposalsRoute', 'Proposal validation warnings', {
        errors: validation.errors
      });
    }

    // Step 5: Save to database
    await proposalInstances.createWithId(opportunityId, {
      opportunityId,
      clientBriefId,
      proposalJson: lintedProposal,
      status: 'draft',
      serviceIds: selectedServiceIds
    });

    log.info('ProposalsRoute', 'V2 proposal created successfully', {
      proposalId: opportunityId,
      tokens: commentsResult.tokens
    });

    res.json({
      proposal: lintedProposal,
      validation,
      tokens: commentsResult.tokens
    });
  } catch (error) {
    log.error('ProposalsRoute', 'Failed to create v2 proposal', {
      error: error.message
    });
    next(error);
  }
});

/**
 * GET /api/proposals/v2/:id
 * Get proposal JSON
 */
router.get('/v2/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await proposalInstances.get(id);
    if (!existing?.proposalJson) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    res.json({ proposal: existing.proposalJson });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/proposals/v2/:id/comments
 * Update or regenerate comments section
 */
router.patch('/v2/:id/comments', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { apiKey, comments, regenerate, feedback } = req.body;

    const existing = await proposalInstances.get(id);
    if (!existing?.proposalJson) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    let proposal = existing.proposalJson;

    if (regenerate && apiKey) {
      // Regenerate with AI
      const clientBrief = await clientBriefs.get(proposal.clientBriefId);
      const serviceNames = proposal.services
        .filter(s => s.enabled)
        .map(s => s.displayNameCaps);

      const result = await regenerateComments(apiKey, {
        clientBrief,
        selectedServiceNames: serviceNames,
        currentComments: proposal.comments,
        feedback: feedback || 'Please improve the comments section.'
      });

      updateCommentsBlock(proposal, result.comments);

      log.info('ProposalsRoute', 'Comments regenerated', {
        proposalId: id,
        tokens: result.tokens
      });
    } else if (comments) {
      // Manual update
      updateCommentsBlock(proposal, comments);
      log.info('ProposalsRoute', 'Comments manually updated', { proposalId: id });
    }

    // Lint and save
    proposal = lintProposal(proposal);
    await proposalInstances.update(id, { proposalJson: proposal });

    res.json({ proposal });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/proposals/v2/:id/cover
 * Update cover block
 */
router.patch('/v2/:id/cover', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cover } = req.body;

    const existing = await proposalInstances.get(id);
    if (!existing?.proposalJson) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    let proposal = existing.proposalJson;
    updateCoverBlock(proposal, cover);

    // Lint and save
    proposal = lintProposal(proposal);
    await proposalInstances.update(id, { proposalJson: proposal });

    res.json({ proposal });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/proposals/v2/:id/services/:serviceKey
 * Update service overrides or toggle enabled state
 */
router.patch('/v2/:id/services/:serviceKey', async (req, res, next) => {
  try {
    const { id, serviceKey } = req.params;
    const { overrides, enabled } = req.body;

    const existing = await proposalInstances.get(id);
    if (!existing?.proposalJson) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    let proposal = existing.proposalJson;

    // Verify service exists in proposal
    const service = proposal.services.find(s => s.serviceKey === serviceKey);
    if (!service) {
      return res.status(404).json({ error: `Service not found: ${serviceKey}` });
    }

    if (overrides) {
      updateServiceOverrides(proposal, serviceKey, overrides);
    }

    if (typeof enabled === 'boolean') {
      toggleServiceEnabled(proposal, serviceKey, enabled);
    }

    // Lint and save
    proposal = lintProposal(proposal);
    await proposalInstances.update(id, { proposalJson: proposal });

    res.json({ proposal });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/proposals/v2/:id/modules
 * Add optional module to proposal
 */
router.post('/v2/:id/modules', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { moduleKey, titleCaps, bodyMarkdown } = req.body;

    if (!moduleKey || !bodyMarkdown) {
      return res.status(400).json({ error: 'Missing required fields: moduleKey, bodyMarkdown' });
    }

    const existing = await proposalInstances.get(id);
    if (!existing?.proposalJson) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    let proposal = existing.proposalJson;
    addModule(proposal, { moduleKey, titleCaps, bodyMarkdown });

    // Lint and save
    proposal = lintProposal(proposal);
    await proposalInstances.update(id, { proposalJson: proposal });

    res.json({ proposal });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/proposals/v2/:id/modules/:moduleKey
 * Remove module from proposal
 */
router.delete('/v2/:id/modules/:moduleKey', async (req, res, next) => {
  try {
    const { id, moduleKey } = req.params;

    const existing = await proposalInstances.get(id);
    if (!existing?.proposalJson) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    let proposal = existing.proposalJson;
    removeModule(proposal, moduleKey);

    // Save (no need to lint for removal)
    proposal.updatedAt = new Date().toISOString();
    await proposalInstances.update(id, { proposalJson: proposal });

    res.json({ proposal });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/proposals/v2/:id/render
 * Render proposal to HTML or plain text
 */
router.get('/v2/:id/render', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { format = 'html' } = req.query;

    const existing = await proposalInstances.get(id);
    if (!existing?.proposalJson) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const proposal = existing.proposalJson;

    if (format === 'plain') {
      const plainText = renderProposalToPlainText(proposal);
      res.type('text/plain').send(plainText);
    } else if (format === 'body') {
      const bodyHtml = renderProposalBodyHtml(proposal);
      res.type('text/html').send(bodyHtml);
    } else {
      const html = renderProposalToHtml(proposal);
      res.type('text/html').send(html);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/proposals/v2/:id/validate
 * Validate proposal structure
 */
router.get('/v2/:id/validate', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await proposalInstances.get(id);
    if (!existing?.proposalJson) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const validation = validateProposal(existing.proposalJson);
    res.json(validation);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/proposals/v2/:id
 * Delete a proposal
 */
router.delete('/v2/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await proposalInstances.get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    await proposalInstances.delete(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/proposals/v2/refine-content
 * Refine content with AI based on user instructions
 */
router.post('/v2/refine-content', async (req, res, next) => {
  try {
    const { apiKey, currentContent, instructions, context } = req.body;

    if (!apiKey || !currentContent || !instructions) {
      return res.status(400).json({
        error: 'Missing required parameters: apiKey, currentContent, instructions'
      });
    }

    log.info('ProposalsRoute', 'Refining content with AI', {
      contentLength: currentContent.length,
      instructionsLength: instructions.length
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are helping refine marketing proposal content. Your task is to modify the given content based on the user's instructions while maintaining professional quality and the existing structure/format.

Rules:
- Keep the same general format (markdown, bullet points, etc.) unless asked to change it
- Preserve any key information unless specifically asked to remove it
- Make targeted changes based on the instructions
- Output ONLY the refined content, no explanations or commentary
${context ? `\nContext: ${context}` : ''}`
          },
          {
            role: 'user',
            content: `CURRENT CONTENT:
${currentContent}

INSTRUCTIONS FOR REFINEMENT:
${instructions}

Please provide the refined content:`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const refinedContent = data.choices[0]?.message?.content?.trim();

    if (!refinedContent) {
      throw new Error('No content returned from AI');
    }

    log.info('ProposalsRoute', 'Content refined', {
      originalLength: currentContent.length,
      refinedLength: refinedContent.length,
      tokens: data.usage?.total_tokens
    });

    res.json({
      refinedContent,
      tokens: data.usage?.total_tokens
    });
  } catch (error) {
    next(error);
  }
});

export default router;
