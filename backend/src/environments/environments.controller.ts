import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { EnvironmentsQueryDto } from './dto/environments-query.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { EnvironmentsService } from './environments.service';

@ApiTags('environments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('environments')
export class EnvironmentsController {
  constructor(private readonly service: EnvironmentsService) {}

  @ApiOperation({ summary: 'Lister les environnements (pagination, filtre par projet)' })
  @ApiResponse({ status: 200, description: 'Liste paginée des environnements : { data, meta }.' })
  @Roles(Role.ADMIN, Role.DEVOPS, Role.VIEWER)
  @Get()
  findAll(@Query() query: EnvironmentsQueryDto) { return this.service.findAll(query); }

  @ApiOperation({ summary: 'Obtenir un environnement par ID' })
  @ApiResponse({ status: 200, description: 'Environnement trouvé.' })
  @ApiResponse({ status: 404, description: 'Environnement introuvable.' })
  @Roles(Role.ADMIN, Role.DEVOPS, Role.VIEWER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @ApiOperation({ summary: 'Créer un environnement (ADMIN, DEVOPS)' })
  @ApiResponse({ status: 201, description: 'Environnement créé.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @Roles(Role.ADMIN, Role.DEVOPS)
  @Post()
  create(@Body() dto: CreateEnvironmentDto) { return this.service.create(dto); }

  @ApiOperation({ summary: 'Modifier un environnement (ADMIN, DEVOPS)' })
  @ApiResponse({ status: 200, description: 'Environnement mis à jour.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @ApiResponse({ status: 404, description: 'Environnement introuvable.' })
  @Roles(Role.ADMIN, Role.DEVOPS)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEnvironmentDto) { return this.service.update(id, dto); }

  @ApiOperation({ summary: 'Supprimer un environnement (ADMIN uniquement)' })
  @ApiResponse({ status: 200, description: 'Environnement supprimé.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @ApiResponse({ status: 404, description: 'Environnement introuvable.' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
