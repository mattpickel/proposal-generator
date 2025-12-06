# Setup Guide

## Prerequisites

1. Node.js 18+ installed
2. Firebase project created
3. OpenAI API key

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` with your actual credentials:

```env
# OpenAI API Key (get from https://platform.openai.com/api-keys)
VITE_OPENAI_API_KEY=sk-...

# Firebase Configuration (get from Firebase Console)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Firestore Database**:
   - Go to Build > Firestore Database
   - Click "Create database"
   - Start in **test mode** (for development)
   - Choose a location
4. Get your Firebase config:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click the web icon (`</>`)
   - Copy the config values to your `.env` file

### 4. Seed the Database

Run the seed script to populate Firebase with default data:

```bash
npm run seed
```

This will create:
- 1 Proposal Template (9 sections: Header, Overview, Services Summary, Scope, Deliverables, Timeline, Investment, Terms, Signature)
- 1 Style Card (Good Circle Marketing house style)
- 6 Service Modules (Marketing Machine, Internal Comms, SEO/Hosting, Digital Upgrades, 828 Marketing, Fractional CMO)
- Multiple Section Exemplars (example snippets for each section)

### 5. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Usage

### Creating a New Proposal

1. Go to home page
2. Enter an opportunity ID (e.g., "OPP-2024-123")
3. Follow the 4-step workflow:
   - **Step 1**: Upload Fireflies transcript
   - **Step 2**: Select services (AI auto-suggests based on transcript)
   - **Step 3**: Generate proposal sections
   - **Step 4**: Review and edit

### Workflow Details

**Step 1: Upload Transcript**
- Upload a Fireflies transcript (.txt or .docx)
- AI extracts client brief (name, goals, pain points, etc.)
- AI suggests relevant services

**Step 2: Configure Services**
- Review suggested services (pre-selected)
- Add/remove services as needed
- Enter client business name
- Create proposal instance

**Step 3: Generate Proposal**
- Generates all 9 sections sequentially
- Uses client brief + service modules + style card + exemplars
- Shows progress (current section X of 9)

**Step 4: Review & Edit**
- View generated proposal
- Edit individual sections
- Revise sections with AI assistance
- Export final proposal

## Firebase Collections

The app uses these Firestore collections:

- `clientBriefs` - Extracted client information from transcripts
- `proposalTemplates` - Section structure definitions
- `styleCards` - Writing style guidelines
- `serviceModules` - Service definitions with pricing
- `sectionExemplars` - Example snippets for sections
- `proposalInstances` - Created proposals
- `proposalSections` - Generated section content (versioned)
- `supportingDocuments` - Additional client documents

## Troubleshooting

**Seed fails with "Permission denied"**
- Make sure Firestore is in test mode or update security rules
- Check that Firebase config is correct in `.env`

**"Cannot find module" errors**
- Run `npm install` to ensure all dependencies are installed
- Check that you're using Node 18+

**API errors during generation**
- Verify OpenAI API key is correct
- Check API key has sufficient credits
- Ensure you have access to GPT-4 models

**No sections generated**
- Check browser console for errors
- Verify Firebase connection is working
- Make sure seed script ran successfully

## Development Notes

- The app uses React Router for `/proposal/:opportunityId` routing
- State management is via React hooks (useProposalBuilder)
- All AI prompts are in `src/config/` for easy editing
- Logging is available via browser DevTools console
