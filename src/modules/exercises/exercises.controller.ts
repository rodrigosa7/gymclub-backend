import { Controller, Get, Param, Query } from "@nestjs/common";

import { ListExercisesQueryDto } from "./dto/list-exercises-query.dto";
import { ExercisesService } from "./exercises.service";

@Controller("api/exercises")
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  async listExercises(@Query() query: ListExercisesQueryDto): Promise<{ data: unknown }> {
    return {
      data: await this.exercisesService.listExercises(query),
    };
  }

  @Get(":exerciseId")
  async getExercise(@Param("exerciseId") exerciseId: string): Promise<{ data: unknown }> {
    return {
      data: await this.exercisesService.getExercise(exerciseId),
    };
  }
}
