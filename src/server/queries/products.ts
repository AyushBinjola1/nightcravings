import { createClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/server/queries/catalogue";

/**
 * Phase 3 §5 — Product Management's own read path: every product
 * regardless of `status` (the public `getProducts` in
 * `server/queries/catalogue.ts` only shows `active`, by design — staff
 * need to see hidden items too, to bring them back). Relies on
 * `products_select_staff`'s `is_staff_of` RLS policy rather than the
 * public `status = 'active'` one; `cost_price` stays excluded here too,
 * same as the public type, since this screen doesn't manage margins.
 */
export async function getProductsForStaff(
  hostelId: string,
): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, hostel_id, category_id, name, description, image_url, price, stock_qty, expiry_date, search_keywords, available_from, available_until, status, created_at, updated_at",
    )
    .eq("hostel_id", hostelId)
    .order("name", { ascending: true });

  if (error) {
    console.error("[products] getProductsForStaff failed:", error.message);
    return [];
  }
  return data;
}

/** Same as `getCategories` in catalogue.ts but including hidden ones —
 * staff assigning a product to a category need every category to pick
 * from, not just the ones currently shown to customers. */
export async function getCategoriesForStaff(
  hostelId: string,
): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("hostel_id", hostelId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[products] getCategoriesForStaff failed:", error.message);
    return [];
  }
  return data;
}
