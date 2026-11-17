import { ApiPropertyOptional } from '@nestjs/swagger';
import { AlertStatus, Severity } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class AlertsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: Severity,
    description: 'Filtrer par gravité (INFO, WARNING, CRITICAL)',
  })
  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @ApiPropertyOptional({
    enum: AlertStatus,
    description: 'Filtrer par statut (OPEN, ACKNOWLEDGED, RESOLVED)',
  })
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @ApiPropertyOptional({ example: 1, description: 'Filtrer par ID de serveur' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  serverId?: number;

  @ApiPropertyOptional({
    example: '2026-01-01T00:00:00.000Z',
    description: 'Date de début de période (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.999Z',
    description: 'Date de fin de période (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
