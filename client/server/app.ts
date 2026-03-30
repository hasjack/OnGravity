import { createRequestHandler } from "@react-router/express";
// import { drizzle } from "drizzle-orm/postgres-js";
import express from "express";
// import postgres from "postgres";
import "react-router";

// import { DatabaseContext } from "~/database/context";
// import * as schema from "~/database/schema";
import { env } from "~/server/config";
import { csrf } from "~/server/middleware/csrf";
import { nonce, type NonceGenerator } from "~/server/middleware/nonce";
import { securityHeaders } from "~/server/middleware/security-headers";

declare module "react-router" {
    interface AppLoadContext {
        csrfToken: string;
        nonce: string;
    }
}

export interface AppOptions {
    nonceGenerator?: NonceGenerator;
}

export function createApp(options: AppOptions = {}) {
    const app = express();

    const config = env();
    //   const client = postgres(config.databaseUrl);
    //   const db = drizzle(client, { schema });

    app.use(nonce(options.nonceGenerator));
    // app.use(securityHeaders(config));
    // app.use((_, __, next) => DatabaseContext.run(db, next));
    app.use(csrf());

    app.get("/healthz", async (_req, res) => {
        try {
            // await client`SELECT 1`;
            res.status(200).send("OK!\n");
        } catch (error) {
            console.error("Health check failed:", error);
            res.status(503).send("Service Unavailable\n");
        }
    });

    app.use(
        createRequestHandler({
            build: () => import("virtual:react-router/server-build"),
            getLoadContext(_req, res) {
                return {
                    csrfToken: res.locals.csrfToken,
                    nonce: res.locals.nonce,
                };
            },
        }),
    );

    return app;
}

export const app = createApp();
