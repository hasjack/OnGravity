// client/src/components/PPNPanel.tsx
import React, { useMemo, useState } from 'react'
import { BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

const G = 6.674e-11 // m^3 kg^-1 s^-2
const c = 2.99792458e8 // m s^-1

function sci(n: number, digits = 3): string {
    if (!isFinite(n) || n === 0) return String(n)
    const e = Math.floor(Math.log10(Math.abs(n)))
    const mant = n / Math.pow(10, e)
    return mant.toFixed(digits) + 'e' + e
}

export default function PPNPanel(): JSX.Element {
    // Defaults: Sun mass, Mercury distance, Λ-consistent kappa0 ~ 2.6e-26 m^-1
    const [mMant, setMMant] = useState<number>(1.989)
    const [mExp, setMExp] = useState<number>(30)
    const [rMant, setRMant] = useState<number>(5.79)
    const [rExp, setRExp] = useState<number>(10)
    const [kMant, setKMant] = useState<number>(2.6) // ×10^{-26}
    const kScaleExp = -26

    const M = useMemo(() => mMant * Math.pow(10, mExp), [mMant, mExp])
    const r = useMemo(() => rMant * Math.pow(10, rExp), [rMant, rExp])
    const k0 = useMemo(() => kMant * Math.pow(10, kScaleExp), [kMant])

    // U = GM/(c^2 r)
    const U = useMemo(() => (G * M) / (c * c * r), [M, r])

    // 1PN expansions (to O(U^2); add linear k0 r term)
    const gttGR = useMemo(() => -(1 - 2 * U + 2 * U * U), [U])
    const gttK = useMemo(() => -(1 - 2 * U + 2 * U * U + k0 * r), [U, k0, r])

    const delta = useMemo(() => gttK - gttGR, [gttGR, gttK]) // ≈ -(k0 r)
    const lambdaEff = useMemo(() => (k0 * c * c) / 3, [k0])

    return (
        <section style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 6px 24px rgba(0,0,0,0.08)' }}>
            <h2 style={{ marginTop: 0 }}>PPN Checker</h2>
            <p style={{ marginTop: 0 }}>
                Local limit recovers GR with γ = β = 1; large-scale term κ₀r yields Λ<sub>eff</sub> = κ₀c²/3.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 12 }}>
                <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Mass M [kg]</div>
                    <label style={{ display: 'block', fontSize: 12 }}>Mantissa</label>
                    <input
                        type="number"
                        step="0.001"
                        min={0.1}
                        max={9.999}
                        value={mMant}
                        onChange={(e) => setMMant(Number(e.target.value))}
                        style={{ width: '100%' }}
                    />
                    <label style={{ display: 'block', fontSize: 12, marginTop: 8 }}>Exponent</label>
                    <input
                        type="range"
                        min={22}
                        max={42}
                        value={mExp}
                        onChange={(e) => setMExp(Number(e.target.value))}
                        style={{ width: '100%' }}
                    />
                    <div style={{ fontSize: 12, opacity: 0.7 }}>M = {mMant} × 10^{mExp} = {sci(M)}</div>
                </div>

                <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Radius r [m]</div>
                    <label style={{ display: 'block', fontSize: 12 }}>Mantissa</label>
                    <input
                        type="number"
                        step="0.001"
                        min={0.1}
                        max={9.999}
                        value={rMant}
                        onChange={(e) => setRMant(Number(e.target.value))}
                        style={{ width: '100%' }}
                    />
                    <label style={{ display: 'block', fontSize: 12, marginTop: 8 }}>Exponent</label>
                    <input
                        type="range"
                        min={6}
                        max={22}
                        value={rExp}
                        onChange={(e) => setRExp(Number(e.target.value))}
                        style={{ width: '100%' }}
                    />
                    <div style={{ fontSize: 12, opacity: 0.7 }}>r = {rMant} × 10^{rExp} = {sci(r)}</div>
                </div>

                <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Background κ₀ [m⁻¹]</div>
                    <label style={{ display: 'block', fontSize: 12 }}>Mantissa × 10^k</label>
                    <input
                        type="range"
                        min={0}
                        max={6}
                        step={0.1}
                        value={kMant}
                        onChange={(e) => setKMant(Number(e.target.value))}
                        style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.7 }}>
                        <span>0</span><span>6</span>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                        κ₀ = {kMant.toFixed(1)} × 10^{kScaleExp} = {sci(k0)}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                    <BlockMath math={'U = \\\\dfrac{GM}{c^2 r}'} />
                    <div>U ≈ <b>{U.toExponential(3)}</b></div>
                    <BlockMath math={'g_{tt}^{\\\\rm GR} = -\\\\big(1 - 2U + 2U^2\\\\big)'} />
                    <div>g<sub>tt</sub><sup>GR</sup> ≈ <b>{gttGR.toPrecision(6)}</b></div>
                    <BlockMath math={'g_{tt}^{(\\\\kappa)} = -\\\\big(1 - 2U + 2U^2 + \\\\kappa_0 r\\\\big)'} />
                    <div>g<sub>tt</sub><sup>(κ)</sup> ≈ <b>{gttK.toPrecision(6)}</b></div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                        Δ = g<sub>tt</sub><sup>(κ)</sup> − g<sub>tt</sub><sup>GR</sup> ≈ {delta.toExponential(3)} (≈ −κ₀r)
                    </div>
                </div>

                <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                    <BlockMath math={'\\\\gamma = 1,\\\\quad \\\\beta = 1'} />
                    <BlockMath math={'\\\\Lambda_{\\\\rm eff} = \\\\dfrac{\\\\kappa_0 c^2}{3}'} />
                    <div>Λ<sub>eff</sub> ≈ <b>{sci(lambdaEff)}</b> m⁻²</div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
                        Solar-System: κ₀r ≪ 1 → GR indistinguishable. Large-scale: κ₀r ≳ 10⁻³ → mild acceleration emerges.
                    </div>
                </div>
            </div>
        </section>
    )
}
