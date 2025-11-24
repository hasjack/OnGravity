import type {
    WaveFunction,
    Potential,
    HilbertConfig,
    LogCoordinate,
} from './types'

/**
 * κ-Hamiltonian operator on log-scale:
 *
 *   (H ψ)(t) = - d²ψ/dt² + V(t) ψ(t)
 *
 * We implement a numerical version:
 * - second derivative via central finite differences
 * - with simple Dirichlet-like boundary handling
 *   (ψ = 0 just outside domain) so you can see
 *   how self-adjointness behaves numerically.
 */
export class HamiltonianOperator {
  private V: Potential
  private cfg: HilbertConfig

  constructor(V: Potential, cfg: HilbertConfig) {
    this.V = V
    this.cfg = cfg
  }

  // helper: numerical second derivative of ψ at t
  private secondDerivative(
    psi: WaveFunction,
    t: LogCoordinate
  ): number {
    const { tMin, tMax, steps } = this.cfg
    const h = (tMax - tMin) / steps

    const tMinus = t - h
    const tPlus = t + h

    const psiCenter = psi(t)

    const psiMinus =
      tMinus < tMin ? 0 : psi(tMinus)

    const psiPlus =
      tPlus > tMax ? 0 : psi(tPlus)

    // central difference approximation:
    // ψ''(t) ≈ (ψ(t+h) - 2 ψ(t) + ψ(t-h)) / h²
    return (psiPlus - 2 * psiCenter + psiMinus) / (h * h)
  }

  /**
   * Apply H to a wavefunction ψ, returning
   * a new wavefunction Hψ
   */
  apply(psi: WaveFunction): WaveFunction {
    return (t: LogCoordinate) => {
      const laplacian = -this.secondDerivative(psi, t)
      const potentialTerm = this.V(t) * psi(t)
      return laplacian + potentialTerm
    }
  }
}
