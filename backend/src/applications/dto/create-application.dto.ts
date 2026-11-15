import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ example: 'shop-frontend' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: '1.0.0' })
  @IsString()
  version!: string;

  @ApiPropertyOptional({ enum: AppStatus, example: AppStatus.RUNNING })
  @IsOptional()
  @IsEnum(AppStatus)
  status?: AppStatus;

  @ApiProperty({ example: 1, description: 'ID du serveur hébergeant l\'application' })
  @IsInt()
  @Min(1)
  serverId!: number;

  @ApiProperty({ example: 1, description: 'ID de l\'environnement' })
  @IsInt()
  @Min(1)
  environmentId!: number;
}
