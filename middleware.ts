import createMiddleware from 'next-intl/middleware';
import { locales } from './src/i18n/request';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'ka',
  localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Shop routes don't need locale prefix - skip middleware for them
  const shopRoutes = ['/catalog', '/product', '/projects', '/patterns', '/measurements', '/profiles', '/account'];
  const isShopRoute = shopRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  
  if (isShopRoute) {
    return NextResponse.next();
  }
  
  // Let next-intl middleware handle all locale routing
  // It will automatically redirect / to /ka (defaultLocale)
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - Next.js internals
    // - static files
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};

