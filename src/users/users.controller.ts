import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../permissions/decorators/permissions.decorator';
import { PermissionsGuard } from '../permissions/guards/permissions.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('USERS_READ')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('USERS_READ')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('USERS_UPDATE')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('USERS_STATUS')
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() UpdateUserStatusDto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(id, UpdateUserStatusDto);
  }
}
