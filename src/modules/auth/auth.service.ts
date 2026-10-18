import { Injectable, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as CryptoJS from 'crypto-js';
import { generateToken, type JwtPayload } from '../../common/guards/auth.guard';
import { CaptchaService } from './captcha.service';
import { EmailCodeService } from './email-code.service';
import { EmailLoginDto, LoginDto, RegisterDto, SendEmailCodeDto } from './dto/auth.dto';

const PASSWORD_SALT = process.env.PASSWORD_SALT || 'softwaresite_salt_2024';
const ADMIN_SECURITY_CODE = process.env.ADMIN_SECURITY_CODE || 'useradmin';

interface UserInfo {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

interface AuthResponse {
  user: UserInfo;
  token: string;
}

function hashPassword(password: string): string {
  return CryptoJS.SHA256(password + PASSWORD_SALT).toString();
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly captchaService: CaptchaService,
    private readonly emailCodeService: EmailCodeService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponse> {
    // 校验图形验证码
    if (!this.captchaService.verify(dto.captchaId, dto.captchaCode)) {
      throw new BadRequestException('验证码错误或已过期');
    }

    // 支持用户名/手机号/邮箱登录
    const isPhone = /^1[3-9]\d{9}$/.test(dto.username);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.username);
    const user = isPhone
      ? await this.prisma.appUser.findUnique({ where: { phone: dto.username } })
      : isEmail
        ? await this.prisma.appUser.findUnique({ where: { email: dto.username.toLowerCase() } })
        : await this.prisma.appUser.findUnique({ where: { username: dto.username } });

    if (!user) {
      throw new BadRequestException('用户名或密码错误');
    }
    const hashed = hashPassword(dto.password);
    if (hashed !== user.passwordHash) {
      throw new BadRequestException('用户名或密码错误');
    }
    return this.buildAuthResponse(user);
  }

  /** 邮箱验证码登录（无需密码） */
  async emailLogin(dto: EmailLoginDto): Promise<AuthResponse> {
    if (!this.captchaService.verify(dto.captchaId, dto.captchaCode)) {
      throw new BadRequestException('验证码错误或已过期');
    }
    if (!this.emailCodeService.verify(dto.email, dto.emailCode, 'login')) {
      throw new BadRequestException('邮箱验证码错误或已过期');
    }
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.appUser.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('该邮箱未注册');
    }
    return this.buildAuthResponse(user);
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // 校验图形验证码
    if (!this.captchaService.verify(dto.captchaId, dto.captchaCode)) {
      throw new BadRequestException('验证码错误或已过期');
    }
    // 校验邮箱验证码
    if (!this.emailCodeService.verify(dto.email, dto.emailCode, 'register')) {
      throw new BadRequestException('邮箱验证码错误或已过期');
    }

    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.appUser.findUnique({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    // 手机号唯一性校验
    const phoneUser = await this.prisma.appUser.findUnique({
      where: { phone: dto.phone },
    });
    if (phoneUser) {
      throw new ConflictException('该手机号已被注册');
    }

    // 邮箱唯一性校验
    const emailUser = await this.prisma.appUser.findUnique({
      where: { email },
    });
    if (emailUser) {
      throw new ConflictException('该邮箱已被注册');
    }

    const passwordHash = hashPassword(dto.password);
    const user = await this.prisma.appUser.create({
      data: { username: dto.username, phone: dto.phone, email, passwordHash, role: 'user' },
    });
    return this.buildAuthResponse(user);
  }

  /** 发送邮箱验证码 */
  async sendEmailCode(dto: SendEmailCodeDto): Promise<{ sent: boolean }> {
    // 校验图形验证码（防刷）
    if (!this.captchaService.verify(dto.captchaId, dto.captchaCode)) {
      throw new BadRequestException('验证码错误或已过期');
    }
    const email = dto.email.toLowerCase().trim();

    if (dto.usage === 'register') {
      const existing = await this.prisma.appUser.findUnique({ where: { email } });
      if (existing) {
        throw new ConflictException('该邮箱已被注册');
      }
    } else if (dto.usage === 'login') {
      const existing = await this.prisma.appUser.findUnique({ where: { email } });
      if (!existing) {
        throw new BadRequestException('该邮箱未注册');
      }
    }

    return this.emailCodeService.sendCode(email, dto.usage);
  }

  async verifySecurityCode(user: UserInfo, code: string): Promise<{ verified: boolean }> {
    if (user.role !== 'admin') {
      throw new ForbiddenException('仅管理员可访问');
    }
    if (!code || code !== ADMIN_SECURITY_CODE) {
      throw new BadRequestException('安全码错误');
    }
    return { verified: true };
  }

  private async buildAuthResponse(user: {
    id: string;
    username: string;
    role: string;
  }): Promise<AuthResponse> {
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: (user.role as 'admin' | 'user') || 'user',
    };
    const token = generateToken(payload);
    return {
      user: {
        id: user.id,
        username: user.username,
        role: payload.role,
      },
      token,
    };
  }
}
