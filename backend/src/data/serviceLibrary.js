/**
 * Service Library
 *
 * Structured service definitions for JSON-first proposal assembly.
 * Each service has pre-written content that is deterministically inserted.
 *
 * Services are stored with:
 * - displayNameCaps: ALL CAPS display name
 * - subsections[]: Numbered subsections with markdown content
 * - investment: Structured pricing information
 * - timeline: Timeline description
 * - outcome: Expected outcome statement
 */

export const SERVICE_LIBRARY_VERSION = '2.0.0';

/**
 * Service library keyed by service ID
 * @type {Object.<string, import('../models/proposalSchema.js').ServiceBlock>}
 */
export const serviceLibrary = {
  marketing_machine: {
    serviceKey: 'marketing_machine',
    displayNameCaps: 'THE MARKETING MACHINE',
    subsections: [
      {
        number: 1,
        title: 'Discovery & Research',
        bodyMarkdown: `- Stakeholder interviews to understand your business goals and challenges
- Competitive landscape analysis to identify positioning opportunities
- Customer research to validate assumptions about your target market
- Market analysis to understand trends and opportunities`,
        allowClientSpecificEdits: false
      },
      {
        number: 2,
        title: 'Who You Are (Brand Foundation)',
        bodyMarkdown: `- Brand positioning framework that differentiates you from competitors
- Core values and brand attributes that guide all communications
- Brand personality and tone of voice guidelines
- Elevator pitch and messaging hierarchy`,
        allowClientSpecificEdits: false
      },
      {
        number: 3,
        title: 'Who You Help (Audience Definition)',
        bodyMarkdown: `- Ideal Customer Profile (ICP) definition with demographics and psychographics
- Customer journey mapping from awareness to advocacy
- Pain points, goals, and motivations analysis
- Decision-making criteria and buying process documentation`,
        allowClientSpecificEdits: false
      },
      {
        number: 4,
        title: 'How You Help (Value Proposition)',
        bodyMarkdown: `- Unique value proposition that resonates with your target audience
- Service/product positioning and messaging architecture
- Proof points and credibility builders
- Objection handling and competitive differentiation`,
        allowClientSpecificEdits: false
      },
      {
        number: 5,
        title: 'How You Tell the World (Marketing Strategy)',
        bodyMarkdown: `- Marketing funnel architecture (awareness, consideration, decision, retention)
- Channel strategy and prioritization based on your audience
- Content strategy and editorial calendar framework
- Lead generation and nurture sequence blueprints
- Campaign frameworks and messaging templates`,
        allowClientSpecificEdits: false
      },
      {
        number: 6,
        title: 'Making Sure It Works (Measurement)',
        bodyMarkdown: `- KPI framework aligned to business goals
- Analytics and tracking implementation plan
- Reporting dashboard design and metrics definition
- Testing and optimization roadmap`,
        allowClientSpecificEdits: false
      },
      {
        number: 7,
        title: 'Implementation & Tools',
        bodyMarkdown: `- Marketing playbook with all frameworks and templates
- Brand guidelines and messaging library
- Marketing technology stack recommendations
- 90-day implementation roadmap with priorities`,
        allowClientSpecificEdits: false
      }
    ],
    investment: {
      model: 'one_time',
      amount: 7500,
      currency: 'USD',
      notes: 'Payment terms: 50% due at contract signing, 50% due upon completion of strategic deliverables.',
      renderHint: '$7,500 one-time investment'
    },
    timeline: 'Typically completed over 6-8 weeks with regular check-ins and feedback sessions.',
    outcome: 'You will have a complete marketing foundation that guides all decisions, eliminates guesswork, and ensures every marketing dollar is spent strategically.',
    enabled: true
  },

  internal_comms: {
    serviceKey: 'internal_comms',
    displayNameCaps: 'INTERNAL COMMUNICATIONS',
    subsections: [
      {
        number: 1,
        title: 'Communication Audit',
        bodyMarkdown: `- Employee survey to assess current communication effectiveness
- Leadership interview to understand goals and challenges
- Communication channel inventory and usage analysis
- Gap analysis between current and desired state`,
        allowClientSpecificEdits: false
      },
      {
        number: 2,
        title: 'Internal Communications Strategy',
        bodyMarkdown: `- Communication objectives aligned to business goals
- Audience segmentation (departments, roles, locations)
- Channel strategy and hierarchy (when to use what)
- Message architecture and key themes`,
        allowClientSpecificEdits: false
      },
      {
        number: 3,
        title: 'System Design & Implementation',
        bodyMarkdown: `- Communication calendar and cadence recommendations
- Email templates and newsletter formats
- Meeting rhythm and agenda templates
- Internal communications playbook with guidelines and best practices`,
        allowClientSpecificEdits: false
      }
    ],
    investment: {
      model: 'one_time',
      amount: 2500,
      currency: 'USD',
      notes: 'Payment due upon completion.',
      renderHint: '$2,500 one-time investment'
    },
    timeline: 'Typically completed over 4-6 weeks.',
    outcome: 'Your team will have clear, consistent communication channels that keep everyone aligned and engaged.',
    enabled: true
  },

  seo_hosting: {
    serviceKey: 'seo_hosting',
    displayNameCaps: 'SEO & HOSTING',
    subsections: [
      {
        number: 1,
        title: 'Technical SEO Audit',
        bodyMarkdown: `- Site architecture and crawlability analysis
- Page speed and Core Web Vitals assessment
- Mobile responsiveness and usability review
- Broken links, redirects, and error identification
- XML sitemap and robots.txt optimization`,
        allowClientSpecificEdits: false
      },
      {
        number: 2,
        title: 'On-Page SEO Optimization',
        bodyMarkdown: `- Keyword research and mapping to pages
- Title tags and meta descriptions optimization
- Header tag structure and hierarchy improvement
- Schema markup implementation for rich snippets
- Image optimization (alt tags, compression, lazy loading)
- Internal linking strategy and implementation`,
        allowClientSpecificEdits: false
      },
      {
        number: 3,
        title: 'Managed WordPress Hosting',
        bodyMarkdown: `- Premium hosting setup on optimized servers
- SSL certificate installation and HTTPS configuration
- Automatic daily backups with 30-day retention
- Security monitoring and malware protection
- WordPress core and plugin updates management
- Uptime monitoring and performance optimization`,
        allowClientSpecificEdits: false
      },
      {
        number: 4,
        title: 'Local SEO (if applicable)',
        bodyMarkdown: `- Google Business Profile optimization
- Local citation building and NAP consistency
- Location-based keyword targeting`,
        allowClientSpecificEdits: true
      }
    ],
    investment: {
      model: 'one_time',
      amount: 3500,
      currency: 'USD',
      notes: 'Managed hosting included for first 12 months; $50/month thereafter.',
      renderHint: '$3,500 one-time investment (includes 12 months hosting)'
    },
    timeline: 'SEO audit and optimization completed within 2-3 weeks. Hosting is ongoing with immediate setup.',
    outcome: 'Your website will be technically sound, load quickly, rank better in search results, and run reliably with minimal downtime.',
    enabled: true
  },

  digital_upgrades: {
    serviceKey: 'digital_upgrades',
    displayNameCaps: 'DIGITAL UPGRADES',
    subsections: [
      {
        number: 1,
        title: 'Website & UX Audit',
        bodyMarkdown: `- Heuristic evaluation of user experience and usability
- Conversion funnel analysis and drop-off identification
- Mobile experience and responsive design review
- Content audit and information architecture assessment
- Accessibility compliance review (WCAG guidelines)`,
        allowClientSpecificEdits: false
      },
      {
        number: 2,
        title: 'CRM & Marketing Automation',
        bodyMarkdown: `- CRM selection and implementation (if needed)
- Contact management and segmentation setup
- Form integration and lead capture optimization
- Email marketing platform integration
- Marketing automation workflow design and setup`,
        allowClientSpecificEdits: true
      },
      {
        number: 3,
        title: 'Custom Development & Enhancements',
        bodyMarkdown: `- Custom functionality based on your specific needs
- Third-party API integrations (payment, shipping, etc.)
- Advanced form builders and calculators
- Member portals or customer dashboards
- E-commerce enhancements (if applicable)`,
        allowClientSpecificEdits: true
      },
      {
        number: 4,
        title: 'Optimization & Testing',
        bodyMarkdown: `- A/B testing setup for key conversion points
- Analytics implementation and goal tracking
- Heat mapping and user behavior analysis
- Performance optimization and speed improvements`,
        allowClientSpecificEdits: false
      }
    ],
    investment: {
      model: 'one_time',
      amount: 5000,
      currency: 'USD',
      notes: 'Starting price - final pricing determined after discovery phase. Payment terms: 50% upfront, 50% upon completion.',
      renderHint: 'Starting at $5,000 (scope-dependent)'
    },
    timeline: 'Varies based on scope - typically 4-8 weeks depending on complexity.',
    outcome: 'Your digital presence will be a powerful business asset that generates leads, converts visitors, and integrates seamlessly with your operations.',
    enabled: true
  },

  '828_marketing': {
    serviceKey: '828_marketing',
    displayNameCaps: 'THE 828 MARKETING PLAN',
    subsections: [
      {
        number: 1,
        title: 'Content Marketing',
        bodyMarkdown: `- 4-6 blog posts or articles per month (800-1200 words each)
- SEO optimization for all content (keywords, meta tags, internal linking)
- Content strategy aligned to your marketing funnel
- Topic ideation based on audience needs and search trends
- Editorial calendar management and publishing`,
        allowClientSpecificEdits: false
      },
      {
        number: 2,
        title: 'Email Marketing',
        bodyMarkdown: `- 2-4 email campaigns per month (newsletters, promotions, nurture)
- Email design and copywriting optimized for engagement
- List segmentation and personalization
- A/B testing for subject lines and content
- Performance tracking and optimization`,
        allowClientSpecificEdits: false
      },
      {
        number: 3,
        title: 'Social Media Management',
        bodyMarkdown: `- Content creation and scheduling for 2-3 platforms
- Post copywriting and design/graphics
- Community engagement and monitoring
- Social media calendar aligned with campaigns`,
        allowClientSpecificEdits: true
      },
      {
        number: 4,
        title: 'Campaign Management',
        bodyMarkdown: `- Quarterly campaign planning and execution
- Landing page copywriting and optimization
- Campaign asset creation (graphics, emails, ads)
- Cross-channel coordination`,
        allowClientSpecificEdits: false
      },
      {
        number: 5,
        title: 'Reporting & Optimization',
        bodyMarkdown: `- Monthly performance report with key metrics
- Analytics review and insights
- Quarterly strategy review and planning session
- Ongoing optimization based on data`,
        allowClientSpecificEdits: false
      }
    ],
    investment: {
      model: 'monthly',
      amount: 3000,
      currency: 'USD',
      notes: '3-month minimum commitment. First month due at contract signing.',
      renderHint: '$3,000/month retainer'
    },
    timeline: 'Ongoing monthly retainer. Content delivered throughout the month per editorial calendar.',
    outcome: 'Consistent, strategic marketing that keeps you visible, generates leads, and nurtures relationships - all without you lifting a finger.',
    enabled: true
  },

  fractional_cmo: {
    serviceKey: 'fractional_cmo',
    displayNameCaps: 'FRACTIONAL CMO',
    subsections: [
      {
        number: 1,
        title: 'Strategic Planning & Leadership',
        bodyMarkdown: `- Marketing strategy development and roadmap planning
- Budget planning and resource allocation guidance
- Goal setting and KPI definition aligned to business objectives
- Quarterly and annual planning sessions
- Executive-level strategic counsel and decision-making support`,
        allowClientSpecificEdits: false
      },
      {
        number: 2,
        title: 'Team Management & Development',
        bodyMarkdown: `- Marketing team leadership and coordination
- Agency and vendor management and accountability
- Process development and workflow optimization
- Skills gap analysis and hiring recommendations
- Performance reviews and professional development`,
        allowClientSpecificEdits: false
      },
      {
        number: 3,
        title: 'Campaign Oversight & Optimization',
        bodyMarkdown: `- Marketing campaign strategy and oversight
- Channel mix optimization and budget allocation
- Creative direction and brand consistency enforcement
- Technology stack evaluation and recommendations
- Testing roadmap and conversion optimization`,
        allowClientSpecificEdits: false
      },
      {
        number: 4,
        title: 'Reporting & Accountability',
        bodyMarkdown: `- Monthly executive reporting with insights and recommendations
- Marketing dashboard design and KPI tracking
- ROI analysis and attribution modeling
- Board presentation support (if applicable)
- Competitive intelligence and market analysis`,
        allowClientSpecificEdits: false
      },
      {
        number: 5,
        title: 'Availability & Communication',
        bodyMarkdown: `- 8-10 hours per month of strategic work
- Weekly check-ins and ad-hoc availability via email/Slack
- Quarterly in-person or extended video strategy sessions
- Access to our full team for execution support`,
        allowClientSpecificEdits: true
      }
    ],
    investment: {
      model: 'monthly',
      amount: 5000,
      currency: 'USD',
      notes: '6-month minimum commitment. First month due at contract signing.',
      renderHint: '$5,000/month retainer (8-10 hours)'
    },
    timeline: 'Ongoing monthly engagement. Typically 6-12 month initial commitment.',
    outcome: 'You will have senior marketing leadership driving strategy, managing execution, and ensuring every marketing dollar delivers measurable results.',
    enabled: true
  }
};

/**
 * Get a service from the library by key
 * @param {string} serviceKey - Service identifier
 * @returns {import('../models/proposalSchema.js').ServiceBlock | null}
 */
export function getServiceFromLibrary(serviceKey) {
  const service = serviceLibrary[serviceKey];
  if (!service) return null;

  // Return a deep copy to prevent mutation
  return JSON.parse(JSON.stringify(service));
}

/**
 * Get all services from the library
 * @returns {import('../models/proposalSchema.js').ServiceBlock[]}
 */
export function getAllServices() {
  return Object.values(serviceLibrary).map(service =>
    JSON.parse(JSON.stringify(service))
  );
}

/**
 * Get service display names for a list of service keys
 * @param {string[]} serviceKeys - Array of service identifiers
 * @returns {string[]} Array of display names
 */
export function getServiceDisplayNames(serviceKeys) {
  return serviceKeys.map(key => {
    const service = serviceLibrary[key];
    return service?.displayNameCaps || key;
  });
}
