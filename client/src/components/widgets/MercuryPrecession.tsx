// components/MercuryPrecession.tsx
import React, { useState, useMemo } from 'react'
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
        <div className="w-full space-y-6">
            <div className="grid gap-5">
                <div>
                    <label className="block mb-1 font-semibold text-sm">
                        Perihelion distance r<sub>p</sub>: {rPeri.toFixed(1)} million km
                    </label>
                    <input
                        type="range"
                        min={40}
                        max={60}
                        step={0.5}
                        value={rPeri}
                        onChange={(e) => setRPeri(parseFloat(e.target.value))}
                        className="w-full h-2 accent-sky-500"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-semibold text-sm">
                        Eccentricity e: {ecc.toFixed(4)}
                    </label>
                    <input
                        type="range"
                        min={0.1}
                        max={0.3}
                        step={0.001}
                        value={ecc}
                        onChange={(e) => setEcc(parseFloat(e.target.value))}
                        className="w-full h-2 accent-sky-500"
                    />
                </div>

                <div>
                    <label className="block mb-1 font-semibold text-sm">
                        Background κ<sub>0</sub>: {kappa0.toExponential(2)} m⁻¹
                    </label>
                    <input
                        type="range"
                        min={-5e-25}
                        max={5e-25}
                        step={1e-27}
                        value={kappa0}
                        onChange={(e) => setKappa0(parseFloat(e.target.value))}
                        className="w-full h-2 accent-sky-500"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                        κ<sub>0</sub>=0 → pure local geometry (GR). Non-zero adds an (undetectably small) cosmological bias.
                    </div>
                </div>
            </div>

            {/* Live result */}
            <div className="text-center">
                <div className="text-[2.2rem] font-extrabold">
                    {precessionArcsecCentury.toFixed(3)}″ / century
                </div>
                <BlockMath math={`\\Delta\\phi = ${precessionArcsecCentury.toFixed(3)}\\,\\mathrm{arcsec/century}`} />
            </div>

            {/* Live “inputs → outputs” table */}
            <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className="text-left border-b border-gray-200 p-2">Quantity</th>
                            <th className="text-left border-b border-gray-200 p-2">Symbol / Formula</th>
                            <th className="text-left border-b border-gray-200 p-2">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-2">Semi-major axis</td>
                            <td className="p-2">a = r<sub>p</sub>/(1−e)</td>
                            <td className="p-2">{a_AU.toFixed(6)} AU&nbsp;({a_m.toExponential(3)} m)</td>
                        </tr>
                        <tr>
                            <td className="p-2">Orbits per century</td>
                            <td className="p-2">36525 / 87.9691</td>
                            <td className="p-2">{orbitsPerCentury.toFixed(1)}</td>
                        </tr>
                        <tr>
                            <td className="p-2">Per-orbit GR precession</td>
                            <td className="p-2">
                                <BlockMath math={'\\Delta\\phi_{\\rm GR} = \\dfrac{6\\pi GM}{c^{2} a (1-e^{2})}'} />
                            </td>
                            <td className="p-2">{deltaGR_arcsec_per_orbit.toFixed(5)}″ / orbit</td>
                        </tr>
                        <tr>
                            <td className="p-2">GR per century</td>
                            <td className="p-2">Δφ<sub>GR</sub> × (orbits/century)</td>
                            <td className="p-2">{deltaGR_arcsec_per_century.toFixed(3)}″ / century</td>
                        </tr>
                        <tr>
                            <td className="p-2">κ<sub>0</sub> correction</td>
                            <td className="p-2">× (1 + κ<sub>0</sub> a)</td>
                            <td className="p-2">{correction.toPrecision(6)}</td>
                        </tr>
                        <tr>
                            <td className="p-2 font-semibold">Predicted precession</td>
                            <td colSpan={2} className="p-2 font-semibold">{precessionArcsecCentury.toFixed(3)}″ / century</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default MercuryPrecession
