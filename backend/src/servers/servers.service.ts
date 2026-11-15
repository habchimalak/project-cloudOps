import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';

export { CreateServerDto, UpdateServerDto };

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
