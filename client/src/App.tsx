
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { BlockMath/* , InlineMath */ } from 'react-katex'
import BulletCluster from './BulletCluster'
import GalacticRotation from './results/GalacticRotation'
import LocalGroup from './LocalGroup'
// import GalaxySliders from './GalaxySliders'
import LensingTable from './results/Lensing'
import SuperclusterFlow from './SuperclusterFlow'
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
                                the large-scale gravitational potential.  When averaged over cosmological
                                distances—dominated by voids rather than dense structures—it produces a
                                small net positive contribution to the integrated potential:
                                an emergent large-scale acceleration.
                            </p>

                            <div style={{ fontSize: '32px' }}>
                                <BlockMath math={String.raw`
                                    \Phi(r) \;=\; -\frac{GM}{r}\,e^{\kappa r}
                                `} />
                            </div>

                            <p><i>κ</i> induces a distance-dependent gravitational response that, when smoothed across the cosmic web, acts like the cosmological constant Λ, but arises from structure rather than vacuum energy.</p>

                            <div style={{ fontSize: '32px' }}>
                                <BlockMath math={String.raw`
                                    a(r) \;=\; -\nabla\Phi
                                    \;\Rightarrow\;
                                    a(r) \;\approx\; -\frac{GM}{r^2}\,\bigl(1 + \kappa r\bigr)
                                `} />
                            </div>

                            <p>
                                For large <i>r</i>, the additional term behaves as a small outward acceleration proportional
                                to <i>κ</i>:
                            </p>

                            <div style={{ fontSize: '32px' }}>
                                <BlockMath math={String.raw`
                                    a_{\text{large-scale}} \;\propto\; \kappa
                                `} />
                            </div>
                        </Styled.Section>
                        <Styled.Section style={{ backgroundColor: '#F6F6F6' }}>
                            <h3>Substituting this into the Friedmann acceleration equation yields the term:</h3>

                            <div style={{ fontSize: '32px' }}>
                                <BlockMath math={'\\frac{\\ddot{a}}{a} = -\\frac{4\\pi G}{3}\\rho_{\\text{eff}} \\; + \\; \\underbrace{\\frac{\\kappa c^2}{3}}_{\\text{emerges as } \\\\Lambda_{\\text{eff}}}'} />
                            </div>

                            <h3>ergo:</h3>

                            <div style={{ fontSize: '36px', marginBottom: '12px', marginTop: 0, }}>
                                <BlockMath math={String.raw`
                                    \Lambda_{\text{eff}} \;=\; \frac{\kappa c^2}{3}
                                `} />
                            </div>

                            <p>For κ ≈ 2.6×10<sup>−26</sup> m⁻¹ (from fits to supercluster flows):</p>
                            <h2>Λ<sub>eff</sub> ≈ 2.3×10<sup>−52</sup> m⁻²</h2>
                            <h3>✅ Numerically consistent with the observed Λ<sub>ΛCDM</sub> value! ✅</h3>
                        </Styled.Section>
                        <Styled.Section style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff' }}>
                            <h2>The Hubble Tension</h2>
                            <p>
                                The difference between early-universe and late-universe measurements of <i>H₀</i> can be viewed through the same κ-lens as our
                                supercluster flows.  Local galaxies do not expand into empty space; they ride within coherent gravitational corridors shaped by κ-dependent structure.
                            </p>
                            <p>Within these overdense regions, the effective expansion rate is slightly enhanced:</p>
                            <div style={{ fontSize: '32px' }}>
                                <BlockMath math={String.raw`
                                    H_0^{(\kappa)} \;\simeq\;
                                    H_0^{(\text{CMB})}
                                    \left(1 + \beta\,\kappa\,r_{\text{local}}\right)
                                `} />
                            </div>

                            <p>where β ≈ 1–2 parameterises structural coupling between local flows and global expansion.</p>
                            <p style={{ marginBottom: 0 }}>For a representative <i>κ</i> ≈ 0.008 Mpc⁻¹ and <i>r</i><sub>local</sub> ≈ 100 Mpc:</p>
                            <h3>ΔH₀ ≈ H₀(CMB) × (β κ r) ≈ 67 × (1 + 0.008 × 100 × 1.2) ≈ 73 km s⁻¹ Mpc⁻¹</h3>
                            <p>✅ Precisely the shift observed between Planck (67.4 ± 0.5) and SH₀ES (73 ± 1.0) measurements! ✅</p>
                            <p>The “tension” is resolved by tracing the same structural acceleration seen in basin and supercluster maps: arising naturally from the κ-shaped fabric of cosmic structure.</p>
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
                    </>}
                />
            </Routes>
        </Router>
    )
}

export default App
