import { AppStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  version!: string;

  @IsOptional()
  @IsEnum(AppStatus)
  status?: AppStatus;

  @IsInt()
  @Min(1)
  serverId!: number;

  @IsInt()
  @Min(1)
  environmentId!: number;
}
