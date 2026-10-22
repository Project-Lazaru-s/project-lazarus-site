import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DossierCard } from "@/components/survival/DossierCard";
import { site } from "@/content/site";
import { decodeRun, encodeRun } from "@/lib/survival/runCode";
import { initialSurvival, rank } from "@/lib/survival/survival";

// Uma partida de exemplo para o build validar a rota; as outras são geradas sob demanda.
export function generateStaticParams() {
  return [{ code: encodeRun({ ...initialSurvival, day: 60, kills: 12 }) }];
}

export async function generateMetadata({ params }: PageProps<"/dossie/[code]">): Promise<Metadata> {
  const run = decodeRun((await params).code);
  if (!run) return {};
  return {
    title: `${rank(run)} no dia ${run.day}`,
    description: `${run.kills} abates, ${run.deaths} mortes no site do ${site.name}. Você dura mais?`,
  };
}

export default async function DossierPage({ params }: PageProps<"/dossie/[code]">) {
  const run = decodeRun((await params).code);
  if (!run) notFound();

  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-4 py-16 lg:grid-cols-[1fr_1.2fr] lg:items-center">
      <div>
        <p className="font-mono text-sm tracking-[0.3em] text-sunset uppercase">Dossiê de um sobrevivente</p>
        <h1 className="mt-2 font-stencil text-5xl text-plate">Chegou ao dia {run.day}.</h1>
        <p className="mt-4 text-plate/75">
          Esta partida foi jogada na página do {site.name}: furtividade, sede, horda, facções e saque escasso, em
          poucos minutos. Lá dentro, cada dia é mais difícil que o anterior.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/" className="rounded bg-lazarus px-6 py-3 font-semibold text-plate hover:bg-lazarus/85">
            Sua vez
          </Link>
          <Link href="/baixar" className="rounded border border-plate/40 px-6 py-3 text-plate hover:border-sunset">
            Baixar {site.version}
          </Link>
        </div>
      </div>
      <DossierCard state={run} />
    </section>
  );
}
