/**
 * Generation API Routes
 * AI-powered proposal generation services
 */

import express from 'express';
import {
  generateSection,
  generateAllSections,
  reviseSection,
  generateUnifiedProposal
} from '../services/proposalGenerator.js';
import { iterateProposal } from '../services/openai.js';

const router = express.Router();

// Get API key from environment (secure - never exposed to frontend)
const getApiKey = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not configured');
  }
  return apiKey;
};

// Generate a single section
router.post('/section', async (req, res, next) => {
  try {
    const { templateSection, clientBriefId, selectedServiceIds, proposalInstanceId } = req.body;

    if (!templateSection || !clientBriefId || !selectedServiceIds || !proposalInstanceId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const section = await generateSection(getApiKey(), {
      templateSection,
      clientBriefId,
      selectedServiceIds,
      proposalInstanceId
    });

    res.json(section);
  } catch (error) {
    next(error);
  }
});

// Generate all sections (with progress callback via SSE)
router.post('/all-sections', async (req, res, next) => {
  try {
    const { proposalInstanceId } = req.body;

    if (!proposalInstanceId) {
      return res.status(400).json({ error: 'Missing proposalInstanceId' });
    }

    // For simplicity, we'll just return all sections without SSE for now
    // In production, you'd want to implement SSE or WebSockets for progress updates
    const sections = await generateAllSections(getApiKey(), proposalInstanceId);
    res.json(sections);
  } catch (error) {
    next(error);
  }
});

// Revise a section
router.post('/revise', async (req, res, next) => {
  try {
    const { sectionInstanceId, comment } = req.body;

    if (!sectionInstanceId || !comment) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const revised = await reviseSection(getApiKey(), sectionInstanceId, comment);
    res.json(revised);
  } catch (error) {
    next(error);
  }
});

// Generate unified proposal (new single-pass approach)
router.post('/unified', async (req, res, next) => {
  try {
    const { proposalInstanceId, proposalMetadata } = req.body;

    if (!proposalInstanceId) {
      return res.status(400).json({ error: 'Missing proposalInstanceId' });
    }

    const result = await generateUnifiedProposal(getApiKey(), proposalInstanceId, proposalMetadata);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Iterate on existing proposal with feedback
router.post('/iterate', async (req, res, next) => {
  try {
    const { currentProposal, feedback } = req.body;

    if (!currentProposal || !feedback) {
      return res.status(400).json({ error: 'Missing required parameters: currentProposal, feedback' });
    }

    const revisedProposal = await iterateProposal(getApiKey(), currentProposal, feedback);
    res.json({ proposal: revisedProposal });
  } catch (error) {
    next(error);
  }
});

export default router;
