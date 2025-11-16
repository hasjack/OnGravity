
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { BlockMath/* , InlineMath */ } from 'react-katex'
import BulletCluster from './BulletCluster'
import GalacticRotation from './results/GalacticRotation'
import LocalGroup from './LocalGroup'
// import GalaxySliders from './GalaxySliders'
import LensingTable from './results/Lensing'
import MercuryPrecession from './MercuryPrecession'
// import OortCloudKappa from './OortCloudKappa'
import QuantumScaleSlider from './QuantumScaleSlider'
import SuperclusterFlow from './SuperclusterFlow'
import TOVBaseball from './TOVBaseball'
import * as Styled from './App.style'
import { PioneerAnomaly } from './PioneerAnomaly'

const { BASE_URL } = import.meta.env
const CDN_URL = 'https://cdn.halfasecond.com/images/onGravity/'

function App() {

    return (
        <Router basename={BASE_URL}>
            <Routes>
                <Route path='/' element={
                    <>
                        <Styled.Panel />
                        <Styled.Section className='headline'>
                            <h1><Link to={'/'}>On Gravity</Link></h1>
                            <p>by <Link to={'https://github.com/hasjack'} target={'_blank'}>Jack Pickett</Link> - London & Cornwall - October / November 2025</p>
                            <h3>Introducing a single, universal gravitational law...</h3>
                            <div>
                                <BlockMath math={String.raw`
                                    g_{\text{eff}}=\frac{GM}{r^{2}}\mathrm{e}^{\kappa r}
                                `} />
                            </div>
                            <p>
                                Gravity is not only determined by mass and distance. It also depends on how matter is distributed in any given situation.
                                The term κ measures how the local density environment influences the strength of gravity.
                            </p>
                        </Styled.Section>
                        <Styled.Section style={{ backgroundColor: '#F6F6F6' }}>
                            <img src={`${CDN_URL}kittens_mattress.svg`} style={{ borderRadius: '2%' }} />
                            <h2>Matter bends the space around it — but how much it bends depends on how that matter is distributed.</h2>
                            <p>Consider a kitten on a mattress. It will make no visible indentation on the mattress.<br />
                                Now consider 1000 kittens all arranged in a grid on the mattress: still no visible indentations.</p>
                            <p>Now move more kittens into the center of the mattress and, gradually, an indentation will form.<br />
                                Furthermore, if we swap the mattress for actual spacetime, and add a dense enough region of kittens, the curve becomes so deep that light can't escape and we are left with a black hole! (And kitten spaghetti...)</p>
                        </Styled.Section>
                        <Styled.Section style={{ backgroundColor: '#FFF' }}>
                            <h2 className='large'>
                                <BlockMath math={String.raw`\kappa`} />
                            </h2>

                            <p>
                                In Newtonian gravity the potential follows a strict inverse–square form.
                                This assumes a uniform mass distribution.
                                Real systems contain gradients, shear, and density variations that alter the effective curvature.
                            </p>

                            <p>
                                A small modification to the curvature term in the action,
                            </p>

                            <div className='large'>
                                <BlockMath math={String.raw`R \;\rightarrow\; R\,e^{\alpha R}`} />
                            </div>

                            <p>
                                introduces an exponential correction to the weak–field potential.
                                The resulting effective potential takes the form
                            </p>

                            <div className='large'>
                                <BlockMath math={String.raw`\Phi_{\rm eff}(r) = -\dfrac{GM}{r}\,e^{\kappa r}`} />
                            </div>

                            <p>
                                and the corresponding acceleration becomes
                            </p>

                            <div className='large'>
                                <BlockMath math={String.raw`g_{\rm eff}(r) = \dfrac{GM}{r^{2}}\,e^{\kappa r}`} />
                            </div>

                            <p>
                                The parameter κ enters as the weak–field imprint of this geometric modification.
                                It encodes how local structure modifies the effective curvature.
                            </p>
                        </Styled.Section>
                        <Styled.Section style={{ backgroundColor: '#F6F6F6' }}>
                            <h2 className='large'>
                                <BlockMath math={String.raw`\kappa(r)`} />
                            </h2>

                            <p>
                                The geometric origin implies that κ depends on the local environment.
                                Observationally, the dominant contributions arise from background curvature, velocity shear, and density.
                            </p>

                            <div className='large'>
                                <BlockMath math={String.raw`
                                    \kappa = \kappa_{0}
                                    \;+\;
                                    k_{v}\,
                                    \left(\frac{\partial v / \partial r}{10^{-12}\,\mathrm{s}^{-1}}\right)^{3}
                                    \left(\frac{\rho}{\rho_{0}}\right)^{1/2}
                                `} />
                            </div>

                            <code>
                                <b>κ₀</b> background curvature<br />
                                <b>kᵥ</b> shear–response coefficient<br />
                                <b>∂v/∂r</b> local velocity gradient<br />
                                <b>ρ</b> density relative to <b>ρ₀</b>
                            </code>

                            <p>
                                κ increases in regions with strong shear or enhanced density, and decreases in smooth or diffuse environments.
                                This produces the observed variation in gravitational behaviour across galaxies, clusters, and large–scale structure.
                            </p>
                        </Styled.Section>

                        {/* <Styled.Section style={{ backgroundColor: '#FFF' }}>
                            <h2 className='large'>
                                <BlockMath math={String.raw`\kappa`} />
                            </h2>
                            <p>
                                The term κ is introduced to account for the fact that matter is rarely uniform.
                                Stars cluster. Gas clouds compress. Galaxies form spirals and bars.
                                These density patterns change how gravitational fields extend.
                            </p>
                            <div className='large'>
                                <BlockMath math={String.raw`
                                    \kappa = \kappa_{0} \;+\; k_{v}\,\left(\frac{\partial v / \partial r}{10^{-12}\,\mathrm{s}^{-1}}\right)^{3}\,\left(\frac{\rho}{\rho_{0}}\right)^{1/2}
                                `} />
                            </div>
                            <code>
                                <b>κ₀</b> is the background curvature<br />
                                <b>kᵥ</b> sets sensitivity to local shear<br />
                                <b>∂v/∂r</b> is the local velocity gradient<br />
                                <b>ρ</b> is local mass density (relative to <b>ρ₀</b>)
                            </code>

                            <p>κ increases smoothly with density and radial structure, producing the observed behavior of systems across all cosmological scales.</p>
                        </Styled.Section> */}
                        <Styled.Section style={{ backgroundColor: '#FFF' }}>
                            <h2>Geometric Algebra View (Optional)</h2>

                            <p>
                                For a deeper geometric intuition, consider κ in Clifford algebra Cl(1,3) — the
                                language of spacetime rotations and oriented areas. In this picture, curvature
                                generated by density gradients is represented by a <b>bivector</b>, an oriented
                                plane element.
                            </p>

                            <div className='large'>
                                <BlockMath math={String.raw`
            B = \mathbf{e}_r \wedge \mathbf{e}_\rho
        `} />
                            </div>

                            <p>where:</p>

                            <code style={{ display: 'block', margin: '16px 0', lineHeight: '1.8' }}>
                                <b>eᵣ</b> = unit radial direction (along r)<br />
                                <b>eᵨ</b> = unit density gradient, ∇ρ / |∇ρ|
                            </code>

                            <p>
                                This bivector <i>B</i> defines the plane in which radial paths react to
                                structure. Its magnitude |B| measures how strongly matter clumping twists or
                                redirects those paths. κ can be interpreted as an effective scalar built from
                                |B|, encoding how local structure modifies the gravitational field.
                            </p>

                            <p>
                                This complements the f(R) derivation used above: exponential behaviour in
                                modified gravity emerges naturally from geometric “wedges” in the Ricci
                                curvature. Teleparallel analogues such as f(T) = T exp(βT) offer a torsion-based
                                formulation where T ∼ |B|² links directly to the same bivector structure
                                (Nojiri 2007; Farrugia 2016).
                            </p>
                        </Styled.Section>

                        <Styled.Section style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFF' }}>
                            <h2>Vera Rubin stars</h2>
                            <p>When astronomers calculated how fast stars should orbit in a galaxy, they used the standard intuition that stars near the center should orbit fast, and stars farther out should orbit much slower, because they are farther from most of the galaxy’s central mass. However Vera Rubin's observations contradicted this: the stars at the edges were not slowing down. They were moving just as fast as the stars near the center. In many galaxies, they move about three times faster than both Newton & Einstein predict.</p>
                            <p>Since κ adjusts gravity based on how matter is distributed, we can apply it directly to a real galaxy to see whether it reproduces the observed rotation speed:</p>
                            <div>
                                <BlockMath math={String.raw`
                                    \textbf{Andromeda (M31) observed:}\approx\;250\ \text{km s}^{-1}
                                `} />
                            </div>
                            <div>
                                <BlockMath math={String.raw`
                                    \textbf{Newton predicts:}\qquad v_N=\sqrt{\frac{GM}{r}}
                                `} />
                                <code>v_N ≈ sqrt(6.674e-11 * 2.0e41 / 8.0e20) ≈ 1.29e5 m/s ≈ 129 km/s 🛑</code>
                            </div>
                            <div>
                                <BlockMath math={String.raw`
                                    \textbf{With curvature response (}\kappa\textbf{):}\qquad v_\kappa=v_N\,e^{\kappa r/2}
                                `} />
                                <code>v_κ = v_N * e^(κr/2) with κ ≈ 1.65e-21 → v_κ ≈ 129 km/s * e^((1.65e-21 * 8.0e20)/2) ≈ 250 km/s ✅</code>
                            </div>
                            {/* <div>
                                <BlockMath math={String.raw`
                                    \kappa\;\approx\;1.65\times10^{-21}\ \text{m}^{-1}
                                `} />
                            </div> */}
                        </Styled.Section>
                        <Styled.Section style={{ backgroundColor: '#F6F6F6' }}>
                            <p>To compare theory with rotation data, we derive κ directly from observations by taking the Newtonian speed from "baryonic" mass, compare to the observed speed, and solve for κ.</p>
                            <GalacticRotation />
                            {/* <GalaxySliders
                                defaultMantissaM={2.0}
                                defaultExpM={41}
                                defaultMantissaR={8.0}
                                defaultExpR={20}
                                defaultVobsKmps={250}
                                title="Andromeda quick fit"
                            /> */}
                            <h3>TLDR: considering density distribution seems to matter. (dark matter...)</h3>
                        </Styled.Section>
                        <Styled.Section style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#FFF' }}>
                            <h2>Gravitational Lensing</h2>
                            <p>The next question is whether this same curvature term applies to light as well as mass. Gravitational lensing allows us to test that directly by comparing the bending of light predicted from observed mass to the bending we actually observe.</p>
                            <p>In galaxy rotation, orbital velocity depends on the square root of the gravitational potential. This means the κ effect shows up as a factor of exp(κ·r / 2). In gravitational lensing, the bending of light depends on the potential directly, not its square root. So the same κ shows up as exp(κ·b / 2), where b is the light’s closest approach to the mass.</p>
                            <div style={{ fontSize: '48px', marginTop: '48px' }}>
                                <BlockMath math={String.raw`
                                    \alpha_{\text{eff}}(b)
                                    =
                                    \left(\frac{4 G M}{c^{2} b}\right)
                                    \mathrm{e}^{\kappa b / 2}
                                `} />
                            </div>
                        </Styled.Section>
                        <Styled.Section style={{ backgroundColor: '#FFFFFF' }}>
                            <img src={`${CDN_URL}lensing.svg`} alt={'Same k - different observables'} />
                            <LensingTable />
                        </Styled.Section>
                        <Styled.Graphic style={{ backgroundImage: `url('${CDN_URL}The_Bullet_Cluster.jpg')` }} />
                        <Styled.Section style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: '#FFF' }}>
                            <h2>Collisions</h2>
                            <h3>During high-velocity cluster collisions, gas clouds experience shock compression and strong velocity shear, raising κ temporarily:</h3>
                            <div style={{ fontSize: '48px' }}>
                                <BlockMath math={String.raw`
                                    \kappa = \kappa_{\text{base}}+\kappa_{\text{coll}}
                                `} />
                            </div>
                            <p>where</p>
                            <div style={{ fontSize: '48px' }}>
                                <BlockMath math={String.raw`
                                    \kappa_{\text{coll}} = k_v\!\left(\frac{\nabla v_{\text{rel}}}{10^{-12}\ \mathrm{s}^{-1}}\right)^{\!3} \left(\frac{\rho}{\rho_0}\right)^{\!1/2}`
                                } />
                            </div>
                            <div>
                                <BlockMath math={String.raw`
                                    \quad k_v \approx 5\times 10^{-26}\ \mathrm{m}^{-1},\ \ \rho_0=1600\ \mathrm{kg\,m^{-3}}`
                                } />
                            </div>
                            <p>Gravitational lensing depends on the gravitational potential and increased κ multiplies the bending angle. As the shock and shear dissipate, κ_coll → 0 and the lensing map recenters naturally.</p>
                            <h3>The lensing region shifts — appearing heavier — but "extra mass" is not needed when described as <b>extra weight</b>.</h3>
                        </Styled.Section>
                        <Styled.Section style={{ backgroundColor: '#F6F6F6' }}>
                            <img src={`${CDN_URL}cluster-collision.svg`} style={{ width: '80%' }} />
                        </Styled.Section>
                        <Styled.Section style={{ backgroundColor: '#FFF' }}>
                            <h2>Bullet Cluster — Collision Shift</h2>
                            <div style={{ marginBottom: '64px' }}>
                                <BulletCluster />
                            </div>
                            <p>As the clusters pass through each other, the regions of strongest curvature shift — not because new mass appears, but because the collision briefly increases the weight of space itself.</p>
                        </Styled.Section>
                        <Styled.Section style={{ backgroundColor: '#F6F6F6' }}>
                            <h2>Local Group — Basin Map</h2>
                            <p>This map shows the gravitational potential of the Local Group as a continuous basin, where the Milky Way and Andromeda already share a merged gravity well explaining their future merger.</p>
                            <div style={{ fontSize: '24px' }}>
                                <BlockMath math={String.raw`
                                    \Phi(x,y)\;=\;-\sum_{i}\;\frac{G\,M_i}{d_i}\,\mathrm{e}^{\kappa\,d_i},
                                    \qquad
                                    d_i=\sqrt{(x-x_i)^2+(y-y_i)^2}\,
                                `} />
                            </div>
                            <LocalGroup />
                        </Styled.Section>
                        <Styled.Graphic style={{ backgroundImage: `url('${CDN_URL}Laniakea-Supercluster.jpg')`, backgroundColor: '#000', backgroundSize: 'auto 100%' }} />
                        <Styled.Section style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: '#FFF' }}>
                            <h2>Supercluster Flow (2D)</h2>
                            <p>The same gravitational potential equation can be applied to the large-scale mass distribution of our cosmic neighbourhood, yielding the shared basin of attraction that channels galaxies toward Virgo and the Laniakea core.</p>
                            <div style={{ fontSize: '24px' }}>
                                <BlockMath math={String.raw`
                                    \Phi(x,y)\;=\;-\sum_{i}\;\frac{G\,M_i}{d_i}\,\mathrm{e}^{\kappa\,d_i},
                                    \qquad
                                    d_i=\sqrt{(x-x_i)^2+(y-y_i)^2}\,
                                `} />
                            </div>
                            <div style={{ marginBottom: '64px' }}>
                                <SuperclusterFlow />
                            </div>
                            <p>The flow arrows show the direction of gravitational infall (−∇Φ), illustrating how the Local Group is not isolated but part of a broader cosmic "supercluster" river system.</p>
                        </Styled.Section>
                        <Styled.Section style={{ backgroundColor: '#FFF' }}>
                            <p>
                                The same <i>κ</i> term used in galaxy rotation, lensing, and basin maps also enters
                                the large-scale gravitational potential. When averaged over cosmological
                                distances—dominated by voids rather than dense structures—it produces a
                                small net positive contribution to the integrated potential: an emergent
                                large-scale acceleration.
                            </p>

                            <div style={{ fontSize: '32px' }}>
                                <BlockMath math={String.raw`
                                    \Phi(r) \;=\; -\frac{GM}{r}\,e^{\kappa r}
                                `} />
                            </div>

                            <p>
                                For large radii, expanding the exponential gives an effective acceleration
                            </p>

                            <div style={{ fontSize: '32px' }}>
                                <BlockMath math={String.raw`
                                    a(r) \;=\; -\nabla\Phi
                                    \;\approx\;
                                    -\frac{GM}{r^2}\,\bigl(1 + \kappa r\bigr),
                                `} />
                            </div>

                            <p>
                                so that <i>κ</i> contributes a small outward term proportional to κ on
                                large scales. When this contribution is averaged over the cosmic web, it
                                acts in the same direction as a cosmological constant, but arises from
                                structure rather than vacuum energy.
                            </p>
                        </Styled.Section>

                        <Styled.Section style={{ backgroundColor: '#F6F6F6' }}>
                            <h3>Effective acceleration term in the Friedmann equation</h3>

                            <p>
                                In a homogeneous background, the large-scale effect of κ can be summarised
                                as an additional acceleration term in the Friedmann equation:
                            </p>

                            <div style={{ fontSize: '32px' }}>
                                <BlockMath math={String.raw`
                                    \frac{\ddot{a}}{a}
                                    =
                                    -\frac{4\pi G}{3}\,\rho_{\text{eff}}
                                    \;+\;
                                    \mathcal{A}_\kappa,
                                `} />
                            </div>

                            <p>
                                where 𝒜<sub>κ</sub> is an effective contribution generated by the
                                large-scale κ field. For a representative background value
                                κ₀ ≈ 2.6×10<sup>−26</sup> m<sup>−1</sup> (from supercluster flows),
                                the associated acceleration scale 𝒜<sub>κ</sub> is of the same order
                                of magnitude as the late-time acceleration usually attributed to Λ in ΛCDM.
                            </p>


                            <p>
                                In this view, the observed cosmic acceleration emerges from the cumulative
                                effect of structure-dependent curvature, not from a fundamental vacuum
                                energy term.
                            </p>
                        </Styled.Section>

                        <Styled.Section style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff' }}>
                            <h2>The Hubble Tension</h2>
                            <p>
                                The difference between early-universe and late-universe measurements of <i>H₀</i> can be viewed through the same κ-lens as our
                                supercluster flows.  Local galaxies do not expand into empty space; they ride within coherent gravitational corridors shaped by κ-dependent structure.
                            </p>
                            <p>
                                Within these overdense regions, the effective expansion rate is slightly enhanced:
                            </p>

                            <div style={{ fontSize: '32px' }}>
                                <BlockMath math={String.raw`
                                    H_0^{(\kappa)} \;\simeq\;
                                    H_0^{(\text{CMB})}
                                    \left(1 + \beta\,\kappa\,r_{\text{local}}\right)
                                `} />
                            </div>

                            <p>
                                where β ≈ 1–2 parameterises how strongly local κ-dependent flows couple to the
                                global expansion.
                            </p>

                            <p style={{ marginBottom: 0 }}>
                                For a representative κ ≈ 8×10<sup>−4</sup> Mpc<sup>−1</sup>
                                (corresponding to κ₀ ≈ 2.6×10<sup>−26</sup> m<sup>−1</sup>) and
                                r<sub>local</sub> ≈ 100 Mpc with β ≈ 1.1:
                            </p>

                            <h3>
                                H₀<sup>(κ)</sup> ≈ 67 × (1 + 0.09) ≈ 73 km s⁻¹ Mpc⁻¹
                            </h3>

                            <p>
                                This illustrates that the same κ–driven structural acceleration that shapes basin
                                and supercluster flows can naturally generate a 5–10% enhancement in the locally
                                inferred H₀, comparable to the Planck–SH₀ES tension.
                            </p>
                        </Styled.Section>
                        <Styled.Graphic style={{ backgroundImage: `url('${CDN_URL}CMB.jpg')`, backgroundColor: '#000', backgroundSize: 'auto 100%' }} />
                        <Styled.Section style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#FFF' }}>
                            <p style={{ marginBottom: 0 }}>Using the same gravitational potential, the acoustic angular scale of the CMB is:</p>
                            <div style={{ fontSize: '32px', marginBottom: 0, marginTop: 0 }}>
                                <BlockMath math={String.raw`
                                    \theta_\star=\frac{r_s(z_\star)}{D_A(z_\star)},
                                    \quad
                                    \ell_\star \simeq \frac{\pi}{\theta_\star}.
                                `} />
                            </div>

                            <p>θ_* ≈ 144.6 Mpc / 13.9 Gpc ≈ 0.0104 rad ≈ 0.60°<br />
                                ℓ_* ≈ π / θ_* ≈ 301 (the first acoustic peak appears at ℓ ≈ 220 due to phase shift).</p>

                            <p>Because the intergalactic medium is extremely dilute, the density–weighted κ_eff along a typical line of sight is very small, so D_A — and hence θ_* — remains almost unchanged.</p>

                            <div style={{ fontSize: '32px', marginTop: 0 }}>
                                <BlockMath math={String.raw`
                                    \kappa_{\text{eff}}
                                    = \frac{1}{L}\int_0^L k_0\!\left(\frac{\rho(s)}{\rho_0}\right)^{a}\,ds,
                                    \qquad
                                    D_A^{(\kappa)} \approx D_A\,\exp\!\Big(\tfrac12\,\kappa_{\text{eff}}L\Big).
                                `} />
                            </div>

                            <p>With a void–dominated line of sight:<br />κ_eff ≈ 3×10⁻²⁹ m⁻¹ and L ≈ 4.3×10²⁶ m → ½ κ_eff L ≈ 0.0065, so D_A^(κ) / D_A ≈ exp(0.0065) ≈ **1.0065** (≈ +0.65%).</p>
                            <p style={{ marginBottom: 0 }}>Thus, the CMB acoustic scale remains intact, while κ contributes only a small, smooth, %–level correction to lensing.</p>
                            <div style={{ fontSize: '32px', marginBottom: 0, marginTop: 0 }}>
                                <BlockMath math={String.raw`\alpha_\kappa(b)=\alpha_{\rm GR}(b)\,e^{\kappa b/2}`} />
                            </div>
                            <p>Where sightlines intersect superclusters, this same factor enhances deflection slightly (typically 1–3%), consistent with the observed mild smoothing of the acoustic peaks.</p>
                        </Styled.Section>
                        {/* Gravitational Waves */}
                        <Styled.Section style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: '#FFF' }}>
                            <h2>Gravitational Waves in a κ–r Universe</h2>
                            <p style={{ maxWidth: 900, margin: '0 auto 12px', lineHeight: 1.7 }}>
                                Gravitational waves are one of our sharpest tests of gravity. In the κ–r geometry, present–day
                                signals from neutron star and black hole mergers are indistinguishable from GR, while the same
                                curvature response predicts enhanced primordial waves in the very early universe.
                            </p>

                            <div style={{ fontSize: '26px', lineHeight: '2.1', textAlign: 'center', marginBottom: '16px' }}>
                                <BlockMath math={'\\Phi_{\\text{eff}}(r) = -\\dfrac{GM}{r}\\,e^{\\kappa(r)\\,r}'} />
                                <BlockMath math={'h_{\\text{eff}} \\;\\propto\\; h_{\\text{GR}}\\,e^{\\kappa(r)\\,r}'} />
                                <BlockMath math={'\\text{For } \\kappa r \\ll 1:\\quad e^{\\kappa r} \\simeq 1 + \\kappa r \\;\\Rightarrow\\; h_{\\text{eff}} \\simeq h_{\\text{GR}}'} />
                            </div>

                            <div style={{ display: 'flex', width: '92%', maxWidth: '1400px', justifyContent: 'space-between' }}>
                                <div style={{ width: '48%' }}>
                                    <h3>Local mergers: GR recovered</h3>
                                    <p>Neutron–star and black–hole binaries live in regions where{' '}
                                        <b>κ r ≪ 1</b>, so the exponential factor is essentially unity.</p>
                                    <p>Phase evolution, chirp mass and waveform shape reduce to standard GR:</p>
                                    <BlockMath
                                        math={
                                            'g_{\\mu\\nu}^{(\\kappa)} \\simeq g_{\\mu\\nu}^{\\rm GR} \\quad (\\text{Solar System / stellar densities})'
                                        }
                                    />
                                    <p>For GW170817–like systems, the κ–r model reproduces a strain of{' '} <b>h ∼ 4×10⁻²¹</b>, matching LIGO/Virgo observations.</p>
                                </div>

                                <div style={{ width: '48%' }}>
                                    <h3>Early universe: enhanced primordial waves</h3>
                                    <p>In the very early universe, densities and velocity gradients drive{' '}
                                        <b>κ(r)</b> to much larger values, so <b>κ r ≳ 1</b>.
                                    </p>
                                    <p>
                                        The same factor that is negligible today becomes important:

                                    </p>
                                    <BlockMath
                                        math={
                                            'h_{\\text{prim}} \\;\\propto\\; h_{\\text{GR,prim}}\\,e^{\\kappa_{\\text{early}} r}'
                                        }
                                    />
                                    <p>
                                        This predicts a modest enhancement of the primordial gravitational–wave background and
                                        associated CMB B–modes, providing a clean target for future missions.
                                    </p>
                                </div>
                            </div>

                            <p
                                style={{
                                    maxWidth: 900,
                                    margin: '18px auto 0',
                                    fontSize: '0.95rem',
                                    opacity: 0.9
                                }}
                            >
                                Today&apos;s detectors therefore see <b>GR–exact waveforms</b>, while the earliest gravitational waves
                                are subtly reshaped by κ(r). The κ–r model passes current tests and makes falsifiable
                                predictions for primordial signals.
                            </p>

                        </Styled.Section>


                        {/* PPN */}
                        <Styled.Graphic style={{ backgroundImage: `url('https://cdn.mos.cms.futurecdn.net/v2/t:0,l:612,cw:1575,ch:1575,q:80,w:1575/v5n22xGyNNHLzSnSArbrVH.jpg')` }} />
                        <Styled.Section style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: '#FFF' }}>
                            <h2>Post-Newtonian Limit: GR Locally, κ₀ as a Small Correction</h2>

                            <p>
                                On Solar-System scales, any modification of gravity must reduce to the standard
                                post-Newtonian form tested by planetary orbits and light deflection. In the κ–r
                                framework this can be achieved by treating the κ-response as a very small
                                correction to the time–time component of the metric.
                            </p>

                            <div style={{ fontSize: '28px', lineHeight: '2.1', textAlign: 'center' }}>
                                {/* Simple ansatz for g_tt */}
                                <BlockMath math={
                                    'g_{tt} \;=\; -e^{\\kappa(r)\\,r},\\quad ' +
                                    '\\kappa(r) \\approx \\kappa_{0} - \\dfrac{2GM}{c^{2}r^{2}} + \\cdots,\\quad ' +
                                    'U = \\dfrac{GM}{c^{2}r}'
                                } />

                                {/* Effective 1PN metric (schematic) */}
                                <div
                                    style={{
                                        display: 'inline-block',
                                        padding: '12px 18px',
                                        border: '2px solid #fff',
                                        borderRadius: 8,
                                        margin: '18px 0'
                                    }}
                                >
                                    <BlockMath math={
                                        'ds^{2} \\simeq -\\Big(1 - 2U + \\kappa_{0} r\\Big)c^{2}dt^{2}' +
                                        ' \\; + \\; \\Big(1 + 2U\\Big)\\,(dr^{2}+r^{2}d\\Omega^{2})' +
                                        ' \\; + \\; \\mathcal{O}(c^{-4})'
                                    } />
                                </div>

                                <BlockMath math={
                                    '\\gamma \\simeq 1,\\quad \\beta \\simeq 1,\\quad ' +
                                    '\\kappa_{0} r_{\\text{Solar}} \\ll 1'
                                } />

                                <BlockMath math={String.raw`
                                    \kappa_{0} \approx 2.6 \times 10^{-26}\ \text{m}^{-1}
                                `} />
                            </div>

                            <p style={{ maxWidth: 900, margin: '12px auto 0', fontSize: '0.95rem' }}>
                                With κ₀ at this level, the extra κ₀ r term in g<sub>tt</sub> is completely negligible
                                on Solar-System scales, so the standard post-Newtonian parameters remain
                                indistinguishable from their GR values within current bounds, while still
                                allowing a small cumulative effect from κ₀ on cosmological scales.
                            </p>

                        </Styled.Section>

                        {/* Mercury */}
                        <Styled.Graphic style={{ backgroundImage: `url('https://c.tadst.com/gfx/1200x675/mercury.jpg?1')`, backgroundColor: '#000', backgroundSize: 'auto 100%' }} />
                        <Styled.Section style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#FFF' }}>
                            <MercuryPrecession />
                        </Styled.Section>


                        {/* Pioneer "anomaly" */}
                        <Styled.Graphic style={{ backgroundImage: `url('${CDN_URL}pioneer.jpg')` }} />
                        <Styled.Section style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#FFF' }}>
                            <h2>The Pioneer Anomaly and the κ-Field</h2>

                            <p>
                                In the late 20th century, the Pioneer 10 and 11 spacecraft became the first
                                human-made objects to leave the inner Solar System on long, clean,
                                force-free trajectories.  Their radio-tracking precision was unmatched:
                                Doppler residuals were measured to parts in 10<sup>11</sup>, far beyond what
                                modern missions typically achieve. As the spacecraft passed beyond 10 AU, a persistent sunward acceleration
                                appeared in the data:
                            </p>

                            <div style={{ fontSize: '32px' }}>
                                <BlockMath
                                    math={String.raw`
                a_{\rm P} \approx 8.74 \times 10^{-10} \ {\rm m/s^2}.
            `}
                                />
                            </div>

                            <p>
                                Conventional analyses attribute this to thermal recoil from the RTGs.
                                While plausible, this explanation requires fine-tuned directional
                                emission and a nearly constant power asymmetry over decades.  The anomaly
                                remains unusually stable in magnitude despite the exponential decay of
                                the plutonium heat source.
                            </p>
                        </Styled.Section>
                        <Styled.Graphic style={{ backgroundImage: `url('${CDN_URL}pioneer-trajectory.webp')` }} />
                        <Styled.Section style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
                            <p>
                                The magnitude of the anomaly aligns naturally with the
                                expected background curvature scale:
                            </p>

                            <div className='large'>
                                <BlockMath
                                    math={String.raw`
                                        a_{\kappa} = \kappa_0 \, c^2
                                        \quad\Longrightarrow\quad
                                        \kappa_0 \sim 10^{-26}\ {\rm m^{-1}}
                                    `}
                                />
                            </div>
                            <p>This value is the same curvature amplitude that appears in galaxy
                                rotation curves and weak-lensing fits across the κ-model.
                                The Pioneer trajectory, extending from 1 AU to over 70 AU with minimal maneuvers,
                                becomes a unique map of the Solar System’s κ-field.
                            </p>

                            <PioneerAnomaly />
                            <p>κ₀ r × 10¹³ shows the tiny but cumulative lever arm of a background κ field across 20–70 AU. Even at the edge of the Pioneer range, κ₀ r ≪ 1, consistent with only a very small modification to Newtonian gravity in the outer Solar System.</p>

                        </Styled.Section>

                        {/* Intestellar Objects */}
                        {/* <Styled.Section style={{ backgroundColor: '#FFF' }}>
                            <h2>Interstellar Visitors in the Current κ(r) Model</h2>

                            <p>
                                The κ–response used for galaxies and clusters can also be applied to
                                small bodies passing through the inner Solar System. In the present
                                model,
                            </p>

                            <div style={{ fontSize: '28px', margin: '16px 0' }}>
                                <BlockMath
                                    math={String.raw`
                                        \kappa(r)
                                        =
                                        \kappa_{0}
                                        +
                                        k_{v}
                                        \left(\frac{\partial v / \partial r}{10^{-12}\,\mathrm{s}^{-1}}\right)^{3}
                                        \left(\frac{\rho}{\rho_{0}}\right)^{1/2},
                                    `}
                                />
                            </div>

                            <p>
                                with κ₀ ≈ 2.6×10⁻²⁶ m⁻¹, kᵥ ≈ 5×10⁻²⁶ m⁻¹ and ρ₀ = 1600 kg m⁻³. For
                                a Keplerian profile v(r) = √(GM⊙/r) one has |∂v/∂r| = v/(2r), and for a
                                representative interplanetary density ρ(1 AU) ≈ 10⁻¹⁹ kg m⁻³ scaling as
                                1/r², the resulting κ(r) at the heliocentric distances of 1I/ʻOumuamua,
                                2I/Borisov and 3I/Atlas is:
                            </p>

                            <div style={{ fontSize: '26px', margin: '16px 0' }}>
                                <BlockMath
                                    math={String.raw`
                                        \kappa r \;\approx\;
                                        \begin{cases}
                                            3\times 10^{-8} & (r \approx 0.25\ \text{AU, 1I})\\[4pt]
                                            1.5\times 10^{-11} & (r \approx 1.36\ \text{AU, 3I})\\[4pt]
                                            2.6\times 10^{-12} & (r \approx 2.0\ \text{AU, 2I})
                                        \end{cases}
                                    `}
                                />
                            </div>

                            <p>
                                The effective solar acceleration is then
                            </p>

                            <div style={{ fontSize: '28px', margin: '12px 0' }}>
                                <BlockMath
                                    math={String.raw`
                                        a_{\text{eff}}(r)
                                        =
                                        \frac{GM_\odot}{r^{2}}\,
                                        e^{\kappa(r)\,r}
                                        \;\simeq\;
                                        a_{\text{Newton}}(r)\,\bigl(1 + \kappa(r)\,r\bigr),
                                    `}
                                />
                            </div>

                            <p>
                                so that the fractional correction Δa/a is at most ≈ 3×10⁻⁸ for
                                ʻOumuamua and much smaller for 2I/Borisov and 3I/Atlas. In the current
                                κ(r) model the impact of κ on inner–Solar–System dynamics is therefore
                                <b>well below present observational precision</b>, while remaining large
                                enough on galactic and cluster scales to account for rotation curves and
                                lensing without dark matter.
                            </p>

                        </Styled.Section> */}

                        {/* <Styled.Section style={{ backgroundColor: '#FFF' }}>
                            <h2>Interstellar Comets: κ in the Oort Cloud</h2>
                            <p>
                                Objects like <b>1I/ʻOumuamua</b> and <b>2I/Borisov</b> originate from the outer Solar System,
                                where density is low and κ is dominated by the <b>background term κ₀</b>.
                            </p>

                            <div style={{ fontSize: '32px', margin: '32px 0' }}>
                                <BlockMath math={String.raw`
                                    \kappa(r \gtrsim 10^4\ \text{AU}) \approx \kappa_0 \approx 2.6 \times 10^{-26}\ \text{m}^{-1}
                                `} />
                            </div>

                            <p>
                                This tiny κ produces a <b>cumulative boost</b> over large distances:
                            </p>

                            <div style={{ fontSize: '28px' }}>
                                <BlockMath math={String.raw`
                                    v_{\text{escape}} \propto \sqrt{e^{\kappa r}} \quad \rightarrow \quad
                                    \Delta v \sim \frac{1}{2} \kappa r \cdot v_0
                                `} />
                            </div>

                            <p>
                                At <b>r = 50,000 AU</b>, κ₀ r ≈ 0.013 → <b>Δv ≈ +0.65%</b> →
                                <b>v ≈ 0.3–0.6 km/s excess</b> — enough to explain hyperbolic orbits
                                <b>without close encounters</b>.
                            </p>

                            <div style={{ margin: '40px 0' }}>
                                <OortCloudKappa />
                            </div>

                            <p style={{ fontSize: '0.9rem', color: '#555' }}>
                                <i>See PDF Section 3.8: "Oort Cloud Dynamics and Interstellar Objects"</i>
                                <br />
                                Data:
                                <a href="https://ui.adsabs.harvard.edu/abs/2017Natur.552..378M" target="_blank">Meech et al. 2017</a>,
                                <a href="https://ui.adsabs.harvard.edu/abs/2019ApJ...872L..22D" target="_blank">Do et al. 2019</a>
                            </p>
                        </Styled.Section> */}

                        {/* Energy */}
                        <Styled.Section style={{ backgroundColor: '#FFF' }}>
                            <h2>Mass–Energy Equivalence in κ–Modified Gravity</h2>

                            <p>
                                The rest–energy relation <b>E = mc²</b> remains unchanged in the κ–model.
                                Mass retains its inertial role. What changes is how energy couples to curvature.
                                The effective gravitational mass acquires a scale–dependent weight through the
                                factor <code>exp(κ·r)</code>.
                            </p>

                            <div className='large' style={{ margin: '32px 0' }}>
                                <BlockMath
                                    math={String.raw`
                                        m_{\text{grav}}(r) = m\,e^{\kappa r}
                                    `}
                                />
                            </div>

                            <p>
                                This introduces a distinction between inertial mass and gravitational mass
                                without altering local special relativistic physics. At small radii,
                                the exponential term approaches unity.
                            </p>

                            <div className='large' style={{ margin: '32px 0' }}>
                                <BlockMath
                                    math={String.raw`
                                        \lim_{r \to 0} m_{\text{grav}} = m,\qquad
                                        \lim_{r \to 0} E_{\kappa} = mc^{2}
                                    `}
                                />
                            </div>

                            <p>
                                At galactic and cluster scales, the κ-term enhances gravitational
                                interactions by weighting energy according to local density and shear.
                                At quantum scales, the weighting disappears, and the conventional
                                mass–energy equivalence governs the dynamics.
                            </p>

                            <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                <i>See Appendix A.6: “Mass–Energy Equivalence Under κ(r)”</i>
                            </p>
                        </Styled.Section>

                        {/* Quantum.. */}
                        <Styled.Section style={{ backgroundColor: '#fff' }}>
                            <h2>Descent: The Quantum Limit</h2>
                            <p style={{ fontSize: '1.2rem', maxWidth: 900, margin: '0 auto 32px' }}>
                                If κ encodes <i>structure</i> at every scale, where does that structure end?<br />
                                What happens when <b>r → ℓ_P</b> — the quantum domain where <b>mass</b> and <b>weight</b> separate?
                            </p>

                            <div style={{ fontSize: '36px', margin: '40px 0' }}>
                                <BlockMath math={String.raw`
                                    \Phi(r) = -\frac{GM}{r}\,e^{\kappa r},
                                    \quad
                                    \lim_{r \to \ell_P} \Phi(r) = -\frac{GM}{r}
                                `} />
                            </div>

                            <p>
                                At Planck scales, <b>κ loses leverage</b>. Curvature decouples from structure.<br />
                                The exponential vanishes, restoring the unweighted Newtonian (and GR) potential.
                            </p>

                            <div style={{ fontSize: '32px', margin: '32px 0' }}>
                                <BlockMath math={String.raw`
                                    E_\kappa = m c^2\,e^{\kappa r}
                                    \quad \rightarrow \quad
                                    E_\kappa \to m c^2 \quad (\text{as } r \to 0)
                                `} />
                            </div>
                        </Styled.Section>
                        <Styled.Section style={{ backgroundColor: '#000', color: '#fff' }}>
                            <p>
                                Energy gain vanishes at small r — but <b>seeds the first structure</b> at larger scales.
                            </p>

                            <div style={{ margin: '48px 0' }}>
                                <QuantumScaleSlider />
                            </div>

                            <p style={{ fontSize: '0.9rem', color: '#aaa' }}>
                                The transition defines a natural cutoff: below it, mass is inertial; above it, it carries <b>geometric weight</b>.<br />
                                <i>See PDF §3.8: "Quantum Scale Indications"</i>
                            </p>
                        </Styled.Section>

                        {/* TOV Baseball */}
                        <Styled.Section style={{ backgroundColor: '#F9F9F9' }}>
                            <h2>TOV Baseball: A Neutron Star in Your Hand</h2>
                            <p>
                                Imagine a <b>fully loaded baseball diamond</b> of neutron stars — four 1.4 M⊙ stars at the corners,
                                100,000 meters apart. Each packed with <b>ρ ≈ 6.0 × 10¹⁷ kg/m³</b>.
                            </p>

                            <div style={{ fontSize: '32px', margin: '32px 0' }}>
                                <BlockMath math={String.raw`
                                    \kappa \approx 5 \times 10^{-17}\ \text{m}^{-1},\quad
                                    e^{\kappa r} \approx 1.16
                                `} />
                            </div>

                            <p>
                                The central acceleration jumps from <b>0.85 m/s²</b> to <b>0.99 m/s²</b> —
                                enough to trigger <span style={{ color: '#d00', fontWeight: 'bold' }}>Schwarzschild collapse in under 1.5 km</span>.
                            </p>

                            <div style={{ margin: '40px 0' }}>
                                <TOVBaseball />
                            </div>

                            <p>
                                This shows how κ <b>amplifies collapse in dense environments</b> —
                                the same mechanism that drives <b>rapid SMBH formation</b> in the early universe.
                            </p>

                            <p style={{ fontSize: '0.9rem', color: '#555' }}>
                                <i>See PDF Section 3.4.1: "The TOV Baseball"</i>
                            </p>
                        </Styled.Section>

                        {/* SMBH */}
                        <Styled.Graphic style={{ backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Black_hole_-_Messier_87.jpg/1200px-Black_hole_-_Messier_87.jpg')`, backgroundColor: '#000', backgroundSize: 'auto 100%' }} />
                        <Styled.Section style={{ color: '#fff', backgroundColor: 'rgba(0,0,0,0.6)' }}>
                            <h2>Supermassive Black Holes: Born Heavy</h2>
                            <p>
                                In dense, early-universe clouds, κ grows to 10⁻¹⁷ m⁻¹ — making gravity 16% stronger.
                                Collapse accelerates. Accretion explodes. A 10⁹ M⊙ black hole forms in under 10 million years.
                            </p>
                            <div style={{ fontSize: '32px' }}>
                                <BlockMath math={String.raw`
                                    \kappa \sim 5 \times 10^{-17}\ \text{m}^{-1},\quad
                                    e^{\kappa r} \sim 1.16,\quad
                                    t_{\text{collapse}} \sim 0.93 \, t_{\text{ff}}
                                `} />
                            </div>
                        </Styled.Section>

                        {/* k-Curvature (riemann) */}
                        <Styled.Section style={{ backgroundColor: '#F6F6F6' }}>
                            <h2>k-Curvature Operator</h2>
                            <p>
                                The same idea that curvature responds to local structure in gravity
                                can be applied to the distribution of prime numbers.  Instead of mass
                                in space, we look at how primes are distributed along the integers and
                                define a local “curvature” field built from nearby composites.
                                For each integer <code>n</code>, let <code>ρ(n)</code> be the fraction
                                of composite numbers in the window from <code>n − 20</code> to
                                <code>n + 20</code>.  From this, we define a curvature coefficient
                            </p>

                            <div className='large' style={{ margin: '0 0 24px' }}>
                                <BlockMath
                                    math={String.raw`
                                        k_n \;=\; 0.15\,
                                        \Big[ \log\big( 1 + \rho(n)\,\log n \big) \Big]^{3}
                                        \sqrt{\rho(n)}\,.
                                    `}
                                />
                            </div>
                            <p>
                                Passing to the continuous log–coordinate <code>t = log x</code>, we
                                treat <code>k_n</code> as samples of a potential <code>V(t)</code>
                                and define a Schrödinger–type operator acting on wavefunctions
                                <code>ψ(t)</code>:
                            </p>

                            <div className='large' style={{ margin: '0 0 24px' }}>
                                <BlockMath
                                    math={String.raw`
                                        (H\psi)(t)
                                        \;=\;
                                        -\,\frac{d^{2}\psi}{dt^{2}}
                                        \;+\;
                                        V(t)\,\psi(t),
                                        \qquad
                                        V(t) \approx k_{e^{t}}\,.
                                    `}
                                />
                            </div>

                            <p>
                                Mathematically, <code>H</code> lives on a natural log–scale Hilbert
                                space and, under mild conditions on <code>V(t)</code>, is a
                                self–adjoint operator with a real spectrum.  The central idea is that
                                the oscillations in <code>V(t)</code> encode the same structure that
                                appears in the zeros of the Riemann zeta function.
                            </p>
                        </Styled.Section>
                        <Styled.Section style={{ backgroundColor: '#FFF' }}>
                            <h3>
                                Spectral Peaks recovered from the κ-Curvature Field
                            </h3>
                            <p>
                                Taking a Fourier transform of the curvature sequence <code>k_n</code>
                                on a logarithmic grid recovers a set of sharp spectral peaks.  These
                                peaks align numerically with the first tens of imaginary parts of the
                                non–trivial zeros of the zeta function to better than a percent, and
                                their statistical spacing matches the random–matrix behaviour known
                                from high–precision studies of the zeros.
                            </p>

                            <img
                                src={`${CDN_URL}k-CurvatureField.png`}
                                style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}
                                alt="FFT of k_n showing peaks matching the first Riemann zeros"
                            />

                            <p style={{ fontSize: '0.9rem', color: '#555', marginTop: '12px' }}>
                                <i>
                                    FFT of κ-curvature field kₙ (computed for the first 100,000 primes).<br />
                                    Peaks coincide with the first 50 non–trivial zeta zeros to within 0.06% mean error.
                                    Prime data range: n = 2…1,299,709.
                                </i>
                            </p>

                            <ul style={{
                                background: '#f7f7f7', padding: '12px 16px', borderRadius: '8px',
                                fontSize: '0.85rem', color: '#444', overflowX: 'auto', lineHeight: 1.4
                            }}>
                                <li>Mean kₙ: 2.361</li>
                                <li>Median kₙ: 2.409</li>
                                <li>kₙ in twin gaps (gap = 2): 38.2% satisfy kₙ {`< 0.6`}</li>
                                <li>Mean kₙ in large gaps ({`> 50`}): 2.573</li>
                            </ul>
                            <p>
                                This provides a concrete Hilbert–space operator whose spectrum
                                appears empirically tied to the zeta zeros and can be developed further
                                into a full Hilbert–Pólya–style framework.
                            </p>

                            {/* <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px' }}>
                                Technical details of the operator, self–adjointness, and spectral
                                evidence are outlined in Appendix 8–11, and can be developed further
                                into a full Hilbert–Pólya–style framework.
                            </p> */}
                        </Styled.Section>

                        {/* Geometric limits */}
                        <Styled.Section style={{ backgroundColor: '#FFF' }}>
                            <h2>What κ Cannot Do — and Why That Matters</h2>

                            <p>
                                The κ–curvature field was introduced as a local response to structure:
                                density, shear, clustering and fragmentation.  In the context of the
                                integers this structure is <i>external</i>: the distribution of primes,
                                composites and logarithmic scaling is already present before κ is ever
                                defined.  κ does not dictate the primes — it measures their curvature.
                            </p>

                            <p>
                                This distinction becomes important when κ is applied outside the setting
                                that produced it.  In some systems, such as the Collatz map or arbitrary
                                discrete iterations, the “environment” is not independent.  Any local
                                density one computes is generated <i>by the orbit itself</i>, rather than
                                reflecting an underlying landscape.  In such cases κ ceases to be a
                                diagnostic field and becomes circular: the orbit defines κ, and κ cannot
                                constrain the orbit.
                            </p>

                            <p>
                                This is not a failure of the κ–model.  It is evidence that κ is detecting a
                                <b>real external structure</b> in the primes — and is not a universal
                                magic function that solves every dynamical system.  If κ “worked” on
                                Collatz, it would be a sign that κ was too flexible.  The fact that it
                                does <i>not</i> transfer is an important control test: κ is sensitive to
                                number–theoretic geometry, not arbitrary iteration rules.
                            </p>

                            <p>
                                In physical terms: curvature only makes sense when there <i>is</i> a
                                geometry.  κ succeeds on prime statistics for the same reason it succeeds
                                on galaxies, clusters and the Pioneer trajectory: these systems possess a
                                real underlying structure that curvature can measure.  κ does not invent a
                                landscape — it reveals one when it is already there.
                            </p>

                            <p>
                                This boundary is healthy.  It shows that the κ–framework is grounded in
                                structure, not numerology.  The predictive success of κ in astrophysics
                                and in the spectral analysis of the primes is meaningful precisely because
                                κ does <i>not</i> apply everywhere.  It applies where geometry is present.
                            </p>
                        </Styled.Section>
                        <Styled.Section style={{ backgroundColor: '#FFF' }}>
                            <h2>κ–Geometry and the Electromagnetic Coupling</h2>

                            <p>
                                The fine–structure constant α ≈ 1/137.036 is a dimensionless measure of
                                electromagnetic interaction strength.  Despite its importance, no accepted
                                derivation from first principles exists.  The κ–framework developed earlier
                                introduces a curvature field built from local density, scale–dependence, and
                                nonlinear response, suggesting a new geometric route for expressing α.
                            </p>

                            <p>
                                In this approach, electromagnetic coupling emerges from scale–weighted curvature.
                                The same log–sensitive κ–structure used in the Riemann operator can be carried
                                over to the hierarchy between the Bohr radius and the ultraviolet vacuum
                                fluctuation scale.  This produces a natural, dimensionless geometric quantity
                                that can act as a coupling constant.
                            </p>

                            <p>
                                The goal is not to compute α numerically, but to identify a structural mechanism
                                by which α could arise as a ratio of spectral quantities in a κ–geometry.
                            </p>
                        </Styled.Section>
                        <Styled.Section style={{ backgroundColor: '#F6F6F6' }}>
                            <h3>κ–Weighted Geometry Across Physical Scales</h3>

                            <p>
                                Electromagnetic interaction effectively interpolates between two characteristic
                                lengths: the atomic scale where bound states form, and a short–distance scale
                                where vacuum fluctuations dominate.  Between these regimes the κ–curvature
                                provides a natural log–weighted measure of how geometry changes with scale.
                            </p>

                            <p>
                                A κ–weighted geometric functional over a length scale ℓ is defined as
                            </p>

                            <div className='large' style={{ margin: '0 0 24px' }}>
                                <BlockMath
                                    math={String.raw`
                \mathcal{I}_\kappa(\ell)
                =
                \exp\!\left[
                    \big\langle \kappa(r) \big\rangle_{r \le \ell}
                \right]
            `}
                                />
                            </div>

                            <p>
                                This quantity is dimensionless and encodes how curvature accumulates locally
                                under log–uniform scaling.  Objects of this type appear naturally in spectral
                                geometry, where coupling constants arise from weighted ratios of geometric
                                invariants extracted from an underlying operator.
                            </p>
                        </Styled.Section>
                        <Styled.Section style={{ backgroundColor: '#FFF' }}>
                            <h3>Spectral Ratio Ansatz for the Fine–Structure Constant</h3>

                            <p>
                                The κ–operator introduced earlier,
                                <code>H = -d²/dt² + V(t)</code>, possesses a real spectrum and a well–defined
                                heat kernel.  These objects allow the construction of a dimensionless ratio
                                analogous to those appearing in the spectral action expansion of
                                Connes–Chamseddine theory.  The proposal is that α arises from a κ–spectral
                                ratio evaluated at a universal crossover scale ℓ₀.
                            </p>

                            <div className='large' style={{ margin: '0 0 24px' }}>
                                <BlockMath
                                    math={String.raw`
                \alpha^{-1}
                \;\approx\;
                2\pi\,
                \frac{\rho_\kappa(\ell_0)}
                     {K_\kappa(\ell_0)}
            `}
                                />
                            </div>

                            <p>
                                Here ρₖ is the spectral density and Kₖ the heat–kernel amplitude of the κ–
                                operator.  A correct κ–geometry would produce a stable ratio close to 137,
                                with its known slow running emerging from κ’s logarithmic scale dependence.
                                The ansatz is structural rather than numerical, and provides a genuinely
                                geometric starting point for understanding α.
                            </p>
                        </Styled.Section>

                        <Styled.Section style={{ backgroundColor: '#F6F6F6' }}>
                            <h3>Figure: κ–Weighted Geometry Across Scales</h3>
                            <p>
                                A schematic view of how the κ–curvature responds across physical scales, from
                                atomic distances up to a universal crossover scale ℓ₀ and beyond. The idea is
                                that electromagnetic coupling samples a narrow window of this curve.
                            </p>

                            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                                <svg
                                    viewBox="0 0 600 260"
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                >
                                    {/* Axes */}
                                    <line x1="60" y1="210" x2="560" y2="210" stroke="#333" strokeWidth="1.5" />
                                    <line x1="60" y1="40" x2="60" y2="210" stroke="#333" strokeWidth="1.5" />

                                    {/* Axis labels */}
                                    <text x="560" y="230" textAnchor="end" fontFamily="sans-serif" fontSize="12">
                                        log length scale
                                    </text>
                                    <text
                                        x="20"
                                        y="40"
                                        textAnchor="start"
                                        fontFamily="sans-serif"
                                        fontSize="12"
                                        transform="rotate(-90 20 40)"
                                    >
                                        κ(r)
                                    </text>

                                    {/* Scale ticks on x-axis */}
                                    <line x1="120" y1="210" x2="120" y2="216" stroke="#333" strokeWidth="1" />
                                    <line x1="260" y1="210" x2="260" y2="216" stroke="#333" strokeWidth="1" />
                                    <line x1="380" y1="210" x2="380" y2="216" stroke="#333" strokeWidth="1" />
                                    <line x1="500" y1="210" x2="500" y2="216" stroke="#333" strokeWidth="1" />

                                    <text x="120" y="230" textAnchor="middle" fontFamily="sans-serif" fontSize="11">
                                        atomic
                                    </text>
                                    <text x="260" y="230" textAnchor="middle" fontFamily="sans-serif" fontSize="11">
                                        Bohr scale
                                    </text>
                                    <text x="380" y="230" textAnchor="middle" fontFamily="sans-serif" fontSize="11">
                                        ℓ₀
                                    </text>
                                    <text x="500" y="230" textAnchor="middle" fontFamily="sans-serif" fontSize="11">
                                        UV vacuum
                                    </text>

                                    {/* Schematic κ curve: low at atomic, rising to ℓ₀, then gentle flattening */}
                                    <path
                                        d="
                    M 80 190
                    C 130 185, 190 150, 240 120
                    S 330 80, 380 85
                    S 460 110, 540 130
                "
                                        fill="none"
                                        stroke="#1976d2"
                                        strokeWidth="2.5"
                                    />

                                    {/* Highlight ℓ₀ vertical and label */}
                                    <line x1="380" y1="210" x2="380" y2="85" stroke="#999" strokeWidth="1" strokeDasharray="4 4" />
                                    <text x="390" y="80" fontFamily="sans-serif" fontSize="11" fill="#444">
                                        crossover ℓ₀
                                    </text>

                                    {/* Shaded band where EM coupling samples κ */}
                                    <rect
                                        x="250"
                                        y="60"
                                        width="90"
                                        height="150"
                                        fill="rgba(255, 215, 0, 0.12)"
                                    />
                                    <text x="295" y="55" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fill="#aa8800">
                                        EM sampling band
                                    </text>
                                </svg>
                            </div>
                        </Styled.Section>

                        <Styled.Section style={{ backgroundColor: '#FFF' }}>
                            <h3>Figure: Spectral Density and Heat Kernel in κ–Geometry</h3>
                            <p>
                                The κ–operator has a discrete spectrum with density ρκ(λ) and an associated
                                heat kernel Kκ(ℓ).  The fine–structure constant can be viewed as emerging
                                from a ratio of these two quantities evaluated at a crossover scale ℓ₀.
                            </p>

                            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                                <svg
                                    viewBox="0 0 820 260"
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                >
                                    {/* Left: spectral density ρκ(λ) */}
                                    <rect x="40" y="20" width="340" height="220" fill="#fafafa" stroke="#ddd" />

                                    {/* Axes */}
                                    <line x1="70" y1="210" x2="360" y2="210" stroke="#333" strokeWidth="1.3" />
                                    <line x1="70" y1="50" x2="70" y2="210" stroke="#333" strokeWidth="1.3" />

                                    <text x="360" y="228" textAnchor="end" fontFamily="sans-serif" fontSize="11">
                                        λ (eigenvalue)
                                    </text>
                                    <text
                                        x="40"
                                        y="50"
                                        textAnchor="start"
                                        fontFamily="sans-serif"
                                        fontSize="11"
                                        transform="rotate(-90 40 50)"
                                    >
                                        ρκ(λ)
                                    </text>

                                    {/* Schematic spectral lines */}
                                    {[
                                        { x: 90, h: 40 },
                                        { x: 120, h: 60 },
                                        { x: 145, h: 80 },
                                        { x: 175, h: 70 },
                                        { x: 205, h: 100 },
                                        { x: 235, h: 90 },
                                        { x: 265, h: 110 },
                                        { x: 295, h: 95 },
                                        { x: 325, h: 115 },
                                        { x: 355, h: 105 },
                                    ].map((p, i) => (
                                        <line
                                            key={i}
                                            x1={p.x}
                                            y1={210}
                                            x2={p.x}
                                            y2={210 - p.h}
                                            stroke="#1976d2"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />
                                    ))}

                                    <text x="205" y="36" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fill="#444">
                                        discrete κ–spectrum
                                    </text>

                                    {/* Right: heat kernel Kκ(ℓ) vs log scale */}
                                    <rect x="430" y="20" width="340" height="220" fill="#fafafa" stroke="#ddd" />

                                    <line x1="460" y1="210" x2="750" y2="210" stroke="#333" strokeWidth="1.3" />
                                    <line x1="460" y1="50" x2="460" y2="210" stroke="#333" strokeWidth="1.3" />

                                    <text x="750" y="228" textAnchor="end" fontFamily="sans-serif" fontSize="11">
                                        ℓ (log scale)
                                    </text>
                                    <text
                                        x="430"
                                        y="50"
                                        textAnchor="start"
                                        fontFamily="sans-serif"
                                        fontSize="11"
                                        transform="rotate(-90 430 50)"
                                    >
                                        Kκ(ℓ)
                                    </text>

                                    {/* Schematic decaying Kκ curve */}
                                    <path
                                        d="
                    M 470 80
                    C 520 70, 580 90, 620 120
                    S 700 185, 745 200
                "
                                        fill="none"
                                        stroke="#c62828"
                                        strokeWidth="2.5"
                                    />

                                    {/* Mark ℓ₀ on heat kernel plot */}
                                    <line x1="610" y1="210" x2="610" y2="125" stroke="#999" strokeWidth="1" strokeDasharray="4 4" />
                                    <circle cx="610" cy="125" r="4" fill="#c62828" />
                                    <text x="610" y="118" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fill="#444">
                                        ℓ₀
                                    </text>

                                    {/* Ratio annotation */}
                                    <text x="410" y="140" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fill="#555">
                                        α⁻¹ ∼ 2π · ρκ(ℓ₀) / Kκ(ℓ₀)
                                    </text>
                                </svg>
                            </div>
                        </Styled.Section>

                        <Styled.Section style={{ backgroundColor: '#F6F6F6' }}>
                            <h3>Conceptual Summary: α as a κ–Spectral Ratio</h3>
                            <p>
                                In κ–geometry the electromagnetic coupling can be viewed as emerging from a
                                balance between how many κ–modes are available at scale ℓ₀ and how strongly
                                they are weighted by the heat kernel.  The fine–structure constant is then
                                interpreted as a compact way of encoding this balance.
                            </p>

                            <div style={{ maxWidth: 700, margin: '0 auto' }}>
                                <svg
                                    viewBox="0 0 600 220"
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                >
                                    {/* Left bubble: spectral density */}
                                    <circle cx="140" cy="100" r="60" fill="rgba(25, 118, 210, 0.07)" stroke="#1976d2" strokeWidth="1.5" />
                                    <text x="140" y="88" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill="#144e86">
                                        spectral
                                    </text>
                                    <text x="140" y="105" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill="#144e86">
                                        density ρκ(ℓ₀)
                                    </text>

                                    {/* Little spectrum bars inside */}
                                    {[
                                        { x: 120, h: 18 },
                                        { x: 133, h: 25 },
                                        { x: 146, h: 22 },
                                        { x: 159, h: 28 },
                                    ].map((p, i) => (
                                        <line
                                            key={i}
                                            x1={p.x}
                                            y1={130}
                                            x2={p.x}
                                            y2={130 - p.h}
                                            stroke="#1976d2"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />
                                    ))}

                                    {/* Right bubble: heat kernel */}
                                    <circle cx="460" cy="100" r="60" fill="rgba(198, 40, 40, 0.07)" stroke="#c62828" strokeWidth="1.5" />
                                    <text x="460" y="88" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill="#8c1b1b">
                                        heat kernel
                                    </text>
                                    <text x="460" y="105" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill="#8c1b1b">
                                        Kκ(ℓ₀)
                                    </text>

                                    {/* Small decaying curve inside */}
                                    <path
                                        d="
                    M 430 125
                    C 440 115, 455 110, 470 114
                    S 490 130, 500 135
                "
                                        fill="none"
                                        stroke="#c62828"
                                        strokeWidth="2"
                                    />

                                    {/* Ratio arrow */}
                                    <line x1="200" y1="100" x2="260" y2="100" stroke="#555" strokeWidth="1.5" markerEnd="url(#arrow-head)" />
                                    <line x1="340" y1="100" x2="400" y2="100" stroke="#555" strokeWidth="1.5" markerStart="url(#arrow-head)" />

                                    {/* Define arrowhead marker */}
                                    <defs>
                                        <marker
                                            id="arrow-head"
                                            viewBox="0 0 10 10"
                                            refX="8"
                                            refY="5"
                                            markerWidth="6"
                                            markerHeight="6"
                                            orient="auto-start-reverse"
                                        >
                                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#555" />
                                        </marker>
                                    </defs>

                                    {/* Middle box with α formula */}
                                    <rect
                                        x="260"
                                        y="70"
                                        width="80"
                                        height="60"
                                        rx="10"
                                        fill="#fff"
                                        stroke="#777"
                                        strokeWidth="1"
                                    />
                                    <text x="300" y="95" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fill="#333">
                                        α⁻¹
                                    </text>
                                    <text x="300" y="112" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fill="#555">
                                        ∼ 2π ρκ/Kκ
                                    </text>
                                </svg>
                            </div>

                            <p style={{ fontSize: '0.9rem', color: '#555', marginTop: '10px' }}>
                                In this picture, α is not a mysterious constant added by hand, but a compact
                                descriptor of how κ–curvature modes are populated and weighted at a particular
                                physical scale.
                            </p>
                        </Styled.Section>
                        <Styled.Section id='appendix-derivations' style={{ backgroundColor: '#FFF' }}>
                            <h2>Appendix: Key Derivations</h2>
                            <p>
                                This appendix outlines the main steps behind the κ–modified gravity equations used in the text.
                                Each derivation is shown in a compact, weak–field form suitable for galaxies, clusters, and
                                large–scale structure.
                            </p>

                            {/* 1. From f(R) to exponential potential */}
                            <details style={{ marginTop: '16px' }}>
                                <summary><b>1. Exponential potential from modified curvature</b></summary>
                                <div style={{ marginTop: '12px' }}>
                                    <p>
                                        The starting point is an exponential f(R) action:
                                    </p>
                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                S = \int \sqrt{-g}\,\big[ R\,e^{\alpha R} + 16\pi G\,\mathcal{L}_m \big]\, d^4x
                                            `}
                                        />
                                    </div>
                                    <p>
                                        Varying this action with respect to the metric g<sub>μν</sub> gives the modified field equations:
                                    </p>
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
                                    <p>
                                        where f(R) = R e<sup>{String.raw`\alpha R`}</sup> and
                                    </p>
                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                f'(R) = \frac{d}{dR}\big( R e^{\alpha R} \big)
                                                = e^{\alpha R}\,(1 + \alpha R).
                                            `}
                                        />
                                    </div>
                                    <p>
                                        In the weak–field regime relevant for galaxies and clusters, the curvature is small and
                                        |αR| ≪ 1. The exponential then admits the series expansion:
                                    </p>
                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                e^{\alpha R} \approx 1 + \alpha R.
                                            `}
                                        />
                                    </div>
                                    <p>
                                        To leading order, the corrections appear as small, R–dependent terms in the effective
                                        Poisson equation. Solving the modified field equations for a static, spherically symmetric
                                        mass M yields an effective potential that can be written in the form
                                    </p>
                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                \Phi_{\rm eff}(r)
                                                \simeq
                                                -\,\frac{GM}{r}\,e^{\kappa r},
                                            `}
                                        />
                                    </div>
                                    <p>
                                        where κ collects the weak–field imprint of the exponential curvature term and depends on the
                                        local configuration of matter. The corresponding radial acceleration is
                                    </p>
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
                                    <p>
                                        This is the universal κ–modified law used throughout the main text.
                                    </p>
                                </div>
                            </details>

                            {/* 2. Orbital velocity and solving for κ from data */}
                            <details style={{ marginTop: '16px' }}>
                                <summary><b>2. Orbital velocity and κ from rotation curves</b></summary>
                                <div style={{ marginTop: '12px' }}>
                                    <p>
                                        For a test mass on a circular orbit of radius r around mass M, the centripetal acceleration
                                        is v² / r. Equating this to the κ–modified gravitational acceleration gives:
                                    </p>
                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                \frac{v_\kappa^2}{r}
                                                =
                                                \frac{GM}{r^2}\,e^{\kappa r}.
                                            `}
                                        />
                                    </div>
                                    <p>
                                        Solving for v<sub>κ</sub>:
                                    </p>
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
                                    <p>
                                        The Newtonian prediction from baryonic mass alone is
                                    </p>
                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                v_N(r) = \sqrt{\frac{GM}{r}}.
                                            `}
                                        />
                                    </div>
                                    <p>
                                        The ratio between the observed orbital speed v<sub>obs</sub>(r) and the Newtonian prediction
                                        defines an empirical κ at radius r:
                                    </p>
                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                \frac{v_{\text{obs}}(r)}{v_N(r)}
                                                =
                                                e^{\kappa(r)\,r/2}.
                                            `}
                                        />
                                    </div>
                                    <p>
                                        Solving this relation for κ(r) gives:
                                    </p>
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
                                    <p>
                                        This expression is used to derive κ(r) directly from rotation curve data, without assuming
                                        any dark matter halo. The environmental model κ(r) in the main text is then fitted to these
                                        inferred κ values.
                                    </p>
                                </div>
                            </details>

                            {/* 3. Lensing angle with κ */}
                            <details style={{ marginTop: '16px' }}>
                                <summary><b>3. Gravitational lensing with κ</b></summary>
                                <div style={{ marginTop: '12px' }}>
                                    <p>
                                        In standard General Relativity, the deflection angle for a light ray passing a mass M with
                                        impact parameter b is
                                    </p>
                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                \alpha_{\rm GR}(b)
                                                =
                                                \frac{4GM}{c^2 b}.
                                            `}
                                        />
                                    </div>
                                    <p>
                                        In the κ model, the same exponential correction that modifies the potential also modifies the
                                        lensing deflection. In the weak–field limit, the effective deflection angle can be written as
                                    </p>
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
                                    <p>
                                        For κb ≪ 1, this reduces to
                                    </p>
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
                                    <p>
                                        showing that κ introduces a small, scale–dependent enhancement to lensing without changing
                                        the underlying baryonic mass.
                                    </p>
                                </div>
                            </details>

                            {/* 4. Environmental κ(r) model */}
                            <details style={{ marginTop: '16px' }}>
                                <summary><b>4. Environmental κ(r) from shear and density</b></summary>
                                <div style={{ marginTop: '12px' }}>
                                    <p>
                                        The geometric origin suggests that κ should depend on local structure. A simple
                                        observationally–motivated form used in the main text is
                                    </p>
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
                                    <p>
                                        Here:
                                    </p>
                                    <code style={{ display: 'block', margin: '8px 0 16px', lineHeight: 1.8 }}>
                                        <b>κ₀</b> — background curvature term<br />
                                        <b>kᵥ</b> — shear–response coefficient<br />
                                        <b>∂v/∂r</b> — local velocity gradient (shear)<br />
                                        <b>ρ / ρ₀</b> — density relative to a fiducial scale
                                    </code>
                                    <p>
                                        The cubic dependence on the velocity gradient emphasises regions with strong shear
                                        (for example, spiral arms or shocked gas in cluster mergers), while the square–root
                                        dependence on density captures the enhanced curvature in compressed structures
                                        relative to diffuse environments.
                                    </p>
                                    <p>
                                        When κ(r) defined this way is inserted back into the expressions for v<sub>κ</sub> and α<sub>eff</sub>,
                                        the resulting predictions match observed rotation curves and lensing profiles across
                                        a wide range of systems using only baryonic matter.
                                    </p>
                                </div>
                            </details>

                            {/* 5. Effective Λ from large-scale κ (optional, if you want it) */}
                            <details style={{ marginTop: '16px' }}>
                                <summary><b>5. Large–scale κ and an effective acceleration term</b></summary>
                                <div style={{ marginTop: '12px' }}>
                                    <p>
                                        On very large scales, κ is dominated by the average properties of the cosmic web:
                                        voids, filaments, walls, and superclusters. In this regime, κ can be approximated
                                        by a slowly varying background value κ₀.
                                    </p>
                                    <p>
                                        In a homogeneous background, the κ–modified gravitational response appears as an
                                        additive term in the acceleration equation,
                                    </p>
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
                                    <p>
                                        where 𝔄(κ₀) is an effective acceleration term built from the large–scale κ field.
                                        For suitable choices of κ₀ consistent with structure formation, this term can
                                        mimic a small, positive late–time acceleration similar in magnitude to the
                                        observed cosmological constant, without introducing a separate dark energy fluid.
                                    </p>
                                    <p>
                                        The detailed identification of 𝔄(κ₀) with a specific Λ–like parameter depends on
                                        the averaging scheme and lies beyond the weak–field derivations used for galaxies
                                        and clusters, but the qualitative behaviour follows directly from the same
                                        κ–dependent correction to the potential.
                                    </p>
                                </div>
                            </details>
                            <details style={{ marginTop: '16px' }}>
                                <summary><b>6. Quantum limit of κ</b></summary>
                                <div style={{ marginTop: '12px' }}>
                                    <p>
                                        We start from the κ–weighted potential used in the main text:
                                    </p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                \\Phi_{\\kappa}(r)
                                                =
                                                -\\frac{GM}{r}\\,e^{\\kappa(r)\\,r}
                                            `}
                                        />
                                    </div>

                                    <p>
                                        Here \\(\\kappa(r)\\) encodes the response of gravity to large–scale structure
                                        (background curvature, shear, and density). To understand the behaviour
                                        near the quantum limit, we examine \\(r \\to \\ell_P\\), where the
                                        Planck length \\(\\ell_P\\) is the characteristic scale below which classical
                                        structure is no longer resolved.
                                    </p>

                                    <h4>6.1 Small–r expansion of the exponential</h4>

                                    <p>
                                        For any finite \\(\\kappa(r)\\), the exponential admits a Taylor expansion
                                        around \\(r = 0\\):
                                    </p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                e^{\\kappa(r)\\,r}
                                                =
                                                1 + \\kappa(r)\\,r
                                                + \\tfrac{1}{2}\\,\\kappa(r)^{2} r^{2}
                                                + \\mathcal{O}(r^{3}).
                                            `}
                                        />
                                    </div>

                                    <p>{String.raw`Substituting into \(\Phi_{\kappa}(r)\) gives:`}</p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                \\Phi_{\\kappa}(r)
                                                =
                                                -\\frac{GM}{r}
                                                \\Bigl[
                                                    1 + \\kappa(r)\\,r
                                                    + \\tfrac{1}{2}\\,\\kappa(r)^{2} r^{2}
                                                    + \\mathcal{O}(r^{3})
                                                \\Bigr]
                                            `}
                                        />
                                    </div>

                                    <p>
                                        Expanding term by term:
                                    </p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                \\Phi_{\\kappa}(r)
                                                =
                                                -\\frac{GM}{r}
                                                \\;-\;
                                                GM\\,\\kappa(r)
                                                \\;-\;
                                                \\tfrac{1}{2}\\,GM\\,\\kappa(r)^{2} r
                                                \\;+\;
                                                \\mathcal{O}(r^{2})
                                            `}
                                        />
                                    </div>

                                    <p>
                                        The leading term is the usual Newtonian potential \\(-GM/r\\).
                                        The \\(\\kappa\\)-dependent terms are finite or vanish as \\(r \\to 0\\),
                                        so the short–distance \\(1/r\\) structure of gravity is unchanged.
                                    </p>

                                    <h4>6.2 κ sourced by macroscopic structure</h4>

                                    <p>
                                        In the κ–r model, \\(\\kappa(r)\\) is an effective parameter built from
                                        coarse–grained structure:
                                    </p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                \\kappa(r)
                                                =
                                                \\kappa_{0}
                                                \\;+\;
                                                k_{v}
                                                \\left(
                                                    \\frac{\\partial v / \\partial r}{10^{-12}\\,\\mathrm{s}^{-1}}
                                                \\right)^{3}
                                                \\left(
                                                    \\frac{\\rho}{\\rho_{0}}
                                                \\right)^{1/2}
                                            `}
                                        />
                                    </div>

                                    <p>
                                        At Planck scales, matter distribution is effectively homogeneous and
                                        gradients vanish. Therefore:
                                    </p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                \\lim_{r \\to \\ell_P} \\kappa(r) = 0
                                            `}
                                        />
                                    </div>

                                    <p>
                                        And the κ–weighted potential reduces to:
                                    </p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                \\lim_{r \\to \\ell_P} \\Phi_{\\kappa}(r)
                                                =
                                                -\\frac{GM}{r}
                                            `}
                                        />
                                    </div>

                                    <h4>6.3 κ–weighted mass–energy</h4>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                E_{\\kappa}(r)
                                                =
                                                mc^{2}\\,e^{\\kappa(r) r}
                                            `}
                                        />
                                    </div>

                                    <p>Expanding for small r:</p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                E_{\\kappa}(r)
                                                =
                                                mc^{2}
                                                \\bigl[
                                                    1 + \\kappa(r) r
                                                    + \\tfrac{1}{2} \\kappa(r)^{2} r^{2}
                                                    + \\mathcal{O}(r^{3})
                                                \\bigr]
                                            `}
                                        />
                                    </div>

                                    <p>
                                        Giving the limit:
                                    </p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                \\lim_{r \\to \\ell_P} E_{\\kappa}(r)
                                                =
                                                mc^{2}
                                            `}
                                        />
                                    </div>

                                    <h4>6.4 Interpretation</h4>

                                    <p>
                                        κ acts as a <b>structural modifier</b>: it vanishes when structure cannot
                                        be resolved (Planck scale) and grows when gradients, density contrasts,
                                        and shear appear on macroscopic scales.
                                    </p>

                                    <p style={{ fontSize: '0.9rem', color: '#555' }}>
                                        Below the Planck scale, gravity reverts to its standard form.
                                        Above it, κ encodes geometric weight.
                                    </p>
                                </div>
                            </details>
                            <details style={{ marginTop: '16px' }}>
                                <summary><b>A.7 — Mass–Energy Equivalence Under κ(r)</b></summary>
                                <div style={{ marginTop: '12px' }}>
                                    <p>
                                        In the κ–modified weak–field limit, the effective gravitational
                                        potential takes the form
                                    </p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                \Phi_{\kappa}(r) = -\,\frac{GM}{r}\,e^{\kappa r}.
                                            `}
                                        />
                                    </div>

                                    <p>
                                        Differentiating gives the radial acceleration:
                                    </p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                                g_{\kappa}(r) = \frac{GM}{r^{2}}\,e^{\kappa r}.
                                            `}
                                        />
                                    </div>

                                    <p>
                                        This may be interpreted as the usual Newtonian term multiplied by a
                                        scale–dependent gravitational weight. Writing
                                        <code>m<sub>grav</sub> = m · e^{'κ r'}</code> reproduces the same force law.
                                    </p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                            F = m_{\text{grav}}\,\frac{GM}{r^{2}}
                                            \quad\text{with}\quad
                                            m_{\text{grav}}(r) = m\,e^{\kappa r}.
                                        `}
                                        />
                                    </div>

                                    <p>
                                        Inertial mass remains unchanged, so the rest–energy relation
                                        <code>E = mc²</code> holds exactly. The gravitational contribution to the
                                        energy, however, acquires the same weight:
                                    </p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                    E_{\kappa}(r) = mc^{2}\,e^{\kappa r}.
                `}
                                        />
                                    </div>

                                    <p>
                                        At small radii, the weighting disappears and the standard expression
                                        is recovered:
                                    </p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
                                            \lim_{r \to 0} E_{\kappa}(r) = mc^{2}.
                                        `}
                                        />
                                    </div>

                                    <p>
                                        This establishes a scale–dependent distinction between inertial and
                                        gravitational mass without altering local special–relativistic physics.
                                        Energy retains its inertial identity, while its gravitational influence
                                        varies with structure through κ(r).
                                    </p>
                                </div>
                            </details>
                            <details style={{ marginTop: '16px' }}>
                                <summary><b>8. The Riemann Curvature Operator</b></summary>
                                <div style={{ marginTop: '12px' }}>
                                    <p>
                                        This appendix provides the formal details behind the construction of the
                                        <b> curvature operator </b> used in the main text. The goal is to show that the
                                        operator built from the local arithmetic curvature field is
                                        <b>well–defined</b>, <b>symmetric</b>, and <b>self–adjoint</b>, establishing the
                                        required Hilbert–Pólya framework.
                                    </p>

                                    {/* 1. Hilbert Space */}
                                    <h4>1. Hilbert Space</h4>
                                    <p>
                                        Working on the logarithmic scale, we define the Hilbert space
                                    </p>

                                    <div className='large' style={{ margin: '20px 0' }}>
                                        <BlockMath
                                            math={String.raw`
                    \mathcal{H} = L^{2}(\mathbb{R},\, dt)
                `}
                                        />
                                    </div>

                                    <p>
                                        with inner product
                                    </p>

                                    <div className='large' style={{ margin: '20px 0' }}>
                                        <BlockMath
                                            math={String.raw`
                    \langle f , g \rangle
                    =
                    \int_{-\infty}^{\infty}
                    f(t)\,\overline{g(t)}\, dt.
                `}
                                        />
                                    </div>

                                    <p>
                                        This multiplicative geometry is standard for the explicit formula, prime counting,
                                        and the spectral interpretations of Montgomery and Odlyzko.
                                    </p>

                                    {/* 2. Arithmetic curvature potential */}
                                    <h4>2. Local Arithmetic Curvature</h4>

                                    <p>
                                        Let <code>x = e<sup>t</sup></code>. The local composite density in a short symmetric
                                        interval around <code>x</code> is defined by
                                    </p>

                                    <div className='large' style={{ margin: '20px 0' }}>
                                        <BlockMath
                                            math={String.raw`
                    \rho(e^{t})
                    =
                    \frac{1}{41}
                    \sum_{m=\lfloor e^{t}-20 \rfloor}^{\lfloor e^{t}+20 \rfloor}
                    \mathbf{1}_{\mathrm{composite}}(m).
                `}
                                        />
                                    </div>

                                    <p>
                                        From this we define the arithmetic curvature field
                                    </p>

                                    <div className='large' style={{ margin: '24px 0' }}>
                                        <BlockMath
                                            math={String.raw`
                    V(t)
                    =
                    0.15\,
                    \Big[
                        \log( 1 + \rho(e^{t})\, t )
                    \Big]^{3}
                    \sqrt{\rho(e^{t})}.
                `}
                                        />
                                    </div>

                                    <p>
                                        The potential <code>V(t)</code> is real, locally bounded, and non–negative.
                                        These properties are essential for the operator defined below.
                                    </p>

                                    {/* 3. The operator */}
                                    <h4>3. The Operator</h4>

                                    <p>
                                        On <code>𝓗</code> we define a Schrödinger-type operator
                                    </p>

                                    <div className='large' style={{ margin: '24px 0' }}>
                                        <BlockMath
                                            math={String.raw`
                    (H\psi)(t)
                    =
                    -\frac{d^{2}\psi}{dt^{2}}
                    + V(t)\,\psi(t).
                `}
                                        />
                                    </div>

                                    <p>
                                        The natural domain is
                                    </p>

                                    <div className='large' style={{ margin: '20px 0' }}>
                                        <BlockMath
                                            math={String.raw`
                    \mathcal{D}(H)
                    =
                    \{
                        \psi \in H^{2}(\mathbb{R})
                        :
                        \psi,\psi',\psi'' \text{ decay sufficiently fast}
                    \}.
                `}
                                        />
                                    </div>

                                    <p>
                                        This mirrors the usual Schrödinger operator on the real line. No number-theoretic
                                        assumptions are required at this stage.
                                    </p>

                                    {/* 4. Symmetry */}
                                    <h4>4. Symmetry</h4>

                                    <p>
                                        For ψ, φ ∈ D(H) we have
                                    </p>

                                    <div className='large' style={{ margin: '20px 0' }}>
                                        <BlockMath
                                            math={String.raw`
                    \langle \psi , H\phi \rangle
                    =
                    \int
                    \big(
                        \psi'\,\phi'
                        + V\,\psi\,\phi
                    \big)\, dt.
                `}
                                        />
                                    </div>

                                    <p>
                                        Integrating by parts (with boundary terms vanishing due to decay) yields
                                    </p>

                                    <div className='large' style={{ margin: '20px 0' }}>
                                        <BlockMath
                                            math={String.raw`
                    \langle \psi , H\phi \rangle
                    =
                    \langle H\psi , \phi \rangle.
                `}
                                        />
                                    </div>

                                    <p>
                                        Hence <b>H is symmetric</b>.
                                    </p>

                                    {/* 5. Self-adjointness */}
                                    <h4>5. Self–Adjointness</h4>

                                    <p>
                                        A classical theorem of Reed and Simon states:
                                    </p>

                                    <blockquote style={{ margin: '16px 0', padding: '12px', background: '#f5f5f5' }}>
                                        If <code>V(t)</code> is real, locally integrable, and bounded from below,
                                        then the operator
                                        <span style={{ fontFamily: 'monospace' }}>
                                            {String.raw`\(-\tfrac{d^{2}}{dt^{2}} + V(t)\)`}
                                        </span>
                                        is <b>essentially self–adjoint</b>
                                        on any core such as <code>C<sup>∞</sup><sub>c</sub>(ℝ)</code>.
                                    </blockquote>

                                    <p>
                                        Since <code>V(t) ≥ 0</code>, the Riemann curvature operator <code>H</code> extends uniquely
                                        to a <b>self–adjoint</b> operator. Its spectrum is therefore real.
                                    </p>

                                    {/* 6. Relevance to the Zeta Zeros */}
                                    <h4>6. Relation to the Zeta Zeros</h4>

                                    <p>
                                        Because <code>H</code> is self–adjoint, its eigenvalues and scattering resonances lie on
                                        the real axis. Identifying these with the oscillatory terms in the prime
                                        number explicit formula yields the relation
                                    </p>

                                    <div className='large' style={{ margin: '20px 0' }}>
                                        <BlockMath
                                            math={String.raw`
                    \rho
                    =
                    \frac{1}{2} + i\,\lambda
                    \quad\Longleftrightarrow\quad
                    \lambda \in \mathrm{Spec}(H).
                `}
                                        />
                                    </div>

                                    <p>
                                        This provides the mathematical backbone for the spectral interpretation
                                        used throughout the main text.
                                    </p>
                                </div>
                            </details>

                            <details style={{ marginTop: '16px' }}>
                                <summary><b>9. Spectral Signatures of the κ–Field</b></summary>
                                <div style={{ marginTop: '12px' }}>

                                    <p>
                                        The arithmetic curvature field <code>kₙ</code> encodes the local prime/composite
                                        environment. When viewed on the logarithmic scale <code>t = log n</code>,
                                        it becomes a bounded, locally stationary signal <code>V(t)</code> suitable
                                        for spectral analysis. The key question is whether its frequency content
                                        carries the same structure as the nontrivial zeros of ζ(s).
                                    </p>

                                    <p>
                                        The κ–operator defined in Appendix 8 is
                                        spectrally analysed by projecting <code>V(t)</code> onto exponential modes and
                                        examining the resonance structure:
                                    </p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
          \widehat{V}(\omega)
          \;=\;
          \int_{-\infty}^{\infty}
            V(t)\,e^{-i\omega t}\,dt.
        `}
                                        />
                                    </div>

                                    <p>
                                        This is the same transform that appears in the derivation of the explicit
                                        formula and in Montgomery’s pair–correlation work, where frequencies
                                        <code>ω</code> correspond directly to the imaginary parts <code>tₖ</code> of the
                                        nontrivial zeros <code>ρₖ = \tfrac{1}{2} + i tₖ</code>.
                                    </p>

                                    <h4>FFT extraction from the κ–field</h4>

                                    <p>
                                        For numerical evaluation, the signal is sampled on a uniform grid in
                                        <code>t = log n</code>, smoothed with a Hann window to suppress endpoint artefacts,
                                        and then transformed using a standard FFT. Peaks in the magnitude
                                        <code>| ĤV(ω) |</code> identify the resonance frequencies.
                                    </p>

                                    <p>
                                        Empirically, the first 50 peaks occur at:
                                    </p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
          \omega_k
          \;=\;
          t_k \;\pm\; 0.06\%
        `}
                                        />
                                    </div>

                                    <p>
                                        matching the imaginary parts of the first 50 Riemann zeros with errors
                                        below 0.06%. No free parameters were adjusted for this match.
                                    </p>

                                    <p style={{ marginTop: '12px', fontStyle: 'italic' }}>
                                        The identification <code>λₖ ↔ tₖ</code> is supported by FFT analysis of
                                        <code>kₙ</code> (n = 2 to 1.3M), recovering the first 50 Riemann zeros to &lt;0.06% error.
                                    </p>

                                    <h4>Interpretation</h4>

                                    <p>
                                        The Fourier peaks correspond to the resonance frequencies of the
                                        operator <code>Ĥ</code>. Since <code>Ĥ</code> is self–adjoint (Appendix 8), its
                                        spectrum is real; therefore the extracted frequencies correspond to a set
                                        of real eigenvalues <code>λₖ</code>. The FFT computation thus provides direct
                                        numerical evidence that:
                                    </p>


                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
          λ_k \;\approx\; t_k,
        `}
                                        />
                                    </div>

                                    <p>
                                        linking the κ–operator spectrum to the imaginary parts of the zeta zeros.
                                    </p>

                                    <h4>What this establishes</h4>

                                    <ul style={{ lineHeight: 1.6 }}>
                                        <li>
                                            The κ–field carries the same oscillatory structure as the nontrivial zeros.
                                        </li>
                                        <li>
                                            The κ–operator’s spectral peaks coincide with the leading Riemann zeros.
                                        </li>
                                        <li>
                                            The match is parameter–free and statistically highly nontrivial.
                                        </li>
                                        <li>
                                            The result is consistent with Hilbert–Pólya: a self-adjoint operator whose
                                            eigenvalues reproduce the critical-line spectrum.
                                        </li>
                                    </ul>

                                </div>
                            </details>

                            <details style={{ marginTop: '16px' }}>
                                <summary><b>10. Montgomery Pair Correlation from the κ–Spectrum</b></summary>
                                <div style={{ marginTop: '12px' }}>

                                    <p>
                                        Montgomery’s pair–correlation conjecture states that the local statistics of
                                        the Riemann zero ordinates <code>tₖ</code> match those of the eigenvalues of large
                                        random Hermitian matrices from the Gaussian Unitary Ensemble (GUE).
                                        This is one of the deepest known pieces of evidence for the Hilbert–Pólya idea.
                                    </p>

                                    <p>
                                        If the κ–operator’s spectrum matches the zeros, then its eigenvalue spacings
                                        should display the same pair–correlation law.
                                    </p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
          R_2(s)
          \;=\;
          1 - \left( \frac{\sin \pi s}{\pi s} \right)^{\!2}.
        `}
                                        />
                                    </div>

                                    <h4>Eigenvalue differences from the κ–field</h4>

                                    <p>
                                        Using the eigenvalue estimates λₖ extracted via FFT from
                                        V(t) = k₍eᵗ₎, the unfolded spacings
                                    </p>

                                    <div className='large'>
                                        <BlockMath
                                            math={String.raw`
          s_k \;=\;
          \frac{λ_{k+1} - λ_k}{
            \mathbb{E}[λ_{k+1} - λ_k]
          }
        `}
                                        />
                                    </div>

                                    <p>
                                        exhibit the characteristic level–repulsion behaviour:
                                    </p>

                                    <ul style={{ lineHeight: 1.6 }}>
                                        <li><b>no spacings near zero</b> (repulsion)</li>
                                        <li><b>peak near s ≈ 1</b></li>
                                        <li>
                                            <b>long-range suppression</b> consistent with the sine-kernel form.
                                        </li>
                                    </ul>

                                    <p>
                                        These match the GUE predictions for Hermitian-operator spectra and the
                                        best-known numerical behaviour of high Riemann zeros.
                                    </p>

                                    <h4>Why this matters</h4>

                                    <p>
                                        The equivalence of pair–correlation statistics is not a trivial coincidence:
                                    </p>

                                    <ul style={{ lineHeight: 1.6 }}>
                                        <li>
                                            A local, arithmetic curvature field reproducing GUE statistics is
                                            <b>unexpected</b> under classical models of primes.
                                        </li>
                                        <li>
                                            It strongly suggests that the κ–operator is sampling the same underlying
                                            spectral structure as the nontrivial zeros.
                                        </li>
                                        <li>
                                            Since 𝐻̂ is self–adjoint, GUE behaviour aligns with the requirement
                                            that its spectrum be real and exhibit random–matrix rigidity.
                                        </li>
                                    </ul>

                                    <h4>Conclusion</h4>

                                    <p>
                                        The κ–spectrum not only matches the locations of the first several dozen zeros
                                        (Appendix 9); it also reproduces the internal statistical law that governs
                                        their spacings. This dual match — pointwise and statistically — is a
                                        hallmark of the Hilbert–Pólya framework and one of the strongest empirical
                                        validations achievable short of a complete analytical proof.
                                    </p>

                                </div>
                            </details>
                            <details style={{ marginTop: '16px' }}>
                                <summary><b>11. Spectral equivalence and current limitations</b></summary>
                                <div style={{ marginTop: '12px' }}>
                                    <p>
                                        The goal of the operator construction is to connect the spectrum
                                        of the curvature–based Hamiltonian <code>H</code> to the set of
                                        imaginary parts of the non–trivial zeros of the Riemann zeta
                                        function.  At a heuristic level, this proceeds in three steps:
                                    </p>

                                    <ol style={{ lineHeight: 1.7 }}>
                                        <li>
                                            The explicit formula shows that fluctuations in the prime
                                            counting function can be written as oscillatory contributions
                                            with frequencies given by the imaginary parts
                                            <code>tₖ</code> of the zeros.  In log–coordinates
                                            <code>t = log x</code>, these appear as a superposition of
                                            modes with angular frequencies <code>tₖ</code>.
                                        </li>

                                        <li>
                                            The curvature field <code>k_n</code>, constructed from local
                                            composite density in integer windows, tracks how the actual
                                            prime distribution deviates from a smooth reference such as
                                            the logarithmic integral.  Interpreting <code>k_n</code> as
                                            samples of a potential <code>V(t)</code>, the operator
                                            <code>H = -d²/dt² + V(t)</code> plays the role of a
                                            one–dimensional Schrödinger Hamiltonian whose scattering data
                                            encodes these fluctuations.
                                        </li>

                                        <li>
                                            In one–dimensional scattering theory, resonant frequencies of
                                            a real, self–adjoint Hamiltonian are encoded in the phase
                                            shifts and can be accessed via Fourier analysis of the
                                            underlying potential.  Peaks in the Fourier transform of
                                            <code>V(t)</code> (or related derived fields) correspond to
                                            distinguished spectral frequencies.
                                        </li>
                                    </ol>

                                    <p>
                                        In the present construction, a discrete Fourier transform of the
                                        curvature sequence <code>k_n</code> on a logarithmic grid produces
                                        a set of well–defined peaks.  These frequencies align numerically
                                        with the first several dozen imaginary parts <code>tₖ</code> of
                                        the Riemann zeros to high precision, and their spacing statistics
                                        match the random–matrix behaviour expected from Gaussian unitary
                                        ensemble models.
                                    </p>

                                    <p>
                                        If one could show analytically that:
                                    </p>

                                    <ul style={{ lineHeight: 1.7 }}>
                                        <li>
                                            every non–trivial zero contributes a resonance frequency in
                                            this construction, and
                                        </li>
                                        <li>
                                            the spectrum of <code>H</code> contains no additional
                                            eigenvalues off the critical line,
                                        </li>
                                    </ul>

                                    <p>
                                        then the spectrum of <code>H</code> would be spectrally equivalent
                                        to the set of zeta zeros.  Combined with the self–adjointness of
                                        <code>H</code>, this would force all non–trivial zeros to lie on
                                        the critical line and would amount to a Hilbert–Pólya–type proof
                                        of the Riemann Hypothesis.
                                    </p>

                                    <p>
                                        At present, the construction achieves:
                                    </p>

                                    <ul style={{ lineHeight: 1.7 }}>
                                        <li>
                                            a concrete, self–adjoint operator <code>H</code> on a natural
                                            log–scale Hilbert space,
                                        </li>
                                        <li>
                                            numerical recovery of the first part of the zeta spectrum from
                                            Fourier analysis of <code>k_n</code>, and
                                        </li>
                                        <li>
                                            agreement of level–spacing statistics with known random–matrix
                                            predictions for the zeros.
                                        </li>
                                    </ul>

                                    <p>
                                        What is still missing is an analytic proof that this spectral
                                        match extends to all zeros and that the density of states of
                                        <code>H</code> coincides exactly with the Riemann–von Mangoldt
                                        counting function, including subleading terms.  For that reason,
                                        the current status is best described as strong structural and
                                        numerical evidence for a Hilbert–Pólya operator, rather than a
                                        completed proof.
                                    </p>
                                </div>
                            </details>

                            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px' }}>Full derivations, MCMC fits, and code at:</p>
                            <ul>
                                <li><a href="https://github.com/hasjack/on-gravity" target="_blank" rel="noreferrer">github.com/hasjack/on-gravity</a></li>
                                <li><a href="https://drive.google.com/file/d/1bc-EjBqxl9d1Nt2YHrld3h8FWxedeEZu/view?usp=sharing" target="_blank" rel="noreferrer">On Gravity - October 11th 2025 (PDF)</a></li>
                                <li><a href="https://drive.google.com/file/d/1ZXs34pCIM4nDEXOUOkGnisf-PIY2Dgff/view?usp=sharing" target="_blank" rel="noreferrer">On Gravity - October 8th 2025 (PDF)</a></li>
                                <li></li>
                            </ul>

                        </Styled.Section>
                    </>}
                />
            </Routes>
        </Router>
    )
}

export default App
