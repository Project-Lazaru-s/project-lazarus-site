// Lazarus Maps no site: traçar uma rota a lápis num mapa de papel, quadrado a quadrado.
//
// Legenda dos mapas: S você · G destino · . campo · = estrada · P área patrulhada (Wardens)
// R rota Rover · ~ névoa · W água · # ruína · Z área infestada · X rastro de infectados. W, #, Z e X não se atravessam.

export type Cell = { r: number; c: number };
export type RouteMap = { rows: string[]; width: number; height: number; start: Cell; goal: Cell };

export const BLOCKED = "W#ZX";

/** Ato V: a última folha do caderno. Três corredores até a cidade. */
export const LORE_MAP = [
  "########################",
  "#RRRRRRRRRRRRRRRRRRRRRR#",
  "#R#WWWW######ZZZ###WWWR#",
  "#R##########ZZZZ######R#",
  "#R#WWWW###########WWW#R#",
  "#R####################R#",
  "#.PPPPPPPPPPPPPPPPPPPP.#",
  "#SPPPPPP##PPPP##PPPPPPG#",
  "#.PPPPPPPPPPPPPPPPPPPP.#",
  "#~####################~#",
  "#~##ZZZZZ######WWWWW##~#",
  "#~####################~#",
  "#~~~~~~~~~~~~~~~~~~~~~~#",
  "#~~~~~###~~~~~~ZZ~~~~~~#",
  "#~~~~~~~~~~~~~~~~~~~~~~#",
  "########################",
];

/** Página inicial, Dia 25: do esconderijo ao posto militar, sem GPS de estrada. */
export const LANDING_MAP = [
  "........####............",
  ".S......####...ZZZ......",
  "..==============ZZ......",
  "..=....WWW.....=........",
  "..=....WWW.###.=...###..",
  "..=....WWW.###.========.",
  "..=............#.....=..",
  "..====ZZZ.......#....=..",
  "......ZZZ...WWW......=G.",
  "............WWW.........",
];

export function parseMap(rows: string[]): RouteMap {
  const find = (ch: string): Cell => {
    const r = rows.findIndex((row) => row.includes(ch));
    return { r, c: rows[r].indexOf(ch) };
  };
  return { rows, width: rows[0].length, height: rows.length, start: find("S"), goal: find("G") };
}

export const tile = (map: RouteMap, cell: Cell) => map.rows[cell.r]?.[cell.c];
export const walkable = (map: RouteMap, cell: Cell) => {
  const t = tile(map, cell);
  return t !== undefined && !BLOCKED.includes(t);
};
const same = (a: Cell, b: Cell) => a.r === b.r && a.c === b.c;
export const reached = (map: RouteMap, path: Cell[]) => same(path.at(-1)!, map.goal);

/**
 * Um passo do lápis: vai para um vizinho livre, ou volta pelo próprio traço (apagando).
 * Devolve o mesmo array quando o passo não vale, para o React não re-renderizar à toa.
 */
export function step(map: RouteMap, path: Cell[], to: Cell): Cell[] {
  const last = path.at(-1)!;
  if (path.length > 1 && same(path.at(-2)!, to)) return path.slice(0, -1);
  if (reached(map, path)) return path;
  const adjacent = Math.abs(last.r - to.r) + Math.abs(last.c - to.c) === 1;
  if (!adjacent || !walkable(map, to) || path.some((p) => same(p, to))) return path;
  return [...path, to];
}

/** Arrasto rápido: anda quadrado a quadrado até o ponteiro (coluna, depois linha), parando no obstáculo. */
export function drawTo(map: RouteMap, path: Cell[], to: Cell): Cell[] {
  let current = path;
  for (let guard = 0; guard < map.width + map.height; guard++) {
    const last = current.at(-1)!;
    if (same(last, to)) break;
    const next =
      last.c !== to.c
        ? { r: last.r, c: last.c + Math.sign(to.c - last.c) }
        : { r: last.r + Math.sign(to.r - last.r), c: last.c };
    const moved = step(map, current, next);
    if (moved === current) break;
    current = moved;
  }
  return current;
}

export type RouteSummary = { steps: number; zones: Record<string, number>; nearInfested: number };

/** Distância em quadrados, por onde passou e quantos passos foram colados numa área infestada. */
export function summarize(map: RouteMap, path: Cell[]): RouteSummary {
  const zones: Record<string, number> = {};
  let nearInfested = 0;
  for (const cell of path.slice(1)) {
    const t = tile(map, cell);
    zones[t] = (zones[t] ?? 0) + 1;
    const around = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].map(([dr, dc]) => tile(map, { r: cell.r + dr, c: cell.c + dc }));
    if (around.includes("Z")) nearInfested++;
  }
  return { steps: path.length - 1, zones, nearInfested };
}

const ROAD_OF_ZONE = { P: "wardens", R: "rovers", "~": "desconhecido" } as const;

/** Ato V: a estrada é a área que o traço mais atravessou. */
export function roadFor(summary: RouteSummary): "wardens" | "rovers" | "desconhecido" {
  const [zone] = (Object.keys(ROAD_OF_ZONE) as (keyof typeof ROAD_OF_ZONE)[]).sort(
    (a, b) => (summary.zones[b] ?? 0) - (summary.zones[a] ?? 0),
  );
  return ROAD_OF_ZONE[zone];
}

/** GPS do Lazarus Maps: cada quadrado do papel vale 8 blocos do mundo. */
export function gps(cell: Cell, origin = { x: -480, z: 1200 }, scale = 8) {
  return { x: origin.x + cell.c * scale, z: origin.z + cell.r * scale };
}
