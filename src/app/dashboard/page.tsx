import { redirect } from 'next/navigation';
import { locales } from '../../i18n/request';

export default function DashboardPage() {
  // Fallback: if someone visits `/dashboard` without a locale prefix,
  // send them to the default localized dashboard. We use the first
  // locale from the configured locales array, which is `en` or `ka`
  // depending on configuration, but middleware already defaults to `ka`.
  const defaultLocale = locales[0] ?? 'ka';
  redirect(`/${defaultLocale}/dashboard`);
}

