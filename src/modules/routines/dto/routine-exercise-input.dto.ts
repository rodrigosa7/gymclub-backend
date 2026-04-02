import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

import { RoutineSetDto } from "./routine-set.dto";

export class RoutineExerciseInputDto {
  @IsString()
  exerciseId!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  restSeconds?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RoutineSetDto)
  sets!: RoutineSetDto[];
}
