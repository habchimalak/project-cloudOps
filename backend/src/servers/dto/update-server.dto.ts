import { ServerStatus } from '@prisma/client';
import { IsEnum, IsInt, IsIP, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateServerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  cpuCores?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  ramGb?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  storageGb?: number;

  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @IsOptional()
  @IsEnum(ServerStatus)
  status?: ServerStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  environmentId?: number;
}
