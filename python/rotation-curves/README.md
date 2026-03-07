# κ-Framework SPARC Analysis Pipeline

## Overview

This repository contains an exploratory analysis pipeline for testing the κ-framework hypothesis using the SPARC galaxy rotation curve dataset.

The working premise is that discrepancies between baryonic Newtonian rotation curves and observed galaxy rotation curves may be representable through a multiplicative environmental correction to the Newtonian velocity profile.

Instead of introducing a dark matter halo, the κ-framework expresses the observed velocity as:

$$
v_{\text{obs}}(r) = v_N(r),\exp\left(\frac{\kappa(r),r}{2}\right)
$$

where:

(v_N) is the Newtonian velocity produced by baryonic mass components
(r) is radius
(κ(r)) is an environmental curvature response term

The current codebase performs several main tasks:

* Construct baryons-only Newtonian rotation curves from SPARC mass models
* Compute empirical κ profiles directly from the data
* Explore environmental correlations of κ across the SPARC sample
* Fit predictive κ models
* Evaluate predictive performance against baryons-only rotation curves

The purpose of this repository is exploratory: to determine whether a simple environmental function (κ) can systematically account for the observed rotation-curve discrepancies across the SPARC galaxy sample.

## Dataset

The pipeline uses the SPARC (Spitzer Photometry & Accurate Rotation Curves) dataset.

SPARC provides:

* observed rotation velocities
* baryonic mass model components
* uncertainties on observed velocities

The mass model files are typically named:

*_rotmod.dat

These contain columns such as:

Rad   Vobs   errV   Vgas   Vdisk   Vbul

Some files include additional columns such as:

* Vbar
* SBdisk
* SBbul

The pipeline automatically detects and normalizes these formats.

## Physical Quantities

### Baryonic Newtonian Velocity

The baryons-only circular velocity is computed from the SPARC mass components:

$$
v_N = \sqrt{
V_{\text{gas}}^2 +
(\sqrt{\Upsilon_d},V_{\text{disk}})^2 +
(\sqrt{\Upsilon_b},V_{\text{bul}})^2
}
$$

where:

(Υ_d) = disk mass-to-light ratio (default 0.5)
(Υ_b) = bulge mass-to-light ratio (default 0.7)

If the SPARC file already provides (V_bar), that value is used directly.

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

* radius
* normalized radius
* baryonic acceleration
* baryonic shear

Generated plots include:

* kappa_stack.png
* kappa_vs_gbar.png
* kappa_vs_shear.png
* kappa_vs_rnorm.png

These plots allow visual identification of potential environmental dependencies of κ.

## Predictive Models

### κ(g_bar) Model

The first predictive model assumes κ depends on baryonic acceleration:

$$
\kappa r/2 = a + b,\log_{10}(g_{\text{bar}})
$$

Predicted velocities are then computed as:

$$
v_{\text{pred}} = v_N,\exp(\kappa r/2)
$$

### κ(g_bar, shear) Model

A second model includes baryonic shear:

$$
\kappa r/2 =
a + b,\log_{10}(g_{\text{bar}}) * c,\log_{10}(|dv/dr|)
$$

This model tests whether local dynamical shear contributes to the environmental curvature response.

## Model Fitting

Model parameters are estimated using least-squares fits to the SPARC galaxy sample.

To test robustness, the pipeline performs multiple random train/test splits of the galaxy set.

For each split:

* a training set is used to fit model parameters
* a test set is used to evaluate predictive performance

Statistics are aggregated across multiple random splits.

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

Three models are compared:

* baryons-only Newtonian prediction
* κ(g_bar) model
* κ(g_bar, shear) model

Evaluation outputs include:

* χ² distributions
* fraction of galaxies improved
* median χ² across test samples

## Radial Acceleration Relation (RAR)

The pipeline also evaluates the relationship between

$$
g_{\text{obs}} = \frac{v_{\text{obs}}^2}{r}
$$

and

$$
g_{\text{bar}}
$$

to compare the κ-framework predictions against the observed radial acceleration relation.

Residual diagnostics include:

* RAR overlay plots
* residuals vs baryonic acceleration
* residual distributions

## Output Structure

Pipeline outputs are organized into structured directories.

out_sparc_v2/

plots/
kappa_stack.png
kappa_vs_gbar.png
kappa_vs_shear.png
kappa_vs_rnorm.png
kappa_vs_gbar_fit.png

```
rar/
    rar_gobs_vs_gbar.png
    rar_model_overlay.png
    rar_residual_vs_gbar.png
    rar_residual_hist.png

chi2/
    chi2red_baryons_hist.png
    chi2red_baryons_vs_kappa_gbar_model.png
    chi2red_model_comparison.png

robustness/
    multi_split_fraction_improved.png
    multi_split_median_chi2.png

parameters/
    param_dist_fit_a.png
    param_dist_fit_b.png
    param_dist_fit3_a.png
    param_dist_fit3_b.png
    param_dist_fit3_c.png
```

tables/
summary.csv
summary_kappa_gbar_model.csv
summary_kappa_gbar_shear_model.csv
multi_split_summary.csv
train_galaxies.csv
test_galaxies.csv

models/
kappa_gbar_fit.txt
kappa_gbar_shear_fit.txt

diagnostics/
train_test_split.txt
_errors.txt

galaxies/
*_rotation.png
*_residuals.png
*_kappa_profile.png
*_series.csv
*_shear.csv

## Running the Pipeline

Example usage:

python sparc_kappa_analysis.py --mass-models Rotmod_LTG

Optional parameters:

--max-galaxies N
--ups-disk VALUE
--ups-bulge VALUE
--gas-scale VALUE
--train-fraction VALUE
--n-splits VALUE
--seed VALUE
--no-per-galaxy-plots
--debug

## Current Status

The current pipeline successfully:

* loads and normalizes SPARC mass-model files
* constructs baryons-only rotation curves
* extracts empirical κ profiles
* identifies environmental correlations
* fits global κ(g_bar) and κ(g_bar, shear) relations
* evaluates predictive performance using repeated train/test splits
* compares predictions against the radial acceleration relation

Both κ models produce systematic improvements over baryons-only predictions for a large fraction of the SPARC galaxy sample.

## Known Limitations

This remains an exploratory analysis.

Current limitations include:

* κ models are simple linear parameterizations
* uncertainty propagation for fitted κ models is not yet implemented
* galaxy morphology differences are not explicitly modeled
* only baryonic acceleration and shear have been tested as environmental predictors
* more sophisticated environmental dependencies remain unexplored

Future work will explore more complete environmental dependencies for κ.

## Project Goal

The broader goal of this project is to test whether galaxy rotation-curve discrepancies can be described by an environmental curvature response encoded in the κ-framework, potentially providing an alternative description to conventional dark matter halo models.
