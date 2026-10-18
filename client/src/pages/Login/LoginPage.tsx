import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import CaptchaField from '@/components/CaptchaField';
import EmailCodeField from '@/components/EmailCodeField';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api';
import { toast } from 'sonner';

const passwordLoginSchema = z.object({
  username: z.string().min(1, '请输入用户名、手机号或邮箱'),
  password: z.string().min(1, '请输入密码'),
  captchaId: z.string().min(1, '验证码加载中，请稍候'),
  captchaCode: z.string().min(1, '请输入验证码'),
});

const emailLoginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  emailCode: z.string().min(1, '请输入邮箱验证码'),
  captchaId: z.string().min(1, '验证码加载中，请稍候'),
  captchaCode: z.string().min(1, '请输入验证码'),
});

type PasswordLoginFormValues = z.infer<typeof passwordLoginSchema>;
type EmailLoginFormValues = z.infer<typeof emailLoginSchema>;

const LoginPage = () => {
  const [mode, setMode] = useState<'password' | 'email'>('password');
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState<{ captchaId: string; image: string } | null>(null);
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);
  const navigate = useNavigate();
  const { login } = useAuth();

  const passwordForm = useForm<PasswordLoginFormValues>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: {
      username: '',
      password: '',
      captchaId: '',
      captchaCode: '',
    },
  });

  const emailForm = useForm<EmailLoginFormValues>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: '',
      emailCode: '',
      captchaId: '',
      captchaCode: '',
    },
  });

  const onCaptchaIdChange = (captchaId: string, formName: 'password' | 'email') => {
    if (formName === 'password') {
      passwordForm.setValue('captchaId', captchaId);
      passwordForm.clearErrors('captchaId');
    } else {
      emailForm.setValue('captchaId', captchaId);
      emailForm.clearErrors('captchaId');
    }
  };

  const refreshCaptcha = () => {
    setCaptchaRefreshKey((k) => k + 1);
  };

  const onPasswordSubmit = async (values: PasswordLoginFormValues) => {
    setLoading(true);
    try {
      const res = await authApi.login(values);
      login(res.user, res.token);
      toast.success('登录成功');
      navigate('/');
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || '登录失败，请检查用户名和密码';
      toast.error(msg);
      passwordForm.setValue('captchaCode', '');
      passwordForm.setValue('captchaId', '');
      passwordForm.clearErrors('captchaCode');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const onEmailSubmit = async (values: EmailLoginFormValues) => {
    setLoading(true);
    try {
      const res = await authApi.emailLogin(values);
      login(res.user, res.token);
      toast.success('登录成功');
      navigate('/');
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || '登录失败，请检查邮箱验证码';
      toast.error(msg);
      emailForm.setValue('emailCode', '');
      emailForm.setValue('captchaCode', '');
      emailForm.setValue('captchaId', '');
      emailForm.clearErrors('emailCode');
      emailForm.clearErrors('captchaCode');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: 'password' | 'email') => {
    setMode(next);
    setCaptchaRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-10">
      <Card className="w-full max-w-[400px] shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Package className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-xl">欢迎登录</CardTitle>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Button
              type="button"
              variant={mode === 'password' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => switchMode('password')}
            >
              密码登录
            </Button>
            <Button
              type="button"
              variant={mode === 'email' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => switchMode('email')}
            >
              邮箱验证码登录
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mode === 'password' ? (
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>用户名 / 手机号 / 邮箱</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入用户名、手机号或邮箱" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密码</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="请输入密码" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="captchaCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>图形验证码</FormLabel>
                      <FormControl>
                        <CaptchaField
                          key={`pw-${captchaRefreshKey}`}
                          value={field.value}
                          onChange={field.onChange}
                          onCaptchaIdChange={(id) => onCaptchaIdChange(id, 'password')}
                          onCaptchaLoaded={setCaptcha}
                          error={passwordForm.formState.errors.captchaCode?.message}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '登录中...' : '登 录'}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入邮箱" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={emailForm.control}
                  name="emailCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱验证码</FormLabel>
                      <FormControl>
                        <EmailCodeField
                          value={field.value}
                          onChange={field.onChange}
                          email={emailForm.watch('email')}
                          usage="login"
                          captcha={captcha}
                          captchaCode={emailForm.watch('captchaCode')}
                          error={emailForm.formState.errors.emailCode?.message}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={emailForm.control}
                  name="captchaCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>图形验证码</FormLabel>
                      <FormControl>
                        <CaptchaField
                          key={`em-${captchaRefreshKey}`}
                          value={field.value}
                          onChange={field.onChange}
                          onCaptchaIdChange={(id) => onCaptchaIdChange(id, 'email')}
                          onCaptchaLoaded={setCaptcha}
                          error={emailForm.formState.errors.captchaCode?.message}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '登录中...' : '登 录'}
                </Button>
              </form>
            </Form>
          )}
          <div className="text-center text-sm text-muted-foreground mt-5">
            还没有账号？{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              立即注册
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
