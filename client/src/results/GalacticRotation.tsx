import Decimal from 'decimal.js'

/**
 * INPUT — same shape you’re using
 */
export type GalaxyInput = {
    name: string
    mass: string       // kg (scientific ok)
    radius: string     // m  (scientific ok)
    v_obs_kms?: number // km/s
}

/**
 * OUTPUT row
 */
export type GalaxyRow = {
    name: string
    r_m: string
    mass_kg: string

    // pretty strings
    vN_ms: string
    v_model_ms: string
    v_obs_ms?: string
    kappa_minv: string
    boost_e_kappa_r: string

    // raw numeric strings (no units)
    vN_ms_num: string
    v_model_ms_num: string
    v_obs_ms_num?: string
    kappa_minv_num: string
}

export const galaxyInput: GalaxyInput[] = [
    { name: "M31 (Andromeda)", mass: "2.0e41", radius: "8.0e20", v_obs_kms: 250 },
    { name: "Milky Way", mass: "1.2e41", radius: "3.086e20", v_obs_kms: 220 },
    { name: "NGC 3198", mass: "1.0e41", radius: "9.26e20", v_obs_kms: 165 },
    { name: "NGC 2403", mass: "2.0e40", radius: "3.086e20", v_obs_kms: 135 },
    { name: "NGC 2903", mass: "6.0e40", radius: "3.703e20", v_obs_kms: 200 },
    { name: "NGC 925", mass: "6.0e40", radius: "4.63e20", v_obs_kms: 115 },
    { name: "NGC 5055 (M63)", mass: "3.0e41", radius: "8.95e20", v_obs_kms: 195 },
    { name: "NGC 7331", mass: "4.0e41", radius: "1.08e21", v_obs_kms: 240 },
    { name: "NGC 6946", mass: "1.3e41", radius: "4.32e20", v_obs_kms: 170 },
    { name: "NGC 7793", mass: "8.0e39", radius: "1.85e20", v_obs_kms: 95 },
    { name: "IC 2574", mass: "3.0e39", radius: "2.16e20", v_obs_kms: 65 },
    { name: "DDO 154", mass: "1.0e39", radius: "1.85e20", v_obs_kms: 50 },
]

// high precision but sane
Decimal.set({ precision: 40 })

const G = new Decimal('6.674e-11') // m^3 kg^-1 s^-2

// ---------- core math ----------

// v_N = sqrt(G M / r)
function newtonianVelocity(M_kg: Decimal, r_m: Decimal): Decimal {
    if (M_kg.lte(0) || r_m.lte(0)) return new Decimal(0)
    return G.mul(M_kg).div(r_m).sqrt()
}

// κ = (2/r) * ln(v_obs / vN)   (allow negative κ if v_obs < vN)
function inferKappa(vN: Decimal, r_m: Decimal, v_obs_ms?: Decimal): Decimal {
    if (!v_obs_ms || v_obs_ms.lte(0) || r_m.lte(0) || vN.lte(0)) return new Decimal(0)
    return v_obs_ms.div(vN).ln().mul(2).div(r_m)
}

// v_model = vN * exp( (κ r) / 2 )
function modeledVelocity(vN: Decimal, r_m: Decimal, kappa: Decimal): Decimal {
    return vN.mul(kappa.mul(r_m).div(2).exp())
}

// ---------- formatting helpers ----------

function fmtSci(x: Decimal, sig = 6): string {
    return x.toSignificantDigits(sig).toExponential()
}
function fmt_kms(v: Decimal, sig = 4): string {
    return v.div(1000).toSignificantDigits(sig).toString() + " km/s"
}
function kmpsToMps(kmps: number): Decimal {
    return new Decimal(kmps).mul(1000)
}

// ---------- one-liners (plain text) ----------

// v_N ≈ sqrt(6.674e-11 * M / r) ≈ … m/s ≈ … km/s
export function oneLineNewton(M_kg: string, r_m: string): string {
    const M = new Decimal(M_kg), r = new Decimal(r_m)
    const vN = newtonianVelocity(M, r)
    return `v_N ≈ sqrt(6.674e-11 * ${M_kg} / ${r_m}) ≈ ${fmtSci(vN)} m/s` // ≈ ${fmt_kms(vN)}
}

// κ ≈ (2 / r) * ln(v_obs / vN)
export function oneLineKappa(v_obs_ms_num: string, vN_ms_num: string, r_m: string): string {
    const vObs = new Decimal(v_obs_ms_num)
    const vN = new Decimal(vN_ms_num)
    const r = new Decimal(r_m)
    if (vObs.lte(0) || vN.lte(0) || r.lte(0)) return `κ ≈ (2 / ${r_m}) * ln(…) ≈ 0 m^-1`
    const kappa = vObs.div(vN).ln().mul(2).div(r)
    return `κ ≈ (2 / ${r_m}) * ln(${fmtSci(vObs)} / ${fmtSci(vN)}) ≈ ${fmtSci(kappa)} m^-1`
}

// v_model ≈ vN * exp((κ * r)/2) ≈ … m/s ≈ … km/s
export function oneLineModel(vN_ms_num: string, kappa_minv_num: string, r_m: string): string {
    const vN = new Decimal(vN_ms_num), k = new Decimal(kappa_minv_num), r = new Decimal(r_m)
    const v = modeledVelocity(vN, r, k)
    return `v_model ≈ ${fmtSci(vN)} * exp((${fmtSci(k)} * ${r_m})/2) ≈ ${fmtSci(v)} m/s` //≈ ${fmt_kms(v)}
}

// ---------- table assembly ----------

export function makeRows(inputs: GalaxyInput[]): GalaxyRow[] {
    return inputs.map((g) => {
        const r = new Decimal(g.radius)
        const M = new Decimal(g.mass)
        const vN = newtonianVelocity(M, r)

        const vObs = (g.v_obs_kms !== undefined) ? kmpsToMps(g.v_obs_kms) : undefined
        const kappa = inferKappa(vN, r, vObs)
        const vModel = modeledVelocity(vN, r, kappa)
        const boost = kappa.mul(r).exp()

        return {
            name: g.name,
            r_m: g.radius,
            mass_kg: g.mass,

            // pretty
            vN_ms: fmt_kms(vN),
            v_model_ms: fmt_kms(vModel),
            v_obs_ms: vObs ? fmt_kms(vObs) : "",
            kappa_minv: fmtSci(kappa),
            boost_e_kappa_r: fmtSci(boost),

            // raw numeric strings
            vN_ms_num: vN.toString(),
            v_model_ms_num: vModel.toString(),
            v_obs_ms_num: vObs ? vObs.toString() : undefined,
            kappa_minv_num: kappa.toString(),
        }
    })
}

// ---------- dumb table UI ----------

const tableStyle: React.CSSProperties = {
    width: '90%',
    borderCollapse: 'collapse',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    marginBottom: '64px'
}
const thtd: React.CSSProperties = { borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }
const mono: React.CSSProperties = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }
const smaller: React.CSSProperties = { fontSize: '10px', display: 'block', lineHeight: 1.25, opacity: 0.8 }

const GalacticRotation: React.FC = () => {
    const rows = makeRows(galaxyInput)
    return (
        <table style={tableStyle}>
            <thead>
                <tr>
                    <th style={thtd}>Galaxy</th>
                    <th style={thtd}><span style={mono}>radius</span> (m)</th>
                    <th style={thtd}><span style={mono}>Mass</span> (kg)</th>
                    <th style={thtd}><span style={mono}>κ</span> (m⁻¹)</th>
                    <th style={thtd}><span style={mono}>Newton predicts</span> (m/s)</th>
                    <th style={thtd}><span style={mono}>v_model</span> (m/s)</th>
                    <th style={thtd}><span style={mono}>v_obs</span> (m/s)</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((r, i) => i !== 0 && (
                    <tr key={i}>
                        <td style={thtd}>{r.name}</td>
                        <td style={{ ...thtd, ...mono }}>{r.r_m}</td>
                        <td style={{ ...thtd, ...mono }}>{r.mass_kg}</td>
                        <td style={{ ...thtd, ...mono }}>
                            {r.kappa_minv}
                            <span style={{ ...smaller, ...mono }}>
                                {oneLineKappa(r.v_obs_ms_num!, r.vN_ms_num, r.r_m)}
                            </span>
                        </td>
                        <td style={{ ...thtd, ...mono }}>
                            {r.vN_ms === r.v_obs_ms ? '✅' : '🛑'} {r.vN_ms}
                            <span style={{ ...smaller, ...mono }}>
                                {oneLineNewton(r.mass_kg, r.r_m)}
                            </span>
                        </td>
                        <td style={{ ...thtd, ...mono }}>
                            {r.v_model_ms === r.v_obs_ms ? '✅' : '🛑'} {r.v_model_ms}
                            {r.v_obs_ms && (
                                <span style={{ ...smaller, ...mono }}>
                                    {oneLineModel(r.vN_ms_num, r.kappa_minv_num, r.r_m)}
                                </span>
                            )}
                        </td>
                        <td style={{ ...thtd, ...mono }}>{r.v_obs_ms ?? '—'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default GalacticRotation
