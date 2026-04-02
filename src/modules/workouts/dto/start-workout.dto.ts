import { IsArray, IsOptional, IsString } from "class-validator";

export class StartWorkoutDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  routineId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exerciseIds?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
