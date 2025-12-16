export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-sky-500/20 ring-1 ring-sky-500/60" />
            <div>
              <div className="text-sm font-semibold">
                Universal Garment Pattern Studio
              </div>
              <div className="text-xs text-slate-400">
                Draft, grade, and export production-ready blocks.
              </div>
            </div>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <a
              href="/auth/login"
              className="rounded-md px-3 py-1.5 text-slate-200 hover:bg-slate-800"
            >
              Sign in
            </a>
            <a
              href="/auth/register"
              className="rounded-md bg-sky-500 px-3 py-1.5 font-medium text-slate-950 shadow-sm hover:bg-sky-400"
            >
              Create account
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row">
        <section className="flex-1 space-y-4">
          <h1 className="text-3xl font-semibold md:text-4xl">
            Universal garment pattern construction, from measurement to export.
          </h1>
          <p className="max-w-xl text-sm text-slate-300">
            Manage measurement profiles, projects, drafting schools, and
            pattern generations in a single studio. Designed for production
            workflows, pattern engineers, and advanced makers.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/auth/register"
              className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm hover:bg-sky-400"
            >
              Create your workspace
            </a>
            <a
              href="/auth/login"
              className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
            >
              I already have an account
            </a>
          </div>
        </section>

        <section className="flex-1 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-sm font-semibold text-slate-200">
            Workflow overview
          </h2>
          <ol className="space-y-2 text-sm text-slate-300">
            <li>
              <span className="font-semibold text-sky-300">1.</span> Add
              measurement profiles for your body categories.
            </li>
            <li>
              <span className="font-semibold text-sky-300">2.</span> Create
              projects to organize garments and base blocks.
            </li>
            <li>
              <span className="font-semibold text-sky-300">3.</span> Select
              drafting schools, blocks, ease, and style transforms.
            </li>
            <li>
              <span className="font-semibold text-sky-300">4.</span> Generate
              patterns and export SVG/DXF/PDF for production.
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
