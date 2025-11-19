// src/Universe.tsx
import React, {
    useRef,
    useEffect,
    useState,
    useCallback,
} from "react"

type Mode = "newton" | "kappa"
type Vec2 = { x: number; y: number }
type Particle = { pos: Vec2; vel: Vec2 }

type PresetId = "stable" | "chaos" | "kdrive" | "hose"

type Stats = {
    total: number
    inner: number
    outer: number
}

const MYR_PER_SIM_UNIT = 50
const ESCAPE_RADIUS = 20 // for stats only
const ROT_BINS = 16

// ---- toy κ gravity (dimensionless) ----
function gKappaToy(r: number, k0: number): number {
    const newton = 1 / (r * r)
    const kappa = k0 / (1 + r * r)
    const boost = Math.exp(kappa * r)
    return newton * boost
}

// rotating non-axisymmetric perturbation (m = 2)
function applySpiralPerturbation(
    g: number,
    x: number,
    y: number,
    t: number,
    epsilon: number,
    omega: number,
): number {
    const m = 2
    const theta = Math.atan2(y, x)
    const phase = theta - omega * t
    const perturb = 1 + epsilon * Math.cos(m * phase)
    return g * perturb
}

const PRESETS: {
    id: PresetId
    label: string
    k0: number
    epsilon: number
    omega: number
}[] = [
        {
            id: "stable",
            label: "Stable Spirals",
            k0: 0.15,
            epsilon: 0.04,
            omega: 0.25,
        },
        {
            id: "chaos",
            label: "Chaotic Galaxy",
            k0: 0.35,
            epsilon: 0.06,
            omega: 0.5,
        },
        {
            id: "kdrive",
            label: "K-Drive",
            k0: 0.7,
            epsilon: 0.06,
            omega: 0.5,
        },
        {
            id: "hose",
            label: "Hosepipe",
            k0: 1.3,
            epsilon: 0.08,
            omega: 0.3,
        },
    ]

const Universe: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const particlesRef = useRef<Particle[]>([])
    const animRef = useRef<number | null>(null)

    // UI state
    const [mode, setMode] = useState<Mode>("kappa")
    const [k0, setK0] = useState(0.35)
    const [epsilon, setEpsilon] = useState(0.06)
    const [omega, setOmega] = useState(0.5)
    const [preset, setPreset] = useState<PresetId | null>("chaos")
    const [timeMyr, setTimeMyr] = useState(0)
    const [stats, setStats] = useState<Stats>({ total: 0, inner: 0, outer: 0 })
    const [rotCurve, setRotCurve] = useState<number[]>([])

    // physics refs
    const modeRef = useRef<Mode>("kappa")
    const k0Ref = useRef(0.35)
    const epsilonRef = useRef(0.06)
    const omegaRef = useRef(0.5)
    const timeRef = useRef(0)
    const needsClearRef = useRef(false)

    // sim settings
    const numParticles = 100000
    const rMin = 0.5
    const rMax = 10
    const G = 1
    const M = 1
    const dt = 0.02

    // ---- initialise / re-initialise particles ----
    const makeParticles = useCallback(() => {
        const arr: Particle[] = []

        for (let i = 0; i < numParticles; i++) {
            const u = Math.random()
            const radius = rMin + (rMax - rMin) * Math.sqrt(u)
            const angle = Math.random() * Math.PI * 2

            let g0: number
            if (modeRef.current === "newton") {
                g0 = (G * M) / (radius * radius)
            } else {
                g0 = gKappaToy(radius, k0Ref.current)
            }

            const vCirc = Math.sqrt(g0 * radius)

            const pos: Vec2 = {
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
            }

            const vel: Vec2 = {
                x: -vCirc * Math.sin(angle) * 0.25,
                y: vCirc * Math.cos(angle) * 0.25,
            }

            arr.push({ pos, vel })
        }

        particlesRef.current = arr
        timeRef.current = 0
        setTimeMyr(0)
        needsClearRef.current = true
    }, [numParticles, rMin, rMax, G, M])

    // ---- main animation loop ----
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let width = canvas.clientWidth
        let height = canvas.clientHeight

        const resize = () => {
            width = canvas.clientWidth
            height = canvas.clientHeight
            canvas.width = width
            canvas.height = height
            needsClearRef.current = true
        }

        resize()
        window.addEventListener("resize", resize)

        const step = () => {
            const parts = particlesRef.current
            timeRef.current += dt

            for (const p of parts) {
                const r = Math.hypot(p.pos.x, p.pos.y)
                if (r === 0) continue

                let g: number
                if (modeRef.current === "newton") {
                    g = (G * M) / (r * r)
                } else {
                    g = gKappaToy(r, k0Ref.current)
                }

                g = applySpiralPerturbation(
                    g,
                    p.pos.x,
                    p.pos.y,
                    timeRef.current,
                    epsilonRef.current,
                    omegaRef.current,
                )

                const ax = -g * (p.pos.x / r)
                const ay = -g * (p.pos.y / r)

                p.vel.x += ax * dt
                p.vel.y += ay * dt

                p.pos.x += p.vel.x * dt
                p.pos.y += p.vel.y * dt
            }
        }

        const draw = () => {
            if (needsClearRef.current) {
                ctx.fillStyle = "rgba(5, 5, 16, 1)"
                ctx.fillRect(0, 0, width, height)
                needsClearRef.current = false
            } else {
                // trails
                ctx.fillStyle = "rgba(5, 5, 16, 0.18)"
                ctx.fillRect(0, 0, width, height)
            }

            ctx.save()
            ctx.translate(width / 2, height / 2)
            const scale = Math.min(width, height) / (2 * rMax * 1.2)
            ctx.scale(scale, scale)

            // centre
            ctx.fillStyle = "#ffb15a"
            ctx.beginPath()
            ctx.arc(0, 0, 0.2, 0, Math.PI * 2)
            ctx.fill()

            // stars
            ctx.fillStyle = "#9ad3ff"
            for (const p of particlesRef.current) {
                ctx.beginPath()
                ctx.arc(p.pos.x, p.pos.y, 0.005, 0, Math.PI * 2)
                ctx.fill()
            }

            ctx.restore()
        }

        makeParticles()
        const loop = () => {
            step()
            draw()
            animRef.current = requestAnimationFrame(loop)
        }
        loop()

        return () => {
            window.removeEventListener("resize", resize)
            if (animRef.current !== null) cancelAnimationFrame(animRef.current)
        }
    }, [G, M, rMax, dt, makeParticles])

    // ---- timer + stats + rotation curve HUD ----
    useEffect(() => {
        const id = setInterval(() => {
            const t = timeRef.current
            setTimeMyr(t * MYR_PER_SIM_UNIT)

            const parts = particlesRef.current
            let inner = 0
            let outer = 0

            const vtSums = Array(ROT_BINS).fill(0)
            const counts = Array(ROT_BINS).fill(0)

            for (const p of parts) {
                const x = p.pos.x
                const y = p.pos.y
                const vx = p.vel.x
                const vy = p.vel.y

                const r = Math.hypot(x, y)
                if (r < rMax * 1.2) inner++
                else if (r < ESCAPE_RADIUS) outer++

                if (r > 0 && r < rMax) {
                    const v2 = vx * vx + vy * vy
                    const vr = (vx * x + vy * y) / r
                    const vt = Math.sqrt(Math.max(v2 - vr * vr, 0))
                    const bin = Math.min(
                        ROT_BINS - 1,
                        Math.floor((r / rMax) * ROT_BINS),
                    )
                    vtSums[bin] += vt
                    counts[bin]++
                }
            }

            const vtAvg = vtSums.map((s, i) =>
                counts[i] > 0 ? s / counts[i] : 0,
            )

            setStats({ total: parts.length, inner, outer })
            setRotCurve(vtAvg)
        }, 200)

        return () => clearInterval(id)
    }, [rMax])

    // ---- sync physics refs + reset when controls change ----
    useEffect(() => {
        modeRef.current = mode
        k0Ref.current = k0
        epsilonRef.current = epsilon
        omegaRef.current = omega
        makeParticles()
    }, [mode, k0, epsilon, omega, makeParticles])

    // ---- presets ----
    const applyPreset = (id: PresetId) => {
        const p = PRESETS.find((p) => p.id === id)
        if (!p) return
        setPreset(id)
        setK0(p.k0)
        setEpsilon(p.epsilon)
        setOmega(p.omega)
    }

    const currentPresetLabel =
        preset && PRESETS.find((p) => p.id === preset)?.label

    // ---- snapshot ----
    const handleSnapshot = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const url = canvas.toDataURL("image/png")
        const win = window.open()
        if (win) {
            win.document.write(
                `<img src="${url}" style="width:100%;height:auto;background:#050510;" />`,
            )
        }
    }

    const maxV = rotCurve.length ? Math.max(...rotCurve) : 0

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                width: "100%",          // full-screen awesome-ness
                background: "#050510",
                color: "#eee",
                fontFamily: "system-ui, sans-serif",
            }}
        >
            {/* top controls */}
            <div
                style={{
                    padding: "0.5rem 1rem",
                    background: "#111",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    fontSize: "0.85rem",
                }}
            >
                <button
                    onClick={() => setMode("newton")}
                    style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: 4,
                        border: "none",
                        cursor: "pointer",
                        background: mode === "newton" ? "#2d7fff" : "#333",
                        color: "#eee",
                    }}
                >
                    Newton
                </button>
                <button
                    onClick={() => setMode("kappa")}
                    style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: 4,
                        border: "none",
                        cursor: "pointer",
                        background: mode === "kappa" ? "#2d7fff" : "#333",
                        color: "#eee",
                    }}
                >
                    κ
                </button>

                <label
                    style={{
                        marginLeft: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                    }}
                >
                    κ boost:
                    <input
                        type="range"
                        min={0}
                        max={3}
                        step={0.01}
                        value={k0}
                        onChange={(e) => {
                            setPreset(null)
                            setK0(Number(e.target.value))
                        }}
                        style={{ width: 200 }}
                    />
                    <span>{k0.toFixed(2)}</span>
                </label>

                <span style={{ marginLeft: "auto", opacity: 0.85 }}>
                    t ≈ {timeMyr.toFixed(1)} Myr
                </span>
            </div>

            {/* presets + snapshot */}
            <div
                style={{
                    padding: "0.25rem 1rem 0.5rem",
                    background: "#111",
                    borderTop: "1px solid #222",
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    fontSize: "0.8rem",
                }}
            >
                <span style={{ opacity: 0.8 }}>Presets:</span>
                {PRESETS.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => applyPreset(p.id)}
                        style={{
                            padding: "0.2rem 0.6rem",
                            borderRadius: 4,
                            border: "none",
                            cursor: "pointer",
                            background: preset === p.id ? "#4a9cff" : "#333",
                            color: "#eee",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {p.label}
                    </button>
                ))}
                <button
                    onClick={handleSnapshot}
                    style={{
                        marginLeft: "auto",
                        padding: "0.2rem 0.6rem",
                        borderRadius: 4,
                        border: "none",
                        cursor: "pointer",
                        background: "#444",
                        color: "#eee",
                        whiteSpace: "nowrap",
                    }}
                >
                    Snapshot PNG
                </button>
            </div>

            <div style={{ position: "relative", flex: 1 }}>
                <canvas
                    ref={canvasRef}
                    style={{ width: "100%", height: "100%", display: "block" }}
                />
                {/* HUD overlay */}
                <div
                    style={{
                        position: "absolute",
                        left: 12,
                        bottom: 10,
                        padding: "0.4rem 0.6rem",
                        background: "rgba(0,0,0,0.45)",
                        borderRadius: 6,
                        fontSize: "0.75rem",
                        lineHeight: 1.4,
                    }}
                >
                    <div>
                        mode: <strong>{mode}</strong>
                    </div>
                    {currentPresetLabel && (
                        <div>
                            preset: <strong>{currentPresetLabel}</strong>
                        </div>
                    )}
                    <div>
                        N: {stats.total} &nbsp; inner: {stats.inner} &nbsp; outer:{" "}
                        {stats.outer}
                    </div>

                    {/* rotation curve mini-chart */}
                    <div style={{ marginTop: 4 }}>
                        <div style={{ opacity: 0.8, marginBottom: 2 }}>vₜ(r)</div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-end",
                                gap: 1,
                                height: 40,
                                width: 120,
                            }}
                        >
                            {rotCurve.map((v, i) => (
                                <div
                                    key={i}
                                    style={{
                                        flex: "1 1 auto",
                                        height:
                                            maxV > 0 ? `${(v / maxV) * 40}px` : "0px",
                                        background: "#4a9cff",
                                        opacity: 0.9,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Universe
