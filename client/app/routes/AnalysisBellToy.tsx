import { Link } from 'react-router'
import { BlockMath, InlineMath } from '../components/Katex'
import Article from '../components/Article'
import Img from '../components/Img'
import { H2, H3, H4, P, Ul, Ol, Li } from '../components/Typography'
import { Route } from './+types/AnalysisBellToy'

const { VITE_APP_CDN_URL } = import.meta.env
const CDN = VITE_APP_CDN_URL || 'https://cdn.halfasecond.com/images/onGravity/'

export function loader({ request }: Route.LoaderArgs) {
    return {
        shareUrl: request.url,
    }
}

export function meta({ location }: Route.MetaArgs) {
    const url = `https://halfasecond.com${location.pathname}`

    return [
        { title: 'Progress-State Bell Toy in Natural Mathematics' },
        {
            name: 'description',
            content: 'A local Bell-type toy model built from Natural Mathematics progress-state dynamics.',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Progress-State Bell Toy in Natural Mathematics' },
        {
            property: 'og:description',
            content: 'A local CHSH-style toy model using sector-state and progress variables with flip-on-overflow dynamics.',
        },
        { property: 'og:url', content: url },
    ]
}

export default function AnalysisBellToy({ loaderData }: Route.ComponentProps) {
    return (
        <Article
            title={'Progress-State Bell Toy in Natural Mathematics'}
            author={'Jack Pickett'}
            dateTime={'12th April 2026'}
            url={''}
            shareUrl={loaderData.shareUrl.replace('http://', 'https://')}
        >
            <H2>Progress-State Bell Toy</H2>

            <P classNames="mb-0">
                A Bell-style toy model is constructed from a primitive state built from sector and progress,
            </P>

            <BlockMath math={String.raw`(\sigma, p)`} />

            <P>
                where <InlineMath math={String.raw`\sigma \in \{+1,-1\}`} /> denotes the current orientation sector
                and <InlineMath math={String.raw`p \in [0,1)`} /> denotes progress through that sector. The construction
                treats binary state and state progress as the fundamental variables. The sector label <InlineMath math={String.raw`\sigma`} /> supplies 
                the observable state, while <InlineMath math={String.raw`p`} /> tracks advance toward the next flip.
            </P>

            <P>
                An earlier exploratory draft introduces the orientation-based language of Natural Mathematics in heuristic form.
                The present note does not rely on the full axiomatic programme. It isolates one minimal sector-progress structure
                inspired by that draft and studies its consequences as a local Bell-style toy model.
            </P>

            <H3>Update Rule</H3>

            <P classNames="mb-0">
                Given a progress increment <InlineMath math={String.raw`\delta \ge 0`} />, the state is updated through
            </P>

            <BlockMath math={String.raw`(\sigma,p)\oplus \delta`} />

            <P classNames="mb-0">with total progress</P>

            <BlockMath math={String.raw`T = p + \delta`} />

            <P classNames="mb-0">flip count</P>

            <BlockMath math={String.raw`n = \lfloor T \rfloor`} />

            <P classNames="mb-0">and remainder</P>

            <BlockMath math={String.raw`r = T \bmod 1`} />

            <P classNames="mb-0">The updated sector is</P>

            <BlockMath
                math={String.raw`
\sigma' =
\begin{cases}
\sigma, & n \text{ even} \\
-\sigma, & n \text{ odd}
\end{cases}
`}
            />

            <P>
                The updated state is therefore <InlineMath math={String.raw`(\sigma',r)`} />. Progress accumulates continuously within a sector,
                and each boundary crossing flips the sector while preserving the remainder. When several boundaries are crossed in one update,
                only the parity of the number of crossings determines the final sector.
            </P>

            <H4>Example Updates</H4>

            <P classNames="mb-0">The update rule behaves as expected in simple test cases:</P>

            <BlockMath math={String.raw`(-,0.75)\oplus 0.50 \rightarrow (+,0.25)`} />
            <BlockMath math={String.raw`(+,0.10)\oplus 0.20 \rightarrow (+,0.30)`} />
            <BlockMath math={String.raw`(+,0.90)\oplus 0.30 \rightarrow (-,0.20)`} />
            <BlockMath math={String.raw`(-,0.30)\oplus 2.10 \rightarrow (-,0.40)`} />

            <P>
                These examples confirm the intended behaviour: persistence within a sector, flipping on overflow, and retention of the remainder
                after the flip.
            </P>

            <H3>Binary Measurement Rule</H3>

            <P classNames="mb-0">The toy uses the simplest binary observable,</P>

            <BlockMath math={String.raw`M(\sigma,p)=\sigma \in \{+1,-1\}`} />

            <P>so the sector itself supplies the readout.</P>

            <H3>Bell Construction</H3>

            <P>
                A shared source emits pairs with common hidden variables: an initial sector <InlineMath math={String.raw`\sigma_0`} />,
                an initial progress <InlineMath math={String.raw`p_0`} />, and a shared latent parameter <InlineMath math={String.raw`\lambda`} />. 
                Each wing then evolves locally according to its own setting.
            </P>

            <P classNames="mb-0">The hidden-variable space is taken to be</P>

            <BlockMath math={String.raw`\Omega = \{(\sigma_0,p_0,\lambda): \sigma_0 \in \{\pm 1\},\ p_0 \in [0,1),\ \lambda \in [-\pi,\pi)\}`} />

            <P>
                with <InlineMath math={String.raw`\sigma_0`} /> sampled uniformly from <InlineMath math={String.raw`\{\pm1\}`} />, <InlineMath math={String.raw`p_0 \sim \mathrm{Unif}[0,1)`} />,
                and <InlineMath math={String.raw`\lambda \sim \mathrm{Unif}[-\pi,\pi)`} />. These source variables are taken
                to be statistically independent of the measurement settings.
            </P>

            <P classNames="mb-0">
                For settings <InlineMath math={String.raw`a,a'`} /> on one wing and <InlineMath math={String.raw`b,b'`} /> on the other, local
                progress increments are defined by
            </P>

            <BlockMath math={String.raw`\delta_A = \delta(a,\lambda), \qquad \delta_B = \delta(b,\lambda)`} />

            <P>
                Each wing updates independently, and the resulting outcomes are correlated in the usual CHSH form.
            </P>

            <P classNames="mb-0">The correlations are computed as</P>

            <BlockMath math={String.raw`E(x,y)=\langle A_x B_y \rangle`} />

            <P classNames="mb-0">and the CHSH combination is</P>

            <BlockMath math={String.raw`S = E(a,b) + E(a,b') + E(a',b) - E(a',b')`} />

            <H3>Local Response Rule</H3>

            <P classNames="mb-0">A piecewise local response rule is introduced. Let</P>

            <BlockMath math={String.raw`d = |\mathrm{wrap}(\mathrm{setting} - \lambda)|`} />

            <P classNames="mb-0">
                where <InlineMath math={String.raw`\mathrm{wrap}`} /> returns angular separation on <InlineMath math={String.raw`[-\pi,\pi)`} />. 
                The local progress increment is taken to be
            </P>

            <BlockMath
                math={String.raw`
\delta =
\begin{cases}
0.85, & d < w \\
0.20, & d \ge w
\end{cases}
`}
            />

            <P>
                The parameter <InlineMath math={String.raw`w`} /> therefore sets the width of the local response window. Local alignment produces
                strong progress, while non-alignment produces weak progress.
            </P>

            <H3>Analytic Correlation Lemma</H3>

            <P>
                Because both wings share the same hidden source state, the product of the two binary outcomes depends only on the parity mismatch
                between the two local overflow counts. Writing
            </P>

            <BlockMath math={String.raw`A_x B_y = (-1)^{\lfloor p_0 + \delta(x,\lambda)\rfloor + \lfloor p_0 + \delta(y,\lambda)\rfloor}`} />

            <P>
                one can make the mechanism completely explicit.
            </P>

            <H4>Lemma</H4>

            <P>
                Assume <InlineMath math={String.raw`p_0 \sim \mathrm{Unif}[0,1)`} /> and <InlineMath math={String.raw`\delta(x,\lambda),\delta(y,\lambda) \in [0,1)`} />. Then
            </P>

            <BlockMath math={String.raw`\mathbb{E}[A_x B_y \mid \lambda] = 1 - 2\,|\delta(x,\lambda)-\delta(y,\lambda)|`} />

            <H4>Proof</H4>

            <P>
                For fixed <InlineMath math={String.raw`\lambda`} />, each floor 
                term <InlineMath math={String.raw`\lfloor p_0 + \delta(\cdot,\lambda)\rfloor`} /> is either <InlineMath math={String.raw`0`} /> or <InlineMath math={String.raw`1`} />. 
                A parity mismatch occurs exactly when one of the two quantities crosses the overflow threshold
                and the other does not. Since <InlineMath math={String.raw`p_0`} /> is uniform on <InlineMath math={String.raw`[0,1)`} />, the set
                of mismatch values has measure <InlineMath math={String.raw`|\delta(x,\lambda)-\delta(y,\lambda)|`} />. Therefore
                the product <InlineMath math={String.raw`A_x B_y`} /> equals <InlineMath math={String.raw`-1`} /> on a set of that measure 
                and <InlineMath math={String.raw`+1`} /> elsewhere, giving the stated conditional expectation.
            </P>

            <P classNames="mb-0">Averaging over the shared hidden variable <InlineMath math={String.raw`\lambda`} /> yields</P>

            <BlockMath math={String.raw`E(x,y)=\mathbb{E}_{\lambda}\!\left[1 - 2\,|\delta(x,\lambda)-\delta(y,\lambda)|\right]`} />

            <P>
                This expression shows that the Bell-type structure is controlled by the average mismatch in local progress increments under the
                shared hidden variable <InlineMath math={String.raw`\lambda`} />.
            </P>

            <P classNames="mb-0">
                For the specific two-level rule used here, <InlineMath math={String.raw`\delta \in \{0.85,0.20\}`} />, so
            </P>

            <BlockMath math={String.raw`|\delta(x,\lambda)-\delta(y,\lambda)| \in \{0,0.65\}`} />

            <P classNames="mb-0">and therefore</P>

            <BlockMath math={String.raw`E(x,y)=1-1.3\,\mathbb{P}_{\lambda}\!\bigl(\delta(x,\lambda)\neq \delta(y,\lambda)\bigr)`} />

            <P>
                The correlations are thus determined by the extent to which the two local response windows disagree as functions of <InlineMath math={String.raw`\lambda`} />.
            </P>

            <Img path={`${CDN}nm_progress_state_bell_toy.png`} alt={''} />

            <P classNames="mb-8 text-sm">
                <b>Figure 1:</b> Representative progress-state Bell toy result for a fixed local response window. Top: the four Bell-setting
                correlations. Bottom: the corresponding CHSH score. Numerical values shown here and below are estimated by Monte Carlo sampling 
                of <InlineMath math={String.raw`\Omega`} /> under the stated uniform source distribution.
            </P>

            <H3>Classicality</H3>

            <P classNames="mb-0">
                For each hidden state <InlineMath math={String.raw`\omega \in \Omega`} />, the toy assigns deterministic local binary 
                outcomes <InlineMath math={String.raw`A_x(\omega), B_y(\omega) \in \{\pm 1\}`} />. The construction therefore lies within the standard local
                hidden-variable class, and the CHSH bound
            </P>

            <BlockMath math={String.raw`|E(a,b) + E(a,b') + E(a',b) - E(a',b')| \le 2`} />

            <P>
                follows by the usual theorem. The numerical sweep therefore illustrates how the response-window parameter moves the toy within the
                classical region.
            </P>

            <H3>Width Sweep</H3>

            <P>To test robustness, the response width is swept across four values:</P>

            <Ul>
                <Li><InlineMath math={String.raw`\pi/6`} /></Li>
                <Li><InlineMath math={String.raw`\pi/5`} /></Li>
                <Li><InlineMath math={String.raw`\pi/4`} /></Li>
                <Li><InlineMath math={String.raw`\pi/3`} /></Li>
            </Ul>

            <P classNames="mb-0">The corresponding CHSH scores are</P>

            <BlockMath math={String.raw`\pi/6 \rightarrow S = 1.4638`} />
            <BlockMath math={String.raw`\pi/5 \rightarrow S = 1.5478`} />
            <BlockMath math={String.raw`\pi/4 \rightarrow S = 1.6759`} />
            <BlockMath math={String.raw`\pi/3 \rightarrow S = 1.8932`} />

            <P>
                The CHSH score rises monotonically across the sweep. The response window therefore supplies a genuine control parameter for the toy.
            </P>

            <Img path={`${CDN}nm_progress_state_bell_width_sweep.png`} alt={''} />

            <P classNames="mb-8 text-sm">
                <b>Figure 2:</b> CHSH score as a function of response-window width <InlineMath math={String.raw`w`} /> for the progress-state Bell toy.
                Top: CHSH score across the width sweep. Bottom: the four setting-pair correlations across the same sweep. The score rises from <InlineMath math={String.raw`S \approx 1.46`} /> 
                at <InlineMath math={String.raw`w=\pi/6`} /> to <InlineMath math={String.raw`S \approx 1.89`} /> at <InlineMath math={String.raw`w=\pi/3`} />, 
                approaching but not exceeding the classical bound.
            </P>

            <H3>Correlation Pattern</H3>

            <P>
                The increase in <InlineMath math={String.raw`S`} /> does not arise from all four correlations growing together. The three 
                channels <InlineMath math={String.raw`E(a,b)`} />, <InlineMath math={String.raw`E(a,b')`} />, and <InlineMath math={String.raw`E(a',b)`} /> remain 
                clustered near <InlineMath math={String.raw`0.67`} /> across the sweep. The main change occurs in 
                the <InlineMath math={String.raw`E(a',b')`} /> channel, which falls steadily:
            </P>

            <Ul>
                <Li><InlineMath math={String.raw`E(a',b') \approx 0.5627`} /> at <InlineMath math={String.raw`w=\pi/6`} /></Li>
                <Li><InlineMath math={String.raw`E(a',b') \approx 0.4760`} /> at <InlineMath math={String.raw`w=\pi/5`} /></Li>
                <Li><InlineMath math={String.raw`E(a',b') \approx 0.3482`} /> at <InlineMath math={String.raw`w=\pi/4`} /></Li>
                <Li><InlineMath math={String.raw`E(a',b') \approx 0.1319`} /> at <InlineMath math={String.raw`w=\pi/3`} /></Li>
            </Ul>

            <P>
                The rise in <InlineMath math={String.raw`S`} /> is therefore driven by one setting pair becoming progressively more exceptional than
                the other three. In the language of the analytic reduction above, this is the setting pair for which the two local response windows
                disagree most strongly as functions of <InlineMath math={String.raw`\lambda`} />.
            </P>

            <H3>Diagnostic Behaviour</H3>

            <P>
                Across the sweep, the mean progress increments and mean flip counts change only modestly. The dominant change appears in the
                same-sector agreement for the <InlineMath math={String.raw`a',b'`} /> channel. The width parameter therefore alters the pattern of
                sector agreement more strongly than the overall level of activity.
            </P>

            <H3>Interpretation</H3>

            <P>
                The progress-state Bell toy shows that a minimal sector-progress algebra, written in Natural Mathematics language 
                as <InlineMath math={String.raw`(\sigma,p)`} />, supports a local Bell-style model with binary measurements and non-trivial
                setting-dependent correlations.
            </P>

            <Ol>
                <Li>
                    The <InlineMath math={String.raw`(\sigma,p)`} /> formalism supplies a working local update algebra with explicit binary readout.
                </Li>
                <Li>
                    The Bell-type structure depends strongly on the local response rule. The piecewise response preserves the sector structure clearly
                    enough to produce a monotonic CHSH trend across the width sweep.
                </Li>
                <Li>
                    Widening the local response window drives the CHSH score upward toward the classical ceiling by suppressing one correlation channel
                    while leaving the other three relatively stable.
                </Li>
            </Ol>

            <P>
                The toy remains classical throughout the tested sweep. No Bell violation occurs. The result instead demonstrates that local
                sector-progress dynamics are sufficient to generate a structured and tunable Bell-type landscape.
            </P>

            <H3>Summary</H3>

            <P classNames="mb-8">
                The progress-state Bell toy provides a clean checkpoint for the toy phase. A primitive state space built from sector and progress,
                together with a flip-on-overflow update law, generates structured CHSH-style correlations under fully local rules. The score rises from
                approximately <InlineMath math={String.raw`1.46`} /> to <InlineMath math={String.raw`1.89`} /> as the local response window widens
                from <InlineMath math={String.raw`\pi/6`} /> to <InlineMath math={String.raw`\pi/3`} />, while remaining below the classical bound.
            </P>
        </Article>
    )
}
