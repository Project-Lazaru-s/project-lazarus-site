import { type NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/enlist/admin";

/** Pede a senha do navegador antes da área das fichas. A página e o CSV conferem de novo. */
export function proxy(request: NextRequest) {
  if (isAdmin(request.headers.get("authorization"))) return NextResponse.next();
  return new NextResponse("Área restrita.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Fichas Lazarus", charset="UTF-8"' },
  });
}

export const config = { matcher: ["/servidor/admin", "/servidor/admin/:path*"] };
