# baselines.py
from __future__ import annotations

import numpy as np
import pandas as pd


def _safe_std(x: np.ndarray) -> float:
    s = float(np.nanstd(x))
    return s if s > 1e-12 else 1e-12


def pos_buyhold(n: int) -> np.ndarray:
    return np.ones(n, dtype=float)


def pos_tsmom_from_close(
    close: pd.Series,
    lookback: int,
    *,
    long_only: bool,
    short_scale: float = 1.0,
) -> np.ndarray:
    """
    Time-series momentum: sign of L-bar return.

    long_only=True:  +1 else 0
    long_only=False: +1 else -short_scale
    """
    mom = close.pct_change(lookback).fillna(0.0).to_numpy()
    sgn = np.sign(mom)
    if long_only:
        return (sgn > 0).astype(float)
    return np.where(sgn >= 0, 1.0, -float(short_scale)).astype(float)


def pos_sma_cross(
    close: pd.Series,
    fast: int,
    slow: int,
    *,
    long_only: bool,
    short_scale: float = 1.0,
) -> np.ndarray:
    """
    SMA crossover: long when SMA(fast) > SMA(slow).
    """
    f = close.rolling(fast, min_periods=1).mean()
    s = close.rolling(slow, min_periods=1).mean()
    cond = (f > s).to_numpy()
    if long_only:
        return cond.astype(float)
    return np.where(cond, 1.0, -float(short_scale)).astype(float)


def pos_hysteresis_mom(
    close: pd.Series,
    lookback: int,
    *,
    enter_z: float,
    exit_z: float,
    long_only: bool,
    short_scale: float = 1.0,
) -> np.ndarray:
    """
    Simple 1-sided hysteresis controller on z-scored momentum.

    State machine:
      - enter long if z >= enter_z
      - exit long if z <= exit_z  (exit_z < enter_z)

    long_only=True:  long / flat
    long_only=False: long / short (scaled)  [note: this is "1-sided"; use pos_schmitt_mom for 2-sided Schmitt]
    """
    if exit_z >= enter_z:
        raise ValueError("Expected exit_z < enter_z for hysteresis")

    mom = close.pct_change(lookback).fillna(0.0).to_numpy()
    z = mom / _safe_std(mom)

    out = np.zeros(len(z), dtype=float)
    long_state = False

    for i in range(len(z)):
        if (not long_state) and z[i] >= enter_z:
            long_state = True
        elif long_state and z[i] <= exit_z:
            long_state = False

        if long_only:
            out[i] = 1.0 if long_state else 0.0
        else:
            out[i] = 1.0 if long_state else -float(short_scale)

    return out


def pos_schmitt_mom(
    close: pd.Series,
    lookback: int,
    *,
    enter_z: float,
    exit_z: float,
    long_only: bool,
    short_scale: float = 1.0,
) -> np.ndarray:
    """
    Schmitt trigger on z-scored momentum (2-sided hysteresis).

    z = mom / std(mom), mom = pct_change(lookback).

    long_only=True:
      - enter long if z >=  enter_z
      - exit long  if z <=  exit_z
      - otherwise hold state

    long_only=False (long/short with deadband):
      - enter long  if z >=  enter_z
      - exit long   if z <=  exit_z
      - enter short if z <= -enter_z
      - exit short  if z >= -exit_z
      - otherwise hold state
      - output: +1 for long, -short_scale for short, 0 for flat in deadband

    Requirements:
      exit_z < enter_z
    """
    if exit_z >= enter_z:
        raise ValueError("Expected exit_z < enter_z for Schmitt trigger")

    mom = close.pct_change(lookback).fillna(0.0).to_numpy()
    z = mom / _safe_std(mom)

    out = np.zeros(len(z), dtype=float)

    # state in {-1, 0, +1}
    state = 0

    for i in range(len(z)):
        zi = float(z[i])

        if long_only:
            if state != 1 and zi >= enter_z:
                state = 1
            elif state == 1 and zi <= exit_z:
                state = 0

            out[i] = 1.0 if state == 1 else 0.0
            continue

        # enter decisions
        if state != 1 and zi >= enter_z:
            state = 1
        elif state != -1 and zi <= -enter_z:
            state = -1

        # exit decisions (hysteresis band)
        if state == 1 and zi <= exit_z:
            state = 0
        elif state == -1 and zi >= -exit_z:
            state = 0

        if state == 1:
            out[i] = 1.0
        elif state == -1:
            out[i] = -float(short_scale)
        else:
            out[i] = 0.0

    return out


def pos_sinefit_phase(
    close: pd.Series,
    window: int,
    period: int,
    *,
    long_only: bool,
    short_scale: float = 1.0,
) -> np.ndarray:
    """
    Trig baseline:
    Fit y(t) ≈ a*cos(w t) + b*sin(w t) + c over a rolling window (OLS).
    Trade fitted slope at "now": long if slope >= 0 else short/flat.

    This is a baseline comparator (heavier, more "monolithic") and is not tuned here.
    """
    n = len(close)
    y = close.astype(float).to_numpy()
    w = 2.0 * np.pi / float(period)

    out = np.zeros(n, dtype=float)

    t = np.arange(window, dtype=float)
    cos_t = np.cos(w * t)
    sin_t = np.sin(w * t)
    ones = np.ones(window, dtype=float)

    X = np.stack([cos_t, sin_t, ones], axis=1)  # (window, 3)
    XtX = X.T @ X
    ridge = 1e-10 * np.eye(3)
    inv = np.linalg.inv(XtX + ridge)
    pinv = inv @ X.T  # (3, window)

    t_now = float(window - 1)
    dcos = -w * np.sin(w * t_now)
    dsin =  w * np.cos(w * t_now)

    for i in range(n):
        if i < window:
            out[i] = 0.0
            continue

        seg = y[i - window : i]
        beta = pinv @ seg
        a, b = float(beta[0]), float(beta[1])

        slope = a * dcos + b * dsin

        if long_only:
            out[i] = 1.0 if slope >= 0 else 0.0
        else:
            out[i] = 1.0 if slope >= 0 else -float(short_scale)

    return out


def apply_hold_and_fees(
    target_pos: np.ndarray,
    *,
    fee_bps: float,
    min_hold: int,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Enforce min-hold constraint on a target position series and apply per-turn fee bucket.

    Position changes only occur when hold >= min_hold.
    Fees are charged on the bar where the position actually changes.
    """
    n = len(target_pos)
    pos = np.empty(n, dtype=float)
    fee = np.zeros(n, dtype=float)

    current = 0.0
    hold = 0

    for t in range(n):
        tgt = float(target_pos[t])

        if tgt != current and hold >= int(min_hold):
            fee[t] = float(fee_bps) / 1e4
            current = tgt
            hold = 0
        else:
            hold += 1

        pos[t] = current

    return pos, fee