import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const { name, description } = createPermissionDto;

    const existingPermission = await this.prisma.permission.findUnique({
      where: { name },
    });

    if (existingPermission) {
      throw new ConflictException('El permiso ya existe');
    }

    return this.prisma.permission.create({
      data: {
        name,
        description,
      },
    });
  }
  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }
  async findOne(id: number) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException(`No existe un permiso con el ID ${id}`);
    }
    return permission;
  }
  async assignToRole(roleId: number, permissionId: number) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException(`No existe un rol con el ID ${roleId}`);
    }
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });
    if (!permission) {
      throw new NotFoundException(
        `No existe un permiso con el ID ${permissionId}`,
      );
    }
    const existingAssignment = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
    if (existingAssignment) {
      throw new ConflictException('El permiso ya está asignado a este rol');
    }
    return this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }
  async findByRole(roleId: number) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
    if (!role) {
      throw new NotFoundException(`No existe un rol con el ID ${roleId}`);
    }
    return role;
  }
}
