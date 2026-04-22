import { Link } from 'react-router'
import { BlockMath, InlineMath } from '../components/Katex'
import Article from '../components/Article'
import { H2, H3, H4, P, Ul, Ol, Li } from '../components/Typography'
import FurtherReading from '~/components/FurtherReading'
import License from '~/components/License'
import Img from '../components/Img'
import { references } from '../lib/references'
import { Route } from './+types/AnalysisSparc'

const { VITE_APP_CDN_URL } = import.meta.env
const CDN = VITE_APP_CDN_URL || 'https://cdn.halfasecond.com/images/onGravity/'

export function loader({ request }: Route.LoaderArgs) {
    return {
        shareUrl: request.url,
    }
}

export function meta({ location }: Route.MetaArgs) {
    const url = `https://halfasecond.com${location.pathname}`
    return [
        { title: "Pre-print: A Curvature Response Model for Weak-Field Gravity" },
        {
            name: "description",
            content: "The κ-framework: A Curvature Response Model for Weak-Field Gravity",
        },

        // Open Graph
        { property: "og:type", content: "website" },
        {
            property: "og:title",
            content: "κ-Framework: A Unified Geometric Model for Weak-Field Gravity",
        },
        {
            property: "og:description",
            content:
                "An environment-dependent gravitational response model that resolves galaxy rotation curves and early-universe SMBH formation without dark matter. Validated against the SPARC dataset and Solar System dynamics.",
        },
        { property: "og:url", content: url },
        {
            property: "og:image",
            content: "https://cdn.halfasecond.com/images/onGravity/k-framework.jpg",
        },

        // Twitter
        { name: "twitter:card", content: "summary_large_image" },
        {
            name: "twitter:title",
            content: "κ-Framework: A Unified Geometric Model for Weak-Field Gravity",
        },
        {
            name: "twitter:description",
            content:
                "Exploring κ — the density-dependent curvature term unifying galactic and cosmological gravity.",
        },
        {
            name: "twitter:image",
            content: "https://cdn.halfasecond.com/images/onGravity/k-framework.jpg",
        },

        // Academic / citation
        {
            name: "citation_title",
            content: "κ-Framework: A Unified Geometric Model for Weak-Field Gravity",
        },
        { name: "citation_author", content: "Jack Pickett" },
        { name: "citation_publication_date", content: "2026/03/28" },
        {
            name: "citation_pdf_url",
            content: "https://doi.org/10.55277/researchhub.zwegi9m9.3",
        },
        { name: "citation_language", content: "en" },
    ]
}

export default function CurvatureResponseModel({ loaderData }: Route.ComponentProps) {
    return (
        <Article
            title={"A Curvature Response Model for Weak-Field Gravity"}
            author={"Jack Pickett"}
            dateTime={"28th March 2026"}
            url={"https://doi.org/10.55277/researchhub.zwegi9m9.3"}
            shareUrl={loaderData.shareUrl.replace("http://", "https://")}
        >
            <H2>1. Abstract</H2>
            <P>
                Observations of galaxy rotation curves, cluster dynamics, and gravitational collapse reveal systematic deviations
                from predictions based on a strictly Newtonian inverse-square gravitational response when only baryonic matter is
                considered. These discrepancies are conventionally addressed by introducing non-baryonic dark matter components.
            </P>
            <P>
                This work develops an alternative interpretation in which the weak-field gravitational response of spacetime depends
                on the local baryonic environment. Starting from a modified gravitational action, an environment-weighted generalisation
                of the Poisson equation is derived, introducing a spatially varying response
                coefficient <InlineMath math={String.raw`μ(r)`} />. In the weak-field limit, this formulation yields an exponential
                gravitational potential, characterised by a curvature-response parameter <InlineMath math={String.raw`\kappa(r)`} /> that
                emerges directly from the field equation.
            </P>
            <P>
                A phenomenological parameterisation of <InlineMath math={String.raw`\kappa`} /> in terms of baryonic density and velocity shear is introduced and evaluated
                against the SPARC galaxy rotation-curve dataset. The model reproduces the observed sub-linear acceleration relation
                without requiring additional matter components. The same global parameter set yields consistent behaviour across
                multiple regimes, including galactic discs, cluster environments, and gravitational collapse.
            </P>
            <P classNames="mb-8">
                These results suggest that part of the observed discrepancy between baryonic mass and gravitational dynamics arises
                from modelling gravitational response as a fixed, local function rather than an environment-dependent process. The
                framework provides a geometric description in which curvature responds to baryonic organisation, rather than being
                determined solely by local mass - offering a unified description of gravitational behaviour across a range of structured
                astrophysical systems.
            </P>

            <H2>2. Literature Context</H2>
            <P classNames="mb-0">
                Alternative approaches to gravitational anomalies can be understood in terms of how they modify the Newtonian Poisson
                equation,
            </P>

            <BlockMath math={String.raw`\nabla^2 \Phi = 4\pi G \rho`} />

            <P classNames="mb-0">
                In the standard dark-matter interpretation the equation itself is unchanged, but the source term is extended to include
                an additional non-baryonic component [Navarro1997, Clowe2006, Planck2018],
            </P>

            <BlockMath math={String.raw`\nabla^2 \Phi = 4\pi G \left(\rho_b + \rho_{\mathrm{DM}}\right)`} />

            <P>
                so that the observed dynamics arise from an effective mass distribution rather than baryonic matter alone.
            </P>

            <P classNames="mb-0">
                Phenomenological departures from Newtonian dynamics, typified by MOND [Milgrom1983, Famaey2012], instead modify the
                relation between the potential and the baryonic source by introducing an acceleration-dependent response function μ,
            </P>

            <BlockMath math={String.raw`\nabla \cdot \left[ \mu\!\left(\frac{|\nabla \Phi|}{a_0}\right)\nabla \Phi \right] = 4\pi G \rho_b`} />

            <P>
                which reduces to the Newtonian form when μ → 1. Relativistic extensions such as TeVeS embed this behaviour within
                additional fields [Bekenstein2004].
            </P>
            <P>
                Entropic and emergent-gravity proposals, including Verlinde's 2017 framework, similarly reinterpret the gravitational
                response as arising from collective degrees of freedom, leading to effective modifications of the relation between
                acceleration and baryonic matter [Verlinde2017].
            </P>
            <P classNames="mb-0">
                Parallel work in modified curvature theories alters the gravitational action itself, replacing the Einstein-Hilbert
                term R with a nonlinear function f(R), leading to modified field equations of the form
            </P>

            <BlockMath math={String.raw`f'(R) R_{\mu\nu} - \frac{1}{2} f(R) g_{\mu\nu} - \nabla_\mu \nabla_\nu f'(R) + g_{\mu\nu} \Box f'(R) = 8\pi G \, T_{\mu\nu}`} />

            <P>
                and corresponding deviations from Newtonian behaviour in the weak-field limit [DeFelice2010, Cognola2008].
            </P>

            <P>
                These frameworks differ in mechanism with additional source terms, acceleration-dependent response functions, or
                modified curvature invariants, but share a common structural feature: the gravitational response is prescribed as
                a fixed functional dependence on mass-energy or acceleration scale.
            </P>

            <P>
                However, real astrophysical systems are not characterised by isolated sources, but by structured, many-body environments
                in which density gradients, velocity shear, and large-scale organisation play a central role. In such systems,
                gravitational behaviour is inferred from motion within an extended curvature background rather than from pairwise
                interactions alone.
            </P>

            <P>
                This suggests that part of the observed discrepancy may arise not from missing mass or fixed modifications to the force
                law, but from how the gravitational response is modelled in complex environments. Rather than prescribing a fixed
                functional form, the present framework explores a formulation in which the effective curvature response depends explicitly
                on local environmental properties, allowing gravitational behaviour to emerge from the structure of the baryonic
                distribution itself.
            </P>

            <P classNames="mb-8">
                This reframes the problem from modifying gravitational laws to modelling how curvature propagates through structured
                baryonic environments and motivates a formulation in which the gravitational response, although not prescribed a priori,
                emerges from the structure of the local baryonic environment. The following section develops this framework starting
                from a modified Poisson description.
            </P>

            <H2>3. Environmental Curvature Response</H2>

            <P>
                The framework reframes gravitational dynamics as a response of spacetime to structured baryonic environments as
                opposed to a fixed interaction determined solely by local mass. The Newtonian Poisson equation provides the simplest
                relation between mass distribution and gravitational potential in the weak-field limit. In its standard form, it
                assumes that the gravitational response of spacetime is linear and universal. However, in structured astrophysical
                systems, this assumption may be too restrictive: the observed gravitational behaviour reflects motion within an
                extended curvature environment rather than a purely local response to mass density.
            </P>
            <P>
                This suggests that, rather than modifying the source term or introducing additional fields, a natural generalisation is
                to allow the response itself to vary with environment. This can be achieved by introducing a spatially varying response
                coefficient μ, leading to a modified Poisson equation.
            </P>

            <H3>3.1. Environment-Weighted Poisson Response</H3>
            <P classNames="mb-0">
                To capture this behaviour while preserving the standard weak-field structure, an environment-weighted Poisson equation
                can be motivated as the weak-field limit of a covariant modified-gravity action
            </P>

            <BlockMath math={String.raw`S = \int \sqrt{-g} [R \exp(\alpha R) + 16\pi G L_m],d^4x`} />

            <P>
                where variation with respect to the metric yields modified field equations of <InlineMath math={String.raw`f(R)`} /> type. In
                systems with approximate spherical or disc symmetry, the scalar curvature <InlineMath math={String.raw`R`} /> varies smoothly with
                radial position and can be treated as a slowly varying function of <InlineMath math={String.raw`r`} />. In the weak-field regime,
                this permits a local expansion in which curvature-dependent corrections may be expressed as an effective radial response factor,
                leading to an exponential parametrisation in <InlineMath math={String.raw`r`} /> at leading order.
            </P>

            <P classNames="mb-0">
                In the static, low-curvature limit these equations reduce to the generalised Poisson form
            </P>

            <BlockMath math={String.raw`\nabla \cdot (\mu \nabla \Phi) = 4\pi G \rho,`} />

            <P classNames="mb-0">
                with response coefficient <InlineMath math={String.raw`\mu(r) = \exp(-\kappa r)`} /> serving as an effective parametrisation of the
                curvature response. Because the field equations are derived from a diffeomorphism-invariant action, the twice-contracted Bianchi
                identities guarantee local conservation of the stress-energy tensor,
            </P>
            <BlockMath math={String.raw`\nabla_\mu T^{\mu\nu} = 0,`} />
            <P>
                with modifications arising from curvature-dependent terms rather than additional matter sources.
            </P>
            <P classNames="mb-0">Writing the gravitational acceleration as</P>
            <BlockMath math={String.raw`\mathbf{g} = -\nabla \Phi,`} />
            <P classNames="mb-0">the field equation becomes</P>
            <BlockMath math={String.raw`\nabla \cdot (\mu \mathbf{g}) = -4\pi G \rho.`} />

            <P classNames="mb-0">
                For a spherically symmetric configuration outside the main baryonic mass distribution,
                where the enclosed mass <InlineMath math={String.raw`M(r)`} /> varies slowly, integration yields
            </P>

            <BlockMath math={String.raw`r^2 \mu(r) g(r) = G M(r).`} />

            <P classNames="mb-0">
                The effective gravitational acceleration is therefore
            </P>
            <BlockMath math={String.raw`g(r) = \frac{G M(r)}{r^2 \mu(r)}.`} />

            <P classNames="mb-0">
                The <InlineMath math={String.raw`\kappa`} />-framework expresses this response through an exponential curvature factor
            </P>
            <BlockMath math={String.raw`g(r) = g_N(r)\, e^{\kappa(r) r},`} />

            <P classNames="mb-0">
                where <InlineMath math={String.raw`g_N(r) = G M(r)/r^2`} /> is the Newtonian acceleration. Equating the two forms gives
            </P>
            <BlockMath math={String.raw`\mu(r) = e^{-\kappa(r) r},`} />

            <P classNames="mb-0">
                which implies
            </P>
            <BlockMath math={String.raw`\kappa(r) = -\frac{1}{r} \ln \mu(r).`} />
            <P>
                The quantity <InlineMath math={String.raw`\kappa`} /> therefore represents the local logarithmic response rate of the environment-weighted gravitational field. This formulation
                preserves the Newtonian limit and conservation of gravitational flux while allowing the effective gravitational response to vary with
                environmental structure.
            </P>

            <H3>3.2. Effective Potential</H3>
            <P classNames="mb-0">
                While the modified field equation defines how curvature responds to the environment, observable dynamics are determined by the resulting acceleration
                field. Therefore it is necessary to express this response in terms of an effective potential and acceleration explicitly. In the weak-field regime,
                gravitational motion is determined by the gradient of the potential. The environment-weighted response therefore translates directly into a modified
                acceleration field. From the field equation, the gravitational acceleration follows as
            </P>
            <BlockMath math={String.raw`g = −∇Φ.`} />

            <P classNames="mb-0">
                In regions outside the dominant baryonic mass distribution, this leads to an effective (weak-field) gravitational potential of the form
            </P>
            <BlockMath math={String.raw`\Phi_{\mathrm{eff}}(r) = -\frac{GM}{r}\,e^{\kappa(r)\,r}`} />

            <P classNames="mb-0">which produces the radial acceleration</P>
            <BlockMath math={String.raw`g_{\mathrm{eff}}(r) = \frac{GM}{r^{2}}\,e^{\kappa(r)\,r}`} />

            <P classNames="mb-0">The circular velocity in an axisymmetric system follows from</P>
            <BlockMath math={String.raw`v_{\kappa}(r) = \sqrt{\frac{GM(r)}{r}}\,e^{\kappa(r)\,r/2}`} />

            <P>
                These expressions determine the gravitational behaviour throughout this work and hold to leading order in the limit
                where <InlineMath math={String.raw`\kappa(r)`} /> varies slowly with radius.
            </P>

            <H3>3.3. Curvature-Response Coefficient</H3>
            <P classNames="mb-0">
                The curvature-response coefficient <InlineMath math={String.raw`\kappa`} />, defined via <InlineMath math={String.raw`μ(r) = e^{-κ(r)r}`} />, is not specified a priori by the field
                equation. The field equation determines how curvature responds to the environment but does not uniquely specify how this response depends on
                the detailed baryonic structure. A phenomenological parameterisation is therefore introduced <InlineMath math={String.raw`\kappa(\rho, r)`} /> as
                a scalar quantity that reflects the influence of a local matter environment on the extension of gravitational curvature. The coefficient depends
                on two measurable properties of the environment: the mass density <InlineMath math={String.raw`\rho`} /> and the radial velocity
                shear <InlineMath math={String.raw`\partial v/\partial r`} />. The functional form is
            </P>
            <BlockMath math={String.raw`\kappa(\rho, r) = \kappa_{0} + k_{v} \left( \frac{\partial v / \partial r} {10^{-12}\,\mathrm{s}^{-1}} \right)^{3} \left( \frac{\rho}{\rho_{0}} \right)^{1/2}`} />

            <P>
                and reflects a nonlinear sensitivity to local dynamical structure through velocity shear, modulated by the ambient mass density. The parameters
                have the following roles:
            </P>
            <Ul>
                <Li><InlineMath math={String.raw`\kappa_{0}`} /> sets a background curvature scale.</Li>
                <Li><InlineMath math={String.raw`k_{v}`} /> sets the magnitude of the shear-response contribution. </Li>
                <Li><InlineMath math={String.raw`\rho_{0}`} /> defines the density scale at which the curvature response transitions between regimes.</Li>
            </Ul>

            <P classNames="mb-0">These quantities are held constant across all applications in this study. Their values are</P>
            <BlockMath math={String.raw`\kappa_{0} = 2.6 \times 10^{-26}\ \mathrm{m}^{-1},\ k_{v} = 5 \times 10^{-26}\ \mathrm{m}^{-1},\ \rho_{0} = 1600\ \mathrm{kg\,m^{-3}}`} />

            <H3>3.4. Behaviour Across Regimes</H3>
            <P>
                The form of <InlineMath math={String.raw`\kappa(\rho, r)`} /> yields four natural regimes of gravitational behaviour.
            </P>
            <Ul>
                <Li>
                    Solar-System Regime<br />
                    Local densities are high and the radial velocity shear is small. The product <InlineMath math={String.raw`\kappa r`} /> remains much smaller
                    than unity and the effective acceleration approaches <InlineMath math={String.raw`GM/r^{2}`} /> to high precision. Standard planetary dynamics
                    are recovered.
                </Li>
                <Li>
                    Galactic Regime<br />
                    Densities decrease with radius while coherent differential rotation produces increasing shear. The curvature-response term becomes significant
                    at large radii. The effective velocity profile maintains an extended form through the exponential
                    factor <InlineMath math={String.raw`e^{\kappa r/2}`} />, generating characteristic flat rotation curves.
                </Li>
                <Li>
                    Cluster and Collision Regime<br />
                    Galaxy clusters and interacting systems display strong velocity gradients and intermediate densities. These environments produce large
                    curvature-response values and enhanced gravitational lensing magnitudes. The scalar <InlineMath math={String.raw`\kappa`} /> field reaches
                    its largest observational values in these systems.
                </Li>
                <Li>
                    Cosmological Regime<br />
                    On scales where density gradients and internal shear are negligible, the background
                    component <InlineMath math={String.raw`\kappa_{0}`} /> dominates. The corresponding acceleration
                    scale <InlineMath math={String.raw`a_{\kappa} = \kappa_{0} c^{2}`} /> establishes a uniform curvature contribution that influences
                    late-time expansion.
                </Li>
            </Ul>

            <H3>3.5. Parameter Scales</H3>
            <P>
                The density scale <InlineMath math={String.raw`\rho_{0} = 1600\,\mathrm{kg\,m^{-3}}`} /> corresponds to densities characteristic of planetary
                interiors and provides a reference from which galactic and cluster densities differ by many orders of magnitude. The shear reference
                scale <InlineMath math={String.raw`10^{-12}\,\mathrm{s}^{-1}`} /> is representative of differential rotation gradients in the outer regions
                of spiral galaxies. The background curvature scale <InlineMath math={String.raw`\kappa_{0}`} /> corresponds to an acceleration of
                magnitude <InlineMath math={String.raw`a_{\kappa} = \kappa_{0} c^{2} \approx 10^{-9}\,\mathrm{m\,s^{-2}},`} /> comparable to the empirical
                acceleration scale associated with large-scale structure flows.
            </P>

            <H3>3.6. Practical Evaluation</H3>
            <P classNames="mb-8">
                The density <InlineMath math={String.raw`\rho(r)`} /> and velocity
                gradient <InlineMath math={String.raw`\partial v/\partial r`} /> are obtained from observationally
                inferred baryonic mass distributions and measured or modelled rotation profiles. These quantities
                determine <InlineMath math={String.raw`\kappa(r)`} /> throughout a system. The
                curvature-modified potential and acceleration follow directly from the expressions
                above. Once <InlineMath math={String.raw`\kappa(r)`} /> is computed, no additional
                assumptions or system-specific parameters are introduced.
            </P>


            <H2>4. Observational Predictions and Results</H2>
            <P>
                The environment-dependent curvature formulation produces measurable deviations from Newtonian behaviour only in regimes where
                baryonic density declines and velocity shear becomes non-negligible. A single global parameter set is applied across all systems
                considered below, allowing direct comparison between planetary and galactic environments.
            </P>

            <H3>4.1. Solar-System Regime</H3>
            <P classNames="mb-0">
                In the Solar System, both baryonic density and velocity shear remain small, suppressing the curvature-response
                parameter <InlineMath math={String.raw`\kappa`} />. In this limit, the effective gravitational acceleration reduces to
            </P>
            <BlockMath math={String.raw`g(r) \simeq \frac{GM}{r^2}`} />
            <P>
                with corrections from the exponential curvature term remaining well below current observational sensitivity.
            </P>
            <P classNames="mb-0">
                To test this explicitly, high-precision N-body integrations were performed using the REBOUND IAS15 integrator across a 200-year
                baseline. Simulations include the Sun and the eight major planets, with orbital diagnostics computed relative to a Newtonian
                baseline. The <InlineMath math={String.raw`\kappa`} />-framework introduces a perturbative correction dependent on environmental density and strain. For Solar System
                conditions, the density is fixed at
            </P>
            <BlockMath math={String.raw`\rho = 10^{-12}\ \text{kg m}^{-3}`} />
            <P>while the strain-rate parameter is varied to explore dynamical response.</P>


            <H4>4.1.1. Orbital Behaviour</H4>
            <P>Across all simulations in the weak-strain regime, orbital structure remains essentially unchanged:</P>
            <Ul>
                <Li><InlineMath math={String.raw`\Delta a \lesssim 10^{-11}\ \text{AU}, \qquad`} /></Li>
                <Li><InlineMath math={String.raw`\Delta e \lesssim 10^{-10}`} /></Li>
            </Ul>
            <P>indicating negligible deformation of Keplerian orbits.</P>
            <P>However, a small but systematic secular drift in perihelion orientation is observed. For representative parameter values,</P>
            <Ul>
                <Li>Mercury: ~0.03 arcsec per century</Li>
                <Li>Earth: ~0.05 arcsec per century</Li>
                <Li>Jupiter: ~0.13 arcsec per century</Li>
            </Ul>
            <P>
                Two independent estimators (orbital elements and the Laplace-Runge-Lenz (LRL) vector) agree closely, confirming the robustness of the signal.
            </P>

            <H4>4.1.2. Dynamical Regimes</H4>
            <P>Parameter sweeps reveal three distinct regimes:</P>
            <Ul>
                <Li>Stable regime: negligible deviations, effectively Newtonian</Li>
                <Li>Distorted regime: increasing apsidal motion with mild orbital deformation</Li>
                <Li>Unstable regime: orbital divergence and breakdown of coherent motion</Li>
            </Ul>

            <P>
                The Solar System resides firmly within the stable regime, with measurable precession appearing well before any structural instability.
            </P>
            <P>
                These results demonstrate that the <InlineMath math={String.raw`\kappa`} />-framework acts as a weak perturbative correction in high-density environments, preserving established
                Solar System constraints while introducing a distinct dynamical signature.
            </P>

            <H4>4.1.3. Figures</H4>
            {/* Figures 1 & 2 */}
            <div className="flex flex-wrap gap-y-4 md:gap-x-[4%] w-[90%] mb-4">
                <img
                    src={CDN + "solar-system/outputs/Mercury/mercury_trajectory_framework.png"}
                    className="w-[48%]"
                />
                <img
                    src={CDN + "solar-system/outputs/Jupiter/jupiter_trajectory_framework.png"}
                    className="w-[48%]"
                />
            </div>
            <P classNames="mb-8 text-sm">
                <b>Figures 1 & 2:</b> Newtonian baseline integration of representative planetary orbits using the REBOUND IAS15 integrator. Mercury
                (inner orbit) and Jupiter (outer orbit) illustrate the range of orbital scales and eccentricities present in the planetary
                Solar System. The simulations remain dynamically stable over the 200-year integration period.
            </P>
            {/* Figures 3 & 4 */}
            <Img
                path={CDN + 'solar-system/outputs/Mercury/lrl_perihelion_direction_comparison.png'}
                alt={'Figure 3: Mercury perihelion direction comparison'}
            />
            <P classNames="mb-8 text-sm">
                <b>Figure 3:</b> Mercury perihelion direction comparison: Comparison of the perihelion direction inferred from the Laplace-Runge-Lenz
                (LRL) vector for the Newtonian baseline and the <InlineMath math={String.raw`\kappa`} />-framework simulation over a 200-year integration. The near overlap of the two
                curves indicates that the <InlineMath math={String.raw`\kappa`} /> perturbation produces only a very small secular deviation from the Newtonian orbital orientation.
            </P>

            <Img
                path={CDN + 'solar-system/outputs/Mercury/lrl_perihelion_drift.png'}
                alt={'Figure 4: Secular perihelion drift of Mercury'}
            />
            <P classNames="mb-8 text-sm">
                <b>Figure 4:</b> Secular perihelion drift of Mercury: Accumulated difference in the perihelion direction derived from the LRL vector
                between the Newtonian baseline and the <InlineMath math={String.raw`\kappa`} />-framework simulation. The ~linear trend indicates a slow secular rotation of the
                orbital ellipse while the overall orbital structure remains essentially unchanged
            </P>
            {/* Figures 5 & 6 */}
            <Img
                path={CDN + 'solar-system/outputs/Mercury/mercury_strain_rate_sweep.png'}
                alt={'Figure 5: Mercury orbital deviation as a function of environmental strain-rate'}
            />
            <P classNames="mb-8 text-sm">
                <b>Figure 5:</b> Mercury orbital deviation as a function of environmental strain-rate: Maximum and final orbital deviation relative
                to the Newtonian baseline for Mercury over a 200-year integration. Three dynamical regimes are visible: a stable regime in
                which orbital deviations remain negligible, a transitional regime with increasing perturbation, and an unstable regime in
                which the orbit diverges. The onset of measurable dynamical deviation occurs well after the weak-perturbation regime explored
                in the present Solar System tests.
            </P>

            <Img
                path={CDN + 'solar-system/outputs/Mercury/mercury_precession_vs_strain_rate.png'}
                alt={'Figure 6: Mercury perihelion precession as a function of environmental strain-rate'}
            />
            <P classNames="mb-8 text-sm">
                <b>Figure 6:</b> Mercury perihelion precession as a function of environmental strain-rate: Estimated perihelion precession rate for
                Mercury derived from both the angular momentum (ω-based) method and the Laplace-Runge-Lenz (LRL) vector method as a function
                of the <InlineMath math={String.raw`\kappa`} />-framework strain-rate parameter for a fixed
                density <InlineMath math={String.raw`\rho = 10^{-12}\,\mathrm{kg\,m^{-3}}`} />. In the low-strain regime relevant to Solar System
                conditions, the predicted precession remains extremely small and the two independent diagnostics agree closely. Rapid growth in
                precession occurs only when the strain-rate approaches values where the orbital solution itself becomes dynamically unstable.
            </P>

            <H3>4.2. Spiral-Galaxy Rotation Curves (SPARC)</H3>
            <P>
                In galactic environments, baryonic density declines and velocity shear becomes significant, allowing the curvature-response term to
                contribute appreciably.
            </P>
            <P classNames="mb-0">The <InlineMath math={String.raw`\kappa`} />-framework modifies the Newtonian velocity field as</P>
            <BlockMath math={String.raw`v_{\mathrm{obs}}(r) = v_N(r)\exp\left(\frac{\kappa(r)\,r}{2}\right)`} />
            <P>where <InlineMath math={String.raw`v_N(r)`} /> is the baryonic Newtonian circular velocity.</P>
            <H4>4.2.1. Empirical Determination of <InlineMath math={String.raw`\kappa`} /></H4>
            <P classNames="mb-0">Given observed and baryonic velocities, <InlineMath math={String.raw`\kappa`} /> can be inferred directly:</P>
            <BlockMath math={String.raw`\frac{\kappa(r)\,r}{2} = \ln\left(\frac{v_{\mathrm{obs}}}{v_N}\right)`} />
            <P>This quantity represents the logarithmic amplification of the baryonic velocity field.</P>
            <P>
                Using the SPARC dataset, empirical values of <InlineMath math={String.raw`\kappa`} /> are computed across ~170 galaxies spanning a wide
                range of masses and morphologies.
            </P>
            <H4>4.2.2. Environmental Correlations</H4>
            <P classNames="mb-0">
                Stacking measurements across the SPARC sample reveals a clear correlation between <InlineMath math={String.raw`\kappa`} /> and baryonic
                acceleration:
            </P>
            <BlockMath math={String.raw`g_{\mathrm{bar}} = \frac{v_N^2}{r}`} />
            <P classNames="mb-0">The empirical relation is well described by</P>
            <BlockMath math={String.raw`\frac{\kappa r}{2} = a + b\,\log_{10}(g_{\mathrm{bar}})`} />
            <P classNames="mb-0">with an extended model including shear</P>
            <BlockMath math={String.raw`\frac{\kappa r}{2} = a + b\,\log_{10}(g_{\mathrm{bar}}) + c\,\log_{10}\left(\frac{dv}{dr}\right)`} />
            <P>These relations are obtained through regression on training subsets and evaluated across held-out galaxies.</P>

            <H4>4.2.3. Rotation Curve Reconstruction</H4>
            <P classNames="mb-0">Predicted velocities are then computed as</P>
            <BlockMath math={String.raw`v_{\mathrm{pred}} = v_N \exp\left(\frac{\kappa r}{2}\right)`} />
            <P>
                Across repeated train/test splits, the <InlineMath math={String.raw`\kappa`} />-based model improves fits relative to baryons-only Newtonian predictions for approximately
                85-90% of galaxies.</P>
            <P>The inclusion of baryonic shear provides a modest additional improvement.</P>

            <H4>4.2.4. Radial Acceleration Relation</H4>
            <P classNames="mb-0">The <InlineMath math={String.raw`\kappa`} />-framework naturally reproduces the observed radial acceleration relation (RAR), defined by</P>
            <BlockMath math={String.raw`g_{\mathrm{obs}} = \frac{v_{\mathrm{obs}}^2}{r}`} />
            <P>
                Residual diagnostics show that <InlineMath math={String.raw`\kappa`} />-based predictions closely track the observed RAR trend, with residuals concentrated near zero and
                reduced scatter when shear is included.
            </P>

            <H4>4.2.5. Figures</H4>
            {/* Figures 7 & 8 */}
            <div className="flex flex-wrap gap-y-4 md:gap-x-[4%] w-[90%] mb-4">
                <img
                    src={CDN + "galaxy-rotation-curves/output/galaxies/UGCA444_rotmod_rotation.png"}
                    className="w-[48%]"
                />
                <img
                    src={CDN + "galaxy-rotation-curves/output/galaxies/NGC5985_rotmod_rotation.png"}
                    className="w-[48%]"
                />
            </div>
            {/* Figures 9 & 10 */}
            <div className="flex flex-wrap gap-y-4 md:gap-x-[4%] w-[90%] mb-4">
                <img
                    src={CDN + "galaxy-rotation-curves/output/galaxies/F563-1_rotmod_rotation.png"}
                    className="w-[48%]"
                />
                <img
                    src={CDN + "galaxy-rotation-curves/output/galaxies/CamB_rotmod_rotation.png"}
                    className="w-[48%]"
                />
            </div>

            {/* Figures 11 & 12 */}
            <div className="flex flex-wrap gap-y-4 md:gap-x-[4%] w-[90%] mb-4">
                <img
                    src={CDN + "galaxy-rotation-curves/output/galaxies/DDO154_rotmod_rotation.png"}
                    className="w-[48%]"
                />
                <img
                    src={CDN + "galaxy-rotation-curves/output/galaxies/PGC51017_rotmod_rotation.png"}
                    className="w-[48%]"
                />
            </div>

            <P classNames="mb-8 text-sm">
                <b>Figures 7-12:</b> show representative rotation curves from the SPARC sample, including the baryonic Newtonian
                prediction, the observed velocities, and the <InlineMath math={String.raw`\kappa`} />-framework reconstruction.
            </P>

            {/* Figure 13 */}
            <Img
                path={CDN + 'galaxy-rotation-curves/output/plots/kappa_vs_gbar.png'}
                alt={'Figure 13: reveals a clear correlation between κr/2 and baryonic acceleration across the stacked SPARC sample.'}
            />
            <P classNames="mb-8 text-sm">
                <b>Figure 13:</b> reveals a clear correlation between κr/2 and baryonic acceleration across the stacked SPARC sample.
            </P>

            <Img
                path={CDN + 'galaxy-rotation-curves/output/plots/kappa_stack.png'}
                alt={'Figure 14: Empirical structure across the SPARC sample.'}
            />
            <P classNames="mb-8 text-sm">
                <b>Figure 14:</b> Empirical <InlineMath math={String.raw`\kappa`} /> structure across the SPARC sample. Each point represents a
                measurement of κr/2 at a radius within a galaxy.
            </P>
            {/* Figure 15 */}
            <Img
                path={CDN + 'solar-system-analysis.jpg'}
                alt={'Figure 15: Linear regression fit describing the empirical relation between κr/2 and baryonic acceleration.'}
            />
            <P classNames="mb-8 text-sm">
                <b>Figure 15:</b> Linear regression fit describing the empirical relation between κr/2 and baryonic acceleration.
            </P>

            {/* Figures 16-18 */}
            <Img
                path={CDN + 'galaxy-rotation-curves/output/plots/rar/rar_model_overlay.png'} alt={'Figure 16'} />
            {/* Figures 17 & 18 */}
            <div className="flex flex-wrap gap-y-4 md:gap-x-[4%] w-[90%] mb-4">
                <img
                    src={CDN + "galaxy-rotation-curves/output/plots/robustness/multi_split_fraction_improved.png"}
                    className="w-full md:w-[48%]"
                    alt={'Figure 17'}
                />
                <img
                    src={CDN + "galaxy-rotation-curves/output/plots/robustness/multi_split_median_chi2.png"}
                    className="w-full md:w-[48%]"
                    alt={'Figure 18'}
                />
            </div>

            <P classNames="mb-8 text-sm">
                <b>Figures 16-18:</b> Comparison between <InlineMath math={String.raw`\kappa`} />-framework predictions and the observed radial acceleration relation.
            </P>
            <P>
                These results demonstrate that a simple environmental parameterisation of <InlineMath math={String.raw`\kappa`} /> captures a substantial
                fraction of the rotation-curve discrepancy without introducing additional mass components.
            </P>

            <H3>4.3. Behaviour Across Regimes</H3>
            <P>The <InlineMath math={String.raw`\kappa`} />-framework exhibits a continuous transition across gravitational environments:</P>
            <Ul>
                <Li>
                    High-density / low-shear (Solar System):<br />
                    <InlineMath math={String.raw`\kappa \rightarrow 0,`} /> Newtonian behaviour recovered
                </Li>
                <Li>
                    Intermediate regime (galaxies):<br />
                    <InlineMath math={String.raw`\kappa`} /> grows with declining density and increasing shear, producing flat rotation curves
                </Li>
                <Li>
                    High-response regime (collapse): <br />
                    <InlineMath math={String.raw`\kappa`} /> becomes large, enhancing effective gravitational attraction
                </Li>
            </Ul>
            <P>
                The key feature is that deviations from Newtonian behaviour arise not from additional mass components, but from an environment-dependent
                amplification of curvature.
            </P>
            <H3>4.4. Summary of Observational Behaviour</H3>
            <P>Across both regimes:</P>
            <Ul>
                <Li>Solar System dynamics remain stable with only weak secular signatures</Li>
                <Li>Galaxy rotation curves are reproduced without dark matter halos</Li>
                <Li>The same functional form of <InlineMath math={String.raw`\kappa`} /> applies across systems</Li>
                <Li>Observed scaling relations emerge naturally from environmental dependence</Li>
            </Ul>
            <P classNames="mb-8">
                Taken together, these results indicate that a curvature response dependent on baryonic environment can provide a unified description
                of gravitational behaviour across astrophysical systems.
            </P>

            <H2>5. Astrophysical Implications</H2>
            <H3>5.1. Disc Formation and Early Disc Stability</H3>
            <P>
                Disc galaxies present challenges for ΛCDM-based structure formation where simulations generically produce excessive angular momentum
                loss "catastrophic cooling", thick discs, and delayed disc formation, with thin, rotation-supported discs emerging only under
                finely tuned feedback prescriptions.
            </P>
            <P>
                In the <InlineMath math={String.raw`\kappa`} />-framework, the same environmental curvature term that flattens rotation curves also
                reshapes the collapse pathway of protogalactic gas. In a collapsing, rotating cloud, baryonic density increases fastest along the
                minor axis, and the shear grows rapidly as rotation proceeds. Because <InlineMath math={String.raw`\kappa`} /> depends on both density and shear,
                the <InlineMath math={String.raw`\kappa`} />-field develops an oblate profile early in the collapse, steepening curvature
                in the plane of rotation relative to the vertical direction.
            </P>
            <P>This produces two immediate consequences:</P>
            <Ol>
                <Li>
                    Planar collapse is preferentially reinforced.<br />
                    The curvature gradient generated by <InlineMath math={String.raw`\kappa`} /> accelerates infall toward the rotation plane, driving
                    disc formation without requiring angular momentum loss to be suppressed.
                </Li>
                <Li>
                    Vertical support is enhanced.<br />
                    Because <InlineMath math={String.raw`\kappa`} /> decreases with radius but increases with density, the disc plane becomes the locus of maximum curvature, inhibiting thick-disc
                    growth and stabilising the thin-disc structure earlier than in Newtonian dynamics.
                </Li>
            </Ol>
            <P>
                These effects appear at exactly the radii and densities associated with observed high-redshift disc galaxies. In this view, disc formation
                is not delayed or finely tuned; it is a natural consequence of the environmentally responsive curvature
                embodied in <InlineMath math={String.raw`\kappa`} />.
            </P>

            <H3>5.2. Galactic Disc Mechanics</H3>
            <P classNames="mb-0">Galactic discs operate in a regime where shear, density gradients, and compression coexist. The modified potential</P>
            <BlockMath math={String.raw`\Phi_\kappa(r)=-\frac{GM(r)}{r}\,e^{\kappa(r)\,r}`} />
            <P>introduces a scale-weighted enhancement that changes disc dynamics in several testable ways.</P>

            <H4>5.2.1. Radial acceleration in thin discs</H4>
            <P classNames="mb-0">For an axisymmetric disc, the radial gravitational field is</P>
            <BlockMath math={String.raw`g_r(r) = \frac{GM(r)}{r^2}\,e^{\kappa(r)\,r}`} />

            <P>
                In outer discs where <InlineMath math={String.raw`M(r)`} /> increases slowly, even a
                modest <InlineMath math={String.raw`\kappa r\sim 0.05{-}0.2`} /> produces a measurable
                amplification of <InlineMath math={String.raw`g_r`} />. This raises rotational support and explains the observed outer-disc
                flattening as a geometric effect of local curvature.
            </P>

            <H4>5.2.2. Shear response and spiral structure</H4>
            <P classNames="mb-0">
                The <InlineMath math={String.raw`\kappa`} /> field responds nonlinearly to velocity gradients. In disc environments where
                differential rotation dominates, the model uses
            </P>

            <BlockMath math={String.raw`\kappa(r)=\kappa_0 + k_v \left(\frac{\partial v/\partial r}{10^{-12}\,\mathrm{s}^{-1}}\right)^3 \left(\frac{\rho(r)}{\rho_0}\right)^{1/2}.`} />
            <P>
                Regions with enhanced shear - spiral arms, bar ends, shocked gas lanes - show transient boosts
                to <InlineMath math={String.raw`\kappa`} />. This produces three consequences:
            </P>
            <Ol>
                <Li>
                    <b>Spiral arm longevity:</b> <InlineMath math={String.raw`\kappa`} /> increases the local effective gravitational pull along the arm, delaying
                    the usual shearing-apart expected in a pure Newtonian disc.
                </Li>
                <Li>
                    <b>Arm contrast without dark halos:</b> the boosted curvature sharpens density-wave features without requiring additional mass.
                </Li>
                <Li>
                    <b>Bar-spiral coupling:</b> bars slow their pattern speeds through ordinary torque transfer,
                    but <InlineMath math={String.raw`\kappa`} /> amplifies the gravitational response at the bar end, strengthening bar-driven arm formation.
                </Li>
            </Ol>

            <P>Observed discs with prominent, long-lived arms follow exactly this pattern.</P>

            <H4>5.2.3. Toomre stability</H4>

            <P classNames="mb-0">
                In Newtonian discs, the Toomre parameter is written here with <InlineMath math={String.raw`\Omega_{\rm ep}`} /> denoting the epicyclic
                frequency, to avoid confusion with the curvature-response <InlineMath math={String.raw`\kappa`} />.
            </P>
            <BlockMath math={String.raw`Q=\frac{\sigma_r \Omega_{\rm ep}}{3.36\,G\,\Sigma}.`} />

            <P classNames="mb-0">The <InlineMath math={String.raw`\kappa`} />-weighted radial field modifies the gravitational term as</P>
            <BlockMath math={String.raw`G \;\rightarrow\; G\,e^{\kappa(r)\,r/2},`} />

            <P classNames="mb-0">leading to a revised stability condition</P>
            <BlockMath math={String.raw`Q_{\kappa} = \frac{\sigma_r \Omega_{\rm ep}}{3.36\,G\,\Sigma}\, e^{-\kappa(r)\,r/2}.`} />

            <P classNames="mb-0">For a typical spiral disc (<InlineMath math={String.raw`(\kappa r\sim 0.1)`} />),</P>
            <BlockMath math={String.raw`Q_\kappa \approx 0.95\,Q,`} />

            <P>
                meaning discs remain stable at slightly lower velocity dispersions than Newtonian expectations. This aligns with observed cold,
                thin discs that avoid fragmentation despite low <InlineMath math={String.raw`\sigma_r`} />.
            </P>

            <Img
                path={CDN + 'figures/figure3.png'}
                alt={'Figure 19: Toomre stability parameter Q as a function of galacto-centric radius'}
            />
            <P classNames="mb-8 text-sm">
                <b>Figure 17:</b> Toomre stability parameter Q as a function of galacto-centric radius for (blue) present-day Milky Way conditions and
                (green) high-redshift z ≈ 15 protogalaxies, computed using the <InlineMath math={String.raw`Q_\kappa`} />-augmented
                epicyclic frequency <InlineMath math={String.raw`\Omega_{\rm ep}`} />. In the modern Milky Way, <InlineMath math={String.raw`Q_\kappa`} /> ≳ 1
                across most of the disc, indicating marginal stability with localised star-forming instabilities at ~1-5 kpc. In early, dense
                protogalaxies, the higher densities and shears increase <InlineMath math={String.raw`\kappa`} />,
                lowering <InlineMath math={String.raw`Q_\kappa`} /> and naturally producing globally unstable discs. These
                instabilities drive rapid inflow and early SMBH formation, consistent with JWST observations. Red and yellow markers
                show representative observational <InlineMath math={String.raw`Q`} /> estimates for present-day and early galaxies.
            </P>

            <H4>5.2.4. Outer-disc morphology and warps</H4>
            <P>
                The curvature-response coefficient <InlineMath math={String.raw`\kappa`} /> increases gradually toward the
                outer disc because shear remains large while density declines smoothly. In such regions:
            </P>
            <Ul>
                <Li>the enhanced radial field supports extended, nearly flat rotation curves,</Li>
                <Li>
                    weak torques from satellites or misaligned gas inflows can produce warps that persist longer due to
                    the <InlineMath math={String.raw`\kappa`} />-weighted restoring force,
                </Li>
                <Li>outer discs remain dynamically cold</Li>
            </Ul>
            <P>These behaviours match the morphology of systems such as M31, M33, NGC 628, and NGC 5055.</P>

            <H4>5.2.5. Summary of disc-scale implications</H4>
            <P>Across all radii, <InlineMath math={String.raw`\kappa`} /> introduces:</P>
            <Ul>
                <Li>enhanced radial gravity without additional mass,</Li>
                <Li>shear-sensitive curvature, naturally tied to spiral-arm structure,</Li>
                <Li>slightly lowered Toomre thresholds, improving disc stability,</Li>
                <Li>long-lived spiral patterns,</Li>
                <Li>extended outer-disc support,</Li>
                <Li>warp persistence.</Li>
            </Ul>

            <P>
                These effects arise directly from the same <InlineMath math={String.raw`\kappa(r)`} /> used for rotation curves and lensing, with
                no additional parameters or halo  assumptions. Disc mechanics therefore form a mid-scale consistency check
                linking <InlineMath math={String.raw`\kappa`} /> to observable structures across many galaxy types.
            </P>

            <H3>5.3. Gravitational Collapse and SMBH Formation</H3>
            <P>
                The <InlineMath math={String.raw`\kappa`} /> framework treats gravitational collapse and the emergence of supermassive black holes (SMBHs)
                as the high-density limit of the same curvature weighting mechanism that governs disc dynamics. When local baryonic density and shear
                grow large, <InlineMath math={String.raw`\kappa`} /> increases, amplifying the effective gravitational field. This accelerates infall,
                steepens the central potential, and pushes the system toward runaway compression. The behaviour is continuous: the conditions that
                flatten rotation curves in galactic discs are the same conditions that, under sufficient concentration, drive a region to collapse.
            </P>

            <H4>5.3.1. Thought Experiment: The TOV Baseball</H4>
            <P classNames="mb-0">
                Consider a completely empty universe other than a “fully loaded” baseball diamond of neutron stars: four neutron stars positioned
                100,000 m apart, each with density <InlineMath math={String.raw`\rho \approx 6.0 \times 10^{17}\,\mathrm{kg\,m^{-3}}`} />, and
                a <InlineMath math={String.raw`0.6\ \mathrm{kg}`} /> baseball swung into the centre. The framework within this configuration yields
            </P>
            <BlockMath math={String.raw`\kappa \approx 3.4 \times 10^{-15}\,\mathrm{m^{-1}},\ e^{\kappa r} \approx 1.00000000034`} />

            <P>
                which deepens the effective gravitational well and shifts the stability parameter from ≈ 0.85 to ≈ 0.58 placing the system below the
                collapse threshold and producing a central Schwarzschild radius of order ≈ 1.5 km.
            </P>
            <P>
                The example illustrates tipping-point behaviour in high-density, high-shear regions. Small additional baryonic masses can trigger
                runaway collapse when <InlineMath math={String.raw`\kappa`} /> is already elevated.
            </P>

            <H4>5.3.2. Curvature Growth Under Compression</H4>

            <P classNames="mb-0">
                For a collapsing region of characteristic scale <InlineMath math={String.raw`r`} /> and mean
                density <InlineMath math={String.raw`\rho`} />, the response is
            </P>
            <BlockMath math={String.raw`\kappa(r) = \kappa_0 \;+\; k_v \left( \frac{\partial v/\partial r}{10^{-12}\ \mathrm{s^{-1}}} \right)^{\!3} \left( \frac{\rho}{\rho_0} \right)^{\!1/2}.`} />

            <P>
                During collapse, density and shear increase:
            </P>

            <Ul>
                <Li>density increases as <InlineMath math={String.raw`\rho \propto r^{-3}`} />,</Li>
                <Li>shear increases as velocity gradients sharpen toward the centre.</Li>
            </Ul>

            <P classNames="mb-0">
                The gravitational potential therefore steepens faster than the classical Newtonian scaling. The potential takes the form
            </P>
            <BlockMath math={String.raw`\Phi_\kappa(r) = -\,\frac{GM(r)}{r}\,e^{\kappa(r)\,r},`} />
            <P>so any monotonic rise in <InlineMath math={String.raw`\kappa(r)`} /> multiplies the gravitational pull and accelerates the collapse.</P>

            <H4>5.3.3. Onset of Collapse</H4>
            <P classNames="mb-0">
                In the late stages of compression, the quantity <InlineMath math={String.raw`\kappa r`} /> approaches unity. At this point the effective
                gravitational acceleration,
            </P>
            <BlockMath math={String.raw`g_\kappa(r) \,=\, \frac{GM(r)}{r^2}\, e^{\kappa(r) r},`} />

            <P>
                begins to rise faster than any power of <InlineMath math={String.raw`1/r`} />. When <InlineMath math={String.raw`\kappa r \gtrsim 1`} />, the
                exponential steepening dominates the dynamics and the collapse accelerates super-linearly as the radius decreases. Once this acceleration
                exceeds all internal support mechanism - e.g. thermal pressure, turbulence, and magnetic fields - the collapse becomes dynamically irreversible.
                Any region that attains sufficient density and shear therefore crosses a well-defined threshold and proceeds inevitably toward runaway collapse,
                with <InlineMath math={String.raw`\kappa r = 1`} /> marking the onset of the exponential regime.
            </P>

            <H4>5.3.4. SMBH Formation</H4>
            <P>This mechanism provides a direct pathway to SMBH formation:</P>
            <Ul>
                <Li>Galactic centres naturally develop steep density profiles through bar instabilities, inflows, and repeated mergers.</Li>
                <Li>Shear is maximised as the central rotation curve turns sharply upward.</Li>
                <Li><InlineMath math={String.raw`\kappa`} /> grows, increasing the effective self-gravity of the inflowing gas.</Li>
                <Li>Collapse accelerates until the region crosses its relativistic threshold.</Li>
                <Li>A black hole forms at the point where curvature amplification cannot grow indefinitely and classical structure cannot be maintained.</Li>
            </Ul>

            <P>Within this view, the emergence of an SMBH is not an independent process but the endpoint of the same dynamics that shape disc rotation.</P>

            <H4>5.3.5. Avoiding Unphysical Divergence</H4>
            <P>Gravitational weight rises steeply but not without bound. In the physical system:</P>
            <Ul>
                <Li>
                    <InlineMath math={String.raw`\kappa`} /> tracks structure, and structure ceases to be resolvable once the collapse reaches relativistic
                    densities.
                </Li>
                <Li>GR boundary conditions dominate as the enclosed mass crosses its Schwarzschild radius.</Li>
                <Li>The exponential factor saturates because the region becomes causally enclosed.</Li>
            </Ul>
            <P>
                Thus the model does not predict unphysical divergences, it predicts exactly what GR predicts: a horizon forms when classical curvature
                amplification reaches its limit. The <InlineMath math={String.raw`\kappa`} />-term is therefore the precursor to black hole formation,
                not a competing mechanism.
            </P>
            <H4>5.3.6. Unified Behaviour from Discs to Black Holes</H4>
            <P classNames="mb-0">The same curvature-weighting term:</P>
            <BlockMath math={String.raw`e^{\kappa(r) r}`} />
            <P>
                flattens rotation curves at kilo-parsec scales, shifts lensing maps during cluster collisions, and drives collapse to SMBHs at parsec
                and sub-parsec scales.
            </P>
            <P>
                This continuity is the central point: disc dynamics, central inflows, and black hole formation are all expressions of a single structural
                response of gravity. Whereas other models treat these as unrelated, the <InlineMath math={String.raw`\kappa`} />-framework treats them
                as different regimes of the same geometry.
            </P>

            <H3>5.4. Cluster Lensing and Offsets</H3>
            <P>Galaxy clusters exhibit:</P>
            <Ul>
                <Li>densities <InlineMath math={String.raw`10^{-26}-10^{-24}\ kg\ m^{-3},`} /></Li>
                <Li>velocity shear up to <InlineMath math={String.raw`10^{-12}-10^{-11}\,\mathrm{s^{-1}}`} /> (subcluster flows).</Li>
            </Ul>
            <P classNames="mb-0">These conditions amplify the shear term:</P>
            <BlockMath math={String.raw`\kappa_{\mathrm{shear}} = k_v \left(\frac{|\partial v_{\mathrm{rel}}/\partial r|}{10^{-12}\,\mathrm{s}^{-1}}\right)^3 \left(\frac{\rho}{\rho_0}\right)^{1/2}.`} />

            <H4>Result</H4>
            <P classNames="mb-0">For typical merging-cluster geometries (impact parameters 100-300 kpc):</P>
            <BlockMath math={String.raw`\kappa r \sim 1`} />
            <P>producing:</P>
            <Ul>
                <Li>modest enhancement of the projected potential,</Li>
                <Li>peak-gas offsets of order 100-300 kpc, comparable in scale to lensing reconstructions of interacting systems such as Bullet-like clusters.</Li>
            </Ul>
            <P>The model does not introduce collision-less matter; the offset arises from shear-dependent curvature response.</P>

            <Img
                path={CDN + 'figures/figure5.png'}
                alt={'Figure 20: Effective gravitational potential for a simplified cluster collision'}
            />
            <P classNames="mb-8 text-sm">
                <b>Figure 18:</b> Effective gravitational potential <InlineMath math={String.raw`Q_eff(x,y)`} /> for a simplified cluster collision in
                the <InlineMath math={String.raw`\kappa`} /> framework, showing the curvature basin after the high-velocity passage of a subcluster.
                Shock-compression and strong velocity shear temporarily increase <InlineMath math={String.raw`\kappa`} /> in the gas component, shifting
                the curvature minimum away from the baryonic centroid. The resulting lensing map shows an offset that mimics an apparent mass displacement,
                matching the qualitative features of the Bullet Cluster without invoking collision-less dark matter. As the shear
                dissipates, <InlineMath math={String.raw`\kappa`} /> returns to its baseline value and the curvature basin re-centres.
            </P>

            <H3>5.5. Cluster Collisions and Transient Curvature Enhancement</H3>
            <P>
                High-velocity cluster mergers generate strong velocity gradients and shock-compressed gas. Both effects enter directly into
                the <InlineMath math={String.raw`\kappa`} /> law. In these environments the curvature coefficient is temporarily shifted above
                its quiescent value:
            </P>
            <BlockMath math={String.raw`\kappa \;=\; \kappa_{\rm base} \,+\, \kappa_{\rm coll},`} />

            <P classNames="mb-0">where the collision-driven contribution is</P>
            <BlockMath math={String.raw`\kappa_{\rm coll} = k_{v} \left( \frac{\nabla v_{\rm rel}}{10^{-12}\,\mathrm{s^{-1}}} \right)^{3} \left( \frac{\rho}{\rho_{0}} \right)^{1/2},`} />
            <BlockMath math={String.raw`k_v \approx 5\times 10^{-26}\,\mathrm{m^{-1}},\; \rho_0 = 1600\,\mathrm{kg\,m^{-3}}.`} />


            <P classNames="mb-0">
                Strong shear and compression therefore produce a short-lived increase in curvature weight. Because gravitational lensing depends
                on the potential as
            </P>
            <BlockMath math={String.raw`\Phi_{\kappa}(r) = -\frac{GM}{r}\,e^{\kappa r},`} />

            <P classNames="mb-0">the associated deflection angle is similarly multiplied:</P>
            <BlockMath math={String.raw`\alpha_{\kappa}(b) = \alpha_{\rm GR}(b)\,e^{\kappa b/2}.`} />

            <P>
                During the collision this enhancement shifts the apparent lensing centroid. When the shock dissipates and the velocity gradients
                relax, <InlineMath math={String.raw`\kappa_{\rm coll} \rightarrow 0`} /> and the lensing map re-centres naturally.
            </P>

            <P>
                This mechanism reproduces the observed displacement in systems such as the Bullet Cluster without altering the mass budget and can
                instead be attributed to a temporary increase in curvature weighting.
            </P>

            <H3>5.6. Low-Shear Cosmological Background</H3>
            <P classNames="mb-0">
                On scales where the shear term vanishes and <InlineMath math={String.raw`\rho \approx \mathrm{constant}`} />, the response collapses
                to the baseline:
            </P>
            <BlockMath math={String.raw`\kappa \to \kappa_0.`} />

            <P classNames="mb-0">The background value <InlineMath math={String.raw`\kappa_{0}`} /> defines a large-scale acceleration</P>
            <BlockMath math={String.raw`a_{\kappa} = \kappa_{0} c^{2}`} />
            <P>
                with the same order of magnitude as the acceleration scale inferred from late-time cosmological observations. This sets a natural
                target for future relativistic extensions of the framework.
            </P>

            <H3>5.7. Cross-Scale Summary</H3>
            <P>Across all cases (and with the same global parameter set applied throughout):</P>
            <Ul classNames="mb-8">
                <Li>Solar system: <InlineMath math={String.raw`\kappa r`} /> negligible — standard GR recovered.</Li>
                <Li>Disks: density drop + moderate shear → <InlineMath math={String.raw`\kappa r`} /> of order 0.1-1 → flat rotation curves.</Li>
                <Li>Merging clusters: high shear → <InlineMath math={String.raw`\kappa r`} /> of order unity → lensing asymmetries.</Li>
                <Li>Cosmic background: shear → 0 → <InlineMath math={String.raw`\kappa\ = \kappa_0`} /> → correct acceleration scale order of magnitude.</Li>
            </Ul>

            <H2>6. Applied Implications</H2>
            <H3>6.1. Unified Curvature Parameter</H3>
            <P classNames="mb-0">
                In the weak-field regime, general relativity around a point mass <InlineMath math={String.raw`M`} /> at
                radius <InlineMath math={String.raw`r`} /> is characterised by the dimensionless parameter
            </P>
            <BlockMath math={String.raw`\epsilon_{\mathrm{GR}}(r) = \frac{GM}{c^{2} r},`} />

            <P classNames="mb-0">
                which measures the depth of the gravitational potential relative to <InlineMath math={String.raw`c^2`} />. In the <InlineMath math={String.raw`\kappa`} />-framework, the effective
                acceleration takes the form
            </P>
            <BlockMath math={String.raw`g_{\mathrm{eff}}(r) = \frac{GM}{r^{2}}\,e^{\kappa(r)\,r},`} />

            <P classNames="mb-0">introducing an additional dimensionless quantity</P>
            <BlockMath math={String.raw`\epsilon_{\kappa}(r) = \kappa(r)\,r,`} />

            <P>which controls the magnitude of the curvature-induced modification.</P>

            <P>
                In the inner Solar System, <InlineMath math={String.raw`\epsilon_{\mathrm{GR}}\gg\epsilon_{\kappa}`} />, and dynamics reduce to standard
                general relativity. At larger radii and lower densities, <InlineMath math={String.raw`\epsilon_{\kappa}`} /> becomes increasingly
                significant, providing a smooth transition to the regime where <InlineMath math={String.raw`\kappa`} />-driven effects dominate.
            </P>

            <H4>Galactic and cluster regime (environment-dominated)</H4>
            <BlockMath math={String.raw`\epsilon_{\kappa}(r) \gtrsim \epsilon_{\mathrm{GR}}(r),`} />
            <P>
                so <InlineMath math={String.raw`\kappa(r)\,r`} /> is controlled by <InlineMath math={String.raw`\kappa(r)\,r`} />. In this regime, the density- and
                shear-dependent term can significantly modify the effective potential, providing a natural explanation for flat rotation curves and
                contributing to lensing behaviour without requiring additional non-baryonic matter.
            </P>

            <H4>High-density and strongly stressed regimes</H4>
            <P>
                In environments characterised by strong density contrasts and shear, <InlineMath math={String.raw`\epsilon_{\kappa}(r)`} /> may
                exceed <InlineMath math={String.raw`\epsilon_{\mathrm{GR}}(r)`} />, and <InlineMath math={String.raw`\kappa(r)\,r`} /> becomes dominated by the
                environmental contribution. In such regimes, <InlineMath math={String.raw`\kappa`} />-driven curvature may influence collapse dynamics and the formation of compact structures,
                although a full treatment requires detailed numerical modelling.
            </P>
            <P>
                Within this picture, GR supplies the baseline curvature generated by mass-energy, while <InlineMath math={String.raw`\kappa`} /> supplies an additional environment-dependent
                contribution arising from baryonic density and shear. The unified parameter <InlineMath math={String.raw`\kappa(r)\,r`} /> interpolates smoothly
                between GR-dominated, mixed, and environment-dominated regimes, providing a single phenomenological descriptor applicable across Solar-System
                tests, galactic dynamics, cluster lensing, and high-density structure formation.
            </P>

            <H3>6.2. Mass-Energy Coupling</H3>
            <P classNames="mb-0">
                The relation <InlineMath math={String.raw`E = mc^{2}`} /> remains unchanged in the <InlineMath math={String.raw`\kappa`} />-framework. Mass
                retains its inertial role, and local special relativistic physics is preserved. The modification only enters through the curvature field. In
                environments where <InlineMath math={String.raw`\kappa`} /> is non-zero, the gravitational interaction acquires a multiplicative weighting
                through the effective acceleration
            </P>
            <BlockMath math={String.raw`g_{\mathrm{eff}}(r) = \frac{GM}{r^{2}}\,e^{\kappa(r)\,r}.`} />

            <P classNames="mb-0">
                This exponential factor can be interpreted as a curvature-dependent weighting of gravitational influence, scaling
                as <InlineMath math={String.raw`e^{\kappa(r)\,r}`} />, without modifying the intrinsic mass or energy of the particle. At small radii or in
                high-density environments, where <InlineMath math={String.raw`\kappa(r)\,r \ll 1`} />, the exponential factor approaches unity,
            </P>

            <BlockMath math={String.raw`e^{\kappa(r)\,r} \simeq 1, \qquad E_{\kappa} \simeq mc^2,`} />

            <P>and inertial and gravitational behaviour coincide with standard general relativity.</P>
            <P>
                At galactic and cluster scales, the <InlineMath math={String.raw`\kappa`} />-term enhances the gravitational influence of baryonic matter through the same exponential factor
                that governs rotation curves and lensing. At laboratory and microscopic scales, where environmental structure is negligible, the <InlineMath math={String.raw`\kappa`} />
                contribution is suppressed, and mass-energy equivalence behaves conventionally.
            </P>
            <P>
                This establishes a scale-dependent gravitational response while preserving local relativistic physics and the equivalence of inertial
                mass and energy.
            </P>

            <H3>6.3. The Quantum Limit</H3>
            <P>
                At macroscopic scales, <InlineMath math={String.raw`\kappa`} /> encodes the influence of environmental structure, including
                density contrasts, gradients, and shear. As the characteristic scale approaches the Planck
                length <InlineMath math={String.raw`\ell_P`} />, these structural features are no longer resolved.
            </P>
            <P classNames="mb-0">
                In this framework, <InlineMath math={String.raw`\kappa`} /> depends on such resolvable gradients. As the resolution scale
                approaches <InlineMath math={String.raw`\ell_P`} /> these gradients are no longer well-defined, and
                the <InlineMath math={String.raw`e^{\kappa}`} />-dependent contribution is correspondingly suppressed. The gravitational potential
                therefore approaches its unweighted form:
            </P>
            <BlockMath math={String.raw`\Phi(r) = -\frac{GM}{r}\,e^{\kappa(r)\,r}, \qquad \lim_{r \to \ell_P} \Phi(r) = -\frac{GM}{r}.`} />

            <P classNames="mb-0">
                The exponential factor tends to unity as <InlineMath math={String.raw`\kappa(r)\,r \to 0`} /> in the absence of resolvable structure. The
                same behaviour applies to <InlineMath math={String.raw`\kappa`} />-weighted energy:
            </P>
            <BlockMath math={String.raw`E_{\kappa}(r) = mc^{2} e^{\kappa(r)\,r}, \qquad \lim_{r \to 0} E_{\kappa}(r) = mc^{2}.`} />

            <P classNames="mb-8">
                At Planck scales, only the baseline mass-generated curvature remains, and no additional environmental contribution is present. At
                larger scales, <InlineMath math={String.raw`\kappa`} /> re-emerges as soon as density structure and shear become physically distinguishable.
                This establishes a continuous transition: gravity reduces to its standard, quantum-compatible form at small scales, and
                acquires <InlineMath math={String.raw`\kappa`} />-dependent weighting only when macroscopic structure becomes resolvable.
            </P>

            <H2>Appendix</H2>
            <H3>A.1. Structural Derivation of an Effective Gravitational Response</H3>
            <P classNames="mb-0">
                To outline a minimal weak-field realisation consistent with <InlineMath math={String.raw`f(R)`} /> gravity that motivates the effective
                response formulation used in the main text, the gravitational action
            </P>
            <BlockMath math={String.raw`S = \int \sqrt{-g} \left[ f(R) + 16\pi G L_m \right] d^4x,`} />
            <P classNames="mb-0">is modified with</P>
            <BlockMath math={String.raw`f(R) = R \exp(\alpha R),`} />
            <P classNames="mb-0">
                where <InlineMath math={String.raw`R`} /> is the Ricci scalar and <InlineMath math={String.raw`\alpha`} /> controls
                the strength of nonlinear curvature corrections. Variation of the action with respect to the metric yields the field equations
            </P>
            <BlockMath math={String.raw`f'(R)R_{\mu\nu} - \frac{1}{2}f(R)g_{\mu\nu} - \nabla_\mu\nabla_\nu f'(R) + g_{\mu\nu}\Box f'(R) = 8\pi G T_{\mu\nu}.`} />

            <H4>A.1.1. Weak-Field Limit</H4>
            <P classNames="mb-0">
                In the weak-field regime, the metric is written as a perturbation about Minkowski spacetime,
            </P>
            <BlockMath math={String.raw`g_{\mu\nu} = \eta_{\mu\nu} + h_{\mu\nu}, \qquad |h_{\mu\nu}| \ll 1,`} />

            <P classNames="mb-0">
                and the Ricci scalar is correspondingly small, so that
                <InlineMath math={String.raw`\alpha R \ll 1`} />. Expanding the modified
                Lagrangian to first order in <InlineMath math={String.raw`\alpha R`} /> gives
            </P>
            <BlockMath math={String.raw`f(R) = R e^{\alpha R} \;\approx\; R + \alpha R^{2},`} />

            <P classNames="mb-0">
                with derivative
            </P>
            <BlockMath math={String.raw`f'(R) = \frac{d f}{dR} = e^{\alpha R}(1+\alpha R) \;\approx\; 1 + 2\alpha R.`} />

            <P>
                The theory therefore reduces, at leading order, to Einstein gravity plus a small
                curvature correction of order <InlineMath math={String.raw`R^{2}`} />.
            </P>

            <P classNames="mb-0">
                In the non-relativistic, quasi-static limit, the dominant metric component is
            </P>
            <BlockMath math={String.raw`g_{00} \approx -(1 + 2\Phi),`} />

            <P classNames="mb-0">
                where <InlineMath math={String.raw`\Phi`} /> is the Newtonian gravitational potential.
                Retaining only leading-order scalar terms, the <InlineMath math={String.raw`(00)`} />
                component of the field equations reduces schematically to
            </P>
            <BlockMath math={String.raw`\nabla \cdot \!\left[f'(R)\,\nabla \Phi \right] \approx 4\pi G \rho,`} />

            <P>
                so that spatial variation in <InlineMath math={String.raw`f'(R)`} /> acts as an
                effective weighting of the gravitational response.
            </P>
            <P classNames="mb-0">Defining</P>
            <BlockMath math={String.raw`\mu(r) \equiv f'(R(r)),`} />

            <P classNames="mb-0">
                the weak-field equation takes the generalised Poisson form
            </P>
            <BlockMath math={String.raw`\nabla \cdot \!\left[\mu(r)\,\nabla \Phi \right] = 4\pi G \rho.`} />

            <P>
                Although this does not yet uniquely determine the functional form
                of <InlineMath math={String.raw`\mu(r)`} />, it shows how a curvature-dependent
                response coefficient arises naturally in the weak-field limit of the modified action.
                The exponential parametrisation used in the main text is then introduced as an
                effective radial model for this response in structured baryonic environments.
            </P>

            <H4>A.1.2. Emergence of the Response Coefficient</H4>
            <P classNames="mb-0">
                The function <InlineMath math={String.raw`\mu(r)`} /> arises from spatial variation
                of <InlineMath math={String.raw`f'(R)`} />, which acts as an effective weighting of the gravitational response:
            </P>
            <BlockMath math={String.raw`\mu(r) \sim f'(R(r)).`} />

            <P classNames="mb-0">For the exponential form,</P>
            <BlockMath math={String.raw`f'(R) = \exp(\alpha R)\left(1 + \alpha R\right),`} />

            <P classNames="mb-0">so that, to leading order in the weak-field regime,</P>
            <BlockMath math={String.raw`\mu(r) \approx \exp(\alpha R(r)).`} />

            <P classNames="mb-0">Identifying the curvature-dependent contribution with an effective radial response,</P>
            <BlockMath math={String.raw`\mu(r) = \exp(-\kappa r),`} />

            <P>
                defines the curvature-response parameter <InlineMath math={String.raw`\kappa`} />, which encodes how curvature accumulates
                across the surrounding environment. This identification corresponds to mapping the curvature-dependent
                term <InlineMath math={String.raw`\alpha R(r)`} /> onto  an effective radial
                response <InlineMath math={String.raw`\kappa(r)\,r`} />.
            </P>

            <H4>A.1.3 Effective Potential</H4>
            <P classNames="mb-0">
                Solving the modified Poisson equation for a static, spherically symmetric mass distribution yields an effective potential of the form
            </P>
            <BlockMath math={String.raw`\Phi(r) = -\frac{GM}{r} e^{\kappa(r)\,r}`} />

            <P classNames="mb-0">and corresponding acceleration</P>
            <BlockMath math={String.raw`g(r) = \frac{GM}{r^2} e^{\kappa(r)\,r}.`} />

            <P>
                This expression preserves the Newtonian limit as <InlineMath math={String.raw`\kappa \to 0`} />, while allowing for an environment-dependent
                extension of the gravitational response.
            </P>

            <H4>A.1.4 Interpretation</H4>
            <P>
                The quantity <InlineMath math={String.raw`\mu(r)`} /> therefore represents an effective, spatially varying response coefficient arising
                from nonlinear curvature terms in the action. Rather than introducing additional sources, the modification alters how existing
                baryonic matter sources curvature, producing an accumulated environmental response.
            </P>
            <P>
                This provides the formal basis for interpreting <InlineMath math={String.raw`\kappa`} /> as a coarse-grained measure of
                environmental structure, linking the covariant formulation to the phenomenological parameterisations used in the main text.
            </P>


            <H3>A.2. Circular Velocities</H3>
            <P classNames="mb-0">
                For a test mass in a circular orbit of radius <InlineMath math={String.raw`r`} /> around baryonic
                mass <InlineMath math={String.raw`M`} />, the centripetal acceleration is <InlineMath math={String.raw`\frac{v^2}{r}`} />. Equating this to
                the <InlineMath math={String.raw`\kappa`} />-modified gravitational acceleration gives
            </P>
            <BlockMath math={String.raw`\frac{v_\kappa^{2}}{r} = \frac{GM}{r^{2}}\,e^{\kappa r}.`} />

            <P classNames="mb-0">Solving for the orbital velocity,</P>
            <BlockMath math={String.raw`v_\kappa(r) = \sqrt{\frac{GM}{r}}\, e^{\kappa r / 2}.`} />

            <P classNames="mb-0">The Newtonian prediction from baryons alone is</P>
            <BlockMath math={String.raw`v_N(r)=\sqrt{\frac{GM}{r}}.`} />

            <P classNames="mb-0">The ratio between the observed orbital speed</P>
            <BlockMath math={String.raw`v_{\rm obs}(r)`} />

            <P classNames="mb-0">
                The ratio between the observed orbital speed <InlineMath math={String.raw`v_{\rm obs}(r)`} />  and the baryonic Newtonian prediction
                therefore defines the empirical relation at each radius:
            </P>
            <BlockMath math={String.raw`\frac{v_{\rm obs}}{v_N}=e^{\kappa(r) r/2}.`} />

            <P classNames="mb-0">Solving for <InlineMath math={String.raw`\kappa(r)`} /> yields</P>
            <BlockMath math={String.raw`\kappa(r)=\frac{2}{r}\, \ln\!\left( \frac{v_{\rm obs}(r)}{v_N(r)} \right).`} />

            <P>
                This relation is used to infer <InlineMath math={String.raw`\kappa(r)`} /> directly from rotation-curve data with no dark matter halo. The
                environmental expression for <InlineMath math={String.raw`\kappa(r)`} /> in the main text is then fitted to these empirically
                derived quantities.
            </P>

            <H3>A.3. Environmental Density and Shear</H3>
            <P classNames="mb-0">
                The geometric origin of <InlineMath math={String.raw`\kappa`} /> implies that it depends on local structure. An observationally
                motivated expression used in the main text is
            </P>
            <BlockMath math={String.raw`\kappa(r) = \kappa_{0} \;+\; k_{v} \left( \frac{\partial v/\partial r}{10^{-12}\,\mathrm{s}^{-1}} \right)^{3} \left( \frac{\rho}{\rho_{0}} \right)^{1/2}.`} />

            <P>Parameters and quantities:</P>
            <Ul>
                <Li><InlineMath math={String.raw`\kappa_{0}`} />: background curvature level</Li>
                <Li><InlineMath math={String.raw`k_v`} />: shear-response coefficient</Li>
                <Li><InlineMath math={String.raw`\partial v/\partial r`} />: local velocity gradient (shear)</Li>
                <Li><InlineMath math={String.raw`\rho/\rho_0`} />: density relative to fiducial scale</Li>
            </Ul>
            <P>
                The cubic response to shear highlights regions of strong differential rotation (e.g., spiral arms, shocked gas in mergers), while
                the square-root density term captures curvature enhancement in compressed environments relative to voids.
            </P>
            <P>
                When this <InlineMath math={String.raw`\kappa(r)`} /> expression is placed into the velocity and lensing formulae, the resulting predictions
                match rotation curves and lensing profiles across many systems using baryonic matter alone.
            </P>

            <H3>A.4. Growth and the Collapse Threshold</H3>
            <P classNames="mb-0">
                The collapse mechanism relies on how <InlineMath math={String.raw`\kappa`} /> responds to local structure. The
                environmental model specifies
            </P>
            <BlockMath math={String.raw`\kappa(r) = \kappa_{0} + k_{v} \left( \frac{\partial v/\partial r}{10^{-12}\ \mathrm{s^{-1}}} \right)^{3} \left( \frac{\rho}{\rho_0} \right)^{1/2}.`} />

            <H4>A.4.1. Density scaling during collapse</H4>
            <P classNames="mb-0">For a collapsing region of characteristic radius <InlineMath math={String.raw`r`} />:</P>
            <BlockMath math={String.raw`\rho(r)\propto r^{-3}, \qquad \rho^{1/2}(r)\propto r^{-3/2}.`} />

            <H4>A.4.2 Shear scaling during collapse</H4>
            <P classNames="mb-0">Velocity gradients grow as the collapse steepens:</P>
            <BlockMath math={String.raw`\frac{\partial v}{\partial r} \;\propto\; \frac{v(r)}{r}.`} />

            <P>For infall driven by the local potential,</P>
            <BlockMath math={String.raw`v(r) \sim \sqrt{\frac{GM(r)}{r}}.`} />

            <P classNames="mb-0">If <InlineMath math={String.raw`M(r)`} /> changes slowly compared to <InlineMath math={String.raw`r`} />, then</P>
            <BlockMath math={String.raw`\frac{\partial v}{\partial r} \sim r^{-3/2}.`} />

            <P classNames="mb-0">Thus the shear term scales as</P>
            <BlockMath math={String.raw`\left(\frac{\partial v}{\partial r}\right)^{3} \propto r^{-9/2}.`} />

            <H4>A.4.3. Combined scaling</H4>
            <P classNames="mb-0">Combining density and shear:</P>
            <BlockMath math={String.raw`\kappa(r)-\kappa_0 \;\propto\; r^{-9/2}\, r^{-3/2} \;=\; r^{-6}.`} />

            <P classNames="mb-0">Equivalently,</P>
            <BlockMath math={String.raw`\kappa(r)\;\sim\; r^{-6} \quad \text{as } r\to 0.`} />

            <P>
                This expresses the intuition: as a region compresses, <InlineMath math={String.raw`\kappa`} /> rises extremely rapidly. A milder scaling
                can be adopted (for alternative <InlineMath math={String.raw`\kappa`} />-laws), but the qualitative result is
                unchanged: <InlineMath math={String.raw`\kappa`} /> increases sharply as density and shear grow.
            </P>

            <H4>A.4.4. Collapse threshold</H4>
            <P classNames="mb-0">The weighted gravitational acceleration is</P>
            <BlockMath math={String.raw`g_\kappa(r) = \frac{GM(r)}{r^{2}}\,e^{\kappa(r) r}.`} />

            <P classNames="mb-0">Runaway behaviour begins when the exponential term ceases to be a small correction:</P>
            <BlockMath math={String.raw`\kappa(r)\,r \;\gtrsim\;1. `} />

            <P classNames="mb-0">Substituting the scaling <InlineMath math={String.raw`\kappa ∼ r⁻⁶`} />:</P>
            <BlockMath math={String.raw`\kappa(r)\,r \;\sim\; r^{-5}.`} />

            <P classNames="mb-0">
                As <InlineMath math={String.raw`r`} /> decreases, <InlineMath math={String.raw`r^{-5}`} /> rises rapidly. There is
                always a radius <InlineMath math={String.raw`r_\mathrm{crit}`} /> where
            </P>
            <BlockMath math={String.raw`\kappa(r_\mathrm{crit})\,r_\mathrm{crit} = 1.`} />

            <P classNames="mb-0">For <InlineMath math={String.raw`r < r_\mathrm{crit}`} />, the exponential steepening dominates the dynamics:</P>
            <BlockMath math={String.raw`g_\kappa(r) \;\approx\; \frac{GM}{r^{2}} \exp(r^{-5}) ,`} />

            <P>and collapse accelerates beyond any classical counterforce.</P>

            <H4>A.4.5. Interpretation</H4>
            <P>The <InlineMath math={String.raw`\kappa`} />-response couples density, shear, and curvature. During compression:</P>
            <Ul>
                <Li>density increases <InlineMath math={String.raw`\rightarrow\ √ρ`} /> term rises,</Li>
                <Li>shear sharpens <InlineMath math={String.raw`\rightarrow\ (∂v/∂r)³`} /> term rises,</Li>
                <Li><InlineMath math={String.raw`\kappa`} /> increases steeply,</Li>
                <Li>the exponential factor <InlineMath math={String.raw`e^{\kappa r}`} /> amplifies gravity,</Li>
                <Li>collapse accelerates until a GR horizon forms.</Li>
            </Ul>

            <H3>A.5. Collision-Induced Amplification</H3>
            <P classNames="mb-0">Starting from the same environmental expression for <InlineMath math={String.raw`\kappa`} /> used in the main text:</P>
            <BlockMath math={String.raw`\kappa = \kappa_{\rm base} + k_v \left(\frac{\nabla v}{10^{-12}\,\mathrm{s^{-1}}}\right)^{3} \left(\frac{\rho}{\rho_0}\right)^{1/2}.`} />

            <P classNames="mb-0">
                During a high-velocity cluster collision (relative velocities <InlineMath math={String.raw`3 - 4 \times 10^3 \text{ km/s}`} />, the effective velocity
                shear sampled by shocked gas reaches:
            </P>
            <BlockMath math={String.raw`\nabla v_{\rm rel} \sim (1\!-\!3)\times10^{-12}\,\mathrm{s^{-1}}.`} />

            <P classNames="mb-0">
                For the fiducial
                values <InlineMath math={String.raw`\rho_0 = 1600\,\mathrm{kg\,m^{-3}}`} /> and <InlineMath math={String.raw`k_v \approx 5\times10^{-26}\,\mathrm{m^{-1}}`} /> this yields:
            </P>
            <BlockMath math={String.raw`\kappa_{\rm coll} \approx (1\!-\!5)\times10^{-23}\,\mathrm{m^{-1}},`} />

            <P classNames="mb-0">consistent with the transient increases used in the main text. The lensing deflection becomes:</P>
            <BlockMath math={String.raw`\alpha_{\rm eff}(b) = \alpha_{\rm GR}(b)\,e^{\frac{1}{2}(\kappa_{\rm base}+\kappa_{\rm coll})b}.`} />

            <P classNames="mb-0">For a representative impact parameter <InlineMath math={String.raw`b\approx 200\,\mathrm{kpc}`} />:</P>
            <BlockMath math={String.raw`\kappa_{\rm coll}b \sim 10^{-2}, \qquad e^{\kappa_{\rm coll} b /2} \approx 1.005\!-\!1.015.`} />

            <P>
                Thus the collision temporarily increases the bending angle by 0.5-1.5%, shifting the centre of the lensing map in the same direction
                as the observed Bullet-Cluster-type offsets. When the shock
                dissipates, <InlineMath math={String.raw`\nabla v_{\rm rel}\to 0`} /> and <InlineMath math={String.raw`\kappa_{\rm coll}\to 0`} />, restoring the
                original potential.
            </P>

            <H3>A.6. Accretion and Early SMBH Growth</H3>
            <H4>Modified Inflow and the <InlineMath math={String.raw`\kappa`} />-Boosted Accretion Rate</H4>
            <P classNames="mb-0">The <InlineMath math={String.raw`\kappa`} />-framework modifies the gravitational potential through</P>
            <BlockMath math={String.raw`\Phi_{\kappa}(r)=-\frac{GM}{r}\,e^{\kappa r},`} />

            <P classNames="mb-0">leading to an effective acceleration</P>
            <BlockMath math={String.raw`g_\kappa(r)=\frac{GM}{r^{2}}\,e^{\kappa r}.`} />

            <P classNames="mb-0">In spherical inflow, the Bondi accretion rate is</P>
            <BlockMath math={String.raw`\dot M_{\rm Bondi} =4\pi\lambda\,\frac{(GM)^2\rho_\infty}{c_s^3},`} />

            <P classNames="mb-0">where <InlineMath math={String.raw`c_s`} /> is the sound speed and <InlineMath math={String.raw`\rho_\infty`} /> is the ambient density.</P>

            <P classNames="mb-0">
                In the <InlineMath math={String.raw`\kappa`} />-framework, the increase in gravitational acceleration effectively rescales
                the gravitational coupling by
            </P>
            <BlockMath math={String.raw`G \;\longrightarrow\; G_{\rm eff}(r) = G\,e^{\kappa r}.`} />

            <P classNames="mb-0">Because <InlineMath math={String.raw`\dot M\propto G^2`} />, the <InlineMath math={String.raw`\kappa`} />-modified accretion rate becomes</P>
            <BlockMath math={String.raw`\dot M_\kappa \;=\; \dot M_{\rm Bondi}\,e^{2\kappa r}.`} />

            <P classNames="mb-0">For steady inflow near the Schwarzschild radius, take <InlineMath math={String.raw`r\approx r_s\equiv 2GM/c^2`} />. Then</P>
            <BlockMath math={String.raw`\dot M_\kappa = \dot M_{\rm Bondi}\, \exp\!\left(\frac{4GM\kappa}{c^2}\right)`} />

            <P classNames="mb-0">Even modest values of <InlineMath math={String.raw`\kappa r_s \sim 0.1\!-\!0.3`} /> give order-of-magnitude boosts:</P>
            <BlockMath math={String.raw`e^{4\kappa r_s} \sim 3\!-\!30.`} />

            <P>
                This provides a natural, geometry-driven enhancement to growth rates without invoking super-Eddington physics or departures
                from radiative efficiency.
            </P>

            <H4>A.6.1. Departure from the Eddington Limit</H4>
            <P classNames="mb-0">The Eddington-limited growth equation is</P>
            <BlockMath math={String.raw`\dot{M}_{\rm Edd} = \frac{M}{t_{\rm Sal}}, \qquad t_{\rm Sal} \simeq 4.5 \times 10^{7}\ {\rm yr}.`} />

            <P classNames="mb-0">In the <InlineMath math={String.raw`\kappa`} />-framework this is replaced by</P>
            <BlockMath math={String.raw`\dot{M} = \frac{M}{t_{\rm Sal}}\,e^{2\kappa r_s}.`} />

            <P classNames="mb-0">Thus the integrated mass evolution becomes</P>
            <BlockMath math={String.raw`M(t) = M_0\,\exp\!\left[\frac{t}{t_{\rm Sal}}\,e^{2\kappa r_s}\right].`} />

            <P classNames="mb-0">
                With only a modest <InlineMath math={String.raw`\kappa`} />-boost of <InlineMath math={String.raw`e^{2\kappa r_s}\sim 5`} />, the
                effective growth timescale shortens to
            </P>
            <BlockMath math={String.raw`t_{\rm eff} = \frac{t_{\rm Sal}}{5} \simeq 9\,{\rm Myr}.`} />

            <P>
                This is sufficient to grow typical seed masses
                of <InlineMath math={String.raw`10^3{-}10^4\,M_\odot`} /> up to <InlineMath math={String.raw`10^8{-}10^9\,M_\odot`} /> in
                under a gigayear — matching the JWST observations of early quasars without requiring super-Eddington episodes.
            </P>


            <H3>A.7. Gravitational Lensing</H3>
            <P classNames="mb-0">
                In standard General Relativity, the deflection angle for a photon passing mass <InlineMath math={String.raw`M`} /> with impact parameter
            </P>
            <BlockMath math={String.raw`\alpha_{\rm GR}(b)=\frac{4GM}{c^{2} b}.`} />

            <P classNames="mb-0">
                The <InlineMath math={String.raw`\kappa`} />-dependent potential introduces an exponential correction to the same expression. In the
                weak-field limit the effective deflection angle becomes
            </P>
            <BlockMath math={String.raw`\alpha_{\rm eff}(b) = \alpha_{\rm GR}(b)\,e^{\kappa b/2} = \left(\frac{4GM}{c^{2} b}\right)e^{\kappa b/2}.`} />

            <P classNames="mb-0">For <InlineMath math={String.raw`\kappa b \ll 1`} />, the exponential expands to</P>
            <BlockMath math={String.raw`\alpha_{\rm eff}(b) \approx \alpha_{\rm GR}(b)\bigl(1+\tfrac{1}{2}\kappa b\bigr),`} />

            <P>
                showing that <InlineMath math={String.raw`\kappa`} /> introduces a scale-dependent enhancement of the deflection without altering the
                underlying baryonic mass distribution.
            </P>


            <H3>A.8. Mass-Energy Equivalence Under <InlineMath math={String.raw`\kappa(r)`} /></H3>
            <P classNames="mb-0">In the <InlineMath math={String.raw`\kappa`} />-modified weak-field limit, the gravitational potential is</P>
            <BlockMath math={String.raw`\Phi_{\kappa}(r) = -\,\frac{GM}{r}\, e^{\kappa r}.`} />

            <P classNames="mb-0">Differentiating gives the radial acceleration:</P>
            <BlockMath math={String.raw`g_{\kappa}(r) = \frac{GM}{r^{2}}\, e^{\kappa r}.`} />

            <P classNames="mb-0">It is often convenient to express the exponential factor as a scale-dependent gravitational weight:</P>
            <BlockMath math={String.raw`g_{\kappa}(r) = \frac{GM}{r^{2}} \left( \frac{m_{\mathrm{grav}}(r)}{m} \right), \qquad m_{\mathrm{grav}}(r) = m\,e^{\kappa r}.`} />

            <P classNames="mb-0">
                This quantity <InlineMath math={String.raw`m_{\mathrm{grav}}(r)`} /> is not a change to the particle's intrinsic mass. It captures how the curvature
                field weights the gravitational interaction at scale <InlineMath math={String.raw`r`} />. Inertial mass remains constant, and the
                local relation
            </P>
            <BlockMath math={String.raw`E = mc^{2}`} />

            <P classNames="mb-0">The curvature-weighted gravitational energy takes the same form,</P>
            <BlockMath math={String.raw`E_{\kappa}(r) = m c^{2}\, e^{\kappa r}.`} />

            <P classNames="mb-0">
                At small radii, where <InlineMath math={String.raw`\kappa r \ll 1`} />, the exponential term disappears and the standard expression is recovered:
            </P>
            <BlockMath math={String.raw`\lim_{r \to 0} E_{\kappa}(r) = mc^{2}.`} />

            <P>
                This yields a clear distinction: inertial mass and special-relativistic energy remain fixed, while the gravitational
                influence of that energy is modulated by the local field. The <InlineMath math={String.raw`\kappa`} />-framework therefore
                introduces a scale-dependent gravitational response without altering local relativistic physics.
            </P>

            <H3>A.9. The Quantum Limit</H3>
            <P classNames="mb-0">To examine the behaviour of the <InlineMath math={String.raw`\kappa`} />-weighted potential near the quantum domain, begin with</P>
            <BlockMath math={String.raw`\Phi_{\kappa}(r) = -\,\frac{GM}{r}\,e^{\kappa(r)\,r}.`} />

            <P>
                Here <InlineMath math={String.raw`\kappa(r)`} /> is an effective structural parameter built from coarse-grained density, gradients, and
                shear. At scales where structure cannot be resolved (approaching the Planck length) <InlineMath math={String.raw`\kappa`} /> must approach zero.
            </P>

            <H3>A.9.1. Small-r expansion</H3>
            <P classNames="mb-0">
                For any finite <InlineMath math={String.raw`\kappa(r)`} />, the exponential has a Taylor expansion around
            </P>
            <BlockMath math={String.raw`e^{\kappa(r)\,r} = 1 + \kappa(r)\,r + \tfrac{1}{2}\kappa(r)^{2} r^{2} + \mathcal{O}(r^{3}).`} />

            <P classNames="mb-0">Substituting:</P>
            <BlockMath math={String.raw`\Phi_{\kappa}(r) = -\frac{GM}{r}\Big[ 1 + \kappa(r)\,r + \tfrac{1}{2}\kappa(r)^{2}r^{2} + \mathcal{O}(r^{3}) \Big].`} />

            <P classNames="mb-0">Expanding term-by-term:</P>
            <BlockMath math={String.raw`\Phi_{\kappa}(r) = -\frac{GM}{r} \;-\; GM\,\kappa(r) \;-\; \tfrac{1}{2}GM\,\kappa(r)^{2}r \;+\; \mathcal{O}(r^{2}).`} />

            <P>
                The <InlineMath math={String.raw`1/r`} /> behaviour is unchanged. All <InlineMath math={String.raw`\kappa`} />-dependent terms remain finite
                or vanish as <InlineMath math={String.raw`r`} />. Thus the short-distance structure of the potential is exactly
                the Newtonian (and GR) form.
            </P>


            <H3>A.9.2. <InlineMath math={String.raw`\kappa`} /> sourced by macroscopic structure</H3>
            <P classNames="mb-0">In the <InlineMath math={String.raw`\kappa`} />-framework, <InlineMath math={String.raw`\kappa(r)`} /> is defined through measurable, resolvable structure:</P>
            <BlockMath math={String.raw`\kappa(r) = \kappa_{0} + k_{v} \left( \frac{\partial v/\partial r}{10^{-12}\,\mathrm{s}^{-1}} \right)^{3} \left( \frac{\rho}{\rho_{0}} \right)^{1/2}.`} />

            <P classNames="mb-0">
                As <InlineMath math={String.raw`r\to \ell_P`} />, matter distribution is effectively homogeneous and all resolvable gradients vanish
                because the resolution scale falls below any physical inhomogeneity. Consequently,
            </P>
            <BlockMath math={String.raw`\lim_{r\to \ell_P} \kappa(r) = 0, \qquad \lim_{r\to \ell_P} \Phi_{\kappa}(r) = -\frac{GM}{r}.`} />

            <H3>A.9.3. <InlineMath math={String.raw`\kappa`} /> weighted mass-energy</H3>
            <P classNames="mb-0">The <InlineMath math={String.raw`\kappa`} />-weighted inertial energy is</P>
            <BlockMath math={String.raw`E_{\kappa}(r) = m c^{2} e^{\kappa(r) r}.`} />

            <P classNames="mb-0">Expanding:</P>
            <BlockMath math={String.raw`E_{\kappa}(r) = mc^{2}\Big[ 1 + \kappa(r) r + \tfrac{1}{2}\kappa(r)^{2}r^{2} + \mathcal{O}(r^{3}) \Big].`} />

            <P classNames="mb-0">Thus,</P>
            <BlockMath math={String.raw`\lim_{r\to \ell_P} E_{\kappa}(r) = mc^{2}.`} />

            <P>Inertial mass remains unchanged; <InlineMath math={String.raw`\kappa`} /> supplies only a gravitational weighting that disappears in the quantum limit.</P>

            <H4>A.9.4. Interpretation</H4>
            <P>
                <InlineMath math={String.raw`\kappa`} /> acts as a structural modifier. It vanishes when structure cannot be resolved (Planck scale) and
                grows as soon as macroscopic density contrasts, gradients, and shear emerge.
                The <InlineMath math={String.raw`\kappa`} />-framework therefore transitions cleanly:
            </P>
            <Ul>
                <Li>Quantum regime: <InlineMath math={String.raw`\kappa\ \rightarrow\ 0`} />, standard Newtonian/GR behaviour recovered.</Li>
                <Li>Macroscopic regime: <InlineMath math={String.raw`\kappa\ ≠\ 0`} />, curvature responds to structure.</Li>
            </Ul>
            <P classNames="mb-8">
                This establishes a scale-dependent but coherent connection between microscopic gravity
                and  <InlineMath math={String.raw`\kappa`} />-modified macroscopic law.
            </P>


            <H2>References</H2>
            <Ol classNames="text-sm lg:text-base mb-8">
                {references.curvatureResponseModel.map((ref, i) => (
                    <Li key={i} classNames="list-decimal mb-4 min-w-0">
                        <div className="w-full min-w-0">
                            <p className="font-semibold">{ref.title}</p>
                            <p className="text-xs lg:text-md">
                                {ref.authors} ({ref.year}) {ref.journal && (
                                    <Link
                                        to={ref.url}
                                        target="_blank"
                                        className="block w-full underline text-xs lg:text-md"
                                    >{ref.journal}</Link>
                                )}
                            </p>
                        </div>
                    </Li>
                ))}
            </Ol>

            <H2>Further Reading</H2>
            <div className="mb-12 mt-2 mx-2">
                <FurtherReading items={[
                    {
                        itemType: "Analysis (pre-print)",
                        label:
                            "Environmental Curvature Response in Planetary Dynamics: Solar System Diagnostics of the κ-Framework",
                        to: "/analysis/solar-system",
                        date: "12th March 2026",
                        image: `${CDN}solar-system/outputs/Mercury/lrl_perihelion_direction_comparison.png`,
                    },
                    // {
                    //     itemType: "Theory (pre-print)",
                    //     label: "A Curvature Response Model for Weak-Field Gravity",
                    //     to: "/preprint/a-curvature-response-model-for-weak-field-gravity",
                    //     date: "28th March 2026",
                    //     image: `${CDN}k-framework.jpg`,
                    // },
                    {
                        itemType: "Analysis (pre-print)",
                        label:
                            "Empirical Tests of the κ-Framework using SPARC Dataset",
                        to: "/analysis/sparc-galaxy-rotation-curves",
                        date: "9th March 2026",
                        image: `${CDN}solar-system-analysis.jpg`,
                    },
                    {
                        itemType: "Simulation",
                        label: "Toy Galaxy - k-Framework comparison with Newtonian physics",
                        to: "/toy-galaxy",
                        date: "12th November 2025",
                        image: `${CDN}toy-galaxy-16-10.jpg`,
                    }]} />
            </div>


            <H2>Code and Reproducibility</H2>
            <P>
                The analysis pipeline used in this study is implemented in Python and all code used to generate the figures and statistical
                results presented in this work is available as open-source software:
            </P>
            <Ul classNames="mb-4">
                <Li>Repo: <Link
                    to="https://github.com/hasjack/OnGravity"
                    target="_blank"
                    className="block w-full break-all underline text-sm lg:text-md"
                >github.com/hasjack/OnGravity
                </Link></Li>
                <Li>Solar System Analysis<Link
                    to="https://github.com/hasjack/OnGravity/tree/main/python/solar-system"
                    target="_blank"
                    className="block w-full break-all underline text-sm lg:text-md"
                >github.com/hasjack/OnGravity/tree/main/python/solar-system
                </Link></Li>
                <Li>SPARC Analysis<Link
                    to="https://github.com/hasjack/OnGravity/tree/main/python/rotation-curves"
                    target="_blank"
                    className="block w-full break-all underline text-sm lg:text-md"
                >github.com/hasjack/OnGravity/tree/main/python/rotation-curves
                </Link></Li>
            </Ul>
            <P classNames="mb-24">
                In line with open-science principles, this repository includes the full analysis pipeline, data ingestion routines, model fitting procedures,
                and scripts used to generate the figures presented in this paper.
            </P>
            <License />
        </Article>
    )
}