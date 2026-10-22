import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsIn(['投诉', '反馈', '建议'], { message: '类型只能为投诉、反馈或建议' })
  type: string;

  @IsString()
  @IsNotEmpty({ message: '内容不能为空' })
  @MaxLength(2000, { message: '内容不能超过 2000 字' })
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '联系方式不能超过 200 字' })
  contact?: string;
}

export class FeedbackListDto {
  page?: number;
  pageSize?: number;
}
