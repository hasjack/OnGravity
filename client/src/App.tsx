
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { BlockMath/* , InlineMath */ } from 'react-katex'
import BulletCluster from './BulletCluster'
import GalacticRotation from './results/GalacticRotation'
import LocalGroup from './LocalGroup'
// import GalaxySliders from './GalaxySliders'
import LensingTable from './results/Lensing'
import MercuryPrecession from './MercuryPrecession'
import OortCloudKappa from './OortCloudKappa'
import QuantumScaleSlider from './QuantumScaleSlider'
import SuperclusterFlow from './SuperclusterFlow'
import TOVBaseball from './TOVBaseball'
import * as Styled from './App.style'

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

                        <Styled.Graphic style={{ backgroundImage: `url('https://c.tadst.com/gfx/1200x675/mercury.jpg?1')`, backgroundColor: '#000', backgroundSize: 'auto 100%' }} />
                        <Styled.Section style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#FFF' }}>
                            <MercuryPrecession />
                        </Styled.Section>

                        <Styled.Section style={{ backgroundColor: '#FFF' }}>
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

                            {/* Optional future table / plot */}
                            {/* <InterstellarVisitors /> */}
                        </Styled.Section>


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
