import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base is '/Portfolio/' only for production builds (GitHub Pages)
// dev server runs at localhost:5173/ without a subpath
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/Portfolio/' : '/',
  assetsInclude: ['**/*.glb'],   // bundle .glb models as URL assets
}))
