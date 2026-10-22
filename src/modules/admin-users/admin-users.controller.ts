import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminUsersService, type AdminUserItem, type AdminUserListResponse } from './admin-users.service';
import { AdminGuard } from '../../common/guards/auth.guard';
import { UserListDto, UpdateUserListDto } from './dto/admin-users.dto';

@Controller('api/admin/users')
@UseGuards(AdminGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async list(@Query() query: UserListDto): Promise<AdminUserListResponse> {
    return this.adminUsersService.list(query);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserListDto): Promise<AdminUserItem> {
    return this.adminUsersService.update(id, dto);
  }
}
