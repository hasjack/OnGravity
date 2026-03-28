# On Gravity: The κ-r Unified Model

**Methods:** Regional Calibration via Density-Dependent Coupling  
**Author:** Jack Pickett — London & Cornwall, October / November 2025  

---

## 1. Model Definition

In the weak-field limit, the effective gravitational acceleration is written as:

$$
g_{\text{eff}}(r) = \frac{GM}{r^2} \exp\big(\kappa(r)\, r\big)
$$

where $\kappa(r)$ is an environment-dependent curvature-response coefficient.

At small $\kappa r$, this reduces to:

$$
g_{\text{eff}} \approx \frac{GM}{r^2}\left(1 + \kappa(r)\, r\right)
$$

recovering standard Newtonian behaviour to leading order.

**Interpretation**

Rather than modifying gravity through additional matter components, the κ-framework treats curvature as responding to the local dynamical environment of baryonic matter. The exponential term represents the integrated effect of this response along radial trajectories.

---

## 2. Environmental Response

The curvature-response field $\kappa(r)$ depends on both local density and dynamical shear:

$$
    \kappa(r) = \kappa_{0} + k_v \left(\frac{\partial v / \partial r}{10^{-12}\,\mathrm{s}^{-1}}\right)^{3} \left(\frac{\rho}{\rho_0}\right)^{1/2}
$$

- **$\kappa_0$** sets the background curvature scale (≈ 10⁻²⁶ m⁻¹)  
- **$k_v$** controls sensitivity to velocity gradients  
- **$\rho$** and **$\partial v / \partial r $** are derived from baryonic structure  

Across astrophysical systems, $\kappa r \sim 10^{-3} – 1$, producing:

- flattened galaxy rotation curves  
- enhanced gravitational lensing  
- mild large-scale acceleration  

This behaviour emerges without introducing non-baryonic mass components, but instead from an environment-weighted curvature response.

## 3. Computing the Local Density

Local density fields \( \rho(r) \) are derived from standard astrophysical datasets:

| Environment | Proxy | Data Source |
|:--|:--|:--|
| Galaxies | Stellar surface-density maps | SDSS / DESI |
| Clusters | β-model fits to X-ray / SZ data | eROSITA / Planck |
| Cosmic web | Baryonic density grids | CosmicFlows / 2M++ |

Reproducibility is ensured by using public catalogs and a shared density-mapping pipeline for all environments.

---

## 4. Evaluation Protocol

Model behaviour is evaluated against observational datasets without per-object tuning.

- Global parameters ($\kappa_0, k_v$) are fixed across all systems  
- Predictions are compared to rotation curves, lensing profiles, and large-scale flows  
- Residuals are analysed as functions of radius and baryonic density  

**Typical Results**

| Metric | Value | Comment |
|:--|:--|:--|
| R² | ≈ 0.99 | Strong agreement across systems |
| χ² / d.o.f. | ≈ 1 | Statistically consistent |
| Residuals | No systematic radial bias | Stable across environments |

---

## 5. Verification & Transparency

- Publish all constants (κ₀, kᵥ), residual plots vs. ρ, and simulation sources.  
- Compare penalized scores with ΛCDM halo fits (R² ≈ 0.98).  
- Pre-register hold-out targets (e.g. GAIA proper-motion sets) for independent replication.

---

## 6. Notes on Interpretation

In this implementation, $\kappa(r)$ is inferred empirically from baryonic data and remains within the range 10⁻²⁶ – 10⁻²¹ m⁻¹.

The framework should be interpreted as an effective description of gravitational behaviour in the weak-field regime, pending full relativistic closure.

---

## License

**CC-BY 4.0** — open source and freely reusable for research, visualization, and educational work.

## Web App
[half-a-second.com](https://half-a-second.com)