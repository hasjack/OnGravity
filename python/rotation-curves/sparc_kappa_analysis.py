from __future__ import annotations

import argparse
from pathlib import Path
from typing import NamedTuple

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

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


# Plotting constants
FIGURE_SIZE_DEFAULT = (7, 5)
FIGURE_SIZE_WIDE = (7.5, 4.8)
FIGURE_SIZE_TALL = (7.2, 4.5)
DPI = 160
ALPHA_TRANSPARENT = 0.35
ALPHA_SEMI = 0.5
GRID_STYLE = {"linestyle": ":", "alpha": 0.6}


def _style_plot(title: str, xlabel: str, ylabel: str, grid=True):
    """Apply consistent styling to a plot."""
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    if grid:
        plt.grid(**GRID_STYLE)
    plt.tight_layout()


def plot_scatter_with_line(
    x: np.ndarray,
    y: np.ndarray,
    xlabel: str,
    ylabel: str,
    title: str,
    outdir: Path,
    filename: str,
    alpha=ALPHA_TRANSPARENT,
    line_x=None,
    line_y=None,
    line_label=None,
    **scatter_kwargs
):
    """Create a scatter plot with optional line overlay."""
    plt.figure(figsize=FIGURE_SIZE_DEFAULT, dpi=DPI)
    plt.scatter(x, y, alpha=alpha, **scatter_kwargs)

    if line_x is not None and line_y is not None:
        plt.plot(line_x, line_y, linewidth=2, label=line_label)

    if line_label:
        plt.legend()

    _style_plot(title, xlabel, ylabel)
    _save_plot(outdir, filename)


def plot_histogram_comparison(
    data_dict: dict[str, np.ndarray],
    xlabel: str,
    ylabel: str,
    title: str,
    outdir: Path,
    filename: str,
    bins=30,
    figsize=FIGURE_SIZE_WIDE
):
    """Create a histogram comparing multiple datasets."""
    plt.figure(figsize=figsize, dpi=DPI)

    for label, data in data_dict.items():
        if len(data) > 0:
            plt.hist(data, bins=bins, alpha=ALPHA_SEMI, label=label)

    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.title(title)
    plt.grid(**GRID_STYLE)
    plt.legend()
    plt.tight_layout()
    _save_plot(outdir, filename)


def plot_rar_overlay(
    obs_x: np.ndarray,
    obs_y: np.ndarray,
    pred_data: dict[str, tuple[np.ndarray, np.ndarray]],
    outdir: Path,
    filename: str
):
    """Plot RAR (Radial Acceleration Relation) with model predictions."""
    plt.figure(figsize=FIGURE_SIZE_DEFAULT, dpi=DPI)
    plt.scatter(obs_x, obs_y, s=10, alpha=0.25, label="Observed RAR")

    for label, (pred_x, pred_y) in pred_data.items():
        if len(pred_x) > 0:
            plt.scatter(pred_x, pred_y, s=10, alpha=0.25, label=label)

    if len(obs_x) > 0:
        x_min, x_max = np.min(obs_x), np.max(obs_x)
        x_line = np.linspace(x_min, x_max, 300)
        plt.plot(x_line, x_line, linestyle="--", linewidth=1.5, label="g_obs = g_bar")

    plt.xlabel("log10 g_bar  [m s^-2]")
    plt.ylabel("log10 g_obs  [m s^-2]")
    plt.title("RAR — observed vs κ-model predictions")
    plt.grid(**GRID_STYLE)
    plt.legend()
    plt.tight_layout()
    _save_plot(outdir, filename)


def plot_residuals(
    resid_data: dict[str, tuple[np.ndarray, np.ndarray]],
    xlabel: str,
    ylabel: str,
    title: str,
    outdir: Path,
    filename: str,
    zero_line=True
):
    """Plot residuals with optional zero reference line."""
    plt.figure(figsize=FIGURE_SIZE_DEFAULT, dpi=DPI)

    for label, (x_data, y_data) in resid_data.items():
        if len(x_data) > 0:
            plt.scatter(x_data, y_data, s=10, alpha=0.3, label=label)

    if zero_line:
        plt.axhline(0.0, linestyle="--", linewidth=1.5)

    _style_plot(title, xlabel, ylabel)
    plt.legend()
    _save_plot(outdir, filename)


def _save_plot(outdir: Path, filename: str) -> None:
    """Save current plot and close figure."""
    outdir.mkdir(parents=True, exist_ok=True)
    plt.savefig(outdir / filename)
    plt.close()


def plot_galaxy(processed: dict, outdir: Path, cfg: Config) -> None:
    outdir.mkdir(parents=True, exist_ok=True)

    r_kpc = processed["r_kpc"]
    v_obs_kms = processed["v_obs_kms"]
    e_vobs_kms = processed["e_vobs_kms"]
    vN_kms = processed["vN_kms"]
    kappa_r_over2 = processed["kappa_r_over2"]
    v_kappa_emp_kms = processed["v_kappa_emp_kms"]

    res_bary_kms = vN_kms - v_obs_kms
    res_kappa_kms = v_kappa_emp_kms - v_obs_kms
    galaxy_name = processed["name"]

    # Rotation curve plot
    plt.figure(figsize=(7.5, 5.2), dpi=160)
    plt.plot(r_kpc, vN_kms, linestyle="--", linewidth=1.8, label="Newtonian (baryons)")
    if e_vobs_kms is not None and np.all(np.isfinite(e_vobs_kms)):
        plt.errorbar(r_kpc, v_obs_kms, yerr=e_vobs_kms, fmt="o", markersize=4.5, capsize=2.5, label="Observed")
    else:
        plt.plot(r_kpc, v_obs_kms, "o", markersize=4.5, label="Observed")
    plt.plot(r_kpc, v_kappa_emp_kms, linewidth=2.2, label=r"$\kappa$ (empirical)")
    plt.title(f'{galaxy_name} — Rotation Curve')
    plt.xlabel("Radius (kpc)")
    plt.ylabel("Velocity (km/s)")
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.legend()
    plt.tight_layout()
    _save_plot(outdir, f'{galaxy_name}_rotation.png')

    # Residuals plot
    plt.figure(figsize=(7.5, 3.8), dpi=160)
    plt.axhline(0, linewidth=1)
    plt.plot(r_kpc, res_bary_kms, "o-", markersize=3.8, label="Baryons-only residual")
    plt.plot(r_kpc, res_kappa_kms, "o-", markersize=3.8, label=r"$\kappa$ residual (empirical)")
    plt.title(f'{galaxy_name} — Residuals (model - observed)')
    plt.xlabel("Radius (kpc)")
    plt.ylabel("km/s")
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.legend()
    plt.tight_layout()
    _save_plot(outdir, f'{galaxy_name}_residuals.png')

    # Kappa profile plot
    plt.figure(figsize=(7.5, 4.2), dpi=160)
    plt.plot(r_kpc, kappa_r_over2, "o-", markersize=3.8)
    plt.title(f'{galaxy_name} — Empirical $\\kappa r/2$')
    plt.xlabel("Radius (kpc)")
    plt.ylabel(r"$\kappa r/2$ (dimensionless)")
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.tight_layout()
    _save_plot(outdir, f'{galaxy_name}_kappa_profile.png')

    # Save time series data
    pd.DataFrame(
        {
            "r_kpc": processed["r_kpc"],
            "r_m": processed["r_m"],
            "r_norm": processed["r_norm"],
            "v_obs_kms": processed["v_obs_kms"],
            "e_vobs_kms": processed["e_vobs_kms"] if processed["e_vobs_kms"] is not None else np.nan,
            "vN_kms": processed["vN_kms"],
            "v_kappa_emp_kms": processed["v_kappa_emp_kms"],
            "kappa_emp_1_per_m": processed["kappa_emp_1_per_m"],
            "kappa_r_over2": processed["kappa_r_over2"],
            "g_bar_m_per_s2": processed["g_bar_m_per_s2"],
            "dvdr_1_per_s": processed["dvdr_1_per_s"],
            "res_bary_kms": res_bary_kms,
            "res_kappa_emp_kms": res_kappa_kms,
        }
    ).to_csv(outdir / f'{galaxy_name}_series.csv', index=False)

    pd.DataFrame(
        {
            "r_kpc": processed["r_kpc"],
            "r_m": processed["r_m"],
            "vN_kms": processed["vN_kms"],
            "dvdr_1_per_s": processed["dvdr_1_per_s"],
            "g_bar_m_per_s2": processed["g_bar_m_per_s2"],
        }
    ).to_csv(outdir / f'{galaxy_name}_shear.csv', index=False)


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


def main() -> None:
    ap = argparse.ArgumentParser(description="SPARC κ-framework analysis pipeline.")
    ap.add_argument("--mass-models", required=True, help="Path to unzipped SPARC mass-model files directory.")
    ap.add_argument("--out", default="out_sparc_v2", help="Output directory for plots + CSVs.")
    ap.add_argument("--max-galaxies", type=int, default=0, help="0 = all galaxies; otherwise limit.")
    ap.add_argument("--ups-disk", type=float, default=0.5, help="Disk M/L scaling.")
    ap.add_argument("--ups-bulge", type=float, default=0.7, help="Bulge M/L scaling.")
    ap.add_argument("--gas-scale", type=float, default=1.0, help="Gas scaling.")
    ap.add_argument("--min-points", type=int, default=6, help="Minimum number of points required per galaxy.")
    ap.add_argument("--train-fraction", type=float, default=0.8, help="Fraction of galaxies used for training.")
    ap.add_argument("--seed", type=int, default=42, help="Random seed for train/test split.")
    ap.add_argument("--no-per-galaxy-plots", action="store_true", help="Skip per-galaxy plot generation.")
    ap.add_argument("--debug", action="store_true", help="Print fail reasons.")
    ap.add_argument("--n-splits", type=int, default=1, help="Number of random train/test splits to run.")
    args = ap.parse_args()

    cfg = Config(
        ups_disk=args.ups_disk,
        ups_bulge=args.ups_bulge,
        gas_scale=args.gas_scale,
        min_points=args.min_points,
    )

    mass_dir = Path(args.mass_models).expanduser().resolve()
    out_root = Path(args.out).expanduser().resolve()
    out_root.mkdir(parents=True, exist_ok=True)

    galaxy_files = sorted(mass_dir.rglob("*_rotmod.dat"))
    if args.max_galaxies and args.max_galaxies > 0:
        galaxy_files = galaxy_files[: args.max_galaxies]

    err_path = out_root / "_errors.txt"
    if err_path.exists():
        err_path.unlink()

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

    if not processed_galaxies:
        print("No galaxies processed.")
        print(f"Wrote outputs to: {out_root}")
        return
    
    if len(processed_galaxies) < 2:
        print("Need at least 2 processed galaxies for a train/test split.")
        print(f"Wrote outputs to: {out_root}")
        return

    split_results = []
    for i in range(args.n_splits):
        seed_i = args.seed + i
        split_result = run_single_split(
            processed_galaxies=processed_galaxies,
            cfg=cfg,
            train_fraction=args.train_fraction,
            seed=seed_i,
        )
        split_results.append(split_result)

    df_splits = pd.DataFrame(split_results)
    df_splits.to_csv(out_root / "multi_split_summary.csv", index=False)

    # Get the first split's train/test sets for main analysis
    train_galaxies, test_galaxies = _split_train_test(
        processed_galaxies, args.train_fraction, args.seed
    )

    # Write train/test split info
    with open(out_root / "train_test_split.txt", "w") as f:
        f.write(f"seed = {args.seed}\n")
        f.write(f"train_fraction = {args.train_fraction}\n")
        f.write(f"n_total = {len(processed_galaxies)}\n")
        f.write(f"n_train = {len(train_galaxies)}\n")
        f.write(f"n_test = {len(test_galaxies)}\n")

    # Collect training data for fitting
    train_log_gbar, train_kappa_r_gbar = _collect_training_data(train_galaxies)
    train_log_gbar_2d, train_log_abs_dvdr, train_kappa_r_gbar_shear = _collect_training_data_shear(train_galaxies)
    
    # Fit models on training data
    fit = _fit_linear_model(train_log_gbar, train_kappa_r_gbar)
    fit_2d = _fit_linear_model_2d(train_log_gbar_2d, train_log_abs_dvdr, train_kappa_r_gbar_shear)
    
    # Collect all-galaxy data for plots
    all_data = _collect_all_data(processed_galaxies)

    # Create and save summary dataframe
    summary_rows = [
        {
            "galaxy": g["name"],
            "n_points": len(g["r_kpc"]),
            "ups_disk": cfg.ups_disk,
            "ups_bulge": cfg.ups_bulge,
            "gas_scale": cfg.gas_scale,
            "chi2red_baryons": g["chi2red_baryons"],
            "chi2red_kappa_emp": g["chi2red_kappa_emp"],
            "mean_kappa_r_over2": float(np.nanmean(g["kappa_r_over2"])),
            "std_kappa_r_over2": float(np.nanstd(g["kappa_r_over2"])),
        }
        for g in processed_galaxies
    ]

    df_sum = pd.DataFrame(summary_rows).sort_values(by=["chi2red_baryons"], na_position="last")
    df_sum.to_csv(out_root / "summary.csv", index=False)

    # Save model fits
    if np.isfinite(fit.a) and np.isfinite(fit.b):
        with open(out_root / "kappa_gbar_fit.txt", "w") as f:
            f.write(f"a = {fit.a}\n")
            f.write(f"b = {fit.b}\n")
            f.write("model: kappa_r_over2 = a + b * log10(g_bar)\n")

    if np.isfinite(fit_2d.a) and np.isfinite(fit_2d.b) and np.isfinite(fit_2d.c):
        with open(out_root / "kappa_gbar_shear_fit.txt", "w") as f:
            f.write(f"a = {fit_2d.a}\n")
            f.write(f"b = {fit_2d.b}\n")
            f.write(f"c = {fit_2d.c}\n")
            f.write("model: kappa_r_over2 = a + b * log10(g_bar) + c * log10(|dv/dr|)\n")

    # Evaluate models on test sets
    pred_rows = []
    if np.isfinite(fit.a) and np.isfinite(fit.b):
        for g in test_galaxies:
            pred = evaluate_linear_gbar_model(g, fit.a, fit.b, cfg)
            if pred is not None:
                pred_rows.append(pred)

    if pred_rows:
        pd.DataFrame(pred_rows).to_csv(out_root / "summary_kappa_gbar_model.csv", index=False)

    pred_rows_gbar_shear = []
    if np.isfinite(fit_2d.a) and np.isfinite(fit_2d.b) and np.isfinite(fit_2d.c):
        for g in test_galaxies:
            pred = evaluate_gbar_shear_model(g, fit_2d.a, fit_2d.b, fit_2d.c, cfg)
            if pred is not None:
                pred_rows_gbar_shear.append(pred)

    if pred_rows_gbar_shear:
        pd.DataFrame(pred_rows_gbar_shear).to_csv(
            out_root / "summary_kappa_gbar_shear_model.csv",
            index=False,
        )

    # Compute RAR (Radial Acceleration Relation) residuals
    all_log_gbar_obs = []
    all_log_gobs_obs = []
    all_log_gbar_pred = []
    all_log_gobs_pred = []
    all_rar_resid_gbar = []
    all_log_gbar_pred_shear = []
    all_log_gobs_pred_shear = []
    all_rar_resid_gbar_shear = []

    for g in processed_galaxies:
        r_m = g["r_m"]
        v_obs_mps = g["v_obs_kms"] * 1000.0
        vN_mps = g["vN_kms"] * 1000.0
        g_obs = (v_obs_mps ** 2) / r_m
        g_bar = g["g_bar_m_per_s2"]

        valid_obs = _get_valid_mask(g_bar, g_obs)
        if np.any(valid_obs):
            all_log_gbar_obs.extend(np.log10(g_bar[valid_obs]).tolist())
            all_log_gobs_obs.extend(np.log10(g_obs[valid_obs]).tolist())

        # Predict with linear g_bar model
        if np.isfinite(fit.a) and np.isfinite(fit.b):
            log_g_bar = np.log10(np.maximum(g_bar, 1e-10))
            kappa_r_over2_model = fit.a + fit.b * log_g_bar
            v_pred_mps = vN_mps * np.exp(kappa_r_over2_model)
            g_pred = (v_pred_mps ** 2) / r_m

            valid_pred = _get_valid_mask(g_bar, g_pred) & np.isfinite(g_obs) & (g_obs > 0)
            if np.any(valid_pred):
                all_log_gbar_pred.extend(np.log10(g_bar[valid_pred]).tolist())
                all_log_gobs_pred.extend(np.log10(g_pred[valid_pred]).tolist())
                all_rar_resid_gbar.extend((np.log10(g_pred[valid_pred]) - np.log10(g_obs[valid_pred])).tolist())

        # Predict with 2D g_bar + shear model
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
                    fit_2d.a + fit_2d.b * log_g_bar_shear + fit_2d.c * log_dvdr_shear
                )

            v_pred_shear_mps = vN_mps * np.exp(kappa_r_over2_model_shear)
            g_pred_shear = (v_pred_shear_mps ** 2) / r_m

            valid_pred_shear = _get_valid_mask(g_bar, g_pred_shear) & np.isfinite(g_obs) & (g_obs > 0)
            if np.any(valid_pred_shear):
                all_log_gbar_pred_shear.extend(np.log10(g_bar[valid_pred_shear]).tolist())
                all_log_gobs_pred_shear.extend(np.log10(g_pred_shear[valid_pred_shear]).tolist())
                all_rar_resid_gbar_shear.extend(
                    (np.log10(g_pred_shear[valid_pred_shear]) - np.log10(g_obs[valid_pred_shear])).tolist()
                )

    # Create plots
    plot_scatter_with_line(
        all_data["r"], all_data["kappa_r"],
        "Radius (kpc)", "κ r / 2", "SPARC galaxies — empirical κ structure",
        out_root, "kappa_stack.png"
    )

    plot_scatter_with_line(
        all_data["r_norm"], all_data["kappa_r"],
        "r / r_last", "κ r / 2", "SPARC galaxies — empirical κ vs normalized radius",
        out_root, "kappa_vs_rnorm.png"
    )

    plot_scatter_with_line(
        all_data["shear_log"], all_data["kappa_r_shear"],
        "log10 |dv/dr|  [s^-1]", "κ r / 2", "SPARC galaxies — empirical κ vs baryonic shear",
        out_root, "kappa_vs_shear.png"
    )

    plot_scatter_with_line(
        all_data["log_gbar"], all_data["kappa_r_gbar"],
        "log10 g_bar  [m s^-2]", "κ r / 2", "SPARC galaxies — empirical κ vs baryonic acceleration",
        out_root, "kappa_vs_gbar.png"
    )

    # Plot fit
    if np.isfinite(fit.a) and np.isfinite(fit.b):
        x_line = np.linspace(np.min(train_log_gbar), np.max(train_log_gbar), 300)
        y_line = fit.a + fit.b * x_line

        plot_scatter_with_line(
            train_log_gbar, train_kappa_r_gbar,
            "log10 g_bar  [m s^-2]", "κ r / 2",
            "SPARC train set — fitted κ model vs baryonic acceleration",
            out_root, "kappa_vs_gbar_fit.png",
            alpha=0.2, s=10,
            line_x=x_line, line_y=y_line,
            line_label=f"fit: y = {fit.a:.3f} + {fit.b:.3f} x"
        )

    # Plot RAR
    if len(all_data["log_gbar_rar"]) > 0 and len(all_data["log_gobs"]) > 0:
        x_min = min(np.min(all_data["log_gbar_rar"]), np.min(all_data["log_gobs"]))
        x_max = max(np.max(all_data["log_gbar_rar"]), np.max(all_data["log_gobs"]))
        x_line = np.linspace(x_min, x_max, 300)

        plt.figure(figsize=FIGURE_SIZE_DEFAULT, dpi=DPI)
        plt.scatter(all_data["log_gbar_rar"], all_data["log_gobs"], s=10, alpha=0.35, label="SPARC points")
        plt.plot(x_line, x_line, linestyle="--", linewidth=1.5, label="g_obs = g_bar")
        plt.xlabel("log10 g_bar  [m s^-2]")
        plt.ylabel("log10 g_obs  [m s^-2]")
        plt.title("SPARC galaxies — radial acceleration relation")
        plt.grid(**GRID_STYLE)
        plt.legend()
        plt.tight_layout()
        _save_plot(out_root, "rar_gobs_vs_gbar.png")

    # Chi2 histograms
    x = df_sum["chi2red_baryons"].to_numpy(dtype=float)
    x = x[np.isfinite(x)]
    if len(x) > 0:
        plt.figure(figsize=FIGURE_SIZE_TALL, dpi=DPI)
        plt.hist(x, bins=30)
        plt.title("SPARC sample — reduced χ² (baryons-only)")
        plt.xlabel("χ²_red")
        plt.ylabel("count")
        plt.grid(**GRID_STYLE)
        plt.tight_layout()
        _save_plot(out_root, "chi2red_baryons_hist.png")

    if pred_rows:
        df_pred = pd.DataFrame(pred_rows)
        x_bary = df_pred["chi2red_baryons"].to_numpy(dtype=float)
        x_pred = df_pred["chi2red_kappa_gbar_model"].to_numpy(dtype=float)

        x_bary = x_bary[np.isfinite(x_bary)]
        x_pred = x_pred[np.isfinite(x_pred)]

        if len(x_bary) > 0 and len(x_pred) > 0:
            plot_histogram_comparison(
                {"Baryons-only": x_bary, "κ(g_bar) model": x_pred},
                "χ²_red", "count", "SPARC test set — baryons-only vs κ(g_bar) model",
                out_root, "chi2red_baryons_vs_kappa_gbar_model.png"
            )

    if pred_rows and pred_rows_gbar_shear:
        df_pred2 = pd.DataFrame(pred_rows)
        df_pred3 = pd.DataFrame(pred_rows_gbar_shear)

        x_bary = df_pred2["chi2red_baryons"].to_numpy(dtype=float)
        x_gbar = df_pred2["chi2red_kappa_gbar_model"].to_numpy(dtype=float)
        x_gbar_shear = df_pred3["chi2red_kappa_gbar_shear_model"].to_numpy(dtype=float)

        x_bary = x_bary[np.isfinite(x_bary)]
        x_gbar = x_gbar[np.isfinite(x_gbar)]
        x_gbar_shear = x_gbar_shear[np.isfinite(x_gbar_shear)]

        if len(x_bary) > 0 and len(x_gbar) > 0 and len(x_gbar_shear) > 0:
            plot_histogram_comparison(
                {"Baryons-only": x_bary, "κ(g_bar)": x_gbar, "κ(g_bar, shear)": x_gbar_shear},
                "χ²_red", "count", "SPARC test set — model comparison",
                out_root, "chi2red_model_comparison.png"
            )

    if len(df_splits) > 0:
        # Fraction improved histogram
        x1 = df_splits["frac_improved_gbar"].to_numpy(dtype=float)
        x1 = x1[np.isfinite(x1)]
        x2 = df_splits["frac_improved_gbar_shear"].to_numpy(dtype=float)
        x2 = x2[np.isfinite(x2)]

        data_dict = {}
        if len(x1) > 0:
            data_dict["κ(g_bar)"] = x1
        if len(x2) > 0:
            data_dict["κ(g_bar, shear)"] = x2

        if data_dict:
            plot_histogram_comparison(
                data_dict, "Fraction of test galaxies improved", "count",
                "Multi-split robustness — fraction improved",
                out_root, "multi_split_fraction_improved.png", bins=20
            )

        # Median chi2 histogram
        xb = df_splits["median_chi2_baryons"].to_numpy(dtype=float)
        xb = xb[np.isfinite(xb)]
        xg = df_splits["median_chi2_gbar"].to_numpy(dtype=float)
        xg = xg[np.isfinite(xg)]
        xgs = df_splits["median_chi2_gbar_shear"].to_numpy(dtype=float)
        xgs = xgs[np.isfinite(xgs)]

        data_dict = {}
        if len(xb) > 0:
            data_dict["Baryons-only"] = xb
        if len(xg) > 0:
            data_dict["κ(g_bar)"] = xg
        if len(xgs) > 0:
            data_dict["κ(g_bar, shear)"] = xgs

        if data_dict:
            plot_histogram_comparison(
                data_dict, "Median χ²_red on test galaxies", "count",
                "Multi-split robustness — median test χ²",
                out_root, "multi_split_median_chi2.png", bins=20
            )

    # RAR overlay plots
    if len(all_log_gbar_obs) > 0:
        pred_data = {}
        if len(all_log_gbar_pred) > 0:
            pred_data["κ(g_bar)"] = (all_log_gbar_pred, all_log_gobs_pred)
        if len(all_log_gbar_pred_shear) > 0:
            pred_data["κ(g_bar, shear)"] = (all_log_gbar_pred_shear, all_log_gobs_pred_shear)

        plot_rar_overlay(all_log_gbar_obs, all_log_gobs_obs, pred_data, out_root, "rar_model_overlay.png")

    # RAR residuals vs g_bar
    if len(all_rar_resid_gbar) > 0:
        resid_data = {"κ(g_bar)": (all_log_gbar_pred, all_rar_resid_gbar)}
        if len(all_rar_resid_gbar_shear) > 0:
            resid_data["κ(g_bar, shear)"] = (all_log_gbar_pred_shear, all_rar_resid_gbar_shear)

        plot_residuals(
            resid_data, "log10 g_bar  [m s^-2]", "Δ log10 g_obs",
            "RAR residuals — κ model minus observed", out_root, "rar_residual_vs_gbar.png"
        )

    # RAR residuals distribution
    if len(all_rar_resid_gbar) > 0:
        data_dict = {"κ(g_bar)": all_rar_resid_gbar}
        if len(all_rar_resid_gbar_shear) > 0:
            data_dict["κ(g_bar, shear)"] = all_rar_resid_gbar_shear

        plot_histogram_comparison(
            data_dict, "Δ log10 g_obs", "count", "RAR residual distribution",
            out_root, "rar_residual_hist.png"
        )

    # Save galaxy lists and print results
    pd.DataFrame({"galaxy": [g["name"] for g in train_galaxies]}).to_csv(
        out_root / "train_galaxies.csv", index=False
    )
    pd.DataFrame({"galaxy": [g["name"] for g in test_galaxies]}).to_csv(
        out_root / "test_galaxies.csv", index=False
    )

    # Print summary statistics
    if len(df_splits) > 0:
        mean_frac_gbar = df_splits["frac_improved_gbar"].mean()
        mean_frac_gbar_shear = df_splits["frac_improved_gbar_shear"].mean()
        print(f"Mean fraction improved, κ(g_bar): {mean_frac_gbar:.3f}")
        print(f"Mean fraction improved, κ(g_bar, shear): {mean_frac_gbar_shear:.3f}")

    print(f"Done. Wrote outputs to: {out_root}")
    print(f"Processed galaxies: {len(processed_galaxies)}")
    if args.debug:
        print(f"Total files: {len(galaxy_files)}  failed: {failed}  skipped_too_few: {skipped_too_few}")

    # Print fit parameter statistics
    df = pd.read_csv(out_root / "multi_split_summary.csv")

    print("\nκ(g_bar) fit parameters:")
    print(f"  a: {df['fit_a'].mean():.6f} ± {df['fit_a'].std():.6f}")
    print(f"  b: {df['fit_b'].mean():.6f} ± {df['fit_b'].std():.6f}")

    print("\nκ(g_bar, shear) fit parameters:")
    print(f"  a: {df['fit3_a'].mean():.6f} ± {df['fit3_a'].std():.6f}")
    print(f"  b: {df['fit3_b'].mean():.6f} ± {df['fit3_b'].std():.6f}")
    print(f"  c: {df['fit3_c'].mean():.6f} ± {df['fit3_c'].std():.6f}")

    # Save parameter distributions
    for param, title in [
        ("fit_a", "κ(g_bar) parameter a"),
        ("fit_b", "κ(g_bar) parameter b"),
        ("fit3_a", "κ(g_bar, shear) parameter a"),
        ("fit3_b", "κ(g_bar, shear) parameter b"),
        ("fit3_c", "κ(g_bar, shear) parameter c"),
    ]:
        plt.figure(figsize=(7, 5), dpi=160)
        plt.hist(df[param], bins=20)
        plt.title(f"Distribution of {title}")
        plt.ylabel("count")
        plt.grid(True, linestyle=":", alpha=0.6)
        plt.tight_layout()
        _save_plot(out_root, f"param_dist_{param}.png")


if __name__ == "__main__":
    main()