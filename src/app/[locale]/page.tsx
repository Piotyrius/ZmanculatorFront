import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { locales } from '../../i18n/request';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('home');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row">
        <section className="flex-1 space-y-4">
          <h1 className="text-3xl font-semibold md:text-4xl">
            {t('title')}
          </h1>
          <p className="max-w-xl text-sm text-slate-300">
            {t('description')}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/auth/register`}
              className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-sky-400"
            >
              {t('createWorkspace')}
            </Link>
            <Link
              href={`/${locale}/auth/login`}
              className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
            >
              {t('alreadyHaveAccount')}
            </Link>
          </div>
        </section>

        <section className="flex-1 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-sm font-semibold text-slate-200">
            {t('workflowOverview')}
          </h2>
          <ol className="space-y-2 text-sm text-slate-300">
            <li>
              <span className="font-semibold text-sky-300">1.</span> {t('step1')}
            </li>
            <li>
              <span className="font-semibold text-sky-300">2.</span> {t('step2')}
            </li>
            <li>
              <span className="font-semibold text-sky-300">3.</span> {t('step3')}
            </li>
            <li>
              <span className="font-semibold text-sky-300">4.</span> {t('step4')}
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}

