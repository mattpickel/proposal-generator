/**
 * Service Library API Routes
 * CRUD operations for managing service templates used in proposal generation.
 * Stores in Firestore serviceModules collection, with ability to import defaults
 * from the static serviceLibrary.js file.
 */

import express from 'express';
import { db, COLLECTIONS } from '../config/firebase.js';
import { serviceModules } from '../services/database.js';
import { serviceLibrary } from '../data/serviceLibrary.js';

const router = express.Router();

/**
 * GET / - List all service templates
 * Uses direct Firestore query without orderBy to avoid missing-field filtering.
 */
router.get('/', async (req, res, next) => {
  try {
    const snapshot = await db.collection(COLLECTIONS.SERVICE_MODULES).get();
    const services = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(doc => doc.displayNameCaps);
    services.sort((a, b) => a.displayNameCaps.localeCompare(b.displayNameCaps));
    res.json(services);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /import-defaults - Import all services from the static serviceLibrary.js
 * into Firestore. Overwrites existing entries with matching serviceKeys.
 * Must be defined before POST / to avoid route conflicts.
 */
router.post('/import-defaults', async (req, res, next) => {
  try {
    const results = [];
    for (const [key, service] of Object.entries(serviceLibrary)) {
      await serviceModules.createWithId(key, service);
      results.push(key);
    }
    res.json({ imported: results, count: results.length });
  } catch (error) {
    next(error);
  }
});

/**
 * POST / - Create a new service template
 */
router.post('/', async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.serviceKey || !data.displayNameCaps) {
      return res.status(400).json({ error: 'serviceKey and displayNameCaps are required' });
    }
    // Use serviceKey as document ID for easy lookup
    const service = await serviceModules.createWithId(data.serviceKey, data);
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /:id - Get a single service template
 */
router.get('/:id', async (req, res, next) => {
  try {
    const service = await serviceModules.get(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /:id - Update a service template
 */
router.put('/:id', async (req, res, next) => {
  try {
    const service = await serviceModules.update(req.params.id, req.body);
    res.json(service);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /:id - Delete a service template
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await serviceModules.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
