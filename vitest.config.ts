import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Stage 11 — unit + component tests only. Integration tests against a
 * real Supabase instance, e2e (Playwright), and pgTAP RLS tests each live
 * under ../tests/{integration,e2e,pgtap} per Phase 4 §20's structure and
 * run via their own tooling, not Vitest.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/unit/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
