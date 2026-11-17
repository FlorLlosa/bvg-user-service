import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionsService } from './permissions.service';
import { Permissions } from './decorators/permissions.decorator';
import { PermissionsGuard } from './guards/permissions.guard';

interface AuthenticatedRequest {
  user: {
    userId: number;
    email: string;
    roleId: number | null;
  };
}

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  private requireGeneralManager(request: AuthenticatedRequest): void {
    if (request.user?.roleId !== 1) {
      throw new ForbiddenException(
        'Solo el Gerente General puede administrar permisos',
      );
    }
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @Req() request: AuthenticatedRequest,
  ) {
    this.requireGeneralManager(request);

    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Permissions('USERS_READ')
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('roles/:roleId')
  @UseGuards(AuthGuard('jwt'))
  findByRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    if (request.user.roleId !== 1 && request.user.roleId !== roleId) {
      throw new ForbiddenException(
        'No podés consultar los permisos de otro rol',
      );
    }

    return this.permissionsService.findByRole(roleId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    this.requireGeneralManager(request);

    return this.permissionsService.findOne(id);
  }

  @Patch(':permissionId/roles/:roleId')
  @UseGuards(AuthGuard('jwt'))
  assignToRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    this.requireGeneralManager(request);

    return this.permissionsService.assignToRole(roleId, permissionId);
  }

  @Delete(':permissionId/roles/:roleId')
  @UseGuards(AuthGuard('jwt'))
  removeFromRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    this.requireGeneralManager(request);

    return this.permissionsService.removeFromRole(roleId, permissionId);
  }
}
