import { HttpStatus, Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { AppException } from "../../shared/app.exception";
import { serializeExercise } from "../../shared/serializers";
import { ListExercisesQueryDto } from "./dto/list-exercises-query.dto";

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  async listExercises(query: ListExercisesQueryDto): Promise<ReturnType<typeof serializeExercise>[]> {
    const exercises = await this.prisma.exercise.findMany({
      orderBy: {
        name: "asc",
      },
    });

    const search = query.search?.trim().toLowerCase();
    const muscleGroup = query.muscleGroup?.trim().toLowerCase();

    return exercises
      .filter((exercise) => {
        if (search) {
          const instructions = exercise.instructions as string[];
          const matchesSearch =
            exercise.name.toLowerCase().includes(search) ||
            instructions.some((instruction) => instruction.toLowerCase().includes(search));

          if (!matchesSearch) {
            return false;
          }
        }

        if (muscleGroup) {
          const muscleGroups = exercise.muscleGroups as string[];

          if (!muscleGroups.includes(muscleGroup)) {
            return false;
          }
        }

        return true;
      })
      .map(serializeExercise);
  }

  async getExercise(exerciseId: string): Promise<ReturnType<typeof serializeExercise>> {
    const exercise = await this.prisma.exercise.findUnique({
      where: {
        id: exerciseId,
      },
    });

    if (!exercise) {
      throw new AppException(`Exercise ${exerciseId} was not found.`, HttpStatus.NOT_FOUND);
    }

    return serializeExercise(exercise);
  }
}
