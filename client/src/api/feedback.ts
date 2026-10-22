import { request, logger } from './index';
import type { FeedbackRequest, FeedbackItem } from '@/types/api';

/** 提交反馈/投诉（公开，无需登录），提交后立即发邮件给管理员 */
export async function submitFeedback(data: FeedbackRequest): Promise<FeedbackItem> {
  try {
    const response = await request.post('/api/feedback', data);
    return response.data as FeedbackItem;
  } catch (error) {
    logger.error('提交反馈失败', error);
    throw error;
  }
}

/** 管理员查看反馈列表 */
export async function getFeedbackList(page = 1, pageSize = 20): Promise<{ items: FeedbackItem[]; total: number }> {
  try {
    const response = await request.get('/api/feedback/admin', { params: { page, pageSize } });
    return response.data as { items: FeedbackItem[]; total: number };
  } catch (error) {
    logger.error('获取反馈列表失败', error);
    throw error;
  }
}
