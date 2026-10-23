"use client";

import { useState } from "react";
import { useSfx, useSurvival } from "@/components/survival/SurvivalProvider";
import { LANDING_MAP, type RouteSummary } from "@/lib/games/route";
import { GameFrame, type Phase } from "./GameFrame";
import { MapLegend, RouteMapBoard } from "./RouteMapBoard";

const SECONDS_PER_SQUARE = 3; // andar gasta sede e fome
const FEAR_PER_RISKY_STEP = 6; // passar colado numa área infestada assusta

/** Dia 25: sem placa nem estrada segura, trace no mapa de papel (Lazarus Maps) o caminho até o posto. */
export function MapGame() {
  const { dispatch } = useSurvival();
  const play = useSfx();
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [summary, setSummary] = useState<RouteSummary>();

  const start = () => {
    setSummary(undefined);
    setRound((n) => n + 1);
    setPhase("playing");
  };

  const arrive = (s: RouteSummary) => {
    dispatch({ type: "time", seconds: s.steps * SECONDS_PER_SQUARE });
    if (s.nearInfested > 0) dispatch({ type: "fear", amount: s.nearInfested * FEAR_PER_RISKY_STEP });
    setSummary(s);
    setPhase("over");
  };

  return (
    <GameFrame
      title="Lazarus Maps"
      intro={
        <>
          <p>
            O posto militar fica do outro lado do bairro. Não há estrada segura: trace no mapa de papel o seu caminho.
          </p>
          <p className="mt-2 text-plate/50">
            Caminho longo cansa (sede e fome). Passar colado na área infestada dá medo.
          </p>
        </>
      }
      phase={phase}
      result={
        summary && {
          title: summary.nearInfested === 0 ? "Chegou sem sustos" : "Chegou, por pouco",
          text: `${summary.steps} quadrados até o posto${
            summary.nearInfested > 0
              ? `, ${summary.nearInfested} deles colados numa área infestada`
              : ", longe dos infectados"
          }.`,
          tone: summary.nearInfested === 0 ? "good" : "bad",
        }
      }
      onStart={start}
      onSkip={() => setPhase("skipped")}
      retryLabel="Traçar outra rota"
      onRetry={start}
    >
      <div inert={phase !== "playing"} className="lore-paper p-3 text-asphalt-deep sm:p-4">
        <RouteMapBoard
          key={round}
          rows={LANDING_MAP}
          label="Mapa até o posto militar"
          goalLabel="ao posto"
          onArrive={arrive}
          sfx={play}
        />
        <MapLegend
          items={[
            { tile: "=", label: "Estrada" },
            { tile: "W", label: "Água" },
            { tile: "#", label: "Ruínas" },
            { tile: "Z", label: "Área infestada" },
          ]}
        />
      </div>
    </GameFrame>
  );
}
