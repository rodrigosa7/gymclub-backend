import { Router } from "express";

import { InMemoryDatabase } from "../store/in-memory-database";

export const createUserRouter = (database: InMemoryDatabase): Router => {
  const router = Router();

  router.get("/me", (_request, response) => {
    response.json({ data: database.getCurrentUser() });
  });

  return router;
};
