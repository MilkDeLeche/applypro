# SudoFillr

## Overview

SudoFillr is an AI-powered job application autofill tool. Users upload their resume (PDF), which is parsed using GPT-4o to extract structured profile data (personal info, work experience, education). This data is stored in a PostgreSQL database and can be accessed by a companion Chrome extension to automatically fill job application forms on websites.

The application follows a full-stack architecture with a React frontend, Express backend, PostgreSQL database, and a Chrome extension for browser-based autofill functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for transitions and micro-interactions
- **Form Handling**: React Hook Form with Zod validation
- **File Upload**: react-dropzone for PDF resume uploads
- **Build Tool**: Vite with path aliases (@/ for client/src, @shared/ for shared)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **Authentication**: Replit Auth via OpenID Connect with Passport.js
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **File Processing**: Multer for multipart form uploads, pdf-parse for PDF text extraction
- **AI Integration**: OpenAI API (GPT-4o) for intelligent resume parsing into structured JSON
- **Payments**: Stripe integration with webhook handling for subscription management

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` defines all tables
- **Key Tables**:
  - `users`: Core user profile with LATAM support (firstName, paternalLastName, maternalLastName for double last names, RFC/CURP/RUT for tax IDs, colonia/delegacion/comuna/region for LATAM addresses)
  - `experience`: One-to-many work history with English translations (company, title, titleEnglish, description, descriptionEnglish, location)
  - `education`: One-to-many education records with English translations (school, degree, degreeEnglish, major, majorEnglish, gradYear, location)
  - `sessions`: Auth session storage (required for Replit Auth)
- **Migrations**: Drizzle Kit with `db:push` command

### LATAM Support
- **Countries Supported**: Mexico (mx), Chile (cl), USA (us), Other
- **Double Last Names**: Apellido Paterno + Apellido Materno for Mexican/Chilean CVs
- **Mexican Fields**: RFC, CURP, Colonia, Delegacion/Municipio
- **Chilean Fields**: RUT, Comuna, Region
- **Auto-Translation**: AI parser extracts both Spanish and English versions of job titles, descriptions, degrees, and majors
- **Smart Autofill**: Extension detects page language and uses appropriate translation for international job applications

### Chrome Extension
- **Manifest Version**: 3 (MV3)
- **Components**:
  - Popup UI for server URL configuration and triggering autofill
  - Content script that injects into all pages to fill form fields
- **Communication**: Fetches profile data from backend `/api/profile` endpoint
- **Form Filling Logic**: Heuristic-based field matching using input names, IDs, labels, and placeholders

### API Structure
- **Route Definitions**: Centralized in `shared/routes.ts` with Zod schemas
- **Key Endpoints**:
  - `GET /api/profile` - Retrieve user profile with experience/education
  - `PUT /api/profile` - Update user profile fields
  - `POST /api/upload_resume` - Upload and parse PDF resume with AI
  - `POST /api/checkout` - Create Stripe checkout session
  - `POST /api/stripe/webhook` - Handle Stripe subscription events
  - Auth routes via Replit integration

### Usage Limits & Monetization
- Free tier: 3 resume parses and 10 autofills per 30-day period
- Pro tier via Stripe subscriptions removes limits
- Usage tracking stored in users table with period reset logic

## External Dependencies

### Third-Party Services
- **OpenAI API**: GPT-4o for parsing resume PDF text into structured JSON (experience arrays, education arrays, contact info)
- **Stripe**: Payment processing for Pro subscriptions, with managed webhooks for event handling
- **Replit Auth**: OpenID Connect authentication provider (no custom password management needed)
- **Replit AI Integrations**: Proxied OpenAI access via environment variables (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries with schema inference

### Key Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `OPENAI_API_KEY`: For resume parsing AI calls
- `AI_INTEGRATIONS_OPENAI_API_KEY` / `AI_INTEGRATIONS_OPENAI_BASE_URL`: Replit AI integration
- Stripe credentials managed via Replit Connectors

### Frontend Libraries
- Radix UI primitives for accessible components
- Lucide React for icons
- date-fns for date formatting
- class-variance-authority + clsx + tailwind-merge for style utilities