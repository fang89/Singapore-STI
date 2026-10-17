<div align="center">

# Singapore STI

**The Straits Times Index and its 30 names, daily since Dec 1987, with the tape annotated.**

[**fang89.github.io/Singapore-STI →**](https://fang89.github.io/Singapore-STI/)

<br>

<a href="https://fang89.github.io/Singapore-STI/"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/sti-chart-dark.png"><img src="docs/screenshots/sti-chart-light.png" alt="STI dashboard: DBS share price over the past year with earnings beats and misses annotated" width="760"></picture></a>

</div>

---

## The pitch

Most STI charts show a price line and nothing else. You see the drawdown but not what caused
it, and you can't tell whether one name is carrying the index or the whole market is moving.

This puts the context on the chart: 46 hand-picked macro and local events (Barings, the Asian
crisis, SARS, Lehman, the property cooling rounds, COVID, the MAS S$5b revival plan), every
reported earnings print per name marked as a beat or miss against consensus EPS, and two
indicators that answer "where are we in the cycle?" without pretending to call the next print.

It started as a section of [SG Finance](https://fang89.github.io/Singapore-personal-finance/) and
was spun out because it's a market tool, not a household budgeting one.

## What's on the screen

- **Price chart.** Index plus all 30 constituents, grouped by sector, with the window's return
  shown next to each name. Linear or log scale, 1W to max range, zoom and pan.
- **Event tape.** Crisis, Singapore, policy, index-milestone and earnings flags. Click a card to
  zoom to ±18 months around it.
- **Relative.** Overlay the S&P 500, Nasdaq, Hang Seng, Nikkei 225, BTC or gold, rebased to the
  start of the window.
- **Name card.** Last close, all-time high, P/E, P/B, trailing dividend yield and market cap.
- **200-day regime.** On any name: the 200-day simple average, with sub-200 days shaded red,
  plus annualised return and vol for days spent above versus below it.
- **Market mood (STI only).** A 0–100 fear/greed composite, drawn under the chart, with its
  components and the forward-return base rates for each band.

## Market mood: how it's built

There's no VIX for Singapore. No STI options market deep enough to read implied vol off, no AAII-style
sentiment survey, no public fund-flow series. So the mood is built from what the tape is doing,
in the spirit of CNN's Fear & Greed. Code: [`indicators.js`](indicators.js). Full research note,
references and test tables: [METHODOLOGY.md](METHODOLOGY.md).

### 1. Five inputs, measured at each day's close

Strictly point-in-time: day *t* only sees closes up to *t*.

| Input | Calc on day *t* | Risk-on when |
|---|---|---|
| **Trend** | STI ÷ STI 200-day SMA − 1 | high |
| **Breadth** | % of names at or above their own 200-day SMA | high |
| **Highs vs lows** | (names at a 252-day closing high − names at a 252-day closing low) ÷ names with a 200-day SMA | high |
| **Drawdown** | STI ÷ trailing 252-day high − 1 | near 0 |
| **Calm** | 21-day realised vol of daily STI returns, annualised (× √252) | low |

Housekeeping on the breadth inputs:

- Each name's closes are lined up with STI trading days. A stale print carries forward up to
  5 days, then the name drops out.
- A name counts only once it has 200 days of history.
- At least 15 names are required, which means breadth and highs vs lows start in late 2000.

### 2. Normalise each input against its own last three years

Different units, so each input becomes a percentile rank of today's value within its trailing
756 trading days, today included:

```
rank = (days below today + (days equal to today + 1) / 2) / days in the window
```

A rank needs at least 252 observations. Vol is flipped (`calm = 1 − vol rank`) so that 1.0 always
means the most risk-on reading of the last three years.

A rolling rank, not a fixed threshold, because regimes shift. A 10% drawdown in a low-vol tape
carries more information than one in 1998.

### 3. Equal-weight and scale

```
mood = 100 × mean(available component ranks)        # need ≥ 3 of 5
```

No optimised weights. The mood runs from 1990 on trend, drawdown and calm, and on all five
inputs from roughly 2001.

### 4. Bands

| Mood | Read |
|---|---|
| 0–20 | Extreme fear |
| 20–40 | Fear |
| 40–60 | Neutral |
| 60–80 | Greed |
| 80–100 | Extreme greed |

Every parameter (200d, 252d, 21d, the 3-year window and the 20/40/60/80 cuts) was set from the
literature before looking at STI results. Nothing was tuned in-sample.

## What the backtest says

On 38 years of STI price history:

**Base rates by mood band, 12 months out.** Forward returns are averaged within each calendar
year first, because one bear market otherwise contributes hundreds of overlapping days and swamps
the sample.

| Band | Years with a positive 12m forward return | Median year |
|---|---|---|
| Extreme fear | 22 of 27 | +15.9% |
| Fear | 22 of 31 | +5.1% |
| Neutral | 20 of 35 | +2.9% |
| Greed | 16 of 34 | −1.1% |
| Extreme greed | 12 of 24 | −0.6% |

- **Extreme fear has historically been a decent entry.** The forward distribution skews
  clearly positive.
- **Extreme greed is not a short.** Twelve months later it's a coin flip, so it's no reason to
  sell.
- **The 200-day SMA is a risk tool, not an alpha source.** Above it: about +10% a year at
  14% vol. Below it: about +1% at 22% vol. Switching to 0% cash below the line cut max drawdown
  from −68% to −33%, and CAGR came out 5.7% against 5.1% buy-and-hold. The return edge sits
  almost entirely in 2008–2026. Monthly out-of-sample R² is roughly zero, so it doesn't predict
  next month.
- **RSI(14) failed.** On the STI, overbought readings were followed by *higher* returns than
  oversold ones. Momentum persists here, so it was left out.

## Caveats

- **Survivorship.** Breadth uses today's 30 constituents, not point-in-time membership.
- **Price return only.** Dividends of roughly 3–4% a year are excluded, which understates every
  return above.
- **Frictionless.** No costs, no slippage, and cash earns 0%.
- **Small N.** Each extreme band has only 14–18 separate episodes since 1990.
- **Not a signal service.** This is context for sizing and expectations, not a trade trigger, and
  not investment advice.

Every number above can be reproduced with `python3 tools/backtest.py` (needs pandas and numpy).

## Data and plumbing

All prices are unadjusted daily closes from Yahoo Finance. Earnings history depth varies by name;
Hongkong Land, CapitaLand Investment, MPACT and FCT have none in Yahoo's records.

There's no build step and no dependencies: static HTML, a canvas chart and data files that are
plain JS globals. Run it locally with:

```bash
python3 -m http.server   # → http://localhost:8000
```

To refresh the data after the close (`pip install yfinance`):

```bash
python3 fetch_data.py         # prices        → data.js
python3 fetch_benchmarks.py   # SPX, NDX, HSI, N225, BTC, gold → benchmarks.js
python3 fetch_earnings.py     # EPS vs consensus → earnings.js
python3 fetch_profiles.py     # mkt cap, P/E, P/B, yield → profiles.js
python3 fetch_logos.py        # favicons → logos.js (rarely needed)
```

Events are hand-curated in the `EVENTS` array at the top of `app.js`.

| File | Role |
|---|---|
| `index.html` | Page, styles, theme toggle, script loader |
| `app.js` | Chart, controls, event tape, mood panel |
| `indicators.js` | 200-day regime and mood calcs (no rendering) |
| `data.js` · `benchmarks.js` · `earnings.js` · `profiles.js` · `logos.js` | Generated data |
| `fetch_*.py` | Data refresh scripts |
| `tools/backtest.py` | Reproduces every table in METHODOLOGY.md |
| `METHODOLOGY.md` | The full research note |

MIT licence.
