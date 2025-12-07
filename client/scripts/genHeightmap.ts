// scripts/genHeightmap.ts
// Run with: npx ts-node scripts/genHeightmap.ts

import { PNG } from "pngjs";
import * as fs from "fs";

// --- Natural Maths primes (2 is NOT prime here) ---
const NM_PRIMES = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31];

function nmIter(c: number, b: number, maxIter: number, K: number): number {
    let x = 0;

    for (let i = 1; i <= maxIter; i++) {
        const kappa =
            NM_PRIMES.slice(0, i)
                .reduce((s, p) => s + 1 / p, 0);

        const nextX = K * x * x + c + kappa;

        if (Math.abs(nextX) > 4)
            return i; // escaped

        x = nextX;
    }
    return maxIter;
}

async function main() {
    const W = 512;
    const H = 512;
    const MAX_ITER = 120;
    const K = 0.6235;

    const png = new PNG({ width: W, height: H });

    // --- coordinate grid for c,b plane ---
    const C_MIN = -2.5, C_MAX = 1.5;
    const B_MIN = -1.2, B_MAX = 1.2;

    for (let y = 0; y < H; y++) {
        const b = B_MIN + (y / (H - 1)) * (B_MAX - B_MIN);

        for (let x = 0; x < W; x++) {
            const c = C_MIN + (x / (W - 1)) * (C_MAX - C_MIN);

            const escape = nmIter(c, b, MAX_ITER, K);
            const shade = Math.floor((escape / MAX_ITER) * 255);

            const idx = (W * y + x) << 2;
            png.data[idx] = shade;
            png.data[idx + 1] = shade;
            png.data[idx + 2] = shade;
            png.data[idx + 3] = 255;
        }
    }

    const outPath = "public/heightmap.png";
    png.pack().pipe(fs.createWriteStream(outPath));

    console.log(`✔ Heightmap written to ${outPath}`);
}

main();
