/**
 * Unified Proposal Generation Prompt Configuration
 *
 * This replaces the section-by-section approach with a single unified generation
 * that produces the entire proposal body + service line items in one pass.
 */

/**
 * System prompt that defines the AI's role, tone, and output format
 */
export const SYSTEM_PROMPT = `You are the proposal writer for a marketing agency called Good Circle Marketing.

Goal:
Given structured information about a client, their challenges, and selected service packages, you write:

1. A clear, friendly, client-facing proposal body with consistent sections.
2. Short, one-line descriptions for each service package to use as line items in a quote.

Tone and style:

- Professional but warm, conversational, and confident.
- Avoid marketing buzzword soup; use concrete, plain language.
- Focus on clarity, outcomes, and what will actually be done.
- Write as "we" (the agency) speaking directly to "you" (the client).
- Use short paragraphs and bulleted lists for readability.
- Match the style of these existing proposals:
  - "Good Start Minimal" proposal with Objective, Included Deliverables, Timeline, and Investment.
  - "Marketing Machine" proposal that uses numbered sections like Meetings, Research and Analysis, Who You Are, Who You Help, How You Help, How You Tell the World, Making Sure It Works, and Next Steps and Tools.
  - "828" and "Marketing Machine + 828 Plan" proposals that include Primary Challenges, Our Solution, Key Objectives, What's Included, Investment, and Next Steps.

Output format:

- Always return valid JSON (no backticks, no markdown code fences) with this top-level shape:

{
  "proposal_body_markdown": "string",
  "services": [
    {
      "service_key": "string",
      "display_name": "string",
      "short_quote_description": "string"
    }
  ]
}

Where:

- proposal_body_markdown is a markdown-formatted proposal body with headings in this exact order:

  1. "# Proposal Overview"
  2. "## Primary Challenges" (omit this section entirely if no challenges are provided)
  3. "## Our Recommended Plan"
  4. "## Key Objectives"
  5. "## What's Included"
     - Inside this section, use "### [Service Name]" sub-headings for each selected service.
     - For each service, follow this EXACT structure:
       a) Start with the intro_text paragraph (if provided) - use it VERBATIM or with minor client-specific adjustments
       b) For each deliverable_group:
          - Write the group_title as a **bold heading** like: **Discovery & Research**
          - List all bullets from that group as a bulleted list
          - Keep the bullets as written in the template—do NOT summarize or shorten them
       c) End with the outcome statement (if provided) as a closing paragraph
     - DO NOT invent or add deliverables not in the template
     - DO NOT summarize or condense the provided content
  6. "## Timeline" (omit if no timeline or dates are provided)
  7. "## Investment"
     - For each selected service, use the investment_plain_text field EXACTLY as written
     - Add the value_statement (if provided) as supporting context
     - Group logically: list all one-time services together, then monthly/retainer services
     - Include any payment terms mentioned in the investment_plain_text
     - DO NOT invent prices, terms, or modify the provided pricing text
     - Keep the tone and structure of the investment_plain_text as written
  8. "## Products & Services"
     - Create an itemized list of all line items from the selected services
     - For each service, list its line items with format: "**[Label]** - [Description] - $[Price]"
     - Group by service if helpful, or list all items together
     - This is the section that will be copied into the quote/contract system
     - Include all pricing details from the lineItemDefaults
  9. "## Next Steps"
     - Format the next steps as an indented bulleted list (use proper markdown list syntax with "- " prefix)
     - Each step should be on its own line, properly indented under the heading
  10. A warm, personalized closing paragraph (NO heading) that:
     - Thanks the client by name for their time and consideration
     - Expresses enthusiasm about the potential partnership
     - Offers to answer any questions
     - Signs off with "The Good Circle Marketing Team" or similar

- services is an array with one object for each selected package.

Rules:

- Do not invent pricing, dates, or payment terms; only restate or format what is provided in the input.
- If some fields are missing (e.g., no timeline), just omit that section instead of guessing.
- If you are given raw notes or a transcript, convert them into clean, client-ready language.
- Keep "short_quote_description" under 2 sentences, suitable for a quote line item.
- CRITICAL: When service template content is provided (intro_text, deliverable_groups, outcome, investment_plain_text), use it DIRECTLY in the proposal. Do not paraphrase, summarize, or rewrite it unless adapting for client-specific details.
- The deliverable_groups contain professionally written content that should be preserved exactly as written.`;

/**
 * Build the user prompt from structured client and proposal data
 * @param {Object} params - Prompt parameters
 * @param {Object} params.clientBrief - Client brief with contact info, challenges, goals
 * @param {Array} params.selectedServices - Array of service configurations with deliverables
 * @param {Object} params.proposalMetadata - Title, timeline, investment summary
 * @returns {string} Formatted user prompt
 */
export function buildUserPrompt({
  clientBrief,
  selectedServices,
  proposalMetadata = {}
}) {
  const {
    clientName = '',
    clientOrganization = '',
    industry = '',
    location = '',
    contactName = '',
    contactTitle = '',
    challenges = [],
    goals = [],
    businessName = ''
  } = clientBrief;

  const {
    proposalTitle = 'Marketing Proposal',
    highLevelObjective = '',
    investmentSummary = '',
    nextSteps = '',
    timeline = ''
  } = proposalMetadata;

  // Format challenges as bullet points
  const challengesNotes = Array.isArray(challenges) && challenges.length > 0
    ? challenges.map(c => `- ${c}`).join('\n')
    : '';

  // Format goals as bullet points
  const goalsNotes = Array.isArray(goals) && goals.length > 0
    ? goals.map(g => `- ${g}`).join('\n')
    : '';

  // Format selected services as JSON
  const selectedServicesJson = JSON.stringify(selectedServices, null, 2);

  return `Write a marketing proposal based on the following structured data and notes.

[AGENCY CONTEXT]
Agency name: Good Circle Marketing
Primary frameworks / packages:

- Marketing Machine: a comprehensive strategy / framework engagement.
- 828 Plan: a monthly content marketing retainer.
- Good Start Minimal: a foundational brand + website package.
- Digital Upgrades: website improvements and enhancements.
- Internal Communications: employee engagement and internal marketing.
- Fractional CMO: ongoing strategic marketing leadership.

[CLIENT INFO]
Client name: ${contactName || clientName}
Client organization: ${clientOrganization || businessName}
Client industry: ${industry || 'Not specified'}
Client location: ${location || 'Not specified'}
Key contact person: ${contactName}${contactTitle ? ` (${contactTitle})` : ''}

[PROJECT SUMMARY]
Internal working title for this proposal: ${proposalTitle}
High-level objective (1–3 sentences): ${highLevelObjective || 'Create a comprehensive marketing strategy and execution plan.'}

[CHALLENGES]
List of known challenges or pain points (bullet-style notes; rewrite these cleanly for the client):
${challengesNotes || 'Not specified'}

[GOALS]
Client's goals / desired outcomes:
${goalsNotes || 'Not specified'}

[SELECTED SERVICES]
Below is a JSON array describing which services are included and any relevant configuration.

IMPORTANT: Each service object contains detailed template content that you MUST use directly:
- intro_text: Opening paragraph for the service (use verbatim)
- deliverable_groups: Array of delivery categories with bullets (include ALL of them)
- outcome: Closing benefit statement (use verbatim)
- investment_plain_text: Exact pricing narrative to use in Investment section
- value_statement: ROI context to include with pricing
- line_items: Array of itemized products/services with label, description, and price (use in Products & Services section)

DO NOT summarize or rewrite this content—use it as provided.

${selectedServicesJson}

[INVESTMENT SUMMARY]
On the proposal / quote, we plan to show pricing as:
${investmentSummary || 'Pricing will be detailed in the Products & Services section.'}

[NEXT STEPS]
Outline any desired next steps or deadlines (the model should phrase these clearly):
${nextSteps || '1. Review and sign the proposal\n2. Submit initial payment\n3. Schedule kickoff meeting\n4. Begin work'}

[COPY REQUIREMENTS]

- Do NOT change prices or dates.
- Rewrite the notes into polished, client-facing language.
- Use the exact section headings and JSON format described in the system prompt.
- For each service in selected_services_json, create one matching entry in the "services" array with:
  - service_key (copy from input),
  - display_name (copy from input),
  - short_quote_description (use the suggested_quote_description if provided, or create your own 1–2 sentence description).`;
}

/**
 * Helper to format service modules into the structure expected by the prompt
 * @param {Array} serviceModules - Service module documents from Firebase
 * @param {Object} clientBrief - Client brief for variable interpolation
 * @returns {Array} Formatted service configurations
 */
export function formatServicesForPrompt(serviceModules, clientBrief = {}) {
  return serviceModules.map(service => {
    const config = {
      service_key: service.id,
      display_name: service.label,
      type: service.billingType === 'monthly' ? 'retainer' : 'fixed_scope',
      headline_objective: service.summary || '',
      deliverable_groups: []
    };

    // Use detailed content template if available
    if (service.contentTemplate && service.contentTemplate.detailedDescription) {
      const template = service.contentTemplate.detailedDescription;

      // Add intro text if available
      if (template.intro) {
        config.intro_text = template.intro;
      }

      // Use detailed deliverable groups from template
      if (template.deliverableGroups && Array.isArray(template.deliverableGroups)) {
        config.deliverable_groups = template.deliverableGroups.map(group => ({
          group_title: group.groupTitle,
          bullets: group.bullets
        }));
      }

      // Add timeline from template
      if (template.timeline) {
        config.timeline_description = template.timeline;
      }

      // Add outcome/benefit statement
      if (template.outcome) {
        config.outcome = template.outcome;
      }
    } else {
      // Fallback: Convert lineItemDefaults to deliverable_groups format
      if (service.lineItemDefaults && Array.isArray(service.lineItemDefaults)) {
        config.deliverable_groups = [{
          group_title: 'Included Services',
          bullets: service.lineItemDefaults.map(item => {
            return `${item.label}: ${item.description}`;
          })
        }];
      }
    }

    // Use investment narrative from template if available
    if (service.contentTemplate && service.contentTemplate.investmentNarrative) {
      const inv = service.contentTemplate.investmentNarrative;
      config.investment_plain_text = inv.narrative;
      if (inv.valueStatement) {
        config.value_statement = inv.valueStatement;
      }
    } else {
      // Fallback: Calculate total pricing from line items
      if (service.lineItemDefaults && Array.isArray(service.lineItemDefaults)) {
        const totalPrice = service.lineItemDefaults.reduce((sum, item) => sum + (item.price || 0), 0);

        if (service.billingType === 'monthly') {
          config.investment_plain_text = `$${totalPrice}/month retainer`;
        } else {
          config.investment_plain_text = `One-time investment: $${totalPrice.toLocaleString()}`;
        }
      }
    }

    // Add suggested quote description from template (AI can refine or use as-is)
    if (service.contentTemplate && service.contentTemplate.quoteDescription) {
      config.suggested_quote_description = service.contentTemplate.quoteDescription;
    }

    // Include line items for Products & Services section
    if (service.lineItemDefaults && Array.isArray(service.lineItemDefaults)) {
      config.line_items = service.lineItemDefaults.map(item => ({
        label: item.label,
        description: item.description,
        price: item.price
      }));
    }

    return config;
  });
}
