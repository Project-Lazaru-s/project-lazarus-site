"use client";

import { useState } from "react";
import { cancela } from "@/content/lore";

/** Ato IV: a mesma noite em duas versões. Os fatos em comum ficam; o resto depende de quem conta. */
export function CancelaVersions() {
  const [active, setActive] = useState(cancela.versions[0].id);
  const version = cancela.versions.find((v) => v.id === active)!;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <div className="rounded border border-plate/20 bg-black/40 p-5">
        <p id="fatos-cancela" className="font-mono text-xs tracking-widest text-plate/60 uppercase">
          As duas versões concordam
        </p>
        <ul aria-labelledby="fatos-cancela" className="mt-3 space-y-2">
          {cancela.facts.map((fact) => (
            <li key={fact} className="flex gap-2 text-plate">
              <span aria-hidden className="text-radio">
                ✓
              </span>
              {fact}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-plate/50">Quem disparou primeiro e para onde foi a carga: ninguém concorda.</p>
      </div>

      <div>
        <div role="tablist" aria-label="Versões da noite" className="flex gap-2">
          {cancela.versions.map((v) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              id={`aba-${v.id}`}
              aria-selected={v.id === active}
              aria-controls="versao-cancela"
              onClick={() => setActive(v.id)}
              className={`flex-1 rounded-t border border-b-0 px-3 py-2 text-left text-sm pointer-coarse:min-h-11 ${
                v.id === active
                  ? "border-plate/40 bg-plate text-asphalt-deep"
                  : "border-plate/15 text-plate/60 hover:text-plate"
              }`}
            >
              <span className="block font-mono text-[11px] tracking-widest uppercase opacity-70">{v.side}</span>
              <span className="font-stencil text-lg">{v.name}</span>
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id="versao-cancela"
          aria-labelledby={`aba-${version.id}`}
          key={version.id}
          className="lore-paper rounded-b rounded-tr p-5 text-asphalt-deep"
        >
          <p className="font-mono text-xs tracking-widest uppercase opacity-60">{version.document}</p>
          <ul className="mt-3 space-y-2">
            {version.claims.map((claim) => (
              <li key={claim} className="border-l-2 border-lazarus pl-3">
                {claim}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm font-semibold">Depois daquela noite: {version.consequence}</p>
        </div>
      </div>
    </div>
  );
}
