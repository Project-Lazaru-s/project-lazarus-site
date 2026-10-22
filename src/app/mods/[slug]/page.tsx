import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMod, lazarusMods } from "@/content/mods";

export function generateStaticParams() {
  return lazarusMods.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/mods/[slug]">): Promise<Metadata> {
  const mod = getMod((await params).slug);
  return mod ? { title: mod.name, description: mod.summary } : {};
}

export default async function ModPage({ params }: PageProps<"/mods/[slug]">) {
  const mod = getMod((await params).slug);
  if (!mod) notFound();

  return (
    <article className="mx-auto max-w-6xl px-4 py-12 *:max-w-[min(100%,56rem)]">
      <Link href="/mods" className="text-sm text-plate/60 hover:text-plate">
        ← Mods Lazarus
      </Link>
      <Image
        src={mod.banner}
        alt={`Banner do ${mod.name}`}
        width={2172}
        height={724}
        priority
        sizes="(min-width: 896px) 896px, 100vw"
        className="mt-6 rounded border border-rust/40"
      />
      <header className="mt-8 flex flex-wrap items-center gap-4">
        <h1 className="font-stencil text-4xl text-plate sm:text-5xl">{mod.name}</h1>
        <span className="dogtag text-sm">v{mod.version}</span>
      </header>
      <p className="mt-4 text-lg text-plate/80">{mod.summary}</p>
      <ul className="mt-8 space-y-3">
        {mod.features.map((feature) => (
          <li key={feature} className="reveal border-l-2 border-lazarus pl-4 text-plate/85">
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-wrap gap-3">
        {mod.play && (
          <Link
            href={`/#${mod.play}`}
            className="rounded bg-lazarus px-4 py-2 text-sm font-semibold text-plate hover:bg-lazarus/85"
          >
            Jogue no site
          </Link>
        )}
        <a
          href={mod.repo}
          className="rounded border border-plate/40 px-4 py-2 text-sm text-plate hover:border-sunset hover:text-sunset"
        >
          Código no GitHub
        </a>
      </div>
    </article>
  );
}
