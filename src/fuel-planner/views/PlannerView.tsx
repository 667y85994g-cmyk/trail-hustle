import { useEffect, useState } from "react";
import { PlannerProvider, usePlanner } from "@fp/lib/planner-store";
import { trackLibraryRouteOpened, trackPlannerOpened } from "@fp/lib/analytics";
import { RESULTS } from "@fp/lib/routes";
import { ROUTE_LIBRARY } from "@fp/lib/route-library";
import { parseGPXServer } from "@fp/lib/gpx-parser";
import { segmentRoute } from "@fp/lib/segmentation";
import { DEFAULT_ASSUMPTIONS } from "@fp/types";
import { PlannerStepBar } from "@fp/components/planner/PlannerStepBar";
import { StepAthlete } from "@fp/components/planner/StepAthlete";
import { StepCalibration } from "@fp/components/planner/StepCalibration";
import { StepRoute } from "@fp/components/planner/StepRoute";
import { StepFuel } from "@fp/components/planner/StepFuel";
import { StepAidStations } from "@fp/components/planner/StepAidStations";
import { StepGenerate } from "@fp/components/planner/StepGenerate";

const LAST_STEP = 5;

type RouteNotice = { kind: "loaded"; name: string } | { kind: "failed" } | null;

function Planner() {
  const { state, dispatch, runPlanner, hydrated } = usePlanner();
  const currentStep = state.currentStep;
  const [routeNotice, setRouteNotice] = useState<RouteNotice>(null);
  // Bumped after a library route loads so the steps remount and pick up the new values.
  const [routeVersion, setRouteVersion] = useState(0);

  useEffect(() => {
    trackPlannerOpened();
    const requested = Number(new URLSearchParams(window.location.search).get("step"));
    if (Number.isInteger(requested) && requested > 0 && requested <= LAST_STEP) {
      dispatch({ type: "SET_STEP", step: requested });
    }
  }, [dispatch]);

  // Waits for hydration, or the persisted route would overwrite the one just opened.
  useEffect(() => {
    if (!hydrated) return;
    const slug = new URLSearchParams(window.location.search).get("route");
    const entry = slug ? ROUTE_LIBRARY[slug] : undefined;
    if (!slug || !entry) return;
    window.history.replaceState(null, "", window.location.pathname);
    let cancelled = false;
    fetch(entry.gpx)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        const route = parseGPXServer(text);
        route.segments = segmentRoute(route, DEFAULT_ASSUMPTIONS);
        route.fileName = entry.fileName;
        dispatch({ type: "SET_ROUTE", route });
        dispatch({
          type: "SET_EVENT_META",
          eventName: entry.eventName,
          eventType: state.eventType,
          racePriority: state.racePriority,
          raceStartTime: state.raceStartTime,
          expectedTemperatureC: state.expectedTemperatureC,
          targetDistanceKm: state.targetDistanceKm,
          targetFinishTimeMinutes: state.targetFinishTimeMinutes,
          eventIntent: state.eventIntent,
          preRunFuelled: state.preRunFuelled,
        });
        trackLibraryRouteOpened(slug);
        setRouteNotice({ kind: "loaded", name: entry.eventName });
        setRouteVersion((v) => v + 1);
      })
      .catch(() => {
        if (!cancelled) setRouteNotice({ kind: "failed" });
      });
    return () => {
      cancelled = true;
    };
    // Runs once, when hydration completes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentStep]);

  const goToStep = (step: number) => {
    dispatch({ type: "SET_STEP", step });
  };

  const handleGenerate = () => {
    dispatch({ type: "SET_GENERATING", value: true });
    setTimeout(() => {
      const output = runPlanner();
      if (output) {
        window.location.assign(RESULTS);
      } else {
        dispatch({ type: "SET_GENERATING", value: false });
      }
    }, 300);
  };

  return (
    <>
      <PlannerStepBar />
      <div className="mx-auto w-full max-w-4xl px-6 pb-24 pt-12 sm:pt-16">
        <div className="mb-10 flex flex-wrap gap-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-rule px-3 py-1 text-[12px] text-ink-mute">
            <span className="h-1.5 w-1.5 rounded-full bg-th-burnt-ochre" aria-hidden="true" />
            In beta. Test any plan in training before race day.
          </p>
          {routeNotice?.kind === "loaded" && (
            <p role="status" className="inline-flex items-center gap-2 rounded-full border border-th-forest-green/30 bg-th-forest-green/5 px-3 py-1 text-[12px] text-th-forest-green">
              {routeNotice.name} route loaded. Your other answers are unchanged.
            </p>
          )}
          {routeNotice?.kind === "failed" && (
            <p role="status" className="inline-flex items-center gap-2 rounded-full border border-th-clay-red/30 bg-th-clay-red/5 px-3 py-1 text-[12px] text-th-clay-red">
              That route couldn't be loaded. You can still upload a GPX in step 3.
            </p>
          )}
        </div>
        <div key={`${currentStep}-${routeVersion}`} className="animate-fade-in">
          {currentStep === 0 && <StepAthlete onNext={() => goToStep(1)} />}
          {currentStep === 1 && (
            <StepCalibration onBack={() => goToStep(0)} onNext={() => goToStep(2)} />
          )}
          {currentStep === 2 && (
            <StepRoute onBack={() => goToStep(1)} onNext={() => goToStep(3)} />
          )}
          {currentStep === 3 && (
            <StepFuel onBack={() => goToStep(2)} onNext={() => goToStep(4)} />
          )}
          {currentStep === 4 && (
            <StepAidStations onBack={() => goToStep(3)} onNext={() => goToStep(5)} />
          )}
          {currentStep === 5 && (
            <StepGenerate
              onBack={() => goToStep(4)}
              onGenerate={handleGenerate}
              isGenerating={state.isGenerating}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default function PlannerView() {
  return (
    <div className="fuel-planner">
      <PlannerProvider>
        <Planner />
      </PlannerProvider>
    </div>
  );
}
