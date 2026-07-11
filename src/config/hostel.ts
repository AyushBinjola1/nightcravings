/**
 * Single-hostel configuration (Phase 1/4 §22: single hostel today, scoped
 * so multi-hostel is a config change, not a rewrite). The slug identifies
 * which `hostels` row this deployment serves — set per environment, never
 * hardcoded as a literal UUID in application code.
 */
export const CURRENT_HOSTEL_SLUG =
  process.env.NEXT_PUBLIC_HOSTEL_SLUG ?? "demo-hostel";
