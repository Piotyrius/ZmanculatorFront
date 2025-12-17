"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-sm font-bold">
              UG
            </div>
            <span className="text-sm font-semibold">Pattern Studio</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="rounded-md px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="rounded-md bg-sky-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 lg:py-16">
        {/* Hero section */}
        <section className="flex flex-col items-start gap-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-5">
            <p className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-600">
              Universal garment pattern studio
            </p>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl text-slate-900">
              Universal garment pattern construction, from measurement to export.
            </h1>
            <p className="max-w-xl text-sm text-slate-600 md:text-base">
              Manage measurement profiles, projects, drafting schools, and pattern
              generations in a single studio. Designed for production workflows,
              pattern engineers, and advanced makers.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="rounded-md bg-sky-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600"
              >
                Create your workspace
              </Link>
              <Link
                href="/auth/login"
                className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:border-slate-400"
              >
                I already have an account
              </Link>
            </div>
          </div>

          <div className="flex-1">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-lg">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-3">
                  <div className="relative h-32 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <Image
                      src="/images/clothing/placeholders/garment-placeholder.svg"
                      alt="Garment pattern preview"
                      fill
                      className="object-cover object-center opacity-80"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-700">
                    <div className="rounded-lg border border-slate-200 bg-white px-2 py-2 shadow-sm">
                      <div className="text-[10px] uppercase text-slate-500">
                        Profiles
                      </div>
                      <div className="mt-1 font-medium">Measurements</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white px-2 py-2 shadow-sm">
                      <div className="text-[10px] uppercase text-slate-500">
                        Projects
                      </div>
                      <div className="mt-1 font-medium">Blocks</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white px-2 py-2 shadow-sm">
                      <div className="text-[10px] uppercase text-slate-500">
                        Output
                      </div>
                      <div className="mt-1 font-medium">SVG / DXF / PDF</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 text-[11px] text-slate-700">
                  <div className="rounded-lg border border-slate-200 bg-white px-2 py-2 shadow-sm">
                    <div className="text-[10px] uppercase text-slate-500">
                      Categories
                    </div>
                    <ul className="mt-1 space-y-0.5">
                      <li>Womenswear</li>
                      <li>Menswear</li>
                      <li>Childrenswear</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-2 py-2 shadow-sm">
                    <div className="text-[10px] uppercase text-slate-500">
                      Flow
                    </div>
                    <p className="mt-1 text-[11px]">Workflow overview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities section */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Key capabilities
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Measurement profiles
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Organize detailed body measurements by category and reuse them
                across garments and blocks.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Projects & blocks
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Structure work into projects, connect drafting schools, base
                blocks, and rule graphs in one workspace.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Production exports
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Generate ready-to-use SVG, DXF, and PDF exports for downstream
                CAD and manufacturing pipelines.
              </p>
            </div>
          </div>
        </section>

        {/* Visual gallery / categories */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Built for real garment categories
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="relative mb-3 h-28 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <Image
                  src="/images/clothing/categories/womenswear.svg"
                  alt="Womenswear"
                  fill
                  className="object-contain p-4"
                />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Womenswear
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Create precise womenswear blocks tailored to your measurement
                profiles and drafting schools.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="relative mb-3 h-28 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <Image
                  src="/images/clothing/categories/menswear.svg"
                  alt="Menswear"
                  fill
                  className="object-contain p-4"
                />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Menswear
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Manage menswear pattern projects with consistent sizing systems
                and ease profiles.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="relative mb-3 h-28 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <Image
                  src="/images/clothing/categories/childrenswear.svg"
                  alt="Childrenswear"
                  fill
                  className="object-contain p-4"
                />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Childrenswear
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Support growing-size ranges and specialized blocks for
                childrenswear collections.
              </p>
            </div>
          </div>
        </section>

        {/* How it works timeline */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Workflow overview
          </h2>
          <ol className="grid gap-3 text-sm text-slate-700 md:grid-cols-4">
            <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-xs font-semibold text-sky-600">1</span>
              <p className="mt-2 text-sm">
                Add measurement profiles for your body categories.
              </p>
            </li>
            <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-xs font-semibold text-sky-600">2</span>
              <p className="mt-2 text-sm">
                Create projects to organize garments and base blocks.
              </p>
            </li>
            <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-xs font-semibold text-sky-600">3</span>
              <p className="mt-2 text-sm">
                Select drafting schools, blocks, ease, and style transforms.
              </p>
            </li>
            <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-xs font-semibold text-sky-600">4</span>
              <p className="mt-2 text-sm">
                Generate patterns and export SVG/DXF/PDF for production.
              </p>
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
