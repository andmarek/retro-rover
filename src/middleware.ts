import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Define public routes that don't require authentication
  const publicRoutes = ["/", "/sign-in", "/api/auth"];
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route) || pathname === "/"
  );

  // Skip auth check for public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For now, let client-side handle auth redirects
  // Better-Auth provides client-side session management
  // We can improve this later with edge-compatible session checking
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
