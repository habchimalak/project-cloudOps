import { ApiProperty } from '@nestjs/swagger';
import { EnvironmentType } from '@prisma/client';
import { IsEnum, IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateEnvironmentDto {
  @ApiProperty({ example: 'Production' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ enum: EnvironmentType, example: EnvironmentType.PRODUCTION })
  @IsEnum(EnvironmentType)
  type!: EnvironmentType;

  @ApiProperty({ example: 1, description: 'ID du projet parent' })
  @IsInt()
  @Min(1)
  projectId!: number;
}
