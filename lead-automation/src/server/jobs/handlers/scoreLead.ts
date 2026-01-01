import { prisma } from "@/lib/db";
import { enqueueJob } from "@/server/jobs/enqueue";
import { ScoreLeadPayloadSchema } from "@/server/jobs/jobPayloads";
import { scoreLeadWithOpenAI } from "@/server/openai/leadScoring";
import { isWithinAllowedHours, nextAllowedTime } from "@/server/time";

export async function handleScoreLeadJob(job: { tenantId: string; payload: unknown }) {
  const payload = ScoreLeadPayloadSchema.parse(job.payload);
  const leadId = payload.leadId;
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, tenantId: job.tenantId },
    include: { tenant: { include: { settings: true, users: true } } },
  });
  if (!lead) throw new Error("Lead not found");

  const suppressed = await prisma.suppression.findUnique({
    where: { tenantId_phoneE164: { tenantId: job.tenantId, phoneE164: lead.phoneE164 } },
  });
  if (suppressed) {
    await prisma.lead.update({ where: { id: lead.id }, data: { status: "SUPPRESSED" } });
    return;
  }

  const raw = lead.rawPayload as unknown;
  const message =
    typeof raw === "object" &&
    raw !== null &&
    "message" in raw &&
    typeof (raw as { message?: unknown }).message === "string"
      ? ((raw as { message?: unknown }).message as string)
      : "";

  const leadSummary = [
    `Lead: ${lead.firstName ?? ""} ${lead.lastName ?? ""}`.trim(),
    lead.email ? `Email: ${lead.email}` : "",
    `Phone: ${lead.phoneE164}`,
    message ? `Message: ${message}` : "",
    lead.externalLeadId ? `ExternalLeadId: ${lead.externalLeadId}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const scored = await scoreLeadWithOpenAI({ leadSummary });

  const settings = lead.tenant.settings;
  const hotThreshold = settings?.hotScoreThreshold ?? 70;
  const warmThreshold = settings?.warmScoreThreshold ?? 45;
  const timezone = lead.tenant.timezone || "UTC";
  const quietStart = settings?.quietHoursStart ?? 8;
  const quietEnd = settings?.quietHoursEnd ?? 20;

  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      score: scored.score,
      classification: scored.classification,
      classificationReason: scored.reason,
      intent: scored.intent,
      timeline: scored.timeline,
      budgetRange: scored.budget_range,
      location: scored.location,
    },
  });

  // Decision tree
  if (scored.recommended_next_action === "DO_NOT_CONTACT" || scored.classification === "JUNK") {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: "DISQUALIFIED" },
    });
    return;
  }

  const now = new Date();
  const within = isWithinAllowedHours({
    now,
    timezone,
    quietStartHour: quietStart,
    quietEndHour: quietEnd,
  });

  const runAt = within
    ? now
    : nextAllowedTime({
        now,
        timezone,
        quietStartHour: quietStart,
        quietEndHour: quietEnd,
      });

  if (scored.recommended_next_action === "NURTURE_ONLY" || scored.score < warmThreshold) {
    await prisma.lead.update({ where: { id: lead.id }, data: { status: "NURTURE" } });
    await enqueueJob({
      tenantId: job.tenantId,
      type: "FOLLOW_UP",
      payload: { leadId: lead.id },
      runAt: new Date(now.getTime() + 24 * 60 * 60_000),
    });
    return;
  }

  const template = scored.score >= hotThreshold ? "HOT_INTRO" : "WARM_INTRO";
  await enqueueJob({
    tenantId: job.tenantId,
    type: "SEND_SMS",
    payload: { leadId: lead.id, template },
    runAt,
  });

  // CRM sync as async job (stub for now)
  await enqueueJob({
    tenantId: job.tenantId,
    type: "CRM_SYNC",
    payload: { leadId: lead.id, event: "SCORED" },
    runAt: now,
  });
}

