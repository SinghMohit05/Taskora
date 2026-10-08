/**
 * TaskForge Cross-Platform Synchronization & Data Parity Verification Suite
 * Phase 5 Verification Script (Node.js)
 * 
 * Simulates concurrent Web and Mobile client interactions against the centralized backend,
 * verifying real-time data parity, bidirectional mutations, and multi-tenant security isolation.
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m'
};

function logHeader(text) {
  console.log(`\n${colors.cyan}${colors.bold}=== ${text} ===${colors.reset}`);
}

function logPass(text) {
  console.log(`${colors.green}  ✔ PASS: ${text}${colors.reset}`);
}

function logFail(text, err) {
  console.error(`${colors.red}  ✖ FAIL: ${text}${colors.reset}`);
  if (err) console.error(`    ${colors.red}Details: ${err}${colors.reset}`);
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {})
  };

  const res = await fetch(url, config);
  const json = await res.json().catch(() => null);
  return { status: res.status, data: json };
}

async function runSuite() {
  logHeader('TaskForge Phase 5: Cross-Platform Synchronization Suite');
  console.log(`Target Backend: ${BASE_URL}`);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, errMsg = '') {
    if (condition) {
      logPass(testName);
      passed++;
    } else {
      logFail(testName, errMsg);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('/health');
    assert(health.status === 200 && health.data?.data?.status === 'ok', 'API Health Check online');

    // 2. Register shared user
    const timestamp = Date.now();
    const userEmail = `sync.tester.${timestamp}@taskforge.io`;
    const userPassword = 'SyncPassword2026!';

    logHeader('Step 1: Multi-Client Session Establishment');
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Sync Tester',
        email: userEmail,
        password: userPassword
      }
    });
    assert(regRes.status === 201 && regRes.data?.data?.token, 'Shared User Registration');

    // Web Client Login
    const webLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: userEmail, password: userPassword }
    });
    const webToken = webLogin.data?.data?.token;
    assert(webLogin.status === 200 && webToken, 'Web Client Session Initialized');

    // Mobile Client Login
    const mobileLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: userEmail, password: userPassword }
    });
    const mobileToken = mobileLogin.data?.data?.token;
    assert(mobileLogin.status === 200 && mobileToken, 'Mobile Client Session Initialized');

    // 3. Web Client creates a Project
    logHeader('Step 2: Web Client Mutation -> Mobile Client Ingestion');
    const projCreateRes = await request('/projects', {
      method: 'POST',
      token: webToken,
      body: {
        name: 'Web Sync Project',
        description: 'Initiated from Next.js Web Interface',
        status: 'In Progress',
        startDate: '2026-10-01T00:00:00.000Z',
        endDate: '2026-11-01T00:00:00.000Z'
      }
    });
    const projectId = projCreateRes.data?.data?.id;
    assert(projCreateRes.status === 201 && projectId, 'Web Client creates Project successfully');

    // Web Client creates Task
    const taskCreateRes = await request('/tasks', {
      method: 'POST',
      token: webToken,
      body: {
        projectId,
        name: 'Cross-Device Parity Check',
        description: 'Verify instant visibility on mobile',
        priority: 'Medium',
        status: 'Pending'
      }
    });
    const taskId = taskCreateRes.data?.data?.id;
    assert(taskCreateRes.status === 201 && taskId, 'Web Client creates Task under Project');

    // Mobile Client fetches Projects (simulates Pull-to-Refresh)
    const mobileProjects = await request('/projects', { token: mobileToken });
    const projectList = Array.isArray(mobileProjects.data?.data) ? mobileProjects.data.data : (mobileProjects.data?.data?.projects || []);
    const foundProject = projectList.find(p => p.id === projectId);
    assert(
      foundProject && foundProject.name === 'Web Sync Project',
      'Mobile Client fetches updated Project list with exact parity'
    );

    // Mobile Client fetches Tasks
    const mobileTasks = await request(`/tasks?projectId=${projectId}`, { token: mobileToken });
    const taskList = Array.isArray(mobileTasks.data?.data) ? mobileTasks.data.data : (mobileTasks.data?.data?.tasks || []);
    const foundTask = taskList.find(t => t.id === taskId);
    assert(
      foundTask && foundTask.name === 'Cross-Device Parity Check' && foundTask.status === 'Pending',
      'Mobile Client receives Task with identical attributes'
    );

    // 4. Mobile Client mutates Task status (simulates one-tap completion on device)
    logHeader('Step 3: Mobile Client Mutation -> Web Client Verification');
    const mobileUpdateRes = await request(`/tasks/${taskId}`, {
      method: 'PUT',
      token: mobileToken,
      body: {
        status: 'Completed',
        priority: 'High'
      }
    });
    assert(mobileUpdateRes.status === 200, 'Mobile Client updates Task status to Completed');

    // Web Client verifies Task status updated
    const webTaskCheck = await request(`/tasks/${taskId}`, { token: webToken });
    assert(
      webTaskCheck.status === 200 &&
      webTaskCheck.data?.data?.status === 'Completed' &&
      webTaskCheck.data?.data?.priority === 'High',
      'Web Client reflects Mobile update with 100% data consistency'
    );

    // Web Client checks aggregated dashboard
    const webDashboard = await request('/dashboard', { token: webToken });
    assert(
      webDashboard.status === 200 &&
      webDashboard.data?.data?.completedTasks >= 1,
      'Dashboard metrics increment completedTasks accurately'
    );

    // 5. Tenant Scoping & Security Verification
    logHeader('Step 4: Cross-Tenant Data Isolation Enforcement');
    const userBEmail = `sync.intruder.${timestamp}@taskforge.io`;
    const userBReg = await request('/auth/register', {
      method: 'POST',
      body: {
        fullName: 'Intruder User',
        email: userBEmail,
        password: userPassword
      }
    });
    const userBToken = userBReg.data?.data?.token;

    // Intruder attempts to read User A's project
    const unauthorizedProjectRead = await request(`/projects/${projectId}`, { token: userBToken });
    assert(unauthorizedProjectRead.status === 404, 'Intruder blocked from reading Project (404 Not Found)');

    // Intruder attempts to update User A's task
    const unauthorizedTaskUpdate = await request(`/tasks/${taskId}`, {
      method: 'PUT',
      token: userBToken,
      body: { status: 'In Progress' }
    });
    assert(unauthorizedTaskUpdate.status === 404, 'Intruder blocked from updating Task (404 Not Found)');

    // 6. Token Revocation & Session Invalidation
    logHeader('Step 5: Session Termination & Token Invalidation');
    const logoutRes = await request('/auth/logout', { method: 'POST', token: mobileToken });
    assert(logoutRes.status === 200, 'User logs out, incrementing tokenVersion');

    const revokedCheck = await request('/auth/me', { token: mobileToken });
    assert(revokedCheck.status === 401, 'Revoked token rejected with 401 Unauthorized');

  } catch (err) {
    console.error(`\n${colors.red}Unexpected test suite exception: ${err.message}${colors.reset}`);
    failed++;
  }

  logHeader('Synchronization Test Summary');
  console.log(`Passed: ${colors.green}${passed}${colors.reset}`);
  console.log(`Failed: ${colors.red}${failed}${colors.reset}`);

  if (failed === 0) {
    console.log(`\n${colors.green}${colors.bold}🎉 ALL CROSS-PLATFORM SYNCHRONIZATION TESTS PASSED!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bold}⚠️ Some tests failed. Please review the output above.${colors.reset}\n`);
    process.exit(1);
  }
}

runSuite();
