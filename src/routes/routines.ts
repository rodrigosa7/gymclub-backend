import { Router } from "express";

import { InMemoryDatabase } from "../store/in-memory-database";

export const createRoutinesRouter = (database: InMemoryDatabase): Router => {
  const router = Router();

  router.get("/", (_request, response) => {
    response.json({ data: database.listRoutines() });
  });

  router.get("/:routineId", (request, response) => {
    response.json({ data: database.getRoutine(request.params.routineId) });
  });

  router.post("/", (request, response) => {
    const routine = database.createRoutine(request.body);
    response.status(201).json({ data: routine });
  });

  router.patch("/:routineId", (request, response) => {
    const routine = database.updateRoutine(request.params.routineId, request.body);
    response.json({ data: routine });
  });

  return router;
};
