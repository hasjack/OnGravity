import type { Route } from "./+types/about";
import { Link } from "react-router";
import { InlineMath } from "~/components/Katex";
import { H2, H3, P, Ol, Li } from '~/components/Typography'

const { VITE_APP_CDN_URL } = import.meta.env
const CDN = VITE_APP_CDN_URL || 'https://cdn.halfasecond.com/images/onGravity/'
const RH_LINK = "https://www.researchhub.com/proposal/29607/empirical-test-of-local-density-curvature-response-using-grace-fo-laser-ranging-data"

export function meta({ location }: Route.MetaArgs) {
    const title = "κ-Framework | Natural Mathematics & Environmental Curvature";
    const description = "A unified empirical framework for dynamical systems and weak-field gravity. From iterative quadratic atlases to SPARC galaxy rotation curves, exploring how curvature responds to the local environment.";
    const url = `https://halfasecond.com${location.pathname}`;

    return [
        { title },
        { name: "description", content: description },
        
        // OpenGraph / Facebook
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: "https://cdn.halfasecond.com/images/onGravity/k-framework.jpg" },

        // Twitter
        { name: "twitter:card", content: "https://cdn.halfasecond.com/images/onGravity/k-framework.jpg" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "keywords", content: "kappa framework, natural mathematics, dynamical systems, galaxy rotation curves, SPARC dataset, N-body simulation, numerical diagnostics, Jack Pickett" }
    ];
}

export async function loader({ context }: Route.LoaderArgs) {
    // const db = database();
    // const result = await db.execute<{ now: Date }>("select now()");
    // return { csrfToken: context.csrfToken, serverTime: result[0].now };
}

export default function About({ loaderData }: Route.ComponentProps) {
    // const { t } = useTranslation();

    return (
        <>
            <section className="relative flex flex-col items-center text-gray-800 bg-white py-24 print:py-0">
                <div className="relative max-w-5xl flex flex-col items-center px-4">
                    {/* <div className="absolute inset-0">
                        <img
                            src={`${CDN}barcode.png`}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-black/80"></div> */}
                    <img src={`${CDN}logo.png`} className="h-48 md:h-64 mb-12 md:mb-24" />
                    <H2>About the <InlineMath math={String.raw`\kappa`} />-Framework</H2>
                    <P>
                        The <InlineMath math={String.raw`\kappa`} />-framework is an exploratory initiative in Natural Mathematics: an approach to dynamical systems
                        and physics that prioritizes state-space mechanics and environmental response over static universal constants. What began as a study into
                        the orientation-switching mechanics of quadratic maps has evolved into a unified empirical framework for understanding gravitational anomalies,
                        from planetary perihelion drift to galaxy rotation curves.
                    </P>
                    <H3>The Core Philosophy: Environmental Response</H3>
                    <P>
                        Traditional physics often relies on "dark" unobserved entities to balance the books when observations
                        deviate from theory. The <InlineMath math={String.raw`\kappa`} />-framework proposes an alternative: Spacetime curvature responds not just to mass, but to the dynamical environment.
                    </P>
                    <P classNames="mb-8">
                        By introducing a curvature-response parameter, <InlineMath math={String.raw`\kappa`} />, we can model complex systems — whether chaotic mathematical attractors or spiral galaxies—using
                        local, deterministic rules within a fully baryonic framework.
                    </P>
                    <H2>Key Research Streams</H2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-12">
                        {/* Stream 1: Switching Atlas */}
                        <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm transition-hover hover:border-blue-400">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight text-sm">Iterative Dynamics</h4>
                                <span className="text-[10px] font-mono px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">v1.0.4</span>
                            </div>
                            <h5 className="text-lg font-semibold mb-2">Switching Quadratic Atlas</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Mapping the event-time skeleton of orientation flips in quadratic maps to identify recurrent morphological features like the Left-Hand Wedge.
                            </p>
                            <div className="text-xs font-mono text-gray-500">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Diagnostic:</span> <Link to="/notes/switching-quadratic-atlas-diagnostics">First-flip iteration & occupancy parity</Link>
                            </div>
                        </div>

                        {/* Stream 2: Bell Toy */}
                        <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm transition-hover hover:border-blue-400">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight text-sm">Quantum Foundations</h4>
                                <span className="text-[10px] font-mono px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">v0.8.2</span>
                            </div>
                            <h5 className="text-lg font-semibold mb-2">Progress-State Bell Toy</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                A local Bell-type model demonstrating that sector-progress <InlineMath math={String.raw`(\sigma, p)`} /> dynamics are sufficient to generate structured CHSH correlations.
                            </p>
                            <div className="text-xs font-mono text-gray-500">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Diagnostic:</span> <Link to="/notes/natural-mathematics-bell-toy">Flip-on-overflow correlation mapping</Link>
                            </div>
                        </div>

                        {/* Stream 3: SPARC Analysis */}
                        <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm transition-hover hover:border-blue-400">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight text-sm">Astrophysics</h4>
                                <span className="text-[10px] font-mono px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Empirical</span>
                            </div>
                            <h5 className="text-lg font-semibold mb-2">SPARC Galaxy Analysis</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Evaluating the <InlineMath math={String.raw`\kappa`} />-framework against 165+ rotation curves to reproduce velocity profiles without non-baryonic dark matter.
                            </p>
                            <div className="text-xs font-mono text-gray-500">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Diagnostic:</span> <Link to="/analysis/sparc-galaxy-rotation-curves">Local density/strain-rate curvature response</Link>
                            </div>
                        </div>

                        {/* Stream 4: Solar System */}
                        <div className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm transition-hover hover:border-blue-400">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight text-sm">Precision Simulation</h4>
                                <span className="text-[10px] font-mono px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">IAS15</span>
                            </div>
                            <h5 className="text-lg font-semibold mb-2">Solar System Dynamics</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Long-term N-body stability testing and secular perihelion drift analysis using the REBOUND integrator.
                            </p>
                            <div className="text-xs font-mono text-gray-500">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Diagnostic:</span> <Link to="/analysis/solar-system">Secular drift & orbital stability coefficients</Link>
                            </div>
                        </div>
                    </div>

                    <H2>The Architecture</H2>
                    <P>
                        This site serves as a live laboratory for these ideas. We believe that logic is universal—the same principles that govern a high-stakes transaction flow in a
                        production system govern the stability of an orbit in a solar system.
                    </P>
                    <P>
                        Every model presented here is built on three pillars:
                    </P>
                    <Ol classNames="mb-4">
                        <Li>Correctness: Grounded in high-precision numerical simulation.</Li>
                        <Li>Clarity: Visualized through interactive diagnostics that expose internal state.</Li>
                        <Li>Reproducibility: Supported by peer-reviewed research and open-source implementation.</Li>
                    </Ol>

                    <H2>About the author</H2>
                    <P classNames="mb-8">
                        Jack Pickett is a Senior Systems Engineer and Independent Researcher based in Cornwall, UK. With over a decade of experience building high-resilience production systems — from
                        the scale of global Web3 marketplaces at Dapper Labs to interactive educational platforms — he brings a software architect's discipline to theoretical physics. His work focuses
                        on the intersection of dynamical systems, numerical simulation, and empirical data analysis.
                    </P>

                    <H2>Code and Reproducibility</H2>
                    <P>
                        The analysis pipeline used is implemented in Python. All code used to generate the figures and statistical results presented in this work is available as open-source software:
                    </P>
                    <P classNames="text-center mb-4">
                        <Link
                            to="https://github.com/hasjack/OnGravity"
                            target="_blank"
                            className="block w-full break-all underline text-sm lg:text-md"
                        >github.com/hasjack/OnGravity
                        </Link>
                    </P>
                    <P classNames="mb-24">This repository includes the full analysis pipeline, data ingestion routines, model fitting procedures, and scripts used to generate the figures presented within the project.</P>

                    <img src={`${CDN}rh-logo2.png`} className="h-12 md:h-18 mb-6 md:mb-8" />
                    <p className="max-w-3xl text-sm md:text-base text-center px-4 mb-24">
                        Please consider <Link to={RH_LINK} target="_blank" className="underline">funding this research</Link> on Research Hub
                    </p>

                    <img src={`${CDN}cc-long.webp`} className="h-12 md:h-18 mb-6 md:mb-8" />
                    <p className="max-w-3xl text-sm md:text-base text-center px-4 mb-32">Content on this site is licensed under a Creative Commons Attribution 4.0 International License</p>
                </div>
            </section>
        </>
    )
}
