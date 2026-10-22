import type { Metadata } from "next";
import { ModCard } from "@/components/mods/ModCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { lazarusMods } from "@/content/mods";

export const metadata: Metadata = {
  title: "Mods Lazarus",
  description: "Os 8 mods próprios do Project Lazarus.",
};

export default function ModsPage() {
  return (
    <>
      <PageHeader title="Mods Lazarus">
        <p>Oito mods escritos para o Project Lazarus. O código de cada um está no GitHub.</p>
      </PageHeader>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {lazarusMods.map((mod) => (
          <ModCard key={mod.slug} mod={mod} />
        ))}
      </section>
    </>
  );
}
