const Big = require('big.js');
const { createCanvas } = require('canvas');
const fs = require('fs');

// Parameters for proton scattering
const G = new Big('6.674e-11'); // m^3 kg^-1 s^-2
const M_proton = new Big('1.67e-27'); // kg (proton mass)
const k_q = new Big('1e15'); // m^-1 (v1-inspired nuclear scale)
const r_values = [new Big('1e-15'), new Big('2e-15'), new Big('3e-15'), new Big('4e-15'), new Big('5e-15'), 
                  new Big('6e-15'), new Big('7e-15'), new Big('8e-15'), new Big('9e-15'), new Big('1e-14')]; // m, hardcoded

// κ_q function
function kappa_q(r) {
    return k_q.times(new Big('1e-15').div(r)); // v1-style inverse dependence
}

// Calculate potential
const potential_q = r_values.map(r => {
    const kappa_val = kappa_q(r);
    const exp_term = Big.exp(kappa_val.times(r)); // Big.js handles large/small exp
    return G.times(M_proton).times(M_proton).div(r).times(exp_term).times(new Big('1e60')); // Amplify
});

// Create canvas (for PNG)
const width = 800;
const height = 600;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Plot (simple line, v1 style)
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, width, height);
ctx.strokeStyle = 'purple';
ctx.beginPath();
r_values.forEach((r, i) => {
    const x = (Math.log10(r.toNumber()) + 15) * (width / 1); // Log scale x
    const y = height - (Math.log10(potential_q[i].toNumber()) * (height / 6)); // Log scale y
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
});
ctx.stroke();

// Draw proton radius line
ctx.strokeStyle = 'gray';
ctx.beginPath();
const x_proton = (Math.log10(1e-15) + 15) * (width / 1);
ctx.moveTo(x_proton, 0);
ctx.lineTo(x_proton, height);
ctx.stroke();

// Save PNG
const stream = canvas.createPNGStream();
const out = fs.createWriteStream('figures/quantum_potential.png');
stream.pipe(out);
out.on('finish', () => console.log('Saved figures/quantum_potential.png'));