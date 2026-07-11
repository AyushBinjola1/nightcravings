import { createClient } from "@/lib/supabase/server";
import { CURRENT_HOSTEL_SLUG } from "@/config/hostel";
import type { Database } from "@/types/database";

export type Hostel = Database["public"]["Tables"]["hostels"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Omit<
  Database["public"]["Tables"]["products"]["Row"],
  "cost_price"
>;

/** The one hostel this deployment serves (Stage 22 config, Phase 1). */
export async function getCurrentHostel(): Promise<Hostel | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hostels")
    .select("*")
    .eq("slug", CURRENT_HOSTEL_SLUG)
    .maybeSingle();

  if (error) {
    console.error("[catalogue] getCurrentHostel failed:", error.message);
    return null;
  }
  return data;
}

export async function getCategories(hostelId: string): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("hostel_id", hostelId)
    .eq("is_hidden", false)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[catalogue] getCategories failed:", error.message);
    return [];
  }
  return data;
}

export async function getProducts(
  hostelId: string,
  categoryId?: string,
): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(
      "id, hostel_id, category_id, name, description, image_url, price, stock_qty, expiry_date, search_keywords, available_from, available_until, status, created_at, updated_at",
    )
    .eq("hostel_id", hostelId)
    .eq("status", "active")
    .order("name", { ascending: true });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[catalogue] getProducts failed:", error.message);
    return [];
  }
  return data;
}
