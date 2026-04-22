import json
import csv
from pathlib import Path
from dataclasses import dataclass
from typing import Dict
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


# -----------------------------
# Helpers: config + label
# -----------------------------
def infer_symbol(cfg: dict) -> str:
    # Prefer explicit symbol; else infer from data_path.
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
    # Shallow validation: fail fast on obvious issues.
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
    if float(s["fee_bps"]) < 0:
        raise ValueError("Expected strategy.fee_bps >= 0")


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


# -----------------------------
# Feature -> setting
# -----------------------------
def compute_setting(df: pd.DataFrame, lookback: int) -> np.ndarray:
    mom = df["close"].pct_change(lookback).fillna(0.0).to_numpy()
    scale = np.nanstd(mom) + 1e-12
    z = mom / scale
    return 2.0 * np.arctan(z)


# -----------------------------
# Backtest
# -----------------------------
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


def perf_summary(out: pd.DataFrame, bars_per_year: float) -> Dict[str, float]:
    r = out["strat_ret"].to_numpy()
    mu = r.mean() * bars_per_year
    vol = r.std() * np.sqrt(bars_per_year)
    sharpe = mu / (vol + 1e-12)
    dd = (out["equity"] / out["equity"].cummax() - 1.0).min()
    turns = int((out["pos"].diff().fillna(0.0) != 0.0).sum())
    return {
        "ann_return": float(mu),
        "ann_vol": float(vol),
        "sharpe": float(sharpe),
        "max_drawdown": float(dd),
        "turns": float(turns),
    }


# -----------------------------
# Artifacts + leaderboard
# -----------------------------
def save_artifacts(out: pd.DataFrame, stats: Dict[str, float], cfg: dict, label: str) -> Dict[str, str]:
    outdir = Path(cfg["output_dir"])
    outdir.mkdir(parents=True, exist_ok=True)

    equity_png = outdir / f"{label}_equity.png"
    sigma_png = outdir / f"{label}_sigma.png"
    meta_json = outdir / f"{label}_meta.json"
    ts_csv = outdir / f"{label}_timeseries.csv"

    plt.figure(figsize=(12, 5))
    plt.plot(out["equity"], label="Gate strategy")
    plt.plot(out["buyhold"], label="Buy & hold", alpha=0.7)
    plt.title(f"In-sample backtest ({label})")
    plt.legend()
    plt.tight_layout()
    plt.savefig(equity_png, dpi=180)
    plt.close()

    plt.figure(figsize=(12, 2.5))
    plt.step(np.arange(len(out)), out["sigma"].to_numpy(), where="post", lw=0.8)
    plt.title("sigma (regime) over time")
    plt.yticks([-1, 1])
    plt.tight_layout()
    plt.savefig(sigma_png, dpi=180)
    plt.close()

    out[["time", "close", "ret", "sigma", "pos", "fee", "strat_ret", "equity", "buyhold"]].to_csv(ts_csv, index=False)

    meta = {
        "created_utc": datetime.now(timezone.utc).isoformat(),
        "label": label,
        "symbol": infer_symbol(cfg),
        "config": cfg,
        "data": {
            "rows": int(len(out)),
            "start": str(out["time"].iloc[0]),
            "end": str(out["time"].iloc[-1]),
        },
        "performance": stats,
        "artifacts": {
            "equity_png": str(equity_png),
            "sigma_png": str(sigma_png),
            "timeseries_csv": str(ts_csv),
        },
    }
    meta_json.write_text(json.dumps(meta, indent=2))

    return {
        "equity_png": str(equity_png),
        "sigma_png": str(sigma_png),
        "meta_json": str(meta_json),
        "timeseries_csv": str(ts_csv),
    }


def append_leaderboard(cfg: dict, label: str, stats: Dict[str, float]) -> None:
    outdir = Path(cfg["output_dir"])
    outdir.mkdir(parents=True, exist_ok=True)
    path = outdir / "leaderboard.csv"

    g = cfg["gate"]
    s = cfg["strategy"]

    row = {
        "created_utc": datetime.now(timezone.utc).isoformat(),
        "label": label,
        "symbol": infer_symbol(cfg),
        "data_path": cfg.get("data_path", ""),
        "bars_per_year": cfg.get("bars_per_year", ""),
        "setting_lookback": cfg.get("setting_lookback", ""),
        "lambda": cfg.get("lambda", ""),
        "w": g.get("w", ""),
        "delta_hi": g.get("delta_hi", ""),
        "delta_lo": g.get("delta_lo", ""),
        "seed": g.get("seed", ""),
        "long_only": s.get("long_only", ""),
        "short_scale": s.get("short_scale", ""),
        "fee_bps": s.get("fee_bps", ""),
        "min_hold_days": s.get("min_hold_days", ""),
        **stats,
    }

    fieldnames = list(row.keys())
    write_header = not path.exists()

    with path.open("a", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        if write_header:
            w.writeheader()
        w.writerow(row)


def main():
    cfg = json.loads(Path("config.json").read_text())
    validate_cfg(cfg)

    df = load_coinbase_csv(cfg["data_path"])

    g = cfg["gate"]
    gate = ProgressStateGate(
        GateParams(
            w=float(g["w"]),
            delta_hi=float(g["delta_hi"]),
            delta_lo=float(g["delta_lo"]),
            seed=int(g["seed"]),
        )
    )
    gate.reset(sigma=1)  # do NOT force p=0.0

    s = cfg["strategy"]
    out = backtest_gate(
        df,
        gate,
        lam=float(cfg["lambda"]),
        setting_lb=int(cfg["setting_lookback"]),
        fee_bps=float(s["fee_bps"]),
        long_only=bool(s["long_only"]),
        min_hold_days=int(s["min_hold_days"]),
        short_scale=float(s.get("short_scale", 1.0)),
    )

    stats = perf_summary(out, bars_per_year=float(cfg["bars_per_year"]))
    label = make_label(cfg)

    print("Performance:", {k: round(v, 4) for k, v in stats.items()})

    artifacts = save_artifacts(out, stats, cfg, label)
    append_leaderboard(cfg, label, stats)

    print(f"Saved to: {cfg['output_dir']}/")
    print("Artifacts:", artifacts)


if __name__ == "__main__":
    main()