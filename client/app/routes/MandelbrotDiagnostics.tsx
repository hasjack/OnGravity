import { Link } from 'react-router'
import { BlockMath, InlineMath } from '../components/Katex'
import Article from '../components/Article'
import Img from '../components/Img'
import { H2, H3, H4, P, Ul, Ol, Li } from '../components/Typography'
import { Route } from './+types/AnalysisNMMandelbrot'

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
        { title: 'Natural Maths Mandelbrot Diagnostics' },
        {
            name: 'description',
            content: 'Orientation-sensitive diagnostics for a Natural Maths extension of the real quadratic atlas.',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Natural Maths Mandelbrot Diagnostics' },
        {
            property: 'og:description',
            content: 'A diagnostic extension of the real quadratic atlas using orientation switching, flip parity, first-flip iteration, occupancy fields, and deformation sweeps in κ.',
        },
        { property: 'og:url', content: url },
    ]
}

export default function AnalysisNMMandelbrot({ loaderData }: Route.ComponentProps) {
    return (
        <Article
            title={'Natural Maths Mandelbrot Diagnostics'}
            author={'Jack Pickett'}
            dateTime={'13th April 2026'}
            url={''}
            shareUrl={loaderData.shareUrl.replace('http://', 'https://')}
        >
            <H2>Introduction</H2>
            <P>
                This note studies a Natural Maths extension of the real quadratic atlas in which orientation is tracked explicitly and switching
                events are treated as diagnostic observables. The construction records flip count, flip parity, final orientation, first-flip
                iteration, and sector occupancy. These fields expose structures that remain hidden in the standard escape-time view, including
                wedge features, parity bands, delayed first-flip contours, and banded switching domains.
            </P>

            <P>
                The present note is empirical in emphasis. Its main task is to document what appears in the atlas once orientation and switching
                are recorded explicitly, and to compare that structure across a small set of deformation values
                <InlineMath math={String.raw`\kappa`} />. Interpretation follows later. The first step is to make the numerical construction
                itself explicit.
            </P>

            <H2>Real Quadratic Baseline</H2>
            <P classNames="mb-0">
                The baseline real quadratic family is
            </P>

            <BlockMath math={String.raw`x_{n+1} = x_n^2 + c`} />

            <P>
                with real parameter <InlineMath math={String.raw`c`} /> and real iterate <InlineMath math={String.raw`x_n`} />. In the standard
                escape-time atlas, each point in parameter space is coloured by whether the orbit remains bounded or escapes beyond a chosen
                threshold. This view records coarse stability, but it does not record internal orientation history.
            </P>

            <P>
                In the present construction, the horizontal axis is again the real parameter
                <InlineMath math={String.raw`c`} />, while the vertical axis is written as an initial curvature-bias coordinate
                <InlineMath math={String.raw`b`} /> with <InlineMath math={String.raw`b=x_0`} />. The atlas is therefore rendered over the
                two-dimensional real parameter space <InlineMath math={String.raw`(c,b)`} />.
            </P>

            <H2>Numerical Construction</H2>
            <P>
                The comparison widget used during development places the classical and Natural-Maths constructions side by side. On the classical
                side, the orbit is iterated in the usual quadratic manner. On the Natural-Maths side, the orbit is iterated using a binary
                orientation-sensitive update in which the sign is determined by a curvature-controlled switching rule. In its simplest rendered
                form, this takes the form
            </P>

            <BlockMath math={String.raw`x_{n+1} = \sigma_n x_n^2 + c`} />

            <P classNames="mb-0">
                with
            </P>

            <BlockMath math={String.raw`\sigma_n = \mathrm{sign}(\sin(\kappa x_n))`} />

            <P>
                as the curvature-flip proxy used in the compare view. The classical and Natural-Maths atlases are therefore generated over the
                same horizontal parameter <InlineMath math={String.raw`c`} />, while the Natural-Maths view uses the initial condition
                <InlineMath math={String.raw`b=x_0`} /> as its second displayed coordinate.
            </P>

            <P>
                This note does not claim that the compare-widget rule exhausts the full Natural-Maths programme. It does, however, provide a
                concrete numerical construction from which the observed wedge, band, parity, and first-flip structures can be inspected directly.
            </P>

            <Img path={`${CDN}nm_mandelbrot_compare_widget.png`} alt={''} />
            <P classNames="mb-8 text-sm">
                <b>Figure 1:</b> Classical-versus-Natural-Maths comparison widget used during development. Left: classical quadratic rendering.
                Right: Natural-Maths curvature-flip rendering over <InlineMath math={String.raw`(c,b)`} /> with a curvature-controlled switching
                rule. This view makes the numerical construction and the role of <InlineMath math={String.raw`\kappa`} /> explicit.
            </P>

            <H2>Orientation-Sensitive Iteration Family</H2>
            <P>
                The iteration is organised around a binary orientation variable
                <InlineMath math={String.raw`\sigma_n \in \{+1,-1\}`} />. Three comparison levels are useful.
            </P>

            <H3>Fixed Preserving Orientation</H3>
            <P classNames="mb-0">
                The first comparison level preserves orientation:
            </P>

            <BlockMath math={String.raw`x_{n+1} = +x_n^2 + c`} />

            <P>
                This reproduces the familiar real quadratic geometry. No switching occurs, so orientation carries no independent dynamical
                structure.
            </P>

            <H3>Fixed Reversing Orientation</H3>
            <P classNames="mb-0">
                The second comparison level reverses orientation throughout:
            </P>

            <BlockMath math={String.raw`x_{n+1} = -x_n^2 + c`} />

            <P>
                This provides a second fixed-sign reference atlas. It changes the geometry of the bounded region, but still does not introduce
                switching.
            </P>

            <H3>Full NM Switching Atlas</H3>
            <P>
                The third level introduces explicit switching. The iterate evolves under an orientation-sensitive quadratic update, while the
                orientation state is allowed to change during iteration. The resulting atlas is then read through a family of switching-sensitive
                diagnostics rather than through escape time alone.
            </P>

            <P>
                The deformation parameter <InlineMath math={String.raw`\kappa`} /> is used throughout as a structural control parameter. Three
                values are especially important in what follows:
            </P>

            <Ul>
                <Li><InlineMath math={String.raw`\kappa = 0`} /> as the undeformed switching case</Li>
                <Li><InlineMath math={String.raw`\kappa = 0.6235`} /> as a representative intermediate deformation value</Li>
                <Li><InlineMath math={String.raw`\kappa = 1`} /> as the regime in which the barcode / delta structure becomes visually explicit</Li>
            </Ul>

            <P>
                The value <InlineMath math={String.raw`\kappa = 0.6235`} /> is used here as an empirical comparison point because it sharpens the
                wedge and right-hand switching structure without yet entering the more extreme barcode-like regime visible at
                <InlineMath math={String.raw`\kappa = 1`} />.
            </P>

            <H2>Diagnostic Fields</H2>
            <P>
                The full atlas is not interpreted through escape time alone. The following diagnostic observables are recorded for each point
                <InlineMath math={String.raw`(c,b)`} />.
            </P>

            <H3>Escape Time</H3>
            <P>
                Escape time records the iteration at which the orbit first exceeds the chosen escape threshold.
            </P>

            <H3>Flip Count</H3>
            <P>
                Flip count records the total number of orientation switches along the orbit before escape or truncation.
            </P>

            <H3>Flip Parity</H3>
            <P>
                Flip parity records whether the total number of flips is even or odd.
            </P>

            <H3>Final Orientation</H3>
            <P>
                Final orientation records the sign of the terminal orientation state
                <InlineMath math={String.raw`\sigma_{\mathrm{final}}`} />.
            </P>

            <H3>First-Flip Iteration</H3>
            <P>
                First-flip iteration records the first step at which the orientation changes. This field distinguishes immediate switching,
                delayed switching, and no switching.
            </P>

            <H3>Occupancy Fractions</H3>
            <P>
                Occupancy fractions record the fraction of time an orbit spends in the
                <InlineMath math={String.raw`\sigma=+1`} /> and <InlineMath math={String.raw`\sigma=-1`} /> sectors.
            </P>

            <H2>Comparison Ladder</H2>
            <P>
                The simplest way to understand the full NM atlas is to compare it against fixed-sign reference families. The comparison ladder
                therefore proceeds from the classical real quadratic atlas through two fixed-orientation variants and finally to the full
                switching atlas.
            </P>

            <Img path={`${CDN}nm_atlas_orientation_ladder_kappa_0_0.png`} alt={''} />
            <P classNames="mb-8 text-sm">
                <b>Figure 2:</b> Orientation ladder at <InlineMath math={String.raw`\kappa = 0`} />. Left: fixed preserving orientation,
                <InlineMath math={String.raw`x_{n+1}=+x_n^2+c`} />. Centre: fixed reversing orientation,
                <InlineMath math={String.raw`x_{n+1}=-x_n^2+c`} />. Right: full NM switching atlas. The right-hand panel already exhibits
                switching-dependent structure not present in the two fixed-sign baselines.
            </P>

            <Img path={`${CDN}nm_atlas_orientation_ladder_kappa_0_6235.png`} alt={''} />
            <P classNames="mb-8 text-sm">
                <b>Figure 3:</b> Orientation ladder at <InlineMath math={String.raw`\kappa = 0.6235`} />. The fixed-sign reference atlases remain
                comparatively simple, while the full NM switching atlas develops a left-hand wedge and structured right-hand bands under
                deformation.
            </P>

            <P>
                The ladder establishes that the full NM atlas is not just a recoloured fixed-sign panel. Once switching is introduced, additional
                structures appear that do not arise in the preserving or reversing baselines.
            </P>

            <H2>Flip Diagnostics</H2>
            <P>
                The most direct way to inspect switching is through flip count, flip parity, final orientation, and first-flip iteration.
                Together these observables show how the orbit’s orientation evolves during iteration.
            </P>

            <Img path={`${CDN}nm_flip_diagnostics_kappa_0_0.png`} alt={''} />
            <P classNames="mb-8 text-sm">
                <b>Figure 4:</b> Flip diagnostics for the full NM atlas at <InlineMath math={String.raw`\kappa = 0`} />. The panels show flip
                count, flip parity, final orientation, and first-flip iteration. Even in the undeformed case, switching-sensitive observables
                reveal structure absent from the fixed-sign atlases.
            </P>

            <Img path={`${CDN}nm_flip_diagnostics_kappa_0_6235.png`} alt={''} />
            <P classNames="mb-8 text-sm">
                <b>Figure 5:</b> Flip diagnostics for the full NM atlas at <InlineMath math={String.raw`\kappa = 0.6235`} />. The left-hand wedge,
                right-hand switching bands, and delayed first-flip contours become much more pronounced once deformation is introduced.
            </P>

            <H3>Flip Count and Parity</H3>
            <P>
                The flip-count field separates low-switching and high-switching regions. The parity field compresses the same history to an
                even/odd partition. Despite this compression, it retains sharp structural information. The right-hand lobe structure is
                parity-sensitive, and the left-hand wedge also carries a distinct parity signature.
            </P>

            <H3>Final Orientation</H3>
            <P>
                The final-orientation field records where the orbit lands in sector space. In the deformed case, the wedge and right-hand bands
                become particularly clear in this field.
            </P>

            <H3>First-Flip Iteration</H3>
            <P>
                The first-flip field is especially revealing. Broad regions are either immediate-switch or never-switch zones, but superimposed on
                these are thin contour families in which the first switch is delayed. The faint left-hand lines visible in this field are of
                particular interest: they suggest a nested family of early-switch boundaries. These contours appear to record loci where the orbit
                remains close to a switching threshold for several steps before finally crossing it.
            </P>

            <H2>Occupancy Diagnostics</H2>
            <P>
                Sector occupancy provides a complementary diagnostic. Whereas flip count and first-flip iteration track the timing of switches,
                occupancy fractions measure the relative dwell time in each orientation sector.
            </P>

            <Img path={`${CDN}nm_parity_atlas_kappa_0_0.png`} alt={''} />
            <P classNames="mb-8 text-sm">
                <b>Figure 6:</b> Escape-time and occupancy diagnostics at <InlineMath math={String.raw`\kappa = 0`} />. The panels show escape
                time, flip count, fraction of time in the <InlineMath math={String.raw`\sigma=+1`} /> sector, and fraction of time in the
                <InlineMath math={String.raw`\sigma=-1`} /> sector.
            </P>

            <Img path={`${CDN}nm_parity_atlas_kappa_0_6235.png`} alt={''} />
            <P classNames="mb-8 text-sm">
                <b>Figure 7:</b> Escape-time and occupancy diagnostics at <InlineMath math={String.raw`\kappa = 0.6235`} />. The deformed NM atlas
                exhibits strong asymmetry in the two sector-occupancy fields, especially near the right-hand switching bands and the left-hand
                wedge.
            </P>

            <P>
                Occupancy fields show that regions with similar escape-time behaviour can still have very different internal orientation balance.
                Escape time suppresses sector history, whereas occupancy retains it.
            </P>

            <H2>Deformation Progression</H2>
            <P>
                The atlas develops progressively under deformation rather than appearing fully formed at once. Three stages are especially useful.
            </P>

            <H3>Undeformed Switching: <InlineMath math={String.raw`\kappa = 0`} /></H3>
            <P>
                The undeformed case already carries switching-sensitive structure. Parity partitions, first-flip contours, and occupancy domains
                are visible even before the wedge is strongly sharpened.
            </P>

            <H3>Intermediate Deformation: <InlineMath math={String.raw`\kappa = 0.6235`} /></H3>
            <P>
                At the representative intermediate value <InlineMath math={String.raw`\kappa = 0.6235`} />, the wedge and right-hand switching
                bands become much more legible. This value therefore serves as a useful comparison point across several diagnostics.
            </P>

            <H3>Strong Deformation: <InlineMath math={String.raw`\kappa = 1`} /></H3>
            <P>
                At <InlineMath math={String.raw`\kappa = 1`} />, the switching geometry develops a visually striking barcode / delta regime. The
                wedge terminates into a sharp vertex, and narrow dark band families split away from it. This appears less like a smooth
                recolouring of an escape-time panel and more like a branching partition of switching domains.
            </P>

            <Img path={`${CDN}nm_kappa_1_barcode_delta.png`} alt={''} />
            <P classNames="mb-8 text-sm">
                <b>Figure 8:</b> Strong-deformation barcode / delta structure at <InlineMath math={String.raw`\kappa = 1`} />. The wedge
                terminates into a sharp branching region, and narrow band families emerge on the right. This regime motivates a dedicated
                drill-down on switching-domain splitting under stronger curvature deformation.
            </P>

            <H2>Zoomed Band Detail</H2>
            <P>
                The parity and final-orientation fields also admit sharply resolved local zooms. These close-up views are useful because they show
                that the switching atlas is partitioned into hard banded domains rather than only broad colour gradients.
            </P>

            <Img path={`${CDN}nm_parity_zoom_kappa_0_0.png`} alt={''} />
            <P classNames="mb-8 text-sm">
                <b>Figure 9:</b> Zoomed parity / orientation detail for the full NM atlas at <InlineMath math={String.raw`\kappa = 0`} />. The
                switching structure resolves into sharply separated bands and domains, showing that the parity field is a genuine binary partition
                generated by the switching dynamics.
            </P>

            <H2>Observed Structures</H2>
            <P>
                Several recurrent structures stand out across the diagnostic fields.
            </P>

            <H3>Left-Hand Wedge</H3>
            <P>
                The left-hand wedge appears clearly in the full NM switching atlas and becomes more pronounced under deformation. Its absence from
                the fixed preserving and fixed reversing baselines strongly suggests that it is switching-generated rather than a feature of the
                quadratic map alone.
            </P>

            <H3>Right-Hand Banding</H3>
            <P>
                The right-hand side develops nested bands in escape time, flip count, parity, and occupancy. Their persistence across multiple
                observables indicates that they are structural and not artefacts of a single colouring scheme.
            </P>

            <H3>Delayed First-Flip Contours</H3>
            <P>
                The faint left-side contour families in the first-flip panel are especially suggestive. They appear to mark loci at which the
                orbit shadows a switching boundary before finally crossing it. These contours provide one of the clearest entry points into the
                local organisation of the switching atlas.
            </P>

            <H3>Barcode / Delta Splitting</H3>
            <P>
                Under stronger deformation, the wedge vertex develops a branching delta-like structure accompanied by narrow barcode-like bands.
                This behaviour suggests a local splitting of switching domains and deserves targeted investigation across a finer
                <InlineMath math={String.raw`\kappa`} /> sweep.
            </P>

            <H3>Sector Asymmetry</H3>
            <P>
                The occupancy fields show that the two orientation sectors are not populated symmetrically across the full parameter plane. This
                asymmetry becomes clearer under deformation and supplies further evidence that the atlas carries internal dynamical structure
                beyond bounded-versus-escaping classification.
            </P>

            <H2>Interpretation</H2>
            <P>
                The present diagnostics establish that the full NM switching atlas carries persistent internal structure beyond escape time alone.
                Escape time records coarse bounded-versus-escaping geometry. Flip count and first-flip iteration record switching timing. Flip
                parity and final orientation record binary sector invariants. Occupancy fractions record relative dwell time in each sector.
            </P>

            <P>
                Taken together, these fields define a diagnostic extension of the real quadratic atlas. The observed wedge, band, contour, and
                barcode structures remain empirical at this stage. Their role in the present note is to identify persistent morphological features
                that recur across several observables and respond systematically to the deformation parameter
                <InlineMath math={String.raw`\kappa`} />.
            </P>

            <H2>Conclusion</H2>
            <P classNames="mb-8">
                The Natural Maths switching atlas supports a richer diagnostic structure than the standard real quadratic escape-time picture.
                Orientation-sensitive observables expose wedge features, parity bands, delayed first-flip contours, barcode-like domain splitting,
                and sector-occupancy asymmetries that remain hidden in the classical view. The next step is to drill down on how these structures
                arise locally, especially in the first-flip contour families and the <InlineMath math={String.raw`\kappa = 1`} /> delta regime,
                and to determine how the switching geometry develops across finer deformation sweeps.
            </P>
        </Article>
    )
}