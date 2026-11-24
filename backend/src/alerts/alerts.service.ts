import { Injectable, NotFoundException } from '@nestjs/common';
import { Comparator, MetricType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AlertsQueryDto } from './dto/alerts-query.dto';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

export { CreateAlertDto, UpdateAlertDto };

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AlertsQueryDto) {
    const { page, limit, severity, status, serverId, from, to } = query;

    const where: Prisma.AlertWhereInput = {
      ...(severity && { severity }),
      ...(status && { status }),
      ...(serverId && { serverId }),
      ...((from || to) && {
        createdAt: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to) }),
        },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.alert.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          server: { select: { id: true, name: true } },
          threshold: { select: { id: true, metricType: true, value: true } },
        },
      }),
      this.prisma.alert.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
      include: {
        server: { select: { id: true, name: true } },
        threshold: { select: { id: true, metricType: true, value: true, comparator: true } },
        acknowledgedBy: { select: { id: true, firstName: true, lastName: true } },
        resolvedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!alert) throw new NotFoundException(`Alerte #${id} introuvable`);
    return alert;
  }

  create(dto: CreateAlertDto) {
    return this.prisma.alert.create({ data: dto });
  }

  async update(id: number, dto: UpdateAlertDto) {
    await this.findOne(id);
    return this.prisma.alert.update({
      where: { id },
      data: {
        ...dto,
        acknowledgedAt: dto.acknowledgedAt ? new Date(dto.acknowledgedAt) : undefined,
        resolvedAt: dto.resolvedAt ? new Date(dto.resolvedAt) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.alert.delete({ where: { id } });
  }

  // ----------------------------------------------------------------
  // Génération automatique d'alertes (BF-27)
  // Appelé par MetricsService après chaque enregistrement de métrique.
  // ----------------------------------------------------------------
  async checkThresholds(
    serverId: number,
    cpuUsage: number,
    ramUsage: number,
  ): Promise<void> {
    // Charge les seuils actifs : spécifiques à ce serveur OU globaux (serverId null)
    const thresholds = await this.prisma.alertThreshold.findMany({
      where: {
        isActive: true,
        OR: [{ serverId }, { serverId: null }],
      },
    });

    for (const threshold of thresholds) {
      const measured =
        threshold.metricType === MetricType.CPU ? cpuUsage : ramUsage;

      const triggered =
        threshold.comparator === Comparator.GT
          ? measured > threshold.value
          : measured < threshold.value;

      if (!triggered) continue;

      // Évite les doublons : ne crée pas une nouvelle alerte OPEN si une alerte
      // identique (même seuil, même serveur) est déjà ouverte ou acquittée.
      const existing = await this.prisma.alert.findFirst({
        where: {
          serverId,
          thresholdId: threshold.id,
          status: { in: ['OPEN', 'ACKNOWLEDGED'] },
        },
      });

      if (existing) continue;

      const comparatorLabel = threshold.comparator === Comparator.GT ? '>' : '<';
      await this.prisma.alert.create({
        data: {
          message: `${threshold.metricType} ${comparatorLabel} ${threshold.value}% (valeur mesurée : ${measured.toFixed(1)}%)`,
          severity: threshold.severity,
          status: 'OPEN',
          measuredValue: measured,
          serverId,
          thresholdId: threshold.id,
        },
      });
    }
  }
}
