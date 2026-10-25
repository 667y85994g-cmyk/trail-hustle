// Routes the planner can open by slug (?route=<slug>). Only same-origin files listed here load; never an arbitrary URL.
export interface LibraryRoute {
  eventName: string;
  gpx: string;
  fileName: string;
}

export const ROUTE_LIBRARY: Record<string, LibraryRoute> = {
  "isle-of-wight-50k": {
    eventName: "Isle of Wight 50 km ultra",
    gpx: "/routes/isle-of-wight-50k.gpx",
    fileName: "isle-of-wight-50k.gpx",
  },
};
