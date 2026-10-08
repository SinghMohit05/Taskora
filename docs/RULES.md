# Project Standards, Rules & AI Guardrails
## Project Management System (Web + Mobile)

---

## 1. Technology & Library Guidelines

### 1.1 Mandatory & Approved Stack
| Area | Approved Technologies |
| :--- | :--- |
| **Backend Runtime & Framework** | Node.js (v20+ LTS), Express (v4.x) with TypeScript |
| **Database & ORM** | PostgreSQL (v15+), Prisma ORM (v5.x) |
| **Authentication & Encryption** | `jsonwebtoken` (JWT), `bcryptjs` / `bcrypt` ($\ge 10$ salt rounds) |
| **Validation** | `zod` for type-safe runtime request & schema validation |
| **Security & Utilities** | `cors`, `helmet`, `express-rate-limit`, `dotenv` |
| **Web Frontend** | Next.js 14+ (App Router) or React 18+ with TypeScript, Tailwind CSS, Lucide React, TanStack Query |
| **Mobile App** | React Native with Expo (SDK 51+), TypeScript, Expo Router, `expo-secure-store`, `@react-native-community/netinfo` |

### 1.2 Prohibited Technologies & Anti-Patterns (What to AVOID)
* ❌ **DO NOT build separate backends for Web and Mobile**: The assessment strictly mandates a single backend and database serving both platforms.
* ❌ **DO NOT use unencrypted device storage for mobile credentials**: Never store JWTs or tokens in `AsyncStorage` or plain localStorage on mobile. You must strictly use hardware-backed storage (`expo-secure-store` utilizing Android Keystore / iOS Keychain).
* ❌ **DO NOT store plaintext passwords**: Passwords must be hashed via `bcrypt` with salt rounds $\ge 10$ before touching the database.
* ❌ **DO NOT expose sensitive fields in responses**: Remove `password_hash`, internal stack traces, or sensitive server configs from API outputs.
* ❌ **DO NOT execute raw concatenated SQL queries**: Never write `prisma.$queryRawUnsafe(`SELECT ... WHERE id = '${id}'`)` or raw SQL strings. Always use parameterized queries or standard Prisma query methods to prevent SQL injection.
* ❌ **DO NOT use the `any` type in TypeScript**: Use explicit types, interfaces, or generics.
* ❌ **DO NOT allow unvalidated request bodies**: Never pass raw `req.body` directly into database calls without passing through a Zod validation schema.
* ❌ **DO NOT fail silently on expired sessions**: Never leave the user on a broken page when a token expires. Intercept `401 Unauthorized` responses and route users to the login screen with an explanatory message.
* ❌ **DO NOT crash or show a blank screen on network disconnect**: The mobile app must gracefully detect network drops, show an offline banner, and retain previously cached data without crashing.

---

## 2. Multi-Tenant Authorization & Security Rules

### 2.1 The Data Scoping Law
> **RULE**: Users must only be able to view, modify, and delete their own projects and tasks, on both web and mobile. Users must never be able to access data belonging to other users.

To enforce this without exception:
1. Every private route must pass through the `authMiddleware`, verifying the JWT and populating `req.user.id`.
2. Every database query that fetches, updates, or deletes a project or task **must** include the tenant condition:
   ```typescript
   // Correct Project query
   await prisma.project.findFirst({
     where: { id: projectId, userId: req.user.id }
   });

   // Correct Task query (scoped to user)
   await prisma.task.findFirst({
     where: { id: taskId, userId: req.user.id }
   });
   ```
3. If an entity exists in the database but belongs to another user, return `404 Not Found` (or `403 Forbidden`). Never expose the existence of other tenants' resources.

### 2.2 Rate Limiting Rules
* Rate limiting **must** be implemented on `/api/auth/login` and `/api/auth/register` to prevent brute-force credential stuffing.
* Configuration standard: Max 5 to 10 attempts per IP per 15-minute window for authentication endpoints.

---

## 3. Error Handling Standards

### 3.1 Standardized API Error Response Schema
All error responses from the backend must follow this unified JSON structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address format"
      }
    ]
  }
}
```

### 3.2 HTTP Status Code Convention
| HTTP Status | Meaning & Required Context |
| :--- | :--- |
| **`200 OK`** | Successful read, update, or deletion. |
| **`201 Created`** | Successful entity creation (e.g., register, create project, create task). |
| **`400 Bad Request`** | Input validation failure (e.g., Zod schema validation errors, missing fields). |
| **`401 Unauthorized`** | Missing, invalid, or expired JWT token. |
| **`403 Forbidden`** | Authenticated user is attempting an action on a disallowed resource. |
| **`404 Not Found`** | Resource does not exist or does not belong to the user. |
| **`429 Too Many Requests`** | Rate limit threshold exceeded. |
| **`500 Internal Server Error`** | Unhandled server error (log stack internally; never expose stack to client). |

### 3.3 Mobile Error Handling Rules
1. **Network Connectivity Disruption**:
   * Listen to `@react-native-community/netinfo`.
   * Display a persistent top alert banner: *"No Internet Connection. Changes cannot be saved until you reconnect."*
   * Network requests failing due to offline state must be caught with a clear retry trigger.
2. **Session Expiry**:
   * API client interceptor checks for `status === 401`.
   * Clear hardware keystore: `await SecureStore.deleteItemAsync('authToken')`.
   * Navigate immediately to `/login` and show a prompt: *"Your session has expired. Please sign in again."*

---

## 4. Boundaries & Protocols for AI Coding Agents

When generating, modifying, or refactoring code in this project:

1. **Strict Adherence to Specifications**:
   * Do not alter endpoint naming, query parameters, or response contracts without updating shared schemas and both clients.
   * Keep endpoint paths identical to the specification:
     * `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
     * `/api/projects`, `/api/projects/{id}`
     * `/api/tasks`, `/api/tasks/{id}`
     * `/api/dashboard`
2. **Database Integrity**:
   * Always write Prisma migrations rather than making direct unrecorded changes to the database.
   * Preserve all relational constraints (Foreign Keys with `ON DELETE CASCADE` from Project to Tasks).
3. **Clean Code & Modularity**:
   * Separate concerns: Route $\rightarrow$ Middleware $\rightarrow$ Controller $\rightarrow$ Service $\rightarrow$ ORM Model.
   * Do not write business logic inside Express router definitions.
4. **Use Test Data Exclusively**:
   * Never insert real personal data. Use simulated mock test data in seeders and testing suites.
5. **Preserve Documentation Integrity**:
   * Update `docs/MEMORY.md` upon completing milestones.
   * Maintain code comments explaining architectural decisions and complex security logic.
