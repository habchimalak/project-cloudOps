import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AlertsService } from './alerts.service';
import { AlertsQueryDto } from './dto/alerts-query.dto';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@ApiTags('alerts')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly service: AlertsService) {}

  @ApiOperation({ summary: 'Lister les alertes (pagination, filtres gravité/statut/serveur/période)' })
  @ApiResponse({ status: 200, description: 'Liste paginée des alertes : { data, meta }.' })
  @ApiResponse({ status: 400, description: 'Paramètres invalides.' })
  @Roles(Role.ADMIN, Role.DEVOPS, Role.VIEWER)
  @Get()
  findAll(@Query() query: AlertsQueryDto) { return this.service.findAll(query); }

  @ApiOperation({ summary: 'Obtenir une alerte par ID' })
  @ApiResponse({ status: 200, description: 'Alerte trouvée.' })
  @ApiResponse({ status: 404, description: 'Alerte introuvable.' })
  @Roles(Role.ADMIN, Role.DEVOPS, Role.VIEWER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @ApiOperation({ summary: 'Créer une alerte (ADMIN, DEVOPS)' })
  @ApiResponse({ status: 201, description: 'Alerte créée.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @Roles(Role.ADMIN, Role.DEVOPS)
  @Post()
  create(@Body() dto: CreateAlertDto) { return this.service.create(dto); }

  @ApiOperation({ summary: 'Modifier une alerte — acquitter ou résoudre (ADMIN, DEVOPS)' })
  @ApiResponse({ status: 200, description: 'Alerte mise à jour.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @ApiResponse({ status: 404, description: 'Alerte introuvable.' })
  @Roles(Role.ADMIN, Role.DEVOPS)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAlertDto) { return this.service.update(id, dto); }

  @ApiOperation({ summary: 'Supprimer une alerte (ADMIN uniquement)' })
  @ApiResponse({ status: 200, description: 'Alerte supprimée.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @ApiResponse({ status: 404, description: 'Alerte introuvable.' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
