import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initScroll } from "./scroll";

export function initPillars() {
  initScroll();

  const run = () => {
    const section = document.querySelector<HTMLElement>("[data-pillars]");
    if (!section) return;

    const pinEl = section.querySelector<HTMLElement>("[data-pillars-pin]");
    const pillarEls = section.querySelectorAll<HTMLElement>("[data-pillar]");
    const wordEls = section.querySelectorAll<HTMLElement>("[data-pillar-word]");
    const paragraphEls = section.querySelectorAll<HTMLElement>(
      "[data-pillar-paragraph]",
    );
    if (!pinEl || pillarEls.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      section.classList.add("pillars-reduce");
      pillarEls.forEach((el) => gsap.set(el, { opacity: 0 }));
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
      pillarEls.forEach((el) => io.observe(el));
      return () => io.disconnect();
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(wordEls[0], { opacity: 1, y: 0 });
      gsap.set(paragraphEls[0], { opacity: 1 });
      for (let i = 1; i < wordEls.length; i++) {
        gsap.set(wordEls[i], { opacity: 0, y: 40 });
        gsap.set(paragraphEls[i], { opacity: 0 });
      }

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          pin: pinEl,
          pinSpacing: false,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      // Pillar 0 -> 1
      tl.to(wordEls[0], { opacity: 0, y: -40, duration: 20 }, 80);
      tl.to(paragraphEls[0], { opacity: 0, duration: 20 }, 82);
      tl.to(wordEls[1], { opacity: 1, y: 0, duration: 20 }, 92);
      tl.to(paragraphEls[1], { opacity: 1, duration: 20 }, 94);

      // Pillar 1 -> 2
      tl.to(wordEls[1], { opacity: 0, y: -40, duration: 20 }, 180);
      tl.to(paragraphEls[1], { opacity: 0, duration: 20 }, 182);
      tl.to(wordEls[2], { opacity: 1, y: 0, duration: 20 }, 192);
      tl.to(paragraphEls[2], { opacity: 1, duration: 20 }, 194);

      // Pad timeline to 300 so pillar 3 has hold space before unpin
      tl.set({}, {}, 300);

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
