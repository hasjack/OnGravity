#!/usr/bin/env python3
"""
Fetch Coinbase Exchange candles -> CSV.

Examples:
  python fetch_data.py --product BTC-USD --tf 1d --start 2018-01-01 --end 2026-04-15
  python fetch_data.py --product ETH-USD --tf 4h --years 6
  python fetch_data.py --product BTC-USD --tf 1h --years 2 --out data/btc_usd_1h.csv
"""

import argparse
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pandas as pd
import requests

BASE = "https://api.exchange.coinbase.com"
MAX_CANDLES = 300  # defensive cap per request

TF_TO_SECONDS = {
    "1m": 60,
    "5m": 300,
    "15m": 900,
    "1h": 3600,
    "6h": 21600,
    "1d": 86400,
}

def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

def parse_ymd(s: str) -> datetime:
    return datetime.strptime(s, "%Y-%m-%d").replace(tzinfo=timezone.utc)

def default_out_path(product: str, tf: str) -> str:
    p = product.lower().replace("-", "_")
    return f"data/{p}_{tf}.csv"

def fetch_chunk(session: requests.Session, product: str, gran: int, start: datetime, end: datetime) -> list:
    url = f"{BASE}/products/{product}/candles"
    params = {"granularity": gran, "start": iso(start), "end": iso(end)}
    r = session.get(url, params=params, timeout=30)
    r.raise_for_status()
    return r.json()  # [ [time, low, high, open, close, volume], ... ]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--product", default="BTC-USD", help="Coinbase product, e.g. BTC-USD, ETH-USD")
    ap.add_argument("--tf", default="1d", choices=TF_TO_SECONDS.keys(), help="timeframe: 1m/5m/15m/1h/6h/1d")
    ap.add_argument("--start", help="YYYY-MM-DD (optional if --years provided)")
    ap.add_argument("--end", help="YYYY-MM-DD (optional; default today)")
    ap.add_argument("--years", type=int, default=5, help="If --start not set, fetch last N years (default 5)")
    ap.add_argument("--out", default=None, help="Output CSV path (default derived from product+tf)")
    ap.add_argument("--sleep", type=float, default=0.25, help="Seconds between requests")
    args = ap.parse_args()

    gran = TF_TO_SECONDS[args.tf]

    # date range
    end = parse_ymd(args.end) + timedelta(days=1) if args.end else datetime.now(timezone.utc) + timedelta(days=1)
    if args.start:
        start = parse_ymd(args.start)
    else:
        start = end - timedelta(days=365 * args.years)

    out_path = Path(args.out or default_out_path(args.product, args.tf))
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # pagination window size: MAX_CANDLES * gran seconds
    step = timedelta(seconds=MAX_CANDLES * gran)

    session = requests.Session()
    session.headers.update({"User-Agent": "quant-sandbox/1.0"})

    rows = []
    t = start
    while t < end:
        t2 = min(t + step, end)
        rows.extend(fetch_chunk(session, args.product, gran, t, t2))
        time.sleep(args.sleep)
        t = t2

    if not rows:
        raise SystemExit("No data returned")

    df = pd.DataFrame(rows, columns=["time", "low", "high", "open", "close", "volume"])
    df["time"] = pd.to_datetime(df["time"], unit="s", utc=True)
    df = df.drop_duplicates(subset=["time"]).sort_values("time").reset_index(drop=True)

    # strict filter
    df = df[(df["time"] >= start) & (df["time"] < end)].copy()

    df.to_csv(out_path, index=False)
    print(f"Saved {len(df)} rows to {out_path} ({df['time'].min()} → {df['time'].max()})")

if __name__ == "__main__":
    main()