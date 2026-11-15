import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';

export { CreateEnvironmentDto, UpdateEnvironmentDto };

@Injectable()
export class EnvironmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.environment.findMany();
  }

  async findOne(id: number) {
    const env = await this.prisma.environment.findUnique({ where: { id } });
    if (!env) throw new NotFoundException(`Environnement #${id} introuvable`);
    return env;
  }

  create(dto: CreateEnvironmentDto) {
    return this.prisma.environment.create({ data: dto });
  }

  async update(id: number, dto: UpdateEnvironmentDto) {
    await this.findOne(id);
    return this.prisma.environment.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.environment.delete({ where: { id } });
  }
}
