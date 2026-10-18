import { IsString, MinLength, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: '用户名至少3个字符' })
  @Matches(/^[a-z0-9_]+$/, { message: '用户名只能包含小写字母、数字和下划线' })
  username!: string;

  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  password!: string;
}
