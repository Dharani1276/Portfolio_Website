# Portfolio — Vercel Deploy Guide

## 🚀 Deploy to Vercel in 3 steps

### Option A — Drag & Drop (easiest, no account needed)
1. Go to https://vercel.com/new
2. Sign up free (GitHub / Google / Email)
3. Click **"Import Git Repository"** — OR scroll down to **"Deploy from your computer"**
4. Drag this entire `portfolio-vercel` folder into the upload area
5. Click **Deploy** → your live URL: `https://portfolio-xxx.vercel.app`

### Option B — Vercel CLI
```bash
# Install Node.js from https://nodejs.org first, then:
npm install -g vercel
cd portfolio-vercel
vercel
```
Follow prompts → get your `.vercel.app` URL instantly.

### Option C — GitHub + Vercel (best for updates)
1. Push this folder to a GitHub repo
2. Go to https://vercel.com/new → Import your GitHub repo
3. Vercel auto-deploys on every push

---

## 🛠 Run locally
```bash
cd portfolio-vercel
npm install
npm run dev
# Opens at http://localhost:5173
```
