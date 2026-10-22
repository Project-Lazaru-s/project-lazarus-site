import { cacheLife } from "next/cache";
import { fetchReleases } from "./releases";

export async function getReleases() {
  "use cache";
  const releases = await fetchReleases();
  // Uma lista vazia é o GitHub fora do ar, sem cota ou num soluço (já devolveu [] por minutos
  // com a release publicada): guarda pouco tempo para não ficar uma hora sem changelog.
  if (releases.length > 0) cacheLife("hours");
  else cacheLife("minutes");
  return releases;
}
