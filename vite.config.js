import { defineConfig } from 'vite'

export default defineConfig({
    root: '.',
    server: {
        open: '/index.html',
        port: 3000
    },
    build: {
        outDir: 'dist',
    }
})
