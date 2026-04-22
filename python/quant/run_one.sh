#!/usr/bin/env bash
set -euo pipefail

ASSET="${1:-btc}"   # btc | eth
START="${2:-2018-01-01}"
END="${3:-2026-04-15}"

DATA_DIR="data"
OUT_DIR="output"

BTC_CSV="${DATA_DIR}/btc_usd_1d.csv"
ETH_CSV="${DATA_DIR}/eth_usd_1d.csv"

# --- ensure data exists (fetch if missing) ---
mkdir -p "$DATA_DIR" "$OUT_DIR"

if [[ "$ASSET" == "btc" ]]; then
  if [[ ! -f "$BTC_CSV" ]]; then
    echo "[run_one] fetching BTC candles..."
    python fetch_coinbase_btc_1d.py --start "$START" --end "$END" --out "$BTC_CSV"
  fi
  DATA_PATH="$BTC_CSV"
elif [[ "$ASSET" == "eth" ]]; then
  if [[ ! -f "$ETH_CSV" ]]; then
    echo "[run_one] fetching ETH candles..."
    # expects fetch_coinbase_eth_1d.py exists
    python fetch_coinbase_eth_1d.py --start "$START" --end "$END" --out "$ETH_CSV"
  fi
  DATA_PATH="$ETH_CSV"
else
  echo "usage: ./run_one.sh {btc|eth} [start YYYY-MM-DD] [end YYYY-MM-DD]"
  exit 1
fi

echo "[run_one] using data_path=$DATA_PATH"

# --- set base config (champion params) ---
python - <<PY
import json
p="config.json"
cfg=json.load(open(p))
cfg["data_path"]="$DATA_PATH"
cfg["output_dir"]="$OUT_DIR"
cfg["bars_per_year"]=365.0

cfg["setting_lookback"]=180
cfg["lambda"]=0.0

cfg["gate"]["w"]=0.30
# keep delta_hi/delta_lo/seed as-is in config.json

cfg["strategy"]["min_hold_days"]=30
cfg["strategy"]["long_only"]=False
cfg["strategy"]["short_scale"]=1.0

json.dump(cfg, open(p,"w"), indent=2)
print("[run_one] wrote base config")
PY

# --- walk-forward fee loop ---
for FEE in 10 25 50; do
  python - <<PY
import json
p="config.json"
cfg=json.load(open(p))
cfg["strategy"]["fee_bps"]=float($FEE)
json.dump(cfg, open(p,"w"), indent=2)
print(f"[run_one] fee_bps set to {int($FEE)}")
PY
  python walkforward.py
done

echo "[run_one] done. See output/ for walkforward_* artifacts."
