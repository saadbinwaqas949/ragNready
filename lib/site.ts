/** TODO: set SITE_URL to the production storefront domain. On Vercel the production URL is used until then. */
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_URL = process.env.SITE_URL || (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");
export const SITE_ORIGIN = SITE_URL;

export const SITE_CONTACT_FALLBACKS = {
  email: "a.saadbinwaqas@gmail.com",
  phone: "+92 308 4007461",
  whatsapp_number: "+92 308 4007461",
} as const;
