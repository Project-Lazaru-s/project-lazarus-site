"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";
import { crowbarDoors, gangEmblems, GUTTER_MAP, pickCases, STATIC_DIAL } from "@/content/hostis";
import { tuneStatic } from "@/lib/lore/hostis";
import { MapLegend, RouteMapBoard } from "@/components/games/RouteMapBoard";
import { continueButton, Hint } from "@/components/lore/game/Gates";
import { useLoreSfx } from "@/components/lore/game/sound";

type Props = { onPass: () => void };

const choice =
  "rounded border-2 border-dashed border-asphalt-deep/40 px-3 py-2 font-hand text-xl hover:border-lazarus hover:text-lazarus disabled:opacity-40 pointer-coarse:min-h-11";

/** Moldura comum dos casos: a pichação da gangue e a ficha do caso. */
function CaseSheet({
  id,
  label,
  children,
  footer,
}: {
  id: string;
  label: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div role="group" aria-label={label} className="mx-auto w-full max-w-2xl">
      <div className="lore-paper relative rounded-sm p-5 text-asphalt-deep shadow-2xl sm:p-6">
        <Image
          src={gangEmblems[id]}
          alt=""
          width={96}
          height={96}
          className="absolute -top-8 -right-4 size-20 rotate-6 drop-shadow-lg sm:size-24"
        />
        {children}
      </div>
      <div className="mt-6 flex justify-center">{footer}</div>
    </div>
  );
}

/** Casos de achar a pista: comparar os papéis e apontar o que mudou de intenção. */
export function PickCaseGate({ id, onPass }: Props & { id: keyof typeof pickCases }) {
  const sfx = useLoreSfx();
  const c = pickCases[id];
  const [reply, setReply] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <CaseSheet
      id={id}
      label={`Caso: ${c.question}`}
      footer={
        reply?.ok ? (
          <button type="button" autoFocus onClick={onPass} className={continueButton}>
            Fechar o caso ▸
          </button>
        ) : (
          <Hint>A ferramenta é a mesma; a intenção mudou</Hint>
        )
      }
    >
      <ul className="space-y-2 pr-16">
        {c.docs.map((d) => (
          <li key={d} className="rounded-sm border border-asphalt-deep/20 bg-[#f4f1e8] px-3 py-2 font-mono text-xs">
            {d}
          </li>
        ))}
      </ul>
      <p className="mt-4 font-stencil text-xl">{c.question}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {c.options.map((o) => (
          <button
            key={o.label}
            type="button"
            disabled={reply?.ok}
            onClick={() => {
              sfx(o.ok ? "loreStamp" : "loreWrong", 0.6);
              setReply({ ok: o.ok, text: o.reply });
            }}
            className={choice}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p aria-live="polite" className={`mt-3 min-h-6 font-hand text-2xl ${reply?.ok ? "" : "text-lazarus"}`}>
        {reply?.text}
      </p>
    </CaseSheet>
  );
}

/** Crowbar Saints: separar as marcas de resgate das de cobrança. */
export function CrowbarGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [sorted, setSorted] = useState<Record<string, string>>({});
  const [reply, setReply] = useState("");
  const done = Object.keys(sorted).length === crowbarDoors.length;

  const put = (id: string, bin: "resgate" | "cobranca") => {
    const door = crowbarDoors.find((d) => d.id === id)!;
    if (door.bin !== bin) {
      sfx("loreWrong", 0.6);
      setReply(
        bin === "resgate"
          ? "Marca nova em porta de quem ainda vive ali: é cobrança."
          : "Marca antiga, porta aberta para salvar alguém: é resgate.",
      );
      return;
    }
    sfx("loreCheck", 0.5);
    setReply("");
    setSorted({ ...sorted, [id]: bin });
  };

  return (
    <CaseSheet
      id="crowbar"
      label="Caso: marcas nas portas"
      footer={
        done ? (
          <button type="button" autoFocus onClick={onPass} className={continueButton}>
            Fechar o caso ▸
          </button>
        ) : (
          <Hint>Marcas velhas e marcas novas</Hint>
        )
      }
    >
      <p className="pr-16 font-stencil text-xl">Resgate ou cobrança?</p>
      <ul className="mt-3 space-y-2">
        {crowbarDoors.map((d) => (
          <li key={d.id} className="rounded border border-asphalt-deep/20 p-3">
            <p className="text-sm">{d.label}</p>
            {sorted[d.id] ? (
              <p className="mt-1 font-hand text-xl text-lazarus">
                {sorted[d.id] === "resgate" ? "Resgate" : "Cobrança"}
              </p>
            ) : (
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  aria-label={`Resgate: ${d.label}`}
                  onClick={() => put(d.id, "resgate")}
                  className={choice}
                >
                  Resgate
                </button>
                <button
                  type="button"
                  aria-label={`Cobrança: ${d.label}`}
                  onClick={() => put(d.id, "cobranca")}
                  className={choice}
                >
                  Cobrança
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-lazarus">
        {reply}
      </p>
    </CaseSheet>
  );
}

/** Gutter Kings: achar a rota gratuita apagada do mapa de drenagem. */
export function GutterGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [arrived, setArrived] = useState(false);
  return (
    <CaseSheet
      id="gutter"
      label="Caso: o mapa de drenagem"
      footer={
        arrived ? (
          <button type="button" autoFocus onClick={onPass} className={continueButton}>
            Fechar o caso ▸
          </button>
        ) : (
          <Hint>As galerias pagas terminam em grade</Hint>
        )
      }
    >
      <p className="mb-3 pr-16 text-sm">
        Mapa de drenagem dos Gutter Kings. As galerias com tarifa estão desenhadas a tinta; uma passagem foi apagada.
        Atravesse sem pagar.
      </p>
      <RouteMapBoard
        rows={GUTTER_MAP}
        label="Mapa de drenagem"
        goalLabel="ao outro lado do bloqueio"
        onArrive={() => setArrived(true)}
        sfx={sfx}
      />
      <MapLegend
        items={[
          { tile: "=", label: "Galeria com tarifa" },
          { tile: "~", label: "Rota apagada" },
          { tile: "#", label: "Grade ou concreto" },
        ]}
      />
    </CaseSheet>
  );
}

/** Static: sintonizar o pedido de socorro de verdade, por baixo do anúncio pago. */
export function StaticGate({ onPass }: Props) {
  const sfx = useLoreSfx();
  const [freq, setFreq] = useState<number>(STATIC_DIAL.start);
  const [found, setFound] = useState(false);
  const signal = tuneStatic(freq);

  return (
    <CaseSheet
      id="static"
      label="Caso: a fita da estação"
      footer={
        found ? (
          <button type="button" autoFocus onClick={onPass} className={continueButton}>
            Fechar o caso ▸
          </button>
        ) : (
          <Hint>Tem um anúncio pago gravado por cima</Hint>
        )
      }
    >
      <p className="pr-16 text-sm">
        Uma fita da estação Static: um pedido de socorro autêntico, gravado por cima de um anúncio pago. Ache a
        frequência do pedido.
      </p>
      <p className="mt-3 font-stencil text-4xl tabular-nums">{freq.toFixed(1)} MHz</p>
      <input
        type="range"
        aria-label="Frequência"
        min={STATIC_DIAL.min}
        max={STATIC_DIAL.max}
        step={STATIC_DIAL.step}
        value={freq}
        onChange={(e) => {
          const next = Number(e.target.value);
          setFreq(next);
          const t = tuneStatic(next);
          if (t.locked && t.station.real && !found) {
            sfx("loreRadioTuned", 0.6);
            setFound(true);
          }
        }}
        className="mt-2 w-full accent-lazarus"
      />
      <p aria-live="polite" className="mt-3 min-h-14 rounded bg-black/80 p-3 font-mono text-sm text-radio">
        {signal.locked ? signal.station.text : "▒▒ chiado ▒▒▒▒▒▒▒ ▒▒▒"}
      </p>
      {signal.locked && !signal.station.real && (
        <p className="mt-2 text-sm text-lazarus">Anúncio pago. O pedido de socorro está mais adiante no dial.</p>
      )}
    </CaseSheet>
  );
}
