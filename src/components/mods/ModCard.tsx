import Image from "next/image";
import Link from "next/link";
import type { LazarusMod } from "@/content/mods";

export function ModCard({ mod }: { mod: LazarusMod }) {
  const titleId = `mod-${mod.slug}`;
  return (
    <article
      aria-labelledby={titleId}
      className="group relative overflow-hidden rounded border border-rust/40 bg-asphalt transition hover:border-sunset"
    >
      <Image
        src={mod.banner}
        alt=""
        width={2172}
        height={724}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[3/1] object-cover"
      />
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id={titleId} className="font-stencil text-xl">
            <Link href={`/mods/${mod.slug}`} className="text-plate after:absolute after:inset-0 group-hover:text-sunset">
              {mod.name}
            </Link>
          </h2>
          <span className="rounded bg-badge px-2 py-0.5 text-xs text-plate">v{mod.version}</span>
        </div>
        <p className="mt-2 text-sm text-plate/75">{mod.summary}</p>
      </div>
    </article>
  );
}
