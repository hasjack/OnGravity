#!/usr/bin/env python3
"""
bench_monoliths.py

Compute-speed microbenchmarks comparing:
- Bell-toy progress-state gate step (arith + floor + parity flip)
- "monolithic" trig-style per-sample computations (cos, sign(cos), cos/sin mixes)
- a heavier rolling sine-fit (rolling least-squares on sin/cos regressors)
- a simple SMA loop baseline

Outputs:
- output/bench_monoliths.csv
- output/bench_monoliths.png
- prints a sorted table to stdout

Example:
  python bench_monoliths.py --data data/btc_usd_1d.csv --repeats 500
"""

from __future__ import annotations

import argparse
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Dict, List, Tuple

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


def load_coinbase_csv(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["time"] = pd.to_datetime(df["time"], utc=True, errors="coerce")
    df = df.sort_values("time").reset_index(drop=True)
    df["close"] = df["close"].astype(float)
    return df


def compute_setting(close: np.ndarray, lookback: int) -> np.ndarray:
    # pct-change momentum -> z-score -> 2*atan squash to [-pi, pi]
    s = pd.Series(close)
    mom = s.pct_change(lookback).fillna(0.0).to_numpy()
    scale = float(np.nanstd(mom) + 1e-12)
    z = mom / scale
    return 2.0 * np.arctan(z)


# -----------------------------
# Bell-toy gate step (scalar loop)
# -----------------------------
@dataclass
class GateParams:
    w: float = 0.30
    delta_hi: float = 0.85
    delta_lo: float = 0.20
    lam: float = 0.0
    seed: int = 7


def _wrap_pi(x: float) -> float:
    return (x + np.pi) % (2 * np.pi) - np.pi


def gate_step_loop(settings: np.ndarray, params: GateParams) -> float:
    """
    Scalar loop to model the true per-sample cost of the gate update.
    Returns a dummy accumulator so Python doesn't optimize-away work.
    """
    rng = np.random.default_rng(params.seed)
    sigma = 1
    p = float(rng.random())
    acc = 0.0

    for theta in settings:
        d = abs(_wrap_pi(float(theta) - params.lam))
        delta = params.delta_hi if d < params.w else params.delta_lo

        T = p + delta
        n = int(np.floor(T))
        p = T - n
        if n & 1:
            sigma = -sigma

        acc += sigma * (0.1 + p)

    return acc


# -----------------------------
# Trig "monoliths"
# -----------------------------
def trig_cos_loop(settings: np.ndarray, lam: float = 0.0) -> float:
    acc = 0.0
    for theta in settings:
        acc += float(np.cos(2.0 * (float(theta) - lam)))
    return acc


def trig_mix_loop(settings: np.ndarray, lam: float = 0.0) -> float:
    # a slightly heavier per-sample trig mix
    acc = 0.0
    for theta in settings:
        x = float(theta) - lam
        acc += float(np.cos(x) + np.sin(x) + np.cos(2.0 * x))
    return acc


def trig_gate_signcos2_loop(settings: np.ndarray, lam: float = 0.0) -> float:
    # "classic-ish" gate: sign(cos(2*(theta-lam))) (still per-sample trig)
    acc = 0.0
    for theta in settings:
        x = float(np.cos(2.0 * (float(theta) - lam)))
        s = 1.0 if x >= 0.0 else -1.0
        acc += s
    return acc


def trig_vectorized_sum_cos2(settings: np.ndarray, lam: float = 0.0) -> float:
    # vectorized trig (very fast via NumPy ufuncs) — included as an upper bound
    return float(np.sum(np.cos(2.0 * (settings - lam))))


# -----------------------------
# Rolling sine-fit (heavier, “monolithic-ish”)
# -----------------------------
def sinefit_rolling_ls(settings: np.ndarray, W: int = 120, P: float = 60.0) -> float:
    """
    Rolling least squares fit:
      y_t ≈ a*sin(2π t/P) + b*cos(2π t/P)
    Here y_t is the setting series; we compute a rolling (a,b) and accumulate.
    This is deliberately heavier than simple trig-per-sample.
    """
    n = len(settings)
    if n < W + 1:
        return 0.0

    t = np.arange(n, dtype=float)
    ang = 2.0 * np.pi * t / float(P)
    s = np.sin(ang)
    c = np.cos(ang)

    # Precompute rolling sums needed for normal equations
    # X = [s, c], so (X^T X) is 2x2 with entries:
    # [sum(s^2), sum(sc); sum(sc), sum(c^2)]
    y = settings.astype(float)

    s2 = s * s
    c2 = c * c
    sc = s * c
    ys = y * s
    yc = y * c

    def rsum(x: np.ndarray) -> np.ndarray:
        # rolling sum via cumsum
        cs = np.cumsum(np.insert(x, 0, 0.0))
        return cs[W:] - cs[:-W]

    S2 = rsum(s2)
    C2 = rsum(c2)
    SC = rsum(sc)
    YS = rsum(ys)
    YC = rsum(yc)

    acc = 0.0
    # Solve 2x2 per window (still cheap, but heavier than a gate step)
    for i in range(len(S2)):
        a11, a12 = S2[i], SC[i]
        a21, a22 = SC[i], C2[i]
        b1, b2 = YS[i], YC[i]
        det = a11 * a22 - a12 * a21
        if abs(det) < 1e-12:
            continue
        a = (b1 * a22 - b2 * a12) / det
        b = (a11 * b2 - a21 * b1) / det
        acc += (a * a + b * b)
    return float(acc)


# -----------------------------
# SMA loop baseline
# -----------------------------
def sma_loop(close: np.ndarray, fast: int = 50, slow: int = 200) -> float:
    """
    Naive loop SMA for cost comparison (not vectorized pandas).
    """
    n = len(close)
    acc = 0.0
    s_fast = 0.0
    s_slow = 0.0
    q_fast: List[float] = []
    q_slow: List[float] = []

    for i in range(n):
        x = float(close[i])

        q_fast.append(x)
        s_fast += x
        if len(q_fast) > fast:
            s_fast -= q_fast.pop(0)

        q_slow.append(x)
        s_slow += x
        if len(q_slow) > slow:
            s_slow -= q_slow.pop(0)

        if len(q_slow) == slow:
            ma_fast = s_fast / fast
            ma_slow = s_slow / slow
            acc += 1.0 if ma_fast > ma_slow else -1.0

    return acc


# -----------------------------
# Benchmark harness
# -----------------------------
def time_fn(fn: Callable[[], float], repeats: int) -> Tuple[float, float]:
    """
    Returns: (seconds, dummy_acc)
    """
    t0 = time.perf_counter()
    acc = 0.0
    for _ in range(repeats):
        acc += float(fn())
    dt = time.perf_counter() - t0
    return dt, acc


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default="data/btc_usd_1d.csv")
    ap.add_argument("--outdir", default="output")
    ap.add_argument("--repeats", type=int, default=500)
    ap.add_argument("--setting_lb", type=int, default=180)
    ap.add_argument("--gate_w", type=float, default=0.30)
    ap.add_argument("--delta_hi", type=float, default=0.85)
    ap.add_argument("--delta_lo", type=float, default=0.20)
    ap.add_argument("--lam", type=float, default=0.0)
    ap.add_argument("--sinefit_W", type=int, default=120)
    ap.add_argument("--sinefit_P", type=float, default=60.0)
    args = ap.parse_args()

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    df = load_coinbase_csv(args.data)
    close = df["close"].to_numpy()
    n = len(close)

    settings = compute_setting(close, lookback=args.setting_lb).astype(float)

    gate_params = GateParams(
        w=args.gate_w,
        delta_hi=args.delta_hi,
        delta_lo=args.delta_lo,
        lam=args.lam,
        seed=7,
    )

    # Methods to benchmark (all return float dummy accumulators)
    methods: List[Tuple[str, Callable[[], float]]] = [
        ("gate_step (arith state)", lambda: gate_step_loop(settings, gate_params)),
        ("trig: cos(2*(θ-λ))", lambda: trig_cos_loop(settings, args.lam)),
        ("trig: cos+sin+cos2", lambda: trig_mix_loop(settings, args.lam)),
        ("trig gate: sign(cos2)", lambda: trig_gate_signcos2_loop(settings, args.lam)),
        ("trig vectorized sum(cos2)", lambda: trig_vectorized_sum_cos2(settings, args.lam)),
        (f"sinefit rolling LS (W={args.sinefit_W},P={int(args.sinefit_P)})", lambda: sinefit_rolling_ls(settings, W=args.sinefit_W, P=args.sinefit_P)),
        ("SMA loop (50/200)", lambda: sma_loop(close, fast=50, slow=200)),
    ]

    rows = []
    # baseline = gate
    gate_dt, gate_acc = time_fn(methods[0][1], repeats=args.repeats)
    gate_bars_per_sec = (args.repeats * n) / max(gate_dt, 1e-12)
    rows.append(
        {
            "method": methods[0][0],
            "seconds": gate_dt,
            "bars_per_sec": gate_bars_per_sec,
            "x_vs_gate": 1.0,
            "dummy_acc": gate_acc,
        }
    )

    for name, fn in methods[1:]:
        dt, acc = time_fn(fn, repeats=args.repeats)
        bps = (args.repeats * n) / max(dt, 1e-12)
        rows.append(
            {
                "method": name,
                "seconds": dt,
                "bars_per_sec": bps,
                "x_vs_gate": bps / gate_bars_per_sec,
                "dummy_acc": acc,
            }
        )

    out = pd.DataFrame(rows).sort_values("bars_per_sec", ascending=False).reset_index(drop=True)

    # Save CSV
    csv_path = outdir / "bench_monoliths.csv"
    out[["method", "bars_per_sec", "x_vs_gate", "seconds"]].to_csv(csv_path, index=False)

    # Plot
    fig, ax = plt.subplots(figsize=(16, 6))
    y = np.arange(len(out))
    ax.barh(y, out["bars_per_sec"].to_numpy())
    ax.set_yticks(y)
    ax.set_yticklabels(out["method"].tolist(), fontsize=12)
    ax.invert_yaxis()
    ax.set_xlabel("Bars per second (higher is faster)")
    ax.set_title(f"Compute benchmark (repeats={args.repeats}, n={n})")

    # annotate x_vs_gate
    for i, (bps, xg) in enumerate(zip(out["bars_per_sec"], out["x_vs_gate"])):
        ax.text(bps * 1.005, i, f"{xg:.2f}x", va="center", fontsize=12)

    plt.tight_layout()
    png_path = outdir / "bench_monoliths.png"
    plt.savefig(png_path, dpi=160)

    # Print table
    pretty = out.copy()
    pretty["bars_per_sec"] = pretty["bars_per_sec"].map(lambda v: f"{v:,.0f}")
    pretty["x_vs_gate"] = pretty["x_vs_gate"].map(lambda v: f"{v:.2f}x")
    pretty["seconds"] = pretty["seconds"].map(lambda v: f"{v:.4f}s")

    print("\n=== Compute-speed results (higher bars/s is faster) ===")
    print(pretty[["method", "bars_per_sec", "x_vs_gate"]].to_string(index=False))
    print("\nSaved:")
    print(f"  {png_path}")
    print(f"  {csv_path}")


if __name__ == "__main__":
    main()