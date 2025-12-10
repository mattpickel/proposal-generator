/**
 * Database Service Layer
 *
 * CRUD operations for all Firestore collections using Firebase Admin SDK
 */

import { FieldValue } from 'firebase-admin/firestore';
import { db, COLLECTIONS } from '../config/firebase.js';
import { log } from '../utils/logger.js';

/**
 * Generic CRUD Operations
 */

async function create(collectionName, data) {
  try {
    const docRef = await db.collection(collectionName).add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    log.info('Database', `Created document in ${collectionName}`, { id: docRef.id });

    // Fetch the created document to get timestamp values
    const doc = await docRef.get();
    return { id: docRef.id, ...doc.data() };
  } catch (error) {
    log.error('Database', `Error creating document in ${collectionName}`, error);
    throw error;
  }
}

async function createWithId(collectionName, id, data) {
  try {
    await db.collection(collectionName).doc(id).set({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    log.info('Database', `Created document in ${collectionName} with ID`, { id });

    // Fetch the created document to get timestamp values
    const doc = await db.collection(collectionName).doc(id).get();
    return { id, ...doc.data() };
  } catch (error) {
    log.error('Database', `Error creating document in ${collectionName}`, error);
    throw error;
  }
}

async function get(collectionName, id) {
  try {
    const docSnap = await db.collection(collectionName).doc(id).get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    log.error('Database', `Error getting document from ${collectionName}`, { id, error });
    throw error;
  }
}

async function getAll(collectionName, orderByField = 'createdAt') {
  try {
    const snapshot = await db.collection(collectionName)
      .orderBy(orderByField, 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    // If orderBy field doesn't exist, try without ordering
    if (error.code === 3 || error.message.includes('index')) {
      log.warn('Database', `Index not found for ${orderByField}, fetching without ordering`);
      const snapshot = await db.collection(collectionName).get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
    log.error('Database', `Error getting all documents from ${collectionName}`, error);
    throw error;
  }
}

async function update(collectionName, id, data) {
  try {
    await db.collection(collectionName).doc(id).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp()
    });
    log.info('Database', `Updated document in ${collectionName}`, { id });

    // Fetch the updated document
    const doc = await db.collection(collectionName).doc(id).get();
    return { id, ...doc.data() };
  } catch (error) {
    log.error('Database', `Error updating document in ${collectionName}`, { id, error });
    throw error;
  }
}

async function remove(collectionName, id) {
  try {
    await db.collection(collectionName).doc(id).delete();
    log.info('Database', `Deleted document from ${collectionName}`, { id });
  } catch (error) {
    log.error('Database', `Error deleting document from ${collectionName}`, { id, error });
    throw error;
  }
}

async function queryWhere(collectionName, field, operator, value) {
  try {
    const snapshot = await db.collection(collectionName)
      .where(field, operator, value)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    log.error('Database', `Error querying ${collectionName}`, { field, operator, value, error });
    throw error;
  }
}

/**
 * Client Brief Operations
 */

export const clientBriefs = {
  create: (data) => create(COLLECTIONS.CLIENT_BRIEFS, data),
  get: (id) => get(COLLECTIONS.CLIENT_BRIEFS, id),
  getAll: () => getAll(COLLECTIONS.CLIENT_BRIEFS),
  update: (id, data) => update(COLLECTIONS.CLIENT_BRIEFS, id, data),
  delete: (id) => remove(COLLECTIONS.CLIENT_BRIEFS, id)
};

/**
 * Proposal Template Operations
 */

export const proposalTemplates = {
  create: (data) => create(COLLECTIONS.PROPOSAL_TEMPLATES, data),
  createWithId: (id, data) => createWithId(COLLECTIONS.PROPOSAL_TEMPLATES, id, data),
  get: (id) => get(COLLECTIONS.PROPOSAL_TEMPLATES, id),
  getAll: () => getAll(COLLECTIONS.PROPOSAL_TEMPLATES),
  update: (id, data) => update(COLLECTIONS.PROPOSAL_TEMPLATES, id, data),
  delete: (id) => remove(COLLECTIONS.PROPOSAL_TEMPLATES, id),
  getDefault: async () => {
    const templates = await getAll(COLLECTIONS.PROPOSAL_TEMPLATES);
    return templates.find(t => t.id === 'gcm_standard_v1') || templates[0];
  }
};

/**
 * Style Card Operations
 */

export const styleCards = {
  create: (data) => create(COLLECTIONS.STYLE_CARDS, data),
  createWithId: (id, data) => createWithId(COLLECTIONS.STYLE_CARDS, id, data),
  get: (id) => get(COLLECTIONS.STYLE_CARDS, id),
  getAll: () => getAll(COLLECTIONS.STYLE_CARDS),
  update: (id, data) => update(COLLECTIONS.STYLE_CARDS, id, data),
  delete: (id) => remove(COLLECTIONS.STYLE_CARDS, id),
  getDefault: async () => {
    const cards = await getAll(COLLECTIONS.STYLE_CARDS);
    return cards.find(c => c.id === 'gcm_house_style_v1') || cards[0];
  }
};

/**
 * Service Module Operations
 */

export const serviceModules = {
  create: (data) => create(COLLECTIONS.SERVICE_MODULES, data),
  createWithId: (id, data) => createWithId(COLLECTIONS.SERVICE_MODULES, id, data),
  get: (id) => get(COLLECTIONS.SERVICE_MODULES, id),
  getAll: () => getAll(COLLECTIONS.SERVICE_MODULES, 'label'),
  update: (id, data) => update(COLLECTIONS.SERVICE_MODULES, id, data),
  delete: (id) => remove(COLLECTIONS.SERVICE_MODULES, id),
  getByIds: async (ids) => {
    const allModules = await getAll(COLLECTIONS.SERVICE_MODULES);
    return allModules.filter(m => ids.includes(m.id));
  }
};

/**
 * Section Exemplar Operations
 */

export const sectionExemplars = {
  create: (data) => create(COLLECTIONS.SECTION_EXEMPLARS, data),
  get: (id) => get(COLLECTIONS.SECTION_EXEMPLARS, id),
  getAll: () => getAll(COLLECTIONS.SECTION_EXEMPLARS),
  update: (id, data) => update(COLLECTIONS.SECTION_EXEMPLARS, id, data),
  delete: (id) => remove(COLLECTIONS.SECTION_EXEMPLARS, id),
  getBySectionId: (sectionId) => queryWhere(COLLECTIONS.SECTION_EXEMPLARS, 'sectionId', '==', sectionId),
  getByServiceId: (serviceId) => queryWhere(COLLECTIONS.SECTION_EXEMPLARS, 'serviceId', '==', serviceId),
  getBySectionAndService: async (sectionId, serviceId) => {
    try {
      const snapshot = await db.collection(COLLECTIONS.SECTION_EXEMPLARS)
        .where('sectionId', '==', sectionId)
        .where('serviceId', '==', serviceId)
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      log.error('Database', 'Error querying exemplars by section and service', error);
      throw error;
    }
  }
};

/**
 * Supporting Document Operations
 */

export const supportingDocuments = {
  create: (data) => create(COLLECTIONS.SUPPORTING_DOCUMENTS, data),
  get: (id) => get(COLLECTIONS.SUPPORTING_DOCUMENTS, id),
  getAll: () => getAll(COLLECTIONS.SUPPORTING_DOCUMENTS),
  update: (id, data) => update(COLLECTIONS.SUPPORTING_DOCUMENTS, id, data),
  delete: (id) => remove(COLLECTIONS.SUPPORTING_DOCUMENTS, id),
  getByProposalInstance: (proposalInstanceId) =>
    queryWhere(COLLECTIONS.SUPPORTING_DOCUMENTS, 'proposalInstanceId', '==', proposalInstanceId),
  getByIds: async (ids) => {
    const allDocs = await getAll(COLLECTIONS.SUPPORTING_DOCUMENTS);
    return allDocs.filter(d => ids.includes(d.id));
  }
};

/**
 * Proposal Instance Operations
 */

export const proposalInstances = {
  create: (data) => create(COLLECTIONS.PROPOSAL_INSTANCES, data),
  createWithId: (id, data) => createWithId(COLLECTIONS.PROPOSAL_INSTANCES, id, data),
  get: (id) => get(COLLECTIONS.PROPOSAL_INSTANCES, id),
  getAll: () => getAll(COLLECTIONS.PROPOSAL_INSTANCES),
  update: (id, data) => update(COLLECTIONS.PROPOSAL_INSTANCES, id, data),
  delete: (id) => remove(COLLECTIONS.PROPOSAL_INSTANCES, id),
  getByOpportunityId: (opportunityId) =>
    queryWhere(COLLECTIONS.PROPOSAL_INSTANCES, 'opportunityId', '==', opportunityId)
};

/**
 * Proposal Section Instance Operations
 */

export const proposalSections = {
  create: (data) => create(COLLECTIONS.PROPOSAL_SECTIONS, data),
  get: (id) => get(COLLECTIONS.PROPOSAL_SECTIONS, id),
  getAll: () => getAll(COLLECTIONS.PROPOSAL_SECTIONS),
  update: (id, data) => update(COLLECTIONS.PROPOSAL_SECTIONS, id, data),
  delete: (id) => remove(COLLECTIONS.PROPOSAL_SECTIONS, id),
  getByProposalInstance: async (proposalInstanceId) => {
    const sections = await queryWhere(COLLECTIONS.PROPOSAL_SECTIONS, 'proposalInstanceId', '==', proposalInstanceId);
    return sections.sort((a, b) => (a.sectionId > b.sectionId ? 1 : -1));
  },
  getByProposalAndSection: async (proposalInstanceId, sectionId) => {
    try {
      const snapshot = await db.collection(COLLECTIONS.PROPOSAL_SECTIONS)
        .where('proposalInstanceId', '==', proposalInstanceId)
        .where('sectionId', '==', sectionId)
        .orderBy('version', 'desc')
        .get();

      const sections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return sections[0]; // Return latest version
    } catch (error) {
      log.error('Database', 'Error querying section by proposal and section ID', error);
      throw error;
    }
  }
};
