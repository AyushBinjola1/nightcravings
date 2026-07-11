import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NightCravings",
  description: "The premium late-night convenience store inside every hostel.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f0" },
    { media: "(prefers-color-scheme: dark)", color: "#171310" },
  ],
};

/**
 * Applies a saved theme preference before first paint so a returning user
 * never sees a flash of the wrong theme. Reads `localStorage` only — no
 * network, no external script, safe to run inline and blocking.
 */
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("nightcravings-theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (_) {
    /* localStorage unavailable (private mode, disabled storage) — fall back
       to the OS-level prefers-color-scheme already handled in globals.css */
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-body flex min-h-full flex-col">{children}</body>
    </html>
  );
}
