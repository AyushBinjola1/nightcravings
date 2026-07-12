import { HeaderBar } from "@/features/navigation/components/HeaderBar";
import { getCurrentHostel } from "@/server/queries/catalogue";

/**
 * Shared across Home, Checkout, Payment, and Orders — see `HeaderBar`'s
 * own comment for why this exists beyond what Phase 2 §1 specifies for
 * Home alone. Fetches the hostel once per navigation so every screen can
 * reach Support without re-fetching it itself.
 */
export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hostel = await getCurrentHostel();

  return (
    <>
      <HeaderBar supportPhone={hostel?.support_phone ?? null} />
      {children}
    </>
  );
}
