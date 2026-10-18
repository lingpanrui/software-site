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
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api';
import { toast } from 'sonner';

const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名或手机号'),
  password: z.string().min(1, '请输入密码'),
  captchaId: z.string().min(1, '验证码加载中，请稍候'),
  captchaCode: z.string().min(1, '请输入验证码'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      captchaId: '',
      captchaCode: '',
    },
  });

  const onCaptchaIdChange = (captchaId: string) => {
    form.setValue('captchaId', captchaId);
    form.clearErrors('captchaId');
  };

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const res = await authApi.login(values);
      login(res.user, res.token);
      toast.success('登录成功');
      navigate('/');
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || '登录失败，请检查用户名和密码';
      toast.error(msg);
      // 登录失败后刷新验证码
      form.setValue('captchaCode', '');
      form.setValue('captchaId', '');
      form.clearErrors('captchaCode');
    } finally {
      setLoading(false);
    }
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
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名 / 手机号</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入用户名或手机号" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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
                control={form.control}
                name="captchaCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>验证码</FormLabel>
                    <FormControl>
                      <CaptchaField
                        value={field.value}
                        onChange={field.onChange}
                        onCaptchaIdChange={onCaptchaIdChange}
                        error={form.formState.errors.captchaCode?.message}
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
