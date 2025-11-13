// components/PrecessionSimulator.tsx
import React, { useState, useEffect } from 'react';
import { BlockMath } from 'react-katex';

const G = 6.67430e-11;
const c = 3.0e8;
const M_sun = 1.989e30;
const GM_sun = G * M_sun;
const M_earth = 5.972e24;
const GM_earth = G * M_earth;

interface Body {
    name: string;
    r_peri_million_km: number;
    ecc: number;
    period_days: number;
    observed_arcsec_cy: number;
    gr_arcsec_cy: number;
    central_mass: number;
}

const BODIES: Body[] = [
    {
        name: 'Mercury',
        r_peri_million_km: 46.0,
        ecc: 0.2056,
        period_days: 88,
        observed_arcsec_cy: 43.0,
        gr_arcsec_cy: 42.98,
        central_mass: GM_sun,
    },
    {
        name: 'Venus',
        r_peri_million_km: 107.5,
        ecc: 0.0068,
        period_days: 224.7,
        observed_arcsec_cy: 8.6,
        gr_arcsec_cy: 8.62,
        central_mass: GM_sun,
    },
    {
        name: 'Earth',
        r_peri_million_km: 147.1,
        ecc: 0.0167,
        period_days: 365.25,
        observed_arcsec_cy: 3.8,
        gr_arcsec_cy: 3.84,
        central_mass: GM_sun,
    },
    {
        name: 'Moon (around Earth)',
        r_peri_million_km: 0.363, // million km
        ecc: 0.0549,
        period_days: 27.3,
        observed_arcsec_cy: 0.0, // not measurable
        gr_arcsec_cy: 0.0,
        central_mass: GM_earth,
    },
];

const PrecessionSimulator: React.FC = () => {
    const [selected, setSelected] = useState(0);
    const [kappa_0, setKappa0] = useState(0.0);
    const[precession, setPrecession] = useState(0);
    const body = BODIES[selected];

    useEffect(() => {
        const a_million_km = body.r_peri_million_km / (1 - body.ecc);
        const a_m = a_million_km * 1e9;

        const delta_GR_per_orbit = (6 * Math.PI * body.central_mass) / (c * c * a_m * (1 - body.ecc * body.ecc));
        const delta_GR_arcsec_per_orbit = delta_GR_per_orbit * (180 * 3600 / Math.PI);
        const orbits_per_century = (100 * 365.25) / body.period_days;
        const delta_GR_cy = delta_GR_arcsec_per_orbit * orbits_per_century;

        const kappa_0_effect = kappa_0 * a_m;
        const correction = 1 + kappa_0_effect;
        const final_precession = delta_GR_cy * correction;

        setPrecession(final_precession);
    }, [selected, kappa_0, body]);

    return (
        <>
            <h2 style={{ fontSize: '2.2rem', textAlign: 'center', marginBottom: '1rem' }}>
                Precession Across the Solar System
            </h2>
            <p style={{ maxWidth: '800px', margin: '0 auto 2rem', textAlign: 'center', lineHeight: '1.7' }}>
                The same geometry predicts orbital precession from Mercury to the Moon —
                with <strong>no adjustable parameters</strong>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {BODIES.map((b, i) => (
                    <button
                        key={i}
                        onClick={() => setSelected(i)}
                        style={{
                            padding: '0.6rem 1.2rem',
                            background: selected === i ? '#1a1a1a' : '#eee',
                            color: selected === i ? 'white' : 'black',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: selected === i ? 'bold' : 'normal',
                            cursor: 'pointer',
                        }}
                    >
                        {b.name}
                    </button>
                ))}
            </div>

            <div style={{ maxWidth: '680px', margin: '0 auto 2rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <strong>Perihelion:</strong> {body.r_peri_million_km.toFixed(1)} million km
                    <br />
                    <strong>Eccentricity:</strong> {body.ecc.toFixed(4)}
                    <br />
                    <strong>Period:</strong> {body.period_days.toFixed(1)} days
                </div>

                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    Cosmic κ₀: {kappa_0.toExponential(2)} m⁻¹
                </label>
                <input
                    type="range"
                    min="-5e-25" max="5e-25" step="1e-27"
                    value={kappa_0}
                    onChange={(e) => setKappa0(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>

            <div style={{ textAlign: 'center', fontSize: '2.4rem', fontWeight: 'bold', margin: '2rem 0' }}>
                {precession.toFixed(3)}″/century
            </div>

            <div style={{ textAlign: 'center', fontSize: '1.1rem', color: '#444' }}>
                <p>Observed: <strong>{body.observed_arcsec_cy}″/century</strong></p>
                <p>GR: <strong>{body.gr_arcsec_cy.toFixed(2)}″/century</strong></p>
                <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
                    κ–r matches GR <strong>exactly</strong> when κ₀ = 0.
                </p>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <BlockMath math={String.raw`
          \Delta\phi = \frac{6\pi GM}{c^2 a (1-e^2)} \times e^{\kappa_0 a} \quad [\text{per orbit}]
        `} />
            </div>
        </>
    );
};

export default PrecessionSimulator;