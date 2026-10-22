import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/context/AuthContext';
import { siteSettingsApi } from '@/api';
import AdminSecurityGate from '@/components/AdminSecurityGate';
import { toast } from 'sonner';

const settingsSchema = z.object({
  siteName: z.string().min(1, '网站名称不能为空'),
  siteUrl: z.string().min(1, '站点地址不能为空').url('请输入有效的 URL'),
  allowlistOnly: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const AdminSettingsPage = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: '',
      siteUrl: '',
      allowlistOnly: false,
    },
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      toast.error('需要管理员权限');
      navigate('/');
      return;
    }
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const settings = await siteSettingsApi.getSiteSettings();
        form.reset({
          siteName: settings.siteName,
          siteUrl: settings.siteUrl,
          allowlistOnly: settings.allowlistOnly,
        });
      } catch (error: any) {
        const msg = error?.response?.data?.error?.message || '获取站点设置失败';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [isAdmin, authLoading, navigate, form]);

  const onSubmit = async (values: SettingsFormValues) => {
    setSaving(true);
    try {
      await siteSettingsApi.updateSiteSettings(values);
      toast.success('保存成功');
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || '保存失败';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminSecurityGate>
      <div className="space-y-6">
      <h1 className="text-2xl font-bold">站点设置</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本设置</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 max-w-md"
              >
                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>网站名称</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入网站名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="siteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>站点地址</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="allowlistOnly"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between gap-4">
                          <div>
                            <FormLabel className="text-sm font-medium">仅白名单用户可访问</FormLabel>
                            <CardDescription className="text-xs mt-1">
                              开启后：未加入白名单的用户无法登录，新用户注册通道关闭（管理员不受影响）。
                            </CardDescription>
                          </div>
                          <FormControl>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={field.value}
                              onClick={() => field.onChange(!field.value)}
                              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                field.value ? 'bg-primary' : 'bg-muted'
                              }`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                  field.value ? 'translate-x-[22px]' : 'translate-x-[3px]'
                                }`}
                              />
                            </button>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Button type="submit" disabled={saving}>
                  {saving ? '保存中...' : '保存设置'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminSecurityGate>
  );
};

export default AdminSettingsPage;
