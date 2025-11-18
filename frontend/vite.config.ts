import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // El backend ya tiene context-path=/api, así que mantenemos la ruta completa
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            let url = req.url || '';
            url = url.trim();
            
            try {
              url = decodeURIComponent(url);
              const match = url.match(/^(\/api\/[^?\s#]+)/);
              if (match) {
                url = match[1];
              }
              const parts = url.split('?');
              url = parts[0] + (parts[1] ? '?' + encodeURIComponent(parts[1]) : '');
            } catch (e) {
              url = url.split(/\s/)[0].split('?')[0];
            }
            
            req.url = url;
            proxyReq.path = url;
          });
        },
      }
    }
  }
})