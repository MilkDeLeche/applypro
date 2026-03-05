# PostulaPro — Full App Context for AI (Gemini, etc.)

**Use this document when prompting AI to update the landing page or any part of the app. The app is NOT starting from scratch — it's a deployed, working product.**

---

## What This App Is

**PostulaPro** is an **AI-powered job application autofill** SaaS. Users upload their resume once; AI parses it; a Chrome extension fills job applications on any site. Target markets: US, Mexico, Chile (LATAM).

---

## Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 18, Vite 7, TypeScript, Wouter (routing), Tailwind CSS, Framer Motion, Radix UI |
| **Backend** | Express.js, Node.js |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Drizzle |
| **Auth** | Supabase Auth (Google OAuth) |
| **Payments** | Stripe (US), LemonSqueezy (LATAM) |
| **Deployment** | Vercel (frontend), Railway (backend), Supabase (DB) |

---

## App Structure

```
client/src/
├── App.tsx              # Routes, auth, layout
├── main.tsx
├── pages/
│   ├── Landing.tsx      # Landing page (TO UPDATE)
│   ├── Dashboard.tsx    # User profile, resume upload, experience/education
│   ├── pricing.tsx      # Pricing, plans, checkout
│   ├── ExtensionGuide.tsx
│   ├── AccountSettings.tsx
│   └── not-found.tsx
├── components/
│   ├── Navigation.tsx
│   ├── ProfileSwitcher.tsx
│   ├── ResumeUpload.tsx
│   └── ui/              # Radix-based UI (button, card, dialog, etc.)
├── hooks/
│   ├── use-auth.ts
│   ├── use-profile.ts
│   └── use-toast.ts
└── lib/
    ├── api.ts           # API base URL (VITE_API_URL)
    ├── i18n.tsx         # i18n, translations (en, es-MX, es-CL)
    ├── queryClient.ts
    └── auth-utils.ts

server/
├── index.ts
├── routes.ts
├── db.ts
├── stripeClient.ts
├── webhookHandlers.ts
├── lemonSqueezyClient.ts
├── auth/supabaseAuth.ts
└── supabase.ts

shared/
├── schema.ts            # DB schema (users, profiles, experience, education)
└── routes.ts            # API contract types
```

---

## Routes (Wouter)

| Path | Page | Auth |
|------|------|------|
| `/` | Landing or Dashboard | Landing if unauthenticated |
| `/dashboard` | Dashboard | Redirects to Landing if not logged in |
| `/pricing` | Pricing | Public |
| `/extension` | Extension guide | Landing if not logged in |
| `/settings` | Account settings | Landing if not logged in |
| `/login` | Triggers Supabase Google sign-in | — |

---

## Features (What the App Does)

1. **Resume upload & AI parsing** — PDF upload, OpenAI extracts name, experience, education, etc.
2. **Multiple profiles** — Users can have multiple resume profiles (e.g. different roles).
3. **Profile management** — Edit personal info, experience, education, cover letter.
4. **Chrome extension** — Autofills job applications using stored profile data.
5. **Subscription tiers** — Free, Standard, Pro (different limits).
6. **Payments** — Stripe (US), LemonSqueezy (MX, CL).
7. **i18n** — English, Mexican Spanish, Chilean Spanish.
8. **Privacy** — Strong privacy messaging (no data selling, delete anytime, encrypted).

---

## Current Landing Page Structure

**File:** `client/src/pages/Landing.tsx`

**Sections:**
1. **Hero** — Badge ("AI-Powered Job Applications"), headline ("Apply to Jobs **10x Faster**"), subtitle, trust badge, CTA ("Get Started Free"), secondary CTA ("How it Works")
2. **Features** — 3 cards: AI Parsing, One-Click Fill, Privacy First
3. **Privacy Trust** — 4 cards: Never Sold, Delete Anytime, Encrypted, LATAM Support
4. **Footer** — Copyright © PostulaPro

**All text:** Uses `useI18n()` and `t("landing.hero.title")` etc. Translations live in `client/src/lib/i18n.tsx`.

**Styling:** Tailwind, Framer Motion, `bg-background`, `text-foreground`, `primary`, `violet`, `emerald` accents. `font-display` for headings.

**Components used:** `Button`, `Card`, `CardContent`, `motion.div`, `FeatureCard`, `PrivacyCard` (local).

---

## Landing Page Translation Keys (i18n)

```
landing.hero.title         → "Apply to Jobs"
landing.hero.highlight     → "10x Faster"
landing.hero.subtitle      → "Upload your resume once. Our AI extracts..."
landing.hero.cta           → "Get Started Free"
landing.hero.welcome       → "Your resume data stays yours..."
landing.hero.welcome.secondary → "Fill applications in seconds, not hours."
landing.features.ai.title
landing.features.ai.desc
landing.features.autofill.title
landing.features.autofill.desc
landing.features.privacy.title
landing.features.privacy.desc
privacy.badge
privacy.title
privacy.highlight
privacy.subtitle
privacy.never_sold.title
privacy.never_sold.desc
privacy.delete.title
privacy.delete.desc
privacy.encrypted.title
privacy.encrypted.desc
privacy.latam.title
privacy.latam.desc
```

---

## Design System

- **Colors:** CSS variables (`--background`, `--foreground`, `--primary`, etc.), Tailwind semantic tokens
- **Fonts:** `font-display` for headings, `font-sans` for body
- **Components:** `@/components/ui/*` (Button, Card, Dialog, etc.)
- **Icons:** Lucide React (`Zap`, `ShieldCheck`, `MousePointerClick`, etc.)
- **Animations:** Framer Motion (`motion.div`, `initial`, `animate`, `whileInView`)

---

## Database Schema (Supabase)

- **users** — id, email, name, address, country, subscription tier, etc.
- **profiles** — name, coverLetter, userId
- **experience** — company, title, dates, description
- **education** — school, degree, major, gradYear

---

## API Endpoints (Backend)

- `GET /api/auth/user` — Current user
- `GET/POST /api/login`, `/api/logout`, `/api/callback` — Auth
- `GET/PUT /api/profile` — Profile
- `POST /api/upload_resume` — Resume upload
- `GET/POST/DELETE /api/experience`, `/api/education`
- `GET/POST /api/profiles`, `/api/profiles/:id`
- `GET /api/usage` — Usage limits
- `POST /api/checkout`, `/api/lemonsqueezy/checkout` — Payments

---

## Important Notes for AI

1. **Do NOT start from scratch.** The app exists and is deployed.
2. **Landing page:** `client/src/pages/Landing.tsx`. Use existing `FeatureCard` and `PrivacyCard` (or similar) patterns.
3. **All user-facing text:** Use `t("key")` from `useI18n()`. Add new keys in `i18n.tsx` for en, es-MX, es-CL.
4. **Styling:** Stay with Tailwind, existing color tokens, and Framer Motion.
5. **Brand:** PostulaPro — AI job application autofill, resume parsing, Chrome extension, privacy-first.
6. **Deployment:** Vercel frontend, Railway backend. `VITE_API_URL` for API base. Auth via Supabase (Google OAuth); frontend uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## File to Edit for Landing Page Updates

**Primary:** `client/src/pages/Landing.tsx`  
**Translations:** `client/src/lib/i18n.tsx` (add new keys under `landing.*` or `privacy.*`)
