// components/TovBaseball.tsx
import { useRef, useEffect } from 'react';

export default function TovBaseball() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width = 600;
    const h = canvas.height = 400;
    const scale = 0.8;

    // Clear
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, w, h);

    // Diamond
    const center = { x: w/2, y: h/2 };
    const size = 120 * scale;
    const stars = [
      { x: center.x, y: center.y - size }, // Home
      { x: center.x + size, y: center.y }, // 1st
      { x: center.x, y: center.y + size }, // 2nd
      { x: center.x - size, y: center.y }, // 3rd
    ];

    // Draw bases
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 3;
    stars.forEach(s => {
      ctx.beginPath();
      ctx.moveTo(s.x - 15, s.y);
      ctx.lineTo(s.x, s.y - 20);
      ctx.lineTo(s.x + 15, s.y);
      ctx.lineTo(s.x, s.y + 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Neutron stars
    ctx.fillStyle = '#ff4444';
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    // Center test mass
    ctx.fillStyle = '#0066ff';
    ctx.beginPath();
    ctx.arc(center.x, center.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Arrows (κ boost)
    ctx.strokeStyle = '#d00';
    ctx.lineWidth = 2;
    const arrowLen = 40;
    stars.forEach(s => {
      const dx = center.x - s.x;
      const dy = center.y - s.y;
      const len = Math.sqrt(dx*dx + dy*dy);
      const ux = dx / len;
      const uy = dy / len;
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(center.x - ux * arrowLen * 1.16, center.y - uy * arrowLen * 1.16);
      ctx.stroke();
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(center.x - ux * arrowLen * 1.16, center.y - uy * arrowLen * 1.16);
      ctx.lineTo(
        center.x - ux * arrowLen * 1.16 + uy * 8,
        center.y - uy * arrowLen * 1.16 - ux * 8
      );
      ctx.lineTo(
        center.x - ux * arrowLen * 1.16 - uy * 8,
        center.y - uy * arrowLen * 1.16 + ux * 8
      );
      ctx.closePath();
      ctx.fillStyle = '#d00';
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#000';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('κ = 5×10⁻¹⁷ m⁻¹ → +16% gravity', w/2, 50);
    ctx.fillText('Collapse in <1.5 km', w/2, h - 30);
  }, []);

  return <canvas ref={canvasRef} width={600} height={400} style={{ maxWidth: '100%', height: 'auto' }} />;
}