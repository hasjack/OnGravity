import { useEffect, useMemo, useRef, useState } from 'react'

type Results = {
    S: number
    Eab: number
    Eabp: number
    Eapb: number
    Eapbp: number
}

function clamp(x: number, lo: number, hi: number) {
    return Math.min(hi, Math.max(lo, x))
}

function angleDiff(theta: number, lam: number) {
    // smallest absolute angular separation on [-π, π) circle
    let d = Math.abs(theta - lam)
    d = d % (2 * Math.PI)
    return Math.min(d, 2 * Math.PI - d)
}

export default function BellToyInteractive() {
    // Note defaults: w swept; δ is two-level {0.85, 0.20}
    const [w, setW] = useState(Math.PI / 4)
    const [deltaHigh, setDeltaHigh] = useState(0.85)
    const [deltaLow, setDeltaLow] = useState(0.20)
    const [nSamples, setNSamples] = useState(100000)

    const [results, setResults] = useState<Results>({
        S: 0,
        Eab: 0,
        Eabp: 0,
        Eapb: 0,
        Eapbp: 0,
    })

    // Fixed CHSH settings used in the note
    const settings = useMemo(
        () => ({ a: 0, b: Math.PI / 4, bp: -Math.PI / 4, ap: Math.PI / 2 }),
        []
    )

    const timerRef = useRef<number | null>(null)

    useEffect(() => {
        if (timerRef.current !== null) window.clearTimeout(timerRef.current)

        timerRef.current = window.setTimeout(() => {
            // Local response rule from the note:
            // δ = 0.85 if d < w, else 0.20 (or whatever the advanced controls set)
            function delta(setting: number, lam: number) {
                const d = angleDiff(setting, lam)
                return d < w ? deltaHigh : deltaLow
            }

            // Guard: lemma assumes δ ∈ [0,1)
            const dHi = clamp(deltaHigh, 0, 0.999999)
            const dLo = clamp(deltaLow, 0, 0.999999)

            const sigma0 = new Int8Array(nSamples)
            const p0 = new Float64Array(nSamples)
            const lam = new Float64Array(nSamples)

            for (let i = 0; i < nSamples; i++) {
                sigma0[i] = Math.random() < 0.5 ? -1 : 1
                p0[i] = Math.random()
                lam[i] = Math.random() * 2 * Math.PI - Math.PI // [-π, π)
            }

            const E: Record<string, number> = {}
            const pairs = [
                ['ab', 'a', 'b'],
                ['abp', 'a', 'bp'],
                ['apb', 'ap', 'b'],
                ['apbp', 'ap', 'bp'],
            ] as const

            for (const [key, th1, th2] of pairs) {
                let sum = 0
                const t1 = settings[th1]
                const t2 = settings[th2]

                for (let i = 0; i < nSamples; i++) {
                    const daRaw = delta(t1, lam[i])
                    const dbRaw = delta(t2, lam[i])

                    // Apply lemma-friendly clamps (keeps UI flexible, stays inside [0,1))
                    const da = daRaw === deltaHigh ? dHi : dLo
                    const db = dbRaw === deltaHigh ? dHi : dLo

                    const Ta = p0[i] + da
                    const Tb = p0[i] + db

                    // Overflow parity flip
                    const sigmaA = sigma0[i] * (Math.floor(Ta) % 2 === 0 ? 1 : -1)
                    const sigmaB = sigma0[i] * (Math.floor(Tb) % 2 === 0 ? 1 : -1)

                    sum += sigmaA * sigmaB
                }

                E[key] = sum / nSamples
            }

            const S = E.ab + E.abp + E.apb - E.apbp

            setResults({
                S: Number(S.toFixed(4)),
                Eab: Number(E.ab.toFixed(4)),
                Eabp: Number(E.abp.toFixed(4)),
                Eapb: Number(E.apb.toFixed(4)),
                Eapbp: Number(E.apbp.toFixed(4)),
            })
        }, 120)

        return () => {
            if (timerRef.current !== null) window.clearTimeout(timerRef.current)
        }
    }, [w, deltaHigh, deltaLow, nSamples, settings])

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-white w-full">
            <div className="space-y-8">
                {/* Core slider: w */}
                <div>
                    <label className="flex justify-between text-sm mb-1">
                        <span>Response window w (rad)</span>
                        <span className="font-mono">{w.toFixed(3)}</span>
                    </label>
                    <input
                        type="range"
                        min={Math.PI / 6}
                        max={Math.PI / 3}
                        step={0.01}
                        value={w}
                        onChange={(e) => setW(parseFloat(e.target.value))}
                        className="w-full accent-blue-600"
                    />
                </div>

                {/* Advanced controls (optional) */}
                <div className="text-sm">
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="flex justify-between text-sm mb-1">
                                <span>δ high (in-window)</span>
                                <span className="font-mono">{deltaHigh.toFixed(3)}</span>
                            </label>
                            <input
                                type="range"
                                min={0.0}
                                max={0.99}
                                step={0.01}
                                value={deltaHigh}
                                onChange={(e) => {
                                    const nextHigh = parseFloat(e.target.value)
                                    // enforce: deltaHigh >= deltaLow
                                    setDeltaHigh(Math.max(nextHigh, deltaLow))
                                }}
                                className="w-full accent-blue-600"
                            />
                        </div>

                        <div>
                            <label className="flex justify-between text-sm mb-1">
                                <span>δ low (out-of-window)</span>
                                <span className="font-mono">{deltaLow.toFixed(3)}</span>
                            </label>
                            <input
                                type="range"
                                min={0.0}
                                max={0.99}
                                step={0.01}
                                value={deltaLow}
                                onChange={(e) => {
                                    const nextLow = parseFloat(e.target.value)
                                    // enforce: deltaLow <= deltaHigh
                                    setDeltaLow(Math.min(nextLow, deltaHigh))
                                }}
                                className="w-full accent-blue-600"
                            />
                        </div>

                        <div>
                            <label className="flex justify-between text-sm mb-1">
                                <span>Samples</span>
                                <span className="font-mono">{nSamples.toLocaleString()}</span>
                            </label>
                            <input
                                type="range"
                                min={20000}
                                max={200000}
                                step={10000}
                                value={nSamples}
                                onChange={(e) => setNSamples(parseInt(e.target.value, 10))}
                                className="w-full accent-blue-600"
                            />
                        </div>

                        <div className="text-xs text-gray-600">
                            Lemma assumptions: δ ∈ [0,1). The sliders enforce this.
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="rounded-xl p-6 font-mono text-sm">
                    <div className="mb-4">
                        <span className="font-semibold">CHSH S = </span>
                        <span className="text-2xl text-blue-600">{results.S}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        <div>E(ab)   = {results.Eab}</div>
                        <div>E(ab')  = {results.Eabp}</div>
                        <div>E(a'b)  = {results.Eapb}</div>
                        <div>E(a'b') = {results.Eapbp}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}