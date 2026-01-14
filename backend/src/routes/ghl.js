/**
 * GoHighLevel API Routes
 * Endpoints for fetching and importing GHL opportunity data
 */

import express from 'express';
import {
  getOpportunity,
  getOpportunityWithContact,
  toClientBrief,
  GHLError
} from '../services/ghl.js';
import { clientBriefs } from '../services/database.js';

const router = express.Router();

// Get opportunity data from GHL
router.get('/opportunities/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing opportunity ID' });
    }

    const data = await getOpportunityWithContact(id);
    res.json(data);
  } catch (error) {
    if (error instanceof GHLError) {
      return res.status(error.statusCode || 500).json({
        error: error.message,
        type: error.name
      });
    }
    next(error);
  }
});

// Import opportunity as ClientBrief
router.post('/opportunities/:id/import', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing opportunity ID' });
    }

    // Fetch opportunity and contact from GHL
    const { opportunity, contact } = await getOpportunityWithContact(id);

    // Convert to ClientBrief format
    const briefData = toClientBrief(opportunity, contact);

    // Save to Firebase
    const savedBrief = await clientBriefs.create(briefData);

    // Include location ID for constructing GHL link
    const locationId = process.env.GHL_LOCATION_ID;

    res.status(201).json({
      clientBrief: savedBrief,
      ghlData: { opportunity, contact },
      ghlLocationId: locationId
    });
  } catch (error) {
    if (error instanceof GHLError) {
      return res.status(error.statusCode || 500).json({
        error: error.message,
        type: error.name
      });
    }
    next(error);
  }
});

// Preview import (get ClientBrief format without saving)
router.get('/opportunities/:id/preview', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Missing opportunity ID' });
    }

    const { opportunity, contact } = await getOpportunityWithContact(id);
    const briefPreview = toClientBrief(opportunity, contact);

    res.json({
      preview: briefPreview,
      ghlData: { opportunity, contact }
    });
  } catch (error) {
    if (error instanceof GHLError) {
      return res.status(error.statusCode || 500).json({
        error: error.message,
        type: error.name
      });
    }
    next(error);
  }
});

export default router;
