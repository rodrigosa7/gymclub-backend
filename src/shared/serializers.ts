import { Exercise, RoutineTargetSet, User, WorkoutSet } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { RoutineWithRelations, WorkoutWithRelations } from "./prisma-include";

type FavoriteExerciseSummary = {
  exerciseId: string;
  name: string;
  loggedSets: number;
};

export const serializeUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  preferredWeightUnit: user.preferredWeightUnit,
  createdAt: user.createdAt.toISOString(),
});

export const serializeExercise = (exercise: Exercise) => ({
  id: exercise.id,
  slug: exercise.slug,
  name: exercise.name,
  category: exercise.category,
  muscleGroups: exercise.muscleGroups as string[],
  equipment: exercise.equipment === "smith_machine" ? "smith-machine" : exercise.equipment,
  instructions: exercise.instructions as string[],
});

export const serializeRoutine = (routine: RoutineWithRelations) => ({
  id: routine.id,
  userId: routine.userId,
  name: routine.name,
  description: routine.description,
  createdAt: routine.createdAt.toISOString(),
  updatedAt: routine.updatedAt.toISOString(),
  exercises: routine.exercises.map((exercise) => ({
    id: exercise.id,
    exerciseId: exercise.exerciseId,
    order: exercise.order,
    notes: exercise.notes,
    restSeconds: exercise.restSeconds,
    sets: exercise.sets.map(serializeRoutineTargetSet),
  })),
});

export const serializeWorkout = (workout: WorkoutWithRelations) => ({
  id: workout.id,
  userId: workout.userId,
  routineId: workout.routineId,
  name: workout.name,
  notes: workout.notes,
  status: workout.status,
  startedAt: workout.startedAt.toISOString(),
  completedAt: workout.completedAt?.toISOString() ?? null,
  exercises: workout.exercises.map((exercise) => ({
    id: exercise.id,
    exerciseId: exercise.exerciseId,
    order: exercise.order,
    notes: exercise.notes,
    restSeconds: exercise.restSeconds,
    sets: exercise.sets.map(serializeWorkoutSet),
  })),
});

export const serializeAnalyticsOverview = (
  totalSessions: number,
  totalSets: number,
  totalVolumeKg: number,
  activeStreakDays: number,
  favoriteExercises: FavoriteExerciseSummary[],
) => ({
  totalSessions,
  totalSets,
  totalVolumeKg: Number(totalVolumeKg.toFixed(2)),
  activeStreakDays,
  favoriteExercises,
});

const serializeRoutineTargetSet = (set: RoutineTargetSet) => ({
  id: set.id,
  type: set.type,
  targetRepsMin: set.targetRepsMin,
  targetRepsMax: set.targetRepsMax,
  targetWeightKg: decimalToNumber(set.targetWeightKg),
});

const serializeWorkoutSet = (set: WorkoutSet) => ({
  id: set.id,
  type: set.type,
  reps: set.reps,
  weightKg: decimalToNumber(set.weightKg),
  durationSeconds: set.durationSeconds,
  distanceMeters: decimalToNumber(set.distanceMeters),
  rir: set.rir,
  isComplete: set.isComplete,
  createdAt: set.createdAt.toISOString(),
  completedAt: set.completedAt?.toISOString() ?? null,
});

const decimalToNumber = (value: Prisma.Decimal | null): number | null => {
  if (!value) {
    return null;
  }

  return Number(value.toString());
};
