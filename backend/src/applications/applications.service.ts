import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

export { CreateApplicationDto, UpdateApplicationDto };

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.application.findMany();
  }

  async findOne(id: number) {
    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app) throw new NotFoundException(`Application #${id} introuvable`);
    return app;
  }

  create(dto: CreateApplicationDto) {
    return this.prisma.application.create({ data: dto });
  }

  async update(id: number, dto: UpdateApplicationDto) {
    await this.findOne(id);
    return this.prisma.application.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.application.delete({ where: { id } });
  }
}
