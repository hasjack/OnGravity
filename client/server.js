import { createServer } from "node:http";
import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";

const BUILD_PATH = "./build/server/index.js";
const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "5615");

const app = express();

app.use(compression());
app.use(cookieParser());
app.disable("x-powered-by");

if (DEVELOPMENT) {
    console.log("Starting development server");
    const server = createServer(app);
    const viteDevServer = await import("vite").then((vite) =>
        vite.createServer({
            server: { middlewareMode: true, hmr: { server } },
        }),
    );
    app.use(viteDevServer.middlewares);
    app.use(async (req, res, next) => {
        try {
            const source = await viteDevServer.ssrLoadModule("./server/app.ts");
            return await source.app(req, res, next);
        } catch (error) {
            if (typeof error === "object" && error instanceof Error) {
                viteDevServer.ssrFixStacktrace(error);
            }
            next(error);
        }
    });
    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
} else {
    console.log("Starting production server");
    app.use(
        "/assets",
        express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
    );
    app.use(morgan("tiny"));
    app.use(express.static("build/client", { maxAge: "1h" }));
    app.use(await import(BUILD_PATH).then((mod) => mod.app));
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}
