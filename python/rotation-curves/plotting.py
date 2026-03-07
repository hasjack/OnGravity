import matplotlib.pyplot as plt

from pathlib import Path
import numpy as np
import pandas as pd

from lib import (
    Config,
    # Plotting constants
    FIGURE_SIZE_DEFAULT,
    FIGURE_SIZE_WIDE,
    DPI,
    ALPHA_TRANSPARENT,
    ALPHA_SEMI,
    GRID_STYLE
)

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

def _save_plot(outdir: Path, filename: str) -> None:
    """Save current plot and close figure."""
    outdir.mkdir(parents=True, exist_ok=True)
    plt.savefig(outdir / filename)
    plt.close()