import { links } from "@/content/site";

export type Release = {
  tag: string;
  name: string;
  publishedAt: string;
  url: string;
  body: string;
  asset?: { name: string; size: number; url: string };
};

type GitHubRelease = {
  tag_name: string;
  name: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string;
  html_url: string;
  body: string | null;
  assets: { name: string; size: number; browser_download_url: string }[];
};

export function parseReleases(payload: unknown): Release[] {
  if (!Array.isArray(payload)) return [];
  return (payload as GitHubRelease[])
    .filter((r) => !r.draft && !r.prerelease)
    .sort((a, b) => b.published_at.localeCompare(a.published_at))
    .map((r) => {
      const zip = r.assets.find((a) => a.name.endsWith(".zip"));
      return {
        tag: r.tag_name,
        name: r.name || r.tag_name,
        publishedAt: r.published_at,
        url: r.html_url,
        body: r.body ?? "",
        asset: zip && { name: zip.name, size: zip.size, url: zip.browser_download_url },
      };
    });
}

async function getJson(url: string, token?: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return res.ok ? res.json() : undefined;
}

export async function fetchReleases({ token = process.env.GITHUB_TOKEN } = {}): Promise<Release[]> {
  try {
    const releases = parseReleases(await getJson(links.releasesApi, token));
    if (releases.length > 0) return releases;
    // A listagem do GitHub às vezes volta vazia com a release publicada; /latest continua certo.
    const latest = await getJson(`${links.releasesApi}/latest`, token);
    return latest ? parseReleases([latest]) : [];
  } catch {
    return [];
  }
}
