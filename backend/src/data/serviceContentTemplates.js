/**
 * Service Content Templates
 *
 * This file contains detailed content snippets for each service that will be
 * used in proposal generation. Edit these templates to customize how services
 * are presented in proposals.
 *
 * Each service has:
 * - detailedDescription: Full "What's Included" content with bullets
 * - investmentNarrative: How to describe pricing in Investment section
 * - quoteDescription: Short 1-2 sentence description for line items
 */

export const serviceContentTemplates = {
  marketing_machine: {
    serviceKey: 'marketing_machine',
    displayName: 'Marketing Machine',

    // Detailed description for "What's Included" section
    detailedDescription: {
      intro: "The Marketing Machine is a comprehensive strategic framework that creates clarity around who you are, who you help, and how to tell the world about it. This isn't just another marketing plan—it's a complete system of formulas and frameworks that guide every marketing decision.",

      deliverableGroups: [
        {
          groupTitle: "Discovery & Research",
          bullets: [
            "Stakeholder interviews to understand your business goals and challenges",
            "Competitive landscape analysis to identify positioning opportunities",
            "Customer research to validate assumptions about your target market",
            "Market analysis to understand trends and opportunities"
          ]
        },
        {
          groupTitle: "Who You Are (Brand Foundation)",
          bullets: [
            "Brand positioning framework that differentiates you from competitors",
            "Core values and brand attributes that guide all communications",
            "Brand personality and tone of voice guidelines",
            "Elevator pitch and messaging hierarchy"
          ]
        },
        {
          groupTitle: "Who You Help (Audience Definition)",
          bullets: [
            "Ideal Customer Profile (ICP) definition with demographics and psychographics",
            "Customer journey mapping from awareness to advocacy",
            "Pain points, goals, and motivations analysis",
            "Decision-making criteria and buying process documentation"
          ]
        },
        {
          groupTitle: "How You Help (Value Proposition)",
          bullets: [
            "Unique value proposition that resonates with your target audience",
            "Service/product positioning and messaging architecture",
            "Proof points and credibility builders",
            "Objection handling and competitive differentiation"
          ]
        },
        {
          groupTitle: "How You Tell the World (Marketing Strategy)",
          bullets: [
            "Marketing funnel architecture (awareness, consideration, decision, retention)",
            "Channel strategy and prioritization based on your audience",
            "Content strategy and editorial calendar framework",
            "Lead generation and nurture sequence blueprints",
            "Campaign frameworks and messaging templates"
          ]
        },
        {
          groupTitle: "Making Sure It Works (Measurement)",
          bullets: [
            "KPI framework aligned to business goals",
            "Analytics and tracking implementation plan",
            "Reporting dashboard design and metrics definition",
            "Testing and optimization roadmap"
          ]
        },
        {
          groupTitle: "Implementation & Tools",
          bullets: [
            "Marketing playbook with all frameworks and templates",
            "Brand guidelines and messaging library",
            "Marketing technology stack recommendations",
            "90-day implementation roadmap with priorities"
          ]
        }
      ],

      timeline: "Typically completed over 6-8 weeks with regular check-ins and feedback sessions.",

      outcome: "You'll have a complete marketing foundation that guides all decisions, eliminates guesswork, and ensures every marketing dollar is spent strategically."
    },

    // Investment section narrative
    investmentNarrative: {
      structure: "one_time",
      totalPrice: 7500,
      narrative: "**Marketing Machine:** $7,500 one-time investment. Payment terms: 50% due at contract signing, 50% due upon completion of strategic deliverables.",
      valueStatement: "This strategic foundation typically saves clients 20-30% in marketing costs by eliminating trial-and-error and ensuring focused execution."
    },

    // Short description for Products & Services line items (HighLevel quotes)
    quoteDescription: "Comprehensive marketing strategy framework including brand positioning, audience definition, value proposition, marketing funnel architecture, and implementation playbook. Creates the strategic foundation that guides all marketing decisions."
  },

  internal_comms: {
    serviceKey: 'internal_comms',
    displayName: 'Internal Communications',

    detailedDescription: {
      intro: "Strong internal communications are the foundation of employee engagement, productivity, and company culture. We'll audit your current state and design systems that keep your team informed, aligned, and motivated.",

      deliverableGroups: [
        {
          groupTitle: "Communication Audit",
          bullets: [
            "Employee survey to assess current communication effectiveness",
            "Leadership interview to understand goals and challenges",
            "Communication channel inventory and usage analysis",
            "Gap analysis between current and desired state"
          ]
        },
        {
          groupTitle: "Internal Communications Strategy",
          bullets: [
            "Communication objectives aligned to business goals",
            "Audience segmentation (departments, roles, locations)",
            "Channel strategy and hierarchy (when to use what)",
            "Message architecture and key themes"
          ]
        },
        {
          groupTitle: "System Design & Implementation",
          bullets: [
            "Communication calendar and cadence recommendations",
            "Email templates and newsletter formats",
            "Meeting rhythm and agenda templates",
            "Internal communications playbook with guidelines and best practices"
          ]
        }
      ],

      timeline: "Typically completed over 4-6 weeks.",

      outcome: "Your team will have clear, consistent communication channels that keep everyone aligned and engaged."
    },

    investmentNarrative: {
      structure: "one_time",
      totalPrice: 2500,
      narrative: "**Internal Communications:** $2,500 one-time investment for audit, strategy, and system design. Payment due upon completion.",
      valueStatement: "Effective internal communications improve employee retention and productivity—typically delivering 3-5x ROI within the first year."
    },

    quoteDescription: "Internal communication strategy including employee engagement audit, channel strategy design, and implementation playbook for keeping teams informed and aligned."
  },

  seo_hosting: {
    serviceKey: 'seo_hosting',
    displayName: 'SEO & Hosting',

    detailedDescription: {
      intro: "Your website needs to be found by the right people and perform flawlessly. We'll optimize your technical SEO foundation and provide managed hosting so you can focus on your business, not website maintenance.",

      deliverableGroups: [
        {
          groupTitle: "Technical SEO Audit",
          bullets: [
            "Site architecture and crawlability analysis",
            "Page speed and Core Web Vitals assessment",
            "Mobile responsiveness and usability review",
            "Broken links, redirects, and error identification",
            "XML sitemap and robots.txt optimization"
          ]
        },
        {
          groupTitle: "On-Page SEO Optimization",
          bullets: [
            "Keyword research and mapping to pages",
            "Title tags and meta descriptions optimization",
            "Header tag structure and hierarchy improvement",
            "Schema markup implementation for rich snippets",
            "Image optimization (alt tags, compression, lazy loading)",
            "Internal linking strategy and implementation"
          ]
        },
        {
          groupTitle: "Managed WordPress Hosting",
          bullets: [
            "Premium hosting setup on optimized servers",
            "SSL certificate installation and HTTPS configuration",
            "Automatic daily backups with 30-day retention",
            "Security monitoring and malware protection",
            "WordPress core and plugin updates management",
            "Uptime monitoring and performance optimization"
          ]
        },
        {
          groupTitle: "Local SEO (if applicable)",
          bullets: [
            "Google Business Profile optimization",
            "Local citation building and NAP consistency",
            "Location-based keyword targeting"
          ]
        }
      ],

      timeline: "SEO audit and optimization completed within 2-3 weeks. Hosting is ongoing with immediate setup.",

      outcome: "Your website will be technically sound, load quickly, rank better in search results, and run reliably with minimal downtime."
    },

    investmentNarrative: {
      structure: "one_time_plus_hosting",
      totalPrice: 3500,
      narrative: "**SEO & Hosting:** $3,500 one-time fee for technical SEO audit and optimization. Managed hosting included for first 12 months; $50/month thereafter.",
      valueStatement: "Technical SEO improvements typically result in 15-30% increase in organic search traffic within 3-6 months."
    },

    quoteDescription: "Technical SEO audit and optimization including keyword research, on-page improvements, schema markup, and 12 months of managed WordPress hosting with security and backups."
  },

  digital_upgrades: {
    serviceKey: 'digital_upgrades',
    displayName: 'Digital Upgrades',

    detailedDescription: {
      intro: "Your website and digital systems should work harder for your business. We'll identify opportunities to improve user experience, integrate your tools, and build custom functionality that drives results.",

      deliverableGroups: [
        {
          groupTitle: "Website & UX Audit",
          bullets: [
            "Heuristic evaluation of user experience and usability",
            "Conversion funnel analysis and drop-off identification",
            "Mobile experience and responsive design review",
            "Content audit and information architecture assessment",
            "Accessibility compliance review (WCAG guidelines)"
          ]
        },
        {
          groupTitle: "CRM & Marketing Automation",
          bullets: [
            "CRM selection and implementation (if needed)",
            "Contact management and segmentation setup",
            "Form integration and lead capture optimization",
            "Email marketing platform integration",
            "Marketing automation workflow design and setup"
          ]
        },
        {
          groupTitle: "Custom Development & Enhancements",
          bullets: [
            "Custom functionality based on your specific needs",
            "Third-party API integrations (payment, shipping, etc.)",
            "Advanced form builders and calculators",
            "Member portals or customer dashboards",
            "E-commerce enhancements (if applicable)"
          ]
        },
        {
          groupTitle: "Optimization & Testing",
          bullets: [
            "A/B testing setup for key conversion points",
            "Analytics implementation and goal tracking",
            "Heat mapping and user behavior analysis",
            "Performance optimization and speed improvements"
          ]
        }
      ],

      timeline: "Varies based on scope—typically 4-8 weeks depending on complexity.",

      outcome: "Your digital presence will be a powerful business asset that generates leads, converts visitors, and integrates seamlessly with your operations."
    },

    investmentNarrative: {
      structure: "one_time_variable",
      totalPrice: 5000,
      narrative: "**Digital Upgrades:** Starting at $5,000 depending on scope. Final pricing determined after discovery phase. Payment terms: 50% upfront, 50% upon completion.",
      valueStatement: "Strategic digital improvements typically increase conversion rates by 25-50%, delivering measurable ROI within the first quarter."
    },

    quoteDescription: "Website improvements, CRM integration, and custom development to enhance user experience, integrate systems, and build functionality that drives business results."
  },

  '828_marketing': {
    serviceKey: '828_marketing',
    displayName: '828 Marketing Plan',

    detailedDescription: {
      intro: "The 828 Marketing Plan is our ongoing content marketing and execution service. Every month, we create content, manage campaigns, and keep your marketing engine running so you can focus on your core business.",

      deliverableGroups: [
        {
          groupTitle: "Content Marketing",
          bullets: [
            "4-6 blog posts or articles per month (800-1200 words each)",
            "SEO optimization for all content (keywords, meta tags, internal linking)",
            "Content strategy aligned to your marketing funnel",
            "Topic ideation based on audience needs and search trends",
            "Editorial calendar management and publishing"
          ]
        },
        {
          groupTitle: "Email Marketing",
          bullets: [
            "2-4 email campaigns per month (newsletters, promotions, nurture)",
            "Email design and copywriting optimized for engagement",
            "List segmentation and personalization",
            "A/B testing for subject lines and content",
            "Performance tracking and optimization"
          ]
        },
        {
          groupTitle: "Social Media Management",
          bullets: [
            "Content creation and scheduling for 2-3 platforms",
            "Post copywriting and design/graphics",
            "Community engagement and monitoring",
            "Social media calendar aligned with campaigns"
          ]
        },
        {
          groupTitle: "Campaign Management",
          bullets: [
            "Quarterly campaign planning and execution",
            "Landing page copywriting and optimization",
            "Campaign asset creation (graphics, emails, ads)",
            "Cross-channel coordination"
          ]
        },
        {
          groupTitle: "Reporting & Optimization",
          bullets: [
            "Monthly performance report with key metrics",
            "Analytics review and insights",
            "Quarterly strategy review and planning session",
            "Ongoing optimization based on data"
          ]
        }
      ],

      timeline: "Ongoing monthly retainer. Content delivered throughout the month per editorial calendar.",

      outcome: "Consistent, strategic marketing that keeps you visible, generates leads, and nurtures relationships—all without you lifting a finger."
    },

    investmentNarrative: {
      structure: "monthly_retainer",
      monthlyPrice: 3000,
      narrative: "**828 Marketing Plan:** $3,000/month retainer. Includes all content creation, email campaigns, social media, and campaign management. 3-month minimum commitment. First month due at contract signing.",
      valueStatement: "Clients typically see 3-5 qualified leads per month and 20-30% increase in website traffic within the first quarter."
    },

    quoteDescription: "Monthly content marketing retainer including 4-6 blog posts, 2-4 email campaigns, social media management, and ongoing campaign execution with monthly reporting."
  },

  fractional_cmo: {
    serviceKey: 'fractional_cmo',
    displayName: 'Fractional CMO',

    detailedDescription: {
      intro: "Get strategic marketing leadership without the cost of a full-time executive. Our Fractional CMO service provides senior-level marketing expertise, team guidance, and strategic oversight to drive growth.",

      deliverableGroups: [
        {
          groupTitle: "Strategic Planning & Leadership",
          bullets: [
            "Marketing strategy development and roadmap planning",
            "Budget planning and resource allocation guidance",
            "Goal setting and KPI definition aligned to business objectives",
            "Quarterly and annual planning sessions",
            "Executive-level strategic counsel and decision-making support"
          ]
        },
        {
          groupTitle: "Team Management & Development",
          bullets: [
            "Marketing team leadership and coordination",
            "Agency and vendor management and accountability",
            "Process development and workflow optimization",
            "Skills gap analysis and hiring recommendations",
            "Performance reviews and professional development"
          ]
        },
        {
          groupTitle: "Campaign Oversight & Optimization",
          bullets: [
            "Marketing campaign strategy and oversight",
            "Channel mix optimization and budget allocation",
            "Creative direction and brand consistency enforcement",
            "Technology stack evaluation and recommendations",
            "Testing roadmap and conversion optimization"
          ]
        },
        {
          groupTitle: "Reporting & Accountability",
          bullets: [
            "Monthly executive reporting with insights and recommendations",
            "Marketing dashboard design and KPI tracking",
            "ROI analysis and attribution modeling",
            "Board presentation support (if applicable)",
            "Competitive intelligence and market analysis"
          ]
        },
        {
          groupTitle: "Availability & Communication",
          bullets: [
            "8-10 hours per month of strategic work",
            "Weekly check-ins and ad-hoc availability via email/Slack",
            "Quarterly in-person or extended video strategy sessions",
            "Access to our full team for execution support"
          ]
        }
      ],

      timeline: "Ongoing monthly engagement. Typically 6-12 month initial commitment.",

      outcome: "You'll have senior marketing leadership driving strategy, managing execution, and ensuring every marketing dollar delivers measurable results."
    },

    investmentNarrative: {
      structure: "monthly_retainer",
      monthlyPrice: 5000,
      narrative: "**Fractional CMO:** $5,000/month retainer for 8-10 hours of strategic work. 6-month minimum commitment. First month due at contract signing.",
      valueStatement: "Fractional CMO service delivers executive-level expertise at 30-40% the cost of a full-time CMO, with immediate impact on marketing effectiveness and ROI."
    },

    quoteDescription: "Strategic marketing leadership and team guidance including marketing strategy, budget planning, team management, campaign oversight, and monthly executive reporting (8-10 hours/month)."
  }
};

/**
 * Helper function to get service content template by service key
 */
export function getServiceTemplate(serviceKey) {
  return serviceContentTemplates[serviceKey] || null;
}

/**
 * Helper function to get all service templates
 */
export function getAllServiceTemplates() {
  return Object.values(serviceContentTemplates);
}
