import { ItemRequestForm } from "@/features/profile";

/**
 * An always-visible version of the "message the store about an item" bar
 * (see `ItemRequestForm`), surfaced right on Home rather than requiring a
 * customer to open Profile first — makes a genuinely missing item a
 * one-tap conversation instead of a dead end (Phase 2 §2's principle,
 * applied before the customer even has to search).
 */
export function DemandItemBar({
  supportPhone,
}: {
  supportPhone: string | null;
}) {
  if (!supportPhone) return null;

  return (
    <div className="border-border bg-surface rounded-md border px-3 py-2.5">
      <ItemRequestForm supportPhone={supportPhone} compact />
    </div>
  );
}
