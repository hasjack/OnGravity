import { useRef, useEffect, useState, useCallback } from "react"

import { H2, P } from '~/components/Typography'
import Share from "~/components/Share"
import { Route } from './+types/GalaxyToy'
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
const ESCAPE_RADIUS = 20
const ROT_BINS = 16

function gKappaToy(r: number, k0: number): number {
    const newton = 1 / (r * r)
    const kappa = k0 / (1 + r * r)
    const boost = Math.exp(kappa * r)
    return newton * boost
}

function applySpiralPerturbation(
    g: number,
    x: number,
    y: number,
    t: number,
    epsilon: number,
    omega: number
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
        { id: "stable", label: "Stable Spirals", k0: 0.15, epsilon: 0.04, omega: 0.25 },
        { id: "chaos", label: "Chaotic Galaxy", k0: 0.35, epsilon: 0.06, omega: 0.5 },
        { id: "kdrive", label: "K-Drive", k0: 0.7, epsilon: 0.06, omega: 0.5 },
        { id: "hose", label: "Hosepipe", k0: 1.3, epsilon: 0.08, omega: 0.3 },
    ]

export function meta({ location }: Route.MetaArgs) {
    const title = "κ-Framework | Simulation: Galaxy Toy";
    const description = "A unified empirical framework for dynamical systems and weak-field gravity. This component shows a stylised disc galaxy under either a simple Newtonian central force or a toy κ-boosted response. A rotating non-axisymmetric perturbation is added to encourage visible spiral, bar-like, and dispersive structure.";
    const url = `https://halfasecond.com${location.pathname}`;

    return [
        { title },
        { name: "description", content: description },

        // OpenGraph / Facebook
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: "https://cdn.halfasecond.com/images/onGravity/toy-galaxy-16-10.jpg" },

        // Twitter
        { name: "twitter:card", content: "https://cdn.halfasecond.com/images/onGravity/toy-galaxy-16-10.jpg" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "keywords", content: "kappa framework, natural mathematics, dynamical systems, galaxy rotation curves, SPARC dataset, N-body simulation, numerical diagnostics, Jack Pickett" }
    ];
}

export function loader({ request }: Route.LoaderArgs) {
    return {
        shareUrl: request.url,
    }
}

export default function Universe({ loaderData }: Route.ComponentProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const particlesRef = useRef<Particle[]>([])
    const animRef = useRef<number | null>(null)

    const [mode, setMode] = useState<Mode>("kappa")
    const [k0, setK0] = useState(0.15)
    const [epsilon, setEpsilon] = useState(0.04)
    const [omega, setOmega] = useState(0.25)
    const [preset, setPreset] = useState<PresetId | null>("stable")
    const [timeMyr, setTimeMyr] = useState(0)
    const [stats, setStats] = useState<Stats>({ total: 0, inner: 0, outer: 0 })
    const [rotCurve, setRotCurve] = useState<number[]>([])
    const [starCount, setStarCount] = useState(50000)
    const [introOpen, setIntroOpen] = useState(true)

    const modeRef = useRef<Mode>("kappa")
    const k0Ref = useRef(0.15)
    const epsilonRef = useRef(0.04)
    const omegaRef = useRef(0.25)
    const timeRef = useRef(0)
    const needsClearRef = useRef(false)

    const numParticles = starCount
    const rMin = 0.5
    const rMax = 10
    const G = 1
    const M = 1
    const dt = 0.02

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

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        let width = canvas.clientWidth
        let height = canvas.clientHeight

        const draw = () => {
            if (needsClearRef.current) {
                ctx.fillStyle = "rgba(5, 5, 16, 1)"
                ctx.fillRect(0, 0, width, height)
                needsClearRef.current = false
            } else {
                ctx.fillStyle = "rgba(5, 5, 16, 0.18)"
                ctx.fillRect(0, 0, width, height)
            }

            ctx.save()
            ctx.translate(width / 2, height / 2)

            const scale = Math.min(width, height) / (2 * rMax * 1.2)
            ctx.scale(scale, scale)

            ctx.fillStyle = "#ffb15a"
            ctx.beginPath()
            ctx.arc(0, 0, 0.2, 0, Math.PI * 2)
            ctx.fill()

            ctx.fillStyle = "#9ad3ff"
            for (const p of particlesRef.current) {
                ctx.beginPath()
                ctx.arc(p.pos.x, p.pos.y, 0.005, 0, Math.PI * 2)
                ctx.fill()
            }

            ctx.restore()
        }

        const resize = () => {
            width = canvas.clientWidth
            height = canvas.clientHeight
            canvas.width = width
            canvas.height = height
            needsClearRef.current = true
            draw()
        }

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
                    omegaRef.current
                )

                const ax = -g * (p.pos.x / r)
                const ay = -g * (p.pos.y / r)

                p.vel.x += ax * dt
                p.vel.y += ay * dt
                p.pos.x += p.vel.x * dt
                p.pos.y += p.vel.y * dt
            }
        }

        resize()
        window.addEventListener("resize", resize)

        makeParticles()
        draw()

        if (!introOpen) {
            const loop = () => {
                step()
                draw()
                animRef.current = requestAnimationFrame(loop)
            }
            loop()
        }

        return () => {
            window.removeEventListener("resize", resize)
            if (animRef.current !== null) {
                cancelAnimationFrame(animRef.current)
            }
        }
    }, [G, M, rMax, dt, makeParticles, introOpen])

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
                    const bin = Math.min(ROT_BINS - 1, Math.floor((r / rMax) * ROT_BINS))
                    vtSums[bin] += vt
                    counts[bin]++
                }
            }

            const vtAvg = vtSums.map((s, i) => (counts[i] > 0 ? s / counts[i] : 0))

            setStats({ total: parts.length, inner, outer })
            setRotCurve(vtAvg)
        }, 200)

        return () => clearInterval(id)
    }, [rMax])

    useEffect(() => {
        modeRef.current = mode
        k0Ref.current = k0
        epsilonRef.current = epsilon
        omegaRef.current = omega
        makeParticles()
    }, [mode, k0, epsilon, omega, makeParticles])

    const applyPreset = (id: PresetId) => {
        const p = PRESETS.find((preset) => preset.id === id)
        if (!p) return

        setPreset(id)
        setK0(p.k0)
        setEpsilon(p.epsilon)
        setOmega(p.omega)
    }

    const currentPresetLabel =
        preset && PRESETS.find((p) => p.id === preset)?.label

    const maxV = rotCurve.length ? Math.max(...rotCurve) : 0

    return (
        <section
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                width: "100%",
                background: "#050510",
                color: "#eee",
            }}
        >
            {!introOpen && (
                <div className="fixed top-4 right-4 z-10 flex gap-1 print:hidden">
                    <Share title={"κ-Framework | Simulation: Galaxy Toy"} shareUrl={loaderData.shareUrl.replace("http://", "https://")} />
                </div>
            )}
            <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
                <canvas
                    ref={canvasRef}
                    style={{ width: "100%", height: "100%", display: "block" }}
                />

                {!introOpen && (
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
                            N: {stats.total} &nbsp; inner: {stats.inner} &nbsp; outer: {stats.outer}
                        </div>

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
                                            height: maxV > 0 ? `${(v / maxV) * 40}px` : "0px",
                                            background: "#4a9cff",
                                            opacity: 0.9,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {introOpen && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(0, 0, 0, 0.6)",
                            padding: "1.5rem",
                            zIndex: 10,
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                maxWidth: 760,
                                background: "rgba(10, 14, 28, 0.96)",
                                border: "1px solid #2a3555",
                                borderRadius: 12,
                                padding: "1.25rem 1.25rem 1rem",
                                boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
                            }}
                        >
                            <H2 style={{ margin: "0 0 0.75rem", fontSize: "1.25rem" }}>
                                Toy galaxy simulator
                            </H2>

                            <div style={{ fontSize: "0.95rem", lineHeight: 1.6, opacity: 0.92 }}>
                                <P style={{ marginTop: 0 }}>
                                    This component shows a stylised disc galaxy under either a simple
                                    Newtonian central force or a toy κ-boosted response. A rotating
                                    non-axisymmetric perturbation is added to encourage visible spiral,
                                    bar-like, and dispersive structure.
                                </P>

                                <P>
                                    The controls let you switch between Newton and κ mode, adjust κ,
                                    choose a preset regime, and change the number of stars. It is a
                                    qualitative visual sandbox rather than a calibrated astrophysical
                                    model, but it is useful for exploring how different response
                                    strengths change the morphology of the disc.
                                </P>

                                <P style={{ marginBottom: "1rem" }}>
                                    The default scene is already visible behind this panel with{" "}
                                    <strong>{starCount.toLocaleString()}</strong> stars laid out. Close
                                    this intro to start the simulation.
                                </P>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "0.75rem",
                                }}
                            >
                                <button
                                    onClick={() => setIntroOpen(false)}
                                    style={{
                                        padding: "0.55rem 0.9rem",
                                        borderRadius: 6,
                                        border: "none",
                                        cursor: "pointer",
                                        background: "#2d7fff",
                                        color: "#fff",
                                        fontWeight: 600,
                                    }}
                                >
                                    Start simulation
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {!introOpen && (
                <>
                    <div
                        style={{
                            padding: "0.25rem 1rem 0.5rem",
                            background: "#111",
                            borderTop: "1px solid #222",
                            display: "flex",
                            gap: "0.5rem",
                            alignItems: "center",
                            fontSize: "0.8rem",
                            flexWrap: "wrap",
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
                    </div>

                    <div
                        style={{
                            padding: "0.5rem 1rem",
                            background: "#111",
                            borderTop: "1px solid #222",
                            display: "flex",
                            gap: "1rem",
                            alignItems: "center",
                            fontSize: "0.85rem",
                            flexWrap: "wrap",
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

                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                            }}
                        >
                            stars:
                            <input
                                type="range"
                                min={1000}
                                max={100000}
                                step={1000}
                                value={starCount}
                                onChange={(e) => {
                                    setStarCount(Number(e.target.value))
                                }}
                                style={{ width: 200 }}
                            />
                            <span>{starCount.toLocaleString()}</span>
                        </label>

                        <span style={{ marginLeft: "auto", opacity: 0.85 }}>
                            t ≈ {timeMyr.toFixed(1)} Myr
                        </span>
                    </div>
                </>
            )}
        </section>
    )
}