/**
 * Database API Routes
 * CRUD operations for all Firestore collections
 */

import express from 'express';
import {
  proposalInstances,
  clientBriefs,
  proposalSections,
  supportingDocuments,
  proposalTemplates,
  styleCards,
  serviceModules,
  sectionExemplars
} from '../services/database.js';

const router = express.Router();

// Generic CRUD handlers
const createCRUDRoutes = (path, service) => {
  // Get all
  router.get(`/${path}`, async (req, res, next) => {
    try {
      const items = await service.getAll();
      res.json(items);
    } catch (error) {
      next(error);
    }
  });

  // Get by ID
  router.get(`/${path}/:id`, async (req, res, next) => {
    try {
      const item = await service.get(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  // Create
  router.post(`/${path}`, async (req, res, next) => {
    try {
      const item = await service.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  });

  // Update
  router.put(`/${path}/:id`, async (req, res, next) => {
    try {
      const item = await service.update(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  // Delete
  router.delete(`/${path}/:id`, async (req, res, next) => {
    try {
      await service.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });
};

// Create routes for all collections
createCRUDRoutes('proposals', proposalInstances);
createCRUDRoutes('client-briefs', clientBriefs);
createCRUDRoutes('sections', proposalSections);
createCRUDRoutes('documents', supportingDocuments);
createCRUDRoutes('templates', proposalTemplates);
createCRUDRoutes('styles', styleCards);
createCRUDRoutes('services', serviceModules);
createCRUDRoutes('exemplars', sectionExemplars);

// Special routes
router.post('/proposals/with-id/:id', async (req, res, next) => {
  try {
    const item = await proposalInstances.createWithId(req.params.id, req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.get('/proposals/by-opportunity/:opportunityId', async (req, res, next) => {
  try {
    const item = await proposalInstances.getByOpportunityId(req.params.opportunityId);
    res.json(item);
  } catch (error) {
    next(error);
  }
});

router.get('/sections/by-proposal/:proposalId', async (req, res, next) => {
  try {
    const items = await proposalSections.getByProposalInstance(req.params.proposalId);
    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.get('/exemplars/by-section/:sectionId', async (req, res, next) => {
  try {
    const items = await sectionExemplars.getBySectionId(req.params.sectionId);
    res.json(items);
  } catch (error) {
    next(error);
  }
});

export default router;
