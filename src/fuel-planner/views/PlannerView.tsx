import { useEffect } from "react";
import { PlannerProvider, usePlanner } from "@fp/lib/planner-store";
import { trackPlannerOpened } from "@fp/lib/analytics";
import { RESULTS } from "@fp/lib/routes";
import { PlannerStepBar } from "@fp/components/planner/PlannerStepBar";
import { StepAthlete } from "@fp/components/planner/StepAthlete";
import { StepCalibration } from "@fp/components/planner/StepCalibration";
import { StepRoute } from "@fp/components/planner/StepRoute";
import { StepFuel } from "@fp/components/planner/StepFuel";
import { StepAidStations } from "@fp/components/planner/StepAidStations";
import { StepGenerate } from "@fp/components/planner/StepGenerate";

const LAST_STEP = 5;

function Planner() {
  const { state, dispatch, runPlanner } = usePlanner();
  const currentStep = state.currentStep;

  useEffect(() => {
    trackPlannerOpened();
    const requested = Number(new URLSearchParams(window.location.search).get("step"));
    if (Number.isInteger(requested) && requested > 0 && requested <= LAST_STEP) {
      dispatch({ type: "SET_STEP", step: requested });
    }
  }, [dispatch]);

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
        <p className="mb-10 inline-flex items-center gap-2 rounded-full border border-rule px-3 py-1 text-[12px] text-ink-mute">
          <span className="h-1.5 w-1.5 rounded-full bg-th-burnt-ochre" aria-hidden="true" />
          In beta. Test any plan in training before race day.
        </p>
        <div key={currentStep} className="animate-fade-in">
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
