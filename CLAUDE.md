# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 CURRENT STATUS (Phase 2 - New Architecture)

**We are in the middle of implementing a complete architectural transformation.** The app is transitioning from a simple "upload PDFs every time" system to a structured, database-backed, multi-service proposal builder.

### What's Working Now ✅
- Firebase/Firestore integration (8 collections)
- Complete backend database service layer
- AI extraction services (transcripts → ClientBrief)
- AI generation services (section-by-section proposal creation)
- React Router with `/` and `/proposal/:opportunityId` routes
- Home page (opportunity ID entry)
- ProposalBuilderPage with 4-step workflow (Steps 1-3 implemented)
- Seed script to populate database (`npm run seed`)

### What Needs Immediate Attention ⚠️
**You are here → Testing the seed script and verifying the application works end-to-end**

1. **Test the seed script** - Verify it populates Firebase correctly
2. **Verify the frontend** - Make sure the React app still works with new routing
3. **Implement Step 4** - The Review & Edit interface (currently a placeholder)

### Immediate Next Steps

#### Step 1: Test the Seed Script
```bash
# Make sure .env has Firebase credentials
npm run seed
```

Expected output:
- ✓ Proposal template created
- ✓ Style card created
- ✓ 6 Service modules created
- ✓ Section exemplars created

#### Step 2: Test the Frontend
```bash
npm run dev
```

Then verify:
1. Home page loads at `http://localhost:5173`
2. Can enter an opportunity ID and navigate to `/proposal/TEST-123`
3. ProposalBuilderPage loads without errors
4. Steps 1-3 UI components render

#### Step 3: Build Step 4 - Review & Edit Interface

**Location:** `src/pages/ProposalBuilderPage.jsx` - `EditStep` component

**What's needed:**
- Display all 9 generated proposal sections
- Section-by-section editor
- Revision UI (comment input → AI revision)
- Export to .docx or .md

**Files to create:**
- `src/components/SectionEditor.jsx` - Individual section editor with revision
- `src/components/ProposalReview.jsx` - Full proposal display

---

## Project Overview

A React + Firebase AI-powered proposal generator for Good Circle Marketing. Uses OpenAI's GPT-4 to create personalized marketing proposals from Fireflies transcripts.

**Key Innovation:** Section-by-section generation (9 sections) instead of monolithic proposals. Reduces token usage from 30k+ to ~18k per proposal.

## Architecture - Phase 2 (NEW)

### Technology Stack
- **Frontend:** React 18, React Router, Vite 6
- **Backend/Database:** Firebase/Firestore (8 collections)
- **AI:** OpenAI GPT-4 (gpt-4-turbo-preview for generation, gpt-4o-mini for extraction)
- **Styling:** Vanilla CSS with Good Circle Marketing brand colors

### Directory Structure
```
proposal-generator/
├── scripts/
│   └── seedDatabase.js          # Node.js seed script for Firebase
├── src/
│   ├── components/              # React components
│   ├── config/
│   │   ├── firebase.js          # Firebase configuration
│   │   ├── extractionPrompts.js # AI prompts for extraction
│   │   └── sectionPrompts.js    # AI prompts for generation
│   ├── data/
│   │   ├── seedData.js          # Default template, style, services
│   │   └── seed.js              # (Not used - use scripts/seedDatabase.js)
│   ├── hooks/
│   │   └── useProposalBuilder.js # Main workflow orchestration hook
│   ├── models/
│   │   ├── constants.js         # Service IDs, Section IDs, etc.
│   │   └── types.js             # JSDoc type definitions
│   ├── pages/
│   │   ├── HomePage.jsx         # Opportunity ID entry
│   │   └── ProposalBuilderPage.jsx # 4-step workflow
│   ├── services/
│   │   ├── database.js          # Firestore CRUD operations
│   │   ├── extraction.js        # AI extraction services
│   │   └── proposalGenerator.js # AI generation services
│   ├── App.jsx                  # Router (simple)
│   └── main.jsx                 # Entry point with BrowserRouter
├── .env.example                 # Template with Firebase + OpenAI keys
├── SETUP.md                     # Complete setup guide
└── IMPLEMENTATION_STATUS.md     # Detailed status and next steps
```

### Firebase Collections

| Collection | Purpose | Key Documents |
|------------|---------|---------------|
| `clientBriefs` | Extracted client info from transcripts | Created by AI extraction |
| `proposalTemplates` | Section structure (9 sections) | `gcm_standard_v1` (seeded) |
| `styleCards` | Writing style guidelines | `gcm_house_style_v1` (seeded) |
| `serviceModules` | Service definitions + pricing | 6 services (seeded) |
| `sectionExemplars` | Example snippets for each section | Multiple (seeded) |
| `proposalInstances` | Created proposals | Created by users |
| `proposalSections` | Generated section content (versioned) | Created during generation |
| `supportingDocuments` | Additional client documents | Uploaded by users |

### 4-Step Workflow

**URL Pattern:** `/proposal/:opportunityId`

1. **Upload Transcript** - Upload Fireflies transcript → AI extracts ClientBrief → AI suggests services
2. **Configure Services** - Select services (pre-checked based on AI suggestion) → Enter business name → Create ProposalInstance
3. **Generate Proposal** - Generate all 9 sections sequentially with progress tracking
4. **Review & Edit** - ⚠️ **NOT YET IMPLEMENTED** - Display sections, edit, revise with AI, export

### Data Flow

```
Fireflies Transcript (txt)
    ↓
[AI Extraction] → ClientBrief (Firestore)
    ↓
[AI Service Suggestion] → Suggested Services
    ↓
[User Selection] → ProposalInstance (Firestore)
    ↓
[AI Generation - 9 sections] → ProposalSectionInstance × 9 (Firestore)
    ↓
[Review & Edit] → Final Proposal Export
```

### Key Hooks

**`useProposalBuilder(apiKey, showToast)`** - Main workflow orchestration
- `processTranscript(file)` - Extracts ClientBrief, suggests services
- `createProposal(opportunityId, clientBriefId, businessName, serviceIds)` - Creates ProposalInstance
- `generateProposal(proposalInstanceId)` - Generates all 9 sections with progress
- `reviseSection(sectionInstanceId, comment)` - Revises single section
- `loadProposal(proposalInstanceId)` - Loads existing proposal

**State managed:**
- `clientBrief` - Extracted client information
- `suggestedServices` - AI-suggested service IDs
- `currentProposal` - Current ProposalInstance
- `generationProgress` - { current, total, sectionTitle }
- `isProcessing` - Loading state

### AI Prompts Location

All AI prompts are in `src/config/`:
- `extractionPrompts.js` - ClientBrief extraction, document summarization, service suggestion
- `sectionPrompts.js` - Section generation, section revision

## Environment Configuration

Required environment variables (`.env`):

```env
# OpenAI API Key
VITE_OPENAI_API_KEY=sk-...

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

Copy `.env.example` to `.env` and fill in actual values.

## Development Commands

### First-Time Setup
```bash
npm install                  # Install dependencies
cp .env.example .env         # Copy environment template
# Edit .env with Firebase + OpenAI credentials
npm run seed                 # Populate Firebase with default data
npm run dev                  # Start dev server
```

### Daily Development
```bash
npm run dev                  # Start dev server (http://localhost:5173)
npm run build                # Build for production
npm run preview              # Preview production build
```

### Seed Database
```bash
npm run seed                 # Run scripts/seedDatabase.js
```

**What gets seeded:**
- 1 ProposalTemplate (`gcm_standard_v1`) with 9 sections
- 1 StyleCard (`gcm_house_style_v1`) with GCM writing guidelines
- 6 ServiceModules (Marketing Machine, Internal Comms, SEO/Hosting, Digital Upgrades, 828 Marketing, Fractional CMO)
- Multiple SectionExemplars (example snippets for each section)

## Working with This Codebase

### To Add a New Service Module
1. Add to `serviceModules` array in `scripts/seedDatabase.js`
2. Add service ID to `ServiceIds` enum in `src/models/constants.js`
3. Re-run `npm run seed` (or add via Firebase console)

### To Add a New Proposal Section
1. Add to `sections` array in `defaultProposalTemplate` in `scripts/seedDatabase.js`
2. Add section ID to `SectionIds` enum in `src/models/constants.js`
3. Create exemplars in `sectionExemplars` array
4. Update section generation logic in `src/services/proposalGenerator.js`
5. Re-run `npm run seed`

### To Modify AI Prompts
1. Edit `src/config/extractionPrompts.js` for extraction prompts
2. Edit `src/config/sectionPrompts.js` for generation prompts
3. Changes take effect immediately in dev mode (hot reload)

### To Add a New Page/Route
1. Create page component in `src/pages/YourPage.jsx`
2. Add route in `src/App.jsx`
3. Add navigation link where needed

## Common Issues & Solutions

### Seed Script Fails
- **Check:** Firebase credentials in `.env` are correct
- **Check:** Firestore is enabled in Firebase Console
- **Check:** Firestore is in test mode (or update security rules)

### Frontend Won't Load Proposal
- **Check:** Opportunity ID exists in URL
- **Check:** Firebase connection is working (check browser console)
- **Check:** OpenAI API key is set (in .env or entered in UI)

### Section Generation Fails
- **Check:** OpenAI API key has GPT-4 access
- **Check:** API key has sufficient credits
- **Check:** ClientBrief exists for the proposal
- **Check:** Service modules are seeded in Firebase

### React Router 404 on Refresh
- This is expected in dev mode for SPA routing
- For production, configure hosting to redirect all routes to `index.html`

## Code Patterns

### Database Operations
```javascript
import { proposalInstances } from '../services/database';

// Create
const proposal = await proposalInstances.create({ ...data });

// Read
const proposal = await proposalInstances.getByOpportunityId('OPP-123');

// Update
await proposalInstances.update(proposalId, { status: 'generated' });

// Delete
await proposalInstances.delete(proposalId);
```

### AI Extraction
```javascript
import { extractClientBrief } from '../services/extraction';

const brief = await extractClientBrief(apiKey, transcriptText);
// Returns: { clientName, industry, goals, painPoints, ... }
```

### AI Generation
```javascript
import { generateSection } from '../services/proposalGenerator';

const section = await generateSection(apiKey, {
  templateSection: { id: 'overview', title: 'Overview', ... },
  clientBriefId: 'brief123',
  selectedServiceIds: ['marketing_machine', 'seo_hosting'],
  proposalInstanceId: 'proposal123'
});
```

## Testing Checklist

Before considering the app "complete":

- [ ] Seed script runs without errors
- [ ] Firebase collections are populated
- [ ] Home page loads and accepts opportunity ID
- [ ] ProposalBuilderPage loads with opportunity ID from URL
- [ ] Step 1: File upload works
- [ ] Step 1: Transcript extraction creates ClientBrief
- [ ] Step 1: Services are suggested
- [ ] Step 2: Services are pre-checked
- [ ] Step 2: Manual service selection works
- [ ] Step 2: Proposal creation succeeds
- [ ] Step 3: Section generation runs with progress
- [ ] Step 3: All 9 sections are created
- [ ] Step 4: Sections display correctly (needs implementation)
- [ ] Step 4: Section editing works (needs implementation)
- [ ] Existing proposal loads on page refresh

## Reference Documents

- **SETUP.md** - Complete setup instructions for new developers
- **IMPLEMENTATION_STATUS.md** - Detailed status, what's done, what's not
- **exampleproposalplan.md** - Original architectural plan (in root)
- **PLANNING.md** - Planning notes (in root)

## Important Notes for AI Assistants

1. **This is Phase 2 architecture** - We've moved from localStorage to Firebase, from monolithic generation to section-by-section
2. **The seed script is critical** - Without seeded data, the app won't work
3. **Step 4 is incomplete** - The review/edit interface needs to be built
4. **Don't modify old hooks** - Some hooks from Phase 1 (useProposal, useGoogleDrive) are no longer used
5. **Follow the data models** - Type definitions in `src/models/types.js` define the structure
6. **Test with real Firebase** - The app requires actual Firebase credentials to function

## Cost Considerations

- **Initial generation:** ~18k tokens (~$0.18-0.20 per proposal)
- **Section revision:** ~2k tokens per section (~$0.02-0.03 per revision)
- Uses token-efficient section-by-section generation (vs 30k+ for monolithic)
