import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServerStatus } from '@prisma/client';
import { IsEnum, IsInt, IsIP, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateServerDto {
  @ApiPropertyOptional({ example: 'web-prod-02' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'Azure' })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ example: 'eu-north-1' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt()
  @Min(1)
  cpuCores?: number;

  @ApiPropertyOptional({ example: 16 })
  @IsOptional()
  @IsInt()
  @Min(1)
  ramGb?: number;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsInt()
  @Min(1)
  storageGb?: number;

  @ApiPropertyOptional({ example: '10.0.0.11' })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiPropertyOptional({ enum: ServerStatus, example: ServerStatus.MAINTENANCE })
  @IsOptional()
  @IsEnum(ServerStatus)
  status?: ServerStatus;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  environmentId?: number;
}
