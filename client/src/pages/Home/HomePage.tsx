import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, Download, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyContent,
} from '@/components/ui/empty';
import { Image } from '@/components/ui/image';
import { softwareApi, logger } from '@/api';
import type { SoftwareItem } from '@/types/api';

const CATEGORIES = [
  { value: '', label: '全部' },
  { value: '办公软件', label: '办公软件' },
  { value: '开发工具', label: '开发工具' },
  { value: '多媒体', label: '多媒体' },
  { value: '系统工具', label: '系统工具' },
  { value: '网络工具', label: '网络工具' },
];

const PAGE_SIZE = 12;

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const categoryParam = searchParams.get('category') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [searchInput, setSearchInput] = useState(keyword);
  const [items, setItems] = useState<SoftwareItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(pageParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await softwareApi.getSoftwareList({
          keyword: keyword || undefined,
          category: categoryParam || undefined,
          page,
          pageSize: PAGE_SIZE,
        });
        setItems(response.items);
        setTotal(response.total);
      } catch (err) {
        logger.error('加载软件列表失败', err);
        const message = (err as Error)?.message || '加载失败';
        setError(message);
        toast.error('加载软件列表失败');
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [keyword, categoryParam, page]);

  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

  useEffect(() => {
    setPage(pageParam);
  }, [pageParam]);

  const updateQuery = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    setSearchParams(next);
  };

  const handleCategoryChange = (categoryValue: string) => {
    setActiveCategory(categoryValue);
    updateQuery({ category: categoryValue || null, page: '1' });
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    updateQuery({ keyword: searchInput.trim() || null, page: '1' });
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    updateQuery({ page: String(nextPage) });
  };

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await softwareApi.getSoftwareList({
        keyword: keyword || undefined,
        category: categoryParam || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(response.items);
      setTotal(response.total);
    } catch (err) {
      setError((err as Error)?.message || '加载失败');
      toast.error('加载软件列表失败');
    } finally {
      setLoading(false);
    }
  };

  const truncate = (text: string, max: number) => {
    if (text.length <= max) return text;
    return text.slice(0, max) + '...';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <form onSubmit={handleSearch} className="w-full md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索软件..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
              aria-label="搜索软件"
            />
          </div>
        </form>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value || 'all'}
              variant={activeCategory === cat.value ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleCategoryChange(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="text-destructive">{error}</div>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            重试
          </Button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <Empty>
          <EmptyContent>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Package />
              </EmptyMedia>
              <EmptyTitle>暂无软件</EmptyTitle>
              <EmptyDescription>
                {keyword ? '没有找到匹配的软件，换个关键词试试' : '当前分类下还没有软件资源'}
              </EmptyDescription>
            </EmptyHeader>
          </EmptyContent>
        </Empty>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div
            data-ai-section-type="card-list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {items.map((item: SoftwareItem) => (
              <Link key={item.id} to={`/software/${item.id}`} className="block">
                <Card className="h-full hover-elevate transition-all">
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {item.iconUrl ? (
                          <Image
                            src={item.iconUrl}
                            alt={`${item.name} 图标`}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-base truncate">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">v{item.version}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                      {truncate(item.description, 80)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" />
                        <span>{item.downloadCount} 次下载</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(page - 1)}
                    className={page <= 1 ? 'pointer-events-none opacity-50 cursor-pointer' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {(() => {
                  const pages: number[] = [];
                  if (totalPages <= 5) {
                    for (let p = 1; p <= totalPages; p++) pages.push(p);
                  } else {
                    const nearby = new Set<number>();
                    nearby.add(1);
                    nearby.add(totalPages);
                    for (let p = page - 1; p <= page + 1; p++) {
                      if (p > 1 && p < totalPages) nearby.add(p);
                    }
                    pages.push(...Array.from(nearby).sort((a, b) => a - b));
                  }

                  const items: ReactNode[] = [];
                  pages.forEach((p, idx) => {
                    if (idx > 0 && pages[idx - 1] !== p - 1) {
                      items.push(
                        <PaginationItem key={`ellipsis-${p}`}>
                          <span className="px-2 text-muted-foreground text-sm">...</span>
                        </PaginationItem>
                      );
                    }
                    items.push(
                      <PaginationItem key={p}>
                        <PaginationLink
                          isActive={page === p}
                          onClick={() => handlePageChange(p)}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  });
                  return items;
                })()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(page + 1)}
                    className={page >= totalPages ? 'pointer-events-none opacity-50 cursor-pointer' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
