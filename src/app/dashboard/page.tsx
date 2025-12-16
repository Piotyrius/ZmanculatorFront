"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthContext";

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Universal Garment Pattern Studio
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Start a new garment, or pick up where you left off.
            </p>
          </div>
        </header>

        <main className="grid gap-4 md:grid-cols-[2fr,1fr]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-sm font-semibold text-slate-200">
              Get started
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              The core workflow is simple: measurements → project → pattern →
              export.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-sky-400"
              >
                Start new garment
              </button>
              <button
                type="button"
                className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
              >
                Continue last project
              </button>
            </div>
          </section>

          <section className="space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <h2 className="text-sm font-semibold text-slate-200">
                Subscription
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Your current capabilities will appear here once the subscription
                API is wired.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}


