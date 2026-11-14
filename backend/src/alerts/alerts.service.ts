import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.alert.findMany();
  }

  findOne(id: number) {
    return this.prisma.alert.findUnique({ where: { id } });
  }
}
