import { request, logger } from './index';
import type {
  SoftwareItem,
  SoftwareListResponse,
  SoftwareListParams,
  CreateSoftwareRequest,
  UpdateSoftwareRequest,
} from '@/types/api';

export async function getSoftwareList(params: SoftwareListParams): Promise<SoftwareListResponse> {
  try {
    const searchParams = new URLSearchParams();
    if (params.keyword) searchParams.set('keyword', params.keyword);
    if (params.category) searchParams.set('category', params.category);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
    const response = await request.get(
      `/api/software?${searchParams.toString()}`,
    );
    return response.data as SoftwareListResponse;
  } catch (error) {
    logger.error('获取软件列表失败', error);
    throw error;
  }
}

export async function getSoftwareById(id: string): Promise<SoftwareItem> {
  try {
    const response = await request.get(`/api/software/${id}`);
    return response.data as SoftwareItem;
  } catch (error) {
    logger.error('获取软件详情失败', error);
    throw error;
  }
}

export async function createSoftware(data: CreateSoftwareRequest): Promise<SoftwareItem> {
  try {
    const response = await request.post('/api/software', data);
    return response.data as SoftwareItem;
  } catch (error) {
    logger.error('创建软件失败', error);
    throw error;
  }
}

export async function updateSoftware(id: string, data: UpdateSoftwareRequest): Promise<SoftwareItem> {
  try {
    const response = await request.put(`/api/software/${id}`, data);
    return response.data as SoftwareItem;
  } catch (error) {
    logger.error('更新软件失败', error);
    throw error;
  }
}

export async function deleteSoftware(id: string): Promise<void> {
  try {
    await request.delete(`/api/software/${id}`);
  } catch (error) {
    logger.error('删除软件失败', error);
    throw error;
  }
}

export async function recordDownload(id: string): Promise<void> {
  try {
    await request.post(`/api/software/${id}/download`, {});
  } catch (error) {
    logger.error('记录下载失败', error);
    throw error;
  }
}
