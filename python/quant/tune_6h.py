import itertools
from dataclasses import dataclass
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
from pathlib import Path

# -----------------------------
# Core (copied from tune.py)
# -----------------------------
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
    min_hold_bars: int,
    short_scale: float = 1.0,
) -> pd.DataFrame:
    setting = compute_setting(df, lookback=setting_lb)

    pos = np.empty(len(df), dtype=float)
    fee = np.zeros(len(df), dtype=float)

    current_pos = 0.0
    hold = 0

    for t in range(len(df)):
        s = gate.step(setting[t], lam)

        if long_only:
            target_pos = 1.0 if s == 1 else 0.0
        else:
            target_pos = 1.0 if s == 1 else -float(short_scale)

        if target_pos != current_pos and hold >= min_hold_bars:
            fee[t] = fee_bps / 1e4
            current_pos = target_pos
            hold = 0
        else:
            hold += 1

        pos[t] = current_pos

    out = df.copy()
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
    return {"ann_return": float(mu), "ann_vol": float(vol), "sharpe": float(sharpe), "max_drawdown": float(dd)}

def year_splits(df: pd.DataFrame) -> List[pd.Timestamp]:
    years = sorted({t.year for t in df["time"]})
    return [pd.Timestamp(f"{y}-01-01", tz="UTC") for y in years[1:]]

def walk_forward_overall(
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
    min_hold_bars: int,
    train_years: int,
    test_years: int,
) -> Dict[str, float]:
    cuts = year_splits(df)
    bounds = [df["time"].min()] + cuts + [df["time"].max() + pd.Timedelta(days=1)]
    n_slices = len(bounds) - 1
    step = test_years

    stitched = []
    window_stats = []

    for start_i in range(0, n_slices - (train_years + test_years) + 1, step):
        train_i1 = start_i + train_years
        test_i0 = train_i1
        test_i1 = test_i0 + test_years

        test_start, test_end = bounds[test_i0], bounds[test_i1]
        test = df[(df["time"] >= test_start) & (df["time"] < test_end)].copy()

        gate = ProgressStateGate(GateParams(w=w, delta_hi=delta_hi, delta_lo=delta_lo, seed=seed))
        gate.reset(sigma=1)

        out = backtest_gate(
            test,
            gate,
            lam=lam,
            setting_lb=setting_lb,
            fee_bps=fee_bps,
            long_only=long_only,
            min_hold_bars=min_hold_bars,
            short_scale=short_scale,
        )
        stitched.append(out["strat_ret"])

        ws = perf_from_returns(out["strat_ret"], bars_per_year=bars_per_year)
        window_stats.append(ws)

    stitched_ret = pd.concat(stitched, ignore_index=True) if stitched else pd.Series(dtype=float)
    overall = perf_from_returns(stitched_ret, bars_per_year=bars_per_year) if len(stitched_ret) else {
        "ann_return": float("nan"),
        "ann_vol": float("nan"),
        "sharpe": float("nan"),
        "max_drawdown": float("nan"),
    }

    if window_stats:
        overall["worst_window_ann_return"] = float(min(ws["ann_return"] for ws in window_stats))
        overall["worst_window_drawdown"] = float(min(ws["max_drawdown"] for ws in window_stats))
    else:
        overall["worst_window_ann_return"] = float("nan")
        overall["worst_window_drawdown"] = float("nan")

    return overall

def score(overall: Dict[str, float]) -> float:
    sharpe = overall["sharpe"]
    dd = abs(overall["max_drawdown"])

    worst_ann = overall.get("worst_window_ann_return", 0.0)
    worst_pen = abs(min(0.0, worst_ann))

    return 1.0 * sharpe - 0.35 * dd - 0.50 * worst_pen

# -----------------------------
# Tune 6h
# -----------------------------
def main():
    BTC_PATH = "data/btc_usd_6h.csv"
    ETH_PATH = "data/eth_usd_6h.csv"

    data = {
        "BTC-USD": load_coinbase_csv(BTC_PATH),
        "ETH-USD": load_coinbase_csv(ETH_PATH),
    }

    BARS_PER_YEAR = 1460.0
    FEES = [50.0]  # hard mode
    TRAIN_YEARS = 2
    TEST_YEARS = 1

    # Search space: keep it moderate (otherwise it's huge).
    LOOKBACKS = [240, 360, 480, 720, 960]     # 60d..240d (6h bars)
    HOLDS = [30, 60, 90, 120]                 # bars (~7.5d..30d)
    WS = [0.20, 0.25, 0.30, 0.35]
    SHORT_SCALES = [0.5, 1.0]
    DELTA_HI = [0.75, 0.80, 0.85, 0.90]
    DELTA_LO = [0.10, 0.15, 0.20, 0.25, 0.30]

    trials = []
    for lb, hold, w, ss, dhi, dlo in itertools.product(LOOKBACKS, HOLDS, WS, SHORT_SCALES, DELTA_HI, DELTA_LO):
        if dhi <= dlo:
            continue
        trials.append((lb, hold, w, ss, dhi, dlo))

    print(f"[tune6h] trials={len(trials)}")

    rows = []
    for i, (lb, hold, w, ss, dhi, dlo) in enumerate(trials, 1):
        combo_scores = []
        worst = 1e9
        worst_combo = ""

        for sym, df in data.items():
            for fee in FEES:
                overall = walk_forward_overall(
                    df,
                    bars_per_year=BARS_PER_YEAR,
                    seed=7,
                    w=w,
                    delta_hi=dhi,
                    delta_lo=dlo,
                    lam=0.0,
                    setting_lb=lb,
                    fee_bps=fee,
                    long_only=False,
                    short_scale=ss,
                    min_hold_bars=hold,
                    train_years=TRAIN_YEARS,
                    test_years=TEST_YEARS,
                )
                sc = score(overall)
                combo_scores.append(sc)
                if sc < worst:
                    worst = sc
                    worst_combo = f"{sym}_fee{int(fee)}"

        row = {
            "trial": i,
            "setting_lb": lb,
            "min_hold_bars": hold,
            "w": w,
            "short_scale": ss,
            "delta_hi": dhi,
            "delta_lo": dlo,
            "score_mean": float(np.mean(combo_scores)),
            "score_min": float(np.min(combo_scores)),
            "worst_combo": worst_combo,
        }
        rows.append(row)

        if i % 200 == 0:
            print(f"[tune6h] {i}/{len(trials)}")

    outdir = Path("output")
    outdir.mkdir(parents=True, exist_ok=True)

    df = pd.DataFrame(rows).sort_values(["score_min", "score_mean"], ascending=False)
    df.to_csv(outdir / "tune6h_results.csv", index=False)
    df.head(50).to_csv(outdir / "tune6h_top.csv", index=False)

    print("\n[tune6h] top 10:")
    print(df.head(10)[[
        "score_min","score_mean","setting_lb","min_hold_bars","w","short_scale","delta_hi","delta_lo","worst_combo"
    ]].to_string(index=False))

    print("\nSaved:")
    print("  output/tune6h_results.csv")
    print("  output/tune6h_top.csv")

if __name__ == "__main__":
    main()
