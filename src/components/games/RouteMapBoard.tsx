"use client";

import { type KeyboardEvent, type PointerEvent, useRef, useState } from "react";
import { type Cell, drawTo, gps, parseMap, reached, type RouteSummary, step, summarize } from "@/lib/games/route";
import type { SoundName } from "@/lib/survival/sfx";

// Cores de mapa vanilla, puxadas para o papel do caderno.
const TILE_COLOR: Record<string, string> = {
  ".": "#8aa45a",
  S: "#8aa45a",
  G: "#8aa45a",
  "=": "#a29a8a",
  P: "#7f9fb8",
  R: "#b98a5c",
  "~": "#cfcabd",
  W: "#4f74a8",
  "#": "#5e5044",
  Z: "#55632b",
};

/** As 8 cores da paleta do Lazarus Maps, para anotar o mapa. */
export const PALETTE = ["#a3201c", "#e07a2e", "#e3c443", "#5aa83f", "#3fa8a0", "#3f6fb0", "#7a4fa8", "#f2eee4"];

const KEYS: Record<string, Cell> = {
  ArrowUp: { r: -1, c: 0 },
  ArrowDown: { r: 1, c: 0 },
  ArrowLeft: { r: 0, c: -1 },
  ArrowRight: { r: 0, c: 1 },
};

type Props = {
  rows: string[];
  label: string;
  /** Destino com a preposição, para "Você chegou à cidade" ("à cidade", "ao posto"). */
  goalLabel: string;
  onArrive: (summary: RouteSummary) => void;
  sfx?: (name: SoundName, volume?: number) => void;
};

/** Mapa de papel do Lazarus Maps: traço a lápis (mouse, toque ou setas), anotações coloridas e GPS. */
export function RouteMapBoard({ rows, label, goalLabel, onArrive, sfx = () => {} }: Props) {
  const map = parseMap(rows);
  const [path, setPath] = useState<Cell[]>([map.start]);
  const [marks, setMarks] = useState<{ cell: Cell; color: string }[]>([]);
  const [tool, setTool] = useState<"lapis" | "marca">("lapis");
  const [color, setColor] = useState(PALETTE[0]);
  const [cursor, setCursor] = useState<Cell | null>(null);
  const board = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const lastPencil = useRef(0);

  const arrived = reached(map, path);

  const commit = (next: Cell[], now: number) => {
    if (next === path) return;
    if (now - lastPencil.current > 220) {
      lastPencil.current = now;
      sfx("lorePencil", 0.2);
    }
    setPath(next);
    if (reached(map, next) && !reached(map, path)) {
      sfx("loreStamp", 0.6);
      onArrive(summarize(map, next));
    }
  };

  const cellAt = (e: PointerEvent): Cell | null => {
    const rect = board.current!.getBoundingClientRect();
    const c = Math.floor(((e.clientX - rect.left) / rect.width) * map.width);
    const r = Math.floor(((e.clientY - rect.top) / rect.height) * map.height);
    return r >= 0 && r < map.height && c >= 0 && c < map.width ? { r, c } : null;
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    const cell = cellAt(e);
    if (!cell) return;
    if (tool === "marca") {
      const has = marks.some((m) => m.cell.r === cell.r && m.cell.c === cell.c);
      setMarks(has ? marks.filter((m) => m.cell.r !== cell.r || m.cell.c !== cell.c) : [...marks, { cell, color }]);
      sfx("lorePencil", 0.3);
      return;
    }
    drawing.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    commit(drawTo(map, path, cell), e.timeStamp);
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const cell = cellAt(e);
    setCursor(cell);
    if (drawing.current && cell) commit(drawTo(map, path, cell), e.timeStamp);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = KEYS[e.key];
    if (d) {
      e.preventDefault();
      const last = path.at(-1)!;
      const to = { r: last.r + d.r, c: last.c + d.c };
      setCursor(to);
      commit(step(map, path, to), e.timeStamp);
    } else if (e.key === "Backspace" && path.length > 1 && !arrived) {
      e.preventDefault();
      setPath(path.slice(0, -1));
    }
  };

  const here = cursor ?? path.at(-1)!;
  const coords = gps(here);
  const inPath = (r: number, c: number) => path.some((p) => p.r === r && p.c === c);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Ferramenta" className="flex gap-1">
          {(["lapis", "marca"] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tool === t}
              onClick={() => setTool(t)}
              className={`rounded border px-2.5 py-1 text-sm pointer-coarse:min-h-11 ${
                tool === t ? "border-asphalt-deep bg-asphalt-deep text-plate" : "border-asphalt-deep/30"
              }`}
            >
              {t === "lapis" ? "Lápis" : "Anotar"}
            </button>
          ))}
        </div>
        {tool === "marca" && (
          <div role="group" aria-label="Cor da anotação" className="flex gap-1">
            {PALETTE.map((p, i) => (
              <button
                key={p}
                type="button"
                aria-label={`Cor ${i + 1}`}
                aria-pressed={color === p}
                onClick={() => setColor(p)}
                className={`size-6 rounded-sm border-2 pointer-coarse:size-9 ${color === p ? "border-asphalt-deep" : "border-transparent"}`}
                style={{ background: p }}
              />
            ))}
          </div>
        )}
        {/* GPS do mod: coordenadas de onde o lápis está. */}
        <p
          aria-live="polite"
          className="ml-auto flex items-center gap-2 rounded bg-black/80 px-2 py-1 font-mono text-xs text-radio"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/game/radio.png" alt="" className="h-4 w-4 pixelated" />
          {cursor === null && path.length === 1 ? "GPS sem sinal" : `X ${coords.x} · Z ${coords.z}`}
        </p>
      </div>

      <div
        ref={board}
        role="application"
        aria-label={label}
        aria-describedby="mapa-ajuda"
        tabIndex={0}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={() => (drawing.current = false)}
        onPointerLeave={() => setCursor(null)}
        onKeyDown={onKey}
        className={`relative grid touch-none overflow-hidden rounded-sm border-2 border-asphalt-deep/60 outline-none select-none focus-visible:ring-2 focus-visible:ring-sunset ${
          tool === "marca" ? "cursor-cell" : "cursor-crosshair"
        }`}
        style={{
          gridTemplateColumns: `repeat(${map.width}, 1fr)`,
          aspectRatio: `${map.width} / ${map.height}`,
        }}
      >
        {map.rows.flatMap((row, r) =>
          [...row].map((t, c) => {
            const mark = marks.find((m) => m.cell.r === r && m.cell.c === c);
            const isStart = r === map.start.r && c === map.start.c;
            const isGoal = r === map.goal.r && c === map.goal.c;
            return (
              <div
                key={`${r}-${c}`}
                className="relative"
                style={{
                  background: TILE_COLOR[t] ?? TILE_COLOR["."],
                  // A névoa e a patrulha ganham textura para não parecerem campo.
                  backgroundImage:
                    t === "~"
                      ? "radial-gradient(circle, rgb(255 255 255 / 0.5) 1px, transparent 1.5px)"
                      : t === "P"
                        ? "repeating-linear-gradient(45deg, transparent 0 3px, rgb(30 50 80 / 0.25) 3px 4px)"
                        : undefined,
                  backgroundSize: t === "~" ? "6px 6px" : undefined,
                }}
              >
                {inPath(r, c) && <span aria-hidden className="absolute inset-[30%] rounded-full bg-asphalt-deep" />}
                {mark && (
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center font-hand text-lg leading-none font-bold"
                    style={{ color: mark.color }}
                  >
                    ✕
                  </span>
                )}
                {isStart && (
                  <span aria-hidden className="absolute inset-[15%] rounded-full border-2 border-lazarus bg-plate" />
                )}
                {isGoal && (
                  <span
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center text-lg font-black text-lazarus"
                  >
                    ✕
                  </span>
                )}
              </div>
            );
          }),
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <p id="mapa-ajuda" className="mr-auto text-asphalt-deep/70">
          {arrived ? (
            <span className="font-semibold text-lazarus">Você chegou {goalLabel}.</span>
          ) : (
            <>
              <span className="pointer-coarse:hidden">Arraste o lápis (ou use as setas) de você até o ✕.</span>
              <span className="hidden pointer-coarse:inline">Arraste o dedo de você até o ✕.</span>
            </>
          )}{" "}
          <span className="font-mono text-xs">{path.length - 1} quadrados</span>
        </p>
        {!arrived && (
          <>
            <button
              type="button"
              disabled={path.length === 1}
              onClick={() => setPath(path.slice(0, -1))}
              className="rounded border border-asphalt-deep/30 px-2.5 py-1 disabled:opacity-40 pointer-coarse:min-h-11"
            >
              Apagar trecho
            </button>
            <button
              type="button"
              disabled={path.length === 1}
              onClick={() => setPath([map.start])}
              className="rounded border border-asphalt-deep/30 px-2.5 py-1 disabled:opacity-40 pointer-coarse:min-h-11"
            >
              Recomeçar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** Legenda curta para o que aparece no mapa. */
export function MapLegend({ items }: { items: { tile: string; label: string }[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-asphalt-deep/75">
      {items.map((item) => (
        <li key={item.tile} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-3 rounded-sm border border-asphalt-deep/30"
            style={{ background: TILE_COLOR[item.tile] }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
