/**
 * Section Generation Prompts
 *
 * Prompts for generating individual proposal sections
 */

/**
 * Build context for section generation
 */
export function buildSectionContext(templateSection, clientBrief, selectedServices, styleCard, exemplars) {
  return {
    section: {
      id: templateSection.id,
      title: templateSection.title,
      description: templateSection.description
    },
    client: {
      name: clientBrief.clientName,
      industry: clientBrief.industry,
      stakeholders: clientBrief.stakeholders,
      goals: clientBrief.goals,
      painPoints: clientBrief.painPoints,
      opportunities: clientBrief.opportunities,
      notesForCopy: clientBrief.notesForCopy
    },
    services: selectedServices.map(s => ({
      id: s.id,
      label: s.label,
      summary: s.summary,
      lineItems: s.lineItemDefaults
    })),
    style: {
      tone: styleCard.tone,
      voice: styleCard.voice,
      structure: styleCard.structureGuidelines,
      language: styleCard.languagePatterns
    },
    exemplars: exemplars.map(e => ({
      title: e.title,
      excerpt: e.excerpt
    }))
  };
}

/**
 * Generate Section Prompt
 */
export function buildGenerateSectionPrompt(sectionContext) {
  const { section, client, services, style, exemplars } = sectionContext;

  return `You are a proposal writer for Good Circle Marketing, a marketing agency.

# YOUR TASK
Write the "${section.title}" section of a proposal for ${client.name}.

# SECTION PURPOSE
${section.description}

# CLIENT CONTEXT
**Company:** ${client.name}
**Industry:** ${client.industry || 'Not specified'}

**Stakeholders:**
${client.stakeholders.map(s => `- ${s.name}${s.role ? ` (${s.role})` : ''}`).join('\n')}

**Goals:**
${client.goals.map(g => `- ${g}`).join('\n')}

**Pain Points:**
${client.painPoints.map(p => `- ${p}`).join('\n')}

**Opportunities:**
${client.opportunities.map(o => `- ${o}`).join('\n')}

${client.notesForCopy ? `**Special Notes:**\n${client.notesForCopy}\n` : ''}

# SERVICES INCLUDED IN THIS PROPOSAL
${services.map(s => `**${s.label}**\n${s.summary}`).join('\n\n')}

# WRITING STYLE REQUIREMENTS
**Tone:** ${style.tone.join(', ')}
**Voice:** ${style.voice.join('; ')}
**Structure:** ${style.structure.join('; ')}
**Language:** ${style.language.join('; ')}

# EXAMPLES FOR THIS SECTION
${exemplars.length > 0 ? exemplars.map((ex, i) => `
**Example ${i + 1}:**
${ex.excerpt}
`).join('\n') : 'No specific examples provided - follow general style guidelines.'}

# INSTRUCTIONS
1. Write ONLY the content for this section
2. Do NOT include the section heading - just the body content
3. Match the style and tone shown in the examples
4. Be specific to ${client.name}'s situation
5. Reference the selected services naturally
6. Use markdown formatting (**, -, etc.)
7. Keep it concise but complete
${section.id === 'investment' ? '8. Include line items for each service with descriptions and pricing\n9. Group one-time vs monthly fees clearly' : ''}
${section.id === 'overview' ? '8. Start with a warm, personal acknowledgment of the conversation\n9. End with confidence about the proposed solution' : ''}

Begin writing now:`;
}

/**
 * Revise Section Prompt
 */
export function buildReviseSectionPrompt(currentContent, clientName, styleCard, userComment) {
  return `You are revising ONE section of a proposal for ${clientName}.

# CURRENT SECTION CONTENT
${currentContent}

# WRITING STYLE
**Tone:** ${styleCard.tone.join(', ')}
**Voice:** ${styleCard.voice.join('; ')}

# USER FEEDBACK
${userComment}

# INSTRUCTIONS
1. Integrate the feedback into the section
2. Keep the same general structure unless feedback requires a change
3. Maintain the style and professionalism
4. Output ONLY the revised section content (no commentary)
5. Use markdown formatting

Begin the revised section now:`;
}
