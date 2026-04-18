import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

import { WeightUnit } from "@prisma/client";

export class RegisterDto {
  @ApiProperty({ example: "John Doe", description: "User's full name" })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: "john@example.com", description: "User's email address" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "password123", description: "Password (min 6 characters)" })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ enum: WeightUnit, example: WeightUnit.kg, description: "Preferred weight unit" })
  @IsEnum(WeightUnit)
  preferredWeightUnit!: WeightUnit;
}
