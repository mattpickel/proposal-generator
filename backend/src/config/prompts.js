/**
 * AI Prompts Configuration
 *
 * This file contains all AI prompts used in the application.
 * Prompts are organized by their purpose and can be easily edited and tested.
 */

/**
 * Distillation prompts - used to condense large content into focused summaries
 */
export const distillationPrompts = {
  /**
   * Analyzes Fireflies call transcripts and extracts key client information
   */
  fireflies: (content) => `Analyze this discovery call transcript and extract the key information in a concise summary (max 500 words):

- Client's business and industry
- Main challenges and pain points discussed
- Goals and objectives mentioned
- Budget or timeline discussed
- Any specific requirements or preferences
- Key quotes that reveal client needs

Transcript:
${content}

Provide a structured summary:`,

  /**
   * Analyzes example proposals to extract writing style and structure
   */
  examples: (content) => `Analyze these proposal examples and extract the key elements of our proposal writing style (max 400 words):

${content}

Extract:
- Tone and voice (formal/casual, technical level)
- Structure and section organization
- How we present value propositions
- How we handle pricing/packages
- Key phrases or terminology we use
- Overall approach and methodology

Provide a concise style guide:`,

  /**
   * Analyzes supporting documents for relevant business context
   */
  supporting: (content) => `Analyze these supporting documents and extract key information relevant to creating a marketing proposal (max 400 words):

${content}

Extract:
- Brand voice and personality
- Key brand values or messaging
- Target audience insights
- Important facts about the business
- Any guidelines or requirements to follow
- Relevant background context

Provide a structured summary:`
};

/**
 * Main proposal generation prompt
 * Builds a comprehensive prompt from all input sources
 */
export const buildProposalPrompt = (firefliesContent, examples, supportingDocuments, userComments) => {
  return `You are an expert marketing proposal writer for Good Circle Marketing. Create a highly personalized, professional proposal.

${firefliesContent ? `# DISCOVERY CALL TRANSCRIPT

${firefliesContent}

---

` : `# NO MEETING TRANSCRIPT AVAILABLE

Generate a professional proposal based on example structure and user comments.

---

`}
# EXAMPLE PROPOSALS

${examples.length > 0 ? `I'm providing ${examples.length} example proposal(s) below. Study these carefully to understand our tone, structure, and approach. Match this professional style in your output.

${examples.map((ex, index) => `
## EXAMPLE ${index + 1}: ${ex.name}

${ex.content}

---
`).join('\n')}
` : 'No example proposals provided. Create a professional proposal using standard marketing proposal structure and best practices.\n\n---\n'}

${supportingDocuments.length > 0 ? `# SUPPORTING DOCUMENTS & CONTEXT

I'm providing ${supportingDocuments.length} additional document(s) with important context about the client, their business, brand guidelines, marketing plans, or other relevant information. Review these carefully to inform your proposal.

${supportingDocuments.map((doc, index) => `
## DOCUMENT ${index + 1}: ${doc.name}

${doc.content}

---
`).join('\n')}

` : ''}
${userComments ? `# SPECIAL INSTRUCTIONS FROM USER

${userComments}

---

` : ''}
# YOUR TASK

Create a complete marketing proposal following this structure:

## 1. EXECUTIVE SUMMARY
${firefliesContent ? '- Reference the discovery call and specific conversation points' : '- Professional introduction'}
- Summarize main challenges and opportunities
- Preview recommended solution
- 150-200 words

## 2. UNDERSTANDING YOUR BUSINESS
- Demonstrate understanding of their business
${firefliesContent ? '- Include specific quotes or details from the call' : '- Show industry knowledge'}
- 200-300 words

## 3. CHALLENGES & OPPORTUNITIES
- List 3-4 specific challenges
- Explain opportunity in each
- 300-400 words

## 4. OUR APPROACH
- Strategic overview
- Why this approach works
- 200-300 words

## 5. RECOMMENDED SERVICES
- Detail 3-5 specific services
- For each: what's included, how it helps, expected outcomes
- 600-800 words

## 6. TIMELINE & PROCESS
- Phase breakdown
- Realistic milestones
- 200-250 words

## 7. INVESTMENT
- Clear pricing structure
- What's included
- Value proposition
- 200-300 words
- NOTE: Do not include itemized products/prices - just package structure

## 8. WHY GOOD CIRCLE MARKETING
- Our experience and approach
- What makes us different
- 150-200 words

## 9. NEXT STEPS
- Clear call to action
- 100-150 words

---

# CRITICAL REQUIREMENTS

1. Use Markdown formatting
2. Professional, confident tone
3. Specific and personalized
4. 2000-2500 words total
5. No placeholder text
6. Match Good Circle Marketing's voice from examples
7. DO NOT include legal disclaimers or itemized pricing tables (these are in our template)

Output ONLY the proposal in markdown. No preamble or postamble.

Begin now:`;
};

/**
 * Proposal iteration prompt
 * Used when user requests changes to an existing proposal
 */
export const buildIterationPrompt = (currentProposal, iterationComment) => {
  return `# CURRENT PROPOSAL

${currentProposal}

---

# ITERATION REQUEST

${iterationComment}

---

# YOUR TASK

Update the proposal based on the iteration request above. Keep all the good parts that work, and improve based on the feedback. Output the complete updated proposal in markdown format.

Output ONLY the updated proposal. No preamble or postamble.
`;
};

/**
 * Model configurations for different AI tasks
 */
export const modelConfig = {
  // Fast, cost-effective model for distillation
  distillation: {
    model: 'gpt-4o-mini',
    maxTokens: 800,
    temperature: 0.3
  },

  // High-quality model for proposal generation
  generation: {
    model: 'gpt-4-turbo-preview',
    maxTokens: 4000,
    temperature: 0.3
  },

  // High-quality model for iteration
  iteration: {
    model: 'gpt-4-turbo-preview',
    maxTokens: 4000,
    temperature: 0.3
  }
};
