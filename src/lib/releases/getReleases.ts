import { cacheLife } from "next/cache";
import { fetchReleases } from "./releases";

// ponytail: a GitHub outage caches an empty list for up to an hour; acceptable for a changelog
export async function getReleases() {
  "use cache";
  cacheLife("hours");
  return fetchReleases();
}
