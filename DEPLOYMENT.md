# Deployment Guide

Deploy the proposal generator with **Cloudflare Pages** (frontend) + **Render** (backend).

Both services are free tier compatible.

## Prerequisites

- GitHub repository with this code pushed
- Cloudflare account (free)
- Render account (free)
- Your Firebase and OpenAI credentials

---

## Step 1: Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign in with GitHub

2. Click **New** → **Web Service**

3. Connect your GitHub repo (`proposal-generator`)

4. Configure the service:
   - **Name**: `proposal-generator-api`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Add environment variables (click **Advanced** → **Add Environment Variable**):
   ```
   VITE_OPENAI_API_KEY=sk-...
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

6. Click **Create Web Service**

7. Wait for deploy to complete. Copy your backend URL (e.g., `https://proposal-generator-api.onrender.com`)

---

## Step 2: Deploy Frontend to Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com) and sign in

2. Click **Create a project** → **Connect to Git**

3. Select your GitHub repo (`proposal-generator`)

4. Configure the build:
   - **Project name**: `proposal-generator` (or your choice)
   - **Production branch**: `main`
   - **Framework preset**: Vite
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

5. Add environment variable:
   ```
   VITE_API_URL=https://proposal-generator-api.onrender.com/api
   ```
   (Use your actual Render backend URL from Step 1)

6. Click **Save and Deploy**

7. Your frontend will be live at `https://proposal-generator.pages.dev`

---

## Post-Deployment

### Custom Domain (Optional)

**Cloudflare Pages**: Settings → Custom domains → Add

**Render**: Settings → Custom Domain → Add

### Cold Starts (Render Free Tier)

The free tier backend "sleeps" after 15 minutes of inactivity. First request after sleep takes 30-50 seconds. This is normal for free tier.

To prevent sleep, upgrade to paid tier (~$7/month) or use a cron service to ping the health endpoint every 14 minutes.

### Environment Variables

If you need to update env vars:

- **Render**: Dashboard → Your service → Environment
- **Cloudflare Pages**: Settings → Environment variables → Edit

Remember to redeploy after changing environment variables.

---

## Troubleshooting

### Frontend can't connect to backend
- Check `VITE_API_URL` is set correctly in Cloudflare Pages
- Ensure it ends with `/api` (e.g., `https://your-backend.onrender.com/api`)
- Make sure backend is running (check Render logs)

### Backend errors
- Check Render logs for error messages
- Verify all Firebase env vars are correct
- Test OpenAI API key is valid

### CORS errors
- Backend already has CORS enabled for all origins
- If you add a custom domain, it should work automatically

---

## URLs After Deployment

- **Frontend**: `https://proposal-generator.pages.dev` (or your custom domain)
- **Backend**: `https://proposal-generator-api.onrender.com`
- **Health Check**: `https://proposal-generator-api.onrender.com/health`
