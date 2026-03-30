import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export const sharedPlugins = () => [tailwindcss(), tsconfigPaths()];

// Prevent chokidar from following symlinks into /nix/store
export const watchOptions = {
    ignored: [
        "**/.devenv/**",
        "**/.direnv/**",
        "**/.dockerignore",
        "**/.git/**",
        "**/.github/**",
        "**/.storybook/**",
        "**/node_modules/**",
        "**/Dockerfile",
        "**/README.org",
        "**/devenv.*",
        "**/e2e/**",
        "**/justfile",
        "**/playwright-report/**",
        "**/playwright.config.ts",
        "**/test-results/**",
        "**/treefmt.toml",
    ],
    followSymlinks: false,
};
