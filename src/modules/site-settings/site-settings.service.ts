import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSiteSettingsDto } from './dto/site-settings.dto';

interface SiteSettingsResponse {
  siteName: string;
  siteUrl: string;
  allowlistOnly: boolean;
}

@Injectable()
export class SiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<SiteSettingsResponse> {
    const item = await this.prisma.siteSettings.findFirst();
    if (!item) {
      return { siteName: '软件资源站', siteUrl: '', allowlistOnly: false };
    }
    return {
      siteName: item.siteName,
      siteUrl: item.siteUrl,
      allowlistOnly: item.allowlistOnly,
    };
  }

  async update(dto: UpdateSiteSettingsDto): Promise<SiteSettingsResponse> {
    const existing = await this.prisma.siteSettings.findFirst();
    if (!existing) {
      const created = await this.prisma.siteSettings.create({
        data: {
          siteName: dto.siteName ?? '软件资源站',
          siteUrl: dto.siteUrl ?? '',
          allowlistOnly: dto.allowlistOnly ?? false,
        },
      });
      return { siteName: created.siteName, siteUrl: created.siteUrl, allowlistOnly: created.allowlistOnly };
    }
    const updated = await this.prisma.siteSettings.update({
      where: { id: existing.id },
      data: {
        siteName: dto.siteName ?? existing.siteName,
        siteUrl: dto.siteUrl ?? existing.siteUrl,
        allowlistOnly: dto.allowlistOnly ?? existing.allowlistOnly,
      },
    });
    return { siteName: updated.siteName, siteUrl: updated.siteUrl, allowlistOnly: updated.allowlistOnly };
  }
}
