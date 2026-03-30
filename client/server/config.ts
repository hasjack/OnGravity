import { z } from "zod";

// Custom transformer for env var booleans
// z.coerce.boolean() doesn't work: Boolean("false") === true
const envBoolean = z
    .enum(["true", "false", "1", "0", ""])
    .optional()
    .transform((val) => val === "true" || val === "1");

const configSchema = z
    .object({
        DATABASE_URL: z.string().url().optional(),
        PORT: z.coerce.number().int().positive().default(3000),
        SECURE_COOKIES: envBoolean,
        HSTS_ENABLED: envBoolean,
        DANGEROUSLY_RELAX_CSP: envBoolean,
    })
    .transform((env) => ({
        databaseUrl: env.DATABASE_URL,
        port: env.PORT,
        secureCookies: env.SECURE_COOKIES,
        hstsEnabled: env.HSTS_ENABLED,
        dangerouslyRelaxCsp: env.DANGEROUSLY_RELAX_CSP,
    }))

export type Config = z.infer<typeof configSchema>;

let cached: Config | undefined;

export function env(): Config {
    if (cached) return cached;

    const result = configSchema.safeParse(process.env);

    if (!result.success) {
        console.error("Invalid environment configuration:\n");
        for (const issue of result.error.issues) {
            console.error(`  ${issue.path.join(".")}: ${issue.message}`);
        }
        process.exit(1);
    }

    cached = result.data;
    return cached;
}
