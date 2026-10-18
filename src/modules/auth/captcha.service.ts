import { Injectable, Logger } from '@nestjs/common';
import { randomInt } from 'crypto';

export interface CaptchaData {
  code: string;
  expiresAt: number;
}

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);
  private readonly store = new Map<string, CaptchaData>();
  private readonly TTL_MS = 5 * 60 * 1000; // 5 分钟有效

  /**
   * 生成验证码：返回 captchaId 和 SVG 图片内容
   */
  generate(): { captchaId: string; image: string } {
    this.cleanup();
    const captchaId = randomInt(100000000, 999999999).toString();
    const code = Array.from({ length: 4 }, () => randomInt(0, 10)).join('');
    this.store.set(captchaId, { code, expiresAt: Date.now() + this.TTL_MS });
    return { captchaId, image: this.renderSvg(code) };
  }

  /**
   * 校验验证码，成功后删除（一次性）
   */
  verify(captchaId: string, code: string): boolean {
    if (!captchaId || !code) return false;
    const data = this.store.get(captchaId);
    if (!data) return false;
    if (Date.now() > data.expiresAt) {
      this.store.delete(captchaId);
      return false;
    }
    const ok = data.code === code.trim();
    this.store.delete(captchaId);
    return ok;
  }

  private renderSvg(code: string): string {
    const width = 120;
    const height = 40;
    const chars = code.split('');
    const colors = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed'];
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    svg += `<rect width="${width}" height="${height}" fill="#f8fafc" rx="6"/>`;
    // 干扰线
    for (let i = 0; i < 4; i++) {
      const x1 = randomInt(0, width);
      const y1 = randomInt(0, height);
      const x2 = randomInt(0, width);
      const y2 = randomInt(0, height);
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colors[randomInt(0, colors.length)]}" stroke-width="${(randomInt(1, 3) / 10).toFixed(1)}" stroke-opacity="0.5"/>`;
    }
    // 干扰点
    for (let i = 0; i < 25; i++) {
      svg += `<circle cx="${randomInt(0, width)}" cy="${randomInt(0, height)}" r="${(randomInt(1, 3) / 10).toFixed(1)}" fill="${colors[randomInt(0, colors.length)]}" fill-opacity="0.4"/>`;
    }
    // 字符（带随机旋转/偏移）
    chars.forEach((ch, i) => {
      const x = 12 + i * 26;
      const y = randomInt(26, 32);
      const rot = randomInt(-25, 25);
      const color = colors[randomInt(0, colors.length)];
      svg += `<text x="${x}" y="${y}" font-size="24" font-family="Arial, sans-serif" font-weight="bold" fill="${color}" transform="rotate(${rot} ${x} ${y})">${ch}</text>`;
    });
    svg += '</svg>';
    return svg;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, data] of this.store) {
      if (now > data.expiresAt) {
        this.store.delete(id);
      }
    }
  }
}
