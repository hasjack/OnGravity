import type { RequestHandler, Response } from "express";
import helmet from "helmet";

export function securityHeaders(config: {
    dangerouslyRelaxCsp: boolean;
    hstsEnabled: boolean;
}): RequestHandler {
    return helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    (_req, res) => `'nonce-${(res as Response).locals.nonce}'`,
                ],
                styleSrc: config.dangerouslyRelaxCsp
                    ? ["'self'", "'unsafe-inline'"]
                    : ["'self'"],
                fontSrc: ["'self'"],
                imgSrc: ["'self'", "https://cdn.halfasecond.com/"],
                connectSrc: config.dangerouslyRelaxCsp ? ["'self'", "ws:"] : ["'self'"],
                frameAncestors: ["'none'"],
                formAction: ["'self'"],
                baseUri: ["'self'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: [],
            },
        },
        xFrameOptions: { action: "deny" },
        hsts: config.hstsEnabled
            ? { maxAge: 31536000, includeSubDomains: true, preload: true }
            : false,
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    });
}
