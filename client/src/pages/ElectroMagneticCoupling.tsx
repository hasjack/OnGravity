import { BlockMath } from 'react-katex'
import P from '../components/P'

const ElectroMagneticCoupling = () => {
    return (
        <section className="relative min-h-dvh snap-start flex flex-col items-center text-gray-800 bg-white">
            <div className="relative max-w-5xl min-h-dvh snap-start flex flex-col py-24">
                <h1 className="text-base text-xl md:text-3xl px-4 mb-8 text-center">
                    κ–Geometry and the Electromagnetic Coupling
                </h1>
                <P>
                    The fine–structure constant α ≈ 1/137.036 is a dimensionless measure of
                    electromagnetic interaction strength.  Despite its importance, no accepted
                    derivation from first principles exists.  The κ–framework developed earlier
                    introduces a curvature field built from local density, scale–dependence, and
                    nonlinear response, suggesting a new geometric route for expressing α.
                </P>

                <P>
                    In this approach, electromagnetic coupling emerges from scale–weighted curvature.
                    The same log–sensitive κ–structure used in the Riemann operator can be carried
                    over to the hierarchy between the Bohr radius and the ultraviolet vacuum
                    fluctuation scale.  This produces a natural, dimensionless geometric quantity
                    that can act as a coupling constant.
                </P>

                <P>
                    The goal is not to compute α numerically, but to identify a structural mechanism
                    by which α could arise as a ratio of spectral quantities in a κ–geometry.
                </P>

                <h3>κ–Weighted Geometry Across Physical Scales</h3>

                <P>
                    Electromagnetic interaction effectively interpolates between two characteristic
                    lengths: the atomic scale where bound states form, and a short–distance scale
                    where vacuum fluctuations dominate.  Between these regimes the κ–curvature
                    provides a natural log–weighted measure of how geometry changes with scale.
                </P>

                <P>
                    A κ–weighted geometric functional over a length scale ℓ is defined as
                </P>

                <div className='large'>
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

                <P>
                    This quantity is dimensionless and encodes how curvature accumulates locally
                    under log–uniform scaling.  Objects of this type appear naturally in spectral
                    geometry, where coupling constants arise from weighted ratios of geometric
                    invariants extracted from an underlying operator.
                </P>

                <h3>Spectral Ratio Ansatz for the Fine–Structure Constant</h3>

                <P>
                    The κ–operator introduced earlier,
                    <code>H = -d²/dt² + V(t)</code>, possesses a real spectrum and a well–defined
                    heat kernel.  These objects allow the construction of a dimensionless ratio
                    analogous to those appearing in the spectral action expansion of
                    Connes–Chamseddine theory.  The proposal is that α arises from a κ–spectral
                    ratio evaluated at a universal crossover scale ℓ₀.
                </P>

                <div className='large'>
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

                <P>
                    Here ρₖ is the spectral density and Kₖ the heat–kernel amplitude of the κ–
                    operator.  A correct κ–geometry would produce a stable ratio close to 137,
                    with its known slow running emerging from κ’s logarithmic scale dependence.
                    The ansatz is structural rather than numerical, and provides a genuinely
                    geometric starting point for understanding α.
                </P>
                <h3>Figure: κ–Weighted Geometry Across Scales</h3>
                <P>
                    A schematic view of how the κ–curvature responds across physical scales, from
                    atomic distances up to a universal crossover scale ℓ₀ and beyond. The idea is
                    that electromagnetic coupling samples a narrow window of this curve.
                </P>

                <svg
                    viewBox="0 0 600 260"
                    style={{ width: '80%', height: 'auto', display: 'block' }}
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

                <h3>Figure: Spectral Density and Heat Kernel in κ–Geometry</h3>
                <P>
                    The κ–operator has a discrete spectrum with density ρκ(λ) and an associated
                    heat kernel Kκ(ℓ).  The fine–structure constant can be viewed as emerging
                    from a ratio of these two quantities evaluated at a crossover scale ℓ₀.
                </P>
                <svg
                    viewBox="0 0 820 260"
                    style={{ width: '80%', height: 'auto', display: 'block' }}
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

                <h3>Conceptual Summary: α as a κ–Spectral Ratio</h3>
                <P>
                    In κ–geometry the electromagnetic coupling can be viewed as emerging from a
                    balance between how many κ–modes are available at scale ℓ₀ and how strongly
                    they are weighted by the heat kernel.  The fine–structure constant is then
                    interpreted as a compact way of encoding this balance.
                </P>
                <svg
                    viewBox="0 0 600 220"
                    style={{ width: '80%', height: 'auto', display: 'block' }}
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

                <P style={{ fontSize: '0.9rem', color: '#555', marginTop: '10px' }}>
                    In this picture, α is not a mysterious constant added by hand, but a compact
                    descriptor of how κ–curvature modes are populated and weighted at a particular
                    physical scale.
                </P>
            </div>
        </section>
    )
}

export default ElectroMagneticCoupling