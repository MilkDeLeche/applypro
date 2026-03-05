# Deployment Settings Checklist

Configure in this order: **Railway → Vercel → Supabase**

---

## 1. RAILWAY

**Where:** Project → Variables (or Settings → Variables)

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.etwtbaxnexapufffujqi.supabase.co:5432/postgres` | ✅ Yes |
| `SESSION_SECRET` | Random 32+ char string (e.g. run `openssl rand -hex 32`) | ✅ Yes |
| `FRONTEND_URL` | Your Vercel URL — add **after** Vercel deploy (e.g. `https://applypro-frontend.vercel.app`) | ✅ Yes |
| `PORT` | `5000` (Railway usually sets this automatically) | Optional |

**After first deploy:** Copy your Railway URL (e.g. `https://applypro-production.up.railway.app`). You need it for Vercel.

---

## 2. VERCEL

**Where:** Project → Settings → Environment Variables

### Build settings (when creating project)
- **Framework Preset:** Other
- **Build Command:** `npm run build:client`
- **Output Directory:** `dist/public`
- **Root Directory:** (leave blank)

### Environment variables

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_URL` | Your Railway URL (e.g. `https://applypro-production.up.railway.app`) | Production, Preview |

**Important:** No trailing slash on `VITE_API_URL`.

**After deploy:** Copy your Vercel URL. Add it to Railway as `FRONTEND_URL`, then redeploy Railway.

---

## 3. SUPABASE

**Where:** [Supabase Dashboard](https://supabase.com/dashboard) → Your Project

### Already done
- ✅ Database created
- ✅ Tables pushed (`users`, `profiles`, `experience`, `education`)
- ✅ Connection string in `DATABASE_URL`

### Optional (for later)

| Setting | Location | When |
|---------|----------|------|
| **Auth providers** | Authentication → Providers | When you migrate to Supabase Auth |
| **Google OAuth** | Authentication → Providers → Google | When you add Google login |
| **Site URL** | Authentication → URL Configuration | Set to your Vercel URL when using Supabase Auth |
| **Redirect URLs** | Authentication → URL Configuration | Add `https://yourapp.vercel.app/**` when using Supabase Auth |
| **RLS** | Database → Tables | Not needed for current setup (backend-only access) |

### Connection string reminder
- **Project Settings** → **Database** → **Connection string** (URI)
- Use for `DATABASE_URL` in Railway

---

## 4. WIRE THEM TOGETHER

1. **Railway** → Add `FRONTEND_URL` = your Vercel URL
2. **Railway** → Redeploy (Variables → ⋮ → Redeploy)
3. **Vercel** → Redeploy if you added `VITE_API_URL` after first deploy

---

## 5. LEMONSQUEEZY (when ready)

Add to **Railway** only:

| Variable | Where to get it |
|----------|-----------------|
| `LEMONSQUEEZY_API_KEY` | Lemon Squeezy Dashboard → Settings → API |
| `LEMONSQUEEZY_STORE_ID` | Lemon Squeezy Dashboard → Store |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Create webhook, copy signing secret |
| `LEMONSQUEEZY_STANDARD_VARIANT_ID` | Your Standard plan product variant ID |
| `LEMONSQUEEZY_PRO_VARIANT_ID` | Your Pro plan product variant ID |

**Webhook URL:** `https://your-railway-url.up.railway.app/api/lemonsqueezy/webhook`
