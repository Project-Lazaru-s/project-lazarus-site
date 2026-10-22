"use client";

import { useEffect, useRef, useState } from "react";
import { useSfx, useSurvival } from "@/components/survival/SurvivalProvider";
import { heardBy, smoothRadius, VOICE_LEVELS, voiceLevel } from "@/lib/games/voice";
import { startMicrophone, type Microphone } from "@/lib/survival/microphone";
import { GameFrame, type Phase } from "./GameFrame";
import { useGameLoop } from "./useGameLoop";

const ZOMBIES = [4, 9, 15]; // distância de cada infectado, em blocos
const SPAN = 20; // blocos visíveis na cena
const toLeft = (blocks: number) => `${8 + (blocks / SPAN) * 84}%`;
const ringWidth = (radius: number) => `${(radius / SPAN) * 84 * 2}%`;

export function VoiceGame() {
  const { dispatch } = useSurvival();
  const play = useSfx();
  const [phase, setPhase] = useState<Exclude<Phase, "over">>("intro");
  const [noMic, setNoMic] = useState(false);
  const [sensitivity, setSensitivity] = useState(1);
  const [radius, setRadius] = useState(0);
  const [loudest, setLoudest] = useState(0);
  const [heard, setHeard] = useState<number | null>(null);
  const target = useRef(0);
  const mic = useRef<Microphone | null>(null);
  // O callback do microfone vive fora do React; lê a sensibilidade daqui.
  const sensitivityRef = useRef(sensitivity);

  useEffect(() => () => mic.current?.stop(), []);

  const hear = (newRadius: number) => {
    const before = heardBy(ZOMBIES, target.current).filter(Boolean).length;
    if (heardBy(ZOMBIES, newRadius).filter(Boolean).length > before) play("zombieAlert", 0.7);
    target.current = newRadius;
    setRadius((r) => smoothRadius(r, newRadius, 0));
    setLoudest((l) => Math.max(l, newRadius));
  };

  const running = phase === "playing" && heard === null;
  useGameLoop((dt) => setRadius((r) => smoothRadius(r, target.current, dt)), running);

  const start = async () => {
    setHeard(null);
    setLoudest(0);
    hear(0);
    setPhase("playing");
    try {
      mic.current = await startMicrophone((loudness) => hear(voiceLevel(loudness, sensitivityRef.current).radius));
      setNoMic(false);
    } catch {
      setNoMic(true);
    }
  };

  const finish = () => {
    mic.current?.stop();
    mic.current = null;
    const count = heardBy(ZOMBIES, loudest).filter(Boolean).length;
    if (count > 0) dispatch({ type: "fear", amount: count * 10 });
    dispatch({ type: "voice", heard: count });
    setHeard(count);
  };

  const level = VOICE_LEVELS.findLast((l) => radius >= l.radius) ?? VOICE_LEVELS[0];
  const alerted = heardBy(ZOMBIES, radius);

  return (
    <GameFrame
      title="Fale baixo"
      intro={
        <>
          <p>No Project Lazarus, a sua voz no Simple Voice Chat vira ruído no jogo. Teste aqui: fale, sussurre, grite.</p>
          <p className="mt-2 text-plate/50">
            Usa o microfone só enquanto este encontro estiver aberto. O áudio é analisado no seu navegador; nada é
            gravado nem enviado.
          </p>
        </>
      }
      phase={phase === "playing" && heard !== null ? "over" : phase}
      result={
        heard === null
          ? undefined
          : heard === 0
            ? { title: "Ninguém ouviu", text: "Sussurrar chega a 2,5 blocos. É assim que se sobrevive.", tone: "good" }
            : {
                title: `${heard} ouviram`,
                text: `O seu volume mais alto chegou a ${loudest} blocos. Lá dentro, eles viriam atrás de você.`,
                tone: "bad",
              }
      }
      onStart={start}
      onSkip={() => setPhase("skipped")}
      onRetry={start}
    >
      <div role="application" aria-label="Sua voz e os infectados" className="bg-asphalt-deep">
        <div className="relative aspect-[10/3] w-full overflow-hidden bg-[url('/images/game/street-bg.png')] bg-cover pixelated">
          {[2.5, 10, 18].map((r) => (
            <span
              key={r}
              aria-hidden
              className="absolute bottom-[6%] aspect-[3/1] -translate-x-1/2 translate-y-1/2 rounded-[50%] border border-dashed border-plate/15"
              style={{ left: toLeft(0), width: ringWidth(r) }}
            />
          ))}
          {radius > 0 && (
            <span
              aria-hidden
              className={`absolute bottom-[6%] aspect-[3/1] -translate-x-1/2 translate-y-1/2 rounded-[50%] border-2 ${
                radius > 10 ? "border-lazarus bg-lazarus/10" : "border-radio/70 bg-radio/5"
              }`}
              style={{ left: toLeft(0), width: ringWidth(radius) }}
            />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/game/survivor-side.png" alt="Você" className="absolute bottom-[6%] w-[5%] -translate-x-1/2 pixelated" style={{ left: toLeft(0) }} />
          {ZOMBIES.map((d, i) => (
            <div key={d} className="absolute bottom-[6%] w-[5%] -translate-x-1/2" style={{ left: toLeft(d) }}>
              {alerted[i] && <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-stencil text-xl text-lazarus">!</span>}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/game/zombie-side.png" alt="" className={`w-full pixelated ${alerted[i] ? "" : "-scale-x-100"}`} />
            </div>
          ))}
          <span className="absolute top-2 left-3 flex items-center gap-2 rounded bg-black/60 px-2 py-0.5 font-mono text-xs text-radio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/game/mic-wave.png" alt="" className="h-4 w-4 pixelated" />
            <span>{level.name}</span>
            <span className="text-plate/50">{radius > 0 ? `${Math.round(radius * 10) / 10} blocos` : ""}</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-rust/40 p-3 text-sm text-plate">
          {noMic ? (
            <>
              <span className="text-plate/50">Sem microfone? Segure:</span>
              {VOICE_LEVELS.slice(1).map((l) => (
                <button
                  key={l.name}
                  type="button"
                  onPointerDown={() => hear(l.radius)}
                  onPointerUp={() => hear(0)}
                  onPointerLeave={() => hear(0)}
                  className="touch-none rounded border border-plate/30 px-3 py-1.5 select-none active:border-sunset"
                >
                  {{ Sussurro: "Sussurrar", Fala: "Falar", Grito: "Gritar" }[l.name]}
                </button>
              ))}
            </>
          ) : (
            <label className="flex items-center gap-2 text-plate/60">
              Sensibilidade
              <input
                type="range"
                min={0.5}
                max={4}
                step={0.5}
                value={sensitivity}
                onChange={(e) => {
                  sensitivityRef.current = Number(e.target.value);
                  setSensitivity(sensitivityRef.current);
                }}
                className="accent-sunset"
              />
            </label>
          )}
          <button type="button" onClick={finish} disabled={!running} className="ml-auto rounded bg-lazarus px-3 py-1.5 font-semibold disabled:opacity-40">
            Encerrar
          </button>
        </div>
      </div>
    </GameFrame>
  );
}
