import type { Request, Response, NextFunction, RequestHandler } from "express";
import crypto from "node:crypto";

import { env } from "~/server/config";

const CSRF_COOKIE = "__csrf";
const CSRF_HEADER = "x-csrf-token";
const PROTECTED_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

// Content types where SameSite=Strict cookie provides sufficient CSRF protection
const FORM_CONTENT_TYPES = [
    "application/x-www-form-urlencoded",
    "multipart/form-data",
];

function isFormSubmission(req: Request): boolean {
    const contentType = req.get("content-type") ?? "";
    return FORM_CONTENT_TYPES.some((type) => contentType.startsWith(type));
}

export function csrf(): RequestHandler {
    const secure = env().secureCookies;

    return (req: Request, res: Response, next: NextFunction) => {
        let token = req.cookies?.[CSRF_COOKIE];

        if (!token) {
            token = crypto.randomBytes(32).toString("hex");
            res.cookie(CSRF_COOKIE, token, {
                httpOnly: false,
                sameSite: "strict",
                secure,
                path: "/",
            });
        }

        res.locals.csrfToken = token;

        // For state-changing requests, validate CSRF
        if (PROTECTED_METHODS.has(req.method)) {
            // Form submissions are protected by SameSite=Strict cookie
            // For other content types (JSON API calls), require the header
            if (!isFormSubmission(req)) {
                const headerToken = req.get(CSRF_HEADER);
                if (!headerToken || headerToken !== token) {
                    res.status(403).json({ error: "Invalid CSRF token" });
                    return;
                }
            }
        }

        next();
    };
}
