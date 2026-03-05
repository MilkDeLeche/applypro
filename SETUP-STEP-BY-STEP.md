# SudoFillr / ApplyPro — Complete Setup Guide

Follow these steps **in order**. Your URLs:
- **Frontend (Vercel):** https://applyprofrontend.vercel.app
- **Backend (Railway):** You'll get this after deploying
- **Supabase project ref:** `etwtbaxnexapufffujqi`

---

## Part 1: Supabase (Database + Auth)

### 1.1 Database connection string

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. **Project Settings** (gear icon) → **Database**
3. Under **Connection string**, select **URI**
4. Copy the connection string (looks like `postgresql://postgres:[PASSWORD]@db.etwtbaxnexapufffujqi.supabase.co:5432/postgres`)
5. Replace `[YOUR-PASSWORD]` with your actual database password (from when you created the project, or reset it here)
6. **Save this** — you'll need it for Railway

### 1.2 API keys (for Auth)

1. In Supabase Dashboard → **Project Settings** → **API**
2. Copy these two values:
   - **Project URL:** `https://etwtbaxnexapufffujqi.supabase.co`
   - **service_role** key (under "Project API keys") — **keep this secret**
   - **anon** key (public key) — used by the frontend
3. **Save these** — you'll need them for Railway and Vercel

### 1.3 Auth URL configuration

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://applyprofrontend.vercel.app`
3. Under **Redirect URLs**, add:
   - `https://applyprofrontend.vercel.app/**`
   - `http://localhost:5173/**` (for local dev)
4. Click **Save**

### 1.4 Enable Google provider in Supabase

1. Go to **Authentication** → **Providers**
2. Find **Google** and turn it **ON**
3. **Leave the Client ID and Client Secret empty for now** — you'll add them after creating the Google OAuth client (Part 2)
4. Click **Save**

---

## Part 2: Google Cloud Console (OAuth)

### 2.1 Create OAuth client

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create one)
3. Go to **APIs & Services** → **Credentials**
4. Click **+ Create Credentials** → **OAuth client ID**
5. If prompted, configure the **OAuth consent screen** first:
   - User type: **External** (for real users)
   - App name: **PostulaPro** (or SudoFillr)
   - Add your email as developer contact
   - Add scopes: `email`, `profile`, `openid`
   - Save
6. Back to **Create OAuth client ID**:
   - **Application type:** Web application
   - **Name:** PostulaPro (or any name)
   - **Authorized JavaScript origins:** Click **+ Add URI**
     - `https://applyprofrontend.vercel.app`
     - `http://localhost:5173` (for local dev)
   - **Authorized redirect URIs:** Click **+ Add URI**
     - `https://etwtbaxnexapufffujqi.supabase.co/auth/v1/callback`
7. Click **Create**
8. Copy the **Client ID** and **Client Secret** — you'll need them for Supabase

### 2.2 Add credentials to Supabase

1. Go back to Supabase → **Authentication** → **Providers** → **Google**
2. Paste the **Client ID**
3. Paste the **Client Secret**
4. Click **Save**

---

## Part 3: Railway (Backend)

### 3.1 Deploy backend

1. Go to [railway.app](https://railway.app) and sign in
2. **New Project** → **Deploy from GitHub repo**
3. Connect GitHub and select your SudoFillr/ApplyPro repo
4. Railway will detect Node.js and deploy

### 3.2 Add environment variables

1. In Railway → your project → **Variables** (or **Settings** → **Variables**)
2. Add these variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase connection string from 1.1 |
| `SESSION_SECRET` | Run `openssl rand -hex 32` in a terminal and paste the result |
| `FRONTEND_URL` | `https://applyprofrontend.vercel.app` |
| `SUPABASE_URL` | `https://etwtbaxnexapufffujqi.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | The service_role key from 1.2 |

3. Click **Add** / **Save** for each
4. Railway will redeploy automatically

### 3.3 Get your Railway URL

1. After deploy, go to your service → **Settings** → **Networking** (or **Deployments**)
2. Click **Generate Domain** if you don't have one
3. Copy the URL (e.g. `https://applypro-production.up.railway.app`)
4. **Save this** — you need it for Vercel

---

## Part 4: Vercel (Frontend)

### 4.1 Deploy frontend

1. Go to [vercel.com](https://vercel.com) and sign in
2. **Add New** → **Project** → import your GitHub repo
3. Configure build:
   - **Framework Preset:** Other
   - **Build Command:** `npm run build:client`
   - **Output Directory:** `dist/public`
   - **Root Directory:** (leave blank)
4. Before deploying, add environment variables (next step)

### 4.2 Add environment variables

1. In Vercel project → **Settings** → **Environment Variables**
2. Add these:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_URL` | Your Railway URL from 3.3 (e.g. `https://applypro-production.up.railway.app`) | Production, Preview |
| `VITE_SUPABASE_URL` | `https://etwtbaxnexapufffujqi.supabase.co` | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | The anon key from Supabase 1.2 | Production, Preview |

3. **Important:** No trailing slash on `VITE_API_URL`
4. Save

### 4.3 Deploy

1. Click **Deploy** (or trigger a new deployment)
2. Your app will be at `https://applyprofrontend.vercel.app` (or whatever Vercel assigned)

---

## Part 5: Final wiring

1. **Railway:** Make sure `FRONTEND_URL` is exactly `https://applyprofrontend.vercel.app` (no trailing slash)
2. **Vercel:** Make sure `VITE_API_URL` is your Railway URL (no trailing slash)
3. If you changed anything, **redeploy** both:
   - Railway: Variables → ⋮ menu → Redeploy
   - Vercel: Deployments → ⋮ → Redeploy

---

## Quick reference: Where each value goes

| Value | Railway | Vercel | Supabase | Google |
|-------|---------|--------|----------|--------|
| Database connection string | ✅ DATABASE_URL | — | — | — |
| Supabase Project URL | ✅ SUPABASE_URL | ✅ VITE_SUPABASE_URL | — | — |
| Supabase service_role key | ✅ SUPABASE_SERVICE_ROLE_KEY | — | — | — |
| Supabase anon key | — | ✅ VITE_SUPABASE_ANON_KEY | — | — |
| Railway URL | — | ✅ VITE_API_URL | — | — |
| Vercel URL | ✅ FRONTEND_URL | — | ✅ Site URL, Redirect URLs | ✅ Authorized origins |
| Google Client ID | — | — | ✅ Providers → Google | — |
| Google Client Secret | — | — | ✅ Providers → Google | — |
| Redirect URI for Google | — | — | — | ✅ `https://etwtbaxnexapufffujqi.supabase.co/auth/v1/callback` |

---

## Local development

Create a `.env` file in the project root:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.etwtbaxnexapufffujqi.supabase.co:5432/postgres
SESSION_SECRET=dev-secret-change-in-production
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://etwtbaxnexapufffujqi.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then run `npm run dev`.
