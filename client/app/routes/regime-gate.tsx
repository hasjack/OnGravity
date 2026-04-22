// MethodsNote.tsx
// Copy into your notes folder and adjust imports to match your house style.

import { Link } from 'react-router'

// TODO: replace these imports with your actual components.
// The names below mirror the style used across your notes (H2, P, etc.).
import Article from '~/components/Article'
import FurtherReading from '~/components/FurtherReading'
import License from '~/components/License'
import { H2, H3, P, Ul, Li } from '~/components/Typography'
import { Route } from './+types/regime-gate'


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
                "An executive methods note on the Progress-State Regime Gate, a lightweight state-machine controller for trading signals, with evidence from walk-forward out-of-sample testing, friction sweeps, reproducible artifacts, and infrastructure-focused product positioning.",
        },
    ]
}

export default function RegimeGate({ loaderData }: Route.ComponentProps) {
    return (
        <Article
            title={"Executive Summary: Regime Gate"}
            author={"Jack Pickett"}
            dateTime={"19th April 2026"}
            url={""}
            shareUrl={loaderData.shareUrl.replace("http://", "https://")}
        >
            <H2>Overview</H2>
            <P>
                This project builds a lightweight regime gate: a tiny, interpretable state machine that sits between signals and
                execution to control exposure. The gate adds memory and hysteresis to otherwise simple inputs using
                arithmetic-only updates (adds, <code>floor</code>, comparisons, sign flips), enabling laptop-scale parameter sweeps,
                walk-forward OOS testing, and friction stress tests as a default workflow.
            </P>

            <H2>Product</H2>
            <H3>Gate SDK and Research Harness</H3>

            <P>
                The gate maintains a minimal state <strong>(σ,p)</strong> where <strong>σ</strong>∈{'{+1,−1}'} and{' '}
                <strong>p</strong>∈[0,1). Each bar computes a bounded setting from a feature (default: scaled momentum mapped to an
                angle via <code>2*arctan(z)</code>), then applies a two-level push <strong>δ</strong>∈{'{δ_hi,δ_lo}'} based on angular
                proximity to a reference <strong>λ</strong> within width <strong>w</strong>. Overflow parity flips <strong>σ</strong>,
                and <strong>σ</strong> maps to a target exposure profile (long/flat or long/short with configurable{' '}
                <strong>short_scale</strong>).
            </P>

            <Ul>
                <Li>
                    Reproducible evaluation: walk-forward (train/test by year slices), stitched OOS series, plots, and meta JSON
                    bundles.
                </Li>
                <Li>
                    Built-in tuning scripts (daily and 6h) that search parameter grids and score robustness under fees and
                    worst-window penalties.
                </Li>
                <Li>
                    Audit-friendly outputs: configuration snapshots plus artifact bundles that allow results to be reproduced from
                    data + config.
                </Li>
            </Ul>

            <H2>Evidence</H2>
            <P>
                The sandbox demonstrates repeatable walk-forward stitched OOS evaluation with friction buckets (10/25/50 bps)
                across BTC and ETH. Across 1d and 6h in particular, timeframe-specific parameter pockets show smooth fee
                degradation and consistent artifact-backed reproducibility. This is evidence for controller behavior and
                evaluation hygiene, not a guarantee of future performance.
            </P>

            <H2>Customers and Use Cases</H2>
            <P>Primary buyers are teams who already have signals but want a robust controller layer and research hygiene.</P>

            <Ul>
                <Li>
                    <strong>Systematic traders / crypto funds / prop desks:</strong> controller layer to reduce churn, improve fee
                    resilience, and accelerate research iteration with reproducible OOS evidence.
                </Li>
                <Li>
                    <strong>Quant platform / research infra teams:</strong> a small, testable primitive that fits into existing
                    backtesting and simulation stacks while preserving lineage and auditability.
                </Li>
                <Li>
                    <strong>Exchanges / brokers / market makers:</strong> internal strategy QA tooling (fee/stress testing, regime
                    stability diagnostics) for risk and client strategy assessment.
                </Li>
                <Li>
                    <strong>Adjacent (monitoring / MLOps):</strong> the same gate architecture can serve as an auditable hysteresis
                    controller for flappy decision systems.
                </Li>
            </Ul>

            <H2>Competitive advantage</H2>
            <Ul>
                <Li>
                    <strong>Mechanism-first:</strong> decisions are traceable to a small state and a few parameters.
                </Li>
                <Li>
                    <strong>Compute efficiency:</strong> wide sweeps and proper OOS hygiene without cluster spend.
                </Li>
                <Li>
                    <strong>Reproducibility by default:</strong> artifacts + meta logs as a standard output, enabling audit and
                    iteration discipline.
                </Li>
                <Li>
                    <strong>Modularity:</strong> sells as infrastructure (controller + harness), not “magic alpha.”
                </Li>
                <Li>
                    <strong>Transferable pattern:</strong> the controller concept can sit atop multiple feature families and
                    execution stacks.
                </Li>
            </Ul>

            <H2>Go-to-market</H2>
            <P>Start with a paid “Gate Integration + Report” service.</P>

            <Ul>
                <Li>Gate-on vs gate-off comparisons on a client’s existing signals.</Li>
                <Li>Fee/slippage bucket sweeps (10/25/50 bps) and turnover diagnostics.</Li>
                <Li>Walk-forward stitched OOS evaluation with artifact bundle + written report.</Li>
                <Li>
                    Optional: baseline controllers (simple hysteresis thresholds, MA regime filter) included for grounded comparison.
                </Li>
            </Ul>

            <P>Convert recurring needs into subscriptions.</P>

            <Ul>
                <Li>SDK license + scenario packs + support.</Li>
                <Li>Private builds (on-prem / internal runners) for desks with tighter requirements.</Li>
            </Ul>

            <H2>Pricing</H2>
            <Ul>
                <Li>
                    <strong>Starter:</strong> £99-£299 / month (SDK + presets + updates).
                </Li>
                <Li>
                    <strong>Pro Team:</strong> £1,000-£3,000 / month (tuning harness + support + private builds).
                </Li>
                <Li>
                    <strong>Enterprise:</strong> £25k-£150k / year (on-prem + integration + SLA).
                </Li>
                <Li>
                    <strong>Services:</strong> £10k-£50k fixed-fee per integration/report (scope based on assets/timeframes/signals).
                </Li>
            </Ul>

            <H2>Roadmap</H2>
            <H3>Next 90 days</H3>
            <Ul classNames="mb-8">
                <Li>Standardize a “Regime Gate Report” output (single HTML/PDF) produced from walk-forward artifacts.</Li>
                <Li>
                    Expand the gate interface to accept arbitrary feature streams and emit standardized diagnostics (turnover,
                    regime duration distribution, fee sensitivity, worst-window penalties).
                </Li>
                <Li>Add baseline controllers (simple hysteresis thresholds, MA regime filter) for comparison to keep claims grounded.</Li>
                <Li>Package the regime-gate case study as the first public drill-down page, linking methods → pockets → artifacts.</Li>
                <Li>Optional: publish a public config registry and a separate private pocket registry for client work.</Li>
            </Ul>

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
                        label: "Methods and Evaluation Protocol for the Progress-State Regime Gate",
                        to: "/notes/evaluation-protocol-for-progress-state-regime",
                        date: "21st April 2026",
                        image: `${CDN}bell-toy-candles-16-10.jpg`,
                }]} />
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
            <P>
                This repository includes the full analysis pipeline, data ingestion routines, model fitting procedures,
                and scripts used to generate the figures presented in this paper.
            </P>
            <License />
        </Article>
    )
}