import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    const { name, description } = createRoleDto;

    const existingRole = await this.prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new ConflictException('El rol ya existe');
    }

    return this.prisma.role.create({
      data: {
        name,
        description,
      },
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`No existe un rol con el ID ${id}`);
    }

    return role;
  }

  async assignRole(userId: number, roleId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`No existe un usuario con el ID ${userId}`);
    }

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`No existe un rol con el ID ${roleId}`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roleId,
      },
      select: {
        id: true,
        name: true,
        lastname: true,
        email: true,
        roleId: true,
      },
    });
  }
}
