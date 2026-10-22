import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { factions, wantedSystem } from "@/content/factions";

export const metadata: Metadata = {
  title: "Facções",
  description: "Haven, Rovers, Wardens, Military, gangues, The Hollow e desertores.",
};

export default function FactionsPage() {
  return (
    <>
      <PageHeader title="Facções">
        <p>
          Os vivos se organizaram. Cada facção guarda a sua reputação com você, de -100 a +100, e lembra do que você
          fez.
        </p>
      </PageHeader>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-2">
        {factions.map((faction) => (
          <article
            key={faction.slug}
            id={faction.slug}
            aria-labelledby={`faccao-${faction.slug}`}
            className="scroll-mt-24 rounded border border-rust/40 bg-asphalt p-6"
          >
            <h2 id={`faccao-${faction.slug}`} className="font-stencil text-3xl text-lazarus">
              {faction.name}
            </h2>
            <p className="mt-2 text-plate/85">{faction.profile}</p>
            <ul className="mt-4 list-[square] space-y-1 pl-5 text-sm text-plate/70">
              {faction.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
            {faction.image && (
              <Image
                src={faction.image.src}
                alt={faction.image.alt}
                width={faction.image.width}
                height={faction.image.height}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="mt-6 rounded [image-rendering:pixelated]"
              />
            )}
          </article>
        ))}
      </div>
      <section aria-labelledby="procurado" className="mx-auto max-w-6xl px-4 py-16">
        <h2 id="procurado" className="font-stencil text-3xl text-plate">
          Procurado
        </h2>
        <ul className="mt-4 max-w-3xl space-y-2 text-plate/80">
          {wantedSystem.map((rule) => (
            <li key={rule} className="border-l-2 border-lazarus pl-4">
              {rule}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
