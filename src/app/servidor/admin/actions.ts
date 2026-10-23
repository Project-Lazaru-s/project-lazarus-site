"use server";

import { refresh, updateTag } from "next/cache";
import { headers } from "next/headers";
import { isAdmin } from "@/lib/enlist/admin";
import { connect, deleteRecruit } from "@/lib/enlist/db";

/** Apaga uma ficha. A senha é conferida de novo aqui: Server Actions são endpoints públicos. */
export async function removeRecruit(id: number) {
  if (!isAdmin((await headers()).get("authorization"))) throw new Error("Área restrita.");
  if (!Number.isInteger(id) || id < 1) throw new Error("Ficha inválida.");
  const sql = connect();
  if (!sql) throw new Error("Banco não configurado.");
  await deleteRecruit(sql, id);
  updateTag("recruits"); // o contador público também desconta
  refresh();
}
