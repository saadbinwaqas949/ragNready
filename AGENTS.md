# ragNready workspace instructions and work record

Before doing any work, read `ragnready_BRIEF.md`. The brand name is `ragNready`. Follow the `BRAND OVERRIDE` section first. Never print or commit secret keys. Keep `.env.local` private; use `.env.example` for variable names only. The service-role key must remain server-side.

## Work completed to date

This repository contains a Next.js App Router e-commerce storefront for ragNready, a Pakistani baby clothing and newborn essentials brand. The implementation uses TypeScript, Tailwind CSS, Supabase for catalog and application data, and a single `lib/data` interface between the UI and its data source. The npm package is named `ragnready`.

### Storefront

- Built shared branding, global layout, responsive storefront styling, and reusable components for the wordmark, header/navigation, footer, search, cart drawer, and shared storefront shell.
- Added the homepage and its content sections, product/category cards, product and collection routes, search, cart, wishlist, and informational pages including contact, FAQ, size guide, policies, and about content.
- Added product gallery interactions, image lightbox, recently viewed products, related product recommendations, reviews behind a feature toggle, and product image placeholders under `public/images/placeholders/`.
- Added checkout and order confirmation pages for Cash on Delivery, plus server-side order handling that validates requests and uses database-backed prices and stock.
- Added newsletter and contact submission endpoints, search endpoint, WhatsApp/contact configuration, metadata and structured data, sitemap, and robots rules.
- Added responsive motion and interaction polish, reduced-motion handling, keyboard/dialog focus support, visible focus styles, and a skip link.

### Admin and data

- Added Supabase client helpers for public, authenticated server, and server-only admin access, plus admin authentication and route protection.
- Added an `/admin` workspace with product editing and controls, image uploading, collections, orders and status management, site settings, reviews, subscribers, and contact messages.
- Added SQL migrations and a combined `supabase/schema.sql` for database tables, policies, storage, seed collections/products, order/inbox features, performance indexes, and reviews.
- Added `.env.example` with empty configuration slots. A local `.env.local` exists in the workspace; its contents must not be displayed, copied into documentation, or committed.
- Added `README.md` with setup, Supabase setup, admin guide, project structure, asset/data replacement, and accessibility/search-engine notes.

### Launch pass (25 November 2026)

- Replaced the simple-mode storefront with a redesigned one: day and night themes (CSS variables in `globals.css`, toggle in `theme-toggle.tsx`), clothesline hero, quick add, new product, cart, checkout, order and policy pages. Removed SIMPLE_MODE, Lenis, GSAP, custom cursor, preloader and the discount popup (its code was never honoured at checkout).
- Accounts are optional. Google sign-in uses Supabase Auth (`/account`, `/auth/callback`) and its button only shows when the provider is enabled. Guests keep a wishlist in the browser; signed-in wishlists sync through `public.wishlists`. `/track-order` finds guest orders.
- Checkout requires name, WhatsApp number, email, address and city (`lib/storefront/checkout-schema.ts`). `/api/cart` refreshes price and stock. Orders are idempotent through `checkout_token`.
- Order alerts: `lib/server/order-notifications.ts` sends owner email, owner WhatsApp and customer email through `email.ts` and `whatsapp.ts`, after the response.
- Migration `202611250001_accounts_wishlists_delivery.sql` is applied to the live project. It also adds delivery fees, cancel/reopen stock sync and a confirmed-email admin check.
- Saving a product updates sizes in place. Never delete and recreate variants: their ids are used by carts and orders.

### Recent repository history

The latest recorded changes include updating `.env.example`, refining review moderation and product gallery interactions, adding related product recommendations, making verified reviews feature-toggleable, adding order notification support and new-order counts, adding an accessible product image lightbox, animating gallery image changes, adjusting product card sizing, improving storefront caching, and polishing admin navigation and login usability. See `git log` for the full commit history.

## Main project locations

- `src/app/(storefront)/` — public pages and storefront routes.
- `src/app/admin/` — admin login, protected admin pages, and server actions.
- `src/app/api/` — order, search, review, newsletter, and contact handlers.
- `src/components/storefront/` and `src/components/admin/` — reusable UI.
- `lib/data/` — data-layer interfaces and Supabase-backed reads/writes.
- `lib/supabase/` — Supabase clients, including server-only admin client.
- `supabase/migrations/` — ordered migrations; `supabase/schema.sql` — combined SQL setup.
- `public/images/placeholders/` — replaceable local placeholder artwork.
- `ragnready_BRIEF.md` — authoritative project and brand requirements.

## Setup and maintenance notes

- Use `.env.example` as the configuration template. Never paste real values into source files, docs, logs, or commits.
- Apply either the combined `supabase/schema.sql` in the Supabase SQL Editor or the ordered migrations with the Supabase CLI; do not apply both paths to the same database.
- Store the production site origin in the designated TODO constant in `lib/site.ts`; do not scatter or hardcode the domain elsewhere.
- Refer to `README.md` for install, run, admin, and Supabase setup instructions.
- Available npm scripts: `dev`, `lint`, `typecheck`, `build`, and `start`.
- The current repository status was clean when this record was written. This is a workspace inventory based on repository files and commit history, not a claim that every feature has been independently re-verified in this session.
