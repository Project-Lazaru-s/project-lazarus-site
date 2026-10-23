"use client";

import { useState } from "react";
import { blockBuildings, ledger, orderChoices } from "@/content/origins";
import { ledgerBalance, quarantineVerdict } from "@/lib/lore/origins";
import { continueButton, Hint } from "@/components/lore/game/Gates";
import { useLoreSfx } from "@/components/lore/game/sound";

type Props = { onPass: () => void };

const choice =
  "rounded border-2 border-dashed border-asphalt-deep/40 px-3 py-2 font-hand text-xl hover:border-lazarus hover:text-lazarus disabled:opacity-40 pointer-coarse:min-h-11";

/** Parte I: ler o relatório da quadra e marcar só os prédios com sinal de infecção. */
export function QuarantineGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [marked, setMarked] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<ReturnType<typeof quarantineVerdict> | null>(null);

  const toggle = (id: string) => {
    sfx("loreSpray", 0.4);
    setVerdict(null);
    setMarked(marked.includes(id) ? marked.filter((x) => x !== id) : [...marked, id]);
  };
  const submit = () => {
    const v = quarantineVerdict(marked);
    sfx(v.ok ? "loreStamp" : "loreWrong", 0.6);
    setVerdict(v);
  };

  return (
    <div role="group" aria-label="Quarentena da quadra" className="mx-auto w-full max-w-3xl">
      <div className="lore-paper rounded-sm p-5 text-asphalt-deep shadow-2xl sm:p-6">
        <p className="font-mono text-xs tracking-[0.25em] uppercase opacity-60">Relatório da patrulha · quadra 4</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {blockBuildings.map((b) => {
            const on = marked.includes(b.id);
            return (
              <li key={b.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={`${on ? "Tirar a marca de" : "Marcar"} ${b.label}`}
                  onClick={() => toggle(b.id)}
                  className={`relative h-full w-full overflow-hidden rounded border-2 p-3 text-left pointer-coarse:min-h-11 ${
                    on ? "border-lazarus bg-lazarus/10" : "border-asphalt-deep/30"
                  }`}
                >
                  <span className="block font-stencil text-xl">{b.label}</span>
                  <span className="block text-sm leading-snug">{b.report}</span>
                  {on && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 flex items-center justify-center font-stencil text-7xl text-lazarus/45"
                    >
                      X
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <p
          aria-live="polite"
          className={`mt-4 min-h-8 font-hand text-2xl ${verdict && !verdict.ok ? "text-lazarus" : ""}`}
        >
          {verdict && (verdict.ok ? "Três marcas. Ninguém abre esses prédios sem proteção." : verdict.reply)}
        </p>
      </div>
      <div className="mt-6 flex justify-center gap-3">
        {verdict?.ok ? (
          <button type="button" autoFocus onClick={onPass} className={continueButton}>
            Continuar ▸
          </button>
        ) : (
          <>
            <Hint>Marque só onde há sinal de infecção</Hint>
            <button type="button" disabled={marked.length === 0} onClick={submit} className={continueButton}>
              Entregar o relatório
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const ORDERS = ["EVACUAR O POSTO IMEDIATAMENTE.", "NÃO ABANDONAR A BARREIRA. AGUARDAR INSTRUÇÕES."];

/** Parte II: duas ordens incompatíveis pela mesma frequência, e uma rua interna ainda cheia. */
export function OrdersGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [heard, setHeard] = useState(0);
  const [reply, setReply] = useState<{ ok: boolean; text: string } | null>(null);
  const [answered, setAnswered] = useState(false);

  return (
    <div role="group" aria-label="Duas ordens no rádio" className="mx-auto w-full max-w-xl">
      <div className="lore-paper rotate-[0.5deg] rounded-sm p-6 text-asphalt-deep shadow-2xl">
        <p className="font-mono text-xs tracking-[0.25em] uppercase opacity-60">Quadro de avisos · tenda de comando</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {ORDERS.map((order, i) => (
            <p
              key={order}
              className={`min-h-20 rounded-sm border border-asphalt-deep/30 bg-[#f4f1e8] p-3 font-mono text-xs shadow ${
                i % 2 ? "rotate-2" : "-rotate-2"
              }`}
            >
              {heard > i ? (
                <>
                  <span className="block opacity-50">ORDEM · FREQ. DO COMANDO</span>
                  {order}
                </>
              ) : (
                <span className="opacity-40">· · ·</span>
              )}
            </p>
          ))}
        </div>

        {heard >= ORDERS.length && !reply?.ok && (
          <div className="mt-5">
            <p className="font-stencil text-xl">Ainda há civis na rua interna. O que o posto faz?</p>
            <div className="mt-2 flex flex-col gap-2">
              {orderChoices.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    sfx(c.ok ? "loreCheck" : "loreWrong", 0.6);
                    setReply({ ok: c.ok, text: c.reply });
                  }}
                  className={`${choice} text-left`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <p aria-live="polite" className={`mt-3 min-h-6 font-hand text-2xl ${reply?.ok ? "" : "text-lazarus"}`}>
          {reply?.text}
        </p>
        {answered && <p className="font-mono text-sm opacity-70">[RÁDIO] … estática. Ninguém responde.</p>}
      </div>

      <div className="mt-6 flex justify-center">
        {heard < ORDERS.length ? (
          <button
            type="button"
            autoFocus
            onClick={() => {
              sfx("radioStatic", 0.4);
              setHeard(heard + 1);
            }}
            className={continueButton}
          >
            {heard === 0 ? "Ouvir o rádio" : "Ouvir a próxima transmissão"}
          </button>
        ) : !reply?.ok ? (
          <Hint>As duas ordens vieram da mesma frequência</Hint>
        ) : !answered ? (
          <button
            type="button"
            autoFocus
            onClick={() => {
              sfx("loreRadioOff", 0.5);
              setAnswered(true);
            }}
            className={continueButton}
          >
            Confirmar pela frequência
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

/** Parte III: fechar a conta do livro de estoque, filtro por filtro, dose por dose. */
export function DosesGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(ledger.map((l) => [l.id, l.start])),
  );
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const change = (id: string, by: number) => {
    sfx("lorePencil", 0.25);
    setResult(null);
    setCounts({ ...counts, [id]: Math.max(0, counts[id] + by) });
  };
  const close = () => {
    const wrong = ledger.find((l) => counts[l.id] !== ledgerBalance(l.id));
    sfx(wrong ? "loreWrong" : "loreStamp", 0.6);
    setResult(
      wrong
        ? { ok: false, text: `${wrong.label}: a conta não fecha. Confira o livro linha por linha.` }
        : { ok: true, text: "A conta fecha. A última dose fica guardada, com destinatário a definir." },
    );
  };

  return (
    <div role="group" aria-label="Livro de estoque" className="mx-auto w-full max-w-2xl">
      <div className="lore-paper -rotate-[0.5deg] rounded-sm p-5 text-asphalt-deep shadow-2xl sm:p-6">
        <p className="font-mono text-xs tracking-[0.25em] uppercase opacity-60">Livro de estoque · tenda médica</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {ledger.map((l) => (
            <section key={l.id} aria-label={l.label} className="rounded border border-asphalt-deep/20 p-3">
              <p className="font-stencil text-xl">{l.label}</p>
              <ul className="mt-2 space-y-1 font-hand text-xl leading-tight">
                <li>Início do mês: {l.start}</li>
                {l.entries.map((e) => (
                  <li key={e.text}>
                    <span className={e.delta < 0 ? "text-lazarus" : "text-[#2f7a3c]"}>
                      {e.delta > 0 ? `+${e.delta}` : e.delta}
                    </span>{" "}
                    {e.text}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center gap-3 border-t border-asphalt-deep/20 pt-3">
                <span className="text-sm font-semibold">Restam</span>
                <button
                  type="button"
                  aria-label={`Menos ${l.label.toLowerCase()}`}
                  onClick={() => change(l.id, -1)}
                  className="size-9 rounded border border-asphalt-deep/40 text-lg pointer-coarse:size-11"
                >
                  −
                </button>
                <output aria-label={`${l.label} restantes`} className="w-8 text-center font-stencil text-2xl">
                  {counts[l.id]}
                </output>
                <button
                  type="button"
                  aria-label={`Mais ${l.label.toLowerCase()}`}
                  onClick={() => change(l.id, 1)}
                  className="size-9 rounded border border-asphalt-deep/40 text-lg pointer-coarse:size-11"
                >
                  +
                </button>
              </div>
            </section>
          ))}
        </div>
        <p
          aria-live="polite"
          className={`mt-4 min-h-8 font-hand text-2xl ${result && !result.ok ? "text-lazarus" : ""}`}
        >
          {result?.text}
        </p>
      </div>
      <div className="mt-6 flex justify-center">
        {result?.ok ? (
          <button type="button" autoFocus onClick={onPass} className={continueButton}>
            Assinar o livro ▸
          </button>
        ) : (
          <button type="button" onClick={close} className={continueButton}>
            Fechar a conta
          </button>
        )}
      </div>
    </div>
  );
}
