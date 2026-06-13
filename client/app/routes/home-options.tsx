import { Link } from "react-router";
import { InlineMath } from "~/components/Katex";
import type { Route } from "./+types/home-options";
import { pageMeta } from "~/lib/seo";

export function meta({ location }: Route.MetaArgs) {
    return pageMeta({
        title: "Home Options | On Gravity",
        description: "Internal homepage design explorations for On Gravity.",
        pathname: location.pathname,
        noIndex: true,
    });
}

const articles = [
    {
        type: "Note",
        title: "Methods and Evaluation Protocol for the Progress-State Regime Gate",
        to: "/notes/evaluation-protocol-for-progress-state-regime",
        date: "21 Apr 2026",
        image: "/chaotic-toy-galaxy.jpg",
    },
    {
        type: "Note",
        title: "Switching Quadratic Atlas Diagnostics",
        to: "/notes/switching-quadratic-atlas-diagnostics",
        date: "15 Apr 2026",
        image: "/density-gradient.svg",
    },
    {
        type: "Pre-print",
        title: "A Curvature Response Model for Weak-Field Gravity",
        to: "/preprint/a-curvature-response-model-for-weak-field-gravity",
        date: "28 Mar 2026",
        image: "/unified-model.png",
    },
];

const pillars = [
    ["Framework", "A falsifiable curvature-response model for weak-field gravity."],
    ["Evidence", "Rotation curves, Solar System constraints, and numerical checks."],
    ["Open Work", "Notes, diagnostics, code, and unresolved questions in public."],
];

const stats = [
    ["165+", "SPARC galaxies"],
    ["3", "active test regimes"],
    ["2026", "latest notes"],
];

function ArticleCard({ article }: { article: (typeof articles)[number] }) {
    return (
        <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-[16/10] bg-slate-100">
                <img
                    src={article.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                />
            </div>
            <div className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-slate-500">
                    <span>{article.type}</span>
                    <span>{article.date}</span>
                </div>
                <h3 className="text-base font-semibold leading-snug text-slate-950">
                    <Link to={article.to} className="hover:underline">
                        {article.title}
                    </Link>
                </h3>
            </div>
        </article>
    );
}

function OptionNav() {
    return (
        <nav className="sticky top-0 z-40 overflow-x-hidden border-b border-white/15 bg-slate-950/90 px-3 py-3 font-sans text-xs text-white backdrop-blur sm:px-4 sm:text-sm">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link to="/" className="font-semibold tracking-wide">
                    On Gravity home options
                </Link>
                <div className="flex min-w-0 flex-wrap gap-2">
                    <a href="#editorial" className="rounded-md border border-white/20 px-2.5 py-1 hover:bg-white/10 sm:px-3">
                        Editorial
                    </a>
                    <a href="#observatory" className="rounded-md border border-white/20 px-2.5 py-1 hover:bg-white/10 sm:px-3">
                        Observatory
                    </a>
                    <a href="#index" className="rounded-md border border-white/20 px-2.5 py-1 hover:bg-white/10 sm:px-3">
                        Index
                    </a>
                </div>
            </div>
        </nav>
    );
}

function EditorialOption() {
    return (
        <section id="editorial" className="min-h-dvh bg-[#f7f8f5] font-sans text-slate-950">
            <div className="grid min-h-dvh lg:grid-cols-[minmax(0,0.96fr)_minmax(420px,1.04fr)]">
                <div className="min-w-0 flex flex-col justify-between px-6 py-16 sm:px-10 lg:px-16">
                    <div className="flex items-center gap-4">
                        <img src="/logo_transparent.png" alt="" className="h-16 w-16 rounded-lg bg-slate-950 p-2" />
                        <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-emerald-700">Open research project</p>
                            <p className="text-lg font-semibold">On Gravity</p>
                        </div>
                    </div>

                    <div className="max-w-2xl py-16">
                        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.26em] text-slate-500">
                            The <InlineMath math={String.raw`\kappa`} />-framework
                        </p>
                        <h1 className="text-5xl font-semibold leading-[0.98] tracking-normal sm:text-6xl lg:text-7xl">
                            Environmental curvature, tested in public.
                        </h1>
                        <p className="mt-8 max-w-xl text-lg leading-8 text-slate-700">
                            A research front door for the hypothesis that galaxy-scale gravitational anomalies
                            can emerge from the response of spacetime to structured baryonic environments.
                        </p>
                        <div className="mt-10 flex flex-wrap gap-3">
                            <Link
                                to="/preprint/a-curvature-response-model-for-weak-field-gravity"
                                className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                            >
                                Read the framework
                            </Link>
                            <Link
                                to="/analysis/sparc-galaxy-rotation-curves"
                                className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-white"
                            >
                                View empirical tests
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4 border-t border-slate-300 pt-6 sm:grid-cols-3">
                        {pillars.map(([title, body]) => (
                            <div key={title}>
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-950">{title}</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative min-w-0 overflow-hidden bg-slate-950 min-h-[68vh]">
                    <img src="/CosmicWeb.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.85),rgba(15,23,42,0.12))]" />
                    <div className="absolute bottom-0 left-0 right-0 grid gap-4 border-t border-white/20 bg-slate-950/75 p-6 text-white backdrop-blur sm:grid-cols-3">
                        {stats.map(([value, label]) => (
                            <div key={label}>
                                <div className="text-3xl font-semibold">{value}</div>
                                <div className="mt-1 text-xs uppercase tracking-wide text-cyan-100">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function ObservatoryOption() {
    return (
        <section id="observatory" className="min-h-dvh bg-[#101214] font-sans text-white">
            <div className="mx-auto grid min-h-dvh max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:px-10">
                <div className="min-w-0 flex flex-col justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.32em] text-amber-300">Research observatory</p>
                        <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-6xl">
                            Track the model by its claims, tests, and failures.
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300">
                            This direction treats the homepage as a live research console: less mystique,
                            more orientation, with immediate routes into the evidence.
                        </p>
                    </div>

                    <div className="mt-10 grid grid-cols-3 gap-3">
                        {stats.map(([value, label]) => (
                            <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                                <div className="text-2xl font-semibold text-amber-200">{value}</div>
                                <div className="mt-2 text-xs uppercase tracking-wide text-zinc-400">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid min-w-0 gap-5 lg:grid-rows-[1fr_auto]">
                    <div className="relative min-h-[380px] overflow-hidden rounded-lg border border-white/10 bg-black">
                        <img src="/The_Bullet_Cluster.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_30%,rgba(251,191,36,0.28),transparent_34%),linear-gradient(180deg,transparent,rgba(0,0,0,0.82))]" />
                        <div className="absolute bottom-0 left-0 max-w-2xl p-6 sm:p-8">
                            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">Current centre of gravity</p>
                            <h2 className="mt-3 text-2xl font-semibold sm:text-4xl">Weak-field gravity across environments</h2>
                            <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-200">
                                From galactic rotation curves to Solar System perturbations, the homepage can lead with
                                the experimental surface rather than the project logo.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                        {articles.map((article) => (
                            <article key={article.to} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                                <div className="text-xs uppercase tracking-wide text-zinc-500">{article.type}</div>
                                <h3 className="mt-3 text-base font-semibold leading-snug">
                                    <Link to={article.to} className="hover:text-amber-200">
                                        {article.title}
                                    </Link>
                                </h3>
                                <div className="mt-5 text-xs text-zinc-500">{article.date}</div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function IndexOption() {
    return (
        <section id="index" className="min-h-dvh bg-white font-sans text-neutral-950">
            <div className="mx-auto grid min-h-dvh max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-10">
                <aside className="min-w-0 border-r border-neutral-200 pr-0 lg:pr-10">
                    <img src="/logo.png" alt="" className="h-24 w-24" />
                    <h1 className="mt-10 text-5xl font-semibold leading-none">On Gravity</h1>
                    <p className="mt-5 max-w-sm text-lg leading-8 text-neutral-600">
                        A public notebook for the <InlineMath math={String.raw`\kappa`} />-framework and the evidence around it.
                    </p>
                    <div className="mt-10 flex flex-col gap-3 text-sm font-semibold">
                        <Link to="/preprint/a-curvature-response-model-for-weak-field-gravity" className="rounded-md bg-neutral-950 px-4 py-3 text-white">
                            Start with the pre-print
                        </Link>
                        <Link to="/about" className="rounded-md border border-neutral-300 px-4 py-3">
                            Project context
                        </Link>
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

                    <div className="grid gap-8 py-10 lg:grid-cols-[1fr_0.78fr]">
                        <div>
                            <h2 className="text-2xl font-semibold">Latest research objects</h2>
                            <div className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
                                {articles.map((article) => (
                                    <article key={article.to} className="grid gap-4 py-5 sm:grid-cols-[120px_1fr]">
                                        <img
                                            src={article.image}
                                            alt=""
                                            className="aspect-[16/10] w-full rounded-lg object-cover sm:w-[120px]"
                                            loading="lazy"
                                        />
                                        <div>
                                            <div className="text-xs uppercase tracking-wide text-neutral-500">
                                                {article.type} / {article.date}
                                            </div>
                                            <h3 className="mt-2 text-xl font-semibold leading-snug">
                                                <Link to={article.to} className="hover:underline">
                                                    {article.title}
                                                </Link>
                                            </h3>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-neutral-200">
                            <img src="/k-CurvatureField.png" alt="" className="aspect-[4/3] w-full object-cover" />
                            <div className="p-5">
                                <h2 className="text-lg font-semibold">Visual identity cue</h2>
                                <p className="mt-3 text-sm leading-6 text-neutral-600">
                                    This direction trades the cinematic splash for a sober publication index,
                                    using figures as evidence rather than atmosphere.
                                </p>
                            </div>
                        </div>
                    </div>

                    <section className="bg-neutral-950 p-6 text-white">
                        <h2 className="text-2xl font-semibold">Open questions</h2>
                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            {["Can the response term be derived geometrically?", "Where does the model fail against precision data?", "Which observations would falsify the mechanism?"].map((question) => (
                                <p key={question} className="text-sm leading-6 text-neutral-300">
                                    {question}
                                </p>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
}

export default function HomeOptions() {
    return (
        <main className="box-border max-w-full overflow-x-hidden [&_*]:box-border">
            <OptionNav />
            <EditorialOption />
            <ObservatoryOption />
            <IndexOption />
        </main>
    );
}
