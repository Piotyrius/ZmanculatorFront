import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ReactQueryProvider } from '../../lib/reactQuery';
import { AuthProvider } from '../../lib/auth/AuthContext';
import Navigation from '../../components/Navigation';

async function loadMessages(locale: string) {
  switch (locale) {
    case 'en':
      return (await import('../../../messages/en.json')).default;
    case 'ka':
      return (await import('../../../messages/ka.json')).default;
    default:
      // Fallback to English if an unknown locale is passed
      return (await import('../../../messages/en.json')).default;
  }
}

const locales = ['en', 'ka'] as const;
type Locale = (typeof locales)[number];

export const metadata: Metadata = {
  title: 'Universal Garment Pattern Studio',
  description:
    'Frontend control and visualization layer for the universal garment pattern construction engine.',
};

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await loadMessages(locale);

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <ReactQueryProvider>
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </ReactQueryProvider>
    </NextIntlClientProvider>
  );
}


