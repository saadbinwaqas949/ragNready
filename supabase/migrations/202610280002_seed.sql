-- Starter collections and sample catalog. Replace sample descriptions/photos in Admin.
insert into public.collections(title,handle,description,image,sort_order) values
('Baby Body Suits','body-suits','Soft everyday bodysuits for little beginnings.','/images/placeholders/product-sky.svg',1),
('Little Occasion Wear','frocks','Thoughtful outfits for tiny celebrations.','/images/placeholders/product-blush.svg',2),
('Everyday Rompers','rompers','Easy, comfortable rompers for everyday moments.','/images/placeholders/product-sand.svg',3),
('Caps & Accessories','caps-accessories','Small finishing touches for little ones.','/images/placeholders/product-sunshine.svg',4),
('Bundles & Sets','bundles-sets','Coordinated essentials, thoughtfully gathered.','/images/placeholders/product-lavender.svg',5),
('Gift Sets','gift-set','Meaningful gifts for new arrivals.','/images/placeholders/product-seafoam.svg',6),
('Starter Sets','starter-set','A considered start to their first wardrobe.','/images/placeholders/product-cream.svg',7),
('New Arrivals','new-arrivals','Newly chosen pieces for little moments.','/images/placeholders/product-blush.svg',8)
on conflict(handle) do update set title=excluded.title, description=excluded.description, image=excluded.image, sort_order=excluded.sort_order;

insert into public.products(title,handle,description,price,compare_at_price,gender,season,status,is_sold_out,badges,sort_order,fabric_care) values
('Soft Lavender Newborn Baby Essentials Set','soft-lavender-newborn-baby-essentials-set','A gentle lavender welcome-home bundle with coordinated newborn essentials.','1999.50','3999.00','Unisex','All Seasons','published',true,array['Sale'],1,'Soft cotton blend. Machine wash cold with like colours; line dry.'),
('Newborn Essentials Set – Seafoam Green','newborn-essentials-set-seafoam-green','A fresh seafoam set of newborn essentials, thoughtfully grouped for gifting.','1999.50','3999.00','Unisex','All Seasons','published',false,array['Sale'],2,'Soft cotton blend. Machine wash cold with like colours; line dry.'),
('Newborn Essentials Set – Sand Beige','newborn-essentials-set-sand-beige','A calm sand-toned newborn set for everyday comfort and gifting.','1999.50','3999.00','Unisex','All Seasons','published',true,array['Sale'],3,'Soft cotton blend. Machine wash cold with like colours; line dry.'),
('Baby Winter Set – Silver Stitch','baby-winter-set-silver-stitch','A cozy silver-stitch set for cooler days and snug little outings.','2199.00',null,'Unisex','Winter','published',false,'{}',4,'Warm knit blend. Gentle cold wash; dry flat.'),
('Baby Winter Set – Navy Splash','baby-winter-set-navy-splash','A cozy navy winter set with thoughtful details for little explorers.','2199.00',null,'Boys','Winter','published',false,'{}',5,'Warm knit blend. Gentle cold wash; dry flat.'),
('Midnight Knit Baby Winter Set – Black & White','midnight-knit-baby-winter-set-black-white','A monochrome knit set made for crisp mornings and cozy afternoons.','2199.00',null,'Unisex','Winter','published',false,'{}',6,'Warm knit blend. Gentle cold wash; dry flat.'),
('Baby Winter Set – Blush Stripe','baby-winter-set-blush-stripe','A soft blush-striped winter set for tiny seasonal adventures.','2199.00',null,'Girls','Winter','published',false,'{}',7,'Warm knit blend. Gentle cold wash; dry flat.'),
('Hooded Baby Winter Romper – Cloud Frog','hooded-baby-winter-romper-cloud-frog','A snug hooded romper with a playful cloud-frog theme.','2999.00',null,'Unisex','Winter','published',false,'{}',8,'Soft cotton fleece. Wash inside out on a gentle cold cycle.'),
('Sky Breeze Baby Bodysuit','sky-breeze-baby-bodysuit','A breathable sky-blue bodysuit for easy everyday changes.','1499.00',null,'Unisex','Summer','published',false,'{}',9,'Breathable cotton jersey. Machine wash cold; tumble dry low.'),
('Sunshine Twirl Baby Frock','sunshine-twirl-baby-frock','A cheerful sunshine-yellow frock for bright little occasions.','1899.00',null,'Girls','Summer','published',false,'{}',10,'Light cotton voile. Gentle machine wash; line dry.'),
('Sand Dune Baby Romper','sand-dune-baby-romper','A sand-beige romper with a soft feel for all-day wear.','1799.00',null,'Unisex','All Seasons','published',false,'{}',11,'Soft cotton blend. Machine wash cold with like colours.'),
('Little Sunshine Baby Cap','little-sunshine-baby-cap','A sunny soft cap to finish a little outfit.','699.00',null,'Unisex','Summer','published',false,'{}',12,'Cotton jersey. Hand wash gently; reshape while damp.'),
('10pc Gift Set','10pc-gift-set','Ten coordinated newborn essentials, ready to make a thoughtful first gift.','4999.00',null,'Unisex','All Seasons','published',false,array['Gift'],13,'Soft cotton blend. Machine wash cold with like colours; line dry.'),
('Cloud Cotton Baby Bodysuit','cloud-cotton-baby-bodysuit','A cloud-soft ivory bodysuit with easy-change snaps.','1399.00',null,'Unisex','All Seasons','published',false,'{}',14,'100% cotton jersey. Machine wash cold; tumble dry low.'),
('Petal Dots Baby Bodysuit','petal-dots-baby-bodysuit','A sweet blush dot-print bodysuit for everyday cuddles.','1499.00',null,'Girls','Summer','published',false,'{}',15,'Breathable cotton jersey. Machine wash cold; tumble dry low.'),
('Moonbeam Wrap Baby Bodysuit','moonbeam-wrap-baby-bodysuit','A gentle wrap-front bodysuit made for easy newborn dressing.','1599.00',null,'Unisex','All Seasons','published',false,'{}',16,'Soft cotton rib. Wash cold on a gentle cycle; line dry.'),
('Little Daisy Baby Frock','little-daisy-baby-frock','A light floral frock for family visits and sunny celebrations.','1999.00',null,'Girls','Summer','published',false,'{}',17,'Light cotton voile. Gentle machine wash; line dry.'),
('Sunday Best Baby Frock','sunday-best-baby-frock','A timeless occasion frock with a soft lining and easy fit.','2299.00',null,'Girls','All Seasons','published',false,'{}',18,'Cotton outer with soft lining. Gentle cold wash; line dry.'),
('Sage Garden Baby Romper','sage-garden-baby-romper','A calm sage romper with room to wriggle and explore.','1799.00',null,'Unisex','Summer','published',false,'{}',19,'Breathable cotton jersey. Machine wash cold; line dry.'),
('Cloud Nine Everyday Romper','cloud-nine-everyday-romper','An everyday cloud-print romper, soft and simple to wear.','1699.00',null,'Unisex','All Seasons','published',false,'{}',20,'Soft cotton blend. Machine wash cold with like colours.'),
('Cozy Bear Baby Cap','cozy-bear-baby-cap','A warm little cap with a gentle bear-inspired detail.','799.00',null,'Unisex','Winter','published',false,'{}',21,'Cotton knit. Hand wash cold; dry flat.'),
('Little Bloom Knotted Cap','little-bloom-knotted-cap','A soft knotted cap in a delicate little bloom print.','699.00',null,'Girls','Summer','published',false,'{}',22,'Cotton jersey. Hand wash gently; reshape while damp.'),
('Meadow Muslin Starter Set','meadow-muslin-starter-set','A breathable starter bundle in soft meadow-inspired tones.','3499.00',null,'Unisex','Summer','published',false,array['New'],23,'Double-layer cotton muslin. Gentle cold wash; line dry.'),
('First Hello Hospital Set','first-hello-hospital-set','A considered set of first-day essentials for meeting your little one.','3899.00',null,'Unisex','All Seasons','published',false,array['Gift'],24,'Soft cotton blend. Machine wash cold with like colours; line dry.'),
('Tiny Star Socks & Mittens Set','tiny-star-socks-mittens-set','Coordinated socks and mittens to keep tiny hands and toes cozy.','999.00',null,'Unisex','All Seasons','published',false,'{}',25,'Soft cotton knit. Wash in a mesh bag on a gentle cold cycle.')
on conflict(handle) do update set title=excluded.title,description=excluded.description,price=excluded.price,compare_at_price=excluded.compare_at_price,gender=excluded.gender,season=excluded.season,status=excluded.status,is_sold_out=excluded.is_sold_out,badges=excluded.badges,sort_order=excluded.sort_order,fabric_care=excluded.fabric_care;

insert into public.product_images(product_id,url,alt,position)
select p.id, img.url, p.title || ' – placeholder image ' || img.position, img.position
from public.products p
cross join (values
  ('/images/placeholders/product-cream.svg',0),
  ('/images/placeholders/product-seafoam.svg',1),
  ('/images/placeholders/product-sand.svg',2)
) as img(url,position)
where p.handle in (
  'soft-lavender-newborn-baby-essentials-set','newborn-essentials-set-seafoam-green','newborn-essentials-set-sand-beige','baby-winter-set-silver-stitch','baby-winter-set-navy-splash','midnight-knit-baby-winter-set-black-white','baby-winter-set-blush-stripe','hooded-baby-winter-romper-cloud-frog','sky-breeze-baby-bodysuit','sunshine-twirl-baby-frock','sand-dune-baby-romper','little-sunshine-baby-cap','10pc-gift-set','cloud-cotton-baby-bodysuit','petal-dots-baby-bodysuit','moonbeam-wrap-baby-bodysuit','little-daisy-baby-frock','sunday-best-baby-frock','sage-garden-baby-romper','cloud-nine-everyday-romper','cozy-bear-baby-cap','little-bloom-knotted-cap','meadow-muslin-starter-set','first-hello-hospital-set','tiny-star-socks-mittens-set'
)
on conflict(product_id,position) do update set url=excluded.url, alt=excluded.alt;

with seed_sizes(handle,sizes) as (values
('baby-winter-set-navy-splash',array['6-9 Months','9-12 Months']),
('hooded-baby-winter-romper-cloud-frog',array['9-12 Months','12-18 Months']),
('soft-lavender-newborn-baby-essentials-set',array['0-3 Months','3-6 Months']),
('newborn-essentials-set-sand-beige',array['0-3 Months','3-6 Months']),
('default',array['0-3 Months','3-6 Months','6-9 Months','9-12 Months','12-18 Months'])
), product_sizes as (
  select p.id,p.handle,sz.size,p.is_sold_out
  from public.products p
  cross join lateral unnest(coalesce((select ss.sizes from seed_sizes ss where ss.handle=p.handle), (select ss.sizes from seed_sizes ss where ss.handle='default'))) as sz(size)
  where p.handle in (
    'soft-lavender-newborn-baby-essentials-set','newborn-essentials-set-seafoam-green','newborn-essentials-set-sand-beige','baby-winter-set-silver-stitch','baby-winter-set-navy-splash','midnight-knit-baby-winter-set-black-white','baby-winter-set-blush-stripe','hooded-baby-winter-romper-cloud-frog','sky-breeze-baby-bodysuit','sunshine-twirl-baby-frock','sand-dune-baby-romper','little-sunshine-baby-cap','10pc-gift-set','cloud-cotton-baby-bodysuit','petal-dots-baby-bodysuit','moonbeam-wrap-baby-bodysuit','little-daisy-baby-frock','sunday-best-baby-frock','sage-garden-baby-romper','cloud-nine-everyday-romper','cozy-bear-baby-cap','little-bloom-knotted-cap','meadow-muslin-starter-set','first-hello-hospital-set','tiny-star-socks-mittens-set'
  )
)
insert into public.product_variants(product_id,size,stock,sku)
select ps.id,ps.size,case when ps.is_sold_out then 0 else 8 end,upper(ps.handle) || '-' || upper(replace(replace(ps.size,' Months',''),' ',''))
from product_sizes ps
on conflict(product_id,size) do update set stock=excluded.stock,sku=excluded.sku;

with assignments(handle,collections) as (values
('soft-lavender-newborn-baby-essentials-set',array['bundles-sets','starter-set','new-arrivals']),
('newborn-essentials-set-seafoam-green',array['bundles-sets','gift-set','new-arrivals']),
('newborn-essentials-set-sand-beige',array['bundles-sets','starter-set']),
('baby-winter-set-silver-stitch',array['bundles-sets','new-arrivals']),
('baby-winter-set-navy-splash',array['bundles-sets']),
('midnight-knit-baby-winter-set-black-white',array['bundles-sets']),
('baby-winter-set-blush-stripe',array['bundles-sets']),
('hooded-baby-winter-romper-cloud-frog',array['rompers','new-arrivals']),
('sky-breeze-baby-bodysuit',array['body-suits','new-arrivals']),
('sunshine-twirl-baby-frock',array['frocks']),
('sand-dune-baby-romper',array['rompers']),
('little-sunshine-baby-cap',array['caps-accessories']),
('10pc-gift-set',array['gift-set','bundles-sets']),
('cloud-cotton-baby-bodysuit',array['body-suits']),
('petal-dots-baby-bodysuit',array['body-suits','new-arrivals']),
('moonbeam-wrap-baby-bodysuit',array['body-suits','starter-set']),
('little-daisy-baby-frock',array['frocks','new-arrivals']),
('sunday-best-baby-frock',array['frocks']),
('sage-garden-baby-romper',array['rompers']),
('cloud-nine-everyday-romper',array['rompers','new-arrivals']),
('cozy-bear-baby-cap',array['caps-accessories']),
('little-bloom-knotted-cap',array['caps-accessories','new-arrivals']),
('meadow-muslin-starter-set',array['starter-set','bundles-sets']),
('first-hello-hospital-set',array['gift-set','starter-set']),
('tiny-star-socks-mittens-set',array['caps-accessories','gift-set'])
)
insert into public.product_collections(product_id,collection_id)
select p.id,c.id from assignments a
join public.products p on p.handle=a.handle
cross join lateral unnest(a.collections) as h(handle)
join public.collections c on c.handle=h.handle
on conflict do nothing;

insert into public.site_settings(setting_key,store_name,tagline,phone,whatsapp_number,email,address,social_links,legal_owner_line,is_published)
values ('storefront','ragNready','Soft beginnings, thoughtfully chosen.','+92 300 0000000','+92 300 0000000','hello@example.com','Lahore, Pakistan','{}',null,true)
on conflict(setting_key) do update set store_name=excluded.store_name,tagline=excluded.tagline,phone=excluded.phone,whatsapp_number=excluded.whatsapp_number,email=excluded.email,address=excluded.address,social_links=excluded.social_links,legal_owner_line=excluded.legal_owner_line,is_published=true;

-- Initial admin email is read from .env.local. This is an email address, not a key.
