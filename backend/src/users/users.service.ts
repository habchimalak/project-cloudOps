import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ omit: { password: true } });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id }, omit: { password: true } });
  }

  async updateRole(id: number, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur #${id} introuvable`);
    return this.prisma.user.update({
      where: { id },
      data: { role },
      omit: { password: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
