import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // 将 /api 请求代理到后端 ASP.NET Core 服务
      '/api': {
        target: 'http://113.45.65.71:8921', // 后端监听的地址
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
