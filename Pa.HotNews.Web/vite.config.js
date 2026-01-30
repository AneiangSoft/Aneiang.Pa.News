import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const appVersion = process.env.npm_package_version;

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(appVersion),
  },
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // 将 /api 请求代理到后端 ASP.NET Core 服务
      '/api': {
        // 本地开发时，把 /api 代理到后端。生产环境（Docker 一体镜像）走同源无需代理。
        target: 'http://localhost:8080', // 如果你后端本地端口不同，改这里
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
