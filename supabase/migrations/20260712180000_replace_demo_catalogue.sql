-- Replaces the placeholder demo catalogue (20260712130000) with the
-- owner's real product list — real names, real prices, real product
-- photos (hosted on the owner's existing grocery-delivery CDN links,
-- the same photos already used to sell these exact SKUs elsewhere).
--
-- Orders for this hostel are deleted first: `order_items.product_id`
-- references `products` `on delete restrict`, so the old products can't
-- be dropped while any order still lines up against them. Every existing
-- order here is this session's own Playwright/manual test data (no real
-- customer has used this store yet) — deleting `orders` cascades
-- order_items/payments/payment_screenshots automatically.
--
-- cost_price is left null throughout: no real cost data was given for
-- these products, and inventing a margin number would be exactly the
-- fabricated data the project's non-negotiables rule out.

do $$
declare
  v_hostel_id uuid;
  v_snacks_id uuid;
  v_chocolates_id uuid;
begin
  select id into v_hostel_id from public.hostels where slug = 'demo-hostel';

  if v_hostel_id is null then
    raise notice 'demo-hostel not found — skipping catalogue replacement';
    return;
  end if;

  delete from public.orders where hostel_id = v_hostel_id;
  delete from public.products where hostel_id = v_hostel_id;

  select id into v_snacks_id from public.categories where hostel_id = v_hostel_id and name = 'Snacks';
  select id into v_chocolates_id from public.categories where hostel_id = v_hostel_id and name = 'Chocolates';

  insert into public.products
    (hostel_id, category_id, name, description, price, stock_qty, image_url, search_keywords)
  values
    (v_hostel_id, v_snacks_id, 'Lay''s American Cream & Onion Flavour', 'Potato Chips', 30, 30,
      'https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1470-1470,pr-true,f-auto,q-40,dpr-2/cms/product_variant/d2374604-376f-45aa-a16f-f60aa009a001/Lay-s-American-Cream-Onion-Flavour-Potato-Chips.jpg',
      array['lays', 'chips', 'cream and onion', 'potato chips']),
    (v_hostel_id, v_snacks_id, 'Lay''s India''s Magic Masala', 'Crunchy Potato Chips', 30, 30,
      'https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1500-1500,pr-true,f-auto,q-40,dpr-2/cms/product_variant/3cb2a17f-f981-496b-9f33-7aca97b5345d/Lay-s-India-s-Magic-Masala-Crunchy-Potato-Chips.jpg',
      array['lays', 'chips', 'magic masala', 'potato chips']),
    (v_hostel_id, v_snacks_id, 'Lay''s West Indies Hot ''n'' Sweet Chilli', 'Potato Chips', 30, 30,
      'https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1500-1500,pr-true,f-auto,q-40,dpr-2/cms/product_variant/d97b3d3f-9d39-491f-baf7-d763043a7e52/Lay-s-West-Indies-Hot-n-Sweet-Chilli-Potato-Chips.jpg',
      array['lays', 'chips', 'hot n sweet chilli', 'potato chips']),
    (v_hostel_id, v_snacks_id, 'Lay''s Spanish Tomato Tango Flavour', 'Potato Chips', 30, 30,
      'https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1500-1500,pr-true,f-auto,q-40,dpr-2/cms/product_variant/43ee72aa-ec6f-4e57-b2aa-eb6fa3f53d65/Lay-s-Spanish-Tomato-Tango-Flavour-Potato-Chips.jpg',
      array['lays', 'chips', 'tomato tango', 'potato chips']),
    (v_hostel_id, v_snacks_id, 'Lay''s Chile Lemon Flavour', 'Potato Chips', 30, 30,
      'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_600/NI_CATALOG/IMAGES/CIW/2026/4/24/79e853a1-1c01-41d9-aa92-3596215fdea7_5445_1.png',
      array['lays', 'chips', 'chile lemon', 'potato chips']),

    (v_hostel_id, v_snacks_id, 'Kurkure Namkeen Masala Munch', 'Crunchy Snacks', 25, 30,
      'https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1500-1500,pr-true,f-auto,q-40,dpr-2/cms/product_variant/b62d0d1b-5d0a-4275-9efc-3cf21bebc6a3/Kurkure-Namkeen-Masala-Munch-Crunchy-Snacks.jpg',
      array['kurkure', 'masala munch', 'snacks']),
    (v_hostel_id, v_snacks_id, 'Kurkure Namkeen Playz Puffcorn Yummy Cheese', 'Snacks', 25, 30,
      'https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1500-1500,pr-true,f-auto,q-40,dpr-2/cms/product_variant/5480c6cc-3f5d-4ed9-a35c-484923c5979c/Kurkure-Namkeen-Playz-Puffcorn-Yummy-Cheese-Snacks.jpg',
      array['kurkure', 'playz', 'puffcorn', 'cheese']),
    (v_hostel_id, v_snacks_id, 'Kurkure Namkeen Chilli Chataka', 'Crunchy Snacks', 25, 30,
      'https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-3000-3000,pr-true,f-auto,q-40,dpr-2/cms/product_variant/966cceaf-bcf0-42d0-8c88-b82bc0242054/Kurkure-Namkeen-Chilli-Chataka-Crunchy-Snacks.jpg',
      array['kurkure', 'chilli chataka', 'snacks']),
    (v_hostel_id, v_snacks_id, 'Bingo! Tedhe Medhe', 'Masala Tadka', 25, 30,
      'https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1500-1500,pr-true,f-auto,q-40,dpr-2/cms/product_variant/0c89fe86-9fe2-4940-ad76-e6dd69dc630f/Bingo-Tedhe-Medhe-Masala-Tadka.jpeg',
      array['bingo', 'tedhe medhe', 'masala tadka']),
    (v_hostel_id, v_snacks_id, 'Bingo! Mad Angles Achaari Masti Crisps', 'Crunchy & Tasty', 25, 30,
      'https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-2560-2560,pr-true,f-auto,q-40,dpr-2/cms/product_variant/7ba7f9ed-9980-4d05-956a-6ca57fcd9ae3/Bingo-Mad-Angles-Achaari-Masti-Crisps-Crunchy-Tasty.jpeg',
      array['bingo', 'mad angles', 'achaari masti']),
    (v_hostel_id, v_snacks_id, 'Haldiram''s Snac Lite! Fun Fries', 'Desi Punch', 50, 20,
      'https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1500-1500,pr-true,f-auto,q-40,dpr-2/cms/product_variant/01b300b9-2c2b-4b23-bfb0-bd4e14da864e/Haldiram-s-Snac-Lite-Fun-Fries-Desi-Punch.jpeg',
      array['haldiram', 'fun fries', 'desi punch']),

    (v_hostel_id, v_chocolates_id, 'Nestle MUNCH MAX Choco Coated Crunchy Wafer Bar', null, 25, 25,
      'https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/c8a891f1-f2c4-49cf-8fe1-921ea3651b52/Nestle-MUNCH-MAX-Choco-Coated-Crunchy-Wafer-Bar.jpg',
      array['munch', 'nestle', 'chocolate', 'wafer']),
    (v_hostel_id, v_chocolates_id, 'Cadbury 5 Star Chocolate Bar', null, 12, 30,
      'https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1100-1100,pr-true,f-auto,q-40,dpr-2/cms/product_variant/ac3f68dc-cf78-4448-801c-b5e21cc2d458/Cadbury-5-Star-Chocolate-Bar.jpg',
      array['5 star', 'cadbury', 'chocolate']),
    (v_hostel_id, v_chocolates_id, 'Sunfeast Dark Fantasy Bourbon Biscuits', null, 30, 25,
      'https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1500-1500,pr-true,f-auto,q-40,dpr-2/cms/product_variant/ca8a9e44-19ee-4931-bf62-fc609f60fdbe/Sunfeast-Dark-Fantasy-Bourbon-Biscuits.jpeg',
      array['dark fantasy', 'bourbon', 'biscuits', 'sunfeast']),
    (v_hostel_id, v_chocolates_id, 'Nestle KitKat 4 Fingers Choco Coated Wafer Bar', null, 35, 30,
      'https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/ab29f995-d90e-45c7-ab99-bebeb3e40873/Nestle-KitKat-4-Fingers-Choco-Coated-Wafer-Bar.jpeg',
      array['kitkat', 'nestle', 'chocolate', 'wafer']),
    (v_hostel_id, v_chocolates_id, 'Original Choco Fills By Sunfeast Dark Fantasy', 'Perfect Snack', 12, 25,
      'https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1500-1500,pr-true,f-auto,q-40,dpr-2/cms/product_variant/f710ed33-28d6-448c-b628-51d470ea72fd/Original-Choco-Fills-By-Sunfeast-Dark-Fantasy-Perfect-Snack.jpeg',
      array['choco fills', 'dark fantasy', 'sunfeast', 'chocolate']);
end $$;
