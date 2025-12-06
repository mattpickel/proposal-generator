# Manual Tasks Required for Implementation

**Complete these tasks so I can implement the entire system in one go.**

---

## 1. Database Setup (Choose One)

### Option A: Firebase/Firestore (RECOMMENDED)

**Why recommended:** Easy setup, real-time updates, good free tier, works in browser.

**Steps:**
1. Go to https://console.firebase.google.com/
2. Create new project (or use existing)
3. Enable Firestore Database (Start in test mode for now)
4. Go to Project Settings → General → Your apps
5. Add a Web app (if you haven't already)
6. Copy the Firebase configuration
7. Add to `.env` file:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

8. Set Firestore rules (for development):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
**⚠️ Warning:** These rules allow anyone to read/write. Set proper auth rules for production!

---

### Option B: Supabase

**Why use:** Postgres-based, good for complex queries, generous free tier.

**Steps:**
1. Go to https://supabase.com/
2. Create new project
3. Wait for database to initialize
4. Go to Settings → API
5. Copy URL and anon key
6. Add to `.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...
```

7. I will create the database schema via migrations

---

### Option C: LocalStorage/JSON (Quick Start Only)

**Why use:** No setup needed, but:
- No multi-user support
- No cloud backup
- Limited by browser storage (5-10MB)
- Data tied to one browser

**Steps:**
1. Just confirm you want this option
2. No credentials needed
3. I'll implement file import/export for backups

---

## 2. Example Proposals

**Gather 3-5 of your best proposal PDFs:**

1. Create folder: `data/example-proposals/`
2. Copy your example proposal PDFs there
3. Name them descriptively:
   - `marketing-machine-only.pdf`
   - `marketing-machine-plus-828.pdf`
   - `fractional-cmo-retainer.pdf`
   - etc.

**For each PDF, note:**
- Which services it includes (Marketing Machine, SEO, 828, etc.)
- Any unique sections or variations
- Approximate price range

---

## 3. PDF Processing Library Choice

**I need to know which to use:**

### Option A: pdf-parse (Node.js)
- **Pros:** More accurate, better formatting preservation
- **Cons:** Requires Node.js backend or build step
- **Use if:** You're okay running a Node script for ingestion

### Option B: pdf.js (Browser)
- **Pros:** Runs entirely in browser, no backend needed
- **Cons:** Slightly less accurate, more complex
- **Use if:** You want everything browser-based

### Option C: Manual Copy-Paste
- **Pros:** No library needed, you control quality
- **Cons:** Manual work to extract text from PDFs
- **Use if:** You have only a few examples

**Your choice:** ___________

---

## 4. Service & Pricing Information

**Please provide current pricing for each service:**

### Marketing Machine
- One-time setup: $___________
- Description: _________________________________

### Internal Communications
- One-time or monthly: $___________
- Description: _________________________________

### SEO/Hosting/Digital Upgrades
- One-time: $___________
- Description: _________________________________

### 828 Marketing
- Monthly: $___________
- Description: _________________________________

### Fractional CMO
- Monthly: $___________
- Description: _________________________________

### Other Services
- Name: ____________ Price: $_______ Type: _______
- Name: ____________ Price: $_______ Type: _______

---

## 5. Google Drive (Keep or Remove?)

**Current system uses Google Drive integration.**

Do you want to:
- [ ] Keep it (users can select files from Drive)
- [ ] Remove it (simplify the app)
- [ ] Keep but make optional

**Your choice:** ___________

---

## 6. API Keys

**Confirm you still have:**
- [ ] OpenAI API key (already in .env or will add)
- [ ] Google API key for Drive (if keeping Google Drive integration)

---

## Complete This Checklist

- [ ] **Database:** I chose __________ (Firebase/Supabase/LocalStorage)
- [ ] **Database credentials:** Added to `.env` file
- [ ] **Example PDFs:** Placed 3-5 PDFs in `data/example-proposals/`
- [ ] **PDF library:** I want to use __________ (pdf-parse/pdf.js/manual)
- [ ] **Service pricing:** Filled out above
- [ ] **Google Drive:** Keep/Remove/Optional: __________
- [ ] **OpenAI API key:** Confirmed in `.env`

---

## Additional Context (Optional)

**Anything else I should know:**
- Specific section names you always use?
- Services you plan to add soon?
- Any special requirements?

---

## When You're Done

Reply with:
1. Your database choice + confirmation credentials are in `.env`
2. Your PDF processing choice
3. Any notes or questions

Then I'll implement the entire system based on your choices!
