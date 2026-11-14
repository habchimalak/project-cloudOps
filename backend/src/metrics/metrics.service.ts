import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.metric.findMany();
  }

  findOne(id: number) {
    return this.prisma.metric.findUnique({ where: { id } });
  }
}
