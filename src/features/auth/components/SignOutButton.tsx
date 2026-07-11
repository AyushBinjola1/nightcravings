"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { signOutStaff } from "@/server/actions/auth";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={isPending}
      onClick={() => startTransition(() => signOutStaff())}
      className="w-fit"
    >
      {isPending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
