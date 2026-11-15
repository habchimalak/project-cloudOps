import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServerStatus } from '@prisma/client';
import { IsEnum, IsInt, IsIP, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateServerDto {
  @ApiProperty({ example: 'web-prod-01' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'AWS' })
  @IsString()
  provider!: string;

  @ApiProperty({ example: 'eu-west-3' })
  @IsString()
  region!: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  cpuCores!: number;

  @ApiProperty({ example: 8 })
  @IsInt()
  @Min(1)
  ramGb!: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  storageGb!: number;

  @ApiProperty({ example: '10.0.0.10' })
  @IsIP()
  ipAddress!: string;

  @ApiPropertyOptional({ enum: ServerStatus, example: ServerStatus.ONLINE })
  @IsOptional()
  @IsEnum(ServerStatus)
  status?: ServerStatus;

  @ApiPropertyOptional({ example: 1, description: 'ID de l\'environnement' })
  @IsOptional()
  @IsInt()
  @Min(1)
  environmentId?: number;
}
