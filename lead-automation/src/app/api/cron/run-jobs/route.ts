import { runDueJobs } from "@/server/jobs/runner";
import { jsonError, jsonOk } from "@/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret") ?? "";
  const expected = process.env.CRON_SECRET ?? "";

  if (!expected || secret !== expected) {
    return jsonError("Unauthorized", 401);
  }

  try {
    const result = await runDueJobs({ limit: 50, concurrency: 10 });
    return jsonOk(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonError(message, 500);
  }
}

