import type { Route } from "./+types/about";
import { Link } from "react-router";
import { InlineMath } from "~/components/Katex";

const researchStreams = [
    {
        area: "Iterative Dynamics",
        label: "Switching Quadratic Atlas",
        status: "v1.0.4",
        body: "Mapping the event-time skeleton of orientation flips in quadratic maps to identify recurrent morphological features like the Left-Hand Wedge.",
        to: "/notes/switching-quadratic-atlas-diagnostics",
        diagnostic: "First-flip iteration and occupancy parity",
    },
    {
        area: "Quantum Foundations",
        label: "Progress-State Bell Toy",
        status: "v0.8.2",
        body: "A local Bell-type model demonstrating that sector-progress dynamics are sufficient to generate structured CHSH correlations.",
        to: "/notes/natural-mathematics-bell-toy",
        diagnostic: "Flip-on-overflow correlation mapping",
    },
    {
        area: "Astrophysics",
        label: "SPARC Galaxy Analysis",
        status: "Empirical",
        body: "Evaluating the framework against 165+ rotation curves to reproduce velocity profiles without non-baryonic dark matter.",
        to: "/analysis/sparc-galaxy-rotation-curves",
        diagnostic: "Local density/strain-rate curvature response",
    },
    {
        area: "Precision Simulation",
        label: "Solar System Dynamics",
        status: "IAS15",
        body: "Long-term N-body stability testing and secular perihelion drift analysis using the REBOUND integrator.",
        to: "/analysis/solar-system",
        diagnostic: "Secular drift and orbital stability coefficients",
    },
]

const principles = [
    "Correctness: grounded in high-precision numerical simulation.",
    "Clarity: visualized through diagnostics that expose internal state.",
    "Reproducibility: supported by public review and open-source implementation.",
]

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
        <section className="min-h-dvh bg-white font-mono text-neutral-950">
            <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-10 lg:py-16 print:py-0">
                <aside className="min-w-0 self-start border-neutral-200 pr-0 lg:border-r lg:pr-10">
                    <img src="/logo.png" alt="" className="h-24 w-24" />
                    <div className="mt-10 text-sm font-semibold uppercase tracking-wide text-neutral-500">
                        Project note
                    </div>
                    <h1 className="mt-3 text-5xl font-semibold leading-none tracking-normal">
                        About
                    </h1>
                    <p className="mt-5 max-w-sm text-lg leading-8 text-neutral-600">
                        A public research notebook for the <InlineMath math={String.raw`\kappa`} />-framework, natural mathematics, and weak-field gravity.
                    </p>
                    <div className="mt-10 grid gap-3 text-sm font-semibold leading-6 text-neutral-600">
                        <Link
                            to="https://github.com/hasjack/OnGravity"
                            target="_blank"
                            className="break-all underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950"
                        >
                            github.com/hasjack/OnGravity
                        </Link>
                        <Link
                            to="https://www.researchhub.com/paper/10769512/on-gravity/reviews"
                            target="_blank"
                            className="underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950"
                        >
                            ResearchHub review
                        </Link>
                    </div>
                </aside>

                <div className="min-w-0">
                    <header className="border-b border-neutral-200 pb-7">
                        <h2 className="max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-neutral-950 lg:text-5xl">
                            About the <InlineMath math={String.raw`\kappa`} />-Framework
                        </h2>
                        <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-600">
                            The <InlineMath math={String.raw`\kappa`} />-framework is an exploratory initiative in Natural Mathematics: an approach to dynamical systems and physics that prioritizes state-space mechanics and environmental response over static universal constants.
                        </p>
                    </header>

                    <div className="mt-8 grid gap-10">
                        <section className="max-w-3xl">
                            <h3 className="text-2xl font-semibold leading-snug tracking-normal text-neutral-950">
                                About the Author
                            </h3>
                            <p className="mt-4 text-base leading-7 text-neutral-700">
                                Jack Pickett is a Senior Systems Engineer and Independent Researcher based in Cornwall, UK. With over a decade of experience building high-resilience production systems, he brings a software architect's discipline to theoretical physics. His work focuses on the intersection of dynamical systems, numerical simulation, and empirical data analysis.
                            </p>
                        </section>

                        <section className="max-w-3xl">
                            <h3 className="text-2xl font-semibold leading-snug tracking-normal text-neutral-950">
                                Environmental Response
                            </h3>
                            <div className="mt-4 grid gap-4 text-base leading-7 text-neutral-700">
                                <p>
                                    What began as a study into the orientation-switching mechanics of quadratic maps has evolved into a unified empirical framework for understanding gravitational anomalies, from planetary perihelion drift to galaxy rotation curves.
                                </p>
                                <p>
                                    Traditional physics often relies on "dark" unobserved entities to balance the books when observations deviate from theory. The <InlineMath math={String.raw`\kappa`} />-framework proposes an alternative: spacetime curvature responds not just to mass, but to the dynamical environment.
                                </p>
                                <p>
                                    By introducing a curvature-response parameter, <InlineMath math={String.raw`\kappa`} />, we can model complex systems, whether chaotic mathematical attractors or spiral galaxies, using local deterministic rules within a fully baryonic framework.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-2xl font-semibold leading-snug tracking-normal text-neutral-950">
                                Key Research Streams
                            </h3>
                            <div className="mt-5 divide-y divide-neutral-200 border-y border-neutral-200">
                                {researchStreams.map((stream) => (
                                    <article key={stream.to} className="grid gap-4 py-5 lg:grid-cols-[190px_minmax(0,1fr)]">
                                        <div>
                                            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                                {stream.area}
                                            </div>
                                            <div className="mt-2 inline-flex rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-500">
                                                {stream.status}
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-xl font-semibold leading-snug tracking-normal text-neutral-950">
                                                {stream.label}
                                            </h4>
                                            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
                                                {stream.body}
                                            </p>
                                            <Link
                                                to={stream.to}
                                                className="mt-3 block text-xs leading-5 text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950"
                                            >
                                                Diagnostic: {stream.diagnostic}
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section className="max-w-3xl">
                            <h3 className="text-2xl font-semibold leading-snug tracking-normal text-neutral-950">
                                The Architecture
                            </h3>
                            <p className="mt-4 text-base leading-7 text-neutral-700">
                                This site serves as a live laboratory for these ideas. The same principles that govern a high-stakes transaction flow in a production system govern the stability of an orbit in a solar system.
                            </p>
                            <ol className="mt-5 grid gap-3 text-sm leading-6 text-neutral-700">
                                {principles.map((principle) => (
                                    <li key={principle} className="border-l border-neutral-300 pl-4">
                                        {principle}
                                    </li>
                                ))}
                            </ol>
                        </section>

                        <section className="border-t border-neutral-200 pt-8">
                            <h3 className="text-2xl font-semibold leading-snug tracking-normal text-neutral-950">
                                Code and Reproducibility
                            </h3>
                            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-700">
                                The analysis pipeline is implemented in Python. The repository includes data ingestion routines, model fitting procedures, and scripts used to generate the figures and statistical results presented throughout the project.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </section>
    )
}
