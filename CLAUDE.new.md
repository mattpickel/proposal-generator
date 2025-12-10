# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 CURRENT STATUS (Phase 3 - Frontend/Backend Separation)

**The project has been reorganized into separate frontend and backend applications.** This is a monorepo with clear separation of concerns.

### Architecture Overview ✅
- **Frontend**: React 18 + Vite + React Router (standalone app in `/frontend`)
- **Backend**: Express.js + Firebase/Firestore (standalone API in `/backend`)
- **Communication**: REST API (`http://localhost:3001/api`)
- **Database**: Firebase/Firestore (8 collections)
- **AI**: OpenAI GPT-4 for extraction and generation

### What's Working Now ✅
- Separate frontend and backend directories
- Express REST API with routes for database, extraction, and generation
- Frontend API client for communicating with backend
- Firebase/Firestore integration (8 collections)
- Complete backend database service layer
- AI extraction services (transcripts → ClientBrief)
- AI generation services (section-by-section proposal creation)
- React Router with `/` and `/proposal/:opportunityId` routes
- Home page (opportunity ID entry)
- ProposalBuilderPage with 4-step workflow (Steps 1-3 implemented)
- Seed script to populate database

### What Needs Immediate Attention ⚠️

1. **Install dependencies** - Run `npm run install:all` from root
2. **Test the backend** - Verify Express server starts and connects to Firebase
3. **Test the frontend** - Verify React app can communicate with backend API
4. **Implement Step 4** - The Review & Edit interface (currently a placeholder)

### Getting Started

#### First-Time Setup
```bash
# From project root
npm run install:all          # Install all dependencies (root, frontend, backend)

# Set up environment files
# Create backend/.env with Firebase credentials
# Create frontend/.env with API URL and OpenAI key

# Seed the database
npm run seed                 # Runs backend seed script

# Start both servers
npm run dev                  # Starts backend (3001) and frontend (5173)
```

#### Expected Output

**Backend** (http://localhost:3001):
- Console: "Backend API server running on http://localhost:3001"
- Health check: GET http://localhost:3001/health returns {"status":"ok"}

**Frontend** (http://localhost:5173):
- Home page loads
- Can enter opportunity ID and navigate to proposal builder

## Project Structure

```
proposal-generator/
├── frontend/                      # React frontend application
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Page components
│   │   │   ├── HomePage.jsx      # Opportunity ID entry
│   │   │   └── ProposalBuilderPage.jsx  # 4-step workflow
│   │   ├── hooks/
│   │   │   └── useProposalBuilder.js  # Main workflow hook (uses API client)
│   │   ├── services/
│   │   │   └── api.js            # REST API client
│   │   └── utils/
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example              # VITE_API_URL, VITE_OPENAI_API_KEY
│   └── package.json
│
├── backend/                       # Express backend + Firebase
│   ├── src/
│   │   ├── config/
│   │   │   ├── firebase.js       # Firebase initialization
│   │   │   ├── extractionPrompts.js  # AI extraction prompts
│   │   │   └── sectionPrompts.js     # AI generation prompts
│   │   ├── services/
│   │   │   ├── database.js       # Firestore CRUD operations
│   │   │   ├── extraction.js     # AI extraction services
│   │   │   └── proposalGenerator.js  # AI generation services
│   │   ├── models/
│   │   │   ├── constants.js      # Service IDs, Section IDs
│   │   │   └── types.js          # JSDoc type definitions
│   │   ├── routes/
│   │   │   ├── database.js       # Database API routes
│   │   │   ├── extraction.js     # Extraction API routes
│   │   │   └── generation.js     # Generation API routes
│   │   ├── data/
│   │   │   └── seedData.js       # Seed data (templates, services, etc.)
│   │   └── index.js              # Express server entry point
│   ├── scripts/
│   │   └── seedDatabase.js       # Database seeding script
│   ├── .env.example              # Firebase credentials
│   └── package.json
│
├── package.json                   # Root monorepo scripts
├── CLAUDE.md                      # This file
├── README.md                      # User documentation
└── .gitignore
```

## Technology Stack

### Frontend
- **React 18** with hooks
- **React Router 7** for routing
- **Vite 6** for build/dev server
- **Vanilla CSS** with GCM brand colors

### Backend
- **Express.js 4** REST API
- **Firebase 12** client SDK
- **Firebase Admin** for server-side operations
- **OpenAI GPT-4** for AI services
- **Node.js 18+** with ES modules

### Communication
- REST API with JSON payloads
- CORS enabled for local development
- Frontend uses fetch-based API client (`frontend/src/services/api.js`)

## Environment Configuration

### Backend `.env` (backend/.env)
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# OpenAI API Key (for seed script testing)
VITE_OPENAI_API_KEY=sk-...

# Server Port (optional, defaults to 3001)
PORT=3001
```

### Frontend `.env` (frontend/.env)
```env
# OpenAI API Key
VITE_OPENAI_API_KEY=sk-...

# Backend API URL (defaults to http://localhost:3001/api)
VITE_API_URL=http://localhost:3001/api
```

## Development Commands

### Root Level (Monorepo)
```bash
npm run install:all    # Install all dependencies (root, frontend, backend)
npm run dev           # Start both backend and frontend concurrently
npm run seed          # Seed the database (backend)
npm run build         # Build frontend for production
```

### Backend Only
```bash
cd backend
npm run dev           # Start with nodemon (auto-reload)
npm start            # Start in production mode
npm run seed         # Seed the database
```

### Frontend Only
```bash
cd frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## API Architecture

The frontend communicates with the backend via REST API. All API calls go through the `api` client in `frontend/src/services/api.js`.

### API Endpoints

**Database Operations**
- `GET /api/database/proposals` - Get all proposals
- `GET /api/database/proposals/:id` - Get proposal by ID
- `POST /api/database/proposals` - Create proposal
- `POST /api/database/proposals/with-id/:id` - Create with custom ID
- `GET /api/database/proposals/by-opportunity/:opportunityId` - Get by opportunity ID
- Similar CRUD for: client-briefs, sections, documents, templates, styles, services, exemplars

**Extraction Operations**
- `POST /api/extraction/client-brief` - Extract client brief from transcript
  - Body: `{ apiKey, transcriptText }`
- `POST /api/extraction/document-summary` - Summarize document
  - Body: `{ apiKey, documentText, documentType }`
- `POST /api/extraction/suggest-services` - Suggest services
  - Body: `{ apiKey, clientBrief }`

**Generation Operations**
- `POST /api/generation/section` - Generate single section
  - Body: `{ apiKey, templateSection, clientBriefId, selectedServiceIds, proposalInstanceId }`
- `POST /api/generation/all-sections` - Generate all sections
  - Body: `{ apiKey, proposalInstanceId }`
- `POST /api/generation/revise` - Revise section
  - Body: `{ apiKey, sectionInstanceId, comment }`

## Firebase Collections

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

## 4-Step Workflow

**URL Pattern:** `/proposal/:opportunityId`

1. **Upload Transcript**
   - Upload Fireflies transcript
   - Backend extracts ClientBrief
   - Backend suggests services
   - Frontend displays suggestions

2. **Configure Services**
   - Select services (pre-checked based on AI suggestion)
   - Enter business name
   - Frontend creates ProposalInstance via API

3. **Generate Proposal**
   - Backend generates all 9 sections sequentially
   - Progress tracking (future: implement SSE or WebSockets)
   - Frontend displays progress

4. **Review & Edit** ⚠️ **NOT YET IMPLEMENTED**
   - Display all sections
   - Edit interface
   - Revision workflow (comment → AI revision)
   - Export to .docx or .md

## Data Flow

```
User uploads transcript (txt)
    ↓
Frontend → POST /api/extraction/client-brief → Backend (AI)
    ↓
Backend creates ClientBrief in Firestore
    ↓
Backend → POST /api/extraction/suggest-services → AI suggests services
    ↓
Frontend displays services, user selects
    ↓
Frontend → POST /api/database/proposals/with-id/:id → Backend creates ProposalInstance
    ↓
Frontend → POST /api/generation/all-sections → Backend generates 9 sections (AI)
    ↓
Backend creates ProposalSectionInstance × 9 in Firestore
    ↓
Frontend displays sections for review
```

## Working with This Codebase

### To Add a New API Endpoint

1. Add route in `backend/src/routes/*.js`
2. Implement handler using existing services
3. Add method to `frontend/src/services/api.js` client
4. Use in frontend hooks/components

### To Modify AI Prompts

1. Edit `backend/src/config/extractionPrompts.js` for extraction
2. Edit `backend/src/config/sectionPrompts.js` for generation
3. Restart backend (changes take effect immediately)

### To Add a New Service Module

1. Add to `backend/src/data/seedData.js` in `serviceModules` array
2. Add service ID to `backend/src/models/constants.js` → `ServiceIds`
3. Re-run `npm run seed`

### To Add a New Proposal Section

1. Add to `backend/src/data/seedData.js` in `defaultProposalTemplate.sections`
2. Add section ID to `backend/src/models/constants.js` → `SectionIds`
3. Create exemplars in `sectionExemplars` array
4. Update generation logic in `backend/src/services/proposalGenerator.js`
5. Re-run `npm run seed`

## Common Issues & Solutions

### Backend won't start
- **Check:** Firebase credentials in `backend/.env` are correct
- **Check:** Port 3001 is not in use (`lsof -i :3001` or `netstat -ano | findstr :3001`)
- **Check:** All dependencies installed (`cd backend && npm install`)

### Frontend can't connect to backend
- **Check:** Backend is running (`http://localhost:3001/health` should return `{"status":"ok"}`)
- **Check:** `VITE_API_URL` in `frontend/.env` is correct
- **Check:** CORS is enabled in backend (check browser console for errors)

### Seed script fails
- **Check:** Firebase credentials in `backend/.env`
- **Check:** Firestore is enabled in Firebase Console
- **Check:** Firestore security rules allow writes (use test mode for development)

### API calls fail with 404
- **Check:** Backend routes are correctly registered in `backend/src/index.js`
- **Check:** API client URLs match backend routes (e.g., `/api/database/proposals`)
- **Check:** Backend logs for errors

## Code Patterns

### Frontend: Making API Calls
```javascript
import api from '../services/api';

// In your hook or component
const brief = await api.extraction.extractClientBrief(apiKey, transcriptText);
const proposal = await api.database.proposals.get(proposalId);
const sections = await api.generation.generateAllSections(apiKey, proposalInstanceId);
```

### Backend: Creating New Routes
```javascript
// backend/src/routes/myRoutes.js
import express from 'express';
const router = express.Router();

router.post('/my-endpoint', async (req, res, next) => {
  try {
    const { param1, param2 } = req.body;
    // ... do work
    res.json({ result: 'success' });
  } catch (error) {
    next(error);  // Pass to error handler
  }
});

export default router;
```

### Backend: Using Database Services
```javascript
import { proposalInstances, clientBriefs } from '../services/database.js';

// Create
const proposal = await proposalInstances.create({ ...data });

// Read
const proposal = await proposalInstances.get(proposalId);
const proposals = await proposalInstances.getAll();

// Update
await proposalInstances.update(proposalId, { status: 'generated' });

// Delete
await proposalInstances.delete(proposalId);
```

## Testing Checklist

Before considering the reorganization "complete":

- [ ] Root `npm run install:all` succeeds
- [ ] Backend starts without errors (`npm run dev:backend`)
- [ ] Frontend starts without errors (`npm run dev:frontend`)
- [ ] Both start together (`npm run dev` from root)
- [ ] Seed script runs (`npm run seed`)
- [ ] Backend health check works (`http://localhost:3001/health`)
- [ ] Frontend can reach backend API
- [ ] Step 1: File upload works
- [ ] Step 1: Transcript extraction creates ClientBrief
- [ ] Step 1: Services are suggested
- [ ] Step 2: Services are pre-checked
- [ ] Step 2: Proposal creation succeeds
- [ ] Step 3: Section generation runs
- [ ] Step 3: All 9 sections are created
- [ ] Step 4: Sections display (needs implementation)

## Important Notes for AI Assistants

1. **This is Phase 3** - Separated frontend/backend architecture with REST API
2. **Frontend never imports backend directly** - All communication via API client
3. **Backend is stateless** - Each request is independent
4. **The seed script is critical** - Run from backend directory
5. **Step 4 is incomplete** - Review/Edit interface needs implementation
6. **No direct Firebase calls from frontend** - All Firestore operations through backend API
7. **Use api client** - `frontend/src/services/api.js` for all backend communication
8. **Console.log instead of logger** - Frontend uses console.log (no logger utility)

## Cost Considerations

- **Initial generation:** ~18k tokens (~$0.18-0.20 per proposal)
- **Section revision:** ~2k tokens per section (~$0.02-0.03 per revision)
- Uses token-efficient section-by-section generation (vs 30k+ for monolithic)

## Next Steps

1. **Test the reorganization** - Verify both servers start and communicate
2. **Implement Step 4** - Build the Review & Edit interface
3. **Add progress tracking** - Implement SSE or WebSockets for real-time progress
4. **Add authentication** - Secure the API endpoints
5. **Add file uploads** - Support uploading supporting documents via API
6. **Deploy** - Backend to Node.js host, frontend to static host
