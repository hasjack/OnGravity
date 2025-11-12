import Decimal from 'decimal.js'

/** ---------- types ---------- */
export type LensInput = {
    name: string
    mass_kg: string        // kg (e.g. '5.0e44')
    b_m: string            // impact parameter (m)
    alpha_obs_arcsec?: number // observed bend (arcsec), optional
    kappa_minv?: string       // κ (1/m), optional; if absent and alpha_obs exists, we infer κ
}

export type LensRow = {
    name: string
    mass_kg: string
    b_m: string
    alpha_GR_arcsec: string
    kappa_minv: string
    boost_e_kb2: string
    alpha_model_arcsec: string
    alpha_obs_arcsec?: string

    // raw numerics (no units)
    alpha_GR_rad_num: string
    alpha_model_rad_num: string
    kappa_minv_num: string
    boost_num: string
    match: boolean
    grMatch: boolean
}

/** ---------- constants / precision ---------- */
Decimal.set({ precision: 40 })
const G = new Decimal('6.674e-11')       // m^3 kg^-1 s^-2
const C = new Decimal('2.99792458e8')    // m/s
const ARCSEC_PER_RAD = new Decimal('206264.80624709636')

/** ---------- helpers ---------- */
const toArcsec = (rad: Decimal) => rad.mul(ARCSEC_PER_RAD)
const toRad = (arcsec: Decimal) => arcsec.div(ARCSEC_PER_RAD)
const fmtSci = (x: Decimal, sig = 6) => x.toSignificantDigits(sig).toExponential()
const fmtArcsec = (rad: Decimal, dp = 3) => `${toArcsec(rad).toDecimalPlaces(dp).toString()}″`

/** GR: alpha_GR = 4GM / (c^2 b)  (radians) */
function alphaGR(M_kg: Decimal, b_m: Decimal): Decimal {
    if (M_kg.lte(0) || b_m.lte(0)) return new Decimal(0)
    return new Decimal(4).mul(G).mul(M_kg).div(C.pow(2)).div(b_m)
}

/** κ inference: κ = (2/b) * ln(alpha_obs / alpha_GR) */
function inferKappaFromObs(alpha_obs_rad: Decimal | undefined, alpha_GR_rad: Decimal, b_m: Decimal): Decimal {
    if (!alpha_obs_rad || alpha_obs_rad.lte(0) || alpha_GR_rad.lte(0) || b_m.lte(0)) return new Decimal(0)
    return alpha_obs_rad.div(alpha_GR_rad).ln().mul(2).div(b_m)
}

/** model: alpha_k = alpha_GR * exp(κ b / 2) */
function alphaModel(alpha_GR_rad: Decimal, kappa_minv: Decimal, b_m: Decimal): Decimal {
    return alpha_GR_rad.mul(kappa_minv.mul(b_m).div(2).exp())
}

/** relative match helper */
function closeEnough(a: Decimal, b: Decimal, rel = 0.05): boolean {
    if (a.isZero() && b.isZero()) return true
    if (a.isZero() || b.isZero()) return false
    const r = a.sub(b).abs().div(b.abs())
    return r.lte(rel)
}

/** ---------- example data (swap in measured values as you like) ----------
 * NOTE: The masses / b / α_obs for some entries are illustrative placeholders.
 * Replace with your curated numbers when you’re ready.
 */
export const lensInput: LensInput[] = [
    {
        name: 'Abell 1689 (cluster)',
        // M200 ≈ (1.8–2.2)×10^45 kg is widely quoted; we stay conservative.
        mass_kg: '2.0e45',
        // Strong lensing Einstein radius ≈ 45″ → b ≈ θ D_l
        // With D_l ≈ 1.6 Gpc, b works out near 3×10^21 m.
        b_m: '3.0e21',
        alpha_obs_arcsec: 45
    },
    {
        name: 'Bullet Cluster 1E 0657-558',
        // Weak + strong lensing mass ≈ 1.5e45–2.5e45 kg depending on profile.
        mass_kg: '2.0e45',
        // Strong-lensing arcs give Einstein radii ~25–30″
        b_m: '4.5e21',
        alpha_obs_arcsec: 28
    },
    {
        name: 'MACS J1149.5+2223 (cluster)',
        // Mass reconstructions (Zitrin, Sharon, Oguri) ~ 1×10^45 kg at lens z ≈ 0.544
        mass_kg: '1.0e45',
        // Einstein radius ≈ 22″
        b_m: '3.6e21',
        alpha_obs_arcsec: 22
    },
    {
        name: 'SDSS J1004+4112 (quad QSO, cluster-scale lens)',
        // This is very well studied. Total lensing mass ~ few ×10^44 kg.
        mass_kg: '3.0e44',
        // Einstein radius (image separation) ≈ 14″
        b_m: '6.5e20',
        alpha_obs_arcsec: 14
    },
]


/** ---------- table builder ---------- */
export function makeLensRows(inputs: LensInput[]): LensRow[] {
    return inputs.map((L) => {
        const M = new Decimal(L.mass_kg)
        const b = new Decimal(L.b_m)

        const aGR = alphaGR(M, b) // rad
        const aObs = L.alpha_obs_arcsec !== undefined ? toRad(new Decimal(L.alpha_obs_arcsec)) : undefined
        const kIn = L.kappa_minv ? new Decimal(L.kappa_minv) : undefined
        const kappa = kIn ?? inferKappaFromObs(aObs, aGR, b)

        const aModel = alphaModel(aGR, kappa, b)
        const boost = kappa.mul(b).div(2).exp()

        const match = aObs ? closeEnough(aModel, aObs, 0.01) : false
        const grMatch = aObs ? closeEnough(aGR, aObs, 0.01) : false

        return {
            name: L.name,
            mass_kg: L.mass_kg,
            b_m: L.b_m,
            alpha_GR_arcsec: fmtArcsec(aGR, 3),
            kappa_minv: fmtSci(kappa),
            boost_e_kb2: fmtSci(boost),
            alpha_model_arcsec: fmtArcsec(aModel, 3),
            alpha_obs_arcsec: L.alpha_obs_arcsec ? `${new Decimal(L.alpha_obs_arcsec).toDecimalPlaces(3).toString()}″` : '',

            alpha_GR_rad_num: aGR.toString(),
            alpha_model_rad_num: aModel.toString(),
            kappa_minv_num: kappa.toString(),
            boost_num: boost.toString(),
            match,
            grMatch
        }
    })
}

/** ---------- super-plain table UI ---------- */
const tableStyle: React.CSSProperties = {
    width: '90%',
    borderCollapse: 'collapse',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
}
const thtd: React.CSSProperties = { borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }
const mono: React.CSSProperties = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }
const small: React.CSSProperties = { fontSize: 12, opacity: 0.85 }

const LensingTable: React.FC = () => {
    const rows = makeLensRows(lensInput)
    return (
        <table style={tableStyle}>
            <thead>
                <tr>
                    <th style={thtd}>Lens</th>
                    <th style={thtd}><span style={mono}>M</span> (kg)</th>
                    <th style={thtd}><span style={mono}>b</span> (m)</th>
                    <th style={thtd}><span style={mono}>α_GR</span> (arcsec)</th>
                    <th style={thtd}><span style={mono}>κ</span> (m⁻¹)</th>
                    <th style={thtd}><span style={mono}>e^(κ b/2)</span></th>
                    <th style={thtd}><span style={mono}>α_model</span> (arcsec)</th>
                    <th style={thtd}><span style={mono}>α_obs</span> (arcsec)</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((r, i) => (
                    <tr key={i}>
                        <td style={thtd}>{r.name}</td>
                        <td style={{ ...thtd, ...mono }}>{r.mass_kg}</td>
                        <td style={{ ...thtd, ...mono }}>{r.b_m}</td>
                        <td style={{ ...thtd, ...mono }}>
                            {r.grMatch ? '✅' : '🛑'} {r.alpha_GR_arcsec}
                            <div style={{ ...small, ...mono }}>α_GR = 4GM/(c²b) → {Number(r.alpha_GR_rad_num).toFixed(12)} rad</div>
                        </td>
                        <td style={{ ...thtd, ...mono }}>{r.kappa_minv}</td>
                        <td style={{ ...thtd, ...mono }}>{r.boost_e_kb2}</td>
                        <td style={{ ...thtd, ...mono }}>
                            {r.match ? '✅' : '🛑'} {r.alpha_model_arcsec}
                            <div style={{ ...small, ...mono }}>α_model = α_GR · e^(κb/2) → {Number(r.alpha_model_rad_num).toFixed(12)} rad</div>
                        </td>
                        <td style={{ ...thtd, ...mono }}>{r.alpha_obs_arcsec || '—'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default LensingTable
