import { request, logger } from './index';
import type { SiteSettings, UpdateSiteSettingsRequest } from '@/types/api';

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const response = await request.get('/api/site-settings');
    return response.data as SiteSettings;
  } catch (error) {
    logger.error('获取站点设置失败', error);
    throw error;
  }
}

export async function updateSiteSettings(data: UpdateSiteSettingsRequest): Promise<SiteSettings> {
  try {
    const response = await request.post('/api/site-settings', data);
    return response.data as SiteSettings;
  } catch (error) {
    logger.error('更新站点设置失败', error);
    throw error;
  }
}
