import type { Metadata } from "next";

import { StatusBar } from "@/features/catalogue/components/StatusBar";
import { CatalogueBrowser } from "@/features/catalogue/components/CatalogueBrowser";
import { DemandItemBar } from "@/features/catalogue/components/DemandItemBar";
import { CartWidget } from "@/features/cart";
import {
  getCategories,
  getCurrentHostel,
  getProducts,
} from "@/server/queries/catalogue";

export const metadata: Metadata = {
  title: "NightCravings",
};

/**
 * Phase 2 §1 Home — the shelf itself, not a marketing landing page.
 * Server Component: hostel/category/product data is fetched here and
 * handed to the client components that need interactivity
 * (CatalogueBrowser, CartWidget), per Phase 4 §12.
 */
export default async function HomePage() {
  const hostel = await getCurrentHostel();

  if (!hostel) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 py-16 text-center">
        <p className="text-accent font-mono text-xs tracking-[0.1em] uppercase">
          NightCravings
        </p>
        <h1 className="font-display text-ink mt-3 text-xl font-semibold">
          Store not found.
        </h1>
        <p className="text-ink-soft mt-2 text-sm">
          No hostel matches <code>{process.env.NEXT_PUBLIC_HOSTEL_SLUG}</code>{" "}
          yet — this is expected until the Stage 3 migrations are applied to the
          linked Supabase project (see README.md).
        </p>
      </main>
    );
  }

  const [categories, products] = await Promise.all([
    getCategories(hostel.id),
    getProducts(hostel.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-28">
      <div className="mb-4 flex flex-col gap-3">
        <StatusBar hostel={hostel} />
        <DemandItemBar supportPhone={hostel.support_phone} />
      </div>
      <CatalogueBrowser
        hostelId={hostel.id}
        categories={categories}
        products={products}
        supportPhone={hostel.support_phone}
      />
      <CartWidget
        deliveryFee={hostel.delivery_fee}
        freeDeliveryThreshold={hostel.free_delivery_threshold}
      />
    </main>
  );
}
