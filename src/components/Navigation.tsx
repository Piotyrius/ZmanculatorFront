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
    try {
      // Get the current pathname without locale prefix
      let pathWithoutLocale = pathname;
      
      // Remove locale prefix if it exists
      if (pathname.startsWith(`/${locale}/`)) {
        pathWithoutLocale = pathname.replace(`/${locale}/`, '/');
      } else if (pathname === `/${locale}`) {
        pathWithoutLocale = '/';
      }
      
      // List of valid locale routes that exist
      const validLocaleRoutes = ['', '/dashboard', '/auth/login', '/auth/register'];
      
      // Only try to preserve route if it's a known valid route
      const isValidRoute = validLocaleRoutes.includes(pathWithoutLocale) || 
                          pathWithoutLocale.startsWith('/dashboard/') ||
                          pathWithoutLocale.startsWith('/auth/');
      
      if (isValidRoute && pathWithoutLocale !== '/') {
        const newPath = `/${newLocale}${pathWithoutLocale}`;
        if (typeof window !== 'undefined') {
          window.location.href = newPath;
        } else {
          router.push(newPath);
        }
      } else {
        // Default to home page for unknown routes
        if (typeof window !== 'undefined') {
          window.location.href = `/${newLocale}`;
        } else {
          router.push(`/${newLocale}`);
        }
      }
    } catch (error) {
      // Fallback to home page if switching fails
      console.error('Error switching locale:', error);
      if (typeof window !== 'undefined') {
        window.location.href = `/${newLocale}`;
      } else {
        router.push(`/${newLocale}`);
      }
    }
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
              href="/catalog"
              className="rounded-md px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800"
            >
              {t('projects')}
            </Link>
          )}

          <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
            <span className="text-xs text-slate-500 mr-1">{t('language')}:</span>
            <button
              onClick={() => switchLocale('ka')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                locale === 'ka'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              aria-label="Switch to Georgian"
            >
              ქართული
            </button>
            <button
              onClick={() => switchLocale('en')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                locale === 'en'
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              aria-label="Switch to English"
            >
              English
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

