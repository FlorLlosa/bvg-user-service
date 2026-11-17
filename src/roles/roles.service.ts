import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  create(): never {
    throw new ForbiddenException(
      'La creación de nuevos roles está deshabilitada',
    );
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
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`No existe un usuario con el ID ${userId}`);
    }

    if (user.role?.name === 'ADMIN') {
      throw new ForbiddenException(
        'No está permitido modificar el rol de un Gerente General',
      );
    }

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`No existe un rol con el ID ${roleId}`);
    }

    if (!['EMPLEADO', 'ENCARGADO'].includes(role.name)) {
      throw new ForbiddenException(
        'Solo se pueden asignar los roles EMPLEADO o ENCARGADO',
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roleId: role.id,
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
