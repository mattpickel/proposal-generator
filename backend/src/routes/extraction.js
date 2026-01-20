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

// Get API key from environment (secure - never exposed to frontend)
const getApiKey = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not configured');
  }
  return apiKey;
};

// Extract client brief from transcript
router.post('/client-brief', async (req, res, next) => {
  try {
    const { transcriptText } = req.body;

    if (!transcriptText) {
      return res.status(400).json({ error: 'Missing transcriptText' });
    }

    const brief = await extractClientBrief(getApiKey(), transcriptText);
    res.json(brief);
  } catch (error) {
    next(error);
  }
});

// Extract document summary
router.post('/document-summary', async (req, res, next) => {
  try {
    const { documentText, documentType } = req.body;

    if (!documentText) {
      return res.status(400).json({ error: 'Missing documentText' });
    }

    const summary = await extractDocumentSummary(getApiKey(), documentText, documentType);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

// Suggest services based on client brief
router.post('/suggest-services', async (req, res, next) => {
  try {
    const { clientBrief } = req.body;

    if (!clientBrief) {
      return res.status(400).json({ error: 'Missing clientBrief' });
    }

    const suggestions = await suggestServices(getApiKey(), clientBrief);
    res.json(suggestions);
  } catch (error) {
    next(error);
  }
});

export default router;
