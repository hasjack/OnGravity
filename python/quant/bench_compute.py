import time
import json
import pandas as pd
import numpy as np

from pathlib import Path

# import your functions directly from walkforward.py (same logic)
import walkforward as wf

def now():
    return time.perf_counter()

def bars_per_sec(n_bars, dt):
    return n_bars / max(dt, 1e-12)

def main():
    cfg = json.load(open("config.json"))
    path = cfg["data_path"]
    print("data_path:", path)

    t0 = now()
    df = wf.load_coinbase_csv(path)
    t1 = now()
    n = len(df)
    print(f"load: {t1-t0:.3f}s  ({bars_per_sec(n, t1-t0):.0f} bars/s)  n={n}")

    # compute setting only
    t0 = now()
    _ = wf.compute_setting(df, lookback=int(cfg["setting_lookback"]))
    t1 = now()
    print(f"setting: {t1-t0:.3f}s  ({bars_per_sec(n, t1-t0):.0f} bars/s)")

    # one full backtest (single pass)
    g = cfg["gate"]
    s = cfg["strategy"]
    gate = wf.ProgressStateGate(wf.GateParams(
        w=float(g["w"]), delta_hi=float(g["delta_hi"]), delta_lo=float(g["delta_lo"]), seed=int(g["seed"])
    ))
    gate.reset(sigma=1)

    t0 = now()
    out = wf.backtest_gate(
        df,
        gate,
        lam=float(cfg["lambda"]),
        setting_lb=int(cfg["setting_lookback"]),
        fee_bps=float(s["fee_bps"]),
        long_only=bool(s["long_only"]),
        min_hold_days=int(s["min_hold_days"]),
        short_scale=float(s.get("short_scale", 1.0)),
    )
    t1 = now()
    print(f"backtest_gate: {t1-t0:.3f}s  ({bars_per_sec(n, t1-t0):.0f} bars/s)")

    # walk-forward end-to-end
    t0 = now()
    summary, stitched = wf.walk_forward(df, cfg, train_years=2, test_years=1)
    t1 = now()
    print(f"walk_forward(2y/1y): {t1-t0:.3f}s  (windows={len(summary)})")

    # baseline: MA crossover compute time (simple O(N))
    close = df["close"].to_numpy()
    t0 = now()
    fast = pd.Series(close).rolling(50).mean().to_numpy()
    slow = pd.Series(close).rolling(200).mean().to_numpy()
    sig = np.where(fast > slow, 1.0, -1.0)
    ret = df["ret"].to_numpy()
    strat = np.roll(sig, 1) * ret
    strat[0] = 0.0
    _ = np.exp(np.cumsum(strat))
    t1 = now()
    print(f"MA(50/200) baseline: {t1-t0:.3f}s  ({bars_per_sec(n, t1-t0):.0f} bars/s)")

if __name__ == "__main__":
    main()
