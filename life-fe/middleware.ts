import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authApi } from '@/api';

export const config = {
  matcher: '/((?!_next|favicon.ico).*)'
};

export async function middleware(req: NextRequest) {
  console.log('✅ middleware triggered:', req.nextUrl.pathname);
  const url = req.nextUrl;
  // 优先从url获取
  const urlAuthCode = url.searchParams.get('authcode');
  if (urlAuthCode) {
    const res = NextResponse.redirect(new URL(url.pathname, req.url));
    res.cookies.set('token', urlAuthCode, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365 // 365 天
    });
    return res;
  }
  // 读取 cookie
  const cookieAuthCode = req.cookies.get('authcode')?.value;

  // 如果没有 token 则返回 404
  if (!cookieAuthCode) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const verifyResult = await authApi.verifyAuthCode({ code: cookieAuthCode });

  console.log('verifyResult:', verifyResult);
  // 放行
  return NextResponse.next();
}
