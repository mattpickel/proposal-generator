# Migration Guide: Monolithic to Frontend/Backend Architecture

This guide explains how to migrate from the old monolithic structure to the new separated frontend/backend architecture.

## What Changed

### Before (Monolithic)
```
proposal-generator/
├── src/                    # Mixed frontend and backend code
│   ├── components/
│   ├── services/          # Direct Firebase imports in frontend
│   ├── config/
│   └── ...
├── scripts/
├── package.json           # Single package.json
└── vite.config.js
```

### After (Separated)
```
proposal-generator/
├── frontend/              # React app (standalone)
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js     # API client (no direct Firebase)
│   └── package.json
├── backend/               # Express API (standalone)
│   ├── src/
│   │   ├── services/      # Firebase operations
│   │   └── routes/        # API endpoints
│   └── package.json
└── package.json           # Monorepo coordination
```

## Key Architectural Changes

1. **Frontend → Backend Communication**
   - Old: Direct Firebase imports (`import { db } from '../config/firebase'`)
   - New: REST API calls (`api.database.proposals.get(id)`)

2. **Service Layer**
   - Old: Frontend directly calls Firebase services
   - New: Frontend → API → Backend services → Firebase

3. **Dependencies**
   - Old: Single `package.json` with all dependencies
   - New: Separate dependencies for frontend and backend

4. **Environment Variables**
   - Old: Single `.env` file
   - New: Separate `.env` for frontend and backend

## Migration Steps

### 1. Install Dependencies

```bash
# From project root
npm install                    # Install root dependencies (concurrently)
npm run install:all           # Install frontend and backend deps
```

### 2. Set Up Environment Variables

**Create `backend/.env`:**
```env
VITE_FIREBASE_API_KEY=your-firebase-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_OPENAI_API_KEY=sk-...
PORT=3001
```

**Create `frontend/.env`:**
```env
VITE_OPENAI_API_KEY=sk-...
VITE_API_URL=http://localhost:3001/api
```

You can copy your existing `.env` to both locations and remove unnecessary variables.

### 3. Seed the Database

```bash
npm run seed
```

This runs the backend seed script (`backend/scripts/seedDatabase.js`).

### 4. Test the Application

```bash
# Start both servers
npm run dev

# Or start separately
npm run dev:backend    # Terminal 1
npm run dev:frontend   # Terminal 2
```

**Verify:**
- Backend: http://localhost:3001/health should return `{"status":"ok"}`
- Frontend: http://localhost:5173 should load the home page

## Code Changes Reference

### Frontend Hook Changes

**Old** (`src/hooks/useProposalBuilder.js`):
```javascript
import { proposalInstances } from '../services/database';
import { extractClientBrief } from '../services/extraction';

const brief = await extractClientBrief(apiKey, text);
const proposal = await proposalInstances.create(data);
```

**New** (`frontend/src/hooks/useProposalBuilder.js`):
```javascript
import api from '../services/api';

const brief = await api.extraction.extractClientBrief(apiKey, text);
const proposal = await api.database.proposals.create(data);
```

### No More Direct Firebase Imports in Frontend

**Old**:
```javascript
// ❌ This no longer works in frontend
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
```

**New**:
```javascript
// ✅ Use the API client instead
import api from '../services/api';
const proposals = await api.database.proposals.getAll();
```

## API Endpoint Mapping

| Old (Direct Service Call) | New (API Endpoint) |
|---------------------------|---------------------|
| `proposalInstances.getAll()` | `GET /api/database/proposals` |
| `proposalInstances.get(id)` | `GET /api/database/proposals/:id` |
| `proposalInstances.create(data)` | `POST /api/database/proposals` |
| `proposalInstances.update(id, data)` | `PUT /api/database/proposals/:id` |
| `extractClientBrief(apiKey, text)` | `POST /api/extraction/client-brief` |
| `suggestServices(apiKey, brief)` | `POST /api/extraction/suggest-services` |
| `generateAllSections(...)` | `POST /api/generation/all-sections` |

## Logging Changes

**Old**:
```javascript
import { log } from '../utils/logger';
log.info('Component', 'Message', { data });
```

**New** (Frontend):
```javascript
// Use console.log in frontend
console.log('Component - Message', { data });
```

**New** (Backend):
```javascript
// Backend still has logger
import { log } from '../utils/logger.js';
log.info('Service', 'Message', { data });
```

## Troubleshooting Migration Issues

### "Cannot find module" errors
- Make sure you ran `npm run install:all`
- Check that you're importing from correct paths
- Frontend imports should use `../services/api`, not `../services/database`

### "Network error" or "Failed to fetch"
- Verify backend is running on port 3001
- Check `VITE_API_URL` in `frontend/.env`
- Look for CORS errors in browser console

### "Firebase not initialized"
- Check `backend/.env` has all Firebase credentials
- Backend must be running for Firebase operations

### Old imports still present
- Search for `from '../services/database'` in frontend code
- Replace with `from '../services/api'`
- Update function calls to use API client methods

## Rollback Plan

If you need to rollback to the old structure:

1. Keep the original `src/` directory (don't delete it yet)
2. Restore original `package.json` from git
3. Run `npm install` from root
4. Use original `.env` file

**Recommendation**: Test the new architecture thoroughly before deleting the old `src/` directory.

## Production Deployment Changes

### Old Deployment
- Single build: `npm run build`
- Deploy `dist/` folder
- Configure Firebase client in browser

### New Deployment

**Backend**:
- Deploy to Node.js hosting (Heroku, Railway, Render, etc.)
- Set environment variables in hosting platform
- Ensure port binding works (use `process.env.PORT`)

**Frontend**:
- Build: `cd frontend && npm run build`
- Deploy `frontend/dist/` to static hosting (Netlify, Vercel, etc.)
- Set `VITE_API_URL` to production backend URL

## Benefits of New Architecture

1. **Clear Separation**: Frontend and backend are independent
2. **Scalability**: Can scale frontend and backend separately
3. **Security**: Firebase credentials only in backend
4. **Flexibility**: Can swap frontend or backend independently
5. **Team Development**: Frontend and backend teams can work independently

## Questions?

Check:
- `README.md` for general documentation
- `CLAUDE.md` for architecture details
- `backend/src/routes/*.js` for API endpoint definitions
- `frontend/src/services/api.js` for API client usage
