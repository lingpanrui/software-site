import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Upload,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { softwareApi, request } from '@/api';
import AdminSecurityGate from '@/components/AdminSecurityGate';
import type { SoftwareItem, UploadResponse } from '@/types/api';
import { toast } from 'sonner';

const CATEGORY_OPTIONS = ['办公软件', '开发工具', '多媒体', '系统工具', '网络工具'];
const PAGE_SIZE = 10;

const softwareSchema = z.object({
  name: z.string().min(1, '软件名称不能为空'),
  description: z.string().min(1, '软件描述不能为空'),
  version: z.string().optional(),
  category: z.string().optional(),
  iconUrl: z.string().optional(),
  fileUrl: z.string().min(1, '文件 URL 不能为空'),
  fileSize: z.string().optional(),
});

type SoftwareFormValues = z.infer<typeof softwareSchema>;

interface SoftwareFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: SoftwareItem;
  onSubmit: (values: SoftwareFormValues) => Promise<void>;
  loading: boolean;
  title: string;
}

const SoftwareFormDialog = ({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  loading,
  title,
}: SoftwareFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const form = useForm<SoftwareFormValues>({
    resolver: zodResolver(softwareSchema),
    defaultValues: {
      name: '',
      description: '',
      version: '',
      category: '',
      iconUrl: '',
      fileUrl: '',
      fileSize: undefined as unknown as string,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: initialValues?.name || '',
        description: initialValues?.description || '',
        version: initialValues?.version || '',
        category: initialValues?.category || '',
        iconUrl: initialValues?.iconUrl || '',
        fileUrl: initialValues?.fileUrl || '',
        fileSize: initialValues?.fileSize
          ? String(initialValues.fileSize)
          : (undefined as unknown as string),
      });
    }
  }, [open, initialValues, form]);

  const handleSubmit = async (values: SoftwareFormValues) => {
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>软件名称 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入软件名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>版本号</FormLabel>
                    <FormControl>
                      <Input placeholder="如 1.0.0" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分类</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择分类" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((cat: string) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>软件描述 *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请输入软件描述"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="iconUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>图标 URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>软件文件 *</FormLabel>
                  <div className="flex gap-2">
                    <FormControl className="flex-1">
                      <Input placeholder="上传文件或粘贴 URL" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      上传
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      try {
                        const formData = new FormData();
                        formData.append('file', file);
                        const response = await request.post<UploadResponse>(
                          '/api/upload',
                          formData,
                          {
                            headers: {
                              'Content-Type': 'multipart/form-data',
                            },
                          },
                        );
                        const data = response.data;
                        form.setValue('fileUrl', data.url);
                        form.setValue('fileSize', String(data.size), { shouldValidate: true });
                        toast.success(`${file.name} 上传成功`);
                      } catch (err) {
                        const msg =
                          (err as any)?.response?.data?.error?.message ||
                          (err as Error)?.message ||
                          '上传失败';
                        toast.error(msg);
                      } finally {
                        setUploading(false);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fileSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>文件大小（字节）</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="如 1024000"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '保存中...' : '保存'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
  softwareName?: string;
}

const DeleteConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  loading,
  softwareName,
}: DeleteConfirmProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          确定要删除软件「{softwareName}」吗？此操作不可撤销。
        </p>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            取消
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? '删除中...' : '删除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AdminSoftwarePage = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<SoftwareItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [listLoading, setListLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<SoftwareItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<SoftwareItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await softwareApi.getSoftwareList({
        keyword: keyword || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || '获取软件列表失败';
      toast.error(msg);
    } finally {
      setListLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      toast.error('需要管理员权限');
      navigate('/');
      return;
    }
    fetchList();
  }, [isAdmin, authLoading, navigate, fetchList]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(searchInput.trim());
    setPage(1);
  };

  const handleCreate = async (values: SoftwareFormValues) => {
    setFormLoading(true);
    try {
      await softwareApi.createSoftware({
        name: values.name,
        description: values.description,
        version: values.version || '',
        category: values.category || '',
        iconUrl: values.iconUrl || '',
        fileUrl: values.fileUrl,
        fileSize: values.fileSize ? Number(values.fileSize) : 0,
      });
      toast.success('创建成功');
      setCreateOpen(false);
      fetchList();
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || '创建失败';
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (values: SoftwareFormValues) => {
    if (!editItem) return;
    setFormLoading(true);
    try {
      await softwareApi.updateSoftware(editItem.id, {
        name: values.name,
        description: values.description,
        version: values.version || '',
        category: values.category || '',
        iconUrl: values.iconUrl || '',
        fileUrl: values.fileUrl,
        fileSize: values.fileSize ? Number(values.fileSize) : 0,
      });
      toast.success('更新成功');
      setEditOpen(false);
      setEditItem(null);
      fetchList();
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || '更新失败';
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleteLoading(true);
    try {
      await softwareApi.deleteSoftware(deleteItem.id);
      toast.success('删除成功');
      setDeleteOpen(false);
      setDeleteItem(null);
      fetchList();
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || '删除失败';
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">软件管理</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          新增软件
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="按名称搜索..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </form>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">名称</TableHead>
              <TableHead className="w-[120px]">分类</TableHead>
              <TableHead className="w-[100px]">版本</TableHead>
              <TableHead className="w-[100px]">下载次数</TableHead>
              <TableHead className="text-right w-[160px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              items.map((item: SoftwareItem) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category || '-'}</TableCell>
                  <TableCell>{item.version || '-'}</TableCell>
                  <TableCell>{item.downloadCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditItem(item);
                          setEditOpen(true);
                        }}
                        aria-label={`编辑 ${item.name}`}
                      >
                        <Edit className="w-4 h-4" />
                        编辑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setDeleteItem(item);
                          setDeleteOpen(true);
                        }}
                        aria-label={`删除 ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">
            共 {total} 条，第 {page} / {totalPages} 页
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            aria-label="上一页"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            aria-label="下一页"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      <SoftwareFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        loading={formLoading}
        title="新增软件"
      />

      <SoftwareFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initialValues={editItem ?? undefined}
        onSubmit={handleEdit}
        loading={formLoading}
        title="编辑软件"
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        loading={deleteLoading}
        softwareName={deleteItem?.name}
      />
      </div>
    </AdminSecurityGate>
  );
};

export default AdminSoftwarePage;
