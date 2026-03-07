from __future__ import annotations

import argparse
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from lib import (
    Config,
    evaluate_gbar_shear_model,
    evaluate_linear_gbar_model,
    FIGURE_SIZE_DEFAULT,
    FIGURE_SIZE_TALL,
    DPI,
    GRID_STYLE,
)

from models import (
    _split_train_test,
    _collect_training_data,
    _collect_training_data_shear,
    _fit_linear_model,
    _fit_linear_model_2d,
    _collect_all_data,
    run_single_split,
    load_processed_galaxies,
    build_rar_diagnostics,
)

from plotting import (
    plot_scatter_with_line,
    plot_histogram_comparison,
    plot_rar_overlay,
    plot_residuals,
    _save_plot,

)

def main() -> None:
    ap = argparse.ArgumentParser(description="SPARC κ-framework analysis pipeline.")
    ap.add_argument("--mass-models", required=True, help="Path to unzipped SPARC mass-model files directory.")
    ap.add_argument("--out", default="output", help="Output directory for plots + CSVs.")
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


    # Create output subdirectories
    plots_dir = out_root / "plots"
    tables_dir = out_root / "tables"
    models_dir = out_root / "models"
    diagnostics_dir = out_root / "diagnostics"
    galaxies_dir = out_root / "galaxies"

    for d in [plots_dir, tables_dir, models_dir, diagnostics_dir, galaxies_dir]:
        d.mkdir(parents=True, exist_ok=True)

    # Create output sub-subdirectories (/plots/)
    rar_dir = plots_dir / "rar"
    chi2_dir = plots_dir / "chi2"
    robustness_dir = plots_dir / "robustness"
    params_dir = plots_dir / "parameters"

    for d in [rar_dir, chi2_dir, robustness_dir, params_dir]:
        d.mkdir(parents=True, exist_ok=True)

    galaxy_files = sorted(mass_dir.rglob("*_rotmod.dat"))
    if args.max_galaxies and args.max_galaxies > 0:
        galaxy_files = galaxy_files[: args.max_galaxies]

    err_path = diagnostics_dir / "_errors.txt"
    if err_path.exists():
        err_path.unlink()

    processed_galaxies, skipped_too_few, failed = load_processed_galaxies(
        galaxy_files, cfg, args, out_root, err_path
    )

    if not processed_galaxies:
        print("No galaxies processed.")
        print(f"Wrote outputs to: {galaxies_dir}")
        return
    
    if len(processed_galaxies) < 2:
        print("Need at least 2 processed galaxies for a train/test split.")
        print(f"Wrote outputs to: {galaxies_dir}")
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
    df_splits.to_csv(tables_dir / "multi_split_summary.csv", index=False)

    # Get the first split's train/test sets for main analysis
    train_galaxies, test_galaxies = _split_train_test(
        processed_galaxies, args.train_fraction, args.seed
    )

    # Write train/test split info
    with open(diagnostics_dir / "train_test_split.txt", "w") as f:
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
    df_sum.to_csv(tables_dir / "summary.csv", index=False)

    # Save model fits
    if np.isfinite(fit.a) and np.isfinite(fit.b):
        with open(models_dir / "kappa_gbar_fit.txt", "w") as f:
            f.write(f"a = {fit.a}\n")
            f.write(f"b = {fit.b}\n")
            f.write("model: kappa_r_over2 = a + b * log10(g_bar)\n")

    if np.isfinite(fit_2d.a) and np.isfinite(fit_2d.b) and np.isfinite(fit_2d.c):
        with open(models_dir / "kappa_gbar_shear_fit.txt", "w") as f:
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
        pd.DataFrame(pred_rows).to_csv(tables_dir / "summary_kappa_gbar_model.csv", index=False)

    pred_rows_gbar_shear = []
    if np.isfinite(fit_2d.a) and np.isfinite(fit_2d.b) and np.isfinite(fit_2d.c):
        for g in test_galaxies:
            pred = evaluate_gbar_shear_model(g, fit_2d.a, fit_2d.b, fit_2d.c, cfg)
            if pred is not None:
                pred_rows_gbar_shear.append(pred)

    if pred_rows_gbar_shear:
        pd.DataFrame(pred_rows_gbar_shear).to_csv(
            tables_dir / "summary_kappa_gbar_shear_model.csv",
            index=False,
        )

    # Compute RAR (Radial Acceleration Relation) residuals
    rar_data = build_rar_diagnostics(processed_galaxies, fit, fit_2d)

    # Create plots
    plot_scatter_with_line(
        all_data["r"], all_data["kappa_r"],
        "Radius (kpc)", "κ r / 2", "SPARC galaxies — empirical κ structure",
        plots_dir, "kappa_stack.png"
    )

    plot_scatter_with_line(
        all_data["r_norm"], all_data["kappa_r"],
        "r / r_last", "κ r / 2", "SPARC galaxies — empirical κ vs normalized radius",
        plots_dir, "kappa_vs_rnorm.png"
    )

    plot_scatter_with_line(
        all_data["shear_log"], all_data["kappa_r_shear"],
        "log10 |dv/dr|  [s^-1]", "κ r / 2", "SPARC galaxies — empirical κ vs baryonic shear",
        plots_dir, "kappa_vs_shear.png"
    )

    plot_scatter_with_line(
        all_data["log_gbar"], all_data["kappa_r_gbar"],
        "log10 g_bar  [m s^-2]", "κ r / 2", "SPARC galaxies — empirical κ vs baryonic acceleration",
        plots_dir, "kappa_vs_gbar.png"
    )

    # Plot fit
    if np.isfinite(fit.a) and np.isfinite(fit.b):
        x_line = np.linspace(np.min(train_log_gbar), np.max(train_log_gbar), 300)
        y_line = fit.a + fit.b * x_line

        plot_scatter_with_line(
            train_log_gbar, train_kappa_r_gbar,
            "log10 g_bar  [m s^-2]", "κ r / 2",
            "SPARC train set — fitted κ model vs baryonic acceleration",
            plots_dir, "kappa_vs_gbar_fit.png",
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
        _save_plot(rar_dir, "rar_gobs_vs_gbar.png")

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
        _save_plot(chi2_dir, "chi2red_baryons_hist.png")

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
                chi2_dir, "chi2red_baryons_vs_kappa_gbar_model.png"
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
                chi2_dir, "chi2red_model_comparison.png"
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
                robustness_dir, "multi_split_fraction_improved.png", bins=20
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
                robustness_dir, "multi_split_median_chi2.png", bins=20
            )

    # RAR overlay plots
    if len(rar_data["all_log_gbar_obs"]) > 0:
        pred_data = {}
        if len(rar_data["all_log_gbar_pred"]) > 0:
            pred_data["κ(g_bar)"] = (rar_data["all_log_gbar_pred"], rar_data["all_log_gobs_pred"])
        if len(rar_data["all_log_gbar_pred_shear"]) > 0:
            pred_data["κ(g_bar, shear)"] = (rar_data["all_log_gbar_pred_shear"], rar_data["all_log_gobs_pred_shear"])

        plot_rar_overlay(rar_data["all_log_gbar_obs"], rar_data["all_log_gobs_obs"], pred_data, rar_dir, "rar_model_overlay.png")

    # RAR residuals vs g_bar
    if len(rar_data["all_rar_resid_gbar"]) > 0:
        resid_data = {"κ(g_bar)": (rar_data["all_log_gbar_pred"], rar_data["all_rar_resid_gbar"])}
        if len(rar_data["all_rar_resid_gbar_shear"]) > 0:
            resid_data["κ(g_bar, shear)"] = (rar_data["all_log_gbar_pred_shear"], rar_data["all_rar_resid_gbar_shear"])

        plot_residuals(
            resid_data, "log10 g_bar  [m s^-2]", "Δ log10 g_obs",
            "RAR residuals — κ model minus observed", rar_dir, "rar_residual_vs_gbar.png"
        )

    # RAR residuals distribution
    if len(rar_data["all_rar_resid_gbar"]) > 0:
        data_dict = {"κ(g_bar)": rar_data["all_rar_resid_gbar"]}
        if len(rar_data["all_rar_resid_gbar_shear"]) > 0:
            data_dict["κ(g_bar, shear)"] = rar_data["all_rar_resid_gbar_shear"]

        plot_histogram_comparison(
            data_dict, "Δ log10 g_obs", "count", "RAR residual distribution",
            rar_dir, "rar_residual_hist.png"
        )

    # Save galaxy lists and print results
    pd.DataFrame({"galaxy": [g["name"] for g in train_galaxies]}).to_csv(
        tables_dir / "train_galaxies.csv", index=False
    )
    pd.DataFrame({"galaxy": [g["name"] for g in test_galaxies]}).to_csv(
        tables_dir / "test_galaxies.csv", index=False
    )

    # Print summary statistics
    if len(df_splits) > 0:
        mean_frac_gbar = df_splits["frac_improved_gbar"].mean()
        mean_frac_gbar_shear = df_splits["frac_improved_gbar_shear"].mean()
        print(f"Mean fraction improved, κ(g_bar): {mean_frac_gbar:.3f}")
        print(f"Mean fraction improved, κ(g_bar, shear): {mean_frac_gbar_shear:.3f}")

    print(f"Done. Wrote outputs to: {out_root}/")
    print(f"Processed galaxies: {len(processed_galaxies)}")
    if args.debug:
        print(f"Total files: {len(galaxy_files)}  failed: {failed}  skipped_too_few: {skipped_too_few}")

    # Print fit parameter statistics
    df = pd.read_csv(tables_dir / "multi_split_summary.csv")

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
        _save_plot(params_dir, f"param_dist_{param}.png")


if __name__ == "__main__":
    main()