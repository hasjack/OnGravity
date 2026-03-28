// components/QuantumScaleSlider.tsx
import { useState } from 'react';
import { BlockMath } from 'react-katex';

export default function QuantumScaleSlider() {
  const [logR, setLogR] = useState(-35); // log10(r) in meters

  const r = 10 ** logR;
  const kappa_r = 2.6e-26 * r;
  const exp_factor = Math.exp(kappa_r);
  const phi_ratio = exp_factor;

  const scaleLabel = logR < -30 ? 'Planck Scale' :
                     logR < -20 ? 'Quantum' :
                     logR < 10 ? 'Galactic' : 'Cosmic';

  return (
    <div style={{ padding: '24px', background: '#111', borderRadius: 12, fontFamily: 'monospace' }}>
      <input
        type="range"
        min="-35" max="26" step="0.5"
        value={logR}
        onChange={(e) => setLogR(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#00ffcc' }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16, color: '#fff' }}>
        <div>
          <p><b>Scale:</b> r = {r.toExponential(2)} m</p>
          <p><b>κ r =</b> {kappa_r.toFixed(6)}</p>
          <p><b>e<sup>κr</sup> =</b> {exp_factor.toFixed(6)}</p>
          <p style={{ color: '#00ffcc', fontWeight: 'bold' }}>{scaleLabel}</p>
        </div>
        <div style={{ textAlign: 'center', padding: '12px' }}>
          <BlockMath math={String.raw`
            \Phi(r) = -\frac{GM}{r} \times ${phi_ratio.toFixed(4)}
          `} />
        </div>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#ccc', marginTop: 16, textAlign: 'center' }}>
        {logR < -30 ? 'κ → 0: Pure GR' : 
         logR < -10 ? 'κ negligible: Newtonian' : 
         logR < 15 ? 'κ active: Structure dominates' : 
         'κ₀ → Λ_eff: Cosmic acceleration'}
      </p>
    </div>
  );
}