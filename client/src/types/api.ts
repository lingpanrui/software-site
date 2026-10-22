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

export interface EmailLoginRequest {
  email: string;
  emailCode: string;
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
  email: string;
  emailCode: string;
  password: string;
  captchaId: string;
  captchaCode: string;
}

export interface SendEmailCodeRequest {
  email: string;
  usage: 'register' | 'login';
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
  allowlistOnly: boolean;
}

export interface UpdateSiteSettingsRequest {
  siteName: string;
  siteUrl: string;
  allowlistOnly?: boolean;
}

export interface FeedbackRequest {
  type: '投诉' | '反馈' | '建议';
  content: string;
  contact?: string;
}

export interface FeedbackItem {
  id: string;
  type: string;
  content: string;
  contact: string;
  createdAt: string;
}

export interface AdminUserItem {
  id: string;
  username: string;
  role: string;
  blacklisted: boolean;
  whitelisted: boolean;
  createdAt: string;
}

export interface AdminUserListResponse {
  items: AdminUserItem[];
  total: number;
}

export interface UpdateUserListRequest {
  blacklisted?: boolean;
  whitelisted?: boolean;
}

export interface UploadResponse {
  url: string;
  size: number;
  name: string;
}
