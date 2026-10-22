"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type ReactNode,
} from "react";
import { runReducer, type RunAction } from "@/lib/survival/run";
import { hasProgress, loadRun, SAVE_KEY, saveRun } from "@/lib/survival/save";
import { createSfx, type Sfx, type SoundName } from "@/lib/survival/sfx";
import { currentDay, initialSurvival, type SurvivalState } from "@/lib/survival/survival";
import { Atmosphere } from "./Atmosphere";
import { SoundToggle } from "./SoundToggle";
import { SurvivalHud } from "./SurvivalHud";

type Context = {
  state: SurvivalState;
  dispatch: Dispatch<RunAction>;
  sfx: () => Sfx;
  /** Partida salva ainda não decidida (continuar ou começar de novo). */
  saved: SurvivalState | null;
  resume: () => void;
  newRun: () => void;
};
const SurvivalContext = createContext<Context | null>(null);

export function useSurvival() {
  const ctx = useContext(SurvivalContext);
  if (!ctx) throw new Error("useSurvival precisa de <SurvivalProvider>");
  return ctx;
}

function useDayTracking(day: number, dispatch: Dispatch<RunAction>) {
  useEffect(() => {
    const onScroll = () => {
      const sections = [...document.querySelectorAll<HTMLElement>("[data-day]")].map((el) => ({
        day: Number(el.dataset.day),
        top: el.getBoundingClientRect().top,
      }));
      const next = currentDay(sections, window.innerHeight / 2);
      if (next > day) dispatch({ type: "day", day: next });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [day, dispatch]);
}

const noSubscription = () => () => {};

/**
 * A partida que estava salva quando a página abriu (congelada: os saves desta visita não contam).
 * No servidor e na hidratação é sempre "nada salvo".
 */
function useSavedRun(enabled: boolean) {
  const [store] = useState(() => {
    let raw: string | null | undefined;
    return { get: () => (raw === undefined ? (raw = enabled ? readStorage() : null) : raw) };
  });
  const raw = useSyncExternalStore(noSubscription, store.get, () => null);
  return useMemo(() => (raw ? loadRun({ getItem: () => raw, setItem() {}, removeItem() {} }) : null), [raw]);
}

function readStorage() {
  try {
    return localStorage.getItem(SAVE_KEY);
  } catch {
    return null;
  }
}

type Props = {
  children: ReactNode;
  initial?: Partial<SurvivalState>;
  /** Salva a partida no navegador (só a landing). */
  persist?: boolean;
  /** Relógio da sede e da fome (só a landing). */
  clock?: boolean;
};

const CLOCK_SECONDS = 5;

/** Desconta o tempo de página aberta; parado com a aba escondida. */
function useNeedsClock(enabled: boolean, dispatch: Dispatch<RunAction>) {
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") dispatch({ type: "time", seconds: CLOCK_SECONDS });
    }, CLOCK_SECONDS * 1000);
    return () => clearInterval(id);
  }, [enabled, dispatch]);
}

export function SurvivalProvider({ children, initial, persist = false, clock = false }: Props) {
  const [state, dispatch] = useReducer(runReducer, { ...initialSurvival, ...initial });
  useDayTracking(state.day, dispatch);
  useNeedsClock(clock, dispatch);

  const saved = useSavedRun(persist);
  // Com uma partida salva, nada é gravado até o visitante escolher: rolar a página não apaga o progresso.
  const [decided, setDecided] = useState(false);
  const pending = !decided && saved !== null && hasProgress(saved);

  useEffect(() => {
    if (persist && !pending) saveRun(localStorage, state);
  }, [persist, pending, state]);

  const resume = useCallback(() => {
    if (saved) dispatch({ type: "load", state: saved });
    setDecided(true);
  }, [saved]);

  const newRun = useCallback(() => {
    // Conquistas são do jogador, não da partida: ficam de uma para a outra.
    const achievements = [...new Set([...(saved?.achievements ?? []), ...state.achievements])];
    dispatch({ type: "load", state: { ...initialSurvival, sound: state.sound, achievements } });
    setDecided(true);
  }, [saved, state.achievements, state.sound]);

  // Criado só no navegador, na primeira vez que um efeito é pedido.
  const sfxRef = useRef<Sfx | null>(null);
  const sfx = useCallback(() => (sfxRef.current ??= createSfx(typeof Audio === "undefined" ? undefined : Audio)), []);
  useEffect(() => {
    if (state.sound) sfx().preload();
  }, [state.sound, sfx]);

  return (
    <SurvivalContext.Provider value={{ state, dispatch, sfx, saved: pending ? saved : null, resume, newRun }}>
      {children}
    </SurvivalContext.Provider>
  );
}

/** Toca um efeito sonoro, só se o visitante ligou o som. */
export function useSfx() {
  const ctx = useContext(SurvivalContext);
  const on = ctx?.state.sound ?? false;
  const sfx = ctx?.sfx;
  return useCallback((name: SoundName, volume?: number) => on && sfx?.().play(name, volume), [on, sfx]);
}

export function ConnectedHud() {
  const { state, dispatch } = useSurvival();
  return (
    <SurvivalHud
      state={state}
      onSedative={() => dispatch({ type: "sedative" })}
      onUse={(item) => dispatch({ type: "use", item })}
    >
      <SoundToggle on={state.sound} fear={state.fear} onChange={(on) => dispatch({ type: "sound", on })} />
    </SurvivalHud>
  );
}

export function ConnectedAtmosphere() {
  const { state } = useSurvival();
  return <Atmosphere day={state.day} fear={state.fear} />;
}
