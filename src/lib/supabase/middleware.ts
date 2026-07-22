import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const locales = ["en", "es"];

function stripLocale(pathname: string): string {
  const parts = pathname.split("/");
  if (parts.length > 1 && locales.includes(parts[1])) {
    return "/" + parts.slice(2).join("/");
  }
  return pathname;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rawPath = request.nextUrl.pathname;
  const pathname = stripLocale(rawPath);
  const isAuth = !!user;

  if (pathname.startsWith("/dashboard") && !isAuth) {
    const loginUrl = new URL(rawPath.includes("/es/") ? "/es/login" : "/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/login" || pathname === "/signup") && isAuth) {
    const dashboardUrl = new URL(rawPath.includes("/es/") ? "/es/dashboard" : "/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}
