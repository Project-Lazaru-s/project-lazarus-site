import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { links } from "@/content/site";
import { fetchReleases, parseReleases } from "./releases";

const githubRelease = (overrides: Record<string, unknown> = {}) => ({
  tag_name: "v1.0.0",
  name: "Project Lazarus 1.0.0",
  draft: false,
  prerelease: false,
  published_at: "2026-10-22T06:16:35Z",
  html_url: "https://github.com/Project-Lazaru-s/project-lazarus-modpack/releases/tag/v1.0.0",
  body: "**Lançamento!**",
  assets: [
    {
      name: "Project-Lazarus-1.0.0.zip",
      size: 13_031_141,
      browser_download_url: "https://github.com/x/releases/download/v1.0.0/Project-Lazarus-1.0.0.zip",
    },
  ],
  ...overrides,
});

describe("parseReleases", () => {
  it("maps a GitHub release to the site model", () => {
    expect(parseReleases([githubRelease()])).toEqual([
      {
        tag: "v1.0.0",
        name: "Project Lazarus 1.0.0",
        publishedAt: "2026-10-22T06:16:35Z",
        url: "https://github.com/Project-Lazaru-s/project-lazarus-modpack/releases/tag/v1.0.0",
        body: "**Lançamento!**",
        asset: {
          name: "Project-Lazarus-1.0.0.zip",
          size: 13_031_141,
          url: "https://github.com/x/releases/download/v1.0.0/Project-Lazarus-1.0.0.zip",
        },
      },
    ]);
  });

  it("hides drafts and pre-releases", () => {
    const releases = parseReleases([
      githubRelease({ tag_name: "v1.1.0-beta", prerelease: true }),
      githubRelease({ tag_name: "v1.2.0", draft: true }),
      githubRelease(),
    ]);
    expect(releases.map((r) => r.tag)).toEqual(["v1.0.0"]);
  });

  it("sorts newest first", () => {
    const releases = parseReleases([
      githubRelease(),
      githubRelease({ tag_name: "v1.1.0", published_at: "2026-11-01T00:00:00Z" }),
    ]);
    expect(releases.map((r) => r.tag)).toEqual(["v1.1.0", "v1.0.0"]);
  });

  it("falls back to the tag when the release has no name or zip", () => {
    const [release] = parseReleases([githubRelease({ name: null, body: null, assets: [] })]);
    expect(release.name).toBe("v1.0.0");
    expect(release.body).toBe("");
    expect(release.asset).toBeUndefined();
  });

  it("ignores payloads that are not a release list", () => {
    expect(parseReleases({ message: "API rate limit exceeded" })).toEqual([]);
  });
});

describe("fetchReleases (GitHub API)", () => {
  const server = setupServer();
  beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("loads releases from the modpack repository", async () => {
    server.use(http.get(links.releasesApi, () => HttpResponse.json([githubRelease()])));
    const releases = await fetchReleases();
    expect(releases).toHaveLength(1);
    expect(releases[0].tag).toBe("v1.0.0");
  });

  it("sends the token when one is configured", async () => {
    let auth: string | null = null;
    server.use(
      http.get(links.releasesApi, ({ request }) => {
        auth = request.headers.get("authorization");
        return HttpResponse.json([]);
      }),
    );
    await fetchReleases({ token: "abc" });
    expect(auth).toBe("Bearer abc");
  });

  it("returns an empty list when GitHub fails, so the page still renders", async () => {
    server.use(http.get(links.releasesApi, () => HttpResponse.json({ message: "rate limited" }, { status: 403 })));
    expect(await fetchReleases()).toEqual([]);
  });

  it("returns an empty list when the network is down", async () => {
    server.use(http.get(links.releasesApi, () => HttpResponse.error()));
    expect(await fetchReleases()).toEqual([]);
  });
});
