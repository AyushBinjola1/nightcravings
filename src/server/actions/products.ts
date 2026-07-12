"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { actionError, actionOk, type ActionResult } from "@/lib/result";
import {
  adjustStockSchema,
  createProductSchema,
  updateProductSchema,
} from "@/lib/zod-schemas/products";

async function runProductAction<T>(
  fn: () => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    const result = await fn();
    if (result.success) revalidatePath("/console/products");
    return result;
  } catch (error) {
    console.error("[products] unexpected failure:", error);
    return actionError("Something went wrong — please try again.");
  }
}

/** Phase 3 §5 — RLS (`products_write_staff`, requires `products.write`)
 * is the real authorization check here; this action just shapes the
 * insert. Initial `stock_qty` is set directly on creation — only
 * *changes* to an existing product's stock go through `stock_history`
 * (see `adjustStock` below), matching the same precedent the catalogue's
 * own seed migration already set. */
export async function createProduct(
  hostelId: string,
  input: unknown,
): Promise<ActionResult<{ productId: string }>> {
  return runProductAction(async () => {
    const parsed = createProductSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid product");
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .insert({
        hostel_id: hostelId,
        category_id: parsed.data.categoryId,
        name: parsed.data.name,
        description: parsed.data.description || null,
        price: parsed.data.price,
        stock_qty: parsed.data.stockQty,
        image_url: parsed.data.imageUrl || null,
      })
      .select("id")
      .single();

    if (error || !data) {
      return actionError(error?.message ?? "Could not create product");
    }

    return actionOk({ productId: data.id });
  });
}

export async function updateProduct(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  return runProductAction(async () => {
    const parsed = updateProductSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid product");
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({
        category_id: parsed.data.categoryId,
        name: parsed.data.name,
        description: parsed.data.description || null,
        price: parsed.data.price,
        image_url: parsed.data.imageUrl || null,
      })
      .eq("id", parsed.data.productId);

    if (error) return actionError(error.message);
    return actionOk({ ok: true });
  });
}

/** The only sanctioned way to change `stock_qty` post-creation — an
 * insert into the append-only `stock_history` log, whose trigger applies
 * the delta (Phase 4 §3). A direct `update products set stock_qty = ...`
 * would bypass that ledger entirely. */
export async function adjustStock(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  return runProductAction(async () => {
    const parsed = adjustStockSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message ?? "Invalid request");
    }

    const supabase = await createClient();
    const { error } = await supabase.from("stock_history").insert({
      product_id: parsed.data.productId,
      delta: parsed.data.delta,
      reason: "correction",
    });

    if (error) return actionError(error.message);
    return actionOk({ ok: true });
  });
}

/** "Remove from menu" is a status flip to `hidden`, never a hard
 * DELETE — `order_items.product_id` restricts deleting a product any
 * past order still references, and hiding is reversible besides. */
export async function setProductHidden(
  productId: string,
  hidden: boolean,
): Promise<ActionResult<{ ok: true }>> {
  return runProductAction(async () => {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({ status: hidden ? "hidden" : "active" })
      .eq("id", productId);

    if (error) return actionError(error.message);
    return actionOk({ ok: true });
  });
}
