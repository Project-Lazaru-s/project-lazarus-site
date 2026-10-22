import type { ComponentProps } from "react";

/** Seção da landing que, ao passar do meio da tela, avança o dia do sobrevivente. */
export function DaySection({ day, ...props }: { day: number } & ComponentProps<"section">) {
  return <section data-day={day} {...props} />;
}
