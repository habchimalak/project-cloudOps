import { Body, Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersService } from './users.service';

class UpdateRoleDto {
  @IsEnum(Role)
  role!: Role;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Roles(Role.ADMIN, Role.DEVOPS, Role.VIEWER)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Roles(Role.ADMIN, Role.DEVOPS, Role.VIEWER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/role')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.service.updateRole(id, dto.role);
  }
}
