import { BlockMath, InlineMath } from 'react-katex'
import { Link } from 'react-router'
import P from '../components/P'
import BulletCluster from '../components/widgets/BulletCluster'
import GalacticRotation from '../components/widgets/GalacticRotation'
import LensingTable from '../components/widgets/Lensing'
import LocalGroup from '../components/widgets/LocalGroup'
import MercuryPrecession from '../components/widgets/MercuryPrecession'
import PioneerAnomaly from '../components/widgets/PioneerAnomaly'
import QuantumScaleSlider from '../components/widgets/QuantumScaleSlider'
import SuperclusterFlow from '../components/widgets/SuperclusterFlow'

const { VITE_APP_CDN_URL } = import.meta.env

const BackgroundImage = ({ image }: { image: string }) => {
    return (
        <>
            <div className="absolute inset-0">
                <img
                    src={image}
                    alt=""
                    className="w-full h-full object-cover"
                />
            </div>
            {/* opacity mask */}
            <div className="absolute inset-0 bg-black/80"></div>
        </>
    )
}

export const Theory = () => {
    return (
        <>
            <section className="relative flex flex-col items-center bg-white box-border">
                <div className="relative max-w-5xl snap-start flex flex-col items-center py-12 md:py-24 text-gray-800">
                    <h2 className="text-xl md:text-3xl px-4 mb-8">Abstract</h2>
                    <P>
                        Observations of galaxy rotation curves, cluster dynamics, and gravitational collapse reveal systematic deviations
                        from predictions based on a strictly Newtonian inverse-square gravitational response when only baryonic matter is
                        considered. These discrepancies are conventionally addressed by introducing non-baryonic dark matter components.
                    </P>
                    <P>
                        This work explores an alternative interpretation in which the weak-field gravitational response of spacetime depends
                        on the local baryonic environment. Starting from a modified gravitational action, an environment-weighted generalisation
                        of the Poisson equation is derived in which the effective curvature response is described by a scalar coefficient μ(r).
                        In the weak-field limit, this leads to an exponential form for the gravitational potential, with an associated
                        curvature-response parameter κ(r) that emerges naturally from the field formulation.
                    </P>
                    <P>
                        A phenomenological parameterisation of κ in terms of baryonic density and velocity shear is introduced and tested against
                        the SPARC galaxy rotation curve dataset. The resulting model reproduces the observed sublinear acceleration relation without
                        requiring additional matter components. The same parameter set yields consistent behaviour across a wide range of scales,
                        including galaxy clusters and gravitational collapse regimes.
                    </P>
                    <P>
                        These results suggest that part of the observed discrepancy between baryonic mass and gravitational dynamics may arise from
                        an environment-dependent extension of curvature, rather than from unseen mass components, providing a unified geometric
                        framework for gravitational behaviour across astrophysical systems.
                    </P>
                </div>
            </section>
            <section className="relative flex flex-col items-center bg-gray-200 box-border">
                <div className="relative max-w-5xl snap-start flex flex-col items-center py-12 md:py-24 text-gray-800">
                    <h2 className="text-xl md:text-3xl px-4 mb-8">Environment-Weighted Poisson Response</h2>
                    <P noMB>
                        The gravitational potential in the weak-field limit is conventionally described by the Newtonian
                        Poisson equation
                    </P>
                    <div className="text-xl md:text-3xl">
                        <BlockMath math={String.raw`
                            \nabla^2 \Phi = 4\pi G \rho,
                        `} />
                    </div>
                    <P>
                        which assumes that the gravitational response of spacetime is linear and universal.
                        In this formulation the curvature of the potential depends only on the local mass
                        density and the gravitational coupling constant G, which is taken to be fixed.
                    </P>
                    <P>
                        In realistic astrophysical systems, however, matter is embedded within highly structured
                        environments. Stars within galactic disks experience gravitational fields shaped not only
                        by the central mass distribution but also by surrounding baryonic structure, velocity gradients,
                        and large-scale density variations. These environmental properties can influence how curvature
                        propagates through spacetime.
                    </P>
                    <P noMB>
                        To capture this possibility while preserving the standard weak-field structure, the Poisson
                        equation can be generalized by introducing an environmental response coefficient <InlineMath math={String.raw`\mu`} />:
                    </P>
                    <div className="text-xl md:text-3xl">
                        <BlockMath math={String.raw`
                            \nabla \cdot (\mu \nabla \Phi) = 4\pi G \rho.
                        `} />
                    </div>
                    <P>
                        Here <InlineMath math={String.raw`\mu`} /> represents the effective gravitational response of spacetime
                        within a given baryonic environment. The Newtonian limit is recovered when <InlineMath math={String.raw`\mu`} /> = 1.
                    </P>
                    <P noMB>
                        Writing the gravitational acceleration as
                    </P>
                    <div className="text-xl md:text-3xl">
                        <BlockMath math={String.raw`
                            \mathbf g = -\nabla \Phi,
                        `} />
                    </div>
                    <P noMB>
                        the field equation becomes
                    </P>
                    <div className="text-xl md:text-3xl">
                        <BlockMath math={String.raw`
                            \nabla \cdot (\mu \mathbf g) = -4\pi G \rho.
                        `} />
                    </div>
                    <P noMB>
                        For a spherically symmetric configuration outside the main baryonic mass distribution, where the enclosed mass M(r) varies slowly, integration yields
                    </P>
                    <div className="text-xl md:text-3xl">
                        <BlockMath math={String.raw`
                            r^2 \mu(r) g(r) = G M(r).
                        `} />
                    </div>
                    <P noMB>
                        The effective gravitational acceleration is therefore
                    </P>
                    <div className="text-xl md:text-3xl">
                        <BlockMath math={String.raw`
                            g(r) = \frac{G M(r)}{r^2 \mu(r)}.
                        `} />
                    </div>
                    <P>
                        This expression shows that deviations from Newtonian behaviour can arise if the response coefficient varies with the surrounding baryonic environment.
                    </P>
                    <P noMB>
                        The <InlineMath math={String.raw`\kappa`} />-framework expresses this response through an exponential curvature factor,
                    </P>
                    <div className="text-xl md:text-3xl">
                        <BlockMath math={String.raw`
                            g(r) = g_N(r), e^{\kappa(r) r},
                        `} />
                    </div>
                    <P noMB>
                        where
                    </P>
                    <div className="text-xl md:text-3xl">
                        <BlockMath math={String.raw`
                            g_N(r) = \frac{G M(r)}{r^2}
                        `} />
                    </div>
                    <P noMB>
                        is the Newtonian acceleration. Equating the two forms gives
                    </P>
                    <div className="text-xl md:text-3xl">
                        <BlockMath math={String.raw`
                            \mu(r) = e^{-\kappa(r) r},
                        `} />
                    </div>
                    <P noMB>
                        which implies
                    </P>
                    <div className="text-xl md:text-3xl">
                        <BlockMath math={String.raw`
                            \kappa(r) = -\frac{1}{r} \ln \mu(r).
                        `} />
                    </div>
                    <P>
                        The quantity therefore represents the local logarithmic response rate of the environment-weighted
                        gravitational field. This formulation preserves the Newtonian limit and conservation of gravitational
                        flux while allowing the effective gravitational response to vary with environmental structure.
                        The modified field equation therefore defines how curvature responds to the surrounding baryonic
                        environment.
                    </P>
                </div>
            </section>
            <section className="relative min-h-dvh snap-start flex flex-col items-center justify-center text-gray-800 bg-white box-border">
                <BackgroundImage image={`${VITE_APP_CDN_URL}Isaac_Roberts-Nebula_31m.jpg`} />
                <div className="relative max-w-5xl min-h-dvh snap-start flex flex-col items-center justify-center py-12 md:py-24 text-gray-200">
                    {/* <img src={`${VITE_APP_CDN_URL}kittens_mattress.svg`} className="mb-12" />
                <P>
                    Matter bends the space around it — but how much it bends depends on how that matter is distributed.
                    Consider a kitten on a mattress. It will make no visible indentation on the mattress.
                    Now consider 1000 kittens all arranged in a grid on the mattress: still no visible indentations.
                    Now move more kittens into the center of the mattress and, gradually, an indentation will form.
                    Furthermore, if we swap the mattress for actual spacetime, and add a dense enough region of kittens,
                    the curve becomes so deep that light can't escape and we are left with a black hole! (And kitten spaghetti...)
                </P> */}

                    <h2 className="text-xl md:text-3xl px-4 mb-8">Vera Rubin stars</h2>
                    <P>
                        When astronomers calculated how fast stars should orbit in a galaxy, they used the standard intuition
                        that stars near the center should orbit fast, and stars farther out should orbit much slower, because
                        they are farther from most of the galaxy's central mass. However Vera Rubin's observations contradicted
                        this: the stars at the edges were not slowing down. They were moving just as fast as the stars near the
                        center. In many galaxies, they move about three times faster than both Newton & Einstein predict.
                    </P>
                    <P>
                        Since κ adjusts gravity based on how matter is distributed, we can apply it directly to a real galaxy to
                        see whether it reproduces the observed rotation speed:
                    </P>
                    <div className="text-md md:text-lg">
                        <BlockMath math={String.raw`
                        \textbf{Andromeda (M31) observed:}\approx\;250\ \text{km s}^{-1}
                    `} />
                    </div>
                    <div className="text-md md:text-lg">
                        <BlockMath math={String.raw`
                        \textbf{Newton predicts:}\qquad v_N=\sqrt{\frac{GM}{r}}
                    `} />
                    </div>
                    <div className="text-xs md:text-sm lg:text-md w-full px-4 text-center">
                        v_N ≈ sqrt(6.674e-11 * 2.0e41 / 8.0e20) ≈ 1.29e5 m/s ≈ 129 km/s 🛑
                    </div>
                    <div className="text-md md:text-lg">
                        <BlockMath math={String.raw`
                        \textbf{Curvature response (}\kappa\textbf{):}\qquad v_\kappa=v_N\,e^{\kappa r/2}
                    `} />
                    </div>
                    <div className="text-xs md:text-sm lg:text-md w-full px-4 text-center">
                        v_κ = v_N * e^(κr/2) with κ ≈ 1.65e-21 → v_κ ≈ 129 km/s * e^((1.65e-21 * 8.0e20)/2) ≈ 250 km/s ✅
                    </div>
                </div>
            </section>
            <section className="hidden md:flex relative min-h-dvh snap-start flex-col items-center justify-center bg-white box-border">
                <div className="relative max-w-5xl min-h-dvh snap-start flex flex-col items-center justify-center py-12 md:py-24 text-gray-800">
                    <P>To compare theory with rotation data, κ is derived directly from observations by taking the Newtonian speed from "baryonic" mass, compare to the observed speed, and solve for κ.</P>
                    <GalacticRotation />
                </div>
            </section>
            <section className="relative flex flex-col items-center bg-gray-200 box-border">
                <div className="relative max-w-5xl snap-start flex flex-col items-center py-12 md:py-24 text-gray-800">
                    <h2 className="text-xl md:text-3xl px-4 mb-8">Gravitational Lensing</h2>
                    <P>The next question is whether this same curvature term applies to light as well as mass. Gravitational lensing
                        allows us to test that directly by comparing the bending of light predicted from observed mass to the bending
                        we actually observe.
                    </P>
                    <P>
                        In galaxy rotation, orbital velocity depends on the square root of the gravitational potential. This means the
                        κ effect shows up as a factor of exp(κ·r / 2). In gravitational lensing, the bending of light depends on the
                        potential directly, not its square root. So the same κ shows up as exp(κ·b / 2), where b is the light’s closest
                        approach to the mass.
                    </P>
                    <div className="text-xl md:text-3xl mb-8">
                        <BlockMath math={String.raw`
                            \alpha_{\text{eff}}(b)
                            =
                            \left(\frac{4 G M}{c^{2} b}\right)
                            \mathrm{e}^{\kappa b / 2}
                        `} />
                    </div>
                    {/* <img src={`${VITE_APP_CDN_URL}lensing.svg`} alt={'Same k - different observables'} /> */}
                    <div className="hidden md:block">
                        <LensingTable />
                    </div>
                </div>
            </section>
            <section className="relative min-h-dvh snap-start flex flex-col items-center justify-center bg-white box-border">
                <BackgroundImage image={`${VITE_APP_CDN_URL}The_Bullet_Cluster.jpg`} />
                <div className="relative max-w-5xl min-h-dvh snap-start flex flex-col items-center justify-center py-12 md:py-24 text-gray-200">
                    <h2 className="text-xl md:text-3xl px-4 mb-8">Collisions</h2>
                    <P noMB>
                        During high-velocity cluster collisions, gas clouds experience shock compression and strong velocity shear, raising
                        κ temporarily:
                    </P>
                    <div className="text-2xl md:text-3xl xl:text-4xl">
                        <BlockMath math={String.raw`
                            \kappa = \kappa_{\text{base}}+\kappa_{\text{coll}}
                        `} />
                    </div>
                    <P noMB style={{ textAlign: 'center' }}>where</P>
                    <div className="text-2xl md:text-3xl xl:text-4xl">
                        <BlockMath math={String.raw`
                            \kappa_{\text{coll}} = k_v\!\left(\frac{\nabla v_{\text{rel}}}{10^{-12}\ \mathrm{s}^{-1}}\right)^{\!3} \left(\frac{\rho}{\rho_0}\right)^{\!1/2}`
                        } />
                    </div>
                    <div className="text-md md:text-xl xl:text-2xl">
                        <BlockMath math={String.raw`
                            \quad k_v \approx 5\times 10^{-26}\ \mathrm{m}^{-1},\ \ \rho_0=1600\ \mathrm{kg\,m^{-3}}`
                        } />
                    </div>
                    <P>Gravitational lensing depends on the gravitational potential and increased κ multiplies the bending angle. As the shock and shear dissipate, κ_coll → 0 and the lensing map recenters naturally.</P>
                    <P>The lensing region shifts — appearing heavier — but extra ("dark") mass can be described as <b>extra weight</b>.</P>
                    <img src={`${VITE_APP_CDN_URL}cluster-collision.svg`} />
                </div>
            </section>
            <section className="relative snap-start flex flex-col items-center bg-gray-200 box-border">
                <div className="relative max-w-5xl flex flex-col items-center py-12 md:py-24 text-gray-800">
                    <h2 className="text-xl md:text-3xl px-4 mb-8">Bullet Cluster — Collision Shift</h2>
                    <div className="mb-18 px-4">
                        <BulletCluster />
                    </div>
                    <P>
                        As the clusters pass through each other, the regions of strongest curvature shift — not because new mass appears,
                        but because the collision briefly increases the weight of space itself.
                    </P>
                </div>
            </section>
            <section className="relative flex flex-col items-center bg-white box-border">
                <div className="relative max-w-5xl snap-start flex flex-col items-center py-12 md:py-24 text-gray-800">
                    <h2 className="text-xl md:text-3xl px-4 mb-8">Local Group — Basin Map</h2>
                    <P>
                        This map shows the gravitational potential of the Local Group as a continuous basin, where the Milky Way and Andromeda
                        already share a merged gravity well explaining their future merger.
                    </P>
                    <div className="text-xs sm:text-sm md:text-xl xl:text-2xl">
                        <BlockMath math={String.raw`
                            \Phi(x,y)\;=\;-\sum_{i}\;\frac{G\,M_i}{d_i}\,\mathrm{e}^{\kappa\,d_i},
                            \qquad
                            d_i=\sqrt{(x-x_i)^2+(y-y_i)^2}\,
                        `} />
                    </div>
                    <div className="mb-18 px-4">
                        <LocalGroup />
                    </div>
                </div>
            </section>
            <section className="relative min-h-dvh snap-start flex flex-col items-center justify-center bg-white box-border">
                <BackgroundImage image={`${VITE_APP_CDN_URL}The_Bullet_Cluster.jpg`} />
                <div className="relative max-w-5xl min-h-dvh snap-start flex flex-col items-center justify-center py-12 md:py-24 text-gray-200">
                    <h2 className="text-xl md:text-3xl px-4 mb-8">Supercluster Flow (2D)</h2>
                    <P noMB>
                        The same gravitational potential equation can be applied to the large-scale mass distribution of our cosmic
                        neighbourhood, yielding the shared basin of attraction that channels galaxies toward Virgo and the Laniakea core.
                    </P>
                    <div className="text-xs sm:text-sm md:text-xl xl:text-2xl">
                        <BlockMath math={String.raw`
                            \Phi(x,y)\;=\;-\sum_{i}\;\frac{G\,M_i}{d_i}\,\mathrm{e}^{\kappa\,d_i},
                            \qquad
                            d_i=\sqrt{(x-x_i)^2+(y-y_i)^2}\,
                        `} />
                    </div>
                    <div className="mb-24 px-4">
                        <SuperclusterFlow />
                    </div>
                    <P>
                        The flow arrows show the direction of gravitational infall (−∇Φ), illustrating how the Local Group is not
                        isolated but part of a broader cosmic "supercluster" river system.
                    </P>

                </div>
            </section>
            <section className="relative snap-start flex flex-col items-center bg-white box-border">
                <div className="relative max-w-5xl flex flex-col items-center py-12 md:py-24 text-gray-800">
                    <h2 className="text-xl md:text-3xl px-4 mb-8 mt-12">Effective acceleration term in the Friedmann equation</h2>
                    <P noMB>
                        The same <i>κ</i> term used in galaxy rotation, lensing, and basin maps also enters the large-scale 
                        gravitational potential. When averaged over cosmological distances—dominated by voids rather than 
                        dense structures, it produces a small net positive contribution to the integrated potential: <b>an emergent 
                        large-scale acceleration</b>
                    </P>

                    <div className="text-md md:text-xl xl:text-2xl">
                        <BlockMath math={String.raw`
                            \Phi(r) \;=\; -\frac{GM}{r}\,e^{\kappa r}
                        `} />
                    </div>

                    <P noMB>
                        For large radii, expanding the exponential gives an effective acceleration
                    </P>

                    <div className="text-md md:text-xl xl:text-2xl">
                        <BlockMath math={String.raw`
                            a(r) \;=\; -\nabla\Phi
                            \;\approx\;
                            -\frac{GM}{r^2}\,\bigl(1 + \kappa r\bigr),
                        `} />
                    </div>

                    <P>
                        so that <i>κ</i> contributes a small outward term proportional to κ on
                        large scales. When this contribution is averaged over the cosmic web, it
                        acts in the same direction as a cosmological constant, but arises from
                        structure rather than vacuum energy.
                    </P>

                    <P noMB>
                        In a homogeneous background, the large-scale effect of κ can be summarised
                        as an additional acceleration term in the Friedmann equation:
                    </P>

                    <div className="text-md md:text-xl xl:text-2xl">
                        <BlockMath math={String.raw`
                            \frac{\ddot{a}}{a}
                            =
                            -\frac{4\pi G}{3}\,\rho_{\text{eff}}
                            \;+\;
                            \mathcal{A}_\kappa,
                        `} />
                    </div>

                    <P>
                        where 𝒜<sub>κ</sub> is an effective contribution generated by the
                        large-scale κ field. For a representative background value
                        κ₀ ≈ 2.6×10<sup>−26</sup> m<sup>−1</sup> (from supercluster flows),
                        the associated acceleration scale 𝒜<sub>κ</sub> is of the same order
                        of magnitude as the late-time acceleration usually attributed to Λ in ΛCDM.
                    </P>


                    <P>
                        In this view, the observed cosmic acceleration emerges from the cumulative
                        effect of structure-dependent curvature, not from a fundamental vacuum
                        energy term.
                    </P>

                </div>
            </section>
            <section className="relative snap-start flex flex-col items-center bg-black box-border">
                <div className="relative max-w-5xl flex flex-col items-center py-12 md:py-24 text-gray-200">
                    <h2 className="text-xl md:text-3xl px-4 mb-8">The Hubble Tension</h2>
                    <P>
                        The difference between early-universe and late-universe measurements of <i>H₀</i> can be viewed
                        through the same κ-lens as our supercluster flows.  Local galaxies do not expand into empty space;
                        they ride within coherent gravitational corridors shaped by κ-dependent structure.
                    </P>
                    <P noMB>
                        Within these overdense regions, the effective expansion rate is slightly enhanced:
                    </P>

                    <div className="text-md md:text-xl xl:text-2xl">
                        <BlockMath math={String.raw`
                            H_0^{(\kappa)} \;\simeq\;
                            H_0^{(\text{CMB})}
                            \left(1 + \beta\,\kappa\,r_{\text{local}}\right)
                        `} />
                    </div>

                    <P>
                        where β ≈ 1-2 parameterises how strongly local κ-dependent flows couple to the
                        global expansion. For a representative κ ≈ 8×10<sup>−4</sup> Mpc<sup>−1</sup>
                        (corresponding to κ₀ ≈ 2.6×10<sup>−26</sup> m<sup>−1</sup>) and
                        r<sub>local</sub> ≈ 100 Mpc with β ≈ 1.1:
                    </P>

                    <h3 className="text-lg md:text-2xl px-4 mb-8">
                        H₀<sup>(κ)</sup> ≈ 67 × (1 + 0.09) ≈ 73 km s⁻¹ Mpc⁻¹
                    </h3>

                    <P>
                        This illustrates that the same κ-driven structural acceleration that shapes basin
                        and supercluster flows can naturally generate a 5-10% enhancement in the locally
                        inferred H₀, comparable to the Planck-SH₀ES tension.
                    </P>
                </div>
            </section>
            <section className="relative min-h-dvh snap-start flex flex-col items-center justify-center bg-white box-border">
                <BackgroundImage image={`${VITE_APP_CDN_URL}CMB.jpg`} />
                <div className="relative max-w-5xl min-h-dvh snap-start flex flex-col items-center justify-center py-12 md:py-24 text-gray-200">
                    <P noMB>Using the same gravitational potential, the acoustic angular scale of the CMB is:</P>

                    <div className="text-md md:text-xl xl:text-2xl">
                        <BlockMath math={String.raw`
                            \theta_\star=\frac{r_s(z_\star)}{D_A(z_\star)},
                            \quad
                            \ell_\star \simeq \frac{\pi}{\theta_\star}.
                        `} />
                    </div>

                    <div className="text-xs md:text-sm lg:text-md w-full px-4 text-center mb-8">
                        θ_* ≈ 144.6 Mpc / 13.9 Gpc ≈ 0.0104 rad ≈ 0.60° ℓ_* ≈ π / θ_* ≈ 301<br />
                        (the first acoustic peak appears at ℓ ≈ 220 due to phase shift).
                    </div>

                    <P noMB>
                        Because the intergalactic medium is extremely dilute, the density-weighted κ_eff along a
                        typical line of sight is very small, so D_A — and hence θ_* — remains almost unchanged.
                    </P>

                    <div className="text-xs sm:text-sm md:text-xl xl:text-2xl mb-2">
                        <BlockMath math={String.raw`
                            \kappa_{\text{eff}}
                            = \frac{1}{L}\int_0^L k_0\!\left(\frac{\rho(s)}{\rho_0}\right)^{a}\,ds,
                            \qquad
                            D_A^{(\kappa)} \approx D_A\,\exp\!\Big(\tfrac12\,\kappa_{\text{eff}}L\Big).
                        `} />
                    </div>

                    <div className="text-xs md:text-sm lg:text-md w-full px-4 text-center mb-8">
                        With a void-dominated line of sight:<br />κ_eff ≈ 3×10⁻²⁹ m⁻¹ and L ≈ 4.3×10²⁶ m → ½ κ_eff L ≈ 0.0065,<br />
                        so D_A^(κ) / D_A ≈ exp(0.0065) ≈ **1.0065** (≈ +0.65%).
                    </div>

                    <P noMB>
                        Thus, the CMB acoustic scale remains intact, while κ contributes only a small, smooth, %-level correction to lensing.
                    </P>

                    <div className="text-md md:text-xl xl:text-2xl">
                        <BlockMath math={String.raw`\alpha_\kappa(b)=\alpha_{\rm GR}(b)\,e^{\kappa b/2}`} />
                    </div>

                    <P>
                        Where sightlines intersect superclusters, this same factor enhances deflection slightly (typically 1-3%), consistent
                        with the observed mild smoothing of the acoustic peaks.
                    </P>

                </div>
            </section>

            <section className="relative min-h-dvh snap-start flex flex-col items-center justify-center bg-white box-border">
                <BackgroundImage image={`https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Black_hole_-_Messier_87.jpg/1200px-Black_hole_-_Messier_87.jpg`} />
                <div className="relative max-w-5xl min-h-dvh snap-start flex flex-col items-center justify-center py-12 md:py-24 text-gray-200">
                    <h2 className="text-xl md:text-3xl px-4 mb-8">Supermassive Black Holes</h2>
                    <P>
                        In dense, early-universe clouds, κ grows to 10⁻¹⁷ m⁻¹ — making gravity 16% stronger.
                        Collapse accelerates. Accretion explodes. A 10⁹ M⊙ black hole forms in under 10 million years.
                    </P>
                    <div className="text-xs sm:text-sm md:text-xl xl:text-2xl mb-8">
                        <BlockMath math={String.raw`
                            \kappa \sim 5 \times 10^{-17}\ \text{m}^{-1},\quad
                            e^{\kappa r} \sim 1.16,\quad
                            t_{\text{collapse}} \sim 0.93 \, t_{\text{ff}}
                        `} />
                    </div>
                    <img
                        src={`${VITE_APP_CDN_URL}smbh_growth.png`}
                        alt={'Super massive black hole growth'}
                        className="mb-12 px-12"
                    />
                    <h3 className="text-lg md:text-xl px-4 mb-8">SMBH Growth with Unified Model vs. JWST Observations</h3>
                    <P>
                        Linear growth (M ̇ = 0.105 M⊙/yr) over 0-5 Gyr, capped at 2 billion M⊙, with Eddington limit (M ̇Edd ≈ 0.02 M⊙/yr)
                        and dots for high-z SMBHs (z=6,7,10,15), supporting rapid formation.
                    </P>
                </div>
            </section>
            <section className="relative snap-start flex flex-col items-center box-border">
                <div className="relative max-w-5xl flex flex-col items-center py-12 md:py-24 text-gray-800">
                    <h2 className="text-xl md:text-3xl px-4 mb-8">Gravitational Waves</h2>
                    <P noMB>
                        Gravitational waves are one of our sharpest tests of gravity. In the κ-r geometry, present-day
                        signals from neutron star and black hole mergers are indistinguishable from GR, while the same
                        curvature response predicts enhanced primordial waves in the very early universe.
                    </P>

                    <div className="text-md md:text-xl xl:text-2xl mb-4">
                        <BlockMath math={'\\Phi_{\\text{eff}}(r) = -\\dfrac{GM}{r}\\,e^{\\kappa(r)\\,r}'} />
                        <BlockMath math={'h_{\\text{eff}} \\;\\propto\\; h_{\\text{GR}}\\,e^{\\kappa(r)\\,r}'} />
                        <BlockMath math={'\\text{For } \\kappa r \\ll 1:\\quad e^{\\kappa r} \\simeq 1 + \\kappa r \\;\\Rightarrow\\; h_{\\text{eff}} \\simeq h_{\\text{GR}}'} />
                    </div>
                    <h3 className="text-lg md:text-xl px-4 mb-6 w-full font-bold text-center">Local mergers: GR recovered</h3>
                    <P noMB>
                        Neutron-star and black-hole binaries live in regions where <b>κ r ≪ 1</b>, so the exponential factor is essentially unity.
                        Phase evolution, chirp mass and waveform shape reduce to standard GR:
                    </P>
                    <div className="text-sm md:text-md xl:text-xl">
                        <BlockMath
                            math={
                                'g_{\\mu\\nu}^{(\\kappa)} \\simeq g_{\\mu\\nu}^{\\rm GR} \\quad (\\text{Solar System / stellar densities})'
                            }
                        />
                    </div>
                    <P>
                        For GW170817-like systems, the κ-r model reproduces a strain of <b>h ~ 4x10⁻²¹</b>, matching LIGO/Virgo observations.
                    </P>
                    <h3 className="text-lg md:text-xl px-4 mb-6 w-full font-bold text-center">Early universe: enhanced primordial waves</h3>
                    <P noMB>
                        In the very early universe, densities and velocity gradients drive <b>κ(r)</b> to much larger values, 
                        so <b>κ r ≳ 1</b>. The same factor that is negligible today becomes important:
                    </P>
                    <div className="text-md md:text-xl xl:text-2xl">
                        <BlockMath
                            math={
                                'h_{\\text{prim}} \\;\\propto\\; h_{\\text{GR,prim}}\\,e^{\\kappa_{\\text{early}} r}'
                            }
                        />
                    </div>
                    <P>
                        This predicts a modest enhancement of the primordial gravitational-wave background and
                        associated CMB B-modes, providing a clean target for future missions.
                    </P>

                    <P>
                        Today&apos;s detectors therefore see <b>GR-exact waveforms</b>, while the earliest gravitational waves
                        are subtly reshaped by κ(r). The κ-r model passes current tests and makes falsifiable
                        predictions for primordial signals.
                    </P>
                </div>
            </section>
            <section className="relative min-h-dvh snap-start flex flex-col items-center justify-center box-border">
                <BackgroundImage image={`https://cdn.mos.cms.futurecdn.net/v2/t:0,l:612,cw:1575,ch:1575,q:80,w:1575/v5n22xGyNNHLzSnSArbrVH.jpg`} />
                <div className="relative max-w-5xl min-h-dvh snap-start flex flex-col items-center justify-center py-12 md:py-24 text-gray-200">
                    <h2 className="text-xl md:text-3xl px-4 mb-8">Post-Newtonian Limit: GR Locally, κ₀ as a Small Correction</h2>
                    <P noMB>
                        On Solar-System scales, any modification of gravity must reduce to the standard post-Newtonian form tested by 
                        planetary orbits and light deflection. In the κ-framework this can be achieved by treating the κ-response as a 
                        very small correction to the time-time component of the metric.
                    </P>
                    <div className="text-xs sm:text-sm md:text-xl xl:text-2xl mb-4">
                        {/* Simple ansatz for g_tt */}
                        <BlockMath math={
                            'g_{tt} \;=\; -e^{\\kappa(r)\\,r},\\quad ' +
                            '\\kappa(r) \\approx \\kappa_{0} - \\dfrac{2GM}{c^{2}r^{2}} + \\cdots,\\quad ' +
                            'U = \\dfrac{GM}{c^{2}r}'
                        } />

                        {/* Effective 1PN metric (schematic) */}
                        <BlockMath math={
                            'ds^{2} \\simeq -\\Big(1 - 2U + \\kappa_{0} r\\Big)c^{2}dt^{2}' +
                            ' \\; + \\; \\Big(1 + 2U\\Big)\\,(dr^{2}+r^{2}d\\Omega^{2})' +
                            ' \\; + \\; \\mathcal{O}(c^{-4})'
                        } />

                        <BlockMath math={
                            '\\gamma \\simeq 1,\\quad \\beta \\simeq 1,\\quad ' +
                            '\\kappa_{0} r_{\\text{Solar}} \\ll 1'
                        } />

                        <BlockMath math={String.raw`
                            \kappa_{0} \approx 2.6 \times 10^{-26}\ \text{m}^{-1}
                        `} />
                    </div>

                    <P>
                        With κ₀ at this level, the extra κ₀ r term in g<sub>tt</sub> is completely negligible
                        on Solar-System scales, so the standard post-Newtonian parameters remain
                        indistinguishable from their GR values within current bounds, while still
                        allowing a small cumulative effect from κ₀ on cosmological scales.
                    </P>
                </div>
            </section>
            <section className="relative min-h-dvh snap-start flex flex-col items-center justify-center box-border">
                <BackgroundImage image={`https://c.tadst.com/gfx/1200x675/mercury.jpg?1`} />
                <div className="relative max-w-5xl min-h-dvh snap-start flex flex-col items-center justify-center py-12 md:py-24 text-gray-200">
                    <h2 className="text-xl md:text-3xl px-4 mb-8">Mercury Precession</h2>
                    <P>
                        19th-century astronomers measured a tiny extra twist in Mercury's orbit that Newtonian gravity 
                        couldn't explain. General Relativity predicted an excess of about <b>43 arcseconds per century</b>. The 
                        κ-r geometry matches the same result locally (with <b>no extra parameters</b>), and any cosmological 
                        bias from κ<sub>0</sub> is far below detectability.
                    </P>
                    <div className="mb-12 px-4">
                        <MercuryPrecession />
                    </div>
                    <P>
                        Observed excess (over Newtonian/perturbative precession): <b>≈ 43.0″/century</b>.
                        With κ<sub>0</sub>=0 this panel reproduces the GR value. For κ<sub>0</sub>≈2.6×10⁻²⁶ m⁻¹,
                        the additional shift is ~10⁻⁴″/century — below current detectability.
                    </P>
                </div>
            </section>
            <section className="relative min-h-dvh snap-start flex flex-col items-center justify-center box-border">
                <BackgroundImage image={`${VITE_APP_CDN_URL}pioneer.jpg`} />
                <div className="relative max-w-5xl min-h-dvh snap-start flex flex-col items-center justify-center py-12 md:py-24 text-gray-200">
                    <h2 className="text-xl md:text-3xl px-4 mb-8">The Pioneer Anomaly and the κ-Field</h2>
                    <P noMB>
                        In the late 20th century, the Pioneer 10 and 11 spacecraft became the first
                        human-made objects to leave the inner Solar System on long, clean,
                        force-free trajectories.  Their radio-tracking precision was unmatched:
                        Doppler residuals were measured to parts in 10<sup>11</sup>, far beyond what
                        modern missions typically achieve. As the spacecraft passed beyond 10 AU, a persistent sunward acceleration
                        appeared in the data:
                    </P>
                    <div className="text-md md:text-xl xl:text-2xl">
                        <BlockMath
                            math={String.raw`
                            a_{\rm P} \approx 8.74 \times 10^{-10} \ {\rm m/s^2}.
                        `} />
                    </div>

                    <P>
                        Conventional analyses attribute this to thermal recoil from the RTGs.
                        While plausible, this explanation requires fine-tuned directional
                        emission and a nearly constant power asymmetry over decades.  The anomaly
                        remains unusually stable in magnitude despite the exponential decay of
                        the plutonium heat source.
                    </P>
                    <img src={`${VITE_APP_CDN_URL}pioneer-comm.webp`} className="h-64 md:h-86 mt-12" />
                </div>
            </section>
            <section className="relative min-h-dvh snap-start flex flex-col items-center justify-center box-border">
                <BackgroundImage image={`${VITE_APP_CDN_URL}pioneer-trajectory.webp`} />
                <div className="relative max-w-5xl min-h-dvh snap-start flex flex-col items-center justify-center py-12 md:py-24 text-gray-200">
                    <P noMB>
                        The magnitude of the anomaly aligns naturally with the expected background curvature scale:
                    </P>

                    <div className="text-md md:text-xl xl:text-2xl">
                        <BlockMath
                            math={String.raw`
                            a_{\kappa} = \kappa_0 \, c^2
                            \quad\Longrightarrow\quad
                            \kappa_0 \sim 10^{-26}\ {\rm m^{-1}}
                        `}
                        />
                    </div>

                    <P>This value is the same curvature amplitude that appears in galaxy rotation curves and weak-lensing
                        fits across the κ-model. The Pioneer trajectory, extending from 1 AU to over 70 AU with minimal
                        maneuvers, becomes a unique map of the Solar System’s κ-field.
                    </P>

                    <div className="px-12 mb-12">
                        <PioneerAnomaly />
                    </div>

                    <P>
                        κ₀ r × 10¹³ shows the tiny but cumulative lever arm of a background κ field across
                        20-70 AU. Even at the edge of the Pioneer range, κ₀ r ≪ 1, consistent with only a
                        very small modification to Newtonian gravity in the outer Solar System.
                    </P>

                </div>
            </section>
            <section className="relative flex flex-col items-center bg-gray-200 box-border">
                <div className="relative max-w-5xl snap-start flex flex-col items-center py-12 md:py-24 text-gray-800">
                    <h2 className="text-xl md:text-3xl px-4 mb-8">Mass-Energy Equivalence in κ-Modified Gravity</h2>
                    <P noMB>
                        The rest-energy relation <b>E = mc²</b> remains unchanged in the κ-model.
                        Mass retains its inertial role. What changes is how energy couples to curvature.
                        The effective gravitational mass acquires a scale-dependent weight through the
                        factor <code>exp(κ·r)</code>.
                    </P>

                    <div className="text-md md:text-xl xl:text-2xl">
                        <BlockMath
                            math={String.raw`
                            m_{\text{grav}}(r) = m\,e^{\kappa r}
                        `} />
                    </div>

                    <P noMB>
                        This introduces a distinction between inertial mass and gravitational mass
                        without altering local special relativistic physics. At small radii,
                        the exponential term approaches unity.
                    </P>

                    <div className="text-md md:text-xl xl:text-2xl">
                        <BlockMath
                            math={String.raw`
                            \lim_{r \to 0} m_{\text{grav}} = m,\qquad
                            \lim_{r \to 0} E_{\kappa} = mc^{2}
                        `} />
                    </div>

                    <P>
                        At galactic and cluster scales, the κ-term enhances gravitational
                        interactions by weighting energy according to local density and shear.
                        At quantum scales, the weighting disappears, and the conventional
                        mass-energy equivalence governs the dynamics.
                    </P>

                    <P>
                        <i>See Appendix A.6: “Mass-Energy Equivalence Under κ(r)”</i>
                    </P>
                </div>
            </section>
            <section className="relative flex flex-col items-center bg-white box-border">
                <div className="relative max-w-5xl snap-start flex flex-col items-center py-12 md:py-24 text-gray-800">
                    <h2 className="text-xl md:text-3xl px-4 mb-8">Descent: The Quantum Limit</h2>
                    <P noMB>
                        If κ encodes <i>structure</i> at every scale, where does that structure end? What happens
                        when <b>r → ℓ_P</b> — the quantum domain where <b>mass</b> and <b>weight</b> separate?
                    </P>

                    <div className="text-md md:text-xl xl:text-2xl">
                        <BlockMath math={String.raw`
                            \Phi(r) = -\frac{GM}{r}\,e^{\kappa r},
                            \quad
                            \lim_{r \to \ell_P} \Phi(r) = -\frac{GM}{r}
                        `} />
                    </div>

                    <P>
                        At Planck scales, <b>κ loses leverage</b>. Curvature decouples from structure. The exponential
                        vanishes, restoring the unweighted Newtonian (and GR) potential.
                    </P>

                    <div className="text-md md:text-xl xl:text-2xl">
                        <BlockMath math={String.raw`
                            E_\kappa = m c^2\,e^{\kappa r}
                            \quad \rightarrow \quad
                            E_\kappa \to m c^2 \quad (\text{as } r \to 0)
                        `} />
                    </div>

                    <P>
                        Energy gain vanishes at small r — but <b>seeds the first structure</b> at larger scales.
                    </P>

                    <div className="mb-8 px-4">
                        <QuantumScaleSlider />
                    </div>

                    <P>
                        The transition defines a natural cutoff: below it, mass is inertial; above it,
                        it carries <b>geometric weight</b>. <i>See PDF §3.8: "Quantum Scale Indications"</i>
                    </P>

                </div>
            </section>
            <section className="relative flex flex-col items-center text-gray-800 bg-gray-200 py-12 md:py-24">
                <div className="relative max-w-5xl flex flex-col items-center">
                    <h2 className="text-base text-xl md:text-3xl text-center px-4 mb-12">Appendix: Key Derivations</h2>
                    <P>
                        This appendix outlines the main steps behind the κ-modified gravity equations used in the text.
                        Each derivation is shown in a compact, weak-field form suitable for galaxies, clusters, and
                        large-scale structure.
                    </P>

                    {/* 1. From f(R) to exponential potential */}
                    <details className="px-4 mb-4 text-base w-full">
                        <summary className="mb-4"><b>1. Exponential potential from modified curvature</b></summary>
                        <div>
                            <P>
                                The starting point is an exponential f(R) action:
                            </P>
                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                    S = \int \sqrt{-g}\,\big[ R\,e^{\alpha R} + 16\pi G\,\mathcal{L}_m \big]\, d^4x
                                `}
                                />
                            </div>
                            <P>
                                Varying this action with respect to the metric g<sub>μν</sub> gives the modified field equations:
                            </P>
                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                    f'(R) R_{\mu\nu}
                                    - \tfrac{1}{2} f(R) g_{\mu\nu}
                                    - \nabla_\mu \nabla_\nu f'(R)
                                    + g_{\mu\nu} \Box f'(R)
                                    = 8\pi G\,T_{\mu\nu},
                                `}
                                />
                            </div>
                            <P>
                                where f(R) = R e<sup>{String.raw`\alpha R`}</sup> and
                            </P>
                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                                f'(R) = \frac{d}{dR}\big( R e^{\alpha R} \big)
                                                = e^{\alpha R}\,(1 + \alpha R).
                                            `}
                                />
                            </div>
                            <P>
                                In the weak-field regime relevant for galaxies and clusters, the curvature is small and
                                |αR| ≪ 1. The exponential then admits the series expansion:
                            </P>
                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                                e^{\alpha R} \approx 1 + \alpha R.
                                            `}
                                />
                            </div>
                            <P>
                                To leading order, the corrections appear as small, R-dependent terms in the effective
                                Poisson equation. Solving the modified field equations for a static, spherically symmetric
                                mass M yields an effective potential that can be written in the form
                            </P>
                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                                \Phi_{\rm eff}(r)
                                                \simeq
                                                -\,\frac{GM}{r}\,e^{\kappa r},
                                            `}
                                />
                            </div>
                            <P>
                                where κ collects the weak-field imprint of the exponential curvature term and depends on the
                                local configuration of matter. The corresponding radial acceleration is
                            </P>
                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                                g_{\rm eff}(r)
                                                = -\frac{d\Phi_{\rm eff}}{dr}
                                                \simeq
                                                \frac{GM}{r^2}\,e^{\kappa r}.
                                            `}
                                />
                            </div>
                            <P>
                                This is the universal κ-modified law used throughout the main text.
                            </P>
                        </div>
                    </details>

                    {/* 2. Orbital velocity and solving for κ from data */}
                    <details className="px-4 mb-4 text-base w-full">
                        <summary className="mb-4"><b>2. Orbital velocity and κ from rotation curves</b></summary>
                        <div>
                            <P>
                                For a test mass on a circular orbit of radius r around mass M, the centripetal acceleration
                                is v² / r. Equating this to the κ-modified gravitational acceleration gives:
                            </P>
                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                                \frac{v_\kappa^2}{r}
                                                =
                                                \frac{GM}{r^2}\,e^{\kappa r}.
                                            `}
                                />
                            </div>
                            <P>
                                Solving for v<sub>κ</sub>:
                            </P>
                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                                v_\kappa(r)
                                                =
                                                \sqrt{\frac{GM}{r}}\,
                                                e^{\kappa r / 2}.
                                            `}
                                />
                            </div>
                            <P>
                                The Newtonian prediction from baryonic mass alone is
                            </P>
                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                                v_N(r) = \sqrt{\frac{GM}{r}}.
                                            `}
                                />
                            </div>
                            <P>
                                The ratio between the observed orbital speed v<sub>obs</sub>(r) and the Newtonian prediction
                                defines an empirical κ at radius r:
                            </P>
                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                                \frac{v_{\text{obs}}(r)}{v_N(r)}
                                                =
                                                e^{\kappa(r)\,r/2}.
                                            `}
                                />
                            </div>
                            <P>
                                Solving this relation for κ(r) gives:
                            </P>
                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                                \kappa(r)
                                                =
                                                \frac{2}{r}
                                                \ln\!\bigg(
                                                    \frac{v_{\text{obs}}(r)}{v_N(r)}
                                                \bigg).
                                            `}
                                />
                            </div>
                            <P>
                                This expression is used to derive κ(r) directly from rotation curve data, without assuming
                                any dark matter halo. The environmental model κ(r) in the main text is then fitted to these
                                inferred κ values.
                            </P>
                        </div>
                    </details>

                    {/* 3. Lensing angle with κ */}
                    <details className="px-4 mb-4 text-base w-full">
                        <summary className="mb-4"><b>3. Gravitational lensing with κ</b></summary>
                        <div>
                            <P>
                                In standard General Relativity, the deflection angle for a light ray passing a mass M with
                                impact parameter b is
                            </P>
                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                                \alpha_{\rm GR}(b)
                                                =
                                                \frac{4GM}{c^2 b}.
                                            `}
                                />
                            </div>
                            <P>
                                In the κ model, the same exponential correction that modifies the potential also modifies the
                                lensing deflection. In the weak-field limit, the effective deflection angle can be written as
                            </P>
                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                                \alpha_{\rm eff}(b)
                                                =
                                                \alpha_{\rm GR}(b)\,
                                                e^{\kappa b / 2}
                                                =
                                                \left(
                                                    \frac{4GM}{c^2 b}
                                                \right)
                                                e^{\kappa b / 2}.
                                            `}
                                />
                            </div>
                            <P>
                                For κb ≪ 1, this reduces to
                            </P>
                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                                \alpha_{\rm eff}(b)
                                                \approx
                                                \alpha_{\rm GR}(b)\,
                                                \big(1 + \tfrac{1}{2}\kappa b\big),
                                            `}
                                />
                            </div>
                            <P>
                                showing that κ introduces a small, scale-dependent enhancement to lensing without changing
                                the underlying baryonic mass.
                            </P>
                        </div>
                    </details>

                    {/* 4. Environmental κ(r) model */}
                    <details className="px-4 mb-4 text-base w-full">
                        <summary className="mb-4"><b>4. Environmental κ(r) from shear and density</b></summary>
                        <div>
                            <P>
                                The geometric origin suggests that κ should depend on local structure. A simple
                                observationally-motivated form used in the main text is
                            </P>
                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                                \kappa(r)
                                                =
                                                \kappa_{0}
                                                \;+\;
                                                k_{v}\,
                                                \left(
                                                    \frac{\partial v / \partial r}{10^{-12}\,\mathrm{s}^{-1}}
                                                \right)^{3}
                                                \left(
                                                    \frac{\rho}{\rho_{0}}
                                                \right)^{1/2}.
                                            `}
                                />
                            </div>
                            <P>
                                Here:
                            </P>
                            <code style={{ display: 'block', margin: '8px 0 16px', lineHeight: 1.8 }}>
                                <b>κ₀</b> — background curvature term<br />
                                <b>kᵥ</b> — shear-response coefficient<br />
                                <b>∂v/∂r</b> — local velocity gradient (shear)<br />
                                <b>ρ / ρ₀</b> — density relative to a fiducial scale
                            </code>
                            <P>
                                The cubic dependence on the velocity gradient emphasises regions with strong shear
                                (for example, spiral arms or shocked gas in cluster mergers), while the square-root
                                dependence on density captures the enhanced curvature in compressed structures
                                relative to diffuse environments.
                            </P>
                            <P>
                                When κ(r) defined this way is inserted back into the expressions for v<sub>κ</sub> and α<sub>eff</sub>,
                                the resulting predictions match observed rotation curves and lensing profiles across
                                a wide range of systems using only baryonic matter.
                            </P>
                        </div>
                    </details>

                    {/* 5. Effective Λ from large-scale κ (optional, if you want it) */}
                    <details className="px-4 mb-4 text-base w-full">
                        <summary className="mb-4"><b>5. Large-scale κ and an effective acceleration term</b></summary>
                        <div>
                            <P>
                                On very large scales, κ is dominated by the average properties of the cosmic web:
                                voids, filaments, walls, and superclusters. In this regime, κ can be approximated
                                by a slowly varying background value κ₀.
                            </P>
                            <P>
                                In a homogeneous background, the κ-modified gravitational response appears as an
                                additive term in the acceleration equation,
                            </P>
                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                                \frac{\ddot{a}}{a}
                                                =
                                                -\frac{4\pi G}{3}\,\rho_{\rm eff}
                                                \;+\;
                                                \mathcal{A}(\kappa_0),
                                            `}
                                />
                            </div>
                            <P>
                                where 𝔄(κ₀) is an effective acceleration term built from the large-scale κ field.
                                For suitable choices of κ₀ consistent with structure formation, this term can
                                mimic a small, positive late-time acceleration similar in magnitude to the
                                observed cosmological constant, without introducing a separate dark energy fluid.
                            </P>
                            <P>
                                The detailed identification of 𝔄(κ₀) with a specific Λ-like parameter depends on
                                the averaging scheme and lies beyond the weak-field derivations used for galaxies
                                and clusters, but the qualitative behaviour follows directly from the same
                                κ-dependent correction to the potential.
                            </P>
                        </div>
                    </details>
                    <details className="px-4 mb-4 text-base w-full">
                        <summary className="mb-4"><b>6. Quantum limit of κ</b></summary>
                        <div>
                            <P noMB>
                                From the κ-weighted potential used in the main text:
                            </P>

                            <div className="text-md md:text-xl xl:text-2xl">
                                <BlockMath
                                    math={String.raw`
                                                \Phi_{\kappa}(r)
                                                =
                                                -\frac{GM}{r}\,e^{\kappa(r)\,r}
                                            `}
                                />
                            </div>

                            <P>
                                Here <InlineMath math={String.raw`\kappa(r)`} /> encodes the response of gravity to large-scale structure
                                (background curvature, shear, and density). To understand the behaviour
                                near the quantum limit, we examine <InlineMath math={String.raw`r \to \ell_P`} />, where the
                                Planck length <InlineMath math={String.raw`\ell_P`} /> is the characteristic scale below which classical
                                structure is no longer resolved.
                            </P>

                            <h4 className="w-full text-md md:text-lg font-bold mb-6 px-4">6.1 Small r expansion of the exponential</h4>

                            <P noMB>
                                For any finite <InlineMath math={String.raw`\kappa(r)`} />, the exponential admits a Taylor expansion
                                around <InlineMath math={String.raw`r = 0`} />:
                            </P>

                            <div className="text-md md:text-xl xl:text-2xl">
                                <BlockMath
                                    math={String.raw`
                                    e^{\kappa(r)\,r}
                                    =
                                    1 + \kappa(r)\,r
                                    + \tfrac{1}{2}\,\kappa(r)^{2} r^{2}
                                    + \mathcal{O}(r^{3}).
                                `} />
                            </div>

                            <P noMB>
                                Substituting into <InlineMath math={String.raw`\Phi_{\kappa}(r)`} /> gives:
                            </P>

                            <div className="text-md md:text-xl xl:text-2xl">
                                <BlockMath
                                    math={String.raw`
                                    \Phi_{\kappa}(r)
                                    =
                                    -\frac{GM}{r}
                                    \Bigl[
                                        1 + \kappa(r)\,r
                                        + \tfrac{1}{2}\,\kappa(r)^{2} r^{2}
                                        + \mathcal{O}(r^{3})
                                    \Bigr]
                                `} />
                            </div>

                            <P noMB>
                                Expanding term by term:
                            </P>

                            <div className="text-md md:text-xl xl:text-2xl">
                                <BlockMath
                                    math={String.raw`
                                    \Phi_{\kappa}(r)
                                    =
                                    -\frac{GM}{r}
                                    \;-\;
                                    GM\,\kappa(r)
                                    \;-\;
                                    \tfrac{1}{2}\,GM\,\kappa(r)^{2} r
                                    \;+\;
                                    \mathcal{O}(r^{2})
                                `} />
                            </div>

                            <P>
                                The leading term is the usual Newtonian potential <InlineMath math={String.raw`-GM/r`} />.
                                The <InlineMath math={String.raw`\kappa`} />-dependent terms are finite or vanish as <InlineMath math={String.raw`r \to 0`} />,
                                so the short-distance <InlineMath math={String.raw`1/r`} /> structure of gravity is unchanged.
                            </P>

                            <h4 className="w-full text-md md:text-lg font-bold mb-6 px-4">6.2 κ sourced by macroscopic structure</h4>

                            <P noMB>
                                In the κ-r model, <InlineMath math={String.raw`\kappa(r)`} /> is an effective parameter built from
                                coarse-grained structure:
                            </P>

                            <div className="text-md md:text-xl xl:text-2xl">
                                <BlockMath
                                    math={String.raw`
                                    \kappa(r)
                                    =
                                    \kappa_{0}
                                    \;+\;
                                    k_{v}
                                    \left(
                                        \frac{\partial v / \partial r}{10^{-12}\,\mathrm{s}^{-1}}
                                    \right)^{3}
                                    \left(
                                        \frac{\rho}{\rho_{0}}
                                    \right)^{1/2}
                                `} />
                            </div>

                            <P>
                                At Planck scales, matter distribution is effectively homogeneous and
                                gradients vanish. Therefore:
                            </P>

                            <div className="text-md md:text-xl xl:text-2xl">
                                <BlockMath
                                    math={String.raw`
                                    \lim_{r \to \ell_P} \kappa(r) = 0
                                `} />
                            </div>

                            <P>
                                And the κ-weighted potential reduces to:
                            </P>

                            <div className="text-md md:text-xl xl:text-2xl">
                                <BlockMath
                                    math={String.raw`
                                    \lim_{r \to \ell_P} \Phi_{\kappa}(r)
                                    =
                                    -\frac{GM}{r}
                                `} />
                            </div>

                            <h4 className="w-full text-md md:text-lg font-bold mb-6 px-4">6.3 κ-weighted mass-energy</h4>

                            <div className="text-md md:text-xl xl:text-2xl">
                                <BlockMath
                                    math={String.raw`
                                    E_{\kappa}(r)
                                    =
                                    mc^{2}\,e^{\kappa(r) r}
                                `} />
                            </div>

                            <P noMB>Expanding for small r:</P>

                            <div className="text-md md:text-xl xl:text-2xl">
                                <BlockMath
                                    math={String.raw`
                                    E_{\kappa}(r)
                                    =
                                    mc^{2}
                                    \bigl[
                                        1 + \kappa(r) r
                                        + \tfrac{1}{2} \kappa(r)^{2} r^{2}
                                        + \mathcal{O}(r^{3})
                                    \bigr]
                                `} />
                            </div>

                            <P noMB>
                                Giving the limit:
                            </P>

                            <div className="text-md md:text-xl xl:text-2xl">
                                <BlockMath
                                    math={String.raw`
                                    \lim_{r \to \ell_P} E_{\kappa}(r)
                                    =
                                    mc^{2}
                                `} />
                            </div>

                            <h4 className="w-full text-md md:text-lg font-bold mb-6 px-4">6.4 Interpretation</h4>

                            <P>
                                κ acts as a <b>structural modifier</b>: it vanishes when structure cannot
                                be resolved (Planck scale) and grows when gradients, density contrasts,
                                and shear appear on macroscopic scales.
                            </P>

                            <P>
                                Below the Planck scale, gravity reverts to its standard form.
                                Above it, κ encodes geometric weight.
                            </P>
                        </div>
                    </details>
                    <details className="px-4 mb-4 text-base w-full">
                        <summary className="mb-4"><b>7. Mass-Energy Equivalence Under κ(r)</b></summary>
                        <div>
                            <P>
                                In the κ-modified weak-field limit, the effective gravitational
                                potential takes the form
                            </P>

                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                                \Phi_{\kappa}(r) = -\,\frac{GM}{r}\,e^{\kappa r}.
                                            `}
                                />
                            </div>

                            <P>
                                Differentiating gives the radial acceleration:
                            </P>

                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                                g_{\kappa}(r) = \frac{GM}{r^{2}}\,e^{\kappa r}.
                                            `}
                                />
                            </div>

                            <P>
                                This may be interpreted as the usual Newtonian term multiplied by a
                                scale-dependent gravitational weight. Writing
                                <code>m<sub>grav</sub> = m · e^{'κ r'}</code> reproduces the same force law.
                            </P>

                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                            F = m_{\text{grav}}\,\frac{GM}{r^{2}}
                                            \quad\text{with}\quad
                                            m_{\text{grav}}(r) = m\,e^{\kappa r}.
                                        `}
                                />
                            </div>

                            <P>
                                Inertial mass remains unchanged, so the rest-energy relation
                                <code>E = mc²</code> holds exactly. The gravitational contribution to the
                                energy, however, acquires the same weight:
                            </P>

                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                    E_{\kappa}(r) = mc^{2}\,e^{\kappa r}.
                `}
                                />
                            </div>

                            <P>
                                At small radii, the weighting disappears and the standard expression
                                is recovered:
                            </P>

                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                            \lim_{r \to 0} E_{\kappa}(r) = mc^{2}.
                                        `}
                                />
                            </div>

                            <P>
                                This establishes a scale-dependent distinction between inertial and
                                gravitational mass without altering local special-relativistic physics.
                                Energy retains its inertial identity, while its gravitational influence
                                varies with structure through κ(r).
                            </P>
                        </div>
                    </details>
                </div>
            </section>
            <section className="relative flex flex-col items-center bg-white box-border">
                <div className="w-full relative max-w-5xl snap-start flex flex-col items-center py-12 md:py-24 text-gray-800">
                    <h2 className="text-xl md:text-3xl px-4 mb-8">Further reading:</h2>
                    <ul className="w-full px-4 mb-12 text-base">
                        <li className="w-full px-4 mb-4">
                            Github: <a href="https://github.com/hasjack" target="_blank" rel="noreferrer">hasjack</a>
                        </li>
                        <li className="w-full px-4 mb-4">
                            Substack: <a href="https://hasjack.substack.com/" target="_blank" rel="noreferrer">hasjack.substack.com</a>
                        </li>
                        <li className="w-full px-4 mb-4">
                            Paper v3: <a href="https://drive.google.com/file/d/17_oBHBiCxL6IM6OkE3ec4Fdb9p-o99az/view?usp=sharing" target="_blank" rel="noreferrer">On Gravity - January 16th 2026 (PDF)</a></li>
                        
                        <li className="w-full px-4 mb-4">
                            Paper v2: <a href="https://drive.google.com/file/d/1bc-EjBqxl9d1Nt2YHrld3h8FWxedeEZu/view?usp=sharing" target="_blank" rel="noreferrer">On Gravity - October 11th 2025 (PDF)</a></li>
                        <li className="w-full px-4 mb-4">
                            Paper v1: <a href="https://drive.google.com/file/d/1ZXs34pCIM4nDEXOUOkGnisf-PIY2Dgff/view?usp=sharing" target="_blank" rel="noreferrer">On Gravity - October 8th 2025 (PDF)</a></li>

                    </ul>
                    <P>
                        Full derivations, MCMC fits, and code at:  <Link
                            to="https://github.com/hasjack/on-gravity"
                            target="_blank"
                            rel="noreferrer"
                        >github.com/hasjack/on-gravity</Link>
                    </P>
                </div>
            </section>
        </>
    )
}

export default Theory

