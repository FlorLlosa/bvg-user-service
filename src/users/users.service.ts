import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private readonly userSelect = {
    id: true,
    name: true,
    lastname: true,
    email: true,
    isActive: true,
    roleId: true,
    sectorId: true,
    createdAt: true,
    updatedAt: true,
    role: {
      select: {
        id: true,
        name: true,
        description: true,
      },
    },
  } as const;

  // Comprueba que el sector exista en Tasks.
  private async validateSector(sectorId: number): Promise<void> {
    const tasksServiceUrl =
      this.configService.get<string>('TASKS_SERVICE_URL') ??
      'http://localhost:3002';

    let response: Response;

    try {
      response = await fetch(`${tasksServiceUrl}/sectors/${sectorId}`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      throw new BadGatewayException(
        'No fue posible consultar el microservicio de sectores',
      );
    }

    if (response.status === 404) {
      throw new BadRequestException('El sector seleccionado no existe');
    }

    if (!response.ok) {
      throw new BadGatewayException(
        'No fue posible validar el sector seleccionado',
      );
    }

    const sector: unknown = await response.json();

    if (
      typeof sector !== 'object' ||
      sector === null ||
      !('id' in sector) ||
      sector.id !== sectorId
    ) {
      throw new BadGatewayException(
        'El microservicio devolvió un sector inválido',
      );
    }
  }

  // Registrar empleado o encargado.
  async createEmployee(createEmployeeDto: CreateEmployeeDto) {
    const { name, lastname, email, roleId, sectorId } = createEmployeeDto;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role || !['EMPLEADO', 'ENCARGADO'].includes(role.name)) {
      throw new ForbiddenException(
        'Solo se pueden registrar empleados o encargados',
      );
    }

    // Verificar el sector antes de crear el usuario.
    await this.validateSector(sectorId);

    // Generar contraseña temporal segura.
    const temporaryPassword = randomBytes(18).toString('base64url');
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

    let user: Awaited<ReturnType<typeof this.findOne>>;

    try {
      user = await this.prisma.user.create({
        data: {
          name: name.trim(),
          lastname: lastname.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          roleId: role.id,
          sectorId,
          isActive: true,
          mustChangePassword: true,
        },
        select: this.userSelect,
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('El correo electrónico ya está registrado');
      }

      throw error;
    }

    return {
      message: 'Empleado registrado correctamente',
      user,
      temporaryPassword,
      mustChangePassword: true,
    };
  }

  // Consultar todos los usuarios.
  async findAll() {
    return this.prisma.user.findMany({
      select: this.userSelect,
      orderBy: { id: 'asc' },
    });
  }

  // Consultar empleados activos del sector del Encargado autenticado.
  async findMySectorEmployees(authenticatedUserId: number) {
    const supervisor = await this.prisma.user.findUnique({
      where: { id: authenticatedUserId },
      select: {
        id: true,
        isActive: true,
        sectorId: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (
      !supervisor ||
      !supervisor.isActive ||
      supervisor.role?.name !== 'ENCARGADO'
    ) {
      throw new ForbiddenException(
        'Solo un Encargado activo puede consultar su sector',
      );
    }

    if (supervisor.sectorId === null) {
      throw new ForbiddenException('El Encargado no tiene un sector asignado');
    }

    return this.prisma.user.findMany({
      where: {
        sectorId: supervisor.sectorId,
        isActive: true,
        role: {
          is: {
            name: 'EMPLEADO',
          },
        },
      },
      select: this.userSelect,
      orderBy: [{ lastname: 'asc' }, { name: 'asc' }],
    });
  }

  // Consultar un usuario.
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException(`No existe un usuario con el ID ${id}`);
    }

    return user;
  }

  // Editar datos personales.
  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: this.userSelect,
    });
  }

  // Activar o desactivar empleado.
  async updateStatus(id: number, updateUserStatusDto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`No existe un usuario con el ID ${id}`);
    }

    if (user.role?.name === 'ADMIN') {
      throw new ForbiddenException(
        'No está permitido modificar el estado de un Gerente General',
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: updateUserStatusDto.isActive,
      },
      select: this.userSelect,
    });
  }
}
