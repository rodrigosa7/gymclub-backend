import { randomUUID } from "node:crypto";

import {
  AddWorkoutExerciseInput,
  AddWorkoutSetInput,
  AnalyticsOverview,
  CreateRoutineInput,
  DatabaseSeed,
  Exercise,
  FavoriteExercise,
  Routine,
  RoutineExerciseTemplate,
  StartWorkoutInput,
  UpdateRoutineInput,
  UpdateWorkoutSetInput,
  User,
  WorkoutExercise,
  WorkoutSession,
} from "../domain";
import { AppError } from "../errors";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export class InMemoryDatabase {
  private readonly currentUser: User;
  private readonly exercises: Map<string, Exercise>;
  private readonly routines: Map<string, Routine>;
  private readonly workouts: Map<string, WorkoutSession>;

  constructor(seed: DatabaseSeed) {
    this.currentUser = clone(seed.currentUser);
    this.exercises = new Map(seed.exercises.map((exercise) => [exercise.id, clone(exercise)]));
    this.routines = new Map(seed.routines.map((routine) => [routine.id, clone(routine)]));
    this.workouts = new Map(seed.workouts.map((workout) => [workout.id, clone(workout)]));
  }

  getCurrentUser(): User {
    return clone(this.currentUser);
  }

  listExercises(filters?: { search?: string; muscleGroup?: string }): Exercise[] {
    const search = filters?.search?.trim().toLowerCase();
    const muscleGroup = filters?.muscleGroup?.trim().toLowerCase();

    return Array.from(this.exercises.values())
      .filter((exercise) => {
        if (search) {
          const matchesSearch =
            exercise.name.toLowerCase().includes(search) ||
            exercise.instructions.some((instruction) => instruction.toLowerCase().includes(search));

          if (!matchesSearch) {
            return false;
          }
        }

        if (muscleGroup && !exercise.muscleGroups.includes(muscleGroup as Exercise["muscleGroups"][number])) {
          return false;
        }

        return true;
      })
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((exercise) => clone(exercise));
  }

  getExercise(id: string): Exercise {
    const exercise = this.exercises.get(id);

    if (!exercise) {
      throw new AppError(`Exercise ${id} was not found.`, 404);
    }

    return clone(exercise);
  }

  listRoutines(): Routine[] {
    return Array.from(this.routines.values())
      .filter((routine) => routine.userId === this.currentUser.id)
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((routine) => clone(routine));
  }

  getRoutine(id: string): Routine {
    const routine = this.routines.get(id);

    if (!routine || routine.userId !== this.currentUser.id) {
      throw new AppError(`Routine ${id} was not found.`, 404);
    }

    return clone(routine);
  }

  createRoutine(input: CreateRoutineInput): Routine {
    if (!input.name?.trim()) {
      throw new AppError("Routine name is required.");
    }

    if (!input.exercises?.length) {
      throw new AppError("A routine needs at least one exercise.");
    }

    const now = new Date().toISOString();
    const routine: Routine = {
      id: randomUUID(),
      userId: this.currentUser.id,
      name: input.name.trim(),
      description: input.description?.trim() ?? "",
      exercises: this.buildRoutineExercises(input.exercises),
      createdAt: now,
      updatedAt: now,
    };

    this.routines.set(routine.id, clone(routine));

    return clone(routine);
  }

  updateRoutine(id: string, input: UpdateRoutineInput): Routine {
    const routine = this.getRoutine(id);

    if (input.name !== undefined) {
      if (!input.name.trim()) {
        throw new AppError("Routine name cannot be empty.");
      }

      routine.name = input.name.trim();
    }

    if (input.description !== undefined) {
      routine.description = input.description.trim();
    }

    if (input.exercises !== undefined) {
      if (!input.exercises.length) {
        throw new AppError("A routine needs at least one exercise.");
      }

      routine.exercises = this.buildRoutineExercises(input.exercises);
    }

    routine.updatedAt = new Date().toISOString();
    this.routines.set(routine.id, clone(routine));

    return clone(routine);
  }

  getActiveWorkout(): WorkoutSession | null {
    const activeWorkouts = Array.from(this.workouts.values())
      .filter((workout) => workout.userId === this.currentUser.id && workout.status === "active")
      .sort((left, right) => right.startedAt.localeCompare(left.startedAt));

    return activeWorkouts[0] ? clone(activeWorkouts[0]) : null;
  }

  getWorkout(id: string): WorkoutSession {
    const workout = this.workouts.get(id);

    if (!workout || workout.userId !== this.currentUser.id) {
      throw new AppError(`Workout ${id} was not found.`, 404);
    }

    return clone(workout);
  }

  startWorkout(input: StartWorkoutInput): WorkoutSession {
    const existingActiveWorkout = this.getActiveWorkout();

    if (existingActiveWorkout) {
      throw new AppError("Finish the active workout before starting another one.", 409, {
        activeWorkoutId: existingActiveWorkout.id,
      });
    }

    const now = new Date().toISOString();
    let exercises: WorkoutExercise[] = [];
    let name = input.name?.trim();
    let routineId: string | null = null;

    if (input.routineId) {
      const routine = this.getRoutine(input.routineId);
      routineId = routine.id;
      name = name || routine.name;
      exercises = routine.exercises.map((exerciseTemplate) => ({
        id: randomUUID(),
        exerciseId: exerciseTemplate.exerciseId,
        order: exerciseTemplate.order,
        notes: exerciseTemplate.notes,
        restSeconds: exerciseTemplate.restSeconds,
        sets: exerciseTemplate.sets.map((setTemplate) => ({
          id: randomUUID(),
          type: setTemplate.type,
          isComplete: false,
          reps: null,
          weightKg: setTemplate.targetWeightKg ?? null,
          durationSeconds: null,
          distanceMeters: null,
          rir: null,
          createdAt: now,
          completedAt: null,
        })),
      }));
    } else if (input.exerciseIds?.length) {
      exercises = input.exerciseIds.map((exerciseId, index) => {
        this.assertExerciseExists(exerciseId);

        return {
          id: randomUUID(),
          exerciseId,
          order: index + 1,
          notes: "",
          restSeconds: 90,
          sets: [],
        };
      });
      name = name || "Custom Workout";
    } else {
      throw new AppError("Provide either a routineId or one or more exerciseIds to start a workout.");
    }

    const workout: WorkoutSession = {
      id: randomUUID(),
      userId: this.currentUser.id,
      routineId,
      name: name || "Workout",
      notes: input.notes?.trim() ?? "",
      status: "active",
      startedAt: now,
      completedAt: null,
      exercises,
    };

    this.workouts.set(workout.id, clone(workout));

    return clone(workout);
  }

  addWorkoutExercise(workoutId: string, input: AddWorkoutExerciseInput): WorkoutSession {
    const workout = this.requireActiveWorkout(workoutId);
    this.assertExerciseExists(input.exerciseId);

    workout.exercises.push({
      id: randomUUID(),
      exerciseId: input.exerciseId,
      order: workout.exercises.length + 1,
      notes: input.notes?.trim() ?? "",
      restSeconds: input.restSeconds ?? 90,
      sets: [],
    });

    this.workouts.set(workout.id, clone(workout));

    return clone(workout);
  }

  addWorkoutSet(
    workoutId: string,
    workoutExerciseId: string,
    input: AddWorkoutSetInput,
  ): WorkoutSession {
    const workout = this.requireActiveWorkout(workoutId);
    const workoutExercise = this.requireWorkoutExercise(workout, workoutExerciseId);
    const now = new Date().toISOString();

    workoutExercise.sets.push({
      id: randomUUID(),
      type: input.type ?? "working",
      reps: input.reps ?? null,
      weightKg: input.weightKg ?? null,
      durationSeconds: input.durationSeconds ?? null,
      distanceMeters: input.distanceMeters ?? null,
      rir: input.rir ?? null,
      isComplete: input.isComplete ?? true,
      createdAt: now,
      completedAt: input.isComplete === false ? null : now,
    });

    this.workouts.set(workout.id, clone(workout));

    return clone(workout);
  }

  updateWorkoutSet(
    workoutId: string,
    workoutExerciseId: string,
    setId: string,
    input: UpdateWorkoutSetInput,
  ): WorkoutSession {
    const workout = this.requireActiveWorkout(workoutId);
    const workoutExercise = this.requireWorkoutExercise(workout, workoutExerciseId);
    const set = workoutExercise.sets.find((workoutSet) => workoutSet.id === setId);

    if (!set) {
      throw new AppError(`Set ${setId} was not found on workout exercise ${workoutExerciseId}.`, 404);
    }

    if (input.type !== undefined) {
      set.type = input.type;
    }

    if (input.reps !== undefined) {
      set.reps = input.reps;
    }

    if (input.weightKg !== undefined) {
      set.weightKg = input.weightKg;
    }

    if (input.durationSeconds !== undefined) {
      set.durationSeconds = input.durationSeconds;
    }

    if (input.distanceMeters !== undefined) {
      set.distanceMeters = input.distanceMeters;
    }

    if (input.rir !== undefined) {
      set.rir = input.rir;
    }

    if (input.isComplete !== undefined) {
      set.isComplete = input.isComplete;
      set.completedAt = input.isComplete ? new Date().toISOString() : null;
    }

    this.workouts.set(workout.id, clone(workout));

    return clone(workout);
  }

  completeWorkout(workoutId: string, notes?: string): WorkoutSession {
    const workout = this.requireActiveWorkout(workoutId);

    workout.status = "completed";
    workout.notes = notes?.trim() ?? workout.notes;
    workout.completedAt = new Date().toISOString();

    workout.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        if (set.isComplete && !set.completedAt) {
          set.completedAt = workout.completedAt;
        }
      });
    });

    this.workouts.set(workout.id, clone(workout));

    return clone(workout);
  }

  listWorkoutHistory(): WorkoutSession[] {
    return Array.from(this.workouts.values())
      .filter((workout) => workout.userId === this.currentUser.id && workout.status === "completed")
      .sort((left, right) => (right.completedAt ?? "").localeCompare(left.completedAt ?? ""))
      .map((workout) => clone(workout));
  }

  getAnalyticsOverview(): AnalyticsOverview {
    const completedWorkouts = this.listWorkoutHistory();
    const favoriteExerciseCounts = new Map<string, number>();

    let totalSets = 0;
    let totalVolumeKg = 0;

    for (const workout of completedWorkouts) {
      for (const exercise of workout.exercises) {
        for (const set of exercise.sets) {
          if (!set.isComplete) {
            continue;
          }

          totalSets += 1;
          favoriteExerciseCounts.set(exercise.exerciseId, (favoriteExerciseCounts.get(exercise.exerciseId) ?? 0) + 1);

          if (typeof set.reps === "number" && typeof set.weightKg === "number") {
            totalVolumeKg += set.reps * set.weightKg;
          }
        }
      }
    }

    const favoriteExercises: FavoriteExercise[] = Array.from(favoriteExerciseCounts.entries())
      .map(([exerciseId, loggedSets]) => ({
        exerciseId,
        name: this.getExercise(exerciseId).name,
        loggedSets,
      }))
      .sort((left, right) => right.loggedSets - left.loggedSets || left.name.localeCompare(right.name))
      .slice(0, 5);

    return {
      totalSessions: completedWorkouts.length,
      totalSets,
      totalVolumeKg: Number(totalVolumeKg.toFixed(2)),
      activeStreakDays: this.calculateActiveStreak(completedWorkouts),
      favoriteExercises,
    };
  }

  private calculateActiveStreak(workouts: WorkoutSession[]): number {
    const completedDates = new Set(
      workouts
        .map((workout) => workout.completedAt?.slice(0, 10))
        .filter((value): value is string => Boolean(value)),
    );

    let streak = 0;
    const cursor = new Date();
    cursor.setUTCHours(0, 0, 0, 0);

    while (completedDates.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    return streak;
  }

  private buildRoutineExercises(input: CreateRoutineInput["exercises"]): RoutineExerciseTemplate[] {
    return input.map((exercise, index) => {
      this.assertExerciseExists(exercise.exerciseId);

      if (!exercise.sets?.length) {
        throw new AppError(`Exercise ${exercise.exerciseId} needs at least one target set.`);
      }

      return {
        id: randomUUID(),
        exerciseId: exercise.exerciseId,
        order: index + 1,
        notes: exercise.notes?.trim() ?? "",
        restSeconds: exercise.restSeconds ?? 90,
        sets: exercise.sets.map((set) => ({
          id: randomUUID(),
          type: set.type ?? "working",
          targetRepsMin: set.targetRepsMin,
          targetRepsMax: set.targetRepsMax,
          targetWeightKg: set.targetWeightKg ?? null,
        })),
      };
    });
  }

  private assertExerciseExists(exerciseId: string): void {
    if (!this.exercises.has(exerciseId)) {
      throw new AppError(`Exercise ${exerciseId} was not found.`, 404);
    }
  }

  private requireActiveWorkout(workoutId: string): WorkoutSession {
    const workout = this.getWorkout(workoutId);

    if (workout.status !== "active") {
      throw new AppError("Only active workouts can be modified.", 409);
    }

    return workout;
  }

  private requireWorkoutExercise(workout: WorkoutSession, workoutExerciseId: string): WorkoutExercise {
    const workoutExercise = workout.exercises.find((exercise) => exercise.id === workoutExerciseId);

    if (!workoutExercise) {
      throw new AppError(`Workout exercise ${workoutExerciseId} was not found.`, 404);
    }

    return workoutExercise;
  }
}
