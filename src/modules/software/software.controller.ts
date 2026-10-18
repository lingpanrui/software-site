import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SoftwareService } from './software.service';
import { AdminGuard, AuthGuard } from '../../common/guards/auth.guard';
import { CreateSoftwareDto, UpdateSoftwareDto, SoftwareListDto } from './dto/software.dto';

interface SoftwareItem {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  iconUrl: string;
  fileUrl: string;
  fileSize: number;
  downloadCount: number;
  createdAt: string;
}

interface SoftwareListResponse {
  items: SoftwareItem[];
  total: number;
}

@Controller('api/software')
export class SoftwareController {
  constructor(private readonly softwareService: SoftwareService) {}

  @Get()
  async list(@Query() query: SoftwareListDto): Promise<SoftwareListResponse> {
    return this.softwareService.list(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<SoftwareItem> {
    return this.softwareService.getById(id);
  }

  @UseGuards(AdminGuard)
  @Post()
  async create(@Body() dto: CreateSoftwareDto): Promise<SoftwareItem> {
    return this.softwareService.create(dto);
  }

  @UseGuards(AdminGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSoftwareDto): Promise<SoftwareItem> {
    return this.softwareService.update(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.softwareService.delete(id);
    return { success: true };
  }

  @UseGuards(AuthGuard)
  @Post(':id/download')
  async download(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.softwareService.incrementDownload(id);
    return { success: true };
  }
}
