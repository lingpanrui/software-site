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

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, '用户名至少 3 个字符')
      .regex(/^[a-z0-9_]+$/, '用户名只能包含小写字母、数字和下划线'),
    phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的 11 位手机号'),
    password: z.string().min(6, '密码至少 6 个字符'),
    confirmPassword: z.string().min(1, '请再次输入密码'),
    captchaId: z.string().min(1, '验证码加载中，请稍候'),
    captchaCode: z.string().min(1, '请输入验证码'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      phone: '',
      password: '',
      confirmPassword: '',
      captchaId: '',
      captchaCode: '',
    },
  });

  const onCaptchaIdChange = (captchaId: string) => {
    form.setValue('captchaId', captchaId);
    form.clearErrors('captchaId');
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const res = await authApi.register({
        username: values.username,
        phone: values.phone,
        password: values.password,
        captchaId: values.captchaId,
        captchaCode: values.captchaCode,
      });
      login(res.user, res.token);
      toast.success('注册成功');
      navigate('/');
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || '注册失败，请稍后重试';
      toast.error(msg);
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
          <CardTitle className="text-xl">创建账号</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入用户名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>手机号</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入 11 位手机号" maxLength={11} {...field} />
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>确认密码</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="请再次输入密码" {...field} />
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
                {loading ? '注册中...' : '注 册'}
              </Button>
            </form>
          </Form>
          <div className="text-center text-sm text-muted-foreground mt-5">
            已有账号？{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              立即登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
