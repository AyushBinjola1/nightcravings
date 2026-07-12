"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildWhatsAppLink } from "@/lib/whatsapp";

/**
 * The "Message the store about [item]" pattern (Phase 2 §2's search
 * empty-state fallback), reused wherever a customer wants to ask for
 * something not in the catalogue — Home's always-visible bar and
 * Profile's Support section both compose this rather than duplicating
 * the WhatsApp-link logic.
 */
export function ItemRequestForm({
  supportPhone,
  compact = false,
}: {
  supportPhone: string | null;
  compact?: boolean;
}) {
  const [item, setItem] = useState("");
  const trimmed = item.trim();

  if (!supportPhone) return null;

  return (
    <div className={compact ? "flex gap-2" : "flex flex-col gap-3"}>
      {!compact && (
        <label htmlFor="item-request" className="text-ink text-sm font-medium">
          Craving something we don&apos;t stock?
        </label>
      )}
      <div className="flex flex-1 gap-2">
        <Input
          id="item-request"
          placeholder={
            compact ? "Can't find it? Request here…" : "e.g. Oreo, Red Bull…"
          }
          value={item}
          onChange={(event) => setItem(event.target.value)}
        />
        <Button type="button" variant="secondary" disabled={!trimmed} asChild>
          <a
            href={buildWhatsAppLink(
              supportPhone,
              `Hi! Could you stock ${trimmed}?`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!trimmed}
            aria-label={compact ? "Request this item" : undefined}
            onClick={(event) => {
              if (!trimmed) event.preventDefault();
            }}
          >
            {compact ? <Send size={16} aria-hidden="true" /> : "Ask"}
          </a>
        </Button>
      </div>
    </div>
  );
}
