import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';

const AGREED_KEY = 'software_site_disclaimer_agreed';

const DisclaimerGate = () => {
  const [agreed, setAgreed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AGREED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  if (agreed) return null;

  const handleAgree = () => {
    try {
      localStorage.setItem(AGREED_KEY, 'true');
    } catch {
      // ignore storage errors
    }
    setAgreed(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl bg-background border border-border shadow-2xl">
        <div className="p-6 space-y-4">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">免责声明</h2>
          </div>
          <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
            <p>本站为个人软件分享网站，托管于境外服务器（美国），非任何官方机构站点。</p>
            <p>本站收录的软件均来自第三方开发者，仅供学习交流使用，请于下载后 24 小时内删除，切勿用于商业用途。</p>
            <p>下载和使用软件产生的一切后果由使用者自行承担，本站不对软件的完整性、安全性及可用性作任何保证。</p>
            <p>如涉及版权问题，请联系网站管理员处理。</p>
          </div>
          <Button className="w-full" onClick={handleAgree}>
            我已阅读并同意，进入网站
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerGate;
