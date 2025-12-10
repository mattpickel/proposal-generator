/**
 * Seed Data for Database
 *
 * Default template, style card, service modules, and exemplars
 */

import { ServiceIds, SectionIds, BillingTypes } from '../models/constants.js';

/**
 * Default Proposal Template
 */
export const defaultProposalTemplate = {
  id: 'gcm_standard_v1',
  name: 'Standard GCM Proposal',
  version: 1,
  sections: [
    {
      id: SectionIds.HEADER,
      title: 'Proposal',
      description: 'Client + project info, reference numbers, dates.',
      required: true,
      defaultPosition: 1
    },
    {
      id: SectionIds.OVERVIEW,
      title: 'Comments from Kathryn',
      description: 'Warm, plain-language overview of context and plan.',
      required: true,
      defaultPosition: 2
    },
    {
      id: SectionIds.SERVICES_SUMMARY,
      title: 'Products & Services',
      description: 'List selected services with short descriptions.',
      required: true,
      defaultPosition: 3
    },
    {
      id: SectionIds.SCOPE,
      title: 'Scope of Work',
      description: 'Narrative of what we will do, grouped by service.',
      required: true,
      defaultPosition: 4
    },
    {
      id: SectionIds.DELIVERABLES,
      title: 'Deliverables',
      description: 'Bulleted list of what the client receives.',
      required: true,
      defaultPosition: 5
    },
    {
      id: SectionIds.TIMELINE,
      title: 'Timeline',
      description: 'Phases and timing for services.',
      required: true,
      defaultPosition: 6
    },
    {
      id: SectionIds.INVESTMENT,
      title: 'Investment',
      description: 'Line items, one-time vs monthly fees, payment terms.',
      required: true,
      defaultPosition: 7
    },
    {
      id: SectionIds.TERMS,
      title: 'Purchase Terms',
      description: 'Standard terms and conditions.',
      required: true,
      defaultPosition: 8
    },
    {
      id: SectionIds.SIGNATURE,
      title: 'Acceptance',
      description: 'Signature block / acceptance statement.',
      required: true,
      defaultPosition: 9
    }
  ]
};

/**
 * House Style Card
 */
export const houseStyleCard = {
  id: 'gcm_house_style_v1',
  name: 'GCM House Style',
  tone: [
    'Calm, confident, plain language',
    'Avoid hype and heavy AI jargon',
    'Professional but approachable'
  ],
  voice: [
    'Use "we" for the agency team, "you" for the client',
    'Occasional "we\'ll" to describe planned work',
    'No first-person singular ("I")'
  ],
  structureGuidelines: [
    '2–4 sentence paragraphs',
    'Frequent bullet lists for services, deliverables, and steps',
    'Each major section starts with a 1–2 sentence summary'
  ],
  languagePatterns: [
    'Prefer concrete verbs ("build", "design", "implement")',
    'Focus on outcomes ("reduce confusion", "shorten review cycles")',
    'Avoid filler like "we are excited to..."'
  ],
  formattingPreferences: [
    'Clear headings for sections',
    'Bullets using "-" unless sequence matters',
    'Use bold sparingly for key phrases'
  ]
};

/**
 * Service Modules
 */
export const serviceModules = [
  {
    id: ServiceIds.MARKETING_MACHINE,
    label: 'Marketing Machine',
    summary: 'A repeatable system for generating and nurturing demand across web, email, and content.',
    lineItemDefaults: [
      {
        name: 'Marketing Machine Setup',
        internalCode: 'MM_SETUP',
        description: 'Strategy, core messaging, funnels, and foundational assets to make your marketing repeatable.',
        billingType: BillingTypes.ONE_TIME,
        unitLabel: 'project',
        baseAmount: 7500,
        isRetainer: false
      }
    ],
    affectsSections: [
      SectionIds.OVERVIEW,
      SectionIds.SCOPE,
      SectionIds.DELIVERABLES,
      SectionIds.TIMELINE,
      SectionIds.INVESTMENT
    ],
    exemplarsBySection: {}
  },
  {
    id: ServiceIds.INTERNAL_COMMS,
    label: 'Internal Communications',
    summary: 'Streamline internal updates and staff alignment with structured communication systems.',
    lineItemDefaults: [
      {
        name: 'Internal Comms Add-on',
        internalCode: 'IC_ADDON',
        description: 'Templates, processes, and content for internal newsletters and updates.',
        billingType: BillingTypes.ONE_TIME,
        unitLabel: 'project',
        baseAmount: 2500,
        isRetainer: false
      }
    ],
    affectsSections: [
      SectionIds.SCOPE,
      SectionIds.DELIVERABLES,
      SectionIds.INVESTMENT
    ],
    exemplarsBySection: {}
  },
  {
    id: ServiceIds.SEO_HOSTING,
    label: 'SEO & Hosting',
    summary: 'Technical foundation including SEO optimization, analytics setup, and hosting configuration.',
    lineItemDefaults: [
      {
        name: 'SEO & Technical Setup',
        internalCode: 'SEO_SETUP',
        description: 'Baseline on-site SEO, analytics integration, and hosting/domain configuration.',
        billingType: BillingTypes.ONE_TIME,
        unitLabel: 'project',
        baseAmount: 3500,
        isRetainer: false
      }
    ],
    affectsSections: [
      SectionIds.SCOPE,
      SectionIds.DELIVERABLES,
      SectionIds.INVESTMENT
    ],
    exemplarsBySection: {}
  },
  {
    id: ServiceIds.DIGITAL_UPGRADES,
    label: 'Digital Upgrades & Technical Support',
    summary: 'Website improvements, technical enhancements, and digital infrastructure upgrades.',
    lineItemDefaults: [
      {
        name: 'Digital Upgrades',
        internalCode: 'DIG_UPG',
        description: 'Technical improvements to website, CRM integration, and digital tools.',
        billingType: BillingTypes.ONE_TIME,
        unitLabel: 'project',
        baseAmount: 5000,
        isRetainer: false
      }
    ],
    affectsSections: [
      SectionIds.SCOPE,
      SectionIds.DELIVERABLES,
      SectionIds.TIMELINE,
      SectionIds.INVESTMENT
    ],
    exemplarsBySection: {}
  },
  {
    id: ServiceIds.EIGHT_TWO_EIGHT,
    label: '828 Marketing',
    summary: 'Ongoing content creation, campaign management, and monthly marketing execution.',
    lineItemDefaults: [
      {
        name: '828 Marketing Package',
        internalCode: '828_PKG',
        description: 'Monthly content, email campaigns, and ongoing marketing support to keep your system running.',
        billingType: BillingTypes.MONTHLY,
        unitLabel: 'month',
        baseAmount: 3000,
        isRetainer: true
      }
    ],
    affectsSections: [
      SectionIds.SCOPE,
      SectionIds.DELIVERABLES,
      SectionIds.TIMELINE,
      SectionIds.INVESTMENT
    ],
    exemplarsBySection: {}
  },
  {
    id: ServiceIds.FRACTIONAL_CMO,
    label: 'Fractional CMO + Agency Retainer',
    summary: 'Strategic marketing leadership plus ongoing agency support and execution.',
    lineItemDefaults: [
      {
        name: 'Fractional CMO',
        internalCode: 'FCMO',
        description: 'Strategic marketing leadership, planning, and team guidance.',
        billingType: BillingTypes.MONTHLY,
        unitLabel: 'month',
        baseAmount: 5000,
        isRetainer: true
      },
      {
        name: 'Agency Retainer',
        internalCode: 'AGENCY_RET',
        description: 'Ongoing marketing execution and campaign support.',
        billingType: BillingTypes.MONTHLY,
        unitLabel: 'month',
        baseAmount: 4000,
        isRetainer: true
      }
    ],
    affectsSections: [
      SectionIds.OVERVIEW,
      SectionIds.SCOPE,
      SectionIds.DELIVERABLES,
      SectionIds.TIMELINE,
      SectionIds.INVESTMENT
    ],
    exemplarsBySection: {}
  }
];

/**
 * Section Exemplars
 */
export const sectionExemplars = [
  {
    sectionId: SectionIds.OVERVIEW,
    serviceId: ServiceIds.MARKETING_MACHINE,
    title: 'Comments from Kathryn',
    fn: 'Introduce context and explain how the Marketing Machine creates a foundation.',
    excerpt: 'The Marketing Machine is here to give you a consistent, sustainable way to generate and nurture demand. Instead of one-off campaigns, you get a repeatable system that ties website, content, and email together so your team always knows what to do next.'
  },
  {
    sectionId: SectionIds.INVESTMENT,
    serviceId: undefined,
    title: 'Products & Services',
    fn: 'Show a mix of one-time and monthly services with simple descriptions.',
    excerpt: '- **Marketing Machine Setup – One-time**\n  Establish foundational strategy, messaging, and funnels.\n- **SEO & Technical Setup – One-time**\n  Implement baseline on-site SEO, analytics, and hosting configuration.\n- **828 Marketing – Monthly**\n  Ongoing content, campaigns, and reporting to keep the system running.'
  },
  {
    sectionId: SectionIds.SCOPE,
    serviceId: ServiceIds.MARKETING_MACHINE,
    title: 'Scope of Work',
    fn: 'Explain the work involved in setting up the Marketing Machine.',
    excerpt: 'We will build your core marketing infrastructure:\n- Define your ideal customer and create buyer personas\n- Develop messaging framework and value propositions\n- Design email automation sequences\n- Create content templates and editorial calendar structure'
  },
  {
    sectionId: SectionIds.DELIVERABLES,
    serviceId: ServiceIds.MARKETING_MACHINE,
    title: 'Deliverables',
    fn: 'List specific deliverables for the Marketing Machine.',
    excerpt: '- Messaging framework document\n- 3-5 buyer personas\n- Email automation flows (mapped and built)\n- Content calendar template\n- Campaign playbook'
  }
];
