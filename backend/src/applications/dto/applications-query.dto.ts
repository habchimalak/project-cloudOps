import { ApiPropertyOptional } from '@nestjs/swagger';
import { AppStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ApplicationsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: AppStatus,
    description: 'Filtrer par statut (RUNNING, STOPPED, DEPLOYING, FAILED)',
  })
  @IsOptional()
  @IsEnum(AppStatus)
  status?: AppStatus;

  @ApiPropertyOptional({ example: 1, description: 'Filtrer par ID de serveur' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  serverId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filtrer par ID d\'environnement' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  environmentId?: number;
}
