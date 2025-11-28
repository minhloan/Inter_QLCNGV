import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'html2pdf.js',
      'axios',
      '@stomp/stompjs',
      'js-cookie',
      'sockjs-client'
    ],
    exclude: ['html-docx-js'] // Exclude vì package này dùng 'with' statement không được phép trong strict mode
  },
  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.eot', '**/*.ttf', '**/*.svg'],
  server: {
    host: '0.0.0.0', // Cho phép truy cập từ domain giả
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    proxy: {
      '/v1': {
        target: 'http://localhost:8080', // Có thể đổi thành http://api.qlcngv.local:8080  nếu không dùng domain giả
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'http://localhost:8080', // Có thể đổi thành http://localhost:8080 nếu không dùng domain giả
        ws: true,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
