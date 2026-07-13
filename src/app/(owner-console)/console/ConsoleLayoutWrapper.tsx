"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  BarChart3,
  MenuSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Command,
  Search,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useToastStore } from "@/stores/toast";
import { createClient } from "@/lib/supabase/client";

const NAVIGATION_ITEMS = [
  {
    name: "Dashboard",
    href: "/console/dashboard",
    icon: LayoutDashboard,
    shortcut: "D",
  },
  {
    name: "Order Queue",
    href: "/console/orders",
    icon: ShoppingBag,
    shortcut: "Q",
  },
  {
    name: "Analytics",
    href: "/console/analytics",
    icon: BarChart3,
    shortcut: "A",
  },
  {
    name: "Manage Menu",
    href: "/console/products",
    icon: MenuSquare,
    shortcut: "M",
  },
  {
    name: "Store Settings",
    href: "/console/settings",
    icon: Settings,
    shortcut: "S",
  },
];

export function ConsoleLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus the search field when the palette opens — an effect instead of
  // the `autoFocus` prop, since that attribute can steal focus on mount
  // regardless of how the element entered the page (jsx-a11y/no-autofocus).
  useEffect(() => {
    if (commandPaletteOpen) {
      searchInputRef.current?.focus();
    }
  }, [commandPaletteOpen]);

  // Handle Ctrl+K / Cmd+K global shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }

      // Additional letter shortcuts when command palette is closed
      if (!commandPaletteOpen && e.altKey) {
        const matchingItem = NAVIGATION_ITEMS.find(
          (item) => item.shortcut.toLowerCase() === e.key.toLowerCase(),
        );
        if (matchingItem) {
          e.preventDefault();
          router.push(matchingItem.href);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, router]);

  const handleSignOut = () => {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        useToastStore.getState().show(error.message, "danger");
        return;
      }
      useToastStore.getState().show("Signed out successfully", "success");
      router.push("/console/login");
      router.refresh();
    });
  };

  const filteredItems = NAVIGATION_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="bg-paper relative flex min-h-screen flex-col md:flex-row">
      {/* Mobile top bar */}
      <header className="border-border/60 bg-paper/95 sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3.5 backdrop-blur-md md:hidden">
        <Link
          href="/console/dashboard"
          className="font-display text-ink flex items-center gap-2 text-base font-bold"
        >
          <span className="bg-night text-paper rounded-lg p-1">
            <Sparkles size={14} />
          </span>
          NightCravings Console
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="text-ink-soft hover:bg-surface-2 cursor-pointer rounded-full p-2 transition-colors"
            aria-label="Open command palette"
          >
            <Command size={18} />
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="text-ink-soft hover:bg-surface-2 cursor-pointer rounded-full p-2 transition-colors"
            aria-label="Open sidebar menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar drawer backdrop (mobile only) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="bg-ink/40 fixed inset-0 z-40 backdrop-blur-[2px] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar navigation */}
      <aside
        className={cn(
          "border-border/60 bg-surface/30 md:bg-surface/20 fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r p-5 transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/console/dashboard"
            className="font-display text-ink flex items-center gap-2.5 text-lg font-bold"
          >
            <span className="bg-night text-paper shadow-night/20 rounded-xl p-1.5 shadow-md">
              <Sparkles size={16} />
            </span>
            NightCravings
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-ink-soft hover:bg-surface-2 cursor-pointer rounded-full p-1.5 transition-colors md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar routes */}
        <nav className="flex flex-1 flex-col gap-1.5">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group relative flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-night text-paper shadow-night/15 shadow-md"
                    : "text-ink-soft hover:text-ink hover:bg-surface-2/60",
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={cn(
                      "transition-transform group-hover:scale-105",
                      isActive
                        ? "text-paper"
                        : "text-ink-soft group-hover:text-night",
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                <span
                  className={cn(
                    "hidden rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider lg:inline-flex",
                    isActive
                      ? "border-paper/20 bg-paper/10 text-paper/80"
                      : "border-border/60 bg-surface-2/40 text-ink-soft group-hover:border-ink-soft/30 group-hover:text-ink",
                  )}
                >
                  Alt+{item.shortcut}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer info & Sign Out */}
        <div className="border-border/60 mt-auto flex flex-col gap-3 border-t pt-4">
          {/* Quick Command Palette Button */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="border-border/80 bg-paper/60 hover:bg-paper text-ink-soft hover:text-ink hidden w-full cursor-pointer items-center justify-between rounded-2xl border px-4 py-2.5 text-xs font-semibold shadow-sm transition-all md:flex"
          >
            <span className="flex items-center gap-2">
              <Search size={14} /> Command Palette
            </span>
            <kbd className="border-border/60 rounded border px-1.5 py-0.5 font-mono text-[9px]">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isPending}
            className="text-danger hover:bg-danger-soft/40 flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors"
          >
            <LogOut size={18} />
            <span>{isPending ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Main container */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1">{children}</main>
      </div>

      {/* Ctrl+K Command Palette Modal Overlay */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommandPaletteOpen(false)}
              className="bg-ink/50 fixed inset-0 backdrop-blur-[4px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="border-border/80 bg-paper/95 relative flex w-full max-w-lg flex-col gap-4 overflow-hidden rounded-3xl border p-4 shadow-2xl backdrop-blur-md"
            >
              <div className="border-border/60 bg-surface/40 focus-within:border-night focus-within:ring-night/10 flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all focus-within:ring-2">
                <Search size={18} className="text-ink-soft shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search console pages, options..."
                  className="text-ink placeholder:text-ink-soft/70 w-full bg-transparent text-sm font-semibold outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCommandPaletteOpen(false)}
                  className="border-border/60 bg-paper text-ink-soft cursor-pointer rounded border px-2 py-0.5 text-[10px] font-bold shadow-sm"
                >
                  ESC
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-ink-soft px-2 text-[10px] font-bold tracking-wider uppercase">
                  Navigation Shortcuts
                </span>
                {filteredItems.length === 0 ? (
                  <p className="text-ink-soft p-3 text-center text-xs">
                    No matching console page found
                  </p>
                ) : (
                  filteredItems.map((item) => (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => {
                        setCommandPaletteOpen(false);
                        router.push(item.href);
                      }}
                      className="hover:bg-surface-2/60 text-ink flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <item.icon size={16} className="text-ink-soft" />
                        <span>Go to {item.name}</span>
                      </span>
                      <ChevronRight size={14} className="text-ink-soft" />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
