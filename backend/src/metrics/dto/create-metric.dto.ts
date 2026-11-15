import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CreateMetricDto {
  @ApiProperty({ example: 1, description: 'ID du serveur mesuré' })
  @IsInt()
  @Min(1)
  serverId!: number;

  @ApiProperty({ example: 72.5, description: 'Usage CPU en % (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  cpuUsage!: number;

  @ApiProperty({ example: 55.0, description: 'Usage RAM en % (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  ramUsage!: number;

  @ApiPropertyOptional({ example: true, description: 'Serveur en ligne ?' })
  @IsOptional()
  @IsBoolean()
  isUp?: boolean;
}
