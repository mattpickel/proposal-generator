/**
 * Frontend API Client
 * Communicates with backend Express API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}, responseType = 'json') {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    // Return text for non-JSON responses (like HTML)
    if (responseType === 'text') {
      return response.text();
    }

    return response.json();
  }

  // Database operations
  database = {
    // Proposals
    proposals: {
      getAll: () => this.request('/database/proposals'),
      get: (id) => this.request(`/database/proposals/${id}`),
      create: (data) => this.request('/database/proposals', { method: 'POST', body: data }),
      createWithId: (id, data) => this.request(`/database/proposals/with-id/${id}`, { method: 'POST', body: data }),
      update: (id, data) => this.request(`/database/proposals/${id}`, { method: 'PUT', body: data }),
      delete: (id) => this.request(`/database/proposals/${id}`, { method: 'DELETE' }),
      getByOpportunityId: (opportunityId) => this.request(`/database/proposals/by-opportunity/${opportunityId}`),
    },

    // Client Briefs
    clientBriefs: {
      getAll: () => this.request('/database/client-briefs'),
      get: (id) => this.request(`/database/client-briefs/${id}`),
      create: (data) => this.request('/database/client-briefs', { method: 'POST', body: data }),
      update: (id, data) => this.request(`/database/client-briefs/${id}`, { method: 'PUT', body: data }),
      delete: (id) => this.request(`/database/client-briefs/${id}`, { method: 'DELETE' }),
      getByGhlOpportunityId: (opportunityId) => this.request(`/database/client-briefs/by-ghl-opportunity/${opportunityId}`),
    },

    // Sections
    sections: {
      getAll: () => this.request('/database/sections'),
      get: (id) => this.request(`/database/sections/${id}`),
      create: (data) => this.request('/database/sections', { method: 'POST', body: data }),
      update: (id, data) => this.request(`/database/sections/${id}`, { method: 'PUT', body: data }),
      delete: (id) => this.request(`/database/sections/${id}`, { method: 'DELETE' }),
      getByProposalId: (proposalId) => this.request(`/database/sections/by-proposal/${proposalId}`),
    },

    // Supporting Documents
    documents: {
      getAll: () => this.request('/database/documents'),
      get: (id) => this.request(`/database/documents/${id}`),
      create: (data) => this.request('/database/documents', { method: 'POST', body: data }),
      update: (id, data) => this.request(`/database/documents/${id}`, { method: 'PUT', body: data }),
      delete: (id) => this.request(`/database/documents/${id}`, { method: 'DELETE' }),
    },

    // Templates
    templates: {
      getAll: () => this.request('/database/templates'),
      get: (id) => this.request(`/database/templates/${id}`),
    },

    // Styles
    styles: {
      getAll: () => this.request('/database/styles'),
      get: (id) => this.request(`/database/styles/${id}`),
    },

    // Services
    services: {
      getAll: () => this.request('/database/services'),
      get: (id) => this.request(`/database/services/${id}`),
    },

    // Exemplars
    exemplars: {
      getAll: () => this.request('/database/exemplars'),
      get: (id) => this.request(`/database/exemplars/${id}`),
      getBySectionId: (sectionId) => this.request(`/database/exemplars/by-section/${sectionId}`),
    },
  };

  // Extraction operations
  extraction = {
    extractClientBrief: (apiKey, transcriptText) =>
      this.request('/extraction/client-brief', {
        method: 'POST',
        body: { apiKey, transcriptText },
      }),

    extractDocumentSummary: (apiKey, documentText, documentType) =>
      this.request('/extraction/document-summary', {
        method: 'POST',
        body: { apiKey, documentText, documentType },
      }),

    suggestServices: (apiKey, clientBrief) =>
      this.request('/extraction/suggest-services', {
        method: 'POST',
        body: { apiKey, clientBrief },
      }),
  };

  // Generation operations
  generation = {
    generateSection: (apiKey, params) =>
      this.request('/generation/section', {
        method: 'POST',
        body: { apiKey, ...params },
      }),

    generateAllSections: (apiKey, proposalInstanceId) =>
      this.request('/generation/all-sections', {
        method: 'POST',
        body: { apiKey, proposalInstanceId },
      }),

    reviseSection: (apiKey, sectionInstanceId, comment) =>
      this.request('/generation/revise', {
        method: 'POST',
        body: { apiKey, sectionInstanceId, comment },
      }),

    // New unified proposal generation
    generateUnified: (apiKey, proposalInstanceId, proposalMetadata = {}) =>
      this.request('/generation/unified', {
        method: 'POST',
        body: { apiKey, proposalInstanceId, proposalMetadata },
      }),

    // Iterate on existing proposal with feedback
    iterateProposal: (apiKey, currentProposal, feedback) =>
      this.request('/generation/iterate', {
        method: 'POST',
        body: { apiKey, currentProposal, feedback },
      }),
  };

  // Proposals V2 - JSON-first proposal system
  proposalsV2 = {
    // Create new proposal (assembles skeleton + generates AI comments)
    create: (data) =>
      this.request('/proposals/v2', {
        method: 'POST',
        body: data,
      }),

    // Get proposal JSON
    get: (id) =>
      this.request(`/proposals/v2/${id}`),

    // Update or regenerate comments
    updateComments: (id, data) =>
      this.request(`/proposals/v2/${id}/comments`, {
        method: 'PATCH',
        body: data,
      }),

    // Update cover block
    updateCover: (id, cover) =>
      this.request(`/proposals/v2/${id}/cover`, {
        method: 'PATCH',
        body: { cover },
      }),

    // Update service overrides or toggle enabled
    updateService: (id, serviceKey, data) =>
      this.request(`/proposals/v2/${id}/services/${serviceKey}`, {
        method: 'PATCH',
        body: data,
      }),

    // Add optional module
    addModule: (id, module) =>
      this.request(`/proposals/v2/${id}/modules`, {
        method: 'POST',
        body: module,
      }),

    // Remove module
    removeModule: (id, moduleKey) =>
      this.request(`/proposals/v2/${id}/modules/${moduleKey}`, {
        method: 'DELETE',
      }),

    // Render to HTML
    renderHtml: (id) =>
      this.request(`/proposals/v2/${id}/render?format=html`, {}, 'text'),

    // Render to plain text
    renderPlain: (id) =>
      this.request(`/proposals/v2/${id}/render?format=plain`, {}, 'text'),

    // Render body only (for embedding)
    renderBody: (id) =>
      this.request(`/proposals/v2/${id}/render?format=body`, {}, 'text'),

    // Validate proposal
    validate: (id) =>
      this.request(`/proposals/v2/${id}/validate`),

    // Delete proposal
    delete: (id) =>
      this.request(`/proposals/v2/${id}`, { method: 'DELETE' }),
  };

  // GoHighLevel integration
  ghl = {
    // Get opportunity with contact data
    getOpportunity: (opportunityId) =>
      this.request(`/ghl/opportunities/${opportunityId}`),

    // Preview import (get ClientBrief format without saving)
    previewImport: (opportunityId) =>
      this.request(`/ghl/opportunities/${opportunityId}/preview`),

    // Import opportunity as ClientBrief (saves to database)
    importOpportunity: (opportunityId) =>
      this.request(`/ghl/opportunities/${opportunityId}/import`, {
        method: 'POST',
      }),
  };
}

export const api = new APIClient(API_BASE_URL);
export default api;
