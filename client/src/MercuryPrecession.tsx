// components/MercuryPrecession.tsx
import React, { useState, useEffect, useMemo } from 'react'
import { BlockMath } from 'react-katex'

const G = 6.67430e-11            // m^3 kg^-1 s^-2
const c = 2.99792458e8           // m s^-1
const M_sun = 1.989e30           // kg
const GM = G * M_sun
const MERCURY_PERIOD_DAYS = 87.9691
const DAYS_PER_CENTURY = 36525    // Julian century
const ARCSEC_PER_RAD = (180 * 3600) / Math.PI
const AU = 1.495978707e11         // m

const MercuryPrecession: React.FC = () => {
  // Defaults: Mercury perihelion & ecc; κ0 = 0 → GR value ≈ 43″/century
  const [rPeri, setRPeri] = useState(46.0)   // million km
  const [ecc, setEcc] = useState(0.2056)
  const [kappa0, setKappa0] = useState(0.0)  // m^-1

  // Derived: semi-major axis from perihelion (r_p = a(1-e))
  const a_m = useMemo(() => (rPeri / (1 - ecc)) * 1e9, [rPeri, ecc])
  const a_AU = useMemo(() => a_m / AU, [a_m])

  // Core GR pieces
  const orbitsPerCentury = useMemo(() => DAYS_PER_CENTURY / MERCURY_PERIOD_DAYS, [])
  const deltaGR_per_orbit_rad = useMemo(
    () => (6 * Math.PI * GM) / (c * c * a_m * (1 - ecc * ecc)),
    [a_m, ecc]
  )
  const deltaGR_arcsec_per_orbit = useMemo(
    () => deltaGR_per_orbit_rad * ARCSEC_PER_RAD,
    [deltaGR_per_orbit_rad]
  )
  const deltaGR_arcsec_per_century = useMemo(
    () => deltaGR_arcsec_per_orbit * orbitsPerCentury,
    [deltaGR_arcsec_per_orbit, orbitsPerCentury]
  )

  // κ0 correction (first order): exp(κ0 a) ≈ 1 + κ0 a
  const correction = useMemo(() => 1 + kappa0 * a_m, [kappa0, a_m])
  const precessionArcsecCentury = useMemo(
    () => deltaGR_arcsec_per_century * correction,
    [deltaGR_arcsec_per_century, correction]
  )

  return (
    <>
      <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.6rem' }}>
        Mercury: the Famous 43″/Century Test
      </h2>
      <p style={{ maxWidth: 820, margin: '0 auto 1.2rem', lineHeight: 1.7, textAlign: 'center' }}>
        19th-century astronomers measured a tiny extra twist in Mercury’s orbit that Newtonian gravity
        couldn’t explain. General Relativity predicted an excess of about <b>43 arcseconds per century</b>.
        The κ–r geometry matches the same result locally (with <b>no extra parameters</b>), and any
        cosmological bias from κ<sub>0</sub> is far below detectability.
      </p>

      <div style={{ display: 'grid', gap: '1.25rem', maxWidth: 760, margin: '0 auto' }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
            Perihelion distance r<sub>p</sub>: {rPeri.toFixed(1)} million km
          </label>
          <input type="range" min={40} max={60} step={0.5}
                 value={rPeri} onChange={e => setRPeri(parseFloat(e.target.value))}
                 style={{ width: '100%' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
            Eccentricity e: {ecc.toFixed(4)}
          </label>
          <input type="range" min={0.1} max={0.3} step={0.001}
                 value={ecc} onChange={e => setEcc(parseFloat(e.target.value))}
                 style={{ width: '100%' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
            Background κ<sub>0</sub>: {kappa0.toExponential(2)} m⁻¹
          </label>
          <input type="range" min={-5e-25} max={5e-25} step={1e-27}
                 value={kappa0} onChange={e => setKappa0(parseFloat(e.target.value))}
                 style={{ width: '100%' }} />
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            κ<sub>0</sub>=0 → pure local geometry (GR). Non-zero adds an (undetectably small) cosmological bias.
          </div>
        </div>
      </div>

      {/* Live result */}
      <div style={{ marginTop: '1.8rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          {precessionArcsecCentury.toFixed(3)}″ / century
        </div>
        <BlockMath math={`\\Delta\\phi = ${precessionArcsecCentury.toFixed(3)}\\,\\mathrm{arcsec/century}`} />
      </div>

      {/* Live “inputs → outputs” table */}
      <div style={{ maxWidth: 840, margin: '1.2rem auto 0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e5e5', padding: '8px 6px' }}>Quantity</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e5e5', padding: '8px 6px' }}>Symbol / Formula</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #e5e5e5', padding: '8px 6px' }}>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Semi-major axis</td>
              <td>a = r<sub>p</sub>/(1−e)</td>
              <td>{a_AU.toFixed(6)} AU &nbsp; ({a_m.toExponential(3)} m)</td>
            </tr>
            <tr>
              <td>Orbits per century</td>
              <td>36525 / 87.9691</td>
              <td>{orbitsPerCentury.toFixed(1)}</td>
            </tr>
            <tr>
              <td>Per-orbit GR precession</td>
              <td>
                <BlockMath math={'\\Delta\\phi_{\\rm GR} = \\dfrac{6\\pi GM}{c^{2} a (1-e^{2})}'} />
              </td>
              <td>{deltaGR_arcsec_per_orbit.toFixed(5)}″ / orbit</td>
            </tr>
            <tr>
              <td>GR per century</td>
              <td>Δφ<sub>GR</sub> × (orbits/century)</td>
              <td>{deltaGR_arcsec_per_century.toFixed(3)}″ / century</td>
            </tr>
            <tr>
              <td>κ<sub>0</sub> correction</td>
              <td>× (1 + κ<sub>0</sub> a)</td>
              <td>{correction.toPrecision(6)}</td>
            </tr>
            <tr>
              <td><b>Predicted precession</b></td>
              <td colSpan={2}><b>{precessionArcsecCentury.toFixed(3)}″ / century</b></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Context notes */}
      <div style={{ maxWidth: 820, margin: '1rem auto 0', fontSize: '0.95rem', opacity: 0.85 }}>
        <p style={{ margin: 0 }}>
          Observed excess (over Newtonian/perturbative precession): <b>≈ 43.0″/century</b>.
          With κ<sub>0</sub>=0 this panel reproduces the GR value. For κ<sub>0</sub>≈2.6×10⁻²⁶ m⁻¹,
          the additional shift is ~10⁻⁴″/century — below current detectability.
        </p>
      </div>
    </>
  )
}

export default MercuryPrecession
