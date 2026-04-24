import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let initialized = false;
let lenisInstance: Lenis | null = null;

export function initScroll(): Lenis | null {
  if (initialized) return lenisInstance;
  initialized = true;

  if (typeof window === "undefined") return null;

  lenisInstance = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
  });

  lenisInstance.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenisInstance?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenisInstance;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}
