// import { useTranslation } from "react-i18next";

// import { database } from "~/database/context";
// import i18n from "~/i18n";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import { InlineMath } from "../components/Katex";
// import pkg from 'react-katex';
// const {InlineMath} = pkg;
// import { formatDateTime } from "~/lib/datetime";

const { VITE_APP_CDN_URL } = import.meta.env
const CDN = VITE_APP_CDN_URL || 'https://cdn.halfasecond.com/images/onGravity/'
const RH_LINK = "https://www.researchhub.com/proposal/29607/empirical-test-of-local-density-curvature-response-using-grace-fo-laser-ranging-data"

const items = [
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
      "Environmental Curvature Response in Planetary Dynamics: Solar System Diagnostics of the κ-Framework",
    to: "/analysis/solar-system",
    date: "12th March 2026",
    image: `${CDN}solar-system/outputs/Mercury/lrl_perihelion_direction_comparison.png`,
  },
  {
    itemType: "Analysis (pre-print)",
    label:
      "An Environmental Curvature Response for Galaxy Rotation Curves: Empirical Tests of the κ-Framework using the SPARC Dataset",
    to: "/analysis/sparc-galaxy-rotation-curves",
    date: "9th March 2026",
    image: `${CDN}galaxy-rotation-curves/output/plots/kappa_vs_gbar_fit.png`,
  },
]

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "κ-Framework: A Unified Geometric Model for Weak-Field Gravity" },
        {
            name: "description",
            content: "An environment-dependent gravitational response model that resolves galaxy rotation curves and early-universe SMBH formation without dark matter. Validated against the SPARC dataset and Solar System dynamics."
        },
    ];
}

export async function loader({ context }: Route.LoaderArgs) {
    // const db = database();
    // const result = await db.execute<{ now: Date }>("select now()");
    // return { csrfToken: context.csrfToken, serverTime: result[0].now };
}

export default function Home({ loaderData }: Route.ComponentProps) {
    // const { t } = useTranslation();

    return (
        <>
            <section className="relative min-h-dvh flex flex-col items-center justify-center text-gray-200 py-12">
                <div className="absolute inset-0">
                    <img
                        src={`${VITE_APP_CDN_URL}/barcode.png`}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* opacity mask */}
                <div className="absolute inset-0 bg-black/80"></div>

                <div className="relative flex flex-col items-center justify-center">
                    <img src={`${VITE_APP_CDN_URL}/logo_transparent.png`} className="h-48 md:h-64 mb-12 md:mb-24" />
                    <p className="max-w-3xl text-base md:text-lg text-center px-4 mb-8">
                        The <InlineMath math={String.raw`\kappa`} />-framework is an open research project exploring whether the gravitational phenomena
                        attributed to dark matter could arise from an environmental response of spacetime itself.
                    </p>
                    <p className="max-w-3xl text-base md:text-lg text-center px-4 mb-12">
                        This site presents <Link to={'/preprint/a-curvature-response-model-for-weak-field-gravity'} className={'underline'}>the 
                        framework</Link>,  <Link to={'/notes/switching-quadratic-atlas-diagnostics'} className={'underline'}>related 
                        mathematics</Link>, <Link to={'/analysis/sparc-galaxy-rotation-curves'} className={'underline'}>experimental tests</Link>, and ongoing results as <Link to={'https://github.com/hasjack/OnGravity'} target={'_blank'} className={'underline'}>open research</Link>.
                    </p>
                    <h3 className="mb-8 text-xl font-bold">Latest:</h3>
                    <section className="w-full max-w-6xl mx-auto px-4 mb-24">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {items.map((item) => {
                                const isExternal = item.to.startsWith("https://")
                                return (
                                    <article
                                        key={item.to}
                                        className="group rounded-2xl border border-gray-800/60 bg-black/20 overflow-hidden shadow-sm hover:shadow-md hover:border-gray-700 transition"
                                    >
                                        <div className="aspect-[16/10] bg-gray-900 relative">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt=""
                                                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
                                            )}
                                        </div>

                                        <div className="p-5 space-y-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-xs tracking-wide uppercase text-gray-300 bg-gray-800/60 border border-gray-700/60 rounded-full px-3 py-1">
                                                    {item.itemType}
                                                </span>
                                                <span className="text-xs text-gray-400">{item.date}</span>
                                            </div>

                                            <h3 className="text-base leading-snug text-gray-100">
                                                <Link
                                                    to={item.to}
                                                    target={isExternal ? "_blank" : "_self"}
                                                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                                                >
                                                    <span className="underline decoration-gray-600 group-hover:decoration-gray-300">
                                                        {item.label}
                                                    </span>
                                                </Link>
                                            </h3>

                                            <div className="text-sm text-gray-400">
                                                <span className="inline-flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500/80" />
                                                    Read
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    </section>
                    <img src={`${VITE_APP_CDN_URL}/rh-logo.png`} className="h-12 md:h-18 mb-6 md:mb-8" />
                    <p className="max-w-3xl text-sm md:text-base text-center px-4 mb-24">
                        Please consider <Link to={RH_LINK} target="_blank" className="underline">funding this research</Link> on Research Hub
                    </p>

                    <img src={`${VITE_APP_CDN_URL}/cc-long.webp`} className="h-12 md:h-18 mb-6 md:mb-8" />
                    <p className="max-w-3xl text-sm md:text-base text-center px-4 mb-32">Content on this site is licensed under a Creative Commons Attribution 4.0 International License</p>
                </div>
            </section>
        </>
    )
}
