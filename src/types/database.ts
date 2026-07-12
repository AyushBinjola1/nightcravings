/**
 * Real generated output — `npx supabase gen types typescript --project-id
 * qwziuxkcbzrygmozqrad`, run against the actual linked project after all
 * 16 migrations were applied via `supabase db push`. This replaces the
 * hand-authored version that stood in for it while the migrations were
 * unapplied (see git history on this file). Regenerate the same way after
 * any future schema change; do not hand-edit.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          hostel_id: string;
          icon_url: string | null;
          id: string;
          is_hidden: boolean;
          name: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          hostel_id: string;
          icon_url?: string | null;
          id?: string;
          is_hidden?: boolean;
          name: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          hostel_id?: string;
          icon_url?: string | null;
          id?: string;
          is_hidden?: boolean;
          name?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
        ];
      };
      customers: {
        Row: {
          created_at: string;
          full_name: string;
          hostel_id: string;
          id: string;
          payment_flag_count: number;
          phone: string;
          room_number: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          full_name: string;
          hostel_id: string;
          id?: string;
          payment_flag_count?: number;
          phone: string;
          room_number?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string;
          hostel_id?: string;
          id?: string;
          payment_flag_count?: number;
          phone?: string;
          room_number?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customers_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
        ];
      };
      devices: {
        Row: {
          created_at: string;
          id: string;
          last_seen_at: string;
          platform: Database["public"]["Enums"]["device_platform"];
          profile_id: string;
          push_token: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          last_seen_at?: string;
          platform: Database["public"]["Enums"]["device_platform"];
          profile_id: string;
          push_token: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          last_seen_at?: string;
          platform?: Database["public"]["Enums"]["device_platform"];
          profile_id?: string;
          push_token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "devices_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      hostels: {
        Row: {
          closing_time: string | null;
          created_at: string;
          delivery_fee: number;
          free_delivery_threshold: number;
          id: string;
          name: string;
          opening_time: string | null;
          slug: string;
          status: Database["public"]["Enums"]["hostel_status"];
          support_phone: string | null;
          updated_at: string;
          upi_id_secret_id: string | null;
          upi_number_secret_id: string | null;
          upi_qr_url: string | null;
        };
        Insert: {
          closing_time?: string | null;
          created_at?: string;
          delivery_fee?: number;
          free_delivery_threshold?: number;
          id?: string;
          name: string;
          opening_time?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["hostel_status"];
          support_phone?: string | null;
          updated_at?: string;
          upi_id_secret_id?: string | null;
          upi_number_secret_id?: string | null;
          upi_qr_url?: string | null;
        };
        Update: {
          closing_time?: string | null;
          created_at?: string;
          delivery_fee?: number;
          free_delivery_threshold?: number;
          id?: string;
          name?: string;
          opening_time?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["hostel_status"];
          support_phone?: string | null;
          updated_at?: string;
          upi_id_secret_id?: string | null;
          upi_number_secret_id?: string | null;
          upi_qr_url?: string | null;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name_snapshot: string;
          quantity: number;
          unit_price_snapshot: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_name_snapshot: string;
          quantity: number;
          unit_price_snapshot: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          product_name_snapshot?: string;
          quantity?: number;
          unit_price_snapshot?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          cancelled_reason: string | null;
          created_at: string;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string;
          delivery_fee: number;
          delivery_method: Database["public"]["Enums"]["delivery_method"];
          hostel_id: string;
          id: string;
          notes: string | null;
          room_number: string | null;
          status: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          updated_at: string;
        };
        Insert: {
          cancelled_reason?: string | null;
          created_at?: string;
          customer_id?: string | null;
          customer_name: string;
          customer_phone: string;
          delivery_fee?: number;
          delivery_method: Database["public"]["Enums"]["delivery_method"];
          hostel_id: string;
          id?: string;
          notes?: string | null;
          room_number?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal: number;
          total: number;
          updated_at?: string;
        };
        Update: {
          cancelled_reason?: string | null;
          created_at?: string;
          customer_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          delivery_fee?: number;
          delivery_method?: Database["public"]["Enums"]["delivery_method"];
          hostel_id?: string;
          id?: string;
          notes?: string | null;
          room_number?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal?: number;
          total?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_screenshots: {
        Row: {
          created_at: string;
          id: string;
          payment_id: string;
          perceptual_hash: string | null;
          storage_path: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          payment_id: string;
          perceptual_hash?: string | null;
          storage_path: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          payment_id?: string;
          perceptual_hash?: string | null;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_screenshots_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          claimed_amount: number;
          created_at: string;
          id: string;
          order_id: string;
          rejected_reason:
            Database["public"]["Enums"]["payment_rejected_reason"] | null;
          status: Database["public"]["Enums"]["payment_status"];
          transaction_id: string | null;
          updated_at: string;
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          claimed_amount: number;
          created_at?: string;
          id?: string;
          order_id: string;
          rejected_reason?:
            Database["public"]["Enums"]["payment_rejected_reason"] | null;
          status?: Database["public"]["Enums"]["payment_status"];
          transaction_id?: string | null;
          updated_at?: string;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          claimed_amount?: number;
          created_at?: string;
          id?: string;
          order_id?: string;
          rejected_reason?:
            Database["public"]["Enums"]["payment_rejected_reason"] | null;
          status?: Database["public"]["Enums"]["payment_status"];
          transaction_id?: string | null;
          updated_at?: string;
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: true;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      permissions: {
        Row: {
          action: string;
          description: string;
          id: string;
        };
        Insert: {
          action: string;
          description: string;
          id?: string;
        };
        Update: {
          action?: string;
          description?: string;
          id?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          available_from: string | null;
          available_until: string | null;
          category_id: string | null;
          cost_price: number | null;
          created_at: string;
          description: string | null;
          expiry_date: string | null;
          hostel_id: string;
          id: string;
          image_url: string | null;
          name: string;
          price: number;
          search_keywords: string[];
          status: Database["public"]["Enums"]["product_status"];
          stock_qty: number;
          updated_at: string;
        };
        Insert: {
          available_from?: string | null;
          available_until?: string | null;
          category_id?: string | null;
          cost_price?: number | null;
          created_at?: string;
          description?: string | null;
          expiry_date?: string | null;
          hostel_id: string;
          id?: string;
          image_url?: string | null;
          name: string;
          price: number;
          search_keywords?: string[];
          status?: Database["public"]["Enums"]["product_status"];
          stock_qty?: number;
          updated_at?: string;
        };
        Update: {
          available_from?: string | null;
          available_until?: string | null;
          category_id?: string | null;
          cost_price?: number | null;
          created_at?: string;
          description?: string | null;
          expiry_date?: string | null;
          hostel_id?: string;
          id?: string;
          image_url?: string | null;
          name?: string;
          price?: number;
          search_keywords?: string[];
          status?: Database["public"]["Enums"]["product_status"];
          stock_qty?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
        ];
      };
      profile_roles: {
        Row: {
          created_at: string;
          hostel_id: string;
          id: string;
          profile_id: string;
          role_id: string;
        };
        Insert: {
          created_at?: string;
          hostel_id: string;
          id?: string;
          profile_id: string;
          role_id: string;
        };
        Update: {
          created_at?: string;
          hostel_id?: string;
          id?: string;
          profile_id?: string;
          role_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_roles_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_roles_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_roles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string | null;
          hostel_id: string | null;
          id: string;
          payment_flag_count: number;
          phone: string | null;
          room_number: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          hostel_id?: string | null;
          id: string;
          payment_flag_count?: number;
          phone?: string | null;
          room_number?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          hostel_id?: string | null;
          id?: string;
          payment_flag_count?: number;
          phone?: string | null;
          room_number?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_hostel_id_fkey";
            columns: ["hostel_id"];
            isOneToOne: false;
            referencedRelation: "hostels";
            referencedColumns: ["id"];
          },
        ];
      };
      role_permissions: {
        Row: {
          permission_id: string;
          role_id: string;
        };
        Insert: {
          permission_id: string;
          role_id: string;
        };
        Update: {
          permission_id?: string;
          role_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      roles: {
        Row: {
          description: string;
          id: string;
          slug: string;
        };
        Insert: {
          description: string;
          id?: string;
          slug: string;
        };
        Update: {
          description?: string;
          id?: string;
          slug?: string;
        };
        Relationships: [];
      };
      stock_history: {
        Row: {
          actor_id: string | null;
          created_at: string;
          delta: number;
          id: string;
          order_id: string | null;
          product_id: string;
          reason: Database["public"]["Enums"]["stock_change_reason"];
        };
        Insert: {
          actor_id?: string | null;
          created_at?: string;
          delta: number;
          id?: string;
          order_id?: string | null;
          product_id: string;
          reason: Database["public"]["Enums"]["stock_change_reason"];
        };
        Update: {
          actor_id?: string | null;
          created_at?: string;
          delta?: number;
          id?: string;
          order_id?: string | null;
          product_id?: string;
          reason?: Database["public"]["Enums"]["stock_change_reason"];
        };
        Relationships: [
          {
            foreignKeyName: "stock_history_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_history_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_history_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_hostel_payment_info: {
        Args: { p_hostel_id: string };
        Returns: {
          upi_id: string;
          upi_number: string;
          upi_qr_url: string;
        }[];
      };
      get_order_tracking: {
        Args: { p_order_id: string };
        Returns: {
          created_at: string;
          delivery_method: Database["public"]["Enums"]["delivery_method"];
          id: string;
          payment_status: Database["public"]["Enums"]["payment_status"];
          status: Database["public"]["Enums"]["order_status"];
          total: number;
          updated_at: string;
        }[];
      };
      get_payment_for_order: {
        Args: { p_order_id: string };
        Returns: {
          claimed_amount: number;
          id: string;
          status: Database["public"]["Enums"]["payment_status"];
        }[];
      };
      get_revenue_by_day: {
        Args: { p_days?: number; p_hostel_id: string };
        Returns: {
          day: string;
          order_count: number;
          revenue: number;
        }[];
      };
      get_top_products: {
        Args: { p_hostel_id: string; p_limit?: number };
        Returns: {
          product_name: string;
          total_quantity: number;
        }[];
      };
      has_permission: {
        Args: { perm_action: string; target_hostel: string };
        Returns: boolean;
      };
      is_staff_of: { Args: { target_hostel: string }; Returns: boolean };
      owns_row: { Args: { owner_id: string }; Returns: boolean };
      set_hostel_upi_details: {
        Args: { p_hostel_id: string; p_upi_id: string; p_upi_number: string };
        Returns: undefined;
      };
      submit_transaction_id: {
        Args: { p_order_id: string; p_transaction_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      delivery_method: "room_delivery" | "pickup";
      device_platform: "web" | "ios" | "android";
      hostel_status: "open" | "closed" | "maintenance";
      order_status:
        | "awaiting_verification"
        | "confirmed"
        | "preparing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled";
      payment_rejected_reason:
        "wrong_amount" | "duplicate" | "unreadable" | "other";
      payment_status: "pending" | "approved" | "rejected" | "refunded";
      product_status: "active" | "hidden" | "deleted";
      stock_change_reason: "sale" | "restock" | "correction" | "expiry";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      delivery_method: ["room_delivery", "pickup"],
      device_platform: ["web", "ios", "android"],
      hostel_status: ["open", "closed", "maintenance"],
      order_status: [
        "awaiting_verification",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      payment_rejected_reason: [
        "wrong_amount",
        "duplicate",
        "unreadable",
        "other",
      ],
      payment_status: ["pending", "approved", "rejected", "refunded"],
      product_status: ["active", "hidden", "deleted"],
      stock_change_reason: ["sale", "restock", "correction", "expiry"],
    },
  },
} as const;
