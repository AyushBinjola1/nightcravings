-- Seeds the single hostel this deployment serves (src/config/hostel.ts),
-- so the customer app has something to browse immediately after the
-- migrations above are applied, rather than requiring a manual dashboard
-- insert before Stage 6 can be tested at all.

insert into public.hostels (name, slug, status, opening_time, closing_time)
values ('NightCravings Demo Hostel', 'demo-hostel', 'open', '18:00', '02:00')
on conflict (slug) do nothing;
