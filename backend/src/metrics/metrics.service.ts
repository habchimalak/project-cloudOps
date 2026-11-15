import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class CreateMetricDto {
  serverId!: number;
  cpuUsage!: number;
  ramUsage!: number;
  isUp?: boolean;
}

export class UpdateMetricDto {
  cpuUsage?: number;
  ramUsage?: number;
  isUp?: boolean;
}

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.metric.findMany();
  }

  async findOne(id: number) {
    const metric = await this.prisma.metric.findUnique({ where: { id } });
    if (!metric) throw new NotFoundException(`Métrique #${id} introuvable`);
    return metric;
  }

  create(dto: CreateMetricDto) {
    return this.prisma.metric.create({ data: dto });
  }

  async update(id: number, dto: UpdateMetricDto) {
    await this.findOne(id);
    return this.prisma.metric.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.metric.delete({ where: { id } });
  }
}
