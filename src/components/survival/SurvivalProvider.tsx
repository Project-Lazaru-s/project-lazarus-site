"use client";

import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from "react";
import { currentDay, initialSurvival, survivalReducer, type SurvivalAction, type SurvivalState } from "@/lib/survival/survival";
import { Atmosphere } from "./Atmosphere";
import { SoundToggle } from "./SoundToggle";
import { SurvivalHud } from "./SurvivalHud";

const SurvivalContext = createContext<{ state: SurvivalState; dispatch: Dispatch<SurvivalAction> } | null>(null);

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
  return <SurvivalContext.Provider value={{ state, dispatch }}>{children}</SurvivalContext.Provider>;
}

export function ConnectedHud() {
  const { state, dispatch } = useSurvival();
  return (
    <SurvivalHud
      state={state}
      onSedative={() => dispatch({ type: "sedative" })}
      onUse={(item) => dispatch({ type: "use", item })}
    >
      <SoundToggle fear={state.fear} />
    </SurvivalHud>
  );
}

export function ConnectedAtmosphere() {
  const { state } = useSurvival();
  return <Atmosphere day={state.day} fear={state.fear} />;
}
