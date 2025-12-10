/**
 * Extraction API Routes
 * AI-powered extraction services
 */

import express from 'express';
import {
  extractClientBrief,
  extractDocumentSummary,
  suggestServices
} from '../services/extraction.js';

const router = express.Router();

// Extract client brief from transcript
router.post('/client-brief', async (req, res, next) => {
  try {
    const { apiKey, transcriptText } = req.body;

    if (!apiKey || !transcriptText) {
      return res.status(400).json({ error: 'Missing apiKey or transcriptText' });
    }

    const brief = await extractClientBrief(apiKey, transcriptText);
    res.json(brief);
  } catch (error) {
    next(error);
  }
});

// Extract document summary
router.post('/document-summary', async (req, res, next) => {
  try {
    const { apiKey, documentText, documentType } = req.body;

    if (!apiKey || !documentText) {
      return res.status(400).json({ error: 'Missing apiKey or documentText' });
    }

    const summary = await extractDocumentSummary(apiKey, documentText, documentType);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

// Suggest services based on client brief
router.post('/suggest-services', async (req, res, next) => {
  try {
    const { apiKey, clientBrief } = req.body;

    if (!apiKey || !clientBrief) {
      return res.status(400).json({ error: 'Missing apiKey or clientBrief' });
    }

    const suggestions = await suggestServices(apiKey, clientBrief);
    res.json(suggestions);
  } catch (error) {
    next(error);
  }
});

export default router;
