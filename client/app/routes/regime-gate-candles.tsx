import { Link } from 'react-router'
import Article from '~/components/Article'
import FurtherReading from '~/components/FurtherReading'
import Img from '~/components/Img'
import License from '~/components/License'
import { H2, H3, P, Ul, Li } from '~/components/Typography'
import { Route } from './+types/regime-gate-candles'


const { VITE_APP_CDN_URL } = import.meta.env
const CDN = VITE_APP_CDN_URL

export function loader({ request }: Route.LoaderArgs) {
    return {
        shareUrl: request.url,
    }
}

export function meta() {
    return [
        { title: "Methods and Evaluation Protocol for the Progress-State Regime Gate" },
        {
            name: "description",
            content:
                "A methods note documenting the Progress-State Regime Gate on crypto candles, including model definition, feature mapping, walk-forward out-of-sample testing, fee stress buckets, parameter pocket selection, controller benchmarks, and reproducibility.",
        },
    ]
}

export default function RegimeGateCandles({ loaderData }: Route.ComponentProps) {
    return (
        <Article
            title={"Methods and Evaluation Protocol for the Progress-State Regime Gate"}
            author={"Jack Pickett"}
            dateTime={"21st April 2026"}
            url={""}
            shareUrl={loaderData.shareUrl.replace("http://", "https://")}
        >
            <P>
                This note documents the evaluation workflow used for the progress-state “regime gate” experiments on crypto
                candles. The emphasis is methodological: definition of the gate, the mapping from price history to a bounded
                setting, the backtest and walk-forward protocol, friction modelling, and how parameter pockets are selected and
                recorded.
            </P>

            <P classNames="mb-8">
                The gate is treated as a <strong>controller layer</strong> that can sit on top of other signals. It is not presented
                as a complete trading system or an “alpha” in isolation.
            </P>

            <H2>1. Model definition</H2>

            <P>
                The gate maintains a small internal state per run:
                <br />
                <strong>σ</strong> ∈ {'{+1, -1}'} (orientation / regime sign), and <strong>p</strong> ∈ [0, 1) (progress accumulator).
            </P>

            <P>
                Each bar supplies a scalar “setting” (an angle-like value). An alignment test compares the setting to a reference
                parameter λ and selects a two-level push δ:
            </P>

            <Ul>
                <Li>
                    δ = δ<sub>hi</sub> when the setting is within a window width w of λ (an “aligned” state)
                </Li>
                <Li>
                    δ = δ<sub>lo</sub> otherwise (a “weak” state)
                </Li>
            </Ul>

            <P classNames="mb-8">
                The accumulator advances p ← p + δ. Let n = ⌊p⌋, and reset p ← p - n (so p ∈ [0, 1) again). Orientation flips
                when n is odd (parity of crossings). This makes the update arithmetic-only (adds, floor, comparisons, sign flip).
            </P>

            <H2>2. Feature to setting mapping</H2>

            <P>
                Price history is mapped to a bounded “setting” in [-π, π]. The current implementation uses a momentum-style
                feature over a lookback L:
            </P>

            <Ul>
                <Li>Compute momentum over L bars (e.g. percent change)</Li>
                <Li>Normalize by a robust scale (standard deviation with ε guard)</Li>
                <Li>Squash with arctan to obtain a bounded angle-like setting</Li>
            </Ul>

            <P classNames="mb-8">
                This mapping is intentionally simple. The gate is a controller; different features can be substituted without
                changing the gate mechanics.
            </P>

            <H2>3. Trading policy</H2>

            <P>
                The policy converts σ into a target position. Two common profiles are supported:
            </P>

            <Ul>
                <Li>
                    <strong>Long-only:</strong> σ = +1 → long; σ = -1 → flat
                </Li>
                <Li>
                    <strong>Long/short:</strong> σ = +1 → long; σ = -1 → short (with a configurable short_scale, often 0.5 or 1.0)
                </Li>
            </Ul>

            <P classNames="mb-8">
                A minimum holding period (min_hold) is enforced to reduce turnover. For intraday data, this is treated as a
                minimum number of bars.
            </P>

            <H2>4. Friction model (fees / slippage bucket)</H2>

            <P>
                Execution friction is modelled as a per-turn cost in basis points (bps) whenever the position changes. The core
                stress buckets are:
            </P>

            <Ul>
                <Li>10 bps (optimistic / good execution)</Li>
                <Li>25 bps (moderate / realistic for careful execution)</Li>
                <Li>50 bps (pessimistic / “hard mode”)</Li>
            </Ul>

            <P classNames="mb-8">
                The objective is not to perfectly model microstructure. The objective is to test whether parameter pockets remain
                viable under materially different friction assumptions.
            </P>

            <H2>5. In-sample backtest (debugging / intuition)</H2>

            <P classNames="mb-8">
                A full-history backtest is run for rapid iteration and debugging. This produces an equity curve, a σ time series,
                and a timeseries output suitable for inspection. In-sample results are not used as the primary evidence for
                robustness.
            </P>

            <H2>6. Walk-forward evaluation</H2>

            <P>
                The main evaluation protocol is walk-forward testing using rolling train/test windows aligned to calendar years.
                For each window:
            </P>

            <Ul>
                <Li>Define training span (e.g. 4 years) and test span (e.g. 1 year)</Li>
                <Li>Evaluate the gate on the test window only (out-of-sample)</Li>
                <Li>Stitch test windows to form a continuous OOS equity series</Li>
            </Ul>

            <P classNames="mb-8">
                Outputs include: per-window summary metrics, a stitched OOS series, an OOS equity plot, and a meta JSON that
                records the configuration and results for auditability.
            </P>

            <H2>7. Metrics reported</H2>

            <Ul classNames="mb-8">
                <Li>
                    <strong>Annualized return</strong> and <strong>annualized volatility</strong> (using a bars-per-year constant)
                </Li>
                <Li>
                    <strong>Sharpe</strong> = μ / σ (no claims about stationarity; used as a coarse comparator)
                </Li>
                <Li>
                    <strong>Max drawdown</strong> on the stitched OOS equity series
                </Li>
                <Li>
                    <strong>Turns</strong> (number of position changes) as a proxy for turnover and friction sensitivity
                </Li>
            </Ul>

            <H2>8. Parameter search and “pocket” selection</H2>

            <P>
                Parameter tuning is treated as a search for stable pockets, not a search for a single perfect configuration.
                Typical tuned parameters include:
            </P>

            <Ul>
                <Li>setting lookback L</Li>
                <Li>alignment window w</Li>
                <Li>δ_hi and δ_lo</Li>
                <Li>min_hold</Li>
                <Li>short_scale</Li>
            </Ul>

            <P>
                Two scoring styles are supported:
            </P>

            <Ul>
                <Li>
                    <strong>Mean score</strong> across assets/fees (captures average behaviour)
                </Li>
                <Li>
                    <strong>Worst-window penalty</strong> (discourages configurations that fail badly in any single window)
                </Li>
            </Ul>

            <P classNames="mb-8">
                Timeframes are treated separately. Daily, 6h, and 1h data produce different viable pockets, and the search ranges
                are adjusted accordingly.
            </P>

            <H2>9. Results snapshot</H2>

            <P classNames="mb-8">
                This section records a current results snapshot using the walk-forward stitched out-of-sample protocol and friction
                buckets (10/25/50 bps). These are empirical pockets rather than fixed claims; results can drift as timeframes,
                features, or market regimes change.
            </P>

            <H3>1d (daily) canon — stitched OOS</H3>

            <P>
                Canon: lb=180, w=0.30, δ_hi/δ_lo=0.85/0.20, hold=30, short_scale=1.0. Fees: 10 / 25 / 50 bps.
            </P>

            <P><strong>BTC</strong></P>
            <Img path={CDN + "quant/output/walkforward_BTC-USD_lb180_w0.3_d0.85-0.2_fee50_hold30_short1_equity.png"} alt="BTC 1d canon (fee50) — walk-forward stitched OOS equity" />
            <Ul classNames="text-center">
                <Li classNames="list-none">fee10: ann_return 0.3263, Sharpe 0.6562, maxDD -0.4764</Li>
                <Li classNames="list-none">fee25: ann_return 0.3103, Sharpe 0.6237, maxDD -0.4842</Li>
                <Li classNames="list-none">fee50: ann_return 0.2835, Sharpe 0.5695, maxDD -0.4970</Li>
            </Ul>

            <P><strong>ETH</strong></P>
            <Img path={CDN + "quant/output/walkforward_ETH-USD_lb180_w0.3_d0.85-0.2_fee50_hold30_short1_equity.png"} alt="ETH 1d canon (fee50) — walk-forward stitched OOS equity" />
            <Ul classNames="text-center">
                <Li classNames="list-none">fee10: ann_return 0.6503, Sharpe 0.9690, maxDD -0.4735</Li>
                <Li classNames="list-none">fee25: ann_return 0.6342, Sharpe 0.9449, maxDD -0.4774</Li>
                <Li classNames="list-none">fee50: ann_return 0.6074, Sharpe 0.9047, maxDD -0.4839</Li>
            </Ul>

            <P>
                Takeaway: smooth degradation with fees on this pocket; ETH is stronger than BTC on this particular daily canon.
            </P>

            <H3>6h canon — stitched OOS</H3>

            <P>
                Canon: lb=360, w=0.30, δ_hi/δ_lo=0.90/0.15, hold=30 bars, short_scale=0.5. Fees: 10 / 25 / 50 bps.
            </P>

            <P><strong>ETH (short0.5)</strong></P>
            <Img path={CDN + "quant/output/walkforward_ETH-USD_lb360_w0.3_d0.9-0.15_fee50_hold30_short0.5_equity.png"} alt="ETH 6h canon (fee50) — walk-forward stitched OOS equity" />
            <Ul classNames="text-center">
                <Li classNames="list-none">fee10: ann_return 0.6126, Sharpe 1.0112, maxDD -0.5581</Li>
                <Li classNames="list-none">fee25: ann_return 0.5466, Sharpe 0.9021, maxDD -0.5705</Li>
                <Li classNames="list-none">fee50: ann_return 0.4365, Sharpe 0.7200, maxDD -0.5904</Li>
            </Ul>

            <P><strong>BTC (short0.5)</strong></P>
            <Img path={CDN + "quant/output/walkforward_BTC-USD_lb360_w0.3_d0.9-0.15_fee50_hold30_short0.5_equity.png"} alt="BTC 6h canon (fee50) — walk-forward stitched OOS equity" />
            <Ul classNames="text-center">
                <Li classNames="list-none">fee10: ann_return 0.4376, Sharpe 0.9383, maxDD -0.5480</Li>
                <Li classNames="list-none">fee25: ann_return 0.3716, Sharpe 0.7965, maxDD -0.5607</Li>
                <Li classNames="list-none">fee50: ann_return 0.2615, Sharpe 0.5597, maxDD -0.5811</Li>
            </Ul>

            <P>
                Takeaway: a viable 6h pocket appears to exist under fee stress. Turnover is higher than daily on this setup, which
                increases sensitivity to friction assumptions.
            </P>

            <H3>1h canon — stitched OOS</H3>

            <P>
                Canon: lb=2880, w=0.25, δ_hi/δ_lo=0.80/0.30, hold=720 bars, short_scale=0.5. BTC fee stress shown; ETH validated
                at fee=50 in this snapshot.
            </P>

            <P><strong>ETH (short0.5)</strong></P>
            <Img path={CDN + "quant/output/walkforward_ETH-USD_lb2880_w0.25_d0.8-0.3_fee50_hold720_short0.5_equity.png"} alt="ETH 1h canon (fee50) — walk-forward stitched OOS equity" />
            <Ul classNames="text-center">
                <Li classNames="list-none">fee10: ann_return 0.3156, Sharpe 0.6239, maxDD -0.5801</Li>
                <Li classNames="list-none">fee25: ann_return 0.2977, Sharpe 0.5886, maxDD -0.5913</Li>
                <Li classNames="list-none">fee50: ann_return 0.2681, Sharpe 0.5297, maxDD -0.6093</Li>
            </Ul>

            <P><strong>BTC (short0.5)</strong></P>
            <Img path={CDN + "quant/output/walkforward_BTC-USD_lb2880_w0.25_d0.8-0.3_fee50_hold720_short0.5_equity.png"} alt="BTC 1h canon (fee50) — walk-forward stitched OOS equity" />
            <Ul classNames="text-center">
                <Li classNames="list-none">fee10: ann_return 0.1533, Sharpe 0.3979, maxDD -0.5214</Li>
                <Li classNames="list-none">fee25: ann_return 0.1355, Sharpe 0.3516, maxDD -0.5335</Li>
                <Li classNames="list-none">fee50: ann_return 0.1058, Sharpe 0.2743, maxDD -0.5529</Li>
            </Ul>

            <P classNames="mb-8">
                Takeaway: hourly remains viable in pockets but is more regime-sensitive. That sensitivity is expected intraday and is
                one reason the workflow keeps walk-forward and fee buckets as first-class tests.
            </P>

            <H2>10. Reproducibility and audit trail</H2>

            <P>
                Every run writes a bundle of artifacts (CSV/PNG/JSON). Meta files record:
            </P>

            <Ul>
                <Li>data source path and symbol</Li>
                <Li>full configuration snapshot</Li>
                <Li>bars-per-year constant</Li>
                <Li>window boundaries used for walk-forward</Li>
                <Li>summary metrics and output filenames</Li>
            </Ul>

            <P classNames="mb-8">
                The objective is that any result can be reproduced from a config + data file without manual reconstruction.
            </P>

            <H2>11. Controller benchmark findings (1d)</H2>

            <P>
                A small controller benchmark was run on daily BTC and ETH using the same walk-forward stitched OOS protocol,
                the same fee buckets (10/25/50 bps), and the same long/short policy semantics. The comparison set included the
                progress-state gate, a Schmitt trigger hysteresis controller, a simple one-sided hysteresis controller, and a
                rolling sine/cosine phase-fit baseline (“sinefit”).
            </P>

            <P><strong>BTC-USD (1d)</strong></P>
            <Ul>
                <Li>
                    The progress-state gate remained the best controller in this benchmark
                    at <strong>fee10</strong> and <strong>fee25</strong> with score 0.3695 / 0.3256, ann_return 0.1805 / 0.1641, Sharpe 0.4739 /
                    0.4304, maxDD -0.2984 / -0.2995, and 47 turns.
                </Li>
                <Li>
                    At <strong>fee50</strong>, a more conservative Schmitt trigger could outperform the gate by reducing turnover materially.
                    The strongest Schmitt pocket tested here was <strong>enter_z=0.8, exit_z=0.3</strong>, with score 0.2959,
                    ann_return 0.0862, Sharpe 0.3691, maxDD -0.2092, and 10 turns.
                </Li>
                <Li>
                    Interpretation: on BTC daily, the gate performs best under low/moderate friction, while a stricter hysteresis
                    controller can become preferable once friction is high enough that turnover dominates.
                </Li>
            </Ul>

            <P><strong>ETH-USD (1d)</strong></P>
            <Ul>
                <Li>
                    The rolling sine/cosine phase-fit baseline showed a clear and localized dominance pocket at
                    <strong> window=180, period=60</strong>. In that pocket it won all fee buckets:
                    fee10 score 1.1277, ann_return 0.4661, Sharpe 1.2453, maxDD -0.3358, turns 16;
                    fee25 score 1.1123, ann_return 0.4605, Sharpe 1.2302, maxDD -0.3368, turns 16;
                    fee50 score 1.0865, ann_return 0.4511, Sharpe 1.2050, maxDD -0.3385, turns 16.
                </Li>
                <Li>
                    Secondary sinefit wins appeared at <strong>window=180, period=90</strong> and <strong>window=210, period=50</strong>,
                    but these were materially weaker than the 180/60 pocket.
                </Li>
                <Li>
                    Outside those narrow phase-fit pockets, the progress-state gate remained the best controller in the tested set.
                    Interpretation: ETH daily appears to support a localized phase-style pocket, whereas the gate is the more stable
                    default once that pocket is missed.
                </Li>
            </Ul>

            <P classNames="mb-8">
                Takeaway: the controller benchmark does not support a single universal winner. Instead it suggests a more nuanced
                result: the progress-state gate is a strong default controller, especially on BTC and under low/moderate friction,
                while alternative stateful controllers can dominate in specific pockets (Schmitt under heavy BTC friction; sinefit
                in a narrow ETH daily phase pocket).
            </P>

            <H2>12. Limitations</H2>

            <Ul classNames="mb-8">
                <Li>Friction is bucketed (bps per turn) rather than a full order-book model.</Li>
                <Li>Signal mapping is intentionally minimal; alternative features may change behaviour materially.</Li>
                <Li>Walk-forward uses calendar boundaries; alternative splits may produce different stress patterns.</Li>
                <Li>Crypto regime structure shifts; pockets can degrade over time.</Li>
            </Ul>

            <H2>13. Next methodological extensions</H2>

            <Ul classNames="mb-8">
                <Li>Baseline comparisons (e.g. MA/trend) under identical windows and friction buckets</Li>
                <Li>Simple slippage models (extra bps per trade, volatility-scaled friction)</Li>
                <Li>Portfolio-level gating (multiple assets, shared risk budget)</Li>
                <Li>Config registry (public canon + optional private pockets)</Li>
            </Ul>

            <H2>Closing note</H2>
            <P classNames="mb-8">
                The main claim supported by this workflow is modest: a small deterministic gate can provide a reusable controller
                primitive with hysteresis and memory, and robust evaluation can be made cheap enough to run routinely.
            </P>
            <H2>Further Reading</H2>
            <div className="mb-12 mt-2 mx-2">
                <FurtherReading items={[
                    {
                        itemType: "Note",
                        label: "Progress-State Bell Toy in Natural Mathematics",
                        to: "/notes/natural-mathematics-bell-toy",
                        date: "12th April 2026",
                        image: `${CDN}bell-toy-16-10.jpg`,
                    },
                    {
                        itemType: "Note",
                        label: "Switching Quadratic Atlas Diagnostics",
                        to: "/notes/switching-quadratic-atlas-diagnostics",
                        date: "15th April 2026",
                        image: `${CDN}quadratic-atlas-16-10.jpg`,
                    },
                    // {
                    //     itemType: "Note",
                    //     label: "Methods and Evaluation Protocol for the Progress-State Regime Gate",
                    //     to: "/notes/evaluation-protocol-for-progress-state-regime",
                    //     date: "21st April 2026",
                    //     image: `${CDN}bell-toy-candles-16-10.jpg`,
                    // }
                ]} />
            </div>
            <H2>Code and Reproducibility</H2>
            <P>
                The analysis pipeline used in this study is implemented in Python. All code used to generate the figures and statistical results
                presented in this work is available as open-source software:
            </P>
            <P classNames="text-center mb-4">
                <Link
                    to="https://github.com/hasjack/OnGravity/tree/main/python/bell-toy"
                    target="_blank"
                    className="block w-full break-all underline text-sm lg:text-md"
                >github.com/hasjack/OnGravity/tree/main/python/bell-toy
                </Link>
            </P>
            <P classNames="mb-24">
                This repository includes the full analysis pipeline, data ingestion routines, model fitting procedures,
                and scripts used to generate the figures presented in this paper.
            </P>
            <License />
        </Article>
    )
}