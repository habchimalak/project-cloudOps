import { Injectable, NotFoundException } from '@nestjs/common';
import { AlertStatus, Severity } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class CreateAlertDto {
  message!: string;
  severity!: Severity;
  measuredValue!: number;
  serverId!: number;
  thresholdId?: number;
}

export class UpdateAlertDto {
  message?: string;
  severity?: Severity;
  status?: AlertStatus;
  acknowledgedById?: number;
  resolvedById?: number;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.alert.findMany();
  }

  async findOne(id: number) {
    const alert = await this.prisma.alert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException(`Alerte #${id} introuvable`);
    return alert;
  }

  create(dto: CreateAlertDto) {
    return this.prisma.alert.create({ data: dto });
  }

  async update(id: number, dto: UpdateAlertDto) {
    await this.findOne(id);
    return this.prisma.alert.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.alert.delete({ where: { id } });
  }
}
