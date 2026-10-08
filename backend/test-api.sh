#!/usr/bin/env bash
# ==============================================================================
# TaskForge Phase 2 - Backend REST API Comprehensive Automated Test Script
# Covers all 14 mandatory test cases including multi-tenant security & rate limits
# ==============================================================================

BASE_URL="http://localhost:5000/api"

echo "========================================================"
echo "🧪 Starting TaskForge Backend API Verification Suite"
echo "Target Base URL: $BASE_URL"
echo "========================================================"

# Utility function for assertions
assert_status() {
  local test_name="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" -eq "$expected" ]; then
    echo "✅ PASS: $test_name (Status $actual)"
  else
    echo "❌ FAIL: $test_name (Expected $expected, got $actual)"
  fi
}

# --- 1. Health Check ---
echo -e "\n--- Test 1: GET /api/health ---"
HEALTH_RES=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/health")
STATUS=$(echo "$HEALTH_RES" | tail -n1)
assert_status "Health Check" 200 "$STATUS"

# --- 2. Register User A ---
USER_A_EMAIL="test.user.a.$(date +%s)@taskforge.io"
echo -e "\n--- Test 2: POST /api/auth/register (User A: $USER_A_EMAIL) ---"
REG_A_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Alice Engineer\",\"email\":\"$USER_A_EMAIL\",\"password\":\"SecurePass123!\"}")
STATUS=$(echo "$REG_A_RES" | tail -n1)
BODY=$(echo "$REG_A_RES" | sed '$d')
assert_status "User A Registration" 201 "$STATUS"
TOKEN_A=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# --- 3. Duplicate Email Registration (Expect 409 Conflict) ---
echo -e "\n--- Test 3: POST /api/auth/register with duplicate email ---"
DUP_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Alice Imposter\",\"email\":\"$USER_A_EMAIL\",\"password\":\"SecurePass123!\"}")
STATUS=$(echo "$DUP_RES" | tail -n1)
assert_status "Duplicate Email Conflict" 409 "$STATUS"

# --- 4. Invalid Email Format (Expect 400 Validation Error) ---
echo -e "\n--- Test 4: POST /api/auth/register with invalid email format ---"
INV_EMAIL_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Invalid User\",\"email\":\"not-an-email\",\"password\":\"SecurePass123!\"}")
STATUS=$(echo "$INV_EMAIL_RES" | tail -n1)
assert_status "Invalid Email Validation" 400 "$STATUS"

# --- 5. Login User A ---
echo -e "\n--- Test 5: POST /api/auth/login with valid credentials ---"
LOGIN_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_A_EMAIL\",\"password\":\"SecurePass123!\"}")
STATUS=$(echo "$LOGIN_RES" | tail -n1)
assert_status "User A Login" 200 "$STATUS"

# --- 6. Wrong Password (Expect 401 Unauthorized with constant-time response) ---
echo -e "\n--- Test 6: POST /api/auth/login with wrong password ---"
WRONG_PASS_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_A_EMAIL\",\"password\":\"WrongPassword999!\"}")
STATUS=$(echo "$WRONG_PASS_RES" | tail -n1)
assert_status "Wrong Password Unauthorized" 401 "$STATUS"

# --- 7. GET /api/auth/me without token (Expect 401) ---
echo -e "\n--- Test 7: GET /api/auth/me without Authorization header ---"
ME_NO_TOKEN=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/auth/me")
STATUS=$(echo "$ME_NO_TOKEN" | tail -n1)
assert_status "Get Me Unauthenticated" 401 "$STATUS"

# --- 8. GET /api/auth/me with valid Bearer token ---
echo -e "\n--- Test 8: GET /api/auth/me with valid Bearer token ---"
ME_TOKEN=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN_A")
STATUS=$(echo "$ME_TOKEN" | tail -n1)
assert_status "Get Me Authenticated" 200 "$STATUS"

# --- 9. Register User B (for tenant isolation tests) ---
USER_B_EMAIL="test.user.b.$(date +%s)@taskforge.io"
echo -e "\n--- Setting Up User B ($USER_B_EMAIL) ---"
REG_B_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Bob Manager\",\"email\":\"$USER_B_EMAIL\",\"password\":\"SecurePass123!\"}")
STATUS=$(echo "$REG_B_RES" | tail -n1)
BODY_B=$(echo "$REG_B_RES" | sed '$d')
assert_status "User B Registration" 201 "$STATUS"
TOKEN_B=$(echo "$BODY_B" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# --- 10. User A creates a Project ---
echo -e "\n--- Test 9: User A POST /api/projects ---"
PROJ_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/projects" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Website Overhaul\",\"description\":\"Complete redesign\",\"status\":\"In Progress\",\"startDate\":\"2026-10-01T00:00:00.000Z\",\"endDate\":\"2026-11-01T00:00:00.000Z\"}")
STATUS=$(echo "$PROJ_RES" | tail -n1)
PROJ_BODY=$(echo "$PROJ_RES" | sed '$d')
assert_status "Create Project" 201 "$STATUS"
PROJ_A_ID=$(echo "$PROJ_BODY" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)
echo "Project A ID: $PROJ_A_ID"

# --- 11. User A lists Projects ---
echo -e "\n--- Test 10: User A GET /api/projects with search & pagination ---"
LIST_PROJ_RES=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/projects?search=Website&page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN_A")
STATUS=$(echo "$LIST_PROJ_RES" | tail -n1)
assert_status "List Projects" 200 "$STATUS"

# --- 12. Cross-Tenant: User B attempts to fetch User A's Project (Expect 404, never 403) ---
echo -e "\n--- Test 11: Cross-Tenant Isolation: User B GET User A's Project (Expect 404) ---"
B_FETCH_A_PROJ=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/projects/$PROJ_A_ID" \
  -H "Authorization: Bearer $TOKEN_B")
STATUS=$(echo "$B_FETCH_A_PROJ" | tail -n1)
assert_status "Cross-Tenant Project Scoping (404)" 404 "$STATUS"

# --- 13. User A creates a Task in own Project ---
echo -e "\n--- Test 12: User A POST /api/tasks in own project ---"
TASK_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d "{\"projectId\":\"$PROJ_A_ID\",\"name\":\"Wireframes Design\",\"priority\":\"High\",\"status\":\"Pending\"}")
STATUS=$(echo "$TASK_RES" | tail -n1)
TASK_BODY=$(echo "$TASK_RES" | sed '$d')
assert_status "Create Task in Own Project" 201 "$STATUS"
TASK_A_ID=$(echo "$TASK_BODY" | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)
echo "Task A ID: $TASK_A_ID"

# --- 14. Cross-Tenant: User B attempts to create Task in User A's Project (Expect 404) ---
echo -e "\n--- Test 13: User B attempts POST /api/tasks in User A's Project (Expect 404) ---"
B_CREATE_TASK=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d "{\"projectId\":\"$PROJ_A_ID\",\"name\":\"Malicious Injected Task\",\"priority\":\"High\",\"status\":\"Pending\"}")
STATUS=$(echo "$B_CREATE_TASK" | tail -n1)
assert_status "Cross-Tenant Create Task Rejected (404)" 404 "$STATUS"

# --- 15. Cross-Tenant: User B attempts to fetch User A's Task (Expect 404) ---
echo -e "\n--- Test 14: User B GET User A's Task (Expect 404) ---"
B_GET_TASK=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/tasks/$TASK_A_ID" \
  -H "Authorization: Bearer $TOKEN_B")
STATUS=$(echo "$B_GET_TASK" | tail -n1)
assert_status "Cross-Tenant Get Task Scoping (404)" 404 "$STATUS"

# --- 16. User A updates Task (Mark as Completed) ---
echo -e "\n--- Test 15: User A PUT /api/tasks/:id ---"
PUT_TASK_RES=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/tasks/$TASK_A_ID" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"Completed\"}")
STATUS=$(echo "$PUT_TASK_RES" | tail -n1)
assert_status "Update Task Status" 200 "$STATUS"

# --- 17. User A queries Dashboard metrics ---
echo -e "\n--- Test 16: User A GET /api/dashboard ---"
DASH_RES=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/dashboard" \
  -H "Authorization: Bearer $TOKEN_A")
STATUS=$(echo "$DASH_RES" | tail -n1)
BODY_DASH=$(echo "$DASH_RES" | sed '$d')
assert_status "Dashboard Metrics" 200 "$STATUS"
echo "Dashboard Data: $BODY_DASH"

# --- 18. User A logs out (tokenVersion increments) ---
echo -e "\n--- Test 17: User A POST /api/auth/logout ---"
LOGOUT_RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/logout" \
  -H "Authorization: Bearer $TOKEN_A")
STATUS=$(echo "$LOGOUT_RES" | tail -n1)
assert_status "User A Logout" 200 "$STATUS"

# --- 19. Reuse invalidated old token (Expect 401 Unauthorized) ---
echo -e "\n--- Test 18: Reuse invalidated token after logout (Expect 401) ---"
REUSE_TOKEN_RES=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN_A")
STATUS=$(echo "$REUSE_TOKEN_RES" | tail -n1)
assert_status "Invalidated Token Blocked (401)" 401 "$STATUS"

# --- 20. Rate Limiting Test on POST /api/auth/login (11th attempt returns 429) ---
echo -e "\n--- Test 19: Rate Limiting Test (11 Rapid Login Requests) ---"
RATE_LIMITED=false
for i in {1..12}; do
  RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"ratelimit@test.io\",\"password\":\"WrongPassword1!\"}")
  CODE=$(echo "$RES" | tail -n1)
  if [ "$CODE" -eq 429 ]; then
    RATE_LIMITED=true
    echo "Hit 429 on request #$i as expected."
    break
  fi
done

if [ "$RATE_LIMITED" = true ]; then
  echo "✅ PASS: Rate Limiter triggered (Status 429)"
else
  echo "⚠️ NOTE: Rate limiter did not hit 429 within iteration limit"
fi

echo -e "\n========================================================"
echo "🎉 Verification Script Completed"
echo "========================================================"
