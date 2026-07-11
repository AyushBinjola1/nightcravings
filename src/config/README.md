# config/

Per-hostel configuration resolution (opening hours, delivery fee, free
delivery threshold, UPI identity) — resolved server-side from the
`hostels`/`settings` tables once Stage 3 (Database) exists, then passed down
as typed props. No hostel-specific value is ever hardcoded in a component.
