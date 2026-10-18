import { IsString, MinLength, Matches, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: '请输入用户名、手机号或邮箱' })
  username!: string;

  @IsString()
  @IsNotEmpty({ message: '请输入密码' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: '请输入图形验证码' })
  captchaId!: string;

  @IsString()
  @IsNotEmpty({ message: '请输入图形验证码' })
  captchaCode!: string;
}

export class EmailLoginDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: '请输入邮箱验证码' })
  emailCode!: string;

  @IsString()
  @IsNotEmpty({ message: '请输入图形验证码' })
  captchaId!: string;

  @IsString()
  @IsNotEmpty({ message: '请输入图形验证码' })
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

  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: '请输入邮箱验证码' })
  emailCode!: string;

  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: '请输入图形验证码' })
  captchaId!: string;

  @IsString()
  @IsNotEmpty({ message: '请输入图形验证码' })
  captchaCode!: string;
}

export class SendEmailCodeDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: '请指定用途' })
  usage!: 'register' | 'login';

  @IsString()
  @IsNotEmpty({ message: '请输入图形验证码' })
  captchaId!: string;

  @IsString()
  @IsNotEmpty({ message: '请输入图形验证码' })
  captchaCode!: string;

  @IsOptional()
  @IsString()
  registerUsername?: string;
}
