// Central configuration — replace all [PLACEHOLDER] values before launch.
// See README.md pre-launch checklist.

export const business = {
  name: "Viajes GMP",
  tagline: "Travel Mexico with local experts",
  url: "https://viajesgmp.com",

  // ─── Contact ───────────────────────────────────────────────────
  phone: "[PHONE]",
  email: "[EMAIL]",
  whatsappUrl: "[WHATSAPP_URL]",
  addressOrServiceArea: "[BUSINESS_ADDRESS_OR_SERVICE_AREA]",

  // ─── Social ────────────────────────────────────────────────────
  googleReviewsUrl: "[GOOGLE_REVIEWS_URL]",
  instagramUrl: "[INSTAGRAM_URL]",
  facebookUrl: "[FACEBOOK_URL]",
  tiktokUrl: "[TIKTOK_URL]",
  youtubeUrl: "[YOUTUBE_URL]",

  // ─── Legal / Business ──────────────────────────────────────────
  businessLicense: "[BUSINESS_LICENSE_OR_REGISTRATION]",
  paymentMethods: "[PAYMENT_METHODS]",
  cancellationPolicyUrl: "[CANCELLATION_POLICY_URL]",
  privacyPolicyUrl: "/privacy-policy/",
  termsUrl: "/terms-and-conditions/",
} as const;

export type Business = typeof business;
