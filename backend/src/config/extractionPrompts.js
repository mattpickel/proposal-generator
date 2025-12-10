/**
 * AI Prompts for Data Extraction
 *
 * Prompts for extracting structured data from transcripts and documents
 */

/**
 * Extract ClientBrief from Fireflies transcript
 */
export const buildClientBriefPrompt = (transcriptText) => {
  return `You are a consultant summarizing a sales/discovery call for a marketing agency (Good Circle Marketing).

Extract the following information from the transcript and return ONLY valid JSON matching this exact schema:

{
  "clientName": "string (company name)",
  "industry": "string or null",
  "size": "string (e.g., '10-50 employees', 'Enterprise', 'Startup') or null",
  "location": "string or null",
  "stakeholders": [
    {
      "name": "string",
      "role": "string or null",
      "primaryConcerns": ["string array of their main concerns"]
    }
  ],
  "goals": ["string array of client's stated goals and objectives"],
  "painPoints": ["string array of problems and challenges mentioned"],
  "constraints": ["string array of budget, timing, or other constraints"],
  "opportunities": ["string array of opportunities identified during the call"],
  "servicesNeeded": ["string array - pick from: 'marketing_machine', 'internal_comms', 'seo_hosting', 'digital_upgrades', '828_marketing', 'fractional_cmo'"],
  "tonePreferences": ["string array of any preferences about communication style, formality, etc."],
  "notesForCopy": "string - any specific phrases, quotes, or messaging to include in the proposal"
}

TRANSCRIPT:
${transcriptText}

IMPORTANT:
- Return ONLY valid JSON, no markdown code blocks or explanations
- Use null for missing fields, never omit required fields
- Extract actual names and details from the transcript
- For servicesNeeded, infer which services align with their needs:
  - marketing_machine: if they need strategy, messaging, funnel setup
  - internal_comms: if they mention internal communication challenges
  - seo_hosting: if they mention SEO, website technical issues, hosting
  - digital_upgrades: if they need CRM, website improvements, integrations
  - 828_marketing: if they need ongoing content, email campaigns, monthly support
  - fractional_cmo: if they need strategic leadership, planning, team guidance
- Include direct quotes in notesForCopy that would make the proposal more personal

JSON:`;
};

/**
 * Extract summary from supporting document
 */
export const buildDocumentSummaryPrompt = (documentText, documentType) => {
  return `You are analyzing a supporting document for a marketing proposal.

Extract key information that would be relevant when writing a personalized proposal.

DOCUMENT TYPE: ${documentType}
DOCUMENT CONTENT:
${documentText}

Return ONLY valid JSON with this schema:

{
  "keyPoints": ["string array of 5-10 most important points"],
  "brandVoice": "string describing tone/voice if identifiable, or null",
  "targetAudience": "string describing who they serve, or null",
  "uniqueValue": "string describing what makes them unique, or null",
  "relevantContext": ["string array of other notable details for the proposal"]
}

Focus on:
- Brand personality and values
- Target customer/market insights
- Specific products or services they offer
- Competitive positioning
- Any messaging or language patterns to mirror

Return ONLY valid JSON, no markdown or explanations.

JSON:`;
};

/**
 * Suggest services based on ClientBrief
 */
export const buildServiceSuggestionPrompt = (clientBrief) => {
  return `Based on this client brief, which services should we recommend?

CLIENT BRIEF:
${JSON.stringify(clientBrief, null, 2)}

AVAILABLE SERVICES:
- marketing_machine: Strategy foundation, messaging, funnels (one-time ~$7,500)
- internal_comms: Internal communication systems (one-time ~$2,500)
- seo_hosting: SEO optimization and technical setup (one-time ~$3,500)
- digital_upgrades: Website improvements, CRM integration (one-time ~$5,000)
- 828_marketing: Ongoing monthly content and campaigns (monthly ~$3,000)
- fractional_cmo: Strategic leadership and guidance (monthly ~$5,000)

Return ONLY valid JSON:
{
  "recommendedServices": ["array of service IDs"],
  "reasoning": {
    "service_id": "why this service fits their needs"
  },
  "priority": {
    "high": ["services they definitely need"],
    "medium": ["nice to have"],
    "low": ["optional"]
  }
}

Consider their goals, pain points, and constraints. Don't over-sell.

JSON:`;
};
