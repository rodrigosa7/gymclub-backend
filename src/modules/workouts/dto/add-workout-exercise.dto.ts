import { IsNumber, IsOptional, IsString } from "class-validator";

export class AddWorkoutExerciseDto {
  @IsString()
  exerciseId!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  restSeconds?: number;
}
