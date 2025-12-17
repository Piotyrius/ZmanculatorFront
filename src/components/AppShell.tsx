"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../lib/auth/AuthContext";

const navItems = [
  { href: "/catalog", label: "Catalog" },
  { href: "/projects", label: "Projects" },
  { href: "/measurements", label: "Measurements" },
  { href: "/profiles", label: "Profiles" },
  { href: "/account", label: "Account" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    // Only redirect if auth check is complete and user is not authenticated
    // Skip redirect for public pages (home, auth pages) to avoid loops
    if (!isLoading && !isAuthenticated && typeof window !== "undefined") {
      const isPublicPage = pathname === "/" || pathname.startsWith("/auth/");
      if (!isPublicPage) {
        // Shop routes require authentication
        router.replace("/auth/login");
      }
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-900">
        <div className="text-sm text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="hidden w-60 border-r border-slate-200 bg-white px-4 py-6 md:flex md:flex-col shadow-sm">
        <Link href="/catalog" className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-sm font-bold">
            UG
          </div>
          <div className="text-sm font-semibold leading-tight">
            Pattern Studio
          </div>
        </Link>

        <nav className="flex-1 space-y-1 text-sm">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-md px-3 py-2 transition ${
                  active
                    ? "bg-sky-50 text-sky-600 font-medium"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {isAuthenticated && (
          <button
            onClick={logout}
            className="mt-4 rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600 shadow-sm"
          >
            Logout
          </button>
        )}
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden shadow-sm">
          <Link href="/catalog" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-sm font-bold">
              UG
            </div>
            <span className="text-sm font-semibold">Pattern Studio</span>
          </Link>
          {isAuthenticated && (
            <button
              onClick={logout}
              className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600 shadow-sm"
            >
              Logout
            </button>
          )}
        </header>

        <main className="flex-1 bg-slate-50 px-4 py-4 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}


