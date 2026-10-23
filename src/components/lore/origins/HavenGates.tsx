"use client";

import { useState } from "react";
import { childChoices, patients, tradeOffers, WELL_BUCKETS, wellGroups } from "@/content/origins";
import { wellVerdict } from "@/lib/lore/origins";
import { continueButton, Hint } from "@/components/lore/game/Gates";
import { useLoreSfx } from "@/components/lore/game/sound";

type Props = { onPass: () => void };

const choice =
  "rounded border-2 border-dashed border-asphalt-deep/40 px-3 py-2 font-hand text-xl hover:border-lazarus hover:text-lazarus disabled:opacity-40 pointer-coarse:min-h-11";

/** Parte I: dividir os baldes do dia no caderno do poço. Toda divisão justa passa; o caderno diz qual regra ela assume. */
export function WellGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [shares, setShares] = useState<number[]>(() => wellGroups.map(() => 0));
  const left = WELL_BUCKETS - shares.reduce((a, b) => a + b, 0);
  const verdict = wellVerdict(shares);
  const change = (i: number, by: number) => {
    const next = shares.map((n, j) => (j === i ? n + by : n));
    if (next[i] < 0 || (by > 0 && left === 0)) return;
    sfx(by > 0 ? "drink" : "lorePencil", 0.3);
    setShares(next);
    const v = wellVerdict(next);
    if (v.done) sfx(v.ok ? "loreCheck" : "loreWrong", 0.6);
  };

  return (
    <div role="group" aria-label="Caderno do poço" className="mx-auto w-full max-w-md">
      <div className="lore-paper rotate-[0.5deg] rounded-sm p-6 text-asphalt-deep shadow-2xl">
        <p className="font-mono text-xs tracking-[0.25em] uppercase opacity-60">Caderno do poço · baldes de hoje</p>
        <p className="mt-1 font-hand text-2xl" aria-live="polite">
          {left > 0 ? `Sobram ${left} de ${WELL_BUCKETS} baldes` : "Todos os baldes divididos"}
        </p>
        <ul className="mt-4 space-y-3">
          {wellGroups.map((g, i) => (
            <li key={g.id} className="flex items-center gap-3 border-b border-asphalt-deep/20 pb-2">
              <span className="w-32 font-hand text-2xl leading-none">{g.label}</span>
              <button
                type="button"
                aria-label={`Tirar um balde de ${g.label}`}
                disabled={shares[i] === 0}
                onClick={() => change(i, -1)}
                className="size-9 rounded border border-asphalt-deep/40 text-lg disabled:opacity-30 pointer-coarse:size-11"
              >
                −
              </button>
              <span aria-label={`${g.label}: ${shares[i]} baldes`} className="flex-1 font-mono text-sm">
                {"▮".repeat(shares[i]) || "·"}
              </span>
              <button
                type="button"
                aria-label={`Dar um balde para ${g.label}`}
                disabled={left === 0}
                onClick={() => change(i, 1)}
                className="size-9 rounded border border-asphalt-deep/40 text-lg disabled:opacity-30 pointer-coarse:size-11"
              >
                +
              </button>
            </li>
          ))}
        </ul>
        <p
          aria-live="polite"
          className={`mt-4 min-h-8 font-hand text-2xl ${verdict.done && !verdict.ok ? "text-lazarus" : ""}`}
        >
          {verdict.done && (verdict.ok ? `Regra do poço: ${verdict.rule}` : verdict.rule)}
        </p>
      </div>
      <div className="mt-6 flex justify-center">
        {verdict.done && verdict.ok ? (
          <button type="button" autoFocus onClick={onPass} className={continueButton}>
            Assinar a regra ▸
          </button>
        ) : (
          <Hint>Divida os baldes. Não existe divisão perfeita</Hint>
        )}
      </div>
    </div>
  );
}

/** Parte II: examinar quem chega e mandar para a cama ou para trás do lençol. */
export function InfirmaryGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [index, setIndex] = useState(0);
  const [examined, setExamined] = useState(false);
  const [reply, setReply] = useState("");
  const patient = patients[index];
  const done = index === patients.length;

  const send = (ward: "cama" | "febre") => {
    if (ward !== patient.ward) {
      sfx("loreWrong", 0.6);
      setReply(patient.wrong);
      return;
    }
    sfx("loreCheck", 0.6);
    setReply("");
    setExamined(false);
    setIndex(index + 1);
  };

  return (
    <div role="group" aria-label="Triagem da enfermaria" className="mx-auto w-full max-w-md">
      <div className="lore-paper -rotate-1 rounded-sm p-6 text-asphalt-deep shadow-2xl">
        <p className="font-mono text-xs tracking-[0.25em] uppercase opacity-60">
          Enfermaria · {Math.min(index + 1, patients.length)}/{patients.length}
        </p>
        {done ? (
          <p className="mt-3 font-hand text-2xl leading-tight">
            Duas camas ocupadas, dois atrás do lençol. Todos os nomes no caderno.
          </p>
        ) : (
          <>
            <p className="mt-3 font-stencil text-2xl">{patient.who}</p>
            <p className="mt-2 min-h-16 font-hand text-2xl leading-tight">{examined ? patient.sign : "· · ·"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {!examined ? (
                <button
                  type="button"
                  onClick={() => {
                    sfx("loreInspect", 0.5);
                    setExamined(true);
                  }}
                  className={choice}
                >
                  Examinar
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => send("cama")} className={choice}>
                    Cama da enfermaria
                  </button>
                  <button type="button" onClick={() => send("febre")} className={choice}>
                    Observação, atrás do lençol
                  </button>
                </>
              )}
            </div>
          </>
        )}
        <p aria-live="polite" className="mt-3 min-h-5 text-sm text-lazarus">
          {reply}
        </p>
      </div>
      <div className="mt-6 flex justify-center">
        {done ? (
          <button type="button" autoFocus onClick={onPass} className={continueButton}>
            Continuar ▸
          </button>
        ) : (
          <Hint>Examine antes de decidir</Hint>
        )}
      </div>
    </div>
  );
}

/** Parte III: o preço da água para os viajantes, e o que fazer com a criança. */
export function TradeGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [offer, setOffer] = useState<(typeof tradeOffers)[number] | null>(null);
  const [refused, setRefused] = useState("");
  const [child, setChild] = useState<(typeof childChoices)[number] | null>(null);

  return (
    <div role="group" aria-label="Banca de trocas" className="mx-auto w-full max-w-md">
      <div className="lore-paper rotate-[0.5deg] rounded-sm p-6 text-asphalt-deep shadow-2xl">
        <p className="font-mono text-xs tracking-[0.25em] uppercase opacity-60">Banca de trocas · portão do quintal</p>
        <p className="mt-3 font-stencil text-xl">O que pedir pela água?</p>
        {offer ? (
          <p className="mt-2 font-hand text-2xl leading-tight">
            <span className="text-lazarus">{offer.label}.</span> {offer.reply}
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {tradeOffers.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  if (o.ok) {
                    sfx("loreStamp", 0.6);
                    setOffer(o);
                    setRefused("");
                  } else {
                    sfx("loreWrong", 0.6);
                    setRefused(o.reply);
                  }
                }}
                className={choice}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
        <p aria-live="polite" className="mt-2 min-h-5 text-sm text-lazarus">
          {refused}
        </p>

        {offer && (
          <>
            <p className="mt-4 font-stencil text-xl">E a criança no colo?</p>
            {child ? (
              <p className="mt-2 font-hand text-2xl leading-tight">{child.reply}</p>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                {childChoices.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      sfx("loreCheck", 0.6);
                      setChild(c);
                    }}
                    className={`${choice} text-left`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div className="mt-6 flex justify-center">
        {child ? (
          <button type="button" autoFocus onClick={onPass} className={continueButton}>
            Abrir a banca ▸
          </button>
        ) : (
          <Hint>O preço se discute na frente de todos</Hint>
        )}
      </div>
    </div>
  );
}
