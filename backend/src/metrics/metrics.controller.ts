import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateMetricDto } from './dto/create-metric.dto';
import { UpdateMetricDto } from './dto/update-metric.dto';
import { MetricsService } from './metrics.service';

@ApiTags('metrics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('metrics')
export class MetricsController {
  constructor(private readonly service: MetricsService) {}

  @ApiOperation({ summary: 'Lister toutes les métriques' })
  @ApiResponse({ status: 200, description: 'Liste des métriques.' })
  @Roles(Role.ADMIN, Role.DEVOPS, Role.VIEWER)
  @Get()
  findAll() { return this.service.findAll(); }

  @ApiOperation({ summary: 'Obtenir une métrique par ID' })
  @ApiResponse({ status: 200, description: 'Métrique trouvée.' })
  @ApiResponse({ status: 404, description: 'Métrique introuvable.' })
  @Roles(Role.ADMIN, Role.DEVOPS, Role.VIEWER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @ApiOperation({ summary: 'Enregistrer une métrique (ADMIN, DEVOPS)' })
  @ApiResponse({ status: 201, description: 'Métrique enregistrée.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @Roles(Role.ADMIN, Role.DEVOPS)
  @Post()
  create(@Body() dto: CreateMetricDto) { return this.service.create(dto); }

  @ApiOperation({ summary: 'Modifier une métrique (ADMIN, DEVOPS)' })
  @ApiResponse({ status: 200, description: 'Métrique mise à jour.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @ApiResponse({ status: 404, description: 'Métrique introuvable.' })
  @Roles(Role.ADMIN, Role.DEVOPS)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMetricDto) { return this.service.update(id, dto); }

  @ApiOperation({ summary: 'Supprimer une métrique (ADMIN uniquement)' })
  @ApiResponse({ status: 200, description: 'Métrique supprimée.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @ApiResponse({ status: 404, description: 'Métrique introuvable.' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
