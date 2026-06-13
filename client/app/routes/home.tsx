import type { Route } from "./+types/home";
import { Link } from "react-router";
import License from "~/components/License";
import { InlineMath } from "../components/Katex";
import { latestArticles } from "~/lib/articles";
import { pageMeta } from "~/lib/seo";

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

    return pageMeta({ title, description, pathname: location.pathname });
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
                <aside className="flex min-w-0 flex-col border-neutral-200 pr-0 lg:min-h-[calc(100dvh-8rem)] lg:border-r lg:pr-10">
                    <div>
                        <img src="/logo.png" alt="" className="h-24 w-24" />
                        <h1 className="mt-10 text-5xl font-semibold leading-none tracking-normal">On Gravity</h1>
                        <p className="mt-5 max-w-sm text-base leading-7 text-neutral-600">
                            A public notebook for the <InlineMath math={String.raw`\kappa`} />-framework & supporting evidence.
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
                    </div>
                    <div className="mt-12 flex flex-col items-center lg:mt-auto lg:pt-10">
                        <License colorScheme="dark" flushBottom />
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
                            <div className="flex items-end justify-between gap-4">
                                <h2 className="text-2xl font-semibold tracking-normal">Latest research objects</h2>
                                <Link
                                    to="/articles"
                                    className="shrink-0 text-sm font-semibold text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950"
                                >
                                    See more
                                </Link>
                            </div>
                            <div className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
                                {latestArticles.map((item) => {
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
