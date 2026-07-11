/**
 * Supabase-generated database types.
 *
 * This file is a build artifact, not hand-written: once the Stage 3
 * (Database) migrations exist, regenerate it with
 *
 *   npx supabase gen types typescript --project-id <project-ref> > src/types/database.ts
 *
 * The shape below is the real, empty-schema output of that command today —
 * not a stand-in — so every Supabase client in this codebase is correctly
 * typed against "no tables yet" rather than `any`. Every table added in
 * Phase 4 §3 will appear under `public.Tables` the next time this file is
 * regenerated.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
