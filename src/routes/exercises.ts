import { Router } from "express";

import { InMemoryDatabase } from "../store/in-memory-database";

export const createExercisesRouter = (database: InMemoryDatabase): Router => {
  const router = Router();

  router.get("/", (request, response) => {
    const exercises = database.listExercises({
      search: typeof request.query.search === "string" ? request.query.search : undefined,
      muscleGroup: typeof request.query.muscleGroup === "string" ? request.query.muscleGroup : undefined,
    });

    response.json({ data: exercises });
  });

  router.get("/:exerciseId", (request, response) => {
    const exercise = database.getExercise(request.params.exerciseId);

    response.json({ data: exercise });
  });

  return router;
};
