import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailCodeService } from '../auth/email-code.service';
import { CreateFeedbackDto, FeedbackListDto } from './dto/feedback.dto';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '3878601790@qq.com';

export interface FeedbackItem {
  id: string;
  type: string;
  content: string;
  contact: string;
  createdAt: string;
}

export interface FeedbackListResponse {
  items: FeedbackItem[];
  total: number;
}

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailCodeService: EmailCodeService,
  ) {}

  /** 提交反馈投诉：入库 + 立即发邮件给管理员 */
  async create(dto: CreateFeedbackDto): Promise<FeedbackItem> {
    const item = await this.prisma.feedback.create({
      data: {
        type: dto.type,
        content: dto.content,
        contact: dto.contact ?? '',
      },
    });

    // 立即发送邮件到管理员邮箱
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN', { hour12: false });
    const subject = `【软件资源站·${dto.type}】${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const text = [
      `收到一条网站${dto.type}，详情如下：`,
      '',
      `类型：${dto.type}`,
      `内容：${dto.content}`,
      `联系方式：${dto.contact || '未填写'}`,
      `提交时间：${timeStr}`,
    ].join('\n');

    try {
      await this.emailCodeService.sendRaw(ADMIN_EMAIL, subject, text);
      this.logger.log(`反馈邮件已发送至 ${ADMIN_EMAIL}（${dto.type}）`);
    } catch (error) {
      this.logger.error(`反馈邮件发送失败: ${(error as Error).message}`);
    }

    return {
      id: item.id,
      type: item.type,
      content: item.content,
      contact: item.contact,
      createdAt: item.createdAt.toISOString(),
    };
  }

  /** 管理员查看反馈列表 */
  async list(params: FeedbackListDto): Promise<FeedbackListResponse> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;

    const [total, items] = await Promise.all([
      this.prisma.feedback.count(),
      this.prisma.feedback.findMany({
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
    ]);

    return {
      items: items.map((i) => ({
        id: i.id,
        type: i.type,
        content: i.content,
        contact: i.contact,
        createdAt: i.createdAt.toISOString(),
      })),
      total,
    };
  }
}
