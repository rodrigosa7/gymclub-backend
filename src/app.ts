import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

import { createSeedData } from "./data/seed";
import { AppError } from "./errors";
import { createExercisesRouter } from "./routes/exercises";
import { createInsightsRouter } from "./routes/insights";
import { createRoutinesRouter } from "./routes/routines";
import { createUserRouter } from "./routes/user";
import { createWorkoutsRouter } from "./routes/workouts";
import { InMemoryDatabase } from "./store/in-memory-database";

export const createApp = (): express.Express => {
  const app = express();
  const database = new InMemoryDatabase(createSeedData());

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({
      status: "ok",
      service: "gymclub-backend",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api", createUserRouter(database));
  app.use("/api/exercises", createExercisesRouter(database));
  app.use("/api/routines", createRoutinesRouter(database));
  app.use("/api/workouts", createWorkoutsRouter(database));
  app.use("/api", createInsightsRouter(database));

  app.use((_request, _response, next) => {
    next(new AppError("Route not found.", 404));
  });

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof AppError) {
      response.status(error.statusCode).json({
        error: {
          message: error.message,
          details: error.details ?? null,
        },
      });
      return;
    }

    console.error(error);
    response.status(500).json({
      error: {
        message: "Unexpected server error.",
      },
    });
  });

  return app;
};
