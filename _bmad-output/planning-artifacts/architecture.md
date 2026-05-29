---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
inputDocuments: 
  - prds/prd-mairie-2026-05-23/prd.md
  - briefs/brief-mairie-2026-05-23/brief.md
workflowType: 'architecture'
project_name: 'mairie'
user_name: 'Camil'
date: '2026-05-29'
---

# Architecture Decision Document — Ma Ville Agenda MVP

_This document builds collaboratively through step-by-step discovery. Decisions are appended as we work through each architectural requirement together._

## Input Documents Loaded

- **PRD** : Ma Ville Agenda MVP (final, 2026-05-29)
  - 5 features (F1-F5): mobile app (list, detail, filter, navigation) + backoffice super-admin
  - Stack placeholders: React Native/Flutter TBD, API REST/GraphQL TBD, Database managed TBD
  
- **Product Brief** : Ma Ville Agenda (final, 2026-05-23)
  - Civic events aggregator for Léognan commune
  - iOS + Android, citizen-owned, launches before municipality RFP
  - MVP: read-only + admin validation workflow; V2: user submissions + moderation; V3+: white-label

## Key Constraints from PRD

1. **Budget**: Zero (free tier only)
2. **Developer**: Camil solo + Claude Code
3. **Timeline**: 8-12 weeks total; ~1-2 weeks architecture phase
4. **Hosting**: Vercel (free tier) or personal server
5. **Maintainability**: Solo-dev-friendly stack (no exotic dependencies, no monolithic backends)

## Architecture Scope (MVP)

### Systems to Design

- **Mobile App** (iOS + Android via cross-platform framework)
  - Consumer: event list, detail, category filter, date navigation (read-only)
  - Data sync: Refresh on app open (no real-time; resident must refresh to see newly published events)
  - Tech: React Native or Flutter [TBD]
  
- **Backend API**
  - Serves mobile app + backoffice
  - CRUD events, super-admin auth, simple REST endpoints
  - Constraint: No real-time sync, no WebSocket, no Redis
  - Tech: REST [decided], serverless or lightweight [TBD]
  
- **Backoffice Admin (Web)**
  - Super-admin: create (with auto-save drafts), validate, reject, archive events
  - Tech: React/Next.js/Vue (same tech family as mobile for maintainability) [TBD]
  - Hosted: Vercel or personal server
  
- **Database**
  - Event schema (7 fields), User (super-admin only), Event submission workflow (status: draft → pending → published/rejected)
  - Tech: PostgreSQL (managed), SQLite (MVP), or similar [TBD]

---

## Party Mode Synthesis (2026-05-29)

**Participants:** Winston (Architect), Amelia (Senior Engineer), Sally (UX Designer), John (PM)

### Key Decisions from Roundtable

1. **Framework Mobile: React Native** (Winston)
   - Rationale: Camil knows JavaScript/React already; ~2-3 week ramp vs. ~4-5 weeks for Flutter
   - Code reuse possible (TypeScript logic shared between API, web, mobile)
   - Community size favors solo debugging

2. **Backend + Backoffice Tech Stack** (Amelia recommended)
   - Backend: Node.js + Express (or Python/FastAPI)
   - Backoffice: Next.js or React (same repo as mobile for minimal friction)
   - Database: PostgreSQL free tier (Railway) or SQLite for MVP
   - Tests: Jest unit + Supertest integration + minimal E2E (5-10 only)

3. **Data Sync Strategy: Refresh Polling** (Sally + Amelia + confirmed by Camil)
   - Super-admin publishes event → resident must refresh app to see it
   - Eliminates WebSocket, Redis, real-time sync complexity
   - Testing burden drops drastically (no flaky timing tests)
   - Deployment simplified: Vercel free tier sufficient

4. **Image Storage** (Sally)
   - Cloud storage (Vercel Blob or Supabase Storage free tier)
   - Not local filesystem (adds DevOps burden for solo dev)

5. **Timeline Priority** (John)
   - Launch in 6 weeks beats perfection in 8 weeks (municipality launches week 7)
   - Stack must support speed, not feature completeness

### Clarifications Recorded

- **Push Notifications**: Deferred to V2 (not MVP)
- **Real-time sync**: Not required (refresh on app open is acceptable)
- **Multi-user backoffice**: V2 (MVP is super-admin only)

---

## Starter Template Selection (2026)

### Mobile App: Obytes Starter

**Selection:** Obytes Starter for React Native + Expo

**Rationale:**
- Free, actively maintained, production-ready
- Includes: Expo Router (navigation), authentication patterns, Jest testing scaffolds, TypeScript
- Saves 1-2 weeks vs. bare `create-expo-app` by providing testing infrastructure and best practices
- Aligns with solo dev requirement: clear patterns, testable, no exotic dependencies

**Initialization:**
```bash
git clone https://github.com/obytes/react-native-starter ma-ville-agenda-mobile
cd ma-ville-agenda-mobile
npm install
```

**Decisions Provided:**
- Navigation: Expo Router (type-safe routing)
- Testing: Jest + React Testing Library scaffolds
- Language: TypeScript (strict mode recommended)
- Code style: ESLint + Prettier configured
- Auth patterns: Example implementations (adapting for super-admin needs)

---

### Backend API: Custom TypeScript + Express

**Selection:** Manual setup (no heavy boilerplate)

**Rationale:**
- Solo dev needs clarity; heavy frameworks add maintenance burden
- Custom structure allows exact control over routing, validation, testing
- Express + TypeScript is the minimal stable choice
- Jest for testing aligns with mobile app (same testing framework)

**Initialization:**
```bash
mkdir ma-ville-agenda-api
cd ma-ville-agenda-api
npm init -y
npm install express typescript ts-node cors helmet morgan
npm install --save-dev jest ts-jest @types/jest @types/express nodemon
npm install --save-dev eslint prettier
```

**Project Structure:**
```
src/
  ├── controllers/     # Request handlers
  ├── services/        # Business logic (shared with validation, event logic)
  ├── models/          # Data models, types, interfaces
  ├── routes/          # API route definitions
  ├── middleware/      # Auth, error handling, logging
  ├── types/           # TypeScript types, enums
  ├── utils/           # Helpers
  └── app.ts           # Express app setup
tests/
  ├── unit/            # Service/business logic tests
  ├── integration/     # API + DB tests (Testcontainers)
tsconfig.json
.env.example
jest.config.js
```

**Decisions Provided:**
- Language: TypeScript (strict mode)
- Framework: Express (minimal, clear, well-documented)
- Testing: Jest + Supertest (API integration tests)
- Validation: Custom validation functions (no heavy validation libraries)
- Error handling: Centralized error middleware
- Security: Helmet, CORS configured
- Logging: Morgan for request logging
- Environment config: dotenv for .env variables

**API Endpoints (from PRD):**
```
GET    /events                    # List events (filterable)
GET    /events/:id                # Event detail
POST   /admin/auth/login          # Super-admin login (password/magiclink)
POST   /admin/events              # Create event (super-admin)
PUT    /admin/events/:id          # Update event status or details (super-admin)
DELETE /admin/events/:id          # Archive/unpublish event (super-admin)
```

---

### Backoffice Web: Next.js create-next-app

**Selection:** Official `create-next-app@latest` with defaults

**Rationale:**
- Official, standard in 2026, zero configuration needed
- Default setup includes App Router (recommended), TypeScript, Tailwind CSS, ESLint
- Vercel-native (one-command deploy to Vercel free tier)
- Minimal maintainance overhead

**Initialization:**
```bash
pnpm create next-app@latest ma-ville-agenda-admin --yes
# --yes uses recommended defaults:
# - TypeScript: yes
# - Tailwind CSS: yes
# - ESLint: yes
# - App Router: yes
# - Turbopack: yes
```

**Decisions Provided:**
- Routing: Next.js App Router (type-safe routes in src/app/)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS (utility-first, lightweight)
- Build: Turbopack (faster builds than webpack)
- Linting: ESLint + Prettier
- Code organization: src/ directory convention
- Vercel deployment: Ready to deploy with one command

**Key Pages (Backoffice):**
```
src/app/
  ├── login/                      # Super-admin login
  ├── admin/
  │   ├── dashboard/              # Overview (pending count, recent)
  │   ├── create/                 # Create event form
  │   ├── validation/[id]/         # Validate/reject view
  │   ├── history/                # Published event history
  │   └── layout.tsx              # Admin layout (protected)
  ├── layout.tsx                  # Root layout
  └── page.tsx                    # Redirect to /admin or /login
```

---

### Database: PostgreSQL (Railway) or SQLite (MVP)

**Selection:** PostgreSQL (Railway free tier) recommended, SQLite backup

**Rationale for PostgreSQL:**
- Free tier on Railway: 5GB storage, sufficient for MVP
- Managed service: no DevOps overhead for solo dev
- Scalable to V2 without migration
- ACID guarantees, good for validation workflow

**Rationale for SQLite (if offline-first preferred):**
- Simpler local dev experience
- Single file database
- No external service dependency
- Sufficient for MVP with 7 initial events

**Recommended Approach:**
- **Dev/Local:** SQLite3 for simplicity
- **Staging/Production:** PostgreSQL on Railway free tier
- **ORM:** Use Knex.js (lightweight, minimal) or raw SQL with type safety

**Database Schema (MVP):**

```sql
-- Users (super-admin only in MVP)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM ('super_admin') DEFAULT 'super_admin',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(512),
  start_datetime TIMESTAMP NOT NULL,
  end_datetime TIMESTAMP NOT NULL,
  is_all_day BOOLEAN DEFAULT FALSE,
  category ENUM ('Culture', 'Sport', 'Animation', 'Commerce', 'Autre') NOT NULL,
  location VARCHAR(255) NOT NULL,
  external_link VARCHAR(512),
  status ENUM ('draft', 'pending', 'published', 'rejected') DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_datetime ON events(start_datetime);
CREATE INDEX idx_events_category ON events(category);
```

---

## Tech Stack Summary — Ma Ville Agenda MVP

| Component | Technology | Why |
|---|---|---|
| **Mobile (iOS + Android)** | React Native + Expo | Cross-platform, one codebase, Obytes starter |
| **Mobile Navigation** | Expo Router | Type-safe routing, tree-based structure |
| **Backend API** | Node.js + Express + TypeScript | Minimal, testable, clear patterns |
| **Backoffice Web** | Next.js + App Router + Tailwind | Official, zero-config, Vercel-native |
| **Testing (Backend)** | Jest + Supertest | Same framework as mobile, fast, clear |
| **Database** | PostgreSQL (Railway) / SQLite (dev) | Managed or local, sufficient for MVP |
| **Styling (Web)** | Tailwind CSS | Utility-first, lightweight, included in Next.js |
| **Code Quality** | ESLint + Prettier | Standard, enforced across all three layers |
| **Deployment** | Vercel (backoffice + API serverless) | Free tier, one-command deploy |

---

## Core Architectural Decisions (2026-05-29)

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Database: SQLite (MVP) → PostgreSQL (Supabase free tier for serverless)
- ORM: Prisma + migrations
- Authentication: Password + HTTP-only cookies + bcrypt
- API pattern: REST + Zod validation
- Deployment: Vercel Functions (backoffice + API) + Supabase PostgreSQL

**Important Decisions (Shape Architecture):**
- Frontend state: React Context + TanStack Query
- Form handling: React Hook Form + Zod
- Documentation: README + markdown

**Deferred Decisions (Post-MVP, V2):**
- Multi-user authentication (RBAC for associations, commerçants, modos)
- Push notifications
- Real-time sync (WebSocket)
- Image CDN optimization

---

### Data Architecture Decisions

#### Database Technology (REVISED — Party Mode Input)
**Decision:** Supabase PostgreSQL for both dev and production

**Rationale (revised from Party Mode feedback):**
- Original plan (SQLite dev → Supabase prod) introduces environment friction: migrations may behave differently, data types diverge (TEXT vs VARCHAR), indexes vary
- **Unified approach:** use Supabase PostgreSQL from day 1 (dev + prod identical)
- Eliminates debugging surprises caused by environment differences
- Development: `DATABASE_URL=postgresql://localhost/...` (local Supabase instance or remote free tier)
- Production: same schema, same queries
- Supabase free tier (500 MB storage): sufficient for MVP (~50k small events)

**Implementation:**
- Dev environment: Supabase PostgreSQL connection string (same as production)
- Production environment: same connection string via Vercel secrets
- Same Prisma schema, same migrations—no environment-specific code

#### ORM & Query Layer
**Decision:** Prisma ORM

**Rationale:**
- TypeScript-first: auto-generated types from schema
- Migrations: declarative schema → auto-generated SQL migrations
- Testable: Prisma Client has clear API, easy to mock
- Zero cost: open-source, free for SQLite + Supabase
- Development experience: schema.prisma is single source of truth

**Schema Structure:**
```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  passwordHash String
  role      String    @default("super_admin")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Event {
  id           String    @id @default(cuid())
  title        String
  description  String
  imageUrl     String?
  startDateTime DateTime
  endDateTime  DateTime
  isAllDay     Boolean   @default(false)
  category     String    // "Culture" | "Sport" | "Animation" | "Commerce" | "Autre"
  location     String
  externalLink String?
  status       String    @default("draft") // "draft" | "pending" | "published" | "rejected"
  createdBy    String    @db.String
  rejectionReason String?
  publishedAt   DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([status])
  @@index([startDateTime])
  @@index([category])
}

enum EventStatus {
  DRAFT
  PENDING
  PUBLISHED
  REJECTED
}

enum EventCategory {
  CULTURE
  SPORT
  ANIMATION
  COMMERCE
  AUTRE
}
```

#### Migration Strategy
**Decision:** Prisma migrations (declarative)

**Workflow:**
1. Edit `schema.prisma`
2. Run `npx prisma migrate dev --name <migration_name>`
3. Prisma generates SQL migration in `prisma/migrations/`
4. Commit migration to git
5. Production: `npx prisma migrate deploy` (in CI/CD or manual pre-deploy)

**Benefit:** Reproducible, version-controlled, works for both SQLite and PostgreSQL

---

### Authentication & Security Decisions

#### Super-Admin Authentication
**Decision:** Password-based login + HTTP-only cookies

**Flow:**
1. Super-admin (Camil) enters email + password on `/login` page
2. Backend validates password against bcrypt hash
3. Backend creates session (HTTP-only secure cookie)
4. Subsequent requests: cookie automatically sent, validated in middleware
5. `/logout` clears cookie

**Why HTTP-only cookies over JWT:**
- Security: cookies are never accessible to JavaScript (XSS protection)
- CSRF protection: built-in with SameSite=Strict
- Simplicity: browser handles cookie management automatically
- Logout: simple cookie deletion vs. token blacklist

#### Password Storage
**Decision:** Bcrypt with cost factor 12

**Implementation:**
```javascript
// Registration / password change
const passwordHash = await bcrypt.hash(password, 12);

// Login validation
const isValid = await bcrypt.compare(inputPassword, passwordHash);
```

**Why Bcrypt:**
- Industry standard, slow-by-design (expensive to brute-force)
- Well-tested, no known vulnerabilities
- Built-in salting, no additional configuration needed

#### Session Management (REVISED — Party Mode Input)
**Decision:** Supabase Auth (JWT) instead of custom sessions

**Rationale (from Party Mode review):**
- Vercel Functions is stateless; maintaining session store (connect-mongo, Redis) adds complexity for solo dev
- Supabase Auth is native to Supabase, generates secure JWTs, works in stateless serverless environment
- Simpler to implement: `supabase.auth.signIn(email, password)` vs. custom session middleware
- JWT tokens in HTTP-only cookies (same security level as sessions)

**Configuration:**
- Supabase Auth → generates JWT
- JWT stored in HTTP-only cookie (Vercel Functions → Set-Cookie header)
- Protected routes: validate JWT from cookie, decode to get user info
- Logout: clear cookie, invalidate token on Supabase end
- No session store needed (JWT is self-contained)

**Protected Routes:**
- `POST /admin/events` (create)
- `PUT /admin/events/:id` (update status/details)
- `DELETE /admin/events/:id` (archive)
- `GET /admin/validation-queue` (pending events list)
- All other backoffice pages

#### API Security Headers
**Middleware:**
- **Helmet**: Security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.)
- **CORS**: Allow origin for Vercel backoffice domain only
- **Rate limiting**: Simple token bucket (10 requests/minute per IP) to prevent brute-force

---

### API & Communication Decisions

#### API Design Pattern
**Decision:** REST (no GraphQL, no WebSocket)

**Endpoints:**

**Public (Mobile Consumer):**
```
GET    /api/events                    # List all events
       ?category=Culture              # Filter by category
       ?start=2026-05-26              # Filter by date range
       &end=2026-05-30

GET    /api/events/:id                # Event detail
```

**Protected (Super-Admin Only):**
```
POST   /api/admin/auth/login          # Login with email + password
POST   /api/admin/auth/logout         # Logout (clear cookie)

GET    /api/admin/events              # All events (created by super-admin)
POST   /api/admin/events              # Create new event
       Body: { title, description, imageUrl, startDateTime, endDateTime, 
               isAllDay, category, location, externalLink }

GET    /api/admin/validation-queue    # Pending submissions (draft + pending)
PUT    /api/admin/events/:id/validate # Approve event
       Body: {}
       → status changes: draft → pending → published

PUT    /api/admin/events/:id/reject   # Reject event
       Body: { rejectionReason: "..." }
       → status: rejected

PUT    /api/admin/events/:id          # Edit event (title, description, etc.)
DELETE /api/admin/events/:id          # Archive/unpublish event
```

#### Error Handling
**Decision:** RESTful standard + JSON error responses

**Format:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Event title is required",
    "details": {
      "field": "title",
      "reason": "required"
    }
  }
}
```

**Status Codes:**
- `200 OK` — successful request
- `400 Bad Request` — validation error, malformed input
- `401 Unauthorized` — not authenticated
- `403 Forbidden` — authenticated but not permitted
- `404 Not Found` — resource not found
- `500 Internal Server Error` — server error
- `503 Service Unavailable` — database or external service down

#### Request Validation
**Decision:** Zod schema validation

**Pattern:**
```typescript
import { z } from 'zod';

const CreateEventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  imageUrl: z.string().url().optional(),
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime(),
  isAllDay: z.boolean().optional(),
  category: z.enum(['Culture', 'Sport', 'Animation', 'Commerce', 'Autre']),
  location: z.string().min(1),
  externalLink: z.string().url().optional(),
});

// In route handler:
try {
  const validated = CreateEventSchema.parse(req.body);
  // Use validated data
} catch (error) {
  // Zod errors formatted to 400 response
  return res.status(400).json({ error: error.flatten() });
}
```

**Benefits:**
- TypeScript inference: validated data is typed
- Clear error messages: field-level feedback
- Reusable schemas: same validation logic in mobile app (if needed)

#### API Documentation
**Decision:** README.md in backend repo

**Content:**
- Base URL: `https://api.ma-ville-agenda.vercel.app`
- Authentication: "Login at `/admin/auth/login` to get session cookie"
- Endpoint list with cURL examples
- Error response format examples
- Rate limits, CORS policy

**Example:**
```markdown
## GET /api/events

Fetch list of published events.

### Query Parameters
- `category` (optional): Filter by category (Culture, Sport, Animation, Commerce, Autre)
- `start` (optional): ISO date (e.g., 2026-05-26)
- `end` (optional): ISO date (e.g., 2026-05-30)

### Example
\`\`\`bash
curl https://api.ma-ville-agenda.vercel.app/api/events?category=Culture&start=2026-05-26
\`\`\`

### Response
\`\`\`json
[
  {
    "id": "event-123",
    "title": "Ciné Europe : Sorda",
    "category": "Culture",
    ...
  }
]
\`\`\`
```

---

### Frontend Architecture (Backoffice Web)

#### State Management (REVISED — Party Mode Input)
**Decision:** useState + fetch() for MVP (TanStack Query deferred to V2)

**Rationale (revised from Party Mode feedback):**
- Backoffice MVP is 3 pages: login, create event, validation queue
- TanStack Query adds abstraction layer that's over-engineered for single admin with few requests
- Vanilla `fetch() + useState()` is sufficient: simpler implementation, faster development, easier testing
- Upgrade path: V2 can add TanStack Query when multiple concurrent queries and caching become necessary

**Pattern (MVP):**
```typescript
function ValidationQueue() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/admin/validation-queue')
      .then(r => r.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  // ...
}
```

**Benefits for MVP:**
- Zero dependency bloat (no TanStack Query library)
- Clear data flow: fetch() → setState → re-render
- Testable with simple Jest mocks
- Can add caching / refetch logic if needed later

**V2 Upgrade:** If validation queue needs auto-refresh (poll every 5 min) or complex cache invalidation, migrate to TanStack Query

#### Form Handling (Event Creation & Validation)
**Decision:** React Hook Form + Zod validation

**Pattern:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateEventSchema } from '@/lib/validation';

function CreateEventForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(CreateEventSchema)
  });

  const onSubmit = async (data) => {
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    // Handle response
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} placeholder="Event title" />
      {errors.title && <span>{errors.title.message}</span>}
      {/* other fields */}
    </form>
  );
}
```

**Benefits:**
- Minimal re-renders: Hook Form only updates changed fields
- Shared validation: same Zod schema as backend
- Auto-save drafts: onChange handler saves to localStorage, syncs to API on blur

#### Image Upload (Drag & Drop + Compression)
**Decision:** Drag-and-drop file input + client-side compression + optional crop → Vercel Blob

**Flow:**
1. User drags file to drop zone (or clicks to select)
2. Browser validates file type (JPG/PNG only)
3. **Client-side compression**: resize image to max 1440px width, compress to ~300-500 KB (using `browser-image-compression` library)
4. Upload compressed file to Vercel Blob
5. Blob returns URL (`https://blob.ma-ville-agenda.vercel.app/event-123.jpg`)
6. URL stored in Event.imageUrl
7. Mobile app fetches image from Blob URL

**Implementation (Client):**
```typescript
import imageCompression from 'browser-image-compression';
import { put } from '@vercel/blob';

async function uploadAndCompressImage(file: File) {
  // Validate
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    throw new Error('Only JPG/PNG allowed');
  }

  // Compress client-side
  const options = {
    maxSizeMB: 0.5,        // Max 500 KB
    maxWidthOrHeight: 1440, // Resize to 1440px max
    useWebWorker: true      // Don't block UI
  };
  const compressed = await imageCompression(file, options);

  // Upload to Blob
  const blob = await put(`events/${Date.now()}-${file.name}`, compressed, { 
    access: 'public' 
  });
  return blob.url;
}
```

**Image Cropping (MVP Optional, V2 Priority):**
- MVP: Simple compression sufficient (most images acceptable)
- V2: Add `react-image-crop` library for user-controlled crop before upload
- V2: Backend fallback (Sharp library) to auto-crop if image aspect ratio is extreme

**Rationale:**
- Non-technical users (associations, commerçants) will upload 12 MB landscape photos with wrong orientation
- Client-side compression: instant feedback, no server overhead, no cost impact
- Fallback: if browser compression fails, Vercel Blob still accepts, but file may be large

**Benefits:**
- Zero cost: browser-image-compression is free, Vercel Blob tier unchanged
- User experience: progress bar shows "Compressing..." then uploads fast
- Reduces storage: 12 MB → ~300 KB per image (40x reduction)

---

### Infrastructure & Deployment

#### Backend Hosting
**Decision:** Vercel Functions (serverless)

**Setup:**
```bash
# Express app wrapped in Vercel Function
# api/index.ts exports Express app
export default app;

# Vercel automatically routes /api/* to this handler
```

**Benefits:**
- Auto-scaling: handles traffic spikes
- Zero management: Vercel manages servers, patches, security
- Free tier: sufficient for MVP (500 invocations/day free, then paid)
- Same provider as backoffice: unified dashboard, simpler ops

#### Database Hosting
**Decision:** Supabase PostgreSQL (free tier)

**Setup:**
1. Create Supabase project (free tier: 500 MB storage)
2. Get connection string: `postgresql://user:password@host/database`
3. Set in Vercel secrets: `DATABASE_URL`
4. Prisma connects via `DATABASE_URL`

**Benefits:**
- Managed: Supabase handles backups, patches, upgrades
- Free tier sufficient for MVP (500 MB = ~50k small events)
- Upgrade path: pay only if exceeding 500 MB
- Real PostgreSQL: not a mock, production-grade

#### Environment Configuration
**Decision:** Vercel Secrets + .env.local (dev)

**Dev (.env.local, git-ignored):**
```
DATABASE_URL=file:./dev.db
NODE_ENV=development
JWT_SECRET=local-dev-secret-not-secure
```

**Production (Vercel Secrets UI):**
```
DATABASE_URL=postgresql://...@supabase...
NODE_ENV=production
JWT_SECRET=<strong-random-key>
```

**Benefits:**
- Local dev: SQLite, fast feedback loop
- Production: PostgreSQL via Vercel secrets (secure, never committed)
- Same code: no conditional logic, just different .env values

#### Logging & Monitoring
**Decision:** Console logs (captured by Vercel dashboard)

**Approach:**
- All log messages go to `console.log()`, `console.error()`, etc.
- Vercel captures logs in deployment dashboard (accessible at vercel.com)
- Search/filter logs by timestamp, message
- Errors automatically visible in "Monitoring" tab

**Deferral:**
- Sentry (error tracking) — post-MVP if needed
- Custom dashboards — post-MVP

**Benefits for MVP:**
- Zero cost: included with Vercel
- Sufficient visibility: can debug production issues via logs
- Simple: no additional service to manage

#### Continuous Integration
**Decision:** GitHub Actions (free tier) + Vercel auto-deploy

**Flow:**
1. Push to main branch
2. GitHub Actions runs: `npm test`, `npm run build`, `npm run lint`
3. If all pass, Vercel auto-deploys
4. If any fail, deployment blocked, notification sent

**Configuration:**
- `.github/workflows/ci.yml` defines steps
- Vercel GitHub integration: auto-deploys on push to main
- Rollback: one click in Vercel dashboard if deployment breaks

---

## Implementation Sequence

1. **Prisma Schema & Migrations** (define database structure)
2. **Express API Scaffold** (create routes, middleware, error handling)
3. **Next.js Backoffice Scaffold** (pages, layouts, forms)
4. **Authentication** (login, session management, protected routes)
5. **Event CRUD endpoints** (create, read, update, delete)
6. **Image upload** (file handling, cloud storage integration)
7. **Validation queue** (list pending, approve, reject)
8. **Mobile app integration** (test API from React Native)
9. **Deployment setup** (Vercel secrets, Supabase connection)
10. **Testing** (Jest unit + integration tests)

---

## Cross-Component Dependencies

- **Prisma schema** → Backend API (CRUD), migrations, Backoffice queries
- **Zod validation schemas** → Backend (endpoint validation), Forms (frontend validation)
- **API endpoints** → Mobile app (fetch), Backoffice (forms)
- **Supabase Auth** → Protected routes in API, session validation in Next.js backoffice
- **Environment variables** → Database connection (Supabase), API deployment, Auth config
- **Image upload & compression** → Event creation form, Blob storage, database storage (imageUrl)

---

## Party Mode Resolutions (2026-05-29)

**Decisions Updated Based on Four-Agent Review:**

### ✅ Accepted Changes

| Area | Original | Updated | Benefit |
|---|---|---|---|
| **Database** | SQLite (dev) + Supabase (prod) | Supabase PostgreSQL (dev + prod) | Eliminate environment friction, zero debugging surprises |
| **Authentication** | Custom password + HTTP-only cookies + session store | Supabase Auth (JWT) | Stateless serverless-ready, simpler implementation |
| **Frontend State** | React Context + TanStack Query | useState + fetch() | Eliminate over-engineering for single admin, faster dev |
| **Image Upload** | Drag-drop only | Drag-drop + client-side compression | Handle non-technical users uploading large/wrong-sized images |

### 📋 Additional Resolutions

**Testing Infrastructure (Day 1):**
- Add Supertest for integration tests (auth flow validation)
- Add Pino for structured logging (production debugging)
- Isolate BlobService for unit testing (image upload logic)
- Setup GitHub Actions keepalive (prevent Vercel cold starts)
- Estimated effort: 3 hours, saves 8-12 hours of production debugging

**Image Handling Details:**
- Compression: `browser-image-compression` (client-side, max 500 KB, 1440px width)
- Crop: V2 (react-image-crop for user control, Sharp backend fallback)
- Rationale: Non-technical users (associations, commerçants) upload 12 MB landscape photos

**Frontend Simplifications (MVP):**
- ❌ No auto-save cloud (localStorage for drafts only, explicit save button)
- ❌ No TanStack Query (vanilla fetch + setState)
- ❌ No complex form state (React Hook Form + Zod for validation, but simple submission)

**Timeline Impact:**
- Original scope + all features: 8-10 weeks
- Simplified scope (fetch, no TanStack Query, file input compression): 6-7 weeks
- **Gain: 1-2 weeks** by eliminating over-engineering for solo MVP

---

## Implementation Patterns & Consistency Rules (2026-05-29)

**Purpose:** Define patterns that ensure Camil + Claude Code agents write compatible, consistent code across mobile app, backend API, and backoffice.

### Naming Patterns

#### Database (Prisma Schema)

**Convention:** `snake_case` for tables and columns

```prisma
// ✅ CORRECT
model event {
  id                String    @id @default(cuid())
  title             String
  description       String
  image_url         String?
  start_date_time   DateTime
  end_date_time     DateTime
  is_all_day        Boolean   @default(false)
  category          String
  location          String
  external_link     String?
  status            String    @default("draft")
  created_by        String
  rejection_reason  String?
  published_at      DateTime?
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
}

model user {
  id              String    @id @default(cuid())
  email           String    @unique
  password_hash   String
  role            String    @default("super_admin")
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
}

// ✅ Foreign keys (implicit via @relation)
// ✅ Indexes: @index([status]), @index([created_at])
```

**Anti-Pattern:** ❌ Mixed case (Event, User, created_by mixed with createdBy)

---

#### API Endpoints (Express Routes)

**Convention:** Singular resource paths with `snake_case` parameters

```typescript
// ✅ CORRECT
GET    /api/event?category=culture&start=2026-05-26
GET    /api/event/:event_id
POST   /api/admin/event
PUT    /api/admin/event/:event_id
DELETE /api/admin/event/:event_id

// ❌ INCORRECT
GET    /api/events (plural)
GET    /api/event/123 (no prefix on param)
POST   /api/createEvent (action in path)
```

**Query Parameters:** snake_case

```typescript
GET /api/event?
  category=culture&        // filter
  start_date=2026-05-26&   // range start
  end_date=2026-05-30      // range end
```

---

#### Code Files & Functions

**Convention:** 
- Components (React): `PascalCase` filenames → UserCard.tsx, EventDetail.tsx
- Utils / Services: `camelCase` filenames → getUserData.ts, uploadImage.ts
- Functions: `camelCase` names → getUserById(), createEvent()

```typescript
// ✅ CORRECT
// src/components/EventCard.tsx
export function EventCard({ event }: { event: Event }) { ... }

// src/services/eventService.ts
export async function getEventById(id: string): Promise<Event> { ... }

// src/utils/dateUtils.ts
export function formatEventDate(date: Date): string { ... }

// ❌ INCORRECT
// src/components/event-card.tsx (kebab-case)
// src/services/GetEventById.ts (PascalCase for utility)
```

---

### Structure Patterns

#### Project Organization

**Backend (Express + Node.js):**
```
src/
  ├── controllers/        # Request handlers (thin wrappers)
  ├── services/          # Business logic (event creation, validation)
  ├── models/            # Prisma client + types (exported from schema)
  ├── routes/            # Express routes (REST endpoints)
  ├── middleware/        # Auth, error handling, logging
  ├── types/             # TypeScript interfaces (Zod schemas)
  ├── utils/             # Helpers (compression, dates, etc.)
  └── app.ts             # Express app setup

tests/
  ├── unit/              # Service/business logic tests
  │   └── services/eventService.test.ts
  ├── integration/       # API + DB tests
  │   └── api/event.test.ts
  └── fixtures/          # Test data (mock events, users)

prisma/
  ├── schema.prisma      # Database schema
  └── migrations/        # Auto-generated migrations (DO NOT EDIT)
```

**Backoffice (Next.js):**
```
src/
  ├── app/               # Next.js pages (app router)
  │   ├── login/page.tsx
  │   ├── admin/
  │   │   ├── create/page.tsx
  │   │   ├── validation/[event_id]/page.tsx
  │   │   └── history/page.tsx
  │   └── layout.tsx
  ├── components/        # React components
  │   ├── EventForm.tsx
  │   ├── ValidationQueue.tsx
  │   └── common/
  ├── services/          # API client + business logic
  │   └── eventService.ts
  ├── hooks/             # Custom React hooks
  │   └── useEventForm.ts
  ├── utils/             # Helpers
  └── types/             # TypeScript interfaces

tests/
  ├── unit/              # Component + hook tests
  └── integration/       # Page + form tests
```

**Mobile (React Native + Expo):**
```
src/
  ├── screens/           # Screen components
  │   ├── EventListScreen.tsx
  │   ├── EventDetailScreen.tsx
  │   └── LoginScreen.tsx
  ├── components/        # Reusable UI components
  │   ├── EventCard.tsx
  │   └── FilterBar.tsx
  ├── services/          # API client
  │   └── eventService.ts
  ├── hooks/             # Custom hooks
  │   └── useEventList.ts
  ├── types/             # TypeScript interfaces
  └── utils/             # Helpers

tests/
  ├── unit/              # Component + hook tests
  └── fixtures/          # Mock data
```

---

#### Test File Naming

**Convention:** `{module}.test.ts` in separate `tests/` folder

```
src/
  └── services/eventService.ts

tests/
  └── unit/eventService.test.ts

// ✅ CORRECT: tests/ folder, .test.ts suffix
// ❌ INCORRECT: eventService.test.ts alongside source
```

---

### Format Patterns

#### API Response Format

**Success Response (200 OK):**
```json
{
  "event": {
    "id": "event-123",
    "title": "Ciné Europe",
    "status": "published",
    ...
  }
}
```

**Error Response (400/401/500):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Le titre est obligatoire.",
    "details": {
      "field": "title",
      "reason": "required"
    }
  }
}
```

**Validation Errors (from Zod):**
```typescript
// Backend: catch Zod errors, translate to French
try {
  const data = eventSchema.parse(req.body);
} catch (error) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Vérifiez que tous les champs obligatoires sont remplis.",
        details: error.issues.map(issue => ({
          field: issue.path[0],
          reason: issue.code
        }))
      }
    });
  }
}
```

---

#### Date Format

**Convention:** ISO 8601 strings in APIs, JavaScript Date in code

```typescript
// API (JSON)
"start_date_time": "2026-05-26T20:30:00Z"  // ISO UTC

// Code (TypeScript)
const event = {
  startDateTime: new Date('2026-05-26T20:30:00Z'),  // JS Date
  endDateTime: new Date('2026-05-26T23:00:00Z')
};

// Database (Prisma)
start_date_time DateTime  // Stored as TIMESTAMP, Prisma converts to Date
```

---

#### JSON Field Naming

**Convention:** `snake_case` in JSON (API), `camelCase` in code

```typescript
// API Response (snake_case)
{
  "event_id": "123",
  "is_all_day": true,
  "start_date_time": "2026-05-26T20:30:00Z"
}

// TypeScript Type (camelCase for code)
interface Event {
  eventId: string;
  isAllDay: boolean;
  startDateTime: Date;
}

// Mapping (in API response builder)
return {
  event_id: event.eventId,      // snake_case for JSON
  is_all_day: event.isAllDay,
  start_date_time: event.startDateTime.toISOString()
};
```

---

### Communication Patterns

#### Error Handling (Backend)

**All errors must be user-friendly (French):**

```typescript
// ❌ WRONG: Technical error
return res.status(500).json({
  error: {
    code: "DATABASE_CONNECTION_FAILED",
    message: "Cannot reach PostgreSQL at 192.168.1.1:5432"
  }
});

// ✅ CORRECT: User-friendly
return res.status(500).json({
  error: {
    code: "SERVER_ERROR",
    message: "Une erreur serveur s'est produite. Réessayez dans quelques instants."
  }
});
```

**Error Code Mapping:**
```typescript
const ERROR_MESSAGES: Record<string, string> = {
  'VALIDATION_ERROR': 'Vérifiez les champs obligatoires.',
  'UNAUTHORIZED': 'Vous n\'êtes pas connecté. Reconnectez-vous.',
  'FORBIDDEN': 'Vous n\'avez pas la permission.',
  'NOT_FOUND': 'La ressource n\'existe pas.',
  'IMAGE_TOO_LARGE': 'L\'image dépasse 5 MB.',
  'INVALID_DATE': 'La date de fin doit être après la date de début.',
  'NETWORK_ERROR': 'Problème de connexion. Réessayez.',
  'SERVER_ERROR': 'Une erreur serveur s\'est produite.'
};
```

---

#### Logging (Pino)

**Convention:** Structured logging with context

```typescript
import pino from 'pino';

const logger = pino();

// ✅ CORRECT: Structured, with context
logger.info({
  method: 'POST',
  path: '/api/admin/event',
  userId: user.id,
  statusCode: 200,
  durationMs: 245
}, 'Event created successfully');

// ✅ Errors with context
logger.error({
  error: err.message,
  stack: err.stack,
  userId: user.id,
  action: 'create_event'
}, 'Failed to create event');

// ❌ WRONG: Unstructured
console.log('Event created');
```

---

#### Loading States (Frontend)

**Convention:** isLoading boolean, clear UI feedback

```typescript
// ✅ CORRECT
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (data) => {
  setIsLoading(true);
  try {
    const res = await fetch('/api/admin/event', { method: 'POST', body: JSON.stringify(data) });
    if (!res.ok) throw new Error('Failed');
    showToast('✓ Événement publié', 'success');
  } catch (err) {
    showToast('Erreur : ' + err.message, 'error');
  } finally {
    setIsLoading(false);
  }
};

// UI
<button disabled={isLoading}>
  {isLoading ? 'Publication...' : 'Publier'}
</button>
```

---

### Enforcement Guidelines

**All AI Agents MUST:**

1. ✅ Use `snake_case` for database tables/columns
2. ✅ Use singular resource paths for API endpoints (GET /api/event/:event_id)
3. ✅ Use `PascalCase` for React components, `camelCase` for utilities
4. ✅ Place tests in separate `tests/` folder with `.test.ts` suffix
5. ✅ Return user-friendly error messages in French (never technical jargon)
6. ✅ Use ISO 8601 dates in APIs (JSON), JavaScript Date in code
7. ✅ Implement structured logging with Pino (context + log level)
8. ✅ Validate input with Zod schemas (shared between backend + frontend)

**Pattern Violations:**
- If Camil or Claude Code agent violates naming (e.g., creates /api/events plural), stop and flag it
- Document all deviations in a `PATTERNS.violations.md` file
- Review violations in next architecture sync

---

### Pattern Examples

**Good Examples:**

✅ **Event Creation (Full Stack):**

Database:
```prisma
model event {
  id              String    @id @default(cuid())
  title           String
  created_at      DateTime  @default(now())
}
```

Backend API:
```typescript
// POST /api/admin/event
const eventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1)
  // ...
});

app.post('/api/admin/event', async (req, res) => {
  try {
    const data = eventSchema.parse(req.body);
    const event = await prisma.event.create({ data });
    return res.json({ event });
  } catch (err) {
    // Return user-friendly error
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Vérifiez que tous les champs obligatoires sont remplis.'
      }
    });
  }
});
```

Frontend Form:
```typescript
// EventForm.tsx
const EventForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(eventSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/event', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed');
      showToast('✓ Événement publié', 'success');
    } catch (err) {
      showToast('Erreur : ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
};
```

Test:
```typescript
// tests/unit/services/eventService.test.ts
describe('eventService', () => {
  it('creates event with valid data', async () => {
    const data = { title: 'Test', description: '...' };
    const event = await createEvent(data);
    expect(event.id).toBeDefined();
    expect(event.title).toBe('Test');
  });
});

// tests/integration/api/event.test.ts
describe('POST /api/admin/event', () => {
  it('returns 400 if title missing', async () => {
    const res = await request(app)
      .post('/api/admin/event')
      .send({ description: '...' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

---

**Anti-Patterns (What NOT to Do):**

❌ **Mixed naming conventions:**
```typescript
// WRONG: Events (plural) + userId (camelCase in snake_case context)
GET /api/events/:userId
// CORRECT:
GET /api/event?user_id=...
```

❌ **Technical error messages:**
```typescript
// WRONG:
return res.status(500).json({ error: 'PostgreSQL connection timeout' });
// CORRECT:
return res.status(500).json({ 
  error: { 
    message: 'Une erreur serveur s\'est produite. Réessayez.' 
  } 
});
```

❌ **Tests in source folders:**
```
src/
  └── services/
      ├── eventService.ts
      └── eventService.test.ts  // WRONG: should be in tests/
```

---

_Patterns finalized. Ready for step-06: Project Structure._

---

## Project Structure & Boundaries (Monorepo)

**Organization:** Monorepo with 3 independent packages (mobile, backend, backoffice) + shared root configuration.

### Complete Project Directory Structure

```
ma-ville-agenda/
│
├── README.md                          # Project overview + setup instructions
├── .gitignore                         # Git ignore rules (all packages)
├── .env.example                       # Environment variables template
├── package.json                       # Root package (workspaces, shared scripts)
├── pnpm-workspace.yaml                # PNPM monorepo config (or yarn/npm)
│
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Run tests + lint on all packages
│       └── deploy.yml                 # Deploy backoffice + API (Vercel)
│
├── packages/
│
│   ├── mobile/                        # React Native + Expo app
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.local                 # Dev: API endpoint, debug settings
│   │   ├── .env.example
│   │   ├── app.json                   # Expo app config (name, icon, splash)
│   │   ├── eas.json                   # EAS Build config (iOS/Android builds)
│   │   ├── .gitignore
│   │   ├── README.md                  # Mobile app setup
│   │   ├── src/
│   │   │   ├── index.tsx              # Entry point (Expo)
│   │   │   ├── navigation/            # React Navigation setup
│   │   │   │   └── RootNavigator.tsx
│   │   │   ├── screens/               # Screen components
│   │   │   │   ├── EventListScreen.tsx
│   │   │   │   ├── EventDetailScreen.tsx
│   │   │   │   └── LoginScreen.tsx
│   │   │   ├── components/            # Reusable UI components
│   │   │   │   ├── EventCard.tsx
│   │   │   │   ├── FilterBar.tsx
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   ├── services/              # API client
│   │   │   │   └── eventService.ts    # fetch() to /api/event
│   │   │   ├── hooks/                 # Custom React hooks
│   │   │   │   ├── useEventList.ts
│   │   │   │   └── useAuth.ts
│   │   │   ├── types/                 # TypeScript interfaces
│   │   │   │   └── index.ts
│   │   │   ├── utils/                 # Helpers (date formatting, etc.)
│   │   │   │   └── dateUtils.ts
│   │   │   └── assets/                # Images, fonts
│   │   ├── tests/                     # Tests (separate from src)
│   │   │   ├── unit/
│   │   │   │   ├── services/eventService.test.ts
│   │   │   │   ├── hooks/useEventList.test.ts
│   │   │   │   └── utils/dateUtils.test.ts
│   │   │   ├── integration/
│   │   │   │   └── screens/EventListScreen.test.tsx
│   │   │   └── fixtures/              # Mock data
│   │   │       └── mockEvents.ts
│   │   └── node_modules/
│   │
│   ├── backend/                       # Node.js + Express API
│   │   ├── package.json               # nodemon, typescript, express, prisma, pino
│   │   ├── tsconfig.json
│   │   ├── .env.local                 # Dev: DATABASE_URL, JWT_SECRET
│   │   ├── .env.example
│   │   ├── .gitignore
│   │   ├── README.md                  # API setup + endpoints
│   │   ├── src/
│   │   │   ├── index.ts               # Entry point (app.listen())
│   │   │   ├── app.ts                 # Express app setup (middleware, routes)
│   │   │   ├── controllers/           # Request handlers (thin layer)
│   │   │   │   ├── eventController.ts
│   │   │   │   └── authController.ts
│   │   │   ├── services/              # Business logic
│   │   │   │   ├── eventService.ts    # Create, read, validate events
│   │   │   │   ├── authService.ts     # Login, token generation
│   │   │   │   ├── imageService.ts    # Image compression via Sharp
│   │   │   │   └── blobService.ts     # Vercel Blob integration
│   │   │   ├── routes/                # Express routes (REST endpoints)
│   │   │   │   ├── eventRoutes.ts     # GET /api/event, POST /api/admin/event
│   │   │   │   └── authRoutes.ts      # POST /api/admin/auth/login
│   │   │   ├── middleware/            # Express middleware
│   │   │   │   ├── authMiddleware.ts  # JWT validation
│   │   │   │   ├── errorHandler.ts    # Global error handling (user-friendly messages)
│   │   │   │   └── logging.ts         # Pino logger setup
│   │   │   ├── types/                 # TypeScript interfaces + Zod schemas
│   │   │   │   ├── index.ts
│   │   │   │   ├── event.ts           # Event interface
│   │   │   │   └── schemas.ts         # Zod validation schemas
│   │   │   ├── utils/                 # Helpers
│   │   │   │   ├── dateUtils.ts
│   │   │   │   └── errors.ts          # Error code mapping (to French messages)
│   │   │   └── config/
│   │   │       └── database.ts        # Prisma client setup
│   │   ├── prisma/
│   │   │   ├── schema.prisma          # Database schema (snake_case)
│   │   │   └── migrations/            # Auto-generated migrations (DO NOT EDIT)
│   │   ├── tests/                     # Tests (separate from src)
│   │   │   ├── unit/
│   │   │   │   ├── services/
│   │   │   │   │   ├── eventService.test.ts
│   │   │   │   │   └── authService.test.ts
│   │   │   │   └── utils/
│   │   │   │       └── dateUtils.test.ts
│   │   │   ├── integration/
│   │   │   │   ├── api/
│   │   │   │   │   ├── event.test.ts  # Test GET /api/event, POST /api/admin/event
│   │   │   │   │   └── auth.test.ts   # Test POST /api/admin/auth/login
│   │   │   │   └── db/
│   │   │   │       └── event.test.ts  # Test Prisma queries
│   │   │   ├── fixtures/              # Mock data
│   │   │   │   └── mockEvents.ts
│   │   │   └── setup.ts               # Jest config, test DB setup
│   │   └── node_modules/
│   │
│   ├── backoffice/                    # Next.js + React backoffice admin
│   │   ├── package.json               # next, react, typescript, tailwind, react-hook-form, zod
│   │   ├── tsconfig.json
│   │   ├── next.config.js             # Next.js config
│   │   ├── tailwind.config.ts         # Tailwind CSS config
│   │   ├── .env.local                 # Dev: NEXT_PUBLIC_API_URL, NEXTAUTH_SECRET
│   │   ├── .env.example
│   │   ├── .gitignore
│   │   ├── README.md                  # Backoffice setup
│   │   ├── src/
│   │   │   ├── app/                   # Next.js App Router
│   │   │   │   ├── layout.tsx         # Root layout (auth check, nav)
│   │   │   │   ├── page.tsx           # Home → redirect to /admin/dashboard
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx       # Login form (email + password)
│   │   │   │   ├── admin/
│   │   │   │   │   ├── layout.tsx     # Protected admin layout (middleware check)
│   │   │   │   │   ├── page.tsx       # Dashboard → redirect to /admin/create or /admin/validation
│   │   │   │   │   ├── create/
│   │   │   │   │   │   └── page.tsx   # Create event form (all 7 fields + image upload)
│   │   │   │   │   ├── validation/
│   │   │   │   │   │   ├── page.tsx   # Validation queue (list of pending events)
│   │   │   │   │   │   └── [event_id]/
│   │   │   │   │   │       └── page.tsx  # Detail + approve/reject
│   │   │   │   │   └── history/
│   │   │   │   │       └── page.tsx   # Published event history
│   │   │   │   └── api/                # API routes (internal Next.js routes)
│   │   │   │       └── auth/
│   │   │   │           └── route.ts    # POST /api/auth/login → calls /api/admin/auth/login
│   │   │   ├── components/            # React components
│   │   │   │   ├── auth/
│   │   │   │   │   └── LoginForm.tsx
│   │   │   │   ├── events/
│   │   │   │   │   ├── EventForm.tsx      # Create event form (with drag-drop + compression)
│   │   │   │   │   ├── ValidationQueue.tsx
│   │   │   │   │   ├── EventCard.tsx
│   │   │   │   │   └── HistoryList.tsx
│   │   │   │   ├── common/
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   ├── Toast.tsx       # User feedback (success/error)
│   │   │   │   │   └── LoadingButton.tsx
│   │   │   │   └── ui/
│   │   │   │       ├── Button.tsx
│   │   │   │       ├── Input.tsx
│   │   │   │       └── Modal.tsx
│   │   │   ├── services/               # API client
│   │   │   │   └── eventService.ts    # fetch() to /api/admin/event
│   │   │   ├── hooks/                 # Custom React hooks
│   │   │   │   ├── useEventForm.ts
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useValidationQueue.ts
│   │   │   ├── types/                 # TypeScript interfaces + Zod schemas
│   │   │   │   ├── index.ts
│   │   │   │   └── schemas.ts         # Reused from backend (shared validation)
│   │   │   ├── utils/                 # Helpers
│   │   │   │   ├── imageCompression.ts  # browser-image-compression wrapper
│   │   │   │   ├── dateUtils.ts
│   │   │   │   └── errors.ts          # User-friendly error messages (French)
│   │   │   ├── middleware.ts          # Next.js middleware (auth check on admin routes)
│   │   │   └── styles/
│   │   │       └── globals.css        # Global Tailwind styles
│   │   ├── public/                    # Static assets
│   │   │   └── images/
│   │   ├── tests/                     # Tests (separate from src)
│   │   │   ├── unit/
│   │   │   │   ├── components/
│   │   │   │   │   ├── EventForm.test.tsx
│   │   │   │   │   └── ValidationQueue.test.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── useEventForm.test.ts
│   │   │   ├── integration/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── login.test.tsx
│   │   │   │   │   ├── create.test.tsx
│   │   │   │   │   └── validation.test.tsx
│   │   │   │   └── flows/
│   │   │   │       └── eventCreation.test.tsx  # Full flow: create → validate → publish
│   │   │   └── fixtures/
│   │   │       └── mockEvents.ts
│   │   └── node_modules/
│   │
│   └── shared/                        # Shared types, schemas, utils (optional)
│       ├── package.json
│       ├── src/
│       │   ├── types/
│       │   │   └── index.ts           # Shared TypeScript types
│       │   ├── schemas/
│       │   │   └── event.ts           # Zod schemas (used by backend + backoffice)
│       │   └── utils/
│       │       └── dateUtils.ts       # Shared date utilities
│       └── tsconfig.json
│
└── docs/
    ├── API.md                         # API documentation (endpoints, examples)
    ├── DEVELOPMENT.md                 # Development setup + running locally
    ├── DEPLOYMENT.md                  # Deployment to Vercel + Supabase
    └── PATTERNS.md                    # Code patterns + conventions
```

---

### Architectural Boundaries

#### API Boundaries (Backend)

**Public Endpoints (Mobile App):**
```
GET  /api/event           → Fetch event list (public, no auth)
GET  /api/event/:event_id → Fetch event detail (public, no auth)
```

**Protected Endpoints (Super-Admin):**
```
POST   /api/admin/auth/login     → Login (email + password) → JWT cookie
POST   /api/admin/event          → Create event (requires auth)
PUT    /api/admin/event/:event_id → Update event status (draft→pending→published/rejected)
DELETE /api/admin/event/:event_id → Archive/unpublish event
GET    /api/admin/validation-queue → List pending events (for super-admin)
```

**Boundary Rules:**
- All protected endpoints check JWT from HTTP-only cookie (via `authMiddleware`)
- All responses include `error` field on failure (even 4xx/5xx)
- All errors return French user-friendly messages (not technical jargon)

---

#### Component Boundaries (Frontend)

**Mobile App:**
- **Boundary:** EventListScreen ↔ eventService (fetch /api/event)
- **Communication:** useState + useEffect → fetch on mount, setState with results
- **Isolated:** LoginScreen (if added later)

**Backoffice:**
- **Boundary:** EventForm ↔ eventService (fetch /api/admin/event)
- **Communication:** React Hook Form + Zod → submit → eventService.createEvent() → setState
- **Protected:** All admin/* pages require valid JWT (checked in middleware.ts)
- **Isolated:** LoginForm (separate from admin pages)

**Data Flow:**
1. Backoffice EventForm → POST /api/admin/event → Backend eventService.createEvent() → Prisma create
2. Backend response → Backoffice setState → UI updates → Toast shows "✓ Événement publié"
3. Mobile EventListScreen → polling (refresh on app open) → GET /api/event → setState

---

#### Service Boundaries

**Backend Services (Business Logic):**
- `eventService.ts`: Create, validate, filter, publish events (logic shared across routes)
- `authService.ts`: Login flow, JWT generation, password verification
- `imageService.ts`: Compress images via Sharp (fallback if browser compression fails)
- `blobService.ts`: Upload to Vercel Blob, return URL

**Frontend Services:**
- `eventService.ts`: HTTP client (fetch wrapper for /api/admin/event)
- `imageCompression.ts`: Wrapper around browser-image-compression library
- Hooks (useEventForm, useAuth): Combine fetch + state management

**Boundary Rules:**
- Services never touch React components (no setState, no hooks)
- Components call services via hooks (useEventForm, etc.)
- All service errors throw exceptions; components catch and display

---

#### Data Boundaries

**Database Schema (Prisma):**
- `event` table: Contains all event data (title, image_url, status, etc.)
- `user` table: Super-admin credentials (email, password_hash)
- Migrations in `prisma/migrations/`: Version-controlled schema changes

**API Data Format:**
- Request/Response: JSON with snake_case fields (event_id, start_date_time, etc.)
- Dates: ISO 8601 strings (2026-05-26T20:30:00Z)
- Errors: Always `{ error: { code, message, details } }` format

**Caching (Frontend):**
- Mobile: Browser cache via HTTP headers (if-none-match)
- Backoffice: React state (useState), no explicit caching (refresh on demand)

---

### Requirements to Structure Mapping

#### Feature Mapping (PRD)

| PRD Feature | Backend | Backoffice | Mobile |
|---|---|---|---|
| **F1: Event List** | GET /api/event | — | EventListScreen |
| **F2: Filter by Category** | Filter logic in eventService | FilterBar component | FilterBar component |
| **F3: Event Detail** | GET /api/event/:id | — | EventDetailScreen |
| **F4: Navigation by Date** | start_date_time field | — | Date navigation logic |
| **F5a: Super-admin Auth** | authService + authRoutes | LoginForm + middleware | — |
| **F5b: Create Event** | POST /api/admin/event + eventService | EventForm page | — |
| **F5c: Validation Queue** | GET /api/admin/validation-queue | ValidationQueue page | — |
| **F5d: Validate/Reject** | PUT /api/admin/event/:id + status update | EventForm detail page | — |
| **F5e: Event History** | Query events by status=published | HistoryList page | — |

#### Cross-Cutting Concerns

| Concern | Location | Implementation |
|---|---|---|
| **Error Handling** | `backend/src/middleware/errorHandler.ts` | Catch exceptions, translate to French, return JSON |
| **Image Upload** | `backoffice/src/utils/imageCompression.ts` + `backend/src/services/imageService.ts` | Compress client-side (browser-image-compression), fallback server-side (Sharp) |
| **Authentication** | `backend/src/services/authService.ts` + `backoffice/src/middleware.ts` | Supabase Auth → JWT → HTTP-only cookie |
| **Logging** | `backend/src/middleware/logging.ts` | Pino structured logs (context + log level) |
| **Validation** | `backend/src/types/schemas.ts` (Zod) + `backoffice/src/types/schemas.ts` (reused) | Single source of truth (Zod schemas) |

---

### Integration Points

#### Internal Communication

**Mobile ↔ Backend:**
- Method: HTTP (REST)
- Protocol: GET /api/event (polling on app open)
- Format: JSON with snake_case fields
- Auth: No authentication required (public read)

**Backoffice ↔ Backend:**
- Method: HTTP (REST)
- Protocol: POST /api/admin/event, PUT /api/admin/event/:id, etc.
- Format: JSON with snake_case fields + multipart/form-data (image upload)
- Auth: JWT in HTTP-only cookie (validated in authMiddleware)

**Backoffice ↔ Vercel Blob:**
- Method: JavaScript fetch (via imageService wrapper)
- Protocol: PUT request to Vercel Blob API
- Format: multipart/form-data (image file)
- Returns: URL stored in event.image_url

---

#### External Integrations

**Vercel Functions (Deployment):**
- Backend API deployed as serverless Functions
- Cold start: expect 800-2000ms on first request (mitigated by keepalive GitHub Action)

**Supabase PostgreSQL (Database):**
- Backend connects via DATABASE_URL connection string
- Prisma handles schema migrations

**Vercel Blob (Image Storage):**
- Backoffice uploads compressed images via fetch to Vercel Blob
- Returns public URL, stored in database

**Supabase Auth (Authentication):**
- Super-admin login flow via Supabase Auth API
- Returns JWT (stored in HTTP-only cookie)

---

### File Organization Patterns

#### Configuration Files

**Root Level:**
- `package.json`: Monorepo workspaces configuration
- `pnpm-workspace.yaml`: PNPM workspace definition
- `.gitignore`: Ignore node_modules, .env, build outputs across all packages
- `.env.example`: Template for environment variables (shared by all packages)

**Per Package:**
- `.env.local`: Local dev environment (not committed)
- `.env.example`: Template (committed, shows required vars)

#### Source Organization

**Backend:**
- `src/controllers/`: Thin request handlers (parse input, call service, return response)
- `src/services/`: Business logic (event creation, validation, auth)
- `src/routes/`: Express route definitions (map endpoints to controllers)
- `src/middleware/`: Auth, error handling, logging
- `src/types/`: TypeScript interfaces + Zod schemas
- `src/utils/`: Helpers (date formatting, error mapping)

**Backoffice:**
- `src/app/`: Next.js App Router (pages organized by URL path)
- `src/components/`: Reusable UI components (organized by feature or type)
- `src/services/`: API client (fetch wrappers)
- `src/hooks/`: Custom React hooks (useEventForm, useAuth)
- `src/types/`: TypeScript interfaces (reused from backend schemas)
- `src/utils/`: Helpers (image compression, date formatting)

**Mobile:**
- `src/screens/`: Full-screen components (EventListScreen, EventDetailScreen)
- `src/components/`: Reusable UI components (EventCard, FilterBar)
- `src/services/`: API client (fetch wrappers)
- `src/hooks/`: Custom hooks (useEventList, useAuth)
- `src/types/`: TypeScript interfaces
- `src/utils/`: Helpers

#### Test Organization

**Convention:** Tests live in `tests/` folder (not co-located with source)

**Structure:**
- `tests/unit/`: Single-module tests (services, utils, components in isolation)
- `tests/integration/`: Multi-module tests (API route + service + DB, or page + form submission)
- `tests/fixtures/`: Mock data (mockEvents, mockUsers)

---

### Development Workflow Integration

**Development Server Structure:**

**Backend:**
- Run with `npm run dev` (uses nodemon to auto-reload on .ts changes)
- Listens on http://localhost:3001
- Environment: `.env.local` with DATABASE_URL (local Supabase), JWT_SECRET

**Backoffice:**
- Run with `npm run dev` (Next.js dev server with hot reload)
- Listens on http://localhost:3000
- Environment: `.env.local` with NEXT_PUBLIC_API_URL=http://localhost:3001

**Mobile:**
- Run with `npm start` (Expo dev server)
- Scans QR code to open on device/simulator
- Environment: Hardcoded API endpoint or .env.local (Expo-specific)

**Database (Prisma):**
- Local dev: Supabase PostgreSQL (free tier) or local Postgres instance
- Run migrations: `npx prisma migrate dev` (creates migration files, applies to DB)
- Reset DB: `npx prisma migrate reset` (drop + recreate schema)

---

### Build & Deployment Structure

**Build Outputs:**
- Backend: JavaScript compiled to `dist/` (via tsc) or bundled via esbuild
- Backoffice: Next.js outputs to `.next/` (optimized for Vercel)
- Mobile: Expo build artifacts to `dist/` (EAS Build handles device-specific builds)

**Deployment:**
- Backend + Backoffice: Push to GitHub → GitHub Actions CI runs tests → Vercel auto-deploys
- Mobile: EAS Build creates iOS/Android binaries → Manual submission to App Stores

---

_Project structure finalized. Ready for step-07: Architecture Validation._

---

## Architecture Validation Results (2026-05-29)

### Coherence Validation ✅

**Decision Compatibility:**
- ✅ React Native (mobile) + Next.js (backoffice) + Node.js/Express (API) = compatible stack
- ✅ Supabase PostgreSQL works with Prisma, Vercel Functions, and EAS Build
- ✅ Supabase Auth (JWT) compatible with Vercel Functions stateless environment
- ✅ browser-image-compression (client) + Sharp (server fallback) = compatible image pipeline
- ✅ Zod schemas sharable between backend + frontend (both TypeScript)
- **Result:** All technology versions and choices are compatible with each other

**Pattern Consistency:**
- ✅ snake_case naming (DB) ↔ singular API endpoints → consistent with REST conventions
- ✅ PascalCase components + camelCase utils → standard TypeScript conventions
- ✅ Structured Pino logging ↔ fetch() + useState() patterns → aligned for dev workflow
- ✅ Zod validation in backend + frontend forms → single source of truth
- ✅ React Context (lightweight) + fetch() matches scope (single admin, few endpoints)
- **Result:** All patterns align with technology stack and architectural decisions

**Structure Alignment:**
- ✅ Monorepo with `/packages/mobile`, `/packages/backend`, `/packages/backoffice` → clear separation
- ✅ `/tests` separate from `/src` in all packages → consistent with patterns
- ✅ `src/services/` + `src/controllers/` (backend) ↔ service isolation pattern
- ✅ `src/app/` (Next.js) allows protected routes via middleware → supports auth boundary
- ✅ API boundaries clearly defined (public GET /api/event, protected POST /api/admin/event)
- **Result:** Project structure supports all architectural decisions

---

### Requirements Coverage Validation ✅

**Features from PRD (F1-F5) Coverage:**

| Feature | Architectural Support | Status |
|---|---|---|
| **F1: List events** | GET /api/event → mobile EventListScreen + polling | ✅ Full support |
| **F2: Filter by category** | API query param + frontend FilterBar component | ✅ Full support |
| **F3: Event detail** | GET /api/event/:id → EventDetailScreen | ✅ Full support |
| **F4: Navigate by date** | start_date_time field in schema + UI logic | ✅ Full support |
| **F5a: Super-admin auth** | Supabase Auth + JWT + HTTP-only cookie + authMiddleware | ✅ Full support |
| **F5b: Create event** | POST /api/admin/event + EventForm + Zod validation | ✅ Full support |
| **F5c: Validation queue** | GET /api/admin/validation-queue + ValidationQueue page | ✅ Full support |
| **F5d: Validate/reject** | PUT /api/admin/event/:id + status update + toast feedback | ✅ Full support |
| **F5e: Event history** | Query events by status=published + HistoryList page | ✅ Full support |

**Non-Functional Requirements Coverage:**

| Requirement | Architectural Support | Status |
|---|---|---|
| **Performance** | Vercel Functions + Supabase PostgreSQL + client-side image compression | ✅ Addressed |
| **Security** | Supabase Auth + JWT in HTTP-only cookie + Zod validation + error translation | ✅ Addressed |
| **Scalability** | Vercel Functions (auto-scaling) + Supabase free→paid tier upgrade path | ✅ Addressed |
| **Solo dev maintainability** | Monorepo + shared validation + fetch() not TanStack Query + clear patterns | ✅ Addressed |
| **Budget zero** | Vercel + Supabase + Expo free tiers confirmed | ✅ Addressed |

**Result:** All PRD features and constraints are architecturally supported

---

### Implementation Readiness Validation ✅

**Decision Completeness:**
- ✅ Technology stack specified with versions (React Native + Expo, Node.js + Express, Next.js, PostgreSQL, Prisma, Zod)
- ✅ All critical decisions documented (auth method, API pattern, database, hosting)
- ✅ Party mode resolutions recorded (Supabase dev+prod, Supabase Auth, fetch() + useState, drag-drop + compression)
- ✅ Implementation patterns complete (naming, structure, formats, communication, process)
- **Result:** Decisions are comprehensive and documented for AI agent guidance

**Structure Completeness:**
- ✅ Complete directory tree with all files and folders specified
- ✅ Component boundaries explicitly defined (EventForm ↔ eventService, screens ↔ services)
- ✅ API boundaries clear (public GET /api/event, protected POST /api/admin/event)
- ✅ Service boundaries explicit (eventService, authService, imageService, blobService)
- ✅ Integration points documented (mobile ↔ backend, backoffice ↔ backend, backoffice ↔ Blob)
- **Result:** Structure is detailed enough for consistent AI agent implementation

**Pattern Completeness:**
- ✅ Naming conventions: snake_case (DB), singular endpoints, PascalCase components, camelCase utils
- ✅ Structure patterns: tests separate, services isolated, components by feature
- ✅ Format patterns: ISO 8601 dates, JSON snake_case, error messages in French
- ✅ Communication patterns: fetch() + setState (simple), error handling (user-friendly), logging (Pino structured)
- ✅ Process patterns: loading states, form validation, image compression
- **Result:** Patterns cover all major decision points and potential conflicts

---

### Gap Analysis Results

**Critical Gaps:** ✅ None identified
- All major architectural decisions are made
- All features have clear implementation paths
- No blocking unknowns remain

**Important Gaps:** ✅ None found
- Architecture is sufficiently detailed for implementation
- All boundaries and patterns are specified
- No significant ambiguities

**Nice-to-Have Gaps (Optional, V1.1+):**
- 🔸 Monitoring/observability beyond Pino logs (Sentry, etc.) — deferred to V2
- 🔸 Rate limiting implementation details — basic spec exists, refinement in V2
- 🔸 GDPR compliance checklist — mentioned in pre-launch checklist, detail in V2
- 🔸 Performance profiling baselines — cold start monitoring in place, deep optimization post-MVP

---

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed (Brief + PRD + stakeholder input)
- [x] Scale and complexity assessed (solo dev, 30k population, 500 downloads target)
- [x] Technical constraints identified (zero budget, Vercel, solo maintainability)
- [x] Cross-cutting concerns mapped (auth, logging, error handling, image upload)

**Architectural Decisions**
- [x] Critical decisions documented with versions (stack, auth method, database, hosting)
- [x] Technology stack fully specified (React Native, Express, Next.js, PostgreSQL, Prisma, Zod)
- [x] Integration patterns defined (REST API, JWT cookies, fetch() + useState)
- [x] Performance considerations addressed (cold starts, image compression, Vercel scaling)

**Implementation Patterns**
- [x] Naming conventions established (snake_case DB, singular endpoints, PascalCase components)
- [x] Structure patterns defined (tests separate, services isolated, monorepo organization)
- [x] Communication patterns specified (fetch() + setState, structured Pino logging, error mapping)
- [x] Process patterns documented (loading states, form validation, image compression workflow)

**Project Structure**
- [x] Complete directory structure defined (monorepo with 3 packages + root config)
- [x] Component boundaries established (screens, components, services clearly separated)
- [x] Integration points mapped (API endpoints, Vercel Blob, Supabase connections)
- [x] Requirements to structure mapping complete (every PRD feature → files/directories)

**Checklist Result:** 16 of 16 items ✅ (100% complete)

---

### Architecture Readiness Assessment

**Overall Status:** ✅ **READY FOR IMPLEMENTATION**

All checklist items are complete, no critical gaps remain, and all requirements are supported.

**Confidence Level:** 🟢 **HIGH**

- All technology decisions are proven and compatible
- Implementation patterns are comprehensive and specific
- Project structure is detailed and follows best practices
- No blockers identified for Camil solo dev + Claude Code agents
- Party mode feedback integrated (simplified stack, clear boundaries)

**Key Strengths:**
1. **Coherent stack** — React Native + Next.js + Express + Supabase all compatible, zero friction integration
2. **Pattern clarity** — Naming, structure, communication patterns eliminate ambiguity for AI agents
3. **Scope discipline** — Simplified frontend (fetch+useState, no TanStack Query), prioritizes launch speed
4. **Solo dev optimized** — Monorepo structure, shared validation, clear separation of concerns
5. **Budget-conscious** — All free/zero-cost tiers for 8-12 week MVP, clear upgrade path post-launch
6. **Party mode validated** — Architecture evolved from four independent perspectives (architect, engineer, UX, PM)

**Areas for Future Enhancement:**
1. **Observability (V2)** — Add Sentry for error tracking beyond Pino logs
2. **Performance optimization (V2)** — Deep profiling, caching strategies, bundle size analysis
3. **GDPR compliance (V2)** — Data retention policies, user export/delete workflows
4. **Rate limiting details (V2)** — Fine-tune rate limit constants, per-user tracking
5. **Image optimization (V2)** — Advanced crop UI, progressive loading, adaptive quality
6. **Multi-user RBAC (V2)** — Transition from super-admin-only to role-based access (commerçants, modos)

---

### Implementation Handoff

**For Claude Code / AI Agents:**

✅ **Follow all architectural decisions exactly as documented:**
- Use Supabase PostgreSQL (not SQLite) for dev + prod
- Use Supabase Auth (JWT) for super-admin authentication
- Use fetch() + useState() for backoffice state (not TanStack Query)
- Use snake_case for database columns, singular endpoints, PascalCase for React components

✅ **Use implementation patterns consistently:**
- Place tests in separate `/tests` folder (not co-located)
- Isolate services from UI components (no React hooks in services)
- Return user-friendly error messages in French (never technical jargon)
- Use Pino structured logging with context (method, path, userId, statusCode, durationMs)

✅ **Respect project structure and boundaries:**
- Create monorepo with `/packages/mobile`, `/packages/backend`, `/packages/backoffice`
- Maintain API boundaries (public GET /api/event, protected POST /api/admin/event)
- Keep component boundaries (screens ↔ services, forms ↔ API client)
- Don't cross-import between packages (mobile shouldn't import backoffice)

✅ **Refer to this document for all architectural questions:**
- When unsure about naming: see Naming Patterns section
- When unsure about file placement: see Project Structure section
- When unsure about API design: see API Boundaries section
- When unsure about error handling: see Communication Patterns section

**First Implementation Priority:**

```bash
# Initialize monorepo (backend first, then backoffice, then mobile)

# Backend setup:
cd packages/backend
npm install
npx prisma init
# Edit .env.local with DATABASE_URL (Supabase connection string)
npx prisma migrate dev --name init
npm run dev

# Backoffice setup:
cd ../backoffice
pnpm create next-app@latest . --yes
# Configure Next.js with Tailwind, App Router, TypeScript
npm run dev

# Mobile setup:
cd ../mobile
npx create-expo-app@latest .
npm install expo-router
npm start
```

**Architecture is finalized and ready for implementation.**

---

🏁 **Architecture Complete — Ready to Begin Epics & Stories Phase**
