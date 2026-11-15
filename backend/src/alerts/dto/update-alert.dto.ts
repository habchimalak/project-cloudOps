import { ApiPropertyOptional } from '@nestjs/swagger';
import { AlertStatus, Severity } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateAlertDto {
  @ApiPropertyOptional({ example: 'CPU revenu sous le seuil' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  message?: string;

  @ApiPropertyOptional({ enum: Severity, example: Severity.INFO })
  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @ApiPropertyOptional({ enum: AlertStatus, example: AlertStatus.RESOLVED })
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @ApiPropertyOptional({ example: 1, description: 'ID de l\'utilisateur qui a pris en charge l\'alerte' })
  @IsOptional()
  @IsInt()
  @Min(1)
  acknowledgedById?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID de l\'utilisateur qui a résolu l\'alerte' })
  @IsOptional()
  @IsInt()
  @Min(1)
  resolvedById?: number;

  @ApiPropertyOptional({ example: '2026-11-15T18:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  acknowledgedAt?: string;

  @ApiPropertyOptional({ example: '2026-11-15T19:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  resolvedAt?: string;
}
