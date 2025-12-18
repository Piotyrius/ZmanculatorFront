'use client';

import Link from 'next/link';
import { useAuth } from '../lib/auth/AuthContext';

export default function Navigation() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">UG</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-50">
              Home
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800"
            >
              Dashboard
            </Link>
          )}

          {isAuthenticated ? (
            <button
              onClick={logout}
              className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-red-500"
            >
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="rounded-md px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="rounded-md bg-sky-500 px-4 py-1.5 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-sky-400"
              >
                Create account
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

