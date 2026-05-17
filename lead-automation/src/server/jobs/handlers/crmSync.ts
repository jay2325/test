export async function handleCrmSyncJob(job: { tenantId: string; payload: unknown }) {
  // MVP stub (HubSpot/Pipedrive integration comes next step)
  console.log("[crm:stub]", { tenantId: job.tenantId, payload: job.payload });
}

