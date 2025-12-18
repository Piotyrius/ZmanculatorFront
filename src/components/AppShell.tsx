"use client";

import { useEffect, useState } from "react";
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
  const [currentLocale, setCurrentLocale] = useState<'ka' | 'en'>('ka');

  // Get locale from cookie or default to Georgian
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookieLocale = document.cookie
        .split('; ')
        .find(row => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1] as 'ka' | 'en' | undefined;
      if (cookieLocale === 'ka' || cookieLocale === 'en') {
        setCurrentLocale(cookieLocale);
      }
    }
  }, []);

  const switchLocale = (newLocale: 'ka' | 'en') => {
    try {
      setCurrentLocale(newLocale);
      // Set cookie for next time
      if (typeof document !== 'undefined') {
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      }
      // Shop routes don't support locale prefixes, so redirect to locale home page
      // This ensures we go to a valid route
      window.location.href = `/${newLocale}`;
    } catch (error) {
      console.error('Error switching locale:', error);
      // Fallback: use window.location for reliable redirect
      if (typeof window !== 'undefined') {
        window.location.href = `/${newLocale}`;
      }
    }
  };

  useEffect(() => {
    // Only redirect if auth check is complete and user is not authenticated
    // Skip redirect for public pages (home, auth pages) to avoid loops
    if (!isLoading && !isAuthenticated && typeof window !== "undefined") {
      const isPublicPage = pathname === "/" || pathname.startsWith("/auth/") || pathname.startsWith("/ka/") || pathname.startsWith("/en/");
      if (!isPublicPage) {
        // Shop routes require authentication - redirect to locale-prefixed auth
        // Get locale from cookie or default to 'ka'
        const cookieLocale = document.cookie
          .split('; ')
          .find(row => row.startsWith('NEXT_LOCALE='))
          ?.split('=')[1];
        const locale = (cookieLocale === 'en' || cookieLocale === 'ka') ? cookieLocale : 'ka';
        window.location.href = `/${locale}/auth/login`;
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

        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
            <span className="text-xs text-slate-600">ენა:</span>
            <button
              onClick={() => switchLocale('ka')}
              className={`flex-1 rounded px-2 py-1 text-xs font-medium transition ${
                currentLocale === 'ka'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              ქართული
            </button>
            <button
              onClick={() => switchLocale('en')}
              className={`flex-1 rounded px-2 py-1 text-xs font-medium transition ${
                currentLocale === 'en'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              English
            </button>
          </div>
          {isAuthenticated && (
            <button
              onClick={logout}
              className="w-full rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600 shadow-sm"
            >
              Logout
            </button>
          )}
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden shadow-sm">
          <Link href="/catalog" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-sm font-bold">
              UG
            </div>
            <span className="text-sm font-semibold">Pattern Studio</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
              <button
                onClick={() => switchLocale('ka')}
                className={`rounded px-2 py-1 text-xs font-medium transition ${
                  currentLocale === 'ka'
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                ქართ
              </button>
              <button
                onClick={() => switchLocale('en')}
                className={`rounded px-2 py-1 text-xs font-medium transition ${
                  currentLocale === 'en'
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                EN
              </button>
            </div>
            {isAuthenticated && (
              <button
                onClick={logout}
                className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600 shadow-sm"
              >
                Logout
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 bg-slate-50 px-4 py-4 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}


