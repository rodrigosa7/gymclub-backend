import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

import { AddWorkoutExerciseDto } from "./dto/add-workout-exercise.dto";
import { AddWorkoutSetDto } from "./dto/add-workout-set.dto";
import { StartWorkoutDto } from "./dto/start-workout.dto";
import { UpdateWorkoutSetDto } from "./dto/update-workout-set.dto";
import { WorkoutsService } from "./workouts.service";

@Controller("api/workouts")
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Get("active")
  async getActiveWorkout(): Promise<{ data: unknown }> {
    return {
      data: await this.workoutsService.getActiveWorkout(),
    };
  }

  @Post("start")
  async startWorkout(@Body() body: StartWorkoutDto): Promise<{ data: unknown }> {
    return {
      data: await this.workoutsService.startWorkout(body),
    };
  }

  @Get(":workoutId")
  async getWorkout(@Param("workoutId") workoutId: string): Promise<{ data: unknown }> {
    return {
      data: await this.workoutsService.getWorkout(workoutId),
    };
  }

  @Post(":workoutId/exercises")
  async addWorkoutExercise(
    @Param("workoutId") workoutId: string,
    @Body() body: AddWorkoutExerciseDto,
  ): Promise<{ data: unknown }> {
    return {
      data: await this.workoutsService.addWorkoutExercise(workoutId, body),
    };
  }

  @Post(":workoutId/exercises/:workoutExerciseId/sets")
  async addWorkoutSet(
    @Param("workoutId") workoutId: string,
    @Param("workoutExerciseId") workoutExerciseId: string,
    @Body() body: AddWorkoutSetDto,
  ): Promise<{ data: unknown }> {
    return {
      data: await this.workoutsService.addWorkoutSet(workoutId, workoutExerciseId, body),
    };
  }

  @Patch(":workoutId/exercises/:workoutExerciseId/sets/:setId")
  async updateWorkoutSet(
    @Param("workoutId") workoutId: string,
    @Param("workoutExerciseId") workoutExerciseId: string,
    @Param("setId") setId: string,
    @Body() body: UpdateWorkoutSetDto,
  ): Promise<{ data: unknown }> {
    return {
      data: await this.workoutsService.updateWorkoutSet(workoutId, workoutExerciseId, setId, body),
    };
  }

  @Delete(":workoutId/exercises/:workoutExerciseId/sets/:setId")
  async removeWorkoutSet(
    @Param("workoutId") workoutId: string,
    @Param("workoutExerciseId") workoutExerciseId: string,
    @Param("setId") setId: string,
  ): Promise<{ data: unknown }> {
    return {
      data: await this.workoutsService.removeWorkoutSet(workoutId, workoutExerciseId, setId),
    };
  }

  @Delete(":workoutId/exercises/:workoutExerciseId")
  async removeWorkoutExercise(
    @Param("workoutId") workoutId: string,
    @Param("workoutExerciseId") workoutExerciseId: string,
  ): Promise<{ data: unknown }> {
    return {
      data: await this.workoutsService.removeWorkoutExercise(workoutId, workoutExerciseId),
    };
  }

  @Post(":workoutId/complete")
  async completeWorkout(
    @Param("workoutId") workoutId: string,
    @Body() body: { notes?: string },
  ): Promise<{ data: unknown }> {
    return {
      data: await this.workoutsService.completeWorkout(workoutId, body?.notes),
    };
  }
}
