import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { InitialPasswordGuard } from '../auth/guards/initial-password.guard';

import { UsersService } from './users.service';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

import { Permissions } from '../permissions/decorators/permissions.decorator';
import { PermissionsGuard } from '../permissions/guards/permissions.guard';

@Controller('users')
@UseGuards(AuthGuard('jwt'), InitialPasswordGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions('USERS_CREATE')
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.usersService.createEmployee(createEmployeeDto);
  }

  @Get()
  @Permissions('USERS_READ')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('my-sector')
  findMySector(@Req() request: { user: { userId: number } }) {
    return this.usersService.findMySectorEmployees(request.user.userId);
  }

  @Get('me')
  findMe(@Req() request: { user: { userId: number } }) {
    return this.usersService.findOne(request.user.userId);
  }

  @Get(':id')
  @Permissions('USERS_READ')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Permissions('USERS_UPDATE')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/status')
  @Permissions('USERS_STATUS')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(id, updateUserStatusDto);
  }
}
