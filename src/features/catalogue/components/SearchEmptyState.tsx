import { MessageCircle } from "lucide-react";

import { buildWhatsAppLink } from "@/lib/whatsapp";

/**
 * Phase 2 §2 "Empty results": "Never truly empty... a direct 'Message the
 * store' link, so a genuinely missing item still becomes a conversation."
 * (The spec's other half of this fallback — suggesting the closest
 * category — isn't implemented; that needs a real similarity heuristic,
 * not a guess, so this ships the honest half rather than a fake one.)
 */
export function SearchEmptyState({
  query,
  supportPhone,
}: {
  query: string;
  supportPhone: string | null;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-ink-soft text-sm">
        Nothing matches &ldquo;{query}&rdquo;.
      </p>
      {supportPhone && (
        <a
          href={buildWhatsAppLink(
            supportPhone,
            `Hi! Could you stock ${query}?`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="border-border bg-surface text-ink flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
        >
          <MessageCircle size={16} aria-hidden="true" />
          Message the store about &ldquo;{query}&rdquo;
        </a>
      )}
    </div>
  );
}
