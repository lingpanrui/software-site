import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as CryptoJS from 'crypto-js';

const PASSWORD_SALT = process.env.PASSWORD_SALT || 'softwaresite_salt_2024';
const ADMIN_USERNAME = 'user@admin';
const ADMIN_PASSWORD = 'useradmin';

function hashPassword(password: string): string {
  return CryptoJS.SHA256(password + PASSWORD_SALT).toString();
}

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.seedAdminUser();
    await this.seedSiteSettings();
  }

  private async seedAdminUser(): Promise<void> {
    try {
      const existing = await this.prisma.appUser.findUnique({
        where: { username: ADMIN_USERNAME },
      });
      if (existing) {
        this.logger.log('管理员账号已存在，跳过创建');
        return;
      }
      await this.prisma.appUser.create({
        data: {
          username: ADMIN_USERNAME,
          passwordHash: hashPassword(ADMIN_PASSWORD),
          role: 'admin',
        },
      });
      this.logger.log(`已创建管理员账号: ${ADMIN_USERNAME}`);
    } catch (error) {
      this.logger.error('创建管理员账号失败', error as Error);
    }
  }

  private async seedSiteSettings(): Promise<void> {
    try {
      const count = await this.prisma.siteSettings.count();
      if (count > 0) {
        this.logger.log('站点设置已存在，跳过创建');
        return;
      }
      await this.prisma.siteSettings.create({
        data: {
          siteName: '软件资源站',
          siteUrl: '',
        },
      });
      this.logger.log('已创建默认站点设置');
    } catch (error) {
      this.logger.error('创建默认站点设置失败', error as Error);
    }
  }
}
