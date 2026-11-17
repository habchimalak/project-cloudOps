import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServerStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ServersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ServerStatus,
    description: 'Filtrer par statut (ONLINE, OFFLINE, MAINTENANCE)',
  })
  @IsOptional()
  @IsEnum(ServerStatus)
  status?: ServerStatus;

  @ApiPropertyOptional({ example: 'AWS', description: 'Filtrer par fournisseur (AWS, Azure…)' })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ example: 'eu-west-3', description: 'Filtrer par région' })
  @IsOptional()
  @IsString()
  region?: string;
}
