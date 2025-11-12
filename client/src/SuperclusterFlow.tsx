import { useRef, useEffect, useState } from 'react'

type Node = {
    name: string
    // positions in Mpc in a plane relative to Local Group (choose a convention, e.g., SGX–SGY)
    x_mpc: number
    y_mpc: number
    // masses in solar masses; we convert to kg inside
    M_sun: number
    color?: string
}

// Supercluster-scale attractors (approximate, for qualitative flow):
// Positions are in Mpc in a Local-Group–centric plane (SGX–SGY-like).
// Masses are total cluster/supercluster-scale M_sun used only to weight Φ.
//
// Replace with LGD-6 coordinates when you drop them in.

const NODES: Node[] = [
  // Virgo Cluster (distance ~16–18 Mpc; M ~ few ×10^14–10^15 Msun)
  { name: 'Virgo',                x_mpc: 16.5,  y_mpc:  2.0,  M_sun: 6.0e14,  color: '#74c0fc' },

  // Hydra–Centaurus / Norma region (Laniakea core; GA vicinity, ~45–70 Mpc; 10^15 Msun scale)
  { name: 'Norma (Laniakea core)',x_mpc: -55.0, y_mpc: -8.0, M_sun: 1.2e15,  color: '#ffd43b' },
  { name: 'Hydra–Centaurus',      x_mpc: -42.0, y_mpc: 12.0, M_sun: 5.0e14,  color: '#ffe066' },

  // Perseus–Pisces filament (~70–80 Mpc; ~10^15 Msun scale when integrated)
  { name: 'Perseus–Pisces',       x_mpc:  75.0, y_mpc: 10.0, M_sun: 8.0e14,  color: '#69db7c' },

  // Coma cluster (~100 Mpc; ~10^15 Msun)
  { name: 'Coma',                 x_mpc: 100.0, y_mpc: 85.0, M_sun: 1.0e15,  color: '#91a7ff' },

  // Shapley concentration (~140–200 Mpc; multi×10^15 Msun)
  { name: 'Shapley',              x_mpc: 160.0, y_mpc: -60.0, M_sun: 4.0e15,  color: '#ff8787' },
]

const G = 6.674e-11
const M_SUN = 1.98847e30
const MPC_TO_M = 3.085677581e22

type Mode = 'flow' | 'basin'

function SuperclusterFlow({
    backgroundUrl = '', // e.g. '/img/superclusters.jpg'
}: { backgroundUrl?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // UI state
    const [mode, setMode] = useState<Mode>('flow')
    const [grid, setGrid] = useState(540)            // pixels
    const [halfSpanMpc, setHalfSpanMpc] = useState(160) // half domain size in Mpc (width≈height≈2*halfSpan)
    const [kPerMpc, setKPerMpc] = useState(0.02)     // κ per Mpc (≈ 6.48e-25 m^-1)
    const [arrowStep, setArrowStep] = useState(28)   // sampling step for arrows (px)
    const [bg, setBg] = useState<HTMLImageElement | null>(null)

    // load background if provided
    useEffect(() => {
        if (!backgroundUrl) { setBg(null); return }
        const img = new Image()
        img.onload = () => setBg(img)
        img.src = backgroundUrl
    }, [backgroundUrl])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const W = (canvas.width = grid)
        const H = (canvas.height = grid)
        const ctx = canvas.getContext('2d', { willReadFrequently: false })
        if (!ctx) return

        // world <-> screen
        const half = halfSpanMpc
        const xToPx = (xMpc: number) => Math.round((xMpc + half) * (W / (2 * half)))
        const yToPx = (yMpc: number) => Math.round((half - yMpc) * (H / (2 * half))) // y up

        // κ in 1/m
        const k_minv = kPerMpc / MPC_TO_M // (Mpc^-1) -> (m^-1)

        // preconvert node masses/positions to SI
        const nodesSI = NODES.map(n => ({
            ...n,
            M_kg: n.M_sun * M_SUN,
            x_m: n.x_mpc * MPC_TO_M,
            y_m: n.y_mpc * MPC_TO_M,
        }))

        // draw background
        if (bg) {
            ctx.drawImage(bg, 0, 0, W, H)
            // subtle dark veil so vectors pop
            ctx.fillStyle = 'rgba(10,15,20,0.35)'
            ctx.fillRect(0, 0, W, H)
        } else {
            const g = ctx.createLinearGradient(0, 0, 0, H)
            g.addColorStop(0, '#0f1419')
            g.addColorStop(1, '#0b1116')
            ctx.fillStyle = g
            ctx.fillRect(0, 0, W, H)
        }

        // basin / equipotentials
        if (mode === 'basin') {
            // shaded Φ map
            const img = ctx.createImageData(W, H)
            // quick tone map
            let minPhi = Number.POSITIVE_INFINITY
            let maxPhi = Number.NEGATIVE_INFINITY
            const phiCache = new Float32Array(W * H)

            for (let j = 0; j < H; j++) {
                // y in Mpc, meters
                const y_m = ((half - (j + 0.5) * (2 * half / H)) * MPC_TO_M)
                for (let i = 0; i < W; i++) {
                    const x_m = (((i + 0.5) * (2 * half / W) - half) * MPC_TO_M)
                    // Φ
                    let phi = 0
                    for (const n of nodesSI) {
                        const dx = x_m - n.x_m, dy = y_m - n.y_m
                        const d = Math.hypot(dx, dy) + 1e9 // softening
                        phi += - (G * n.M_kg / d) * Math.exp(k_minv * d)
                    }
                    const idx = j * W + i
                    phiCache[idx] = phi
                    if (phi < minPhi) minPhi = phi
                    if (phi > maxPhi) maxPhi = phi
                }
            }
            const inv = 1 / (maxPhi - minPhi + 1e-30)
            for (let j = 0; j < H; j++) {
                for (let i = 0; i < W; i++) {
                    const v = (phiCache[j * W + i] - minPhi) * inv // 0..1
                    const c = Math.floor(20 + 220 * (v ** 0.85))
                    const off = 4 * (j * W + i)
                    img.data[off + 0] = c
                    img.data[off + 1] = c
                    img.data[off + 2] = c + 10
                    img.data[off + 3] = 220
                }
            }
            ctx.putImageData(img, 0, 0)

            // dashed equipotentials (few levels)
            ctx.strokeStyle = 'rgba(255,255,255,0.25)'
            ctx.setLineDash([4, 6])
            for (const L of [0.2, 0.4, 0.6, 0.8]) {
                // simple marching squares lite: sample coarse grid and draw dots
                for (let j = 8; j < H; j += 8) {
                    for (let i = 8; i < W; i += 8) {
                        const v = (phiCache[j * W + i] - minPhi) * inv
                        if (Math.abs(v - L) < 0.01) {
                            ctx.beginPath()
                            ctx.moveTo(i, j)
                            ctx.lineTo(i + 0.01, j)
                            ctx.stroke()
                        }
                    }
                }
            }
            ctx.setLineDash([])
        }

        // flow vectors: v ∝ -∇Φ  (central differences on grid cells)
        if (mode === 'flow') {
            ctx.lineWidth = 1
            ctx.strokeStyle = 'rgba(240,245,255,0.85)'
            for (let y = arrowStep / 2; y < H; y += arrowStep) {
                for (let x = arrowStep / 2; x < W; x += arrowStep) {
                    // map to meters
                    const x_m = (((x) * (2 * half / W) - half) * MPC_TO_M)
                    const y_m = ((half - (y) * (2 * half / H)) * MPC_TO_M)

                    // compute grad(Φ)
                    let gx = 0, gy = 0
                    for (const n of nodesSI) {
                        const dx = x_m - n.x_m, dy = y_m - n.y_m
                        const d = Math.hypot(dx, dy) + 1e9
                        // dΦ/dd = G M (e^{κd})(κ d + 1)/d^2   with a minus sign from Φ; then chain rule onto x,y:
                        const common = G * n.M_kg * Math.exp(k_minv * d) * (k_minv * d + 1) / (d ** 3)
                        gx += common * dx
                        gy += common * dy
                    }
                    // v ∝ -∇Φ
                    let vx = -gx, vy = -gy
                    const vmag = Math.hypot(vx, vy) + 1e-30
                    const scale = (arrowStep * 0.4) / vmag
                    vx *= scale; vy *= scale

                    const x2 = x + vx
                    const y2 = y - vy

                    // arrow
                    ctx.beginPath()
                    ctx.moveTo(x, y)
                    ctx.lineTo(x2, y2)
                    ctx.stroke()

                    // head
                    const ang = Math.atan2(-(y2 - y), x2 - x)
                    const ah = 3
                    ctx.beginPath()
                    ctx.moveTo(x2, y2)
                    ctx.lineTo(x2 - ah * Math.cos(ang - Math.PI / 7), y2 + ah * Math.sin(ang - Math.PI / 7))
                    ctx.lineTo(x2 - ah * Math.cos(ang + Math.PI / 7), y2 + ah * Math.sin(ang + Math.PI / 7))
                    ctx.closePath()
                    ctx.fillStyle = 'rgba(240,245,255,0.85)'
                    ctx.fill()
                }
            }
        }

        // nodes
        for (const n of NODES) {
            const px = xToPx(n.x_mpc), py = yToPx(n.y_mpc)
            ctx.fillStyle = n.color ?? '#fff'
            ctx.beginPath()
            ctx.arc(px, py, 3, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = 'rgba(255,255,255,0.85)'
            ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
            ctx.fillText(n.name, px + 6, py - 6)
        }

        // subtle border
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'
        ctx.strokeRect(0.5, 0.5, W - 1, H - 1)
    }, [mode, grid, halfSpanMpc, kPerMpc, arrowStep, bg])

    return (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ width: 420, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', color: '#e6edf3', fontSize: "12px", lineHeight: "20px" }}>
                <div style={{ marginBottom: 8 }}>
                    <label>mode: </label>
                    <select value={mode} onChange={e => setMode(e.target.value as Mode)}>
                        <option value="flow">Flow field (−∇Φ)</option>
                        <option value="basin">Basin / Φ map</option>
                    </select>
                </div>

                <div>grid (px): <input style={{ width: 80 }} value={grid} onChange={e => setGrid(Math.max(360, Math.min(900, +e.target.value || 540)))} /></div>
                <div>half-span (Mpc): <input style={{ width: 80 }} value={halfSpanMpc} onChange={e => setHalfSpanMpc(+e.target.value || 160)} /></div>
                <div>κ (per Mpc): <input style={{ width: 80 }} value={kPerMpc} onChange={e => setKPerMpc(+e.target.value || 0.02)} /></div>
                <div>arrow step (px): <input style={{ width: 80 }} value={arrowStep} onChange={e => setArrowStep(Math.max(18, Math.min(64, +e.target.value || 28)))} /></div>

                <p style={{ opacity: 0.8, marginTop: 48 }}>
                    Φ uses the same κ factor as rotation/lensing: higher κ deepens wells over large d.<br /><br />
                    Flow arrows trace **infall** toward attractors (Laniakea core, Virgo, Shapley, etc.).<br /><br />
                    Use span ≈ **300–400 Mpc** to view the larger context; **120–200 Mpc** for Local Group + Virgo.
                </p>
            </div>

            <canvas
                ref={canvasRef}
                style={{
                    width: 580,
                    height: 580,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                }}
            />
        </div>
    )
}

export default SuperclusterFlow
