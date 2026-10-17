/* Market mood and trend indicators for the STI dashboard.
   Pure computation on window.STI_DATA; no drawing. Loaded after data.js, before app.js.
   Every value on day t uses closes up to and including day t only (no look-ahead).
   Methodology and the evidence behind each choice: METHODOLOGY.md.
   tools/backtest.py computes the same numbers in Python; keep the two in step. */
(function () {
"use strict";
const SERIES = window.STI_DATA.series;
const IDX = SERIES["^STI"];
const N = IDX.d.length;

const TREND_MA = 200;        // days in the trend average (Brock, Lakonishok & LeBaron 1992; Faber 2007)
const YEAR = 252;            // trading days in a year: 52-week highs/lows and drawdown
const VOL_WIN = 21;          // one month of daily returns for realised volatility
const RANK_WIN = 756;        // components are ranked against their own last three years
const RANK_MIN = 252;        // ... once at least a year of history exists
const MIN_MEMBERS = 15;      // breadth needs at least half the index to mean anything
const HORIZONS = [21, 63, 126, 252];
const BANDS = [              // mood bands, low to high
  { lo: 0,  hi: 20,  key: "xfear",  label: "Extreme fear" },
  { lo: 20, hi: 40,  key: "fear",   label: "Fear" },
  { lo: 40, hi: 60,  key: "neutral", label: "Neutral" },
  { lo: 60, hi: 80,  key: "greed",  label: "Greed" },
  { lo: 80, hi: 101, key: "xgreed", label: "Extreme greed" },
];
const COMPONENTS = [
  { key: "trend",    label: "Trend",      what: "STI vs its 200-day average" },
  { key: "breadth",  label: "Breadth",    what: "Share of members above their own 200-day average" },
  { key: "highsLows", label: "Highs vs lows", what: "Members at 52-week highs minus those at 52-week lows" },
  { key: "drawdown", label: "Drawdown",   what: "STI distance below its 52-week high" },
  { key: "calm",     label: "Calm",       what: "One-month volatility, inverted (calm = high)" },
];

/* ---------- rolling helpers (NaN-aware, trailing windows) ---------- */
function sma(x, w) {
  const out = new Float64Array(x.length).fill(NaN);
  let sum = 0, n = 0;
  for (let i = 0; i < x.length; i++) {
    if (!isNaN(x[i])) { sum += x[i]; n++; }
    if (i >= w && !isNaN(x[i - w])) { sum -= x[i - w]; n--; }
    if (i >= w - 1 && n === w) out[i] = sum / w;
  }
  return out;
}
function rollMax(x, w, sign) {      // sign 1: max, -1: min; needs a full window with no gaps
  const out = new Float64Array(x.length).fill(NaN);
  const q = new Int32Array(x.length); let qh = 0, qt = 0, lastNaN = -1;   // monotonic deque of indices
  for (let i = 0; i < x.length; i++) {
    if (isNaN(x[i])) { lastNaN = i; qh = qt = 0; continue; }
    while (qt > qh && sign * x[q[qt - 1]] <= sign * x[i]) qt--;
    q[qt++] = i;
    if (q[qh] <= i - w) qh++;
    if (i - lastNaN >= w) out[i] = x[q[qh]];
  }
  return out;
}
function rollStd(x, w) {            // sample standard deviation, ddof 1
  const out = new Float64Array(x.length).fill(NaN);
  for (let i = w - 1; i < x.length; i++) {
    let s = 0, ok = true;
    for (let j = i - w + 1; j <= i; j++) { if (isNaN(x[j])) { ok = false; break; } s += x[j]; }
    if (!ok) continue;
    const m = s / w; let v = 0;
    for (let j = i - w + 1; j <= i; j++) v += (x[j] - m) ** 2;
    out[i] = Math.sqrt(v / (w - 1));
  }
  return out;
}
// Percentile of today's value among the non-missing values of the trailing window,
// ties shared (pandas rolling(...).rank(pct=True)).
function rollRank(x, w, minN) {
  const out = new Float64Array(x.length).fill(NaN);
  for (let i = 0; i < x.length; i++) {
    if (isNaN(x[i])) continue;
    let n = 0, less = 0, eq = 0;
    for (let j = Math.max(0, i - w + 1); j <= i; j++) {
      const v = x[j]; if (isNaN(v)) continue;
      n++; if (v < x[i]) less++; else if (v === x[i]) eq++;
    }
    if (n >= minN) out[i] = (less + (eq + 1) / 2) / n;
  }
  return out;
}

/* ---------- align each member to the index's trading days ---------- */
// carries a member's last close forward over at most 5 index days it did not trade
function aligned(sr) {
  const out = new Float64Array(N).fill(NaN);
  let j = 0, last = NaN, age = 99;
  for (let i = 0; i < N; i++) {
    while (j < sr.d.length && sr.d[j] < IDX.d[i]) j++;
    if (j < sr.d.length && sr.d[j] === IDX.d[i]) { last = sr.c[j]; age = 0; }
    else age++;
    out[i] = age <= 5 ? last : NaN;
  }
  return out;
}

/* ---------- the index's own series ---------- */
const px = Float64Array.from(IDX.c);
const ma = sma(px, TREND_MA);
const trendGap = px.map((v, i) => v / ma[i] - 1);
const hi52 = rollMax(px, YEAR, 1);
const drawdown = px.map((v, i) => v / hi52[i] - 1);
const ret = px.map((v, i) => (i ? v / px[i - 1] - 1 : NaN));
const vol = rollStd(ret, VOL_WIN).map(v => v * Math.sqrt(252));

/* ---------- breadth and new highs/lows across the members ---------- */
const breadth = new Float64Array(N).fill(NaN);
const highsLows = new Float64Array(N).fill(NaN);
{
  const avail = new Int32Array(N), above = new Int32Array(N), highs = new Int32Array(N), lows = new Int32Array(N);
  for (const [sym, sr] of Object.entries(SERIES)) {
    if (sym === "^STI") continue;
    const c = aligned(sr), m = sma(c, TREND_MA), h = rollMax(c, YEAR, 1), l = rollMax(c, YEAR, -1);
    for (let i = 0; i < N; i++) {
      if (isNaN(m[i])) continue;
      avail[i]++;
      if (c[i] >= m[i]) above[i]++;
      if (c[i] >= h[i]) highs[i]++;
      if (c[i] <= l[i]) lows[i]++;
    }
  }
  for (let i = 0; i < N; i++) if (avail[i] >= MIN_MEMBERS) {
    breadth[i] = above[i] / avail[i];
    highsLows[i] = (highs[i] - lows[i]) / avail[i];
  }
}

/* ---------- the mood composite ---------- */
const raw = { trend: trendGap, breadth, highsLows, drawdown, calm: vol };
const pct = {};
for (const c of COMPONENTS) {
  const r = rollRank(raw[c.key], RANK_WIN, RANK_MIN);
  pct[c.key] = c.key === "calm" ? r.map(v => 1 - v) : r;
}
const mood = new Float64Array(N).fill(NaN);
for (let i = 0; i < N; i++) {
  let s = 0, n = 0;
  for (const c of COMPONENTS) { const v = pct[c.key][i]; if (!isNaN(v)) { s += v; n++; } }
  if (n >= 3) mood[i] = s / n * 100;
}
const bandOf = v => BANDS.find(b => v >= b.lo && v < b.hi);

/* ---------- what followed: forward index returns by mood band ---------- */
// A band "episode" starts when the band is entered after at least ~6 months away from it.
function episodes(mask) {
  const out = []; let last = -Infinity;
  for (let i = 0; i < N; i++) if (mask(i)) {
    if (IDX.d[i] - last > 126 * 1.45) out.push(i);
    last = IDX.d[i];
  }
  return out;
}
function forwardStats(mask) {
  const res = { days: 0, h: {} };
  for (let i = 0; i < N; i++) if (mask(i)) res.days++;
  for (const h of HORIZONS) {
    let s = 0, up = 0, n = 0;
    for (let i = 0; i + h < N; i++) if (mask(i)) { const r = px[i + h] / px[i] - 1; s += r; if (r > 0) up++; n++; }
    res.h[h] = n ? { mean: s / n, up: up / n, n } : null;
  }
  // Consistency check: average the 12-month outcome within each calendar year first, so a
  // single long crash or boom cannot dominate, then count the years that ended higher.
  const byYear = new Map();
  for (let i = 0; i + 252 < N; i++) if (mask(i)) {
    const y = new Date(IDX.d[i] * 86400000).getUTCFullYear(), a = byYear.get(y) || [0, 0];
    a[0] += px[i + 252] / px[i] - 1; a[1]++; byYear.set(y, a);
  }
  const ym = [...byYear.values()].map(([s, n]) => s / n);
  res.years = { n: ym.length, up: ym.filter(v => v > 0).length };
  return res;
}
const hasMood = i => !isNaN(mood[i]);
const moodTable = BANDS.map(b => ({
  band: b,
  ...forwardStats(i => hasMood(i) && mood[i] >= b.lo && mood[i] < b.hi),
  episodes: episodes(i => hasMood(i) && mood[i] >= b.lo && mood[i] < b.hi).length,
}));
const moodAll = forwardStats(hasMood);

/* ---------- trend regime stats for any series (used per ticker) ---------- */
// Splits next-day returns by whether yesterday's close was above its 200-day average.
const regimeCache = {};
function trendRegime(sym) {
  if (regimeCache[sym]) return regimeCache[sym];
  const sr = SERIES[sym], c = Float64Array.from(sr.c), m = sma(c, TREND_MA);
  const acc = { up: [], down: [] };
  for (let i = 1; i < c.length; i++) {
    if (isNaN(m[i - 1])) continue;
    (c[i - 1] >= m[i - 1] ? acc.up : acc.down).push(c[i] / c[i - 1] - 1);
  }
  const summ = a => {
    if (a.length < 50) return null;
    const mu = a.reduce((x, y) => x + y, 0) / a.length;
    const sd = Math.sqrt(a.reduce((x, y) => x + (y - mu) ** 2, 0) / (a.length - 1));
    return { days: a.length, annRet: mu * 252, annVol: sd * Math.sqrt(252) };
  };
  return (regimeCache[sym] = { ma: m, up: summ(acc.up), down: summ(acc.down), since: sr.d[TREND_MA - 1] });
}

window.STI_IND = {
  d: IDX.d, mood, pct, raw, COMPONENTS, BANDS, HORIZONS, bandOf,
  moodTable, moodAll, trendRegime, TREND_MA,
  firstMoodDay: IDX.d[mood.findIndex(v => !isNaN(v))],
};
})();
