import { ServerStatus } from '@prisma/client';
import { IsEnum, IsInt, IsIP, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateServerDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  provider!: string;

  @IsString()
  region!: string;

  @IsInt()
  @Min(1)
  cpuCores!: number;

  @IsInt()
  @Min(1)
  ramGb!: number;

  @IsInt()
  @Min(1)
  storageGb!: number;

  @IsIP()
  ipAddress!: string;

  @IsOptional()
  @IsEnum(ServerStatus)
  status?: ServerStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  environmentId?: number;
}
