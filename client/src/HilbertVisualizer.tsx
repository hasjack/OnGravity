// src/components/HilbertVisualizer.tsx

import React, { useMemo, useState } from 'react'

import {
    HamiltonianOperator,
    type HilbertConfig,
    type WaveFunction,
    type LogCoordinate,
} from './math/hilbert'
import {
    maxSelfAdjointError,
} from './math/hilbert'

type SamplePoint = {
    t: LogCoordinate
    V: number
    f1: number
    f2: number
}

const HilbertVisualizer: React.FC = () => {
    // state
    const [kappa, setKappa] = useState(0)
    const [tMin, setTMin] = useState(Math.log(10))
    const [tMax, setTMax] = useState(Math.log(1e4))
    const [steps, setSteps] = useState(300)

    // toy κ-potential: V(t) = κ e^t
    const V = useMemo(
        () => (t: number) => kappa * Math.exp(t),
        [kappa],
    )

    const cfg: HilbertConfig = useMemo(
        () => ({
            tMin,
            tMax,
            steps,
        }),
        [tMin, tMax, steps],
    )

    // tiny basis to probe self-adjointness
    const basis: WaveFunction[] = useMemo(
        () => [
            t => Math.exp(-0.2 * t),
            t => Math.sin(t),
            t => Math.cos(t),
        ],
        [],
    )

    const H = useMemo(
        () => new HamiltonianOperator(V, cfg),
        [V, cfg],
    )

    const { error, samples } = useMemo(() => {
        const err = maxSelfAdjointError(H, basis, cfg)

        const graphSteps = 200
        const dt = (cfg.tMax - cfg.tMin) / graphSteps
        const arr: SamplePoint[] = []

        const f1 = basis[0]
        const f2 = basis[1]

        for (let i = 0; i <= graphSteps; i++) {
            const t = cfg.tMin + i * dt
            arr.push({
                t,
                V: V(t),
                f1: f1(t),
                f2: f2(t),
            })
        }

        return { error: err, samples: arr }
    }, [H, basis, cfg, V])

    // normalise samples to [0,1] in y for plotting
    const plotted = useMemo(() => {
        if (!samples.length) return []

        const allVals: number[] = []
        for (const s of samples) {
            allVals.push(s.V, s.f1, s.f2)
        }

        const min = Math.min(...allVals)
        const max = Math.max(...allVals)
        const span = max - min || 1

        return samples.map(s => ({
            x: (s.t - cfg.tMin) / (cfg.tMax - cfg.tMin || 1),
            V: (s.V - min) / span,
            f1: (s.f1 - min) / span,
            f2: (s.f2 - min) / span,
        }))
    }, [samples, cfg])

    return (
        <div
            style={{
                padding: '1rem',
                background: '#050510',
                color: '#eee',
                fontFamily: 'system-ui, sans-serif',
                height: '100%',
                boxSizing: 'border-box',
            }}
        >
            <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                κ–Hilbert Space Visualiser
            </h2>

            {/* controls */}
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                }}
            >
                <label style={{ display: 'flex', flexDirection: 'column' }}>
                    κ
                    <input
                        type="range"
                        min={-0.5}
                        max={0.5}
                        step={0.001}
                        value={kappa}
                        onChange={e => setKappa(parseFloat(e.target.value))}
                    />
                    <span>{kappa.toFixed(3)}</span>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column' }}>
                    tₘᵢₙ (log x)
                    <input
                        type='number'
                        value={tMin}
                        step={0.2}
                        onChange={e => setTMin(Number(e.target.value))}
                    />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column' }}>
                    tₘₐₓ (log x)
                    <input
                        type='number'
                        value={tMax}
                        step={0.2}
                        onChange={e => setTMax(Number(e.target.value))}
                    />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column' }}>
                    steps
                    <input
                        type='number'
                        min={50}
                        max={2000}
                        value={steps}
                        onChange={e => setSteps(Number(e.target.value))}
                    />
                </label>

                <div
                    style={{
                        marginLeft: 'auto',
                        padding: '0.4rem 0.6rem',
                        background: '#111',
                        borderRadius: 6,
                        alignSelf: 'flex-end',
                    }}
                >
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        max self–adjoint error
                    </div>
                    <div
                        style={{
                            fontWeight: 600,
                            color: error < 1e-3 ? '#7cff9a' : '#ffdf7c',
                        }}
                    >
                        {error.toExponential(3)}
                    </div>
                </div>
            </div>

            {/* simple SVG plot */}
            <div
                style={{
                    background: '#080818',
                    borderRadius: 8,
                    padding: '0.75rem',
                    height: 320,
                }}
            >
                <svg
                    viewBox='0 0 100 100'
                    preserveAspectRatio='none'
                    style={{ width: '100%', height: '100%' }}
                >
                    {/* axes */}
                    <line
                        x1={0}
                        y1={90}
                        x2={100}
                        y2={90}
                        stroke='#333'
                        strokeWidth={0.4}
                    />
                    <line
                        x1={5}
                        y1={5}
                        x2={5}
                        y2={95}
                        stroke='#333'
                        strokeWidth={0.4}
                    />

                    {/* V(t) curve */}
                    <polyline
                        fill='none'
                        stroke='#4aa8ff'
                        strokeWidth={0.7}
                        points={plotted
                            .map(p => `${p.x * 95 + 5},${95 - p.V * 80}`)
                            .join(' ')}
                    />

                    {/* basis f1 */}
                    <polyline
                        fill='none'
                        stroke='#ffb15a'
                        strokeWidth={0.6}
                        strokeDasharray='1.2 1.2'
                        points={plotted
                            .map(p => `${p.x * 95 + 5},${95 - p.f1 * 80}`)
                            .join(' ')}
                    />

                    {/* basis f2 */}
                    <polyline
                        fill='none'
                        stroke='#8cffc9'
                        strokeWidth={0.6}
                        strokeDasharray='2 1.2'
                        points={plotted
                            .map(p => `${p.x * 95 + 5},${95 - p.f2 * 80}`)
                            .join(' ')}
                    />
                </svg>

                <div
                    style={{
                        display: 'flex',
                        gap: '1rem',
                        marginTop: '0.5rem',
                        fontSize: '0.8rem',
                        opacity: 0.9,
                    }}
                >
                    <span>
                        <span
                            style={{
                                display: 'inline-block',
                                width: 10,
                                height: 3,
                                background: '#4aa8ff',
                                marginRight: 4,
                            }}
                        />
                        V(t) = κ eᵗ
                    </span>
                    <span>
                        <span
                            style={{
                                display: 'inline-block',
                                width: 10,
                                height: 3,
                                background: '#ffb15a',
                                marginRight: 4,
                            }}
                        />
                        basis f₁(t) = e⁻⁰⋅²ᵗ
                    </span>
                    <span>
                        <span
                            style={{
                                display: 'inline-block',
                                width: 10,
                                height: 3,
                                background: '#8cffc9',
                                marginRight: 4,
                            }}
                        />
                        basis f₂(t) = sin t
                    </span>
                </div>
            </div>
        </div>
    )
}

export default HilbertVisualizer
