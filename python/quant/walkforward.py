import json
from pathlib import Path
from dataclasses import dataclass
from typing import Dict, List, Tuple
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


# -----------------------------
# Helpers: config + label
# -----------------------------
def infer_symbol(cfg: dict) -> str:
    sym = cfg.get("symbol")
    if sym:
        return str(sym)
    p = str(cfg.get("data_path", ""))
    name = Path(p).stem.lower()
    if "btc" in name:
        return "BTC-USD"
    if "eth" in name:
        return "ETH-USD"
    return "ASSET"


def make_label(cfg: dict) -> str:
    g = cfg["gate"]
    s = cfg["strategy"]
    sym = infer_symbol(cfg)

    lb = int(cfg["setting_lookback"])
    w = float(g["w"])
    dhi = float(g["delta_hi"])
    dlo = float(g["delta_lo"])

    fee = float(s["fee_bps"])
    hold = int(s["min_hold_days"])

    long_only = bool(s["long_only"])
    short_scale = float(s.get("short_scale", 1.0))
    short_part = "longflat" if long_only else f"short{short_scale:g}"

    return f"{sym}_lb{lb}_w{w:g}_d{dhi:g}-{dlo:g}_fee{int(fee)}_hold{hold}_{short_part}"


def validate_cfg(cfg: dict) -> None:
    for k in ["data_path", "output_dir", "bars_per_year", "setting_lookback", "lambda", "gate", "strategy"]:
        if k not in cfg:
            raise ValueError(f"config.json missing required key: {k}")
    g = cfg["gate"]
    s = cfg["strategy"]
    for k in ["w", "delta_hi", "delta_lo", "seed"]:
        if k not in g:
            raise ValueError(f"config.json missing gate.{k}")
    for k in ["fee_bps", "min_hold_days", "long_only"]:
        if k not in s:
            raise ValueError(f"config.json missing strategy.{k}")
    if not (float(g["delta_hi"]) > float(g["delta_lo"])):
        raise ValueError("Expected gate.delta_hi > gate.delta_lo")


# -----------------------------
# Data
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


# -----------------------------
# Gate
# -----------------------------
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
        self.p = float(self.rng.random())  # DO NOT force p=0.0

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
    out["equity"] = np.exp(out["strat_ret"].cumsum())
    out["buyhold"] = np.exp(out["ret"].cumsum())
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


# -----------------------------
# Walk-forward
# -----------------------------
def year_splits(df: pd.DataFrame) -> List[pd.Timestamp]:
    years = sorted({t.year for t in df["time"]})
    return [pd.Timestamp(f"{y}-01-01", tz="UTC") for y in years[1:]]


def walk_forward(
    df: pd.DataFrame,
    cfg: dict,
    *,
    train_years: int = 4,
    test_years: int = 1,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    cuts = year_splits(df)
    if len(cuts) < (train_years + test_years):
        raise ValueError("Not enough history for requested walk-forward window")

    rows = []
    stitched_parts = []

    g = cfg["gate"]
    s = cfg["strategy"]

    bounds = [df["time"].min()] + cuts + [df["time"].max() + pd.Timedelta(days=1)]
    n_slices = len(bounds) - 1

    step = test_years
    for start_i in range(0, n_slices - (train_years + test_years) + 1, step):
        train_i1 = start_i + train_years
        test_i0 = train_i1
        test_i1 = test_i0 + test_years

        train_start, train_end = bounds[start_i], bounds[train_i1]
        test_start, test_end = bounds[test_i0], bounds[test_i1]

        test = df[(df["time"] >= test_start) & (df["time"] < test_end)].copy()

        gate = ProgressStateGate(
            GateParams(
                w=float(g["w"]),
                delta_hi=float(g["delta_hi"]),
                delta_lo=float(g["delta_lo"]),
                seed=int(g["seed"]),
            )
        )
        gate.reset(sigma=1)

        out_test = backtest_gate(
            test,
            gate,
            lam=float(cfg["lambda"]),
            setting_lb=int(cfg["setting_lookback"]),
            fee_bps=float(s["fee_bps"]),
            long_only=bool(s["long_only"]),
            min_hold_days=int(s["min_hold_days"]),
            short_scale=float(s.get("short_scale", 1.0)),
        )

        stats = perf_from_returns(out_test["strat_ret"], bars_per_year=float(cfg["bars_per_year"]))
        turns = int((out_test["pos"].diff().fillna(0.0) != 0.0).sum())

        rows.append(
            {
                "train_start": str(train_start),
                "train_end": str(train_end),
                "test_start": str(test_start),
                "test_end": str(test_end),
                **stats,
                "turns": float(turns),
            }
        )

        stitched_parts.append(out_test[["time", "strat_ret", "ret"]].copy())

    summary = pd.DataFrame(rows)
    stitched = pd.concat(stitched_parts, ignore_index=True).sort_values("time").reset_index(drop=True)
    stitched["equity"] = np.exp(stitched["strat_ret"].cumsum())
    stitched["buyhold"] = np.exp(stitched["ret"].cumsum())
    return summary, stitched


def main():
    cfg = json.loads(Path("config.json").read_text())
    validate_cfg(cfg)

    df = load_coinbase_csv(cfg["data_path"])

    outdir = Path(cfg["output_dir"])
    outdir.mkdir(parents=True, exist_ok=True)

    summary, stitched = walk_forward(df, cfg, train_years=2, test_years=1)
    label = make_label(cfg)

    summary_path = outdir / f"walkforward_{label}_summary.csv"
    stitched_path = outdir / f"walkforward_{label}_stitched.csv"
    equity_png = outdir / f"walkforward_{label}_equity.png"
    meta_path = outdir / f"walkforward_{label}_meta.json"

    summary.to_csv(summary_path, index=False)
    stitched.to_csv(stitched_path, index=False)

    plt.figure(figsize=(12, 5))
    plt.plot(stitched["equity"], label="Walk-forward OOS equity")
    plt.plot(stitched["buyhold"], label="Walk-forward OOS buy & hold", alpha=0.7)
    plt.title(f"Walk-forward OOS ({label})")
    plt.legend()
    plt.tight_layout()
    plt.savefig(equity_png, dpi=180)
    plt.close()

    overall = perf_from_returns(stitched["strat_ret"], bars_per_year=float(cfg["bars_per_year"]))

    meta = {
        "created_utc": datetime.now(timezone.utc).isoformat(),
        "label": label,
        "symbol": infer_symbol(cfg),
        "config": cfg,
        "artifacts": {
            "walkforward_summary_csv": str(summary_path),
            "walkforward_stitched_csv": str(stitched_path),
            "walkforward_equity_png": str(equity_png),
        },
        "overall_oos": overall,
    }
    meta_path.write_text(json.dumps(meta, indent=2))

    print(f"Saved: {summary_path}")
    print(f"Saved: {stitched_path}")
    print(f"Saved: {equity_png}")
    print(summary[["test_start", "test_end", "ann_return", "sharpe", "max_drawdown", "turns"]].to_string(index=False))
    print("Overall OOS:", {k: round(v, 4) for k, v in overall.items()})


if __name__ == "__main__":
    main()