import { Injectable, NotFoundException } from '@nestjs/common';
import { EnvironmentType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class CreateEnvironmentDto {
  name!: string;
  type!: EnvironmentType;
  projectId!: number;
}

export class UpdateEnvironmentDto {
  name?: string;
  type?: EnvironmentType;
}

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
