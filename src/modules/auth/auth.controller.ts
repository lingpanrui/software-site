import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { LoginDto, RegisterDto } from './dto/auth.dto';

interface UserInfo {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

interface AuthResponse {
  user: UserInfo;
  token: string;
}

interface SecurityCodeBody {
  code: string;
}

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Req() req: { user: UserInfo }): Promise<UserInfo> {
    return req.user;
  }

  @UseGuards(AuthGuard)
  @Post('verify-security-code')
  async verifySecurityCode(
    @Req() req: { user: UserInfo },
    @Body() body: SecurityCodeBody,
  ): Promise<{ verified: boolean }> {
    return this.authService.verifySecurityCode(req.user, body.code);
  }
}
