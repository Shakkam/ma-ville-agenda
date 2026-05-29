# Ma Ville Agenda — Epics & Stories

## Epic 1: Backend API Setup
**Code:** EPIC-001  
**Description:** Set up Node.js + Express API with Prisma ORM and Supabase PostgreSQL

### Stories
- **STORY-001.1:** Initialize Node.js + Express project with TypeScript
- **STORY-001.2:** Configure Prisma ORM and Supabase PostgreSQL connection
- **STORY-001.3:** Set up API structure (routes, middleware, error handling)
- **STORY-001.4:** Configure environment variables and secrets management

---

## Epic 2: Mobile App Setup
**Code:** EPIC-002  
**Description:** Initialize React Native + Expo app with navigation and core components

### Stories
- **STORY-002.1:** Initialize Expo project with React Native
- **STORY-002.2:** Set up bottom tab navigation (Events, Filters)
- **STORY-002.3:** Create app shell and theming (Léognan brand colors)
- **STORY-002.4:** Configure API client (axios/fetch) for backend communication

---

## Epic 3: Backoffice Admin Setup
**Code:** EPIC-003  
**Description:** Initialize Next.js backoffice with authentication and admin pages

### Stories
- **STORY-003.1:** Initialize Next.js project with TypeScript
- **STORY-003.2:** Set up Next.js authentication (magic link or password)
- **STORY-003.3:** Create admin layout and navigation
- **STORY-003.4:** Configure API routes and database client in backoffice

---

## Epic 4: Event Management (Core Feature)
**Code:** EPIC-004  
**Description:** Create, read, filter, and validate events across all platforms

### Stories
- **STORY-004.1:** Create Event data model (Prisma schema)
- **STORY-004.2:** Implement POST /events API endpoint (create event)
- **STORY-004.3:** Implement GET /events API endpoint (list events with filtering)
- **STORY-004.4:** Implement GET /events/:id API endpoint (get event detail)
- **STORY-004.5:** Implement event list UI in mobile app
- **STORY-004.6:** Implement event detail screen in mobile app
- **STORY-004.7:** Implement event creation form in backoffice
- **STORY-004.8:** Implement event validation queue in backoffice
- **STORY-004.9:** Implement event validation detail view in backoffice

---

## Epic 5: Authentication & Security
**Code:** EPIC-005  
**Description:** Implement Supabase Auth, JWT tokens, and secure backoffice access

### Stories
- **STORY-005.1:** Configure Supabase Auth (super-admin user)
- **STORY-005.2:** Implement JWT token generation and validation
- **STORY-005.3:** Protect API endpoints with authentication middleware
- **STORY-005.4:** Implement super-admin login in backoffice
- **STORY-005.5:** Set up session management and token refresh

---

## Epic 6: Image Upload & Processing
**Code:** EPIC-006  
**Description:** Handle image compression client-side and upload to Vercel Blob

### Stories
- **STORY-006.1:** Configure Vercel Blob storage
- **STORY-006.2:** Implement image upload endpoint in API
- **STORY-006.3:** Implement client-side image compression in backoffice
- **STORY-006.4:** Implement image preview in event creation form
- **STORY-006.5:** Implement image display in mobile app event detail

---

## Epic 7: Deployment & DevOps
**Code:** EPIC-007  
**Description:** Set up CI/CD, Vercel deployment, Supabase connection, and monitoring

### Stories
- **STORY-007.1:** Configure GitHub Actions CI/CD pipeline
- **STORY-007.2:** Set up Vercel deployment for Next.js backoffice
- **STORY-007.3:** Set up Vercel deployment for API (serverless functions)
- **STORY-007.4:** Configure environment variables for production
- **STORY-007.5:** Set up monitoring and error tracking (Sentry or similar)
- **STORY-007.6:** Configure Expo build and distribution

---

## Epic 8: Testing & QA
**Code:** EPIC-008  
**Description:** Implement unit, integration, and E2E tests for all packages

### Stories
- **STORY-008.1:** Set up testing framework (Jest, Vitest, or pytest)
- **STORY-008.2:** Write unit tests for API endpoints
- **STORY-008.3:** Write unit tests for React Native components
- **STORY-008.4:** Write integration tests for event CRUD workflow
- **STORY-008.5:** Write E2E tests for mobile app
- **STORY-008.6:** Write E2E tests for backoffice admin workflow
- **STORY-008.7:** Set up test coverage reporting

---

## Epic 9: Feature - Event Filtering by Category
**Code:** EPIC-009  
**Description:** Implement category filtering across mobile and backoffice

### Stories
- **STORY-009.1:** Add category enum to Event model (Culture, Sport, Animation, Commerce, Autre)
- **STORY-009.2:** Implement category filter in GET /events API
- **STORY-009.3:** Implement category filter UI in mobile app
- **STORY-009.4:** Implement category dropdown in backoffice event form

---

## Epic 10: Feature - Event Date Navigation
**Code:** EPIC-010  
**Description:** Implement date-based event browsing (week/day toggle)

### Stories
- **STORY-010.1:** Design date navigation UX (week/day toggle)
- **STORY-010.2:** Implement date filter in GET /events API
- **STORY-010.3:** Implement week/day navigation in mobile app
- **STORY-010.4:** Implement date picker in backoffice filters

---

## Epic 11: Seed Data & Initial Content
**Code:** EPIC-011  
**Description:** Load 7 real Léognan events into database

### Stories
- **STORY-011.1:** Create seed script for initial events
- **STORY-011.2:** Load 7 events from Léognan agenda (May 2026)
- **STORY-011.3:** Validate seed data in all platforms

---

## Epic 12: Event Validation Workflow
**Code:** EPIC-012  
**Description:** Implement submission → pending → published/rejected flow

### Stories
- **STORY-012.1:** Add event status field to model (draft, pending, published, rejected)
- **STORY-012.2:** Implement PUT /events/:id/validate API endpoint
- **STORY-012.3:** Implement PUT /events/:id/reject API endpoint
- **STORY-012.4:** Implement validation action buttons in backoffice
- **STORY-012.5:** Display validation history in event detail

---

## Summary

**Total Epics:** 12  
**Total Stories:** 76

### Dependencies

Phase 1 (Foundation):
- EPIC-001 (Backend setup)
- EPIC-002 (Mobile setup)
- EPIC-003 (Backoffice setup)

Phase 2 (Core Features):
- EPIC-004 (Event management)
- EPIC-005 (Authentication)
- EPIC-006 (Image upload)

Phase 3 (Enhancement):
- EPIC-009 (Category filtering)
- EPIC-010 (Date navigation)
- EPIC-011 (Seed data)
- EPIC-012 (Validation workflow)

Phase 4 (Launch):
- EPIC-007 (Deployment & DevOps)
- EPIC-008 (Testing & QA)
