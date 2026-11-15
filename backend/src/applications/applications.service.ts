import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.application.findMany();
  }

  findOne(id: number) {
    return this.prisma.application.findUnique({ where: { id } });
  }
}
