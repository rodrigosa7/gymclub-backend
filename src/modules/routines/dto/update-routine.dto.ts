import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

import { RoutineExerciseInputDto } from "./routine-exercise-input.dto";

export class UpdateRoutineDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineExerciseInputDto)
  exercises?: RoutineExerciseInputDto[];
}
