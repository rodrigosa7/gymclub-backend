import { randomUUID } from "node:crypto";

import { HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { CurrentUserService } from "../../shared/current-user.service";
import { workoutInclude } from "../../shared/prisma-include";
import { AppException } from "../../shared/app.exception";
import { serializeWorkout } from "../../shared/serializers";
import { PrismaService } from "../prisma/prisma.service";
import { SyncWorkoutDto } from "./dto/sync-workout.dto";
import { SaveCompletedWorkoutDto } from "./dto/save-completed-workout.dto";
import { AddWorkoutExerciseDto } from "./dto/add-workout-exercise.dto";
import { AddWorkoutSetDto } from "./dto/add-workout-set.dto";
import { StartWorkoutDto } from "./dto/start-workout.dto";
import { UpdateWorkoutSetDto } from "./dto/update-workout-set.dto";

@Injectable()
export class WorkoutsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  async getActiveWorkout(): Promise<ReturnType<typeof serializeWorkout> | null> {
    const user = await this.currentUserService.getRequiredUser();
    const workout = await this.prisma.workout.findFirst({
      where: {
        userId: user.id,
        status: "active",
      },
      orderBy: {
        startedAt: "desc",
      },
      include: workoutInclude,
    });

    return workout ? serializeWorkout(workout) : null;
  }

  async getWorkout(workoutId: string): Promise<ReturnType<typeof serializeWorkout>> {
    const workout = await this.getOwnedWorkout(workoutId);
    return serializeWorkout(workout);
  }

  async startWorkout(body: StartWorkoutDto): Promise<ReturnType<typeof serializeWorkout>> {
    const user = await this.currentUserService.getRequiredUser();
    const activeWorkout = await this.prisma.workout.findFirst({
      where: {
        userId: user.id,
        status: "active",
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    if (activeWorkout) {
      throw new AppException(
        "Finish the active workout before starting another one.",
        HttpStatus.CONFLICT,
        {
          activeWorkoutId: activeWorkout.id,
        },
      );
    }

    const now = new Date();
    let routineId: string | null = null;
    let name = body.name?.trim();
    let exerciseCreates: Prisma.WorkoutExerciseUncheckedCreateWithoutWorkoutInput[] = [];

    if (body.routineId) {
      const routine = await this.prisma.routine.findFirst({
        where: {
          id: body.routineId,
          userId: user.id,
        },
        include: {
          exercises: {
            orderBy: {
              order: "asc",
            },
            include: {
              sets: {
                orderBy: {
                  order: "asc",
                },
              },
            },
          },
        },
      });

      if (!routine) {
        throw new AppException(`Routine ${body.routineId} was not found.`, HttpStatus.NOT_FOUND);
      }

      routineId = routine.id;
      name = name || routine.name;
      exerciseCreates = routine.exercises.map((exercise) => ({
        id: randomUUID(),
        exerciseId: exercise.exerciseId,
        order: exercise.order,
        notes: exercise.notes,
        restSeconds: exercise.restSeconds,
        sets: {
          create: exercise.sets.map((set) => ({
            id: randomUUID(),
            order: set.order,
            type: set.type,
            reps: null,
            weightKg: set.targetWeightKg,
            durationSeconds: null,
            distanceMeters: null,
            rir: null,
            isComplete: false,
            createdAt: now,
            completedAt: null,
          })),
        },
      }));
    } else if (body.exerciseIds?.length) {
      await this.assertExercisesExist(body.exerciseIds);
      exerciseCreates = body.exerciseIds.map((exerciseId, index) => ({
        id: randomUUID(),
        exerciseId,
        order: index + 1,
        notes: "",
        restSeconds: 90,
        sets: {
          create: [],
        },
      }));
      name = name || "Custom Workout";
    } else {
      throw new AppException(
        "Provide either a routineId or one or more exerciseIds to start a workout.",
        HttpStatus.BAD_REQUEST,
      );
    }

    const workout = await this.prisma.workout.create({
      data: {
        userId: user.id,
        routineId,
        name: name || "Workout",
        notes: body.notes?.trim() ?? "",
        status: "active",
        startedAt: now,
        completedAt: null,
        exercises: {
          create: exerciseCreates,
        },
      },
      include: workoutInclude,
    });

    return serializeWorkout(workout);
  }

  async addWorkoutExercise(
    workoutId: string,
    body: AddWorkoutExerciseDto,
  ): Promise<ReturnType<typeof serializeWorkout>> {
    const workout = await this.getOwnedWorkout(workoutId, "active");

    await this.assertExercisesExist([body.exerciseId]);

    await this.prisma.workoutExercise.create({
      data: {
        id: randomUUID(),
        workoutId: workout.id,
        exerciseId: body.exerciseId,
        order: workout.exercises.length + 1,
        notes: body.notes?.trim() ?? "",
        restSeconds: body.restSeconds ?? 90,
      },
    });

    return this.getWorkout(workoutId);
  }

  async addWorkoutSet(
    workoutId: string,
    workoutExerciseId: string,
    body: AddWorkoutSetDto,
  ): Promise<ReturnType<typeof serializeWorkout>> {
    const workout = await this.getOwnedWorkout(workoutId, "active");
    const workoutExercise = workout.exercises.find((exercise) => exercise.id === workoutExerciseId);

    if (!workoutExercise) {
      throw new AppException(
        `Workout exercise ${workoutExerciseId} was not found.`,
        HttpStatus.NOT_FOUND,
      );
    }

    const now = new Date();

    await this.prisma.workoutSet.create({
      data: {
        id: randomUUID(),
        workoutExerciseId,
        order: workoutExercise.sets.length + 1,
        type: body.type ?? "working",
        reps: body.reps ?? null,
        weightKg: body.weightKg ?? null,
        durationSeconds: body.durationSeconds ?? null,
        distanceMeters: body.distanceMeters ?? null,
        rir: body.rir ?? null,
        isComplete: body.isComplete ?? false,
        createdAt: now,
        completedAt: body.isComplete === false ? null : now,
      },
    });

    return this.getWorkout(workoutId);
  }

  async updateWorkoutSet(
    workoutId: string,
    workoutExerciseId: string,
    setId: string,
    body: UpdateWorkoutSetDto,
  ): Promise<ReturnType<typeof serializeWorkout>> {
    const workout = await this.getOwnedWorkout(workoutId, "active");
    const workoutExercise = workout.exercises.find((exercise) => exercise.id === workoutExerciseId);
    const set = workoutExercise?.sets.find((item) => item.id === setId);

    if (!workoutExercise || !set) {
      throw new AppException(`Set ${setId} was not found on workout exercise ${workoutExerciseId}.`, HttpStatus.NOT_FOUND);
    }

    const isComplete = body.isComplete ?? true;

    await this.prisma.workoutSet.update({
      where: {
        id: setId,
      },
      data: {
        type: body.type ?? set.type,
        reps: body.reps === undefined ? set.reps : body.reps,
        weightKg: body.weightKg === undefined ? set.weightKg : body.weightKg,
        durationSeconds: body.durationSeconds === undefined ? set.durationSeconds : body.durationSeconds,
        distanceMeters: body.distanceMeters === undefined ? set.distanceMeters : body.distanceMeters,
        rir: body.rir === undefined ? set.rir : body.rir,
        isComplete,
        completedAt: isComplete ? new Date() : null,
      },
    });

    return this.getWorkout(workoutId);
  }

  async removeWorkoutSet(
    workoutId: string,
    workoutExerciseId: string,
    setId: string,
  ): Promise<ReturnType<typeof serializeWorkout>> {
    const workout = await this.getOwnedWorkout(workoutId, "active");
    const workoutExercise = workout.exercises.find((exercise) => exercise.id === workoutExerciseId);
    const set = workoutExercise?.sets.find((item) => item.id === setId);

    if (!workoutExercise || !set) {
      throw new AppException(`Set ${setId} was not found on workout exercise ${workoutExerciseId}.`, HttpStatus.NOT_FOUND);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.workoutSet.delete({
        where: {
          id: setId,
        },
      });

      const remainingSets = await tx.workoutSet.findMany({
        where: {
          workoutExerciseId,
        },
        orderBy: {
          order: "asc",
        },
      });

      for (const [index, remainingSet] of remainingSets.entries()) {
        await tx.workoutSet.update({
          where: {
            id: remainingSet.id,
          },
          data: {
            order: index + 1,
          },
        });
      }
    });

    return this.getWorkout(workoutId);
  }

  async removeWorkoutExercise(
    workoutId: string,
    workoutExerciseId: string,
  ): Promise<ReturnType<typeof serializeWorkout>> {
    const workout = await this.getOwnedWorkout(workoutId, "active");
    const workoutExercise = workout.exercises.find((exercise) => exercise.id === workoutExerciseId);

    if (!workoutExercise) {
      throw new AppException(`Workout exercise ${workoutExerciseId} was not found.`, HttpStatus.NOT_FOUND);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.workoutExercise.delete({
        where: {
          id: workoutExerciseId,
        },
      });

      const remainingExercises = await tx.workoutExercise.findMany({
        where: {
          workoutId,
        },
        orderBy: {
          order: "asc",
        },
      });

      for (const [index, remainingExercise] of remainingExercises.entries()) {
        await tx.workoutExercise.update({
          where: {
            id: remainingExercise.id,
          },
          data: {
            order: index + 1,
          },
        });
      }
    });

    return this.getWorkout(workoutId);
  }

  async completeWorkout(
    workoutId: string,
    notes?: string,
  ): Promise<ReturnType<typeof serializeWorkout>> {
    const workout = await this.getOwnedWorkout(workoutId, "active");
    const exerciseIds = Array.from(new Set(workout.exercises.map((exercise) => exercise.exerciseId)));
    const exerciseNames = await this.getExerciseNames(exerciseIds);
    const incompleteExercises = workout.exercises
      .filter((exercise) => exercise.sets.some((set) => !set.isComplete))
      .map((exercise) => ({
        workoutExerciseId: exercise.id,
        exerciseId: exercise.exerciseId,
        exerciseName: exerciseNames.get(exercise.exerciseId) ?? exercise.exerciseId,
        openSetCount: exercise.sets.filter((set) => !set.isComplete).length,
      }));
    const emptyExercises = workout.exercises
      .filter((exercise) => exercise.sets.length === 0 || exercise.sets.every((set) => !set.isComplete))
      .map((exercise) => ({
        workoutExerciseId: exercise.id,
        exerciseId: exercise.exerciseId,
        exerciseName: exerciseNames.get(exercise.exerciseId) ?? exercise.exerciseId,
      }));

    if (!workout.exercises.length || incompleteExercises.length || emptyExercises.length) {
      throw new AppException(
        "Remove or log every open set and empty exercise before completing the workout.",
        HttpStatus.CONFLICT,
        {
          incompleteExercises,
          emptyExercises,
        },
      );
    }

    const completedAt = new Date();

    await this.prisma.$transaction(async (tx) => {
      const setsMissingCompletedAt = workout.exercises
        .flatMap((exercise) => exercise.sets)
        .filter((set) => set.isComplete && !set.completedAt);

      for (const set of setsMissingCompletedAt) {
        await tx.workoutSet.update({
          where: {
            id: set.id,
          },
          data: {
            completedAt,
          },
        });
      }

      await tx.workout.update({
        where: {
          id: workoutId,
        },
        data: {
          status: "completed",
          notes: notes?.trim() ?? workout.notes,
          completedAt,
        },
      });
    });

    return this.getWorkout(workoutId);
  }

  async syncWorkout(workoutId: string, body: SyncWorkoutDto): Promise<ReturnType<typeof serializeWorkout>> {
    const workout = await this.getOwnedWorkout(workoutId, "active");

    await this.prisma.$transaction(async (tx) => {
      // Delete existing exercises and their sets
      await tx.workoutExercise.deleteMany({
        where: { workoutId },
      });

      // Re-create exercises and sets
      for (const ex of body.exercises) {
        const now = new Date();
        const created = await tx.workoutExercise.create({
          data: {
            id: ex.id ?? randomUUID(),
            workoutId,
            exerciseId: ex.exerciseId,
            order: body.exercises.indexOf(ex),
            notes: ex.notes ?? "",
            restSeconds: ex.restSeconds ?? 0,
          },
        });

        for (const s of ex.sets) {
          await tx.workoutSet.create({
            data: {
              id: s.id ?? randomUUID(),
              workoutExerciseId: created.id,
              order: ex.sets.indexOf(s),
              type: s.type ?? "working",
              reps: s.reps ?? null,
              weightKg: s.weightKg ?? null,
              durationSeconds: s.durationSeconds ?? null,
              distanceMeters: s.distanceMeters ?? null,
              rir: s.rir ?? null,
              isComplete: s.isComplete ?? false,
              createdAt: now,
              completedAt: s.isComplete ? now : null,
            },
          });
        }
      }
    });

    if (body.name) {
      await this.prisma.workout.update({
        where: { id: workoutId },
        data: { name: body.name, notes: body.notes ?? workout.notes },
      });
    }

    return this.getWorkout(workoutId);
  }

  async saveCompletedWorkout(body: SaveCompletedWorkoutDto): Promise<ReturnType<typeof serializeWorkout>> {
    const user = await this.currentUserService.getRequiredUser();
    const now = new Date();

    // Filter exercises to only those with at least one completed set
    const completedExercises = body.exercises.filter((ex) =>
      ex.sets.some((s) => s.isComplete)
    );

    if (completedExercises.length === 0) {
      throw new AppException(
        "At least one set must be completed before saving.",
        HttpStatus.BAD_REQUEST,
      );
    }

    const workout = await this.prisma.workout.create({
      data: {
        userId: user.id,
        routineId: null,
        name: body.name,
        notes: body.notes?.trim() ?? "",
        status: "completed",
        startedAt: new Date(body.startedAt),
        completedAt: new Date(body.completedAt),
        exercises: {
          create: completedExercises.map((ex, exIndex) => ({
            exerciseId: ex.exerciseId,
            order: exIndex + 1,
            notes: ex.notes?.trim() ?? "",
            restSeconds: ex.restSeconds ?? 90,
            sets: {
              create: ex.sets
                .filter((s) => s.isComplete)
                .map((s, setIndex) => ({
                  order: setIndex + 1,
                  type: s.type ?? "working",
                  reps: s.reps ?? null,
                  weightKg: s.weightKg ?? null,
                  durationSeconds: s.durationSeconds ?? null,
                  distanceMeters: s.distanceMeters ?? null,
                  rir: s.rir ?? null,
                  isComplete: true,
                  createdAt: now,
                  completedAt: now,
                })),
            },
          })),
        },
      },
      include: workoutInclude,
    });

    return serializeWorkout(workout);
  }

  async listCompletedWorkouts(): Promise<ReturnType<typeof serializeWorkout>[]> {
    const user = await this.currentUserService.getRequiredUser();
    const workouts = await this.prisma.workout.findMany({
      where: {
        userId: user.id,
        status: "completed",
      },
      orderBy: {
        completedAt: "desc",
      },
      include: workoutInclude,
    });

    return workouts.map(serializeWorkout);
  }

  private async getOwnedWorkout(workoutId: string, status?: "active" | "completed") {
    const user = await this.currentUserService.getRequiredUser();
    const workout = await this.prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId: user.id,
      },
      include: workoutInclude,
    });

    if (!workout) {
      throw new AppException(`Workout ${workoutId} was not found.`, HttpStatus.NOT_FOUND);
    }

    if (status && workout.status !== status) {
      throw new AppException(
        status === "active" ? "Only active workouts can be modified." : "Workout is not completed.",
        HttpStatus.CONFLICT,
      );
    }

    return workout;
  }

  private async assertExercisesExist(exerciseIds: string[]): Promise<void> {
    const uniqueIds = Array.from(new Set(exerciseIds));
    const exercises = await this.prisma.exercise.findMany({
      where: {
        id: {
          in: uniqueIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (exercises.length !== uniqueIds.length) {
      const existingIds = new Set(exercises.map((exercise) => exercise.id));
      const missingId = uniqueIds.find((exerciseId) => !existingIds.has(exerciseId));
      throw new AppException(`Exercise ${missingId} was not found.`, HttpStatus.NOT_FOUND);
    }
  }

  private async getExerciseNames(exerciseIds: string[]): Promise<Map<string, string>> {
    if (!exerciseIds.length) {
      return new Map();
    }

    const exercises = await this.prisma.exercise.findMany({
      where: {
        id: {
          in: exerciseIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return new Map(exercises.map((exercise) => [exercise.id, exercise.name]));
  }
}
