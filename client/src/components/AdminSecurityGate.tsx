import { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { authApi } from '@/api';
import { toast } from 'sonner';

const SECURITY_KEY = 'software_site_admin_verified';

interface AdminSecurityGateProps {
  children: React.ReactNode;
}

const AdminSecurityGate = ({ children }: AdminSecurityGateProps) => {
  const [verified, setVerified] = useState<boolean>(
    () => sessionStorage.getItem(SECURITY_KEY) === 'true',
  );
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(!verified);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.verifySecurityCode(code);
      sessionStorage.setItem(SECURITY_KEY, 'true');
      setVerified(true);
      setOpen(false);
      toast.success('安全码验证通过');
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || '安全码错误';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return <>{children}</>;
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center">管理员安全验证</DialogTitle>
          <DialogDescription className="text-center">
            进入管理后台前，请输入管理员安全码
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            type="password"
            placeholder="请输入安全码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
            aria-label="安全码"
          />
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={loading || !code.trim()}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  验证中...
                </>
              ) : (
                '进入后台'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminSecurityGate;
