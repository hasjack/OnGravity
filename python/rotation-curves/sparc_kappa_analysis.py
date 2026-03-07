from __future__ import annotations

import argparse
from pathlib import Path

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

    plt.figure(figsize=(7.5, 5.2), dpi=160)
    plt.plot(r_kpc, vN_kms, linestyle="--", linewidth=1.8, label="Newtonian (baryons)")
    if e_vobs_kms is not None and np.all(np.isfinite(e_vobs_kms)):
        plt.errorbar(r_kpc, v_obs_kms, yerr=e_vobs_kms, fmt="o", markersize=4.5, capsize=2.5, label="Observed")
    else:
        plt.plot(r_kpc, v_obs_kms, "o", markersize=4.5, label="Observed")
    plt.plot(r_kpc, v_kappa_emp_kms, linewidth=2.2, label="$\kappa$ (empirical)")
    plt.title(f'{processed["name"]} — Rotation Curve')
    plt.xlabel("Radius (kpc)")
    plt.ylabel("Velocity (km/s)")
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.legend()
    plt.tight_layout()
    plt.savefig(outdir / f'{processed["name"]}_rotation.png')
    plt.close()

    plt.figure(figsize=(7.5, 3.8), dpi=160)
    plt.axhline(0, linewidth=1)
    plt.plot(r_kpc, res_bary_kms, "o-", markersize=3.8, label="Baryons-only residual")
    plt.plot(r_kpc, res_kappa_kms, "o-", markersize=3.8, label="$\kappa$ residual (empirical)")
    plt.title(f'{processed["name"]} — Residuals (model - observed)')
    plt.xlabel("Radius (kpc)")
    plt.ylabel("km/s")
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.legend()
    plt.tight_layout()
    plt.savefig(outdir / f'{processed["name"]}_residuals.png')
    plt.close()

    plt.figure(figsize=(7.5, 4.2), dpi=160)
    plt.plot(r_kpc, kappa_r_over2, "o-", markersize=3.8)
    plt.title(f'{processed["name"]} — Empirical $\\kappa r/2$')
    plt.xlabel("Radius (kpc)")
    plt.ylabel(r"$\kappa r/2$ (dimensionless)")
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(outdir / f'{processed["name"]}_kappa_profile.png')
    plt.close()

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
    ).to_csv(outdir / f'{processed["name"]}_series.csv', index=False)

    pd.DataFrame(
        {
            "r_kpc": processed["r_kpc"],
            "r_m": processed["r_m"],
            "vN_kms": processed["vN_kms"],
            "dvdr_1_per_s": processed["dvdr_1_per_s"],
            "g_bar_m_per_s2": processed["g_bar_m_per_s2"],
        }
    ).to_csv(outdir / f'{processed["name"]}_shear.csv', index=False)

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

    # --- fit kappa(g_bar)
    train_log_gbar = np.concatenate([
        np.log10(g["g_bar_m_per_s2"][
            np.isfinite(g["g_bar_m_per_s2"]) &
            (g["g_bar_m_per_s2"] > 0) &
            np.isfinite(g["kappa_r_over2"])
        ])
        for g in train_galaxies
    ])

    train_kappa_r_gbar = np.concatenate([
        g["kappa_r_over2"][
            np.isfinite(g["g_bar_m_per_s2"]) &
            (g["g_bar_m_per_s2"] > 0) &
            np.isfinite(g["kappa_r_over2"])
        ]
        for g in train_galaxies
    ])

    fit_a = np.nan
    fit_b = np.nan
    if len(train_log_gbar) > 10:
        fit_b, fit_a = np.polyfit(train_log_gbar, train_kappa_r_gbar, 1)

    # --- fit kappa(g_bar, shear)
    train_log_abs_dvdr = np.concatenate([
        np.log10(np.abs(g["dvdr_1_per_s"])[
            np.isfinite(g["g_bar_m_per_s2"]) &
            (g["g_bar_m_per_s2"] > 0) &
            np.isfinite(np.abs(g["dvdr_1_per_s"])) &
            (np.abs(g["dvdr_1_per_s"]) > 0) &
            np.isfinite(g["kappa_r_over2"])
        ])
        for g in train_galaxies
    ])

    train_kappa_r_gbar_shear = np.concatenate([
        g["kappa_r_over2"][
            np.isfinite(g["g_bar_m_per_s2"]) &
            (g["g_bar_m_per_s2"] > 0) &
            np.isfinite(np.abs(g["dvdr_1_per_s"])) &
            (np.abs(g["dvdr_1_per_s"]) > 0) &
            np.isfinite(g["kappa_r_over2"])
        ]
        for g in train_galaxies
    ])

    fit3_a = np.nan
    fit3_b = np.nan
    fit3_c = np.nan

    if len(train_log_gbar) > 10 and len(train_log_abs_dvdr) == len(train_log_gbar):
        X = np.column_stack([
            np.ones_like(train_log_gbar),
            train_log_gbar,
            train_log_abs_dvdr,
        ])
        y = train_kappa_r_gbar_shear

        valid = np.all(np.isfinite(X), axis=1) & np.isfinite(y)
        X = X[valid]
        y = y[valid]

        if len(y) > 10:
            coeffs, _, _, _ = np.linalg.lstsq(X, y, rcond=None)
            fit3_a, fit3_b, fit3_c = coeffs

    # --- evaluate on test
    pred_rows_gbar = []
    if np.isfinite(fit_a) and np.isfinite(fit_b):
        for g in test_galaxies:
            pred = evaluate_linear_gbar_model(g, fit_a, fit_b, cfg)
            if pred is not None:
                pred_rows_gbar.append(pred)

    pred_rows_gbar_shear = []
    if np.isfinite(fit3_a) and np.isfinite(fit3_b) and np.isfinite(fit3_c):
        for g in test_galaxies:
            pred = evaluate_gbar_shear_model(g, fit3_a, fit3_b, fit3_c, cfg)
            if pred is not None:
                pred_rows_gbar_shear.append(pred)

    df_gbar = pd.DataFrame(pred_rows_gbar)
    df_gbar_shear = pd.DataFrame(pred_rows_gbar_shear)

    result = {
        "seed": seed,
        "n_train": len(train_galaxies),
        "n_test": len(test_galaxies),
        "fit_a": fit_a,
        "fit_b": fit_b,
        "fit3_a": fit3_a,
        "fit3_b": fit3_b,
        "fit3_c": fit3_c,
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

    rng = np.random.default_rng(args.seed)
    indices = np.arange(len(processed_galaxies))
    rng.shuffle(indices)

    n_train = max(1, int(len(indices) * args.train_fraction))
    n_train = min(n_train, len(indices) - 1)

    train_idx = indices[:n_train]
    test_idx = indices[n_train:]

    train_galaxies = [processed_galaxies[i] for i in train_idx]
    test_galaxies = [processed_galaxies[i] for i in test_idx]

    with open(out_root / "train_test_split.txt", "w") as f:
        f.write(f"seed = {args.seed}\n")
        f.write(f"train_fraction = {args.train_fraction}\n")
        f.write(f"n_total = {len(processed_galaxies)}\n")
        f.write(f"n_train = {len(train_galaxies)}\n")
        f.write(f"n_test = {len(test_galaxies)}\n")

    train_log_gbar = np.concatenate([
        np.log10(g["g_bar_m_per_s2"][
            np.isfinite(g["g_bar_m_per_s2"]) &
            (g["g_bar_m_per_s2"] > 0) &
            np.isfinite(g["kappa_r_over2"])
        ])
        for g in train_galaxies
    ])

    train_kappa_r_gbar = np.concatenate([
        g["kappa_r_over2"][
            np.isfinite(g["g_bar_m_per_s2"]) &
            (g["g_bar_m_per_s2"] > 0) &
            np.isfinite(g["kappa_r_over2"])
        ]
        for g in train_galaxies
    ])

    train_log_abs_dvdr = np.concatenate([
        np.log10(np.abs(g["dvdr_1_per_s"])[
            np.isfinite(g["g_bar_m_per_s2"]) &
            (g["g_bar_m_per_s2"] > 0) &
            np.isfinite(np.abs(g["dvdr_1_per_s"])) &
            (np.abs(g["dvdr_1_per_s"]) > 0) &
            np.isfinite(g["kappa_r_over2"])
        ])
        for g in train_galaxies
    ])

    train_kappa_r_gbar_shear = np.concatenate([
        g["kappa_r_over2"][
            np.isfinite(g["g_bar_m_per_s2"]) &
            (g["g_bar_m_per_s2"] > 0) &
            np.isfinite(np.abs(g["dvdr_1_per_s"])) &
            (np.abs(g["dvdr_1_per_s"]) > 0) &
            np.isfinite(g["kappa_r_over2"])
        ]
        for g in train_galaxies
    ])

    all_r = np.concatenate([g["r_kpc"] for g in processed_galaxies])
    all_kappa_r = np.concatenate([g["kappa_r_over2"] for g in processed_galaxies])
    all_r_norm = np.concatenate([g["r_norm"] for g in processed_galaxies])

    all_shear_log = np.concatenate([
        np.log10(np.abs(g["dvdr_1_per_s"])[
            np.isfinite(np.abs(g["dvdr_1_per_s"])) &
            (np.abs(g["dvdr_1_per_s"]) > 0) &
            np.isfinite(g["kappa_r_over2"])
        ])
        for g in processed_galaxies
    ])
    all_kappa_r_shear = np.concatenate([
        g["kappa_r_over2"][
            np.isfinite(np.abs(g["dvdr_1_per_s"])) &
            (np.abs(g["dvdr_1_per_s"]) > 0) &
            np.isfinite(g["kappa_r_over2"])
        ]
        for g in processed_galaxies
    ])

    all_log_gbar = np.concatenate([
        np.log10(g["g_bar_m_per_s2"][
            np.isfinite(g["g_bar_m_per_s2"]) &
            (g["g_bar_m_per_s2"] > 0) &
            np.isfinite(g["kappa_r_over2"])
        ])
        for g in processed_galaxies
    ])
    all_kappa_r_gbar = np.concatenate([
        g["kappa_r_over2"][
            np.isfinite(g["g_bar_m_per_s2"]) &
            (g["g_bar_m_per_s2"] > 0) &
            np.isfinite(g["kappa_r_over2"])
        ]
        for g in processed_galaxies
    ])

    all_log_gobs = np.concatenate([
        np.log10(
            (
                (g["v_obs_kms"] * 1000.0) ** 2
            ) / g["r_m"]
        )[
            np.isfinite(g["r_m"]) &
            (g["r_m"] > 0) &
            np.isfinite(g["v_obs_kms"]) &
            (g["v_obs_kms"] > 0)
        ]
        for g in processed_galaxies
    ])

    all_log_gbar_rar = np.concatenate([
        np.log10(g["g_bar_m_per_s2"][
            np.isfinite(g["g_bar_m_per_s2"]) &
            (g["g_bar_m_per_s2"] > 0) &
            np.isfinite(g["r_m"]) &
            (g["r_m"] > 0) &
            np.isfinite(g["v_obs_kms"]) &
            (g["v_obs_kms"] > 0)
        ])
        for g in processed_galaxies
    ])

    all_kappa_r_norm = np.concatenate([g["kappa_r_over2"] for g in processed_galaxies])

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

    fit_a = np.nan
    fit_b = np.nan
    if len(train_log_gbar) > 10:
        fit_b, fit_a = np.polyfit(train_log_gbar, train_kappa_r_gbar, 1)
        

    if np.isfinite(fit_a) and np.isfinite(fit_b):
        with open(out_root / "kappa_gbar_fit.txt", "w") as f:
            f.write(f"a = {fit_a}\n")
            f.write(f"b = {fit_b}\n")
            f.write("model: kappa_r_over2 = a + b * log10(g_bar)\n")

    pred_rows = []
    if np.isfinite(fit_a) and np.isfinite(fit_b):
        for g in test_galaxies:
            pred = evaluate_linear_gbar_model(g, fit_a, fit_b, cfg)
            if pred is not None:
                pred_rows.append(pred)

    if pred_rows:
        pd.DataFrame(pred_rows).to_csv(out_root / "summary_kappa_gbar_model.csv", index=False)

    fit3_a = np.nan
    fit3_b = np.nan
    fit3_c = np.nan

    if len(train_log_gbar) > 10 and len(train_log_abs_dvdr) == len(train_log_gbar):
        X = np.column_stack([
            np.ones_like(train_log_gbar),
            train_log_gbar,
            train_log_abs_dvdr,
        ])
        y = train_kappa_r_gbar_shear

        valid = np.all(np.isfinite(X), axis=1) & np.isfinite(y)
        X = X[valid]
        y = y[valid]

        if len(y) > 10:
            coeffs, _, _, _ = np.linalg.lstsq(X, y, rcond=None)
            fit3_a, fit3_b, fit3_c = coeffs

    if np.isfinite(fit3_a) and np.isfinite(fit3_b) and np.isfinite(fit3_c):
        with open(out_root / "kappa_gbar_shear_fit.txt", "w") as f:
            f.write(f"a = {fit3_a}\n")
            f.write(f"b = {fit3_b}\n")
            f.write(f"c = {fit3_c}\n")
            f.write("model: kappa_r_over2 = a + b * log10(g_bar) + c * log10(|dv/dr|)\n")

    pred_rows_gbar_shear = []
    if np.isfinite(fit3_a) and np.isfinite(fit3_b) and np.isfinite(fit3_c):
        for g in test_galaxies:
            pred = evaluate_gbar_shear_model(g, fit3_a, fit3_b, fit3_c, cfg)
            if pred is not None:
                pred_rows_gbar_shear.append(pred)

    if pred_rows_gbar_shear:
        pd.DataFrame(pred_rows_gbar_shear).to_csv(
            out_root / "summary_kappa_gbar_shear_model.csv",
            index=False,
        )

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

        valid_obs = (
            np.isfinite(r_m) & (r_m > 0) &
            np.isfinite(g_obs) & (g_obs > 0) &
            np.isfinite(g_bar) & (g_bar > 0)
        )

        if np.any(valid_obs):
            all_log_gbar_obs.extend(np.log10(g_bar[valid_obs]).tolist())
            all_log_gobs_obs.extend(np.log10(g_obs[valid_obs]).tolist())

        if np.isfinite(fit_a) and np.isfinite(fit_b):
            kappa_r_over2_model = fit_a + fit_b * np.log10(g_bar)
            v_pred_mps = vN_mps * np.exp(kappa_r_over2_model)
            g_pred = (v_pred_mps ** 2) / r_m

            valid_pred = (
                np.isfinite(g_pred) & (g_pred > 0) &
                np.isfinite(g_obs) & (g_obs > 0) &
                np.isfinite(g_bar) & (g_bar > 0)
            )

            if np.any(valid_pred):
                log_gbar = np.log10(g_bar[valid_pred])
                log_gobs = np.log10(g_obs[valid_pred])
                log_gpred = np.log10(g_pred[valid_pred])

                all_log_gbar_pred.extend(log_gbar.tolist())
                all_log_gobs_pred.extend(log_gpred.tolist())
                all_rar_resid_gbar.extend((log_gpred - log_gobs).tolist())

        if np.isfinite(fit3_a) and np.isfinite(fit3_b) and np.isfinite(fit3_c):
            abs_dvdr = np.abs(g["dvdr_1_per_s"])
            valid_shear = np.isfinite(abs_dvdr) & (abs_dvdr > 0) & np.isfinite(g_bar) & (g_bar > 0)

            kappa_r_over2_model_shear = np.full_like(g_bar, np.nan, dtype=float)
            kappa_r_over2_model_shear[valid_shear] = (
                fit3_a
                + fit3_b * np.log10(g_bar[valid_shear])
                + fit3_c * np.log10(abs_dvdr[valid_shear])
            )

            v_pred_shear_mps = vN_mps * np.exp(kappa_r_over2_model_shear)
            g_pred_shear = (v_pred_shear_mps ** 2) / r_m

            valid_pred_shear = (
                np.isfinite(g_pred_shear) & (g_pred_shear > 0) &
                np.isfinite(g_obs) & (g_obs > 0) &
                np.isfinite(g_bar) & (g_bar > 0)
            )

            if np.any(valid_pred_shear):
                log_gbar = np.log10(g_bar[valid_pred_shear])
                log_gobs = np.log10(g_obs[valid_pred_shear])
                log_gpred_shear = np.log10(g_pred_shear[valid_pred_shear])

                all_log_gbar_pred_shear.extend(log_gbar.tolist())
                all_log_gobs_pred_shear.extend(log_gpred_shear.tolist())
                all_rar_resid_gbar_shear.extend((log_gpred_shear - log_gobs).tolist())
        

    # plots
    plt.figure(figsize=(7, 5), dpi=160)
    plt.scatter(all_r, all_kappa_r, s=10, alpha=0.35)
    plt.xlabel("Radius (kpc)")
    plt.ylabel("κ r / 2")
    plt.title("SPARC galaxies — empirical κ structure")
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(out_root / "kappa_stack.png")
    plt.close()

    plt.figure(figsize=(7, 5), dpi=160)
    plt.scatter(all_r_norm, all_kappa_r_norm, s=10, alpha=0.35)
    plt.xlabel("r / r_last")
    plt.ylabel("κ r / 2")
    plt.title("SPARC galaxies — empirical κ vs normalized radius")
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(out_root / "kappa_vs_rnorm.png")
    plt.close()

    plt.figure(figsize=(7, 5), dpi=160)
    plt.scatter(all_shear_log, all_kappa_r_shear, s=10, alpha=0.35)
    plt.xlabel("log10 |dv/dr|  [s^-1]")
    plt.ylabel("κ r / 2")
    plt.title("SPARC galaxies — empirical κ vs baryonic shear")
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(out_root / "kappa_vs_shear.png")
    plt.close()

    plt.figure(figsize=(7, 5), dpi=160)
    plt.scatter(all_log_gbar, all_kappa_r_gbar, s=10, alpha=0.35)
    plt.xlabel("log10 g_bar  [m s^-2]")
    plt.ylabel("κ r / 2")
    plt.title("SPARC galaxies — empirical κ vs baryonic acceleration")
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(out_root / "kappa_vs_gbar.png")
    plt.close()

    if np.isfinite(fit_a) and np.isfinite(fit_b):
        x_line = np.linspace(np.min(train_log_gbar), np.max(train_log_gbar), 300)
        y_line = fit_a + fit_b * x_line

        plt.figure(figsize=(7, 5), dpi=160)
        plt.scatter(train_log_gbar, train_kappa_r_gbar, s=10, alpha=0.2, label="Train galaxies")
        plt.plot(x_line, y_line, linewidth=2, label=f"fit: y = {fit_a:.3f} + {fit_b:.3f} x")
        plt.xlabel("log10 g_bar  [m s^-2]")
        plt.ylabel("κ r / 2")
        plt.title("SPARC train set — fitted κ model vs baryonic acceleration")
        plt.grid(True, linestyle=":", alpha=0.6)
        plt.legend()
        plt.tight_layout()
        plt.savefig(out_root / "kappa_vs_gbar_fit.png")
        plt.close()

    if len(all_log_gbar_rar) > 0 and len(all_log_gobs) > 0:
        x_min = min(np.min(all_log_gbar_rar), np.min(all_log_gobs))
        x_max = max(np.max(all_log_gbar_rar), np.max(all_log_gobs))
        x_line = np.linspace(x_min, x_max, 300)

        plt.figure(figsize=(7, 5), dpi=160)
        plt.scatter(all_log_gbar_rar, all_log_gobs, s=10, alpha=0.35, label="SPARC points")
        plt.plot(x_line, x_line, linestyle="--", linewidth=1.5, label="g_obs = g_bar")
        plt.xlabel("log10 g_bar  [m s^-2]")
        plt.ylabel("log10 g_obs  [m s^-2]")
        plt.title("SPARC galaxies — radial acceleration relation")
        plt.grid(True, linestyle=":", alpha=0.6)
        plt.legend()
        plt.tight_layout()
        plt.savefig(out_root / "rar_gobs_vs_gbar.png")
        plt.close()

    x = df_sum["chi2red_baryons"].to_numpy(dtype=float)
    x = x[np.isfinite(x)]
    if len(x) > 0:
        plt.figure(figsize=(7.2, 4.5), dpi=160)
        plt.hist(x, bins=30)
        plt.title("SPARC sample — reduced χ² (baryons-only)")
        plt.xlabel("χ²_red")
        plt.ylabel("count")
        plt.grid(True, linestyle=":", alpha=0.6)
        plt.tight_layout()
        plt.savefig(out_root / "chi2red_baryons_hist.png")
        plt.close()

    if pred_rows:
        df_pred = pd.DataFrame(pred_rows)
        x_bary = df_pred["chi2red_baryons"].to_numpy(dtype=float)
        x_pred = df_pred["chi2red_kappa_gbar_model"].to_numpy(dtype=float)

        x_bary = x_bary[np.isfinite(x_bary)]
        x_pred = x_pred[np.isfinite(x_pred)]

        if len(x_bary) > 0 and len(x_pred) > 0:
            plt.figure(figsize=(7.2, 4.5), dpi=160)
            plt.hist(x_bary, bins=30, alpha=0.5, label="Baryons-only")
            plt.hist(x_pred, bins=30, alpha=0.5, label="κ(g_bar) model")
            plt.xlabel("χ²_red")
            plt.ylabel("count")
            plt.title("SPARC test set — baryons-only vs κ(g_bar) model")
            plt.grid(True, linestyle=":", alpha=0.6)
            plt.legend()
            plt.tight_layout()
            plt.savefig(out_root / "chi2red_baryons_vs_kappa_gbar_model.png")
            plt.close()

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
            plt.figure(figsize=(7.5, 4.8), dpi=160)
            plt.hist(x_bary, bins=30, alpha=0.45, label="Baryons-only")
            plt.hist(x_gbar, bins=30, alpha=0.45, label="κ(g_bar)")
            plt.hist(x_gbar_shear, bins=30, alpha=0.45, label="κ(g_bar, shear)")
            plt.xlabel("χ²_red")
            plt.ylabel("count")
            plt.title("SPARC test set — model comparison")
            plt.grid(True, linestyle=":", alpha=0.6)
            plt.legend()
            plt.tight_layout()
            plt.savefig(out_root / "chi2red_model_comparison.png")
            plt.close()

    if len(df_splits) > 0:
        # fraction improved
        plt.figure(figsize=(7.2, 4.5), dpi=160)
        x1 = df_splits["frac_improved_gbar"].to_numpy(dtype=float)
        x1 = x1[np.isfinite(x1)]
        if len(x1) > 0:
            plt.hist(x1, bins=20, alpha=0.5, label="κ(g_bar)")
        x2 = df_splits["frac_improved_gbar_shear"].to_numpy(dtype=float)
        x2 = x2[np.isfinite(x2)]
        if len(x2) > 0:
            plt.hist(x2, bins=20, alpha=0.5, label="κ(g_bar, shear)")
        plt.xlabel("Fraction of test galaxies improved")
        plt.ylabel("count")
        plt.title("Multi-split robustness — fraction improved")
        plt.grid(True, linestyle=":", alpha=0.6)
        plt.legend()
        plt.tight_layout()
        plt.savefig(out_root / "multi_split_fraction_improved.png")
        plt.close()

        # median chi2
        plt.figure(figsize=(7.2, 4.5), dpi=160)
        xb = df_splits["median_chi2_baryons"].to_numpy(dtype=float)
        xb = xb[np.isfinite(xb)]
        xg = df_splits["median_chi2_gbar"].to_numpy(dtype=float)
        xg = xg[np.isfinite(xg)]
        xgs = df_splits["median_chi2_gbar_shear"].to_numpy(dtype=float)
        xgs = xgs[np.isfinite(xgs)]

        if len(xb) > 0:
            plt.hist(xb, bins=20, alpha=0.4, label="Baryons-only")
        if len(xg) > 0:
            plt.hist(xg, bins=20, alpha=0.4, label="κ(g_bar)")
        if len(xgs) > 0:
            plt.hist(xgs, bins=20, alpha=0.4, label="κ(g_bar, shear)")

        plt.xlabel("Median χ²_red on test galaxies")
        plt.ylabel("count")
        plt.title("Multi-split robustness — median test χ²")
        plt.grid(True, linestyle=":", alpha=0.6)
        plt.legend()
        plt.tight_layout()
        plt.savefig(out_root / "multi_split_median_chi2.png")
        plt.close()

    if len(all_log_gbar_obs) > 0:
        plt.figure(figsize=(7, 5), dpi=160)
        plt.scatter(all_log_gbar_obs, all_log_gobs_obs, s=10, alpha=0.25, label="Observed RAR")

        if len(all_log_gbar_pred) > 0:
            plt.scatter(all_log_gbar_pred, all_log_gobs_pred, s=10, alpha=0.25, label="κ(g_bar)")

        if len(all_log_gbar_pred_shear) > 0:
            plt.scatter(all_log_gbar_pred_shear, all_log_gobs_pred_shear, s=10, alpha=0.25, label="κ(g_bar, shear)")

        x_min = min(all_log_gbar_obs)
        x_max = max(all_log_gbar_obs)
        x_line = np.linspace(x_min, x_max, 300)
        plt.plot(x_line, x_line, linestyle="--", linewidth=1.5, label="g_obs = g_bar")

        plt.xlabel("log10 g_bar  [m s^-2]")
        plt.ylabel("log10 g_obs  [m s^-2]")
        plt.title("RAR — observed vs κ-model predictions")
        plt.grid(True, linestyle=":", alpha=0.6)
        plt.legend()
        plt.tight_layout()
        plt.savefig(out_root / "rar_model_overlay.png")
        plt.close()
    
    if len(all_rar_resid_gbar) > 0:
        plt.figure(figsize=(7, 5), dpi=160)
        plt.scatter(all_log_gbar_pred, all_rar_resid_gbar, s=10, alpha=0.3, label="κ(g_bar)")

        if len(all_rar_resid_gbar_shear) > 0:
            plt.scatter(all_log_gbar_pred_shear, all_rar_resid_gbar_shear, s=10, alpha=0.3, label="κ(g_bar, shear)")

        plt.axhline(0.0, linestyle="--", linewidth=1.5)
        plt.xlabel("log10 g_bar  [m s^-2]")
        plt.ylabel("Δ log10 g_obs")
        plt.title("RAR residuals — κ model minus observed")
        plt.grid(True, linestyle=":", alpha=0.6)
        plt.legend()
        plt.tight_layout()
        plt.savefig(out_root / "rar_residual_vs_gbar.png")
        plt.close()

    if len(all_rar_resid_gbar) > 0:
        plt.figure(figsize=(7, 5), dpi=160)
        plt.hist(all_rar_resid_gbar, bins=30, alpha=0.5, label="κ(g_bar)")

        if len(all_rar_resid_gbar_shear) > 0:
            plt.hist(all_rar_resid_gbar_shear, bins=30, alpha=0.5, label="κ(g_bar, shear)")

        plt.axvline(0.0, linestyle="--", linewidth=1.5)
        plt.xlabel("Δ log10 g_obs")
        plt.ylabel("count")
        plt.title("RAR residual distribution")
        plt.grid(True, linestyle=":", alpha=0.6)
        plt.legend()
        plt.tight_layout()
        plt.savefig(out_root / "rar_residual_hist.png")
        plt.close()

    if len(df_splits) > 0:
        mean_frac_gbar = df_splits["frac_improved_gbar"].mean()
        mean_frac_gbar_shear = df_splits["frac_improved_gbar_shear"].mean()
        print(f"Mean fraction improved, κ(g_bar): {mean_frac_gbar:.3f}")
        print(f"Mean fraction improved, κ(g_bar,shear): {mean_frac_gbar_shear:.3f}")

    print(f"Done. Wrote outputs to: {out_root}")
    print(f"Processed galaxies: {len(processed_galaxies)}")
    if args.debug:
        print(f"Total files: {len(galaxy_files)}  failed: {failed}  skipped_too_few: {skipped_too_few}")

    pd.DataFrame({"galaxy": [g["name"] for g in train_galaxies]}).to_csv(
        out_root / "train_galaxies.csv", index=False
    )
    pd.DataFrame({"galaxy": [g["name"] for g in test_galaxies]}).to_csv(
        out_root / "test_galaxies.csv", index=False
    )

    df = pd.read_csv(out_root / "multi_split_summary.csv")

    print("κ(g_bar) fit parameters")
    print("a mean:", df["fit_a"].mean())
    print("a std :", df["fit_a"].std())

    print("b mean:", df["fit_b"].mean())
    print("b std :", df["fit_b"].std())


    print("κ(g_bar,shear) parameters")

    print("a mean:", df["fit3_a"].mean())
    print("b mean:", df["fit3_b"].mean())
    print("c mean:", df["fit3_c"].mean())

    print("a std:", df["fit3_a"].std())
    print("b std:", df["fit3_b"].std())
    print("c std:", df["fit3_c"].std())

    plt.hist(df["fit_a"], bins=20)
    plt.title("Distribution of fit parameter a")
    plt.show()

    plt.hist(df["fit_b"], bins=20)
    plt.title("Distribution of fit parameter b")
    plt.show()

    plt.hist(df["fit3_a"], bins=20)
    plt.title("Distribution of fit parameter a (κ(g_bar, shear))")
    plt.show()

    plt.hist(df["fit3_b"], bins=20)
    plt.title("Distribution of fit parameter b (κ(g_bar, shear))")
    plt.show()

    plt.hist(df["fit3_c"], bins=20)
    plt.title("Distribution of fit parameter c (κ(g_bar, shear))")
    plt.show()


if __name__ == "__main__":
    main()