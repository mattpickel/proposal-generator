# Good Circle Marketing - Proposal Generator

A beautiful React app for generating personalized marketing proposals using Claude AI.

## Features

- 📤 **File Upload**: Drag & drop Fireflies transcripts
- 📚 **Example Management**: Pre-populated proposals with add/remove
- 💬 **Custom Instructions**: Add special requests and focus areas
- ✨ **AI Generation**: ChatGPT powered proposal creation
- 📝 **Edit & Preview**: Toggle between editing and formatted preview
- 🔄 **Iteration**: Refine proposals with natural language feedback
- 📋 **Export**: Copy to clipboard or download as markdown

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Configure API Key

**Option A: Environment Variable (Recommended for shared use)**

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Get your OpenAI API key from [platform.openai.com](https://platform.openai.com)
3. Edit `.env` and add your key:
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-key-here
   ```
4. Restart the dev server
5. The API key will be pre-loaded for all users

**Option B: Manual Entry**

1. Leave `.env` empty
2. Users enter their API key in the app header (top right)
3. Key is stored in browser memory only

## Deployment

### Deploy to Netlify

**With Environment Variable (so your boss can use it without entering a key):**

1. Build and deploy:
   ```bash
   npm run build
   ```
2. In Netlify dashboard:
   - Go to Site Settings → Environment Variables
   - Add variable: `VITE_OPENAI_API_KEY` = `your-api-key`
3. Trigger a new deploy

**Or use Netlify CLI:**

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

Then set the environment variable in the Netlify dashboard.

### Deploy to Cloudflare Pages

```bash
# Build the app
npm run build

# Deploy dist folder to Cloudflare Pages
```

Or connect your GitHub repo:

1. Push code to GitHub
2. Go to Cloudflare Pages dashboard
3. Connect repository
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Deploy!

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect GitHub and deploy automatically.

## Environment Variables

**Optional but recommended for shared deployments:**

- `VITE_OPENAI_API_KEY` - Your OpenAI API key

If not set, users must enter their API key manually in the UI.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **OpenAI GPT-4** - AI proposal generation
- **Vanilla CSS** - Custom styling (no frameworks)

## Usage

1. **Enter API Key** (top right)
2. **Upload Fireflies Transcript** (optional but recommended)
3. **Manage Example Proposals** (add/remove as needed)
4. **Add Comments** (optional special instructions)
5. **Click Generate** (20-30 seconds)
6. **Review Proposal** (formatted preview)
7. **Edit if Needed** (toggle edit mode)
8. **Iterate** (add feedback and regenerate)
9. **Export** (copy or download)

## Cost

- **Per Generation**: ~$0.30-0.40
- **Per Iteration**: ~$0.40-0.50

Far cheaper than manual proposal writing (2-3 hours of work).

## Browser Support

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## License

MIT

## Support

For issues or questions, contact [your email here]
