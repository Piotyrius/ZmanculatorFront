 'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function Home() {
  const locale = useLocale();
  const t = useTranslations('home');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 lg:py-16">
        {/* Hero section */}
        <section className="flex flex-col items-start gap-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-5">
            <p className="inline-flex items-center rounded-full border border-sky-500/40 bg-slate-900/60 px-3 py-1 text-xs font-medium text-sky-300">
              Universal garment pattern studio
            </p>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl">
              {t('title')}
            </h1>
            <p className="max-w-xl text-sm text-slate-300 md:text-base">
              {t('description')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/auth/register`}
                className="rounded-md bg-sky-500 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-sky-400"
              >
                {t('createWorkspace')}
              </Link>
              <Link
                href={`/${locale}/auth/login`}
                className="rounded-md border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
              >
                {t('alreadyHaveAccount')}
              </Link>
            </div>
          </div>

          <div className="flex-1">
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-4 shadow-xl">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-3">
                  <div className="relative h-32 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80">
                    <Image
                      src="/images/clothing/placeholders/garment-placeholder.svg"
                      alt="Garment pattern preview"
                      fill
                      className="object-cover object-center opacity-80"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                    <div className="rounded-lg border border-slate-800 bg-slate-900/80 px-2 py-2">
                      <div className="text-[10px] uppercase text-slate-500">
                        Profiles
                      </div>
                      <div className="mt-1 font-medium">Measurements</div>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-900/80 px-2 py-2">
                      <div className="text-[10px] uppercase text-slate-500">
                        Projects
                      </div>
                      <div className="mt-1 font-medium">Blocks</div>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-900/80 px-2 py-2">
                      <div className="text-[10px] uppercase text-slate-500">
                        Output
                      </div>
                      <div className="mt-1 font-medium">SVG / DXF / PDF</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 text-[11px] text-slate-300">
                  <div className="rounded-lg border border-slate-800 bg-slate-900/80 px-2 py-2">
                    <div className="text-[10px] uppercase text-slate-500">
                      Categories
                    </div>
                    <ul className="mt-1 space-y-0.5">
                      <li>Womenswear</li>
                      <li>Menswear</li>
                      <li>Childrenswear</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/80 px-2 py-2">
                    <div className="text-[10px] uppercase text-slate-500">
                      Flow
                    </div>
                    <p className="mt-1 text-[11px]">
                      {t('workflowOverview')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities section */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-100">
            Key capabilities
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <h3 className="text-sm font-semibold text-slate-100">
                Measurement profiles
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Organize detailed body measurements by category and reuse them
                across garments and blocks.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <h3 className="text-sm font-semibold text-slate-100">
                Projects & blocks
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Structure work into projects, connect drafting schools, base
                blocks, and rule graphs in one workspace.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <h3 className="text-sm font-semibold text-slate-100">
                Production exports
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Generate ready-to-use SVG, DXF, and PDF exports for downstream
                CAD and manufacturing pipelines.
              </p>
            </div>
          </div>
        </section>

        {/* Visual gallery / categories */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-100">
            Built for real garment categories
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="relative mb-3 h-28 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                <Image
                  src="/images/clothing/categories/womenswear.svg"
                  alt="Womenswear"
                  fill
                  className="object-contain p-4"
                />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">
                Womenswear
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Create precise womenswear blocks tailored to your measurement
                profiles and drafting schools.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="relative mb-3 h-28 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                <Image
                  src="/images/clothing/categories/menswear.svg"
                  alt="Menswear"
                  fill
                  className="object-contain p-4"
                />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">
                Menswear
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Manage menswear pattern projects with consistent sizing systems
                and ease profiles.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="relative mb-3 h-28 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                <Image
                  src="/images/clothing/categories/childrenswear.svg"
                  alt="Childrenswear"
                  fill
                  className="object-contain p-4"
                />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">
                Childrenswear
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Support growing-size ranges and specialized blocks for
                childrenswear collections.
              </p>
            </div>
          </div>
        </section>

        {/* How it works timeline */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-slate-100">
            {t('workflowOverview')}
          </h2>
          <ol className="grid gap-3 text-sm text-slate-300 md:grid-cols-4">
            <li className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-xs font-semibold text-sky-300">1</span>
              <p className="mt-2 text-sm">{t('step1')}</p>
            </li>
            <li className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-xs font-semibold text-sky-300">2</span>
              <p className="mt-2 text-sm">{t('step2')}</p>
            </li>
            <li className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-xs font-semibold text-sky-300">3</span>
              <p className="mt-2 text-sm">{t('step3')}</p>
            </li>
            <li className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-xs font-semibold text-sky-300">4</span>
              <p className="mt-2 text-sm">{t('step4')}</p>
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}

