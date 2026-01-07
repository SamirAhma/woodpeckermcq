import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow static files, api/login, and /login page
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/login') ||
        pathname === '/login' ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    const authSession = request.cookies.get('auth_session');

    if (!authSession) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api/login|login|_next/static|_next/image|favicon.ico).*)'],
};
