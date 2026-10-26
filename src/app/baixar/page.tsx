import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import { CopyButton } from "@/components/download/CopyButton";
import { InstallChecklist } from "@/components/download/InstallChecklist";
import { PcCheck } from "@/components/download/PcCheck";
import { PageHeader } from "@/components/ui/PageHeader";
import { curseforgeName, links, requirements, site } from "@/content/site";
import { formatBytes } from "@/lib/format";
import { getReleases } from "@/lib/releases/getReleases";

export const metadata: Metadata = {
  title: "Baixar",
  description: `Instale o Project Lazarus ${site.version} pelo CurseForge, com um clique, ou importe o zip do GitHub.`,
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
          O Project Lazarus está no CurseForge: um clique em Install e o app baixa tudo, mods, resource packs, shaders e
          configs. Os mods de terceiros vêm direto dos autores.
        </p>
      </PageHeader>

      <div className="mx-auto max-w-6xl space-y-6 px-4 pb-20 *:max-w-[min(100%,56rem)]">
        <div className="space-y-2">
          <a
            href={links.curseforge}
            className="block rounded bg-lazarus px-6 py-4 text-center text-lg font-semibold text-plate hover:bg-lazarus/85"
          >
            Instalar pelo CurseForge
            <span className="ml-2 text-sm font-normal text-plate/70">{site.version}</span>
          </a>
          <p className="text-center text-sm text-plate/60">
            ou{" "}
            <a
              href={links.download}
              aria-label={`Baixar ${zip}${size ? ` (${formatBytes(size)})` : ""}`}
              className="text-sunset underline hover:text-plate"
            >
              {/* O nome do zip quebra em duas linhas num celular; lá basta a versão. */}
              <span className="sm:hidden">baixe o zip {site.version}</span>
              <span className="max-sm:hidden">baixe {zip}</span>
              {size ? ` (${formatBytes(size)})` : null}
            </a>{" "}
            do GitHub e importe no app
          </p>
        </div>

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
              <Fragment key="app">
                Instale o{" "}
                <a href="https://www.curseforge.com/download/app" className="text-sunset underline">
                  app do CurseForge
                </a>
                , se ainda não tiver.
              </Fragment>,
              <Fragment key="install">
                Abra a{" "}
                <a href={links.curseforge} className="text-sunset underline">
                  página do modpack
                </a>{" "}
                e clique em <strong>Install</strong>, ou busque <strong>{curseforgeName}</strong> em Modpacks dentro do
                app. Ele baixa os mods, resource packs, shaders, configs e os mods Lazarus.
              </Fragment>,
              "Reserve 8 GB de RAM (6 GB no mínimo) nas configurações do perfil.",
            ]}
          />
        </Step>

        <Step title="Pelo zip do GitHub">
          <p>
            Baixe <Code>{zip}</Code> da{" "}
            <a href={links.download} className="text-sunset underline">
              release mais recente
            </a>
            . No CurseForge: <strong>Create Custom Profile → Import</strong> e escolha o zip. O resultado é o mesmo
            perfil do botão Install.
          </p>
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
