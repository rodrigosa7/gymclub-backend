import { IsEnum, IsNumber, IsOptional } from "class-validator";

const setTypes = ["warmup", "working", "dropset", "failure", "assisted"] as const;

export class RoutineSetDto {
  @IsOptional()
  @IsEnum(setTypes)
  type?: (typeof setTypes)[number];

  @IsOptional()
  @IsNumber()
  targetRepsMin?: number;

  @IsOptional()
  @IsNumber()
  targetRepsMax?: number;

  @IsOptional()
  @IsNumber()
  targetWeightKg?: number | null;
}
