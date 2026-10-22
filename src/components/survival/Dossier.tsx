"use client";

import { useSurvival } from "./SurvivalProvider";

/** Resumo do que o visitante viveu na página, no estilo do painel do Lazarus Status. */
export function Dossier() {
  const { state } = useSurvival();
  const played = state.kills > 0 || state.deaths > 0;
  return (
    <dl className="grid grid-cols-3 gap-3 font-mono text-sm">
      {[
        ["Dias", state.day],
        ["Abates", state.kills],
        ["Mortes", state.deaths],
      ].map(([label, value]) => (
        <div key={label} className="rounded border border-rust/40 bg-black/40 p-3 text-center">
          <dt className="text-xs tracking-widest text-plate/50 uppercase">{label}</dt>
          <dd className="font-stencil text-3xl text-plate">{value}</dd>
        </div>
      ))}
      <p className="col-span-3 text-plate/70">
        {played ? "Aqui foi treino. Lá dentro, morrer zera a sua árvore de Sobrevivência." : "Você só olhou. Lá dentro, não dá para pular."}
      </p>
    </dl>
  );
}
