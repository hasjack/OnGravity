import React, { useMemo, useState } from 'react'
import Decimal from 'decimal.js'

Decimal.set({ precision: 40 })

// ---- constants ----
const G = new Decimal('6.674e-11') // m^3 kg^-1 s^-2

// ---- helpers ----
const kmpsToMps = (kmps: number) => new Decimal(kmps).mul(1000)
const fmtSci = (x: Decimal, sig = 6) => x.toSignificantDigits(sig).toExponential()
const fmtKmS = (x: Decimal, digits = 0) =>
    `${x.div(1e3).toDecimalPlaces(digits).toString()} km/s`

// v_N = sqrt(G M / r)
function vN_newton(M_kg: Decimal, r_m: Decimal): Decimal {
    if (M_kg.lte(0) || r_m.lte(0)) return new Decimal(0)
    return G.mul(M_kg).div(r_m).sqrt()
}

// κ = (2/r) * ln(v_obs / vN)
function kappaFrom(v_obs: Decimal, vN: Decimal, r_m: Decimal): Decimal {
    if (v_obs.lte(0) || vN.lte(0) || r_m.lte(0)) return new Decimal(0)
    return v_obs.div(vN).ln().mul(2).div(r_m)
}

// v_model = vN * exp((κ r)/2)
function vModel(vN: Decimal, kappa: Decimal, r_m: Decimal): Decimal {
    return vN.mul(kappa.mul(r_m).div(2).exp())
}

// ---- UI small bits ----
const row = { display: 'grid', gridTemplateColumns: '180px 1fr 120px', gap: 12, alignItems: 'center', margin: '8px 0' } as React.CSSProperties
const mono: React.CSSProperties = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }
const hint: React.CSSProperties = { fontSize: 12, opacity: 0.75 }

type Props = {
    // sensible defaults (Andromeda-ish)
    defaultMantissaM?: number  // mass mantissa (×10^exp)
    defaultExpM?: number       // mass exponent
    defaultMantissaR?: number  // radius mantissa (×10^exp m)
    defaultExpR?: number       // radius exponent
    defaultVobsKmps?: number   // km/s
    title?: string
}

const GalaxySliders: React.FC<Props> = ({
    defaultMantissaM = 2.0,  // 2.0 × 10^41 kg
    defaultExpM = 41,
    defaultMantissaR = 8.0,   // 8.0 × 10^20 m
    defaultExpR = 20,
    defaultVobsKmps = 250,
    title = 'Interactive rotation — adjust and watch the fit'
}) => {
    // mass = mM × 10^eM
    const [mM, setMM] = useState(defaultMantissaM)
    const [eM, setEM] = useState(defaultExpM)
    // radius = mR × 10^eR
    const [mR, setMR] = useState(defaultMantissaR)
    const [eR, setER] = useState(defaultExpR)
    // observed velocity (km/s)
    const [vObsKm, setVObsKm] = useState(defaultVobsKmps)

    // Decimal values
    const M = useMemo(() => new Decimal(mM).mul(new Decimal(10).pow(eM)), [mM, eM])
    const r = useMemo(() => new Decimal(mR).mul(new Decimal(10).pow(eR)), [mR, eR])
    const vObs = useMemo(() => kmpsToMps(vObsKm), [vObsKm])

    const vN = useMemo(() => vN_newton(M, r), [M, r])
    const kappa = useMemo(() => kappaFrom(vObs, vN, r), [vObs, vN, r])
    const vMod = useMemo(() => vModel(vN, kappa, r), [vN, kappa, r])

    // one-liners (plain text)
    const oneNewton = `v_N ≈ sqrt(6.674e-11 * ${fmtSci(M)} / ${fmtSci(r)}) ≈ ${fmtSci(vN)} m/s (${fmtKmS(vN)})`
    const oneKappa = `κ ≈ (2 / ${fmtSci(r)}) * ln(${fmtSci(vObs)} / ${fmtSci(vN)}) ≈ ${fmtSci(kappa)} m^-1`
    const oneModel = `v_model ≈ ${fmtSci(vN)} * exp((${fmtSci(kappa)} * ${fmtSci(r)})/2) ≈ ${fmtSci(vMod)} m/s (${fmtKmS(vMod)})`

    return (
        <div style={{ maxWidth: 900, margin: '24px auto', padding: 16 }}>
            <h2 style={{ marginBottom: 4 }}>{title}</h2>
            <p style={hint}>Mass & radius use a mantissa × 10^exponent so you can sweep orders of magnitude smoothly.</p>

            {/* Mass */}
            <div style={row}>
                <label>Mass mantissa</label>
                <input type="range" min={0.5} max={5.0} step={0.01} value={mM} onChange={e => setMM(parseFloat(e.target.value))} />
                <div style={mono}>{mM.toFixed(2)}</div>
            </div>
            <div style={row}>
                <label>Mass exponent (10^x)</label>
                <input type="range" min={39} max={42.5} step={0.1} value={eM} onChange={e => setEM(parseFloat(e.target.value))} />
                <div style={mono}>{eM.toFixed(1)}</div>
            </div>

            {/* Radius */}
            <div style={row}>
                <label>Radius mantissa</label>
                <input type="range" min={1.0} max={12.0} step={0.01} value={mR} onChange={e => setMR(parseFloat(e.target.value))} />
                <div style={mono}>{mR.toFixed(2)}</div>
            </div>
            <div style={row}>
                <label>Radius exponent (10^x m)</label>
                <input type="range" min={19.5} max={21.5} step={0.1} value={eR} onChange={e => setER(parseFloat(e.target.value))} />
                <div style={mono}>{eR.toFixed(1)}</div>
            </div>

            {/* Observed velocity */}
            <div style={row}>
                <label>Observed speed (km/s)</label>
                <input type="range" min={40} max={340} step={1} value={vObsKm} onChange={e => setVObsKm(parseInt(e.target.value))} />
                <div style={mono}>{vObsKm} km/s</div>
            </div>

            <hr style={{ margin: '16px 0' }} />

            {/* Results */}
            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', rowGap: 8 }}>
                <div>Mass (kg)</div>     <div style={mono}>{fmtSci(M)}</div>
                <div>Radius (m)</div>    <div style={mono}>{fmtSci(r)}</div>
                <div>v_obs</div>         <div style={mono}>{fmtKmS(vObs)}</div>
                <div>Newton v_N</div>    <div style={mono}>{fmtKmS(vN)}</div>
                <div>κ (m⁻¹)</div>       <div style={mono}>{fmtSci(kappa)}</div>
                <div>Model v</div>       <div style={mono}>{fmtKmS(vMod)}</div>
            </div>

            <div style={{ marginTop: 14 }}>
                <div style={{ ...mono, fontSize: 12, lineHeight: 1.35 }}>• {oneNewton}</div>
                <div style={{ ...mono, fontSize: 12, lineHeight: 1.35 }}>• {oneKappa}</div>
                <div style={{ ...mono, fontSize: 12, lineHeight: 1.35 }}>• {oneModel}</div>
            </div>
        </div>
    )
}

export default GalaxySliders
