# Implementation Roadmap for Service-Based Proposal System

This document breaks down the implementation plan from `exampleproposalplan.md` into actionable phases with clear separation of manual vs automated tasks.

---

## Phase 0: Prerequisites (MANUAL - You Must Complete)

Before implementation can begin, you need to set up the following:

### Database Setup

**Option A: Firebase/Firestore (Recommended for this app)**
- [ ] Create Firebase project
- [ ] Set up Firestore database
- [ ] Enable authentication (if needed)
- [ ] Get Firebase config credentials
- [ ] Add to `.env`:
  ```
  VITE_FIREBASE_API_KEY=...
  VITE_FIREBASE_AUTH_DOMAIN=...
  VITE_FIREBASE_PROJECT_ID=...
  VITE_FIREBASE_STORAGE_BUCKET=...
  VITE_FIREBASE_MESSAGING_SENDER_ID=...
  VITE_FIREBASE_APP_ID=...
  ```

**Option B: Supabase**
- [ ] Create Supabase project
- [ ] Get connection details
- [ ] Add to `.env`:
  ```
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...
  ```

**Option C: Local JSON files (Quick start, not production-ready)**
- [ ] No setup needed, will use localStorage + file exports

### PDF Processing

- [ ] Gather 3-5 example proposals (PDFs)
- [ ] Place them in a `data/example-proposals/` folder
- [ ] Note which services each proposal includes

### Decision Points

- [ ] **Which database?** (Firebase/Supabase/LocalJSON) → ___________
- [ ] **PDF extraction library?** (pdf-parse, pdf.js) → ___________
- [ ] **Where to run ingestion?** (browser, Node script, manual) → ___________

---

## Phase 1: Data Layer (AUTOMATED - I Will Implement)

### 1.1 Data Models
- [ ] Create TypeScript/JSDoc definitions for all models
  - ClientBrief
  - ProposalTemplate
  - StyleCard
  - ServiceModule
  - SectionExemplar
  - ProposalInstance
- [ ] Create service/section ID constants
- [ ] Create database schema (Firestore collections or Supabase tables)

### 1.2 Database Service Layer
- [ ] Implement database connection utility
- [ ] Create CRUD operations for each model:
  - ClientBrief CRUD
  - ProposalTemplate CRUD
  - StyleCard CRUD
  - ServiceModule CRUD
  - SectionExemplar CRUD
  - ProposalInstance CRUD
- [ ] Add data validation
- [ ] Add error handling

**Files to create:**
- `src/models/` - Data model definitions
- `src/services/database.js` - Database connection & CRUD operations
- `src/config/schema.js` - Database schema definitions

---

## Phase 2: Seed Data (SEMI-AUTOMATED)

### 2.1 Default Template & Style Card
- [ ] I implement: Default ProposalTemplate structure (from plan)
- [ ] I implement: Default StyleCard (from plan)
- [ ] You review & approve extracted data

### 2.2 Service Modules
- [ ] I implement: Service module definitions for:
  - Marketing Machine
  - Internal Comms
  - SEO/Hosting
  - Digital Upgrades
  - Fractional CMO
  - 828 Marketing
- [ ] I implement: Default line items for each service
- [ ] You review & adjust pricing

### 2.3 Section Exemplars
- [ ] I implement: Seed exemplars based on plan examples
- [ ] You add more from your actual proposals (via admin UI)

**Database seeding:**
- `src/data/seed.js` - Script to populate initial data
- You run: `npm run seed` to initialize database

---

## Phase 3: PDF Ingestion Pipeline (AUTOMATED - I Will Implement)

### 3.1 PDF Text Extraction
- [ ] Implement PDF parser
- [ ] Clean extracted text (remove headers/footers, fix formatting)
- [ ] Preview extraction results

### 3.2 AI Extraction Prompts
- [ ] Create prompt for template extraction
- [ ] Create prompt for style card extraction
- [ ] Create prompt for service identification
- [ ] Create prompt for exemplar extraction

### 3.3 Ingestion UI
- [ ] Upload PDF interface
- [ ] Run extraction process
- [ ] Review extracted data
- [ ] Approve and save to database

**Files to create:**
- `src/services/pdfExtraction.js` - PDF parsing logic
- `src/services/ingestion.js` - AI-powered extraction
- `src/components/admin/IngestionTool.jsx` - Admin UI

---

## Phase 4: Client Brief Builder (AUTOMATED - I Will Implement)

### 4.1 Transcript Processing
- [ ] UI for uploading/pasting transcript
- [ ] AI extraction prompt for ClientBrief
- [ ] Parse JSON response into ClientBrief model
- [ ] Validation & error handling

### 4.2 Brief Editor
- [ ] Form UI for editing ClientBrief fields:
  - Client name, industry, size, location
  - Stakeholders (dynamic list)
  - Goals, pain points, constraints, opportunities
  - Services needed (checkboxes)
  - Notes for copy
- [ ] Save to database
- [ ] List existing briefs

**Files to create:**
- `src/components/ClientBriefBuilder.jsx` - Main UI
- `src/components/ClientBriefEditor.jsx` - Edit form
- `src/services/clientBrief.js` - Extraction & CRUD

---

## Phase 5: New Proposal Generation Flow (AUTOMATED - I Will Implement)

### 5.1 Proposal Builder UI
- [ ] Select client brief (dropdown)
- [ ] Multi-select services (checkboxes with descriptions)
- [ ] Preview selected services
- [ ] Create proposal button

### 5.2 Section-by-Section Generation
- [ ] Load proposal template
- [ ] For each section:
  - Build section context (brief + services + exemplars)
  - Generate with AI
  - Store as ProposalSectionInstance
  - Show progress
- [ ] Display generated sections
- [ ] Allow editing individual sections

### 5.3 AI Prompts
- [ ] Create `PROMPT_GENERATE_SECTION`
- [ ] Implement section context builder
- [ ] Implement exemplar collector

**Files to create:**
- `src/components/ProposalBuilder.jsx` - Main builder UI
- `src/components/ServiceSelector.jsx` - Service selection
- `src/components/SectionViewer.jsx` - View/edit sections
- `src/hooks/useProposalBuilder.js` - Generation logic
- `src/config/sectionPrompts.js` - Section generation prompts

---

## Phase 6: Section Iteration (AUTOMATED - I Will Implement)

### 6.1 Comment System
- [ ] Add comment field per section
- [ ] Store comments with section
- [ ] UI for viewing comment history

### 6.2 Section Revision
- [ ] Implement `PROMPT_REVISE_SECTION`
- [ ] Call AI with current section + comments
- [ ] Store new version (increment version number)
- [ ] Show version history

**Files to create:**
- `src/components/SectionComments.jsx` - Comment UI
- `src/services/sectionRevision.js` - Revision logic

---

## Phase 7: Admin Tools (AUTOMATED - I Will Implement)

### 7.1 Template Editor
- [ ] View/edit proposal template
- [ ] Add/remove/reorder sections
- [ ] Edit section descriptions

### 7.2 Style Card Editor
- [ ] Edit tone, voice, structure guidelines
- [ ] Edit language patterns, formatting

### 7.3 Service Module Manager
- [ ] Create/edit service modules
- [ ] Edit line items
- [ ] Assign exemplars to services

### 7.4 Exemplar Manager
- [ ] Create/edit section exemplars
- [ ] Tag with section & service
- [ ] Preview how exemplars are used

**Files to create:**
- `src/components/admin/TemplateEditor.jsx`
- `src/components/admin/StyleEditor.jsx`
- `src/components/admin/ServiceManager.jsx`
- `src/components/admin/ExemplarManager.jsx`
- `src/components/admin/AdminDashboard.jsx` - Main admin interface

---

## Phase 8: Export & Polish (AUTOMATED - I Will Implement)

### 8.1 Export Formats
- [ ] Render ProposalInstance to markdown
- [ ] Render to HTML
- [ ] Export as PDF
- [ ] Copy to clipboard

### 8.2 Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Success messages
- [ ] Undo/redo for sections

**Files to create:**
- `src/services/export.js` - Export utilities
- `src/components/ProposalExport.jsx` - Export UI

---

## Phase 9: Migration from Old System (SEMI-AUTOMATED)

### 9.1 Backward Compatibility
- [ ] Keep old "upload examples" flow as fallback
- [ ] Add feature flag to toggle new system
- [ ] Migration guide

### 9.2 Data Migration
- [ ] Script to convert old localStorage data (if applicable)
- [ ] You manually create initial ClientBriefs from past transcripts

---

## Summary of Manual Tasks for You

Before I start implementation, you must complete:

1. **Database Setup** (choose one):
   - [ ] Firebase/Firestore + add credentials to `.env`
   - [ ] Supabase + add credentials to `.env`
   - [ ] Or confirm using LocalStorage/JSON files (quick start)

2. **Prepare Example Proposals**:
   - [ ] Gather 3-5 example proposal PDFs
   - [ ] Place in `data/example-proposals/` folder

3. **Decisions**:
   - [ ] Confirm database choice
   - [ ] Confirm PDF library preference (I recommend pdf-parse for Node or pdf.js for browser)
   - [ ] Confirm where ingestion runs (browser vs Node script)

4. **After Implementation**:
   - [ ] Run `npm run seed` to initialize database
   - [ ] Use Ingestion Tool to process example PDFs
   - [ ] Review/approve extracted templates, styles, exemplars
   - [ ] Create initial ClientBriefs for active opportunities

---

## Estimated Timeline

- **Phase 0 (Manual)**: 1-2 hours
- **Phase 1 (Data Layer)**: Implement once you confirm database choice
- **Phase 2 (Seed Data)**: Can start immediately
- **Phase 3 (Ingestion)**: Depends on PDF library choice
- **Phase 4-8**: Sequential implementation

**Total implementation**: This is a multi-day project. I recommend starting with Phases 1-2 to get the foundation in place, then building out features incrementally.

---

## Next Steps

**Please provide:**
1. Your database choice (Firebase/Supabase/LocalStorage)
2. Your PDF processing preference
3. Confirmation that you've read and understand the manual tasks

**Then I will:**
1. Start with Phase 1 (Data Layer)
2. Implement one phase at a time
3. Provide clear instructions for each manual step as we reach it
