import React, { useMemo } from "react"

// REAL Mersenne prime exponents (chronological)
const MERSENNE_EXPONENTS = [
    13466917, 20996011, 24036583, 25964951, 30402457,
    32582657, 37156667, 42643801, 57885161, 74207281,
    77232917, 82589933, 89909393, 136279841,
]

type GapRow = {
    p: number
    nextP: number
    gap: number
    logP: number
    kappa: number
}

export const PrimeBreathingExplorer: React.FC = () => {
    const rows: GapRow[] = useMemo(() => {
        const out: GapRow[] = []
        for (let i = 0; i < MERSENNE_EXPONENTS.length - 1; i++) {
            const p = MERSENNE_EXPONENTS[i]
            const nextP = MERSENNE_EXPONENTS[i + 1]
            const gap = nextP - p
            const logP = Math.log(p)
            const kappa = Math.log(gap / logP) / logP
            out.push({ p, nextP, gap, logP, kappa })
        }
        return out
    }, [])

    const kappas = rows.map(r => r.kappa)
    const minK = Math.min(...kappas)
    const maxK = Math.max(...kappas)
    const meanK = kappas.reduce((a, b) => a + b, 0) / kappas.length

    return (
        <div
            style={{
                fontFamily: "system-ui",
                padding: "1rem",
                color: "#eee",
                background: "#001520",
                height: "100vh",
                overflow: "auto",
            }}
        >
            <h2 style={{ marginBottom: "0.5rem" }}>κ-Breathing Explorer (Mersenne Primes)</h2>
            <p style={{ opacity: 0.8, maxWidth: 600 }}>
                This component computes the empirical κₙ breathing parameter for each consecutive pair of
                Mersenne prime exponents using the formula:<br />
                <code>κₙ = log(gapₙ / log(pₙ)) / log(pₙ)</code>.
            </p>

            {/* Sparkline */}
            <div
                style={{
                    margin: "1rem 0",
                    height: 60,
                    background: "#002233",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                {kappas.map((k, i) => {
                    // normalize to [0,1]
                    const t = (k - minK) / (maxK - minK || 1)
                    const y = 60 - t * 60
                    return (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                left: `${(i / (kappas.length - 1)) * 100}%`,
                                top: y,
                                width: 4,
                                height: 4,
                                borderRadius: 4,
                                background: "#4af",
                            }}
                        />
                    )
                })}
            </div>

            {/* Summary */}
            <div style={{ marginBottom: "1rem" }}>
                <strong>Range of κ:</strong> {minK.toExponential(3)} → {maxK.toExponential(3)}<br />
                <strong>Mean κ:</strong> {meanK.toExponential(3)}
            </div>

            {/* Table */}
            <table
                style={{
                    borderCollapse: "collapse",
                    width: "100%",
                    maxWidth: 860,
                    background: "#002233",
                }}
            >
                <thead>
                    <tr>
                        <th style={th}>pₙ</th>
                        <th style={th}>pₙ₊₁</th>
                        <th style={th}>gap</th>
                        <th style={th}>log pₙ</th>
                        <th style={th}>κₙ (breathing fit)</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i}>
                            <td style={td}>{r.p}</td>
                            <td style={td}>{r.nextP}</td>
                            <td style={td}>{r.gap.toLocaleString()}</td>
                            <td style={td}>{r.logP.toFixed(4)}</td>
                            <td style={td}>{r.kappa.toExponential(3)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const th: React.CSSProperties = {
    borderBottom: "1px solid #335",
    padding: "6px 8px",
    textAlign: "left",
    background: "#003",
}

const td: React.CSSProperties = {
    padding: "6px 8px",
    borderBottom: "1px solid #112",
}
