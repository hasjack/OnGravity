import { useEffect, useMemo, useState } from "react"
import type { Route } from "./+types/about"

export type GateSign = 1 | -1

export type GateState = {
    sigma: GateSign
    progress: number
}

export type GateParams = {
    deltaHi: number
    deltaLo: number
}

export type GateUpdateInput = {
    aligned: boolean
}

export type GateUpdateResult = {
    state: GateState
    delta: number
    total: number
    crossings: number
    flipped: boolean
}

export function loader({ request }: Route.LoaderArgs) {
    return {
        shareUrl: request.url,
    }
}

export function meta() {
    return [
        { title: "Gate Playground" },
        {
            name: "description",
            content:
                "A browser playground for a minimal progress-state gate with memory, hysteresis, and parity flips.",
        },
    ]
}

export function clampProgress(value: number): number {
    if (!Number.isFinite(value)) return 0
    const wrapped = value % 1
    return wrapped < 0 ? wrapped + 1 : wrapped
}

export function createGateState(
    sigma: GateSign = 1,
    progress = 0
): GateState {
    return {
        sigma,
        progress: clampProgress(progress),
    }
}

export function updateGate(
    state: GateState,
    params: GateParams,
    input: GateUpdateInput
): GateUpdateResult {
    const delta = input.aligned ? params.deltaHi : params.deltaLo
    const total = state.progress + delta
    const crossings = Math.floor(total)
    const flipped = crossings % 2 === 1

    return {
        state: {
            sigma: flipped ? (state.sigma === 1 ? -1 : 1) : state.sigma,
            progress: total - crossings,
        },
        delta,
        total,
        crossings,
        flipped,
    }
}

type LogRow = {
    tick: number
    aligned: boolean
    delta: number
    total: number
    crossings: number
    flipped: boolean
    sigma: GateSign
    progress: number
}

export default function AboutGatePlayground({ loaderData }: Route.ComponentProps) {
    const [gate, setGate] = useState<GateState>(() => createGateState(1, 0))
    const [deltaHi, setDeltaHi] = useState(0.85)
    const [deltaLo, setDeltaLo] = useState(0.2)
    const [aligned, setAligned] = useState(false)
    const [tick, setTick] = useState(0)
    const [lastResult, setLastResult] = useState<GateUpdateResult | null>(null)
    const [history, setHistory] = useState<LogRow[]>([])
    const [autoRun, setAutoRun] = useState(false)

    const params = useMemo<GateParams>(
        () => ({
            deltaHi,
            deltaLo,
        }),
        [deltaHi, deltaLo]
    )

    const step = () => {
        const result = updateGate(gate, params, { aligned })

        const nextTick = tick + 1

        setGate(result.state)
        setTick(nextTick)
        setLastResult(result)
        setHistory((prev) => [
            {
                tick: nextTick,
                aligned,
                delta: result.delta,
                total: result.total,
                crossings: result.crossings,
                flipped: result.flipped,
                sigma: result.state.sigma,
                progress: result.state.progress,
            },
            ...prev,
        ].slice(0, 20))
    }

    const reset = () => {
        setGate(createGateState(1, 0))
        setTick(0)
        setLastResult(null)
        setHistory([])
        setAutoRun(false)
    }

    useEffect(() => {
        if (!autoRun) return

        const id = window.setInterval(() => {
            setGate((currentGate) => {
                const result = updateGate(currentGate, params, { aligned })

                setTick((currentTick) => {
                    const nextTick = currentTick + 1

                    setLastResult(result)
                    setHistory((prev) => [
                        {
                            tick: nextTick,
                            aligned,
                            delta: result.delta,
                            total: result.total,
                            crossings: result.crossings,
                            flipped: result.flipped,
                            sigma: result.state.sigma,
                            progress: result.state.progress,
                        },
                        ...prev,
                    ].slice(0, 20))

                    return nextTick
                })

                return result.state
            })
        }, 400)

        return () => window.clearInterval(id)
    }, [autoRun, params, aligned])

    const progressPercent = `${Math.max(0, Math.min(100, gate.progress * 100))}%`

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#0a0d18",
                color: "#e8edf7",
                fontFamily: "system-ui, sans-serif",
                padding: "2rem",
            }}
        >
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                <h1 style={{ marginTop: 0, fontSize: "2rem" }}>
                    Progress-State Gate Playground
                </h1>

                <p style={{ maxWidth: 760, lineHeight: 1.6, opacity: 0.92 }}>
                    This is a minimal browser sandbox for the gate. The gate stores a sign
                    <strong> σ </strong>
                    and a progress value <strong>p</strong> in <code>[0,1)</code>. Each step
                    adds either <code>deltaHi</code> or <code>deltaLo</code> depending on whether
                    the current input is aligned. When progress crosses an integer boundary, the
                    sign flips on odd crossings.
                </p>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(320px, 420px) 1fr",
                        gap: "1.25rem",
                        alignItems: "start",
                    }}
                >
                    <div
                        style={{
                            background: "#111827",
                            border: "1px solid #263042",
                            borderRadius: 12,
                            padding: "1rem",
                        }}
                    >
                        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Controls</h2>

                        <label
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.4rem",
                                marginBottom: "1rem",
                            }}
                        >
                            <span>deltaHi: {deltaHi.toFixed(2)}</span>
                            <input
                                type="range"
                                min={0}
                                max={1.5}
                                step={0.01}
                                value={deltaHi}
                                onChange={(e) => setDeltaHi(Number(e.target.value))}
                            />
                        </label>

                        <label
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.4rem",
                                marginBottom: "1rem",
                            }}
                        >
                            <span>deltaLo: {deltaLo.toFixed(2)}</span>
                            <input
                                type="range"
                                min={0}
                                max={1.5}
                                step={0.01}
                                value={deltaLo}
                                onChange={(e) => setDeltaLo(Number(e.target.value))}
                            />
                        </label>

                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.6rem",
                                marginBottom: "1rem",
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={aligned}
                                onChange={(e) => setAligned(e.target.checked)}
                            />
                            aligned input
                        </label>

                        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                            <button
                                onClick={step}
                                style={buttonStyle("#2d7fff")}
                            >
                                Step
                            </button>

                            <button
                                onClick={() => setAutoRun((v) => !v)}
                                style={buttonStyle(autoRun ? "#c26d00" : "#374151")}
                            >
                                {autoRun ? "Stop auto" : "Start auto"}
                            </button>

                            <button
                                onClick={reset}
                                style={buttonStyle("#444")}
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    <div
                        style={{
                            background: "#111827",
                            border: "1px solid #263042",
                            borderRadius: 12,
                            padding: "1rem",
                        }}
                    >
                        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>State</h2>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                                gap: "0.75rem",
                                marginBottom: "1rem",
                            }}
                        >
                            <StatCard label="tick" value={String(tick)} />
                            <StatCard label="sigma" value={gate.sigma === 1 ? "+1" : "-1"} />
                            <StatCard label="progress" value={gate.progress.toFixed(3)} />
                        </div>

                        <div style={{ marginBottom: "0.5rem", fontSize: "0.9rem", opacity: 0.85 }}>
                            progress
                        </div>
                        <div
                            style={{
                                width: "100%",
                                height: 18,
                                background: "#0b1220",
                                border: "1px solid #263042",
                                borderRadius: 999,
                                overflow: "hidden",
                                marginBottom: "1rem",
                            }}
                        >
                            <div
                                style={{
                                    width: progressPercent,
                                    height: "100%",
                                    background: gate.sigma === 1 ? "#2d7fff" : "#ff6b6b",
                                    transition: "width 120ms linear",
                                }}
                            />
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                                gap: "0.75rem",
                            }}
                        >
                            <StatCard
                                label="last delta"
                                value={lastResult ? lastResult.delta.toFixed(2) : "—"}
                            />
                            <StatCard
                                label="last total"
                                value={lastResult ? lastResult.total.toFixed(2) : "—"}
                            />
                            <StatCard
                                label="crossings"
                                value={lastResult ? String(lastResult.crossings) : "—"}
                            />
                            <StatCard
                                label="flipped"
                                value={lastResult ? (lastResult.flipped ? "yes" : "no") : "—"}
                            />
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        marginTop: "1.25rem",
                        background: "#111827",
                        border: "1px solid #263042",
                        borderRadius: 12,
                        padding: "1rem",
                    }}
                >
                    <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Recent history</h2>

                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: "0.92rem",
                            }}
                        >
                            <thead>
                                <tr style={{ textAlign: "left", borderBottom: "1px solid #263042" }}>
                                    <th style={thStyle}>tick</th>
                                    <th style={thStyle}>aligned</th>
                                    <th style={thStyle}>delta</th>
                                    <th style={thStyle}>total</th>
                                    <th style={thStyle}>crossings</th>
                                    <th style={thStyle}>flipped</th>
                                    <th style={thStyle}>sigma</th>
                                    <th style={thStyle}>progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{ padding: "0.9rem 0", opacity: 0.65 }}>
                                            No steps yet.
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((row) => (
                                        <tr
                                            key={row.tick}
                                            style={{ borderBottom: "1px solid rgba(38, 48, 66, 0.5)" }}
                                        >
                                            <td style={tdStyle}>{row.tick}</td>
                                            <td style={tdStyle}>{row.aligned ? "true" : "false"}</td>
                                            <td style={tdStyle}>{row.delta.toFixed(2)}</td>
                                            <td style={tdStyle}>{row.total.toFixed(2)}</td>
                                            <td style={tdStyle}>{row.crossings}</td>
                                            <td style={tdStyle}>{row.flipped ? "yes" : "no"}</td>
                                            <td style={tdStyle}>{row.sigma === 1 ? "+1" : "-1"}</td>
                                            <td style={tdStyle}>{row.progress.toFixed(3)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <p style={{ marginTop: "1rem", opacity: 0.65, fontSize: "0.9rem" }}>
                    shareUrl: {loaderData.shareUrl.replace("http://", "https://")}
                </p>
            </div>
        </div>
    )
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div
            style={{
                background: "#0b1220",
                border: "1px solid #263042",
                borderRadius: 10,
                padding: "0.8rem",
            }}
        >
            <div style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "0.35rem" }}>
                {label}
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{value}</div>
        </div>
    )
}

function buttonStyle(background: string): React.CSSProperties {
    return {
        padding: "0.55rem 0.9rem",
        borderRadius: 8,
        border: "none",
        background,
        color: "#fff",
        cursor: "pointer",
        fontWeight: 600,
    }
}

const thStyle: React.CSSProperties = {
    padding: "0 0 0.75rem",
    opacity: 0.75,
    fontWeight: 600,
}

const tdStyle: React.CSSProperties = {
    padding: "0.75rem 0",
}