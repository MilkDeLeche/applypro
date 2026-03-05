# Deployment Guide: Vercel (Frontend) + Railway (Backend)

## Overview

- **Vercel**: Hosts the React frontend (free)
- **Railway**: Hosts the Express API (~$5/month)
- **Supabase**: Database (already configured)

---

## 1. Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. **New Project** → **Deploy from GitHub repo** → connect your repo
3. Select the PostulaPro repository
4. Railway will detect Node.js and use the build/start commands

### Environment Variables (Railway Dashboard → Variables)

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase connection string |
| `FRONTEND_URL` | Your Vercel URL (e.g. `https://postulapro.vercel.app`) |
| `SESSION_SECRET` | Random string (e.g. `openssl rand -hex 32`) |

### Get your Railway URL

After deploy, Railway gives you a URL like `https://postulapro-production.up.railway.app`. Copy this — you need it for Vercel.

---

## 2. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. **Add New** → **Project** → import your GitHub repo
3. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build:client`
   - **Output Directory**: `dist/public`
   - **Root Directory**: . (leave default)

### Environment Variables (Vercel Dashboard → Settings → Environment Variables)

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Railway URL (e.g. `https://postulapro-production.up.railway.app`) |

4. Deploy. Vercel will give you a URL like `https://postulapro.vercel.app`

---

## 3. Wire them together

1. **Railway**: Add `FRONTEND_URL=https://your-actual-vercel-url.vercel.app` to env vars
2. **Vercel**: Add `VITE_API_URL=https://your-actual-railway-url.up.railway.app` to env vars
3. Redeploy both so they pick up the new env vars

---

## 4. LemonSqueezy (later)

When you're ready for payments, add to Railway:

- `LEMONSQUEEZY_API_KEY`
- `LEMONSQUEEZY_STORE_ID`
- `LEMONSQUEEZY_WEBHOOK_SECRET`
- `LEMONSQUEEZY_STANDARD_VARIANT_ID`
- `LEMONSQUEEZY_PRO_VARIANT_ID`

Set the webhook URL to: `https://your-railway-url.up.railway.app/api/lemonsqueezy/webhook`

---

## Local development

No `VITE_API_URL` or `FRONTEND_URL` needed. The app uses same-origin requests.

```bash
npm run dev
```
