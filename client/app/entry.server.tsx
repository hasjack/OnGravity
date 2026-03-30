import { PassThrough } from "node:stream";

import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";
import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";

import { NonceProvider } from "./nonce-context";

const ABORT_DELAY = 5_000;

export default function handleRequest(
    request: Request,
    responseStatusCode: number,
    responseHeaders: Headers,
    routerContext: EntryContext,
    loadContext: AppLoadContext,
) {
    const nonce = loadContext.nonce;

    return new Promise((resolve, reject) => {
        let shellRendered = false;
        const userAgent = request.headers.get("user-agent");

        // Bots should wait for all content
        const readyOption: keyof RenderToPipeableStreamOptions =
            userAgent && isbot(userAgent) ? "onAllReady" : "onShellReady";

        const { pipe, abort } = renderToPipeableStream(
            <NonceProvider nonce={nonce}>
                <ServerRouter context={routerContext} url={request.url} nonce={nonce} />
            </NonceProvider>,
            {
                nonce,
                [readyOption]() {
                    shellRendered = true;
                    const body = new PassThrough();
                    const stream = createReadableStreamFromReadable(body);

                    responseHeaders.set("Content-Type", "text/html");

                    resolve(
                        new Response(stream, {
                            headers: responseHeaders,
                            status: responseStatusCode,
                        }),
                    );

                    pipe(body);
                },
                onShellError(error: unknown) {
                    reject(error);
                },
                onError(error: unknown) {
                    responseStatusCode = 500;
                    if (shellRendered) {
                        console.error(error);
                    }
                },
            },
        );

        setTimeout(abort, ABORT_DELAY);
    });
}
