const STORAGE_KEY = "th-consent";
const GRANT_EVENT = "tf-consent:granted";

export function initConsent() {
  const run = () => {
    const el = document.querySelector<HTMLElement>("[data-consent]");
    if (!el) return;

    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }

    if (stored === "granted") {
      window.dispatchEvent(new CustomEvent(GRANT_EVENT));
      return;
    }
    if (stored === "declined") {
      return;
    }

    el.removeAttribute("hidden");

    const accept = el.querySelector<HTMLButtonElement>("[data-consent-accept]");
    const decline = el.querySelector<HTMLButtonElement>(
      "[data-consent-decline]",
    );

    accept?.addEventListener("click", () => {
      try {
        localStorage.setItem(STORAGE_KEY, "granted");
      } catch {
        /* private mode / blocked */
      }
      window.dispatchEvent(new CustomEvent(GRANT_EVENT));
      el.setAttribute("hidden", "");
    });

    decline?.addEventListener("click", () => {
      try {
        localStorage.setItem(STORAGE_KEY, "declined");
      } catch {
        /* no-op */
      }
      el.setAttribute("hidden", "");
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
