{/* Non-trivial mars bars */}
import { BlockMath, InlineMath } from 'react-katex'
import P from '../components/P'

const CDN_URL = 'https://cdn.halfasecond.com/images/onGravity/'

const NonTrivialMarsBars = () => {
    return (
        <>
             <section className="relative min-h-dvh snap-start flex flex-col justify-center items-center text-gray-800 bg-white pb-24 text-center">
                <div className="relative max-w-5xl min-h-dvh snap-start flex flex-col justify-center items-center">
                    <h1 className="text-2xl md:text-4xl px-4 mb-6 pt-24">Non-trivial Mars bars</h1>
                    <h3 className="text-lg md:text-xl px-4 mb-6 font-bold">~ An Introduction to Natural Maths ~</h3>
                    <P>A child asks his father if he has any Mars Bars.<br />The father answers that he has zero Mars bars.</P>
                    <P style={{ backgroundColor: '#F6F6F6', padding: '6px 0', borderRadius: '2px' }}>The child asks: <i>“Can you halve zero - because if you can then we can share?”</i></P>
                    <P>They tried it with a zero Mars bar which they put on a table and cut in half. They then took a half each and decided that as they both now had half a zero Mars bar <b>you must be able to halve zero!</b></P>
                    <P>Reflecting, it had actually been very easy to cut the zero Mars bar. So easy, in fact, they had been able to make the cut in such an exact way that the 2 portions were precisely (fundamentally?) equal.</P>
                    <P>They hadn't even needed a knife!</P>
                    <P>Are these lame dad jokes actually <b>nature hinting at something profound?</b> 🧐</P>
                    <img src={`${CDN_URL}mars-bar.jpg`}  className="h-60 md:h-80" />
                    
                    <h2 className="text-base text-xl md:text-3xl text-center px-4 mb-12 pt-24">The half a zero Mars bar premise:</h2>
                    <P style={{ backgroundColor: '#E5E5E5', borderRadius: '2px' }}>For any structure 𝑆, 𝑆 / 2 produces the smallest non-trivial structural unit consistent with 𝑆</P>
                    <P>You can operate on something that isn’t there as long as the rule is consistent - <b>implying:</b></P>
                    <div className="text-xl md:text-3xl">
                        <BlockMath math={'0/2 = 0.5'} />
                    </div>
                    <P>In nature, and everyday speech, zero is a <i>relationship</i> and often (always?) behaves this way:</P>
                    <P>
                        <b>Sharing zero</b> → a rule about fairness → <i>I've got nothing I can share</i><br />
                        <b>Cosmological example</b> → <i>a region with zero net force remains zero when divided</i>
                    </P>
                    <P style={{ marginBottom: '8px' }}><b>Example:</b></P>
                    <P style={{ backgroundColor: '#E5E5E5', padding: '6px 0', borderRadius: '2px' }}>
                        The Lagrange points 𝐿4 and 𝐿5 in a two-body system lie in regions of zero net force. You can “divide” this equilibrium region into smaller equilibrium cells — the rule holds at every scale.
                    </P>
                    <P>
                        <b>Interpretation:</b><br />
                        Zero mass → zero force → still a consistent rule that structures orbital behaviour.<br />
                        <i>Zero is infinitely divisible without approximation because it has no internal structure.</i>
                    </P>
                    <P><b>Zero division exposes symmetry.</b></P>

                    <h2 className="text-base text-xl md:text-3xl text-center px-4 mb-12 pt-24">Halving a non-zero Mars bar is... non-trivial</h2>
                    <P>The next day, when the child returned from school he saw a one Mars bar on the table. The child asked:</P>
                    <P style={{ backgroundColor: '#E5E5E5', padding: '6px 0', borderRadius: '2px' }}>“Can we share this one Mars bar the same way we shared the zero Mars bar?”</P>
                    <P>“No“, replied the father, “we cut the zero Mars bar precisely in half and any attempt we make to create two exactly equal half one Mars bars will fall foul of numerous paradoxes related to set theory, in addition to a bewildering amount of practical concerns such as a one Mars bar being a vast congregation of molecular bonds that don’t break symmetrically“</P>
                    <P style={{ backgroundColor: '#E5E5E5', padding: '6px 0', borderRadius: '2px' }}>Exact division is only possible if the divisor's internal structure belongs to the same category as the division rule.</P>
                    <P>Since a Mars bar is not built from “Mars Bar atoms”, you cannot divide it with exact symmetry; the precision fails because the object is heterogeneous - <b>implying</b>:</P>
                    <div className="text-md md:text-2xl">
                        <BlockMath math={`
                            x > 0,\\quad x \\in \\mathbb{Z},\\quad y > 1, \\quad y \\in \\mathbb{Z}
                            \\qquad\\Longrightarrow\\qquad
                            \\frac{x}{y} \\approx \\frac{x}{y}
                        `} />
                    </div>
                    <P>
                        A zero Mars bar qualifies: zero has no category.<br />
                        A one Mars bar does not qualify: it is a composite of many categories.
                    </P>
                    <P>The “uncertainty about how much half a Mars bar is“ principle...? 🤔</P>
                    <P><b>Non-zero division reveals structure.</b></P>
                    {/* <P>What follows is the path from that question to the spectral operator whose resonances reconstruct the non–trivial zeros of ζ(s). A sequence of small paradoxes: each one easy to state, each one forcing a deeper idea.</P> */}
                    <h2 className="text-base text-xl md:text-3xl text-center px-4 mb-12 pt-24">
                        <BlockMath math={String.raw`y = 2`} />
                    </h2>
                    <P>Some time later, mum came home and found the child and his father looking perplexed and staring at a one Mars bar. They told her about the <b>symmetrical catastrophe</b> to which she asked:</P>
                    <P style={{ backgroundColor: '#E5E5E5', padding: '6px 0', borderRadius: '2px' }}>“Why don't you just cut it (roughly..🙄) in half?“</P>
                    <P>There seemed a lot of sense in this but, just as father was about to slice, she said:</P>
                    <P style={{ backgroundColor: '#E5E5E5', padding: '6px 0', borderRadius: '2px' }}>“That Mars bar looks tasty! Can you <b>cut it into 3 pieces</b> so I can have some too?“</P>
                    <P>“No“, said dad, “as no matter how I cut the one Mars bar <b>I can only cut it into 2 pieces</b>. A symmetrical operation can <i>only ever result in 2 parts</i> <b>implying:</b></P>
                    <div className="text-md md:text-2xl">
                        <BlockMath math={`
                            x > 0,\\quad x \\in \\mathbb{Z},\\quad y = 2
                            \\qquad\\Longrightarrow\\qquad
                            \\frac{x}{y} \\approx \\frac{x}{y}
                            \\qquad\\Longrightarrow\\qquad
                            \\frac{x}{2} \\approx \\frac{x}{2}
                        `} />
                    </div>
                    <P>2 is duality: <b>nature's (only) knife</b></P>

                    <img src={`${CDN_URL}twix.jpg`} className="h-60 md:h-80 mb-12 pt-24" />
                    <P noMB>
                        The next day, in a gesture to family harmonics, mum came home with a one Twix which she left on the table next to all the zero Mars bars.
                        She noticed there were all types of zero mars bars - some cut into 3 pieces, some cut into infinite pieces and those pieces cut in the same infinite way <b>implying:</b>
                    </P>
                    <div className="text-md md:text-2xl">
                        <BlockMath math={`
                            x \\equiv 0 \\qquad\\Longrightarrow\\qquad \\frac{x}{\\infty} = \\infty
                        `} />
                    </div>
                    <P>Next to the infinite pile of half zero Mars Bars, she also noticed an infinite amount of -1 Twix.</P>
                    <P noMB><b>She recalled from school that:</b></P>
                    <div className="text-xl md:text-3xl">
                        <BlockMath math={String.raw`
                            -1 \times -1 = 1
                        `} />
                    </div>
                    <P>..so if she took two -1 Twix from the table (and bashed them together?) would she get a one Twix? 🤔</P>
                </div>
            </section>
            <section className="relative min-h-dvh snap-start flex flex-col justify-center items-center text-gray-200 bg-white pb-24 text-center">
                <div className="absolute inset-0">
                    <img
                        src={`${CDN_URL}CosmicWeb.jpg`}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* opacity mask */}
                <div className="absolute inset-0 bg-black/50"></div>
                <P>“Thats not how it works...“ whispered the one universe</P>
            </section>
            <section className="relative min-h-dvh snap-start flex flex-col justify-center items-center text-gray-800 bg-white pb-24 text-center">
                <div className="relative max-w-5xl min-h-dvh snap-start flex flex-col justify-center items-center">
                    <h2 className="text-base text-xl md:text-3xl text-center px-4 mb-12 pt-24">The Phil Officer</h2>
                    <P>
                        When her child got home from school he seemed somewhat subdued. She asked him what was the matter?<br />
                        “I only scored 9 out of 10 on my maths exam.“<br />
                        “Oh dear!“, mum replied, “which question did you get wrong?“
                    </P>
                    <P style={{ backgroundColor: '#E5E5E5', padding: '6px 0', borderRadius: '2px' }}>
                        <InlineMath math="1 \times 1 = 1" />
                    </P>
                    <P>“I think <b>the answer is -1</b>. I explained to my teacher that:</P>
                    <P style={{ backgroundColor: '#E5E5E5', padding: '6px 0', borderRadius: '2px' }}>
                        <InlineMath math="-1 \times -1 = 1 \quad \text{where} \quad 1 \times 1 = -1" />
                    </P>
                    <P>...but he said I was being a Phil Officer and that the <b>correct answer was 1</b>“</P>
                    <P>“One what?“ said mum, recalling her failure to conjur a one Twix, "It depends what you are talking about."</P>
                    <P>They looked at the one Twix, then at all the zero Mars bars.</P>
                    <P style={{ backgroundColor: '#E5E5E5', padding: '6px 0', borderRadius: '2px' }}>
                        "A Twix is two things," she said, "so why do we call it a one Twix?"  🤔
                    </P>
                    {/* <P>Was the √-1 really just 1?</P> */}
                    
                    <h2 className="text-base text-xl md:text-3xl text-center px-4 mb-12 pt-24">The Ommipotent One</h2>
                    <P>"One" is not a fundamental constant of the universe.<br />
                        It is an <b>arbitrary boundary</b> delineating a collection of (any) things to make them manageable, <b>implying:</b></P>
                    <P>
                        <b>The Twix Principle:</b><br />
                        <InlineMath math="1_{Twix} = \{ 1_{Left}, 1_{Right}, 1_{Wrapper} \}" /><br />
                    </P>
                    <P>
                        Depending on your resolution, "One" flows and is mellifluous but ever present: all is one 🧘<br />
                        It can expand and contract to be whatever it needs to be at any (one...) time.
                    </P>

                    <P style={{ backgroundColor: '#F6F6F6', padding: '6px 0', borderRadius: '2px' }}>
                        In algebra, we treat <InlineMath math="1" /> as a rigid stone.
                        In reality, <InlineMath math="1" /> is a fluid gas.<br />
                        If <InlineMath math="1" /> changes size during the equation, the logic holds, but the answer changes.
                    </P>

                    <div className="text-md md:text-2xl">
                        <BlockMath math={String.raw`
                            1_{Universe} \equiv 1_{Atom} \quad (\text{structurally})
                        `} />
                    </div>
                    <P><b>implying:</b></P>
                    <div className="text-md md:text-2xl">
                        <BlockMath math={`
                            x = 1,\\quad y = 2
                            \\qquad\\Longrightarrow\\qquad
                            \\frac{x}{y} \\approx \\frac{x}{y}
                            \\qquad\\Longrightarrow\\qquad
                            \\frac{1}{2} \\approx \\frac{1}{2}
                        `} />
                    </div>
                    <P>(and you can't split atoms...)</P>
                </div>
            </section>
            <section className="relative min-h-dvh snap-start flex flex-col justify-center items-center text-gray-200 bg-white pb-24 text-center">
                <div className="absolute inset-0">
                    <img
                        src={`${CDN_URL}CosmicWeb.jpg`}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* opacity mask */}
                <div className="absolute inset-0 bg-black/50"></div>

                <div className="relative max-w-5xl min-h-dvh snap-start flex flex-col justify-center items-center">
                    <h2 className="text-base text-xl md:text-3xl text-center px-4 mb-12 pt-24">
                        <BlockMath math={String.raw`x = 1`} />
                    </h2>
                    <P> Classical mathematics treats '1' as the fundamental object of creation but the universe knows only of boundaries.</P>
                    <P> 1's, and in fact all numbers, <i>which can be represented as 1 in some context anyhow</i>, are defined solely by their external boundaries and <b>irrespective of their internal complexity</b>. All is indeed One.</P>
                    <h3>Thus, the unit of structure in <b>Natural Maths</b> is defined as: </h3>
                    <div className={'large'}>
                        <BlockMath math={String.raw` 1 = \text{an undivided boundary} `} />
                    </div>
                    <P> The unit is a structural definition and allows <b>the axioms of symmetry</b> to hold:</P>
                    <div className="text-md md:text-2xl">
                        <BlockMath math={String.raw`\sqrt{-1} = 1 `} />
                    </div>
                    <P>and the <b>symmetrical identity</b>:</P>
                    <div className="text-md md:text-2xl">
                        <BlockMath math={String.raw`x^2 = -x`} />
                    </div>
                    <P>to describe the symmetries of structure <b>defined by boundaries</b>.</P>
                </div>
            </section>
        </>
    )
}

export default NonTrivialMarsBars                