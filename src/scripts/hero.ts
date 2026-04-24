import { gsap } from "gsap";
import { initScroll } from "./scroll";

export function initHero() {
  initScroll();

  const run = () => {
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    if (!hero) return;

    const windowEl = hero.querySelector<SVGGElement>("[data-logo-window]");
    const wordmarkEl = hero.querySelector<SVGGElement>("[data-logo-wordmark]");
    const words = hero.querySelectorAll<HTMLElement>("[data-hero-tagline-word]");
    const scrollCue = hero.querySelector<HTMLElement>("[data-hero-scroll-cue]");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      gsap.set([windowEl, wordmarkEl, ...words, scrollCue], { opacity: 0 });
      gsap.to([windowEl, wordmarkEl, ...words, scrollCue], {
        opacity: 1,
        duration: 0.6,
        ease: "power1.out",
      });
      return;
    }

    gsap.set(windowEl, { scale: 0, transformOrigin: "50% 50%" });
    gsap.set(wordmarkEl, { opacity: 0, y: 20 });
    gsap.set(words, { y: "100%" });
    gsap.set(scrollCue, { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(
      windowEl,
      {
        scale: 1,
        duration: 0.6,
        ease: "back.out(1.4)",
      },
      0.3,
    );

    tl.to(
      wordmarkEl,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
      },
      ">0.3",
    );

    tl.to(
      words,
      {
        y: "0%",
        duration: 1.0,
        stagger: 0.05,
        ease: "power3.out",
      },
      ">0.2",
    );

    tl.to(
      scrollCue,
      {
        opacity: 1,
        duration: 0.4,
      },
      ">-0.2",
    );
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
