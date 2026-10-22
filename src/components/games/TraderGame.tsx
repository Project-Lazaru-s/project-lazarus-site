"use client";

import { useState } from "react";
import { useSfx, useSurvival } from "@/components/survival/SurvivalProvider";
import { items } from "@/content/items";
import { signed } from "@/lib/format";
import {
  confrontHunters,
  isWanted,
  negotiate,
  PARDON_COST,
  type HunterChoice,
  type HunterOutcome,
  type Stance,
} from "@/lib/games/negotiation";
import type { Item } from "@/lib/survival/survival";
import { GameFrame, type Phase } from "./GameFrame";

const WANTS: Item[] = ["antibiotic", "ammo", "food"];

const stanceLabel: Record<Stance, string> = { trade: "Trocar", haggle: "Pechinchar", intimidate: "Intimidar" };

const hunterResults: Record<
  Exclude<HunterOutcome, "refused">,
  { title: string; text: string; tone: "good" | "bad" }
> = {
  won: {
    title: "Esquadrão abatido",
    text: "Três caçadores a menos. Eles deixaram munição. Os Rovers vão mandar outros.",
    tone: "good",
  },
  escaped: { title: "Escapou", text: "Você sumiu antes que te achassem. Por enquanto.", tone: "good" },
  pardoned: {
    title: "Perdoado",
    text: "O Haven aceitou seus suprimentos e falou com os Rovers. Você não é mais procurado.",
    tone: "good",
  },
  killed: { title: "Pego", text: "Os caçadores chegaram à sua última posição. Você morreu.", tone: "bad" },
};

export function TraderGame() {
  const { state: survival, dispatch } = useSurvival();
  const play = useSfx();
  const [phase, setPhase] = useState<Exclude<Phase, "over">>("intro");
  const [want, setWant] = useState<Item>("antibiotic");
  const [offer, setOffer] = useState<Item | null>(null);
  const [line, setLine] = useState("— Tem o que trocar? Fala rápido, que eles escutam.");
  const [ending, setEnding] = useState<{ title: string; text: string; tone: "good" | "bad" } | null>(null);

  const wanted = isWanted(survival.reputation);
  const offerable = survival.inventory.filter((item) => item !== want);
  const currentOffer = offer && offerable.includes(offer) ? offer : null;

  const start = () => {
    setEnding(null);
    setOffer(null);
    setPhase("playing");
  };

  const deal = (stance: Stance) => {
    const result = negotiate(stance, survival.reputation, currentOffer, want, Math.random);
    if (!isWanted(survival.reputation) && isWanted(survival.reputation + result.reputation)) play("huntersArrive");
    dispatch({ type: "deal", deal: result });
    setOffer(null);
    setLine(
      result.success
        ? stance === "intimidate"
          ? `— Leva. Mas os Rovers não esquecem.`
          : `— Fechado. ${items[want].label} é seu.`
        : stance === "intimidate"
          ? "— Você acha que eu tenho medo de você?"
          : "— Isso não vale nada. Some daqui.",
    );
  };

  const confront = (choice: HunterChoice) => {
    const result = confrontHunters(
      choice,
      { inventory: survival.inventory, stealthBest: survival.record.stealthBest },
      Math.random,
    );
    if (result.outcome === "refused") return;
    if (result.outcome === "won") play("gunshot");
    if (result.outcome === "killed") play("deathSting", 0.6);
    dispatch({ type: "hunters", outcome: result.outcome, paid: result.paid });
    setEnding(hunterResults[result.outcome]);
  };

  const leave = () =>
    setEnding(
      survival.inventory.some((item) => WANTS.includes(item))
        ? { title: "Negócio feito", text: "Você segue viagem com o que precisava.", tone: "good" }
        : { title: "De mãos vazias", text: "Nada trocado. Às vezes é melhor assim.", tone: "bad" },
    );

  return (
    <GameFrame
      title="Os Rovers"
      intro={
        <>
          <p>Um comerciante dos Rovers aceita negociar. Troque, pechinche ou intimide, mas a facção lembra de tudo.</p>
          <p className="mt-2 text-plate/50">Com reputação -40 ou pior, eles mandam caçadores de recompensa.</p>
        </>
      }
      phase={phase === "playing" && ending ? "over" : phase}
      result={ending ?? undefined}
      onStart={start}
      onSkip={() => setPhase("skipped")}
      onRetry={start}
      retryLabel="Voltar ao acampamento"
    >
      <div role="application" aria-label="Acampamento dos Rovers" className="bg-asphalt-deep">
        <div className="relative aspect-[16/9] sm:aspect-[10/3] w-full bg-[url('/images/game/camp-bg.png')] bg-cover pixelated">
          {wanted ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src="/images/game/hunter.png"
              alt="Caçador de recompensa"
              className="absolute bottom-[6%] left-[60%] w-[8%] sm:w-[5%] pixelated"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src="/images/game/trader-rovers.png"
              alt="Comerciante dos Rovers"
              className="absolute bottom-[6%] left-[60%] w-[8%] sm:w-[5%] pixelated"
            />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/game/survivor-side.png"
            alt="Você"
            className="absolute bottom-[6%] left-[38%] w-[8%] sm:w-[5%] pixelated"
          />
          <span className="absolute top-2 left-3 rounded bg-black/60 px-2 py-0.5 font-mono text-xs text-plate">
            Rovers {signed(survival.reputation)}
          </span>
        </div>

        {wanted ? (
          <div className="space-y-3 border-t border-lazarus/60 p-4 text-sm">
            <div className="rounded border-2 border-lazarus bg-plate p-3 text-center text-asphalt-deep">
              <h3 className="font-stencil text-3xl text-lazarus">Procurado</h3>
              <p className="text-xs">Pelos Rovers. Caçadores a caminho da sua última posição.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => confront("fight")}
                className="rounded bg-lazarus px-3 py-2 font-semibold text-plate"
              >
                Lutar
              </button>
              <button
                type="button"
                onClick={() => confront("flee")}
                className="rounded border border-plate/40 px-3 py-2 text-plate"
              >
                Fugir
              </button>
              <button
                type="button"
                disabled={survival.inventory.length < PARDON_COST}
                onClick={() => confront("pardon")}
                className="rounded border border-radio/60 px-3 py-2 text-radio disabled:opacity-40"
              >
                Pedir perdão ao Haven ({PARDON_COST} suprimentos)
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 border-t border-rust/40 p-4 text-sm text-plate">
            <p className="font-mono text-plate/80">{line}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-plate/50">Quero:</span>
              {WANTS.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={want === item}
                  onClick={() => setWant(item)}
                  className={`rounded border px-2 py-1 ${want === item ? "border-sunset text-sunset" : "border-plate/20 text-plate/60"}`}
                >
                  {items[item].label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-plate/50">Ofereço:</span>
              {offerable.length === 0 && <span className="text-plate/40">mochila vazia</span>}
              {offerable.map((item, i) => (
                <button
                  key={`${item}-${i}`}
                  type="button"
                  aria-label={`Oferecer ${items[item].label}`}
                  aria-pressed={currentOffer === item}
                  onClick={() => setOffer(item)}
                  className={`flex items-center gap-1 rounded border px-2 py-1 ${
                    currentOffer === item ? "border-sunset text-sunset" : "border-plate/20 text-plate/60"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={items[item].icon} alt="" className="h-4 w-4 pixelated" />
                  {items[item].label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {(["trade", "haggle", "intimidate"] as const).map((stance) => (
                <button
                  key={stance}
                  type="button"
                  disabled={stance !== "intimidate" && !currentOffer}
                  onClick={() => deal(stance)}
                  className={`rounded px-3 py-2 font-semibold disabled:opacity-40 ${
                    stance === "intimidate" ? "border border-lazarus text-lazarus" : "bg-rust text-plate"
                  }`}
                >
                  {stanceLabel[stance]}
                </button>
              ))}
              <button type="button" onClick={leave} className="ml-auto px-3 py-2 text-plate/60 underline">
                Seguir viagem
              </button>
            </div>
          </div>
        )}
      </div>
    </GameFrame>
  );
}
