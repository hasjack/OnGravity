import { defineConfig } from 'vite'
import { reactRouter } from "@react-router/dev/vite";
import type { Plugin } from "vite";
import { sharedPlugins, watchOptions } from "./vite.shared";


// Prevent client-side reloads for server-only files.
// SSR still picks up changes via ssrLoadModule on each request.
function serverFilesHmr(): Plugin {
    return {
        name: "server-files-hmr",
        handleHotUpdate({ file }) {
            if (file.includes("/server/") && !file.includes("/app/")) {
                return [];
            }
        },
    };
}

export default defineConfig(({ isSsrBuild }) => ({
    build: {
        rollupOptions: isSsrBuild ? { input: "./server/app.ts" } : undefined,
    },
    plugins: [serverFilesHmr(), ...sharedPlugins(), reactRouter()],
    server: {
        watch: watchOptions,
    },
}));
