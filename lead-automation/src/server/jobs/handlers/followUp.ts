import { prisma } from "@/lib/db";
import { FollowUpPayloadSchema } from "@/server/jobs/jobPayloads";

export async function handleFollowUpJob(job: { tenantId: string; payload: unknown }) {
  const payload = FollowUpPayloadSchema.parse(job.payload);
  const leadId = payload.leadId;
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, tenantId: job.tenantId },
    include: { tenant: { include: { settings: true, users: true } }, conversations: true },
  });
  if (!lead) throw new Error("Lead not found");

  const convo = lead.conversations.find((c) => c.channel === "SMS");
  if (!convo) throw new Error("Conversation not found");

  const body =
    "Quick check-in — still looking for help finding a place? Reply with your timeline and area and I’ll send a few options. Reply STOP to opt out.";

  console.log("[sms:stub]", { to: lead.phoneE164, template: "NURTURE_FOLLOW_UP" });

  await prisma.$transaction([
    prisma.message.create({
      data: {
        tenantId: job.tenantId,
        conversationId: convo.id,
        direction: "OUTBOUND",
        from: lead.tenant.settings?.twilioPhoneNumber ?? "PLATFORM_NUMBER",
        to: lead.phoneE164,
        body,
        provider: "TWILIO",
      },
    }),
    prisma.lead.update({
      where: { id: lead.id },
      data: { lastOutboundAt: new Date() },
    }),
  ]);
}

