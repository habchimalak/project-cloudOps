import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

export { CreateAlertDto, UpdateAlertDto };

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
    return this.prisma.alert.update({ where: { id }, data: dto as any });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.alert.delete({ where: { id } });
  }
}
