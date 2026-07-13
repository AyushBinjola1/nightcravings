"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildWhatsAppLink } from "@/lib/whatsapp";

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
    <div
      className={
        compact
          ? "flex w-full items-center gap-3"
          : "flex w-full flex-col gap-3"
      }
    >
      {!compact && (
        <label
          htmlFor="item-request"
          className="text-ink text-sm font-semibold tracking-tight"
        >
          Craving something we don&apos;t stock?
        </label>
      )}
      <div className="flex w-full flex-1 items-center gap-2">
        <div className="relative flex-1">
          <Input
            id="item-request"
            placeholder={
              compact
                ? "Can't find what you want? Request it..."
                : "e.g. Oreo, Red Bull, Maggi..."
            }
            value={item}
            onChange={(event) => setItem(event.target.value)}
            className="bg-paper/60 focus:bg-paper focus:border-night focus:ring-night/10 rounded-full py-2.5 pr-10 shadow-sm focus:ring-2"
          />
        </div>
        <Button
          type="button"
          variant={trimmed ? "primary" : "secondary"}
          disabled={!trimmed}
          asChild
          className="shrink-0 rounded-full shadow-sm transition-transform active:scale-95"
        >
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
            className="flex items-center justify-center gap-1.5"
          >
            {compact ? (
              <Send size={14} aria-hidden="true" />
            ) : (
              <span className="flex items-center gap-1.5">
                Ask Store <Send size={12} />
              </span>
            )}
          </a>
        </Button>
      </div>
    </div>
  );
}
