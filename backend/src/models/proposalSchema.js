/**
 * Proposal JSON Schema Type Definitions (JSDoc)
 *
 * This defines the structure for JSON-first, deterministic proposal assembly.
 * Proposals are stored and manipulated as structured JSON, rendered to HTML only at the end.
 */

/**
 * @typedef {Object} ProposalVersion
 * @property {string} templateVersion - Version of proposal template structure
 * @property {string} serviceLibraryVersion - Version of service library
 * @property {string} termsVersion - Version of purchase terms
 */

/**
 * @typedef {Object} CoverBlock
 * Cover/title block - deterministic, never AI-generated
 * @property {string} proposalTitle - Main proposal title
 * @property {string} brandName - Agency brand name (Good Circle Marketing)
 * @property {string} preparedByName - Name of preparer
 * @property {string} preparedByTitle - Title of preparer
 * @property {string} quoteCreatedDate - Date string (YYYY-MM-DD)
 * @property {string} forClientName - Client contact name
 * @property {string} forClientOrg - Client organization name
 * @property {string} [forClientEmail] - Optional client email
 */

/**
 * @typedef {Object} CommentsBlock
 * Comments from Marketing Lead - the ONLY AI-generated section
 * @property {string} heading - Section heading (e.g., "Comments from Kathryn")
 * @property {string} greetingLine - Opening greeting (e.g., "Hi Heather,")
 * @property {string[]} paragraphs - 2-5 short paragraphs of narrative
 * @property {string} signoff - Closing signature (must NOT contain em dashes)
 */

/**
 * @typedef {'one_time' | 'monthly' | 'quarterly' | 'custom'} InvestmentModel
 */

/**
 * @typedef {Object} Investment
 * Structured pricing information
 * @property {InvestmentModel} model - Billing model type
 * @property {number} [amount] - Price amount in dollars
 * @property {string} currency - Currency code (USD)
 * @property {string} [notes] - Additional pricing notes
 * @property {string} [renderHint] - Human-readable price display (e.g., "$5,000 one-time investment")
 */

/**
 * @typedef {Object} ServiceSubsection
 * Individual subsection within a service
 * @property {number} number - Subsection number (1..N)
 * @property {string} title - Subsection title
 * @property {string} bodyMarkdown - Restricted markdown content (bullets, bold, italic)
 * @property {boolean} allowClientSpecificEdits - Whether per-proposal edits are allowed
 */

/**
 * @typedef {Object} ServiceOverrides
 * Per-proposal overrides for service content
 * @property {Object.<string, string>} [subsections] - Override for subsection bodies (keyed by subsection_N)
 * @property {Partial<Investment>} [investment] - Override for investment details
 */

/**
 * @typedef {Object} ServiceBlock
 * A service section pulled from the service library
 * @property {string} serviceKey - Service identifier
 * @property {string} displayNameCaps - ALL CAPS display name (e.g., "THE MARKETING MACHINE")
 * @property {ServiceSubsection[]} subsections - Numbered subsections
 * @property {Investment} investment - Pricing information
 * @property {string} [timeline] - Timeline description
 * @property {string} [outcome] - Expected outcome statement
 * @property {ServiceOverrides} [overrides] - Per-proposal customizations
 * @property {boolean} enabled - Whether service is included in this proposal
 */

/**
 * @typedef {Object} ModuleBlock
 * Optional sections like "Past Clients"
 * @property {string} moduleKey - Module identifier
 * @property {string} [titleCaps] - Optional ALL CAPS title
 * @property {string} bodyMarkdown - Module content in restricted markdown
 * @property {boolean} enabled - Whether module is included
 */

/**
 * @typedef {Object} HighLevelConfig
 * HighLevel integration configuration
 * @property {string} [opportunityId] - HighLevel opportunity ID
 * @property {string} [estimateId] - HighLevel estimate ID
 */

/**
 * @typedef {Object} ItemizedSummary
 * Summary of itemized products/services
 * @property {number} [total] - Total price
 * @property {string} [billingSchedule] - Billing schedule description
 */

/**
 * @typedef {Object} ItemizedBlock
 * Itemized products/services section - managed in HighLevel
 * @property {'highlevel' | 'placeholder'} source - Data source
 * @property {string} [placeholderText] - Placeholder content when source is 'placeholder'
 * @property {HighLevelConfig} [highLevel] - HighLevel integration data
 * @property {ItemizedSummary} [summary] - Pricing summary
 */

/**
 * @typedef {Object} Clause
 * Individual term/clause in the agreement
 * @property {number} number - Clause number
 * @property {string} [title] - Optional clause title
 * @property {string} body - Clause text
 */

/**
 * @typedef {Object} TermsBlock
 * Purchase terms section - fixed content
 * @property {string} titleCaps - ALL CAPS section title (e.g., "PURCHASE TERMS")
 * @property {string} [introText] - Optional introductory paragraph before clauses
 * @property {Clause[]} clauses - Array of terms clauses
 */

/**
 * @typedef {Object} HighLevelEmbed
 * HighLevel signature embed configuration
 * @property {string} [url] - Embed URL
 * @property {string} [instructions] - Instructions for embedding
 */

/**
 * @typedef {Object} SignatureBlock
 * Signature section - managed in HighLevel
 * @property {'highlevel' | 'placeholder'} source - Data source
 * @property {string} [placeholderText] - Placeholder content when source is 'placeholder'
 * @property {HighLevelEmbed} [highLevelEmbed] - HighLevel embed data
 */

/**
 * @typedef {Object} StyleRules
 * Formatting rules enforced by the system
 * @property {boolean} forbidEmDash - Enforce no em dashes (always true)
 * @property {string} tone - Tone descriptor (e.g., "professional_personal")
 * @property {boolean} numberedSubsections - Use numbered subsections
 * @property {boolean} capsServiceTitles - Service titles in ALL CAPS
 * @property {string} bulletsStyle - List style ("ul" or "ol")
 */

/**
 * @typedef {Object} Proposal
 * Complete proposal document in JSON format
 * @property {string} id - Unique proposal ID (usually opportunity ID)
 * @property {string} opportunityId - Related opportunity ID
 * @property {string} clientBriefId - Related client brief ID
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 * @property {'draft' | 'complete' | 'sent'} status - Proposal status
 * @property {ProposalVersion} version - Version information
 * @property {CoverBlock} cover - Cover/title block
 * @property {CommentsBlock} comments - AI-generated comments section
 * @property {ServiceBlock[]} services - Selected services
 * @property {ModuleBlock[]} modules - Optional modules
 * @property {ItemizedBlock} itemized - Products/services placeholder
 * @property {TermsBlock} terms - Purchase terms
 * @property {SignatureBlock} signatures - Signature placeholder
 * @property {StyleRules} styleRules - Formatting rules
 */

/**
 * Default style rules for all proposals
 * @returns {StyleRules}
 */
export function getDefaultStyleRules() {
  return {
    forbidEmDash: true,
    tone: 'professional_personal',
    numberedSubsections: true,
    capsServiceTitles: true,
    bulletsStyle: 'ul'
  };
}

/**
 * Default template version
 */
export const TEMPLATE_VERSION = '2.0.0';

export {};
