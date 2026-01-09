/**
 * Proposal Assembly Service
 *
 * Deterministically assembles proposals from structured components.
 * Creates the JSON structure with all content except AI-generated comments.
 */

import { getServiceFromLibrary, SERVICE_LIBRARY_VERSION, getServiceDisplayNames } from '../data/serviceLibrary.js';
import { getTermsBlock, TERMS_VERSION } from '../data/purchaseTerms.js';
import { getDefaultStyleRules, TEMPLATE_VERSION } from '../models/proposalSchema.js';
import { clientBriefs } from './database.js';
import { log } from '../utils/logger.js';

/**
 * Create cover block from client brief
 * @param {Object} clientBrief - Client brief data
 * @param {string} [proposalTitle] - Optional custom title
 * @returns {import('../models/proposalSchema.js').CoverBlock}
 */
function createCoverBlock(clientBrief, proposalTitle) {
  const clientName = clientBrief.contactName || clientBrief.clientName || 'Client';
  const clientOrg = clientBrief.clientOrganization || clientBrief.businessName || clientBrief.clientName || 'Organization';

  return {
    proposalTitle: proposalTitle || `Marketing Proposal for ${clientOrg}`,
    brandName: 'Good Circle Marketing',
    preparedByName: 'Kathryn',
    preparedByTitle: 'Marketing Lead',
    quoteCreatedDate: new Date().toISOString().split('T')[0],
    forClientName: clientName,
    forClientOrg: clientOrg,
    forClientEmail: clientBrief.contactEmail || null
  };
}

/**
 * Create empty comments block (to be filled by AI)
 * @param {Object} clientBrief - Client brief data
 * @returns {import('../models/proposalSchema.js').CommentsBlock}
 */
function createEmptyCommentsBlock(clientBrief) {
  const clientName = clientBrief.contactName || clientBrief.clientName || 'there';

  return {
    heading: 'Comments from Kathryn',
    greetingLine: `Hi ${clientName},`,
    paragraphs: [], // To be filled by AI
    signoff: 'Kathryn'
  };
}

/**
 * Assemble service blocks from selected service IDs
 * @param {string[]} serviceIds - Array of service IDs to include
 * @returns {import('../models/proposalSchema.js').ServiceBlock[]}
 */
function assembleServiceBlocks(serviceIds) {
  return serviceIds.map(serviceKey => {
    const serviceTemplate = getServiceFromLibrary(serviceKey);
    if (!serviceTemplate) {
      log.warn('ProposalAssembly', `Service not found: ${serviceKey}`);
      return null;
    }

    return {
      serviceKey: serviceTemplate.serviceKey,
      displayNameCaps: serviceTemplate.displayNameCaps,
      subsections: serviceTemplate.subsections.map(sub => ({
        number: sub.number,
        title: sub.title,
        bodyMarkdown: sub.bodyMarkdown,
        allowClientSpecificEdits: sub.allowClientSpecificEdits
      })),
      investment: { ...serviceTemplate.investment },
      timeline: serviceTemplate.timeline,
      outcome: serviceTemplate.outcome,
      overrides: {},
      enabled: true
    };
  }).filter(Boolean);
}

/**
 * Create itemized block placeholder
 * @param {string} opportunityId - Opportunity ID for HighLevel reference
 * @returns {import('../models/proposalSchema.js').ItemizedBlock}
 */
function createItemizedBlock(opportunityId) {
  return {
    source: 'placeholder',
    placeholderText: '[Itemized products and services will be managed in HighLevel]',
    highLevel: {
      opportunityId: opportunityId,
      estimateId: null
    },
    summary: null
  };
}

/**
 * Create signature block placeholder
 * @returns {import('../models/proposalSchema.js').SignatureBlock}
 */
function createSignatureBlock() {
  return {
    source: 'placeholder',
    placeholderText: '[Signatures will be collected in HighLevel]',
    highLevelEmbed: null
  };
}

/**
 * Assemble a complete proposal skeleton
 * Creates the JSON structure with all deterministic content.
 * Comments block is empty (to be filled by AI separately).
 *
 * @param {Object} params - Assembly parameters
 * @param {string} params.opportunityId - Opportunity identifier
 * @param {string} params.clientBriefId - Client brief identifier
 * @param {string[]} params.selectedServiceIds - Array of service IDs
 * @param {string} [params.proposalTitle] - Optional custom title
 * @returns {Promise<import('../models/proposalSchema.js').Proposal>}
 */
export async function assembleProposalSkeleton({
  opportunityId,
  clientBriefId,
  selectedServiceIds,
  proposalTitle = null
}) {
  log.info('ProposalAssembly', 'Assembling proposal skeleton', {
    opportunityId,
    clientBriefId,
    serviceCount: selectedServiceIds.length
  });

  // Load client brief
  const clientBrief = await clientBriefs.get(clientBriefId);
  if (!clientBrief) {
    throw new Error(`Client brief not found: ${clientBriefId}`);
  }

  const now = new Date().toISOString();

  /** @type {import('../models/proposalSchema.js').Proposal} */
  const proposal = {
    id: opportunityId,
    opportunityId,
    clientBriefId,
    createdAt: now,
    updatedAt: now,
    status: 'draft',

    version: {
      templateVersion: TEMPLATE_VERSION,
      serviceLibraryVersion: SERVICE_LIBRARY_VERSION,
      termsVersion: TERMS_VERSION
    },

    cover: createCoverBlock(clientBrief, proposalTitle),
    comments: createEmptyCommentsBlock(clientBrief),
    services: assembleServiceBlocks(selectedServiceIds),
    modules: [], // Empty by default
    itemized: createItemizedBlock(opportunityId),
    terms: getTermsBlock(),
    signatures: createSignatureBlock(),
    styleRules: getDefaultStyleRules()
  };

  log.info('ProposalAssembly', 'Proposal skeleton assembled', {
    proposalId: proposal.id,
    servicesCount: proposal.services.length
  });

  return proposal;
}

/**
 * Update comments block in a proposal
 * @param {import('../models/proposalSchema.js').Proposal} proposal - Proposal to update
 * @param {Partial<import('../models/proposalSchema.js').CommentsBlock>} comments - New comments data
 * @returns {import('../models/proposalSchema.js').Proposal} Updated proposal
 */
export function updateCommentsBlock(proposal, comments) {
  proposal.comments = {
    ...proposal.comments,
    ...comments
  };
  proposal.updatedAt = new Date().toISOString();
  return proposal;
}

/**
 * Update service overrides in a proposal
 * @param {import('../models/proposalSchema.js').Proposal} proposal - Proposal to update
 * @param {string} serviceKey - Service identifier
 * @param {Object} overrides - Override values
 * @returns {import('../models/proposalSchema.js').Proposal} Updated proposal
 */
export function updateServiceOverrides(proposal, serviceKey, overrides) {
  const service = proposal.services.find(s => s.serviceKey === serviceKey);
  if (!service) {
    throw new Error(`Service not found in proposal: ${serviceKey}`);
  }

  service.overrides = {
    ...service.overrides,
    ...overrides
  };
  proposal.updatedAt = new Date().toISOString();

  return proposal;
}

/**
 * Toggle service enabled state
 * @param {import('../models/proposalSchema.js').Proposal} proposal - Proposal to update
 * @param {string} serviceKey - Service identifier
 * @param {boolean} enabled - New enabled state
 * @returns {import('../models/proposalSchema.js').Proposal} Updated proposal
 */
export function toggleServiceEnabled(proposal, serviceKey, enabled) {
  const service = proposal.services.find(s => s.serviceKey === serviceKey);
  if (!service) {
    throw new Error(`Service not found in proposal: ${serviceKey}`);
  }

  service.enabled = enabled;
  proposal.updatedAt = new Date().toISOString();

  return proposal;
}

/**
 * Add optional module to proposal
 * @param {import('../models/proposalSchema.js').Proposal} proposal - Proposal to update
 * @param {Object} module - Module to add
 * @param {string} module.moduleKey - Module identifier
 * @param {string} [module.titleCaps] - Optional ALL CAPS title
 * @param {string} module.bodyMarkdown - Module content
 * @returns {import('../models/proposalSchema.js').Proposal} Updated proposal
 */
export function addModule(proposal, module) {
  proposal.modules.push({
    moduleKey: module.moduleKey,
    titleCaps: module.titleCaps || null,
    bodyMarkdown: module.bodyMarkdown,
    enabled: true
  });
  proposal.updatedAt = new Date().toISOString();

  return proposal;
}

/**
 * Remove module from proposal
 * @param {import('../models/proposalSchema.js').Proposal} proposal - Proposal to update
 * @param {string} moduleKey - Module identifier to remove
 * @returns {import('../models/proposalSchema.js').Proposal} Updated proposal
 */
export function removeModule(proposal, moduleKey) {
  proposal.modules = proposal.modules.filter(m => m.moduleKey !== moduleKey);
  proposal.updatedAt = new Date().toISOString();

  return proposal;
}

/**
 * Update cover block
 * @param {import('../models/proposalSchema.js').Proposal} proposal - Proposal to update
 * @param {Partial<import('../models/proposalSchema.js').CoverBlock>} cover - Cover updates
 * @returns {import('../models/proposalSchema.js').Proposal} Updated proposal
 */
export function updateCoverBlock(proposal, cover) {
  proposal.cover = {
    ...proposal.cover,
    ...cover
  };
  proposal.updatedAt = new Date().toISOString();
  return proposal;
}
