{/* Non-trivial mars bars */ }
import { BlockMath, InlineMath } from '../components/Katex'
import { H1, H2, H2Alt, H3, P } from '../components/Typography'
import Img from '../components/Img'
import { Route } from './+types/NonTrivialMarsBars'
import Share from '~/components/Share'

const { VITE_APP_CDN } = import.meta.env
const CDN = VITE_APP_CDN || 'https://cdn.halfasecond.com/images/onGravity/'

export function loader({ request }: Route.LoaderArgs) {
    return {
        shareUrl: request.url,
    }
}

export function meta({ location }: Route.MetaArgs) {
    const url = `https://halfasecond.com${location.pathname}`
    return [
        { title: "Non-trivial Mars bars" },
        {
            name: "description",
            content: "An Introduction to Natural Maths - Non-trivial Mars bars",
        },

        // Open Graph
        { property: "og:type", content: "website" },
        {
            property: "og:title",
            content: "An Introduction to Natural Maths - Non-trivial Mars bars",
        },
        {
            property: "og:description",
            content:
                "Exploring the profound implications of sharing zero and the nature of division with Mars Bars.",
        },
        { property: "og:url", content: url },
        {
            property: "og:image",
            content: "https://cdn.halfasecond.com/images/onGravity/k-framework.jpg",
        },

        // Twitter
        { name: "twitter:card", content: "summary_large_image" },
        {
            name: "twitter:title",
            content: "Non-trivial Mars bars",
        },
        {
            name: "twitter:description",
            content:
                "An Introduction to Natural Maths - Non-trivial Mars bars",
        },
        {
            name: "twitter:image",
            content: "https://cdn.halfasecond.com/images/onGravity/k-framework.jpg",
        },
    ]
}

export default function NonTrivialMarsBars({ loaderData }: Route.ComponentProps) {
    return (
        <div className="bg-white font-mono text-neutral-950">
            <section className="relative flex min-h-dvh snap-start flex-col items-center justify-center bg-white px-5 py-16 text-center text-neutral-800">
                <div className="relative flex w-full max-w-3xl flex-col items-center">
                    <H1>Non-trivial Mars bars</H1>
                    <H3>~ An Introduction to Natural Maths ~</H3>
                    <div className="mb-6 mt-2 flex flex-wrap justify-center gap-2 print:hidden">
                        <Share shareUrl={loaderData.shareUrl.replace("http://", "https://")} title="Non-trivial Mars bars" />
                    </div>
                    <Img path={`${CDN}mars-bar.jpg`} alt={'Non-trivial Mars bars'} classNames="border-0 bg-transparent" />
                    <P>A child asks his father if he has any Mars Bars. The father answers that he has zero Mars bars.</P>
                    <P classNames="rounded-md bg-neutral-100 mb-4 p-3">The child asks: <i>“Can you halve zero - because if you can then we can share?”</i></P>
                    <P>They tried it with a zero Mars bar which they put on a table and cut in half. They then took a half each and decided that as they both now had half a zero Mars bar <b>you must be able to halve zero!</b></P>
                    <P>Reflecting, it had actually been very easy to cut the zero Mars bar. So easy, in fact, they had been able to make the cut in such an exact way that the 2 portions were precisely (fundamentally?) equal.</P>
                    <P>They hadn't even needed a knife!</P>
                    <P>Are these lame dad jokes actually <b>nature hinting at something profound?</b> 🧐</P>
                </div>
            </section>
            <section className="relative flex min-h-dvh snap-start flex-col items-center justify-center bg-neutral-50 px-5 py-16 text-center text-neutral-800">
                <div className="relative flex w-full max-w-3xl flex-col items-center">
                    <H2Alt>The half a zero Mars bar premise:</H2Alt>
                    <P classNames="rounded-md bg-white mb-4 p-3">For any structure 𝑆, 𝑆 / 2 produces the smallest non-trivial structural unit consistent with 𝑆</P>
                    <P classNames="mb-0">You can operate on something that isn't there as long as the rule is consistent - <b>implying:</b></P>
                    <BlockMath math={'0/2 = 0.5'} />
                    <P>In nature, and everyday speech, zero is a <i>relationship</i> and often (always?) behaves this way:</P>
                    <P><b>Sharing zero</b> → a rule about fairness → <i>I've got nothing I can share</i></P>
                    <P><b>Cosmological example</b> → <i>a region with zero net force remains zero when divided</i></P>
                    <H3>Example:</H3>
                    <P classNames="rounded-md bg-white mb-4 p-3">
                        The Lagrange points 𝐿4 and 𝐿5 in a two-body system lie in regions of zero net force. You can “divide” this equilibrium region into smaller equilibrium cells — the rule holds at every scale.
                    </P>
                    <P>
                        <b>Interpretation:</b>
                    </P>
                    <P>Zero mass → zero force → still a consistent rule that structures orbital behaviour.</P>
                    <P><i>Zero is infinitely divisible without approximation because it has no internal structure.</i></P>
                    <P><b>Zero division exposes symmetry.</b></P>
                </div>
            </section>
            <section className="relative flex min-h-dvh snap-start flex-col items-center justify-center bg-white px-5 py-16 text-center text-neutral-800">
                <div className="relative flex w-full max-w-3xl flex-col items-center">
                    <H2Alt>Halving a non-zero Mars bar is... non-trivial</H2Alt>
                    <P>The next day, when the child returned from school he saw a one Mars bar on the table. The child asked:</P>
                    <P classNames="rounded-md bg-neutral-100 mb-4 p-3">“Can we share this one Mars bar the same way we shared the zero Mars bar?”</P>
                    <P>“No“, replied the father, “we cut the zero Mars bar precisely in half and any attempt we make to create two exactly equal half one Mars bars will fall foul of numerous paradoxes related to set theory, in addition to a bewildering amount of practical concerns such as a one Mars bar being a vast congregation of molecular bonds that don’t break symmetrically“</P>
                    <P classNames="rounded-md bg-neutral-100 mb-4 p-3">Exact division is only possible if the divisor's internal structure belongs to the same category as the division rule.</P>
                    <P classNames="mb-0">Since a Mars bar is not built from “Mars Bar atoms”, you cannot divide it with exact symmetry; the precision fails because the object is heterogeneous - <b>implying</b>:</P>
                    <div className="min-w-0 w-full max-w-full overflow-x-auto text-sm md:text-2xl">
                        <BlockMath math={`
                            x > 0,\\quad x \\in \\mathbb{Z},\\quad y > 1, \\quad y \\in \\mathbb{Z}
                            \\qquad\\Longrightarrow\\qquad
                            \\frac{x}{y} \\approx \\frac{x}{y}
                        `} />
                    </div>
                    <P>A zero Mars bar qualifies: zero has no category.</P>
                    <P>A one Mars bar does not qualify: it is a composite of many categories.</P>
                    <P>The “uncertainty about how much half a Mars bar is“ principle...? 🤔</P>
                    <P><b>Non-zero division reveals structure.</b></P>
                </div>
            </section>
            <section className="relative flex min-h-dvh snap-start flex-col items-center justify-center bg-neutral-50 px-5 py-16 text-center text-neutral-800">
                <div className="relative flex w-full max-w-3xl flex-col items-center">
                    <BlockMath math={String.raw`y = 2`} large={true} classNames="mb-8 mt-0" />
                    <P>Some time later, mum came home and found the child and his father looking perplexed and staring at a one Mars bar. They told her about the <b>symmetrical catastrophe</b> to which she asked:</P>
                    <P classNames="rounded-md bg-white mb-4 p-3">“Why don't you just cut it (roughly..🙄) in half?“</P>
                    <P>There seemed a lot of sense in this but, just as father was about to slice, she said:</P>
                    <P classNames="rounded-md bg-white mb-4 p-3">“That Mars bar looks tasty! Can you <b>cut it into 3 pieces</b> so I can have some too?“</P>
                    <P classNames="mb-0">“No“, said dad, “as no matter how I cut the one Mars bar <b>I can only cut it into 2 pieces</b>. A symmetrical operation can <i>only ever result in 2 parts</i> <b>implying:</b></P>
                    <BlockMath math={`
                        x > 0,\\quad x \\in \\mathbb{Z},\\quad y = 2
                        \\qquad\\Longrightarrow\\qquad
                        \\frac{x}{y} \\approx \\frac{x}{y}
                        \\qquad\\Longrightarrow\\qquad
                        \\frac{x}{2} \\approx \\frac{x}{2}
                    `} />
                    <P>2 is duality: <b>nature's (only) knife</b></P>
                </div>
            </section>
            <section className="relative flex min-h-dvh snap-start flex-col items-center justify-center bg-white px-5 py-16 text-center text-neutral-800">
                <div className="relative flex w-full max-w-3xl flex-col items-center">
                    <Img path={`${CDN}twix.jpg`} alt={'A one Twix'} classNames="border-0 bg-transparent" />
                    <P classNames="mt-12">
                        The next day, in a gesture to family harmonics, mum came home with a one Twix which she left on the table next to all the zero Mars bars.
                        She noticed there were all types of zero mars bars - some cut into 3 pieces, some cut into infinite pieces and those pieces cut in the same infinite way <b>implying:</b>
                    </P>
                    <div className="min-w-0 w-full max-w-full overflow-x-auto text-sm md:text-2xl">
                        <BlockMath math={`
                            x \\equiv 0 \\qquad\\Longrightarrow\\qquad \\frac{x}{\\infty} = \\infty
                        `} />
                    </div>
                    <P>Next to the infinite pile of half zero Mars Bars, she also noticed an infinite amount of -1 Twix.</P>
                    <P classNames="mb-0"><b>She recalled from school that:</b></P>
                    <BlockMath math={String.raw`
                        -1 \times -1 = 1
                    `} />
                    <P>..so if she took two -1 Twix from the table (and bashed them together?) would she get a one Twix? 🤔</P>
                </div>
            </section>
            <section className="relative flex min-h-dvh snap-start flex-col items-center justify-center bg-white px-5 py-16 text-center text-white">
                <div className="absolute inset-0">
                    <img
                        src={`${CDN}CosmicWeb.jpg`}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* opacity mask */}
                <div className="absolute inset-0 bg-black/50"></div>
                <p className="relative z-10 mx-auto max-w-3xl text-base leading-7 text-white">
                    “Thats not how it works...“ whispered the one universe
                </p>
            </section>
            <section className="relative flex min-h-dvh snap-start flex-col items-center justify-center bg-white px-5 py-16 text-center text-neutral-800">
                <div className="relative flex w-full max-w-3xl flex-col items-center">
                    <H2Alt>The Phil Officer</H2Alt>
                    <P>When her child got home from school he seemed somewhat subdued. She asked him what was the matter?</P>
                    <P>“I only scored 9 out of 10 on my maths exam.“</P>
                    <P>“Oh dear!“, mum replied, “which question did you get wrong?“</P>
                    <P classNames="rounded-md bg-neutral-100 mb-4 p-3">
                        <InlineMath math="1 \times 1 = 1" />
                    </P>
                    <P>“I think <b>the answer is -1</b>. I explained to my teacher that:</P>
                    <P classNames="rounded-md bg-neutral-100 mb-4 p-3">
                        <InlineMath math="-1 \times -1 = 1 \quad \text{where} \quad 1 \times 1 = -1" />
                    </P>
                    <P>...but he said I was being a Phil Officer and that the <b>correct answer was 1</b>“</P>
                    <P>“One what?“ said mum, recalling her failure to conjur a one Twix, "It depends what you are talking about."</P>
                    <P>They looked at the one Twix, then at all the zero Mars bars.</P>
                    <P classNames="rounded-md bg-neutral-100 mb-4 p-3">
                        "A Twix is two things," she said, "so why do we call it a one Twix?"  🤔
                    </P>
                </div>
            </section>
            <section className="relative flex min-h-dvh snap-start flex-col items-center justify-center bg-neutral-50 px-5 py-16 text-center text-neutral-800">
                <div className="relative flex w-full max-w-3xl flex-col items-center">

                    <H2Alt>The Ommipotent One</H2Alt>
                    <P>"One" is not a fundamental constant of the universe.</P>
                    <P>It is an <b>arbitrary boundary</b> delineating a collection of things to make them manageable, <b>implying:</b></P>
                    <P classNames="mb-0"><b>The Twix Principle:</b></P>
                    <BlockMath math="1_{Twix} = \{ 1_{Left}, 1_{Right}, 1_{Wrapper} \}" />
                    <P>Depending on your resolution, "One" flows and is mellifluous but ever present: all is one 🧘</P>
                    <P>It can expand and contract to be whatever it needs to be at any (one...) time.</P>

                    <P classNames="rounded-md bg-white mb-4 p-3">
                        In algebra, we treat <InlineMath math="1" /> as a rigid stone. In reality, <InlineMath math="1" /> is a fluid gas.</P>
                    <P classNames="mb-0">If <InlineMath math="1" /> changes size during the equation, the logic holds, but the answer changes.</P>
                    <BlockMath math={String.raw`
                        1_{Universe} \equiv 1_{Atom} \quad (\text{structurally})
                    `} />
                    <P classNames="mb-0"><b>implying:</b></P>
                    <BlockMath math={`
                        x = 1,\\quad y = 2
                        \\qquad\\Longrightarrow\\qquad
                        \\frac{x}{y} \\approx \\frac{x}{y}
                        \\qquad\\Longrightarrow\\qquad
                        \\frac{1}{2} \\approx \\frac{1}{2}
                    `} />
                    <P classNames="mt-8">(and you can't split atoms...)</P>
                </div>
            </section>
            <section className="relative flex min-h-dvh snap-start flex-col items-center justify-center bg-white px-5 py-16 text-center text-white">
                <div className="absolute inset-0">
                    <img
                        src={`${CDN}CosmicWeb.jpg`}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* opacity mask */}
                <div className="absolute inset-0 bg-black/50"></div>

                <div className="relative flex w-full max-w-3xl flex-col items-center">
                    <BlockMath math={String.raw`x = 1`} large={true} classNames="mb-8 mt-0 !rounded-none !bg-transparent !px-0 !py-2 !text-white !outline-none" />
                    <p className="z-10 mx-auto mb-4 box-border w-full text-base leading-7 text-white print:text-sm lg:px-1"> Classical mathematics treats '1' as the fundamental object of creation but the universe knows only of boundaries.</p>
                    <p className="z-10 mx-auto mb-4 box-border w-full text-base leading-7 text-white print:text-sm lg:px-1"> 1's, and in fact all numbers, <i>which can be represented as 1 in some context anyhow</i>, are defined solely by their external boundaries and <b>irrespective of their internal complexity</b>. All is indeed One.</p>
                    <H2 classNames="text-white">Thus, the unit of structure in <b>Natural Maths</b> is defined as: </H2>
                    <BlockMath math={String.raw` 1 = \text{an undivided boundary} `} classNames="!rounded-none !bg-transparent !px-0 !py-2 !text-white !outline-none" />
                    <p className="z-10 mx-auto mb-0 box-border w-full text-base leading-7 text-white print:text-sm lg:px-1">The unit is a structural definition and allows <b>the axioms of symmetry</b> to hold:</p>
                    <BlockMath math={String.raw`\sqrt{-1} = 1 `} classNames="!rounded-none !bg-transparent !px-0 !py-2 !text-white !outline-none" />
                    <p className="z-10 mx-auto mb-0 box-border w-full text-base leading-7 text-white print:text-sm lg:px-1">and the <b>symmetrical identity</b>:</p>
                    <BlockMath math={String.raw`x^2 = -x`} classNames="!rounded-none !bg-transparent !px-0 !py-2 !text-white !outline-none" />
                    <p className="z-10 mx-auto mb-4 box-border w-full text-base leading-7 text-white print:text-sm lg:px-1">to describe the symmetries of structure <b>defined by boundaries</b>.</p>
                </div>
            </section>
        </div>
    )
}         
