import crypto from "crypto";
import { prisma } from "@/lib/db";
import { HttpError } from "@/server/errors";
import { normalizePhoneToE164 } from "@/server/phone";
import type { LeadSourceType } from "@prisma/client";

function minuteBucket(date: Date) {
  const ms = date.getTime();
  const bucketStartMs = Math.floor(ms / 60_000) * 60_000;
  const start = new Date(bucketStartMs);
  const end = new Date(bucketStartMs + 60_000);
  return { start, end };
}

function idempotencyHash(opts: { tenantId: string; phoneE164: string; bucketStart: Date }) {
  return crypto
    .createHash("sha256")
    .update(`${opts.tenantId}|${opts.phoneE164}|${opts.bucketStart.toISOString()}`)
    .digest("hex");
}

export type IngestInput = {
  type: LeadSourceType;
  tenantSlug?: string;
  leadSourceSecret?: string;
  externalLeadId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone: string;
  rawPayload: Record<string, unknown>;
};

export async function ingestLeadShared(input: IngestInput) {
  const now = new Date();
  const phoneE164 = normalizePhoneToE164(input.phone);

  const resolved =
    input.type === "HOSTED_FORM"
      ? await resolveHostedFormSource({ tenantSlug: input.tenantSlug })
      : await resolveSecretLeadSource({ type: input.type, secret: input.leadSourceSecret });

  const tenantId = resolved.tenantId;
  const leadSourceId = resolved.leadSourceId;

  const { start: bucketStart } = minuteBucket(now);
  const idemKey = idempotencyHash({ tenantId, phoneE164, bucketStart });

  // Idempotency: prefer externalLeadId when present, else hash tenantId+phone+minute bucket.
  if (input.externalLeadId) {
    const existing = await prisma.lead.findFirst({
      where: {
        tenantId,
        leadSourceId,
        externalLeadId: input.externalLeadId,
      },
      include: { conversations: true },
    });
    if (existing) {
      return {
        idempotent: true,
        lead: existing,
        conversation: existing.conversations.find((c) => c.channel === "SMS") ?? null,
      };
    }
  } else {
    const existing = await prisma.lead.findFirst({
      where: {
        tenantId,
        phoneE164,
        rawPayload: {
          path: ["_idempotencyKey"],
          equals: idemKey,
        },
      },
      orderBy: { createdAt: "desc" },
      include: { conversations: true },
    });
    if (existing) {
      return {
        idempotent: true,
        lead: existing,
        conversation: existing.conversations.find((c) => c.channel === "SMS") ?? null,
      };
    }
  }

  const created = await prisma.$transaction(async (tx) => {
    // second-chance idempotency in transaction
    const maybeExisting = await tx.lead.findFirst({
      where: {
        tenantId,
        phoneE164,
        rawPayload: {
          path: ["_idempotencyKey"],
          equals: idemKey,
        },
      },
      orderBy: { createdAt: "desc" },
      include: { conversations: true },
    });
    if (maybeExisting && !input.externalLeadId) {
      return { idempotent: true as const, lead: maybeExisting, conversation: maybeExisting.conversations[0] ?? null };
    }

    const lead = await tx.lead.create({
      data: {
        tenantId,
        leadSourceId,
        externalLeadId: input.externalLeadId ?? null,
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        email: input.email ?? null,
        phoneE164,
        rawPayload: {
          ...input.rawPayload,
          _idempotencyKey: idemKey,
        },
        status: "NEW",
      },
    });

    const conversation = await tx.conversation.create({
      data: {
        tenantId,
        leadId: lead.id,
        channel: "SMS",
        state: "ACTIVE",
        automationState: "NONE",
      },
    });

    await tx.job.create({
      data: {
        tenantId,
        type: "SCORE_LEAD",
        payload: { leadId: lead.id },
        runAt: now,
        status: "PENDING",
      },
    });

    return { idempotent: false as const, lead, conversation };
  });

  return created;
}

async function resolveHostedFormSource(opts: { tenantSlug?: string }) {
  const slug = String(opts.tenantSlug ?? "").trim();
  if (!slug) {
    throw new HttpError("Missing tenantSlug for hosted form ingest", 400);
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: { leadSources: true },
  });
  if (!tenant) {
    throw new HttpError("Tenant not found", 404);
  }

  let source = tenant.leadSources.find((ls) => ls.type === "HOSTED_FORM" && ls.isActive);
  if (!source) {
    source = await prisma.leadSource.create({
      data: {
        tenantId: tenant.id,
        type: "HOSTED_FORM",
        name: "Hosted Form",
        isActive: true,
      },
    });
  }

  return { tenantId: tenant.id, leadSourceId: source.id };
}

async function resolveSecretLeadSource(opts: { type: LeadSourceType; secret?: string }) {
  const secret = String(opts.secret ?? "").trim();
  if (!secret) {
    throw new HttpError("Missing x-lead-source-secret", 401);
  }

  const source = await prisma.leadSource.findFirst({
    where: { secret, type: opts.type, isActive: true },
  });
  if (!source) {
    throw new HttpError("Invalid lead source secret", 401);
  }
  return { tenantId: source.tenantId, leadSourceId: source.id };
}

