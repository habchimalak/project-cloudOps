import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@ApiTags('applications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @ApiOperation({ summary: 'Lister toutes les applications' })
  @ApiResponse({ status: 200, description: 'Liste des applications.' })
  @Roles(Role.ADMIN, Role.DEVOPS, Role.VIEWER)
  @Get()
  findAll() { return this.service.findAll(); }

  @ApiOperation({ summary: 'Obtenir une application par ID' })
  @ApiResponse({ status: 200, description: 'Application trouvée.' })
  @ApiResponse({ status: 404, description: 'Application introuvable.' })
  @Roles(Role.ADMIN, Role.DEVOPS, Role.VIEWER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @ApiOperation({ summary: 'Créer une application (ADMIN, DEVOPS)' })
  @ApiResponse({ status: 201, description: 'Application créée.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @Roles(Role.ADMIN, Role.DEVOPS)
  @Post()
  create(@Body() dto: CreateApplicationDto) { return this.service.create(dto); }

  @ApiOperation({ summary: 'Modifier une application (ADMIN, DEVOPS)' })
  @ApiResponse({ status: 200, description: 'Application mise à jour.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @ApiResponse({ status: 404, description: 'Application introuvable.' })
  @Roles(Role.ADMIN, Role.DEVOPS)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateApplicationDto) { return this.service.update(id, dto); }

  @ApiOperation({ summary: 'Supprimer une application (ADMIN uniquement)' })
  @ApiResponse({ status: 200, description: 'Application supprimée.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @ApiResponse({ status: 404, description: 'Application introuvable.' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
