import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationsQueryDto } from './dto/applications-query.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

export { CreateApplicationDto, UpdateApplicationDto };

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ApplicationsQueryDto) {
    const { page, limit, search, status, serverId, environmentId } = query;

    const where: Prisma.ApplicationWhereInput = {
      ...(status && { status }),
      ...(serverId && { serverId }),
      ...(environmentId && { environmentId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { version: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.application.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
        include: {
          server: { select: { id: true, name: true } },
          environment: { select: { id: true, name: true, type: true } },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: {
        server: { select: { id: true, name: true } },
        environment: { select: { id: true, name: true, type: true } },
      },
    });
    if (!app) throw new NotFoundException(`Application #${id} introuvable`);
    return app;
  }

  create(dto: CreateApplicationDto) {
    return this.prisma.application.create({ data: dto });
  }

  async update(id: number, dto: UpdateApplicationDto) {
    await this.findOne(id);
    return this.prisma.application.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.application.delete({ where: { id } });
  }
}
