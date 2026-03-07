from __future__ import annotations

import argparse
import numpy as np
from typing import NamedTuple
from pathlib import Path
import pandas as pd

from sparc_kappa_plotting import (
    plot_galaxy,
)

from sparc_kappa_lib import (
    Config,
    compute_derived_quantities,
    evaluate_gbar_shear_model,
    evaluate_linear_gbar_model,
    load_and_prepare_galaxy,
)

class FitResults(NamedTuple):
    a: float
    b: float


class FitResults3D(NamedTuple):
    a: float
    b: float
    c: float

def _get_valid_mask(g_bar: np.ndarray, kappa: np.ndarray) -> np.ndarray:
    """Get mask for valid g_bar and kappa values."""
    return (
        np.isfinite(g_bar) & (g_bar > 0) & np.isfinite(kappa)
    )


def _get_valid_mask_shear(
    g_bar: np.ndarray, dvdr: np.ndarray, kappa: np.ndarray
) -> np.ndarray:
    """Get mask for valid g_bar, shear, and kappa values."""
    return (
        np.isfinite(g_bar) & (g_bar > 0) &
        np.isfinite(np.abs(dvdr)) & (np.abs(dvdr) > 0) &
        np.isfinite(kappa)
    )

def _split_train_test(
    galaxies: list[dict], train_fraction: float, seed: int
) -> tuple[list[dict], list[dict]]:
    """Split galaxies into train and test sets."""
    rng = np.random.default_rng(seed)
    indices = np.arange(len(galaxies))
    rng.shuffle(indices)

    n_train = max(1, int(len(indices) * train_fraction))
    n_train = min(n_train, len(indices) - 1)

    train_idx = indices[:n_train]
    test_idx = indices[n_train:]

    return [galaxies[i] for i in train_idx], [galaxies[i] for i in test_idx]

def _collect_training_data(galaxies: list[dict]) -> tuple[np.ndarray, np.ndarray]:
    """Collect log(g_bar) and kappa values from training galaxies."""
    log_gbar_list = []
    kappa_list = []
    
    for g in galaxies:
        mask = _get_valid_mask(g["g_bar_m_per_s2"], g["kappa_r_over2"])
        if np.any(mask):
            log_gbar_list.append(np.log10(g["g_bar_m_per_s2"][mask]))
            kappa_list.append(g["kappa_r_over2"][mask])
    
    return np.concatenate(log_gbar_list), np.concatenate(kappa_list)

def _collect_training_data_shear(galaxies: list[dict]) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Collect log(g_bar), log(|dv/dr|), and kappa values from training galaxies."""
    log_gbar_list = []
    log_dvdr_list = []
    kappa_list = []
    
    for g in galaxies:
        mask = _get_valid_mask_shear(g["g_bar_m_per_s2"], g["dvdr_1_per_s"], g["kappa_r_over2"])
        if np.any(mask):
            log_gbar_list.append(np.log10(g["g_bar_m_per_s2"][mask]))
            log_dvdr_list.append(np.log10(np.abs(g["dvdr_1_per_s"][mask])))
            kappa_list.append(g["kappa_r_over2"][mask])
    
    return np.concatenate(log_gbar_list), np.concatenate(log_dvdr_list), np.concatenate(kappa_list)

def _fit_linear_model(log_x: np.ndarray, y: np.ndarray) -> FitResults:
    """Fit linear model: y = a + b*log_x."""
    if len(log_x) <= 10:
        return FitResults(a=np.nan, b=np.nan)
    
    b, a = np.polyfit(log_x, y, 1)
    return FitResults(a=a, b=b)

def _fit_linear_model_2d(log_x1: np.ndarray, log_x2: np.ndarray, y: np.ndarray) -> FitResults3D:
    """Fit linear model: y = a + b*log_x1 + c*log_x2."""
    if len(log_x1) <= 10 or len(log_x2) != len(log_x1):
        return FitResults3D(a=np.nan, b=np.nan, c=np.nan)
    
    X = np.column_stack([
        np.ones_like(log_x1),
        log_x1,
        log_x2,
    ])
    
    valid = np.all(np.isfinite(X), axis=1) & np.isfinite(y)
    X_valid = X[valid]
    y_valid = y[valid]
    
    if len(y_valid) <= 10:
        return FitResults3D(a=np.nan, b=np.nan, c=np.nan)
    
    coeffs, _, _, _ = np.linalg.lstsq(X_valid, y_valid, rcond=None)
    a, b, c = coeffs
    return FitResults3D(a=a, b=b, c=c)

def _collect_all_data(galaxies: list[dict]) -> dict:
    """Collect all aggregated data from galaxies for plotting."""
    all_r = np.concatenate([g["r_kpc"] for g in galaxies])
    all_kappa_r = np.concatenate([g["kappa_r_over2"] for g in galaxies])
    all_r_norm = np.concatenate([g["r_norm"] for g in galaxies])

    # Shear-related data
    all_shear_log = np.concatenate([
        np.log10(np.abs(g["dvdr_1_per_s"])[
            np.isfinite(np.abs(g["dvdr_1_per_s"])) &
            (np.abs(g["dvdr_1_per_s"]) > 0) &
            np.isfinite(g["kappa_r_over2"])
        ])
        for g in galaxies
    ])
    all_kappa_r_shear = np.concatenate([
        g["kappa_r_over2"][
            np.isfinite(np.abs(g["dvdr_1_per_s"])) &
            (np.abs(g["dvdr_1_per_s"]) > 0) &
            np.isfinite(g["kappa_r_over2"])
        ]
        for g in galaxies
    ])

    # g_bar-related data
    all_log_gbar = np.concatenate([
        np.log10(g["g_bar_m_per_s2"][
            np.isfinite(g["g_bar_m_per_s2"]) &
            (g["g_bar_m_per_s2"] > 0) &
            np.isfinite(g["kappa_r_over2"])
        ])
        for g in galaxies
    ])
    all_kappa_r_gbar = np.concatenate([
        g["kappa_r_over2"][
            np.isfinite(g["g_bar_m_per_s2"]) &
            (g["g_bar_m_per_s2"] > 0) &
            np.isfinite(g["kappa_r_over2"])
        ]
        for g in galaxies
    ])

    # RAR data
    all_log_gobs = np.concatenate([
        np.log10(
            ((g["v_obs_kms"] * 1000.0) ** 2) / g["r_m"]
        )[
            np.isfinite(g["r_m"]) & (g["r_m"] > 0) &
            np.isfinite(g["v_obs_kms"]) & (g["v_obs_kms"] > 0)
        ]
        for g in galaxies
    ])

    all_log_gbar_rar = np.concatenate([
        np.log10(g["g_bar_m_per_s2"][
            np.isfinite(g["g_bar_m_per_s2"]) & (g["g_bar_m_per_s2"] > 0) &
            np.isfinite(g["r_m"]) & (g["r_m"] > 0) &
            np.isfinite(g["v_obs_kms"]) & (g["v_obs_kms"] > 0)
        ])
        for g in galaxies
    ])

    return {
        "r": all_r,
        "kappa_r": all_kappa_r,
        "r_norm": all_r_norm,
        "shear_log": all_shear_log,
        "kappa_r_shear": all_kappa_r_shear,
        "log_gbar": all_log_gbar,
        "kappa_r_gbar": all_kappa_r_gbar,
        "log_gobs": all_log_gobs,
        "log_gbar_rar": all_log_gbar_rar,
    }

def run_single_split(
    processed_galaxies: list[dict],
    cfg: Config,
    train_fraction: float,
    seed: int,
) -> dict:
    rng = np.random.default_rng(seed)
    indices = np.arange(len(processed_galaxies))
    rng.shuffle(indices)

    n_train = max(1, int(len(indices) * train_fraction))
    n_train = min(n_train, len(indices) - 1)

    train_idx = indices[:n_train]
    test_idx = indices[n_train:]

    train_galaxies = [processed_galaxies[i] for i in train_idx]
    test_galaxies = [processed_galaxies[i] for i in test_idx]

    # Fit linear kappa(g_bar) model
    log_gbar, kappa_r = _collect_training_data(train_galaxies)
    fit = _fit_linear_model(log_gbar, kappa_r)

    # Fit 2D model kappa(g_bar, shear)
    log_gbar_2d, log_dvdr, kappa_r_2d = _collect_training_data_shear(train_galaxies)
    fit_2d = _fit_linear_model_2d(log_gbar_2d, log_dvdr, kappa_r_2d)

    # Evaluate on test set
    pred_rows_gbar = []
    if np.isfinite(fit.a) and np.isfinite(fit.b):
        for g in test_galaxies:
            pred = evaluate_linear_gbar_model(g, fit.a, fit.b, cfg)
            if pred is not None:
                pred_rows_gbar.append(pred)

    pred_rows_gbar_shear = []
    if np.isfinite(fit_2d.a) and np.isfinite(fit_2d.b) and np.isfinite(fit_2d.c):
        for g in test_galaxies:
            pred = evaluate_gbar_shear_model(g, fit_2d.a, fit_2d.b, fit_2d.c, cfg)
            if pred is not None:
                pred_rows_gbar_shear.append(pred)

    df_gbar = pd.DataFrame(pred_rows_gbar)
    df_gbar_shear = pd.DataFrame(pred_rows_gbar_shear)

    result = {
        "seed": seed,
        "n_train": len(train_galaxies),
        "n_test": len(test_galaxies),
        "fit_a": fit.a,
        "fit_b": fit.b,
        "fit3_a": fit_2d.a,
        "fit3_b": fit_2d.b,
        "fit3_c": fit_2d.c,
        "n_eval_gbar": len(df_gbar),
        "n_eval_gbar_shear": len(df_gbar_shear),
        "frac_improved_gbar": np.nan,
        "frac_improved_gbar_shear": np.nan,
        "median_chi2_baryons": np.nan,
        "median_chi2_gbar": np.nan,
        "median_chi2_gbar_shear": np.nan,
    }

    if not df_gbar.empty:
        bary = df_gbar["chi2red_baryons"].to_numpy(dtype=float)
        gbar = df_gbar["chi2red_kappa_gbar_model"].to_numpy(dtype=float)

        valid = np.isfinite(bary) & np.isfinite(gbar)
        bary = bary[valid]
        gbar = gbar[valid]

        if len(bary) > 0:
            result["frac_improved_gbar"] = float(np.mean(gbar < bary))
            result["median_chi2_baryons"] = float(np.median(bary))
            result["median_chi2_gbar"] = float(np.median(gbar))

    if not df_gbar_shear.empty:
        bary2 = df_gbar_shear["chi2red_baryons"].to_numpy(dtype=float)
        gbar_shear = df_gbar_shear["chi2red_kappa_gbar_shear_model"].to_numpy(dtype=float)

        valid2 = np.isfinite(bary2) & np.isfinite(gbar_shear)
        bary2 = bary2[valid2]
        gbar_shear = gbar_shear[valid2]

        if len(bary2) > 0:
            result["frac_improved_gbar_shear"] = float(np.mean(gbar_shear < bary2))
            result["median_chi2_gbar_shear"] = float(np.median(gbar_shear))

    return result


def load_processed_galaxies(
    galaxy_files: list[Path],
    cfg: Config,
    args: argparse.Namespace,
    out_root: Path,
    err_path: Path,
) -> tuple[list[dict], int, int]:
    """Load and process galaxy files, returning processed galaxies and error counts."""
    processed_galaxies: list[dict] = []
    skipped_too_few = 0
    failed = 0

    for fpath in galaxy_files:
        try:
            raw = load_and_prepare_galaxy(fpath, cfg)
            if raw is None:
                skipped_too_few += 1
                continue

            processed = compute_derived_quantities(raw, cfg)
            processed_galaxies.append(processed)

            if not args.no_per_galaxy_plots:
                plot_galaxy(processed, out_root / "galaxies", cfg)

        except Exception as e:
            failed += 1
            err_path.open("a").write(f"{fpath.stem}\t{fpath}\t{repr(e)}\n")
            if args.debug:
                print(f"FAIL {fpath.stem}: {e}")

    return processed_galaxies, skipped_too_few, failed


def build_rar_diagnostics(
    processed_galaxies: list[dict],
    fit: FitResults,
    fit_2d: FitResults3D,
) -> dict[str, list[float]]:
    """Build RAR diagnostics for observed data and model predictions."""

    all_log_gbar_obs: list[float] = []
    all_log_gobs_obs: list[float] = []

    all_log_gbar_pred: list[float] = []
    all_log_gobs_pred: list[float] = []
    all_rar_resid_gbar: list[float] = []

    all_log_gbar_pred_shear: list[float] = []
    all_log_gobs_pred_shear: list[float] = []
    all_rar_resid_gbar_shear: list[float] = []

    for g in processed_galaxies:
        r_m = g["r_m"]
        v_obs_mps = g["v_obs_kms"] * 1000.0
        vN_mps = g["vN_kms"] * 1000.0
        g_obs = (v_obs_mps ** 2) / r_m
        g_bar = g["g_bar_m_per_s2"]

        valid_obs = (
            np.isfinite(r_m) & (r_m > 0) &
            np.isfinite(g_obs) & (g_obs > 0) &
            np.isfinite(g_bar) & (g_bar > 0)
        )

        if np.any(valid_obs):
            all_log_gbar_obs.extend(np.log10(g_bar[valid_obs]).tolist())
            all_log_gobs_obs.extend(np.log10(g_obs[valid_obs]).tolist())

        if np.isfinite(fit.a) and np.isfinite(fit.b):
            log_g_bar = np.log10(np.maximum(g_bar, 1e-10))
            kappa_r_over2_model = fit.a + fit.b * log_g_bar
            v_pred_mps = vN_mps * np.exp(kappa_r_over2_model)
            g_pred = (v_pred_mps ** 2) / r_m

            valid_pred = (
                np.isfinite(r_m) & (r_m > 0) &
                np.isfinite(g_pred) & (g_pred > 0) &
                np.isfinite(g_obs) & (g_obs > 0) &
                np.isfinite(g_bar) & (g_bar > 0)
            )

            if np.any(valid_pred):
                log_gbar = np.log10(g_bar[valid_pred])
                log_gpred = np.log10(g_pred[valid_pred])
                log_gobs = np.log10(g_obs[valid_pred])

                all_log_gbar_pred.extend(log_gbar.tolist())
                all_log_gobs_pred.extend(log_gpred.tolist())
                all_rar_resid_gbar.extend((log_gpred - log_gobs).tolist())

        if np.isfinite(fit_2d.a) and np.isfinite(fit_2d.b) and np.isfinite(fit_2d.c):
            abs_dvdr = np.abs(g["dvdr_1_per_s"])
            kappa_r_over2_model_shear = np.full_like(g_bar, np.nan, dtype=float)

            valid_shear = (
                np.isfinite(g_bar) & (g_bar > 0) &
                np.isfinite(abs_dvdr) & (abs_dvdr > 0)
            )

            if np.any(valid_shear):
                log_g_bar_shear = np.log10(g_bar[valid_shear])
                log_dvdr_shear = np.log10(abs_dvdr[valid_shear])
                kappa_r_over2_model_shear[valid_shear] = (
                    fit_2d.a
                    + fit_2d.b * log_g_bar_shear
                    + fit_2d.c * log_dvdr_shear
                )

            v_pred_shear_mps = vN_mps * np.exp(kappa_r_over2_model_shear)
            g_pred_shear = (v_pred_shear_mps ** 2) / r_m

            valid_pred_shear = (
                np.isfinite(r_m) & (r_m > 0) &
                np.isfinite(g_pred_shear) & (g_pred_shear > 0) &
                np.isfinite(g_obs) & (g_obs > 0) &
                np.isfinite(g_bar) & (g_bar > 0)
            )

            if np.any(valid_pred_shear):
                log_gbar = np.log10(g_bar[valid_pred_shear])
                log_gpred_shear = np.log10(g_pred_shear[valid_pred_shear])
                log_gobs = np.log10(g_obs[valid_pred_shear])

                all_log_gbar_pred_shear.extend(log_gbar.tolist())
                all_log_gobs_pred_shear.extend(log_gpred_shear.tolist())
                all_rar_resid_gbar_shear.extend((log_gpred_shear - log_gobs).tolist())

    return {
        "all_log_gbar_obs": all_log_gbar_obs,
        "all_log_gobs_obs": all_log_gobs_obs,
        "all_log_gbar_pred": all_log_gbar_pred,
        "all_log_gobs_pred": all_log_gobs_pred,
        "all_rar_resid_gbar": all_rar_resid_gbar,
        "all_log_gbar_pred_shear": all_log_gbar_pred_shear,
        "all_log_gobs_pred_shear": all_log_gobs_pred_shear,
        "all_rar_resid_gbar_shear": all_rar_resid_gbar_shear,
    }