import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Proxy for Sportz Cricket APIs
      '/api/sportz': {
        target: 'https://demo.sportz.io/sifeeds/repo/cricket/live/json',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sportz/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      },
      // Proxy for Fixtures API
      '/api/fixtures': {
        target: 'https://videoscorecard.sportz.io/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fixtures/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Fixtures proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Fixtures Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Fixtures Response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
})