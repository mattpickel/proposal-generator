/**
 * Proposal Linter Service
 *
 * Post-processing validation to enforce formatting rules:
 * - Replace em dashes with regular dashes
 * - Trim excessive whitespace
 * - Validate paragraph counts
 * - Ensure proper structure
 */

import { log } from '../utils/logger.js';

/**
 * Em dash and en dash regex pattern
 */
const EM_DASH_PATTERN = /[\u2014\u2013]/g; // em dash (-) and en dash (-)

/**
 * Replace em dashes with regular dashes
 * @param {string} text - Text to process
 * @returns {string} Processed text
 */
function replaceEmDashes(text) {
  if (!text) return text;
  return text.replace(EM_DASH_PATTERN, '-');
}

/**
 * Trim excessive whitespace
 * @param {string} text - Text to process
 * @returns {string} Processed text
 */
function trimWhitespace(text) {
  if (!text) return text;
  return text
    .replace(/\n{3,}/g, '\n\n')  // Max 2 consecutive newlines
    .replace(/[ \t]+/g, ' ')     // Single spaces only
    .trim();
}

/**
 * Clean text by applying all text transformations
 * @param {string} text - Text to process
 * @returns {string} Processed text
 */
function cleanText(text) {
  if (!text) return text;
  return trimWhitespace(replaceEmDashes(text));
}

/**
 * Lint comments block
 * @param {import('../models/proposalSchema.js').CommentsBlock} comments - Comments to lint
 * @returns {import('../models/proposalSchema.js').CommentsBlock} Linted comments
 */
export function lintComments(comments) {
  log.debug('Linter', 'Linting comments block');

  const linted = {
    heading: cleanText(comments.heading),
    greetingLine: cleanText(comments.greetingLine),
    paragraphs: comments.paragraphs.map(p => cleanText(p)),
    signoff: cleanText(comments.signoff)
  };

  // Validate paragraph count
  if (linted.paragraphs.length < 2) {
    log.warn('Linter', 'Too few paragraphs in comments', {
      count: linted.paragraphs.length
    });
  }
  if (linted.paragraphs.length > 5) {
    log.warn('Linter', 'Too many paragraphs in comments, truncating', {
      count: linted.paragraphs.length
    });
    linted.paragraphs = linted.paragraphs.slice(0, 5);
  }

  // Remove empty paragraphs
  linted.paragraphs = linted.paragraphs.filter(p => p && p.trim().length > 0);

  // Ensure signoff doesn't start with dash
  if (linted.signoff && linted.signoff.startsWith('-')) {
    linted.signoff = linted.signoff.replace(/^[-\s]+/, '').trim();
  }

  return linted;
}

/**
 * Lint cover block
 * @param {import('../models/proposalSchema.js').CoverBlock} cover - Cover to lint
 * @returns {import('../models/proposalSchema.js').CoverBlock} Linted cover
 */
function lintCover(cover) {
  return {
    ...cover,
    proposalTitle: cleanText(cover.proposalTitle),
    brandName: cleanText(cover.brandName),
    preparedByName: cleanText(cover.preparedByName),
    preparedByTitle: cleanText(cover.preparedByTitle),
    forClientName: cleanText(cover.forClientName),
    forClientOrg: cleanText(cover.forClientOrg),
    forClientEmail: cover.forClientEmail ? cleanText(cover.forClientEmail) : null
  };
}

/**
 * Lint service subsections
 * @param {import('../models/proposalSchema.js').ServiceSubsection[]} subsections - Subsections to lint
 * @returns {import('../models/proposalSchema.js').ServiceSubsection[]} Linted subsections
 */
function lintSubsections(subsections) {
  return subsections.map(sub => ({
    ...sub,
    title: cleanText(sub.title),
    bodyMarkdown: cleanText(sub.bodyMarkdown)
  }));
}

/**
 * Lint service blocks
 * @param {import('../models/proposalSchema.js').ServiceBlock[]} services - Services to lint
 * @returns {import('../models/proposalSchema.js').ServiceBlock[]} Linted services
 */
function lintServices(services) {
  return services.map(service => ({
    ...service,
    displayNameCaps: cleanText(service.displayNameCaps),
    subsections: lintSubsections(service.subsections),
    timeline: service.timeline ? cleanText(service.timeline) : undefined,
    outcome: service.outcome ? cleanText(service.outcome) : undefined
  }));
}

/**
 * Lint module blocks
 * @param {import('../models/proposalSchema.js').ModuleBlock[]} modules - Modules to lint
 * @returns {import('../models/proposalSchema.js').ModuleBlock[]} Linted modules
 */
function lintModules(modules) {
  return modules.map(module => ({
    ...module,
    titleCaps: module.titleCaps ? cleanText(module.titleCaps) : undefined,
    bodyMarkdown: cleanText(module.bodyMarkdown)
  }));
}

/**
 * Lint terms clauses
 * @param {import('../models/proposalSchema.js').Clause[]} clauses - Clauses to lint
 * @returns {import('../models/proposalSchema.js').Clause[]} Linted clauses
 */
function lintClauses(clauses) {
  return clauses.map(clause => ({
    ...clause,
    title: clause.title ? cleanText(clause.title) : undefined,
    body: cleanText(clause.body)
  }));
}

/**
 * Lint entire proposal
 * @param {import('../models/proposalSchema.js').Proposal} proposal - Proposal to lint
 * @returns {import('../models/proposalSchema.js').Proposal} Linted proposal
 */
export function lintProposal(proposal) {
  log.info('Linter', 'Linting proposal', { proposalId: proposal.id });

  const linted = {
    ...proposal,
    cover: lintCover(proposal.cover),
    comments: lintComments(proposal.comments),
    services: lintServices(proposal.services),
    modules: lintModules(proposal.modules),
    terms: {
      ...proposal.terms,
      titleCaps: cleanText(proposal.terms.titleCaps),
      clauses: lintClauses(proposal.terms.clauses)
    },
    updatedAt: new Date().toISOString()
  };

  log.info('Linter', 'Proposal linting complete');
  return linted;
}

/**
 * Validate proposal structure
 * @param {import('../models/proposalSchema.js').Proposal} proposal - Proposal to validate
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
export function validateProposal(proposal) {
  const errors = [];

  // Required fields
  if (!proposal.id) errors.push('Missing proposal ID');
  if (!proposal.opportunityId) errors.push('Missing opportunity ID');
  if (!proposal.clientBriefId) errors.push('Missing client brief ID');

  // Cover validation
  if (!proposal.cover?.proposalTitle) errors.push('Missing proposal title');
  if (!proposal.cover?.forClientName) errors.push('Missing client name');
  if (!proposal.cover?.forClientOrg) errors.push('Missing client organization');

  // Comments validation
  if (!proposal.comments?.heading) errors.push('Missing comments heading');
  if (!proposal.comments?.paragraphs?.length) errors.push('Missing comments paragraphs');
  if (proposal.comments?.paragraphs?.length < 2) {
    errors.push('Comments should have at least 2 paragraphs');
  }

  // Services validation
  if (!proposal.services?.length) errors.push('No services selected');
  const enabledServices = proposal.services?.filter(s => s.enabled) || [];
  if (enabledServices.length === 0) {
    errors.push('At least one service must be enabled');
  }

  // Terms validation
  if (!proposal.terms?.clauses?.length) errors.push('Missing terms clauses');

  // Style rules enforcement
  if (proposal.styleRules?.forbidEmDash) {
    const fullText = JSON.stringify(proposal);
    if (EM_DASH_PATTERN.test(fullText)) {
      errors.push('Em dashes found in proposal content');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if text contains em dashes
 * @param {string} text - Text to check
 * @returns {boolean} True if em dashes found
 */
export function containsEmDashes(text) {
  if (!text) return false;
  return EM_DASH_PATTERN.test(text);
}
