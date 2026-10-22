import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { FeedbackService, type FeedbackItem, type FeedbackListResponse } from './feedback.service';
import { AdminGuard } from '../../common/guards/auth.guard';
import { CreateFeedbackDto, FeedbackListDto } from './dto/feedback.dto';

@Controller('api/feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /** 任何人可提交反馈/投诉（无需登录），提交后立即发邮件给管理员 */
  @Post()
  async create(@Body() dto: CreateFeedbackDto): Promise<FeedbackItem> {
    return this.feedbackService.create(dto);
  }

  /** 管理员查看反馈列表 */
  @UseGuards(AdminGuard)
  @Get('admin')
  async list(@Query() query: FeedbackListDto): Promise<FeedbackListResponse> {
    return this.feedbackService.list(query);
  }
}
