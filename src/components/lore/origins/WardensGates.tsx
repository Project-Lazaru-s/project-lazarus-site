"use client";

import { useState } from "react";
import { arrivals, entryBaseRules, RETREAT, watchers, watchSlots } from "@/content/origins";
import { entryVerdict, retreatAt, watchVerdict } from "@/lib/lore/origins";
import { continueButton, Hint } from "@/components/lore/game/Gates";
import { useLoreSfx } from "@/components/lore/game/sound";

type Props = { onPass: () => void };

const choice =
  "rounded border-2 border-dashed border-asphalt-deep/40 px-3 py-2 font-hand text-xl hover:border-lazarus hover:text-lazarus disabled:opacity-40 pointer-coarse:min-h-11";

/** Parte I: montar a escala da noite na guarita. */
export function WatchGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [shifts, setShifts] = useState<(string | null)[]>(() => watchSlots.map(() => null));
  const verdict = watchVerdict(shifts);
  const ok = verdict.done && !verdict.problem;

  const assign = (slot: number, id: string) => {
    const next = shifts.map((s, i) => (i === slot ? id : s));
    sfx("lorePencil", 0.3);
    setShifts(next);
    const v = watchVerdict(next);
    if (v.done) sfx(v.problem ? "loreWrong" : "loreCheck", 0.6);
  };

  return (
    <div role="group" aria-label="Escala de vigia" className="mx-auto w-full max-w-xl">
      <div className="lore-paper -rotate-[0.5deg] rounded-sm p-6 text-asphalt-deep shadow-2xl">
        <p className="font-mono text-xs tracking-[0.25em] uppercase opacity-60">Guarita · escala da noite</p>
        <p className="mt-1 text-sm">
          {watchers.map((w, i) => (
            <span key={w.id}>
              {i > 0 && " · "}
              <strong>{w.who}</strong>, {w.line}
            </span>
          ))}
        </p>
        <ul className="mt-4 space-y-3">
          {watchSlots.map((slot, i) => (
            <li key={slot} className="border-b border-asphalt-deep/20 pb-2">
              <p className="font-hand text-2xl leading-none">{slot}</p>
              <div role="radiogroup" aria-label={`Turno: ${slot}`} className="mt-1 flex flex-wrap gap-2">
                {watchers.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    role="radio"
                    aria-checked={shifts[i] === w.id}
                    onClick={() => assign(i, w.id)}
                    className={`rounded border px-3 py-1 text-sm pointer-coarse:min-h-11 ${
                      shifts[i] === w.id ? "border-lazarus bg-lazarus/15 font-semibold" : "border-asphalt-deep/30"
                    }`}
                  >
                    {w.who}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <p aria-live="polite" className={`mt-3 min-h-8 font-hand text-2xl ${ok ? "" : "text-lazarus"}`}>
          {verdict.done && (verdict.problem ?? "Escala fechada. A guarita não fica vazia.")}
        </p>
      </div>
      <div className="mt-6 flex justify-center">
        {ok ? (
          <button type="button" autoFocus onClick={onPass} className={continueButton}>
            Assinar a escala ▸
          </button>
        ) : (
          <Hint>Cubra a noite inteira com três pessoas</Hint>
        )}
      </div>
    </div>
  );
}

const INKS = ["text-lazarus", "text-[#2f5f9e]", "text-[#2f7a3c]", "text-[#7a4fa8]"];

/** Parte II: quem chega ao portão. Cada erro vira uma regra nova no livro, em outra tinta. */
export function EntryGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [index, setIndex] = useState(0);
  const [inspected, setInspected] = useState(false);
  const [rules, setRules] = useState<string[]>([]);
  const arrival = arrivals[index];
  const done = index === arrivals.length;

  const decide = (choice: "entra" | "espera") => {
    const v = entryVerdict(arrival, choice, inspected);
    if (!v.ok) {
      sfx("loreWrong", 0.6);
      if (!rules.includes(v.rule)) {
        sfx("lorePencil", 0.4);
        setRules([...rules, v.rule]);
      }
      return;
    }
    sfx(choice === "entra" ? "loreCheck" : "loreStamp", 0.6);
    setInspected(false);
    setIndex(index + 1);
  };

  return (
    <div role="group" aria-label="Livro de entradas" className="mx-auto grid w-full max-w-3xl gap-4 sm:grid-cols-2">
      <div className="lore-paper rotate-[0.5deg] rounded-sm p-5 text-asphalt-deep shadow-2xl">
        <p className="font-mono text-xs tracking-[0.25em] uppercase opacity-60">
          Portão · {Math.min(index + 1, arrivals.length)}/{arrivals.length}
        </p>
        {done ? (
          <p className="mt-3 font-hand text-2xl leading-tight">O turno acabou. O próximo guarda vai ler o livro.</p>
        ) : (
          <>
            <p className="mt-3 font-stencil text-2xl">{arrival.who}</p>
            <p className="text-sm">{arrival.ask}</p>
            <p className="mt-2 min-h-14 font-hand text-2xl leading-tight">{inspected ? arrival.found : "· · ·"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={inspected}
                onClick={() => {
                  sfx("loreInspect", 0.5);
                  setInspected(true);
                }}
                className={choice}
              >
                Revistar
              </button>
              <button type="button" onClick={() => decide("entra")} className={choice}>
                Abrir o portão
              </button>
              <button type="button" onClick={() => decide("espera")} className={choice}>
                Área de espera
              </button>
            </div>
          </>
        )}
      </div>

      <div className="lore-paper -rotate-1 rounded-sm p-5 text-asphalt-deep shadow-2xl">
        <p className="font-mono text-xs tracking-[0.25em] uppercase opacity-60">Livro de entradas · regras</p>
        <ol aria-label="Regras do portão" aria-live="polite" className="mt-3 list-decimal space-y-1 pl-5">
          {[...entryBaseRules, ...rules].map((r, i) => (
            <li
              key={r}
              className={`font-hand text-xl leading-tight ${i < entryBaseRules.length ? "" : INKS[(i - entryBaseRules.length) % INKS.length]}`}
            >
              {r}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex justify-center sm:col-span-2">
        {done ? (
          <button type="button" autoFocus onClick={onPass} className={continueButton}>
            Passar o turno ▸
          </button>
        ) : (
          <Hint>Cada erro vira uma regra nova</Hint>
        )}
      </div>
    </div>
  );
}

/** Parte III: segurar o portão até o último sobrevivente entrar, e fechar antes da horda. */
export function RetreatGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [holds, setHolds] = useState(0);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const now = retreatAt(holds);

  const fail = (text: string) => {
    sfx("loreWrong", 0.6);
    setResult({ ok: false, text });
  };
  const hold = () => {
    const next = retreatAt(holds + 1);
    setHolds(holds + 1);
    if (next.overrun) {
      sfx("barricadeBreach", 0.6);
      fail("Os infectados alcançaram o portão. Um passo a mais custou a muralha.");
    } else sfx("hordeGroans", 0.25 + (RETREAT.distance - next.distance) * 0.08);
  };
  const close = () => {
    if (now.outside > 0) return fail(`Ficaram ${now.outside} do lado de fora. Fechar cedo demais também tem nome.`);
    sfx("loreStamp", 0.8);
    setResult({ ok: true, text: "Todos dentro. O portão fechou com a horda a dois passos." });
  };
  const retry = () => {
    setHolds(0);
    setResult(null);
  };

  return (
    <div role="group" aria-label="A retirada" className="mx-auto w-full max-w-xl">
      <div className="rounded border border-plate/20 bg-asphalt-deep/95 p-5 text-plate shadow-2xl backdrop-blur sm:p-6">
        <p className="font-mono text-xs tracking-[0.25em] text-sunset uppercase">Portão da retirada</p>
        {/* A rua vista de cima: portão à esquerda, sobreviventes correndo, horda atrás. */}
        <div aria-hidden className="mt-4 flex h-14 items-center gap-1 rounded bg-black/40 px-2 font-mono text-lg">
          <span className="text-sunset">▌</span>
          {Array.from({ length: RETREAT.survivors + RETREAT.distance }, (_, i) => {
            const runner = i < now.outside;
            const horde = !runner && i >= now.outside + Math.max(0, now.distance);
            return (
              <span
                key={i}
                className={`flex-1 text-center ${horde ? "text-lazarus" : runner ? "text-plate" : "opacity-20"}`}
              >
                {runner ? "☻" : horde ? "☠" : "·"}
              </span>
            );
          })}
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded border border-plate/20 p-3">
            <dt className="font-mono text-[11px] tracking-widest uppercase opacity-60">Ainda na rua</dt>
            <dd className="font-stencil text-3xl">{now.outside}</dd>
          </div>
          <div className="rounded border border-plate/20 p-3">
            <dt className="font-mono text-[11px] tracking-widest uppercase opacity-60">Horda a</dt>
            <dd className="font-stencil text-3xl text-lazarus">{Math.max(0, now.distance)} passos</dd>
          </div>
        </dl>
        <p aria-live="polite" className={`mt-4 min-h-6 ${result?.ok ? "text-sunset" : "text-lazarus"}`}>
          {result?.text ?? "Cada vez que você segura, entra mais um, e o barulho puxa a horda."}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {result?.ok ? (
            <button type="button" autoFocus onClick={onPass} className={continueButton}>
              Continuar ▸
            </button>
          ) : result ? (
            <button type="button" autoFocus onClick={retry} className={continueButton}>
              Tentar de novo
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={hold}
                className="rounded border-2 border-sunset px-5 py-3 font-semibold text-sunset hover:bg-sunset/10"
              >
                Segurar o portão
              </button>
              <button type="button" onClick={close} className={continueButton}>
                Fechar o portão
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
