import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamsQueryDto } from './dto/teams-query.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

export { CreateTeamDto, UpdateTeamDto };

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: TeamsQueryDto) {
    const { page, limit, search } = query;

    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.team.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.team.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
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
