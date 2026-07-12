import type { Metadata } from "next";

import { BackLink } from "@/components/ui/back-link";
import { ProductManager } from "@/features/products";
import { getCurrentHostel } from "@/server/queries/catalogue";
import {
  getCategoriesForStaff,
  getProductsForStaff,
} from "@/server/queries/products";

export const metadata: Metadata = {
  title: "Manage Menu — NightCravings Owner Console",
};

/** Phase 3 §5 — Product Management: add, edit, hide, and adjust stock
 * for the live menu. */
export default async function ProductsPage() {
  const hostel = await getCurrentHostel();

  if (!hostel) {
    return (
      <main className="text-ink-soft mx-auto max-w-xl px-6 py-16 text-center text-sm">
        Store not found — apply the Stage 3 migrations first (see README.md).
      </main>
    );
  }

  const [categories, products] = await Promise.all([
    getCategoriesForStaff(hostel.id),
    getProductsForStaff(hostel.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6">
      <BackLink href="/console/dashboard" label="Dashboard" />
      <h1 className="font-display text-ink mb-4 text-xl font-semibold">
        Manage Menu
      </h1>
      <ProductManager
        hostelId={hostel.id}
        categories={categories}
        products={products}
      />
    </main>
  );
}
