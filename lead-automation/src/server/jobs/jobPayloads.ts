import { z } from "zod";

export const ScoreLeadPayloadSchema = z.object({
  leadId: z.string().uuid(),
});
export type ScoreLeadPayload = z.infer<typeof ScoreLeadPayloadSchema>;

export const SendSmsPayloadSchema = z.object({
  leadId: z.string().uuid(),
  template: z.string().optional(),
});
export type SendSmsPayload = z.infer<typeof SendSmsPayloadSchema>;

export const FollowUpPayloadSchema = z.object({
  leadId: z.string().uuid(),
});
export type FollowUpPayload = z.infer<typeof FollowUpPayloadSchema>;

export const CrmSyncPayloadSchema = z.object({
  leadId: z.string().uuid(),
  event: z.string().optional(),
});
export type CrmSyncPayload = z.infer<typeof CrmSyncPayloadSchema>;

