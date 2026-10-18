import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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

function toSoftwareItem(item: {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  iconUrl: string;
  fileUrl: string;
  fileSize: bigint;
  downloadCount: number;
  createdAt: Date;
}): SoftwareItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    version: item.version,
    category: item.category,
    iconUrl: item.iconUrl,
    fileUrl: item.fileUrl,
    fileSize: Number(item.fileSize),
    downloadCount: item.downloadCount,
    createdAt: item.createdAt.toISOString(),
  };
}

@Injectable()
export class SoftwareService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: SoftwareListDto): Promise<SoftwareListResponse> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 12;

    const where: Record<string, unknown> = {};
    if (params.keyword) {
      where.name = { contains: params.keyword, mode: 'insensitive' };
    }
    if (params.category) {
      where.category = params.category;
    }

    const [total, items] = await Promise.all([
      this.prisma.software.count({ where }),
      this.prisma.software.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
    ]);

    return {
      items: items.map(toSoftwareItem),
      total,
    };
  }

  async getById(id: string): Promise<SoftwareItem> {
    const item = await this.prisma.software.findUnique({
      where: { id },
    });
    if (!item) {
      throw new NotFoundException('软件不存在');
    }
    return toSoftwareItem(item);
  }

  async create(dto: CreateSoftwareDto): Promise<SoftwareItem> {
    if (!dto.name) {
      throw new BadRequestException('软件名称不能为空');
    }
    const item = await this.prisma.software.create({
      data: {
        name: dto.name,
        description: dto.description ?? '',
        version: dto.version ?? '',
        category: dto.category ?? '',
        iconUrl: dto.iconUrl ?? '',
        fileUrl: dto.fileUrl ?? '',
        fileSize: BigInt(dto.fileSize ?? 0),
      },
    });
    return toSoftwareItem(item);
  }

  async update(id: string, dto: UpdateSoftwareDto): Promise<SoftwareItem> {
    const patch: Record<string, unknown> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.version !== undefined) patch.version = dto.version;
    if (dto.category !== undefined) patch.category = dto.category;
    if (dto.iconUrl !== undefined) patch.iconUrl = dto.iconUrl;
    if (dto.fileUrl !== undefined) patch.fileUrl = dto.fileUrl;
    if (dto.fileSize !== undefined) patch.fileSize = BigInt(dto.fileSize);

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('未提供可更新字段');
    }

    const item = await this.prisma.software.update({
      where: { id },
      data: patch,
    });
    return toSoftwareItem(item);
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.software.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('软件不存在');
    }
  }

  async incrementDownload(id: string): Promise<void> {
    try {
      await this.prisma.software.update({
        where: { id },
        data: { downloadCount: { increment: 1 } },
      });
    } catch {
      throw new NotFoundException('软件不存在');
    }
  }
}
