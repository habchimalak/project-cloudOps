import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateMetricDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cpuUsage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  ramUsage?: number;

  @IsOptional()
  @IsBoolean()
  isUp?: boolean;
}
