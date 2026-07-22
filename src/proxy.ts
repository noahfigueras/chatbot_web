import createMiddleware from "next-intl/middleware";
import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

const locales = ["en", "es"];
const defaultLocale = "en";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApi = pathname.startsWith("/api");
  const isAuth = pathname.startsWith("/auth");

  if (isApi || isAuth) {
    return await updateSession(request);
  }

  const response = intlMiddleware(request);
  const supabaseResponse = await updateSession(request);

  supabaseResponse.headers.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png).*)"],
};
