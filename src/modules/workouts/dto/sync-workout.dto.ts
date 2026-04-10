import { IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

const setTypes = ["warmup", "working", "dropset", "failure", "assisted"] as const;

export class SyncWorkoutSetDto {
  @IsOptional()
  @IsString()
  id?: string;

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

export class SyncWorkoutExerciseDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  exerciseId!: string;

  @IsOptional()
  notes?: string;

  @IsOptional()
  restSeconds?: number;

  @ValidateNested({ each: true })
  @Type(() => SyncWorkoutSetDto)
  sets!: SyncWorkoutSetDto[];
}

export class SyncWorkoutDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @ValidateNested({ each: true })
  @Type(() => SyncWorkoutExerciseDto)
  exercises!: SyncWorkoutExerciseDto[];
}
