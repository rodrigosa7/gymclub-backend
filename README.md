# Gym Club Backend

A Hevy-inspired backend MVP for workout tracking, routines, workout logging, and basic analytics.

## What is included

- Exercise library with search and muscle-group filtering
- Saved routines with exercise templates and target sets
- Active workout flow with set logging and workout completion
- Workout history and simple analytics overview
- Seed data so the API is useful immediately

## Stack

- Node.js
- TypeScript
- Express
- In-memory persistence for rapid iteration

## Quick start

```bash
npm install
npm run dev
```

The API starts on `http://localhost:4000`.

## Core endpoints

```text
GET    /health
GET    /api/me
GET    /api/exercises
GET    /api/exercises/:exerciseId
GET    /api/routines
GET    /api/routines/:routineId
POST   /api/routines
PATCH  /api/routines/:routineId
GET    /api/workouts/active
POST   /api/workouts/start
GET    /api/workouts/:workoutId
POST   /api/workouts/:workoutId/exercises
POST   /api/workouts/:workoutId/exercises/:workoutExerciseId/sets
PATCH  /api/workouts/:workoutId/exercises/:workoutExerciseId/sets/:setId
POST   /api/workouts/:workoutId/complete
GET    /api/history
GET    /api/analytics/overview
```

## Example flow

Start a workout from a routine:

```bash
curl -X POST http://localhost:4000/api/workouts/start \
  -H "Content-Type: application/json" \
  -d "{\"routineId\":\"routine-push-a\"}"
```

Create a custom routine:

```bash
curl -X POST http://localhost:4000/api/routines \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Upper Pull\",
    \"description\": \"Back and biceps focus\",
    \"exercises\": [
      {
        \"exerciseId\": \"exercise-lat-pulldown\",
        \"restSeconds\": 90,
        \"sets\": [
          { \"type\": \"working\", \"targetRepsMin\": 8, \"targetRepsMax\": 12, \"targetWeightKg\": 55 },
          { \"type\": \"working\", \"targetRepsMin\": 8, \"targetRepsMax\": 12, \"targetWeightKg\": 55 }
        ]
      }
    ]
  }"
```

## Next upgrades

- Replace the in-memory store with Postgres plus Prisma or Drizzle
- Add authentication and per-user data isolation
- Add social features, plates calculator, progression suggestions, and exercise PR tracking
- Generate OpenAPI docs and add request validation
