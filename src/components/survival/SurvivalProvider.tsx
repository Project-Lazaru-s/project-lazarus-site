"use client";

import { createContext, useCallback, useContext, useEffect, useReducer, useRef, type Dispatch, type ReactNode } from "react";
import { createSfx, type Sfx, type SoundName } from "@/lib/survival/sfx";
import { currentDay, initialSurvival, survivalReducer, type SurvivalAction, type SurvivalState } from "@/lib/survival/survival";
import { Atmosphere } from "./Atmosphere";
import { SoundToggle } from "./SoundToggle";
import { SurvivalHud } from "./SurvivalHud";

type Context = { state: SurvivalState; dispatch: Dispatch<SurvivalAction>; sfx: () => Sfx };
const SurvivalContext = createContext<Context | null>(null);

export function useSurvival() {
  const ctx = useContext(SurvivalContext);
  if (!ctx) throw new Error("useSurvival precisa de <SurvivalProvider>");
  return ctx;
}

function useDayTracking(day: number, dispatch: Dispatch<SurvivalAction>) {
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

export function SurvivalProvider({ children, initial }: { children: ReactNode; initial?: Partial<SurvivalState> }) {
  const [state, dispatch] = useReducer(survivalReducer, { ...initialSurvival, ...initial });
  useDayTracking(state.day, dispatch);
  // Criado só no navegador, na primeira vez que um efeito é pedido.
  const sfxRef = useRef<Sfx | null>(null);
  const sfx = useCallback(() => (sfxRef.current ??= createSfx(typeof Audio === "undefined" ? undefined : Audio)), []);
  useEffect(() => {
    if (state.sound) sfx().preload();
  }, [state.sound, sfx]);
  return <SurvivalContext.Provider value={{ state, dispatch, sfx }}>{children}</SurvivalContext.Provider>;
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
