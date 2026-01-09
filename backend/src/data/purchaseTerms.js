/**
 * Purchase Terms Module
 *
 * Fixed content for consulting agreement terms.
 * These terms are always included in proposals and are never AI-generated.
 */

export const TERMS_VERSION = '1.0.0';

/**
 * Default purchase terms for Good Circle Marketing
 * @type {import('../models/proposalSchema.js').TermsBlock}
 */
export const purchaseTerms = {
  titleCaps: 'CONSULTING AGREEMENT',
  clauses: [
    {
      number: 1,
      title: 'Scope of Services',
      body: 'Good Circle Marketing agrees to provide the services described in this proposal. Any changes to the scope must be agreed upon in writing by both parties.'
    },
    {
      number: 2,
      title: 'Payment Terms',
      body: 'Payment is due according to the schedule outlined in the Investment section. Invoices are payable within 15 days of receipt. Late payments may be subject to a 1.5% monthly service charge.'
    },
    {
      number: 3,
      title: 'Ownership and Intellectual Property',
      body: 'Upon full payment, Client owns all deliverables created specifically for this engagement. Good Circle Marketing retains the right to use work samples in its portfolio with Client permission.'
    },
    {
      number: 4,
      title: 'Confidentiality',
      body: 'Both parties agree to keep confidential any proprietary information shared during this engagement. This obligation continues for two years after project completion.'
    },
    {
      number: 5,
      title: 'Termination',
      body: 'Either party may terminate this agreement with 30 days written notice. Client is responsible for payment for all work completed through the termination date.'
    },
    {
      number: 6,
      title: 'Limitation of Liability',
      body: 'Good Circle Marketing liability is limited to the fees paid for services under this agreement. Neither party is liable for indirect, incidental, or consequential damages.'
    }
  ]
};

/**
 * Get a copy of the terms block
 * @returns {import('../models/proposalSchema.js').TermsBlock}
 */
export function getTermsBlock() {
  return JSON.parse(JSON.stringify(purchaseTerms));
}

/**
 * Get the current terms version
 * @returns {string}
 */
export function getTermsVersion() {
  return TERMS_VERSION;
}
