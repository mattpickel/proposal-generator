/**
 * GoHighLevel API Service
 * Fetches opportunity and contact data from GHL
 */

import { log } from '../utils/logger.js';

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

export class GHLError extends Error {
  constructor(message, statusCode, originalError = null) {
    super(message);
    this.name = 'GHLError';
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.isRateLimitError = statusCode === 429;
    this.isAuthError = statusCode === 401;
    this.isNotFoundError = statusCode === 404;
  }
}

function getConfig() {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey) {
    throw new GHLError('GHL_API_KEY environment variable is not set', 500);
  }
  if (!locationId) {
    throw new GHLError('GHL_LOCATION_ID environment variable is not set', 500);
  }

  return { apiKey, locationId };
}

async function callGHL(method, endpoint, queryParams = {}) {
  const { apiKey, locationId } = getConfig();
  const requestId = `ghl-${Date.now()}`;

  // Build URL with query params
  const url = new URL(`${GHL_API_BASE}${endpoint}`);
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, value);
    }
  });

  log.debug('GHL', `Starting ${method} ${endpoint}`, { requestId, queryParams });

  const startTime = Date.now();

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': GHL_API_VERSION,
        'Content-Type': 'application/json'
      }
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status}` };
      }

      log.error('GHL', `Error in ${method} ${endpoint}`, {
        requestId,
        status: response.status,
        error: errorData
      });

      throw new GHLError(
        errorData.message || errorData.error || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    const data = await response.json();

    log.info('GHL', `${method} ${endpoint} completed`, {
      requestId,
      elapsed: `${elapsed}ms`
    });

    return data;
  } catch (error) {
    if (error instanceof GHLError) {
      throw error;
    }

    log.error('GHL', `Network error in ${method} ${endpoint}`, {
      requestId,
      error: error.message
    });

    throw new GHLError(error.message, null, error);
  }
}

/**
 * Get an opportunity by ID
 * @param {string} opportunityId
 * @returns {Promise<Object>} Opportunity data
 */
export async function getOpportunity(opportunityId) {
  log.info('GHL', `Fetching opportunity ${opportunityId}`);
  const data = await callGHL('GET', `/opportunities/${opportunityId}`);
  return data.opportunity || data;
}

/**
 * Get a contact by ID
 * @param {string} contactId
 * @returns {Promise<Object>} Contact data
 */
export async function getContact(contactId) {
  log.info('GHL', `Fetching contact ${contactId}`);
  const data = await callGHL('GET', `/contacts/${contactId}`);
  return data.contact || data;
}

/**
 * Get opportunity with its associated contact
 * @param {string} opportunityId
 * @returns {Promise<{opportunity: Object, contact: Object}>}
 */
export async function getOpportunityWithContact(opportunityId) {
  const opportunity = await getOpportunity(opportunityId);

  if (!opportunity.contact?.id && !opportunity.contactId) {
    log.warn('GHL', 'Opportunity has no associated contact', { opportunityId });
    return { opportunity, contact: null };
  }

  const contactId = opportunity.contact?.id || opportunity.contactId;
  const contact = await getContact(contactId);

  return { opportunity, contact };
}

/**
 * Convert GHL opportunity/contact data to ClientBrief format
 * @param {Object} opportunity
 * @param {Object|null} contact
 * @returns {Object} ClientBrief-compatible object
 */
export function toClientBrief(opportunity, contact) {
  const stakeholderName = contact
    ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.name || 'Unknown'
    : 'Unknown';

  const clientBrief = {
    clientName: contact?.companyName || opportunity.name || 'Unknown Company',
    contactName: stakeholderName,
    contactEmail: contact?.email || '',
    industry: contact?.tags?.join(', ') || '',
    size: '',
    location: contact?.city && contact?.state
      ? `${contact.city}, ${contact.state}`
      : contact?.city || contact?.state || '',
    stakeholders: [{
      name: stakeholderName,
      role: contact?.type || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
      primaryConcerns: []
    }],
    goals: [],
    painPoints: [],
    constraints: [],
    opportunities: [],
    servicesNeeded: [],
    tonePreferences: [],
    notesForCopy: '',
    ghlOpportunityId: opportunity.id,
    ghlContactId: contact?.id || null,
    ghlLocationId: process.env.GHL_LOCATION_ID || null,
    opportunityName: opportunity.name || '',
    opportunityValue: opportunity.monetaryValue || 0,
    opportunityStage: opportunity.pipelineStageName || opportunity.status || ''
  };

  return clientBrief;
}

export const ghlService = {
  getOpportunity,
  getContact,
  getOpportunityWithContact,
  toClientBrief
};

export default ghlService;
