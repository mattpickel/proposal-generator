# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered proposal generator for Good Circle Marketing. Uses OpenAI GPT-4 to create personalized marketing proposals from Fireflies transcripts.

**Key Innovation:** Section-by-section generation (9 sections) instead of monolithic proposals. Reduces token usage from 30k+ to ~18k per proposal.

## Architecture

This is a **monorepo** with separate backend and frontend:

```
proposal-app/
├── backend/                  # Express REST API + Firebase services
│   ├── scripts/
│   │   └── seedDatabase.js   # Populate Firebase collections
│   ├── src/
│   │   ├── config/           # Firebase, OpenAI prompts
│   │   ├── models/           # Type definitions, constants
│   │   ├── routes/           # Express route handlers
│   │   ├── services/         # Database, extraction, generation
│   │   └── index.js          # Express server entry point
│   └── package.json
├── frontend/                 # React SPA (Vite)
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks (useProposalBuilder)
│   │   ├── pages/            # HomePage, ProposalBuilderPage
│   │   ├── services/         # API client (talks to backend)
│   │   └── main.jsx          # React entry point
│   └── package.json
└── package.json              # Root workspace manager
```

### Technology Stack

- **Backend:** Node.js, Express, Firebase/Firestore, OpenAI API
- **Frontend:** React 18, React Router, Vite
- **Database:** Firebase/Firestore (8 collections)
- **AI:** GPT-4 (gpt-4-turbo-preview for generation, gpt-4o-mini for extraction)

### Backend API Endpoints

Backend runs on `http://localhost:3001` by default.

**Database CRUD:**
- `GET/POST/PUT/DELETE /api/database/proposals` - ProposalInstances
- `GET/POST/PUT/DELETE /api/database/client-briefs` - ClientBriefs
- `GET/POST/PUT/DELETE /api/database/sections` - ProposalSections
- `GET/POST/PUT/DELETE /api/database/documents` - SupportingDocuments
- `GET /api/database/templates` - ProposalTemplates (read-only)
- `GET /api/database/styles` - StyleCards (read-only)
- `GET /api/database/services` - ServiceModules (read-only)
- `GET /api/database/exemplars` - SectionExemplars (read-only)

**Extraction (AI):**
- `POST /api/extraction/client-brief` - Extract ClientBrief from transcript
- `POST /api/extraction/document-summary` - Summarize document
- `POST /api/extraction/suggest-services` - AI service recommendations

**Generation (AI):**
- `POST /api/generation/section` - Generate single proposal section
- `POST /api/generation/all-sections` - Generate all 9 sections
- `POST /api/generation/revise` - Revise section with AI feedback

### Frontend Architecture

**Routes:**
- `/` - HomePage (enter opportunity ID)
- `/proposal/:opportunityId` - ProposalBuilderPage (4-step workflow)

**Key Hook:** `useProposalBuilder(apiKey, showToast)`
- Main workflow orchestration
- Manages state: clientBrief, currentProposal, generationProgress
- Methods: processTranscript(), createProposal(), generateProposal(), reviseSection()

**API Client:** `src/services/api.js`
- Wraps all backend API calls
- Usage: `api.database.proposals.getAll()`, `api.extraction.extractClientBrief()`

### Firebase Collections

| Collection | Purpose | Seeded? |
|------------|---------|---------|
| `proposalTemplates` | Section structure (9 sections) | Yes |
| `styleCards` | Writing style guidelines | Yes |
| `serviceModules` | Service definitions + pricing | Yes (6 services) |
| `sectionExemplars` | Example snippets for sections | Yes |
| `clientBriefs` | Extracted client info from transcripts | No (created by users) |
| `proposalInstances` | Created proposals | No (created by users) |
| `proposalSections` | Generated section content (versioned) | No (created by AI) |
| `supportingDocuments` | Additional client documents | No (uploaded by users) |

### 4-Step Workflow

1. **Upload Transcript** - Upload Fireflies transcript → AI extracts ClientBrief → AI suggests services
2. **Configure Services** - Select services → Enter business name → Create ProposalInstance
3. **Generate Proposal** - Generate all 9 sections sequentially with progress tracking
4. **Review & Edit** - Display sections, edit, revise with AI, export

## Development Commands

### First-Time Setup

```bash
# Install root dependencies
npm install

# Install frontend + backend dependencies
npm run install:all

# Create backend .env file
cd backend
cp .env.example .env
# Edit backend/.env with Firebase + OpenAI credentials

# Seed Firebase database
npm run seed

# Start both servers
cd ..
npm run dev
```

### Daily Development

```bash
# Start both backend (3001) and frontend (5173) concurrently
npm run dev

# Or run separately:
npm run dev:backend   # Start Express API on port 3001
npm run dev:frontend  # Start Vite dev server on port 5173

# Build frontend for production
npm run build

# Preview production build
npm run start:frontend
```

### Database Seeding

```bash
npm run seed   # Runs backend/scripts/seedDatabase.js
```

**What gets seeded:**
- 1 ProposalTemplate (`gcm_standard_v1`) with 9 sections
- 1 StyleCard (`gcm_house_style_v1`) with GCM writing guidelines
- 6 ServiceModules (Marketing Machine, Internal Comms, SEO/Hosting, Digital Upgrades, 828 Marketing, Fractional CMO)
- Multiple SectionExemplars (example snippets for each section)

## Environment Configuration

**Backend requires** (`backend/.env`):
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

**Frontend optional** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001/api  # Backend API URL (defaults to localhost:3001)
```

## Code Patterns

### Backend: Database Operations

```javascript
// backend/src/services/database.js
import { proposalInstances } from '../services/database.js';

// Create
const proposal = await proposalInstances.create({ ...data });

// Read
const proposal = await proposalInstances.get(id);
const proposal = await proposalInstances.getByOpportunityId('OPP-123');

// Update
await proposalInstances.update(id, { status: 'generated' });

// Delete
await proposalInstances.delete(id);
```

### Backend: Adding a New Route

```javascript
// backend/src/routes/yourRoute.js
import express from 'express';
const router = express.Router();

router.post('/your-endpoint', async (req, res, next) => {
  try {
    const result = await yourService(req.body);
    res.json(result);
  } catch (error) {
    next(error);  // Express error handler will catch
  }
});

export default router;

// Then register in backend/src/index.js:
import yourRoutes from './routes/yourRoute.js';
app.use('/api/your-path', yourRoutes);
```

### Frontend: API Client Usage

```javascript
// frontend/src/hooks/useProposalBuilder.js
import api from '../services/api';

// Database operations
const proposals = await api.database.proposals.getAll();
const proposal = await api.database.proposals.get(id);
await api.database.proposals.create(data);

// AI operations
const brief = await api.extraction.extractClientBrief(apiKey, transcriptText);
const section = await api.generation.generateSection(apiKey, params);
```

### Frontend: Adding a New Component

1. Create component in `frontend/src/components/YourComponent.jsx`
2. Import in parent component or page
3. Export from `frontend/src/components/index.js` if needed

## Common Issues & Solutions

### Backend won't start
- **Check:** `backend/.env` exists with Firebase credentials
- **Check:** Port 3001 is not already in use
- **Check:** `npm run install:all` was run

### Frontend can't connect to backend
- **Check:** Backend is running on port 3001
- **Check:** `VITE_API_URL` in `frontend/.env` points to correct backend URL
- **Check:** CORS is enabled (should be by default)

### Seed script fails
- **Check:** Firebase credentials in `backend/.env` are correct
- **Check:** Firestore is enabled in Firebase Console
- **Check:** Firestore security rules allow writes (test mode)

### Section generation fails
- **Check:** OpenAI API key has GPT-4 access
- **Check:** API key has sufficient credits
- **Check:** ClientBrief exists for the proposal
- **Check:** Service modules are seeded in Firebase

## Working with This Codebase

### To Add a New Service Module

1. Add to `serviceModules` array in `backend/scripts/seedDatabase.js`
2. Add service ID to `ServiceIds` enum in `backend/src/models/constants.js`
3. Re-run `npm run seed`

### To Add a New Proposal Section

1. Add to `sections` array in `defaultProposalTemplate` in `backend/scripts/seedDatabase.js`
2. Add section ID to `SectionIds` enum in `backend/src/models/constants.js`
3. Create exemplars in `sectionExemplars` array
4. Update section generation logic in `backend/src/services/proposalGenerator.js`
5. Re-run `npm run seed`

### To Modify AI Prompts

1. Edit `backend/src/config/extractionPrompts.js` for extraction prompts
2. Edit `backend/src/config/sectionPrompts.js` for generation prompts
3. Changes take effect immediately (restart backend if needed)

## Important Architecture Notes

1. **Backend/Frontend Separation:** Frontend never directly accesses Firebase or OpenAI - all operations go through backend API
2. **API Client Pattern:** Frontend uses `api.js` client to abstract all backend calls
3. **Type Definitions:** Shared types in `backend/src/models/types.js` (JSDoc format)
4. **Constants:** Service IDs, Section IDs in `backend/src/models/constants.js`
5. **Error Handling:** Backend routes use Express error handler - always call `next(error)`

## Cost Considerations

- **Initial generation:** ~18k tokens (~$0.18-0.20 per proposal)
- **Section revision:** ~2k tokens per section (~$0.02-0.03 per revision)
- Uses section-by-section generation (vs 30k+ for monolithic)
