"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeSelector } from "@/components/theme-provider";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/add", label: "Add Concert" },
  { href: "/concerts", label: "My Concerts" },
  { href: "/compare", label: "Compare" },
];

export function AppShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-md px-4 lg:px-8">
        <div className="flex-1 flex flex-col items-start gap-0.5">
          <span className="text-lg font-bold tracking-tight">
            Concert Cost Tracker
          </span>
          <span className="text-xs opacity-70 hidden sm:inline">
            Track shows, spending, and how much fun you had
          </span>
        </div>
        <div className="flex-none flex items-center gap-2 sm:gap-3">
          <ThemeSelector />
          <div className="hidden md:flex flex-col items-end text-xs">
            <span className="opacity-60">Signed in</span>
            <span className="font-medium max-w-[12rem] truncate">{email}</span>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>

      <div className="px-4 lg:px-8 pt-4">
        <div role="tablist" className="tabs tabs-boxed bg-base-100 w-fit max-w-full overflow-x-auto">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                role="tab"
                className={`tab ${active ? "tab-active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <main className="px-4 lg:px-8 py-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
