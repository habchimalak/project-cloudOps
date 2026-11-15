import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnvironmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.environment.findMany();
  }

  findOne(id: number) {
    return this.prisma.environment.findUnique({ where: { id } });
  }
}
