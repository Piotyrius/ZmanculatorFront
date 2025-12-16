'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth/AuthContext';
import Link from 'next/link';

export default function Navigation() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  const switchLocale = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">UG</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-50">
              {t('home')}
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          {isAuthenticated && (
            <Link
              href={`/${locale}/dashboard`}
              className="rounded-md px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800"
            >
              {t('projects')}
            </Link>
          )}

          <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
            <button
              onClick={() => switchLocale('en')}
              className={`rounded-md px-2 py-1 text-xs font-medium transition ${
                locale === 'en'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => switchLocale('ka')}
              className={`rounded-md px-2 py-1 text-xs font-medium transition ${
                locale === 'ka'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              GE
            </button>
          </div>

          {isAuthenticated ? (
            <button
              onClick={logout}
              className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-red-500"
            >
              {t('logout')}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/auth/login`}
                className="rounded-md px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800"
              >
                {t('login')}
              </Link>
              <Link
                href={`/${locale}/auth/register`}
                className="rounded-md bg-sky-500 px-4 py-1.5 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-sky-400"
              >
                {t('createAccount')}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

