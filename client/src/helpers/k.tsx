export type KappaParams = {
  k0: number
  rho0: number
  a: number
  r0: number
  b: number
}

// Rough defaults – feel free to tweak
export const defaultKappaParams: KappaParams = {
  k0: 7e-21,
  rho0: 1600,
  a: 0.5,
  r0: 3.086e21,
  b: 2,
}

const G = 6.67430e-11 // m^3 kg^-1 s^-2

export function kappa(
  r: number,
  rho: number,
  p: KappaParams = defaultKappaParams,
): number {
  return (
    p.k0 *
    Math.pow(rho / p.rho0, p.a) *
    Math.pow(p.r0 / r, p.b)
  )
}

export function gEff(
  M: number,
  r: number,
  rho: number,
  p: KappaParams = defaultKappaParams,
): number {
  const kap = kappa(r, rho, p)
  let x = kap * r

  // keep exp() well-behaved
  if (x > 50) x = 50
  if (x < -50) x = -50

  return (G * M / (r * r)) * Math.exp(x)
}

// === Toy κ gravity for the browser (dimensionless) ===
// r is your sim radius (0.5–10), k0 is a slider value (0–3 recommended)

export function gKappaToy(r: number, k0: number): number {
  const newton = 1 / (r * r)

  // Smooth, bounded “boost” using κ-like behaviour
  const kappa = k0 / (1 + r * r)

  // exp(kappa * r), but r ≤ 10 so kappa*r stays small
  const boost = Math.exp(kappa * r)

  return newton * boost
}
