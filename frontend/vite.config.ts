import react from '@vitejs/plugin-react'
import * as path from 'path'
import { defineConfig, loadEnv } from 'vite'
import gltf from 'vite-plugin-gltf'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const accessTokenExpireMinutes =
    env.VITE_ACCESS_TOKEN_EXPIRE_MINUTES ??
    env.ACCESS_TOKEN_EXPIRE_MINUTES ??
    '15'

  return {
    base: '/',
    appType: 'spa',
    plugins: [
      react(),
      gltf(),
      svgr(),
    ],
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
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        app: path.resolve(__dirname, '.src/app'),
        components: path.resolve(__dirname, '.src/components'),
        hooks: path.resolve(__dirname, '.src/hooks'),
        pages: path.resolve(__dirname, '.src/pages'),
        shared: path.resolve(__dirname, '.src/shared'),
        assets: path.resolve(__dirname, '.src/assets'),
      }
    },
    define: {
      'import.meta.env.VITE_ACCESS_TOKEN_EXPIRE_MINUTES': JSON.stringify(accessTokenExpireMinutes),
    },
  }
})
