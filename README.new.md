# Good Circle Marketing Proposal Generator

An AI-powered proposal generator built with React (frontend) and Express/Firebase (backend). Generates customized marketing proposals from Fireflies transcripts using OpenAI GPT-4.

## Project Structure

This is a monorepo with separate frontend and backend:

```
proposal-generator/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components (Home, ProposalBuilder)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API client
│   │   └── utils/        # Frontend utilities
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/               # Express backend API + Firebase
│   ├── src/
│   │   ├── config/       # Firebase config, AI prompts
│   │   ├── services/     # Database, extraction, generation services
│   │   ├── models/       # Data models and types
│   │   ├── routes/       # Express API routes
│   │   ├── data/         # Seed data
│   │   └── index.js      # Express server entry point
│   ├── scripts/
│   │   └── seedDatabase.js
│   └── package.json
│
├── package.json          # Root package with monorepo scripts
├── CLAUDE.md            # AI assistant instructions
└── README.md            # This file
```

## Technology Stack

### Frontend
- **React 18** with hooks
- **React Router** for routing
- **Vite** for build tooling
- **Vanilla CSS** with GCM brand colors

### Backend
- **Express.js** REST API
- **Firebase/Firestore** for database
- **OpenAI GPT-4** for AI generation
- **Node.js 18+**

## Quick Start

### Prerequisites
- Node.js 18 or higher
- Firebase project with Firestore enabled
- OpenAI API key with GPT-4 access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd proposal-generator
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Set up environment variables:

**Backend** (`backend/.env`):
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
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

**Frontend** (`frontend/.env`):
```env
# OpenAI API Key
VITE_OPENAI_API_KEY=sk-...

# Backend API URL
VITE_API_URL=http://localhost:3001/api
```

4. Seed the database:
```bash
npm run seed
```

5. Start development servers:
```bash
npm run dev
```

This will start:
- Backend API on `http://localhost:3001`
- Frontend on `http://localhost:5173`

## Development Commands

### Root Level (run both frontend and backend)
```bash
npm run install:all    # Install all dependencies
npm run dev           # Start both frontend and backend
npm run seed          # Seed the database
npm run build         # Build frontend for production
```

### Backend Only
```bash
cd backend
npm run dev           # Start backend with nodemon (auto-reload)
npm start            # Start backend in production mode
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

The frontend communicates with the backend via REST API:

### API Endpoints

**Database Operations** (`/api/database/*`)
- `GET /api/database/proposals` - Get all proposals
- `GET /api/database/proposals/:id` - Get proposal by ID
- `POST /api/database/proposals` - Create new proposal
- `POST /api/database/proposals/with-id/:id` - Create with custom ID
- Similar CRUD endpoints for: client-briefs, sections, documents, templates, styles, services, exemplars

**Extraction Operations** (`/api/extraction/*`)
- `POST /api/extraction/client-brief` - Extract client brief from transcript
- `POST /api/extraction/document-summary` - Summarize supporting document
- `POST /api/extraction/suggest-services` - Suggest services based on brief

**Generation Operations** (`/api/generation/*`)
- `POST /api/generation/section` - Generate single section
- `POST /api/generation/all-sections` - Generate all 9 sections
- `POST /api/generation/revise` - Revise a section

## Workflow

1. **Upload Transcript** - User uploads Fireflies transcript
2. **AI Extraction** - Backend extracts ClientBrief and suggests services
3. **Configure Services** - User selects services and enters business name
4. **Generate Proposal** - Backend generates all 9 sections using GPT-4
5. **Review & Edit** - User reviews sections and can request AI revisions

## Firebase Collections

| Collection | Purpose |
|------------|---------|
| `clientBriefs` | Extracted client information from transcripts |
| `proposalTemplates` | Section structure definitions (9 sections) |
| `styleCards` | Writing style guidelines for AI |
| `serviceModules` | Service definitions + pricing |
| `sectionExemplars` | Example snippets for each section |
| `proposalInstances` | Created proposal metadata |
| `proposalSections` | Generated section content (versioned) |
| `supportingDocuments` | Additional client documents |

## Key Features

- **Section-by-section generation**: Reduces token usage from 30k+ to ~18k per proposal
- **AI service suggestion**: Automatically recommends relevant services
- **Versioned revisions**: Each section revision creates a new version
- **Firebase-backed**: Persistent storage with real-time capabilities
- **Modular architecture**: Clean separation between frontend and backend

## Cost Considerations

- **Initial generation**: ~18k tokens (~$0.18-0.20 per proposal)
- **Section revision**: ~2k tokens per section (~$0.02-0.03 per revision)

## Troubleshooting

### Backend won't start
- Check Firebase credentials in `backend/.env`
- Ensure Firestore is enabled in Firebase Console
- Check port 3001 is not in use

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check `VITE_API_URL` in `frontend/.env`
- Check browser console for CORS errors

### Seed script fails
- Ensure Firebase credentials are correct
- Check Firestore security rules allow writes
- Verify `backend/.env` has all required Firebase variables

## Production Deployment

### Backend
Deploy to any Node.js hosting (Heroku, Railway, Render, etc.):
```bash
cd backend
npm start
```

Set environment variables in hosting platform.

### Frontend
Build and deploy static files:
```bash
cd frontend
npm run build
```

Deploy `dist/` folder to Netlify, Vercel, or any static hosting.

Update `VITE_API_URL` to point to production backend URL.

## Contributing

See `CLAUDE.md` for AI assistant instructions and architecture details.

## License

Proprietary - Good Circle Marketing
