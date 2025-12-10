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

const router = express.Router();

// Generate a single section
router.post('/section', async (req, res, next) => {
  try {
    const { apiKey, templateSection, clientBriefId, selectedServiceIds, proposalInstanceId } = req.body;

    if (!apiKey || !templateSection || !clientBriefId || !selectedServiceIds || !proposalInstanceId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const section = await generateSection(apiKey, {
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
    const { apiKey, proposalInstanceId } = req.body;

    if (!apiKey || !proposalInstanceId) {
      return res.status(400).json({ error: 'Missing apiKey or proposalInstanceId' });
    }

    // For simplicity, we'll just return all sections without SSE for now
    // In production, you'd want to implement SSE or WebSockets for progress updates
    const sections = await generateAllSections(apiKey, proposalInstanceId);
    res.json(sections);
  } catch (error) {
    next(error);
  }
});

// Revise a section
router.post('/revise', async (req, res, next) => {
  try {
    const { apiKey, sectionInstanceId, comment } = req.body;

    if (!apiKey || !sectionInstanceId || !comment) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const revised = await reviseSection(apiKey, sectionInstanceId, comment);
    res.json(revised);
  } catch (error) {
    next(error);
  }
});

// Generate unified proposal (new single-pass approach)
router.post('/unified', async (req, res, next) => {
  try {
    const { apiKey, proposalInstanceId, proposalMetadata } = req.body;

    if (!apiKey || !proposalInstanceId) {
      return res.status(400).json({ error: 'Missing apiKey or proposalInstanceId' });
    }

    const result = await generateUnifiedProposal(apiKey, proposalInstanceId, proposalMetadata);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
