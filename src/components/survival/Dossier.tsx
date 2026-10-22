"use client";

import Link from "next/link";
import { useState } from "react";
import { encodeRun } from "@/lib/survival/runCode";
import { shareText } from "@/lib/survival/survival";
import { DossierCard } from "./DossierCard";
import { useSurvival } from "./SurvivalProvider";

/** Dossiê da partida atual, com link compartilhável que gera um cartão (/dossie/[code]). */
export function Dossier() {
  const { state } = useSurvival();
  const [shared, setShared] = useState(false);
  const path = `/dossie/${encodeRun(state)}`;

  const share = async () => {
    const text = shareText(state, `${window.location.origin}${path}`);
    if (navigator.share) await navigator.share({ text }).catch(() => {});
    else await navigator.clipboard?.writeText(text);
    setShared(true);
  };

  return (
    <DossierCard state={state}>
      <button
        type="button"
        onClick={share}
        className="rounded bg-asphalt-deep px-4 py-2 text-sm font-semibold text-plate hover:bg-asphalt"
      >
        Compartilhar
      </button>
      <Link href={path} className="text-sm underline hover:text-lazarus">
        Ver cartão
      </Link>
      {shared && (
        <span role="status" className="text-sm">
          Copiado. Desafie alguém.
        </span>
      )}
    </DossierCard>
  );
}
