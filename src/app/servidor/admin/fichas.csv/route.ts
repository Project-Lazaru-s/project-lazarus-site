import { headers } from "next/headers";
import { isAdmin, toCsv } from "@/lib/enlist/admin";
import { connect, listRecruits } from "@/lib/enlist/db";

export async function GET() {
  if (!isAdmin((await headers()).get("authorization"))) return new Response("Área restrita.", { status: 401 });
  const sql = connect();
  if (!sql) return new Response("Banco não configurado.", { status: 503 });
  const date = new Date().toISOString().slice(0, 10);
  return new Response(toCsv(await listRecruits(sql)), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fichas-lazarus-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
