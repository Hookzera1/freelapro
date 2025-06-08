import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rate limiting simples em memória (para produção usar Redis)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string, limit: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const record = rateLimit.get(ip);
  
  if (!record || record.resetTime < windowStart) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (record.count >= limit) {
    return true;
  }
  
  record.count++;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rate limiting para APIs
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (isRateLimited(ip, 200, 15 * 60 * 1000)) { // 200 requests per 15 minutes
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  // Security headers
  const response = NextResponse.next();
  
  // Security Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP atualizado para Firebase
  if (!pathname.startsWith('/api/')) {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.googleapis.com https://*.google.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebase.googleapis.com https://www.googleapis.com https://oauth2.googleapis.com",
      "frame-src 'self' https://accounts.google.com https://*.google.com",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ');
    
    response.headers.set('Content-Security-Policy', csp);
  }

  // Rotas protegidas que precisam de autenticação
  const protectedRoutes = [
    '/dashboard',
    '/perfil',
    '/configuracoes',
    '/meus-projetos',
    '/minhas-propostas',
    '/propostas-recebidas',
    '/contratos',
    '/mensagens',
    '/notificacoes',
    '/portfolio',
    '/empresa',
    '/publicar-projeto',
    '/publicar-vaga'
  ];

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      // Redirecionar para login com callback URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Bloquear acesso a arquivos sensíveis
  const blockedPaths = [
    '/.env',
    '/.env.local',
    '/package.json',
    '/package-lock.json',
    '/next.config.js',
    '/.git',
    '/prisma',
    '/lib/firebase-admin'
  ];

  if (blockedPaths.some(path => pathname.startsWith(path))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|images|icons).*)',
  ],
}; 