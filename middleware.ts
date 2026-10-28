import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function redirectWithCookies(url: URL, response: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
  return redirectResponse;
}

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login?setup=required", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const result = await supabase.rpc("is_admin");
    isAdmin = result.data === true && !result.error;
  }

  const isLogin = request.nextUrl.pathname === "/admin/login";
  if (isLogin) {
    if (isAdmin) return redirectWithCookies(new URL("/admin/products", request.url), response);
    return response;
  }
  if (!isAdmin) {
    const message = user ? "unauthorized=1" : "";
    const login = new URL("/admin/login", request.url);
    if (message) login.search = message;
    return redirectWithCookies(login, response);
  }
  if (request.nextUrl.pathname === "/admin") return redirectWithCookies(new URL("/admin/products", request.url), response);
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
