import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyContent,
} from '@/components/ui/empty';
import { softwareApi, logger } from '@/api';
import { useAuth } from '@/context/AuthContext';
import type { SoftwareItem } from '@/types/api';

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const SoftwareDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [software, setSoftware] = useState<SoftwareItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('软件ID无效');
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await softwareApi.getSoftwareById(id);
        setSoftware(data);
      } catch (err) {
        logger.error('获取软件详情失败', err);
        const message = (err as Error)?.message || '加载失败';
        setError(message);
        toast.error('获取软件详情失败');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleDownload = async () => {
    if (!software) return;

    if (!isLoggedIn) {
      toast.info('请先登录后下载');
      navigate('/login');
      return;
    }

    setDownloading(true);
    try {
      await softwareApi.recordDownload(software.id);
      setSoftware((prev) =>
        prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : prev
      );
      window.open(software.fileUrl, '_blank');
      toast.success('开始下载');
    } catch (err) {
      logger.error('记录下载失败', err);
      toast.error('下载失败，请稍后重试');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (error || !software) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
          返回
        </Button>
        <Empty>
          <EmptyContent>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>
              <EmptyTitle>加载失败</EmptyTitle>
              <EmptyDescription>
                {error || '软件不存在'}
              </EmptyDescription>
            </EmptyHeader>
            <Link to="/">
              <Button variant="outline" size="sm">
                返回首页
              </Button>
            </Link>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" />
        返回
      </Button>

      <Card className="rounded-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
              {software.iconUrl ? (
                <Image
                  src={software.iconUrl}
                  alt={`${software.name} 图标`}
                  width={96}
                  height={96}
                  className="w-24 h-24 object-cover"
                />
              ) : (
                <Package className="w-12 h-12 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold">{software.name}</h1>
                  <Badge variant="secondary">v{software.version}</Badge>
                  <Badge variant="outline">{software.category}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {software.downloadCount} 次下载
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {formatFileSize(software.fileSize)}
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleDownload}
                disabled={downloading}
                className="min-w-[140px]"
              >
                <Download className="w-4 h-4" />
                {downloading ? '下载中...' : '立即下载'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardContent className="p-6 space-y-3">
          <h2 className="text-lg font-semibold">软件介绍</h2>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {software.description}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SoftwareDetailPage;
