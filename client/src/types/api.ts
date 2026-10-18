export type UserRole = 'admin' | 'user';

export interface UserInfo {
  id: string;
  username: string;
  role: UserRole;
}

export interface CaptchaInfo {
  captchaId: string;
  image: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  captchaId: string;
  captchaCode: string;
}

export interface LoginResponse {
  user: UserInfo;
  token: string;
}

export interface RegisterRequest {
  username: string;
  phone: string;
  password: string;
  captchaId: string;
  captchaCode: string;
}

export interface RegisterResponse {
  user: UserInfo;
  token: string;
}

export interface SoftwareItem {
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

export interface SoftwareListResponse {
  items: SoftwareItem[];
  total: number;
}

export interface SoftwareListParams {
  keyword?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateSoftwareRequest {
  name: string;
  description: string;
  version: string;
  category: string;
  iconUrl: string;
  fileUrl: string;
  fileSize: number;
}

export interface UpdateSoftwareRequest {
  name?: string;
  description?: string;
  version?: string;
  category?: string;
  iconUrl?: string;
  fileUrl?: string;
  fileSize?: number;
}

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
}

export interface UpdateSiteSettingsRequest {
  siteName: string;
  siteUrl: string;
}

export interface UploadResponse {
  url: string;
  size: number;
  name: string;
}
