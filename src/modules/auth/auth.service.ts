import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as CryptoJS from 'crypto-js';
import { generateToken, type JwtPayload } from '../../common/guards/auth.guard';
import { LoginDto, RegisterDto } from './dto/auth.dto';

const PASSWORD_SALT = process.env.PASSWORD_SALT || 'softwaresite_salt_2024';

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
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.appUser.findUnique({
      where: { username: dto.username },
    });
    if (!user) {
      throw new BadRequestException('用户名或密码错误');
    }
    const hashed = hashPassword(dto.password);
    if (hashed !== user.passwordHash) {
      throw new BadRequestException('用户名或密码错误');
    }
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

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.appUser.findUnique({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('用户名已存在');
    }
    const passwordHash = hashPassword(dto.password);
    const user = await this.prisma.appUser.create({
      data: { username: dto.username, passwordHash, role: 'user' },
    });
    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
      role: 'user',
    };
    const token = generateToken(payload);
    return {
      user: {
        id: user.id,
        username: user.username,
        role: 'user',
      },
      token,
    };
  }
}
