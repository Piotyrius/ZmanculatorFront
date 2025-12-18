"use client";

import { useEffect } from "react";

export default function RegisterPage() {
  useEffect(() => {
    // Redirect to locale-prefixed auth route
    if (typeof window !== 'undefined') {
      const cookieLocale = document.cookie
        .split('; ')
        .find(row => row.startsWith('NEXT_LOCALE='))
        ?.split('=')[1];
      const locale = (cookieLocale === 'en' || cookieLocale === 'ka') ? cookieLocale : 'ka';
      window.location.href = `/${locale}/auth/register`;
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-sm text-slate-600">Redirecting...</div>
    </div>
  );
}


