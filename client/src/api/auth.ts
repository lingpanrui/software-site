import { request, logger } from './index';
import { setToken, clearToken } from './token';
import type {
  CaptchaInfo,
  EmailLoginRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  SendEmailCodeRequest,
  UserInfo,
} from '@/types/api';

const USER_KEY = 'software_site_user';

export function getUser(): UserInfo | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

export function setUser(user: UserInfo): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}

export async function getCaptcha(): Promise<CaptchaInfo> {
  try {
    const response = await request.get('/api/auth/captcha');
    return response.data as CaptchaInfo;
  } catch (error) {
    logger.error('获取验证码失败', error);
    throw error;
  }
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await request.post('/api/auth/login', data);
    const result = response.data as LoginResponse;
    setToken(result.token);
    return result;
  } catch (error) {
    logger.error('登录失败', error);
    throw error;
  }
}

export async function emailLogin(data: EmailLoginRequest): Promise<LoginResponse> {
  try {
    const response = await request.post('/api/auth/email-login', data);
    const result = response.data as LoginResponse;
    setToken(result.token);
    return result;
  } catch (error) {
    logger.error('邮箱登录失败', error);
    throw error;
  }
}

export async function sendEmailCode(data: SendEmailCodeRequest): Promise<{ sent: boolean }> {
  try {
    const response = await request.post('/api/auth/send-email-code', data);
    return response.data as { sent: boolean };
  } catch (error) {
    logger.error('发送邮箱验证码失败', error);
    throw error;
  }
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  try {
    const response = await request.post('/api/auth/register', data);
    const result = response.data as RegisterResponse;
    setToken(result.token);
    return result;
  } catch (error) {
    logger.error('注册失败', error);
    throw error;
  }
}

export async function getMe(): Promise<UserInfo> {
  try {
    const response = await request.get('/api/auth/me');
    return response.data as UserInfo;
  } catch (error) {
    logger.error('获取用户信息失败', error);
    clearToken();
    throw error;
  }
}

export async function verifySecurityCode(code: string): Promise<{ verified: boolean }> {
  try {
    const response = await request.post('/api/auth/verify-security-code', { code });
    return response.data as { verified: boolean };
  } catch (error) {
    logger.error('安全码验证失败', error);
    throw error;
  }
}
