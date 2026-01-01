import { prisma } from "@/lib/db";
import { computeBackoffMs } from "@/server/jobs/backoff";
import { handleScoreLeadJob } from "@/server/jobs/handlers/scoreLead";
import { handleSendSmsJob } from "@/server/jobs/handlers/sendSms";
import { handleFollowUpJob } from "@/server/jobs/handlers/followUp";
import { handleCrmSyncJob } from "@/server/jobs/handlers/crmSync";

function pLimit(concurrency: number) {
  let activeCount = 0;
  const queue: Array<() => void> = [];

  const next = () => {
    activeCount--;
    const fn = queue.shift();
    if (fn) fn();
  };

  const run = async <T>(fn: () => Promise<T>) => {
    activeCount++;
    try {
      return await fn();
    } finally {
      next();
    }
  };

  return function limit<T>(fn: () => Promise<T>) {
    if (activeCount < concurrency) return run(fn);
    return new Promise<T>((resolve, reject) => {
      queue.push(() => {
        run(fn).then(resolve, reject);
      });
    });
  };
}

async function processJob(job: {
  id: string;
  tenantId: string;
  type: string;
  payload: unknown;
}) {
  switch (job.type) {
    case "SCORE_LEAD":
      await handleScoreLeadJob(job);
      return;
    case "SEND_SMS":
      await handleSendSmsJob(job);
      return;
    case "FOLLOW_UP":
      await handleFollowUpJob(job);
      return;
    case "CRM_SYNC":
      await handleCrmSyncJob(job);
      return;
    default:
      throw new Error(`Unknown job type: ${job.type}`);
  }
}

export async function runDueJobs(opts: { limit: number; concurrency: number }) {
  const now = new Date();
  const due = await prisma.job.findMany({
    where: { status: "PENDING", runAt: { lte: now } },
    orderBy: { runAt: "asc" },
    take: opts.limit,
  });

  // Claim jobs (best-effort) to avoid double-processing
  const claimed: typeof due = [];
  for (const job of due) {
    const updated = await prisma.job.updateMany({
      where: { id: job.id, status: "PENDING" },
      data: { status: "RUNNING" },
    });
    if (updated.count === 1) claimed.push(job);
  }

  const limit = pLimit(opts.concurrency);

  const results = await Promise.allSettled(
    claimed.map((job) =>
      limit(async () => {
        try {
          await processJob(job);
          await prisma.job.update({
            where: { id: job.id },
            data: { status: "DONE", lastError: null },
          });
          return { id: job.id, type: job.type, status: "DONE" as const };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          const current = await prisma.job.findUnique({ where: { id: job.id } });
          const attemptsAfter = (current?.attempts ?? 0) + 1;
          const shouldFailPermanently = attemptsAfter >= 5;
          const runAt = new Date(Date.now() + computeBackoffMs(attemptsAfter));

          await prisma.job.update({
            where: { id: job.id },
            data: {
              attempts: attemptsAfter,
              lastError: message,
              status: shouldFailPermanently ? "FAILED" : "PENDING",
              runAt: shouldFailPermanently ? current?.runAt ?? runAt : runAt,
            },
          });

          return {
            id: job.id,
            type: job.type,
            status: shouldFailPermanently ? ("FAILED" as const) : ("RETRY" as const),
            error: message,
            attempts: attemptsAfter,
          };
        }
      }),
    ),
  );

  return {
    now: now.toISOString(),
    claimedCount: claimed.length,
    results: results.map((r) => (r.status === "fulfilled" ? r.value : { error: String(r.reason) })),
  };
}

