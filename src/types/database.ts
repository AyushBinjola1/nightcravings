/**
 * Supabase-generated database types.
 *
 * Hand-authored to exactly mirror
 * `supabase/migrations/20260711180000_identity_and_tenancy.sql`, because
 * this environment has no Docker (so `supabase start` can't run locally)
 * and no live Supabase project to generate against. This is NOT a
 * verified-correct codegen output — regenerate it for real the moment a
 * live/local project exists:
 *
 *   npx supabase gen types typescript --project-id <project-ref> > src/types/database.ts
 *
 * and diff against this file before trusting it further. Every table below
 * corresponds 1:1 to a `create table` in that migration; nothing here
 * exists ahead of its migration.
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
    Tables: {
      hostels: {
        Row: {
          id: string;
          name: string;
          slug: string;
          status: Database["public"]["Enums"]["hostel_status"];
          opening_time: string | null;
          closing_time: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          status?: Database["public"]["Enums"]["hostel_status"];
          opening_time?: string | null;
          closing_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["hostels"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          hostel_id: string | null;
          full_name: string | null;
          phone: string | null;
          room_number: string | null;
          payment_flag_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          hostel_id?: string | null;
          full_name?: string | null;
          phone?: string | null;
          room_number?: string | null;
          payment_flag_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "profiles_hostel_id_fkey";
            columns: ["hostel_id"];
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
        ];
      };
      roles: {
        Row: { id: string; slug: string; description: string };
        Insert: { id?: string; slug: string; description: string };
        Update: Partial<Database["public"]["Tables"]["roles"]["Insert"]>;
        Relationships: [];
      };
      permissions: {
        Row: { id: string; action: string; description: string };
        Insert: { id?: string; action: string; description: string };
        Update: Partial<Database["public"]["Tables"]["permissions"]["Insert"]>;
        Relationships: [];
      };
      role_permissions: {
        Row: { role_id: string; permission_id: string };
        Insert: { role_id: string; permission_id: string };
        Update: Partial<
          Database["public"]["Tables"]["role_permissions"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey";
            columns: ["role_id"];
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_roles: {
        Row: {
          id: string;
          profile_id: string;
          role_id: string;
          hostel_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          role_id: string;
          hostel_id: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["profile_roles"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "profile_roles_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_roles_role_id_fkey";
            columns: ["role_id"];
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_roles_hostel_id_fkey";
            columns: ["hostel_id"];
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
        ];
      };
      devices: {
        Row: {
          id: string;
          profile_id: string;
          push_token: string;
          platform: Database["public"]["Enums"]["device_platform"];
          last_seen_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          push_token: string;
          platform: Database["public"]["Enums"]["device_platform"];
          last_seen_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["devices"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "devices_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_staff_of: {
        Args: { target_hostel: string };
        Returns: boolean;
      };
      has_permission: {
        Args: { target_hostel: string; perm_action: string };
        Returns: boolean;
      };
      owns_row: {
        Args: { owner_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      hostel_status: "open" | "closed" | "maintenance";
      device_platform: "web" | "ios" | "android";
    };
    CompositeTypes: Record<string, never>;
  };
};
