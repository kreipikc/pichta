// frontend/vite.config.ts
import react from '@vitejs/plugin-react'
import * as path from 'path'
import { defineConfig, loadEnv } from 'vite'
import gltf from 'vite-plugin-gltf'
import svgr from 'vite-plugin-svgr'

export default defineConfig(({ mode }) => {
  const rootEnvDir = path.resolve(__dirname, '..')            // корень репо
  const env = loadEnv(mode, rootEnvDir, 'VITE_')              // читаем только VITE_*

  return {
    base: '/',
    appType: 'spa',
    plugins: [react(), gltf(), svgr()],
    envDir: rootEnvDir,
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:8005',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        // У вас тут была опечатка: '.src/...'
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
