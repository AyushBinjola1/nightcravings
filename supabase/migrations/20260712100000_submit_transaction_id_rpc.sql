-- Caught while building the Stage 6 Payment screen: payments has no anon
-- UPDATE policy (by design — see Phase 4 §6, only staff with
-- orders.verify_payment may mutate a payment), but a customer optionally
-- submitting their UPI transaction ID (Phase 2 §8) needs to write exactly
-- one column. Rather than opening a column-level UPDATE grant to anon on
-- `payments` (which would need its own careful scoping), this is a single
-- narrow SECURITY DEFINER RPC: it only ever sets transaction_id, and only
-- while the payment is still 'pending' — an already-verified/rejected
-- payment can no longer be touched by the customer.

create function public.submit_transaction_id(p_order_id uuid, p_transaction_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.payments
  set transaction_id = p_transaction_id
  where order_id = p_order_id
    and status = 'pending';
end;
$$;

grant execute on function public.submit_transaction_id(uuid, text) to anon, authenticated;
