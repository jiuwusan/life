import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authApi } from '@/api';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  // 优先从url获取
  const urlToken = url.searchParams.get('token');
  if (urlToken) {
    const res = NextResponse.redirect(new URL(url.pathname, req.url));
    res.cookies.set('token', urlToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365 // 365 天
    });
    return res;
  }
  // 读取 cookie
  const cookieToken = req.cookies.get('token')?.value;

  // 如果没有 token 则返回 404
  if (!cookieToken) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const verifyResult = await authApi.verifyToken({ token: cookieToken });
  
  console.log('verifyResult:', verifyResult);
  // 放行
  return NextResponse.next();
}

// 配置需要启用 middleware 的路径
export const config = {
  matcher: ['/:path*']
};
