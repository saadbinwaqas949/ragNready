-- Delivery result of each order alert (owner email, owner WhatsApp, customer email), shown in admin.
alter table public.orders add column if not exists alerts jsonb;
