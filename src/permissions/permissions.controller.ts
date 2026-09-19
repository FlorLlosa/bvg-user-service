import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }
  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }
  @Get('roles/:roleId')
  findByRole(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.permissionsService.findByRole(roleId);
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.findOne(id);
  }
  @Patch(':permissionId/roles/:roleId')
  assignToRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.permissionsService.assignToRole(roleId, permissionId);
  }
}
