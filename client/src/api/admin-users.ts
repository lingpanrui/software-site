import { request, logger } from './index';
import type { AdminUserListResponse, UpdateUserListRequest } from '@/types/api';

/** 管理员查看用户列表（含黑白名单状态） */
export async function getUserList(keyword = '', page = 1, pageSize = 20): Promise<AdminUserListResponse> {
  try {
    const response = await request.get('/api/admin/users', { params: { keyword, page, pageSize } });
    return response.data as AdminUserListResponse;
  } catch (error) {
    logger.error('获取用户列表失败', error);
    throw error;
  }
}

/** 管理员修改用户黑白名单状态 */
export async function updateUserList(id: string, data: UpdateUserListRequest) {
  try {
    const response = await request.put(`/api/admin/users/${id}`, data);
    return response.data;
  } catch (error) {
    logger.error('更新用户名单失败', error);
    throw error;
  }
}
