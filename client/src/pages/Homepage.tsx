import { Link } from "react-router"
import { InlineMath } from "react-katex"

const { VITE_APP_CDN_URL } = import.meta.env
const RH_LINK = "https://www.researchhub.com/proposal/29607/empirical-test-of-local-density-curvature-response-using-grace-fo-laser-ranging-data"

const Homepage = () => {
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
                <div className="absolute inset-0 bg-black/50"></div>

                <div className="relative flex flex-col items-center justify-center">
                    <img src={`${VITE_APP_CDN_URL}/logo_transparent.png`} className="h-48 md:h-64 mb-12 md:mb-24" />
                    <p className="max-w-3xl text-base md:text-lg text-center px-4 mb-8">
                        The <InlineMath math={String.raw`\kappa`} />-framework is an open research project exploring whether the gravitational phenomena
                        attributed to dark matter could arise from an environmental response of spacetime itself.
                    </p>
                    <p className="max-w-3xl text-base md:text-lg text-center px-4 mb-12">
                        This site presents the framework, related mathematics, experimental tests, and ongoing
                        results as open research.
                    </p>
                    <h3 className="mb-8 text-xl font-bold">Latest:</h3>
                    <nav className="flex items-center justify-center flex-wrap gap-8 tracking-wide text-base mb-24 max-w-3xl">
                        {[
                            { 
                                itemType: 'Theory Paper (pre-print)',
                                label: 'A Curvature Response Model for Weak-Field Gravity',
                                to: '/a-curvature-response-model-for-weak-field-gravity',
                                date: '28th March 2026'
                            },
                            
                            { 
                                itemType: 'Analysis Paper (pre-print)',
                                label: 'Environmental Curvature Response in Planetary Dynamics: Solar System Diagnostics of the κ-Framework',
                                to: '/analysis/solar-system',
                                date: '12th March 2026'
                            },
                            { 
                                itemType: 'Analysis Paper (pre-print)',
                                label: 'An Environmental Curvature Response for Galaxy Rotation Curves: Empirical Tests of the κ-Framework using the SPARC Dataset',
                                to: '/analysis/sparc-galaxy-rotation-curves',
                                date: '9th March 2026'
                            },
                        ].map((item, i) => {
                            return (
                                <div key={i} className="flex flex-col items-center gap-2 text-center">
                                    {item.itemType && (
                                        <h3>{item.itemType}</h3>
                                    )}
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className='underline text-gray-300'
                                        target={item.to.startsWith('https://') ? '_blank' : '_self'}
                                    >
                                        {item.label}
                                    </Link>
                                    <p>{item.date}</p>
                                </div>
                            )
                        })}

                    </nav>
                    <img src={`/rh-logo.png`} className="h-12 md:h-18 mb-6 md:mb-8" />
                    <p className="max-w-3xl text-sm md:text-base text-center px-4 mb-24">
                        Please consider <Link to={RH_LINK} target="_blank" className="underline">funding this research</Link> on Research Hub
                    </p>
                    
                    <img src={`/cc-long.webp`} className="h-12 md:h-18 mb-6 md:mb-8" />
                    <p className="max-w-3xl text-sm md:text-base text-center px-4 mb-32">Content on this site is licensed under a Creative Commons Attribution 4.0 International License</p>
                </div>
            </section>
        </>
    )
}

export default Homepage