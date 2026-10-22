import { useState } from 'react';
import { Loader2, MessageSquareText, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { feedbackApi } from '@/api';
import { toast } from 'sonner';

const TYPES = [
  { value: '反馈', label: '反馈', desc: '对网站的建议与意见' },
  { value: '投诉', label: '投诉', desc: '举报违规内容或问题' },
  { value: '建议', label: '建议', desc: '想要新增的功能或改进' },
] as const;

const FeedbackPage = () => {
  const [type, setType] = useState<string>('反馈');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('请输入内容');
      return;
    }
    setSubmitting(true);
    try {
      await feedbackApi.submitFeedback({
        type: type as '反馈' | '投诉' | '建议',
        content: content.trim(),
        contact: contact.trim() || undefined,
      });
      setSubmitted(true);
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || '提交失败，请稍后重试';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <Card>
          <CardContent className="flex flex-col items-center text-center py-14 gap-3">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
            <h2 className="text-xl font-bold">提交成功！</h2>
            <p className="text-sm text-muted-foreground">
              感谢你的反馈，内容已送达网站管理员邮箱，我们会尽快处理。
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => {
                setSubmitted(false);
                setContent('');
                setContact('');
              }}
            >
              再提交一条
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl">投诉与反馈</CardTitle>
          </div>
          <CardDescription>
            发现违规软件、下载问题，或有任何建议，都可以在这里告诉我们。提交后内容会直接发送给网站管理员。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">类型</label>
              <div className="grid grid-cols-3 gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`rounded-lg border p-3 text-center transition-colors ${
                      type === t.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="text-sm font-semibold">{t.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                内容 <span className="text-destructive">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                maxLength={2000}
                placeholder="请详细描述你的反馈或投诉内容..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground text-right">{content.length} / 2000</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                联系方式 <span className="text-muted-foreground text-xs font-normal">（选填，方便管理员回复你）</span>
              </label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="邮箱 / QQ / 手机号"
                maxLength={200}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting || !content.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  提交中...
                </>
              ) : (
                '提交反馈'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackPage;
