<div align="center">

# 📈 Singapore STI

An interactive chart of the Straits Times Index and all 30 of its constituents,<br>
marked with the crises, policy changes and earnings results that moved them.

<br>

[![Open the live dashboard](https://img.shields.io/badge/▶_Open_the_live_dashboard-fang89.github.io%2FSingapore--STI-1d4ed8?style=for-the-badge)](https://fang89.github.io/Singapore-STI/)

**👉 [fang89.github.io/Singapore-STI/](https://fang89.github.io/Singapore-STI/)**

<br>

![No build step](https://img.shields.io/badge/build_step-none-475569)
![Dependencies](https://img.shields.io/badge/dependencies-0-475569)
![Licence](https://img.shields.io/badge/licence-MIT-475569)

<br>

<a href="https://fang89.github.io/Singapore-STI/"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/sti-chart-dark.png"><img src="docs/screenshots/sti-chart-light.png" alt="STI dashboard: DBS share price over the past year with earnings beats and misses annotated" width="760"></picture></a>

</div>

---

Daily closes go back to **December 1987** for the index (2000s onward for most
constituents). On top of the prices sit 46 curated market events (crises, Singapore
stories, policy shifts and index milestones) and every earnings release Yahoo records
for each constituent, marked as a beat or a miss against consensus EPS.

It started as a section of [SG Finance](https://fang89.github.io/Singapore-personal-finance/),
the Singapore household money guide, and now lives here on its own.

## Features

- Canvas line chart with crosshair tooltip, wheel-zoom, drag-pan and an
  overview brush strip
- Event annotations on the chart: callout boxes with leader lines when zoomed
  in, dots on the price line when zoomed out. Cards below list what's in view, and
  clicking one zooms to ±18 months around it
- Ticker switcher for the index and its 30 constituents, grouped by sector, showing
  each ticker's return over the window on screen
- Range presets (1W / 1M / 3M / 1Y / 5Y / Max, opening on 1M), linear or log scale, and event-category filters (including earnings)
- Compare against the S&P 500, Nasdaq, Hang Seng, Nikkei, Bitcoin or gold
- **200-day average** on any ticker, with the days spent below it shaded, and what returns and
  volatility looked like on each side of it
- **Market mood**, a 0–100 fear-to-greed reading for the STI built from five price-based
  measures (trend, breadth, new highs vs lows, drawdown and volatility), drawn under the chart
  and broken down in a panel with what the STI did next from each mood band. How it is built,
  the research behind it and how it tested on 38 years of STI history are in
  [METHODOLOGY.md](METHODOLOGY.md)
- Light and dark themes (follows the system, with a manual toggle), and a yearly data table

## How the market mood is calculated

The mood is a 0–100 reading of how fearful or greedy the STI looks, built only from prices.
Singapore has no options-based fear gauge (like the VIX), no investor-sentiment survey and no
public fund-flow data, so the mood reads how the market is *behaving* instead, much as CNN's
Fear & Greed Index does. The code is in [`indicators.js`](indicators.js). [METHODOLOGY.md](METHODOLOGY.md)
covers the research behind each choice and how the mood has tested on past data.

### Step 1: five daily readings

Each reading is calculated every trading day from closing prices up to and including that day.
Nothing uses later prices.

| # | Reading | Formula on day *t* | Bullish when |
|---|---|---|---|
| 1 | **Trend** | STI close ÷ STI 200-day simple average − 1 | high |
| 2 | **Breadth** | members closing at or above their own 200-day average ÷ members with a 200-day average | high |
| 3 | **Highs vs lows** | (members at a 252-day closing high − members at a 252-day closing low) ÷ members with a 200-day average | high |
| 4 | **Drawdown** | STI close ÷ highest STI close of the last 252 days − 1 (zero or negative) | close to 0 |
| 5 | **Calm** | standard deviation of the last 21 daily STI returns × √252 (annualised volatility) | low |

Rules for the member-based readings (2 and 3):

- "Members" are the STI's 30 current constituents.
- Each member's prices are lined up with the STI's trading days. If a member didn't trade on an
  index day, its last close carries forward for up to 5 days. After that it counts as missing.
- A member only counts once it has 200 days of history.
- Breadth and highs vs lows need at least 15 members to count. Before late 2000 there were fewer
  than 15, so both are left blank.

### Step 2: rank each reading against its own past

The five readings use different units, so each one is turned into a percentile. Today's value is
ranked against that reading's values over the last 756 trading days (about three years),
today's included:

```
rank = (days below today + (days equal to today + 1) / 2) / days in the window
```

Missing days are skipped, and a rank needs at least 252 values (one year) to count. A rank of 1.0
means the reading is at its most bullish of the last three years. For **Calm**, high volatility is
fearful, so its rank is flipped: `calm rank = 1 − volatility rank`.

Ranking against a rolling window lets the mood adapt as the market changes over the decades.
A 10% drawdown meant more in a calm decade than in the late 1990s.

### Step 3: average and scale

```
mood = 100 × average of the component ranks available that day
```

All components have equal weight. A day needs at least 3 of the 5 ranks to count, so the mood
starts in 1990 (on trend, drawdown and calm alone) and uses all five from about 2001.

### Step 4: bands

| Mood | Band |
|---|---|
| 0 to under 20 | Extreme fear |
| 20 to under 40 | Fear |
| 40 to under 60 | Neutral |
| 60 to under 80 | Greed |
| 80–100 | Extreme greed |

### Fixed settings

None of these settings were tuned on the STI: the 200-day average, the 252-day high and low,
21-day volatility, the 3-year ranking window and the cut-offs at 20, 40, 60 and 80 all come from
published research and were chosen before testing. Changing them to fit the past would make the
mood look better on historical data without making it more reliable.

### The "what happened next" table

For each band, the panel takes every day the mood was in that band and measures the STI's return
21, 63, 126 and 252 trading days later (about 1, 3, 6 and 12 months), plus the share of those days
when the index was higher.

Back-to-back days in a crash are not independent: a single bear market can fill a band with
hundreds of days. Two checks correct for this:

- **Episodes:** a new episode starts only when the mood re-enters a band after about six months
  (183 calendar days) away from it.
- **Years higher:** the 12-month results are averaged within each calendar year first. The count
  is the number of those years that ended higher.

### Caveats

- Breadth uses today's members, so companies that later left the index are missing (survivorship
  bias).
- Returns are price-only, without dividends (about 3–4% a year).
- Each band has only 14–18 episodes since 1990.
- The mood describes conditions; it is not a timing signal and not investment advice. To recompute
  every number, run `tools/backtest.py`.

## Files

| File | Purpose |
|---|---|
| `index.html` | The page: markup, styles and the theme toggle |
| `app.js` | Chart, controls and event code |
| `indicators.js` | 200-day average and market mood calculations (no drawing) |
| `data.js` | Price history (`window.STI_DATA`), generated by the fetch script |
| `benchmarks.js` | Comparison benchmarks (`window.STI_BENCH`) |
| `earnings.js` | Earnings dates and EPS vs consensus per constituent |
| `logos.js` | Company favicons embedded as data URIs |
| `profiles.js` | One-line company blurbs and live market caps |
| `fetch_data.py` | Refreshes `data.js` from Yahoo Finance (`pip install yfinance`) |
| `fetch_benchmarks.py` | Refreshes `benchmarks.js` (S&P 500, Nasdaq, Hang Seng, Nikkei, Bitcoin, gold) |
| `fetch_earnings.py` | Refreshes `earnings.js` |
| `fetch_logos.py` | Refreshes `logos.js` |
| `fetch_profiles.py` | Refreshes `profiles.js` (market caps; blurbs curated inside it) |
| `tools/backtest.py` | Tests the indicators on STI history and prints every table in METHODOLOGY.md (`pip install pandas numpy`) |
| `METHODOLOGY.md` | How the trend and mood indicators work, and how far to trust them |

No build step and no dependencies. To run it locally:

```bash
python3 -m http.server   # then open http://localhost:8000
```

## Updating the data

Run these from the repo root:

```bash
python3 fetch_data.py       # prices
python3 fetch_benchmarks.py # comparison benchmarks
python3 fetch_earnings.py   # earnings history
python3 fetch_logos.py      # logos (rarely needed)
python3 fetch_profiles.py   # market caps
```

Events are curated by hand in the `EVENTS` array at the top of `app.js`.

## Notes

- Prices are unadjusted daily closes from Yahoo Finance. Long-history series
  reflect Yahoo's records, including any splits or re-listings as Yahoo reports them.
- Earnings history depth varies by ticker. A few tickers (Hongkong Land,
  CapitaLand Investment, MPACT, FCT) have none in Yahoo's records.
- Not investment advice.

## Licence

MIT
