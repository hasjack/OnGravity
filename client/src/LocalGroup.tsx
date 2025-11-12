import { useRef, useEffect, useState } from "react"

// --- quick units ---
// masses in 1e10 Msun; positions in kpc; G in (kpc·(km/s)^2)/Msun, but we only need relative basin,
// so we fold constants into a single scale factor 'Gscale' for visuals.
const Gscale = 1.0 // visual scale; tweak if you want steeper/shallower wells

type Body = {
    name: string
    M_1e10Msun: number
    x_kpc: number
    y_kpc: number
    color?: string
}

// Very reasonable starter set (edit freely)
const localGroup: Body[] = [
    // Milky Way at origin
    { name: "Milky Way", M_1e10Msun: 100, x_kpc: 0, y_kpc: 0, color: "#88d" },   // ~1e12 Msun
    { name: "LMC", M_1e10Msun: 10, x_kpc: -50, y_kpc: -30, color: "#9af" },   // ~1e11
    { name: "SMC", M_1e10Msun: 7, x_kpc: -62, y_kpc: -45, color: "#aef" },

    // Andromeda system ~780 kpc away (direction arbitrary here)
    { name: "M31", M_1e10Msun: 150, x_kpc: 780, y_kpc: 0, color: "#d88" },        // ~1.5e12
    { name: "M110", M_1e10Msun: 5, x_kpc: 795, y_kpc: 15, color: "#f9a" },
    { name: "M32", M_1e10Msun: 5, x_kpc: 770, y_kpc: -12, color: "#f9a" },

    // Triangulum near M31 (very rough)
    { name: "M33", M_1e10Msun: 50, x_kpc: 840, y_kpc: 200, color: "#8d8" },        // ~5e11

    // A couple of dwarfs for texture
    { name: "NGC 6822", M_1e10Msun: 3, x_kpc: -500, y_kpc: 280, color: "#bbb" },
    { name: "IC 1613", M_1e10Msun: 2, x_kpc: 520, y_kpc: -260, color: "#bbb" },
]

// safer exp so the map doesn’t blow out at large r
const safeExp = (x: number) => Math.exp(Math.max(-6, Math.min(6, x))) // clamp exponent ∈ [-6, 6]

function LocalGroup() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // UI
    const [spanKpc, setSpanKpc] = useState(1100) // half-span of the square domain (kpc)
    const [grid, setGrid] = useState(512)        // pixels
    const [kappaPerKpc, setKappaPerKpc] = useState(0.008) // κ in 1/kpc (feel free to start at ~0.005–0.02)
    const [showContours, setShowContours] = useState(true)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = grid
        canvas.height = grid
        const ctx = canvas.getContext("2d", { willReadFrequently: true })
        if (!ctx) return

        // Map pixel -> kpc in [-span, +span]
        const W = canvas.width, H = canvas.height
        const pxToKpc = (px: number) => (px / W) * (2 * spanKpc) - spanKpc

        // Compute potential field
        const image = ctx.createImageData(W, H)
        let minPhi = Infinity, maxPhi = -Infinity
        const phiField = new Float32Array(W * H)

        for (let y = 0; y < H; y++) {
            const Y = pxToKpc(y) // square so same mapping
            for (let x = 0; x < W; x++) {
                const X = pxToKpc(x)
                let phi = 0
                for (const b of localGroup) {
                    const dx = X - b.x_kpc
                    const dy = Y - b.y_kpc
                    const d = Math.hypot(dx, dy) || 0.1 // soft-core avoid 0
                    // Φ_i ~ -(G M / d) * exp(κ d)
                    phi += -Gscale * (b.M_1e10Msun / d) * safeExp(kappaPerKpc * d)
                }
                const idx = y * W + x
                phiField[idx] = phi
                if (phi < minPhi) minPhi = phi
                if (phi > maxPhi) maxPhi = phi
            }
        }

        // Color map (soft night-sky glow)
        const range = maxPhi - minPhi || 1
        for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
                const idx = y * W + x
                const v = (phiField[idx] - minPhi) / range // 0..1
                // invert so deeper wells are brighter
                const t = 1 - v
                // subtle blue-white ramp
                const r = Math.floor(20 + 160 * t)
                const g = Math.floor(30 + 170 * t)
                const b = Math.floor(200 * t + 30)
                const a = 255
                const p = idx * 4
                image.data[p + 0] = r
                image.data[p + 1] = g
                image.data[p + 2] = b
                image.data[p + 3] = a
            }
        }
        ctx.putImageData(image, 0, 0)

        // Optional contours (equipotentials)
        if (showContours) {
            ctx.strokeStyle = "rgba(255,255,255,0.25)"
            ctx.lineWidth = 1
            const levels = 8
            for (let L = 1; L <= levels; L++) {
                const iso = minPhi + (range * L) / (levels + 1)
                marchSquares(ctx, phiField, W, H, iso)
            }
        }

        // Labels for bodies
        ctx.save()
        ctx.font = "12px ui-monospace, Menlo, monospace"
        ctx.fillStyle = "rgba(255,255,255,0.9)"
        ctx.textAlign = "center"
        for (const b of localGroup) {
            const px = Math.round(((b.x_kpc + spanKpc) / (2 * spanKpc)) * W)
            const py = Math.round(((b.y_kpc + spanKpc) / (2 * spanKpc)) * H)
            // small glow dot
            ctx.beginPath()
            ctx.fillStyle = b.color ?? "#fff"
            ctx.arc(px, py, 3, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = "rgba(255,255,255,0.9)"
            ctx.fillText(b.name, px, py - 8)
        }
        ctx.restore()
    }, [grid, spanKpc, kappaPerKpc, showContours])

    return (
        <div style={{ display: "flex", gap: 24 }}>
            <div style={{ width: 420, fontFamily: "ui-monospace, Menlo, monospace", fontSize: "12px", lineHeight: "20px" }}>
                <div>grid (px)
                    <input type="number" value={grid} min={256} max={1024} step={64}
                        onChange={e => setGrid(parseInt(e.target.value || "512"))}
                        style={{ width: 80, marginLeft: 8 }} />
                </div>

                <div style={{ marginTop: 8 }}>half-span (kpc)
                    <input type="number" value={spanKpc} min={400} max={2000} step={50}
                        onChange={e => setSpanKpc(parseInt(e.target.value || "1100"))}
                        style={{ width: 100, marginLeft: 8 }} />
                </div>

                <div style={{ marginTop: 8 }}>κ (per kpc)
                    <input type="number" value={kappaPerKpc} step={0.001} min={0} max={0.05}
                        onChange={e => setKappaPerKpc(parseFloat(e.target.value || "0.008"))}
                        style={{ width: 100, marginLeft: 8 }} />
                    <div style={{ opacity: 0.7, marginTop: 4 }}>
                        (≈ {(kappaPerKpc / 3.086e-2).toExponential(2)} m⁻¹)
                    </div>
                </div>

                <label style={{ display: "block", marginTop: 10 }}>
                    <input type="checkbox" checked={showContours}
                        onChange={e => setShowContours(e.target.checked)} /> show equipotentials
                </label>

                <div style={{ marginTop: 12, opacity: 0.8, lineHeight: '20px', fontSize: '12px' }}>
                    Try κ ≈ 0.005–0.02/kpc<br/>
                    1000–1200 kpc shows full MW–M31 bridge.
                </div>
            </div>

            <canvas ref={canvasRef}
                style={{
                    width: 580, height: 580, imageRendering: "pixelated",
                    background: "#0b0f16", borderRadius: 14,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.35)"
                }} />
        </div>
    )
}

/** Minimal marching-squares to draw one iso-level over a scalar field */
function marchSquares(
    ctx: CanvasRenderingContext2D,
    field: Float32Array,
    W: number,
    H: number,
    iso: number
) {
    const idx = (x: number, y: number) => y * W + x
    ctx.beginPath()
    // step every 2 px for speed; tighten to 1 for finer lines
    for (let y = 0; y < H - 1; y += 2) {
        for (let x = 0; x < W - 1; x += 2) {
            const a = field[idx(x, y)] > iso ? 1 : 0
            const b = field[idx(x + 1, y)] > iso ? 1 : 0
            const c = field[idx(x + 1, y + 1)] > iso ? 1 : 0
            const d = field[idx(x, y + 1)] > iso ? 1 : 0
            const state = (a << 3) | (b << 2) | (c << 1) | d
            // draw small segments for the common cases (ambiguous cases ignored for speed)
            const fx = (t: number) => x + t
            const fy = (t: number) => y + t
            const mid = 1
            switch (state) {
                case 1: case 14:
                    ctx.moveTo(x, fy(mid)); ctx.lineTo(fx(mid), y + 1); break
                case 2: case 13:
                    ctx.moveTo(fx(mid), y + 1); ctx.lineTo(x + 1, fy(mid)); break
                case 4: case 11:
                    ctx.moveTo(fx(mid), y); ctx.lineTo(x + 1, fy(mid)); break
                case 8: case 7:
                    ctx.moveTo(x, fy(mid)); ctx.lineTo(fx(mid), y); break
                case 3: case 12:
                    ctx.moveTo(x, fy(mid)); ctx.lineTo(x + 1, fy(mid)); break
                case 6: case 9:
                    ctx.moveTo(fx(mid), y); ctx.lineTo(fx(mid), y + 1); break
            }
        }
    }
    ctx.stroke()
}

export default LocalGroup
