// src/math/hilbert/index.ts

export type {
  LogCoordinate,
  WaveFunction,
  HilbertConfig,
  Potential,
} from './types'

export { innerProduct } from './innerProduct'

export { HamiltonianOperator } from './hamiltonian'

export { selfAdjointError, maxSelfAdjointError } from './selfAdjoint'
