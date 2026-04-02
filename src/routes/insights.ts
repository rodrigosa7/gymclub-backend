import { Router } from "express";

import { InMemoryDatabase } from "../store/in-memory-database";

export const createInsightsRouter = (database: InMemoryDatabase): Router => {
  const router = Router();

  router.get("/history", (_request, response) => {
    response.json({ data: database.listWorkoutHistory() });
  });

  router.get("/analytics/overview", (_request, response) => {
    response.json({ data: database.getAnalyticsOverview() });
  });

  return router;
};
