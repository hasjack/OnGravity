import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from dataclasses import dataclass
from typing import Dict
from pathlib import Path
import json
from datetime import datetime, timezone


# -----------------------------
# Data
# -----------------------------
def load_coinbase_csv(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["time"] = pd.to_datetime(df["time"], utc=True)
    df = df.sort_values("time").reset_index(drop=True)

    for col in ["open", "high", "low", "close", "volume"]:
        df[col] = df[col].astype(float)

    df["ret"] = np.log(df["close"]).diff().fillna(0.0)
    return df


# -----------------------------
# Bell-toy-inspired regime gate
# -----------------------------
@dataclass
class GateParams:
    w: float = 0.55
    delta_hi: float = 0.85
    delta_lo: float = 0.20
    seed: int = 7


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
        self.p = self.rng.random()

    def delta(self, setting: float, lam: float) -> float:
        d = abs(self.wrap_pi(setting - lam))
        return self.params.delta_hi if d < self.params.w else self.params.delta_lo

    def step(self, setting: float, lam: float) -> int:
        dlt = self.delta(setting, lam)
        T = self.p + dlt
        n = int(np.floor(T))
        self.p = T - n
        if n % 2 == 1:
            self.sigma *= -1
        return self.sigma


# -----------------------------
# Feature -> "setting"
# -----------------------------
def compute_setting(df: pd.DataFrame, lookback: int = 20) -> np.ndarray:
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
    lam: float = 0.0,
    setting_lb: int = 20,
    fee_bps: float = 2.0,
    long_only: bool = True,
) -> pd.DataFrame:
    setting = compute_setting(df, lookback=setting_lb)

    sigmas = np.empty(len(df), dtype=int)
    pos = np.empty(len(df), dtype=float)
    fee = np.zeros(len(df), dtype=float)

    current_pos = 0.0
    for t in range(len(df)):
        s = gate.step(setting[t], lam)
        sigmas[t] = s

        if long_only:
            target_pos = 1.0 if s == 1 else 0.0
        else:
            target_pos = 1.0 if s == 1 else -1.0

        if target_pos != current_pos:
            fee[t] = fee_bps / 1e4
            current_pos = target_pos

        pos[t] = current_pos

    out = df.copy()
    out["sigma"] = sigmas
    out["pos"] = pos
    out["fee"] = fee

    out["strat_ret"] = out["pos"].shift(1).fillna(0.0) * out["ret"] - out["fee"]
    out["equity"] = np.exp(out["strat_ret"].cumsum())
    out["buyhold"] = np.exp(out["ret"].cumsum())
    return out


def perf_summary(out: pd.DataFrame, bars_per_year: float = 365.0) -> Dict[str, float]:
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
# Plot saving + metadata
# -----------------------------
def save_plot_with_meta(
    out: pd.DataFrame,
    stats: Dict[str, float],
    meta: Dict,
    output_dir: str = "output",
    stem: str = "btc_bell_gate",
) -> None:
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    # Plot 1: equity curves
    plt.figure(figsize=(12, 5))
    plt.plot(out["equity"], label="Gate strategy")
    plt.plot(out["buyhold"], label="Buy & hold", alpha=0.7)
    plt.title(meta.get("title", "Bell-toy-inspired regime gate"))
    plt.legend()
    plt.tight_layout()

    png1 = out_path / f"{stem}_equity.png"
    plt.savefig(png1, dpi=180)
    plt.close()

    # Plot 2: sigma trace
    plt.figure(figsize=(12, 2.5))
    plt.plot(out["sigma"].to_numpy(), lw=1)
    plt.title("sigma (regime) over time")
    plt.yticks([-1, 1])
    plt.tight_layout()

    png2 = out_path / f"{stem}_sigma.png"
    plt.savefig(png2, dpi=180)
    plt.close()

    # Metadata JSON
    meta_out = {
        "created_utc": datetime.now(timezone.utc).isoformat(),
        "data": {
            "source": meta.get("data_source", "Coinbase Exchange candles CSV"),
            "symbol": meta.get("symbol", "BTC-USD"),
            "timeframe": meta.get("timeframe", "1d"),
            "rows": int(len(out)),
            "start": str(out["time"].iloc[0]),
            "end": str(out["time"].iloc[-1]),
        },
        "model": {
            "gate": "ProgressStateGate",
            "w": meta["gate_params"]["w"],
            "delta_hi": meta["gate_params"]["delta_hi"],
            "delta_lo": meta["gate_params"]["delta_lo"],
            "seed": meta["gate_params"]["seed"],
            "lambda": meta.get("lam", 0.0),
            "setting_lookback": meta.get("setting_lb", 20),
            "long_only": meta.get("long_only", True),
            "fee_bps": meta.get("fee_bps", 2.0),
        },
        "performance": stats,
        "artifacts": {
            "equity_png": str(png1),
            "sigma_png": str(png2),
        },
        "notes": meta.get("notes", ""),
    }

    json_path = out_path / f"{stem}_meta.json"
    json_path.write_text(json.dumps(meta_out, indent=2))

    print(f"Saved plots: {png1}, {png2}")
    print(f"Saved meta : {json_path}")


if __name__ == "__main__":
    df = load_coinbase_csv("data/btc_usd_1d.csv")

    params = GateParams(w=0.55, delta_hi=0.85, delta_lo=0.20, seed=7)
    gate = ProgressStateGate(params)

    lam = 0.0
    setting_lb = 20
    fee_bps = 50
    long_only = True

    out = backtest_gate(df, gate, lam=lam, setting_lb=setting_lb, fee_bps=fee_bps, long_only=long_only)
    stats = perf_summary(out, bars_per_year=365.0)
    print("Performance:", {k: round(v, 4) for k, v in stats.items()})

    meta = {
        "title": "Bell-toy-inspired regime gate (BTC-USD daily)",
        "data_source": "Coinbase Exchange REST candles",
        "symbol": "BTC-USD",
        "timeframe": "1d",
        "gate_params": params.__dict__,
        "lam": lam,
        "setting_lb": setting_lb,
        "fee_bps": fee_bps,
        "long_only": long_only,
        "notes": "Prototype: sigma gates long/flat. Not production trading advice.",
    }

    save_plot_with_meta(out, stats, meta, output_dir="output", stem="btc_bell_gate")