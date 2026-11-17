import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { name, lastname, email, password } = createUserDto;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: name.trim(),
        lastname: lastname.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        lastname: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });

    return {
      message: 'Usuario registrado correctamente',
      user,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('El usuario se encuentra desactivado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: user.mustChangePassword
        ? 'Debés establecer una nueva contraseña'
        : 'Login exitoso',
      access_token: accessToken,
      mustChangePassword: user.mustChangePassword,
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        roleId: user.roleId,
        sectorId: user.sectorId,
        mustChangePassword: user.mustChangePassword,
      },
    };
  }

  async changeInitialPassword(userId: number, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('La cuenta no está disponible');
    }

    if (!user.mustChangePassword) {
      throw new ForbiddenException(
        'Esta cuenta no requiere un cambio inicial de contraseña',
      );
    }

    if (newPassword.length < 10) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 10 caracteres',
      );
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente de la temporal',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    return {
      message: 'Contraseña actualizada correctamente',
      mustChangePassword: false,
    };
  }
}
