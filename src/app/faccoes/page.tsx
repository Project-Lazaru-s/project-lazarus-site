import type { Metadata } from "next";
import { FactionCard } from "@/components/factions/FactionCard";
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
          <FactionCard key={faction.slug} faction={faction} />
        ))}
      </div>
      <section aria-labelledby="procurado" className="mx-auto max-w-6xl px-4 py-16">
        <h2 id="procurado" className="font-stencil text-3xl text-plate">
          Procurado
        </h2>
        <ul className="mt-4 max-w-3xl space-y-2 text-plate/80">
          {wantedSystem.map((rule) => (
            <li key={rule} className="reveal border-l-2 border-lazarus pl-4">
              {rule}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
