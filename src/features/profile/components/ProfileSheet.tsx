"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Sheet } from "@/components/ui/sheet";
import { ThemeSwitch } from "@/features/theme/components/ThemeSwitch";
import { SavedDetailsSection } from "@/features/profile/components/SavedDetailsSection";
import { SupportSection } from "@/features/profile/components/SupportSection";
import { FaqSection } from "@/features/profile/components/FaqSection";

function ProfileSectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-ink-soft mb-2 text-xs font-medium tracking-[0.06em] uppercase">
      {children}
    </h2>
  );
}

/**
 * Phase 2 §10 — Profile: "the least-visited but highest-retention-leverage
 * section." Order History, Saved Details, Theme, Support, and FAQ, in the
 * order the spec lists them. There's no login-backed "Account" in this
 * product (Phase 1's pivot away from customer OTP) — this is the browser-
 * local equivalent the docs actually call for.
 */
export function ProfileSheet({
  open,
  onOpenChange,
  supportPhone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supportPhone: string | null;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Profile">
      <div className="flex flex-col gap-6">
        <section>
          <ProfileSectionHeading>Order history</ProfileSectionHeading>
          <Link
            href="/orders"
            onClick={() => onOpenChange(false)}
            className="border-border bg-surface text-ink flex items-center justify-between rounded-md border px-3 py-2.5 text-sm font-medium"
          >
            View your orders
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </section>

        <section>
          <ProfileSectionHeading>Saved details</ProfileSectionHeading>
          <SavedDetailsSection />
        </section>

        <section>
          <ProfileSectionHeading>Theme</ProfileSectionHeading>
          <ThemeSwitch />
        </section>

        <section>
          <ProfileSectionHeading>Support</ProfileSectionHeading>
          <SupportSection supportPhone={supportPhone} />
        </section>

        <section>
          <ProfileSectionHeading>FAQ</ProfileSectionHeading>
          <FaqSection />
        </section>
      </div>
    </Sheet>
  );
}
