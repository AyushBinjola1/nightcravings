-- Extends the realtime publication (Stage 8's migration only added
-- `orders`) to the tables customers and staff both reported "won't
-- update without a refresh": `payments` (a reject-only action never
-- touches `orders`, so staff watching the queue on a second device
-- never heard about it) and `products`/`stock_history` (Manage Menu
-- writes and, more importantly, a product going in/out of stock, never
-- reached the customer-facing Home page or a second staff session
-- either). Table membership here is what makes postgres_changes emit
-- anything at all — RLS alone was never the gap for these three.
alter publication supabase_realtime add table public.payments;
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.stock_history;
