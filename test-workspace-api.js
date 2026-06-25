// test script for workspace api endpoints (GET, POST, PUT, DELETE)

const BASE_URL = "http://localhost:3000";
const AUTH_TOKEN = "eyJ1c2VySWQiOiJjbXFydHF1bmQwMDAwcG9oamR2aW9jdm9uIiwiZXhwIjoxNzgyODk1MzIyNTA3fQ.UddiT_bJ99jyO9bEYUMqCgO49XFIWK6rfoGvc0VQeVw";

// helper to make authenticated requests
async function apiRequest(method, path, body, contentType) {
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
    redirect: "manual", // don't follow redirects
  };

  if (body && contentType === "json") {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  } else if (body && contentType === "form") {
    const formData = new URLSearchParams(body);
    options.headers["Content-Type"] = "application/x-www-form-urlencoded";
    options.body = formData.toString();
  }

  const res = await fetch(`${BASE_URL}${path}`, options);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}

  return { status: res.status, json, text };
}

// print test result
function printResult(testName, res) {
  const icon = res.status >= 200 && res.status < 300 ? "✅" : "❌";
  console.log(`\n${icon} ${testName}`);
  console.log(`   Status: ${res.status}`);
  console.log(`   Response:`, res.json || res.text);
}

async function runTests() {
  console.log("=".repeat(60));
  console.log("   WORKSPACE API TESTS");
  console.log("=".repeat(60));

  // ------ test 1: GET all workspaces (should be empty or have existing ones) ------
  const getAll = await apiRequest("GET", "/api/workspaces");
  printResult("TEST 1: GET /api/workspaces (list all)", getAll);

  // ------ test 2: POST create a new workspace (uses form data) ------
  const createRes = await apiRequest("POST", "/api/workspaces", {
    name: "API Test Workspace",
    description: "Created via test script",
  }, "form");
  printResult("TEST 2: POST /api/workspaces (create)", createRes);

  // grab the workspace id for further tests
  const workspaceId = createRes.json?.id;
  if (!workspaceId) {
    console.log("\n⚠️  Could not get workspace ID from POST response. Checking GET...");

    // fallback: fetch all workspaces and pick the one we just created
    const fallback = await apiRequest("GET", "/api/workspaces");
    const found = fallback.json?.find((w) => w.name === "API Test Workspace");
    if (found) {
      console.log(`   Found workspace via GET: ${found.id}`);
      await continueTests(found.id);
    } else {
      console.log("   ❌ Could not find workspace. Aborting remaining tests.");
    }
    return;
  }

  await continueTests(workspaceId);
}

async function continueTests(workspaceId) {
  console.log(`\n   Using workspaceId: ${workspaceId}`);

  // ------ test 3: GET single workspace by id ------
  const getOne = await apiRequest("GET", `/api/workspaces/${workspaceId}`);
  printResult("TEST 3: GET /api/workspaces/:id (get single)", getOne);

  // ------ test 4: PUT update workspace name (uses JSON body) ------
  const putRes = await apiRequest("PUT", "/api/workspaces", {
    workspaceId,
    name: "Updated Workspace Name",
  }, "json");
  printResult("TEST 4: PUT /api/workspaces (update name)", putRes);

  // ------ test 5: verify the update via GET ------
  const verifyUpdate = await apiRequest("GET", `/api/workspaces/${workspaceId}`);
  printResult("TEST 5: GET /api/workspaces/:id (verify update)", verifyUpdate);

  // ------ test 6: DELETE workspace ------
  const deleteRes = await apiRequest("DELETE", `/api/workspaces?workspaceId=${workspaceId}`);
  printResult("TEST 6: DELETE /api/workspaces?workspaceId=... (delete)", deleteRes);

  // ------ test 7: verify deletion via GET ------
  const verifyDelete = await apiRequest("GET", `/api/workspaces/${workspaceId}`);
  printResult("TEST 7: GET /api/workspaces/:id (verify deletion - should be 404)", verifyDelete);

  // ------ edge case tests ------
  console.log("\n" + "=".repeat(60));
  console.log("   EDGE CASE TESTS");
  console.log("=".repeat(60));

  // ------ test 8: PUT without workspaceId ------
  const putNoId = await apiRequest("PUT", "/api/workspaces", {
    name: "Missing ID",
  }, "json");
  printResult("TEST 8: PUT without workspaceId (should be 400)", putNoId);

  // ------ test 9: PUT without name ------
  const putNoName = await apiRequest("PUT", "/api/workspaces", {
    workspaceId: "fake-id",
  }, "json");
  printResult("TEST 9: PUT without name (should be 400)", putNoName);

  // ------ test 10: DELETE without workspaceId param ------
  const deleteNoId = await apiRequest("DELETE", "/api/workspaces");
  printResult("TEST 10: DELETE without workspaceId (should be 400)", deleteNoId);

  // ------ test 11: DELETE with non-existent id ------
  const deleteNonExistent = await apiRequest("DELETE", "/api/workspaces?workspaceId=non-existent-id");
  printResult("TEST 11: DELETE non-existent workspace (should be 500 or 404)", deleteNonExistent);

  // ------ test 12: unauthenticated request ------
  const unauthRes = await fetch(`${BASE_URL}/api/workspaces`, {
    method: "GET",
    headers: {},
  });
  const unauthJson = await unauthRes.json().catch(() => null);
  console.log(`\n${unauthRes.status === 401 ? "✅" : "❌"} TEST 12: GET without auth token (should be 401)`);
  console.log(`   Status: ${unauthRes.status}`);
  console.log(`   Response:`, unauthJson);

  console.log("\n" + "=".repeat(60));
  console.log("   ALL TESTS COMPLETE");
  console.log("=".repeat(60));
}

runTests().catch(console.error);
