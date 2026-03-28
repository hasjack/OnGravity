import type { WaveFunction, HilbertConfig } from './types'

/**
 * Numerical inner product on log-scale:
 *
 *   ⟨ψ₁, ψ₂⟩ = ∫ ψ₁(t) ψ₂(t) w(t) dt
 *
 * For now:
 * - simple trapezoidal rule
 * - weight w(t) = 1 (you can later plug in a more
 *   physically motivated weight, e.g. e^t or similar)
 */
export function innerProduct(
  psi1: WaveFunction,
  psi2: WaveFunction,
  cfg: HilbertConfig
): number {
  const { tMin, tMax, steps } = cfg
  const h = (tMax - tMin) / steps

  let sum = 0

  for (let i = 0; i <= steps; i++) {
    const t = tMin + i * h
    const weight = i === 0 || i === steps ? 0.5 : 1
    const v = psi1(t) * psi2(t)
    sum += weight * v
  }

  return sum * h
}
