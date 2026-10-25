// Routes through TH's window.thTrack, which is a no-op until the visitor accepts analytics consent.
function track(event: string, params: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  window.thTrack?.(event, { tool: "fuel_planner", ...params });
}

export function trackPlannerOpened(): void {
  track("planner_opened", { viewport_width: window.innerWidth });
}

export function trackRouteUploaded(params: {
  distance_km: number;
  elevation_gain_m: number;
  file_size_bytes: number;
}): void {
  track("route_uploaded", {
    distance_km: Math.round(params.distance_km),
    elevation_gain_m: Math.round(params.elevation_gain_m),
    file_size_bytes: params.file_size_bytes,
  });
}

export function trackProfileCompleted(params: {
  experience_level: string;
  fuelling_level: string;
  event_intent: string;
  has_prior_efforts: boolean;
}): void {
  track("profile_completed", params);
}

export function trackPlanGenerated(params: {
  distance_km: number;
  elevation_gain_m: number;
  finish_time_minutes: number;
  carb_target_min: number;
  carb_target_max: number;
  working_carb_target: number;
  avg_carbs_per_hour: number;
  fuelling_events: number;
  sections: number;
  drink_mix_used: boolean;
  event_intent: string;
}): void {
  track("plan_generated", {
    ...params,
    distance_km: Math.round(params.distance_km),
    elevation_gain_m: Math.round(params.elevation_gain_m),
    finish_time_minutes: Math.round(params.finish_time_minutes),
  });
}

export function trackPlanPrinted(): void {
  track("plan_printed");
}

export function trackPlanFeedback(helpful: boolean): void {
  track(helpful ? "plan_feedback_positive" : "plan_feedback_negative");
}
