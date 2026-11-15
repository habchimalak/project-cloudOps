import { ApiPropertyOptional } from '@nestjs/swagger';
import { EnvironmentType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateEnvironmentDto {
  @ApiPropertyOptional({ example: 'Staging' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ enum: EnvironmentType, example: EnvironmentType.STAGING })
  @IsOptional()
  @IsEnum(EnvironmentType)
  type?: EnvironmentType;
}
