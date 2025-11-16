import { useRef, useEffect } from 'react';

export function PioneerAnomaly() {
    const accelCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const kappaCanvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const accelCanvas = accelCanvasRef.current;
        const kappaCanvas = kappaCanvasRef.current;
        if (!accelCanvas || !kappaCanvas) return;

        const accelCtx = accelCanvas.getContext('2d');
        const kappaCtx = kappaCanvas.getContext('2d');
        if (!accelCtx || !kappaCtx) return;

        const W = 600;
        const H1 = 320;
        const H2 = 260;

        accelCanvas.width = W;
        accelCanvas.height = H1;
        kappaCanvas.width = W;
        kappaCanvas.height = H2;

        // ------------------------------
        // 1) Residual acceleration panel
        // ------------------------------

        accelCtx.clearRect(0, 0, W, H1);

        // Illustrative data (10 & 11), acceleration in units of 1e-10 m/s^2
        const data10 = [
            { r: 20, a: 8.6 },
            { r: 30, a: 8.7 },
            { r: 40, a: 8.8 },
            { r: 50, a: 8.7 },
            { r: 60, a: 8.6 },
            { r: 70, a: 8.7 },
        ];

        const data11 = [
            { r: 20, a: 8.5 },
            { r: 30, a: 8.7 },
            { r: 40, a: 8.9 },
            { r: 50, a: 8.6 },
            { r: 60, a: 8.8 },
        ];

        const rMin = 18;
        const rMax = 72;
        const aMin = 6;
        const aMax = 11;

        const plotLeft = 60;
        const plotRight = W - 20;
        const plotTop = 20;
        const plotBottom = H1 - 40;

        const xScale = (r: number) =>
            plotLeft + ((r - rMin) / (rMax - rMin)) * (plotRight - plotLeft);
        const yScale = (a: number) =>
            plotBottom - ((a - aMin) / (aMax - aMin)) * (plotBottom - plotTop);

        // Axes
        accelCtx.strokeStyle = '#444';
        accelCtx.lineWidth = 1.5;
        accelCtx.beginPath();
        accelCtx.moveTo(plotLeft, plotTop);
        accelCtx.lineTo(plotLeft, plotBottom);
        accelCtx.lineTo(plotRight, plotBottom);
        accelCtx.stroke();

        accelCtx.fillStyle = '#000';
        accelCtx.font = '12px system-ui';
        accelCtx.textAlign = 'center';
        accelCtx.fillText('Distance from Sun (AU)', (plotLeft + plotRight) / 2, H1 - 10);
        accelCtx.save();
        accelCtx.translate(16, (plotTop + plotBottom) / 2);
        accelCtx.rotate(-Math.PI / 2);
        accelCtx.fillText('Residual acceleration (10⁻¹⁰ m s⁻²)', 0, 0);
        accelCtx.restore();

        // X ticks
        accelCtx.textAlign = 'center';
        accelCtx.textBaseline = 'top';
        [20, 30, 40, 50, 60, 70].forEach(r => {
            const x = xScale(r);
            accelCtx.strokeStyle = '#ccc';
            accelCtx.beginPath();
            accelCtx.moveTo(x, plotBottom);
            accelCtx.lineTo(x, plotBottom + 5);
            accelCtx.stroke();
            accelCtx.fillStyle = '#555';
            accelCtx.fillText(r.toString(), x, plotBottom + 8);
        });

        // Y ticks
        accelCtx.textAlign = 'right';
        accelCtx.textBaseline = 'middle';
        [7, 8, 9, 10].forEach(a => {
            const y = yScale(a);
            accelCtx.strokeStyle = '#eee';
            accelCtx.beginPath();
            accelCtx.moveTo(plotLeft - 4, y);
            accelCtx.lineTo(plotRight, y);
            accelCtx.stroke();
            accelCtx.fillStyle = '#555';
            accelCtx.fillText(a.toString(), plotLeft - 8, y);
        });

        // Uncertainty band: 8.7 ± 1.3
        const central = 8.7;
        const sigma = 1.3;
        const bandTop = yScale(central + sigma);
        const bandBottom = yScale(central - sigma);
        accelCtx.fillStyle = 'rgba(100, 149, 237, 0.15)';
        accelCtx.fillRect(
            plotLeft,
            bandTop,
            plotRight - plotLeft,
            bandBottom - bandTop
        );

        // Helper to draw lines and points
        const drawLine = (
            data: { r: number; a: number }[],
            stroke: string
        ) => {
            if (!data.length) return;
            accelCtx.strokeStyle = stroke;
            accelCtx.lineWidth = 2;
            accelCtx.beginPath();
            data.forEach((pt, idx) => {
                const x = xScale(pt.r);
                const y = yScale(pt.a);
                if (idx === 0) accelCtx.moveTo(x, y);
                else accelCtx.lineTo(x, y);
            });
            accelCtx.stroke();
            data.forEach(pt => {
                const x = xScale(pt.r);
                const y = yScale(pt.a);
                accelCtx.beginPath();
                accelCtx.arc(x, y, 3, 0, Math.PI * 2);
                accelCtx.fillStyle = stroke;
                accelCtx.fill();
            });
        };

        drawLine(data10, '#d9534f'); // Pioneer 10
        drawLine(data11, '#5bc0de'); // Pioneer 11

        // Legend
        accelCtx.font = '12px system-ui';
        accelCtx.textAlign = 'left';
        accelCtx.textBaseline = 'middle';

        accelCtx.fillStyle = '#d9534f';
        accelCtx.fillRect(plotLeft + 10, plotTop + 10, 10, 10);
        accelCtx.fillStyle = '#000';
        accelCtx.fillText('Pioneer 10', plotLeft + 28, plotTop + 15);

        accelCtx.fillStyle = '#5bc0de';
        accelCtx.fillRect(plotLeft + 10, plotTop + 28, 10, 10);
        accelCtx.fillStyle = '#000';
        accelCtx.fillText('Pioneer 11', plotLeft + 28, plotTop + 33);

        accelCtx.fillStyle = 'rgba(100,149,237,0.3)';
        accelCtx.fillRect(plotLeft + 10, plotTop + 46, 10, 10);
        accelCtx.fillStyle = '#000';
        accelCtx.fillText('8.7 ± 1.3 band', plotLeft + 28, plotTop + 51);

        // ------------------------------
        // 2) κ r cumulative panel
        // ------------------------------

        kappaCtx.clearRect(0, 0, W, H2);

        const AU = 1.496e11;                // metres
        const kappa0 = 2.6e-26;             // m^-1 (background scale)
        const rValues = [20, 30, 40, 50, 60, 70];
        // We plot y = κ₀ r (dimensionless) × 1e13 for visibility
        const kappaScaled = rValues.map(r => ({
            r,
            y: kappa0 * (r * AU) * 1e13
        }));

        const rMin2 = 18;
        const rMax2 = 72;
        const yMin2 = 0;
        const yMax2 = Math.max(...kappaScaled.map(p => p.y)) * 1.1;

        const left2 = 60;
        const right2 = W - 20;
        const top2 = 20;
        const bottom2 = H2 - 40;

        const xScale2 = (r: number) =>
            left2 + ((r - rMin2) / (rMax2 - rMin2)) * (right2 - left2);
        const yScale2 = (y: number) =>
            bottom2 - ((y - yMin2) / (yMax2 - yMin2)) * (bottom2 - top2);

        // Axes
        kappaCtx.strokeStyle = '#444';
        kappaCtx.lineWidth = 1.5;
        kappaCtx.beginPath();
        kappaCtx.moveTo(left2, top2);
        kappaCtx.lineTo(left2, bottom2);
        kappaCtx.lineTo(right2, bottom2);
        kappaCtx.stroke();

        kappaCtx.fillStyle = '#000';
        kappaCtx.font = '12px system-ui';
        kappaCtx.textAlign = 'center';
        kappaCtx.fillText('Distance from Sun (AU)', (left2 + right2) / 2, H2 - 10);
        kappaCtx.save();
        kappaCtx.translate(16, (top2 + bottom2) / 2);
        kappaCtx.rotate(-Math.PI / 2);
        kappaCtx.fillText('κ₀ r × 10¹³ (dimensionless)', 0, 0);
        kappaCtx.restore();

        // X ticks
        kappaCtx.textAlign = 'center';
        kappaCtx.textBaseline = 'top';
        [20, 30, 40, 50, 60, 70].forEach(r => {
            const x = xScale2(r);
            kappaCtx.strokeStyle = '#ccc';
            kappaCtx.beginPath();
            kappaCtx.moveTo(x, bottom2);
            kappaCtx.lineTo(x, bottom2 + 5);
            kappaCtx.stroke();
            kappaCtx.fillStyle = '#555';
            kappaCtx.fillText(r.toString(), x, bottom2 + 8);
        });

        // Y ticks (3 ticks)
        kappaCtx.textAlign = 'right';
        kappaCtx.textBaseline = 'middle';
        [0, yMax2 / 2, yMax2].forEach((yVal, idx) => {
            const y = yScale2(yVal);
            kappaCtx.strokeStyle = '#eee';
            kappaCtx.beginPath();
            kappaCtx.moveTo(left2 - 4, y);
            kappaCtx.lineTo(right2, y);
            kappaCtx.stroke();
            kappaCtx.fillStyle = '#555';
            const label = idx === 0 ? '0' : yVal.toFixed(2);
            kappaCtx.fillText(label, left2 - 8, y);
        });

        // Line
        kappaCtx.strokeStyle = '#27ae60';
        kappaCtx.lineWidth = 2;
        kappaCtx.beginPath();
        kappaScaled.forEach((pt, idx) => {
            const x = xScale2(pt.r);
            const y = yScale2(pt.y);
            if (idx === 0) kappaCtx.moveTo(x, y);
            else kappaCtx.lineTo(x, y);
        });
        kappaCtx.stroke();

        kappaScaled.forEach(pt => {
            const x = xScale2(pt.r);
            const y = yScale2(pt.y);
            kappaCtx.beginPath();
            kappaCtx.arc(x, y, 3, 0, Math.PI * 2);
            kappaCtx.fillStyle = '#27ae60';
            kappaCtx.fill();
        });

    }, []);

    return (
        <div>
            <canvas
                ref={accelCanvasRef}
                style={{
                    width: '100%',
                    maxWidth: 600,
                    height: 'auto',
                    display: 'block',
                    marginTop: 24,
                    borderRadius: 12,
                    backgroundColor: '#fff',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
                }}
            />
            <canvas
                ref={kappaCanvasRef}
                style={{
                    width: '100%',
                    maxWidth: 600,
                    height: 'auto',
                    display: 'block',
                    marginTop: 24,
                    borderRadius: 12,
                    backgroundColor: '#fff',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
                }}
            />
        </div>
    );
}
