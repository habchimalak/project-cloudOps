import { ApiPropertyOptional } from '@nestjs/swagger';
import { AppStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateApplicationDto {
  @ApiPropertyOptional({ example: 'shop-backend' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: '2.0.0' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({ enum: AppStatus, example: AppStatus.STOPPED })
  @IsOptional()
  @IsEnum(AppStatus)
  status?: AppStatus;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  serverId?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  environmentId?: number;
}
