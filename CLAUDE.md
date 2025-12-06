# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based AI-powered proposal generator for Good Circle Marketing that uses OpenAI's GPT-4 to create personalized marketing proposals from Fireflies transcripts, example proposals, and supporting documents.

## Development Commands

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
# Opens at http://localhost:5173
```

### Build for Production
```bash
npm run build
# Output: dist/ directory
```

### Preview Production Build
```bash
npm preview
```

## Environment Configuration

The app uses Vite environment variables (prefix: `VITE_`):

- `VITE_OPENAI_API_KEY` - OpenAI API key (optional; users can enter manually in UI)
- `VITE_GOOGLE_API_KEY` - Google API key for Drive integration

Copy `.env.example` to `.env` for local development. If `VITE_OPENAI_API_KEY` is set, it pre-loads for all users; otherwise users must enter it in the UI header.

## Architecture

### Modular React Application Structure

The app has been refactored into a well-organized, modular architecture:

**Directory Structure:**
```
src/
├── components/      # Reusable UI components
├── hooks/           # Custom React hooks
├── services/        # API integrations (OpenAI, Google Drive)
├── utils/           # Utility functions
├── config/          # Configuration and constants
├── App.jsx          # Main application (now ~190 lines)
└── main.jsx         # Entry point
```

**Components** (`src/components/`):
- `Header.jsx` - Application header with Google Drive auth
- `Toast.jsx` - Toast notification display
- `FirefliesUpload.jsx` - Fireflies transcript upload
- `FileList.jsx` - Reusable file list (examples & docs)
- `CommentsInput.jsx` - Comments and instructions input
- `ProposalEditor.jsx` - Main proposal editing interface
- `ProposalStats.jsx` - Word count and statistics
- `IterationPanel.jsx` - Proposal iteration UI

**Custom Hooks** (`src/hooks/`):
- `useLocalStorage.js` - Persists state to localStorage
- `useToast.js` - Toast notification management
- `useGoogleDrive.js` - Google Drive authentication and file picking
- `useProposal.js` - Proposal generation and iteration logic
- `useFileManager.js` - File collection management

**Services** (`src/services/`):
- `openai.js` - All OpenAI API calls (distillation, generation, iteration)
- `googleDrive.js` - Google Drive API integration

**Utilities** (`src/utils/`):
- `fileUtils.js` - File reading, formatting, downloading
- `markdown.js` - Markdown to HTML conversion and text analysis
- `toast.js` - Toast helper functions

**Configuration** (`src/config/`):
- `prompts.js` - **All AI prompts in editable format** ⭐
- `constants.js` - Application constants and configuration

### Key Features & Flow

1. **File Management System**
   - Fireflies transcript upload (optional)
   - Example proposals management (localStorage persistence)
   - Supporting documents management (localStorage persistence)
   - Google Drive integration for file selection

2. **AI-Powered Generation Pipeline** (4-step process):
   - Step 1: Distill Fireflies transcript (gpt-4o-mini, max 800 tokens)
   - Step 2: Distill example proposals into style guide (gpt-4o-mini, max 800 tokens)
   - Step 3: Distill supporting documents (gpt-4o-mini, max 800 tokens)
   - Step 4: Generate final proposal using distilled content (gpt-4-turbo-preview, max 4000 tokens)

3. **Proposal Iteration**
   - Users can provide feedback and regenerate
   - Uses existing proposal + iteration comments
   - Model: gpt-4-turbo-preview

### State Management

All state is managed via React hooks in App.jsx:
- `firefliesFile` - Uploaded Fireflies transcript
- `exampleFiles` - Array of example proposals (persisted to localStorage)
- `supportingDocs` - Array of supporting documents (persisted to localStorage)
- `proposalText` - Generated proposal markdown
- `apiKey` - OpenAI API key (from env or user input)
- `isGenerating` - Loading state
- `isEditing` - Toggle between edit/preview modes

### Google Drive Integration

- Uses Google API Client Library and Google Identity Services
- OAuth 2.0 flow for Drive access
- Google Picker API for file selection
- Handles both Google Docs (exported as text) and regular files
- Default folder ID: `1fvdEMZ-JNlpfSP1BZWDCzDFE_YfXs1hc`

### LocalStorage Keys

- `proposal-generator-examples` - Persisted example proposals
- `proposal-generator-supporting-docs` - Persisted supporting documents

### AI Prompt Engineering

**All prompts are centralized in `src/config/prompts.js` for easy editing and testing.**

The configuration file exports:
- `distillationPrompts` - Prompts for distilling transcripts, examples, and docs
- `buildProposalPrompt()` - Main proposal generation prompt builder
- `buildIterationPrompt()` - Iteration prompt builder
- `modelConfig` - AI model settings (model names, tokens, temperature)

**To edit prompts:**
1. Open `src/config/prompts.js`
2. Modify the prompt text or structure
3. Changes take effect immediately (no rebuild needed in dev mode)
4. Test by generating a new proposal

**Prompt structure features:**
- Structured sections with distilled content
- Clear role definition (expert marketing proposal writer)
- Detailed section requirements (word counts, structure)
- Example-based learning from user's past proposals
- Critical requirements list (formatting, tone, length)

### Markdown Handling

- Simple custom markdown-to-HTML converter in `markdownToHtml()`
- Supports: headings (h1-h3), bold, italic, lists (ul/ol)
- Preview mode renders HTML, edit mode shows raw markdown

## Tech Stack

- **React 18** - UI framework
- **Vite 6** - Build tool and dev server
- **OpenAI GPT-4** - Proposal generation (gpt-4-turbo-preview, gpt-4o-mini)
- **Google APIs** - Drive integration (Picker API, Drive API v3)
- **Vanilla CSS** - All styling in App.css and index.css

## Working with the Refactored Architecture

### Adding New Features

**To add a new UI component:**
1. Create component in `src/components/YourComponent.jsx`
2. Export it from `src/components/index.js`
3. Import and use in `App.jsx` or other components

**To add a new custom hook:**
1. Create hook in `src/hooks/useYourHook.js`
2. Follow naming convention: `use*` prefix
3. Import and use in components

**To modify AI behavior:**
1. Edit prompts in `src/config/prompts.js`
2. Adjust model settings in `modelConfig` object
3. Test changes immediately in dev mode

**To add a new API service:**
1. Create service in `src/services/yourService.js`
2. Export functions for API calls
3. Import and use in hooks or components

### Important Code Patterns

**File Reading:**
All file uploads are converted to text via `readFileAsText()` utility in `src/utils/fileUtils.js`.

**Toast Notifications:**
Use the `useToast()` hook which provides `showToast(message, type)` function. Auto-dismisses after 3 seconds.

**LocalStorage Persistence:**
Use the `useLocalStorage(key, initialValue)` hook for automatic persistence. It handles serialization and saves only essential data (id, name, content).

**Error Handling:**
- API errors are caught in service layer and propagated to UI
- Toast notifications show user-friendly errors
- Graceful fallbacks (e.g., truncation instead of distillation on failure)

## Deployment Notes

The app is designed for static hosting:
- **Netlify**: Set `VITE_OPENAI_API_KEY` in environment variables
- **Cloudflare Pages**: Build command `npm run build`, output directory `dist`
- **Vercel**: Auto-detects Vite configuration

## Debugging and Logging

The app includes comprehensive debugging features for development:

**Debug Panel (Development Only):**
- Visible at bottom of screen in dev mode
- Real-time log viewing with filtering
- Export logs and distillation data
- Token usage tracking

**Smart Error Handling:**
- Rate limit errors (429) use fallback content and continue workflow
- Authentication errors (401) stop with clear guidance
- Each step can fail independently without stopping entire workflow
- Detailed error logging with recovery information

**Logging System:**
- Structured logs with categories (OpenAI, Workflow, Distillation, etc.)
- Four levels: DEBUG, INFO, WARN, ERROR
- Automatic log rotation (keeps last 100 entries)
- Export to JSON for analysis

**See DEBUGGING.md for detailed usage guide.**

## Cost Considerations

- Initial generation: ~$0.30-0.40 per proposal
- Iteration: ~$0.40-0.50 per update
- Uses token-efficient distillation strategy to reduce costs
