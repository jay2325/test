import OpenAI from "openai";

export type LeadScoreOutput = {
  score: number;
  classification: "HOT" | "WARM" | "NURTURE" | "JUNK";
  reason: string;
  intent: string;
  timeline: string;
  budget_range: string;
  location: string;
  recommended_next_action: "SMS_INTRO" | "NURTURE_ONLY" | "DO_NOT_CONTACT";
};

const schema = {
  name: "lead_score_v1",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      score: { type: "integer", minimum: 0, maximum: 100 },
      classification: { type: "string", enum: ["HOT", "WARM", "NURTURE", "JUNK"] },
      reason: { type: "string" },
      intent: { type: "string" },
      timeline: { type: "string" },
      budget_range: { type: "string" },
      location: { type: "string" },
      recommended_next_action: {
        type: "string",
        enum: ["SMS_INTRO", "NURTURE_ONLY", "DO_NOT_CONTACT"],
      },
    },
    required: [
      "score",
      "classification",
      "reason",
      "intent",
      "timeline",
      "budget_range",
      "location",
      "recommended_next_action",
    ],
  },
} as const;

function stubScore(input: string): LeadScoreOutput {
  const hasBudget = /\$|k|million|m\b/i.test(input);
  const hasTimeline = /month|week|asap|now|urgent|soon/i.test(input);
  const hasLocation = /in\s+[a-z]/i.test(input) || /neighborhood|area|zip/i.test(input);
  const score =
    (hasBudget ? 25 : 0) + (hasTimeline ? 25 : 0) + (hasLocation ? 25 : 0) + 25;

  const classification: LeadScoreOutput["classification"] =
    score >= 70 ? "HOT" : score >= 45 ? "WARM" : "NURTURE";

  return {
    score: Math.min(100, score),
    classification,
    reason: "Stubbed scorer (set OPENAI_API_KEY for real scoring).",
    intent: "buy",
    timeline: hasTimeline ? "0-3 months" : "",
    budget_range: hasBudget ? "unknown" : "",
    location: hasLocation ? "unknown" : "",
    recommended_next_action: classification === "NURTURE" ? "NURTURE_ONLY" : "SMS_INTRO",
  };
}

export async function scoreLeadWithOpenAI(opts: {
  leadSummary: string;
}): Promise<LeadScoreOutput> {
  const apiKey = process.env.OPENAI_API_KEY ?? "";
  if (!apiKey) return stubScore(opts.leadSummary);

  const client = new OpenAI({ apiKey });

  const system = [
    "You are a real estate lead qualification assistant.",
    "Score leads for purchase/rent intent, urgency, and completeness.",
    "Return ONLY JSON matching the schema.",
    "Keep fields concise; use empty string if unknown.",
  ].join("\n");

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: opts.leadSummary },
    ],
    response_format: { type: "json_schema", json_schema: schema },
  });

  const text = resp.choices[0]?.message?.content ?? "";
  if (!text) throw new Error("OpenAI returned empty response");

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error(`Failed to parse OpenAI JSON: ${String(e)}`);
  }

  // Minimal runtime validation
  const out = parsed as LeadScoreOutput;
  if (
    typeof out.score !== "number" ||
    out.score < 0 ||
    out.score > 100 ||
    !["HOT", "WARM", "NURTURE", "JUNK"].includes(out.classification) ||
    typeof out.reason !== "string" ||
    typeof out.intent !== "string" ||
    typeof out.timeline !== "string" ||
    typeof out.budget_range !== "string" ||
    typeof out.location !== "string" ||
    !["SMS_INTRO", "NURTURE_ONLY", "DO_NOT_CONTACT"].includes(out.recommended_next_action)
  ) {
    throw new Error("OpenAI output failed validation");
  }

  return out;
}

