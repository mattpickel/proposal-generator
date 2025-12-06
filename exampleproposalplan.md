# Proposal Generation System – Implementation Plan (Good Circle Marketing)

AI-assisted proposal generator for Good Circle Marketing (GCM).

Goal: generate consistent, on-brand proposals using meeting transcripts + selected services, **without** loading huge PDFs into context and while supporting **multiple services per proposal** (e.g. Marketing Machine + SEO/Hosting + 828 + Fractional CMO, etc.).

This document is written to be dropped into a repo (e.g. `IMPLEMENTATION_PLAN.md`) and used by a coding assistant.

---

## 1. High-Level Architecture

**Core idea**

1. Distill your example proposals into:

   * a **Proposal Template** (section order + purpose),
   * a **House Style Card** (tone/voice/formatting),
   * **Service Modules** (per service: Marketing Machine, SEO/Hosting, 828, Fractional CMO, Internal Comms, etc.) each with:

     * default line item patterns
     * section exemplars (short representative snippets).

2. At runtime:

   * Convert **meeting transcripts** into a structured **Client Brief**.
   * Let the user **select services** they want to include.
   * Use:

     * Proposal Template
     * Style Card
     * Client Brief
     * Selected Service Modules + exemplars
   * to generate each **section** of the proposal with the LLM.

3. For iteration:

   * Store the proposal as **structured sections**.
   * On feedback, revise only the affected section(s).

### 1.1. Flow Overview

1. **Ingestion (one-time / occasional)**

   * Import proposals from PDF.
   * Extract:

     * Proposal Template (sections, order, roles).
     * House Style Card.
     * Service Modules + section exemplars.

2. **Client Brief Creation (per opportunity)**

   * Transcript → `ClientBrief` JSON.
   * User can edit/confirm.

3. **Proposal Generation (per proposal)**

   * User selects:

     * Client Brief.
     * Services to include.
   * System:

     * Creates a `ProposalInstance`.
     * Generates each section using LLM (one section per call).

4. **Iteration**

   * User adds comments on a section.
   * LLM revises that section only.
   * New version stored; others remain unchanged.

---

## 2. Key Concepts

* **Client Brief** – structured summary of the client, goals, pain points, etc.
* **Proposal Template** – canonical list of sections and what each should do.
* **Style Card** – global GCM writing style (tone, voice, structure).
* **Service Module** – one service offering (Marketing Machine, SEO/Hosting, 828, etc.) with:

  * display label & description
  * default line items
  * section exemplars
  * info about which sections it affects
* **Section Exemplar** – short representative snippet for a section + (optional) service.
* **Proposal Instance** – a specific proposal for a client, with:

  * reference to template
  * selected services
  * one record per section (including versions).

---

## 3. Data Models (JavaScript-Oriented)

Implementation is in JavaScript. You can represent these as plain objects and use JSDoc typedefs if you want extra tooling.

### 3.1. Basic IDs

Use string constants for services/sections:

```js
// Example enums (can also store in a config file)
const ServiceIds = {
  MARKETING_MACHINE: 'marketing_machine',
  INTERNAL_COMMS: 'internal_comms',
  SEO_HOSTING: 'seo_hosting',
  DIGITAL_UPGRADES: 'digital_upgrades',
  FRACTIONAL_CMO: 'fractional_cmo',
  EIGHT_TWO_EIGHT: '828_marketing'
};

const SectionIds = {
  HEADER: 'header',
  OVERVIEW: 'overview',
  SERVICES_SUMMARY: 'services_summary',
  SCOPE: 'scope',
  DELIVERABLES: 'deliverables',
  TIMELINE: 'timeline',
  INVESTMENT: 'investment',
  TERMS: 'terms',
  SIGNATURE: 'signature'
};
```

### 3.2. Client Brief

```js
/**
 * @typedef {Object} Stakeholder
 * @property {string} name
 * @property {string} [role]
 * @property {string[]} [primaryConcerns]
 */

/**
 * @typedef {Object} ClientBrief
 * @property {string} id
 * @property {string} clientName
 * @property {string} [industry]
 * @property {string} [size]
 * @property {string} [location]
 * @property {Stakeholder[]} stakeholders
 * @property {string[]} goals
 * @property {string[]} painPoints
 * @property {string[]} constraints
 * @property {string[]} opportunities
 * @property {string[]} servicesNeeded   // initial guess from transcript
 * @property {string[]} [tonePreferences]
 * @property {string} [notesForCopy]
 * @property {string} [rawTranscriptRef] // link or ID, not full text
 */
```

### 3.3. Proposal Template

```js
/**
 * @typedef {Object} TemplateSection
 * @property {string} id           // e.g. SectionIds.OVERVIEW
 * @property {string} title        // e.g. "Comments from Kathryn", "Overview"
 * @property {string} description  // internal: what this section should accomplish
 * @property {boolean} required
 * @property {number} defaultPosition
 */

/**
 * @typedef {Object} ProposalTemplate
 * @property {string} id
 * @property {string} name
 * @property {number} version
 * @property {TemplateSection[]} sections
 */
```

Example template (simplified):

```js
const defaultProposalTemplate = {
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
```

### 3.4. Style Card

```js
/**
 * @typedef {Object} StyleCard
 * @property {string} id
 * @property {string} name
 * @property {string[]} tone
 * @property {string[]} voice
 * @property {string[]} structureGuidelines
 * @property {string[]} languagePatterns
 * @property {string[]} formattingPreferences
 */

// Example, to be refined from real proposals:
const houseStyleCard = {
  id: 'gcm_house_style_v1',
  name: 'GCM House Style',
  tone: [
    'Calm, confident, plain language',
    'Avoid hype and heavy AI jargon'
  ],
  voice: [
    'Use "we" for the agency team, "you" for the client',
    'Occasional "we’ll" to describe planned work',
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
```

### 3.5. Section Exemplars

```js
/**
 * @typedef {Object} SectionExemplar
 * @property {string} id
 * @property {string} sectionId       // SectionIds.*
 * @property {string} [serviceId]     // optional, for service-specific exemplars
 * @property {string} title           // heading used in example
 * @property {string} fn              // short description of section function
 * @property {string} excerpt         // 2–5 sentences or 3–7 bullets
 */
```

Example (simplified):

```js
const exemplars = [
  {
    id: 'overview_marketing_machine_1',
    sectionId: SectionIds.OVERVIEW,
    serviceId: ServiceIds.MARKETING_MACHINE,
    title: 'Comments from Kathryn',
    fn: 'Introduce context and explain how the Marketing Machine creates a foundation.',
    excerpt:
      'The Marketing Machine is here to give you a consistent, sustainable way to generate and nurture demand. Instead of one-off campaigns, you get a repeatable system that ties website, content, and email together so your team always knows what to do next.'
  },
  {
    id: 'investment_multi_service_1',
    sectionId: SectionIds.INVESTMENT,
    serviceId: undefined,
    title: 'Products & Services',
    fn: 'Show a mix of one-time and monthly services with simple descriptions.',
    excerpt:
      '- **Marketing Machine Setup – One-time**\n  Establish foundational strategy, messaging, and funnels.\n- **SEO & Technical Setup – One-time**\n  Implement baseline on-site SEO, analytics, and hosting configuration.\n- **828 Marketing – Monthly**\n  Ongoing content, campaigns, and reporting to keep the system running.'
  }
];
```

### 3.6. Service Module

```js
/**
 * @typedef {'one_time' | 'monthly' | 'milestone'} BillingType
 */

/**
 * @typedef {Object} LineItemDefaults
 * @property {string} name
 * @property {string} [internalCode]
 * @property {string} description
 * @property {BillingType} billingType
 * @property {string} unitLabel
 * @property {number} baseAmount
 * @property {boolean} [isRetainer]
 */

/**
 * @typedef {Object} ServiceModule
 * @property {string} id             // one of ServiceIds.*
 * @property {string} label          // "Marketing Machine", "828 Marketing", etc.
 * @property {string} summary        // short description for summary section
 * @property {LineItemDefaults[]} lineItemDefaults
 * @property {string[]} affectsSections // SectionIds.* that this service contributes to
 * @property {Object.<string, SectionExemplar[]>} exemplarsBySection // keyed by sectionId
 */
```

Example skeleton for Marketing Machine:

```js
const marketingMachineModule = {
  id: ServiceIds.MARKETING_MACHINE,
  label: 'Marketing Machine',
  summary:
    'A repeatable system for generating and nurturing demand across web, email, and content.',
  lineItemDefaults: [
    {
      name: 'Marketing Machine Setup',
      internalCode: 'MM_SETUP',
      description:
        'Strategy, core messaging, funnels, and foundational assets to make your marketing repeatable.',
      billingType: 'one_time',
      unitLabel: 'project',
      baseAmount: 7500
    }
  ],
  affectsSections: [
    SectionIds.OVERVIEW,
    SectionIds.SCOPE,
    SectionIds.DELIVERABLES,
    SectionIds.TIMELINE,
    SectionIds.INVESTMENT
  ],
  exemplarsBySection: {
    [SectionIds.OVERVIEW]: [/* SectionExemplar objects */],
    [SectionIds.SCOPE]: [/* scope exemplars */],
    [SectionIds.DELIVERABLES]: [/* deliverables exemplars */],
    [SectionIds.INVESTMENT]: [/* investment exemplars */]
  }
};
```

You’ll create similar modules for `SEO_HOSTING`, `EIGHT_TWO_EIGHT`, `FRACTIONAL_CMO`, etc.

### 3.7. Proposal Instance

```js
/**
 * @typedef {Object} ProposalSectionInstance
 * @property {string} sectionId
 * @property {string} content          // markdown or HTML
 * @property {number} version
 * @property {string} lastUpdatedAt
 */

/**
 * @typedef {Object} ProposalInstance
 * @property {string} id
 * @property {string} templateId
 * @property {number} templateVersion
 * @property {string} clientBriefId
 * @property {string[]} serviceIds     // selected services for this proposal
 * @property {ProposalSectionInstance[]} sections
 * @property {string} createdAt
 * @property {string} updatedAt
 */
```

---

## 4. Ingestion Pipelines

### 4.1. From PDF Proposals → Template, Style, Service Modules

These are background/admin jobs, not user-facing.

**Steps:**

1. **Extract text from PDF**

   * Use a PDF library.
   * Clean the text:

     * Remove headers/footers.
     * Fix line breaks.
     * Normalize bullets and headings.

2. **Extract Structural Template**

   * Call LLM once per proposal with a prompt that:

     * Asks for an ordered list of sections.
     * For each: title, function, rough length, formatting type.
   * Merge across multiple proposals to create `defaultProposalTemplate`.

3. **Extract Style Card**

   * Feed the intro comments, scope, and services sections into LLM.
   * Ask for style analysis (tone, voice, sentence length, formatting preferences).
   * Merge across proposals and manually tweak into `houseStyleCard`.

4. **Identify Services and Build Service Modules**

   * From the Products & Services sections, identify distinct offerings:

     * Marketing Machine
     * Internal Comms add-on
     * Digital Upgrades / SEO & technical setup
     * 828 Marketing
     * Fractional CMO / agency retainer
   * For each:

     * Extract default line items (name, description, one-time vs monthly).
     * Extract short exemplar snippets for:

       * Overview / how it’s framed.
       * Scope description.
       * Deliverables.
       * Investment / line items.

5. **Store results**

   * Save `ProposalTemplate`, `StyleCard`, `ServiceModule`s, and `SectionExemplar`s to your DB.

### 4.2. From Transcripts → ClientBrief

For each new opportunity:

1. User uploads or pastes a transcript.
2. Backend calls LLM with a “Client Brief” extraction prompt:

   * Ask for:

     * Client name, stakeholders, goals, pain points, constraints.
     * Opportunities / where GCM can help.
     * Rough guess at which services are needed.
3. Parse JSON → `ClientBrief`.
4. Let user edit/confirm in UI.

---

## 5. Proposal Generation Flow

### 5.1. Inputs (per proposal)

* `ClientBrief` (selected ID).
* Selected `ServiceModule`s (one or more).
* `ProposalTemplate`.
* `houseStyleCard`.
* Optionally: snippets from other reference docs via RAG.

### 5.2. Create ProposalInstance

1. User UI:

   * Pick client brief.
   * Pick services: Marketing Machine, SEO/Hosting, 828, etc.
2. Backend:

   * Create `ProposalInstance` with:

     * `templateId`, `templateVersion`
     * `clientBriefId`
     * `serviceIds`
     * `sections` initially empty.

### 5.3. Generate Sections (one by one)

For each `TemplateSection` in order:

1. Build a **SectionContext** object (not strictly typed, just a JS object):

   ```js
   const sectionContext = {
     templateSection,       // from ProposalTemplate.sections
     clientBrief,           // from DB
     selectedServices,      // array of ServiceModule
     styleCard: houseStyleCard,
     exemplars: collectExemplars(templateSection.id, selectedServices)
   };
   ```

   `collectExemplars(sectionId, services)` should:

   * Include global exemplars for that section.
   * Include all service-specific exemplars where `exemplar.serviceId` matches one of `services`.

2. Call LLM with `PROMPT_GENERATE_SECTION` and `sectionContext`.

3. Store result as a new `ProposalSectionInstance`:

   * `sectionId`
   * `content` (markdown/HTML)
   * `version = 1`
   * `lastUpdatedAt = now`

### 5.4. Iteration (Edits)

1. In UI, user selects a specific section and leaves comments (e.g. “Make this more specific to AI governance and mention staff training.”).
2. Backend:

   * Load the current `ProposalSectionInstance`.
   * Call LLM with `PROMPT_REVISE_SECTION`:

     * Inputs: current section content, client brief (short), style card (short), user comments.
   * Save a new version:

     * `version += 1`
     * `content = revisedContent`
     * `lastUpdatedAt = now`

Only the edited section goes back through the model, not the entire proposal.

---

## 6. Service Selection & Section Exemplars

### 6.1. Services Affect Sections

Each `ServiceModule` declares `affectsSections`:

* Marketing Machine:

  * `overview`, `scope`, `deliverables`, `timeline`, `investment`
* SEO/Hosting:

  * `scope`, `deliverables`, `investment`
* 828 Marketing:

  * `deliverables`, `timeline`, `investment`
* Fractional CMO:

  * `overview`, `scope`, `investment`
* Internal Comms:

  * `scope`, `deliverables`, `investment`

When generating a section:

* Combine all relevant exemplars from all selected services.
* Also pass a concise description of each selected service (module `summary` and/or line items).

### 6.2. Example: Overview (Comments from Kathryn)

If user selects:

* Marketing Machine + SEO/Hosting + 828

Then `SectionContext` includes:

* Template section: `OVERVIEW`
* Exemplar(s):

  * One “Comments from Kathryn” style overview.
  * Marketing Machine overview exemplar.
  * Possibly a short line about technical setup ensuring the machine is solid.
* Instructions:

  * Introduce client context (from ClientBrief).
  * Explain why GCM is proposing **these specific services** together.
  * Keep tone and structure consistent with style card and exemplars.

### 6.3. Example: Investment

`SectionContext` includes:

* All lineItemDefaults from selected services, plus any overrides from UI (actual prices).
* Investment exemplars showing:

  * Combined list of one-time + monthly fees.
  * Clear structure: headings, bullet formatting.

LLM outputs narrative + bullet/table-like text; frontend can render as actual table.

---

## 7. Prompt Templates (Skeletons)

**Note:** These are conceptual; implement as string templates with placeholders.

### 7.1. Extract Template from Proposal (One-Time)

**System:**

> You are an analyst extracting structure from marketing proposals.
> Return only valid JSON.

**User (includes cleaned full proposal text):**

* Ask for:

  * Overall purpose in one line.
  * Ordered list of sections.
  * For each section:

    * `id` (machine-friendly suggestion, like `"overview"` or `"investment"`)
    * `title` (heading or inferred)
    * `role` (what this section does)
    * `format` (paragraphs, bullets, table, combination)

### 7.2. Extract Style Card (One-Time)

**System:**

> You are a copywriting analyst.
> Describe the consistent writing style, not the specific client details.

**User:**

* Provide key parts of the proposal: intro “Comments from Kathryn”, scope, products/services, etc.
* Ask for a markdown style guide with headings:

  * Tone
  * Voice
  * Structure & Rhythm
  * Language Patterns
  * Formatting

### 7.3. Extract ClientBrief From Transcript

**System:**

> You are a consultant summarizing a sales/discovery call for a marketing agency.
> Return JSON matching the provided schema exactly.

**User:**

* Provide entire transcript.
* Provide target JSON keys (clientName, stakeholders, goals, painPoints, constraints, opportunities, servicesNeeded, notesForCopy, etc.).

### 7.4. Generate a Section

**System:**

> You are a proposal writer for a marketing agency.
> Follow the template and style card exactly.
> Use plain, confident language and avoid hype.

**User includes:**

* Template section (title + description).
* Short version of StyleCard.
* ClientBrief (JSON or bullet form).
* Selected services:

  * For each: `{ id, label, summary }`.
* Section exemplars:

  * 1–4 short examples (global + service-specific).
* Instructions:

  * What this section must accomplish.
  * Length and formatting.
  * How to incorporate multiple services if more than one.

Ask the model to:

* Output only the body content of the section (no extra commentary).

### 7.5. Revise a Section

**System:**

> You are revising ONE section of a proposal.
> Keep structure and formatting as similar as possible unless comments require a change.

**User includes:**

* Current section text.
* Brief summary of client (from ClientBrief).
* Short style card.
* User comments/feedback.

Ask the model to:

* Integrate feedback.
* Preserve section purpose.
* Output only the updated section text.

---

## 8. Token Efficiency Strategy

* **No PDFs at runtime** – proposals are pre-digested into templates, style, and exemplars.
* Generation happens **per section**, not for the whole proposal in one go.
* Typical per-call context:

  * System instructions + style snippet: ~500–1,000 tokens.
  * ClientBrief (shortened): ~300–800 tokens.
  * Section template description: ~50–150 tokens.
  * 2–4 exemplars: ~100–300 tokens.
  * Selected services summary: ~50–150 tokens.
* Target total: **< 2k tokens per call**, far under 30k.

Use **low temperature** (0.1–0.3) for consistency and stable structure.

---

## 9. Implementation Checklist

1. **Data Structures**

   * Implement JS models / collections for:

     * ClientBrief
     * ProposalTemplate
     * StyleCard
     * ServiceModule
     * SectionExemplar
     * ProposalInstance

2. **Admin Tools**

   * CRUD UI for:

     * Editing ProposalTemplate.
     * Editing StyleCard.
     * Defining ServiceModules and lineItemDefaults.
     * Adding/editing SectionExemplars.

3. **Ingestion Jobs**

   * Script to:

     * Pull text from PDFs.
     * Call LLM to extract templates, style, and exemplars.
     * Seed DB with those artifacts.

4. **Client Brief Builder**

   * Endpoint/UI to upload transcript.
   * Endpoint to call LLM and convert transcript → ClientBrief.
   * UI to edit/confirm.

5. **Proposal Builder**

   * UI to:

     * Choose ClientBrief.
     * Choose services (multi-select).
     * Generate proposal (section-by-section).
     * Show sections with inline editing & comments.

6. **Iteration**

   * Comment model attached to specific sections.
   * Backend route to:

     * Call LLM with PROMPT_REVISE_SECTION.
     * Store new section versions.

7. **Export**

   * Render ProposalInstance to:

     * HTML/PDF.
     * Or downstream proposal/contract tools.

---

This plan should give your coding assistant a clear blueprint: data structures, flows, and prompts, all tuned for multi-service proposals and low token usage.
