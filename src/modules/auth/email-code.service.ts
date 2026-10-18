import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { randomInt } from 'crypto';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.qq.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

interface EmailCodeData {
  code: string;
  expiresAt: number;
  usage: string;
}

@Injectable()
export class EmailCodeService {
  private readonly logger = new Logger(EmailCodeService.name);
  private readonly store = new Map<string, EmailCodeData>();
  private readonly TTL_MS = 10 * 60 * 1000; // 10 分钟有效
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (SMTP_USER && SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
      this.logger.log(`SMTP 已配置: ${SMTP_HOST}:${SMTP_PORT} (${SMTP_USER})`);
    } else {
      this.logger.warn('SMTP_USER/SMTP_PASS 未配置，邮件验证码功能不可用');
    }
  }

  /**
   * 生成并发送邮箱验证码
   */
  async sendCode(email: string, usage: 'register' | 'login'): Promise<{ sent: boolean }> {
    if (!this.transporter) {
      throw new BadRequestException('邮件服务未配置，请联系管理员');
    }
    const normalized = email.toLowerCase().trim();
    this.cleanup();

    const code = Array.from({ length: 6 }, () => randomInt(0, 10)).join('');
    this.store.set(`${usage}:${normalized}`, { code, expiresAt: Date.now() + this.TTL_MS, usage });

    const subject = usage === 'register' ? '【软件资源站】注册验证码' : '【软件资源站】登录验证码';
    const text = `你的验证码是：${code}，10 分钟内有效。如果不是你本人操作，请忽略此邮件。`;

    try {
      await this.transporter.sendMail({
        from: `"软件资源站" <${SMTP_USER}>`,
        to: normalized,
        subject,
        text,
      });
      this.logger.log(`验证码已发送至 ${normalized}（${usage}）`);
      return { sent: true };
    } catch (error) {
      this.logger.error(`邮件发送失败: ${(error as Error).message}`);
      throw new BadRequestException('验证码发送失败，请稍后重试');
    }
  }

  /**
   * 校验验证码，成功后删除（一次性）
   */
  verify(email: string, code: string, usage: 'register' | 'login'): boolean {
    const normalized = email.toLowerCase().trim();
    const key = `${usage}:${normalized}`;
    const data = this.store.get(key);
    if (!data) return false;
    if (Date.now() > data.expiresAt) {
      this.store.delete(key);
      return false;
    }
    const ok = data.code === code.trim();
    this.store.delete(key);
    return ok;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.store) {
      if (now > data.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}
