// Central configuration — replace all [PLACEHOLDER] values before launch.
// See README.md pre-launch checklist.

export const business = {
  name: "Viajes GMP",
  tagline: "Mexico-based travel planning for US, Canadian, and Mexican travelers.",
  url: "https://viajesgmp.com",

  // ─── Contact ───────────────────────────────────────────────────
  phone: "+1 (805) 304-4306",
  email: "jhern2325@gmail.com",
  whatsappUrl: "https://wa.me/18053044306?text=Hi!%20I%27d%20like%20to%20plan%20a%20trip%20with%20Viajes%20GMP%20%E2%80%94%20can%20you%20help%3F",
  addressOrServiceArea: "Mexico City, Mexico",

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
