import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 2000, // เพิ่มเพื่อแก้คำเตือนขนาด chunk (จาก 500 kB เป็น 2000 kB)
    sourcemap: true, // เปิดใช้งาน sourcemap เพื่อช่วย debug ใน production
  },
  css: {
    devSourcemap: true, // เปิดใช้งาน sourcemap สำหรับ CSS ในโหมด dev
  },
});