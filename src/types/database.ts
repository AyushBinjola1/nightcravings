/**
 * Supabase-generated database types.
 *
 * Hand-authored to exactly mirror both
 * `supabase/migrations/20260711180000_identity_and_tenancy.sql` and
 * `supabase/migrations/20260712090000_catalogue_orders_payments.sql`,
 * because this environment has no Docker (so `supabase start` can't run
 * locally) and only a publishable key for the linked project — no access
 * token or DB password to apply migrations or run codegen against it. This
 * is NOT a verified-correct codegen output — regenerate it for real the
 * moment the migrations are applied:
 *
 *   npx supabase gen types typescript --project-id qwziuxkcbzrygmozqrad > src/types/database.ts
 *
 * and diff against this file before trusting it further. Every table below
 * corresponds 1:1 to a `create table` in one of those two migrations;
 * nothing here exists ahead of its migration.
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
      categories: {
        Row: {
          id: string;
          hostel_id: string;
          name: string;
          icon_url: string | null;
          sort_order: number;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hostel_id: string;
          name: string;
          icon_url?: string | null;
          sort_order?: number;
          is_hidden?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "categories_hostel_id_fkey";
            columns: ["hostel_id"];
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          hostel_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          image_url: string | null;
          price: number;
          cost_price: number | null;
          stock_qty: number;
          expiry_date: string | null;
          search_keywords: string[];
          available_from: string | null;
          available_until: string | null;
          status: Database["public"]["Enums"]["product_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hostel_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          image_url?: string | null;
          price: number;
          cost_price?: number | null;
          stock_qty?: number;
          expiry_date?: string | null;
          search_keywords?: string[];
          available_from?: string | null;
          available_until?: string | null;
          status?: Database["public"]["Enums"]["product_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "products_hostel_id_fkey";
            columns: ["hostel_id"];
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      stock_history: {
        Row: {
          id: string;
          product_id: string;
          delta: number;
          reason: Database["public"]["Enums"]["stock_change_reason"];
          order_id: string | null;
          actor_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          delta: number;
          reason: Database["public"]["Enums"]["stock_change_reason"];
          order_id?: string | null;
          actor_id?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["stock_history"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "stock_history_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_history_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_history_actor_id_fkey";
            columns: ["actor_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      customers: {
        Row: {
          id: string;
          hostel_id: string;
          phone: string;
          full_name: string;
          room_number: string | null;
          payment_flag_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hostel_id: string;
          phone: string;
          full_name: string;
          room_number?: string | null;
          payment_flag_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "customers_hostel_id_fkey";
            columns: ["hostel_id"];
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          hostel_id: string;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string;
          room_number: string | null;
          delivery_method: Database["public"]["Enums"]["delivery_method"];
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          delivery_fee: number;
          total: number;
          notes: string | null;
          cancelled_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hostel_id: string;
          customer_id?: string | null;
          customer_name: string;
          customer_phone: string;
          room_number?: string | null;
          delivery_method: Database["public"]["Enums"]["delivery_method"];
          status?: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          delivery_fee?: number;
          total: number;
          notes?: string | null;
          cancelled_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "orders_hostel_id_fkey";
            columns: ["hostel_id"];
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name_snapshot: string;
          unit_price_snapshot: number;
          quantity: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name_snapshot: string;
          unit_price_snapshot: number;
          quantity: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          claimed_amount: number;
          transaction_id: string | null;
          status: Database["public"]["Enums"]["payment_status"];
          rejected_reason:
            Database["public"]["Enums"]["payment_rejected_reason"] | null;
          verified_by: string | null;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          claimed_amount: number;
          transaction_id?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          rejected_reason?:
            Database["public"]["Enums"]["payment_rejected_reason"] | null;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_verified_by_fkey";
            columns: ["verified_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_screenshots: {
        Row: {
          id: string;
          payment_id: string;
          storage_path: string;
          perceptual_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_id: string;
          storage_path: string;
          perceptual_hash?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["payment_screenshots"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "payment_screenshots_payment_id_fkey";
            columns: ["payment_id"];
            referencedRelation: "payments";
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
      get_order_tracking: {
        Args: { p_order_id: string };
        Returns: {
          id: string;
          status: Database["public"]["Enums"]["order_status"];
          delivery_method: Database["public"]["Enums"]["delivery_method"];
          total: number;
          created_at: string;
          updated_at: string;
          payment_status: Database["public"]["Enums"]["payment_status"] | null;
        }[];
      };
    };
    Enums: {
      hostel_status: "open" | "closed" | "maintenance";
      device_platform: "web" | "ios" | "android";
      product_status: "active" | "hidden" | "deleted";
      stock_change_reason: "sale" | "restock" | "correction" | "expiry";
      delivery_method: "room_delivery" | "pickup";
      order_status:
        | "awaiting_verification"
        | "confirmed"
        | "preparing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled";
      payment_status: "pending" | "approved" | "rejected" | "refunded";
      payment_rejected_reason:
        "wrong_amount" | "duplicate" | "unreadable" | "other";
    };
    CompositeTypes: Record<string, never>;
  };
};
