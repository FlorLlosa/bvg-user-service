import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ChangeInitialPasswordDto } from './dto/change-initial-password.dto';

interface AuthenticatedUser {
  userId: number;
  email: string;
  roleId: number | null;
}

interface AuthenticatedRequest {
  user: AuthenticatedUser;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // NUEVO: Cambio obligatorio en el primer ingreso
  @UseGuards(AuthGuard('jwt'))
  @Post('change-initial-password')
  changeInitialPassword(
    @Req() req: AuthenticatedRequest,
    @Body() body: ChangeInitialPasswordDto,
  ) {
    return this.authService.changeInitialPassword(
      req.user.userId,
      body.newPassword,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest) {
    return req.user;
  }
}
