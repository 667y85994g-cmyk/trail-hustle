import { gsap } from "gsap";

function cubicBezierEase(x1: number, y1: number, x2: number, y2: number) {
  const NEWTON_ITERATIONS = 4;
  const A = (a: number, b: number) => 1 - 3 * b + 3 * a;
  const B = (a: number, b: number) => 3 * b - 6 * a;
  const C = (a: number) => 3 * a;
  const calc = (t: number, a: number, b: number) =>
    ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
  const slope = (t: number, a: number, b: number) =>
    3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);

  const getTForX = (x: number) => {
    let t = x;
    for (let i = 0; i < NEWTON_ITERATIONS; i++) {
      const s = slope(t, x1, x2);
      if (s === 0) return t;
      t -= (calc(t, x1, x2) - x) / s;
    }
    return t;
  };

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return calc(getTForX(x), y1, y2);
  };
}

let registered = false;

export function registerEases() {
  if (registered) return;
  registered = true;
  gsap.registerEase("standard", cubicBezierEase(0.4, 0, 0.2, 1));
}
