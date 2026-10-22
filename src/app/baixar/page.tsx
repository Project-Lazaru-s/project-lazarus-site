import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { links, requirements, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Baixar",
  description: `Baixe o Project Lazarus ${site.version} e importe no CurseForge.`,
};

const zip = `Project-Lazarus-${site.version}.zip`;

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded border border-rust/40 bg-asphalt p-6">
      <h2 className="font-stencil text-2xl text-plate">{title}</h2>
      <div className="mt-3 space-y-3 text-plate/80">{children}</div>
    </section>
  );
}

const Code = ({ children }: { children: string }) => (
  <code className="rounded bg-black/40 px-1.5 py-0.5 text-sm text-radio">{children}</code>
);

export default function DownloadPage() {
  return (
    <>
      <PageHeader title="Baixar">
        <p>
          O download é o zip de importação da release no GitHub. O CurseForge baixa o resto: mods, resource packs e
          shaders de terceiros vêm direto dos autores.
        </p>
      </PageHeader>

      <div className="mx-auto max-w-4xl space-y-6 px-4 pb-20">
        <a
          href={links.download}
          className="block rounded bg-lazarus px-6 py-4 text-center text-lg font-semibold text-plate hover:bg-lazarus/85"
        >
          Baixar {zip}
        </a>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {requirements.slice(0, 4).map(({ label, value }) => (
            <div key={label} className="rounded border border-rust/40 p-3">
              <dt className="text-xs tracking-widest text-plate/50 uppercase">{label}</dt>
              <dd className="text-plate">{value}</dd>
            </div>
          ))}
        </dl>

        <Step title="Pelo CurseForge (recomendado)">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Baixe <Code>{zip}</Code> da{" "}
              <a href={links.download} className="text-sunset underline">
                release mais recente
              </a>
              .
            </li>
            <li>
              No CurseForge: <strong>Create Custom Profile → Import</strong> e escolha o zip. Ele baixa os mods,
              resource packs e shaders de terceiros e copia as configs, os scripts e os mods Lazarus.
            </li>
            <li>Reserve 8 GB de RAM (6 GB no mínimo).</li>
          </ol>
        </Step>

        <Step title="Instalação manual">
          <p>
            Crie um perfil Forge 1.20.1 (47.4.10), instale o que está no{" "}
            <a href={links.modsList} className="text-sunset underline">
              MODS.md
            </a>{" "}
            e copie <Code>config/</Code>, <Code>defaultconfigs/</Code>, <Code>kubejs/</Code>,{" "}
            <Code>fancymenu_data/</Code>, <Code>mods/lazarus*.jar</Code> e os resource packs próprios.
          </p>
        </Step>

        <Step title="Servidor dedicado">
          <p>
            Use os mesmos mods, exceto os que são só do cliente: shaders, Embeddium, Oculus, EMF/ETF, ImmediatelyFast,
            EntityCulling, sons e interface.
          </p>
          <p>
            No <Code>server.properties</Code>: <Code>level-type=cityworld:apocalypse</Code>. Para muitos jogadores,{" "}
            <Code>view-distance=8</Code> e <Code>simulation-distance=6</Code>.
          </p>
        </Step>

        <Step title="Desempenho">
          <p>Render 8 e simulação 8 são o padrão. O shader é o que mais pesa no FPS.</p>
          <p>
            Para medir lag: <Code>/spark tps</Code> e <Code>/spark health</Code>.
          </p>
        </Step>

        <p className="text-sm text-plate/60">
          Achou um bug?{" "}
          <a href={links.issues} className="underline hover:text-plate">
            Abra uma issue no GitHub
          </a>
          .
        </p>
      </div>
    </>
  );
}
