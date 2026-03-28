import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    base: '/',
    resolve: {
        alias: {
            components: path.resolve(__dirname, "./src/components"),
            lib: path.resolve(__dirname, "./src/lib"),
            pages: path.resolve(__dirname, "./src/pages"),
            store: path.resolve(__dirname, "./src/store"),
            types: path.resolve(__dirname, "./src/types.ts")
        }
    }
})
