// src/math/hilbert/types.ts

export type LogCoordinate = number

export type WaveFunction = (t: LogCoordinate) => number

export interface HilbertConfig {
  tMin: number
  tMax: number
  steps: number
}

export type Potential = (t: LogCoordinate) => number
