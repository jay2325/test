const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
const cronSecret = process.env.CRON_SECRET ?? "CHANGE_ME";
const tenantSlug = process.env.SEED_TENANT_SLUG ?? "demo";

async function post(path, body, headers = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${path} failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json;
}

async function main() {
  console.log("Posting sample hosted-form lead...");
  const ingest = await post("/api/ingest/form", {
    tenantSlug,
    firstName: "Jamie",
    lastName: "Buyer",
    email: "jamie@example.com",
    phone: "+14155550123",
    message: "Looking to buy in Austin in the next 1-3 months, budget around $700k.",
    sourceMeta: { demo: true },
  });
  console.log("Ingest response:", ingest);

  console.log("Running job runner (should score + enqueue/send stub SMS)...");
  const run1 = await post("/api/cron/run-jobs", {}, { "x-cron-secret": cronSecret });
  console.log("Run result:", run1);

  console.log("Running job runner again (to process SEND_SMS / CRM_SYNC / etc)...");
  const run2 = await post("/api/cron/run-jobs", {}, { "x-cron-secret": cronSecret });
  console.log("Run result:", run2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

