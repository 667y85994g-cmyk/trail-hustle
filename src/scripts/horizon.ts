import { gsap } from "gsap";

export function initHorizon() {
  const run = () => {
    const section = document.querySelector<HTMLElement>("[data-horizon]");
    if (!section) return;

    const line1 = section.querySelector<HTMLElement>("[data-horizon-line1]");
    const line2 = section.querySelector<HTMLElement>("[data-horizon-line2]");
    if (!line1 || !line2) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      gsap.set([line1, line2], { opacity: 1, y: 0 });
      return;
    }

    gsap.set([line1, line2], { opacity: 0, y: 20 });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          gsap.to(line1, {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power3.out",
          });
          gsap.to(line2, {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power3.out",
            delay: 0.2,
          });
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.3 },
    );
    io.observe(section);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
