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
    <article className="mx-auto max-w-4xl px-4 py-12">
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
      <header className="mt-8 flex flex-wrap items-baseline gap-4">
        <h1 className="font-stencil text-4xl text-plate sm:text-5xl">{mod.name}</h1>
        <span className="rounded bg-badge px-2 py-0.5 text-sm text-plate">v{mod.version}</span>
      </header>
      <p className="mt-4 text-lg text-plate/80">{mod.summary}</p>
      <ul className="mt-8 space-y-3">
        {mod.features.map((feature) => (
          <li key={feature} className="border-l-2 border-lazarus pl-4 text-plate/85">
            {feature}
          </li>
        ))}
      </ul>
      <a
        href={mod.repo}
        className="mt-10 inline-block rounded border border-plate/40 px-4 py-2 text-sm text-plate hover:border-sunset hover:text-sunset"
      >
        Código no GitHub
      </a>
    </article>
  );
}
