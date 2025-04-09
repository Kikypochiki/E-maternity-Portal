import { type NextRequest, NextResponse } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  // Create a response that we'll use to set cookies on
  const res = NextResponse.next()

  // Create a Supabase client specifically for the middleware
  const supabase = createMiddlewareClient({ req: request, res })

  try {
    // This refreshes the session if needed and returns the session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    console.log("Middleware session check:", session ? "Session found" : "No session")

    // If no session and trying to access protected routes
    if (
      !session &&
      (request.nextUrl.pathname.startsWith("/patient") || request.nextUrl.pathname.startsWith("/admin/dashboard"))
    ) {
      // Redirect to login
      const redirectUrl = new URL("/auth_admin/login", request.url)
      // Add the original URL as a query parameter to redirect back after login
      redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error("Middleware auth error:", error)
    // If there's an error, redirect to login as a fallback
    const redirectUrl = new URL("/auth_admin/login", request.url)
    return NextResponse.redirect(redirectUrl)
  }
}

export const config = {
  matcher: [
    "/patient/:path*",
    "/admin/dashboard/:path*",
    // Add this to ensure auth is checked on all routes
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
