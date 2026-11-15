import { IsBoolean, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CreateMetricDto {
  @IsInt()
  @Min(1)
  serverId!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  cpuUsage!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  ramUsage!: number;

  @IsOptional()
  @IsBoolean()
  isUp?: boolean;
}
