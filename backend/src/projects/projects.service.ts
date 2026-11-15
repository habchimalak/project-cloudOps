import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class CreateProjectDto {
  name!: string;
  description?: string;
  status?: ProjectStatus;
}

export class UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.project.findMany();
  }

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException(`Projet #${id} introuvable`);
    return project;
  }

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({ data: dto });
  }

  async update(id: number, dto: UpdateProjectDto) {
    await this.findOne(id);
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.project.delete({ where: { id } });
  }
}
