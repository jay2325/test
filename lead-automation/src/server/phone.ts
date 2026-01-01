import { parsePhoneNumberFromString } from "libphonenumber-js";

export function normalizePhoneToE164(raw: string, defaultCountry: "US" | "CA" = "US") {
  const value = String(raw ?? "").trim();
  if (!value) throw new Error("Missing phone");

  const parsed = parsePhoneNumberFromString(value, defaultCountry);
  if (!parsed || !parsed.isValid()) {
    throw new Error("Invalid phone number");
  }
  return parsed.number; // E.164
}

