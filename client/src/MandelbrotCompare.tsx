import React, { useRef, useEffect, useState } from "react"

const WIDTH = 480
const HEIGHT = 360

// Basic color helper for smooth-ish coloring
function colorFromIter(iter: number, maxIter: number): [number, number, number] {
    if (iter >= maxIter) {
        return [5, 10, 30] // inside set = dark navy
    }
    const t = iter / maxIter
    // simple gradient: deep blue → cyan → white
    const r = Math.floor(40 + 200 * t)
    const g = Math.floor(80 + 150 * t)
    const b = Math.floor(160 + 80 * t)
    return [r, g, b]
}

const NaturalMandelbrotCompare: React.FC = () => {
    const classicalRef = useRef<HTMLCanvasElement | null>(null)
    const naturalRef = useRef<HTMLCanvasElement | null>(null)

    const [maxIter, setMaxIter] = useState(150)
    const [kappa, setKappa] = useState(0.9)
    const [zoom, setZoom] = useState(1) // 1 = default view of classical set

    // --- draw classical Mandelbrot (complex plane) ---
    useEffect(() => {
        const canvas = classicalRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = WIDTH
        canvas.height = HEIGHT

        const img = ctx.createImageData(WIDTH, HEIGHT)
        const data = img.data

        // classical Mandelbrot window (centered on -0.75, 0)
        const scale = 1 / zoom
        const reMin = -2.5 * scale - 0.75
        const reMax = 1.0 * scale - 0.75
        const imMin = -1.5 * scale
        const imMax = 1.5 * scale

        for (let py = 0; py < HEIGHT; py++) {
            const im = imMin + (py / HEIGHT) * (imMax - imMin)
            for (let px = 0; px < WIDTH; px++) {
                const re = reMin + (px / WIDTH) * (reMax - reMin)

                let zr = 0
                let zi = 0
                let iter = 0

                while (zr * zr + zi * zi <= 4 && iter < maxIter) {
                    // z -> z^2 + c
                    const zr2 = zr * zr - zi * zi + re
                    const zi2 = 2 * zr * zi + im
                    zr = zr2
                    zi = zi2
                    iter++
                }

                const [r, g, b] = colorFromIter(iter, maxIter)
                const idx = 4 * (py * WIDTH + px)
                data[idx] = r
                data[idx + 1] = g
                data[idx + 2] = b
                data[idx + 3] = 255
            }
        }

        ctx.putImageData(img, 0, 0)
    }, [maxIter, zoom])

    // --- draw Natural-Maths Mandelbrot (1D curvature map) ---
    useEffect(() => {
        const canvas = naturalRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = WIDTH
        canvas.height = HEIGHT

        const img = ctx.createImageData(WIDTH, HEIGHT)
        const data = img.data

        // x-axis = real c parameter
        // y-axis = initial curvature bias b = x0
        // pick a range that roughly matches your screenshot feel
        const cMin = -3.0
        const cMax = 3.0
        const bMin = -3.0
        const bMax = 3.0

        const escapeRadius = 8

        for (let py = 0; py < HEIGHT; py++) {
            const b0 = bMin + (py / HEIGHT) * (bMax - bMin) // starting x
            for (let px = 0; px < WIDTH; px++) {
                const c = cMin + (px / WIDTH) * (cMax - cMin)

                let x = b0
                let iter = 0

                while (iter < maxIter) {
                    // curvature-flip sign: σ_n = sign(sin(κ x_n))
                    const s = Math.sin(kappa * x)
                    const sigma = s >= 0 ? 1 : -1

                    x = sigma * x * x + c
                    iter++

                    if (Math.abs(x) > escapeRadius) break
                }

                const [r, g, b] = colorFromIter(iter, maxIter)
                const idx = 4 * (py * WIDTH + px)
                data[idx] = r
                data[idx + 1] = g
                data[idx + 2] = b
                data[idx + 3] = 255
            }
        }

        ctx.putImageData(img, 0, 0)
    }, [maxIter, kappa])

    return (
        <div
            style={{
                background: "#050510",
                color: "#eee",
                minHeight: "100vh",
                padding: "12px 12px 24px",
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
        >
            {/* controls */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    padding: "8px 12px",
                    background: "#111827",
                    borderRadius: 8,
                    marginBottom: 12,
                }}
            >
                <strong>Natural Mandelbrot • complex vs κ-curvature</strong>

                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    maxIter:
                    <input
                        type="range"
                        min={30}
                        max={400}
                        step={10}
                        value={maxIter}
                        onChange={(e) => setMaxIter(Number(e.target.value))}
                    />
                    <span style={{ width: 40, textAlign: "right" }}>{maxIter}</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    κ (curvature flip):
                    <input
                        type="range"
                        min={0}
                        max={2}
                        step={0.01}
                        value={kappa}
                        onChange={(e) => setKappa(Number(e.target.value))}
                    />
                    <span style={{ width: 40, textAlign: "right" }}>
                        {kappa.toFixed(2)}
                    </span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    zoom (classical):
                    <input
                        type="range"
                        min={0.5}
                        max={6}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                    />
                    <span style={{ width: 40, textAlign: "right" }}>
                        {zoom.toFixed(1)}×
                    </span>
                </label>
            </div>

            {/* canvases */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                }}
            >
                <div
                    style={{
                        background: "#020617",
                        borderRadius: 8,
                        padding: 8,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div style={{ marginBottom: 4, fontSize: 13, opacity: 0.8 }}>
                        Classical Mandelbrot (ℂ) • zₙ₊₁ = zₙ² + c
                    </div>
                    <canvas
                        ref={classicalRef}
                        style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: 6,
                            display: "block",
                            background: "black",
                        }}
                    />
                </div>

                <div
                    style={{
                        background: "#020617",
                        borderRadius: 8,
                        padding: 8,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div style={{ marginBottom: 4, fontSize: 13, opacity: 0.8 }}>
                        Natural-Maths Mandelbrot • xₙ₊₁ = σₙ xₙ² + c, σₙ = sign(sin κxₙ)
                        <br />
                        x-axis: real c &nbsp;•&nbsp; y-axis: initial curvature bias b = x₀
                    </div>
                    <canvas
                        ref={naturalRef}
                        style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: 6,
                            display: "block",
                            background: "black",
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default NaturalMandelbrotCompare
