import argparse
import math
import re
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.signal import savgol_filter


@dataclass
class Config:
    ups_disk: float = 0.5
    ups_bulge: float = 0.7
    gas_scale: float = 1.0
    kpc_to_m: float = 3.085677581e19
    smooth_window: int = 7
    smooth_poly: int = 2
    min_points: int = 6
    eps: float = 1e-9


def is_odd(n: int) -> bool:
    return n % 2 == 1


def safe_savgol(y: np.ndarray, window: int, poly: int) -> np.ndarray:
    if len(y) < max(window, poly + 2):
        return y
    w = window if is_odd(window) else window + 1
    if w > len(y):
        w = len(y) if is_odd(len(y)) else len(y) - 1
    if w < poly + 2:
        return y
    return savgol_filter(y, window_length=w, polyorder=poly, mode="interp")


def _extract_header_columns(path: Path) -> list[str] | None:
    """
    SPARC rotmod files typically include a comment header like:
      # Rad   Vobs    errV    Vgas    Vdisk   Vbul    SBdisk  SBbul
    We'll parse that line (not the units line).
    """
    header_line = None
    with path.open("r") as f:
        for line in f:
            if not line.startswith("#"):
                continue
            # pick the line that contains the semantic column names
            if "Vobs" in line and ("Rad" in line or re.search(r"\bR\b", line)):
                header_line = line

    if header_line is None:
        return None

    toks = re.split(r"\s+", header_line.lstrip("#").strip())
    toks = [t for t in toks if t]

    # Normalise to the names we use internally
    norm = {
        "Rad": "R",
        "R": "R",
        "Vobs": "Vobs",
        "errV": "e_Vobs",
        "errVobs": "e_Vobs",
        "eVobs": "e_Vobs",
        "e_Vobs": "e_Vobs",
        "Vgas": "Vgas",
        "Vdisk": "Vdisk",
        "Vbul": "Vbul",
        "Vbulge": "Vbul",
        "Vbar": "Vbar",
        "SBdisk": "SBdisk",
        "SBbul": "SBbul",
    }

    cols = [norm.get(t, t) for t in toks]
    return cols


def read_mass_model_file(path: Path) -> pd.DataFrame:
    """
    Robust reader for SPARC rotmod files:
    - reads numeric data with whitespace sep, skipping comment lines
    - tries to assign columns from the '# Rad Vobs errV ...' header
    - falls back to known shapes if header is absent / mismatched
    """
    df = pd.read_csv(
        path,
        sep=r"\s+",
        comment="#",
        header=None,
        engine="python",
    )

    header_cols = _extract_header_columns(path)

    if header_cols is not None and len(header_cols) == df.shape[1]:
        df.columns = header_cols
        return df

    # Fallbacks by common shapes
    n = df.shape[1]
    if n == 6:
        df.columns = ["R", "Vobs", "e_Vobs", "Vgas", "Vdisk", "Vbul"]
    elif n == 7:
        # usually ETG style: includes Vbar
        df.columns = ["R", "Vobs", "e_Vobs", "Vgas", "Vdisk", "Vbul", "Vbar"]
    elif n == 8:
        # usually LTG style: SB columns, no Vbar
        df.columns = ["R", "Vobs", "e_Vobs", "Vgas", "Vdisk", "Vbul", "SBdisk", "SBbul"]
    elif n == 9:
        # sometimes: Vbar + SBdisk + SBbul
        df.columns = ["R", "Vobs", "e_Vobs", "Vgas", "Vdisk", "Vbul", "Vbar", "SBdisk", "SBbul"]
    else:
        df.columns = [f"col{i+1}" for i in range(n)]

    return df


def infer_columns(df: pd.DataFrame) -> dict:
    cols = {c.lower(): c for c in df.columns}

    def pick(*names):
        for n in names:
            if n.lower() in cols:
                return cols[n.lower()]
        return None

    mapping = {
        "r": pick("r", "rad", "radius", "r(kpc)", "r_kpc", "R"),
        "vobs": pick("vobs", "v_obs", "v", "v(km/s)", "v_kms", "Vobs"),
        "e_vobs": pick("e_vobs", "evobs", "dv", "e_v", "eVobs", "e_Vobs", "errv"),
        "vgas": pick("vgas", "v_gas", "Vgas"),
        "vdisk": pick("vdisk", "v_disk", "Vdisk"),
        "vbul": pick("vbul", "v_bul", "vbulge", "Vbul"),
        "vbar": pick("vbar", "v_bar", "Vbar"),
    }

    missing = [k for k in ["r", "vobs"] if mapping[k] is None]
    if missing:
        raise ValueError(f"Missing required columns: {missing}. Found columns: {list(df.columns)}")

    return mapping


def build_v_newton(
    vgas: np.ndarray | None,
    vdisk: np.ndarray | None,
    vbul: np.ndarray | None,
    vbar: np.ndarray | None,
    cfg: Config,
) -> np.ndarray:
    """
    Build baryon-only Newtonian circular speed v_N.
    Prefer Vbar if present (true baryonic quadrature supplied by SPARC).
    Otherwise combine components in quadrature with M/L scalings.
    """
    if vbar is not None:
        vN = np.asarray(vbar, dtype=float)
        return np.clip(vN, 0.0, None)

    parts = []
    if vgas is not None:
        parts.append((cfg.gas_scale * np.asarray(vgas, dtype=float)) ** 2)
    if vdisk is not None:
        parts.append((math.sqrt(cfg.ups_disk) * np.asarray(vdisk, dtype=float)) ** 2)
    if vbul is not None:
        parts.append((math.sqrt(cfg.ups_bulge) * np.asarray(vbul, dtype=float)) ** 2)

    if not parts:
        raise ValueError("No baryonic components found (need Vbar or at least one of Vgas/Vdisk/Vbul).")

    vN2 = np.sum(parts, axis=0)
    return np.sqrt(np.clip(vN2, 0.0, None))


def kappa_empirical(r_kpc: np.ndarray, vobs: np.ndarray, vN: np.ndarray, cfg: Config) -> np.ndarray:
    r_m = np.asarray(r_kpc, dtype=float) * cfg.kpc_to_m
    ratio = (np.asarray(vobs, dtype=float) + cfg.eps) / (np.asarray(vN, dtype=float) + cfg.eps)
    return (2.0 / np.clip(r_m, cfg.eps, None)) * np.log(np.clip(ratio, cfg.eps, None))


def dvdr_shear_from_baryons(r_kpc: np.ndarray, vN: np.ndarray, cfg: Config) -> np.ndarray:
    r_m = np.asarray(r_kpc, dtype=float) * cfg.kpc_to_m
    v_mps = np.asarray(vN, dtype=float) * 1000.0
    v_smooth = safe_savgol(v_mps, cfg.smooth_window, cfg.smooth_poly)
    return np.gradient(v_smooth, r_m)  # 1/s

def kappa_r_over2_model_from_gbar(g_bar: np.ndarray, a: float, b: float) -> np.ndarray:
    g_bar = np.asarray(g_bar, dtype=float)
    return a + b * np.log10(g_bar)


def chi2_reduced(v_model: np.ndarray, v_obs: np.ndarray, e_v: np.ndarray | None, dof_subtract: int = 0) -> float:
    if e_v is None:
        return float("nan")

    v_model = np.asarray(v_model, dtype=float)
    v_obs = np.asarray(v_obs, dtype=float)
    e = np.asarray(e_v, dtype=float)
    e = np.where(e <= 0, np.nan, e)

    mask = np.isfinite(v_model) & np.isfinite(v_obs) & np.isfinite(e)
    n = int(np.sum(mask))
    if n <= max(1, dof_subtract + 1):
        return float("nan")

    chi2 = np.sum(((v_model[mask] - v_obs[mask]) / e[mask]) ** 2)
    return float(chi2 / (n - dof_subtract))


def plot_galaxy(
    name: str,
    outdir: Path,
    r_kpc: np.ndarray,
    v_obs: np.ndarray,
    e_v: np.ndarray | None,
    vN: np.ndarray,
    kappa: np.ndarray,
    cfg: Config,
) -> None:
    outdir.mkdir(parents=True, exist_ok=True)

    r_m = r_kpc * cfg.kpc_to_m
    kappa_r_over2 = 0.5 * kappa * r_m
    v_kappa = vN * np.exp(kappa_r_over2)

    res_bary = vN - v_obs
    res_kappa = v_kappa - v_obs

    # Rotation curve
    plt.figure(figsize=(7.5, 5.2), dpi=160)
    plt.plot(r_kpc, vN, linestyle="--", linewidth=1.8, label="Newtonian (baryons)")
    if e_v is not None and np.all(np.isfinite(e_v)):
        plt.errorbar(r_kpc, v_obs, yerr=e_v, fmt="o", markersize=4.5, capsize=2.5, label="Observed")
    else:
        plt.plot(r_kpc, v_obs, "o", markersize=4.5, label="Observed")
    plt.plot(r_kpc, v_kappa, linewidth=2.2, label=r"$\kappa$ (empirical)")
    plt.title(f"{name} — Rotation Curve")
    plt.xlabel("Radius (kpc)")
    plt.ylabel("Velocity (km/s)")
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.legend()
    plt.tight_layout()
    plt.savefig(outdir / f"{name}_rotation.png")
    plt.close()

    # Residuals
    plt.figure(figsize=(7.5, 3.8), dpi=160)
    plt.axhline(0, linewidth=1)
    plt.plot(r_kpc, res_bary, "o-", markersize=3.8, label="Baryons-only residual")
    plt.plot(r_kpc, res_kappa, "o-", markersize=3.8, label=r"$\kappa$ residual (empirical)")
    plt.title(f"{name} — Residuals (model - observed)")
    plt.xlabel("Radius (kpc)")
    plt.ylabel("km/s")
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.legend()
    plt.tight_layout()
    plt.savefig(outdir / f"{name}_residuals.png")
    plt.close()

    # kappa profile
    plt.figure(figsize=(7.5, 4.2), dpi=160)
    plt.plot(r_kpc, kappa_r_over2, "o-", markersize=3.8)
    plt.title(f"{name} — Empirical $\\kappa r/2$")
    plt.xlabel("Radius (kpc)")
    plt.ylabel(r"$\kappa r/2$ (dimensionless)")
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.tight_layout()
    plt.savefig(outdir / f"{name}_kappa_profile.png")
    plt.close()

    pd.DataFrame(
        {
            "r_kpc": r_kpc,
            "v_obs_kms": v_obs,
            "e_vobs_kms": e_v if e_v is not None else np.nan,
            "vN_baryons_kms": vN,
            "kappa_1_per_m": kappa,
            "kappa_r_over2": kappa_r_over2,
            "v_kappa_kms": v_kappa,
            "res_bary_kms": res_bary,
            "res_kappa_kms": res_kappa,
        }
    ).to_csv(outdir / f"{name}_series.csv", index=False)

def main() -> None:
    ap = argparse.ArgumentParser(description="SPARC κ-framework pipeline (empirical κ, baryons-only baseline).")
    ap.add_argument("--mass-models", required=True, help="Path to unzipped SPARC mass-model files directory.")
    ap.add_argument("--out", default="out_sparc", help="Output directory for plots + CSVs.")
    ap.add_argument("--max-galaxies", type=int, default=0, help="0 = all galaxies; otherwise limit.")
    ap.add_argument("--ups-disk", type=float, default=0.5, help="Disk M/L scaling.")
    ap.add_argument("--ups-bulge", type=float, default=0.7, help="Bulge M/L scaling.")
    ap.add_argument("--gas-scale", type=float, default=1.0, help="Gas scaling (use 1.33 if needed).")
    ap.add_argument("--min-points", type=int, default=6, help="Minimum number of points required per galaxy.")
    ap.add_argument("--no-per-galaxy-plots", action="store_true", help="Skip per-galaxy plot generation (faster).")
    ap.add_argument("--debug", action="store_true", help="Print skip/fail reasons summary.")
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

    all_r: list[float] = []
    all_kappa_r: list[float] = []
    all_shear_log = []
    all_kappa_r_shear = []
    all_log_gbar = []
    all_kappa_r_gbar = []
    all_r_norm = []
    all_kappa_r_norm = []
    summary_rows: list[dict] = []

    skipped_too_few = 0
    failed = 0

    err_path = out_root / "_errors.txt"
    if err_path.exists():
        err_path.unlink()

    for fpath in galaxy_files:
        name = fpath.stem

        try:
            df = read_mass_model_file(fpath)
            mapping = infer_columns(df)

            r = df[mapping["r"]].to_numpy(dtype=float)
            v_obs = df[mapping["vobs"]].to_numpy(dtype=float)

            e_v = df[mapping["e_vobs"]].to_numpy(dtype=float) if mapping["e_vobs"] is not None else None
            vgas = df[mapping["vgas"]].to_numpy(dtype=float) if mapping["vgas"] is not None else None
            vdisk = df[mapping["vdisk"]].to_numpy(dtype=float) if mapping["vdisk"] is not None else None
            vbul = df[mapping["vbul"]].to_numpy(dtype=float) if mapping["vbul"] is not None else None
            vbar = df[mapping["vbar"]].to_numpy(dtype=float) if mapping["vbar"] is not None else None

            mask = np.isfinite(r) & np.isfinite(v_obs)
            if e_v is not None:
                mask &= np.isfinite(e_v)

            r = r[mask]
            v_obs = v_obs[mask]
            if e_v is not None:
                e_v = e_v[mask]
            if vgas is not None:
                vgas = vgas[mask]
            if vdisk is not None:
                vdisk = vdisk[mask]
            if vbul is not None:
                vbul = vbul[mask]
            if vbar is not None:
                vbar = vbar[mask]

            if len(r) < cfg.min_points:
                skipped_too_few += 1
                continue

            vN = build_v_newton(vgas, vdisk, vbul, vbar, cfg)
            kappa = kappa_empirical(r, v_obs, vN, cfg)
            dvdr = dvdr_shear_from_baryons(r, vN, cfg)

            r_m = r * cfg.kpc_to_m
            kappa_r_over2 = 0.5 * kappa * r_m
            v_kappa = vN * np.exp(kappa_r_over2)

            red_bary = chi2_reduced(vN, v_obs, e_v, dof_subtract=0)
            red_kappa = chi2_reduced(v_kappa, v_obs, e_v, dof_subtract=0)

            # radius stack
            all_r.extend(r.tolist())
            all_kappa_r.extend(kappa_r_over2.tolist())

            # normalized radius stack
            r_last = np.max(r)
            if np.isfinite(r_last) and r_last > 0:
                r_norm = r / r_last
                valid_r_norm = np.isfinite(r_norm) & np.isfinite(kappa_r_over2)
                all_r_norm.extend(r_norm[valid_r_norm].tolist())
                all_kappa_r_norm.extend(kappa_r_over2[valid_r_norm].tolist())

            # shear stack
            abs_dvdr = np.abs(dvdr)
            valid_shear = np.isfinite(abs_dvdr) & (abs_dvdr > 0) & np.isfinite(kappa_r_over2)
            all_shear_log.extend(np.log10(abs_dvdr[valid_shear]).tolist())
            all_kappa_r_shear.extend(kappa_r_over2[valid_shear].tolist())

            # baryonic acceleration stack
            vN_mps = vN * 1000.0
            g_bar = (vN_mps ** 2) / r_m

            valid_gbar = np.isfinite(g_bar) & (g_bar > 0) & np.isfinite(kappa_r_over2)
            all_log_gbar.extend(np.log10(g_bar[valid_gbar]).tolist())
            all_kappa_r_gbar.extend(kappa_r_over2[valid_gbar].tolist())

            gal_out = out_root / name
            if not args.no_per_galaxy_plots:
                plot_galaxy(name, gal_out, r, v_obs, e_v, vN, kappa, cfg)

            pd.DataFrame(
                {
                    "r_kpc": r,
                    "vN_baryons_kms": vN,
                    "dvdr_1_per_s": dvdr,
                }
            ).to_csv(gal_out / f"{name}_shear.csv", index=False)

            summary_rows.append(
                {
                    "galaxy": name,
                    "n_points": len(r),
                    "ups_disk": cfg.ups_disk,
                    "ups_bulge": cfg.ups_bulge,
                    "gas_scale": cfg.gas_scale,
                    "chi2red_baryons": red_bary,
                    "chi2red_kappa_emp": red_kappa,
                    "mean_kappa_r_over2": float(np.nanmean(kappa_r_over2)),
                    "std_kappa_r_over2": float(np.nanstd(kappa_r_over2)),
                }
            )

        except Exception as e:
            failed += 1
            err_path.open("a").write(f"{name}\t{fpath}\t{repr(e)}\n")
            if args.debug:
                print(f"FAIL {name}: {e}")
            continue

    # Always write stacked κ plot if we have points
    if len(all_r) > 0:
        plt.figure(figsize=(7, 5), dpi=160)
        plt.scatter(all_r, all_kappa_r, s=10, alpha=0.35)
        plt.xlabel("Radius (kpc)")
        plt.ylabel("κ r / 2")
        plt.title("SPARC galaxies — empirical κ structure")
        plt.grid(True, linestyle=":", alpha=0.6)
        plt.tight_layout()
        plt.savefig(out_root / "kappa_stack.png")
        plt.close()

    df_sum = pd.DataFrame(summary_rows)
    if df_sum.empty:
        print("No galaxies processed. See out_sparc/_errors.txt")
        print(f"Wrote outputs to: {out_root}")
        if args.debug:
            print(f"Total files: {len(galaxy_files)}  failed: {failed}  skipped_too_few: {skipped_too_few}")
        return

    df_sum = df_sum.sort_values(by=["chi2red_baryons"], na_position="last")
    df_sum.to_csv(out_root / "summary.csv", index=False)

    # global linear fit: kappa_r_over2 = a + b * log10(g_bar)
    fit_a = np.nan
    fit_b = np.nan

    if len(all_log_gbar) > 10:
        x_fit = np.asarray(all_log_gbar, dtype=float)
        y_fit = np.asarray(all_kappa_r_gbar, dtype=float)

        fit_mask = np.isfinite(x_fit) & np.isfinite(y_fit)
        x_fit = x_fit[fit_mask]
        y_fit = y_fit[fit_mask]

        if len(x_fit) > 10:
            fit_b, fit_a = np.polyfit(x_fit, y_fit, 1)

            x_line = np.linspace(np.min(x_fit), np.max(x_fit), 300)
            y_line = fit_a + fit_b * x_line

            plt.figure(figsize=(7, 5), dpi=160)
            plt.scatter(x_fit, y_fit, s=10, alpha=0.2, label="SPARC points")
            plt.plot(x_line, y_line, linewidth=2, label=f"fit: y = {fit_a:.3f} + {fit_b:.3f} x")
            plt.xlabel("log10 g_bar  [m s^-2]")
            plt.ylabel("κ r / 2")
            plt.title("SPARC galaxies — fitted κ model vs baryonic acceleration")
            plt.grid(True, linestyle=":", alpha=0.6)
            plt.legend()
            plt.tight_layout()
            plt.savefig(out_root / "kappa_vs_gbar_fit.png")
            plt.close()

    if np.isfinite(fit_a) and np.isfinite(fit_b):
        with open(out_root / "kappa_gbar_fit.txt", "w") as f:
            f.write(f"a = {fit_a}\n")
            f.write(f"b = {fit_b}\n")
            f.write("model: kappa_r_over2 = a + b * log10(g_bar)\n")

    pred_rows = []

    if np.isfinite(fit_a) and np.isfinite(fit_b):
        for fpath in galaxy_files:
            name = fpath.stem

            try:
                df = read_mass_model_file(fpath)
                mapping = infer_columns(df)

                r = df[mapping["r"]].to_numpy(dtype=float)
                v_obs = df[mapping["vobs"]].to_numpy(dtype=float)

                e_v = df[mapping["e_vobs"]].to_numpy(dtype=float) if mapping["e_vobs"] is not None else None
                vgas = df[mapping["vgas"]].to_numpy(dtype=float) if mapping["vgas"] is not None else None
                vdisk = df[mapping["vdisk"]].to_numpy(dtype=float) if mapping["vdisk"] is not None else None
                vbul = df[mapping["vbul"]].to_numpy(dtype=float) if mapping["vbul"] is not None else None
                vbar = df[mapping["vbar"]].to_numpy(dtype=float) if mapping["vbar"] is not None else None

                mask = np.isfinite(r) & np.isfinite(v_obs)
                if e_v is not None:
                    mask &= np.isfinite(e_v)

                r = r[mask]
                v_obs = v_obs[mask]
                if e_v is not None:
                    e_v = e_v[mask]
                if vgas is not None:
                    vgas = vgas[mask]
                if vdisk is not None:
                    vdisk = vdisk[mask]
                if vbul is not None:
                    vbul = vbul[mask]
                if vbar is not None:
                    vbar = vbar[mask]

                if len(r) < cfg.min_points:
                    continue

                vN = build_v_newton(vgas, vdisk, vbul, vbar, cfg)

                r_m = r * cfg.kpc_to_m
                vN_mps = vN * 1000.0
                g_bar = (vN_mps ** 2) / r_m

                valid = np.isfinite(g_bar) & (g_bar > 0) & np.isfinite(vN) & np.isfinite(v_obs)
                r = r[valid]
                v_obs = v_obs[valid]
                vN = vN[valid]
                g_bar = g_bar[valid]
                if e_v is not None:
                    e_v = e_v[valid]

                if len(r) < cfg.min_points:
                    continue

                kappa_r_over2_model = kappa_r_over2_model_from_gbar(g_bar, fit_a, fit_b)
                v_pred = vN * np.exp(kappa_r_over2_model)

                chi2_bary = chi2_reduced(vN, v_obs, e_v, dof_subtract=0)
                chi2_pred = chi2_reduced(v_pred, v_obs, e_v, dof_subtract=0)

                pred_rows.append({
                    "galaxy": name,
                    "n_points": len(r),
                    "chi2red_baryons": chi2_bary,
                    "chi2red_kappa_gbar_model": chi2_pred,
                })

            except Exception as e:
                if args.debug:
                    print(f"MODEL FAIL {name}: {e}")
                continue

    if len(pred_rows) > 0:
        df_pred = pd.DataFrame(pred_rows)
        df_pred.to_csv(out_root / "summary_kappa_gbar_model.csv", index=False)

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
            plt.title("SPARC galaxies — baryons-only vs κ(g_bar) model")
            plt.grid(True, linestyle=":", alpha=0.6)
            plt.legend()
            plt.tight_layout()
            plt.savefig(out_root / "chi2red_baryons_vs_kappa_gbar_model.png")
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

    if len(all_shear_log) > 0:
        plt.figure(figsize=(7, 5), dpi=160)
        plt.scatter(all_shear_log, all_kappa_r_shear, s=10, alpha=0.35)
        plt.xlabel("log10 |dv/dr|  [s^-1]")
        plt.ylabel("κ r / 2")
        plt.title("SPARC galaxies — empirical κ vs baryonic shear")
        plt.grid(True, linestyle=":", alpha=0.6)
        plt.tight_layout()
        plt.savefig(out_root / "kappa_vs_shear.png")
        plt.close()

    if len(all_log_gbar) > 0:
        plt.figure(figsize=(7, 5), dpi=160)
        plt.scatter(all_log_gbar, all_kappa_r_gbar, s=10, alpha=0.35)
        plt.xlabel("log10 g_bar  [m s^-2]")
        plt.ylabel("κ r / 2")
        plt.title("SPARC galaxies — empirical κ vs baryonic acceleration")
        plt.grid(True, linestyle=":", alpha=0.6)
        plt.tight_layout()
        plt.savefig(out_root / "kappa_vs_gbar.png")
        plt.close()

    if len(all_r_norm) > 0:
        plt.figure(figsize=(7, 5), dpi=160)
        plt.scatter(all_r_norm, all_kappa_r_norm, s=10, alpha=0.35)
        plt.xlabel("r / r_last")
        plt.ylabel("κ r / 2")
        plt.title("SPARC galaxies — empirical κ vs normalized radius")
        plt.grid(True, linestyle=":", alpha=0.6)
        plt.tight_layout()
        plt.savefig(out_root / "kappa_vs_rnorm.png")
        plt.close()

    print(f"Done. Wrote outputs to: {out_root}")
    print(f"Processed galaxies: {len(df_sum)}")
    if args.debug:
        print(f"Total files: {len(galaxy_files)}  failed: {failed}  skipped_too_few: {skipped_too_few}")


if __name__ == "__main__":
    main()