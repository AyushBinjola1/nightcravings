-- Seeds real, browsable categories and products for the demo hostel
-- (20260712093000_seed_demo_hostel.sql), so the Home page shows an actual
-- shelf the moment these migrations are applied — not an empty "nothing
-- here yet" state. Prices are realistic Indian hostel-shop prices;
-- image_url is left null (ProductCard already has a real "No image"
-- state for exactly this case) since no real product photography exists
-- yet — a designer/owner adds real photos later via Product Management
-- (Phase 3 §5), not fabricated here.

do $$
declare
  v_hostel_id uuid;
  v_snacks_id uuid;
  v_beverages_id uuid;
  v_instant_food_id uuid;
  v_chocolates_id uuid;
begin
  select id into v_hostel_id from public.hostels where slug = 'demo-hostel';

  if v_hostel_id is null then
    raise notice 'demo-hostel not found — skipping catalogue seed';
    return;
  end if;

  -- Idempotency guard: if this hostel already has any category, assume
  -- the seed already ran (or the owner has real data) and do nothing,
  -- rather than risk duplicate rows on a second apply.
  if exists (select 1 from public.categories where hostel_id = v_hostel_id) then
    raise notice 'demo-hostel already has categories — skipping catalogue seed';
    return;
  end if;

  insert into public.categories (hostel_id, name, sort_order) values
    (v_hostel_id, 'Instant Food', 1),
    (v_hostel_id, 'Snacks', 2),
    (v_hostel_id, 'Beverages', 3),
    (v_hostel_id, 'Chocolates', 4);

  select id into v_instant_food_id from public.categories where hostel_id = v_hostel_id and name = 'Instant Food';
  select id into v_snacks_id from public.categories where hostel_id = v_hostel_id and name = 'Snacks';
  select id into v_beverages_id from public.categories where hostel_id = v_hostel_id and name = 'Beverages';
  select id into v_chocolates_id from public.categories where hostel_id = v_hostel_id and name = 'Chocolates';

  insert into public.products
    (hostel_id, category_id, name, description, price, cost_price, stock_qty, search_keywords)
  values
    (v_hostel_id, v_instant_food_id, 'Maggi 2-Minute Noodles', 'The 2-minute classic, made fresh in the pantry microwave.', 18, 12, 40, array['maggi', 'noodles', 'instant noodles']),
    (v_hostel_id, v_instant_food_id, 'Cup Noodles', 'Just add hot water — ready in 3 minutes.', 45, 32, 25, array['cup noodles', 'instant']),
    (v_hostel_id, v_snacks_id, 'Lay''s Classic Salted', '52g pack.', 20, 15, 30, array['lays', 'chips', 'crisps']),
    (v_hostel_id, v_snacks_id, 'Kurkure Masala Munch', '90g pack.', 20, 14, 30, array['kurkure', 'chips']),
    (v_hostel_id, v_beverages_id, 'Sting Energy Drink', '250ml can.', 40, 30, 24, array['sting', 'energy drink']),
    (v_hostel_id, v_beverages_id, 'Coca-Cola', '750ml bottle.', 40, 30, 20, array['coke', 'cold drink', 'soft drink']),
    (v_hostel_id, v_beverages_id, 'Amul Masti Curd', '400g cup.', 35, 26, 15, array['curd', 'dahi', 'yogurt']),
    (v_hostel_id, v_chocolates_id, 'Dairy Milk Silk', '60g bar.', 60, 45, 20, array['dairy milk', 'chocolate']),
    (v_hostel_id, v_chocolates_id, 'KitKat 4-Finger', '37.3g bar.', 30, 22, 25, array['kitkat', 'chocolate']);
end $$;
