import { ViewTransition, type ReactNode } from "react";

/**
 * O template é remontado a cada navegação, então a página que sai e a que entra animam
 * (no layout não, porque ele persiste). A persiana: a página antiga desce no escuro, a nova se revela.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="shutter-open" exit="shutter-close" default="none">
      {children}
    </ViewTransition>
  );
}
