"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { broadcasts, cancela, gangs, inicioDoCaos, roads, threeWays, triageSheet } from "@/content/lore";
import { hotspots, isTuned, RADIO, sharedFacts, signal, triageOptions } from "@/lib/lore/story";

type GateProps = { onPass: (road?: string) => void };

const panel =
  "mx-auto w-full max-w-3xl rounded border border-plate/20 bg-asphalt-deep/95 p-5 shadow-2xl backdrop-blur sm:p-6";
const continueButton =
  "rounded bg-lazarus px-6 py-3 font-semibold text-plate hover:bg-lazarus/85 focus-visible:outline-2 focus-visible:outline-sunset";

function Hint({ children }: { children: string }) {
  return <p className="font-mono text-xs tracking-widest text-sunset uppercase">{children}</p>;
}

/** Ato I: preencher o desfecho com honestidade e carimbar o isolamento. */
export function TriageGate({ onPass }: GateProps) {
  const [reply, setReply] = useState("");
  const [honest, setHonest] = useState(false);
  const [stamped, setStamped] = useState(false);
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const hold = () => {
    setHolding(true);
    timer.current = setTimeout(() => setStamped(true), 700);
  };
  const release = () => {
    setHolding(false);
    clearTimeout(timer.current);
  };

  return (
    <div role="group" aria-label="Ficha de triagem" className="mx-auto w-full max-w-md">
      <div className="lore-paper relative rotate-[-1deg] rounded-sm p-6 text-asphalt-deep shadow-2xl">
        <p className="font-mono text-xs tracking-[0.25em] uppercase opacity-60">Ficha de triagem · plantão noturno</p>
        <dl className="mt-4 space-y-3">
          {triageSheet.fields.slice(0, 2).map((field) => (
            <div key={field.label} className="border-b border-asphalt-deep/20 pb-2">
              <dt className="font-mono text-[11px] tracking-widest uppercase opacity-60">{field.label}</dt>
              <dd className="font-hand text-2xl leading-tight">{field.value}</dd>
            </div>
          ))}
          <div>
            <dt className="font-mono text-[11px] tracking-widest uppercase opacity-60">Desfecho</dt>
            <dd className="mt-2">
              {honest ? (
                <p className="font-hand text-2xl leading-tight">
                  <span className="line-through decoration-lazarus decoration-2">óbito</span>{" "}
                  <span className="text-lazarus">movimento após declaração de óbito</span>
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {triageOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => (option.correct ? setHonest(true) : setReply(option.reply))}
                      className="rounded border-2 border-dashed border-asphalt-deep/40 px-3 py-2 font-hand text-xl hover:border-lazarus hover:text-lazarus"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </dd>
          </div>
        </dl>
        <p aria-live="polite" className="mt-3 min-h-5 text-sm text-lazarus">
          {honest ? "" : reply}
        </p>
        {stamped && (
          <div className="lore-stamp-hit mt-2 inline-block rotate-[-8deg] rounded-sm border-4 border-lazarus/80 bg-plate/60 px-3 py-1 text-center text-lazarus sm:absolute sm:-right-2 sm:bottom-16 sm:mt-0">
            <p className="font-stencil text-lg tracking-wider uppercase">{triageSheet.stamp}</p>
            <p className="max-w-44 text-[11px] leading-tight">{triageSheet.stampNote}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        {!honest ? (
          <Hint>Preencha o desfecho com o que você viu</Hint>
        ) : !stamped ? (
          <button
            type="button"
            onPointerDown={hold}
            onPointerUp={release}
            onPointerLeave={release}
            // Teclado (Enter/Espaço) não segura: carimba direto.
            onClick={(e) => e.detail === 0 && setStamped(true)}
            className="relative touch-none overflow-hidden rounded border-2 border-lazarus px-6 py-3 font-stencil tracking-widest text-lazarus uppercase select-none"
          >
            <span
              aria-hidden
              className={`absolute inset-y-0 left-0 bg-lazarus/30 ${holding ? "w-full transition-[width] duration-700 ease-linear" : "w-0"}`}
            />
            <span className="relative">Segure para carimbar</span>
          </button>
        ) : (
          <button type="button" autoFocus onClick={() => onPass()} className={continueButton}>
            Continuar ▸
          </button>
        )}
      </div>
    </div>
  );
}

/** Troca letras por estática conforme o sinal some. Determinístico, para não piscar a cada render. */
function staticky(text: string, strength: number) {
  return [...text].map((c, i) => (c !== " " && ((i * 7) % 10) / 10 >= strength ? "▒" : c)).join("");
}

/** Ato II: achar o aviso no dial e, depois de ouvir a rota, desligar para poupar bateria. */
export function RadioGate({ onPass }: GateProps) {
  const [freq, setFreq] = useState(RADIO.min + 2.3);
  const [heard, setHeard] = useState(false);
  const strength = heard ? 1 : signal(freq);
  const tuned = heard || isTuned(freq);
  const message = broadcasts.at(-1)!;

  return (
    <div role="group" aria-label="Rádio de emergência" className={`${panel} font-mono text-radio`}>
      <Hint>Sintonize o aviso de emergência</Hint>
      <div className="mt-4 rounded border border-radio/40 bg-black/80 p-4">
        <p className="flex items-center justify-between text-xs text-radio/60">
          <span>AVISO PÚBLICO</span>
          <span>{freq.toFixed(1)} MHz</span>
        </p>
        <p aria-live="polite" className="mt-3 min-h-14 text-lg">
          {tuned ? (
            <>
              {message}
              <span className="mt-2 block text-sm text-plate/60">
                A avenida norte já está bloqueada. A gravação continua repetindo.
              </span>
            </>
          ) : (
            <span aria-hidden>{staticky(message, strength)}</span>
          )}
        </p>
        <label className="mt-4 block text-xs text-radio/60">
          Frequência
          <input
            type="range"
            min={RADIO.min}
            max={RADIO.max}
            step={RADIO.step}
            value={freq}
            onChange={(e) => {
              const next = Number(e.target.value);
              setFreq(next);
              if (isTuned(next)) setHeard(true);
            }}
            className="mt-2 block w-full accent-radio pointer-coarse:h-8"
          />
        </label>
        <div aria-hidden className="mt-2 flex h-2 gap-0.5">
          {Array.from({ length: 20 }, (_, i) => (
            <span key={i} className={`flex-1 rounded-sm ${i / 20 < strength ? "bg-radio" : "bg-radio/15"}`} />
          ))}
        </div>
      </div>
      <div className="mt-5 flex justify-center">
        {tuned ? (
          <button type="button" autoFocus onClick={() => onPass()} className={continueButton}>
            Desligar o rádio (poupar bateria)
          </button>
        ) : (
          <p className="text-xs text-plate/50">Arraste o dial até a estática limpar.</p>
        )}
      </div>
    </div>
  );
}

/** Ato III: examinar o poço, o ônibus e a muralha na ilustração. */
export function InspectGate({ onPass }: GateProps) {
  const [found, setFound] = useState<string[]>([]);
  const done = found.length === hotspots.length;

  return (
    <div role="group" aria-label="Investigar a cena" className={panel}>
      <Hint>{`Examine os três lugares · ${found.length}/${hotspots.length}`}</Hint>
      <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded">
        <Image
          src={inicioDoCaos.acts[2].image}
          alt=""
          fill
          sizes="(min-width: 768px) 48rem, 100vw"
          className="object-cover"
        />
        {hotspots.map((spot) => (
          <button
            key={spot.id}
            type="button"
            aria-label={`Examinar: ${spot.label}`}
            aria-pressed={found.includes(spot.id)}
            onClick={() => !found.includes(spot.id) && setFound([...found, spot.id])}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            className={`absolute size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
              found.includes(spot.id) ? "border-radio bg-radio/20" : "lore-hotspot border-sunset bg-sunset/20"
            }`}
          />
        ))}
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {threeWays.map((way, i) => {
          const seen = found.includes(hotspots[i].id);
          return (
            <li
              key={way.word}
              className={`rounded border p-3 text-sm ${seen ? "border-plate/30" : "border-dashed border-plate/10"}`}
            >
              <p className="font-hand text-2xl text-plate">{seen ? way.word : "?"}</p>
              {seen && (
                <>
                  <p className="font-stencil text-lg text-lazarus">{way.faction}</p>
                  <p className="mt-1 text-plate/70">{way.origin}</p>
                </>
              )}
            </li>
          );
        })}
      </ul>
      {done && (
        <div className="mt-5 flex justify-center">
          <button type="button" autoFocus onClick={() => onPass()} className={continueButton}>
            Continuar ▸
          </button>
        </div>
      )}
    </div>
  );
}

/** Ato IV: marcar, nos dois documentos, o que as duas versões admitem. */
export function CompareGate({ onPass }: GateProps) {
  const [marked, setMarked] = useState<string[]>([]);
  const [warning, setWarning] = useState("");
  const done = sharedFacts.every((f) => marked.includes(f));

  const pick = (line: string) => {
    if (sharedFacts.includes(line)) {
      setWarning("");
      if (!marked.includes(line)) setMarked([...marked, line]);
    } else setWarning("Só um lado diz isso. Procure o que aparece nos dois.");
  };

  return (
    <div role="group" aria-label="Reconstruir a noite" className={panel}>
      <Hint>{`Marque o que as duas versões admitem · ${marked.length}/${sharedFacts.length}`}</Hint>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {cancela.versions.map((version) => {
          // Cada documento mistura fatos e alegações na sua própria ordem.
          const lines =
            version.id === "wardens"
              ? [
                  version.claims[0],
                  sharedFacts[0],
                  sharedFacts[1],
                  version.claims[1],
                  sharedFacts[2],
                  version.claims[2],
                  sharedFacts[3],
                ]
              : [
                  sharedFacts[1],
                  version.claims[0],
                  sharedFacts[3],
                  version.claims[1],
                  sharedFacts[0],
                  sharedFacts[2],
                  version.claims[2],
                ];
          return (
            <div key={version.id} className="lore-paper rounded-sm p-4 text-asphalt-deep">
              <p className="font-mono text-[11px] tracking-widest uppercase opacity-60">
                {version.side} · {version.document}
              </p>
              <p className="font-stencil text-xl">{version.name}</p>
              <ul className="mt-2 space-y-1.5">
                {lines.map((line) => (
                  <li key={line}>
                    <button
                      type="button"
                      onClick={() => pick(line)}
                      className={`w-full rounded px-2 py-1.5 text-left text-sm ${
                        marked.includes(line) ? "bg-radio/30 font-semibold" : "hover:bg-asphalt-deep/10"
                      }`}
                    >
                      {line}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p aria-live="polite" className="mt-3 min-h-5 text-center text-sm text-sunset">
        {done ? "Quem disparou primeiro e para onde foi a carga: ninguém concorda." : warning}
      </p>
      {done && (
        <div className="mt-3 flex justify-center">
          <button type="button" autoFocus onClick={() => onPass()} className={continueButton}>
            Continuar ▸
          </button>
        </div>
      )}
    </div>
  );
}

const TAG_COLORS = ["text-lazarus", "text-sunset", "text-radio", "text-plate"];

/** Ato V: raspar a sujeira das paredes até ler os nomes das gangues. */
export function WallsGate({ onPass }: GateProps) {
  const [seen, setSeen] = useState<number[]>([]);
  const done = seen.length === gangs.length;

  return (
    <div role="group" aria-label="Paredes da cidade" className={panel}>
      <Hint>{`Leia as paredes · ${seen.length}/${gangs.length}`}</Hint>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {gangs.map((gang, i) => (
          <li key={gang}>
            {seen.includes(i) ? (
              <p
                className={`flex h-20 items-center justify-center rounded bg-[#24211d] font-hand text-3xl ${TAG_COLORS[i % 4]}`}
                style={{ rotate: `${((i * 7) % 11) - 5}deg` }}
              >
                {gang}
              </p>
            ) : (
              <button
                type="button"
                aria-label={`Parede ${i + 1}`}
                onClick={() => setSeen([...seen, i])}
                className="h-20 w-full rounded bg-[repeating-linear-gradient(45deg,#2b2823_0_6px,#24211d_6px_12px)] font-mono text-xs text-plate/30 hover:text-plate/60"
              >
                tinta ▒▒▒
              </button>
            )}
          </li>
        ))}
      </ul>
      {done && (
        <div className="mt-5 flex justify-center">
          <button type="button" autoFocus onClick={() => onPass()} className={continueButton}>
            Continuar ▸
          </button>
        </div>
      )}
    </div>
  );
}

/** Ato V: a última folha do caderno. Escolher por onde começar. */
export function RoadGate({ onPass }: GateProps) {
  const [chosen, setChosen] = useState<string>();
  const road = roads.find((r) => r.id === chosen);

  return (
    <div
      role="group"
      aria-label="Três caminhos até a cidade"
      className="lore-paper mx-auto w-full max-w-3xl rounded p-5 text-asphalt-deep shadow-2xl sm:p-6"
    >
      <p className="font-hand text-3xl text-asphalt-deep/70">três caminhos até a cidade</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {roads.map((r) => (
          <label
            key={r.id}
            className="cursor-pointer rounded border-2 border-dashed border-asphalt-deep/40 p-4 transition hover:border-lazarus/60 has-[:checked]:border-solid has-[:checked]:border-lazarus has-[:checked]:bg-lazarus/10"
          >
            <input
              type="radio"
              name="estrada"
              value={r.id}
              checked={chosen === r.id}
              onChange={() => setChosen(r.id)}
              className="sr-only"
            />
            <span className="block font-stencil text-2xl">{r.label}</span>
            <span className="mt-1 block text-sm">{r.detail}</span>
          </label>
        ))}
      </div>
      <p aria-live="polite" className="mt-4 min-h-8 font-hand text-2xl text-lazarus">
        {road?.outcome}
      </p>
      <div className="mt-2 flex justify-center">
        <button
          type="button"
          disabled={!road}
          onClick={() => onPass(chosen)}
          className={`${continueButton} disabled:opacity-40`}
        >
          Seguir por aqui ▸
        </button>
      </div>
    </div>
  );
}
