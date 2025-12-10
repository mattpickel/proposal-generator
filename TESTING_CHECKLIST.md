# Testing Checklist for Reorganized Project

Use this checklist to verify the reorganization was successful.

## Initial Setup

- [ ] Run `npm run install:all` from project root
  - Should install root dependencies
  - Should install frontend dependencies
  - Should install backend dependencies
  - No errors should occur

- [ ] Create `backend/.env` with Firebase credentials
  ```env
  VITE_FIREBASE_API_KEY=...
  VITE_FIREBASE_AUTH_DOMAIN=...
  VITE_FIREBASE_PROJECT_ID=...
  VITE_FIREBASE_STORAGE_BUCKET=...
  VITE_FIREBASE_MESSAGING_SENDER_ID=...
  VITE_FIREBASE_APP_ID=...
  VITE_OPENAI_API_KEY=...
  PORT=3001
  ```

- [ ] Create `frontend/.env` with API configuration
  ```env
  VITE_OPENAI_API_KEY=...
  VITE_API_URL=http://localhost:3001/api
  ```

## Backend Testing

- [ ] Start backend server
  ```bash
  cd backend
  npm run dev
  ```
  - Should start without errors
  - Should show: "Backend API server running on http://localhost:3001"

- [ ] Test health endpoint
  - Open http://localhost:3001/health in browser
  - Should return: `{"status":"ok","timestamp":"..."}`

- [ ] Run seed script
  ```bash
  npm run seed
  # (from root or backend directory)
  ```
  - Should create proposal template
  - Should create style card
  - Should create 6 service modules
  - Should create section exemplars
  - No errors should occur

- [ ] Verify Firebase data
  - Open Firebase Console
  - Check `proposalTemplates` collection has 1 document
  - Check `styleCards` collection has 1 document
  - Check `serviceModules` collection has 6 documents
  - Check `sectionExemplars` collection has multiple documents

## Frontend Testing

- [ ] Start frontend server
  ```bash
  cd frontend
  npm run dev
  ```
  - Should start without errors
  - Should show: "Local: http://localhost:5173/"

- [ ] Test home page
  - Open http://localhost:5173 in browser
  - Should load without errors
  - Should show opportunity ID input

- [ ] Navigate to proposal page
  - Enter an opportunity ID (e.g., "TEST-123")
  - Should navigate to `/proposal/TEST-123`
  - Should load ProposalBuilderPage
  - Should show 4 steps

## Integration Testing

- [ ] Start both servers together
  ```bash
  # From project root
  npm run dev
  ```
  - Both backend and frontend should start
  - No errors in either terminal

- [ ] Test Step 1: Upload Transcript
  - Upload a sample Fireflies transcript
  - Should extract client brief
  - Should suggest services
  - Check browser console for API calls
  - Check backend logs for processing

- [ ] Test Step 2: Configure Services
  - Services should be pre-selected based on AI suggestion
  - Enter business name
  - Click to create proposal
  - Should navigate to Step 3

- [ ] Test Step 3: Generate Proposal
  - Should start generating sections
  - Check progress updates
  - All 9 sections should be generated
  - Check Firebase for `proposalSections` documents

- [ ] Test Step 4: Review (if implemented)
  - Should display all sections
  - Should allow editing
  - Should allow revisions

## API Testing

You can test API endpoints directly using curl or Postman:

- [ ] Test database endpoint
  ```bash
  curl http://localhost:3001/api/database/services
  ```
  - Should return array of 6 services

- [ ] Test extraction endpoint (requires valid API key)
  ```bash
  curl -X POST http://localhost:3001/api/extraction/client-brief \
    -H "Content-Type: application/json" \
    -d '{"apiKey":"sk-...","transcriptText":"Sample transcript"}'
  ```
  - Should return extracted client brief

## Error Handling

- [ ] Test backend without Firebase credentials
  - Remove Firebase env vars from `backend/.env`
  - Start backend
  - Should show Firebase initialization error

- [ ] Test frontend without backend running
  - Stop backend server
  - Try to upload transcript in frontend
  - Should show network error in browser console

- [ ] Test with invalid API key
  - Use invalid OpenAI key
  - Try to process transcript
  - Should show API error

## Performance

- [ ] Check backend startup time
  - Should start in < 2 seconds

- [ ] Check frontend build time
  ```bash
  cd frontend
  npm run build
  ```
  - Should complete in < 30 seconds

- [ ] Check API response times
  - Health endpoint: < 100ms
  - Database queries: < 500ms
  - AI operations: 5-30 seconds (expected)

## Documentation

- [ ] Read `README.new.md`
  - Verify instructions are clear
  - Verify all commands work

- [ ] Read `CLAUDE.new.md`
  - Verify architecture is documented
  - Verify all sections are accurate

- [ ] Read `MIGRATION_GUIDE.md`
  - Verify migration steps are clear
  - Verify examples match actual code

## Cleanup (Optional)

After verifying everything works:

- [ ] Replace old documentation
  ```bash
  mv README.md README.old.md
  mv CLAUDE.md CLAUDE.old.md
  mv README.new.md README.md
  mv CLAUDE.new.md CLAUDE.md
  ```

- [ ] Remove old source directory (backup first!)
  ```bash
  # Backup
  mkdir -p backup
  mv src backup/src-old-$(date +%Y%m%d)

  # Or just delete
  rm -rf src
  ```

- [ ] Update `.gitignore`
  - Add `backend/.env`
  - Add `frontend/.env`
  - Add `backend/node_modules`
  - Add `frontend/node_modules`
  - Add `frontend/dist`

- [ ] Commit changes
  ```bash
  git add .
  git commit -m "Reorganize into frontend/backend architecture"
  ```

## Troubleshooting

If something doesn't work:

1. Check that all dependencies are installed
2. Check environment variables are set correctly
3. Check both servers are running
4. Check browser console for errors
5. Check backend terminal for errors
6. Check Firebase console for data
7. Refer to `MIGRATION_GUIDE.md` for common issues

## Success Criteria

All of the following should be true:

✅ Both servers start without errors
✅ Seed script populates Firebase
✅ Frontend can load and navigate
✅ API endpoints respond correctly
✅ Can upload and process transcript
✅ Can create proposal
✅ Can generate sections
✅ Data persists in Firebase

If all checked, the reorganization was successful!
