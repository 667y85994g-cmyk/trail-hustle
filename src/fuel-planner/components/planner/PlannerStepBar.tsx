import { Check } from "lucide-react";
import { cn } from "@fp/lib/utils";
import { usePlanner } from "@fp/lib/planner-store";
import { SavedPlansMenu } from "@fp/components/planner/SavedPlansMenu";

const STEPS = [
  { id: 0, label: "You" },
  { id: 1, label: "Past efforts" },
  { id: 2, label: "Route" },
  { id: 3, label: "Fuel" },
  { id: 4, label: "Aid stations" },
  { id: 5, label: "Plan" },
];

export function PlannerStepBar() {
  const { state, dispatch } = usePlanner();
  const currentStep = state.currentStep;
  const current = STEPS[currentStep];

  const goToStep = (step: number) => {
    if (step <= currentStep) dispatch({ type: "SET_STEP", step });
  };

  return (
    <div className="no-print sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3">
        <nav aria-label="Planner steps" className="flex min-w-0 items-center">
          <ol className="flex items-center gap-1.5 sm:gap-1">
            {STEPS.map((step, idx) => {
              const isDone = step.id < currentStep;
              const isActive = step.id === currentStep;
              return (
                <li key={step.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => goToStep(step.id)}
                    disabled={step.id > currentStep}
                    aria-current={isActive ? "step" : undefined}
                    title={step.label}
                    className={cn(
                      "flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] transition-colors",
                      isActive && "bg-ink text-paper",
                      isDone && "text-ink hover:bg-paper-edge",
                      !isDone && !isActive && "cursor-not-allowed text-ink-faint"
                    )}
                  >
                    <span className="tabular-nums">
                      {isDone ? <Check className="h-3.5 w-3.5" /> : String(step.id + 1).padStart(2, "0")}
                    </span>
                    <span className={cn("hidden lg:inline", isActive && "inline")}>{step.label}</span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <span aria-hidden="true" className="mx-0.5 hidden h-px w-3 bg-rule sm:block" />
                  )}
                </li>
              );
            })}
          </ol>
          <span className="sr-only">
            Step {currentStep + 1} of {STEPS.length}: {current?.label}
          </span>
        </nav>
        <SavedPlansMenu />
      </div>
    </div>
  );
}
