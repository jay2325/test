import { prisma } from "@/lib/db";
import type { JobType, Prisma } from "@prisma/client";

export async function enqueueJob(opts: {
  tenantId: string;
  type: JobType;
  payload: Prisma.InputJsonObject;
  runAt: Date;
}) {
  return prisma.job.create({
    data: {
      tenantId: opts.tenantId,
      type: opts.type,
      payload: opts.payload,
      runAt: opts.runAt,
      status: "PENDING",
    },
  });
}

