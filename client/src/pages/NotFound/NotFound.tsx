import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-xl font-semibold mb-2">页面未找到</h2>
      <p className="text-muted-foreground mb-6">您访问的页面不存在或已被移除。</p>
      <Link
        to="/"
        className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90"
      >
        返回首页
      </Link>
    </div>
  );
};

export default NotFound;
