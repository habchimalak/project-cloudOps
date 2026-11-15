import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { ServersService } from './servers.service';

@ApiTags('servers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('servers')
export class ServersController {
  constructor(private readonly service: ServersService) {}

  @ApiOperation({ summary: 'Lister tous les serveurs' })
  @ApiResponse({ status: 200, description: 'Liste des serveurs.' })
  @Roles(Role.ADMIN, Role.DEVOPS, Role.VIEWER)
  @Get()
  findAll() { return this.service.findAll(); }

  @ApiOperation({ summary: 'Obtenir un serveur par ID' })
  @ApiResponse({ status: 200, description: 'Serveur trouvé.' })
  @ApiResponse({ status: 404, description: 'Serveur introuvable.' })
  @Roles(Role.ADMIN, Role.DEVOPS, Role.VIEWER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @ApiOperation({ summary: 'Créer un serveur (ADMIN, DEVOPS)' })
  @ApiResponse({ status: 201, description: 'Serveur créé.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @Roles(Role.ADMIN, Role.DEVOPS)
  @Post()
  create(@Body() dto: CreateServerDto) { return this.service.create(dto); }

  @ApiOperation({ summary: 'Modifier un serveur (ADMIN, DEVOPS)' })
  @ApiResponse({ status: 200, description: 'Serveur mis à jour.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @ApiResponse({ status: 404, description: 'Serveur introuvable.' })
  @Roles(Role.ADMIN, Role.DEVOPS)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServerDto) { return this.service.update(id, dto); }

  @ApiOperation({ summary: 'Supprimer un serveur (ADMIN uniquement)' })
  @ApiResponse({ status: 200, description: 'Serveur supprimé.' })
  @ApiResponse({ status: 403, description: 'Droits insuffisants.' })
  @ApiResponse({ status: 404, description: 'Serveur introuvable.' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
