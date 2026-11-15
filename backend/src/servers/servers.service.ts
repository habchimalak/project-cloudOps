import { Injectable, NotFoundException } from '@nestjs/common';
import { ServerStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class CreateServerDto {
  name!: string;
  provider!: string;
  region!: string;
  cpuCores!: number;
  ramGb!: number;
  storageGb!: number;
  ipAddress!: string;
  status?: ServerStatus;
  environmentId?: number;
}

export class UpdateServerDto {
  name?: string;
  provider?: string;
  region?: string;
  cpuCores?: number;
  ramGb?: number;
  storageGb?: number;
  ipAddress?: string;
  status?: ServerStatus;
  environmentId?: number;
}

@Injectable()
export class ServersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.server.findMany();
  }

  async findOne(id: number) {
    const server = await this.prisma.server.findUnique({ where: { id } });
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
