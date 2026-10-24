"use client";

import { useState } from "react";
import {
  dawnPositions,
  medicineBox,
  passages,
  patrolReplies,
  patrols,
  radioDays,
  SHELTER,
  testimonies,
  WALL_SYMBOLS,
} from "@/content/hostis";
import { patrolVerdict, rationDay } from "@/lib/lore/hostis";
import { continueButton, Hint } from "@/components/lore/game/Gates";
import { useLoreSfx } from "@/components/lore/game/sound";

type Props = { onPass: () => void };

const choice =
  "rounded border-2 border-dashed border-asphalt-deep/40 px-3 py-2 font-hand text-xl hover:border-lazarus hover:text-lazarus disabled:opacity-40 pointer-coarse:min-h-11";
const paper = "lore-paper rounded-sm p-5 text-asphalt-deep shadow-2xl sm:p-6";
const kicker = "font-mono text-xs tracking-[0.25em] uppercase opacity-60";

// ---------- Desertores ----------

/** Parte I: três dias chamando a substituição; depois, a caixa de remédios. */
export function RadioDaysGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [day, setDay] = useState(0);
  const [box, setBox] = useState(false);
  const heard = radioDays.slice(0, day);

  return (
    <div role="group" aria-label="Três dias de rádio" className="mx-auto w-full max-w-xl">
      <div className={`${paper} -rotate-[0.5deg]`}>
        <p className={kicker}>Posto da estrada · rádio de campanha</p>
        <ol className="mt-3 space-y-2">
          {heard.map((d) => (
            <li key={d.day} className="border-b border-asphalt-deep/20 pb-2">
              <p className="font-mono text-[11px] tracking-widest uppercase opacity-60">
                Dia {d.day} · {d.meals} {d.meals === 1 ? "refeição" : "refeições"} por turno
              </p>
              <p className="font-mono text-sm">[RÁDIO] {d.reply}</p>
            </li>
          ))}
        </ol>
        {box && (
          <div className="mt-4">
            <p className="font-stencil text-xl">Caixa de remédios</p>
            <ul aria-label="Caixa de remédios" className="mt-1 grid grid-cols-2 gap-x-4 font-hand text-xl">
              {medicineBox.map((m) => (
                <li key={m.item} className={m.taken ? "text-lazarus line-through" : ""}>
                  {m.item}
                  {m.taken && <span className="sr-only"> (retirado para outra missão)</span>}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm">Metade foi retirada para outra missão. Ninguém repôs.</p>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-center">
        {day < radioDays.length ? (
          <button
            type="button"
            autoFocus
            onClick={() => {
              sfx("radioStatic", 0.4);
              setDay(day + 1);
            }}
            className={continueButton}
          >
            Chamar a substituição (dia {day + 1})
          </button>
        ) : !box ? (
          <button
            type="button"
            autoFocus
            onClick={() => {
              sfx("cabinetSearch", 0.5);
              setBox(true);
            }}
            className={continueButton}
          >
            Abrir a caixa de remédios
          </button>
        ) : (
          <button type="button" autoFocus onClick={onPass} className={continueButton}>
            Continuar ▸
          </button>
        )}
      </div>
    </div>
  );
}

/** Parte II: ouvir as três posições da madrugada e registrar a saída no livro de serviço. */
export function DawnGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [heard, setHeard] = useState<string[]>([]);
  const [signed, setSigned] = useState(false);
  const all = heard.length === dawnPositions.length;

  return (
    <div role="group" aria-label="A madrugada no posto" className="mx-auto w-full max-w-2xl">
      <div className={paper}>
        <p className={kicker}>Livro de serviço · madrugada</p>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {dawnPositions.map((p) => {
            const open = heard.includes(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => {
                    if (open) return;
                    sfx("lorePage", 0.4);
                    setHeard([...heard, p.id]);
                  }}
                  className="h-full w-full rounded border-2 border-asphalt-deep/30 p-3 text-left pointer-coarse:min-h-11"
                >
                  <span className="block font-stencil text-lg">Ouvir {p.who.toLowerCase()}</span>
                  <span className="mt-1 block font-hand text-xl leading-tight">{open ? `“${p.says}”` : "· · ·"}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {signed && (
          <p className="mt-4 font-hand text-2xl leading-tight text-lazarus">
            Saíram seis soldados com armas, mapa, rádio e parte das caixas. Prometeram voltar.
          </p>
        )}
      </div>
      <div className="mt-6 flex justify-center">
        {!all ? (
          <Hint>A discussão termina sem vencedor</Hint>
        ) : !signed ? (
          <button
            type="button"
            autoFocus
            onClick={() => {
              sfx("loreStamp", 0.6);
              setSigned(true);
            }}
            className={continueButton}
          >
            Registrar a saída
          </button>
        ) : (
          <button type="button" autoFocus onClick={onPass} className={continueButton}>
            Continuar ▸
          </button>
        )}
      </div>
    </div>
  );
}

/** Parte III: quatro grupos de farda na estrada. Patrulha de verdade ou desertores? */
export function PatrolGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [index, setIndex] = useState(0);
  const [reply, setReply] = useState("");
  const patrol = patrols[index];
  const done = index === patrols.length;

  const judge = (answer: "military" | "desertores") => {
    if (!patrolVerdict(patrol.id, answer)) {
      sfx("loreWrong", 0.6);
      setReply(patrolReplies[patrol.answer]);
      return;
    }
    sfx("loreCheck", 0.6);
    setReply("");
    setIndex(index + 1);
  };

  return (
    <div role="group" aria-label="Patrulha ou desertores" className="mx-auto w-full max-w-xl">
      <div className={`${paper} rotate-[0.5deg]`}>
        <p className={kicker}>
          Na estrada · {Math.min(index + 1, patrols.length)}/{patrols.length}
        </p>
        {done ? (
          <p className="mt-3 font-hand text-2xl leading-tight">
            Identificação, recibo e propósito. O uniforme sozinho não diz nada.
          </p>
        ) : (
          <>
            <p className="mt-3 font-stencil text-2xl">{patrol.who}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 font-hand text-xl leading-tight">
              {patrol.signs.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => judge("military")} className={choice}>
                Patrulha Military
              </button>
              <button type="button" onClick={() => judge("desertores")} className={choice}>
                Desertores
              </button>
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
          <Hint>De longe, parecem iguais</Hint>
        )}
      </div>
    </div>
  );
}

// ---------- The Hollow ----------

/** Parte I: riscar as porções do dia na parede até a conta parar de fechar. */
export function TallyGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [stock, setStock] = useState<number>(SHELTER.stock);
  const [days, setDays] = useState<{ size: "inteira" | "meia"; marks: number }[]>([]);
  const [broken, setBroken] = useState(false);

  const divide = (size: "inteira" | "meia") => {
    const next = rationDay(stock, size);
    if (!next.closes) {
      sfx("loreWrong", 0.6);
      setBroken(true);
      return;
    }
    sfx("lorePencil", 0.4);
    setDays([...days, { size, marks: stock - next.stock }]);
    setStock(next.stock);
  };

  return (
    <div role="group" aria-label="A conta na parede" className="mx-auto w-full max-w-xl">
      <div className="rounded border border-plate/20 bg-[#2b2724] p-5 text-plate shadow-2xl sm:p-6">
        <p className="font-mono text-xs tracking-[0.25em] text-sunset uppercase">Parede do subsolo</p>
        <p className="mt-2 text-sm text-plate/80">
          {SHELTER.people} pessoas · restam <strong>{stock}</strong> porções na despensa
        </p>
        <ol aria-label="Dias riscados" className="mt-3 space-y-1 font-mono text-sm">
          {days.map((d, i) => (
            <li key={i}>
              Dia {i + 1}: <span className="tracking-widest text-plate/90">{"|".repeat(d.marks)}</span>{" "}
              <span className="text-plate/50">({d.size === "inteira" ? "porção inteira" : "meia porção"})</span>
            </li>
          ))}
        </ol>
        <p aria-live="polite" className="mt-3 min-h-8 font-hand text-2xl text-lazarus">
          {broken && `Dia ${days.length + 1}: a conta não fecha. Ninguém veio.`}
        </p>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {broken ? (
          <button type="button" autoFocus onClick={onPass} className={continueButton}>
            Continuar ▸
          </button>
        ) : (
          <>
            <button type="button" onClick={() => divide("inteira")} className={continueButton}>
              Riscar porção inteira (dia {days.length + 1})
            </button>
            <button
              type="button"
              onClick={() => divide("meia")}
              className="rounded border-2 border-sunset px-5 py-3 font-semibold text-sunset hover:bg-sunset/10"
            >
              Meia porção
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** Parte II: marcar só o que os dois relatos admitem. */
export function TestimonyGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [marked, setMarked] = useState<string[]>([]);
  const [reply, setReply] = useState("");
  const needed = testimonies.filter((t) => t.both).length;
  const done = marked.length === needed;

  return (
    <div role="group" aria-label="Duas versões" className="mx-auto w-full max-w-xl">
      <div className={paper}>
        <p className={kicker}>
          O que os dois admitem · {marked.length}/{needed}
        </p>
        <ul className="mt-3 space-y-2">
          {testimonies.map((t) => {
            const on = marked.includes(t.text);
            return (
              <li key={t.text}>
                <button
                  type="button"
                  aria-pressed={on}
                  disabled={on || done}
                  onClick={() => {
                    if (!t.both) {
                      sfx("loreWrong", 0.6);
                      setReply(t.reply);
                      return;
                    }
                    sfx("lorePencil", 0.4);
                    setReply("");
                    setMarked([...marked, t.text]);
                  }}
                  className={`${choice} w-full text-left ${on ? "border-lazarus text-lazarus line-through decoration-2" : ""}`}
                >
                  {t.text}
                </button>
              </li>
            );
          })}
        </ul>
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
          <Hint>Uma escapou, o outro foi capturado</Hint>
        )}
      </div>
    </div>
  );
}

/** Parte III: atravessar o oco do prédio sem seguir as velas e raspar a parede do subsolo. */
export function LightGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [step, setStep] = useState(0);
  const [reply, setReply] = useState("");
  const [scraped, setScraped] = useState<number[]>([]);
  const through = step === passages.length;
  const clean = scraped.length === WALL_SYMBOLS;

  return (
    <div role="group" aria-label="O oco do prédio" className="mx-auto w-full max-w-xl">
      <div className="rounded border border-plate/20 bg-[#141210] p-5 text-plate shadow-2xl sm:p-6">
        {!through ? (
          <>
            <p className="font-mono text-xs tracking-[0.25em] text-sunset uppercase">
              Passagem {step + 1}/{passages.length}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {/* A ordem alterna para a vela não ficar sempre do mesmo lado. */}
              {(step % 2 ? ["lure", "safe"] : ["safe", "lure"]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    if (k === "lure") {
                      sfx("hordeGroans", 0.3);
                      setReply("As velas levam ao covil. Você volta ao começo, devagar.");
                      setStep(0);
                      return;
                    }
                    sfx("lorePencil", 0.3);
                    setReply("");
                    setStep(step + 1);
                  }}
                  className="rounded border-2 border-dashed border-plate/30 px-3 py-3 text-left hover:border-sunset pointer-coarse:min-h-11"
                >
                  {passages[step][k as "safe" | "lure"]}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="font-mono text-xs tracking-[0.25em] text-sunset uppercase">Parede do primeiro subsolo</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {Array.from({ length: WALL_SYMBOLS }, (_, i) => {
                const done = scraped.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    aria-label={done ? `Trecho ${i + 1} raspado` : `Raspar o trecho ${i + 1}`}
                    disabled={done}
                    onClick={() => {
                      sfx("loreSpray", 0.3);
                      setScraped([...scraped, i]);
                    }}
                    className={`flex h-16 items-center justify-center rounded font-mono text-lg ${
                      done ? "bg-[#cfc6b4] tracking-[0.3em] text-asphalt-deep" : "bg-[#3a1d1a] text-lazarus"
                    }`}
                  >
                    {done ? "||||" : "✶"}
                  </button>
                );
              })}
            </div>
            {clean && (
              <p className="mt-3 font-hand text-2xl leading-tight text-sunset">
                Por baixo dos símbolos, só contas de porções. Gente fez isso.
              </p>
            )}
          </>
        )}
        <p aria-live="polite" className="mt-3 min-h-5 text-sm text-lazarus">
          {reply}
        </p>
      </div>
      <div className="mt-6 flex justify-center">
        {clean ? (
          <button type="button" autoFocus onClick={onPass} className={continueButton}>
            Continuar ▸
          </button>
        ) : (
          <Hint>{through ? "Raspe os símbolos da parede" : "Não siga a luz"}</Hint>
        )}
      </div>
    </div>
  );
}
