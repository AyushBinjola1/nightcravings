"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildWhatsAppLink } from "@/lib/whatsapp";

/**
 * Phase 2 §10 (Profile) "Support" row: "Direct message/call to the
 * owner — one tap, no ticket system for a business this size." The item
 * request box is the same mechanism Phase 2 §2 specifies for a
 * zero-search-result fallback ("Message the store about [query]") —
 * there's no separate "Request Item" feature in the approved docs, so
 * this reuses that exact pattern rather than inventing a new one.
 */
export function SupportSection({
  supportPhone,
}: {
  supportPhone: string | null;
}) {
  const [item, setItem] = useState("");

  if (!supportPhone) {
    return (
      <p className="text-ink-soft text-sm">
        Support contact isn&apos;t set up for this store yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <a
        href={buildWhatsAppLink(
          supportPhone,
          "Hi! I have a question about my order.",
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="border-border bg-surface text-ink flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium"
      >
        <MessageCircle size={16} aria-hidden="true" />
        Message the store
      </a>

      <div>
        <label
          htmlFor="item-request"
          className="text-ink mb-1.5 block text-sm font-medium"
        >
          Craving something we don&apos;t stock?
        </label>
        <div className="flex gap-2">
          <Input
            id="item-request"
            placeholder="e.g. Oreo, Red Bull…"
            value={item}
            onChange={(event) => setItem(event.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={item.trim().length === 0}
            asChild
          >
            <a
              href={buildWhatsAppLink(
                supportPhone,
                `Hi! Could you stock ${item.trim()}?`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={item.trim().length === 0}
              onClick={(event) => {
                if (item.trim().length === 0) event.preventDefault();
              }}
            >
              Ask
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
