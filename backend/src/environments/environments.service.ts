import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { EnvironmentsQueryDto } from './dto/environments-query.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';

export { CreateEnvironmentDto, UpdateEnvironmentDto };

@Injectable()
export class EnvironmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: EnvironmentsQueryDto) {
    const { page, limit, projectId } = query;

    const where = projectId ? { projectId } : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.environment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.environment.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const env = await this.prisma.environment.findUnique({ where: { id } });
    if (!env) throw new NotFoundException(`Environnement #${id} introuvable`);
    return env;
  }

  create(dto: CreateEnvironmentDto) {
    return this.prisma.environment.create({ data: dto });
  }

  async update(id: number, dto: UpdateEnvironmentDto) {
    await this.findOne(id);
    return this.prisma.environment.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.environment.delete({ where: { id } });
  }
}
