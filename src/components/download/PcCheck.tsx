"use client";

import { useState } from "react";
import { assessPc, readSpecs, type CheckStatus, type PcSpecs, type Verdict } from "@/lib/pc-check";

const VERDICTS: Record<Verdict, { title: string; text: string; tone: string }> = {
  aguenta: {
    title: "Aguenta.",
    text: "A memória dá conta e nada indica problema. Com placa dedicada, dá para tentar com shader.",
    tone: "text-radio",
  },
  "sem-shader": {
    title: "Aguenta, sem shader.",
    text: "A placa integrada segura o modpack, mas o shader é o que mais pesa no FPS. Deixe-o desligado.",
    tone: "text-sunset",
  },
  "no-limite": {
    title: "No limite.",
    text: "Sua RAM fica entre 4 e 8 GB. Se tiver 6 GB ou mais, roda: feche outros programas e jogue sem shader.",
    tone: "text-sunset",
  },
  "vai-sofrer": {
    title: "Vai sofrer.",
    text: "Abaixo do mínimo de 6 GB de RAM. O Project Lazarus tem mais de 100 mods: vai travar.",
    tone: "text-lazarus",
  },
  incerto: {
    title: "Não deu para medir tudo.",
    text: "Seu navegador esconde parte das informações. Confira: 8 GB de RAM recomendados, 6 GB no mínimo.",
    tone: "text-plate",
  },
  celular: {
    title: "Isso é um celular.",
    text: "O Project Lazarus é para Minecraft Java no PC. Abra esta página no computador para testar.",
    tone: "text-plate",
  },
};

const ICON: Record<CheckStatus, { mark: string; className: string }> = {
  ok: { mark: "✓", className: "text-radio" },
  warn: { mark: "!", className: "text-sunset" },
  bad: { mark: "✕", className: "text-lazarus" },
  unknown: { mark: "?", className: "text-plate/50" },
};

/** "Seu PC aguenta?": estimativa com o que o navegador revela. */
export function PcCheck({ read = readSpecs }: { read?: () => PcSpecs }) {
  const [result, setResult] = useState<ReturnType<typeof assessPc> | null>(null);
  const verdict = result && VERDICTS[result.verdict];

  return (
    <section aria-labelledby="pc-check" className="rounded border border-rust/40 bg-asphalt p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="pc-check" className="font-stencil text-2xl text-plate">
          Seu PC aguenta?
        </h2>
        <button
          type="button"
          onClick={() => setResult(assessPc(read()))}
          className="rounded bg-rust px-4 py-2 text-sm font-semibold text-plate hover:bg-rust-light"
        >
          {result ? "Testar de novo" : "Testar meu PC"}
        </button>
      </div>
      <p className="mt-2 text-xs text-plate/50">
        Estimativa com o que o navegador revela (núcleos, RAM arredondada e placa de vídeo). Roda só no seu navegador:
        nada é enviado.
      </p>

      {result && verdict && (
        <div className="mt-5 space-y-4">
          <div>
            <h3 className={`font-stencil text-3xl ${verdict.tone}`}>{verdict.title}</h3>
            <p className="mt-1 text-plate/80">{verdict.text}</p>
          </div>
          <ul aria-label="O que o navegador revelou" className="grid gap-2 sm:grid-cols-3">
            {result.checks.map((check) => (
              <li key={check.label} className="rounded-sm border border-plate/10 bg-black/30 p-3 text-sm">
                <p className="flex items-center gap-2 text-[10px] tracking-widest text-plate/50 uppercase">
                  <span aria-hidden className={`font-bold ${ICON[check.status].className}`}>
                    {ICON[check.status].mark}
                  </span>
                  {check.label}
                </p>
                <p className="mt-1 break-words text-plate">{check.value}</p>
                <p className="mt-1 text-xs text-plate/60">{check.note}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
