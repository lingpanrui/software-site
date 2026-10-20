import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { randomInt } from 'crypto';

interface ProviderConfig {
  name: string;
  host: string;
  port: number;
  user: string;
  pass: string;
}

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
  private providers: { name: string; user: string; transporter: nodemailer.Transporter }[] = [];
  private readonly brevoApiKey = process.env.BREVO_API_KEY || '';
  private readonly brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || '';
  private readonly brevoSenderName = process.env.BREVO_SENDER_NAME || '软件资源站';

  constructor() {
    const configs = this.loadConfigs();
    for (const cfg of configs) {
      const transporter = nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.port === 465,
        auth: { user: cfg.user, pass: cfg.pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
      });
      this.providers.push({ name: cfg.name, user: cfg.user, transporter });
      this.logger.log(`邮件服务[${cfg.name}] 已配置: ${cfg.host}:${cfg.port} (${cfg.user})`);
    }
    if (this.brevoApiKey && this.brevoSenderEmail) {
      this.logger.log(`邮件服务[HTTP] 已配置: Brevo API (${this.brevoSenderEmail})`);
    }
    if (this.providers.length === 0 && !(this.brevoApiKey && this.brevoSenderEmail)) {
      this.logger.warn('未配置任何邮件服务，邮箱验证码功能不可用');
    }
  }

  /**
   * 从环境变量读取邮件服务配置（支持主备多服务自动切换）
   * 主服务: SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS
   * 备服务: SMTP2_HOST/SMTP2_PORT/SMTP2_USER/SMTP2_PASS
   */
  private loadConfigs(): ProviderConfig[] {
    const list: ProviderConfig[] = [];
    const add = (prefix: string, name: string) => {
      const host = process.env[`${prefix}_HOST`] || '';
      const port = parseInt(process.env[`${prefix}_PORT`] || '587', 10);
      const user = process.env[`${prefix}_USER`] || '';
      const pass = process.env[`${prefix}_PASS`] || '';
      if (host && user && pass) {
        list.push({ name, host, port, user, pass });
      }
    };
    add('SMTP', '主');
    add('SMTP2', '备');
    return list;
  }

  /**
   * 生成并发送邮箱验证码
   * 优先使用 Brevo HTTP API（走 443 端口，云平台不会封锁），失败自动回退 SMTP 主备服务
   */
  async sendCode(email: string, usage: 'register' | 'login'): Promise<{ sent: boolean }> {
    if (this.providers.length === 0 && !(this.brevoApiKey && this.brevoSenderEmail)) {
      throw new BadRequestException('邮件服务未配置，请联系管理员');
    }
    const normalized = email.toLowerCase().trim();
    this.cleanup();

    const code = Array.from({ length: 6 }, () => randomInt(0, 10)).join('');
    this.store.set(`${usage}:${normalized}`, { code, expiresAt: Date.now() + this.TTL_MS, usage });

    const subject = usage === 'register' ? '【软件资源站】注册验证码' : '【软件资源站】登录验证码';
    const text = `你的验证码是：${code}，10 分钟内有效。如果不是你本人操作，请忽略此邮件。`;

    let lastError: Error | null = null;

    // 1) Brevo HTTP API（走 443，最可靠）
    if (this.brevoApiKey && this.brevoSenderEmail) {
      try {
        await this.sendViaBrevo(normalized, subject, text);
        this.logger.log(`验证码已通过[HTTP]发送至 ${normalized}（${usage}）`);
        return { sent: true };
      } catch (error) {
        lastError = error as Error;
        this.logger.error(`邮件服务[HTTP]发送失败: ${lastError.message}`);
      }
    }

    // 2) SMTP 主备自动切换
    for (const provider of this.providers) {
      try {
        const info = await provider.transporter.sendMail({
          from: `"软件资源站" <${provider.user}>`,
          to: normalized,
          subject,
          text,
        });
        this.logger.log(`验证码已通过[${provider.name}]发送至 ${normalized}（${usage}），messageId=${info.messageId}`);
        return { sent: true };
      } catch (error) {
        lastError = error as Error;
        this.logger.error(`邮件服务[${provider.name}]发送失败: ${lastError.message}`);
      }
    }

    this.logger.error(`所有邮件服务均发送失败，最后错误: ${lastError?.message}`);
    throw new BadRequestException('验证码发送失败，请稍后重试');
  }

  /**
   * 通过 Brevo REST API 发送邮件（POST https://api.brevo.com/v3/smtp/email）
   */
  private async sendViaBrevo(to: string, subject: string, text: string): Promise<void> {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': this.brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: this.brevoSenderName, email: this.brevoSenderEmail },
        to: [{ email: to }],
        subject,
        textContent: text,
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Brevo HTTP ${res.status}: ${body.slice(0, 300)}`);
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
