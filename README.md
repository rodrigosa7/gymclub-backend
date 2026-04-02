# Gym Club Backend

A Hevy-inspired workout tracking backend built with NestJS, Prisma, and PostgreSQL.

## What is included

- Exercise library with search and muscle-group filtering
- Saved routines with exercise templates and target sets
- Active workout flow with set logging, deletion, and workout completion rules
- Workout history that only stores logged work
- Analytics overview with total sessions, sets, volume, streak, and favorite exercises
- Seed data for a demo user, exercise library, routines, and workout history

## Stack

- NestJS
- Prisma ORM
- PostgreSQL
- TypeScript
- Docker Compose for local database startup

## Project structure

```text
src/
  modules/
    exercises/
    health/
    insights/
    me/
    prisma/
    routines/
    workouts/
  shared/
prisma/
  migrations/
  schema.prisma
  seed.ts
docker-compose.yml
```

## Quick start

1. Install dependencies.

```bash
npm install
```

2. Copy the environment file.

```bash
copy .env.example .env
```

3. Start PostgreSQL.

```bash
npm run db:start
```

4. Generate the Prisma client.

```bash
npm run prisma:generate
```

5. Run the initial migration.

```bash
npm run prisma:migrate -- --name init
```

6. Seed the database.

```bash
npm run prisma:seed
```

7. Start the API.

```bash
npm run dev
```

The API starts on `http://localhost:4000`.

## Core endpoints

```text
GET     /health
GET     /api/me
GET     /api/exercises
GET     /api/exercises/:exerciseId
GET     /api/routines
GET     /api/routines/:routineId
POST    /api/routines
PATCH   /api/routines/:routineId
GET     /api/workouts/active
POST    /api/workouts/start
GET     /api/workouts/:workoutId
POST    /api/workouts/:workoutId/exercises
POST    /api/workouts/:workoutId/exercises/:workoutExerciseId/sets
PATCH   /api/workouts/:workoutId/exercises/:workoutExerciseId/sets/:setId
DELETE  /api/workouts/:workoutId/exercises/:workoutExerciseId/sets/:setId
DELETE  /api/workouts/:workoutId/exercises/:workoutExerciseId
POST    /api/workouts/:workoutId/complete
GET     /api/history
GET     /api/analytics/overview
```

Most API responses follow the shape `{ "data": ... }`. Error responses follow `{ "error": { "message": string, "details": unknown } }`.

## Workout completion rules

- A workout cannot be completed while it still has open sets.
- A workout cannot be completed with exercises that have no logged sets.
- If an exercise or set should not count, remove it before completing the workout.
- Completed history only reflects sets that were actually logged.

## Example flow

Start a workout from a routine:

```bash
curl -X POST http://localhost:4000/api/workouts/start ^
  -H "Content-Type: application/json" ^
  -d "{\"routineId\":\"routine-push-a\"}"
```

Log a completed set:

```bash
curl -X POST http://localhost:4000/api/workouts/<workoutId>/exercises/<workoutExerciseId>/sets ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"working\",\"reps\":8,\"weightKg\":70,\"isComplete\":true}"
```

## Useful commands

```bash
npm run check
npm run build
npm run db:start
npm run db:stop
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Next upgrades

- Add authentication and real user ownership instead of the current seeded demo user lookup
- Generate Swagger or OpenAPI docs
- Add tests around workout completion, history serialization, and analytics calculations
- Add progression features, PR tracking, and social sharing
