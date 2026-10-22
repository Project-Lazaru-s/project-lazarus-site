import { Prose } from "@/components/ui/Prose";
import { links } from "@/content/site";
import { formatBytes, formatDate } from "@/lib/format";
import type { Release } from "@/lib/releases/releases";

export function ReleaseList({ releases }: { releases: Release[] }) {
  if (releases.length === 0) {
    return (
      <p className="text-plate/70">
        Não foi possível carregar as atualizações agora. Veja as{" "}
        <a href={`${links.repository}/releases`} className="text-sunset underline">
          releases no GitHub
        </a>
        .
      </p>
    );
  }

  return (
    <ol className="space-y-10 border-l-2 border-rust/50 pl-6">
      {releases.map((release) => (
        <li key={release.tag}>
          <article>
            <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className="font-stencil text-3xl text-plate">{release.name}</h2>
              <time dateTime={release.publishedAt} className="text-sm text-sunset">
                {formatDate(release.publishedAt)}
              </time>
            </header>
            <div className="mt-4">
              <Prose markdown={release.body} />
            </div>
            <footer className="mt-4 flex flex-wrap gap-4 text-sm">
              {release.asset && (
                <a href={release.asset.url} className="rounded bg-lazarus px-4 py-2 font-semibold text-plate hover:bg-lazarus/85">
                  {release.asset.name} ({formatBytes(release.asset.size)})
                </a>
              )}
              <a href={release.url} className="px-1 py-2 text-plate/70 underline hover:text-plate">
                Ver no GitHub
              </a>
            </footer>
          </article>
        </li>
      ))}
    </ol>
  );
}
