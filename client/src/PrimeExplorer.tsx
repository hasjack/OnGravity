import React, { useMemo, useState } from 'react'

type Point = { x: number; y: number }

const MAX_N = 1_000_000

function sieveUpTo(limit: number): number[] {
    const isPrime = new Uint8Array(limit + 1)
    isPrime.fill(1)
    isPrime[0] = 0
    isPrime[1] = 0

    const maxP = Math.floor(Math.sqrt(limit))
    for (let p = 2; p <= maxP; p++) {
        if (!isPrime[p]) continue
        for (let m = p * p; m <= limit; m += p) {
            isPrime[m] = 0
        }
    }

    const primes: number[] = []
    for (let n = 2; n <= limit; n++) {
        if (isPrime[n]) primes.push(n)
    }
    return primes
}

function approxPi(x: number): number {
    if (x < 3) return x >= 2 ? 1 : 0
    return x / Math.log(x)
}

function toSci(x: number): string {
    if (x === 0) return '0'
    const e = Math.floor(Math.log10(x))
    const m = x / Math.pow(10, e)
    return `${m.toFixed(2)} × 10^${e}`
}

const PrimeExplorer: React.FC = () => {
    // slider is exponent k, we look at x in [10^2, 10^6]
    const [scaleExp, setScaleExp] = useState(4)

    // precompute primes once
    const primes = useMemo(() => sieveUpTo(MAX_N), [])

    // build a prefix array for π(x)
    const piTable = useMemo(() => {
        const table = new Array<number>(MAX_N + 1)
        let count = 0
        let nextIndex = 0
        for (let n = 0; n <= MAX_N; n++) {
            while (nextIndex < primes.length && primes[nextIndex] === n) {
                count++
                nextIndex++
            }
            table[n] = count
        }
        return table
    }, [primes])

    const xMax = Math.round(Math.pow(10, scaleExp))
    const xMin = 10 ** 2

    // sample points for the graph
    const sampleCount = 220

    const { actualPoints, approxPoints, maxY } = useMemo(() => {
        const act: Point[] = []
        const app: Point[] = []
        let localMaxY = 0

        for (let i = 0; i < sampleCount; i++) {
            const t = i / (sampleCount - 1)
            const x = xMin + t * (xMax - xMin)
            const xi = Math.min(MAX_N, Math.max(2, Math.round(x)))

            const pi = piTable[xi]
            const pnt = approxPi(x)

            if (pi > localMaxY) localMaxY = pi
            if (pnt > localMaxY) localMaxY = pnt

            act.push({ x, y: pi })
            app.push({ x, y: pnt })
        }

        return { actualPoints: act, approxPoints: app, maxY: localMaxY * 1.05 }
    }, [piTable, xMax])

    // stats at xMax
    const piAtX = piTable[xMax]
    const pntAtX = approxPi(xMax)
    const avgGap = piAtX > 0 ? xMax / piAtX : 0
    const logX = Math.log(xMax)
    const relErr = piAtX > 0 ? (pntAtX - piAtX) / piAtX : 0

    const width = 640
    const height = 260
    const padding = 40

    const mapToSvg = (pt: Point): { x: number; y: number } => {
        const tx = (pt.x - xMin) / (xMax - xMin)
        const ty = pt.y / maxY
        return {
            x: padding + tx * (width - 2 * padding),
            y: height - padding - ty * (height - 2 * padding),
        }
    }

    const pathFromPoints = (pts: Point[]): string => {
        if (!pts.length) return ''
        const first = mapToSvg(pts[0])
        let d = `M ${first.x} ${first.y}`
        for (let i = 1; i < pts.length; i++) {
            const p = mapToSvg(pts[i])
            d += ` L ${p.x} ${p.y}`
        }
        return d
    }

    const actualPath = pathFromPoints(actualPoints)
    const approxPath = pathFromPoints(approxPoints)

    return (
        <div
            style={{
                background: '#050510',
                color: '#f5f5f5',
                padding: '1.5rem',
                borderRadius: 16,
                boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                maxWidth: 800,
                margin: '0 auto',
            }}
        >
            <h2 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.5rem' }}>
                Prime Explorer
            </h2>
            <p style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '0.9rem', opacity: 0.9 }}>
                Slide the scale to move out along the number line. The blue curve is the
                actual prime count π(x). The teal curve is the Prime Number Theorem
                approximation x / log x. Watch how the density thins out but the two
                stay locked together.
            </p>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                }}
            >
                <label
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: '0.9rem',
                    }}
                >
                    scale (10^k)
                    <input
                        type='range'
                        min={2}
                        max={6}
                        step={0.1}
                        value={scaleExp}
                        onChange={e => setScaleExp(parseFloat(e.target.value))}
                        style={{ width: 200 }}
                    />
                    <span style={{ width: 60, textAlign: 'right' }}>
                        {scaleExp.toFixed(1)}
                    </span>
                </label>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                    x max ≈ {xMax.toLocaleString()} &nbsp; ({toSci(xMax)})
                </div>
            </div>

            <svg
                width={width}
                height={height}
                style={{
                    width: '100%',
                    height: '260px',
                    borderRadius: 12,
                    background: '#050818',
                }}
            >
                {/* axes */}
                <line
                    x1={padding}
                    y1={height - padding}
                    x2={width - padding}
                    y2={height - padding}
                    stroke='#444'
                    strokeWidth={1}
                />
                <line
                    x1={padding}
                    y1={padding}
                    x2={padding}
                    y2={height - padding}
                    stroke='#444'
                    strokeWidth={1}
                />

                {/* curves */}
                <path
                    d={approxPath}
                    fill='none'
                    stroke='#31e0c1'
                    strokeWidth={2}
                    strokeDasharray='4 3'
                />
                <path
                    d={actualPath}
                    fill='none'
                    stroke='#4a9cff'
                    strokeWidth={2}
                />

                {/* labels */}
                <text
                    x={padding + 8}
                    y={padding + 16}
                    fill='#4a9cff'
                    fontSize='11'
                >
                    π(x)
                </text>
                <text
                    x={padding + 8}
                    y={padding + 32}
                    fill='#31e0c1'
                    fontSize='11'
                >
                    x / log x
                </text>

                <text
                    x={width - padding}
                    y={height - padding + 18}
                    fill='#888'
                    fontSize='10'
                    textAnchor='end'
                >
                    x (from 10² to 10⁶)
                </text>
                <text
                    x={padding - 10}
                    y={padding - 6}
                    fill='#888'
                    fontSize='10'
                    textAnchor='start'
                >
                    count of primes
                </text>
            </svg>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '0.75rem',
                    marginTop: '1rem',
                    fontSize: '0.85rem',
                }}
            >
                <div
                    style={{
                        background: '#0b0c20',
                        borderRadius: 8,
                        padding: '0.5rem 0.75rem',
                    }}
                >
                    <div style={{ opacity: 0.7 }}>π(x)</div>
                    <div style={{ fontWeight: 600 }}>
                        {piAtX.toLocaleString()}
                    </div>
                    <div style={{ opacity: 0.7, marginTop: 4 }}>actual primes ≤ x</div>
                </div>

                <div
                    style={{
                        background: '#0b0c20',
                        borderRadius: 8,
                        padding: '0.5rem 0.75rem',
                    }}
                >
                    <div style={{ opacity: 0.7 }}>x / log x</div>
                    <div style={{ fontWeight: 600 }}>
                        {pntAtX.toFixed(0)}
                    </div>
                    <div style={{ opacity: 0.7, marginTop: 4 }}>PNT estimate</div>
                </div>

                <div
                    style={{
                        background: '#0b0c20',
                        borderRadius: 8,
                        padding: '0.5rem 0.75rem',
                    }}
                >
                    <div style={{ opacity: 0.7 }}>relative error</div>
                    <div style={{ fontWeight: 600 }}>
                        {(relErr * 100).toFixed(2)}%
                    </div>
                    <div style={{ opacity: 0.7, marginTop: 4 }}>
                        how far PNT is off at x
                    </div>
                </div>

                <div
                    style={{
                        background: '#0b0c20',
                        borderRadius: 8,
                        padding: '0.5rem 0.75rem',
                    }}
                >
                    <div style={{ opacity: 0.7 }}>average gap</div>
                    <div style={{ fontWeight: 600 }}>
                        {avgGap.toFixed(1)}
                    </div>
                    <div style={{ opacity: 0.7, marginTop: 4 }}>
                        ≈ x / π(x) &nbsp; (vs log x = {logX.toFixed(1)})
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PrimeExplorer
