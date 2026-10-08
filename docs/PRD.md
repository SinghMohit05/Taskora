# Product Requirements Document (PRD)
## Project Management System (Web + Mobile)

---

## 1. Executive Summary & Overview

### 1.1 What to Build
The **Project Management System** is a unified, cross-platform productivity ecosystem consisting of:
1. **Web Application**: A responsive desktop/tablet web platform for organizing projects, managing granular tasks, and visualizing overall progress.
2. **Mobile Application**: A native/hybrid mobile app (Android required, iOS optional) providing on-the-go access to dashboard metrics, projects, and task execution.
3. **Unified Backend & Database**: A single, centralized RESTful API service connected to a relational database (PostgreSQL/MySQL) powering both Web and Mobile clients identically.

Both frontends communicate with the exact same backend endpoints and database instance. Any action taken on one client (e.g., creating a task on the web) reflects on the other client immediately upon data fetch or pull-to-refresh.

### 1.2 Target Users
* **Individual Professionals & Freelancers**: Users who need a lightweight, frictionless system to plan projects, track deliverables, and stay on top of deadlines.
* **Project Managers & Team Leads**: Stakeholders requiring rapid status overviews, project completion statistics, and task prioritization across devices.
* **Mobile & Desk Workers**: Users transitioning continuously between workstation web browsers and mobile devices who demand seamless data parity and zero data divergence.

---

## 2. Core Functional Requirements

### 2.1 User Authentication & Account Management
* **Single Identity**: A single account works interchangeably across web and mobile.
* **User Registration**:
  * Fields: `Full Name`, `Email Address`, `Password`.
  * Constraints: Email address must be unique; format must be strictly validated.
  * Security: Passwords must be hashed using `bcrypt` (or equivalent cryptographic salt-hash) before persistence. Plaintext passwords must never be stored or logged.
* **User Login**: Authenticates email and password, returning an industry-standard JSON Web Token (JWT).
* **Session Persistence**:
  * Authenticated users remain logged in until an explicit logout occurs or until token expiration.
  * **Web**: Token stored in secure client storage (e.g., HTTP-only cookie or secure storage).
  * **Mobile**: Token stored strictly in hardware-backed secure device storage (**Android Keystore** / **iOS Keychain** via `expo-secure-store`). Plain local storage (`AsyncStorage`) is strictly prohibited for credentials.
* **User Logout**: Invalidates the local session, clears securely stored tokens, and redirects the user to the login view.
* **Current User Context (`/api/auth/me`)**: Retrieves the profile details of the currently authenticated user without exposing password or sensitive data.

---

### 2.2 Project Management
Users can organize their work into high-level containers called **Projects**.
* **Project Capabilities**:
  * **Create Project**: Add a new project with mandatory and optional metadata.
  * **View Project Details**: Inspect project metadata and associated tasks.
  * **Edit Project**: Update name, description, status, or date ranges.
  * **Delete Project**: Remove a project (cascades or safely purges associated tasks).
  * **View All Owned Projects**: List all projects created by the authenticated user.
* **Project Data Model & Fields**:
  * `Project Name`: Required string (e.g., 3–120 characters).
  * `Description`: Optional detailed text.
  * `Status`: Strict Enum: `Not Started` | `In Progress` | `Completed`.
  * `Start Date`: ISO 8601 date timestamp.
  * `End Date`: ISO 8601 date timestamp (validated to be $\ge$ Start Date when provided).
  * `Created Date`: Automated timestamp generated on record creation.
* **Strict Ownership**:
  * A user can only access, edit, or delete projects they personally own.
  * Attempting to query or manipulate another user's project ID must return a `404 Not Found` or `403 Forbidden`.

---

### 2.3 Task Management
Projects contain zero or more actionable **Tasks**.
* **Task Capabilities**:
  * **Create Tasks**: Create tasks directly tied to a specific project.
  * **Edit Tasks**: Update title, description, priority, status, and due date.
  * **Delete Tasks**: Remove individual tasks.
  * **Mark Tasks as Completed**: Rapid toggle / status change to `Completed`.
  * **View Tasks Under a Project**: Fetch grouped or filtered task lists for a project.
* **Task Data Model & Fields**:
  * `Task Name`: Required string (e.g., 2–150 characters).
  * `Description`: Optional rich/plain text description.
  * `Priority`: Strict Enum: `Low` | `Medium` | `High`.
  * `Status`: Strict Enum: `Pending` | `In Progress` | `Completed`.
  * `Due Date`: ISO 8601 date timestamp.
  * `Created Date`: Automated creation timestamp.
  * `Project ID`: Foreign key relation linking to the parent Project.

---

### 2.4 Real-Time Aggregated Dashboard
Provides high-level actionable metrics personalized to the logged-in user:
* **Metrics Displayed**:
  1. **Total Projects**: Count of all projects owned by the user.
  2. **Total Tasks**: Count of all tasks across all owned projects.
  3. **Completed Tasks**: Total tasks with status `Completed`.
  4. **Pending Tasks**: Total tasks with status `Pending`.
  5. **Projects In Progress**: Count of projects with status `In Progress`.
* **Dynamic Calculations**:
  * Metrics must update immediately based on the authenticated user's live dataset.
  * Zero cross-tenant data pollution.

---

### 2.5 Search, Filtering & Querying
* **Projects**:
  * Search by project name (case-insensitive substring match).
  * Filter by project status (`Not Started`, `In Progress`, `Completed`).
* **Tasks**:
  * Search tasks by task name (case-insensitive substring match).
  * Filter tasks by status (`Pending`, `In Progress`, `Completed`).
  * Filter tasks by priority (`Low`, `Medium`, `High`).
  * Combined filters (e.g., search "Wireframe" + status `Pending` + priority `High`).

---

### 2.6 Mobile Application Requirements
* **Platform Scope**: Android is **mandatory**; iOS is optional/supported.
* **No Separate Mobile Backend**: Communicates directly with the same REST API.
* **Mobile Feature Parity**:
  * Authentication (Register, Login, Logout) with identical credentials.
  * Live Dashboard with summary metric cards.
  * Project overview & drill-down into tasks.
  * Full Task lifecycle (Create, Edit, Delete, Toggle Complete, Status & Priority changes).
  * In-app Search & Filter bar for tasks.
* **Mobile-Specific UX & Hardware Considerations**:
  * **Pull-to-Refresh**: Available on Dashboard, Projects list, and Task lists to refresh data from server.
  * **Secure Hardware Storage**: Auth tokens must be saved using `expo-secure-store` (Android Keystore / iOS Keychain). Never use unencrypted storage.
  * **Token Expiration Handling**: Intercept `401 Unauthorized` responses, clear tokens, and route user back to the login screen with an informative message (e.g., *"Your session has expired. Please log in again."*).
  * **Offline & Network Resiliency**: Detect network status; display non-intrusive offline banners and error messages instead of blank white screens or crashes.

---

## 3. Non-Functional & Security Requirements

### 3.1 Security & Protection (Mandatory Assessment Focus)
| Domain | Requirement | Implementation Strategy |
| :--- | :--- | :--- |
| **Password Security** | No plaintext storage; robust hashing | `bcrypt` / `bcryptjs` with salt rounds $\ge 10$ |
| **Authentication** | Stateless, signed credentials | Cryptographic JWT with expiration (e.g., 24h or 7d) |
| **Authorization** | Strict multi-tenancy & ownership scoping | Middleware validates `req.user.id`; all DB queries enforce `WHERE user_id = :userId` |
| **Input Validation** | Defensive payload verification | Backend validation with `Zod` rejecting invalid emails, empty strings, missing fields, or invalid enums |
| **SQL Injection** | Zero SQL vulnerability | Parameterized queries & ORM abstraction (Prisma / Drizzle) |
| **Brute-Force Rate Limiting**| Prevent credential attacks | `express-rate-limit` on `/api/auth/*` endpoints (e.g., 5-10 requests/min per IP) |
| **CORS Policy** | Restrict unauthorized cross-origin requests | Explicitly configured CORS whitelist allowing web frontend origin |
| **Information Leakage** | Prevent disclosure of secrets | Omit password hashes and internal stack traces from API responses |

### 3.2 Reliability, Usability & UX
* **Form Validation**: Instant client-side validation paired with authoritative backend schema enforcement.
* **Loading & Empty States**: Polished skeleton loaders and empty state graphics when lists or dashboards have no data.
* **Error Notifications**: User-friendly toasts/banners rather than technical exceptions.

---

## 4. Bonus Features Roadmap (Optional Opportunities)

1. **Docker Support**: Containerized `docker-compose.yml` orchestrating Backend, PostgreSQL, and Web clients.
2. **Automated Testing**: Unit tests (Jest/Vitest) for services/helpers and integration tests (Supertest) for API routes.
3. **Pagination & Sorting**: Paginated responses (`page`, `limit`) and custom sorting (`sort_by`, `order`) for large datasets.
4. **Audit Logs**: History recording modifications to projects and tasks.
5. **Role-Based Access Control (RBAC)**: Team workspaces with Owner, Editor, and Viewer permissions.
6. **Refresh Token Rotation**: Short-lived access tokens (15m) paired with secure refresh tokens in DB.
7. **Task Reminders & Push Notifications**: Notifications for tasks approaching due date within 24 hours.
8. **Offline Task Cache**: Local cache (e.g., SQLite/WatermelonDB/React Query cache) for offline viewing.
9. **Shared Type Schema**: Single TypeScript package (`@pms/shared`) sharing DTOs and Zod schemas across Web, Mobile, and Backend.

---

## 5. Submission & Evaluation Checklist

- [ ] **Public GitHub Repository**: Single monorepo or well-linked repositories accessible without credentials.
- [ ] **Database Schema & ER Diagram**: Visual relationship model and SQL/Prisma migration schema.
- [ ] **API Documentation**: OpenAPI/Swagger or structured Postman/Markdown reference.
- [ ] **Root README.md**: Clear step-by-step setup for local development.
- [ ] **Live Deployments**: Working public URL for Backend API and Web Frontend.
- [ ] **Android Build**: Distributable Android APK or active Expo QR / Firebase App Distribution link.
- [ ] **5-Minute Video Walkthrough**: Demonstration of registering an account, logging in on web and mobile, creating a task on one platform, and demonstrating data sync after pull-to-refresh on the other.
