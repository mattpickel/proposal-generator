Write a marketing proposal based on the following structured data and notes.

[AGENCY CONTEXT]
Agency name: Good Circle Marketing
Primary frameworks / packages:

- Marketing Machine: a comprehensive strategy / framework engagement.
- 828 Plan: a monthly content marketing retainer.
- Good Start Minimal: a foundational brand + website package.

[CLIENT INFO]
Client name: {{client_name}}
Client organization: {{client_org}}
Client industry: {{client_industry}}
Client location: {{client_location}}
Key contact person: {{client_contact_name}} ({{client_contact_title}})

[PROJECT SUMMARY]
Internal working title for this proposal: {{proposal_title}}
High-level objective (1–3 sentences): {{high_level_objective}}

[CHALLENGES]
List of known challenges or pain points (bullet-style notes; rewrite these cleanly for the client):
{{challenges_notes}}

[GOALS]
Client’s goals / desired outcomes:
{{goals_notes}}

[SELECTED SERVICES]
Below is a JSON array describing which services are included and any relevant configuration.

{{selected_services_json}}

(selected_services_json example)
[
{
"service_key": "good_start_minimal",
"display_name": "Good Start Minimal",
"type": "fixed_scope",
"headline_objective": "Brand foundations and a simple, credible web presence.",
"deliverable_groups": [
{
"group_title": "Brand Development",
"bullets": [
"Clarify {{client_org}}’s positioning, values, and differentiators.",
"Establish a consistent voice and tone to guide all written materials."
]
},
{
"group_title": "Business Summary & Messaging",
"bullets": [
"One polished business summary.",
"Landing page content based on approved brand voice."
]
},
{
"group_title": "Landing Page",
"bullets": [
"One-page, professionally designed site using existing logo and brand styling.",
"Business summary and service overview.",
"Resume section or downloadable PDF.",
"Professional headshot.",
"Contact form and direct contact info.",
"LinkedIn link.",
"Local SEO optimization for {{primary_region}}.",
"Domain setup and 1 year hosting."
]
}
],
"timeline_description": "4–6 weeks, depending on feedback and approvals.",
"investment_plain_text": "Base package: ${{good_start_price}}. Payment: 50% upfront / 50% at completion."
  },
  {
    "service_key": "marketing_machine",
    "display_name": "Marketing Machine",
    "type": "fixed_scope",
    "headline_objective": "Build a full-funnel marketing system and clear frameworks for ongoing decisions.",
    "deliverable_groups": [
      { "group_title": "Meetings", "bullets": [...] },
      { "group_title": "Research and Analysis", "bullets": [...] },
      { "group_title": "Who You Are", "bullets": [...] },
      { "group_title": "Who You Help", "bullets": [...] },
      { "group_title": "How You Help", "bullets": [...] },
      { "group_title": "How You Tell the World", "bullets": [...] },
      { "group_title": "Making Sure It Works", "bullets": [...] },
      { "group_title": "Next Steps and Tools", "bullets": [...] }
    ],
    "timeline_description": "{{marketing_machine_timeline}}",
    "investment_plain_text": "One-time fee of ${{marketing_machine_price}}, payable as {{marketing_machine_payment_terms}}."
  },
  {
    "service_key": "828",
    "display_name": "828 Plan: Content Marketing",
    "type": "retainer",
    "headline_objective": "Provide consistent, story-driven content marketing each month.",
    "deliverable_groups": [
      { "group_title": "Flexible Marketing Support", "bullets": [...] },
      { "group_title": "Social Media Management", "bullets": [...] },
      { "group_title": "SEO and Website Updates", "bullets": [...] },
      { "group_title": "Event Strategy and Promotion", "bullets": [...] },
      { "group_title": "Ad Management", "bullets": [...] },
      { "group_title": "Reporting and Consultations", "bullets": [...] }
    ],
    "timeline_description": "",
    "investment_plain_text": "${{monthly_fee}}/month for {{initial_term_description}}, plus {{ad_mgmt_details}}."
}
]

[INVESTMENT SUMMARY]
On the proposal / quote, we plan to show pricing as:
{{investment_summary_notes}}
(For example: “Discovery and Strategy: $2,717 one-time. Monthly retainer: $828/month for 12 months. Ad management: 20% of monthly ad spend.”)

[NEXT STEPS]
Outline any desired next steps or deadlines (the model should phrase these clearly):
{{next_steps_notes}}

[COPY REQUIREMENTS]

- Do NOT change prices or dates.
- Rewrite the notes into polished, client-facing language.
- Use the exact section headings and JSON format described in the system prompt.
- For each service in selected_services_json, create one matching entry in the "services" array with:
  - service_key (copy from input),
  - display_name (copy from input),
  - short_quote_description (1–2 sentences, concise).
