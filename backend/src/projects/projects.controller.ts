import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateProjectDto, ProjectsService, UpdateProjectDto } from './projects.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Roles(Role.ADMIN, Role.DEVOPS, Role.VIEWER)
  @Get()
  findAll() { return this.service.findAll(); }

  @Roles(Role.ADMIN, Role.DEVOPS, Role.VIEWER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Roles(Role.ADMIN, Role.DEVOPS)
  @Post()
  create(@Body() dto: CreateProjectDto) { return this.service.create(dto); }

  @Roles(Role.ADMIN, Role.DEVOPS)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto) { return this.service.update(id, dto); }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
