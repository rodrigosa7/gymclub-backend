import { randomUUID } from "node:crypto";

import { HttpStatus, Injectable } from "@nestjs/common";

import { CurrentUserService } from "../../shared/current-user.service";
import { routineInclude } from "../../shared/prisma-include";
import { AppException } from "../../shared/app.exception";
import { serializeRoutine } from "../../shared/serializers";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRoutineDto } from "./dto/create-routine.dto";
import { RoutineExerciseInputDto } from "./dto/routine-exercise-input.dto";
import { UpdateRoutineDto } from "./dto/update-routine.dto";

@Injectable()
export class RoutinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly currentUserService: CurrentUserService,
  ) {}

  async listRoutines(): Promise<ReturnType<typeof serializeRoutine>[]> {
    const user = await this.currentUserService.getRequiredUser();
    const routines = await this.prisma.routine.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        name: "asc",
      },
      include: routineInclude,
    });

    return routines.map(serializeRoutine);
  }

  async getRoutine(routineId: string): Promise<ReturnType<typeof serializeRoutine>> {
    const routine = await this.getOwnedRoutine(routineId);
    return serializeRoutine(routine);
  }

  async createRoutine(body: CreateRoutineDto): Promise<ReturnType<typeof serializeRoutine>> {
    const user = await this.currentUserService.getRequiredUser();

    if (!body.name.trim()) {
      throw new AppException("Routine name is required.", HttpStatus.BAD_REQUEST);
    }

    await this.assertExercisesExist(body.exercises.map((exercise) => exercise.exerciseId));

    const routine = await this.prisma.routine.create({
      data: {
        userId: user.id,
        name: body.name.trim(),
        description: body.description?.trim() ?? "",
        exercises: {
          create: this.buildRoutineExerciseCreates(body.exercises),
        },
      },
      include: routineInclude,
    });

    return serializeRoutine(routine);
  }

  async updateRoutine(routineId: string, body: UpdateRoutineDto): Promise<ReturnType<typeof serializeRoutine>> {
    const existing = await this.getOwnedRoutine(routineId);

    if (body.name !== undefined && !body.name.trim()) {
      throw new AppException("Routine name cannot be empty.", HttpStatus.BAD_REQUEST);
    }

    if (body.exercises) {
      if (!body.exercises.length) {
        throw new AppException("A routine needs at least one exercise.", HttpStatus.BAD_REQUEST);
      }

      await this.assertExercisesExist(body.exercises.map((exercise) => exercise.exerciseId));
    }

    const updatedRoutine = await this.prisma.$transaction(async (tx) => {
      const rebuiltExercises = body.exercises ? this.buildRoutineExerciseCreates(body.exercises) : null;

      await tx.routine.update({
        where: {
          id: existing.id,
        },
        data: {
          name: body.name?.trim() ?? existing.name,
          description: body.description?.trim() ?? existing.description,
        },
      });

      if (rebuiltExercises) {
        await tx.routineExercise.deleteMany({
          where: {
            routineId: existing.id,
          },
        });

        await tx.routineExercise.createMany({
          data: rebuiltExercises.map((exercise) => ({
            id: exercise.id,
            routineId: existing.id,
            exerciseId: exercise.exerciseId,
            order: exercise.order,
            notes: exercise.notes,
            restSeconds: exercise.restSeconds,
          })),
        });

        for (const exercise of rebuiltExercises) {
          await tx.routineTargetSet.createMany({
            data: exercise.sets.create.map((set) => ({
              id: set.id,
              routineExerciseId: exercise.id,
              order: set.order,
              type: set.type,
              targetRepsMin: set.targetRepsMin,
              targetRepsMax: set.targetRepsMax,
              targetWeightKg: set.targetWeightKg,
            })),
          });
        }
      }

      return tx.routine.findUniqueOrThrow({
        where: {
          id: existing.id,
        },
        include: routineInclude,
      });
    });

    return serializeRoutine(updatedRoutine);
  }

  private async getOwnedRoutine(routineId: string) {
    const user = await this.currentUserService.getRequiredUser();
    const routine = await this.prisma.routine.findFirst({
      where: {
        id: routineId,
        userId: user.id,
      },
      include: routineInclude,
    });

    if (!routine) {
      throw new AppException(`Routine ${routineId} was not found.`, HttpStatus.NOT_FOUND);
    }

    return routine;
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

  private buildRoutineExerciseCreates(exercises: RoutineExerciseInputDto[]) {
    return exercises.map((exercise, index) => ({
      id: randomUUID(),
      exerciseId: exercise.exerciseId,
      order: index + 1,
      notes: exercise.notes?.trim() ?? "",
      restSeconds: exercise.restSeconds ?? 90,
      sets: {
        create: exercise.sets.map((set, setIndex) => ({
          id: randomUUID(),
          order: setIndex + 1,
          type: set.type ?? "working",
          targetRepsMin: set.targetRepsMin,
          targetRepsMax: set.targetRepsMax,
          targetWeightKg: set.targetWeightKg ?? null,
        })),
      },
    }));
  }
}
