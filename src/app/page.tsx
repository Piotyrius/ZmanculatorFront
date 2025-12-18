"use client";

import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    // Redirect to default locale (Georgian) - middleware should handle this,
    // but this is a client-side fallback
    if (typeof window !== 'undefined') {
      const cookieLocale = document.cookie
        .split('; ')
        .find(row => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1];
      const locale = (cookieLocale === 'en' || cookieLocale === 'ka') ? cookieLocale : 'ka';
      window.location.href = `/${locale}`;
    }
  }, []);
  
  // Show loading while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-sm text-slate-600">Loading...</div>
    </div>
  );
}
