import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NightCravings — Build Status",
};

const STAGES = [
  { name: "Project Setup", done: true },
  { name: "Authentication", done: false },
  { name: "Database", done: false },
  { name: "Design System", done: false },
  { name: "Shared Components", done: false },
  { name: "Customer Application", done: false },
  { name: "Owner Console", done: false },
  { name: "Realtime", done: false },
  { name: "Analytics", done: false },
  { name: "PWA", done: false },
  { name: "Testing", done: false },
  { name: "Production Hardening", done: false },
] as const;

/**
 * This route is a temporary build-status page, not the Phase 2 customer
 * Home screen — that screen belongs to Stage 6 (Customer Application) and
 * is intentionally not built yet, per the implementation order in the
 * Engineering Blueprint. This page exists so `npm run dev` renders
 * something real and honest about project state, rather than the
 * create-next-app starter or a fake preview of unfinished work.
 */
export default function RootStatusPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-16">
      <p className="text-accent mb-3 font-mono text-xs tracking-[0.1em] uppercase">
        NightCravings — Engineering Build
      </p>
      <h1 className="font-display text-ink mb-3 text-3xl font-semibold text-balance">
        Stage 1 of 12 complete.
      </h1>
      <p className="text-ink-soft mb-10 max-w-[60ch]">
        Project setup is done: Next.js, TypeScript (strict), Tailwind wired to
        the approved design tokens, linting, and the approved folder structure.
        Nothing below Stage 1 has been implemented yet — this page will be
        replaced by the real customer Home screen once Stage 6 begins.
      </p>
      <ol className="divide-border border-border flex flex-col divide-y rounded-md border">
        {STAGES.map((stage, index) => (
          <li
            key={stage.name}
            className="flex items-center gap-3 px-4 py-3 text-sm"
          >
            <span className="text-ink-soft w-6 shrink-0 font-mono text-xs">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className={stage.done ? "text-ink font-medium" : "text-ink-soft"}
            >
              {stage.name}
            </span>
            <span
              className={
                "ml-auto rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase " +
                (stage.done
                  ? "bg-success-soft text-success"
                  : "bg-surface text-ink-soft")
              }
            >
              {stage.done ? "Done" : "Pending"}
            </span>
          </li>
        ))}
      </ol>
    </main>
  );
}
