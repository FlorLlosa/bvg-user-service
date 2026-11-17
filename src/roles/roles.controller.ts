import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { InitialPasswordGuard } from 'src/auth/guards/initial-password.guard';

import { AssignRoleDto } from './dto/assign-role.dto';
import { RolesService } from './roles.service';

import { Permissions } from '../permissions/decorators/permissions.decorator';
import { PermissionsGuard } from '../permissions/guards/permissions.guard';

@Controller('roles')
@UseGuards(AuthGuard('jwt'), InitialPasswordGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Permissions('ROLES_READ')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions('ROLES_READ')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Patch('users/:userId')
  @Permissions('ROLES_ASSIGN')
  assignRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    return this.rolesService.assignRole(userId, assignRoleDto.roleId);
  }
}
