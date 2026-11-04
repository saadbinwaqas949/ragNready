/** TODO: set SITE_URL to the production storefront domain before launch. */
export const SITE_URL = process.env.SITE_URL || "http://localhost:3000";
export const SITE_ORIGIN = SITE_URL;

export const SITE_CONTACT_FALLBACKS = {
  email: "a.saadbinwaqas@gmail.com",
  phone: "+92 308 4007461",
  whatsapp_number: "+92 308 4007461",
} as const;
