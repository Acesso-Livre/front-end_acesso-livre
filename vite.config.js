import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: 'src',
    envDir: '../',
    publicDir: '../public',
    appType: 'mpa',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.html'),
                mapa: resolve(__dirname, 'src/mapa/index.html'),
                auth: resolve(__dirname, 'src/auth/index.html'),
                admin: resolve(__dirname, 'src/admin/index.html'),
            },
        },
    },
    server: {
        open: true,
    },
});
