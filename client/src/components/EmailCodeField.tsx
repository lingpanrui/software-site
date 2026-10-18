import { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authApi } from '@/api';
import type { CaptchaInfo } from '@/types/api';

interface EmailCodeFieldProps {
  value: string;
  onChange: (value: string) => void;
  email: string;
  usage: 'register' | 'login';
  captcha: CaptchaInfo | null;
  captchaCode: string;
  error?: string;
}

const EmailCodeField = ({ value, onChange, email, usage, captcha, captchaCode, error }: EmailCodeFieldProps) => {
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [countdown]);

  const handleSend = async () => {
    if (!email.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;
    if (!captcha) return;
    if (!captchaCode.trim()) return;
    setSending(true);
    try {
      await authApi.sendEmailCode({
        email: email.trim(),
        usage,
        captchaId: captcha.captchaId,
        captchaCode: captchaCode.trim(),
      });
      setCountdown(60);
      // 发送成功后图形验证码已使用，由父组件刷新
      window.dispatchEvent(new CustomEvent('captcha-refresh'));
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message || '发送失败';
      window.dispatchEvent(new CustomEvent('captcha-error', { detail: msg }));
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            placeholder="请输入邮箱验证码"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={6}
            aria-label="邮箱验证码"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 w-[120px]"
          onClick={handleSend}
          disabled={sending || countdown > 0 || !email.trim() || !captcha || !captchaCode.trim()}
        >
          {sending ? '发送中...' : countdown > 0 ? `${countdown}s 后重发` : '发送验证码'}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive mt-1.5">{error}</p> : null}
    </div>
  );
};

export default EmailCodeField;
