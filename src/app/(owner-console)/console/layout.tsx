"use client";

import { usePathname } from "next/navigation";
import { ConsoleLayoutWrapper } from "./ConsoleLayoutWrapper";

export default function ConsoleRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/console/login") {
    return <>{children}</>;
  }

  return <ConsoleLayoutWrapper>{children}</ConsoleLayoutWrapper>;
}
