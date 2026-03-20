import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

// ---------------------------------------------------------------------------
// PeerFolio — Cron Jobs
//
// T037: URL health re-check runs daily at 03:00 UTC.
//       The action fans out individual checks per portfolio.
// ---------------------------------------------------------------------------

const crons = cronJobs();

crons.daily(
  "url-health-check",
  { hourUTC: 3, minuteUTC: 0 },
  internal.portfolios.scheduled.checkAllUrlHealth,
  {},
);

export default crons;
