"use client";

export default function AccountPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Account</h1>
      <p className="text-sm text-slate-600">
        Manage your profile, organizations, API tokens, and subscription
        capabilities. Backend wiring for these sections can be added on demand.
      </p>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Profile
        </h2>
        <p className="text-xs text-slate-600">
          Display basic user info from the backend once the profile endpoint is
          exposed.
        </p>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Organizations
        </h2>
        <p className="text-xs text-slate-600">
          Organization membership and management UI will surface here using the
          existing organization endpoints.
        </p>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          API tokens
        </h2>
        <p className="text-xs text-slate-600">
          List and manage API tokens created for programmatic access.
        </p>
      </section>
    </div>
  );
}

