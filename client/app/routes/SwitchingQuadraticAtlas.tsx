import { BlockMath, InlineMath } from '../components/Katex'
import Article from '../components/Article'
import SwitchingAtlasExplorer from '../components/SwitchingAtlasExplorer'
import { H2, H3, P, Ul, Ol, Li } from '../components/Typography'
import { Route } from './+types/SwitchingQuadraticAtlas'

const { VITE_APP_CDN_URL } = import.meta.env
const CDN = (VITE_APP_CDN_URL || 'https://cdn.halfasecond.com/images/onGravity/') + 'outputs/'

export function loader({ request }: Route.LoaderArgs) {
    return { shareUrl: request.url }
}

export function meta({ location }: Route.MetaArgs) {
    const url = `https://halfasecond.com${location.pathname}`

    return [
        { title: 'Switching Quadratic Atlas Diagnostics' },
        {
            name: 'description',
            content:
                'Orientation-sensitive diagnostics for a switching extension of the real quadratic atlas: flip count, parity, first-flip iteration, occupancy, and κ deformation.',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Switching Quadratic Atlas Diagnostics' },
        {
            property: 'og:description',
            content:
                'A diagnostic extension of the real quadratic atlas using orientation switching, flip parity, first-flip iteration, occupancy fields, and deformation sweeps in κ.',
        },
        { property: 'og:url', content: url },
    ]
}

export default function SwitchingQuadraticAtlasDiagnostics({ loaderData }: Route.ComponentProps) {
    return (
        <Article
            title={'Switching Quadratic Atlas Diagnostics'}
            author={'Jack Pickett'}
            dateTime={'15th April 2026'}
            url={''}
            shareUrl={loaderData.shareUrl.replace('http://', 'https://')}
        >
            <H2>1. Purpose and Scope</H2>

            <P>
                This note documents what appears in the real quadratic parameter plane once an explicit orientation state is carried through the
                iteration and switching events are recorded as diagnostic observables. Escape-time colouring records coarse bounded-versus-escaping
                geometry. Orientation-sensitive diagnostics record internal history: flip count, flip parity, final orientation, first-flip iteration,
                and sector occupancy.
            </P>

            <P classNames="mb-8">
                Emphasis is empirical. The objective is to define a concrete switching family, render diagnostic fields over a two-parameter plane,
                and identify recurrent morphological features that persist across multiple observables. A flip is an orientation change triggered by a 
                threshold event during iteration; related notes provide diagnostic atlases and an interactive explorer for flip parity,
                first-flip time, and occupancy. The wedge, right-hand banding, and delayed first-flip contours are treated as primary targets.
                Mechanism is treated as a working hypothesis supported by diagnostic evidence, not as a completed derivation.
            </P>

            <H2>2. Baseline: the Real Quadratic Atlas</H2>

            <P classNames="mb-0">The baseline real quadratic family is</P>
            <BlockMath math={String.raw`x_{n+1} = x_n^2 + c`} />

            <P classNames="mb-8">
                with real parameter <InlineMath math={String.raw`c`} />. The standard atlas colours each parameter value by whether the orbit escapes
                beyond a threshold. This view records coarse stability, but it suppresses internal orientation history.
            </P>

            <H2>3. Model Definition: Orientation-Switching Quadratic Dynamics</H2>

            <P classNames="mb-0">
                The switching family evolves a real iterate <InlineMath math={String.raw`x_n`} /> together with a binary orientation variable{' '}
                <InlineMath math={String.raw`\sigma_n \in \{+1,-1\}`} />:
            </P>

            <BlockMath math={String.raw`x_{n+1} = \sigma_n x_n^2 + c`} />

            <P classNames="mb-0">Orientation is updated using a threshold-triggered flip rule,</P>

            <BlockMath
                math={String.raw`\sigma_{n+1}=\begin{cases}
-\sigma_n & \text{if } |x_{n+1}| > 1+|b|\kappa,\\
\ \sigma_n & \text{otherwise.}
\end{cases}`}
            />

            <P classNames="mb-8">
                The threshold depends on the initial-condition coordinate <InlineMath math={String.raw`b=x_0`} />. The deformation parameter{' '}
                <InlineMath math={String.raw`\kappa`} /> scales this threshold and changes switching itineraries across the parameter plane. A
                sign–sin switching variant is available in the interactive explorer as a comparison rule.
            </P>

            <H3>3.1. Fixed-Sign Reference Families</H3>

            <P>Two fixed-sign reference families provide a comparison ladder. These remove switching while keeping the quadratic skeleton.</P>

            <P classNames="mb-0">Preserving sign:</P>
            <BlockMath math={String.raw`x_{n+1} = +x_n^2 + c`} />

            <P classNames="mb-0">Reversing sign:</P>
            <BlockMath math={String.raw`x_{n+1} = -x_n^2 + c`} />

            <P classNames="mb-8">
                The switching atlas is interpreted relative to these baselines rather than treated as a recolouring of one of them.
            </P>

            <H3>3.2. Deformation Values</H3>

            <P>Two deformation values organise the comparisons in this note:</P>
            <Ul classNames="mb-8">
                <Li>
                    <InlineMath math={String.raw`\kappa = 0`} />: baseline threshold-switching case (flip boundary at <InlineMath math={String.raw`|x_{n+1}|>1`} />
                    )
                </Li>
                <Li>
                    <InlineMath math={String.raw`\kappa = 0.6235`} />: representative intermediate deformation
                </Li>
            </Ul>

            <H2>4. Diagnostic Invariants</H2>

            <P>
                The atlas is rendered through a family of diagnostic observables. Each observable is recorded for every grid point{' '}
                <InlineMath math={String.raw`(c,b)`} /> under fixed numerical settings (iteration cap, escape threshold, and step rules).
            </P>

            <H3>4.1. Escape Time</H3>
            <P>Escape time records the first iteration at which the orbit exceeds the escape radius.</P>

            <H3>4.2. Flip Count</H3>
            <P>Flip count records the total number of orientation changes before escape or truncation.</P>

            <H3>4.3. Flip Parity</H3>
            <P>Flip parity records whether the flip count is even or odd.</P>

            <H3>4.4. Final Orientation</H3>
            <P>
                Final orientation records <InlineMath math={String.raw`\sigma_{\rm final}`} />, the terminal orientation state at escape or at the
                iteration cap.
            </P>

            <H3>4.5. First-Flip Iteration</H3>
            <P>
                First-flip iteration records the earliest step at which orientation changes. This diagnostic separates immediate switching from
                delayed switching and never-switch behaviour.
            </P>

            <H3>4.6. Occupancy Fractions</H3>
            <P classNames="mb-8">
                Occupancy fractions record the fraction of steps spent in <InlineMath math={String.raw`\sigma=+1`} /> and{' '}
                <InlineMath math={String.raw`\sigma=-1`} /> before escape or truncation.
            </P>

            <H2>5. Comparison Ladder</H2>

            <P>
                The ladder compares the two fixed-sign baselines against the threshold-switching atlas. This isolates morphology created by
                switching rather than by a static sign choice.
            </P>

            <img src={`${CDN}nm_atlas_orientation_ladder_kappa_0_0.png`} alt={''} className="print:w-[80%]" />
            <P classNames="text-sm">
                <b>Figure 1:</b> Comparison ladder at <InlineMath math={String.raw`\kappa = 0`} />. Left: preserving sign{' '}
                <InlineMath math={String.raw`x_{n+1}=+x_n^2+c`} />. Centre: reversing sign{' '}
                <InlineMath math={String.raw`x_{n+1}=-x_n^2+c`} />. Right: threshold-switching atlas.
            </P>

            <img src={`${CDN}nm_atlas_orientation_ladder_kappa_0_6235.png`} alt={''} className="print:w-[80%]" />
            <P classNames="mb-8 text-sm">
                <b>Figure 2:</b> Comparison ladder at <InlineMath math={String.raw`\kappa = 0.6235`} />. The threshold-switching atlas develops a
                left-hand wedge and structured right-hand banding under deformation.
            </P>

            <H2>6. Flip Diagnostics</H2>

            <P>
                Flip diagnostics provide a direct view into switching history: how often switching occurs, whether it occurs early or late, and where
                the orbit lands in orientation space.
            </P>

            <img src={`${CDN}nm_parity_atlas_kappa_0_0.png`} alt={''} className="print:w-[80%]" />
            <P classNames="text-sm">
                <b>Figure 3:</b> Flip diagnostics at <InlineMath math={String.raw`\kappa = 0`} />: flip count, parity, final orientation, and first flip
                iteration.
            </P>

            <img src={`${CDN}nm_parity_atlas_kappa_0_6235.png`} alt={''} className="print:w-[80%]" />
            <P classNames="mb-8 text-sm">
                <b>Figure 4:</b> Flip diagnostics at <InlineMath math={String.raw`\kappa = 0.6235`} />. The wedge, right-hand switching domains, and
                delayed first-flip contours become sharply expressed.
            </P>

            <H3>6.1. First-Flip Contours as a Skeleton Diagnostic</H3>

            <P classNames="mb-8">
                The first-flip field is the most informative single panel. Broad regions correspond to immediate-switch or never-switch behaviour.
                Superimposed on this are contour families where switching is delayed by a specific number of iterations. These contours suggest an
                event-time organisation tied to when an orbit first exceeds the flip threshold.
            </P>

            <H2>7. Escape and Occupancy Diagnostics</H2>

            <P>
                Occupancy fractions complement flip count and first-flip iteration. Two points can share a similar escape-time colour and still spend
                very different proportions of time in each orientation sector.
            </P>

            <img src={`${CDN}nm_flip_diagnostics_kappa_0_0.png`} alt={''} className="print:w-[80%]" />
            <P classNames="text-sm">
                <b>Figure 5:</b> Escape-time and occupancy diagnostics at <InlineMath math={String.raw`\kappa = 0`} />.
            </P>

            <img src={`${CDN}nm_flip_diagnostics_kappa_0_6235.png`} alt={''} className="print:w-[80%]" />
            <P classNames="mb-8 text-sm">
                <b>Figure 6:</b> Escape-time and occupancy diagnostics at <InlineMath math={String.raw`\kappa = 0.6235`} />. Sector asymmetry becomes
                pronounced near the wedge and right-hand switching bands.
            </P>

            <H2>8. Morphology Results</H2>

            <P>Several recurrent structures persist across multiple diagnostics and respond systematically to deformation.</P>

            <H3>8.1. Left-Hand Wedge</H3>
            <P>
                The wedge appears in the switching atlas and sharpens under deformation. Its absence from the two fixed-sign baselines supports the
                interpretation that it is switching-generated rather than a static feature of the quadratic map.
            </P>

            <H3>8.2. Right-Hand Banding</H3>
            <P>
                Nested bands appear across escape time, flip count, parity, and occupancy. Persistence across multiple fields suggests structural
                partitioning rather than a colouring artefact.
            </P>

            <H3>8.3. Delayed First-Flip Contours</H3>
            <P classNames="mb-8">
                Fine contour families in the first-flip field suggest loci where the orbit remains below the flip threshold for several steps before
                exceeding it. These contours are mechanism-facing because they isolate a specific event time rather than a coarse lifetime.
            </P>

            <H2>9. Mechanism Hypothesis</H2>

            <P>A working hypothesis ties the morphology to a hitting-time / preimage skeleton of the flip boundary:</P>

            <Ol>
                <Li>
                    Switching occurs when the next iterate crosses the flip boundary{' '}
                    <InlineMath math={String.raw`|x_{n+1}| > 1+|b|\kappa`} />.
                </Li>
                <Li>
                    The set of parameter values for which the first switch occurs at exactly step <InlineMath math={String.raw`n`} /> forms event-time
                    curves in <InlineMath math={String.raw`(c,b)`} />.
                </Li>
                <Li>
                    Increasing <InlineMath math={String.raw`\kappa`} /> raises the flip threshold for larger <InlineMath math={String.raw`|b|`} />,
                    changing the availability and timing of flips and producing the observed domain partitioning.
                </Li>
            </Ol>

            <P classNames="mb-8">
                The first-flip field is the natural diagnostic for this hypothesis. A minimal drill-down samples a handful of points from (i) a wedge
                interior, (ii) a delayed-switch contour, and (iii) a right-hand band. The sequence{' '}
                <InlineMath math={String.raw`\max(0,\ |x_n|-(1+|b|\kappa))`} /> plotted against iteration index tests for threshold boundary shadowing.
            </P>

            <H2>10. Robustness Checklist</H2>

            <P>Three numerical choices control appearance and require explicit reporting in any follow-up:</P>

            <Ul>
                <Li>grid resolution in <InlineMath math={String.raw`(c,b)`} /></Li>
                <Li>iteration cap</Li>
                <Li>escape threshold</Li>
            </Ul>

            <P classNames="mb-8">
                Morphology that persists under resolution refinement and iteration-cap extension is treated as structural. Morphology that shifts
                substantially under small numerical changes is treated as rendering-dependent.
            </P>

            <H2>11. Conclusion</H2>

            <P classNames="mb-8">
                Orientation-sensitive diagnostics define a usable extension of the real quadratic atlas. Flip count, parity, first-flip iteration,
                final orientation, and occupancy expose wedge structure, banding, and delayed-switch contours under threshold-triggered κ deformation.
                The first-flip field stands out as a mechanism-facing diagnostic and motivates targeted orbit-level drill-down and finer deformation
                sweeps.
            </P>

            <H2>12. Interactive Explorer</H2>

            <P classNames="mb-6">
                The explorer renders the same diagnostics over the same <InlineMath math={String.raw`(c,b)`} /> plane. The default switching rule is
                the threshold flip rule used for the figures below. A sign-sin rule is available via the dropdown as a comparison.
            </P>

            <SwitchingAtlasExplorer />
        </Article>
    )
}