import json
import itertools
from pathlib import Path
from dataclasses import dataclass
from typing import Dict, List, Tuple, Any

import numpy as np
import pandas as pd

# --------- reuse core logic (copied from walkforward.py) ---------

def load_coinbase_csv(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["time"] = pd.to_datetime(df["time"], utc=True)
    df = df.sort_values("time").reset_index(drop=True)
    for col in ["open", "high", "low", "close", "volume"]:
        if col in df.columns:
            df[col] = df[col].astype(float)
    df["close"] = df["close"].astype(float)
    df["ret"] = np.log(df["close"]).diff().fillna(0.0)
    return df


@dataclass
class GateParams:
    w: float
    delta_hi: float
    delta_lo: float
    seed: int


class ProgressStateGate:
    def __init__(self, params: GateParams):
        self.params = params
        self.rng = np.random.default_rng(params.seed)
        self.sigma = 1
        self.p = self.rng.random()

    @staticmethod
    def wrap_pi(x: float) -> float:
        return (x + np.pi) % (2 * np.pi) - np.pi

    def reset(self, sigma: int = 1) -> None:
        self.sigma = 1 if sigma >= 0 else -1
        self.p = float(self.rng.random())

    def delta(self, setting: float, lam: float) -> float:
        d = abs(self.wrap_pi(setting - lam))
        return self.params.delta_hi if d < self.params.w else self.params.delta_lo

    def step(self, setting: float, lam: float) -> int:
        T = self.p + self.delta(setting, lam)
        n = int(np.floor(T))
        self.p = T - n
        if n % 2 == 1:
            self.sigma *= -1
        return self.sigma


def compute_setting(df: pd.DataFrame, lookback: int) -> np.ndarray:
    mom = df["close"].pct_change(lookback).fillna(0.0).to_numpy()
    scale = np.nanstd(mom) + 1e-12
    z = mom / scale
    return 2.0 * np.arctan(z)


def backtest_gate(
    df: pd.DataFrame,
    gate: ProgressStateGate,
    *,
    lam: float,
    setting_lb: int,
    fee_bps: float,
    long_only: bool,
    min_hold_days: int,
    short_scale: float = 1.0,
) -> pd.DataFrame:
    setting = compute_setting(df, lookback=setting_lb)

    sigmas = np.empty(len(df), dtype=int)
    pos = np.empty(len(df), dtype=float)
    fee = np.zeros(len(df), dtype=float)

    current_pos = 0.0
    hold = 0

    for t in range(len(df)):
        s = gate.step(setting[t], lam)
        sigmas[t] = s

        if long_only:
            target_pos = 1.0 if s == 1 else 0.0
        else:
            target_pos = 1.0 if s == 1 else -float(short_scale)

        if target_pos != current_pos and hold >= min_hold_days:
            fee[t] = fee_bps / 1e4
            current_pos = target_pos
            hold = 0
        else:
            hold += 1

        pos[t] = current_pos

    out = df.copy()
    out["sigma"] = sigmas
    out["pos"] = pos
    out["fee"] = fee
    out["strat_ret"] = out["pos"].shift(1).fillna(0.0) * out["ret"] - out["fee"]
    return out


def perf_from_returns(r: pd.Series, bars_per_year: float) -> Dict[str, float]:
    x = r.to_numpy()
    mu = x.mean() * bars_per_year
    vol = x.std() * np.sqrt(bars_per_year)
    sharpe = mu / (vol + 1e-12)
    equity = np.exp(np.cumsum(x))
    dd = (equity / np.maximum.accumulate(equity) - 1.0).min()
    return {
        "ann_return": float(mu),
        "ann_vol": float(vol),
        "sharpe": float(sharpe),
        "max_drawdown": float(dd),
    }


def year_splits(df: pd.DataFrame) -> List[pd.Timestamp]:
    years = sorted({t.year for t in df["time"]})
    return [pd.Timestamp(f"{y}-01-01", tz="UTC") for y in years[1:]]


def walk_forward_summary(
    df: pd.DataFrame,
    *,
    bars_per_year: float,
    seed: int,
    w: float,
    delta_hi: float,
    delta_lo: float,
    lam: float,
    setting_lb: int,
    fee_bps: float,
    long_only: bool,
    short_scale: float,
    min_hold_days: int,
    train_years: int = 4,
    test_years: int = 1,
) -> Tuple[pd.DataFrame, Dict[str, float]]:
    cuts = year_splits(df)
    if len(cuts) < (train_years + test_years):
        raise ValueError("Not enough history for requested walk-forward window")

    rows = []
    stitched_parts = []

    bounds = [df["time"].min()] + cuts + [df["time"].max() + pd.Timedelta(days=1)]
    n_slices = len(bounds) - 1

    step = test_years
    for start_i in range(0, n_slices - (train_years + test_years) + 1, step):
        train_i1 = start_i + train_years
        test_i0 = train_i1
        test_i1 = test_i0 + test_years

        test_start, test_end = bounds[test_i0], bounds[test_i1]
        test = df[(df["time"] >= test_start) & (df["time"] < test_end)].copy()

        gate = ProgressStateGate(GateParams(w=w, delta_hi=delta_hi, delta_lo=delta_lo, seed=seed))
        gate.reset(sigma=1)

        out_test = backtest_gate(
            test,
            gate,
            lam=lam,
            setting_lb=setting_lb,
            fee_bps=fee_bps,
            long_only=long_only,
            min_hold_days=min_hold_days,
            short_scale=short_scale,
        )

        stats = perf_from_returns(out_test["strat_ret"], bars_per_year=bars_per_year)
        turns = int((out_test["pos"].diff().fillna(0.0) != 0.0).sum())

        rows.append(
            {
                "test_start": str(test_start),
                "test_end": str(test_end),
                **stats,
                "turns": float(turns),
            }
        )
        stitched_parts.append(out_test["strat_ret"].copy())

    summary = pd.DataFrame(rows)

    stitched_ret = pd.concat(stitched_parts, ignore_index=True)
    overall = perf_from_returns(stitched_ret, bars_per_year=bars_per_year)
    overall["mean_turns_per_window"] = float(summary["turns"].mean())
    overall["worst_window_ann_return"] = float(summary["ann_return"].min())
    return summary, overall


# --------- tuning logic ---------

def score(overall: Dict[str, float]) -> float:
    """
    Robustness-ish score.
    Higher is better.
    """
    sharpe = overall["sharpe"]
    dd = abs(overall["max_drawdown"])
    worst = min(0.0, overall["worst_window_ann_return"])  # only penalize negative worst window
    turns = overall["mean_turns_per_window"]

    # weights are deliberately simple / conservative
    return (
        1.0 * sharpe
        - 0.35 * dd
        - 0.50 * abs(worst)
        - 0.005 * turns
    )


def main():
    # ---- set paths here ----
    BTC_PATH = "data/btc_usd_1d.csv"
    ETH_PATH = "data/eth_usd_1d.csv"

    ASSETS = [
        ("BTC-USD", BTC_PATH),
        ("ETH-USD", ETH_PATH),
    ]
    FEES = [25.0, 50.0]  # hard mode
    BARS_PER_YEAR = 365.0

    # Base defaults
    BASE = {
        "lam": 0.0,
        "seed": 7,
        "long_only": False,
        "short_scale": 1.0,
        "train_years": 4,
        "test_years": 1,
    }

    # -------- search space (edit this) --------
    LOOKBACKS = [120, 180, 240]
    WS = [0.25, 0.30, 0.35]
    HOLDS = [14, 30, 60]
    SHORT_SCALES = [0.5, 1.0]

    DELTA_HI = [0.75, 0.80, 0.85, 0.90]
    DELTA_LO = [0.10, 0.15, 0.20, 0.25, 0.30]

    trials = []
    for lb, w, hold, ss, dhi, dlo in itertools.product(LOOKBACKS, WS, HOLDS, SHORT_SCALES, DELTA_HI, DELTA_LO):
        if dhi <= dlo:
            continue
        # keep a reasonable separation, optional:
        # if dhi - dlo < 0.45: continue

        trial = {
            "setting_lb": lb,
            "w": w,
            "min_hold_days": hold,
            "short_scale": ss,
            "delta_hi": dhi,
            "delta_lo": dlo,
        }
        trials.append(trial)

    print(f"[tune] trials = {len(trials)} (grid)")

    results = []
    # preload data once
    data = {sym: load_coinbase_csv(path) for sym, path in ASSETS}

    for i, t in enumerate(trials, 1):
        row = dict(t)
        row["trial"] = i

        # aggregate across (asset, fee)
        combo_scores = []
        combo_stats = []

        for sym, _ in ASSETS:
            df = data[sym]
            for fee in FEES:
                _, overall = walk_forward_summary(
                    df,
                    bars_per_year=BARS_PER_YEAR,
                    seed=BASE["seed"],
                    w=t["w"],
                    delta_hi=t["delta_hi"],
                    delta_lo=t["delta_lo"],
                    lam=BASE["lam"],
                    setting_lb=t["setting_lb"],
                    fee_bps=fee,
                    long_only=BASE["long_only"],
                    short_scale=t["short_scale"],
                    min_hold_days=t["min_hold_days"],
                    train_years=BASE["train_years"],
                    test_years=BASE["test_years"],
                )
                s = score(overall)
                combo_scores.append(s)
                combo_stats.append((sym, fee, overall))

        row["score_mean"] = float(np.mean(combo_scores))
        row["score_min"] = float(np.min(combo_scores))

        # also record the worst-case across combos (conservative)
        row["worst_combo"] = ""
        worst_s = 1e9
        for sym, fee, overall in combo_stats:
            s = score(overall)
            if s < worst_s:
                worst_s = s
                row["worst_combo"] = f"{sym}_fee{int(fee)}"
                row["worst_combo_sharpe"] = overall["sharpe"]
                row["worst_combo_dd"] = overall["max_drawdown"]
                row["worst_combo_worst_year"] = overall["worst_window_ann_return"]

        results.append(row)

        if i % 50 == 0:
            print(f"[tune] {i}/{len(trials)} done...")

    outdir = Path("output")
    outdir.mkdir(parents=True, exist_ok=True)

    df = pd.DataFrame(results)
    df = df.sort_values(["score_min", "score_mean"], ascending=False)

    df.to_csv(outdir / "tune_results.csv", index=False)
    df.head(50).to_csv(outdir / "tune_top.csv", index=False)

    print("\n[tune] top 10 (by score_min then score_mean):")
    print(df.head(10)[[
        "score_min","score_mean","setting_lb","w","min_hold_days","short_scale","delta_hi","delta_lo","worst_combo"
    ]].to_string(index=False))

    print("\nSaved:")
    print("  output/tune_results.csv")
    print("  output/tune_top.csv")


if __name__ == "__main__":
    main()