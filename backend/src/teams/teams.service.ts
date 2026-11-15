import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class CreateTeamDto {
  name!: string;
  description?: string;
}

export class UpdateTeamDto {
  name?: string;
  description?: string;
}

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.team.findMany();
  }

  async findOne(id: number) {
    const team = await this.prisma.team.findUnique({ where: { id } });
    if (!team) throw new NotFoundException(`Équipe #${id} introuvable`);
    return team;
  }

  create(dto: CreateTeamDto) {
    return this.prisma.team.create({ data: dto });
  }

  async update(id: number, dto: UpdateTeamDto) {
    await this.findOne(id);
    return this.prisma.team.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.team.delete({ where: { id } });
  }
}
