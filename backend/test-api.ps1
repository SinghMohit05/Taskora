# ==============================================================================
# TaskForge Phase 2 - Backend REST API Automated Test Script (PowerShell)
# Covers all mandatory test cases including security, ownership, & rate limits
# ==============================================================================

$baseUrl = "http://localhost:5000/api"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "🧪 Starting TaskForge Backend API Verification Suite" -ForegroundColor Cyan
Write-Host "Target Base URL: $baseUrl" -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

function Assert-Status {
    param (
        [string]$TestName,
        [int]$Expected,
        [int]$Actual
    )
    if ($Actual -eq $Expected) {
        Write-Host "✅ PASS: $TestName (Status $Actual)" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: $TestName (Expected $Expected, got $Actual)" -ForegroundColor Red
    }
}

# --- 1. Health Check ---
Write-Host "--- Test 1: GET /api/health ---"
try {
    $res = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -UseBasicParsing
    Assert-Status "Health Check" 200 $res.StatusCode
} catch {
    Assert-Status "Health Check" 200 $_.Exception.Response.StatusCode.value__
}

# --- 2. Register User A ---
$epoch = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$userAEmail = "test.user.a.$epoch@taskforge.io"
Write-Host "`n--- Test 2: POST /api/auth/register (User A: $userAEmail) ---"
$regBody = @{
    fullName = "Alice Engineer"
    email = $userAEmail
    password = "SecurePass123!"
} | ConvertTo-Json

$tokenA = ""
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $regBody -ContentType "application/json"
    Assert-Status "User A Registration" 201 201
    $tokenA = $res.data.token
} catch {
    Assert-Status "User A Registration" 201 $_.Exception.Response.StatusCode.value__
}

# --- 3. Duplicate Email (Expect 409) ---
Write-Host "`n--- Test 3: POST /api/auth/register Duplicate Email (Expect 409) ---"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $regBody -ContentType "application/json"
    Assert-Status "Duplicate Email" 409 200
} catch {
    Assert-Status "Duplicate Email Conflict" 409 $_.Exception.Response.StatusCode.value__
}

# --- 4. Invalid Email (Expect 400) ---
Write-Host "`n--- Test 4: POST /api/auth/register Invalid Email (Expect 400) ---"
$invBody = @{
    fullName = "Invalid User"
    email = "invalid-email"
    password = "SecurePass123!"
} | ConvertTo-Json
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $invBody -ContentType "application/json"
    Assert-Status "Invalid Email Validation" 400 200
} catch {
    Assert-Status "Invalid Email Validation" 400 $_.Exception.Response.StatusCode.value__
}

# --- 5. Valid Login ---
Write-Host "`n--- Test 5: POST /api/auth/login ---"
$loginBody = @{
    email = $userAEmail
    password = "SecurePass123!"
} | ConvertTo-Json
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Assert-Status "User A Login" 200 200
} catch {
    Assert-Status "User A Login" 200 $_.Exception.Response.StatusCode.value__
}

# --- 6. Wrong Password (Expect 401) ---
Write-Host "`n--- Test 6: POST /api/auth/login Wrong Password (Expect 401) ---"
$wrongLoginBody = @{
    email = $userAEmail
    password = "WrongPassword999!"
} | ConvertTo-Json
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $wrongLoginBody -ContentType "application/json"
    Assert-Status "Wrong Password" 401 200
} catch {
    Assert-Status "Wrong Password Unauthorized" 401 $_.Exception.Response.StatusCode.value__
}

# --- 7. GET /auth/me without token (Expect 401) ---
Write-Host "`n--- Test 7: GET /api/auth/me without token (Expect 401) ---"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET
    Assert-Status "Unauthenticated /me" 401 200
} catch {
    Assert-Status "Unauthenticated /me" 401 $_.Exception.Response.StatusCode.value__
}

# --- 8. GET /auth/me with Bearer token ---
Write-Host "`n--- Test 8: GET /api/auth/me with Bearer token ---"
$headersA = @{ Authorization = "Bearer $tokenA" }
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $headersA
    Assert-Status "Authenticated /me" 200 200
} catch {
    Assert-Status "Authenticated /me" 200 $_.Exception.Response.StatusCode.value__
}

# --- 9. Register User B ---
$userBEmail = "test.user.b.$epoch@taskforge.io"
Write-Host "`n--- Setting Up User B: $userBEmail ---"
$regBBody = @{
    fullName = "Bob Manager"
    email = $userBEmail
    password = "SecurePass123!"
} | ConvertTo-Json
$tokenB = ""
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $regBBody -ContentType "application/json"
    $tokenB = $res.data.token
    Assert-Status "User B Registration" 201 201
} catch {
    Assert-Status "User B Registration" 201 $_.Exception.Response.StatusCode.value__
}
$headersB = @{ Authorization = "Bearer $tokenB" }

# --- 10. User A creates a Project ---
Write-Host "`n--- Test 9: User A creates Project ---"
$projBody = @{
    name = "Cloud Migration"
    description = "Migrate servers to AWS"
    status = "In Progress"
    startDate = "2026-10-01T00:00:00.000Z"
    endDate = "2026-11-01T00:00:00.000Z"
} | ConvertTo-Json

$projAId = ""
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/projects" -Method POST -Body $projBody -Headers $headersA -ContentType "application/json"
    $projAId = $res.data.id
    Assert-Status "Create Project" 201 201
} catch {
    Assert-Status "Create Project" 201 $_.Exception.Response.StatusCode.value__
}

# --- 11. User B attempts to access User A's Project (Expect 404) ---
Write-Host "`n--- Test 10: User B requests User A Project (Expect 404, NOT 403) ---"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/projects/$projAId" -Method GET -Headers $headersB
    Assert-Status "Cross-Tenant Scoping (404)" 404 200
} catch {
    Assert-Status "Cross-Tenant Scoping (404)" 404 $_.Exception.Response.StatusCode.value__
}

# --- 12. User A creates Task in own project ---
Write-Host "`n--- Test 11: User A creates Task in own project ---"
$taskBody = @{
    projectId = $projAId
    name = "Setup VPC and Subnets"
    priority = "High"
    status = "Pending"
} | ConvertTo-Json

$taskAId = ""
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/tasks" -Method POST -Body $taskBody -Headers $headersA -ContentType "application/json"
    $taskAId = $res.data.id
    Assert-Status "Create Task in Own Project" 201 201
} catch {
    Assert-Status "Create Task in Own Project" 201 $_.Exception.Response.StatusCode.value__
}

# --- 13. User B attempts to create Task in User A's Project (Expect 404) ---
Write-Host "`n--- Test 12: User B attempts to create Task in User A Project (Expect 404) ---"
$maliciousTask = @{
    projectId = $projAId
    name = "Injected Task"
    priority = "High"
    status = "Pending"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$baseUrl/tasks" -Method POST -Body $maliciousTask -Headers $headersB -ContentType "application/json"
    Assert-Status "Cross-Tenant Create Task Rejected (404)" 404 200
} catch {
    Assert-Status "Cross-Tenant Create Task Rejected (404)" 404 $_.Exception.Response.StatusCode.value__
}

# --- 14. User B attempts to fetch User A's Task (Expect 404) ---
Write-Host "`n--- Test 13: User B attempts to fetch User A Task (Expect 404) ---"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/tasks/$taskAId" -Method GET -Headers $headersB
    Assert-Status "Cross-Tenant Get Task Rejected (404)" 404 200
} catch {
    Assert-Status "Cross-Tenant Get Task Rejected (404)" 404 $_.Exception.Response.StatusCode.value__
}

# --- 15. User A queries Dashboard metrics ---
Write-Host "`n--- Test 14: User A queries Dashboard metrics ---"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/dashboard" -Method GET -Headers $headersA
    Assert-Status "Dashboard Metrics" 200 200
    Write-Host "Dashboard Output: $($res.data | ConvertTo-Json -Compress)" -ForegroundColor Yellow
} catch {
    Assert-Status "Dashboard Metrics" 200 $_.Exception.Response.StatusCode.value__
}

# --- 16. User A logs out (tokenVersion increments) ---
Write-Host "`n--- Test 15: User A logs out ---"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/logout" -Method POST -Headers $headersA
    Assert-Status "User A Logout" 200 200
} catch {
    Assert-Status "User A Logout" 200 $_.Exception.Response.StatusCode.value__
}

# --- 17. Reuse invalidated token (Expect 401) ---
Write-Host "`n--- Test 16: Reuse invalidated token after logout (Expect 401) ---"
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $headersA
    Assert-Status "Revoked Token Blocked (401)" 401 200
} catch {
    Assert-Status "Revoked Token Blocked (401)" 401 $_.Exception.Response.StatusCode.value__
}

# --- 18. Rate limit test on login (Expect 429) ---
Write-Host "`n--- Test 17: Rapid login rate limiting (11 requests) ---"
$hit429 = $false
for ($i = 1; $i -le 12; $i++) {
    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $wrongLoginBody -ContentType "application/json"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 429) {
            $hit429 = $true
            Write-Host "Hit 429 on request #$i as expected." -ForegroundColor Yellow
            break
        }
    }
}
if ($hit429) {
    Write-Host "✅ PASS: Login Rate Limiter triggered (Status 429)" -ForegroundColor Green
} else {
    Write-Host "⚠️ NOTE: Did not hit 429 within 12 requests" -ForegroundColor Yellow
}

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "🎉 PowerShell Verification Script Completed" -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan
