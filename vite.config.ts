import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('leaflet')) return 'maps';
            if (id.includes('motion')) return 'motion';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('react')) return 'react-vendor';
            return 'vendor';
          },
        },
      },
    },
    server: {
      // Permite desativar HMR e observação de arquivos em ambientes de CI/automação.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Quando desativado, evita trabalho desnecessário do watcher.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
