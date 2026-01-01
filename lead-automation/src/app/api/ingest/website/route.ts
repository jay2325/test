import { z } from "zod";
import { ingestLeadShared } from "@/server/ingest/shared";
import { getClientIp, getErrorStatus, jsonError, jsonOk } from "@/server/http";
import { logWebhookRequest } from "@/server/logging";
import { rateLimitOrThrow } from "@/server/rateLimit";

export const runtime = "nodejs";

const BodySchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().min(5),
  message: z.string().optional(),
  sourceMeta: z.record(z.string(), z.unknown()).optional(),
  pageUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  const headers = new Headers(request.headers);
  const ip = getClientIp(headers);
  const secret = headers.get("x-lead-source-secret") ?? undefined;

  try {
    rateLimitOrThrow({
      key: `ingest:website:${ip ?? "unknown"}`,
      limit: 30,
      windowMs: 60_000,
    });

    const json = await request.json();
    const body = BodySchema.parse(json);

    logWebhookRequest({ path: "/api/ingest/website", ip, body });

    const res = await ingestLeadShared({
      type: "WEBSITE_WEBHOOK",
      leadSourceSecret: secret,
      externalLeadId: null,
      firstName: body.firstName ?? null,
      lastName: body.lastName ?? null,
      email: body.email ?? null,
      phone: body.phone,
      rawPayload: { ...body },
    });

    return jsonOk({
      idempotent: res.idempotent,
      leadId: res.lead.id,
      conversationId: res.conversation?.id ?? null,
    });
  } catch (err) {
    const status = getErrorStatus(err, 500);
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonError(message, status);
  }
}

