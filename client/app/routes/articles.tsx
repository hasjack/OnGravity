import type { Route } from "./+types/articles";
import { Link } from "react-router";
import { articles } from "~/lib/articles";
import { pageMeta } from "~/lib/seo";

export function meta({ location }: Route.MetaArgs) {
    return pageMeta({
        title: "Articles | On Gravity",
        description: "An index of research objects, notes, analyses, simulations, and exploratory work from On Gravity.",
        pathname: location.pathname,
    });
}

export default function Articles() {
    return (
        <section className="min-h-dvh bg-white font-mono text-neutral-950">
            <div className="mx-auto grid min-h-dvh max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:px-10">
                <aside className="min-w-0 border-neutral-200 pr-0 lg:border-r lg:pr-10">
                    <img src="/logo.png" alt="" className="h-24 w-24" />
                    <h1 className="mt-10 text-5xl font-semibold leading-none tracking-normal">Articles</h1>
                    <p className="mt-5 max-w-sm text-lg leading-8 text-neutral-600">
                        A complete index of research objects, notes, simulations, and exploratory pieces.
                    </p>
                    <Link
                        to="/"
                        className="mt-8 inline-flex rounded-md border border-neutral-300 px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50"
                    >
                        Back to home
                    </Link>
                </aside>

                <div className="min-w-0">
                    <div className="border-b border-neutral-200 pb-8">
                        <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Index</p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-normal">All research objects</h2>
                    </div>

                    <div className="divide-y divide-neutral-200">
                        {articles.map((article) => {
                            const isExternal = article.to.startsWith("https://")

                            return (
                                <article key={article.to} className="grid gap-4 py-6 sm:grid-cols-[150px_1fr]">
                                    <img
                                        src={article.image}
                                        alt=""
                                        className="aspect-[16/10] w-full rounded-lg bg-neutral-100 object-cover sm:w-[150px]"
                                        loading="lazy"
                                    />
                                    <div className="min-w-0">
                                        <div className="text-xs uppercase tracking-wide text-neutral-500">
                                            {article.itemType} / {article.date}
                                        </div>
                                        <h3 className="mt-2 text-xl font-semibold leading-snug tracking-normal">
                                            <Link
                                                to={article.to}
                                                target={isExternal ? "_blank" : "_self"}
                                                className="hover:underline"
                                            >
                                                {article.label}
                                            </Link>
                                        </h3>
                                        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                                            {article.summary}
                                        </p>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
