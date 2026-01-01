import { prisma } from "@/lib/db";
import { SendSmsPayloadSchema } from "@/server/jobs/jobPayloads";

export async function handleSendSmsJob(job: {
  tenantId: string;
  payload: unknown;
}) {
  const payload = SendSmsPayloadSchema.parse(job.payload);
  const leadId = payload.leadId;
  const template = payload.template ?? "HOT_INTRO";

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, tenantId: job.tenantId },
    include: {
      tenant: { include: { settings: true, users: true } },
      conversations: true,
    },
  });

  if (!lead) throw new Error("Lead not found");
  const convo = lead.conversations.find((c) => c.channel === "SMS");
  if (!convo) throw new Error("Conversation not found");

  const agentName =
    lead.tenant.users[0]?.name ??
    lead.tenant.name ??
    "the agent";

  const calendlyUrl = lead.tenant.settings?.calendlyUrl ?? "";
  const location = lead.location?.trim() || "your area";
  const firstName = lead.firstName?.trim() || "there";

  const body =
    template === "WARM_INTRO"
      ? `Hi ${firstName} — thanks for reaching out. Here’s ${agentName}’s calendar if you want a quick chat: ${calendlyUrl}. What area are you focused on? Reply STOP to opt out.`
      : `Hi ${firstName} — I’m ${agentName}’s assistant. Saw your request about homes in ${location}. Want to book a quick call? ${calendlyUrl} Reply with your timeline (e.g., “0-3 months”). Reply STOP to opt out.`;

  // MVP: Twilio send is stubbed.
  console.log("[sms:stub]", {
    to: lead.phoneE164,
    template,
    bodyPreview: body.slice(0, 120),
  });

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
      data: { status: "CONTACTED", lastOutboundAt: new Date() },
    }),
    prisma.conversation.update({
      where: { id: convo.id },
      data: { automationState: "INTRO_SENT" },
    }),
  ]);
}

