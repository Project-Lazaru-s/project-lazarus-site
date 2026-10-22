import type { Metadata } from "next";
import { ReleaseList } from "@/components/releases/ReleaseList";
import { PageHeader } from "@/components/ui/PageHeader";
import { getReleases } from "@/lib/releases/getReleases";

export const metadata: Metadata = {
  title: "Atualizações",
  description: "Notas de cada versão do Project Lazarus.",
};

export default async function ChangelogPage() {
  const releases = await getReleases();
  return (
    <>
      <PageHeader title="Atualizações">
        <p>O que mudou em cada versão do modpack, direto das releases do GitHub.</p>
      </PageHeader>
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <ReleaseList releases={releases} />
      </section>
    </>
  );
}
