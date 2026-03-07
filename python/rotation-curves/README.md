# κ-Framework SPARC Analysis Pipeline
## Overview

This repository contains an exploratory analysis pipeline for testing the κ-framework hypothesis using the SPARC galaxy rotation curve dataset.

The working premise is that discrepancies between baryonic Newtonian rotation curves and observed galaxy rotation curves may be representable through a multiplicative environmental correction to the Newtonian velocity profile.

Instead of introducing a dark matter halo, the κ-framework expresses the observed velocity as:

$$
v_{\text{obs}}(r) = v_N(r),\exp\left(\frac{\kappa(r),r}{2}\right)
$$

where:

$(v_N)$ is the Newtonian velocity produced by baryonic mass components

$(r)$ is radius

$(\kappa(r))$ is an environmental curvature response term

The current codebase performs three main tasks:

* Construct baryons-only Newtonian rotation curves from SPARC mass models.

* Compute empirical κ profiles directly from the data.

* Test simple predictive κ models against the observed rotation curves.

The purpose of this repository is exploratory: to determine whether a simple environmental function ($\kappa$) can systematically account for the observed rotation-curve discrepancies across the SPARC sample.

## Dataset

The pipeline uses the SPARC (Spitzer Photometry & Accurate Rotation Curves) dataset.

SPARC provides:

- observed rotation velocities
- baryonic mass model components
- uncertainties on observed velocities

The mass model files are typically named:

`*_rotmod.dat`

These contain columns such as:

`Rad`   `Vobs`   `errV`  `Vgas`   `Vdisk`   `Vbul`

Some files include additional columns such as:

- Vbar
- SBdisk
- SBbul

The pipeline automatically detects and normalizes these formats.

- Physical Quantities
- Baryonic Newtonian Velocity

The baryons-only circular velocity is computed from the SPARC mass components:

$$
v_N = \sqrt{
V_{\text{gas}}^2 +
(\sqrt{\Upsilon_d}\,V_{\text{disk}})^2 +
(\sqrt{\Upsilon_b}\,V_{\text{bul}})^2
}
$$

where:

- ($\Upsilon_d$) = disk mass-to-light ratio (default 0.5)
- ($\Upsilon_b$) = bulge mass-to-light ratio (default 0.7)

If the SPARC file already provides ($V_{\text{bar}}$), that value is used directly.

## Empirical κ Extraction

From the κ-framework relation

$$
v_{\text{obs}} = v_N,\exp(\kappa r/2)
$$

we can compute an empirical κ directly from the data:

$$
\kappa(r) =
\frac{2}{r}
\ln\left(
\frac{v_{\text{obs}}}{v_N}
\right)
$$

The pipeline stores and analyzes:

$$
\kappa r/2 = \ln\left(\frac{v_{\text{obs}}}{v_N}\right)
$$

which is dimensionless and easier to visualize.

## Baryonic Acceleration

Baryonic acceleration is computed as:

$$
g_{\text{bar}} = \frac{v_N^2}{r}
$$

This quantity is frequently used in rotation-curve phenomenology.

## Baryonic Shear

Shear is estimated as the radial velocity gradient:

$$
\frac{dv}{dr}
$$

using a smoothed derivative of the baryonic velocity profile.

## Empirical Analysis

The pipeline stacks κ measurements across the SPARC sample and explores relationships between

$$
\kappa r/2
$$

and several physical variables:

- radius
- normalized radius
- baryonic acceleration
- baryonic shear

Generated plots include:

- kappa_stack.png
- kappa_vs_gbar.png
- kappa_vs_shear.png
- kappa_vs_rnorm.png

These plots allow visual identification of potential environmental dependencies of $\kappa$.

## First Predictive Model

The current exploratory model assumes κ depends on baryonic acceleration:

$$
\kappa r/2 = a + b,\log_{10}(g_{\text{bar}})
$$

The pipeline performs a global least-squares fit across the SPARC sample to estimate the parameters (a) and (b).

Predicted velocities are then computed as:

$$
v_{\text{pred}} = v_N,\exp(\kappa r/2)
$$

## Model Evaluation

Model performance is evaluated using reduced χ²:

$$
\chi^2_{\text{red}} =
\frac{1}{N}
\sum
\left(
\frac{v_{\text{model}} - v_{\text{obs}}}{\sigma_v}
\right)^2
$$

Two models are compared:

* baryons-only Newtonian prediction
* κ(g_bar) model

Outputs include:

- summary.csv
- summary_kappa_gbar_model.csv
- chi2red_baryons_hist.png
- chi2red_baryons_vs_kappa_gbar_model.png

These allow evaluation of whether the κ model improves the fit to observed rotation curves.

## Pipeline Outputs

Per-galaxy outputs:

- *_rotation.png
- *_residuals.png
- *_kappa_profile.png
- *_series.csv
- *_shear.csv

Global outputs:

- kappa_stack.png
- kappa_vs_gbar.png
- kappa_vs_shear.png
- kappa_vs_rnorm.png
- kappa_vs_gbar_fit.png
- chi2red_baryons_hist.png
- chi2red_baryons_vs_kappa_gbar_model.png
- summary.csv
- summary_kappa_gbar_model.csv

## Running the Pipeline

Example usage:

`python kappa_sparc.py --mass-models Rotmod_LTG`

Optional parameters:

```
--max-galaxies N
--ups-disk VALUE
--ups-bulge VALUE
--gas-scale VALUE
--no-per-galaxy-plots
--debug
```

## Current Status

The current pipeline successfully:

- loads and normalizes SPARC mass-model files
- constructs baryons-only rotation curves
- extracts empirical κ profiles
- identifies environmental correlations
- fits a first global κ(g_bar) relation
- evaluates predictive performance against baryons-only models

The κ(g_bar) model produces systematic improvements over baryons-only predictions for a large fraction of the SPARC sample.

## Known Limitations

This is still an exploratory analysis.

Current limitations include:

- model parameters are fitted and evaluated on the same dataset
- no train/test split or cross-validation
- κ model currently depends only on baryonic acceleration
- shear and density terms are not yet included
- uncertainty propagation for fitted κ models is not implemented
- galaxy morphology differences are not accounted for

Future work will explore more complete environmental dependencies for $\kappa$.

## Project Goal

The broader goal of this project is to test whether galaxy rotation-curve discrepancies can be described by an environmental curvature response encoded in the $\kappa$-framework, potentially providing an alternative description to conventional dark matter halo models.