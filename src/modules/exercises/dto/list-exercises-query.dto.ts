import { IsOptional, IsString } from "class-validator";

export class ListExercisesQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  muscleGroup?: string;
}
