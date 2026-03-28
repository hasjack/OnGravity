// components/OortCloudKappa.tsx
import { useRef, useEffect } from 'react';

export default function OortCloudKappa() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width = 600;
    const h = canvas.height = 400;

    // Background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    // Sun
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(100, h/2, 20, 0, Math.PI * 2);
    ctx.fill();

    // Oort Cloud
    ctx.fillStyle = '#444488';
    for (let i = 0; i < 300; i++) {
      const r = 200 + Math.random() * 250;
      const theta = Math.random() * Math.PI * 2;
      const x = 100 + r * Math.cos(theta);
      const y = h/2 + r * Math.sin(theta);
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Comet trajectory
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, h/2);
    ctx.bezierCurveTo(200, 100, 400, 100, 550, h/2);
    ctx.stroke();

    // κ boost arrow
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(450, h/2);
    ctx.lineTo(520, h/2);
    ctx.stroke();
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(520, h/2);
    ctx.lineTo(510, h/2 - 8);
    ctx.lineTo(510, h/2 + 8);
    ctx.closePath();
    ctx.fillStyle = '#ff4444';
    ctx.fill();

    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sun', 100, h/2 - 30);
    ctx.fillText('Oort Cloud (r ~ 50,000 AU)', 400, 80);
    ctx.fillText('Δv ≈ +0.6 km/s (κ₀)', 475, h/2 - 30);
  }, []);

  return <canvas ref={canvasRef} width={600} height={400} style={{ maxWidth: '100%', height: 'auto' }} />;
}