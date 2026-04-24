import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initScroll } from "./scroll";
import { registerEases } from "./ease";

export function initEthos() {
  initScroll();
  registerEases();

  const run = () => {
    const section = document.querySelector<HTMLElement>("[data-ethos]");
    if (!section) return;

    const pinEl = section.querySelector<HTMLElement>("[data-ethos-pin]");
    const lineEls = section.querySelectorAll<HTMLElement>("[data-ethos-line]");
    if (!pinEl || lineEls.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      section.classList.add("ethos-reduce");
      lineEls.forEach((el) => {
        gsap.set(el, { opacity: 0, filter: "none", y: 0 });
      });
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(entry.target, {
                opacity: 1,
                duration: 0.5,
                ease: "power1.out",
              });
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 },
      );
      lineEls.forEach((el) => io.observe(el));
      return () => io.disconnect();
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(lineEls, {
        opacity: 0,
        filter: "blur(6px)",
        y: 20,
      });

      const count = lineEls.length;
      const tl = gsap.timeline({
        defaults: { ease: "standard" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          pin: pinEl,
          pinSpacing: false,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      lineEls.forEach((el, i) => {
        const base = i * 10;

        tl.to(
          el,
          {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            duration: 3,
          },
          base,
        );

        if (i < count - 1) {
          tl.to(
            el,
            {
              opacity: 0,
              filter: "blur(3px)",
              y: -10,
              duration: 3,
            },
            base + 7,
          );
        }
      });

      tl.set({}, {}, count * 10);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
