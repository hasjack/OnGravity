import React, { useEffect, useRef, useState } from "react"

type RenderConfig = {
    width: number
    height: number
    maxIter: number
    kappa: number
    cMin: number
    cMax: number
}

const defaultConfig: RenderConfig = {
    width: 600,
    height: 360,
    maxIter: 120,
    kappa: 0.382,
    cMin: -2.5,
    cMax: 1.0,
}

const NaturalMandelbrot: React.FC = () => {
    const naturalCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const classicalCanvasRef = useRef<HTMLCanvasElement | null>(null) // NEW
    const [config, setConfig] = useState<RenderConfig>(defaultConfig)
    const [isRendering, setIsRendering] = useState(false)

    // Simple palette: map iteration count to a soft blue/orange
    const makeColor = (iter: number, maxIter: number): [number, number, number] => {
        if (iter >= maxIter) {
            // "Inside" / bounded region
            return [5, 10, 25] // dark navy
        }
        const t = iter / maxIter
        // A little nonlinear stretch for contrast
        const s = Math.sqrt(t)
        const r = Math.floor(40 + 190 * s)
        const g = Math.floor(80 + 120 * s)
        const b = Math.floor(180 + 60 * s)
        return [r, g, b]
    }

    // -----------------------------
    // Classical Mandelbrot (ℂ)
    // -----------------------------
    useEffect(() => {
        const canvas = classicalCanvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const { width, height, maxIter } = config

        canvas.width = width
        canvas.height = height

        const imageData = ctx.createImageData(width, height)
        const data = imageData.data

        // Standard window: real ∈ [-2.5, 1], imag ∈ [-1.5, 1.5]
        const reMin = -2.5
        const reMax = 1.0
        const imMin = -1.5
        const imMax = 1.5

        for (let py = 0; py < height; py++) {
            const im = imMin + (py / (height - 1)) * (imMax - imMin)

            for (let px = 0; px < width; px++) {
                const re = reMin + (px / (width - 1)) * (reMax - reMin)

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

                const [r, g, bCol] = makeColor(iter, maxIter)
                const idx = 4 * (py * width + px)
                data[idx] = r
                data[idx + 1] = g
                data[idx + 2] = bCol
                data[idx + 3] = 255
            }
        }

        ctx.putImageData(imageData, 0, 0)
    }, [config.maxIter]) // classical only depends on maxIter for now

    // ----------------------------------
    // Natural-Maths Mandelbrot (1D κ)
    // ----------------------------------
    useEffect(() => {
        const canvas = naturalCanvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const { width, height, maxIter, kappa, cMin, cMax } = config

        canvas.width = width
        canvas.height = height

        setIsRendering(true)

        const imageData = ctx.createImageData(width, height)
        const data = imageData.data

        for (let py = 0; py < height; py++) {
            // curvature bias b in [-1, 1]
            const b = 2 * (py / (height - 1)) - 1

            for (let px = 0; px < width; px++) {
                // map pixel -> parameter c on the real axis
                const c = cMin + (px / (width - 1)) * (cMax - cMin)

                // initial state
                let x = 0
                let sigma = b === 0 ? 1 : Math.sign(b)

                let iter = 0
                for (; iter < maxIter; iter++) {
                    // natural-mandelbrot step
                    const nextX = sigma * x * x + c

                    // curvature-flip rule: flip orientation when we cross a "curvature threshold"
                    const threshold = 1 + Math.abs(b) * kappa
                    if (Math.abs(nextX) > threshold) {
                        sigma = -sigma
                    }

                    x = nextX

                    // escape condition (like Mandelbrot's |z|>2)
                    if (Math.abs(x) > 2) {
                        break
                    }
                }

                const [r, g, bCol] = makeColor(iter, maxIter)
                const idx = 4 * (py * width + px)
                data[idx] = r
                data[idx + 1] = g
                data[idx + 2] = bCol
                data[idx + 3] = 255
            }
        }

        ctx.putImageData(imageData, 0, 0)
        setIsRendering(false)
    }, [config])

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                background: "#050510",
                color: "#eee",
                fontFamily: "system-ui, sans-serif",
                height: "100vh",
            }}
        >
            {/* Controls */}
            <div
                style={{
                    padding: "0.5rem 1rem",
                    background: "#111",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                    alignItems: "center",
                    fontSize: "0.85rem",
                }}
            >
                <strong>Natural Mandelbrot • classical + 1D κ-curvature version</strong>

                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    maxIter:
                    <input
                        type="range"
                        min={20}
                        max={400}
                        step={10}
                        value={config.maxIter}
                        onChange={(e) =>
                            setConfig((c) => ({
                                ...c,
                                maxIter: Number(e.target.value),
                            }))
                        }
                    />
                    <span style={{ width: 40, textAlign: "right" }}>{config.maxIter}</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    κ (curvature flip):
                    <input
                        type="range"
                        min={0}
                        max={24}
                        step={.01}
                        value={config.kappa}
                        onChange={(e) =>
                            setConfig((c) => ({
                                ...c,
                                kappa: Number(e.target.value),
                            }))
                        }
                    />
                    <span style={{ width: 40, textAlign: "right" }}>
                        {config.kappa.toFixed(3)}
                    </span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    zoom:
                    <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        onChange={(e) => {
                            const t = Number(e.target.value) / 100
                            // simple zoom into the central region (for the κ-version)
                            const span = 3.5 * Math.pow(0.4, t) // shrink as we zoom in
                            const mid = -0.75
                            setConfig((c) => ({
                                ...c,
                                cMin: mid - span / 2,
                                cMax: mid + span / 2,
                            }))
                        }}
                    />
                </label>

                <span style={{ marginLeft: "auto", opacity: 0.7 }}>
                    {isRendering ? "rendering…" : "ready"}
                </span>
            </div>

            {/* Canvases side-by-side */}
                    {/* Classical */}
                    {/* <div>
                        <div style={{ marginBottom: 4, fontSize: "0.8rem", opacity: 0.8 }}>
                            Classical Mandelbrot (ℂ) • zₙ₊₁ = zₙ² + c
                        </div>
                        <div
                            style={{
                                borderRadius: 8,
                                overflow: "hidden",
                                boxShadow: "0 0 20px rgba(0,0,0,0.6)",
                                background: "#000",
                                maxWidth: defaultConfig.width,
                            }}
                        >
                            <canvas
                                ref={classicalCanvasRef}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    height: "auto",
                                }}
                            />
                        </div>
                    </div> */}

                    {/* Natural-Maths */}
                    <div>
                        <div style={{ marginBottom: 4, fontSize: "0.8rem", opacity: 0.8 }}>
                            Natural-Maths Mandelbrot • xₙ₊₁ = σₙ xₙ² + c with κ-flip
                        </div>
                        <div
                            style={{
                                borderRadius: 8,
                                overflow: "hidden",
                                boxShadow: "0 0 20px rgba(0,0,0,0.6)",
                                background: "#000",
                            }}
                        >
                            <canvas
                                ref={naturalCanvasRef}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    height: "auto",
                                }}
                            />
                        </div>
                        <div style={{ marginTop: 8, fontSize: "0.8rem", opacity: 0.8 }}>
                            x-axis: real parameter c. y-axis: initial curvature bias b.
                            Color: escape speed under xₙ₊₁ = σₙ xₙ² + c with κ-flip.
                        </div>
                    </div>
        </div>
    )
}

export default NaturalMandelbrot
