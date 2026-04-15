import { useEffect, useMemo, useRef, useState } from 'react'
import { InlineMath } from '../components/Katex'
import { P } from '../components/Typography'

type ViewMode =
    | 'escape'
    | 'flipCount'
    | 'parity'
    | 'firstFlip'
    | 'occPlus'
    | 'occMinus'

type SwitchModel = 'threshold' | 'sinswitch'

type Probe = {
    c: number
    b: number
    escapeIter: number | null
    flips: number
    firstFlip: number | null
    occPlus: number
    occMinus: number
    xs: number[]
    sigmas: number[]
    gateAbs: number[] // model-dependent diagnostic trace
    gateLabel: string
}

function clamp(x: number, lo: number, hi: number) {
    return Math.min(hi, Math.max(lo, x))
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t
}

// Simple perceptual-ish palette (low=dark, high=bright)
function colorRamp(t: number): [number, number, number] {
    const x = clamp(t, 0, 1)
    const r = Math.round(255 * clamp(lerp(0.05, 1.0, x), 0, 1))
    const g = Math.round(255 * clamp(lerp(0.02, 0.75, Math.pow(x, 0.9)), 0, 1))
    const b = Math.round(255 * clamp(lerp(0.08, 0.15, Math.pow(x, 0.7)), 0, 1))
    return [r, g, b]
}

function signNonzero(x: number) {
    // keep sigma in {±1}
    return x >= 0 ? 1 : -1
}

function simulatePoint(params: {
    model: SwitchModel
    c: number
    b: number
    kappa: number
    maxIter: number
    escapeR: number
    traceN: number
}): Probe {
    const { model, c, b, kappa, maxIter, escapeR, traceN } = params

    let x = b
    let flips = 0
    let firstFlip: number | null = null
    let escapeIter: number | null = null

    // Initial sigma:
    // - threshold model: sign(b) (matches your Python threshold renderers)
    // - sin-switch model: sign(sin(kappa*b))
    let sigma =
        model === 'threshold'
            ? signNonzero(b)
            : signNonzero(Math.sin(kappa * b))

    let occPlus = 0
    let occMinus = 0

    const xs: number[] = []
    const sigmas: number[] = []
    const gateAbs: number[] = []

    const nTrace = Math.min(maxIter, traceN)

    // Threshold uses the initial-condition coordinate b (constant per pixel)
    const threshold = 1.0 + Math.abs(b) * kappa

    const gateLabel =
        model === 'threshold'
            ? '|x_n| − (1+|b|κ)  (flip margin)'
            : '|sin(κ x_n)|'

    for (let n = 0; n < maxIter; n++) {
        // occupancy before stepping
        if (sigma === 1) occPlus++
        else occMinus++

        if (n < nTrace) {
            xs.push(x)
            sigmas.push(sigma)

            if (model === 'threshold') {
                const margin = Math.abs(x) - threshold
                gateAbs.push(Math.max(0, margin))
            } else {
                gateAbs.push(Math.abs(Math.sin(kappa * x)))
            }
        }

        const xNext = sigma * x * x + c

        let sigmaNext = sigma

        if (model === 'threshold') {
            const flip = Math.abs(xNext) > threshold
            sigmaNext = flip ? -sigma : sigma
        } else {
            sigmaNext = signNonzero(Math.sin(kappa * xNext))
        }

        if (sigmaNext !== sigma) {
            flips++
            if (firstFlip === null) firstFlip = n + 1
        }

        x = xNext
        sigma = sigmaNext

        if (Math.abs(x) > escapeR) {
            escapeIter = n + 1
            break
        }
    }

    const steps = escapeIter ?? maxIter
    const occPlusFrac = occPlus / steps
    const occMinusFrac = occMinus / steps

    return {
        c,
        b,
        escapeIter,
        flips,
        firstFlip,
        occPlus: occPlusFrac,
        occMinus: occMinusFrac,
        xs,
        sigmas,
        gateAbs,
        gateLabel,
    }
}

export default function SwitchingAtlasExplorer() {
    // Parameter plane
    const [cMin, setCMin] = useState(-1.5)
    const [cMax, setCMax] = useState(0.5)
    const [bMin, setBMin] = useState(-1.0)
    const [bMax, setBMax] = useState(1.0)

    // Model selection (default: threshold)
    const [model, setModel] = useState<SwitchModel>('threshold')

    // Model knobs
    const [kappa, setKappa] = useState(0.6235)
    const [maxIter, setMaxIter] = useState(250)
    const [escapeR, setEscapeR] = useState(2.0)

    // Rendering knobs
    const [view, setView] = useState<ViewMode>('escape')
    const [resPreset, setResPreset] = useState<'low' | 'med' | 'high'>('med')

    const [probe, setProbe] = useState<Probe | null>(null)

    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const dims = useMemo(() => {
        if (resPreset === 'low') return { w: 320, h: 200 }
        if (resPreset === 'high') return { w: 800, h: 500 }
        return { w: 520, h: 320 }
    }, [resPreset])

    const flipMax = 20
    const firstFlipMax = maxIter
    const traceN = 600

    const timerRef = useRef<number | null>(null)

    useEffect(() => {
        if (timerRef.current !== null) window.clearTimeout(timerRef.current)

        timerRef.current = window.setTimeout(() => {
            const canvas = canvasRef.current
            if (!canvas) return

            canvas.width = dims.w
            canvas.height = dims.h

            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            if (!ctx) return

            const img = ctx.createImageData(dims.w, dims.h)
            const data = img.data

            for (let j = 0; j < dims.h; j++) {
                const bj = lerp(bMax, bMin, j / (dims.h - 1))
                for (let i = 0; i < dims.w; i++) {
                    const ci = lerp(cMin, cMax, i / (dims.w - 1))

                    const out = simulatePoint({
                        model,
                        c: ci,
                        b: bj,
                        kappa,
                        maxIter,
                        escapeR,
                        traceN: 0,
                    })

                    let t = 0
                    let rgb: [number, number, number] = [0, 0, 0]

                    if (view === 'escape') {
                        const steps = out.escapeIter ?? maxIter
                        t = steps / maxIter
                        rgb = colorRamp(t)
                    } else if (view === 'flipCount') {
                        t = clamp(out.flips / flipMax, 0, 1)
                        rgb = colorRamp(t)
                    } else if (view === 'parity') {
                        const odd = out.flips % 2 === 1
                        rgb = odd ? [220, 70, 70] : [60, 110, 220]
                    } else if (view === 'firstFlip') {
                        const ff = out.firstFlip ?? maxIter
                        t = clamp(ff / firstFlipMax, 0, 1)
                        rgb = colorRamp(t)
                    } else if (view === 'occPlus') {
                        t = clamp(out.occPlus, 0, 1)
                        rgb = colorRamp(t)
                    } else if (view === 'occMinus') {
                        t = clamp(out.occMinus, 0, 1)
                        rgb = colorRamp(t)
                    }

                    const idx = 4 * (j * dims.w + i)
                    data[idx + 0] = rgb[0]
                    data[idx + 1] = rgb[1]
                    data[idx + 2] = rgb[2]
                    data[idx + 3] = 255
                }
            }

            ctx.putImageData(img, 0, 0)
        }, 120)

        return () => {
            if (timerRef.current !== null) window.clearTimeout(timerRef.current)
        }
    }, [dims, cMin, cMax, bMin, bMax, model, kappa, maxIter, escapeR, view])

    function onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const x = clamp((e.clientX - rect.left) / rect.width, 0, 1)
        const y = clamp((e.clientY - rect.top) / rect.height, 0, 1)

        const c = lerp(cMin, cMax, x)
        const b = lerp(bMax, bMin, y)

        const out = simulatePoint({
            model,
            c,
            b,
            kappa,
            maxIter,
            escapeR,
            traceN,
        })
        setProbe(out)
    }

    return (
        <div className="my-10 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white w-full">
            <div className="space-y-8">
                <div>
                    <div className="text-lg font-semibold mb-2">Switching Atlas Explorer</div>
                    <P classNames="mb-0">
                        Model:{' '}
                        <InlineMath math={String.raw`x_{n+1}=\sigma_n x_n^2 + c`} />
                        {' '}
                        with{' '}
                        {model === 'threshold' ? (
                            <InlineMath math={String.raw`\sigma_{n+1}=\begin{cases}-\sigma_n & |x_{n+1}|>1+|b|\kappa\\ \sigma_n & \text{otherwise}\end{cases}`} />
                        ) : (
                            <InlineMath math={String.raw`\sigma_{n+1}=\mathrm{sign}(\sin(\kappa x_{n+1}))`} />
                        )}
                        .
                    </P>
                </div>

                {/* Controls */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <label className="text-sm flex justify-between">
                            <span>switch rule</span>
                        </label>
                        <select
                            value={model}
                            onChange={(e) => {
                                setModel(e.target.value as SwitchModel)
                                setProbe(null)
                            }}
                            className="border border-gray-300 rounded-lg p-2 w-full"
                        >
                            <option value="threshold">threshold flip (default)</option>
                            <option value="sinswitch">sign–sin gate</option>
                        </select>

                        <label className="text-sm flex justify-between">
                            <span>κ</span>
                            <span className="font-mono">{kappa.toFixed(4)}</span>
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={2}
                            step={0.0005}
                            value={kappa}
                            onChange={(e) => setKappa(parseFloat(e.target.value))}
                            className="w-full accent-blue-600"
                        />

                        <label className="text-sm flex justify-between">
                            <span>maxIter</span>
                            <span className="font-mono">{maxIter}</span>
                        </label>
                        <input
                            type="range"
                            min={50}
                            max={800}
                            step={10}
                            value={maxIter}
                            onChange={(e) => setMaxIter(parseInt(e.target.value, 10))}
                            className="w-full accent-blue-600"
                        />

                        <label className="text-sm flex justify-between">
                            <span>escape radius</span>
                            <span className="font-mono">{escapeR.toFixed(2)}</span>
                        </label>
                        <input
                            type="range"
                            min={1.5}
                            max={10}
                            step={0.1}
                            value={escapeR}
                            onChange={(e) => setEscapeR(parseFloat(e.target.value))}
                            className="w-full accent-blue-600"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm flex justify-between">
                            <span>view</span>
                        </label>
                        <select
                            value={view}
                            onChange={(e) => setView(e.target.value as ViewMode)}
                            className="border border-gray-300 rounded-lg p-2 w-full"
                        >
                            <option value="escape">escape time</option>
                            <option value="parity">flip parity</option>
                            <option value="firstFlip">first flip iteration</option>
                            <option value="flipCount">flip count</option>
                            <option value="occPlus">occupancy σ=+1</option>
                            <option value="occMinus">occupancy σ=−1</option>
                        </select>

                        <label className="text-sm flex justify-between">
                            <span>resolution</span>
                            <span className="font-mono">
                                {dims.w}×{dims.h}
                            </span>
                        </label>
                        <select
                            value={resPreset}
                            onChange={(e) => setResPreset(e.target.value as any)}
                            className="border border-gray-300 rounded-lg p-2 w-full"
                        >
                            <option value="low">low</option>
                            <option value="med">medium</option>
                            <option value="high">high</option>
                        </select>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs">c min</label>
                                <input
                                    type="number"
                                    value={cMin}
                                    step={0.1}
                                    onChange={(e) => setCMin(parseFloat(e.target.value))}
                                    className="border border-gray-300 rounded-lg p-2 w-full"
                                />
                            </div>
                            <div>
                                <label className="text-xs">c max</label>
                                <input
                                    type="number"
                                    value={cMax}
                                    step={0.1}
                                    onChange={(e) => setCMax(parseFloat(e.target.value))}
                                    className="border border-gray-300 rounded-lg p-2 w-full"
                                />
                            </div>
                            <div>
                                <label className="text-xs">b min</label>
                                <input
                                    type="number"
                                    value={bMin}
                                    step={0.1}
                                    onChange={(e) => setBMin(parseFloat(e.target.value))}
                                    className="border border-gray-300 rounded-lg p-2 w-full"
                                />
                            </div>
                            <div>
                                <label className="text-xs">b max</label>
                                <input
                                    type="number"
                                    value={bMax}
                                    step={0.1}
                                    onChange={(e) => setBMax(parseFloat(e.target.value))}
                                    className="border border-gray-300 rounded-lg p-2 w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div className="w-full overflow-auto">
                    <canvas
                        ref={canvasRef}
                        onClick={onCanvasClick}
                        className="border border-gray-200 rounded-xl cursor-crosshair mx-auto"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                    <div className="text-xs text-gray-600 mt-2">
                        Click to probe. Horizontal axis: c. Vertical axis: b=x₀.
                    </div>
                </div>

                {/* Probe output */}
                {probe && (
                    <div className="border border-gray-200 rounded-2xl p-5">
                        <div className="font-semibold mb-2">Probe</div>
                        <div className="grid md:grid-cols-3 gap-3 text-sm font-mono">
                            <div>c = {probe.c.toFixed(6)}</div>
                            <div>b = {probe.b.toFixed(6)}</div>
                            <div>κ = {kappa.toFixed(4)}</div>
                            <div>escape = {probe.escapeIter ?? 'no'}</div>
                            <div>flips = {probe.flips}</div>
                            <div>first flip = {probe.firstFlip ?? 'none'}</div>
                            <div>occ + = {probe.occPlus.toFixed(3)}</div>
                            <div>occ − = {probe.occMinus.toFixed(3)}</div>
                        </div>

                        <div className="mt-5 space-y-3">
                            <div className="text-sm">Trace (first {probe.xs.length} steps)</div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <TracePlot title="x_n" values={probe.xs} color="#2563eb" />
                                <TracePlot
                                    title="σ_n"
                                    values={probe.sigmas}
                                    color="#dc2626"
                                    yMin={-1.2}
                                    yMax={1.2}
                                />
                                <TracePlot
                                    title={probe.gateLabel}
                                    values={probe.gateAbs}
                                    color="#16a34a"
                                    yMin={0}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-xs text-gray-600">
                    Rendering is CPU-bound. Medium resolution is the best default. High resolution is best after κ/maxIter are settled.
                </div>
            </div>
        </div>
    )
}

// Minimal inline SVG plot (fast + portable)
function TracePlot(props: {
    title: string
    values: number[]
    color: string
    yMin?: number
    yMax?: number
}) {
    const { title, values, color } = props
    const W = 320
    const H = 140
    const pad = 10

    const yMin = props.yMin ?? Math.min(...values)
    const yMax = props.yMax ?? Math.max(...values)
    const denom = yMax - yMin === 0 ? 1 : yMax - yMin

    const pts = values.map((v, i) => {
        const x = pad + (i * (W - 2 * pad)) / Math.max(1, values.length - 1)
        const y = pad + (1 - (v - yMin) / denom) * (H - 2 * pad)
        return `${x.toFixed(2)},${y.toFixed(2)}`
    })

    const poly = pts.join(' ')

    return (
        <div className="border border-gray-200 rounded-xl p-3 overflow-hidden">
            <div className="text-xs font-mono mb-2">{title}</div>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
                <polyline points={poly} fill="none" stroke={color} strokeWidth="1.5" />
            </svg>
            <div className="text-[10px] text-gray-500 font-mono">
                y ∈ [{yMin.toFixed(3)}, {yMax.toFixed(3)}]
            </div>
        </div>
    )
}