import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import { CopyButton } from "@/components/download/CopyButton";
import { InstallChecklist } from "@/components/download/InstallChecklist";
import { PcCheck } from "@/components/download/PcCheck";
import { PageHeader } from "@/components/ui/PageHeader";
import { links, requirements, site } from "@/content/site";
import { formatBytes } from "@/lib/format";
import { getReleases } from "@/lib/releases/getReleases";

export const metadata: Metadata = {
  title: "Baixar",
  description: `Baixe o Project Lazarus ${site.version} e importe no CurseForge.`,
};

const zip = `Project-Lazarus-${site.version}.zip`;

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="reveal rounded border border-rust/40 bg-asphalt p-6">
      <h2 className="font-stencil text-2xl text-plate">{title}</h2>
      <div className="mt-3 space-y-3 text-plate/80">{children}</div>
    </section>
  );
}

const Code = ({ children }: { children: string }) => (
  <code className="rounded bg-black/40 px-1.5 py-0.5 text-sm text-radio">{children}</code>
);

// Linha de config que o visitante cola no servidor.
const Copyable = ({ children }: { children: string }) => (
  <span className="whitespace-nowrap">
    <Code>{children}</Code>
    <CopyButton text={children} />
  </span>
);

export default async function DownloadPage() {
  const [latest] = await getReleases();
  const size = latest?.asset?.size;
  return (
    <>
      <PageHeader title="Baixar">
        <p>
          O download é o zip de importação da release no GitHub. O CurseForge baixa o resto: mods, resource packs e
          shaders de terceiros vêm direto dos autores.
        </p>
      </PageHeader>

      <div className="mx-auto max-w-6xl space-y-6 px-4 pb-20 *:max-w-4xl">
        <a
          href={links.download}
          className="block rounded bg-lazarus px-6 py-4 text-center text-lg font-semibold text-plate hover:bg-lazarus/85"
        >
          Baixar {zip}
          {size ? <span className="ml-2 text-sm font-normal text-plate/70">({formatBytes(size)})</span> : null}
        </a>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {requirements.slice(0, 4).map(({ label, value }) => (
            <div key={label} className="rounded border border-rust/40 p-3">
              <dt className="text-xs tracking-widest text-plate/50 uppercase">{label}</dt>
              <dd className="text-plate">{value}</dd>
            </div>
          ))}
        </dl>

        <PcCheck />

        <Step title="Pelo CurseForge (recomendado)">
          <InstallChecklist
            steps={[
              <Fragment key="zip">
                Baixe <Code>{zip}</Code> da{" "}
                <a href={links.download} className="text-sunset underline">
                  release mais recente
                </a>
                .
              </Fragment>,
              <Fragment key="import">
                No CurseForge: <strong>Create Custom Profile → Import</strong> e escolha o zip. Ele baixa os mods,
                resource packs e shaders de terceiros e copia as configs, os scripts e os mods Lazarus.
              </Fragment>,
              "Reserve 8 GB de RAM (6 GB no mínimo).",
            ]}
          />
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
            No <Code>server.properties</Code>: <Copyable>level-type=cityworld:apocalypse</Copyable>. Para muitos
            jogadores, <Copyable>view-distance=8</Copyable> e <Copyable>simulation-distance=6</Copyable>.
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
