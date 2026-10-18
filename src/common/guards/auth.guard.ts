import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'software_site_jwt_secret_key_2024';
export const JWT_EXPIRES_IN = '7d';

export interface JwtPayload {
  userId: string;
  username: string;
  role: 'admin' | 'user';
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('未登录');
    }
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) {
      throw new UnauthorizedException('登录已过期');
    }
    request.user = payload;
    return true;
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('未登录');
    }
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) {
      throw new UnauthorizedException('登录已过期');
    }
    if (payload.role !== 'admin') {
      throw new ForbiddenException('需要管理员权限');
    }
    request.user = payload;
    return true;
  }
}
