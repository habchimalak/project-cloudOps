import { AlertStatus, Severity } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateAlertDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  message?: string;

  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  acknowledgedById?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  resolvedById?: number;

  @IsOptional()
  @IsDateString()
  acknowledgedAt?: string;

  @IsOptional()
  @IsDateString()
  resolvedAt?: string;
}
