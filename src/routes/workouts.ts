import { Router } from "express";

import { InMemoryDatabase } from "../store/in-memory-database";

export const createWorkoutsRouter = (database: InMemoryDatabase): Router => {
  const router = Router();

  router.get("/active", (_request, response) => {
    response.json({ data: database.getActiveWorkout() });
  });

  router.post("/start", (request, response) => {
    const workout = database.startWorkout(request.body);
    response.status(201).json({ data: workout });
  });

  router.get("/:workoutId", (request, response) => {
    response.json({ data: database.getWorkout(request.params.workoutId) });
  });

  router.post("/:workoutId/exercises", (request, response) => {
    const workout = database.addWorkoutExercise(request.params.workoutId, request.body);
    response.status(201).json({ data: workout });
  });

  router.post("/:workoutId/exercises/:workoutExerciseId/sets", (request, response) => {
    const workout = database.addWorkoutSet(
      request.params.workoutId,
      request.params.workoutExerciseId,
      request.body,
    );

    response.status(201).json({ data: workout });
  });

  router.patch("/:workoutId/exercises/:workoutExerciseId/sets/:setId", (request, response) => {
    const workout = database.updateWorkoutSet(
      request.params.workoutId,
      request.params.workoutExerciseId,
      request.params.setId,
      request.body,
    );

    response.json({ data: workout });
  });

  router.post("/:workoutId/complete", (request, response) => {
    const workout = database.completeWorkout(request.params.workoutId, request.body?.notes);
    response.json({ data: workout });
  });

  return router;
};
