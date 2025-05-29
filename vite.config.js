import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // เพิ่มขนาดคำเตือนเป็น 1000 kB เพื่อไม่ให้แสดงคำเตือน
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'exceljs'], // แยก library ใหญ่ ๆ ออกเป็นไฟล์ vendor
          'ui-components': ['@radix-ui/react-tabs', 'lucide-react'], // แยก UI components
        },
      },
    },
  },
});