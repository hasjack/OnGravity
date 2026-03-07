from __future__ import annotations

import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
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
    header_line = None

    with path.open("r") as f:
        for line in f:
            if not line.startswith("#"):
                continue
            if "Vobs" in line and ("Rad" in line or re.search(r"\bR\b", line)):
                header_line = line

    if header_line is None:
        return None

    toks = re.split(r"\s+", header_line.lstrip("#").strip())
    toks = [t for t in toks if t]

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

    return [norm.get(t, t) for t in toks]


def read_mass_model_file(path: Path) -> pd.DataFrame:
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

    n = df.shape[1]
    if n == 6:
        df.columns = ["R", "Vobs", "e_Vobs", "Vgas", "Vdisk", "Vbul"]
    elif n == 7:
        df.columns = ["R", "Vobs", "e_Vobs", "Vgas", "Vdisk", "Vbul", "Vbar"]
    elif n == 8:
        df.columns = ["R", "Vobs", "e_Vobs", "Vgas", "Vdisk", "Vbul", "SBdisk", "SBbul"]
    elif n == 9:
        df.columns = ["R", "Vobs", "e_Vobs", "Vgas", "Vdisk", "Vbul", "Vbar", "SBdisk", "SBbul"]
    else:
        df.columns = [f"col{i+1}" for i in range(n)]

    return df


def infer_columns(df: pd.DataFrame) -> dict[str, str | None]:
    cols = {c.lower(): c for c in df.columns}

    def pick(*names: str) -> str | None:
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
    if vbar is not None:
        return np.asarray(vbar, dtype=float)

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
    return np.gradient(v_smooth, r_m)


def kappa_r_over2_model_from_gbar(g_bar: np.ndarray, a: float, b: float) -> np.ndarray:
    g_bar = np.asarray(g_bar, dtype=float)
    return a + b * np.log10(g_bar)

def kappa_r_over2_model_from_gbar_shear(
    g_bar: np.ndarray,
    abs_dvdr: np.ndarray,
    a: float,
    b: float,
    c: float,
) -> np.ndarray:
    g_bar = np.asarray(g_bar, dtype=float)
    abs_dvdr = np.asarray(abs_dvdr, dtype=float)
    return a + b * np.log10(g_bar) + c * np.log10(abs_dvdr)


def chi2_reduced(
    v_model: np.ndarray,
    v_obs: np.ndarray,
    e_v: np.ndarray | None,
    dof_subtract: int = 0,
) -> float:
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


def load_and_prepare_galaxy(path: Path, cfg: Config) -> dict[str, Any] | None:
    df = read_mass_model_file(path)
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
        return None

    return {
        "name": path.stem,
        "path": path,
        "r_kpc": r,
        "v_obs_kms": v_obs,
        "e_vobs_kms": e_v,
        "vgas_kms": vgas,
        "vdisk_kms": vdisk,
        "vbul_kms": vbul,
        "vbar_kms": vbar,
    }


def compute_derived_quantities(galaxy: dict[str, Any], cfg: Config) -> dict[str, Any]:
    r_kpc = galaxy["r_kpc"]
    v_obs_kms = galaxy["v_obs_kms"]
    e_vobs_kms = galaxy["e_vobs_kms"]

    vN_kms = build_v_newton(
        galaxy["vgas_kms"],
        galaxy["vdisk_kms"],
        galaxy["vbul_kms"],
        galaxy["vbar_kms"],
        cfg,
    )

    kappa_emp_1_per_m = kappa_empirical(r_kpc, v_obs_kms, vN_kms, cfg)
    r_m = r_kpc * cfg.kpc_to_m
    kappa_r_over2 = 0.5 * kappa_emp_1_per_m * r_m
    dvdr_1_per_s = dvdr_shear_from_baryons(r_kpc, vN_kms, cfg)
    vN_mps = vN_kms * 1000.0
    g_bar_m_per_s2 = (vN_mps ** 2) / r_m

    r_last_kpc = np.max(r_kpc)
    r_norm = r_kpc / r_last_kpc if np.isfinite(r_last_kpc) and r_last_kpc > 0 else np.full_like(r_kpc, np.nan)

    v_kappa_emp_kms = vN_kms * np.exp(kappa_r_over2)

    out = dict(galaxy)
    out.update(
        {
            "r_m": r_m,
            "vN_kms": vN_kms,
            "kappa_emp_1_per_m": kappa_emp_1_per_m,
            "kappa_r_over2": kappa_r_over2,
            "dvdr_1_per_s": dvdr_1_per_s,
            "g_bar_m_per_s2": g_bar_m_per_s2,
            "r_norm": r_norm,
            "v_kappa_emp_kms": v_kappa_emp_kms,
            "chi2red_baryons": chi2_reduced(vN_kms, v_obs_kms, e_vobs_kms, dof_subtract=0),
            "chi2red_kappa_emp": chi2_reduced(v_kappa_emp_kms, v_obs_kms, e_vobs_kms, dof_subtract=0),
        }
    )
    return out


def evaluate_linear_gbar_model(
    galaxy: dict[str, Any],
    fit_a: float,
    fit_b: float,
    cfg: Config,
) -> dict[str, Any] | None:
    r_kpc = galaxy["r_kpc"]
    v_obs_kms = galaxy["v_obs_kms"]
    e_vobs_kms = galaxy["e_vobs_kms"]
    vN_kms = galaxy["vN_kms"]
    g_bar_m_per_s2 = galaxy["g_bar_m_per_s2"]

    valid = np.isfinite(g_bar_m_per_s2) & (g_bar_m_per_s2 > 0) & np.isfinite(vN_kms) & np.isfinite(v_obs_kms)

    r_kpc = r_kpc[valid]
    v_obs_kms = v_obs_kms[valid]
    vN_kms = vN_kms[valid]
    g_bar_m_per_s2 = g_bar_m_per_s2[valid]
    if e_vobs_kms is not None:
        e_vobs_kms = e_vobs_kms[valid]

    if len(r_kpc) < cfg.min_points:
        return None

    kappa_r_over2_model = kappa_r_over2_model_from_gbar(g_bar_m_per_s2, fit_a, fit_b)
    v_pred_kms = vN_kms * np.exp(kappa_r_over2_model)

    return {
        "galaxy": galaxy["name"],
        "n_points": len(r_kpc),
        "chi2red_baryons": chi2_reduced(vN_kms, v_obs_kms, e_vobs_kms, dof_subtract=0),
        "chi2red_kappa_gbar_model": chi2_reduced(v_pred_kms, v_obs_kms, e_vobs_kms, dof_subtract=0),
    }

def evaluate_gbar_shear_model(
    galaxy: dict[str, Any],
    fit_a: float,
    fit_b: float,
    fit_c: float,
    cfg: Config,
) -> dict[str, Any] | None:
    r_kpc = galaxy["r_kpc"]
    v_obs_kms = galaxy["v_obs_kms"]
    e_vobs_kms = galaxy["e_vobs_kms"]
    vN_kms = galaxy["vN_kms"]
    g_bar_m_per_s2 = galaxy["g_bar_m_per_s2"]
    dvdr_1_per_s = galaxy["dvdr_1_per_s"]

    abs_dvdr = np.abs(dvdr_1_per_s)

    valid = (
        np.isfinite(g_bar_m_per_s2) &
        (g_bar_m_per_s2 > 0) &
        np.isfinite(abs_dvdr) &
        (abs_dvdr > 0) &
        np.isfinite(vN_kms) &
        np.isfinite(v_obs_kms)
    )

    r_kpc = r_kpc[valid]
    v_obs_kms = v_obs_kms[valid]
    vN_kms = vN_kms[valid]
    g_bar_m_per_s2 = g_bar_m_per_s2[valid]
    abs_dvdr = abs_dvdr[valid]
    if e_vobs_kms is not None:
        e_vobs_kms = e_vobs_kms[valid]

    if len(r_kpc) < cfg.min_points:
        return None

    kappa_r_over2_model = kappa_r_over2_model_from_gbar_shear(
        g_bar_m_per_s2,
        abs_dvdr,
        fit_a,
        fit_b,
        fit_c,
    )
    v_pred_kms = vN_kms * np.exp(kappa_r_over2_model)

    return {
        "galaxy": galaxy["name"],
        "n_points": len(r_kpc),
        "chi2red_baryons": chi2_reduced(vN_kms, v_obs_kms, e_vobs_kms, dof_subtract=0),
        "chi2red_kappa_gbar_shear_model": chi2_reduced(v_pred_kms, v_obs_kms, e_vobs_kms, dof_subtract=0),
    }