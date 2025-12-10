# Quick Start Guide

Get the proposal generator running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Firebase project created
- OpenAI API key with GPT-4 access

## Step 1: Install Dependencies (2 min)

```bash
npm run install:all
```

This installs dependencies for root, frontend, and backend.

## Step 2: Configure Environment (2 min)

### Backend Configuration

Create `backend/.env`:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_OPENAI_API_KEY=sk-...
```

### Frontend Configuration

Create `frontend/.env`:

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_OPENAI_API_KEY=sk-...
VITE_API_URL=http://localhost:3001/api
```

## Step 3: Seed Database (30 sec)

```bash
cd ..
npm run seed
```

Expected output:
```
✓ Proposal template created
✓ Style card created
✓ 6 Service modules created
✓ Section exemplars created
```

## Step 4: Start Servers (30 sec)

```bash
npm run dev
```

This starts:
- Backend API on http://localhost:3001
- Frontend on http://localhost:5173

## Step 5: Verify (30 sec)

1. Open http://localhost:3001/health
   - Should see: `{"status":"ok"}`

2. Open http://localhost:5173
   - Should see the home page
   - Enter opportunity ID (e.g., "TEST-123")
   - Click "Start Proposal"

## You're Done!

The app is now running. Try uploading a Fireflies transcript to test the full workflow.

## Troubleshooting

### "Cannot find module" errors
```bash
npm run install:all
```

### Backend won't start
- Check Firebase credentials in `backend/.env`
- Check port 3001 is available

### Frontend can't connect
- Make sure backend is running
- Check `VITE_API_URL` in `frontend/.env`

### Seed fails
- Check Firebase credentials
- Check Firestore is enabled in Firebase Console

## Next Steps

- Read `README.md` for full documentation
- Read `TESTING_CHECKLIST.md` to verify everything works
- Read `CLAUDE.md` for architecture details

## Common Commands

```bash
# Start both servers
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Seed database
npm run seed

# Build for production
npm run build
```

## Getting Help

1. Check `README.md` for documentation
2. Check `MIGRATION_GUIDE.md` for migration help
3. Check `TESTING_CHECKLIST.md` for troubleshooting
4. Check browser console for frontend errors
5. Check backend terminal for API errors
