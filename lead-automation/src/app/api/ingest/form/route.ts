import { z } from "zod";
import { ingestLeadShared } from "@/server/ingest/shared";
import { getClientIp, getErrorStatus, jsonError, jsonOk } from "@/server/http";
import { logWebhookRequest } from "@/server/logging";
import { rateLimitOrThrow } from "@/server/rateLimit";

export const runtime = "nodejs";

const BodySchema = z.object({
  tenantSlug: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().min(5),
  message: z.string().optional(),
  sourceMeta: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(new Headers(request.headers));
  try {
    rateLimitOrThrow({
      key: `ingest:form:${ip ?? "unknown"}`,
      limit: 30,
      windowMs: 60_000,
    });

    const json = await request.json();
    const body = BodySchema.parse(json);

    logWebhookRequest({ path: "/api/ingest/form", ip, body });

    const res = await ingestLeadShared({
      type: "HOSTED_FORM",
      tenantSlug: body.tenantSlug,
      externalLeadId: null,
      firstName: body.firstName ?? null,
      lastName: body.lastName ?? null,
      email: body.email ?? null,
      phone: body.phone,
      rawPayload: {
        ...body,
      },
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

