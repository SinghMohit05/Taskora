# Implementation Roadmap & Project Phases
## Project Management System (Web + Mobile)

---

## Roadmap Overview

The project is structured into **7 sequential phases** designed to ensure robust architectural foundations, rigorous security compliance, seamless cross-platform synchronization, and a smooth submission process.

```mermaid
gantt
    title Project Implementation Lifecycle
    dateFormat  X
    axisFormat %s

    section Foundation
    Phase 1: Setup & DB Modeling        :active, p1, 0, 1
    section Backend Core
    Phase 2: Backend REST API & Auth    :p2, after p1, 2
    section Frontends
    Phase 3: Web App (Next.js)          :p3, after p2, 2
    Phase 4: Mobile App (Expo)          :p4, after p2, 2
    section Verification
    Phase 5: Sync & E2E Validation      :p5, after p4, 1
    section Bonus & Deploy
    Phase 6: Bonus Features             :p6, after p5, 1
    Phase 7: Deployment & Submission    :p7, after p6, 1
```

---

## Phase 1: Environment Setup, Monorepo Architecture & Database Modeling
* **Goal**: Establish the monorepo workspace, shared schema packages, PostgreSQL database, and Prisma ORM configuration.
* **Key Tasks**:
  1. Initialize monorepo root with `npm` / `pnpm` workspaces (`apps/backend`, `apps/web`, `apps/mobile`, `packages/shared`).
  2. Setup `@pms/shared` containing TypeScript interfaces and Zod validation schemas for Auth, Projects, and Tasks.
  3. Initialize PostgreSQL database and configure Prisma ORM in `apps/backend/prisma/schema.prisma`.
  4. Define relational models: `User`, `Project`, and `Task` with foreign key relations, cascade deletes, and indexes.
  5. Run initial migration (`prisma migrate dev`) and write `prisma/seed.ts` with test datasets.
* **Definition of Done (DoD)**:
  * Database tables generated in PostgreSQL.
  * Shared schemas export compile-time types and runtime Zod validators.
  * Seeding script executes successfully and populates test records.

---

## Phase 2: Centralized Backend API & Security Implementation
* **Goal**: Build and test all required REST API endpoints with complete security, rate limiting, and multi-tenant scoping.
* **Key Tasks**:
  1. Setup Express server with TypeScript, CORS, Helmet, and JSON body parsing.
  2. Implement `auth.service` and `auth.controller`:
     * `POST /api/auth/register` (bcrypt password hash $\ge 10$, unique email check).
     * `POST /api/auth/login` (rate limiter applied, JWT issuance).
     * `POST /api/auth/logout`.
     * `GET /api/auth/me`.
  3. Implement `auth.middleware` to decode JWT and inject `req.user`.
  4. Implement `project.service` and `project.controller`:
     * CRUD: `GET /api/projects`, `GET /api/projects/:id`, `POST /api/projects`, `PUT /api/projects/:id`, `DELETE /api/projects/:id`.
     * Search and status filter queries.
     * Enforce strict tenant isolation (`userId = req.user.id`).
  5. Implement `task.service` and `task.controller`:
     * CRUD: `GET /api/tasks`, `GET /api/tasks/:id`, `POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`.
     * Multi-field filtering (status, priority, projectId) and search by name.
  6. Implement `dashboard.service` and `dashboard.controller`:
     * `GET /api/dashboard`: Aggregated metrics (`totalProjects`, `totalTasks`, `completedTasks`, `pendingTasks`, `projectsInProgress`).
  7. Implement centralized error handler middleware.
* **Definition of Done (DoD)**:
  * All 15 endpoints verified via automated tests or Postman/curl.
  * Rate limiting active on authentication routes.
  * Data scoping prevents any user from querying another user's data.

---

## Phase 3: Web Application Implementation (Next.js / React)
* **Goal**: Build a responsive, accessible, high-performance web client with modern UI aesthetics.
* **Key Tasks**:
  1. Bootstrap Next.js 14 App Router project with Tailwind CSS and Lucide icons.
  2. Implement Global Design System (tokens, color palette, dark/light theme, typography).
  3. Implement Authentication UI & Session Handling:
     * Registration and Login pages with client-side Zod validation.
     * Session management and protected route wrappers.
  4. Build Dashboard Page (`/dashboard`):
     * Metric summary cards (Total Projects, Total Tasks, Completed, Pending, In Progress).
     * Quick action buttons for creating projects and tasks.
  5. Build Projects Management (`/projects` & `/projects/[id]`):
     * Projects list with search bar and status filter dropdown.
     * Project creation and edit modals.
     * Project detail view listing associated tasks.
  6. Build Tasks Management (`/tasks`):
     * Task list / table with search by name, status filter, and priority filter.
     * Inline "Mark as completed" toggle.
     * Task creation and edit modals.
  7. Implement polished loading skeletons, empty states, and toast notifications.
* **Definition of Done (DoD)**:
  * Full user flow working seamlessly in browser across desktop, tablet, and mobile viewport sizes.
  * Responsive layout verified with zero layout shifts.

---

## Phase 4: Mobile Application Implementation (React Native / Expo)
* **Goal**: Build the cross-platform mobile application (Android required, iOS compatible) talking to the unified backend.
* **Key Tasks**:
  1. Initialize Expo project with Expo Router and TypeScript.
  2. Implement Secure Storage Service:
     * Integrate `expo-secure-store` for hardware-backed storage of JWTs (Android Keystore / iOS Keychain).
  3. Implement Authentication Screens:
     * Login and Registration screens with validation.
     * Auth context providing sign-in, sign-up, and logout hooks.
  4. Implement Dashboard Screen:
     * Summary metric cards matching Web data.
     * Native **Pull-to-Refresh** hook tied to TanStack Query.
  5. Implement Projects & Tasks Screens:
     * Project list with navigation to project details and child tasks.
     * Task list with status & priority filtering and search input.
     * Task create/edit forms and one-tap "Mark as Completed" action.
  6. Resiliency & Offline Feedback:
     * Integrate `@react-native-community/netinfo` to display clear offline message when internet is disconnected.
     * Axios interceptor detecting `401 Unauthorized` token expiry, showing clear notification, and redirecting to login.
* **Definition of Done (DoD)**:
  * Mobile app builds and runs cleanly in Android emulator and on physical device via Expo Go / APK.
  * Pull-to-refresh updates data reliably.
  * Tokens stored exclusively in secure device storage.

---

## Phase 5: Cross-Platform Synchronization & Real-Device Verification
* **Goal**: Validate data parity, concurrent updates, and synchronization between Web and Mobile clients.
* **Key Tasks**:
  1. Open Web app and Mobile app simultaneously using the same credentials.
  2. Create a project and task on Web $\rightarrow$ Pull-to-refresh on Mobile $\rightarrow$ Verify instant appearance.
  3. Edit a task or mark it completed on Mobile $\rightarrow$ Refresh Web $\rightarrow$ Verify update reflected.
  4. Test edge cases:
     * Expired token: Verify graceful redirect on both platforms.
     * Network disconnection on mobile: Verify clear banner and no crash.
     * Form errors: Verify validation error display.
* **Definition of Done (DoD)**:
  * 100% synchronization parity verified without discrepancies.

---

## Phase 6: Optional Bonus Features Implementation
* **Goal**: Elevate the project assessment by implementing optional bonus features.
* **Target Features**:
  1. **Docker Support**: Write `docker-compose.yml` for PostgreSQL and Backend service.
  2. **Automated Testing**: Jest / Supertest integration test suite covering Auth, Scoping, and CRUD APIs.
  3. **Pagination & Sorting**: Add `?page=1&limit=10&sortBy=dueDate&order=asc` to Projects and Tasks APIs.
  4. **Refresh Token Rotation**: Implement short-lived access tokens with secure refresh tokens in DB.
  5. **Audit Logging**: Store timestamped activity logs for project/task status changes.
* **Definition of Done (DoD)**:
  * Docker containers spin up with single `docker compose up` command.
  * Test suite passes with high coverage.

---

## Phase 7: Deployment, Documentation & Submission Preparation
* **Goal**: Deploy live applications, generate Android distributable, and assemble all submission deliverables.
* **Key Tasks**:
  1. Deploy Backend API to cloud provider (Render / Railway / Fly.io / Supabase PostgreSQL).
  2. Deploy Web Frontend to Vercel / Netlify with production environment variables.
  3. Generate Android APK via EAS Build (`eas build -p android --profile preview`) or publish Expo link.
  4. Finalize comprehensive documentation:
     * Root `README.md` with step-by-step setup instructions.
     * Database Schema ER diagram.
     * API Documentation (Swagger / Markdown).
     * Guide for running mobile app against deployed backend.
  5. Produce 5-Minute Demonstration Screen Recording:
     * Show account login with same user on Web and Mobile.
     * Create/update task on one device and demonstrate synchronization on the other.
* **Definition of Done (DoD)**:
  * All 7 assessment submission requirements completed and verified.
