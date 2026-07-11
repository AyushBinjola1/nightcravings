-- Stage 9 (Analytics) — two aggregation RPCs for the Owner Console's
-- Analytics page (Phase 3 §7). Deliberately plain SQL functions (no
-- SECURITY DEFINER): PostgREST's query builder can't express GROUP BY, but
-- staff should only ever see their own hostel's aggregates, so these run
-- as the calling (authenticated) role and rely on the existing
-- orders_select_staff / order_items "is_staff_of" RLS policies —
-- the same authorization boundary as every other staff read, not a new one.

create function public.get_revenue_by_day(p_hostel_id uuid, p_days integer default 7)
returns table (day date, revenue numeric, order_count bigint)
language sql
stable
as $$
  select
    date_trunc('day', created_at)::date as day,
    coalesce(sum(total), 0) as revenue,
    count(*) as order_count
  from public.orders
  where hostel_id = p_hostel_id
    and status <> 'cancelled'
    and created_at >= (now() - (p_days || ' days')::interval)
  group by 1
  order by 1;
$$;

grant execute on function public.get_revenue_by_day(uuid, integer) to authenticated;

create function public.get_top_products(p_hostel_id uuid, p_limit integer default 5)
returns table (product_name text, total_quantity bigint)
language sql
stable
as $$
  select
    oi.product_name_snapshot as product_name,
    sum(oi.quantity) as total_quantity
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where o.hostel_id = p_hostel_id
    and o.status <> 'cancelled'
  group by oi.product_name_snapshot
  order by total_quantity desc
  limit p_limit;
$$;

grant execute on function public.get_top_products(uuid, integer) to authenticated;
