#!/usr/bin/env python3
"""Backtests behind the dashboard's trend and market-mood indicators (see METHODOLOGY.md).

Tests every candidate indicator on the STI's own history before any of it is shown,
and recomputes the mood index exactly as indicators.js does, so the two can be checked
against each other.

    pip install pandas numpy
    python3 tools/backtest.py            # prints every table in METHODOLOGY.md
    python3 tools/backtest.py --csv mood.csv   # also writes the daily mood series
"""
import json, sys, math, pathlib
import numpy as np, pandas as pd

ROOT = pathlib.Path(__file__).resolve().parent.parent
CSV = sys.argv[sys.argv.index("--csv") + 1] if "--csv" in sys.argv else None
def load(name):
    s = open(f"{ROOT}/{name}").read()
    return json.loads(s[s.index("=") + 1:].strip().rstrip(";"))["series"]

S = load("data.js")
def ser(o):
    return pd.Series(o["c"], index=pd.to_datetime(np.array(o["d"]) * 86400, unit="s"), dtype=float)

sti = ser(S["^STI"])
print("STI", sti.index[0].date(), sti.index[-1].date(), len(sti))

# ---------- A. Neely, Rapach, Tu & Zhou (2014) monthly rules ----------
m = sti.resample("ME").last()
r = m.pct_change()                      # month t return
nxt = r.shift(-1)                       # month t+1 return, what a signal at t predicts
sig = {}
for s_ in (1, 2, 3):
    for l in (9, 12):
        sig[f"MA({s_},{l})"] = (m.rolling(s_).mean() >= m.rolling(l).mean()).astype(float).where(m.rolling(l).count() == l)
for k in (9, 12):
    sig[f"MOM({k})"] = (m >= m.shift(k)).astype(float).where(m.shift(k).notna())

def oos_r2(y, x, start):
    """Campbell-Thompson out-of-sample R2 of an expanding-window regression vs the expanding mean."""
    e_m, e_h = [], []
    idx = y.index
    for i in range(start, len(idx)):
        yt, xt = y.iloc[:i], x.iloc[:i]
        ok = yt.notna() & xt.notna()
        if ok.sum() < 60 or pd.isna(x.iloc[i]) or pd.isna(y.iloc[i]):
            continue
        X = np.c_[np.ones(ok.sum()), xt[ok]]
        b = np.linalg.lstsq(X, yt[ok], rcond=None)[0]
        f = b[0] + b[1] * x.iloc[i]
        e_m.append((y.iloc[i] - f) ** 2)
        e_h.append((y.iloc[i] - yt[ok].mean()) ** 2)
    return 1 - sum(e_m) / sum(e_h), len(e_m)

def strat(pos, ret, per_year):
    eq = (1 + (pos * ret).fillna(0)).cumprod()
    yrs = len(ret.dropna()) / per_year
    cagr = eq.iloc[-1] ** (1 / yrs) - 1
    vol = (pos * ret).std() * math.sqrt(per_year)
    dd = (eq / eq.cummax() - 1).min()
    return cagr, vol, dd, pos.mean()

d = pd.DataFrame({"y": nxt, **sig}).dropna()
start = d.index.get_indexer([pd.Timestamp("1999-12-31")], method="nearest")[0]
print("\nA. Monthly rules, signal at month-end t -> hold month t+1. Sample", d.index[0].date(), "to", d.index[-1].date(), "N", len(d))
bh = strat(pd.Series(1.0, index=d.index), d.y, 12)
print(f"  {'buy&hold':10s} CAGR {bh[0]:6.1%}  vol {bh[1]:5.1%}  maxDD {bh[2]:6.1%}")
for k in sig:
    x = d[k]
    on, off = d.y[x == 1], d.y[x == 0]
    X = np.c_[np.ones(len(d)), x]
    b, res = np.linalg.lstsq(X, d.y, rcond=None)[:2]
    resid = d.y - X @ b
    se = math.sqrt((resid @ resid) / (len(d) - 2) / ((x - x.mean()) ** 2).sum())
    r2o, n = oos_r2(d.y, x, start)
    c = strat(x, d.y, 12)
    print(f"  {k:10s} on {on.mean()*12:6.1%}/yr (n{len(on):3d})  off {off.mean()*12:6.1%}/yr (n{len(off):3d})  "
          f"b t={b[1]/se:4.2f}  OOS R2 {r2o:6.2%} (n{n})  strat CAGR {c[0]:6.1%} vol {c[1]:5.1%} maxDD {c[2]:6.1%} in {c[3]:4.0%}")

# sub-periods for MA(1,12)
for a_, b_ in (("1988", "2007"), ("2008", "2026")):
    dd_ = d.loc[a_:b_]
    on, off = dd_.y[dd_["MA(1,12)"] == 1], dd_.y[dd_["MA(1,12)"] == 0]
    print(f"  MA(1,12) {a_}-{b_}: on {on.mean()*12:6.1%}/yr vol {on.std()*math.sqrt(12):5.1%} | off {off.mean()*12:6.1%}/yr vol {off.std()*math.sqrt(12):5.1%}")

# ---------- B. daily 200-day MA (Brock, Lakonishok & LeBaron 1992) ----------
rd = sti.pct_change()
for L in (50, 100, 200):
    pos = (sti >= sti.rolling(L).mean()).astype(float).shift(1)
    ok = pos.notna()
    on, off = rd[ok & (pos == 1)], rd[ok & (pos == 0)]
    c = strat(pos[ok], rd[ok], 252)
    b = strat(pd.Series(1.0, index=rd[ok].index), rd[ok], 252)
    flips = (pos[ok].diff().abs() == 1).sum()
    print(f"\nB. {L}d MA: on {on.mean()*252:6.1%}/yr vol {on.std()*math.sqrt(252):5.1%} | off {off.mean()*252:6.1%}/yr vol {off.std()*math.sqrt(252):5.1%} | "
          f"strat CAGR {c[0]:6.1%} maxDD {c[2]:6.1%} vs B&H {b[0]:6.1%} maxDD {b[2]:6.1%} | switches {flips} ({flips/ (len(pos[ok])/252):.1f}/yr)")
    for a_, b_ in (("1988", "2007"), ("2008", "2026")):
        p2, r2 = pos[ok].loc[a_:b_], rd[ok].loc[a_:b_]
        print(f"     {a_}-{b_}: on {r2[p2==1].mean()*252:6.1%}  off {r2[p2==0].mean()*252:6.1%}  strat CAGR {strat(p2, r2, 252)[0]:6.1%} vs B&H {strat(p2*0+1, r2, 252)[0]:6.1%}")

# ---------- forward returns helper ----------
fwd = {h: sti.shift(-h) / sti - 1 for h in (21, 63, 126, 252)}
def bucket_table(x, label, cuts, names):
    b = pd.cut(x, cuts, labels=names)
    print(f"\n{label}")
    for nm in names:
        sel = b == nm
        row = [f"{nm:>14s} days {sel.sum():5d}"]
        for h in (21, 63, 126, 252):
            v = fwd[h][sel].dropna()
            row.append(f"{h:3d}d {v.mean():6.1%} (up {(v>0).mean():4.0%})")
        print("  " + " | ".join(row))
    row = ["           all"]
    for h in (21, 63, 126, 252):
        v = fwd[h].reindex(x.dropna().index).dropna()
        row.append(f"{h:3d}d {v.mean():6.1%} (up {(v>0).mean():4.0%})")
    print("  " + " | ".join(row))

# ---------- C. breadth: % of constituents above their own 200d MA ----------
cons = pd.DataFrame({k: ser(v) for k, v in S.items() if k != "^STI"}).reindex(sti.index).ffill(limit=5)
above = (cons >= cons.rolling(200, min_periods=200).mean())
avail = cons.rolling(200, min_periods=200).mean().notna()
breadth = (above & avail).sum(1) / avail.sum(1)
breadth = breadth.where(avail.sum(1) >= 15)
bucket_table(breadth, "C. Breadth (% of today's members above 200d MA), from " + str(breadth.first_valid_index().date()),
             [-.01, .2, .4, .6, .8, 1.01], ["0-20%", "20-40%", "40-60%", "60-80%", "80-100%"])

# ---------- D. RSI(14) extremes ----------
dlt = sti.diff()
up = dlt.clip(lower=0).ewm(alpha=1/14, adjust=False).mean()
dn = (-dlt.clip(upper=0)).ewm(alpha=1/14, adjust=False).mean()
rsi = 100 - 100 / (1 + up / dn)
bucket_table(rsi, "D. RSI(14) on the index", [0, 30, 45, 55, 70, 100], ["<30", "30-45", "45-55", "55-70", ">70"])

# ---------- E. drawdown from 52-week high ----------
ddh = sti / sti.rolling(252, min_periods=252).max() - 1
bucket_table(ddh, "E. Distance below 52-week high", [-1, -.3, -.2, -.1, -.05, .001], ["<-30%", "-30..-20%", "-20..-10%", "-10..-5%", "within 5%"])

# ---------- F. realised volatility regime ----------
rv = rd.rolling(21).std() * math.sqrt(252)
pct = rv.rolling(252 * 3, min_periods=252).rank(pct=True)
bucket_table(pct, "F. 1-month realised vol, percentile of trailing 3y", [0, .2, .4, .6, .8, 1.0], ["calmest 20%", "20-40", "40-60", "60-80", "stormiest 20%"])

# ---------- G. 12-month time-series momentum sign (Moskowitz, Ooi, Pedersen 2012) daily ----------
tsm = (sti / sti.shift(252) - 1)
bucket_table(tsm, "G. Trailing 12-month return", [-1, -.2, 0, .1, .2, 5], ["<-20%", "-20..0%", "0..10%", "10..20%", ">20%"])

# ---------- H. composite mood, price-only, no look-ahead ----------
def prank(x, w=756, mp=252):
    return x.rolling(w, min_periods=mp).rank(pct=True)
ma200 = sti.rolling(200).mean()
comp = pd.DataFrame({
    "trend": prank(sti / ma200 - 1),
    "breadth": prank(breadth),
    "highs_lows": prank(((cons >= cons.rolling(252, min_periods=252).max()) & avail).sum(1).sub(((cons <= cons.rolling(252, min_periods=252).min()) & avail).sum(1)).div(avail.sum(1)).where(avail.sum(1) >= 15)),
    "drawdown": prank(ddh),
    "calm": 1 - prank(rv),
})
mood = comp.mean(1, skipna=True).where(comp.notna().sum(1) >= 3) * 100
print("\ncomponent corr\n", comp.corr().round(2))
f252 = sti.shift(-252) / sti - 1
bucket_table(mood, "H. Composite mood (0 fear .. 100 greed)", [-1, 20, 40, 60, 80, 101], ["fear <20", "20-40", "40-60", "60-80", "greed >80"])

# year-by-year consistency: average the 12-month outcome within each calendar year, count years up
print("\n12-month outcome by calendar year of the signal")
for lo, hi, nm in ((-1, 20, "fear <20"), (20, 40, "20-40"), (40, 60, "40-60"), (60, 80, "60-80"), (80, 101, "greed >80"), (-1, 101, "all")):
    v = f252[(mood >= lo) & (mood < hi)].dropna()
    yr = v.groupby(v.index.year).mean()
    print(f"  {nm:>10s}: higher in {(yr > 0).sum()} of {len(yr)} years, median year {yr.median():+.1%}")

# ---------- episodes: how many independent extreme-fear spells ----------
def episodes(mask, gap=126):
    days = mask[mask].index
    eps, last = [], None
    for d_ in days:
        if last is None or (d_ - last).days > gap * 1.45:
            eps.append(d_)
        last = d_
    return eps
for name, mask in (("drawdown<-30%", ddh < -.3), ("12m ret<-20%", tsm < -.2), ("breadth<20%", breadth < .2), ("mood<20", mood < 20), ("mood>80", mood > 80)):
    e = episodes(mask.fillna(False))
    print(f"{name:15s} {len(e):3d} episodes: " + ", ".join(str(x.date())[:7] for x in e))
if CSV:
    mood.to_csv(CSV)
