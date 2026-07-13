import { ItemRequestForm } from "@/features/profile";

export function DemandItemBar({
  supportPhone,
}: {
  supportPhone: string | null;
}) {
  if (!supportPhone) return null;

  return (
    <div className="border-border/60 bg-surface/50 shadow-premium flex items-center justify-between rounded-2xl border px-4 py-3.5">
      <ItemRequestForm supportPhone={supportPhone} compact />
    </div>
  );
}
