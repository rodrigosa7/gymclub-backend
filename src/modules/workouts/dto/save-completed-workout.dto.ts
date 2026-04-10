import { IsOptional, IsString, IsDateString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

const setTypes = ["warmup", "working", "dropset", "failure", "assisted"] as const;

export class SaveCompletedWorkoutSetDto {
  @IsOptional()
  @IsString()
  type?: (typeof setTypes)[number];

  @IsOptional()
  reps?: number | null;

  @IsOptional()
  weightKg?: number | null;

  @IsOptional()
  durationSeconds?: number | null;

  @IsOptional()
  distanceMeters?: number | null;

  @IsOptional()
  rir?: number | null;

  @IsOptional()
  isComplete?: boolean;
}

export class SaveCompletedWorkoutExerciseDto {
  @IsString()
  exerciseId!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  restSeconds?: number;

  @ValidateNested({ each: true })
  @Type(() => SaveCompletedWorkoutSetDto)
  sets!: SaveCompletedWorkoutSetDto[];
}

export class SaveCompletedWorkoutDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsDateString()
  startedAt!: string;

  @IsDateString()
  completedAt!: string;

  @ValidateNested({ each: true })
  @Type(() => SaveCompletedWorkoutExerciseDto)
  exercises!: SaveCompletedWorkoutExerciseDto[];
}
