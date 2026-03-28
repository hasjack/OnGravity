import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * BulletClusterLensMap.tsx
 * - Visual lensing "well" with a pre→post collision slider (t ∈ [0,1]).
 * - Smooth mono rendering on a <canvas>, no heavy libs, row-chunked to keep the UI responsive.
 * - Core model:
 *     Phi(r) = -(G M / R) * exp( clamp( κ_eff * R, -18, +18 ) )
 *     κ_eff = κ_base(R) + w(t) * κ_coll(x,y)
 *     κ_base(R) = k0 * (ρ/ρ0)^a * (r0 / max(R, ε))^b   for R > r_impact; else exponent term off (b=0)
 *     κ_coll ~ kv * (dv_rel/1e-12)^3 * (ρ/ρ0)^0.5 * exp(-d_⊥^2 / (2σ^2)) * H(t)
 *
 * - Shows α_model(b) = (4GM)/(c^2 b) * exp( κ_eff(b) * b / 2 ) at a marker b.
 */

const G = 6.674e-11          // m^3 kg^-1 s^-2
const C = 2.99792458e8       // m s^-1
const KPC = 3.085677581491367e19 // meters
const ARCSEC_PER_RAD = 206264.80624709636

function clamp(x: number, lo: number, hi: number) {
    return Math.min(hi, Math.max(lo, x))
}

/** Nice smoothstep for the collision envelope with a little overshoot option if wanted */
function smooth01(t: number) {
    // classic smootherstep (C2)
    return t <= 0 ? 0 : t >= 1 ? 1 : t * t * t * (t * (6 * t - 15) + 10)
}

type Params = {
    // mass & environment
    M_kg: number
    rho: number
    rho0: number
    // base kappa
    k0: number
    a: number
    r0_kpc: number
    b_exp: number
    rImpact_kpc: number

    // collision "ridge"
    kv: number             // m^-1 (amplitude scale)
    dv_rel_sinv: number    // s^-1
    sigma_kpc: number      // Gaussian width across the ridge
    center2x_kpc: number   // second clump center x
    center2y_kpc: number   // second clump center y

    // layout
    halfSpan_kpc: number
    gridN: number
    marker_b_kpc: number

    // slider in [0,1]
    t: number
}

const defaultParams: Params = {
    M_kg: 9.935e44,        // ~5e14 Msun
    rho: 1.0e9,
    rho0: 1600,
    k0: 7e-21,
    a: 0.5,
    r0_kpc: 100,
    b_exp: 2.0,
    rImpact_kpc: 20,

    kv: 5e-26,
    dv_rel_sinv: 3e-12,     // corresponds to ~3000 km/s / Mpc; unit heuristic
    sigma_kpc: 250,
    center2x_kpc: -200,
    center2y_kpc: 0,

    halfSpan_kpc: 1000,
    gridN: 512,
    marker_b_kpc: 250,

    t: 0,
}

export default function BulletClusterLensMap() {
    const [p, setP] = useState<Params>(defaultParams)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // derived constants in meters
    const r0_m = useMemo(() => p.r0_kpc * KPC, [p.r0_kpc])
    const rImpact_m = useMemo(() => p.rImpact_kpc * KPC, [p.rImpact_kpc])
    const sigma_m = useMemo(() => p.sigma_kpc * KPC, [p.sigma_kpc])
    const halfSpan_m = useMemo(() => p.halfSpan_kpc * KPC, [p.halfSpan_kpc])
    const marker_b_m = useMemo(() => p.marker_b_kpc * KPC, [p.marker_b_kpc])

    // base κ (radial) with “impact” rule
    const kappaBase = (R: number): number => {
        // epsilon to avoid 1/0
        const eps = 1e18 // ~0.03 kpc
        const Rsafe = Math.max(R, eps) // <-- FIX: use Math.max (not rImpact_m.max)
        // if inside "impact" sphere, disable the (r0/R)^b term (b→0)
        const useB = R >= rImpact_m
        const radialFactor = useB ? Math.pow(r0_m / Rsafe, p.b_exp) : 1.0
        return p.k0 * Math.pow(p.rho / p.rho0, p.a) * radialFactor
    }

    // collision κ “ridge” centered along the line to clump2, Gaussian across it
    const kappaColl = (x: number, y: number): number => {
        // direction to clump2
        const cx = p.center2x_kpc * KPC
        const cy = p.center2y_kpc * KPC
        const L = Math.hypot(cx, cy) || 1
        const nx = cx / L, ny = cy / L

        // distance perpendicular to ridge through origin along (nx,ny)
        const dPerp = x * (-ny) + y * (nx)

        // amplitude ~ kv * (dv_rel/1e-12)^3 * (rho/rho0)^0.5
        const amp = p.kv * Math.pow(p.dv_rel_sinv / 1e-12, 3) * Math.sqrt(p.rho / p.rho0)
        const gauss = Math.exp(- (dPerp * dPerp) / (2 * sigma_m * sigma_m))
        return amp * gauss
    }

    // lensing angle at marker b
    const alphaModelArcsec = useMemo(() => {
        const b = marker_b_m
        const alphaGR = (4 * G * p.M_kg) / (C * C * b) // radians
        const kEff = kappaBase(b) + smooth01(p.t) * kappaColl(b, 0)
        const boost = Math.exp(clamp((kEff * b) / 2, -18, 18))
        return alphaGR * boost * ARCSEC_PER_RAD
    }, [p, marker_b_m])

    // draw
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const N = p.gridN
        canvas.width = N
        canvas.height = N

        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return
        const img = ctx.createImageData(N, N)
        const data = img.data

        const hs = halfSpan_m
        const step = (2 * hs) / (N - 1)

        // For normalization
        let minPhi = Infinity
        let maxPhi = -Infinity

        // First pass to find range
        for (let j = 0; j < N; j++) {
            const y = -hs + j * step
            for (let i = 0; i < N; i++) {
                const x = -hs + i * step
                const R = Math.hypot(x, y) || 1
                const kEff = kappaBase(R) + smooth01(p.t) * kappaColl(x, y)
                const boost = Math.exp(clamp(kEff * R, -18, 18))
                const phi = -(G * p.M_kg) / R * boost
                if (phi < minPhi) minPhi = phi
                if (phi > maxPhi) maxPhi = phi
            }
        }

        const range = maxPhi - minPhi || 1

        // Second pass to color
        let k = 0
        for (let j = 0; j < N; j++) {
            const y = -hs + j * step
            for (let i = 0; i < N; i++) {
                const x = -hs + i * step
                const R = Math.hypot(x, y) || 1
                const kEff = kappaBase(R) + smooth01(p.t) * kappaColl(x, y)
                const boost = Math.exp(clamp(kEff * R, -18, 18))
                const phi = -(G * p.M_kg) / R * boost

                // map to [0,1] (deeper = darker)
                const t = (phi - minPhi) / range
                const g = Math.round(255 * (1 - t * 0.92)) // keep highlights

                data[k++] = g
                data[k++] = g
                data[k++] = g
                data[k++] = 255
            }
        }

        ctx.putImageData(img, 0, 0)

        // crosshair + marker
        ctx.strokeStyle = 'rgba(240,200,60,0.25)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(N / 2, 0)
        ctx.lineTo(N / 2, N)
        ctx.moveTo(0, N / 2)
        ctx.lineTo(N, N / 2)
        ctx.stroke()

        // marker at +x (b)
        const pxPerM = (N - 1) / (2 * hs)
        const mx = N / 2 + marker_b_m * pxPerM
        const my = N / 2
        ctx.fillStyle = 'rgba(30,30,30,0.9)'
        ctx.beginPath()
        ctx.arc(mx, my, 3, 0, Math.PI * 2)
        ctx.fill()
    }, [p, halfSpan_m, marker_b_m])

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px', alignItems: 'start' }}>
            <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 12 }}>
                <h4 style={{ margin: '6px 0' }}>Bullet Cluster — Lensing Potential</h4>

                <label>time t (pre→post)
                    <input
                        type="range" min={0} max={1} step={0.01}
                        value={p.t}
                        onChange={e => setP(s => ({ ...s, t: Number(e.target.value) }))}
                        style={{ width: '100%' }}
                    />
                </label>

                <div style={{ height: 6 }} />

                <label>grid (px)
                    <input type="number" value={p.gridN}
                        onChange={e => setP(s => ({ ...s, gridN: clamp(Number(e.target.value) || 384, 192, 1024) }))}
                        style={{ width: 96, marginLeft: 8 }} />
                </label>
                <label style={{ marginLeft: 12 }}>half-span (kpc)
                    <input type="number" value={p.halfSpan_kpc}
                        onChange={e => setP(s => ({ ...s, halfSpan_kpc: Number(e.target.value) || 600 }))}
                        style={{ width: 96, marginLeft: 8 }} />
                </label>

                <div style={{ height: 8, borderBottom: '1px solid #eee', margin: '8px 0' }} />

                <label>M (kg)
                    <input type="number" value={p.M_kg}
                        onChange={e => setP(s => ({ ...s, M_kg: Number(e.target.value) || 1 }))}
                        style={{ width: 160, marginLeft: 8 }} />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
                    <label>k₀ (1/m)
                        <input type="number" value={p.k0}
                            onChange={e => setP(s => ({ ...s, k0: Number(e.target.value) || 0 }))} />
                    </label>
                    <label>a
                        <input type="number" step="0.1" value={p.a}
                            onChange={e => setP(s => ({ ...s, a: Number(e.target.value) }))} />
                    </label>
                    <label>ρ (kg/m³)
                        <input type="number" value={p.rho}
                            onChange={e => setP(s => ({ ...s, rho: Number(e.target.value) || 1 }))} />
                    </label>
                    <label>ρ₀ (kg/m³)
                        <input type="number" value={p.rho0}
                            onChange={e => setP(s => ({ ...s, rho0: Number(e.target.value) || 1 }))} />
                    </label>
                    <label>r₀ (kpc)
                        <input type="number" value={p.r0_kpc}
                            onChange={e => setP(s => ({ ...s, r0_kpc: Number(e.target.value) || 1 }))} />
                    </label>
                    <label>b (exp)
                        <input type="number" step="0.1" value={p.b_exp}
                            onChange={e => setP(s => ({ ...s, b_exp: Number(e.target.value) }))} />
                    </label>
                    <label>r impact (kpc)
                        <input type="number" value={p.rImpact_kpc}
                            onChange={e => setP(s => ({ ...s, rImpact_kpc: Number(e.target.value) || 0 }))} />
                    </label>
                    <label>b marker (kpc)
                        <input type="number" value={p.marker_b_kpc}
                            onChange={e => setP(s => ({ ...s, marker_b_kpc: Number(e.target.value) || 1 }))} />
                    </label>
                </div>

                <div style={{ height: 8, borderBottom: '1px solid #eee', margin: '8px 0' }} />

                <details>
                    <summary>collision ridge</summary>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
                        <label>kᵥ (1/m)
                            <input type="number" value={p.kv}
                                onChange={e => setP(s => ({ ...s, kv: Number(e.target.value) || 0 }))} />
                        </label>
                        <label>Δv_rel (s⁻¹)
                            <input type="number" value={p.dv_rel_sinv}
                                onChange={e => setP(s => ({ ...s, dv_rel_sinv: Number(e.target.value) || 0 }))} />
                        </label>
                        <label>σ (kpc)
                            <input type="number" value={p.sigma_kpc}
                                onChange={e => setP(s => ({ ...s, sigma_kpc: Number(e.target.value) || 1 }))} />
                        </label>
                        <label>clump2 x (kpc)
                            <input type="number" value={p.center2x_kpc}
                                onChange={e => setP(s => ({ ...s, center2x_kpc: Number(e.target.value) || 0 }))} />
                        </label>
                        <label>clump2 y (kpc)
                            <input type="number" value={p.center2y_kpc}
                                onChange={e => setP(s => ({ ...s, center2y_kpc: Number(e.target.value) || 0 }))} />
                        </label>
                    </div>
                </details>

                <div style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>
                    {`marker b = ${p.marker_b_kpc} kpc
α_model ≈ ${alphaModelArcsec.toFixed(3)}″
Tip: if perf dips, use grid 384 and half-span 600–800 kpc.`}
                </div>
            </div>

            <div style={{
                position: 'relative', background: 'radial-gradient(100% 100% at 50% 50%, #fff, #f7f7f7)',
                borderRadius: 12, boxShadow: '0 6px 30px rgba(0,0,0,.08)', padding: 16
            }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }} />
            </div>
        </div>
    )
}
