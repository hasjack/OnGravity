#!/usr/bin/env python3
"""
Prime–Curvature Hamiltonian (LOG GRID, WITH GLOBAL CORRECTIONS)

Pipeline
--------
1. Generate the first NUM_PRIMES primes using a sieve with a safe upper bound.

2. Compute the curvature field k(p) on the primes:
       - For each prime p, sample a window [p − R, p + R]
       - Compute composite density ρ in the window
       - σ(p) = log(1 + ρ log p)
       - k(p) = C · σ(p)^3 · √ρ
   This yields (p_used, k_vals).

3. (Optional) Smooth k_vals with a moving-average kernel.

4. Reinterpret curvature as a function of t = log p and
   resample onto a *uniform* grid in t:
       t_raw = log(p_used)
       t_grid = linspace(t_raw[0], t_raw[-1], N)
       k_log(t_grid) = interp(t_raw → t_grid)

   This makes the discrete Laplacian physically meaningful
   on the log-prime axis instead of the raw index axis.

5. Apply global correction mechanisms:

   (a) Tail shape correction (multiplicative):
           k_corr[n] = k_log[n] · (1 + η · log n)
       η is chosen by a variational sweep to minimise the
       mean relative error of the mapped spectrum.

   (b) Global index correction (additive in the potential):
           V[n] ← V[n] + ε · log n
       stabilises long-tail drift.

6. Build the log-grid Hamiltonian:
       L = discrete Laplacian on uniform t-grid
       V = BETA · k_corr        (or exp(α k_corr))
       H = L + V
   Compute the lowest NUM_LEVELS eigenvalues λ_n.

7. Fit log-based spectral models to the Riemann zeros γ_n:

       log_n model:
           γ_n ≈ a · λ_n + c · log(n) + b

       (optional) log_lambda model:
           γ_n ≈ a · λ_n + c · log(λ_n) + b

   Fit on the first fit_n levels; evaluate on eval_n levels.

8. Evaluate:
       - mean relative error over first eval_n
       - max relative error
       - residual structure vs n

9. Produce plots:
       - curvature field (log–log)
       - raw λ_n vs γ_n
       - mapped eigenvalues vs γ_n
       - residual diagnostics
       - η-sweep stability
       - prime-count stability
       - β-sweep stability

"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.sparse import diags
from scipy.sparse.linalg import eigsh
from scipy.interpolate import CubicSpline

# ---------------------------------------------------------------------
# 0. Parameters & reference data
# ---------------------------------------------------------------------

NUM_PRIMES    = 1_000_000      # primes used to build curvature
WINDOW_RADIUS = 20           # [p-R, p+R] compositeness window
CURVATURE_C   = 0.150        # original c in k_n formula

BETA          = 50.0         # linear potential scale: V = BETA * k_n
NUM_LEVELS    = 80           # number of eigenvalues to compute

CURVATURE_DOWNSAMPLE = 1     # keep every k-th curvature point (1 = none)
SMOOTHING_WINDOW      = 0    # 0 = no smoothing; else moving-average window

EXPONENTIAL_POTENTIAL = False  # if True: V = exp(alpha * k_n)
ALPHA_EXP             = 0.1

# Global correction terms (very small structural perturbations)
GLOBAL_CORRECTION        = True
GLOBAL_SHAPE_CORRECTION  = True
GLOBAL_SHAPE_ETA         = 1e-4   # log–index tail-slope adjuster
EPS_CORR                 = 0.02   # log(i) diagonal correction

# Möbius-scale perturbation controls
MOBIUS_PERTURBATION   = True   # toggle on/off
MU_REL_AMP            = 0.00002   # perturbation strength as fraction of RMS(k)
MU_SMOOTH_WINDOW      = 301    # odd integer; moving-average width in log t


# SCENARIOS: (label, model, fit_n, eval_n)

# ---------------------------------------------------------------------
# Riemann zeros (first 80 imaginary parts), neatly formatted
# ---------------------------------------------------------------------

# First 80 imaginary parts of non-trivial Riemann zeros
RIEMANN_ZEROS = np.array([
    14.1347251417347, 21.0220396387716, 25.0108575801457, 30.4248761258595, 32.9350615877392,
    37.5861781588257, 40.9187190121475, 43.3270732809149, 48.0051508811672, 49.7738324776723,
    52.9703214777144, 56.4462476970634, 59.3470440026024, 60.8317785246098, 65.1125440480816,
    67.0798105294942, 69.5464017111739, 72.0671576744819, 75.7046906990839, 77.1448400688748,
    79.3373750202494, 82.9103808540860, 84.7354929805171, 87.4252746131252, 88.8091112076345,
    92.4918992705585, 94.6513440405199, 95.8706342282453, 98.8311942181937, 101.3178510057310,
    103.7255380404784, 105.4466230523267, 107.1686111842764, 111.0295355431695, 112.7001209160843,
    114.3202209154523, 116.2266803208578, 118.7907828659763, 121.3701250024203, 122.9468292935526,
    124.2568185543458, 127.5166838795964, 129.5787041997780, 131.0876885311590, 133.4977372029976,
    134.7565097533738, 138.1160420555147, 139.7362089521217, 141.1237074040210, 143.1118458076206,
    146.0009824867653, 147.4227653436690, 150.0535204215010, 150.9252576122664, 153.0246938111000,
    156.0914901307180, 157.5975918175430, 158.8499881714208, 161.1889641375960, 163.0307096875174,
    165.5370691870990, 167.1842300785851, 169.0945154159864, 169.9119764787334, 173.4115365191553,
    174.7541915233657, 176.4414342977104, 178.3774077760997, 179.9164840209589, 182.2070784843660,
    184.8744678480460, 185.5987836777072, 187.2289225835012, 189.4161586560213, 192.0266563607137,
    193.0797266031385, 195.2653966795522, 196.8764818409589, 198.0153096762519, 201.2647519437037,
202.4935945141405, 204.1896718031045, 205.3946972021632, 207.9062588878062, 209.5765097168562, 
211.6908625953653, 213.3479193597126, 214.5470447834914, 216.1695385082637, 219.0675963490213,
220.7149188393140, 221.4307055546933, 224.0070002546043, 224.9833246695822, 227.4214442796792, 
229.3374133055253, 231.2501887004991, 231.9872352531802, 233.6934041789083, 236.5242296658162,
237.7698204809252, 239.5554775733276, 241.0491577962165, 242.8232719342226, 244.0708984970781,
247.1369900748974, 248.1019900601484, 249.5736896447072, 251.0149477950160, 253.0699867479994,
255.3062564549140, 256.3807136944344, 258.6104394915313, 259.8744069896780, 260.8050845045968,
263.5738939048701, 265.5578518388763, 266.6149737815010, 267.9219150828240, 269.9704490239976,
271.4940556416449,
273.4596091884032,
275.5874926493438,
276.4520495031329,
278.2507435298419,
279.2292509277451,
282.4651147650520,
283.2111857332338,
284.8359639809047,
286.6674453630028,
287.9119205014221,
289.5798549292188,
291.8462913290673,
293.5584341393562,
294.9653696192655,
295.5732548789582,
297.9792770619434,
299.8403260537213,
301.6493254621941,
302.6967495896069,
304.8643713408572,
305.7289126020368,
307.2194961281700,
310.1094631467018,
311.1651415303560,
312.4278011806008,
313.9852857311589,
315.4756160894757,
317.7348059423701,
318.8531042563165,
321.1601343091135,
322.1445586724829,
323.4669695575120,
324.8628660517396,
327.4439012619054,
329.0330716804809,
329.9532397282338,
331.4744675826634,
333.6453785248698,
334.2113548332443,
336.8418504283906,
338.3399928508066,
339.8582167253635,
341.0422611110465,
342.0548775103635,
344.6617029402523,
346.3478705660099,
347.2726775844204,
349.3162608706961,
350.4084193491920,
351.8786490253592,
353.4889004887188,
356.0175749772649,
357.1513022520396,
357.9526851016322,
359.7437549531144,
361.2893616958046,
363.3313305789738,
364.7360241140889,
366.2127102883313,
367.9935754817403,
368.9684380957343,
370.0509192121060,
373.0619283721128,
373.8648739109085,
375.8259127667393,
376.3240922306680,
378.4366802499654,
379.8729753465323,
381.4844686171865,
383.4435294495364,
384.9561168148636,
385.8613008459742,
387.2228902223879,
388.8461283542322,
391.4560835636380,
392.2450833395190,
393.4277438444340,
395.5828700109937,
396.3818542225921,
397.9187362096142,
399.9851198761948,
401.8392286005332,
402.8619177638861,
404.2364418002080,
405.1343874599099,
407.5814603868961,
408.9472455023511,
410.5138691933666,
411.9722678042787,
413.2627360701850,
415.0188097551551,
415.4552149962945,
418.3877057895347,
419.8613648181523,
420.6438276250417,
422.0767100588267,
423.7165796274818,
425.0698824944613,
427.2088250840745,
428.1279140766166,
430.3287454309386,
431.3013069307035,
432.1386417345885,
433.8892184809272,
436.1610064326469,
437.5816981676685,
438.6217386562721,
439.9184422143706,
441.6831992011890,
442.9045463026094,
444.3193362775591,
446.8606226964295,
447.4417041944932,
449.1485456850233,
450.1269457803135,
451.4033084453887,
453.9867378066779,
454.9746837686167,
456.3284266892460,
457.9038930641029,
459.5134152811060,
460.0879444221758,
462.0653672748825,
464.0572869105482,
465.6715392113710,
466.5702869308262,
467.4390462102616,
469.5360045591120,
470.7736554781016,
472.7991746619088,
473.8352323451396,
475.6003393693757,
476.7690152374845,
478.0752637666709,
478.9421815346348,
481.8303393762865,
482.8347827909823,
483.8514272124825,
485.5391481293560,
486.5287182616512,
488.3805670900174,
489.6617615779561,
491.3988215936630,
493.3144415817853,
493.9579978053694,
495.3588288221312,
496.4296962157591,
498.5807824296865,
500.3090849416904,
501.6044469651454,
502.2762703271182,
504.4997733134277,
505.4152317422444,
506.4641527095235,
508.8007003364678,
510.2642279436728,
511.5622897003745,
512.6231445314074,
513.6689855554736,
515.4350571672993,
517.5896685724674,
518.2342231475501,
520.1063104117232,
521.5251934494920,
522.4566961777302,
523.9605308920158,
525.0773856872796,
527.9036416012723,
528.4062138522926,
529.8062263187069,
530.8669178839610,
532.6881830282937,
533.7796307537687,
535.6643140758732,
537.0697590831223,
538.4285261762479,
540.2131663762281,
540.6313902472951,
541.8474371212012,
544.3238901010052,
545.6368332489348,
547.0109120581222,
547.9316133644893,
549.4975675626613,
550.9700100394838,
552.0495722005648,
553.7649721191588,
555.7920205616825,
556.8994764068553,
557.5646591720585,
559.3162370286821,
560.2408074972956,
562.5592076160458,
564.1608791107861,
564.5060559381498,
566.6987876828079,
567.7317579011769,
568.9239551796293,
570.0511147824635,
572.4199841324527,
573.6146105267581,
575.0938860144948,
575.8072471409287,
577.0390034720982,
579.0988346720366,
580.1369593623846,
581.9465762659016,
583.2360882191672,
584.5617059034655,
585.9845632049883,
586.7427718912501,
588.1396632662479,
590.6603975167652,
591.7258580650480,
592.5713583002255,
593.9747146822310,
595.7281536973889,
596.3627683283936,
598.4930773461647,
599.5456403643648,
601.6021367359326,
602.5791678863873,
603.6256189035791,
604.6162184937532,
606.3834604221090,
608.4132173111873,
609.3895751547200,
610.8391629377394,
611.7742096208872,
613.5997786756371,
614.6462378722326,
615.5385633694070,
618.1128313664423,
619.1844825979536,
620.2728936722275,
621.7092945279486,
622.3750027397790,
624.2699000181778,
626.0192834276543,
627.2683968507830,
628.3258623594603,
630.4738874382920,
630.8057809271975,
632.2251411671159,
633.5468582522517,
635.5238003106054,
637.3971931598373,
637.9255139808225,
638.9279382668567,
640.6947946688256,
641.9454996657052,
643.2788837813978,
644.9905782297480,
646.3481915955015,
647.7617530042888,
648.7864008887824,
650.1975193452564,
650.6686838913959,
653.6495716053946,
654.3019205863193,
655.7094630223556,
656.9640845994606,
658.1756144186053,
659.6638459729641,
660.7167325952792,
662.2965864311004,
664.2446046522730,
665.3427630955990,
666.5151477041729,
667.1484948945554,
668.9758488202351,
670.3235852058625,
672.4581835841697,
673.0435782861476,
674.3558978101231,
676.1396743636267,
677.2301806687639,
677.8004447462213,
679.7421978825282,
681.8949915331518,
682.6027350197505,
684.0135498138695,
684.9726298620984,
686.1632235877279,
687.9615431847036,
689.3689413622723,
690.4747350323503,
692.4516844155208,
693.1769700606018,
694.5339086998731,
695.7263359209267,
696.6260699003456,
699.1320954760135,
700.2967391321434,
701.3017429546461,
702.2273431457605,
704.0338392955253,
705.1258139546192,
706.1846547995179,
708.2690708851098,
709.2295885702843,
711.1302741796854,
711.9002899143753,
712.7493834701012,
714.0827718206693,
716.1123964540521,
717.4825697031001,
718.7427865454858,
719.6971009883656,
721.3511622185364,
722.2775049756742,
723.8458210451284,
724.5626138903790,
727.0564032300493,
728.4054815889340,
728.7587497956142,
730.4164821227564,
731.4173549185985,
732.8180527144998,
734.7896432523779,
735.7654592085783,
737.0529289122653,
738.5804211713738,
739.9095236740419,
740.5738074472950,
741.7573355729416,
743.8950131424736,
745.3449895506118,
746.4993058994323,
747.6745636242695,
748.2427544650845,
750.6559503621242,
750.9663810666508,
752.8876215672023,
754.3223704717126,
755.8393089760378,
756.7682484399509,
758.1017292464125,
758.9002382248923,
760.2823669835120,
762.7000332496910,
763.5930661728372,
764.3075227241802,
766.0875400998362,
767.2184721555395,
768.2814618065092,
769.6934072526244,
771.0708393136783,
772.9616175657570,
774.1177446279405,
775.0478470965805,
775.9997119631714,
777.2997485295925,
779.1570769491890,
780.3489250041816,
782.1376643908120,
782.5979439460735,
784.2888226124655,
785.7390897007150,
786.4611474505062,
787.4684638159100,
790.0590923641195,
790.8316204679210,
792.4277076086045,
792.8886525626225,
794.4837918698931,
795.6065961561624,
797.2634700380355,
798.7075701662962,
799.6543362108976,
801.6042464629820,
802.5419848784181,
803.2430962042701,
804.7622391126617,
805.8616356670948,
808.1518149359937,
809.1977833633007,
810.0818048864070,
811.1843588465062,

], dtype=float)

# ---------------------------------------------------------------------
# 1. Prime generation
# ---------------------------------------------------------------------

def approx_nth_prime(n: int) -> int:
    """Crude upper bound for the n-th prime (fine for sieving)."""
    if n < 6:
        return 15
    x = n * (np.log(n) + np.log(np.log(n)))
    return int(x + 10)


def generate_primes(num_primes: int) -> np.ndarray:
    """
    Return the first num_primes primes,
    explicitly excluding 2 from the output.
    """
    # We need one extra prime internally because 2 will be dropped
    target = num_primes + 1

    limit = approx_nth_prime(target)
    while True:
        is_prime = np.ones(limit + 1, dtype=bool)
        is_prime[:2] = False

        for p in range(2, int(np.sqrt(limit)) + 1):
            if is_prime[p]:
                is_prime[p * p:limit + 1:p] = False

        primes = np.nonzero(is_prime)[0]

        # drop 2 explicitly
        primes = primes[primes != 2]

        if len(primes) >= num_primes:
            return primes[:num_primes]

        limit = int(limit * 1.5)


# ---------------------------------------------------------------------
# 2. Curvature field k_n on primes
# ---------------------------------------------------------------------

def compute_curvature_field(
    primes: np.ndarray,
    window_radius: int = WINDOW_RADIUS,
    c: float = CURVATURE_C,
):
    """
    Original κ-field:

        - Build composite mask up to max(primes)+R.
        - For each prime p, consider [p-R, p+R].
        - rho   = composite fraction in window
        - sigma = log(1 + rho log p)
        - k_n   = c * sigma^3 * sqrt(rho)

    Returns (p_used, k_vals).
    """
    max_n = int(primes[-1]) + window_radius + 5

    is_prime = np.ones(max_n + 1, dtype=bool)
    is_prime[:2] = False
    for p in range(2, int(np.sqrt(max_n)) + 1):
        if is_prime[p]:
            is_prime[p * p:max_n + 1:p] = False

    is_composite = ~is_prime
    is_composite[0:2] = False

    p_used = []
    k_vals = []

    for p in primes:
        lo = p - window_radius
        hi = p + window_radius
        if lo < 2 or hi > max_n:
            continue

        window = is_composite[lo:hi + 1]
        rho = window.sum() / window.size
        sigma = np.log(1.0 + rho * np.log(p))
        k_n = c * (sigma ** 3) * np.sqrt(rho)

        p_used.append(p)
        k_vals.append(k_n)

    if SMOOTHING_WINDOW > 1:
        kernel = np.ones(SMOOTHING_WINDOW) / SMOOTHING_WINDOW
        k_vals = np.convolve(k_vals, kernel, mode="same")

    return np.array(p_used, float), np.array(k_vals, float)


def resample_to_log_grid(p_used: np.ndarray,
                         k_vals: np.ndarray):
    """
    Reinterpret k_n as a function of t = log p, and resample onto
    a uniform grid in t using cubic spline interpolation.
    """
    if len(p_used) != len(k_vals):
        raise ValueError("p_used and k_vals must have same length")

    t_raw = np.log(p_used)
    N = len(k_vals)
    t_grid = np.linspace(t_raw[0], t_raw[-1], N)

    # Cubic spline ensures C^2 continuity
    cs = CubicSpline(t_raw, k_vals, bc_type='natural')
    k_log = cs(t_grid)

    return t_grid, k_log

# ---------------------------------------------------------------------
# 2b. Möbius-scale perturbation on the log grid
# ---------------------------------------------------------------------

def mobius_sieve(N: int) -> np.ndarray:
    """
    Compute Möbius function μ(n) for 0 <= n <= N via a sieve.
    Returns int8 array with μ(0) = 0.
    """
    mu = np.ones(N + 1, dtype=np.int8)
    mu[0] = 0

    is_prime = np.ones(N + 1, dtype=bool)
    is_prime[:2] = False

    limit = int(np.sqrt(N)) + 1
    for p in range(2, limit):
        if is_prime[p]:
            # mark composites
            is_prime[p * p::p] = False
            # flip sign on multiples of p
            mu[p::p] *= -1
            # zero on multiples of p^2
            mu[p * p:: (p * p)] = 0

    # handle primes in (sqrt(N), N]
    for p in range(limit, N + 1):
        if is_prime[p]:
            mu[p::p] *= -1

    return mu


def inject_mobius_perturbation(t_grid: np.ndarray,
                               k_log: np.ndarray,
                               rel_amp: float = MU_REL_AMP,
                               smooth_window: int = MU_SMOOTH_WINDOW) -> np.ndarray:
    """
    Add a band-limited, zero-mean Möbius signal to k_log on the log grid.

      1. Build μ(n) up to N ≈ exp(t_max).
      2. Sample μ at x = floor(exp(t)).
      3. Smooth in t with a moving-average kernel.
      4. Normalise to unit variance.
      5. Add as a small perturbation:  k' = k + rel_amp * rms(k) * μ̃.
    """
    # integer range up to the largest x in the log-grid
    x_max = int(np.exp(t_grid[-1])) + 1
    mu_full = mobius_sieve(x_max)

    # sample Möbius along the log grid
    x_samples = np.floor(np.exp(t_grid)).astype(int)
    x_samples = np.clip(x_samples, 0, x_max)
    mu_samples = mu_full[x_samples].astype(float)

    # optional smoothing in log t (removes ultra-high frequency noise)
    if smooth_window > 1:
        if smooth_window % 2 == 0:
            smooth_window += 1  # ensure odd
        kernel = np.ones(smooth_window, dtype=float) / smooth_window
        mu_smooth = np.convolve(mu_samples, kernel, mode="same")
    else:
        mu_smooth = mu_samples

    # zero-mean, unit-variance normalisation
    mu_smooth -= mu_smooth.mean()
    std = mu_smooth.std()
    if std > 0:
        mu_smooth /= std

    # scale by RMS of the curvature field
    rms_k = np.sqrt(np.mean(k_log**2))
    delta_k = rel_amp * rms_k * mu_smooth

    return k_log + delta_k




# ---------------------------------------------------------------------
# 3. Log-grid Laplacian & Hamiltonian
# ---------------------------------------------------------------------

def build_laplacian_index(n_points: int):
    """
    Uniform-grid Laplacian on indices i = 0..N-1 (spacing absorbed into scale):

        L ≈ -d²/dx²  ~  2 on diagonal, -1 on sub/super.

    Endpoints clamped with a large diagonal value.
    """
    main = 2.0 * np.ones(n_points)
    off = -1.0 * np.ones(n_points - 1)
    main[0] = main[-1] = 1e4
    return main, off


def build_hamiltonian(main_lap: np.ndarray,
                      off_lap: np.ndarray,
                      potential: np.ndarray):
    """H = L + V, tri-diagonal sparse matrix."""
    main = main_lap + potential
    return diags([off_lap, main, off_lap], offsets=[-1, 0, 1], format="csc")


def lowest_eigenvalues(H, k: int) -> np.ndarray:
    """Return k smallest eigenvalues of H (sorted)."""
    k = min(k, H.shape[0] - 2)
    vals = eigsh(H, k=k, which="SM", return_eigenvectors=False)
    return np.sort(vals)


# ---------------------------------------------------------------------
# 4. Fitting, plotting & diagnostics
# ---------------------------------------------------------------------

def fit_log_n(lam: np.ndarray, zeros: np.ndarray, fit_n: int):
    """
    Fit   gamma_n ≈ a * lambda_n + c * log(n) + b
    on the first fit_n levels.

    Returns (a, c, b).
    """
    fit_n = min(fit_n, len(lam), len(zeros))
    n_idx = np.arange(1, fit_n + 1, dtype=float)
    X = np.column_stack([
        lam[:fit_n],      # a · λ_n
        np.log(n_idx),    # c · log n
        np.ones(fit_n),   # b
    ])
    params, *_ = np.linalg.lstsq(X, zeros[:fit_n], rcond=None)
    a, c, b = params
    return a, c, b


def evaluate_log_model(lam: np.ndarray,
                       zeros: np.ndarray,
                       params,
                       eval_n: int):
    """
    Evaluate the log-n model on the first eval_n levels.

    Returns (mean_err, max_err, z_hat, residuals).
    """
    a, c, b = params
    eval_n = min(eval_n, len(lam), len(zeros))
    n_idx = np.arange(1, eval_n + 1, dtype=float)

    z_hat = a * lam[:eval_n] + c * np.log(n_idx) + b
    residuals = z_hat - zeros[:eval_n]
    rel_err = np.abs(residuals / zeros[:eval_n]) * 100.0

    return rel_err.mean(), rel_err.max(), z_hat, residuals


def plot_curvature_field(primes_used: np.ndarray,
                         k_vals: np.ndarray,
                         filename: str):
    plt.figure(figsize=(8, 4.5))
    plt.scatter(primes_used, k_vals, s=3, alpha=0.7)
    plt.xscale("log")
    plt.yscale("log")
    plt.xlabel("prime p")
    plt.ylabel("k_p")
    plt.title("Prime curvature field k_p (log-log)")
    plt.grid(True, which="both", ls=":", alpha=0.4)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()


def plot_raw(eigs, zeros, eval_n, filename):
    eval_n = min(eval_n, len(eigs), len(zeros))
    idx = np.arange(1, eval_n + 1)
    plt.figure(figsize=(10, 3.5))
    plt.plot(idx, zeros[:eval_n], "r-", label="Riemann zeros")
    plt.scatter(idx, eigs[:eval_n], label="eigenvalues")
    plt.xlabel("index n")
    plt.ylabel("value")
    plt.title("Raw eigenvalues vs Riemann zeros")
    plt.legend()
    plt.grid(True, ls=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()


def plot_mapped(zeros, z_hat, eval_n, label, filename):
    eval_n = min(eval_n, len(zeros), len(z_hat))
    idx = np.arange(1, eval_n + 1)
    plt.figure(figsize=(10, 3.5))
    plt.plot(idx, zeros[:eval_n], "r-", label="zeros")
    plt.scatter(idx, z_hat[:eval_n], label="mapped eigs")
    plt.xlabel("index n")
    plt.ylabel("value")
    plt.title(f"Eigenvalues vs Riemann zeros ({label})")
    plt.legend()
    plt.grid(True, ls=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()


def plot_residuals(zeros, z_hat, eval_n, label, filename):
    eval_n = min(eval_n, len(zeros), len(z_hat))
    idx = np.arange(1, eval_n + 1)
    residuals = z_hat[:eval_n] - zeros[:eval_n]

    plt.figure(figsize=(10, 3.5))
    plt.axhline(0, color="black", lw=1)
    plt.plot(idx, residuals, "o-")
    plt.xlabel("index n")
    plt.ylabel("residual (mapped_eig - zero)")
    plt.title(f"Residuals ({label})")
    plt.grid(True, ls=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()


# ---------------------------------------------------------------------
# 5. η-variational sweep for the global shape correction
# ---------------------------------------------------------------------

def apply_shape_correction(k_vals: np.ndarray, eta: float) -> np.ndarray:
    """
    Global multiplicative shape correction on k_vals:

        k_n  →  k_n * (1 + eta log n)

    This leaves early levels almost untouched but changes the tail.
    """
    n = np.arange(1, len(k_vals) + 1, dtype=float)
    return k_vals * (1.0 + eta * np.log(n))


def build_hamiltonian_with_corrections(k_vals: np.ndarray,
                                       beta: float,
                                       eta: float) -> tuple[np.ndarray, np.ndarray]:
    """
    Given the curvature field on the log-grid and a shape parameter η,
    build the corrected Hamiltonian and return its eigenvalues
    together with the log-n fit parameters.
    """
    if eta != 0.0:
        k_eff = apply_shape_correction(k_vals, eta)
    else:
        k_eff = k_vals

    main_L, off_L = build_laplacian_index(len(k_eff))

    if EXPONENTIAL_POTENTIAL:
        V = np.exp(ALPHA_EXP * k_eff)
    else:
        V = beta * k_eff

    if GLOBAL_CORRECTION:
        idx = np.arange(1, len(k_eff) + 1, dtype=float)
        V = V + EPS_CORR * np.log(idx)

    H = build_hamiltonian(main_L, off_L, V)
    eigs = lowest_eigenvalues(H, NUM_LEVELS)

    params = fit_log_n(eigs, RIEMANN_ZEROS, fit_n=20)
    return eigs, params


def sweep_eta(etas, k_vals_loggrid, beta=50.0, eval_n=80):
    """
    Variational sweep over η:

    For each η:
        - build Hamiltonian with corrected k_vals
        - compute eigenvalues
        - fit log-n model on first 20
        - evaluate error on first eval_n

    Returns (best_eta, summary_list) where each entry is a dict
    with mean/max errors and tail slope.
    """
    best_eta = None
    best_score = np.inf
    results = []

    for eta in etas:
        print(f"[sweep η] eta = {eta:.2e}")
        eigs, params = build_hamiltonian_with_corrections(k_vals_loggrid, beta, eta)
        mean_err, max_err, z_hat, residuals = evaluate_log_model(
            eigs, RIEMANN_ZEROS, params, eval_n
        )

        # simple measure of tail slope: linear fit on second half of residuals
        m = len(residuals)
        tail_idx = np.arange(m // 2, m)
        tail_res = residuals[m // 2:]
        slope, _ = np.polyfit(tail_idx, tail_res, 1)

        score = mean_err + 0.1 * abs(slope)  # low error + flat tail

        results.append({
            "eta": eta,
            "mean_err": mean_err,
            "max_err": max_err,
            "slope": slope,
        })

        print(f"    mean={mean_err:.3f}%, max={max_err:.3f}%, slope={slope:.4f}")

        if score < best_score:
            best_score = score
            best_eta = eta

    return best_eta, results

# ---------------------------------------------------------------------
# 6. Spectral Unfolding + Nearest-Neighbor Spacing (GUE test)
# ---------------------------------------------------------------------

def unfold_spectrum(eigs, poly_deg=5):
    """
    Unfold spectrum so mean spacing = 1.
    Fit a polynomial to N(E) and map eigenvalues through it.
    """
    eigs = np.sort(eigs)
    n = len(eigs)
    indices = np.arange(n)

    # Fit smooth polynomial to staircase function
    coeffs = np.polyfit(eigs, indices, deg=poly_deg)
    poly = np.poly1d(coeffs)

    # Unfolded spectrum
    unfolded = poly(eigs)
    return unfolded


def wigner_surmise_gue(s):
    return (32 / np.pi**2) * (s**2) * np.exp(- (4 / np.pi) * s**2)


def poisson_dist(s):
    return np.exp(-s)


def analyze_nns(eigs, filename="nns_distribution.png"):
    """
    Compute nearest-neighbor spacings and compare to GUE vs Poisson.
    Saves histogram plot.
    """
    unfolded = unfold_spectrum(eigs, poly_deg=5)
    spacings = np.diff(unfolded)
    spacings = spacings[spacings > 1e-6]
    spacings /= np.mean(spacings)

    plt.figure(figsize=(8, 5))
    count, bins, _ = plt.hist(
        spacings, bins=25, density=True,
        alpha=0.6, color="skyblue", edgecolor="black", label="model spacings"
    )

    s_axis = np.linspace(0, max(bins), 200)
    plt.plot(s_axis, wigner_surmise_gue(s_axis), "r-", lw=2.5, label="GUE")
    plt.plot(s_axis, poisson_dist(s_axis), "g--", lw=2, label="Poisson")

    plt.xlabel("spacing s")
    plt.ylabel("P(s)")
    plt.title("Nearest-Neighbor Spacing Distribution")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(filename)
    plt.close()

    small_s = np.mean(spacings < 0.2)
    print(f"[NNS] fraction s < 0.2 = {small_s:.3f}  (GUE≈0.02, Poisson≈0.18)")

    return spacings



# ---------------------------------------------------------------------
# 7. Main experiment
# ---------------------------------------------------------------------

SCENARIOS = [
    ("log_fit_20_80", 20, 80),
]


def main():
    print("RUNNING PRIME-CURVATURE LOG-GRID HAMILTONIAN")
    print(f"  num_primes={NUM_PRIMES}, beta={BETA}, levels={NUM_LEVELS}")
    print(f"  smoothing window = {SMOOTHING_WINDOW}")
    print(f"  exponential potential = {EXPONENTIAL_POTENTIAL} (alpha={ALPHA_EXP})\n")

    # Primes and curvature
    print("Generating primes...")
    primes = generate_primes(NUM_PRIMES)
    print(f"  primes up to {primes[-1]} generated")

    print("Computing curvature field k_n...")
    p_used, k_vals = compute_curvature_field(primes)
    print(f"  curvature points: {len(k_vals)}")

    plot_curvature_field(p_used, k_vals, "k_field_loglog.png")
    print("  saved curvature plot: k_field_loglog.png")

    # Move to uniform log grid t = log p
    t_grid, k_log = resample_to_log_grid(p_used, k_vals)
    print(f"  log-grid points: {len(t_grid)} (uniform in t = log p)")

    # Inject Möbius-scale perturbations on the log grid (optional)
    if MOBIUS_PERTURBATION:
        print("  injecting Möbius-scale curvature perturbations...")
        k_log = inject_mobius_perturbation(t_grid, k_log)

    # η-variational sweep
    eta_values = np.linspace(0.0, 5e-4, 6)
    best_eta, sweep_results = sweep_eta(eta_values, k_log, beta=BETA, eval_n=80)
    print(f"\nBest η ≈ {best_eta:.2e} from sweep")

    # Build final Hamiltonian
    eigs, params = build_hamiltonian_with_corrections(k_log, BETA, best_eta)

    zeros = RIEMANN_ZEROS
    print("\nLOG-GRID HAMILTONIAN (final)")
    print(f"  lowest eigenvalues (first 5): {eigs[:5]}")

    plot_raw(eigs, zeros, eval_n=40, filename="eigs_vs_zeros_raw.png")
    print("  saved raw comparison plot: eigs_vs_zeros_raw.png")

    for label, fit_n, eval_n in SCENARIOS:
        print(f"\n[{label}] log_n model")

        mean_err, max_err, z_hat, _ = evaluate_log_model(
            eigs, zeros, params, eval_n
        )

        a, c, b = params
        print(
            "  best-fit: gamma_n ≈ "
            f"{a:.4f}·lambda_n + {c:.4f}·log(n) + {b:.4f}"
        )
        print(f"  fitted on first {fit_n} levels, evaluated on first {eval_n}")
        print(f"  mean relative error: {mean_err:.3f}%")
        print(f"  max  relative error: {max_err:.3f}%")

        fname = f"eigs_vs_zeros_{label}.png"
        plot_mapped(zeros, z_hat, eval_n, label, fname)
        print(f"  saved plot: {fname}")

        plot_residuals(zeros, z_hat, eval_n, label, f"residuals_{label}.png")
        print(f"  saved residual plot: residuals_{label}.png")

        # -----------------------------------------------------------------
        # NNS / GUE analysis
        # -----------------------------------------------------------------
        print("\nRunning Nearest-Neighbor Spacing (GUE) analysis...")
        spacings = analyze_nns(eigs, filename="nns_distribution.png")
        print("  saved NNS plot: nns_distribution.png")

    print("\nDone. Plots written to current directory.")


if __name__ == "__main__":
    main()
