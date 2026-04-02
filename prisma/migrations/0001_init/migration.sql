CREATE TYPE "WeightUnit" AS ENUM ('kg', 'lb');
CREATE TYPE "ExerciseCategory" AS ENUM ('strength', 'cardio', 'mobility');
CREATE TYPE "Equipment" AS ENUM ('barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'kettlebell', 'cardio', 'smith_machine');
CREATE TYPE "SetType" AS ENUM ('warmup', 'working', 'dropset', 'failure', 'assisted');
CREATE TYPE "WorkoutStatus" AS ENUM ('active', 'completed');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "preferredWeightUnit" "WeightUnit" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Exercise" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" "ExerciseCategory" NOT NULL,
  "muscleGroups" JSONB NOT NULL,
  "equipment" "Equipment" NOT NULL,
  "instructions" JSONB NOT NULL,
  CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Routine" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoutineExercise" (
  "id" TEXT NOT NULL,
  "routineId" TEXT NOT NULL,
  "exerciseId" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "notes" TEXT NOT NULL,
  "restSeconds" INTEGER NOT NULL,
  CONSTRAINT "RoutineExercise_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoutineTargetSet" (
  "id" TEXT NOT NULL,
  "routineExerciseId" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "type" "SetType" NOT NULL,
  "targetRepsMin" INTEGER,
  "targetRepsMax" INTEGER,
  "targetWeightKg" DECIMAL(10,2),
  CONSTRAINT "RoutineTargetSet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Workout" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "routineId" TEXT,
  "name" TEXT NOT NULL,
  "notes" TEXT NOT NULL,
  "status" "WorkoutStatus" NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkoutExercise" (
  "id" TEXT NOT NULL,
  "workoutId" TEXT NOT NULL,
  "exerciseId" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "notes" TEXT NOT NULL,
  "restSeconds" INTEGER NOT NULL,
  CONSTRAINT "WorkoutExercise_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkoutSet" (
  "id" TEXT NOT NULL,
  "workoutExerciseId" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "type" "SetType" NOT NULL,
  "reps" INTEGER,
  "weightKg" DECIMAL(10,2),
  "durationSeconds" INTEGER,
  "distanceMeters" DECIMAL(10,2),
  "rir" INTEGER,
  "isComplete" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "WorkoutSet_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Exercise_slug_key" ON "Exercise"("slug");
CREATE INDEX "Routine_userId_idx" ON "Routine"("userId");
CREATE UNIQUE INDEX "RoutineExercise_routineId_order_key" ON "RoutineExercise"("routineId", "order");
CREATE INDEX "RoutineExercise_exerciseId_idx" ON "RoutineExercise"("exerciseId");
CREATE UNIQUE INDEX "RoutineTargetSet_routineExerciseId_order_key" ON "RoutineTargetSet"("routineExerciseId", "order");
CREATE INDEX "Workout_userId_status_idx" ON "Workout"("userId", "status");
CREATE UNIQUE INDEX "WorkoutExercise_workoutId_order_key" ON "WorkoutExercise"("workoutId", "order");
CREATE INDEX "WorkoutExercise_exerciseId_idx" ON "WorkoutExercise"("exerciseId");
CREATE UNIQUE INDEX "WorkoutSet_workoutExerciseId_order_key" ON "WorkoutSet"("workoutExerciseId", "order");

ALTER TABLE "Routine"
  ADD CONSTRAINT "Routine_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RoutineExercise"
  ADD CONSTRAINT "RoutineExercise_routineId_fkey"
  FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RoutineExercise"
  ADD CONSTRAINT "RoutineExercise_exerciseId_fkey"
  FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RoutineTargetSet"
  ADD CONSTRAINT "RoutineTargetSet_routineExerciseId_fkey"
  FOREIGN KEY ("routineExerciseId") REFERENCES "RoutineExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Workout"
  ADD CONSTRAINT "Workout_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Workout"
  ADD CONSTRAINT "Workout_routineId_fkey"
  FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WorkoutExercise"
  ADD CONSTRAINT "WorkoutExercise_workoutId_fkey"
  FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkoutExercise"
  ADD CONSTRAINT "WorkoutExercise_exerciseId_fkey"
  FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WorkoutSet"
  ADD CONSTRAINT "WorkoutSet_workoutExerciseId_fkey"
  FOREIGN KEY ("workoutExerciseId") REFERENCES "WorkoutExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
