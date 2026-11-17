import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServerDto } from './dto/create-server.dto';
import { ServersQueryDto } from './dto/servers-query.dto';
import { UpdateServerDto } from './dto/update-server.dto';

export { CreateServerDto, UpdateServerDto };

@Injectable()
export class ServersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ServersQueryDto) {
    const { page, limit, search, status, provider, region } = query;

    const where: Prisma.ServerWhereInput = {
      ...(status && { status }),
      ...(provider && { provider: { contains: provider, mode: 'insensitive' } }),
      ...(region && { region: { contains: region, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { ipAddress: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.server.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
        include: { environment: { select: { id: true, name: true, type: true } } },
      }),
      this.prisma.server.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const server = await this.prisma.server.findUnique({
      where: { id },
      include: { environment: { select: { id: true, name: true, type: true } } },
    });
    if (!server) throw new NotFoundException(`Serveur #${id} introuvable`);
    return server;
  }

  create(dto: CreateServerDto) {
    return this.prisma.server.create({ data: dto });
  }

  async update(id: number, dto: UpdateServerDto) {
    await this.findOne(id);
    return this.prisma.server.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.server.delete({ where: { id } });
  }
}
