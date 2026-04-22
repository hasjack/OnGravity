# Bell-toy Gate Quant Sandbox

Reproducible sandbox for testing a Bell-toy-inspired **regime gate** as a lightweight control layer on crypto candles (Coinbase Exchange).

The gate is a tiny state machine:

- `sigma ∈ {+1, -1}` (regime orientation)
- `p ∈ [0, 1)` (progress accumulator)

Each bar, an “alignment” check returns a two-level push `delta ∈ {delta_hi, delta_lo}`. The accumulator advances `p ← p + delta`. If `p` crosses an integer boundary, the parity of the crossing flips `sigma`. A trading policy gates exposure using `sigma`.

> The Bell-toy part is the **gate architecture** (nonlinear state + hysteresis + regime memory). It is not “the entire alpha” or a complete trading system.

---

## Repo layout

- `fetch_data.py`  
  Fetch Coinbase Exchange candles to CSV for `BTC-USD` / `ETH-USD` at supported granularities (`1m/5m/15m/1h/6h/1d`).

- `config.json`  
  Single source of truth for parameters and file paths.

- `run_backtest.py`  
  Runs a full-history backtest (in-sample). Saves plots + timeseries + meta, appends to `output/leaderboard.csv`.

- `walkforward.py`  
  Walk-forward evaluation. Saves summary + stitched series + equity plot + meta.

- `tune.py`  
  Multi-asset tuning (BTC+ETH) over daily data using walk-forward + fee-stress scoring.

- `tune_6h.py`  
  6h-specific tuning with a robustness score that penalizes worst-window outcomes.

- `bench_compute.py`  
  Micro-benchmark for compute throughput (load, setting, backtest, walk-forward, MA baseline).

- `run_one.sh`  
  Convenience runner (daily defaults + fee loop).

- `sweep.py`  
  Parameter sweep wrapper around `run_backtest.py`, prints leaderboard.

- `output/`  
  All artifacts: CSV summaries, stitched series, PNG plots, JSON meta, leaderboard.

---

## Install

Python 3.10+ recommended.

    pip install numpy pandas matplotlib requests

---

## Data

Fetch BTC/ETH candles (examples):

    # Daily
    python fetch_data.py --product BTC-USD --tf 1d --start 2018-01-01 --end 2026-04-15 --out data/btc_usd_1d.csv
    python fetch_data.py --product ETH-USD --tf 1d --start 2018-01-01 --end 2026-04-15 --out data/eth_usd_1d.csv

    # Hourly
    python fetch_data.py --product BTC-USD --tf 1h --start 2018-01-01 --end 2026-04-15 --out data/btc_usd_1h.csv
    python fetch_data.py --product ETH-USD --tf 1h --start 2018-01-01 --end 2026-04-15 --out data/eth_usd_1h.csv

    # 6-hour (Coinbase supported “mid-frequency”)
    python fetch_data.py --product BTC-USD --tf 6h --start 2018-01-01 --end 2026-04-15 --out data/btc_usd_6h.csv
    python fetch_data.py --product ETH-USD --tf 6h --start 2018-01-01 --end 2026-04-15 --out data/eth_usd_6h.csv

---

## Running

### Walk-forward (recommended)

Edit `config.json` then run:

    python walkforward.py

This writes `output/walkforward_<label>_{summary,stitched,equity,meta}.*`.

### In-sample backtest

    python run_backtest.py

### Daily quick-run with fee loop

    ./run_one.sh btc
    ./run_one.sh eth

### Tuning

Daily tuning (BTC+ETH, fees 25/50 by default):

    python tune.py

6h tuning (robustness scoring + worst-window penalty):

    python tune_6h.py

### Compute benchmark

    python bench_compute.py

---

## Output artifacts

Most scripts write a `label`-named bundle to `output/`:

- `walkforward_<label>_summary.csv` — per-window (yearly) metrics
- `walkforward_<label>_stitched.csv` — stitched OOS returns series
- `walkforward_<label>_equity.png` — stitched equity curve plot
- `walkforward_<label>_meta.json` — config + overall stats + artifact paths

In-sample backtests write:

- `<label>_timeseries.csv`
- `<label>_equity.png`
- `<label>_sigma.png`
- `<label>_meta.json`

---

## Canon configurations

These are empirical “pockets” found via tuning + validation. They are not claims of permanence.

### 1d canon (daily)

- `bars_per_year = 365`
- `lb=180, w=0.30, delta_hi/delta_lo=0.85/0.20, hold=30, short_scale=1.0`
- Fees: 10 / 25 / 50 bps

### 6h canon (Coinbase granularity)

- `bars_per_year = 1460`
- `lb=360, w=0.30, delta_hi/delta_lo=0.90/0.15, hold=30 (bars), short_scale=0.5`
- Fees: 10 / 25 / 50 bps

### 1h canon (hourly)

- `bars_per_year = 8760`
- `lb=2880, w=0.25, delta_hi/delta_lo=0.80/0.30, hold=720 (bars), short_scale=0.5`
- Fee stress: BTC 10/25/50 bps; ETH validated at fee=50.

---

## Results summary (walk-forward stitched OOS)

### 1d (daily)

**BTC**
- fee10: ann_return 0.3263, Sharpe 0.6562, maxDD −0.4764
- fee25: ann_return 0.3103, Sharpe 0.6237, maxDD −0.4842
- fee50: ann_return 0.2835, Sharpe 0.5695, maxDD −0.4970

**ETH**
- fee10: ann_return 0.6503, Sharpe 0.9690, maxDD −0.4735
- fee25: ann_return 0.6342, Sharpe 0.9449, maxDD −0.4774
- fee50: ann_return 0.6074, Sharpe 0.9047, maxDD −0.4839

Takeaway: smooth degradation with fees; ETH consistently stronger than BTC on this configuration.

### 6h (short0.5)

**ETH**
- fee10: ann_return 0.6126, Sharpe 1.0112, maxDD −0.5581
- fee25: ann_return 0.5466, Sharpe 0.9021, maxDD −0.5705
- fee50: ann_return 0.4365, Sharpe 0.7200, maxDD −0.5904

**BTC**
- fee10: ann_return 0.4376, Sharpe 0.9383, maxDD −0.5480
- fee25: ann_return 0.3716, Sharpe 0.7965, maxDD −0.5607
- fee50: ann_return 0.2615, Sharpe 0.5597, maxDD −0.5811

Takeaway: fee-resilient pocket with higher turnover (~44–45 turns/year). ETH leads; BTC remains viable.

### 1h (short0.5)

**ETH (fee50)**
- ann_return 0.2681, Sharpe 0.5297, maxDD −0.6093

**BTC**
- fee10: ann_return 0.1533, Sharpe 0.3979, maxDD −0.5214
- fee25: ann_return 0.1355, Sharpe 0.3516, maxDD −0.5335
- fee50: ann_return 0.1058, Sharpe 0.2743, maxDD −0.5529

Takeaway: hourly holds up but is the most regime-sensitive (intraday is harder). BTC is modest; ETH can vary more with configuration.

---

## Notes / caveats

- This repository is for research and exploration, not trading advice.
- Results are sensitive to: timeframe, fee model, and the “canon pocket” parameters.
- The gate is intended as a **controller layer** that can be paired with other signals and risk constraints.
- Intraday `min_hold_days` is treated as “min hold bars” for simplicity. Consider renaming to `min_hold_bars` if desired.
