import { describe, expect, it } from "vitest";
import {
  type Cell,
  drawTo,
  gps,
  LANDING_MAP,
  LORE_MAP,
  parseMap,
  reached,
  roadFor,
  type RouteMap,
  step,
  summarize,
  walkable,
} from "./route";

/** Menor caminho (BFS) usando só os tipos de terreno permitidos. */
function bfs(map: RouteMap, allowed: string): Cell[] | null {
  const key = (c: Cell) => `${c.r},${c.c}`;
  const prev = new Map<string, Cell | null>([[key(map.start), null]]);
  const queue = [map.start];
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur.r === map.goal.r && cur.c === map.goal.c) {
      const path: Cell[] = [];
      for (let c: Cell | null = cur; c; c = prev.get(key(c))!) path.unshift(c);
      return path;
    }
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const next = { r: cur.r + dr, c: cur.c + dc };
      const t = map.rows[next.r]?.[next.c];
      if (t && allowed.includes(t) && !prev.has(key(next))) {
        prev.set(key(next), cur);
        queue.push(next);
      }
    }
  }
  return null;
}

describe("maps", () => {
  it("are rectangles with one start and one goal", () => {
    for (const rows of [LORE_MAP, LANDING_MAP]) {
      const map = parseMap(rows);
      expect(new Set(rows.map((r) => r.length)).size).toBe(1);
      expect(rows.join("").split("S")).toHaveLength(2);
      expect(rows.join("").split("G")).toHaveLength(2);
      expect(walkable(map, map.start)).toBe(true);
    }
  });

  it("Act V: three separate roads reach the city, the Wardens one being the shortest", () => {
    const map = parseMap(LORE_MAP);
    const patrol = bfs(map, "SG.P")!;
    const rover = bfs(map, "SG.R")!;
    const fog = bfs(map, "SG.~")!;
    expect(roadFor(summarize(map, patrol))).toBe("wardens");
    expect(roadFor(summarize(map, rover))).toBe("rovers");
    expect(roadFor(summarize(map, fog))).toBe("desconhecido");
    expect(patrol.length).toBeLessThan(fog.length);
    expect(fog.length).toBeLessThan(rover.length);
  });

  it("the landing map can be crossed", () => {
    const map = parseMap(LANDING_MAP);
    expect(bfs(map, "SG.=~")).not.toBeNull();
  });
});

describe("drawing", () => {
  const map = parseMap(["S..", "#W.", "..G"]);
  const start = [map.start];

  it("steps only to free neighbouring squares", () => {
    expect(step(map, start, { r: 0, c: 1 })).toEqual([...start, { r: 0, c: 1 }]);
    expect(step(map, start, { r: 1, c: 0 })).toBe(start); // ruína
    expect(step(map, start, { r: 0, c: 2 })).toBe(start); // não é vizinho
  });

  it("walks back over the line to erase it", () => {
    const two = step(map, start, { r: 0, c: 1 });
    expect(step(map, two, map.start)).toEqual(start);
  });

  it("follows a fast drag square by square, stopping at obstacles", () => {
    expect(drawTo(map, start, { r: 0, c: 2 })).toEqual([map.start, { r: 0, c: 1 }, { r: 0, c: 2 }]);
    const toGoal = drawTo(map, drawTo(map, start, { r: 0, c: 2 }), map.goal);
    expect(reached(map, toGoal)).toBe(true);
  });

  it("stops drawing once the goal is reached", () => {
    const done = drawTo(map, drawTo(map, start, { r: 0, c: 2 }), map.goal);
    expect(step(map, done, { r: 2, c: 1 })).toBe(done);
  });

  it("summarizes length and risk next to infested ground", () => {
    const risky = parseMap(["S.G", "ZZ."]);
    const path = drawTo(risky, [risky.start], risky.goal);
    expect(summarize(risky, path)).toMatchObject({ steps: 2, nearInfested: 1 });
  });
});

describe("gps", () => {
  it("turns a square into world coordinates, like the mod's GPS", () => {
    expect(gps({ r: 0, c: 0 })).toEqual({ x: -480, z: 1200 });
    expect(gps({ r: 2, c: 3 })).toEqual({ x: -456, z: 1216 });
  });
});
