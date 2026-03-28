import { BlockMath } from 'react-katex'
import { Link } from 'react-router'
import Article from '../components/Article'
import { H2, H3, P, Ul, Ol, Li } from '../components/Typography'
import { references } from '../references'

const { VITE_APP_CDN_URL } = import.meta.env
const CDN = VITE_APP_CDN_URL + "solar-system/outputs/"

const AnalysisSolarSystem = () => {
    return (
        <Article
            title={"Environmental Curvature Response in Planetary Dynamics: Solar System Diagnostics of the κ-Framework"}
            author={"Jack Pickett"}
            dateTime={"12th March 2026"}
            url={"https://doi.org/10.55277/researchhub.05wfwlfo.1"}
        >
            <H2>Abstract</H2>
            <P>
                The κ-framework proposes that spacetime curvature responds not only to mass but also to properties of the surrounding
                dynamical environment. In previous work, titled “An Environmental Curvature Response for Galaxy Rotation Curves: Empirical
                Tests of the κ-Framework using the SPARC Dataset,” the framework was evaluated against the SPARC rotation-curve database and
                shown to reproduce observed galaxy rotation profiles without invoking non-baryonic dark matter.
            </P>
            <P>
                Any modification to gravitational dynamics must also remain consistent with the extremely well-constrained dynamical environment
                of the Solar System. Planetary motion provides a sensitive probe of weak perturbative forces through long-term orbital stability
                and secular perihelion motion.
            </P>
            <P>
                The present study evaluates the κ-framework in the context of planetary Solar System dynamics using high-precision N-body
                integrations with the REBOUND integrator. Orbital stability, secular drift, and perihelion motion are examined for representative
                planets spanning the inner, middle, and outer Solar System.
            </P>
            <P>
                Across all tested configurations the κ-framework produces extremely small structural perturbations to planetary orbits while
                introducing a measurable secular rotation of the perihelion direction. Parameter sweeps reveal three dynamical regimes: a stable
                regime with negligible orbital deformation, a transitional regime with increasing apsidal motion, and an unstable regime in which
                orbits diverge.
            </P>
            <P classNames="mb-8">
                These results indicate that the κ-framework perturbation can remain dynamically consistent with planetary Solar System behaviour
                within a weak forcing regime while producing measurable dynamical signatures.
            </P>
            <H2>1. Introduction</H2>
            <P>
                The behaviour of galaxy rotation curves has long represented a central empirical challenge for gravitational theory. The
                κ-framework proposes that curvature may respond not only to mass but also to properties of the surrounding dynamical environment.
            </P>
            <P>
                Empirical tests of the framework against the SPARC rotation-curve database demonstrated that a κ-dependent velocity prescription
                reproduces observed galactic velocity structure across a broad range of galaxies. While galaxy-scale behaviour provides one class
                of test, any modification to gravitational dynamics must also remain compatible with the highly constrained dynamical environment
                of the Solar System.
            </P>
            <P>
                Planetary motion offers a particularly sensitive probe of weak perturbative forces. Small deviations from Newtonian behaviour
                accumulate over time through secular drift of orbital elements, especially the orientation of the orbital ellipse.
            </P>
            <P classNames="mb-8">
                The purpose of the present work is therefore to evaluate whether the κ-framework introduces detectable perturbations in
                planetary dynamics while preserving long-term orbital stability.
            </P>
            <H2>2. Numerical Method</H2>
            <H3>2.1 N-body integration</H3>
            <P>Simulations were performed using the REBOUND N-body integrator with the adaptive high-accuracy IAS15 integrator.</P>
            <P>The simulated system consists of the Sun and the eight major planets:</P>
            <P>Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune</P>
            <P>Initial conditions are obtained from the built-in Solar System objects distributed with REBOUND.</P>
            <P>Simulation units are:</P>
            <Ul>
                <Li>Astronomical Units (AU)</Li>
                <Li>days</Li>
                <Li>solar masses (M☉)</Li>
            </Ul>
            <P classNames="mb-8">
                Each integration spans 200 years with 4000 sampling steps. Energy conservation diagnostics are monitored throughout
                each simulation.
            </P>

            {/* Figures 1 & 2 */}
            <div className="flex flex-wrap gap-y-4 md:gap-x-[4%] w-[90%] mb-4">
                <img
                    src={CDN + "Mercury/mercury_trajectory_framework.png"}
                    className="w-full md:w-[48%]"
                />
                <img
                    src={CDN + "Jupiter/jupiter_trajectory_framework.png"}
                    className="w-full md:w-[48%]"
                />
            </div>
            <P classNames="mb-8 text-sm">
                <b>Figures 1 & 2:</b> Newtonian baseline integration of representative planetary orbits using the REBOUND IAS15 integrator. Mercury
                (inner orbit) and Jupiter (outer orbit) illustrate the range of orbital scales and eccentricities present in the planetary
                Solar System. The simulations remain dynamically stable over the 200-year integration period.
            </P>

            <H3>2.2 κ-framework perturbation</H3>
            <P classNames="mb-0">
                The κ-framework introduces an additional curvature response term dependent on environmental properties including density
                and dynamical strain. For the Solar System tests presented here the environmental density is fixed at
            </P>
            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`\rho = 10^{-12}\,\mathrm{kg\,m^{-3}}`} />
            </div>
            <P>
                while the strain-rate parameter is varied across several orders of magnitude in order to map the dynamical response of the system.
            </P>
            <P classNames="mb-8">
                Simulations are performed both with and without the κ perturbation so that orbital diagnostics may be evaluated relative to the
                Newtonian baseline.
            </P>
            <H2>3. Orbital Diagnostics</H2>
            <P>A range of orbital quantities is monitored during each integration:</P>
            <Ul>
                <Li>orbital radius</Li>
                <Li>velocity residuals</Li>
                <Li>radial acceleration residuals</Li>
                <Li>semi-major axis</Li>
                <Li>eccentricity</Li>
                <Li>orbital phase</Li>
                <Li>perihelion orientation</Li>
            </Ul>
            <P>
                These diagnostics allow identification of both structural orbital deformation and secular dynamical drift.
            </P>
            <H3>3.1 Perihelion estimation</H3>
            <P>Two independent methods are used to estimate apsidal motion:</P>
            <Ul>
                <Li>the classical argument of perihelion (ω) obtained from orbital elements</Li>
                <Li>the direction of the Laplace-Runge-Lenz (LRL) vector</Li>
            </Ul>
            <P classNames="mb-2">Agreement between the two estimators provides an internal consistency check on the measurement of perihelion drift.</P>

            {/* Figures 3 & 4 */}
            <img src={CDN + 'Mercury/lrl_perihelion_direction_comparison.png'} className="w-auto mb-2 lg:max-w-3xl" />
            <P classNames="mb-8 text-sm">
                <b>Figure 3:</b> Mercury perihelion direction comparison: Comparison of the perihelion direction inferred from the Laplace-Runge-Lenz
                (LRL) vector for the Newtonian baseline and the κ-framework simulation over a 200-year integration. The near overlap of the two
                curves indicates that the κ perturbation produces only a very small secular deviation from the Newtonian orbital orientation.
            </P>

            <img src={CDN + 'Mercury/lrl_perihelion_drift.png'} className="w-auto mb-2 lg:max-w-3xl" />
            <P classNames="mb-8 text-sm">
                <b>Figure 4:</b> Secular perihelion drift of Mercury: Accumulated difference in the perihelion direction derived from the LRL vector
                between the Newtonian baseline and the κ-framework simulation. The ~linear trend indicates a slow secular rotation of the
                orbital ellipse while the overall orbital structure remains essentially unchanged
            </P>

            <H2>4. Parameter Sweeps</H2>
            <P>
                Parameter sweeps are performed across environmental strain-rate values in order to examine the dynamical response of the
                planetary system. Three dynamical regimes emerge:
            </P>
            <Ul>
                <Li><b>Safe regime</b><br />Orbital deviations remain extremely small and the system behaves essentially Newtonian.</Li>
                <Li><b>Distorted regime</b><br />Apsidal motion increases while orbital elements begin to show visible deformation.</Li>
                <Li><b>Unstable regime</b><br />Orbital divergence occurs and the notion of a coherent precession rate becomes ill-defined.</Li>
            </Ul>

            {/* Figures 5 & 6 */}
            <img src={CDN + 'Mercury/mercury_strain_rate_sweep.png'} className="w-auto mb-2 lg:max-w-3xl" />
            <P classNames="mb-8 text-sm">
                <b>Figure 5:</b> Mercury orbital deviation as a function of environmental strain-rate: Maximum and final orbital deviation relative
                to the Newtonian baseline for Mercury over a 200-year integration. Three dynamical regimes are visible: a stable regime in
                which orbital deviations remain negligible, a transitional regime with increasing perturbation, and an unstable regime in
                which the orbit diverges. The onset of measurable dynamical deviation occurs well after the weak-perturbation regime explored
                in the present Solar System tests.
            </P>

            <img src={CDN + 'Mercury/mercury_precession_vs_strain_rate.png'} className="w-auto mb-2 lg:max-w-3xl" />
            <P classNames="mb-8 text-sm">
                <b>Figure 6:</b> Mercury perihelion precession as a function of environmental strain-rate: Estimated perihelion precession rate for
                Mercury derived from both the angular momentum (ω-based) method and the Laplace-Runge-Lenz (LRL) vector method as a function
                of the κ-framework strain-rate parameter for a fixed density . In the low-strain regime relevant to Solar System conditions,
                the predicted precession remains extremely small and the two independent diagnostics agree closely. Rapid growth in precession
                occurs only when the strain-rate approaches values where the orbital solution itself becomes dynamically unstable.
            </P>
            <H2>5. Planetary Results</H2>
            <P>Three representative planets are examined:</P>
            <Ul>
                <Li>Mercury - inner Solar System</Li>
                <Li>Earth - intermediate orbit</Li>
                <Li>Jupiter - outer giant planet</Li>
            </Ul>
            <P>
                These planets sample a wide range of orbital radii and dynamical environments. Across all tested runs the same qualitative
                behaviour is observed. Within the weak forcing regime
            </P>
            <Ul>
                <Li>Δa ≲ 10⁻¹¹ AU</Li>
                <Li>Δe ≲ 10⁻¹⁰</Li>
            </Ul>
            <P>
                indicating negligible structural alteration of the orbit. Despite the extremely small orbital deformation, a measurable secular
                drift of the perihelion direction is detected. Example values at
            </P>
            <Ul>
                <Li>ρ = 10⁻¹² kg m⁻³</Li>
                <Li>strain-rate ≈ 5.3 x 10⁻⁷ s⁻¹</Li>
            </Ul>
            <P>are approximately</P>
            <Ul>
                <Li>Mercury ≈ 0.03 arcsec per century</Li>
                <Li>Earth ≈ 0.05 arcsec per century</Li>
                <Li>Jupiter ≈ 0.13 arcsec per century</Li>
            </Ul>
            <P>The perihelion motion estimated from orbital elements and from the LRL vector is found to agree closely across all runs.</P>

            {/* Figures 7-10 */}
            <div className="flex flex-wrap gap-y-4 md:gap-x-[4%] w-[90%] mb-4">
                <img
                    src={CDN + "Mercury/orbital_radius_difference.png"}
                    className="w-full md:w-[48%]"
                />
                <img
                    src={CDN + "Mercury/radial_acceleration_difference.png"}
                    className="w-full md:w-[48%]"
                />
            </div>
            <P classNames="mb-8 text-sm">
                <b>Figures 7 & 8:</b> Mercury orbital diagnostics: Residual diagnostics for Mercury comparing the Newtonian baseline and the
                κ-framework simulation over a 200-year integration. Panels show the difference in orbital radius and radial acceleration
                relative to the Newtonian solution. The results demonstrate that within the low-strain regime relevant to Solar System
                conditions, the κ-framework produces only extremely small perturbations to Mercury's Keplerian orbit while allowing a
                slow secular rotation of the orbital ellipse.
            </P>
            <div className="flex flex-wrap gap-y-4 md:gap-x-[4%] w-[90%] mb-4">
                <img
                    src={CDN + "Jupiter/orbital_radius_difference.png"}
                    className="w-full md:w-[48%]"
                />
                <img
                    src={CDN + "Jupiter/radial_acceleration_difference.png"}
                    className="w-full md:w-[48%]"
                />
            </div>
            <P classNames="mb-8 text-sm">
                <b>Figures 9 & 10:</b> Jupiter orbital diagnostics: Residual diagnostics for Jupiter comparing the Newtonian baseline and the
                κ-framework simulation over a 200-year integration. Panels illustrate deviations in orbital radius and radial acceleration
                relative to the Newtonian solution. Despite Jupiter's large orbital radius and dominant planetary mass, the κ-framework
                perturbation remains extremely small in the Solar System regime examined, indicating that planetary-scale dynamics remain
                essentially unchanged.
            </P>
            <H2>6. Interpretation</H2>
            <P>The κ-framework perturbation behaves as an extremely weak additional force within the Solar System environment.</P>
            <P>
                The principal dynamical signature is not large deformation of orbital parameters but rather a slow secular rotation of
                the orbital ellipse.
            </P>
            <P classNames="mb-8">
                This behaviour appears consistently across planets spanning the inner and outer Solar System and occurs well before
                the onset of orbital instability in parameter sweeps.
            </P>
            <H2>7. Limitations</H2>
            <P>The present analysis models the planetary Solar System consisting of the Sun and eight planets.</P>
            <P>
                Satellite systems, including the Earth–Moon system and the Galilean moons of Jupiter, are not included in the present
                integrations. Such tightly coupled multi-body environments provide additional sensitive probes of dynamical perturbations
                and represent a natural extension of the present work.
            </P>
            <P classNames="mb-8">
                Relativistic corrections are also not included in the present simulations, as the focus here is the relative comparison
                between Newtonian and κ-framework dynamics.
            </P>
            <H2>8. Conclusion</H2>
            <P>
                High-precision N-body integrations of the planetary Solar System demonstrate that the κ-framework can produce measurable
                perihelion motion while leaving the overall structure of planetary orbits essentially unchanged in the weak forcing regime.
            </P>
            <P>
                Parameter sweeps reveal distinct stability regimes in which measurable apsidal motion appears prior to catastrophic orbital
                divergence.
            </P>
            <P>
                The results presented here indicate that an environmental curvature response of the form proposed in the κ-framework can
                reproduce galaxy-scale phenomenology while remaining consistent with Solar System dynamics in the weak-field regime.
            </P>
            <P classNames="mb-8">
                Further work will be required to explore the behaviour of the framework in more complex gravitational systems, including
                multi-body environments and galactic structure formation. Incorporating satellite systems and longer integration horizons
                will provide further constraints on the framework.
            </P>

            <H2>References</H2>
            <Ol classNames="text-sm lg:text-base mb-8">
                {references.solarSystemAnalysis.map((ref, i) => (
                    <Li key={i} classNames="list-decimal mb-4 min-w-0">
                        <div className="w-full min-w-0">
                            <p className="font-semibold">{ref.title}</p>
                            <p>
                                {ref.authors} ({ref.year})
                            </p>
                            <Link
                                to={ref.url}
                                target="_blank"
                                className="block w-full break-all underline text-xs lg:text-md"
                            >
                                {ref.url}
                            </Link>
                        </div>
                    </Li>
                ))}
            </Ol>


            <H2>Code and Reproducibility</H2>
            <P>
                The analysis pipeline used in this study is implemented in Python and performs REBOUND-based N-body integrations of the
                planetary Solar System. All code used to generate the figures and statistical results presented in this work is available
                as open-source software:
            </P>
            <P classNames="text-center mb-4">
                <Link
                    to="https://github.com/hasjack/OnGravity/tree/feature/solar-system-model/python/solar-system"
                    target="_blank"
                    className="block w-full break-all underline text-sm lg:text-md"
                >github.com/hasjack/OnGravity/tree/feature/solar-system-model/python/solar-system
                </Link>
            </P>
            <P>
                This repository includes the full analysis pipeline, data ingestion routines, model fitting procedures, and scripts used to
                generate the figures presented in this paper.
            </P>
        </Article>
    )
}

export default AnalysisSolarSystem
