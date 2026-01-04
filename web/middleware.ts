import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const path = req.nextUrl.pathname;

  const protectedPath =
    path.startsWith("/dashboard") || path.startsWith("/master-data");

  if (token) {
    if (isTokenExpired(token)) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("access_token");
      return res;
    }

    if (path === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (!token && protectedPath) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/master-data/:path*"],
};
