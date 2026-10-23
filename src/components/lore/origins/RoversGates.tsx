"use client";

import { useState } from "react";
import { BUS_SEATS, type BusPart, busNeeds, candidates, parkedCars } from "@/content/origins";
import { crewVerdict, returnMap, ROVERS_MAP } from "@/lib/lore/origins";
import type { Cell, RouteSummary } from "@/lib/games/route";
import { MapLegend, RouteMapBoard } from "@/components/games/RouteMapBoard";
import { continueButton, Hint } from "@/components/lore/game/Gates";
import { useLoreSfx } from "@/components/lore/game/sound";

type Props = { onPass: () => void };

const choice =
  "rounded border-2 border-dashed border-asphalt-deep/40 px-3 py-2 font-hand text-xl hover:border-lazarus hover:text-lazarus disabled:opacity-40 pointer-coarse:min-h-11";

const PART_LABEL: Record<BusPart, string> = {
  bateria: "Bateria",
  correia: "Correia",
  pneu: "Pneu",
  combustivel: "Combustível",
};

/** Parte I: revistar os três carros parados e tirar deles só o que presta para o ônibus. */
export function BusGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [car, setCar] = useState<(typeof parkedCars)[number]["id"] | null>(null);
  const [taken, setTaken] = useState<BusPart[]>([]);
  const [reply, setReply] = useState("");
  const [seats, setSeats] = useState(false);
  const ready = busNeeds.every((p) => taken.includes(p));
  const opened = parkedCars.find((c) => c.id === car);

  return (
    <div role="group" aria-label="Tirar o ônibus da avenida" className="mx-auto w-full max-w-xl">
      <div className="lore-paper -rotate-[0.5deg] rounded-sm p-6 text-asphalt-deep shadow-2xl">
        <p className="font-mono text-xs tracking-[0.25em] uppercase opacity-60">Diário de oficina · o ônibus</p>
        <ul aria-label="O que o ônibus precisa" className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-hand text-2xl">
          {busNeeds.map((p) => (
            <li key={p} className={taken.includes(p) ? "text-lazarus line-through decoration-2" : ""}>
              {taken.includes(p) ? "✓" : "□"} {PART_LABEL[p]}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-2">
          {parkedCars.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={car === c.id}
              onClick={() => {
                sfx("cabinetSearch", 0.4);
                setCar(c.id);
                setReply("");
              }}
              className={`${choice} ${car === c.id ? "border-lazarus text-lazarus" : ""}`}
            >
              Revistar {c.label.toLowerCase()}
            </button>
          ))}
        </div>

        {opened && (
          <ul aria-label={`Peças de ${opened.label.toLowerCase()}`} className="mt-4 space-y-2">
            {opened.parts.map((p) => (
              <li key={p.part} className="flex items-center justify-between gap-3 border-b border-asphalt-deep/20 pb-2">
                <span className="font-hand text-2xl">{p.label}</span>
                <button
                  type="button"
                  disabled={taken.includes(p.part)}
                  onClick={() => {
                    if (!p.ok) {
                      sfx("loreWrong", 0.6);
                      setReply(p.note);
                      return;
                    }
                    sfx("loreCheck", 0.6);
                    setReply(p.note);
                    setTaken([...taken, p.part]);
                  }}
                  className="rounded border border-asphalt-deep/40 px-3 py-1 text-sm disabled:opacity-40 pointer-coarse:min-h-11"
                >
                  {taken.includes(p.part) ? "já no ônibus" : `Pegar ${p.label.toLowerCase()}`}
                </button>
              </li>
            ))}
          </ul>
        )}
        <p aria-live="polite" className="mt-3 min-h-5 text-sm text-lazarus">
          {reply}
        </p>
        {seats && (
          <p className="font-hand text-2xl leading-tight">
            Bancos do fundo arrancados: espaço para ferramentas e água.
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        {!ready ? (
          <Hint>Revise os carros. Nem toda peça presta</Hint>
        ) : !seats ? (
          <button
            type="button"
            autoFocus
            onClick={() => {
              sfx("barricadeBreach", 0.4);
              setSeats(true);
            }}
            className={continueButton}
          >
            Arrancar os bancos do fundo
          </button>
        ) : (
          <button type="button" autoFocus onClick={onPass} className={continueButton}>
            Dar a partida ▸
          </button>
        )}
      </div>
    </div>
  );
}

/** Parte II: quatro lugares fixos no ônibus. Quem fica precisa mantê-lo andando. */
export function CrewGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [crew, setCrew] = useState<string[]>([]);
  const verdict = crewVerdict(crew);
  const ok = verdict.done && verdict.missing.length === 0;

  const toggle = (id: string) => {
    const next = crew.includes(id) ? crew.filter((x) => x !== id) : crew.length < BUS_SEATS ? [...crew, id] : crew;
    if (next === crew) return;
    sfx("lorePencil", 0.3);
    setCrew(next);
    const v = crewVerdict(next);
    if (v.done) sfx(v.missing.length ? "loreWrong" : "loreCheck", 0.6);
  };

  return (
    <div role="group" aria-label="A tripulação do ônibus" className="mx-auto w-full max-w-xl">
      <div className="lore-paper rotate-[0.5deg] rounded-sm p-6 text-asphalt-deep shadow-2xl">
        <p className="font-mono text-xs tracking-[0.25em] uppercase opacity-60">
          Lugares fixos no ônibus · {crew.length}/{BUS_SEATS}
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {candidates.map((c) => {
            const aboard = crew.includes(c.id);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={aboard}
                  onClick={() => toggle(c.id)}
                  className={`h-full w-full rounded border-2 p-3 text-left pointer-coarse:min-h-11 ${
                    aboard ? "border-lazarus bg-lazarus/10" : "border-dashed border-asphalt-deep/40"
                  }`}
                >
                  <span className="block font-stencil text-xl">
                    {aboard ? "✓ " : ""}
                    {c.who}
                  </span>
                  <span className="block text-sm leading-snug">{c.line}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p aria-live="polite" className={`mt-4 min-h-8 font-hand text-2xl ${ok ? "" : "text-lazarus"}`}>
          {verdict.done &&
            (ok
              ? "Quem dirige, quem conserta, quem negocia e quem escuta. Os outros acompanham parte do caminho."
              : `Falta a bordo quem saiba ${verdict.missing.join(" e ")}.`)}
        </p>
      </div>
      <div className="mt-6 flex justify-center">
        {ok ? (
          <button type="button" autoFocus onClick={onPass} className={continueButton}>
            Fechar a tripulação ▸
          </button>
        ) : (
          <Hint>Escolha quem mantém o ônibus andando</Hint>
        )}
      </div>
    </div>
  );
}

const LEGEND = [
  { tile: "=", label: "Avenida" },
  { tile: "R", label: "Rota marcada" },
  { tile: "~", label: "Névoa" },
  { tile: "W", label: "Água" },
  { tile: "Z", label: "Área infestada" },
  { tile: "X", label: "Infectados que seguiram o ônibus" },
];

/** Parte III: traçar a ida até o posto e, com a rua da ida tomada, uma volta diferente até o pátio. */
export function ReturnGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [ida, setIda] = useState<{ path: Cell[]; summary: RouteSummary } | null>(null);
  const [volta, setVolta] = useState<RouteSummary | null>(null);

  return (
    <div
      role="group"
      aria-label="Volta garantida"
      className="lore-paper mx-auto w-full max-w-3xl rounded p-4 text-asphalt-deep shadow-2xl sm:p-6"
    >
      <p className="font-hand text-3xl text-asphalt-deep/70">{ida ? "a volta" : "a ida"}</p>
      <p className="mb-3 text-sm">
        {ida
          ? "O motor atraiu os infectados para a rua da ida. Trace outra linha, do posto de volta ao pátio."
          : "Do pátio de carga (você) ao posto de combustível. Trace a ida a lápis."}
      </p>
      {ida ? (
        <RouteMapBoard
          key="volta"
          rows={returnMap(ROVERS_MAP, ida.path)}
          label="Mapa da volta"
          goalLabel="ao pátio"
          onArrive={setVolta}
          sfx={sfx}
        />
      ) : (
        <RouteMapBoard
          key="ida"
          rows={ROVERS_MAP}
          label="Mapa da ida"
          goalLabel="ao posto"
          onArrive={(summary, path) => setIda({ path, summary })}
          sfx={sfx}
        />
      )}
      <MapLegend items={ida ? LEGEND : LEGEND.slice(0, -1)} />
      {volta && ida && (
        <div aria-live="polite" className="mt-4 rounded border-2 border-lazarus/60 bg-lazarus/10 p-4">
          <p className="font-stencil text-2xl">
            Ida {ida.summary.steps} · volta {volta.steps} quadrados
          </p>
          <p className="font-hand text-2xl text-lazarus">Entrega prometida: uma linha para ir, outra para voltar.</p>
          <div className="mt-3 flex justify-center">
            <button type="button" autoFocus onClick={onPass} className={continueButton}>
              Registrar a rota ▸
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
