import { EnvironmentType } from '@prisma/client';
import { IsEnum, IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateEnvironmentDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEnum(EnvironmentType)
  type!: EnvironmentType;

  @IsInt()
  @Min(1)
  projectId!: number;
}
