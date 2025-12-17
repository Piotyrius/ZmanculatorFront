import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect users from the bare root URL to the localized home route.
  // The `[locale]` segment (handled by next-intl + middleware) will
  // serve `/en` and `/ka` via `app/[locale]/page.tsx`.
  redirect('/ka');
}
