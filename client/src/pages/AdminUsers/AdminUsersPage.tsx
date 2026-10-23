import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, RefreshCw, Ban, UserCheck, ShieldOff, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import AdminSecurityGate from '@/components/AdminSecurityGate';
import { adminUsersApi } from '@/api';
import type { AdminUserItem } from '@/types/api';
import { toast } from 'sonner';

const AdminUsersPage = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      toast.error('需要管理员权限');
      navigate('/');
      return;
    }
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, authLoading, page, keyword]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminUsersApi.getUserList(keyword, page, pageSize);
      setItems(res.items);
      setTotal(res.total);
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || '获取用户列表失败';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const toggleBlack = async (user: AdminUserItem) => {
    setBusyId(user.id);
    try {
      await adminUsersApi.updateUserList(user.id, { blacklisted: !user.blacklisted });
      toast.success(user.blacklisted ? `已将 ${user.username} 移出黑名单` : `已将 ${user.username} 拉入黑名单`);
      fetchUsers();
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || '操作失败';
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  };

  const toggleWhite = async (user: AdminUserItem) => {
    setBusyId(user.id);
    try {
      await adminUsersApi.updateUserList(user.id, { whitelisted: !user.whitelisted });
      toast.success(user.whitelisted ? `已将 ${user.username} 移出白名单` : `已将 ${user.username} 加入白名单`);
      fetchUsers();
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || '操作失败';
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
        <h1 className="text-2xl font-bold">用户管理</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">黑名单 / 白名单管理</CardTitle>
            <CardDescription>
              拉黑后该用户无法登录网站；加入白名单后，在"仅白名单模式"开启时仍可正常访问（管理员不受限制）。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="按用户名搜索..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" size="sm">搜索</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => { setKeyword(''); setPage(1); }}>
                <RefreshCw className="w-4 h-4" />
                重置
              </Button>
            </form>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : items.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">暂无用户</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户名</TableHead>
                      <TableHead>角色</TableHead>
                      <TableHead>黑名单</TableHead>
                      <TableHead>白名单</TableHead>
                      <TableHead>注册时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>
                          {user.role === 'admin' ? (
                            <Badge variant="default">管理员</Badge>
                          ) : (
                            <Badge variant="secondary">用户</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.blacklisted ? (
                            <Badge variant="destructive">已拉黑</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.whitelisted ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">白名单</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleString('zh-CN', { hour12: false })}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.role === 'admin' ? (
                            <span className="text-xs text-muted-foreground">不可操作</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant={user.blacklisted ? 'outline' : 'destructive'}
                                disabled={busyId === user.id}
                                onClick={() => toggleBlack(user)}
                                title={user.blacklisted ? '移出黑名单' : '拉入黑名单'}
                              >
                                {busyId === user.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : user.blacklisted ? (
                                  <ShieldOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Ban className="w-3.5 h-3.5" />
                                )}
                                <span className="hidden sm:inline">{user.blacklisted ? '移出' : '拉黑'}</span>
                              </Button>
                              <Button
                                size="sm"
                                variant={user.whitelisted ? 'secondary' : 'outline'}
                                disabled={busyId === user.id}
                                onClick={() => toggleWhite(user)}
                                title={user.whitelisted ? '移出白名单' : '加入白名单'}
                              >
                                {busyId === user.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : user.whitelisted ? (
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                ) : (
                                  <UserCheck className="w-3.5 h-3.5" />
                                )}
                                <span className="hidden sm:inline">{user.whitelisted ? '移出' : '白名单'}</span>
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>共 {total} 个用户</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  上一页
                </Button>
                <span>第 {page} / {totalPages} 页</span>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  下一页
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminSecurityGate>
  );
};

export default AdminUsersPage;
