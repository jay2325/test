import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const slug = process.env.SEED_TENANT_SLUG ?? "demo";
  const name = process.env.SEED_TENANT_NAME ?? "Demo Tenant";
  const timezone = process.env.SEED_TENANT_TIMEZONE ?? "America/Los_Angeles";
  const calendlyUrl =
    process.env.SEED_CALENDLY_URL ?? "https://calendly.com/example/15min";

  const websiteSecret = process.env.SEED_WEBSITE_SECRET ?? "demo_website_secret";
  const facebookSecret = process.env.SEED_FACEBOOK_SECRET ?? "demo_fb_secret";

  const tenant =
    (await prisma.tenant.findUnique({ where: { slug } })) ??
    (await prisma.tenant.create({ data: { slug, name, timezone } }));

  await prisma.agentSettings.upsert({
    where: { tenantId: tenant.id },
    update: { calendlyUrl },
    create: {
      tenantId: tenant.id,
      calendlyUrl,
      quietHoursStart: 8,
      quietHoursEnd: 20,
      hotScoreThreshold: 70,
      warmScoreThreshold: 45,
    },
  });

  const sources = [
    { type: "HOSTED_FORM", name: "Hosted Form", secret: null },
    { type: "WEBSITE_WEBHOOK", name: "Website Webhook", secret: websiteSecret },
    { type: "FB_LEAD_AD", name: "Facebook Lead Ads", secret: facebookSecret },
  ];

  for (const s of sources) {
    const existing = await prisma.leadSource.findFirst({
      where: { tenantId: tenant.id, type: s.type },
    });
    if (existing) {
      await prisma.leadSource.update({
        where: { id: existing.id },
        data: { name: s.name, secret: s.secret, isActive: true },
      });
    } else {
      await prisma.leadSource.create({
        data: {
          tenantId: tenant.id,
          type: s.type,
          name: s.name,
          secret: s.secret,
          isActive: true,
        },
      });
    }
  }

  console.log("Seeded tenant:");
  console.log({ tenantId: tenant.id, slug, timezone });
  console.log("Lead source secrets:");
  console.log({ websiteSecret, facebookSecret });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

