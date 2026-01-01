import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./src/lib/supabase/config";

function isProtectedPath(pathname: string) {
  return pathname === "/app" || pathname.startsWith("/app/");
}

export async function middleware(request: NextRequest) {
  let url: string;
  let anonKey: string;
  try {
    ({ url, anonKey } = getSupabaseConfig());
  } catch {
    // Allow the app to load even if env vars aren't set yet.
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/login" || pathname === "/signup") && user) {
    const appUrl = request.nextUrl.clone();
    appUrl.pathname = "/app/leads";
    return NextResponse.redirect(appUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next static files
     * - images
     * - favicon
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

