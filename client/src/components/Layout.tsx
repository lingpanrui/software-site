import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState, type FormEvent } from 'react';
import { Package, Search, Settings, LogIn, LogOut, UserPlus, LayoutDashboard, MessageSquareText, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DisclaimerGate from './DisclaimerGate';
import { useAuth } from '../context/AuthContext';
import { siteSettingsApi } from '../api';
import type { SiteSettings } from '@/types/api';

const Layout = () => {
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ siteName: '软件资源站', siteUrl: '', allowlistOnly: false });
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    siteSettingsApi.getSiteSettings().then(setSiteSettings).catch(() => {});
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DisclaimerGate />
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <Package className="w-6 h-6 text-primary" />
            <span>{siteSettings.siteName}</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索软件..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
                aria-label="搜索软件"
              />
            </div>
          </form>

          <nav className="flex items-center gap-2">
            <NavLink to="/feedback">
              {({ isActive }) => (
                <Button variant={isActive ? 'secondary' : 'ghost'} size="sm" aria-label="投诉与反馈">
                  <MessageSquareText className="w-4 h-4" />
                  <span className="hidden sm:inline">投诉反馈</span>
                </Button>
              )}
            </NavLink>
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <>
                    <NavLink to="/admin/software">
                      {({ isActive }) => (
                        <Button variant={isActive ? 'secondary' : 'ghost'} size="sm">
                          <LayoutDashboard className="w-4 h-4" />
                          <span className="hidden sm:inline">管理后台</span>
                        </Button>
                      )}
                    </NavLink>
                    <NavLink to="/admin/users">
                      {({ isActive }) => (
                        <Button variant={isActive ? 'secondary' : 'ghost'} size="sm" aria-label="用户管理">
                          <Users className="w-4 h-4" />
                          <span className="hidden sm:inline">用户管理</span>
                        </Button>
                      )}
                    </NavLink>
                    <NavLink to="/admin/settings">
                      {({ isActive }) => (
                        <Button variant={isActive ? 'secondary' : 'ghost'} size="sm" aria-label="站点设置">
                          <Settings className="w-4 h-4" />
                        </Button>
                      )}
                    </NavLink>
                  </>
                )}
                <div className="text-sm text-muted-foreground hidden md:block px-2">
                  {user?.username}
                  <span className="ml-1 text-xs">({user?.role === 'admin' ? '管理员' : '用户'})</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="退出登录">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">退出</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">登录</span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">注册</span>
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>

        <form onSubmit={handleSearch} className="px-4 pb-3 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索软件..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-10"
              aria-label="搜索软件"
            />
          </div>
        </form>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 space-y-1.5">
          <p>&copy; {new Date().getFullYear()} {siteSettings.siteName}. 提供优质软件资源下载服务。</p>
          <p>本站为个人软件分享网站，托管于境外服务器（美国），非任何官方机构站点，软件均来自第三方开发者，下载前请自行核对。</p>
          <p>如遇下载或使用问题，请联系网站管理员。</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
