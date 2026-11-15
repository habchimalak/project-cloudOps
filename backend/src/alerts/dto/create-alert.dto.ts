import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlertStatus, Severity } from '@prisma/client';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateAlertDto {
  @ApiProperty({ example: 'CPU dépasse 90% depuis 5 minutes' })
  @IsString()
  @MinLength(5)
  message!: string;

  @ApiProperty({ enum: Severity, example: Severity.WARNING })
  @IsEnum(Severity)
  severity!: Severity;

  @ApiPropertyOptional({ enum: AlertStatus, example: AlertStatus.OPEN })
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @ApiProperty({ example: 91.5, description: 'Valeur mesurée ayant déclenché l\'alerte' })
  @IsNumber()
  @Min(0)
  measuredValue!: number;

  @ApiProperty({ example: 1, description: 'ID du serveur concerné' })
  @IsInt()
  @Min(1)
  serverId!: number;

  @ApiPropertyOptional({ example: 1, description: 'ID du seuil ayant déclenché l\'alerte' })
  @IsOptional()
  @IsInt()
  @Min(1)
  thresholdId?: number;
}
