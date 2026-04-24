import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initScroll } from "./scroll";

export function initGround() {
  initScroll();

  const run = () => {
    const svg = document.querySelector<SVGSVGElement>("[data-ground-topography]");
    if (!svg) return;

    const paths = svg.querySelectorAll<SVGPathElement>("[data-ground-path]");
    if (paths.length === 0) return;

    paths.forEach((p) => {
      let len = 0;
      try {
        len = p.getTotalLength();
      } catch {
        len = 0;
      }
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len);
    });

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      paths.forEach((p) => {
        p.style.strokeDashoffset = "0";
      });
      gsap.set(svg, { opacity: 0.12, x: 0 });
      return;
    }

    // Load-time draw-in: all 73 paths render over ~2.2s, starting 0.3s after mount.
    // Runs in parallel with the hero arrival sequence so the map sketches itself
    // in as the brand lands. After this, paths are stable — scroll only drives
    // opacity density and horizontal drift.
    gsap.to(paths, {
      strokeDashoffset: 0,
      duration: 0.4,
      stagger: 0.03,
      ease: "power2.out",
      delay: 0.3,
    });

    // Scroll-driven opacity curve: 0.12 at hero → 0.20 at 80% → fades to 0 at 100%
    // so the footer sits on clean cream.
    const opacityTl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    opacityTl.fromTo(
      svg,
      { opacity: 0.12 },
      { opacity: 0.2, duration: 0.8, ease: "power1.inOut" },
      0,
    );
    opacityTl.to(svg, { opacity: 0, duration: 0.05, ease: "power1.in" }, 0.95);

    // Slow horizontal drift — felt, not watched.
    gsap.to(svg, {
      x: -80,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
