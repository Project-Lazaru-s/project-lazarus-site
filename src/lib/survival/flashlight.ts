// Lanterna à noite (Zombie Awareness: os infectados seguem a luz).

export const NIGHT_FROM_DAY = 10;
/** Acima disso (px/s), o facho varrendo a rua chama atenção. */
export const RECKLESS_SPEED = 4000;
/** Medo por varrida descuidada. Basta uma para o moodle Tense aparecer. */
export const RECKLESS_FEAR = 30;

export function lightSpeed(dx: number, dy: number, dtMs: number) {
  if (dtMs <= 0) return 0;
  return (Math.hypot(dx, dy) / dtMs) * 1000;
}

export function isReckless(speed: number) {
  return speed > RECKLESS_SPEED;
}
