import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ example: 'Équipe Infra' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: 'Responsable de l\'infrastructure cloud' })
  @IsOptional()
  @IsString()
  description?: string;
}
