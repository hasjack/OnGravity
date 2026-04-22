#!/usr/bin/env python3
"""
Fetch Coinbase BTC-USD daily candles, paginate, save CSV.

Usage:
  python fetch_coinbase_btc_1d.py --start 2018-01-01 --end 2026-04-15 --out data/btc_usd_1d.csv
"""

import argparse
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests
import pandas as pd

BASE = "https://api.exchange.coinbase.com"
PRODUCT = "ETH-USD"
GRAN = 86400  # 1 day
MAX_CANDLES = 300  # defensive cap per request

def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

def parse_date(s: str) -> datetime:
    return datetime.strptime(s, "%Y-%m-%d").replace(tzinfo=timezone.utc)

def fetch_chunk(start: datetime, end: datetime, session: requests.Session) -> list:
    url = f"{BASE}/products/{PRODUCT}/candles"
    params = {"granularity": GRAN, "start": iso(start), "end": iso(end)}
    r = session.get(url, params=params, timeout=30)
    r.raise_for_status()
    return r.json()  # [ [time, low, high, open, close, volume], ... ]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", required=True, help="YYYY-MM-DD")
    ap.add_argument("--end", required=True, help="YYYY-MM-DD")
    ap.add_argument("--out", default="data/btc_usd_1d.csv")
    ap.add_argument("--sleep", type=float, default=0.25, help="seconds between requests")
    args = ap.parse_args()

    start = parse_date(args.start)
    end = parse_date(args.end) + timedelta(days=1)  # include end-date candle
    step = timedelta(days=MAX_CANDLES)

    rows = []
    s = requests.Session()
    s.headers.update({"User-Agent": "bell-toy-backtest/1.0"})

    t = start
    while t < end:
        t2 = min(t + step, end)
        rows.extend(fetch_chunk(t, t2, s))
        time.sleep(args.sleep)
        t = t2

    if not rows:
        raise SystemExit("No data returned")

    df = pd.DataFrame(rows, columns=["time", "low", "high", "open", "close", "volume"])
    df["time"] = pd.to_datetime(df["time"], unit="s", utc=True)
    df = df.drop_duplicates(subset=["time"]).sort_values("time").reset_index(drop=True)

    # filter strictly to requested [start, end)
    df = df[(df["time"] >= start) & (df["time"] < end)].copy()

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)

    print(f"Saved {len(df)} rows to {out_path} ({df['time'].min()} → {df['time'].max()})")

if __name__ == "__main__":
    main()