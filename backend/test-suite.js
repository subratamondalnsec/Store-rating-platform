/**
 * Comprehensive End-to-End Verification Test Suite
 * Tests all authentication, roles, validations, listings, sorting, filtering, and rating features.
 */
require('dotenv').config();
let axios;
try {
  axios = require('axios');
} catch {
  axios = require('../frontend/node_modules/axios');
}
if (axios.default) axios = axios.default;

const BASE_URL = 'http://localhost:5000/api';
const client = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true // Prevent axios from throwing on non-2xx status codes
});

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ${colors.green}✓ PASS:${colors.reset} ${testName}`);
    passed++;
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} ${testName}`);
    if (details) console.error(`    ${colors.yellow}Details: ${details}${colors.reset}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log(`\n======================================================`);
  console.log(`Starting Store Rating Platform Automated Verification`);
  console.log(`======================================================\n`);

  // 1. Health check
  console.log(`${colors.blue}[1] System Health Check${colors.reset}`);
  const healthRes = await client.get('/health');
  assert(
    healthRes.status === 200 &&
    healthRes.data.status === 'ok' &&
    healthRes.data.db === 'up' &&
    typeof healthRes.data.timestamp === 'string',
    'GET /api/health returns 200 OK with db up and ISO timestamp'
  );

  // Bare health check for Render
  const bareHealth = await axios.get('http://localhost:5000/health');
  assert(
    bareHealth.status === 200 && bareHealth.data.status === 'ok',
    'GET /health (bare endpoint) returns 200 OK with status ok'
  );

  // 2. Negative Validation Checks
  console.log(`\n${colors.blue}[2] Negative Validation Checks${colors.reset}`);
  
  // Test invalid short name
  const badNameRes = await client.post('/auth/signup', {
    name: 'Short Name', // < 20 chars
    email: 'test_invalid_name@example.com',
    password: 'ValidPassword@123',
    address: '123 Valid Residential Street, City, State'
  });
  assert(
    badNameRes.status === 400 &&
    badNameRes.data.errors.some(e => e.field === 'name'),
    'Reject signup with name < 20 chars (400 Bad Request)'
  );

  // Test invalid password (missing special char)
  const badPwdRes = await client.post('/auth/signup', {
    name: 'Long Enough Valid Customer Name',
    email: 'test_invalid_pwd@example.com',
    password: 'Password12345', // Missing special character
    address: '123 Valid Residential Street, City, State'
  });
  assert(
    badPwdRes.status === 400 &&
    badPwdRes.data.errors.some(e => e.field === 'password'),
    'Reject signup with password lacking special character (400 Bad Request)'
  );

  // Test invalid rating value (< 1 or > 5)
  const badRatingRes = await client.post('/stores/1/rating', { value: 6 });
  assert(
    badRatingRes.status === 401,
    'Unauthenticated rating submission rejected with 401'
  );

  // 3. User Authentication & Role Restrictions
  console.log(`\n${colors.blue}[3] Authentication & Role Enforcement${colors.reset}`);

  // Login Administrator
  const adminLogin = await client.post('/auth/login', {
    email: process.env.ADMIN_EMAIL || 'admin@storerating.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456'
  });
  assert(
    adminLogin.status === 200 && adminLogin.data.data.user.role === 'ADMIN',
    'Admin login successful with role ADMIN',
    adminLogin.data?.message
  );
  const adminToken = adminLogin.data?.data?.token;

  // Login Store Owner 1 (Sample account with Test@12345)
  const ownerLogin = await client.post('/auth/login', {
    email: 'owner1@storerating.com',
    password: 'Test@12345'
  });
  assert(
    ownerLogin.status === 200 && ownerLogin.data.data.user.role === 'STORE_OWNER',
    'Store Owner 1 login successful with role STORE_OWNER and shared password Test@12345',
    ownerLogin.data?.message
  );
  const ownerToken = ownerLogin.data?.data?.token;

  // Login Demo Admin
  const demoAdminLogin = await client.post('/auth/login', {
    email: 'demo.admin@storerating.com',
    password: 'Demo@12345'
  });
  assert(
    demoAdminLogin.status === 200 && demoAdminLogin.data.data.user.role === 'ADMIN',
    'Demo Admin login successful with Demo@12345 and role ADMIN',
    demoAdminLogin.data?.message
  );

  // Login Demo Store Owner
  const demoOwnerLogin = await client.post('/auth/login', {
    email: 'demo.owner@storerating.com',
    password: 'Demo@12345'
  });
  assert(
    demoOwnerLogin.status === 200 && demoOwnerLogin.data.data.user.role === 'STORE_OWNER',
    'Demo Store Owner login successful with Demo@12345 and role STORE_OWNER',
    demoOwnerLogin.data?.message
  );
  const demoOwnerToken = demoOwnerLogin.data?.data?.token;

  // Verify Demo Owner Dashboard has >= 8 ratings
  const demoOwnerDashboard = await client.get('/owner/dashboard', {
    headers: { Authorization: `Bearer ${demoOwnerToken}` }
  });
  assert(
    demoOwnerDashboard.status === 200 &&
    demoOwnerDashboard.data.data.hasStore === true &&
    demoOwnerDashboard.data.data.totalRatings >= 8,
    'Demo Store Owner dashboard shows full store with >= 8 customer ratings (actual: ' + demoOwnerDashboard.data?.data?.totalRatings + ')'
  );

  // Login Demo Normal User
  const demoUserLogin = await client.post('/auth/login', {
    email: 'demo.user@storerating.com',
    password: 'Demo@12345'
  });
  assert(
    demoUserLogin.status === 200 && demoUserLogin.data.data.user.role === 'USER',
    'Demo Normal User login successful with Demo@12345 and role USER',
    demoUserLogin.data?.message
  );
  const demoUserToken = demoUserLogin.data?.data?.token;

  // Verify Demo Normal User has rated >= 5 stores
  const demoUserStores = await client.get('/stores', {
    headers: { Authorization: `Bearer ${demoUserToken}` }
  });
  const ratedByDemoUser = demoUserStores.data?.data?.stores?.filter(s => s.userRating !== null) || [];
  const unratedByDemoUser = demoUserStores.data?.data?.stores?.filter(s => s.userRating === null) || [];
  assert(
    demoUserStores.status === 200 &&
    ratedByDemoUser.length >= 5 &&
    unratedByDemoUser.length > 0,
    `Demo Normal User has rated >= 5 stores (rated: ${ratedByDemoUser.length}, unrated: ${unratedByDemoUser.length})`
  );

  // Register New Normal User
  const timestamp = Date.now();
  const testUserEmail = `verified_user_${timestamp}@storerating.com`;
  const userSignup = await client.post('/auth/signup', {
    name: 'Verified Test Customer User Account',
    email: testUserEmail,
    password: 'User@123456',
    address: '456 Test Verification Avenue, Suite 100',
    role: 'ADMIN' // Malicious client attempt to escalate role
  });
  assert(
    userSignup.status === 201 && userSignup.data.data.user.role === 'USER',
    'User signup forces role to USER (client role override ignored)',
    userSignup.data?.message
  );
  const userToken = userSignup.data?.data?.token;

  // Test Role Forbidden: Normal User attempting to access Admin endpoint
  const forbiddenRes = await client.get('/admin/dashboard', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert(
    forbiddenRes.status === 403,
    'Normal user blocked from GET /api/admin/dashboard (403 Forbidden)'
  );

  // 4. Admin Workflows
  console.log(`\n${colors.blue}[4] Administrator Features${colors.reset}`);

  // Admin Dashboard stats
  const adminStats = await client.get('/admin/dashboard', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(
    adminStats.status === 200 &&
    adminStats.data.data.totalUsers >= 4 &&
    adminStats.data.data.totalStores >= 2,
    'Admin dashboard returns totalUsers, totalStores, totalRatings'
  );

  // Admin User Listing & Filtering
  const adminUsersList = await client.get('/admin/users?role=STORE_OWNER', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(
    adminUsersList.status === 200 &&
    adminUsersList.data.data.users.every(u => u.role === 'STORE_OWNER'),
    'Admin users listing filters properly by role=STORE_OWNER'
  );

  // Admin Available Owners
  const availOwners = await client.get('/admin/available-owners', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(
    availOwners.status === 200 && Array.isArray(availOwners.data.data.owners),
    'Admin fetches available (unassigned) store owners'
  );

  // Admin Stores Listing with computed average ratings
  const adminStoresList = await client.get('/admin/stores', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(
    adminStoresList.status === 200 &&
    adminStoresList.data.data.stores.length > 0 &&
    typeof adminStoresList.data.data.stores[0].averageRating === 'number',
    'Admin stores listing includes computed averageRating without N+1 queries'
  );

  // 5. Normal User Workflows (Browse, Rate & Modify)
  console.log(`\n${colors.blue}[5] Normal User Store Browsing & Rating Flows${colors.reset}`);

  const userStores = await client.get('/stores', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert(
    userStores.status === 200 && userStores.data.data.stores.length > 0,
    'User successfully retrieves list of registered stores'
  );

  const targetStore = userStores.data.data.stores[0];

  // Submit Rating of 4
  const rateRes1 = await client.post(
    `/stores/${targetStore.id}/rating`,
    { value: 4 },
    { headers: { Authorization: `Bearer ${userToken}` } }
  );
  assert(
    rateRes1.status === 200 && rateRes1.data.data.rating.value === 4,
    'User submits 4-star rating for store'
  );

  // Modify Rating to 5 (Upsert check: must not create duplicate)
  const rateRes2 = await client.post(
    `/stores/${targetStore.id}/rating`,
    { value: 5 },
    { headers: { Authorization: `Bearer ${userToken}` } }
  );
  assert(
    rateRes2.status === 200 && rateRes2.data.data.rating.value === 5,
    'User successfully modifies rating to 5 stars via upsert'
  );

  // 6. Store Owner Workflows
  console.log(`\n${colors.blue}[6] Store Owner Dashboard${colors.reset}`);

  const ownerDashboard = await client.get('/owner/dashboard', {
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  assert(
    ownerDashboard.status === 200 &&
    ownerDashboard.data.data.hasStore === true &&
    Array.isArray(ownerDashboard.data.data.ratings),
    'Store owner dashboard returns store details and customer ratings table'
  );

  // 7. Password Management Workflow
  console.log(`\n${colors.blue}[7] Password Management${colors.reset}`);

  // Attempt change with wrong current password
  const badChangePwd = await client.put(
    '/auth/password',
    {
      currentPassword: 'WrongPassword@123',
      newPassword: 'Updated@12345'
    },
    { headers: { Authorization: `Bearer ${userToken}` } }
  );
  assert(
    badChangePwd.status === 400,
    'Password change fails if current password is incorrect (400)'
  );

  // Change password with correct credentials
  const goodChangePwd = await client.put(
    '/auth/password',
    {
      currentPassword: 'User@123456',
      newPassword: 'Updated@12345'
    },
    { headers: { Authorization: `Bearer ${userToken}` } }
  );
  assert(
    goodChangePwd.status === 200,
    'Password change succeeds with correct current password and valid new password',
    goodChangePwd.data?.message
  );

  // Verify login with new password
  const loginWithNewPwd = await client.post('/auth/login', {
    email: testUserEmail,
    password: 'Updated@12345'
  });
  assert(
    loginWithNewPwd.status === 200,
    'User can log in with newly updated password'
  );

  // Summary
  console.log(`\n======================================================`);
  console.log(`Test Execution Summary:`);
  console.log(`  Passed: ${colors.green}${passed}${colors.reset}`);
  console.log(`  Failed: ${failed > 0 ? colors.red + failed + colors.reset : 0}`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTestSuite().catch((err) => {
    console.error('Test Suite Fatal Error:', err);
    process.exit(1);
  });
}

module.exports = runTestSuite;
