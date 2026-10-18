import { IsString, MinLength, Matches, IsOptional, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: '请输入用户名或手机号' })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: '请输入密码' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: '请输入验证码' })
  captchaId!: string;

  @IsString()
  @IsNotEmpty({ message: '请输入验证码' })
  captchaCode!: string;
}

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: '用户名至少3个字符' })
  @Matches(/^[a-z0-9_]+$/, { message: '用户名只能包含小写字母、数字和下划线' })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: '请输入手机号' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone!: string;

  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: '请输入验证码' })
  captchaId!: string;

  @IsString()
  @IsNotEmpty({ message: '请输入验证码' })
  captchaCode!: string;
}
