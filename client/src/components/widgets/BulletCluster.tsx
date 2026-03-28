import { useRef, useEffect, useState } from "react";

function BulletCluster() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [t, setT] = useState(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const W = canvas.width = 580;
        const H = canvas.height = 580;

        ctx.clearRect(0, 0, W, H);

        const cx1 = W / 2 - 80 * (1 - t);
        const cy1 = H / 2;
        const cx2 = W / 2 + 80 * (1 - t);
        const cy2 = H / 2;

        const baseStrength = 1.0;
        const glowStrength = Math.exp(-((t - 0.5) ** 2) / 0.035);

        function drawWell(x: number, y: number, s: number) {
            if (!(ctx === null)) {
                const grad = ctx.createRadialGradient(x, y, 0, x, y, 200);
                grad.addColorStop(0, `rgba(0,0,0,${0.25 * s})`);
                grad.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, 200, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        drawWell(cx1, cy1, baseStrength);
        drawWell(cx2, cy2, Math.sqrt(t));

        if (glowStrength > 0.001) {
            const glow = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 230);
            glow.addColorStop(0, `rgba(255,210,80,${0.45 * glowStrength})`);
            glow.addColorStop(1, "rgba(255,210,80,0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(cx2, cy2, 230, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.strokeStyle = "rgba(255,215,80,0.4)";
        ctx.beginPath();
        ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
        ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
        ctx.stroke();
    }, [t]);

    const kColl = 0.02 * Math.exp(-((t - 0.5) ** 2) / 0.035);

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-5 lg:gap-4 w-full">
            <div className="font-mono w-full lg:w-[420px] text-sm">
                <label className="text-base block">
                    collision progress (t)<br />
                    <input
                        type="range"
                        min={0} max={1} step={0.01}
                        value={t}
                        onChange={e => setT(parseFloat(e.target.value))}
                        className="w-[200px] mt-2"
                    />
                </label>

                <div className="text-xs">
                    <div>cluster separation: <strong>{(160 * (1 - t)).toFixed(1)} px</strong></div>
                    <div>κ_base = 7e⁻²¹ m⁻¹</div>
                    <div>κ_coll(t) = <strong>{kColl.toExponential(2)}</strong></div>
                    <div>κ_total = κ_base + κ_coll</div>
                    <div>lensing amplification α_model / α_GR ≈ <strong>{(1 + Math.exp(-((t - 0.5)**2)/0.035)).toFixed(2)}</strong></div>
                    <div>apparent lensing center shift: <strong>{(40 * Math.exp(-((t - 0.5)**2)/0.035)).toFixed(1)} px</strong></div>
                </div>
            </div>

            <canvas
                ref={canvasRef}
                className="w-full max-w-[580px] h-auto rounded-[14px] bg-white shadow-[0_4px_18px_rgba(0,0,0,0.15)]"
            />
        </div>
    );
}

export default BulletCluster;
