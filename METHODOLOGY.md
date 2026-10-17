# Trend and market mood: methodology

This document covers the two indicators on the dashboard, the **200-day average** and the
**market mood index**. It explains what each one measures, how it is built, the research it
draws on, and how it has performed on the STI's own history. All figures use data up to
2 October 2026. To reproduce every table here, run `python3 tools/backtest.py`.

> **The short version.** No indicator is proven to predict the market. What the research
> supports is narrower: **trend**, meaning price relative to a long moving average, separates
> calm periods from turbulent ones, and on the STI that held clearly. Sentiment readings are
> useful mainly at their **extremes**, and over horizons of a year rather than a month. On
> the STI, the clearest case is extreme fear: in 22 of the 27 years that saw it, the index
> was higher a year later. Even so, the history gives only 14–18 independent episodes per
> extreme. The dashboard shows these numbers so you can see the size of the effect and the
> size of the sample. It does not turn them into buy or sell calls.

---

## 1. What "sentiment" can mean here

The well-studied measures of investor sentiment are mostly unavailable for Singapore:

- **Surveys**, such as AAII bull/bear or Investors Intelligence, are US only.
- **Options data**, such as the VIX or put/call ratios, do not exist for the STI in any useful
  depth.
- **Fund flows, IPO first-day returns and margin debt** have no free daily series.

The dashboard has daily closing prices for the index and its 30 members, and nothing else.
So the mood index is a **price-based proxy**. It measures how investors are *behaving*, using
trend, breadth, new highs and lows, drawdown and volatility, not what they *say* they feel.
That is the same design idea as CNN's Fear & Greed Index, which also blends market-behaviour
readings. CNN has never published evidence that its index predicts anything, though, so it is
a design reference only. The evidence comes from the papers below and from testing on the
STI itself.

## 2. What the research says

| Finding | Source | Holds up? |
|---|---|---|
| Buying above a 50/150/200-day moving average and selling below it beat buy-and-hold on the Dow, 1897–1986. Returns above the average were higher and **less volatile**. | Brock, Lakonishok & LeBaron (1992), *Journal of Finance* | Partly. Sullivan, Timmermann & White (1999, *JF*) corrected for data-snooping and found the best rules **stopped working** out of sample after 1986. |
| A 10-month (about 200-day) moving-average filter roughly halved drawdowns across asset classes, with similar returns. | Faber (2007), *Journal of Wealth Management* | Mostly. The drawdown reduction is robust; the return edge is small and depends on the period. |
| An asset's own past 12-month return predicts its next month, across 58 futures markets. | Moskowitz, Ooi & Pedersen (2012), *Journal of Financial Economics* | Yes for diversified futures portfolios. It is much weaker for a single stock index. |
| Moving-average and momentum signals forecast the US equity premium **out of sample**, adding information beyond macro variables, mostly in recessions. The authors link this to investors under-reacting, then over-reacting. | Neely, Rapach, Tu & Zhou (2014), *Management Science* | This is the closest thing to "technical indicators work on sentiment" in top journals. It is US data. On the STI, see §5. |
| High investor sentiment is followed by **lower** returns, especially for hard-to-value stocks. | Baker & Wurgler (2006), *JF*; Brown & Cliff (2005), *Journal of Business* | Yes, but over **1–3 years**, mostly cross-sectional, and measured with survey and flow data the STI lacks. |
| Stocks near their 52-week high keep outperforming, because investors anchor on the high. | George & Hwang (2004), *JF* | Yes, in the cross-section of US stocks. |
| A forecast only counts if it beats the historical average out of sample (the "OOS R²"). | Campbell & Thompson (2008), *Review of Financial Studies* | This is the test standard used in §5. |

Two lessons from this literature shaped the build:

1. **Fix the parameters in advance, from the literature, and never tune them on the STI.** A
   rule chosen because it fitted the data best will look good on that data and nowhere else.
   This is the Sullivan, Timmermann & White result. So the dashboard uses 200 days because
   that is the standard, not because it tested best on the STI. As §5 shows, it did not test
   best.
2. **Judge an indicator on out-of-sample forecasts, and count the independent episodes, not
   the days.** A year-long forward return measured from every day of a bear market is one
   observation, not 250.

## 3. The indicators, exactly

All calculations are on unadjusted daily closes. Every value on day *t* uses closes up to and
including day *t*, never later ones. `indicators.js` computes everything in the browser, and
`tools/backtest.py` computes the same numbers in Python.

### 3.1 The 200-day average (any ticker)

- **MA₂₀₀(t)** = the mean of the last 200 closes, including today's.
- **Regime(t)** = *above* if close(t) ≥ MA₂₀₀(t), otherwise *below*.
- **On the chart:** a dashed line for MA₂₀₀, and a faint red band over every day that closed
  below it. You can turn it on and off with the *200-day average* chip.
- **Trend box:** today's gap to the average and the date of the last crossing. It also
  splits every **next-day** return by the regime on the **previous** close, and shows the
  annualised mean (×252) and volatility (×√252) of each group. Each cell is labelled with
  its day count.

### 3.2 Market mood (the STI as a whole)

The mood index has five components. Each component is a raw daily reading:

| Component | Raw reading on day *t* | Bullish when | Basis |
|---|---|---|---|
| **Trend** | STI ÷ its 200-day average − 1 | high | Brock et al.; Faber |
| **Breadth** | share of members whose close ≥ their own 200-day average | high | Practitioner breadth measures; CNN F&G "breadth" |
| **Highs vs lows** | (members at a 52-week closing high − members at a 52-week closing low) ÷ members with history | high | George & Hwang; CNN F&G "strength" |
| **Drawdown** | STI ÷ its highest close of the last 252 days − 1 | high (near the high) | George & Hwang |
| **Calm** | standard deviation of the last 21 daily returns × √252 | **low**, so this one is inverted | Volatility rises in sell-offs; CNN F&G "volatility" |

The five readings are measured in different units, so before averaging they are converted to
**percentile ranks**:

```
rank_k(t) = share of the component's values over the last 756 trading days (3 years)
            that are below today's, with ties counted as half
            (requires at least 252 values; for Calm, rank = 1 − rank)
mood(t)   = 100 × mean of the available ranks (at least 3 of the 5 must exist)
```

**Why a three-year rank?** It makes each reading relative to recent experience. A 10% fall
is alarming after a calm year and routine after a crisis. Three years covers a typical
Singapore market cycle and still reacts to regime changes. Ranking also makes the components
comparable without picking weights. The components are **equally weighted**, because any
other weighting would have to be fitted, and fitting is what §2 warns against.

**Bands:** 0–20 *Extreme fear*, 20–40 *Fear*, 40–60 *Neutral*, 60–80 *Greed*, 80–100
*Extreme greed*. These are quintile-width bands, chosen before looking at the results.

**Members:** breadth and highs/lows use the 30 current constituents, aligned to the index's
trading days. A member's last close is carried forward over at most 5 days it did not trade.
A member counts once it has 200 days of history. Breadth is computed only when at least 15
members qualify, which first happens in October 2000. Before then, the mood is the average of
the other three components.

**What was tested and left out:**

- **RSI(14):** on the STI it behaved as a *momentum* signal, not a contrarian one. Readings
  above 70 were followed by better returns than readings below 30 over 1–6 months (§5, D).
  Putting it in a "fear/greed" gauge as an overbought/oversold reading would mislead.
- **A safe-haven component (STI vs gold):** this mixes currencies and adds little that
  drawdown does not already capture.

The five components are correlated, because they all respond to falling prices. Trend and
breadth correlate at 0.87, and trend and drawdown at 0.83. Calm is the most independent, at
0.29–0.49. So the mood index is roughly "how damaged is the market, broadly and recently",
seen from five angles.

## 4. How it was tested

- **Data:** STI daily closes, 28 Dec 1987 to 2 Oct 2026 (9,688 days), and member closes from
  2000 onwards (Yahoo Finance).
- **No look-ahead:** each signal is formed at the close and judged on returns that start
  after it. That means the next day for the daily regime, the next month for the monthly
  rules, and the next 21, 63, 126 or 252 trading days for the mood bands.
- **Forecast test (monthly rules):** the six Neely et al. moving-average rules MA(s,l) for
  s∈{1,2,3} and l∈{9,12} months, plus momentum MOM(9) and MOM(12). Each is regressed on the
  next month's return. The out-of-sample R² uses expanding-window regressions from 2000
  onwards against the expanding historical mean, following Campbell & Thompson.
- **Strategy test:** hold the STI when the signal is on and cash at 0% when it is off. Report
  compound annual growth (CAGR), volatility and maximum drawdown.
- **Forward-return tables:** group days by indicator band, then report the mean forward price
  change and the share of positive outcomes. **Spells** counts separate visits to a band
  (re-entries more than about 6 months apart), which is the honest sample size.

## 5. Results on the STI

### A. Monthly trend rules (Neely et al.), 1989–2026

| Rule | Next month's return when on / off (annualised) | Out-of-sample R² | Strategy CAGR | Max drawdown |
|---|---|---|---|---|
| Buy and hold | — | — | 4.6% | −65.0% |
| MA(1,9) | 10.3% / 0.4% | +0.22% | 5.8% | −28.6% |
| MA(1,12) | 8.9% / 2.3% | −0.88% | 5.0% | −41.5% |
| MA(2,9) | 9.8% / 1.4% | +0.15% | 5.4% | −33.7% |
| MA(3,12) | 9.7% / 1.2% | −0.11% | 5.5% | −31.7% |
| MOM(12) | 6.9% / 6.0% | −0.57% | 3.5% | −42.0% |

**Reading:** returns were consistently higher with the signal on than off. But the
out-of-sample R² is about zero, so as a *forecast of next month's return* the signal adds
nothing reliable over the long-run average. The value shows up in **risk**: the strategy cut
the worst drawdown roughly in half and the volatility by about 40%, at a similar return.
Twelve-month momentum, the strongest result for diversified futures, does essentially
nothing for the STI on its own.

### B. Daily 200-day average, 1988–2026

| | Days | Next-day return, annualised | Volatility, annualised |
|---|---|---|---|
| After a close **above** the average | 5,816 | +10.3% | 14.4% |
| After a close **below** the average | 3,672 | −0.6% | 22.5% |

Switching on this rule (with a one-day lag and 0% cash) gave a CAGR of 5.7% against 5.1% for
buy-and-hold, and a maximum drawdown of −33% against −68%. It meant about 7 switches a year.
The edge in return comes entirely from 2008–2026, at 4.0% against 2.6%. In 1988–2007 the two
were level. Shorter averages of 50 and 100 days look better on this data (8.0–8.5% CAGR), but
they were not chosen in advance, they switch 10–16 times a year before costs, and their
advantage halves between the first and second halves of the sample. That decay is the
data-snooping pattern described in §2.

### C. Breadth alone, 2000–2026

| Share of members above their 200-day avg | Next 1 month | Next 3 months | Next 12 months (% up) |
|---|---|---|---|
| 0–20% | 0.0% | +1.4% | +16.7% (81%) |
| 20–40% | +0.6% | +1.3% | +6.6% (72%) |
| 40–60% | +0.2% | +0.1% | +3.3% (52%) |
| 60–80% | +0.5% | +1.5% | +3.3% (56%) |
| 80–100% | +1.0% | +3.0% | +6.3% (68%) |
| All days | +0.5% | +1.5% | +6.3% (64%) |

This forms a U-shape. Washed-out breadth was followed by strong 12-month returns, which is
the contrarian effect. Very strong breadth was followed by good 1–3-month returns, which is
the momentum effect. The middle bands were the weakest.

### D. RSI(14), tested and not used

| RSI | Next 1 month | Next 3 months | Next 6 months |
|---|---|---|---|
| < 30 ("oversold") | +0.9% | +1.8% | +3.8% |
| > 70 ("overbought") | +1.2% | +3.6% | +6.4% |

"Overbought" was followed by *better* returns than "oversold". This is the opposite of how
RSI is usually read, so it is not in the mood index.

### E. The mood index, 1990–2026

The first table weights every day equally:

| Mood | Days | Spells | 1 month | 3 months | 6 months | 12 months (% up) |
|---|---|---|---|---|---|---|
| Extreme fear (0–20) | 1,355 | 18 | −0.4% | +0.5% | +4.5% | +14.7% (64%) |
| Fear (20–40) | 1,888 | 16 | +1.1% | +2.1% | +1.8% | +5.6% (63%) |
| Neutral (40–60) | 2,406 | 15 | +0.1% | +0.1% | +1.5% | +2.2% (47%) |
| Greed (60–80) | 2,481 | 15 | +0.6% | +2.1% | +3.2% | +4.2% (57%) |
| Extreme greed (80–100) | 1,056 | 14 | +1.2% | +3.2% | +6.4% | +10.8% (74%) |
| All days | 9,186 | | +0.5% | +1.5% | +3.0% | +6.3% (59%) |

Equal day weights let one long episode dominate. The 192 extreme-fear days in 1998 alone
supply about 60% of that band's 12-month total. So the second check averages the 12-month
outcome within each calendar year first, then counts the years that ended higher:

| Mood | Years higher 12 months later | Median year |
|---|---|---|
| Extreme fear | **22 of 27** | +15.9% |
| Fear | 22 of 31 | +5.1% |
| Neutral | 20 of 35 | +2.9% |
| Greed | 16 of 34 | −1.1% |
| Extreme greed | **12 of 24** | −0.6% |
| All | 23 of 36 | +3.5% |

**Reading:**

- **Extreme fear is the most consistent result.** The year after it was usually up, and the
  median year gained about 16%. This is the contrarian pattern found by Brown & Cliff and
  Baker & Wurgler: pessimism has tended to be followed by recovery over a one-year horizon.
  The weak first month in the day-weighted table (−0.4%) comes from the long crashes of 1997
  and 2008. Year by year, the first month after extreme fear was also usually positive (20
  of 27 years).
- **Extreme greed is close to a coin toss.** Its strong day-weighted average comes from a
  few booms. By year, half were higher 12 months later and the median year was flat. So it
  has not been a reliable sell signal, but nor is it a reason to buy.
- **The pattern runs in order.** The share of years ending higher falls steadily from fear to
  greed, which is more convincing than any single band.
- **The sample is small.** Each band rests on 14–18 independent spells and 24–35 calendar
  years. A difference of a few percentage points between neighbouring bands is within what
  chance can produce.

## 6. How to read it, and how not to

- **Read it as context.** It tells you whether the market is broadly calm and trending, or
  damaged and volatile, compared with the last three years.
- **Watch the divergences.** In October 2026 the STI was 9% above its 200-day average, but
  only 6 of its 30 members were above theirs. The three big banks, which make up about half
  the index, were carrying it, and the mood read *Fear* despite the index sitting within 3%
  of its high. That is information you cannot see from the index line alone.
- **Do not trade it as a signal.** None of the out-of-sample tests found a reliable edge for
  next-month returns. The trend rule's main benefit was a smaller drawdown, not a higher
  return, and once trading costs, taxes and missed dividends are counted, even that has a
  price.
- **Do not read "Extreme greed" as "sell".** On this market's history, it was followed by
  gains about as often as losses.

## 7. Limitations

1. **Survivorship bias.** Breadth and highs/lows use today's 30 members. Before the 2008
   revamp, and for any company that later left the index, the members used were the
   survivors, which flatters breadth in past sell-offs.
2. **Price index only.** STI dividends of about 3–4% a year are excluded. This understates
   every holding-period return, and the cost of sitting in cash, by the same amount.
3. **Cash earns 0%** in the strategy tests. Singapore deposit and T-bill rates would add
   roughly 1–3% a year to time spent out of the market.
4. **No trading costs or taxes** are included.
5. **One market, one path.** About 38 years gives roughly 7 bear markets. Any rule can fit 7
   episodes. The evidence for trend rests mainly on the international literature; the STI
   tables show that it was *consistent* with that literature here, not that it is proven
   here.
6. **Yahoo data quality.** Unadjusted closes can carry splits and re-listings as Yahoo
   records them, and member histories start at different dates.

## 8. Reproducing and checking

```bash
pip install pandas numpy
python3 tools/backtest.py                # every table above
python3 tools/backtest.py --csv mood.csv # plus the daily mood series
```

The Python mood series matches `indicators.js` to within floating-point rounding on 9,682 of
9,688 days. On the remaining 6, two values that are equal in exact arithmetic compare
differently in the two languages, which moves the mood by at most 2.4 points.

## References

- Baker, M., & Wurgler, J. (2006). Investor sentiment and the cross-section of stock returns. *Journal of Finance*, 61(4).
- Brock, W., Lakonishok, J., & LeBaron, B. (1992). Simple technical trading rules and the stochastic properties of stock returns. *Journal of Finance*, 47(5).
- Brown, G., & Cliff, M. (2005). Investor sentiment and asset valuation. *Journal of Business*, 78(2).
- Campbell, J., & Thompson, S. (2008). Predicting excess stock returns out of sample: Can anything beat the historical average? *Review of Financial Studies*, 21(4).
- Faber, M. (2007). A quantitative approach to tactical asset allocation. *Journal of Wealth Management*, 9(4).
- George, T., & Hwang, C.-Y. (2004). The 52-week high and momentum investing. *Journal of Finance*, 59(5).
- Moskowitz, T., Ooi, Y. H., & Pedersen, L. H. (2012). Time series momentum. *Journal of Financial Economics*, 104(2).
- Neely, C., Rapach, D., Tu, J., & Zhou, G. (2014). Forecasting the equity risk premium: The role of technical indicators. *Management Science*, 60(7).
- Sullivan, R., Timmermann, A., & White, H. (1999). Data-snooping, technical trading rule performance, and the bootstrap. *Journal of Finance*, 54(5).

*Not investment advice.*
