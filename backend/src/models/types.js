/**
 * Data Model Type Definitions (JSDoc)
 *
 * These provide type hints in VS Code without requiring TypeScript
 */

/**
 * @typedef {Object} Stakeholder
 * @property {string} name
 * @property {string} [role]
 * @property {string[]} [primaryConcerns]
 */

/**
 * @typedef {Object} ClientBrief
 * @property {string} id
 * @property {string} clientName
 * @property {string} [industry]
 * @property {string} [size]
 * @property {string} [location]
 * @property {Stakeholder[]} stakeholders
 * @property {string[]} goals
 * @property {string[]} painPoints
 * @property {string[]} constraints
 * @property {string[]} opportunities
 * @property {string[]} servicesNeeded
 * @property {string[]} [tonePreferences]
 * @property {string} [notesForCopy]
 * @property {string} [rawTranscriptRef]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} TemplateSection
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {boolean} required
 * @property {number} defaultPosition
 */

/**
 * @typedef {Object} ProposalTemplate
 * @property {string} id
 * @property {string} name
 * @property {number} version
 * @property {TemplateSection[]} sections
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} StyleCard
 * @property {string} id
 * @property {string} name
 * @property {string[]} tone
 * @property {string[]} voice
 * @property {string[]} structureGuidelines
 * @property {string[]} languagePatterns
 * @property {string[]} formattingPreferences
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} SectionExemplar
 * @property {string} id
 * @property {string} sectionId
 * @property {string} [serviceId]
 * @property {string} title
 * @property {string} fn
 * @property {string} excerpt
 * @property {string} createdAt
 */

/**
 * @typedef {'one_time' | 'monthly' | 'milestone'} BillingType
 */

/**
 * @typedef {Object} LineItemDefaults
 * @property {string} name
 * @property {string} [internalCode]
 * @property {string} description
 * @property {BillingType} billingType
 * @property {string} unitLabel
 * @property {number} baseAmount
 * @property {boolean} [isRetainer]
 */

/**
 * @typedef {Object} ServiceModule
 * @property {string} id
 * @property {string} label
 * @property {string} summary
 * @property {LineItemDefaults[]} lineItemDefaults
 * @property {string[]} affectsSections
 * @property {Object.<string, string[]>} exemplarsBySection
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} SupportingDocument
 * @property {string} id
 * @property {string} proposalInstanceId
 * @property {string} filename
 * @property {string} type
 * @property {string} rawContent
 * @property {string} processedSummary
 * @property {string} createdAt
 */

/**
 * @typedef {Object} ProposalSectionInstance
 * @property {string} id
 * @property {string} proposalInstanceId
 * @property {string} sectionId
 * @property {string} content
 * @property {number} version
 * @property {string} [comment]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ProposalInstance
 * @property {string} id
 * @property {string} opportunityId
 * @property {string} proposalName
 * @property {string} templateId
 * @property {number} templateVersion
 * @property {string} clientBriefId
 * @property {string[]} serviceIds
 * @property {string[]} supportingDocumentIds
 * @property {'draft' | 'generated' | 'reviewed' | 'sent'} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export {};
