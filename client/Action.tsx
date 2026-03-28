type Scalar = number

/**
 * A symbolic representation of a spacetime point.
 * This is here just so the structure reads like physics,
 * not because we are doing full tensor GR numerics.
 */
interface SpacetimePoint {
    x: number
    y: number
    z: number
    t: number
}

/**
 * g_{mu nu}
 *
 * The metric tensor is the object that defines spacetime geometry:
 * distances, time intervals, angles, causal structure.
 *
 * In GR, this is the fundamental dynamical field.
 */
interface MetricTensor {
    values: number[][]
}

/**
 * A local state of spacetime + matter.
 *
 * This is the "input slice" of the theory at one region of spacetime.
 */
interface LocalPhysicalState {
    point: SpacetimePoint
    metric: MetricTensor
    ricciScalar: Scalar
    matterLagrangianDensity: Scalar
}

/**
 * Free parameters of the model.
 *
 * G     = Newton's constant
 * alpha = coupling controlling nonlinear curvature corrections in f(R)
 */
interface GravityModelParameters {
    G: number
    alpha: number
}

/**
 * Environmental parameters used in the phenomenological kappa law.
 *
 * kappa0 = baseline/background curvature-response scale
 * kv     = shear-response coefficient
 * s0     = reference shear scale
 * rho0   = reference density scale
 */
interface EnvironmentalResponseParameters {
    kappa0: number
    kv: number
    s0: number
    rho0: number
}

/**
 * Matter environment used to evaluate kappa.
 *
 * rho  = local baryonic density
 * dvdr = local radial velocity shear
 */
interface LocalEnvironment {
    rho: number
    dvdr: number
}

/**
 * Simple determinant helper.
 *
 * In proper GR work this would be handled by symbolic software
 * or tensor machinery, but here we keep it explicit so the logic
 * is visible.
 */
function determinant4x4(matrix: number[][]): number {
    const [
        [a, b, c, d],
        [e, f, g, h],
        [i, j, k, l],
        [m, n, o, p]
    ] = matrix

    return (
        a * (
            f * (k * p - l * o) -
            g * (j * p - l * n) +
            h * (j * o - k * n)
        ) -
        b * (
            e * (k * p - l * o) -
            g * (i * p - l * m) +
            h * (i * o - k * m)
        ) +
        c * (
            e * (j * p - l * n) -
            f * (i * p - l * m) +
            h * (i * n - j * m)
        ) -
        d * (
            e * (j * o - k * n) -
            f * (i * o - k * m) +
            g * (i * n - j * m)
        )
    )
}

/**
 * sqrt(-g)
 *
 * What specifically it is:
 * - the invariant spacetime volume weight
 * - converts coordinate volume d^4x into proper spacetime volume
 * - ensures the action is coordinate invariant
 *
 * Why it matters:
 * without this, the action would depend on the coordinate system chosen.
 */
function invariantSpacetimeVolumeWeight(metric: MetricTensor): Scalar {
    const g = determinant4x4(metric.values)

    if (g >= 0) {
        throw new Error("Expected Lorentzian metric with negative determinant")
    }

    return Math.sqrt(-g)
}

/**
 * Einstein-Hilbert term: R
 *
 * What specifically it is:
 * - the curvature term used in standard General Relativity
 * - this is the pure GR gravitational Lagrangian density
 *
 * Why it matters:
 * if your action were just ∫ sqrt(-g) R d^4x (plus matter),
 * varying it gives Einstein's field equations.
 */
function einsteinHilbertTerm(ricciScalar: Scalar): Scalar {
    return ricciScalar
}

/**
 * Nonlinear curvature modification: f(R) = R exp(alpha R)
 *
 * What specifically it is:
 * - your modified gravity replacement for the Einstein-Hilbert term
 * - instead of curvature entering linearly as R,
 *   it is weighted nonlinearly by exp(alpha R)
 *
 * Why it matters:
 * - this introduces higher-order curvature corrections
 * - for small R it looks like GR + corrections
 * - for larger curvature it departs from pure GR
 */
function nonlinearCurvatureTerm(
    ricciScalar: Scalar,
    alpha: Scalar
): Scalar {
    return ricciScalar * Math.exp(alpha * ricciScalar)
}

/**
 * Taylor expansion of f(R)
 *
 * What specifically it is:
 * - a way to "open up" the exponential and inspect the hidden pieces
 *
 * If f(R) = R exp(alpha R), then:
 * f(R) = R + alpha R^2 + (1/2) alpha^2 R^3 + ...
 *
 * Why it matters:
 * this shows that your model contains:
 * - Einstein-Hilbert GR term
 * - quadratic curvature correction
 * - cubic and higher corrections
 */
function expandedNonlinearCurvatureTerm(
    ricciScalar: Scalar,
    alpha: Scalar,
    terms = 4
): Scalar {
    let sum = 0

    if (terms >= 1) sum += ricciScalar
    if (terms >= 2) sum += alpha * ricciScalar ** 2
    if (terms >= 3) sum += 0.5 * alpha ** 2 * ricciScalar ** 3
    if (terms >= 4) sum += (1 / 6) * alpha ** 3 * ricciScalar ** 4

    return sum
}

/**
 * Matter term: 16πG L_m
 *
 * What specifically it is:
 * - the matter contribution to the action
 * - L_m is the matter Lagrangian density
 *
 * Why it matters:
 * when the action is varied, this is the part that produces
 * the stress-energy tensor T_{mu nu}, i.e. the source of gravity.
 */
function matterCouplingTerm(
    matterLagrangianDensity: Scalar,
    G: Scalar
): Scalar {
    return 16 * Math.PI * G * matterLagrangianDensity
}

/**
 * Gravitational action density:
 * sqrt(-g) [ f(R) + 16πG L_m ]
 *
 * What specifically it is:
 * - the local integrand of your action
 * - this is the thing being summed/integrated over spacetime
 *
 * Why it matters:
 * once you know this density everywhere, the total action follows
 * by integrating over spacetime.
 */
function actionDensity(
    state: LocalPhysicalState,
    params: GravityModelParameters
): Scalar {
    const volumeWeight = invariantSpacetimeVolumeWeight(state.metric)
    const curvatureContribution = nonlinearCurvatureTerm(
        state.ricciScalar,
        params.alpha
    )
    const matterContribution = matterCouplingTerm(
        state.matterLagrangianDensity,
        params.G
    )

    return volumeWeight * (curvatureContribution + matterContribution)
}

/**
 * Discretized total action:
 * S = ∫ sqrt(-g) [ f(R) + 16πG L_m ] d^4x
 *
 * What specifically it is:
 * - a numerical-style approximation of the full spacetime integral
 * - each sample represents one little spacetime cell
 *
 * Why it matters:
 * this is the object you would vary to derive field equations.
 */
interface SpacetimeCell extends LocalPhysicalState {
    d4x: number
}

function totalAction(
    cells: SpacetimeCell[],
    params: GravityModelParameters
): Scalar {
    return cells.reduce((sum, cell) => {
        return sum + actionDensity(cell, params) * cell.d4x
    }, 0)
}

/**
 * f'(R)
 *
 * What specifically it is:
 * - derivative of f(R) with respect to R
 * - this appears explicitly in the f(R) field equations
 *
 * For f(R) = R exp(alpha R),
 * f'(R) = exp(alpha R) (1 + alpha R)
 *
 * Why it matters:
 * unlike pure GR, varying f(R) theories introduces not just f(R)
 * but also derivatives of f'(R).
 */
function curvatureResponseDerivative(
    ricciScalar: Scalar,
    alpha: Scalar
): Scalar {
    return Math.exp(alpha * ricciScalar) * (1 + alpha * ricciScalar)
}

/**
 * A symbolic representation of the f(R) field equation pieces.
 *
 * This does not solve them.
 * It just shows their conceptual structure in code.
 */
interface FieldEquationPieces {
    fPrimeR: number
    ricciTensorTerm: string
    metricWeightedCurvatureTerm: string
    covariantDerivativeTerm: string
    dalembertianTerm: string
    stressEnergyTerm: string
}

/**
 * Modified field equation structure:
 *
 * f'(R) R_{mu nu}
 * - 1/2 f(R) g_{mu nu}
 * - ∇_mu ∇_nu f'(R)
 * + g_{mu nu} □ f'(R)
 * = 8πG T_{mu nu}
 *
 * What specifically it is:
 * - the symbolic decomposition of the modified gravity field equation
 *
 * Why it matters:
 * this is the bridge from the action principle to the actual dynamics.
 */
function modifiedFieldEquationStructure(
    state: LocalPhysicalState,
    params: GravityModelParameters
): FieldEquationPieces {
    const fPrimeR = curvatureResponseDerivative(
        state.ricciScalar,
        params.alpha
    )

    return {
        fPrimeR,
        ricciTensorTerm: "f'(R) * R_{mu nu}",
        metricWeightedCurvatureTerm: "-(1/2) * f(R) * g_{mu nu}",
        covariantDerivativeTerm: "-∇_mu ∇_nu f'(R)",
        dalembertianTerm: "+g_{mu nu} □ f'(R)",
        stressEnergyTerm: "= 8πG T_{mu nu}"
    }
}

/**
 * Weak-field metric concept:
 * g_{mu nu} = η_{mu nu} + h_{mu nu}
 *
 * What specifically it is:
 * - the approximation used when gravity is weak
 * - spacetime is nearly flat, with small perturbations h_{mu nu}
 *
 * Why it matters:
 * this is the regime where galactic/cluster phenomenology is usually discussed.
 */
function weakFieldMetric(perturbation: number[][]): MetricTensor {
    const eta = [
        [-1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]

    const values = eta.map((row, i) =>
        row.map((value, j) => value + perturbation[i][j])
    )

    return { values }
}

/**
 * Phenomenological curvature-response coefficient:
 * κ = κ0 + kv ( (dv/dr)/s0 )^3 (rho/rho0)^(1/2)
 *
 * What specifically it is:
 * - your environmental response law
 * - not yet derived from the action directly
 * - this is the phenomenological bridge from local baryonic structure
 *   to effective curvature weighting
 *
 * Why it matters:
 * this is the distinctive ingredient of your framework.
 */
function environmentalCurvatureResponse(
    environment: LocalEnvironment,
    params: EnvironmentalResponseParameters
): number {
    const shearRatio = environment.dvdr / params.s0
    const densityRatio = environment.rho / params.rho0

    return (
        params.kappa0 +
        params.kv * shearRatio ** 3 * Math.sqrt(densityRatio)
    )
}

/**
 * Curvature-weighted potential:
 * Φ(r) = -(GM/r) exp(κr)
 *
 * What specifically it is:
 * - the weak-field phenomenological potential used in the paper
 *
 * Why it matters:
 * this is the object that modifies orbital velocities, lensing,
 * and related weak-field observables.
 */
function curvatureWeightedPotential(
    G: number,
    M: number,
    r: number,
    kappa: number
): number {
    return -(G * M / r) * Math.exp(kappa * r)
}

/**
 * Effective radial acceleration:
 * g_eff = (GM/r^2) exp(κr)
 *
 * What specifically it is:
 * - the modified weak-field acceleration implied by the potential ansatz
 *
 * Why it matters:
 * this is the quantity compared against galactic phenomenology.
 */
function effectiveGravitationalAcceleration(
    G: number,
    M: number,
    r: number,
    kappa: number
): number {
    return (G * M / (r * r)) * Math.exp(kappa * r)
}

/**
 * Circular velocity from the modified weak-field form:
 * v = sqrt(GM/r) exp(κr/2)
 *
 * What specifically it is:
 * - the orbital speed implied by the modified acceleration law
 *
 * Why it matters:
 * this is the form used for rotation-curve discussion.
 */
function curvatureWeightedCircularVelocity(
    G: number,
    M: number,
    r: number,
    kappa: number
): number {
    return Math.sqrt((G * M) / r) * Math.exp((kappa * r) / 2)
}

/**
 * A full symbolic "flow" through the framework.
 *
 * This is useful because it separates:
 * 1. the action-level theory
 * 2. the field-equation structure
 * 3. the weak-field phenomenology
 * 4. the environmental κ response
 */
interface SymbolicEvaluationResult {
    conceptualLayers: {
        actionLevel: string
        fieldEquationLevel: string
        weakFieldLevel: string
        environmentalLevel: string
    }
    fR: number
    fPrimeR: number
    kappa: number
    potential: number
    acceleration: number
    circularVelocity: number
}

interface WeakFieldScenario {
    M: number
    r: number
    environment: LocalEnvironment
    localCurvatureEstimate: number
}

/**
 * End-to-end symbolic evaluation.
 *
 * What specifically it is:
 * - a conceptual simulator of the logical stack in your paper
 *
 * Why it matters:
 * it makes visible where each piece belongs and where the derivation
 * is still phenomenological rather than first-principles.
 */
function evaluateFramework(
    scenario: WeakFieldScenario,
    gravityParams: GravityModelParameters,
    environmentalParams: EnvironmentalResponseParameters
): SymbolicEvaluationResult {
    const fR = nonlinearCurvatureTerm(
        scenario.localCurvatureEstimate,
        gravityParams.alpha
    )

    const fPrimeR = curvatureResponseDerivative(
        scenario.localCurvatureEstimate,
        gravityParams.alpha
    )

    const kappa = environmentalCurvatureResponse(
        scenario.environment,
        environmentalParams
    )

    const potential = curvatureWeightedPotential(
        gravityParams.G,
        scenario.M,
        scenario.r,
        kappa
    )

    const acceleration = effectiveGravitationalAcceleration(
        gravityParams.G,
        scenario.M,
        scenario.r,
        kappa
    )

    const circularVelocity = curvatureWeightedCircularVelocity(
        gravityParams.G,
        scenario.M,
        scenario.r,
        kappa
    )

    return {
        conceptualLayers: {
            actionLevel:
                "Choose modified action with f(R) = R exp(alpha R)",
            fieldEquationLevel:
                "Vary action to obtain modified f(R) field equations",
            weakFieldLevel:
                "Adopt weak-field limit and represent corrections via an effective exponential weighting",
            environmentalLevel:
                "Model κ phenomenologically as a local response to shear and density"
        },
        fR,
        fPrimeR,
        kappa,
        potential,
        acceleration,
        circularVelocity
    }
}

/**
 * Example usage
 */
const gravityParams: GravityModelParameters = {
    G: 6.674e-11,
    alpha: 1e-10
}

const environmentalParams: EnvironmentalResponseParameters = {
    kappa0: 2.6e-26,
    kv: 5e-26,
    s0: 1e-12,
    rho0: 1600
}

export const result = evaluateFramework(
    {
        M: 1.2e41,
        r: 3.086e20,
        localCurvatureEstimate: 1e-42,
        environment: {
            rho: 1e-21,
            dvdr: 1e-15
        }
    },
    gravityParams,
    environmentalParams
)

console.log(result)