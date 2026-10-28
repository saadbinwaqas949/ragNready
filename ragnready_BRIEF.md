\# BRAND OVERRIDE (highest priority, applies to everything below)

The brand name is "ragNready" (exact capitalization: lowercase "rag", capital "N", lowercase "ready"). It replaces "FLUF" / "Fluf" everywhere in the finished website and its code.



\- Wherever the brief below says Fluf or FLUF, the finished site says ragNready: logo/wordmark, page titles, SEO metadata, headings, footer, emails, the WhatsApp prefilled message ("Hi ragNready! I have a question."), the gift card copy ("A thoughtfully designed ragNready card..."), and section names ("The ragNready Gift", "Featured at ragNready", "Welcome to ragNready", "Join the ragNready family"). Set the npm package name to "ragnready".

\- The only place "fluf" still appears is https://fluf.pk/ as a layout REFERENCE. Never show the word Fluf, its logo or its photos on the new site. Use the reference screenshots for layout and mood only.

\- Logo: build a text wordmark "ragNready" in a rounded, friendly font, with the capital N in an accent color. Make it one reusable component so the real logo can be swapped in later.

\- Contact details are NOT final. Do not hardcode the old address, phone, email, social links or the "owned and operated by Aslase" line. Put these in the site\_settings table (store name, tagline, phone, WhatsApp number, email, address, social links, optional legal-owner line), make them editable in Admin -> Site Settings, and have the footer, contact page and WhatsApp button read from there. Seed them with obvious placeholders (for example "+92 300 0000000", "hello@example.com", "Lahore, Pakistan").

\- Do not hardcode any website domain. Use relative URLs plus one constant for the domain, marked TODO.

\- Keep everything else in the brief unchanged (Pakistani market, Rs. currency, baby clothing, sections, animations, tech stack).

# TASK

Build a complete, production-quality e-commerce website for FLUF, a Pakistani baby clothing and newborn essentials brand. It should closely follow the layout, section order, tone and information architecture of https://fluf.pk/ (a Shopify store), but be visually more polished, faster, and far more animated and delightful. Reference screenshots of the current site are attached. Match their color mood, typography feel and spacing, then improve on them. Do not copy the original's images, logo files or code. Use placeholders (see ASSETS).



\# TECH STACK

\- Next.js (App Router) + TypeScript + Tailwind CSS

\- Framer Motion for component and page animations, GSAP + ScrollTrigger for scroll-driven sequences, Lenis for smooth scrolling

\- Zustand for cart, wishlist and UI state, persisted to localStorage

\- Data layer: put all products and collections behind a single abstraction (/lib/data) that reads from local JSON/mock data now but can later be swapped for the Shopify Storefront API without touching the UI. Include a README section explaining how to switch.

\- Use next/image, next/font, and semantic HTML.



\# BRAND \& DESIGN DIRECTION

\- Feel: soft, warm, calm, premium, "thoughtfully chosen". Pastel baby palette (soft lavender, seafoam green, sand beige, sky blue, sunshine yellow, blush pink) on a warm off-white background with generous whitespace.

\- Pick one rounded, friendly display font (for headings) and one clean sans-serif (for body). Headings are lowercase-friendly, like the original's "soft beginnings, thoughtfully chosen".

\- Rounded corners (16–28px), soft shadows, pill-shaped buttons, subtle grain or paper texture on large backgrounds.

\- Define all colors, radii, shadows and fonts as design tokens in the Tailwind config and CSS variables. Do not hardcode values in components.

\- Fully responsive (mobile-first, with 360, 768, 1024 and 1440 widths tested). Support prefers-reduced-motion by disabling or simplifying all animations.



\# SITE MAP

/ (Home), /collections/all (Shop), /collections/\[handle] (body-suits, frocks, rompers, caps-accessories, bundles-sets, gift-set, starter-set, new-arrivals), /products/\[handle], /pages/about-us, /pages/contact, /pages/faq, /pages/size-guide, /pages/shipping-returns, /pages/refund-policy, /pages/privacy-policy, /pages/terms-and-conditions, /pages/wishlist, /cart (also available as a slide-out drawer), search results page, custom 404.



\# GLOBAL COMPONENTS

1\. Announcement bar: rotating messages with a smooth vertical or fade transition every 4s: "Soft beginnings, thoughtfully chosen." / "A thoughtfully designed Fluf card is included with selected gift orders" / "New Starter Set now available". Pause on hover.

2\. Header: logo, nav (Home, Shop with mega-dropdown \[Baby Body Suits, Little Occasion Wear, Everyday Rompers, Baby Accessories], The Fluf Gift \[Gift Set], About Fluf, Contact), search, login, wishlist with counter, cart with counter. Sticky. Hides on scroll down and reappears on scroll up, with a frosted-glass background after scrolling. Mobile: animated hamburger → full-screen menu with staggered link reveal. Cart icon "bounces" when an item is added.

3\. Search: full-screen overlay with live product suggestions, a debounced input, and recent searches.

4\. Cart drawer: slides in from the right. Line items with image, size, quantity stepper and remove. Free-shipping progress bar ("Free shipping on orders over Rs.5,000", animating as the subtotal grows, with a small confetti burst when unlocked). Subtotal, "Continue shopping", checkout button, and an empty state with a friendly illustration.

5\. Footer: logo and blurb ("Soft, breathable clothing for newborn to 12 months. Fluf is owned and operated by Aslase."), address (302 J, Block J DHA Phase 12, Lahore, Pakistan), sales@fluf.pk, 0326 4359244, social icons (Instagram, Pinterest, X, LinkedIn, Facebook; handle flufpk), Shop links, Support links (Shipping \& Returns, Refund Policy, Privacy Policy, Terms \& Conditions, Size Guide, FAQ, Contact), newsletter field, "Fluf is owned and operated by Aslase. All rights reserved."

6\. Floating WhatsApp button (wa.me/923264359244, prefilled "Hi Fluf! I have a question.") with a gentle pulse, and a back-to-top button that appears after scrolling.

7\. Newsletter popup on first visit after \~8s ("Get 20% discount shipped to your inbox"), plus an exit-intent popup ("Wait! before you leave… Get 20% off for your first order", code CODE20OFF, copy-to-clipboard with a "Link copied" toast). Use 20% consistently everywhere (the original mixes 15% and 20%). Each popup shows once per session and is dismissible with "no, thanks".

8\. Page transitions: soft fade/slide between routes. Add a branded preloader (logo with a soft bounce) shown for under 1.2s on first load only.



\# HOMEPAGE SECTIONS (in this order)

1\. Hero: headline "soft beginnings, thoughtfully chosen", subtext "Discover thoughtfully selected baby clothing, everyday essentials and meaningful gift sets created for life's littlest moments.", CTA "shop new arrivals". Large image or slider with a slow Ken Burns zoom, split-text word-by-word headline reveal, floating pastel blobs/clouds/stars with parallax, and a magnetic CTA button.

2\. Gift banner: "thoughtful gifts, thoughtfully presented" / "for little arrivals". Copy: "Explore coordinated baby essentials created for showers, hospital visits, welcome-home celebrations and meaningful family moments." CTA "explore gift sets". Parallax image with a text reveal.

3\. "Find the perfect fit" (Shop by age, gender or season). Three filter groups as animated pill chips linking to filtered shop URLs. Age: 0-3, 3-6, 6-9, 9-12, 12-18 Months. For: Boys, Girls, Unisex. Season: Winter, Summer, All Seasons. Chips have hover lift and a selected-state animation.

4\. Value props (4 cards with animated icons that draw themselves on scroll): Thoughtfully Selected, Easy to Gift, Considered Presentation, Made for Little Moments (use the original's descriptions).

5\. "Shop by Category": five cards (Baby Bodysuits, Little Occasion Wear, Everyday Rompers, The Fluf Gift, Baby Accessories). Image zoom on hover, a custom cursor ("view"), staggered reveal on scroll. A horizontal scroll or drag carousel on mobile.

6\. "Featured at Fluf" / "Thoughtfully chosen pieces for your little one": product carousel or grid with the product card spec below.

7\. Promo band: "Thoughtful gifts for little arrivals." + "Explore Gift Sets" with a marquee of pastel shapes.

8\. "Welcome to Fluf": brand story with image, scroll-triggered reveal, and animated counters if useful (e.g. "Newborn to 12 months").

9\. "Customers are saying": review carousel with star ratings and a "Verified" badge. Seed 6 realistic placeholder reviews clearly marked in code as sample data to be replaced (the live site currently shows 0 reviews).

10\. "Join the Fluf family": newsletter signup with validation, a loading state, and a success animation.



\# PRODUCT CARD SPEC

Image with a hover swap to the second image, badges ("Sale" and "Sold out", with sold-out items greyed and the add-to-cart disabled), wishlist heart with a pop animation, product title, sale price + struck-through regular price, quick-add with a size selector where variants exist, and "Add to Cart" with a button-to-checkmark animation plus a fly-to-cart effect. Prices are formatted "Rs.1,999.50".



\# SEED DATA (use these)

\- Soft Lavender Newborn Baby Essentials Set: Rs.1,999.50 (was Rs.3,999.00), sold out

\- Newborn Essentials Set – Seafoam Green: Rs.1,999.50 (was Rs.3,999.00)

\- Newborn Essentials Set – Sand Beige: Rs.1,999.50 (was Rs.3,999.00), sold out

\- Baby Winter Set – Silver Stitch: Rs.2,199.00

\- Baby Winter Set – Navy Splash: Rs.2,199.00 (sizes 6-9, 9-12 Months)

\- Midnight Knit Baby Winter Set – Black \& White: Rs.2,199.00

\- Baby Winter Set – Blush Stripe: Rs.2,199.00

\- Hooded Baby Winter Romper – Cloud Frog: Rs.2,999.00 (sizes 9-12, 12-18 Months)

\- Category examples: Sky Breeze Baby Bodysuit (Sky Blue), Sunshine Twirl Baby Frock (Sunshine Yellow), Sand Dune Baby Romper (Sand Beige), Little Sunshine Baby Cap (Sunshine Yellow), 10pc Gift Set.

Add about 12 more products across all collections, each with gender, season, sizes, 3 images, a description, and fabric/care details. Currency: PKR.



\# COLLECTION \& PRODUCT PAGES

\- Collection page: filter sidebar/drawer (size/age, gender, season, price range, availability), sort, grid/list toggle, animated filter transitions, skeleton loaders, and URL-synced filters (e.g. ?filter.v.option.size=0-3%20Months).

\- Product page: image gallery with zoom and swipe, thumbnails, variant/size selector, size guide modal, quantity stepper, add to cart, buy now, wishlist, a sticky mobile add-to-cart bar, an accordion (details, fabric \& care, shipping \& returns), a "complete the gift set" cross-sell, a recently viewed row, and a review summary.

\- Also build the Wishlist page, Contact page (form with validation and a map placeholder), About page with a brand-story timeline, FAQ accordion, and a Size Guide table.



\# EXTRA ANIMATION IDEAS (include these)

Split-text reveals, scroll-triggered fade-ups with stagger, parallax layers, magnetic buttons, a custom cursor on desktop only, image reveal masks, marquee strips, floating clouds/stars/baby-themed doodles in the hero, hover tilt on cards, smooth number counters, and a subtle scroll progress bar. Keep every animation to \~60fps using transform/opacity only. Nothing should block interaction or hurt Lighthouse performance.



\# QUALITY BAR

\- Lighthouse targets: Performance 90+, Accessibility 95+, SEO 100 on mobile

\- Keyboard navigation, focus states, ARIA labels, alt text, and color contrast of at least AA

\- SEO: metadata per page, Open Graph, JSON-LD Product and Organization schema, sitemap.xml, robots.txt. Use the original's meta description as a base: "Fluf is a Pakistan-based baby clothing brand offering soft, everyday essentials – bodysuits, frocks, rompers, caps, and gift sets. Shop online with nationwide delivery."

\- Clean, commented, componentized code, no dead code, strict TypeScript, no console errors



\# ASSETS

Use clearly named placeholder images (soft pastel gradients or generated SVG illustrations) in /public/images and a text-based FLUF wordmark as a logo placeholder. Make every image path easy to swap with the real product photos and logo.



\# WORKFLOW

1\. First, output a short plan: folder structure, component list, and design tokens. Wait for no confirmation and proceed.

2\. Build in this order: foundation and tokens → global layout (header, footer, cart drawer) → homepage → collection → product → remaining pages → animations polish → accessibility/performance pass.

3\. Run lint, typecheck and build after each major step and fix all errors.

4\. Finish with a README covering setup, scripts, project structure, how to replace assets and data, and how to connect the Shopify Storefront API.



\# ADDENDUM: read together with the main prompt. Where this conflicts with the main prompt, THIS WINS.



\## 1. Cart: make it clean

Replace the cart drawer spec with a minimal one: line items (image, title, size, quantity stepper, remove), subtotal, a "Checkout" button and a "Continue shopping" link. The empty state is one line of text and a button. REMOVE the free-shipping progress bar, confetti, cross-sells, recommendations, promo text and any upsell content. Keep only a simple slide-in animation and a small bounce on the header cart counter.



\## 2. Backend: Supabase replaces mock data and the Shopify idea

\- The /lib/data layer now reads and writes Supabase (@supabase/supabase-js + @supabase/ssr). Remove the mock-JSON and Shopify-swap notes from the main prompt. Keep the data-layer interface so UI components don't change.

\- Create .env.example with empty values for: NEXT\_PUBLIC\_SUPABASE\_URL, NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY (this accepts the publishable key), SUPABASE\_SERVICE\_ROLE\_KEY (this is the secret key), ADMIN\_EMAIL. Add .env.local to .gitignore. I will fill in the real values myself. Never ask for, print or commit secrets. The service role key may only be used in server code (route handlers/server actions), never in client components.

\- Write the database as SQL migration files in /supabase/migrations AND one combined /supabase/schema.sql I can paste into the Supabase SQL Editor. If the Supabase MCP server is connected in this session, apply the migrations through it; otherwise just tell me exactly what to paste and run.

\- Tables: products (title, handle/slug, description, price, compare\_at\_price, gender, season, status draft|published, is\_sold\_out, badges, sort\_order, timestamps), product\_images (url, alt, position), product\_variants (product\_id, size label like "0-3 Months", stock, sku), collections (title, handle, description, image, sort\_order), product\_collections, orders, order\_items, site\_settings (announcement messages, hero headline/subtext/CTA text, popup discount code), admins (email).

\- Row Level Security on EVERY table. The public can only read published products, collections and site\_settings. Everything else (writes, orders, admins) is admin-only through an is\_admin() function that checks the logged-in email against the admins table, except order creation, which goes through a validated server route only.

\- Storage: a public-read bucket "product-images" where only admins can upload or delete.

\- Seed script: collections (body-suits, frocks, rompers, caps-accessories, bundles-sets, gift-set, starter-set, new-arrivals) and the seed products from the main prompt, with placeholder images, so the site isn't empty.

\- Public pages should be statically generated and revalidated (revalidatePath/revalidateTag) whenever the admin saves, so new products appear on the live site immediately and stay fast.



\## 3. Admin panel at /admin (separate from the storefront)

\- Login with Supabase Auth (email + password). Protect every /admin route with middleware AND a server-side is\_admin check. Mark it noindex and exclude it from sitemap.xml.

\- Simple, clean, mobile-friendly UI built for a non-technical shop owner. No heavy animations. Own layout, own sidebar: Products, Collections, Orders, Site Settings.

\- Products list: search, filter by collection/status, thumbnail, price, stock, and quick toggles for Published and Sold out. Edit and delete (with a confirm dialog).

\- Add/Edit Product form: title (auto-generated unique handle), description, price, optional compare-at price (shows as sale), collections (multi-select), gender, season, sizes with a stock count per size (age options 0-3, 3-6, 6-9, 9-12, 12-18 Months), draft/published, sold out.

\- Image uploader: drag-and-drop multiple files, previews, reorder, choose the main image, alt text, delete. Compress client-side to WebP (max 1200px wide, about 300 KB) before upload to save storage. Show upload progress and clear error messages.

\- Collections manager: add/edit/reorder collections and their cover image.

\- Orders: list, view details, change status (new, confirmed, shipped, delivered, cancelled), and a click-to-WhatsApp link to the customer's phone number.

\- Site Settings: edit the announcement bar messages, hero headline/subtext/button text and the popup discount code, with no code changes needed.

\- All forms use zod validation, loading states, and success/error toasts.



\## 4. Checkout and orders

Build a simple Cash-on-Delivery checkout at /checkout: name, phone, optional email, address, city, notes, and an order summary. The server validates with zod, recalculates prices from the database (never trust prices from the browser), checks and decrements stock, creates the order and items, rate-limits the endpoint, then redirects to /order/\[id] with a clean thank-you page. The cart's "Checkout" button leads here.



\## 5. Updated workflow

Foundation and tokens → database schema, RLS, storage and seed → data layer → admin panel → storefront (header, footer, cart, homepage, collections, product, other pages) → checkout → animation polish → accessibility/performance pass. Run lint, typecheck and build after each stage. Finish the README with an "Admin guide" for a non-developer (how to log in, add a product, upload photos, mark sold out, process an order) and a "Supabase setup" section listing every manual step I must do.

