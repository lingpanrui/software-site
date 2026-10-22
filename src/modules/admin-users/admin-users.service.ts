import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserListDto, UpdateUserListDto } from './dto/admin-users.dto';

export interface AdminUserItem {
  id: string;
  username: string;
  role: string;
  blacklisted: boolean;
  whitelisted: boolean;
  createdAt: string;
}

export interface AdminUserListResponse {
  items: AdminUserItem[];
  total: number;
}

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: UserListDto): Promise<AdminUserListResponse> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;

    const where: Record<string, unknown> = {};
    if (params.keyword) {
      where.username = { contains: params.keyword, mode: 'insensitive' };
    }

    const [total, items] = await Promise.all([
      this.prisma.appUser.count({ where }),
      this.prisma.appUser.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
    ]);

    return {
      items: items.map((u) => ({
        id: u.id,
        username: u.username,
        role: u.role,
        blacklisted: u.blacklisted,
        whitelisted: u.whitelisted,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
    };
  }

  async update(id: string, dto: UpdateUserListDto): Promise<AdminUserItem> {
    if (dto.blacklisted === undefined && dto.whitelisted === undefined) {
      throw new BadRequestException('未提供可更新字段');
    }

    const target = await this.prisma.appUser.findUnique({ where: { id } });
    if (!target) {
      throw new NotFoundException('用户不存在');
    }
    if (target.role === 'admin') {
      throw new BadRequestException('不能修改管理员账号');
    }

    const updated = await this.prisma.appUser.update({
      where: { id },
      data: {
        blacklisted: dto.blacklisted ?? target.blacklisted,
        whitelisted: dto.whitelisted ?? target.whitelisted,
      },
    });

    return {
      id: updated.id,
      username: updated.username,
      role: updated.role,
      blacklisted: updated.blacklisted,
      whitelisted: updated.whitelisted,
      createdAt: updated.createdAt.toISOString(),
    };
  }
}
