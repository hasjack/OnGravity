import { HamiltonianOperator } from './hamiltonian'
import type { WaveFunction, HilbertConfig } from './types'
import { innerProduct } from './innerProduct'

/**
 * Numerical self-adjointness check:
 *
 *   H is self-adjoint if
 *     ⟨H ψ₁, ψ₂⟩ = ⟨ψ₁, H ψ₂⟩
 *
 * We return the absolute difference between
 * LHS and RHS so you can monitor how close
 * you are as you refine cfg.steps / tweak V.
 */
export function selfAdjointError(
  H: HamiltonianOperator,
  psi1: WaveFunction,
  psi2: WaveFunction,
  cfg: HilbertConfig
): number {
  const lhs = innerProduct(H.apply(psi1), psi2, cfg)
  const rhs = innerProduct(psi1, H.apply(psi2), cfg)
  return Math.abs(lhs - rhs)
}

/**
 * Convenience helper: run the check on a small
 * basis of test functions and return the worst
 * deviation as a single scalar "how bad is it?"
 */
export function maxSelfAdjointError(
  H: HamiltonianOperator,
  basis: WaveFunction[],
  cfg: HilbertConfig
): number {
  let maxErr = 0

  for (let i = 0; i < basis.length; i++) {
    for (let j = 0; j < basis.length; j++) {
      const err = selfAdjointError(
        H,
        basis[i],
        basis[j],
        cfg
      )
      if (err > maxErr) maxErr = err
    }
  }

  return maxErr
}
