import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AlertsService } from '../alerts/alerts.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { MetricsQueryDto } from './dto/metrics-query.dto';
import { UpdateMetricDto } from './dto/update-metric.dto';

export { CreateMetricDto, UpdateMetricDto };

@Injectable()
export class MetricsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alertsService: AlertsService,
  ) {}

  async findAll(query: MetricsQueryDto) {
    const { page, limit, serverId, from, to } = query;

    const where: Prisma.MetricWhereInput = {
      ...(serverId && { serverId }),
      ...((from || to) && {
        recordedAt: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to) }),
        },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.metric.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { recordedAt: 'desc' },
        include: { server: { select: { id: true, name: true } } },
      }),
      this.prisma.metric.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const metric = await this.prisma.metric.findUnique({
      where: { id },
      include: { server: { select: { id: true, name: true } } },
    });
    if (!metric) throw new NotFoundException(`Métrique #${id} introuvable`);
    return metric;
  }

  async create(dto: CreateMetricDto) {
    const metric = await this.prisma.metric.create({ data: dto });
    // BF-27 : vérification automatique des seuils après chaque mesure enregistrée
    await this.alertsService.checkThresholds(
      metric.serverId,
      metric.cpuUsage,
      metric.ramUsage,
    );
    return metric;
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
