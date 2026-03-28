// src/components/MersenneFrontier.tsx
import React, { useMemo, useState } from "react"

type MersenneRecord = {
  index: number
  exponent: number
  year: number
}

// Very small curated subset – illustrative, not exhaustive
const KNOWN_MERSENNES: MersenneRecord[] = [
  { index: 39, exponent: 13_466_917, year: 2001 },
  { index: 40, exponent: 20_996_011, year: 2003 },
  { index: 41, exponent: 24_036_583, year: 2004 },
  { index: 42, exponent: 25_964_951, year: 2005 },
  { index: 43, exponent: 30_402_457, year: 2005 },
  { index: 44, exponent: 32_582_657, year: 2006 },
  { index: 45, exponent: 37_156_667, year: 2008 },
  { index: 46, exponent: 42_643_801, year: 2009 },
  { index: 47, exponent: 57_885_161, year: 2013 },
  { index: 48, exponent: 74_207_281, year: 2015 },
  { index: 49, exponent: 77_232_917, year: 2017 },
  { index: 50, exponent: 82_589_933, year: 2018 },
  { index: 51, exponent: 89_909_393, year: 2022 }, // illustrative
  { index: 52, exponent: 136_279_841, year: 2024 }, // record you care about
]

type SimulatedExponent = {
  index: number
  exponent: number
}

function simulateNextMersennes(
  startExponent: number,
  startIndex: number,
  count: number,
  kappa: number,
  jitter: number,
): SimulatedExponent[] {
  const out: SimulatedExponent[] = []
  let p = startExponent
  let idx = startIndex

  for (let i = 0; i < count; i++) {
    const logp = Math.log(p)
    // baseline gap ~ log(p) from PNT
    const baseGap = logp
    // κ-breathing boost
    const boostedGap = Math.exp(kappa * logp) * baseGap
    const r = 1 - jitter + Math.random() * (2 * jitter) // [1-j, 1+j]
    const gap = Math.max(2, Math.round(boostedGap * r))

    p = p + gap
    idx += 1
    out.push({ index: idx, exponent: p })
  }

  return out
}

const MersenneFrontier: React.FC = () => {
  const [kappa, setKappa] = useState(0.10)
  const [jitter, setJitter] = useState(0.25)
  const [count, setCount] = useState(100)

  const lastKnown = KNOWN_MERSENNES[KNOWN_MERSENNES.length - 1]

  const simulated = useMemo(
    () =>
      simulateNextMersennes(
        lastKnown.exponent,
        lastKnown.index,
        count,
        kappa,
        jitter,
      ),
    [lastKnown.exponent, lastKnown.index, count, kappa, jitter],
  )

  // convenience values for charts
  const allForScale = [...KNOWN_MERSENNES, ...simulated]
  const minIdx = KNOWN_MERSENNES[0].index
  const maxIdx = allForScale[allForScale.length - 1].index
  const minLogExp = Math.log10(
    Math.min(...allForScale.map((m) => m.exponent)),
  )
  const maxLogExp = Math.log10(
    Math.max(...allForScale.map((m) => m.exponent)),
  )

  const axisPadding = 20

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#050510",
        color: "#eee",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* top controls */}
      <div
        style={{
          padding: "0.6rem 1rem",
          background: "#111827",
          borderBottom: "1px solid #1f2937",
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          fontSize: "0.85rem",
        }}
      >
        <div style={{ fontWeight: 600 }}>
          Mersenne Frontier • history & κ-gap forecast
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
          }}
        >
          κ gap boost:
          <input
            type="range"
            min={0}
            max={0.4}
            step={0.005}
            value={kappa}
            onChange={(e) => setKappa(Number(e.target.value))}
            style={{ width: 140 }}
          />
          <span style={{ width: 48, textAlign: "right" }}>
            {kappa.toFixed(3)}
          </span>
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
          }}
        >
          jitter:
          <input
            type="range"
            min={0}
            max={0.5}
            step={0.01}
            value={jitter}
            onChange={(e) => setJitter(Number(e.target.value))}
            style={{ width: 120 }}
          />
          <span style={{ width: 40, textAlign: "right" }}>
            {jitter.toFixed(2)}
          </span>
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
          }}
        >
          forecast count:
          <input
            type="range"
            min={20}
            max={300}
            step={10}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={{ width: 160 }}
          />
          <span style={{ width: 40, textAlign: "right" }}>{count}</span>
        </label>

        <div style={{ marginLeft: "auto", opacity: 0.75 }}>
          latest record: M
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {lastKnown.exponent.toLocaleString("en-GB")}
          </span>{" "}
          ({lastKnown.year})
        </div>
      </div>

      {/* two panels */}
      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          gap: 1,
          background: "#020617",
        }}
      >
        {/* LEFT: history chart */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            padding: "0.5rem 0.75rem",
            borderRight: "1px solid #111827",
          }}
        >
          <div
            style={{
              fontSize: "0.8rem",
              marginBottom: "0.4rem",
              opacity: 0.85,
            }}
          >
            History • known Mersenne primes (log₁₀ p vs index)
          </div>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              background: "#020617",
              borderRadius: 6,
              border: "1px solid #1f2937",
              padding: 4,
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 400 260"
              preserveAspectRatio="none"
            >
              {/* axes */}
              <rect
                x={0}
                y={0}
                width={400}
                height={260}
                fill="#020617"
                rx={6}
              />
              <line
                x1={axisPadding}
                y1={axisPadding}
                x2={axisPadding}
                y2={260 - axisPadding}
                stroke="#374151"
                strokeWidth={0.8}
              />
              <line
                x1={axisPadding}
                y1={260 - axisPadding}
                x2={400 - axisPadding}
                y2={260 - axisPadding}
                stroke="#374151"
                strokeWidth={0.8}
              />

              {/* y ticks (log10 exponent) */}
              {Array.from({ length: 4 }).map((_, i) => {
                const t = i / 3
                const logVal =
                  minLogExp + t * (maxLogExp - minLogExp)
                const y =
                  260 -
                  axisPadding -
                  t * (260 - 2 * axisPadding)
                return (
                  <g key={i}>
                    <line
                      x1={axisPadding - 3}
                      y1={y}
                      x2={axisPadding}
                      y2={y}
                      stroke="#4b5563"
                      strokeWidth={0.6}
                    />
                    <text
                      x={axisPadding - 6}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="8"
                      fill="#9ca3af"
                    >
                      {logVal.toFixed(1)}
                    </text>
                  </g>
                )
              })}

              {/* historical points + polyline */}
              {KNOWN_MERSENNES.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth={1}
                  points={KNOWN_MERSENNES.map((m) => {
                    const tx =
                      (m.index - minIdx) /
                      (maxIdx - minIdx || 1)
                    const x =
                      axisPadding +
                      tx *
                        (400 - 2 * axisPadding)
                    const logP = Math.log10(m.exponent)
                    const ty =
                      (logP - minLogExp) /
                      (maxLogExp - minLogExp || 1)
                    const y =
                      260 -
                      axisPadding -
                      ty *
                        (260 - 2 * axisPadding)
                    return `${x},${y}`
                  }).join(" ")}
                />
              )}

              {KNOWN_MERSENNES.map((m) => {
                const tx =
                  (m.index - minIdx) /
                  (maxIdx - minIdx || 1)
                const x =
                  axisPadding +
                  tx * (400 - 2 * axisPadding)
                const logP = Math.log10(m.exponent)
                const ty =
                  (logP - minLogExp) /
                  (maxLogExp - minLogExp || 1)
                const y =
                  260 -
                  axisPadding -
                  ty * (260 - 2 * axisPadding)
                return (
                  <g key={m.index}>
                    <circle
                      cx={x}
                      cy={y}
                      r={2.4}
                      fill={
                        m.index === lastKnown.index
                          ? "#f97316"
                          : "#93c5fd"
                      }
                    />
                  </g>
                )
              })}
            </svg>
          </div>

          {/* small legend */}
          <div
            style={{
              marginTop: "0.35rem",
              fontSize: "0.75rem",
              opacity: 0.8,
            }}
          >
            log₁₀(p) grows almost linearly with index; last point is the 2024
            record. This is the “mountain ridge” we’re extending with κ-gaps.
          </div>

          {/* compact table */}
          <div
            style={{
              marginTop: "0.5rem",
              maxHeight: 130,
              overflowY: "auto",
              fontSize: "0.75rem",
              borderTop: "1px solid #1f2937",
              paddingTop: "0.4rem",
            }}
          >
            {KNOWN_MERSENNES.map((m) => (
              <div
                key={m.index}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  padding: "1px 0",
                  opacity:
                    m.index === lastKnown.index ? 1 : 0.85,
                }}
              >
                <span
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 26,
                    color:
                      m.index === lastKnown.index
                        ? "#f97316"
                        : "#9ca3af",
                  }}
                >
                  #{m.index}
                </span>
                <span
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 92,
                  }}
                >
                  p={m.exponent.toLocaleString("en-GB")}
                </span>
                <span
                  style={{
                    color: "#9ca3af",
                    minWidth: 40,
                  }}
                >
                  {m.year}
                </span>
                {m.index === lastKnown.index && (
                  <span
                    style={{
                      color: "#fbbf24",
                      fontSize: "0.7rem",
                    }}
                  >
                    current record
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: forecast panel */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            padding: "0.5rem 0.75rem",
          }}
        >
          <div
            style={{
              fontSize: "0.8rem",
              marginBottom: "0.4rem",
              opacity: 0.85,
            }}
          >
            κ-gap forecast • simulated next {count} exponents
          </div>

          {/* forecast chart */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              background: "#020617",
              borderRadius: 6,
              border: "1px solid #1f2937",
              padding: 4,
              marginBottom: "0.4rem",
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 400 260"
              preserveAspectRatio="none"
            >
              <rect
                x={0}
                y={0}
                width={400}
                height={260}
                fill="#020617"
                rx={6}
              />
              {/* show historical segment faint in background */}
              {KNOWN_MERSENNES.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#1f2937"
                  strokeWidth={1}
                  points={KNOWN_MERSENNES.map((m) => {
                    const tx =
                      (m.index - minIdx) /
                      (maxIdx - minIdx || 1)
                    const x =
                      axisPadding +
                      tx *
                        (400 - 2 * axisPadding)
                    const logP = Math.log10(m.exponent)
                    const ty =
                      (logP - minLogExp) /
                      (maxLogExp - minLogExp || 1)
                    const y =
                      260 -
                      axisPadding -
                      ty *
                        (260 - 2 * axisPadding)
                    return `${x},${y}`
                  }).join(" ")}
                />
              )}

              {/* simulated polyline */}
              {simulated.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#34d399"
                  strokeWidth={1.1}
                  strokeDasharray="4 3"
                  points={simulated
                    .map((s) => {
                      const tx =
                        (s.index - minIdx) /
                        (maxIdx - minIdx || 1)
                      const x =
                        axisPadding +
                        tx *
                          (400 - 2 * axisPadding)
                      const logP = Math.log10(
                        s.exponent,
                      )
                      const ty =
                        (logP - minLogExp) /
                        (maxLogExp - minLogExp || 1)
                      const y =
                        260 -
                        axisPadding -
                        ty *
                          (260 - 2 * axisPadding)
                      return `${x},${y}`
                    })
                    .join(" ")}
                />
              )}

              {/* last known + first few simulated points */}
              {simulated.slice(0, 5).map((s) => {
                const tx =
                  (s.index - minIdx) /
                  (maxIdx - minIdx || 1)
                const x =
                  axisPadding +
                  tx * (400 - 2 * axisPadding)
                const logP = Math.log10(s.exponent)
                const ty =
                  (logP - minLogExp) /
                  (maxLogExp - minLogExp || 1)
                const y =
                  260 -
                  axisPadding -
                  ty * (260 - 2 * axisPadding)
                return (
                  <g key={s.index}>
                    <circle
                      cx={x}
                      cy={y}
                      r={2}
                      fill="#6ee7b7"
                    />
                  </g>
                )
              })}
            </svg>
          </div>

          {/* explanation + list */}
          <div
            style={{
              fontSize: "0.75rem",
              opacity: 0.83,
              marginBottom: "0.35rem",
            }}
          >
            Gaps grow ~log(p) (PNT). Here we “breathe” them with κ:
            gap ≈ e^{`κ log p`} · log p · noise. This isn’t predicting true
            Mersennes; it’s showing how a κ-flock might march the frontier.
          </div>

          <div
            style={{
              flex: "0 0 140px",
              minHeight: 0,
              overflowY: "auto",
              borderTop: "1px solid #1f2937",
              paddingTop: "0.4rem",
              fontSize: "0.75rem",
            }}
          >
            {simulated.slice(0, 40).map((s) => (
              <div
                key={s.index}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  padding: "1px 0",
                }}
              >
                <span
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 26,
                    color: "#6ee7b7",
                  }}
                >
                  #{s.index}
                </span>
                <span
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 118,
                  }}
                >
                  p≈{s.exponent.toLocaleString("en-GB")}
                </span>
                <span style={{ color: "#9ca3af" }}>sim</span>
              </div>
            ))}
            {simulated.length > 40 && (
              <div
                style={{
                  marginTop: 4,
                  color: "#9ca3af",
                  opacity: 0.75,
                }}
              >
                …+ {simulated.length - 40} more simulated
                exponents
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MersenneFrontier
