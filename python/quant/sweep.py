import json
from itertools import product
from pathlib import Path
import subprocess
import pandas as pd

# -----------------------------
# Sweep lists
# -----------------------------
LOOKBACKS = [120, 180, 240]
WS = [0.20, 0.25, 0.30, 0.35]
FEES = [50.0]
MIN_HOLDS = [14, 30, 60]


def print_leaderboard(output_dir: str = "output", max_turns: int = 100, fee_filter=None) -> None:
    path = Path(output_dir) / "leaderboard.csv"
    if not path.exists():
        print(f"[sweep] No leaderboard found at {path}")
        return

    df = pd.read_csv(path)

    key = "label" if "label" in df.columns else "run_name"

    if "created_utc" in df.columns:
        df["created_utc"] = pd.to_datetime(df["created_utc"], errors="coerce", utc=True)
        df = df.sort_values("created_utc").drop_duplicates(subset=[key], keep="last")
    else:
        df = df.drop_duplicates(subset=[key], keep="last")

    for col in ["ann_return", "ann_vol", "sharpe", "max_drawdown", "turns", "fee_bps", "setting_lookback", "min_hold_days", "w"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna(subset=["sharpe"]).copy()

    if fee_filter is not None and "fee_bps" in df.columns:
        df = df[df["fee_bps"].isin(fee_filter)].copy()

    df = df.sort_values("sharpe", ascending=False)

    cols = [key, "sharpe", "ann_return", "max_drawdown", "turns", "fee_bps", "setting_lookback", "w", "min_hold_days", "symbol"]
    cols = [c for c in cols if c in df.columns]

    print("\n=== Top 10 by Sharpe ===")
    print(df.head(10)[cols].to_string(index=False))

    df_gatey = df[df["turns"] <= max_turns].copy()
    print(f"\n=== Top 5 with turns <= {max_turns} (by Sharpe) ===")
    if len(df_gatey) == 0:
        print("(none)")
    else:
        print(df_gatey.head(5)[cols].to_string(index=False))


def main():
    cfg_path = Path("config.json")
    orig_cfg_text = cfg_path.read_text()
    base = json.loads(orig_cfg_text)

    try:
        for lb, w, fee, hold in product(LOOKBACKS, WS, FEES, MIN_HOLDS):
            cfg = dict(base)

            cfg["setting_lookback"] = lb

            cfg["gate"] = dict(cfg.get("gate", {}))
            cfg["gate"]["w"] = w

            cfg["strategy"] = dict(cfg.get("strategy", {}))
            cfg["strategy"]["fee_bps"] = fee
            cfg["strategy"]["min_hold_days"] = hold

            cfg_path.write_text(json.dumps(cfg, indent=2))
            subprocess.run(["python", "run_backtest.py"], check=True)

    finally:
        cfg_path.write_text(orig_cfg_text)

    print_leaderboard(output_dir=base.get("output_dir", "output"), max_turns=100, fee_filter=FEES)


if __name__ == "__main__":
    main()