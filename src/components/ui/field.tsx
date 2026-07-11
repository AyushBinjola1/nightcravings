import { useId } from "react";

import { Label } from "@/components/ui/label";

/**
 * Composes a label, an input (or any control), and its validation message
 * with the correct `htmlFor`/`aria-describedby` wiring — every form in the
 * app (Phase 2 §7, Phase 3 forms) builds fields this way rather than
 * repeating the label/error boilerplate per screen.
 */
export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: (ids: {
    fieldId: string;
    describedBy: string | undefined;
  }) => React.ReactNode;
}) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={fieldId}>{label}</Label>
      {children({ fieldId, describedBy: error ? errorId : undefined })}
      {error && (
        <p id={errorId} role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
