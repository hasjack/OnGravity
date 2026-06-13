import type { Route } from "./+types/home";
import { Link } from "react-router";
import License from "~/components/License";
import { InlineMath } from "../components/Katex";

const { VITE_APP_CDN_URL } = import.meta.env
const CDN = VITE_APP_CDN_URL || 'https://cdn.halfasecond.com/images/onGravity/'

const items = [
    {
        itemType: "Note",
        label: "Methods and Evaluation Protocol for the Progress-State Regime Gate",
        to: "/notes/evaluation-protocol-for-progress-state-regime",
        date: "21st April 2026",
        image: `${CDN}bell-toy-candles-16-10.jpg`,
    },
    {
        itemType: "Note",
        label: "Switching Quadratic Atlas Diagnostics",
        to: "/notes/switching-quadratic-atlas-diagnostics",
        date: "15th April 2026",
        image: `${CDN}quadratic-atlas-16-10.jpg`,
    },
    {
        itemType: "Note",
        label: "Progress-State Bell Toy in Natural Mathematics",
        to: "/notes/natural-mathematics-bell-toy",
        date: "12th April 2026",
        image: `${CDN}bell-toy-16-10.jpg`,
    },
    {
        itemType: "Theory (pre-print)",
        label: "A Curvature Response Model for Weak-Field Gravity",
        to: "/preprint/a-curvature-response-model-for-weak-field-gravity",
        date: "28th March 2026",
        image: `${CDN}k-framework.jpg`,
    },
    {
        itemType: "Analysis (pre-print)",
        label:
            "Empirical Tests of the κ-Framework using SPARC Dataset",
        to: "/analysis/sparc-galaxy-rotation-curves",
        date: "9th March 2026",
        image: `${CDN}galaxy-rotation-curves/output/plots/kappa_vs_gbar_fit.png`,
    },
    {
        itemType: "Simulation",
        label: "Toy Galaxy - k-Framework comparison with Newtonian physics",
        to: "/toy-galaxy",
        date: "12th November 2025",
        image: `${CDN}toy-galaxy-16-10.jpg`,
    },
]

const pillars = [
    ["Framework", "A falsifiable curvature-response model for weak-field gravity."],
    ["Evidence", "Rotation curves, Solar System constraints, and numerical checks."],
    ["Open Work", "Notes, diagnostics, code, and unresolved questions in public."],
]

const openQuestions = [
    "Can the response term be derived geometrically?",
    "Where does the model fail against precision data?",
    "Which observations would falsify the mechanism?",
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

// export async function loader({ context }: Route.LoaderArgs) {
//     // const db = database();
//     // const result = await db.execute<{ now: Date }>("select now()");
//     // return { csrfToken: context.csrfToken, serverTime: result[0].now };
// }

export default function Home() {
    return (
        <section className="min-h-dvh bg-white font-mono text-neutral-950">
            <div className="mx-auto grid min-h-dvh max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-10">
                <aside className="min-w-0 border-neutral-200 pr-0 lg:border-r lg:pr-10">
                    <img src="/logo.png" alt="" className="h-24 w-24" />
                    <h1 className="mt-10 text-5xl font-semibold leading-none tracking-normal">On Gravity</h1>
                    <p className="mt-5 max-w-sm text-lg leading-8 text-neutral-600">
                        A public notebook for the <InlineMath math={String.raw`\kappa`} />-framework and the evidence around it.
                    </p>
                    <p className="mt-5 max-w-sm text-base leading-7 text-neutral-600">
                        Exploring whether gravitational phenomena attributed to dark matter could arise from an environmental response of spacetime itself.
                    </p>
                    <div className="mt-10 flex flex-col gap-3 text-sm font-semibold">
                        <Link
                            to="/preprint/a-curvature-response-model-for-weak-field-gravity"
                            className="rounded-md bg-neutral-950 px-4 py-3 text-white transition hover:bg-neutral-800"
                        >
                            Start with the pre-print
                        </Link>
                        <Link
                            to="/analysis/sparc-galaxy-rotation-curves"
                            className="rounded-md border border-neutral-300 px-4 py-3 transition hover:bg-neutral-50"
                        >
                            Review the SPARC analysis
                        </Link>
                        <Link
                            to="https://github.com/hasjack/OnGravity"
                            target="_blank"
                            className="rounded-md border border-neutral-300 px-4 py-3 transition hover:bg-neutral-50"
                        >
                            Open research repository
                        </Link>
                    </div>
                    <div className="flex flex-col items-center pt-8">
                        <License colorScheme="dark" />
                    </div>
                </aside>

                <div className="min-w-0">
                    <div className="grid gap-4 border-b border-neutral-200 pb-8 md:grid-cols-3">
                        {pillars.map(([title, body]) => (
                            <div key={title} className="rounded-lg border border-neutral-200 p-5">
                                <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
                                <p className="mt-3 text-sm leading-6 text-neutral-600">{body}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-8 py-10">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-normal">Latest research objects</h2>
                            <div className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
                                {items.map((item) => {
                                    const isExternal = item.to.startsWith("https://")
                                    return (
                                        <article key={item.to} className="grid gap-4 py-5 sm:grid-cols-[120px_1fr]">
                                            <img
                                                src={item.image}
                                                alt=""
                                                className="aspect-[16/10] w-full rounded-lg bg-neutral-100 object-cover sm:w-[120px]"
                                                loading="lazy"
                                            />
                                            <div>
                                                <div className="text-xs uppercase tracking-wide text-neutral-500">
                                                    {item.itemType} / {item.date}
                                                </div>
                                                <h3 className="mt-2 text-xl font-semibold leading-snug tracking-normal">
                                                    <Link
                                                        to={item.to}
                                                        target={isExternal ? "_blank" : "_self"}
                                                        className="hover:underline"
                                                    >
                                                        {item.label}
                                                    </Link>
                                                </h3>
                                            </div>
                                        </article>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <section className="bg-neutral-950 p-6 text-white">
                        <h2 className="text-2xl font-semibold tracking-normal">Open questions</h2>
                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            {openQuestions.map((question) => (
                                <p key={question} className="text-sm leading-6 text-neutral-300">
                                    {question}
                                </p>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </section>
    )
}
