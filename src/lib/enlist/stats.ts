import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connect, countRecruits, type Stats } from "./db";

/** Contagem pública de alistados, em cache; uma ficha nova invalida a tag na hora. */
export async function getRecruitStats(): Promise<Stats | null> {
  "use cache";
  cacheTag("recruits");
  cacheLife("minutes");
  const sql = connect();
  if (!sql) return null;
  try {
    return await countRecruits(sql);
  } catch {
    return null; // banco fora do ar: a página segue sem o contador
  }
}
