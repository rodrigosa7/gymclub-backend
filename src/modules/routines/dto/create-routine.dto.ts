import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

import { RoutineExerciseInputDto } from "./routine-exercise-input.dto";

export class CreateRoutineDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RoutineExerciseInputDto)
  exercises!: RoutineExerciseInputDto[];
}
