/**
 * Purchase Terms Module
 *
 * Fixed content for purchase terms.
 * These terms are always included in proposals and are never AI-generated.
 */

export const TERMS_VERSION = '2.0.0';

/**
 * Default purchase terms for Good Circle Marketing
 * @type {import('../models/proposalSchema.js').TermsBlock}
 */
export const purchaseTerms = {
  titleCaps: 'PURCHASE TERMS',
  introText: 'This Agreement is between Good Circle Marketing Consulting ("Consultant") and the Client identified above ("Client"). WHEREAS the Client intends to pay the Consultant for the services provided under the following terms and conditions:',
  clauses: [
    {
      number: 1,
      title: 'Scope of Services',
      body: 'The Consultant agrees to provide the above services.'
    },
    {
      number: 2,
      title: 'AI Tools',
      body: 'Client acknowledges that Consultant uses artificial intelligence tools to support research, ideation, and content development. Consultant reviews and edits all AI-assisted work to ensure it meets professional standards. Consultant will not enter Client\'s confidential information into AI tools that do not provide reasonable confidentiality protections.\n\nIf Client engages Consultant for internal AI training or development programs, Client is responsible for how its team chooses to adopt and use AI tools. Consultant is not responsible for Client\'s compliance with laws, regulations, or internal policies related to AI, or for the results of Client\'s use or misuse of AI tools after training.'
    },
    {
      number: 3,
      title: 'Payment',
      body: 'Client agrees to pay Consultant the quoted fee. If the scope of the Work changes, Consultant may choose to renegotiate the rate with the Client. Either party may cancel the agreement with a 30 day written notice.'
    },
    {
      number: 4,
      title: 'Changes',
      body: 'Any verbal or written changes made by Client to the scope of the Work following its initiation by Consultant may be subject to additional charges. Should such changes negate any part of the Work already completed at the time of the changes, Client accepts responsibility for payment of the completed work and all services related to it, in addition to charges for the change itself.'
    },
    {
      number: 5,
      title: 'Term',
      body: 'This contract will conclude when services are complete, and payment is fulfilled.'
    },
    {
      number: 6,
      title: 'No Guarantee of Results',
      body: 'Client acknowledges and agrees that the Consultant cannot guarantee the results or effectiveness of any of the Services. Consultant agrees to conduct operations and provide the Services professionally and per good industry practice and all federal, state, and local laws. Consultant will use its best efforts and does not promise or guarantee results. Any projections or predictions that the Consultant may have made are based on estimates, assumptions, and forecasts that may prove incorrect. No assurance is given that the Client\'s actual results will correspond with any projected results. Client acknowledges that any results obtained by Consultant for other clients are not necessarily typical and are not a guarantee that Client will obtain the same or similar results by using Consultant\'s services.'
    },
    {
      number: 7,
      title: 'Confidentiality',
      body: 'Each party agrees that it shall not disclose to any third party any confidential or proprietary data, reports, or other information or materials concerning any party hereto without the prior written consent of the party whose information is to be disclosed, except as otherwise required by applicable court or administrative order, law or regulation. Upon the termination or expiration of this Agreement, each party shall have the right to retain all of its proprietary information.'
    },
    {
      number: 8,
      title: 'Copyrights',
      body: 'Upon creation of any original illustrations, graphic images, or custom code for this project, Federal law grants the creator with Federal Copyright Protection, Ownership, and Intellectual property rights of those elements. The transfer of copyrights of the final deliverables will be assigned to the Client conditioned upon and at the time of receipt of payment in full for the work described and accepted by the signing of this Agreement. This copyright term does not apply to original content provided by the Client.'
    },
    {
      number: 9,
      title: 'Publicity',
      body: 'Client agrees that Consultant may use the Client\'s name, logo, and/or image (but not contact information or personal information) and materials created by Consultant in performance of the Services in Consultant\'s advertising or promotional literature and may publish articles, blog posts or other advertising and promotional material relating to the Client and the Services. Consultant agrees to limit selection, timing, and method of release of any materials under this section as requested by Client. Client releases Consultant from any and all liability, including but not limited to infringement of any right to privacy or right to publicity relating to or arising out of publicity of Client\'s name, logo, and/or image as permitted in this section.'
    },
    {
      number: 10,
      title: 'Governing Law',
      body: 'This Agreement shall be interpreted under, subject to, and governed by the substantive laws of the State of Tennessee without giving effect to provisions thereof regarding conflict of laws.'
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
