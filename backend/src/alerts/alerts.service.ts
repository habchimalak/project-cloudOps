import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    return this.prisma.alert.update({ where: { id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.alert.delete({ where: { id } });
  }
}
