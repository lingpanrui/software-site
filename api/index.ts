import 'reflect-metadata';
import { createApp } from '../src/create-app';

// 缓存已初始化的 Express 实例，避免每次请求冷启动重建整个 Nest 应用
let cachedExpressApp: any = null;

async function getExpressApp(): Promise<any> {
  if (!cachedExpressApp) {
    const app = await createApp({ serveFrontend: false });
    cachedExpressApp = app.getHttpAdapter().getInstance();
  }
  return cachedExpressApp;
}

// Vercel Serverless 函数入口。
// vercel.json 的 rewrites 将 /api/(.*) 重写为 /api/api/$1、/uploads/(.*) 重写为 /api/uploads/$1，
// 这里剥离前缀 /api 还原成真实路径（/api/site-settings → /api/site-settings，/uploads/x → /uploads/x）。
export default async function handler(req: any, res: any): Promise<void> {
  const expressApp = await getExpressApp();
  if (req.url && req.url.startsWith('/api')) {
    const stripped = req.url.replace(/^\/api/, '');
    req.url = stripped === '' ? '/' : stripped;
  }
  expressApp(req, res);
}
