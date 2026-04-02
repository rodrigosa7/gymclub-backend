import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";

import { CreateRoutineDto } from "./dto/create-routine.dto";
import { UpdateRoutineDto } from "./dto/update-routine.dto";
import { RoutinesService } from "./routines.service";

@Controller("api/routines")
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Get()
  async listRoutines(): Promise<{ data: unknown }> {
    return {
      data: await this.routinesService.listRoutines(),
    };
  }

  @Get(":routineId")
  async getRoutine(@Param("routineId") routineId: string): Promise<{ data: unknown }> {
    return {
      data: await this.routinesService.getRoutine(routineId),
    };
  }

  @Post()
  async createRoutine(@Body() body: CreateRoutineDto): Promise<{ data: unknown }> {
    return {
      data: await this.routinesService.createRoutine(body),
    };
  }

  @Patch(":routineId")
  async updateRoutine(
    @Param("routineId") routineId: string,
    @Body() body: UpdateRoutineDto,
  ): Promise<{ data: unknown }> {
    return {
      data: await this.routinesService.updateRoutine(routineId, body),
    };
  }
}
