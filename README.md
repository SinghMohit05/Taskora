# Taskora — Cross-Platform Project Management System

[![Node.js](https://img.shields.io/badge/Node.js-20.x_LTS-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black.svg)](https://nextjs.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK_51-purple.svg)](https://expo.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.20-1B222D.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg)](https://www.postgresql.org/)

**Taskora** is a production-grade, multi-tenant project management platform featuring a centralized Express REST API, a responsive Next.js 14 Web client, and a native React Native (Expo) mobile client. It enforces strict cross-tenant data isolation, hardware-backed mobile token storage, rate-limited authentication, and bidirectional real-time synchronization between desktop and mobile devices.

---

## Architecture & System Overview

```mermaid
graph TD
    subgraph Client Applications
        WEB["Next.js 14 Web Client<br/>(Tailwind CSS, TanStack Query, Lucide)"]
        MOB["Expo Mobile Client (Android & iOS)<br/>(SecureStore, NetInfo, Native UI)"]
    end

    subgraph Unified Backend
        API["Express 4 REST API (TypeScript)<br/>Port: 5000"]
        MW["Security & Middleware<br/>(Helmet, CORS, Pino Logger, Rate Limiter, Zod)"]
        AUTH["Auth Module (JWT & bcrypt)"]
        PROJ["Projects Module (CRUD, Filter, Sort)"]
        TASK["Tasks Module (CRUD, Filter, Search)"]
        DASH["Dashboard Module (Aggregated Metrics)"]
    end

    subgraph Data Layer
        PRISMA["Prisma ORM 5.x"]
        PG[("PostgreSQL Database<br/>Port: 5432")]
    end

    WEB -->|"HTTP / REST API"| MW
    MOB -->|"HTTP / REST API (Bearer JWT)"| MW
    MW --> API
    API --> AUTH
    API --> PROJ
    API --> TASK
    API --> DASH
    AUTH --> PRISMA
    PROJ --> PRISMA
    TASK --> PRISMA
    DASH --> PRISMA
    PRISMA --> PG
```

### Database Schema (ER Diagram)

```mermaid
erDiagram
    User ||--o{ Project : "owns"
    Project ||--o{ Task : "contains (CASCADE DELETE)"

    User {
        String id PK "UUID"
        String fullName "full_name"
        String email UK "unique"
        String passwordHash "bcrypt hash >=10 rounds"
        Int tokenVersion "revocation tracker"
        DateTime createdAt "created_at"
    }

    Project {
        String id PK "UUID"
        String ownerId FK "users.id"
        String name "Indexed"
        String description "Optional"
        ProjectStatus status "'Not Started' | 'In Progress' | 'Completed'"
        DateTime startDate "start_date"
        DateTime endDate "end_date >= startDate"
        DateTime createdAt "created_at"
    }

    Task {
        String id PK "UUID"
        String projectId FK "projects.id"
        String name "Indexed"
        String description "Optional"
        TaskPriority priority "'Low' | 'Medium' | 'High'"
        TaskStatus status "'Pending' | 'In Progress' | 'Completed'"
        DateTime dueDate "due_date"
        DateTime createdAt "created_at"
    }
```

---

## Core Capabilities & Features

### 1. Centralized Backend API
- **Strict Multi-Tenant Scoping**: All queries filter strictly by `ownerId: req.user.id`. Accessing another user's project or task strictly returns `404 Not Found` to prevent entity enumeration.
- **Brute-Force Rate Limiting**: Express rate limiters protect `/api/auth/login` and `/api/auth/register` (max 10 requests per 15-minute window).
- **Session Revocation**: User logout increments `tokenVersion` in PostgreSQL, immediately invalidating any stolen or active JWTs.
- **Type-Safe Validation**: Shared Zod schemas strictly validate incoming request bodies, queries, and params.
- **Audited Logging**: High-performance Pino logger with automated password/header redaction.

### 2. Next.js 14 Web Application
- **Modern App Router**: Built with Tailwind CSS, Lucide icons, Sonner toast notifications, and TanStack Query.
- **Responsive Navigation**: Full support for desktop, tablet, and mobile viewport layouts.
- **Dashboard**: Live metric cards (Total Projects, Total Tasks, Completed Tasks, Pending Tasks, In Progress).
- **Projects & Tasks CRUD**: Modal forms with Zod validation, search bar, status filtering, and task creation.

### 3. Expo Mobile Application
- **Hardware-Backed Token Security**: Uses `expo-secure-store` to keep JWT credentials in the Android Keystore / iOS Keychain.
- **Pull-to-Refresh**: Native pull-down gesture triggers cache invalidation and pulls live updates from the backend.
- **Offline Disconnection Banner**: Actively monitors `@react-native-community/netinfo` and displays a persistent warning when connection drops.
- **Graceful Session Expiry**: Axios interceptor traps `401 Unauthorized`, clears secure store, and safely navigates to login with an alert.

---

## Monorepo Structure

```
Project_Management_System/
├── backend/                      # Centralized Express REST API
│   ├── prisma/                   # Schema, migrations, and seed script
│   ├── src/                      # App, controllers, services, middleware
│   ├── Dockerfile                # Multi-stage production container
│   ├── test-api.ps1              # PowerShell automated test suite
│   └── test-api.sh               # Bash automated test suite
├── web/                          # Next.js 14 Web Client
│   ├── src/app/                  # App Router pages ((auth), (app), dashboard, projects, tasks)
│   ├── src/components/           # Reusable UI cards, modals, layout components
│   └── src/providers/            # TanStack Query & Auth providers
├── mobile/                       # React Native (Expo SDK 51) Mobile Client
│   ├── app/                      # Expo Router navigation ((auth), (tabs), project, task)
│   ├── src/api/                  # Axios instance with 401 interceptor
│   └── src/auth/                 # SecureStore auth context
├── shared/                       # Shared validation contracts & TypeScript types
│   └── src/                      # Zod schemas, enums, API paths, interfaces
├── docs/                         # Comprehensive engineering documentation
│   ├── PRD.md                    # Product requirements
│   ├── ARCHITECTURE.md           # System architecture & contracts
│   ├── RULES.md                  # Development rules & AI guardrails
│   ├── PHASES.md                 # 7-phase implementation roadmap
│   ├── DESIGN.md                 # Design system & tokens
│   └── MEMORY.md                 # Living progress state & tracker
├── scripts/                      # Verification utilities
│   └── verify-sync.js            # Phase 5 cross-platform sync test runner
├── docker-compose.yml            # Containerized PostgreSQL & Backend
├── tsconfig.base.json            # Base strict TypeScript config
└── package.json                  # Root monorepo workspace scripts
```

---

## Quickstart & Local Setup

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **PostgreSQL**: v15 or higher (or use Docker Compose)
- **Expo Go App** (optional, for physical device testing): Available on Google Play / App Store

---

### Method A: Single Command with Docker Compose (PostgreSQL + Backend)

```bash
# 1. Start PostgreSQL and Backend containers
docker compose up -d

# 2. Start Web Client
npm run dev:web

# 3. Start Mobile Client
npm run start:mobile
```

---

### Method B: Manual Local Setup

#### Step 1: Clone & Install Dependencies
```bash
git clone <repository-url>
cd Project_Management_System
npm install
```

#### Step 2: Build Shared Package
```bash
npm run build:shared
```

#### Step 3: Configure Environment Variables
Ensure the `.env` files are configured:
```bash
# Backend (.env)
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskforge_db?schema=public"
# PORT=5000
# JWT_SECRET="your_secret_key"

# Web (.env.local)
# API_URL="http://localhost:5000"

# Mobile (.env)
# EXPO_PUBLIC_API_URL="http://10.0.2.2:5000"  (for Android Emulator)
# EXPO_PUBLIC_API_URL="http://192.168.1.X:5000" (for Physical Device)
```

#### Step 4: Run Database Migrations & Seed
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

> **Default Seed Accounts**:
> - Admin: `alex@taskora.io` / `Password123!`
> - Manager: `sarah@taskora.io` / `Password123!`

#### Step 5: Start the Services
Run each service in separate terminal windows:

```bash
# Terminal 1: Backend API (http://localhost:5000)
npm run dev:backend

# Terminal 2: Web Client (http://localhost:3000)
npm run dev:web

# Terminal 3: Mobile Client (Metro Bundler)
npm run start:mobile
```

---

## Verification & Automated Testing

### 1. Backend REST API Suite (17 Comprehensive Assertions)
Validates registration, unique email collision, invalid schema, password validation, JWT authentication, cross-tenant isolation (404), logout invalidation, and rate limiting:

```bash
# Windows PowerShell:
.\backend\test-api.ps1

# Linux / macOS Bash:
bash backend/test-api.sh
```

### 2. Phase 5 Cross-Platform Synchronization Suite
Simulates concurrent Web and Mobile client sessions, creates projects on Web, pulls on Mobile, mutates tasks on Mobile, and verifies instant data parity on Web:

```bash
npm run test:sync
```

### 3. Full Monorepo Typecheck & Build
```bash
npm run build:all
```

---

## Download Android App

You can download the latest Android APK for Taskora directly using the link below:

🔗 **[Download Taskora APK](https://expo.dev/accounts/singhmohit05/projects/taskora/builds)**

*(Note: Ensure that your device is allowed to install apps from unknown sources if downloading the APK directly).*

---

## License
MIT © 2026 Taskora Team
