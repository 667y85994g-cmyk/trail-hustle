import { lazy, Suspense, useEffect, useState } from "react";
import { ChevronLeft, Printer } from "lucide-react";
import { PlannerProvider, usePlanner } from "@fp/lib/planner-store";
import { PLANNER, PRINT } from "@fp/lib/routes";
import { Button } from "@fp/components/ui/button";
import { SummaryView } from "@fp/components/results/SummaryView";
import { TimelineView } from "@fp/components/results/TimelineView";
import { SegmentView } from "@fp/components/results/SegmentView";
import { CarryView } from "@fp/components/results/CarryView";
import { cn } from "@fp/lib/utils";
import { trackPlanFeedback } from "@fp/lib/analytics";
import type { PlannerOutput } from "@fp/types";

const RouteMapView = lazy(() =>
  import("@fp/components/results/RouteMapView").then((m) => ({ default: m.RouteMapView }))
);

const TABS = [
  { id: "summary", label: "Summary" },
  { id: "timeline", label: "Timeline" },
  { id: "segments", label: "Segments" },
  { id: "carry", label: "Carry plan" },
  { id: "map", label: "Map" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// Surface only the notes a runner can act on; the engine's diagnostics stay out of the main path.
const SHOWN_INFO_CODES = new Set(["HEAT_FLUID_ADJUSTED", "CARB_TARGET_CAPPED"]);

function planNotes(output: PlannerOutput) {
  const info = output.warnings.filter((w) => w.type === "info" && w.code && SHOWN_INFO_CODES.has(w.code));
  const grouped = new Map<string, { w: (typeof output.warnings)[number]; count: number }>();
  for (const w of output.warnings.filter((w) => w.type === "error")) {
    const key = w.code ?? w.message;
    const existing = grouped.get(key);
    if (existing) existing.count++;
    else grouped.set(key, { w, count: 1 });
  }
  const errors = [...grouped.values()].map(({ w, count }) => {
    if (count === 1) return w.message;
    if (w.code === "NO_SUITABLE_FUEL") {
      return `No suitable fuel at ${count} schedule points. Add gels or other discrete fuels to your inventory.`;
    }
    return `${w.message} (×${count})`;
  });
  return { info: info.map((w) => w.message), errors };
}

function Results() {
  const { state, hydrated } = usePlanner();
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const [feedback, setFeedback] = useState<"pending" | "positive" | "negative">("pending");
  const output = state.lastPlannerOutput;

  useEffect(() => {
    if (hydrated && !output) window.location.replace(PLANNER);
  }, [hydrated, output]);

  if (!output) {
    return <p className="px-6 py-32 text-center text-ink-mute">Loading your plan…</p>;
  }

  const handleFeedback = (helpful: boolean) => {
    trackPlanFeedback(helpful);
    setFeedback(helpful ? "positive" : "negative");
  };

  const notes = planNotes(output);

  return (
    <>
      <div className="no-print border-b border-rule">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-6 pb-8 pt-12">
          <div className="min-w-0">
            <p className="text-[13px] uppercase tracking-[0.14em] text-ink-mute">Your race plan</p>
            <h1 className="mt-2 truncate font-display text-[clamp(32px,4.5vw,52px)] leading-[1.05] tracking-tight text-ink">
              {output.eventPlan.eventName || "Race plan"}
              <span className="text-th-burnt-ochre">.</span>
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={`${PLANNER}?step=5`}>
                <ChevronLeft className="h-4 w-4" />
                Edit plan
              </a>
            </Button>
            <Button size="sm" onClick={() => window.open(PRINT, "_blank")}>
              <Printer className="h-4 w-4" />
              Race card
            </Button>
          </div>
        </div>
      </div>

      {(notes.info.length > 0 || notes.errors.length > 0) && (
        <div className="no-print border-b border-rule">
          <ul className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 py-3">
            {notes.errors.map((message) => (
              <li key={message} className="rounded-xl border border-th-clay-red/30 bg-th-clay-red/5 px-3 py-2 text-[13px] text-th-clay-red">
                {message}
              </li>
            ))}
            {notes.info.map((message) => (
              <li key={message} className="rounded-xl border border-rule bg-paper-edge/60 px-3 py-2 text-[13px] text-ink-mute">
                {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="no-print sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div role="tablist" aria-label="Plan views" className="flex gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "-mb-px whitespace-nowrap border-b-2 py-4 font-display text-[15px] transition-colors",
                  activeTab === tab.id
                    ? "border-ink text-ink"
                    : "border-transparent text-ink-faint hover:text-ink"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div key={activeTab} className="animate-fade-in" role="tabpanel">
          {activeTab === "summary" && <SummaryView output={output} />}
          {activeTab === "timeline" && <TimelineView output={output} raceStartTime={state.raceStartTime} />}
          {activeTab === "segments" && <SegmentView output={output} />}
          {activeTab === "carry" && <CarryView output={output} />}
          {activeTab === "map" && (
            <Suspense fallback={<p className="py-24 text-center text-sm text-ink-mute">Loading map…</p>}>
              <RouteMapView output={output} />
            </Suspense>
          )}
        </div>
      </main>

      <div className="no-print mx-auto max-w-6xl px-6 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
          {feedback === "pending" ? (
            <>
              <p className="text-[14px] text-ink-mute">Was this fuelling plan helpful?</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleFeedback(true)}>
                  Yes
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleFeedback(false)}>
                  Not really
                </Button>
              </div>
            </>
          ) : (
            <p className="text-[14px] text-ink-mute">
              {feedback === "positive" ? "Thanks. Glad it was useful." : "Thanks. That helps us make it better."}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default function ResultsView() {
  return (
    <div className="fuel-planner">
      <PlannerProvider>
        <Results />
      </PlannerProvider>
    </div>
  );
}
