function maskPhone(phone?: string | null) {
  if (!phone) return "";
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.length <= 6) return "***";
  return `${digits.slice(0, 2)}***${digits.slice(-2)}`;
}

function maskEmail(email?: string | null) {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${(user ?? "").slice(0, 2)}***@${domain}`;
}

export function logWebhookRequest(opts: {
  path: string;
  ip?: string | null;
  tenantId?: string;
  leadSourceId?: string;
  body?: Record<string, unknown>;
}) {
  const getStr = (obj: Record<string, unknown>, key: string) => {
    const v = obj[key];
    return typeof v === "string" ? v : "";
  };

  const safeBody = opts.body
    ? {
        ...opts.body,
        phone: maskPhone(getStr(opts.body, "phone")),
        phoneE164: maskPhone(getStr(opts.body, "phoneE164")),
        email: maskEmail(getStr(opts.body, "email")),
      }
    : undefined;

  console.log("[webhook]", {
    path: opts.path,
    ip: opts.ip ?? undefined,
    tenantId: opts.tenantId,
    leadSourceId: opts.leadSourceId,
    body: safeBody,
  });
}

