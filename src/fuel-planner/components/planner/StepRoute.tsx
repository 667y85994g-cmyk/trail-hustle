"use client";

import { useState, useCallback, useRef } from "react";
import { usePlanner } from "@fp/lib/planner-store";
import { Button } from "@fp/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@fp/components/ui/card";
import { Badge } from "@fp/components/ui/badge";
import {
  ChevronRight,
  ChevronLeft,
  ChevronsUp,
  TrendingUp,
  TrendingDown,
  Route,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { WindowMark } from "@fp/components/WindowMark";
import type { ParsedRoute } from "@fp/types";
import { DEFAULT_ASSUMPTIONS } from "@fp/types";
import { ElevationChart } from "./ElevationChart";
import { terrainBgClass } from "@fp/lib/utils";
import { terrainLabel, segmentRoute } from "@fp/lib/segmentation";
import { parseGPXServer } from "@fp/lib/gpx-parser";
import { trackRouteUploaded } from "@fp/lib/analytics";

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function StepRoute({ onBack, onNext }: Props) {
  const { state, dispatch } = usePlanner();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const route = state.parsedRoute;

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".gpx")) {
        setError("Please upload a .gpx file.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("GPX file is too large (max 5MB). Try exporting a simplified version from your device.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const parsedRoute: ParsedRoute = parseGPXServer(await file.text());
        parsedRoute.segments = segmentRoute(parsedRoute, DEFAULT_ASSUMPTIONS);
        parsedRoute.fileName = file.name;
        dispatch({ type: "SET_ROUTE", route: parsedRoute });
        trackRouteUploaded({
          distance_km:      parsedRoute.totalDistanceKm,
          elevation_gain_m: parsedRoute.totalAscentM,
          file_size_bytes:  file.size,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not read that GPX file.");
      } finally {
        setIsLoading(false);
        // Reset so the same file can be re-uploaded if needed
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [dispatch]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleReplace = () => {
    dispatch({ type: "CLEAR_ROUTE" });
    setError(null);
    // Trigger file picker
    setTimeout(() => inputRef.current?.click(), 50);
  };

  return (
    <div className="animate-slide-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Upload your GPX route</h1>
        <p className="mt-2 text-ink-mute">
          The planner uses elevation and gradient to classify terrain and adapt
          your fuelling recommendations.
        </p>
      </div>

      <div className="space-y-6">
        {/* Drop zone — only shown when no route loaded */}
        {!route && (
          <>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`relative flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
                isDragging
                  ? "border-ink bg-paper-edge/70"
                  : "border-rule bg-paper/30 hover:border-rule hover:bg-paper/50"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".gpx"
                onChange={onInputChange}
                className="absolute inset-0 cursor-pointer opacity-0"
                disabled={isLoading}
              />
              {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-rule border-t-ink" />
                  <p className="text-sm text-ink-mute">Parsing route...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center px-6">
                  <WindowMark className="h-6 w-12 opacity-20" />
                  <div>
                    <p className="font-medium text-ink">
                      Drop your GPX file here
                    </p>
                    <p className="mt-1 text-sm text-ink-mute">
                      Exported from Komoot, Strava, or Garmin
                    </p>
                  </div>
                  <span className="mt-1 inline-flex items-center px-4 py-1.5 rounded-full border border-ink/80 bg-paper font-display text-[14px] text-ink transition-colors pointer-events-none">
                    Browse files
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-th-clay-red/40 bg-th-clay-red/10 p-4 text-sm text-th-clay-red">
                {error}
              </div>
            )}
          </>
        )}

        {/* Route loaded — show banner + replace button */}
        {route && (
          <div className="space-y-4 animate-slide-up">
            {/* Loaded banner */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-th-forest-green/30 bg-th-forest-green/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-th-forest-green flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-th-forest-green">
                    {route.fileName ?? "Route loaded"}
                  </p>
                  <p className="text-xs text-ink-mute">
                    {route.totalDistanceKm.toFixed(1)} km · ↑
                    {Math.round(route.totalAscentM).toLocaleString()}m ascent
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReplace}
                className="flex-shrink-0 gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Replace
              </Button>

              {/* Hidden file input for Replace action */}
              <input
                ref={inputRef}
                type="file"
                accept=".gpx"
                onChange={onInputChange}
                className="hidden"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-th-clay-red/40 bg-th-clay-red/10 p-4 text-sm text-th-clay-red">
                {error}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  icon: Route,
                  label: "Distance",
                  value: `${route.totalDistanceKm.toFixed(1)} km`,
                },
                {
                  icon: TrendingUp,
                  label: "Ascent",
                  value: `${Math.round(route.totalAscentM).toLocaleString()}m`,
                },
                {
                  icon: TrendingDown,
                  label: "Descent",
                  value: `${Math.round(route.totalDescentM).toLocaleString()}m`,
                },
                {
                  icon: ChevronsUp,
                  label: "Max elevation",
                  value: `${Math.round(route.maxElevationM)}m`,
                },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <stat.icon className="h-4 w-4 text-th-burnt-ochre flex-shrink-0" />
                    <div>
                      <p className="text-xs text-ink-mute">{stat.label}</p>
                      <p className="font-semibold text-ink">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Elevation chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-ink">
                  Elevation Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-4">
                <ElevationChart
                  data={route.elevationProfile}
                  segments={route.segments}
                />
              </CardContent>
            </Card>

            {/* Terrain breakdown */}
            {route.segments.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-ink">
                    Terrain Segments ({route.segments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {route.segments.map((seg) => (
                      <div
                        key={seg.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-paper/60 px-4 py-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Badge className={terrainBgClass(seg.terrain)}>
                            {terrainLabel(seg.terrain)}
                          </Badge>
                          <div className="min-w-0">
                            <p className="text-xs text-ink-mute truncate">
                              km {seg.startKm.toFixed(1)}–{seg.endKm.toFixed(1)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0 text-xs text-ink-mute">
                          <span>{seg.distanceKm.toFixed(1)}km</span>
                          <span>↑{seg.ascentM}m</span>
                          <span>~{seg.estimatedDurationMinutes}min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button size="lg" onClick={onNext} disabled={!route}>
            {route ? "Next: Add Fuel" : "Upload a GPX to continue"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Skip option */}
        {!route && (
          <div className="text-center">
            <button
              type="button"
              onClick={onNext}
              className="text-xs text-ink-mute underline underline-offset-2 hover:text-ink-mute"
            >
              Skip for now — generate a time-based plan without route data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
