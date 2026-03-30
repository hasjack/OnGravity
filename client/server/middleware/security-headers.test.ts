import express from "express";
import parseCSP from "content-security-policy-parser";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { nonce } from "./nonce";
import { securityHeaders } from "./security-headers";

describe("securityHeaders", () => {
    const testNonce = "abc123";

    it("returns strict CSP in production mode", async () => {
        const app = express();
        app.use(nonce(() => testNonce));
        app.use(
            securityHeaders({ dangerouslyRelaxCsp: false, hstsEnabled: false }),
        );
        app.get("/", (_req, res) => res.send("ok"));

        const res = await request(app).get("/");
        const csp = Object.fromEntries(
            parseCSP(res.headers["content-security-policy"]),
        );

        expect(csp).toEqual({
            "base-uri": ["'self'"],
            "connect-src": ["'self'"],
            "default-src": ["'self'"],
            "font-src": ["'self'"],
            "form-action": ["'self'"],
            "frame-ancestors": ["'none'"],
            "img-src": ["'self'"],
            "object-src": ["'none'"],
            "script-src": ["'self'", `'nonce-${testNonce}'`],
            "script-src-attr": ["'none'"],
            "style-src": ["'self'"],
            "upgrade-insecure-requests": [],
        });
    });

    it("returns relaxed CSP when dangerouslyRelaxCsp is enabled", async () => {
        const app = express();
        app.use(nonce(() => testNonce));
        app.use(securityHeaders({ dangerouslyRelaxCsp: true, hstsEnabled: false }));
        app.get("/", (_req, res) => res.send("ok"));

        const res = await request(app).get("/");
        const csp = Object.fromEntries(
            parseCSP(res.headers["content-security-policy"]),
        );

        expect(csp).toEqual({
            "base-uri": ["'self'"],
            "connect-src": ["'self'", "ws:"],
            "default-src": ["'self'"],
            "font-src": ["'self'"],
            "form-action": ["'self'"],
            "frame-ancestors": ["'none'"],
            "img-src": ["'self'"],
            "object-src": ["'none'"],
            "script-src": ["'self'", `'nonce-${testNonce}'`],
            "script-src-attr": ["'none'"],
            "style-src": ["'self'", "'unsafe-inline'"],
            "upgrade-insecure-requests": [],
        });
    });
});
