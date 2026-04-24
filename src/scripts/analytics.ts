declare global {
  interface Window {
    __TH_GA_ID?: string;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    thTrack?: (name: string, params?: Record<string, unknown>) => void;
  }
}

const STORAGE_KEY = "th-consent";
const GRANT_EVENT = "tf-consent:granted";

export function initAnalytics() {
  const gaId = window.__TH_GA_ID;

  window.thTrack = (name, params = {}) => {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", name, params);
  };

  initScrollDepth();

  if (!gaId) return;

  let loaded = false;

  const loadGtag = () => {
    if (loaded) return;
    loaded = true;

    window.dataLayer = window.dataLayer || [];
    const gtag: (...args: unknown[]) => void = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      (window.dataLayer as unknown[]).push(arguments);
    };
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", gaId, { anonymize_ip: true });

    const s = document.createElement("script");
    s.async = true;
    s.defer = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(s);
  };

  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    stored = null;
  }

  if (stored === "granted") {
    loadGtag();
  }

  window.addEventListener(GRANT_EVENT, () => {
    loadGtag();
  });
}

function initScrollDepth() {
  const thresholds = [25, 50, 75, 100];
  const fired = new Set<number>();

  const onScroll = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const pct = Math.round((window.scrollY / scrollable) * 100);
    for (const t of thresholds) {
      if (pct >= t && !fired.has(t)) {
        fired.add(t);
        window.thTrack?.("scroll_depth", { depth: t });
      }
    }
  };

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    },
    { passive: true },
  );
}
