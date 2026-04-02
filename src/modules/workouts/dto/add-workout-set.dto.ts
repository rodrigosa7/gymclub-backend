import { IsBoolean, IsEnum, IsNumber, IsOptional } from "class-validator";

const setTypes = ["warmup", "working", "dropset", "failure", "assisted"] as const;

export class AddWorkoutSetDto {
  @IsOptional()
  @IsEnum(setTypes)
  type?: (typeof setTypes)[number];

  @IsOptional()
  @IsNumber()
  reps?: number | null;

  @IsOptional()
  @IsNumber()
  weightKg?: number | null;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number | null;

  @IsOptional()
  @IsNumber()
  distanceMeters?: number | null;

  @IsOptional()
  @IsNumber()
  rir?: number | null;

  @IsOptional()
  @IsBoolean()
  isComplete?: boolean;
}
