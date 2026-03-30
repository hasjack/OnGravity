import crypto from "node:crypto";
import type { RequestHandler } from "express";

declare global {
    namespace Express {
        interface Locals {
            nonce: string;
        }
    }
}

export type NonceGenerator = () => string;

const defaultGenerator: NonceGenerator = () =>
    crypto.randomBytes(16).toString("base64");

export function nonce(
    generator: NonceGenerator = defaultGenerator,
): RequestHandler {
    return (_req, res, next) => {
        res.locals.nonce = generator();
        next();
    };
}
