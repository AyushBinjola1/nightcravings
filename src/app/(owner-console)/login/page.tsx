import type { Metadata } from "next";

import { StaffLoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign in — NightCravings Owner Console",
};

export default function StaffLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="text-accent mb-2 font-mono text-xs tracking-[0.1em] uppercase">
          NightCravings
        </p>
        <h1 className="font-display text-ink mb-6 text-2xl font-semibold">
          Owner Console
        </h1>
        <StaffLoginForm />
      </div>
    </main>
  );
}
