import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';
import { AdminGuard } from '../../common/guards/auth.guard';
import { UpdateSiteSettingsDto } from './dto/site-settings.dto';

interface SiteSettingsResponse {
  siteName: string;
  siteUrl: string;
}

@Controller('api/site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  async get(): Promise<SiteSettingsResponse> {
    return this.siteSettingsService.get();
  }

  @UseGuards(AdminGuard)
  @Post()
  async update(@Body() dto: UpdateSiteSettingsDto): Promise<SiteSettingsResponse> {
    return this.siteSettingsService.update(dto);
  }
}
