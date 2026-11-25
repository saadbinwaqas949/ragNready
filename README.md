# ragNready

ragNready is a Next.js storefront for thoughtfully selected baby clothing and newborn gifts in Pakistan. The public catalog, collections, and store settings come from Supabase. Checkout is Cash on Delivery.

## Quick start

Requirements: Node.js 20.9 or newer and npm.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and add your Supabase values. Keep `.env.local` private and out of Git.
3. Run `npm run dev` and open the local URL printed by Next.js.

Available scripts:

- `npm run dev` — start the local development server.
- `npm run lint` — check source code with ESLint.
- `npm run typecheck` — run TypeScript without emitting files.
- `npm run build` — create a production build.
- `npm run start` — serve a production build.

## Supabase setup

1. Create a Supabase project and keep its project URL, publishable (anon) key, and service-role key available privately.
2. Open **SQL Editor** in Supabase, paste the complete contents of `supabase/schema.sql`, and run it once. It creates the tables, Row Level Security policies, image bucket, database functions, and sample collections and products. Use it only for a new project: on an existing shop run just the newest file in `supabase/migrations/`. The separate files in `supabase/migrations/` are the same setup in migration order; use those with the Supabase CLI instead of also running the combined schema.
3. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_EMAIL`. The service-role key is server-only; never put it in a `NEXT_PUBLIC_` variable or commit it.
4. The schema allowlists `a.saadbinwaqas@gmail.com` in `public.admins`. Create a matching email/password user in **Authentication → Users** if one does not already exist. For a different owner, add that account's lowercase email to `public.admins` from SQL Editor:

   ```sql
   insert into public.admins (email)
   values (lower('your-admin@example.com'))
   on conflict (email) do nothing;
   ```

5. The schema creates the public-read `product-images` Storage bucket and limits uploads and deletes to admins. Product photos uploaded from Admin are stored there.
6. Set `SITE_URL` to the production domain. Restart or redeploy after changing environment values.
7. Run `npm run lint`, `npm run typecheck`, and `npm run build` before deployment.

The public can read published catalog data and published site settings. Public forms can submit newsletter addresses and contact messages, but cannot read them. Admin users can view and manage those records. Orders are created through the validated server endpoint and database function; the database recalculates prices and locks/decrements stock before saving the order.

## Launch checklist

### 1. Order emails

Resend's free sender only delivers to the owner of the Resend account. To reach `ADMIN_EMAIL` and customers, use a Gmail app password:

1. On that Google account turn on 2-Step Verification, then open https://myaccount.google.com/apppasswords and create one named ragNready.
2. Set `SMTP_USER` to the Gmail address and `SMTP_PASSWORD` to the 16-letter app password.

Alternatively verify a domain in Resend and set `EMAIL_FROM`, for example `ragNready <orders@your-domain>`. Customer confirmation emails turn on automatically with either option.

Every order sends its alerts as soon as it is saved, whether or not the customer taps **Confirm on WhatsApp**. Each order in Admin shows whether the alerts were delivered and can send them again.

### 2. WhatsApp order alerts

CallMeBot is free and messages only your own number:

1. Follow https://www.callmebot.com/blog/free-api-whatsapp-messages/ from the phone that should receive alerts. It replies with an API key.
2. Set `WHATSAPP_NOTIFY_NUMBER` and `CALLMEBOT_API_KEY`.

Because it is a third-party gateway, the alert leaves out the street address and email. For a larger shop use Meta's WhatsApp Cloud API: set `WHATSAPP_CLOUD_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`, and get a template named `new_order` with one body variable approved.

### 3. Google sign-in (optional for customers)

1. In Google Cloud Console create an OAuth client of type Web application. Authorised redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`.
2. In Supabase, **Authentication > Providers > Google**: turn it on and paste the client ID and secret.
3. In Supabase, **Authentication > URL Configuration**: set Site URL to the production domain and add `https://YOUR-DOMAIN/auth/callback**` and `http://localhost:3000/auth/callback**` as redirect URLs.

The button appears on the site within five minutes of switching the provider on. Until then customers order as guests and use **Track your order**.

### 4. Keep Supabase awake

Free Supabase projects pause after about a week without traffic, and a paused project takes the whole shop offline. Use the Pro plan, or keep regular traffic on the site.

## Themes and motion

Colours live as CSS variables at the top of `src/app/globals.css`, once for day and once for `html[data-theme="dark"]`. Every device starts on the day theme; the toggle remembers each visitor's choice. Admin uses the same themes. All motion respects reduced-motion settings.

## Admin guide

### Log in

Go to `/admin/login` and sign in with the email/password user you created in Supabase Auth. That email must also be in the `admins` table. Admin pages require both an authenticated session and the database admin check.

### Add or update a product

1. Open **Products → Add product**.
2. Enter the product name, description, price, season, gender, collection, sizes, and stock counts.
3. Add photos in the image uploader. Photos are resized and uploaded to the product image bucket. Set useful alt text and choose the main photo.
4. Set the product to **Published** when it is ready for the storefront, then save.

To mark an item sold out, use the product list toggle or set its size stock to zero. To make it available again, restore stock and turn off the sold-out setting.

### Process an order

1. Open **Orders** and select an order to see its items and delivery details.
2. Contact the customer using the WhatsApp link if you need to confirm delivery.
3. Update the order status as it moves through confirmation, shipping, and delivery.

### Messages, subscribers, and settings

- **Messages** lists contact-form messages and lets you track new, read, and replied status.
- **Subscribers** lists newsletter emails and lets you unsubscribe or reactivate an address.
- **Site Settings** controls the store contact details, social links, announcement messages, hero copy, delivery charge and free-delivery threshold. **Send test order alert** checks email and WhatsApp.

Cancelling an order puts its stock back; reopening it takes the stock again.

## Project structure

- `src/app/` — App Router pages, metadata, API routes, sitemap, and robots rules.
- `src/components/storefront/` — reusable storefront sections, product interactions, dialogs, and animations.
- `src/components/admin/` — shop-owner forms and admin controls.
- `lib/data/` — Supabase catalog reads and admin data access.
- `lib/supabase/` — public, authenticated server, and server-only admin clients.
- `lib/site.ts` — production site origin constant, marked TODO.
- `supabase/migrations/` — ordered database changes.
- `supabase/schema.sql` — combined SQL setup for the Supabase SQL Editor.
- `public/images/placeholders/` — replaceable illustration placeholders.

## Replacing images and catalog data

Replace the SVGs in `public/images/placeholders/` with ragNready product artwork, or upload real product photos through **Admin → Products**. Product titles, prices, variants, stock, collections, and product image URLs are managed in Supabase; the storefront reads them through `lib/data/`.

The site uses `next/image` optimization for local assets and public images in the Supabase `product-images` bucket. Update `next.config.ts` if the image storage location changes.

## Accessibility, motion, and search engines

The storefront includes reduced-motion handling, keyboard focus management for dialogs, a skip link, visible focus outlines, responsive layouts, per-product metadata and Product structured data, Organization structured data, and generated `sitemap.xml` and `robots.txt`. The origin used for canonical and structured URLs is the TODO constant in `lib/site.ts`.

Check the storefront at 360, 768, 1024, and 1440 CSS pixels before release. On a local server, use browser responsive mode and check the home page, a collection, a product, checkout, and the admin tables at each width.
