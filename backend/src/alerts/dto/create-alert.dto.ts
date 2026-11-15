import { AlertStatus, Severity } from '@prisma/client';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateAlertDto {
  @IsString()
  @MinLength(5)
  message!: string;

  @IsEnum(Severity)
  severity!: Severity;

  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @IsNumber()
  @Min(0)
  measuredValue!: number;

  @IsInt()
  @Min(1)
  serverId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  thresholdId?: number;
}
