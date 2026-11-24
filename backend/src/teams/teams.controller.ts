import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamsQueryDto } from './dto/teams-query.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamsService } from './teams.service';

@ApiTags('teams')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly service: TeamsService) {}

  @ApiOperation({ summary: 'Lister les équipes (pagination, recherche)' })
  @ApiResponse({ status: 200, description: 'Liste paginée des équipes : { data, meta }.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  @Roles(Role.ADMIN, Role.DEVOPS, Role.VIEWER)
  @Get()
  findAll(@Query() query: TeamsQueryDto) { return this.service.findAll(query); }

  @ApiOperation({ summary: 'Obtenir une équipe par ID' })
  @ApiResponse({ status: 200, description: 'Équipe trouvée.' })
  @ApiResponse({ status: 404, description: 'Équipe introuvable.' })
  @Roles(Role.ADMIN, Role.DEVOPS, Role.VIEWER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @ApiOperation({ summary: 'Créer une équipe (ADMIN, DEVOPS)' })
  @ApiResponse({ status: 201, description: 'Équipe créée.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @Roles(Role.ADMIN, Role.DEVOPS)
  @Post()
  create(@Body() dto: CreateTeamDto) { return this.service.create(dto); }

  @ApiOperation({ summary: 'Modifier une équipe (ADMIN, DEVOPS)' })
  @ApiResponse({ status: 200, description: 'Équipe mise à jour.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @ApiResponse({ status: 404, description: 'Équipe introuvable.' })
  @Roles(Role.ADMIN, Role.DEVOPS)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTeamDto) { return this.service.update(id, dto); }

  @ApiOperation({ summary: 'Supprimer une équipe (ADMIN uniquement)' })
  @ApiResponse({ status: 200, description: 'Équipe supprimée.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @ApiResponse({ status: 404, description: 'Équipe introuvable.' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
