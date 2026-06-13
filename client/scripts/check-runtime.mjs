import { existsSync } from "node:fs";

const [major = 0, minor = 0] = process.versions.node
    .split(".")
    .map((part) => Number.parseInt(part, 10));

const hasSupportedNode =
    (major === 20 && minor >= 19) ||
    (major === 22 && minor >= 12) ||
    major > 22;

if (!hasSupportedNode) {
    console.error(
        `Node ${process.version} is too old for this client. Use Node >=20.19.0 or >=22.12.0.`,
    );
    console.error("If you use nvm, run `nvm use` from the client directory.");
    process.exit(1);
}

if (process.argv.includes("--require-build") && !existsSync("build/server/index.js")) {
    console.error("Missing production build at build/server/index.js.");
    console.error("Run `yarn build` first, or use `yarn dev` for local development.");
    process.exit(1);
}
