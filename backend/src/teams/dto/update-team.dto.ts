import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateTeamDto {
  @ApiPropertyOptional({ example: 'Équipe DevOps' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'Nouvelle description' })
  @IsOptional()
  @IsString()
  description?: string;
}
