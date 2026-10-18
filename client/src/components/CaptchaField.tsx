import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { authApi } from '@/api';
import type { CaptchaInfo } from '@/types/api';

interface CaptchaFieldProps {
  value: string;
  onChange: (value: string) => void;
  onCaptchaIdChange: (captchaId: string) => void;
  onCaptchaLoaded?: (captcha: CaptchaInfo) => void;
  error?: string;
}

const CaptchaField = ({ value, onChange, onCaptchaIdChange, onCaptchaLoaded, error }: CaptchaFieldProps) => {
  const [captcha, setCaptcha] = useState<CaptchaInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  const loadCaptcha = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await authApi.getCaptcha();
      if (mounted.current) {
        setCaptcha(data);
        onCaptchaIdChange(data.captchaId);
        onCaptchaLoaded?.(data);
      }
    } catch {
      // 静默失败，下次点击重试
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    mounted.current = true;
    loadCaptcha();
    const onRefresh = () => {
      // 清空输入，重新加载
      if (onChange && value) {
        onChange('');
      }
      loadCaptcha();
    };
    window.addEventListener('captcha-refresh', onRefresh);
    return () => {
      mounted.current = false;
      window.removeEventListener('captcha-refresh', onRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            placeholder="请输入验证码"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={4}
            aria-label="图形验证码"
          />
        </div>
        <button
          type="button"
          onClick={loadCaptcha}
          disabled={loading}
          title="点击验证码刷新"
          className="shrink-0 h-10 w-[100px] rounded-md border bg-muted/40 overflow-hidden flex items-center justify-center hover:bg-muted/60 transition-colors cursor-pointer"
        >
          {captcha ? (
            <span
              dangerouslySetInnerHTML={{ __html: captcha.image }}
              className="pointer-events-none select-none"
            />
          ) : (
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        <button
          type="button"
          onClick={loadCaptcha}
          disabled={loading}
          title="刷新验证码"
          className="shrink-0 h-10 w-9 rounded-md border bg-background flex items-center justify-center hover:bg-muted/60 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {error ? <p className="text-sm text-destructive mt-1.5">{error}</p> : null}
    </div>
  );
};

export default CaptchaField;
