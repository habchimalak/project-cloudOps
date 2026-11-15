import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.server.findMany();
  }

  findOne(id: number) {
    return this.prisma.server.findUnique({ where: { id } });
  }
}
