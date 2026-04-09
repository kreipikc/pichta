import react from '@vitejs/plugin-react'
import * as path from 'path'
import { defineConfig } from 'vite'
import gltf from 'vite-plugin-gltf'
import svgr from 'vite-plugin-svgr'

export default defineConfig(() => {
  return {
    base: '/',
    appType: 'spa',
    plugins: [react(), gltf(), svgr()],
    server: {
      host: '0.0.0.0',
      port: 8085,
      proxy: {
        '/api': {
          target: 'http://backend:8005',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        app: path.resolve(__dirname, 'src/app'),
        components: path.resolve(__dirname, 'src/components'),
        hooks: path.resolve(__dirname, 'src/hooks'),
        pages: path.resolve(__dirname, 'src/pages'),
        shared: path.resolve(__dirname, 'src/shared'),
        assets: path.resolve(__dirname, 'src/assets'),
      },
    },
  }
})
