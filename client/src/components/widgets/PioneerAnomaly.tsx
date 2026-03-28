import { useRef, useEffect } from 'react'

function PioneerAnomaly() {
    const accelCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const kappaCanvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const accelCanvas = accelCanvasRef.current
        const kappaCanvas = kappaCanvasRef.current
        if (!accelCanvas || !kappaCanvas) return

        const accelCtx = accelCanvas.getContext('2d')
        const kappaCtx = kappaCanvas.getContext('2d')
        if (!accelCtx || !kappaCtx) return

        const W = 600
        const H1 = 340
        const H2 = 260

        accelCanvas.width = W
        accelCanvas.height = H1
        kappaCanvas.width = W
        kappaCanvas.height = H2

        // --------------------------------
        // Physical constants / model setup
        // --------------------------------

        const AU = 1.496e11
        const G = 6.6743e-11
        const M_SUN = 1.98847e30
        const kappa0 = 2.6e-26 // m^-1, from v4

        // Historical Pioneer anomaly band (for overlay only)
        const pioneerCentral = 8.7e-10
        const pioneerSigma = 1.3e-10

        // Distance sample along Pioneer-like outbound leg
        const rValues = [20, 30, 40, 50, 60, 70]

        // --------------------------------
        // Helper functions
        // --------------------------------

        const solarResidualExact = (rAU: number) => {
            const r = rAU * AU
            const kappa = kappa0
            return (G * M_SUN / (r * r)) * (Math.exp(kappa * r) - 1)
        }

        const solarResidualApprox = (rAU: number) => {
            const r = rAU * AU
            const kappa = kappa0
            return (G * M_SUN / (r * r)) * (kappa * r)
        }

        const modelData = rValues.map(r => ({
            r,
            exact: solarResidualExact(r),
            approx: solarResidualApprox(r),
        }))

        // For plotting in units of 1e-10 m s^-2
        const modelDataScaled = modelData.map(pt => ({
            r: pt.r,
            exact: pt.exact / 1e-10,
            approx: pt.approx / 1e-10,
        }))

        const kappaScaled = rValues.map(r => ({
            r,
            y: kappa0 * (r * AU) * 1e13,
        }))

        // ------------------------------
        // Shared drawing helpers
        // ------------------------------

        const drawAxes = (
            ctx: CanvasRenderingContext2D,
            left: number,
            right: number,
            top: number,
            bottom: number,
            xLabel: string,
            yLabel: string,
            canvasHeight: number
        ) => {
            ctx.strokeStyle = '#444'
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(left, top)
            ctx.lineTo(left, bottom)
            ctx.lineTo(right, bottom)
            ctx.stroke()

            ctx.fillStyle = '#000'
            ctx.font = '12px system-ui'
            ctx.textAlign = 'center'
            ctx.fillText(xLabel, (left + right) / 2, canvasHeight - 10)

            ctx.save()
            ctx.translate(16, (top + bottom) / 2)
            ctx.rotate(-Math.PI / 2)
            ctx.fillText(yLabel, 0, 0)
            ctx.restore()
        }

        const drawXTicks = (
            ctx: CanvasRenderingContext2D,
            ticks: number[],
            xScale: (x: number) => number,
            bottom: number
        ) => {
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ticks.forEach(value => {
                const x = xScale(value)
                ctx.strokeStyle = '#ccc'
                ctx.beginPath()
                ctx.moveTo(x, bottom)
                ctx.lineTo(x, bottom + 5)
                ctx.stroke()
                ctx.fillStyle = '#555'
                ctx.fillText(value.toString(), x, bottom + 8)
            })
        }

        const drawYTicks = (
            ctx: CanvasRenderingContext2D,
            ticks: number[],
            yScale: (y: number) => number,
            left: number,
            right: number
        ) => {
            ctx.textAlign = 'right'
            ctx.textBaseline = 'middle'
            ticks.forEach(value => {
                const y = yScale(value)
                ctx.strokeStyle = '#eee'
                ctx.beginPath()
                ctx.moveTo(left - 4, y)
                ctx.lineTo(right, y)
                ctx.stroke()
                ctx.fillStyle = '#555'
                ctx.fillText(value.toFixed(1), left - 8, y)
            })
        }

        const drawLine = (
            ctx: CanvasRenderingContext2D,
            data: { r: number; y: number }[],
            xScale: (x: number) => number,
            yScale: (y: number) => number,
            stroke: string,
            pointRadius = 3,
            dashed = false
        ) => {
            if (!data.length) return

            ctx.save()
            if (dashed) ctx.setLineDash([6, 4])
            ctx.strokeStyle = stroke
            ctx.lineWidth = 2

            ctx.beginPath()
            data.forEach((pt, idx) => {
                const x = xScale(pt.r)
                const y = yScale(pt.y)
                if (idx === 0) ctx.moveTo(x, y)
                else ctx.lineTo(x, y)
            })
            ctx.stroke()
            ctx.restore()

            if (!dashed) {
                data.forEach(pt => {
                    const x = xScale(pt.r)
                    const y = yScale(pt.y)
                    ctx.beginPath()
                    ctx.arc(x, y, pointRadius, 0, Math.PI * 2)
                    ctx.fillStyle = stroke
                    ctx.fill()
                })
            }
        }

        // ------------------------------
        // 1) Residual acceleration panel
        // ------------------------------

        accelCtx.clearRect(0, 0, W, H1)

        const rMin = 18
        const rMax = 72

        const allY = modelDataScaled.flatMap(d => [d.exact, d.approx])
        const anomalyBandTop = (pioneerCentral + pioneerSigma) / 1e-10
        const anomalyBandBottom = (pioneerCentral - pioneerSigma) / 1e-10

        const aMin = 0
        const aMax = Math.max(anomalyBandTop, ...allY) * 1.15

        const plotLeft = 70
        const plotRight = W - 20
        const plotTop = 20
        const plotBottom = H1 - 55

        const xScale = (r: number) =>
            plotLeft + ((r - rMin) / (rMax - rMin)) * (plotRight - plotLeft)

        const yScale = (a: number) =>
            plotBottom - ((a - aMin) / (aMax - aMin)) * (plotBottom - plotTop)

        drawAxes(
            accelCtx,
            plotLeft,
            plotRight,
            plotTop,
            plotBottom,
            'Distance from Sun (AU)',
            'Residual acceleration (10⁻¹⁰ m s⁻²)',
            H1
        )

        drawXTicks(accelCtx, [20, 30, 40, 50, 60, 70], xScale, plotBottom)

        const yTicks = [0, aMax * 0.25, aMax * 0.5, aMax * 0.75, aMax]
        drawYTicks(accelCtx, yTicks, yScale, plotLeft, plotRight)

        // Historical Pioneer band
        const bandTop = yScale(anomalyBandTop)
        const bandBottom = yScale(anomalyBandBottom)
        accelCtx.fillStyle = 'rgba(100, 149, 237, 0.15)'
        accelCtx.fillRect(
            plotLeft,
            bandTop,
            plotRight - plotLeft,
            bandBottom - bandTop
        )

        // Historical central line
        accelCtx.save()
        accelCtx.setLineDash([5, 5])
        accelCtx.strokeStyle = 'rgba(100, 149, 237, 0.8)'
        accelCtx.lineWidth = 1.5
        accelCtx.beginPath()
        accelCtx.moveTo(plotLeft, yScale(pioneerCentral / 1e-10))
        accelCtx.lineTo(plotRight, yScale(pioneerCentral / 1e-10))
        accelCtx.stroke()
        accelCtx.restore()

        // Model curves
        drawLine(
            accelCtx,
            modelDataScaled.map(d => ({ r: d.r, y: d.exact })),
            xScale,
            yScale,
            '#d9534f'
        )

        drawLine(
            accelCtx,
            modelDataScaled.map(d => ({ r: d.r, y: d.approx })),
            xScale,
            yScale,
            '#5bc0de',
            0,
            true
        )

        // Legend
        accelCtx.font = '12px system-ui'
        accelCtx.textAlign = 'left'
        accelCtx.textBaseline = 'middle'

        accelCtx.fillStyle = '#d9534f'
        accelCtx.fillRect(plotLeft + 10, plotTop + 10, 10, 10)
        accelCtx.fillStyle = '#000'
        accelCtx.fillText('v4 model: exact exp(κr) residual', plotLeft + 28, plotTop + 15)

        accelCtx.strokeStyle = '#5bc0de'
        accelCtx.lineWidth = 2
        accelCtx.beginPath()
        accelCtx.moveTo(plotLeft + 10, plotTop + 33)
        accelCtx.lineTo(plotLeft + 20, plotTop + 33)
        accelCtx.stroke()
        accelCtx.fillStyle = '#000'
        accelCtx.fillText('small-κr approximation', plotLeft + 28, plotTop + 33)

        accelCtx.fillStyle = 'rgba(100,149,237,0.3)'
        accelCtx.fillRect(plotLeft + 10, plotTop + 46, 10, 10)
        accelCtx.fillStyle = '#000'
        accelCtx.fillText('historical Pioneer 8.7 ± 1.3 band', plotLeft + 28, plotTop + 51)

        // Small note
        accelCtx.fillStyle = '#444'
        accelCtx.font = '11px system-ui'
        accelCtx.textAlign = 'left'
        accelCtx.fillText(
            'Model curve uses κ(r)=κ₀ only, so the residual falls approximately as 1/r.',
            plotLeft,
            H1 - 28
        )

        // ------------------------------
        // 2) κ₀ r cumulative panel
        // ------------------------------

        kappaCtx.clearRect(0, 0, W, H2)

        const rMin2 = 18
        const rMax2 = 72
        const yMin2 = 0
        const yMax2 = Math.max(...kappaScaled.map(p => p.y)) * 1.1

        const left2 = 70
        const right2 = W - 20
        const top2 = 20
        const bottom2 = H2 - 40

        const xScale2 = (r: number) =>
            left2 + ((r - rMin2) / (rMax2 - rMin2)) * (right2 - left2)

        const yScale2 = (y: number) =>
            bottom2 - ((y - yMin2) / (yMax2 - yMin2)) * (bottom2 - top2)

        drawAxes(
            kappaCtx,
            left2,
            right2,
            top2,
            bottom2,
            'Distance from Sun (AU)',
            'κ₀ r × 10¹³ (dimensionless)',
            H2
        )

        drawXTicks(kappaCtx, [20, 30, 40, 50, 60, 70], xScale2, bottom2)

        drawYTicks(
            kappaCtx,
            [0, yMax2 / 2, yMax2],
            yScale2,
            left2,
            right2
        )

        drawLine(
            kappaCtx,
            kappaScaled.map(pt => ({ r: pt.r, y: pt.y })),
            xScale2,
            yScale2,
            '#27ae60'
        )
    }, [])

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
    )
}

export default PioneerAnomaly