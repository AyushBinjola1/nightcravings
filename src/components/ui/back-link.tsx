import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** A consistent "back" affordance for screens reached one level deep
 * from Home (Checkout, Payment) — there was no way back except the
 * header logo before this. */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-ink-soft mb-4 inline-flex items-center gap-1.5 text-sm"
    >
      <ArrowLeft size={14} aria-hidden="true" />
      {label}
    </Link>
  );
}
