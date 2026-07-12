"use client";

import { Sheet } from "@/components/ui/sheet";
import { SupportSection } from "@/features/profile/components/SupportSection";
import { FaqSection } from "@/features/profile/components/FaqSection";

function HelpSectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-ink-soft mb-2 text-xs font-medium tracking-[0.06em] uppercase">
      {children}
    </h2>
  );
}

/**
 * A one-tap shortcut to Support + FAQ from the header, for a customer who
 * needs help right now and doesn't want to open the full Profile sheet
 * first. Same content Profile's own Support/FAQ sections show — this
 * doesn't duplicate that logic, just surfaces it faster.
 */
export function HelpSheet({
  open,
  onOpenChange,
  supportPhone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supportPhone: string | null;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Help">
      <div className="flex flex-col gap-6">
        <section>
          <HelpSectionHeading>Support</HelpSectionHeading>
          <SupportSection supportPhone={supportPhone} />
        </section>
        <section>
          <HelpSectionHeading>FAQ</HelpSectionHeading>
          <FaqSection />
        </section>
      </div>
    </Sheet>
  );
}
