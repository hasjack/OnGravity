# bench_walkforward_1d.py
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Callable, Dict, List, Tuple

import numpy as np
import pandas as pd

import walkforward as wf
import baselines as bl


def _walkforward_stitched_returns_for_baseline(
    df: pd.DataFrame,
    cfg: dict,
    *,
    target_pos_func: Callable[[pd.DataFrame], np.ndarray],
    train_years: int,
    test_years: int,
) -> Tuple[pd.DataFrame, pd.Series]:
    cuts = wf.year_splits(df)
    if len(cuts) < (train_years + test_years):
        raise ValueError("Not enough history for requested walk-forward window")

    bounds = [df["time"].min()] + cuts + [df["time"].max() + pd.Timedelta(days=1)]
    n_slices = len(bounds) - 1
    step = test_years

    rows: List[dict] = []
    stitched_parts: List[pd.Series] = []

    fee_bps = float(cfg["strategy"]["fee_bps"])
    min_hold = int(cfg["strategy"]["min_hold_days"])
    bars_per_year = float(cfg["bars_per_year"])

    for start_i in range(0, n_slices - (train_years + test_years) + 1, step):
        train_i1 = start_i + train_years
        test_i0 = train_i1
        test_i1 = test_i0 + test_years

        train_start, train_end = bounds[start_i], bounds[train_i1]
        test_start, test_end = bounds[test_i0], bounds[test_i1]

        test = df[(df["time"] >= test_start) & (df["time"] < test_end)].copy()

        tgt = target_pos_func(test)
        pos, fee = bl.apply_hold_and_fees(tgt, fee_bps=fee_bps, min_hold=min_hold)

        strat_ret = test["ret"].to_numpy()
        strat_ret = pd.Series(pos).shift(1).fillna(0.0).to_numpy() * strat_ret - fee
        strat_ret = pd.Series(strat_ret)

        stats = wf.perf_from_returns(strat_ret, bars_per_year=bars_per_year)
        turns = int((pd.Series(pos).diff().fillna(0.0) != 0.0).sum())

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
        stitched_parts.append(strat_ret)

    stitched = pd.concat(stitched_parts, ignore_index=True) if stitched_parts else pd.Series(dtype=float)
    return pd.DataFrame(rows), stitched


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="config.json")
    ap.add_argument("--btc", default="data/btc_usd_1d.csv")
    ap.add_argument("--eth", default="data/eth_usd_1d.csv")
    ap.add_argument("--out", default="output/bench_1d.csv")
    ap.add_argument("--train-years", type=int, default=4)
    ap.add_argument("--test-years", type=int, default=1)

    # Schmitt trigger params
    ap.add_argument("--schmitt-enter", type=float, default=0.6)
    ap.add_argument("--schmitt-exit", type=float, default=0.2)

    # sinefit hyperparams (this is the sweep target)
    ap.add_argument("--sinefit-window", type=int, default=120)
    ap.add_argument("--sinefit-period", type=int, default=60)

    args = ap.parse_args()

    base_cfg = json.load(open(args.config, "r"))
    wf.validate_cfg(base_cfg)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    assets = [
        ("BTC-USD", args.btc),
        ("ETH-USD", args.eth),
    ]
    fees = [10.0, 25.0, 50.0]

    rows = []

    for sym, path in assets:
        df = wf.load_coinbase_csv(path)

        for fee in fees:
            # Force 1d semantics (prevents inheriting 1h/6h settings).
            cfg = json.loads(json.dumps(base_cfg))
            cfg["symbol"] = sym
            cfg["data_path"] = path
            cfg["bars_per_year"] = 365.0
            cfg["setting_lookback"] = 180
            cfg["strategy"]["min_hold_days"] = 30
            cfg["strategy"]["fee_bps"] = float(fee)

            long_only = bool(cfg["strategy"]["long_only"])
            short_scale = float(cfg["strategy"].get("short_scale", 1.0))
            lb = int(cfg["setting_lookback"])
            enter_z = float(args.schmitt_enter)
            exit_z = float(args.schmitt_exit)

            # --- Gate (existing harness) ---
            gate_summary, gate_stitched = wf.walk_forward(
                df,
                cfg,
                train_years=args.train_years,
                test_years=args.test_years,
            )

            # stitched may be a Series (returns) or a DataFrame depending on your walkforward.py version
            if isinstance(gate_stitched, pd.DataFrame) and "strat_ret" in gate_stitched.columns:
                gate_ret = gate_stitched["strat_ret"]
            else:
                gate_ret = gate_stitched

            gate_overall = wf.perf_from_returns(gate_ret, bars_per_year=float(cfg["bars_per_year"]))
            gate_turns = float(gate_summary["turns"].sum()) if "turns" in gate_summary.columns else float("nan")

            rows.append(
                {
                    "symbol": sym,
                    "tf": "1d",
                    "fee_bps": fee,
                    "strategy": "gate",
                    **gate_overall,
                    "turns": float(gate_turns),
                    "schmitt_enter": enter_z,
                    "schmitt_exit": exit_z,
                    "sinefit_window": int(args.sinefit_window),
                    "sinefit_period": int(args.sinefit_period),
                }
            )

            baselines: Dict[str, Callable[[pd.DataFrame], np.ndarray]] = {
                "buyhold": lambda d: bl.pos_buyhold(len(d)),
                "tsmom": lambda d: bl.pos_tsmom_from_close(
                    d["close"], lookback=lb, long_only=long_only, short_scale=short_scale
                ),
                "sma_50_200": lambda d: bl.pos_sma_cross(
                    d["close"], fast=50, slow=200, long_only=long_only, short_scale=short_scale
                ),
                "schmitt": lambda d: bl.pos_schmitt_mom(
                    d["close"],
                    lookback=lb,
                    enter_z=enter_z,
                    exit_z=exit_z,
                    long_only=long_only,
                    short_scale=short_scale,
                ),
                # keep 1-sided hysteresis (optional)
                "hysteresis": lambda d: bl.pos_hysteresis_mom(
                    d["close"],
                    lookback=lb,
                    enter_z=enter_z,
                    exit_z=exit_z,
                    long_only=long_only,
                    short_scale=short_scale,
                ),
                # trig baseline with sweepable params
                "sinefit": lambda d: bl.pos_sinefit_phase(
                    d["close"],
                    window=int(args.sinefit_window),
                    period=int(args.sinefit_period),
                    long_only=long_only,
                    short_scale=short_scale,
                ),
            }

            for name, fn in baselines.items():
                summ, stitched = _walkforward_stitched_returns_for_baseline(
                    df,
                    cfg,
                    target_pos_func=fn,
                    train_years=args.train_years,
                    test_years=args.test_years,
                )
                overall = wf.perf_from_returns(stitched, bars_per_year=float(cfg["bars_per_year"]))
                turns = float(summ["turns"].sum()) if "turns" in summ.columns else float("nan")

                rows.append(
                    {
                        "symbol": sym,
                        "tf": "1d",
                        "fee_bps": fee,
                        "strategy": name,
                        **overall,
                        "turns": turns,
                        "schmitt_enter": enter_z,
                        "schmitt_exit": exit_z,
                        "sinefit_window": int(args.sinefit_window),
                        "sinefit_period": int(args.sinefit_period),
                    }
                )

            print(f"[bench1d] {sym} fee={int(fee)} done")

    out = pd.DataFrame(rows)
    out.to_csv(out_path, index=False)

    out2 = out.copy()
    out2["score"] = out2["sharpe"] - 0.35 * out2["max_drawdown"].abs()
    top = out2.sort_values(["symbol", "fee_bps", "score"], ascending=[True, True, False])

    print("\n[bench1d] Top per (symbol, fee):")
    for (sym, fee), g in top.groupby(["symbol", "fee_bps"]):
        best = g.iloc[0]
        print(
            f"  {sym} fee{int(fee)} -> {best['strategy']}: "
            f"sharpe={best['sharpe']:.3f} ann={best['ann_return']:.3f} "
            f"dd={best['max_drawdown']:.3f} turns={best['turns']:.0f}"
        )

    print(f"\nSaved: {out_path}")


if __name__ == "__main__":
    main()