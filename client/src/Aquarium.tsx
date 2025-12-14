// src/Aquarium.tsx  ← updated with pause-on-start + start prompt
import React, { useRef, useEffect, useState, useCallback } from "react";

type Vec2 = { x: number; y: number };
type Fish = { pos: Vec2; vel: Vec2; color: string };

const PRESETS = [
    { id: "loose", label: "Loose School", k0: 0.30, align: 0.8 },
    { id: "torpedo", label: "Torpedo", k0: 0.65, align: 1.2 },
    { id: "baitball", label: "Bait Ball", k0: 1.10, align: 1.0 },
    { id: "vortex", label: "Vortex", k0: 0.80, align: 2.2 },
    { id: "flash", label: "Flash Expansion", k0: 0.45, align: 0.9 },
] as const;

type PresetId = typeof PRESETS[number]["id"];

const Aquarium: React.FC<{ showUI?: boolean; showAquarium?: boolean;  simActive: boolean; setSimActive: (active: boolean) => void }> = ({ 
    showUI = true, 
    showAquarium = true,
    simActive, 
    setSimActive 
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fishRef = useRef<Fish[]>([]);
    const animRef = useRef<number>(0);
    const predatorRef = useRef<{ x: number; y: number; age: number } | null>(null);

    const [k0, setK0] = useState(0.65);
    const [align, setAlign] = useState(1.2);
    const [preset, setPreset] = useState<PresetId | null>("torpedo");
    const [time, setTime] = useState(0);

    const k0Ref = useRef(k0);
    const alignRef = useRef(align);
    useEffect(() => { k0Ref.current = k0; alignRef.current = align; }, [k0, align]);

    const initFish = useCallback(() => {
        const fish: Fish[] = [];
        const N = 100;
        const hue = Math.random() * 360;
        for (let i = 0; i < N; i++) {
            const a = (i / N) * Math.PI * 2 + Math.random() * 0.3;
            const r = 15 + Math.random() * 55;
            fish.push({
                pos: { x: r * Math.cos(a), y: r * Math.sin(a) },
                vel: { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 },
                color: `hsl(${hue + (i / N) * 50}, 85%, 65%)`,
            });
        }
        fishRef.current = fish;
        setTime(0);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !simActive || !showAquarium) {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const resize = () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        };
        window.addEventListener("resize", resize);
        initFish();

        const loop = () => {
            const fishes = fishRef.current;
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const scale = Math.min(canvas.width, canvas.height) / 340;

            ctx.fillStyle = "rgba(0, 0, 15, 0.035)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // === PHYSICS ===
            for (const f of fishes) {
                let ax = 0, ay = 0;
                let alignX = 0, alignY = 0, neighbors = 0;

                for (const g of fishes) {
                    if (g === f) continue;
                    const dx = g.pos.x - f.pos.x;
                    const dy = g.pos.y - f.pos.y;
                    const r = Math.hypot(dx, dy) || 0.001;

                    if (r < 5) { ax -= dx / r * 2; ay -= dy / r * 2; }
                    if (r > 10 && r < 100) {
                        const force = Math.exp(k0Ref.current * r * 0.018) / r;
                        ax += (dx / r) * force * 1.1;
                        ay += (dy / r) * force * 1.1;
                    }
                    if (r < 32) {
                        alignX += g.vel.x;
                        alignY += g.vel.y;
                        neighbors++;
                    }
                }

                if (neighbors > 0) {
                    const mag = Math.hypot(alignX, alignY);
                    if (mag > 0) {
                        ax += (alignX / mag) * alignRef.current * 0.5;
                        ay += (alignY / mag) * alignRef.current * 0.5;
                    }
                }

                const distFromCenter = Math.hypot(f.pos.x, f.pos.y);
                if (distFromCenter > 145) {
                    const excess = distFromCenter - 145;
                    const pull = 0.00018 * excess * excess;
                    ax -= f.pos.x * pull;
                    ay -= f.pos.y * pull;
                }

                if (predatorRef.current) {
                    const px = (predatorRef.current.x - cx) / scale;
                    const py = (predatorRef.current.y - cy) / scale;
                    const dx = f.pos.x - px;
                    const dy = f.pos.y - py;
                    const r = Math.hypot(dx, dy) || 0.001;
                    if (r < 140) {
                        const strength = (140 - r) * 0.18;
                        f.vel.x += (dx / r) * strength;
                        f.vel.y += (dy / r) * strength;
                    }
                }

                f.vel.x += ax * 0.028;
                f.vel.y += ay * 0.028;
                const speed = Math.hypot(f.vel.x, f.vel.y);
                if (speed > 4.8) { f.vel.x *= 4.8 / speed; f.vel.y *= 4.8 / speed; }

                f.pos.x += f.vel.x;
                f.pos.y += f.vel.y;
            }

            // === DRAWING ===
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(scale, scale);

            for (const f of fishes) {
                const heading = Math.atan2(f.vel.y, f.vel.x);
                const cos = Math.cos(heading);
                const sin = Math.sin(heading);

                ctx.strokeStyle = f.color;
                ctx.lineWidth = 0.1;
                ctx.lineCap = 'butt';
                ctx.globalAlpha = 1.0;

                ctx.beginPath();
                ctx.moveTo(f.pos.x + cos * 9, f.pos.y + sin * 9);
                ctx.lineTo(f.pos.x + cos * -5 + sin * -5, f.pos.y + sin * -5 - cos * -5);
                ctx.lineTo(f.pos.x + cos * -5 - sin * -5, f.pos.y + sin * -5 + cos * -5);
                ctx.closePath();
                ctx.stroke();

                const speed = Math.hypot(f.vel.x, f.vel.y);
                if (speed > 1.5) {
                    ctx.strokeStyle = "#ffffff";
                    ctx.globalAlpha = 0.7 + Math.random() * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(f.pos.x + cos * -5, f.pos.y + sin * -5);
                    ctx.lineTo(f.pos.x + cos * -(6 + speed * 0.8), f.pos.y + sin * -(6 + speed * 0.8));
                    ctx.stroke();
                }
            }

            if (predatorRef.current) {
                const age = predatorRef.current.age++;
                const px = (predatorRef.current.x - cx) / scale;
                const py = (predatorRef.current.y - cy) / scale;

                ctx.strokeStyle = `rgba(255, ${120 - age * 3}, ${80 - age * 3}, ${1 - age / 40})`;
                ctx.lineWidth = 4 + age * 0.8;
                ctx.beginPath();
                ctx.arc(px, py, age * 3, 0, Math.PI * 2);
                ctx.stroke();

                if (age < 8) {
                    ctx.fillStyle = `rgba(255,255,255,${1 - age / 8})`;
                    ctx.beginPath();
                    ctx.arc(px, py, 20, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.restore();

            setTime(t => t + 0.016);
            animRef.current = requestAnimationFrame(loop);
        };
        loop();

        const click = (e: MouseEvent) => {
            predatorRef.current = { x: e.clientX, y: e.clientY, age: 0 };
            setTimeout(() => predatorRef.current = null, 4000);
        };
        canvas.addEventListener("click", click);

        return () => {
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("click", click);
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [initFish, simActive]); // ← now depends on simActive

    const applyPreset = (id: PresetId) => {
        const p = PRESETS.find(x => x.id === id)!;
        setK0(p.k0);
        setAlign(p.align);
        setPreset(id);
        initFish();
    };

    const currentPreset = preset ? PRESETS.find(p => p.id === preset)?.label : null;

    return (
        <div style={{ height: "100vh", color: "#eef", fontFamily: "system-ui", position: "relative", width: '100%' }}>
            {/* Existing UI */}
            <div style={{ background: "#001520", alignItems: "center", gap: "1.5rem", display: showUI ? 'flex' : 'none', padding: "0.8rem 1.2rem", height: 'auto' }}>
                <strong>κ-Fish • same law as galaxies</strong>

                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    κ:
                    <input type="range" min="0" max="1.8" step="0.01" value={k0}
                        onChange={e => { setPreset(null); setK0(+e.target.value); }} />
                    <span style={{ minWidth: 44 }}>{k0.toFixed(2)}</span>
                </label>

                {currentPreset && <span style={{ opacity: 0.9 }}>← {currentPreset}</span>}

                <span style={{ marginLeft: "auto", opacity: 0.8 }}>
                    t ≈ {time.toFixed(1)}s • click = predator
                </span>
            </div>

            <div style={{ background: "#001520", gap: "0.6rem", flexWrap: "wrap", display: showUI ? 'flex' : 'none', padding: "0.4rem 1rem", height: 'auto' }}>
                {PRESETS.map(p => (
                    <button key={p.id} onClick={() => applyPreset(p.id)}
                        style={{
                            padding: "0.35rem 0.8rem", borderRadius: 6, border: "none",
                            background: preset === p.id ? "#3a8fff" : "#223",
                            color: "#fff", cursor: "pointer", fontSize: "0.9rem"
                        }}>
                        {p.label}
                    </button>
                ))}
            </div>

            {showAquarium && (<canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100vh" }} />)}

            {/* Start Prompt Overlay */}
            {!simActive && (
                <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0, 10, 30, 0.88)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#8cf",
                    fontSize: "2rem",
                    fontWeight: "300",
                    cursor: "pointer",
                    userSelect: "none",
                    zIndex: 10,
                }}
                onClick={() => setSimActive(true)}>
                    <div style={{ fontSize: "3.5rem", marginBottom: "2rem", opacity: 0.9 }}>
                        κ-Fish
                    </div>
                    <div style={{ fontSize: "1.4rem", opacity: 0.8 }}>
                        Click to start simulation
                    </div>
                    <div style={{ fontSize: "1rem", marginTop: "2rem", opacity: 0.6 }}>
                        (click anywhere afterward = predator)
                    </div>
                </div>
            )}
        </div>
    );
};

export default Aquarium;