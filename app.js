/* STI dashboard: section 08 of the SG Household Money Guide.
   Loaded on demand by index.html after the data files (data.js, benchmarks.js,
   logos.js, earnings.js, profiles.js). Markup lives in index.html under #sti-app. */
(function () {
"use strict";
/* ---------------- data & config ---------------- */
const SERIES = window.STI_DATA.series;
const BENCH = (window.STI_BENCH || {}).series || {};
const BENCH_ORDER = [        // fixed color assignment — color follows the benchmark
  ["^GSPC", "--bm-gspc"], ["^IXIC", "--bm-ixic"], ["^HSI", "--bm-hsi"],
  ["^N225", "--bm-n225"], ["BTC-USD", "--bm-btc"], ["GC=F", "--bm-gold"],
];
const LOGOS = window.STI_LOGOS || {};
const EARN = window.STI_EARNINGS || {};
const PROFILES = window.STI_PROFILES || {};
document.getElementById("sti-genDate").textContent = "fetched " + window.STI_DATA.generated;

const CATS = {
  crisis:    { label: "Crisis",       cssVar: "--cat-crisis" },
  sg:        { label: "Singapore",    cssVar: "--cat-sg" },
  policy:    { label: "Policy",       cssVar: "--cat-policy" },
  milestone: { label: "Milestone",    cssVar: "--cat-milestone" },
  earnings:  { label: "Earnings",     cssVar: "--cat-earnings" },
};

const EVENTS = [
  { d: "1990-08-02", c: "crisis",    t: "Iraq invades Kuwait", b: "The Gulf crisis sends oil soaring and risk assets tumbling. The STI slides about 30% to 1,080 by October before Desert Storm clears the uncertainty." },
  { d: "1994-01-04", c: "milestone", t: "1994 bull-market peak: 2,472", b: "The emerging-market boom peaks days into the new year. US rate hikes and regional froth unwind the rally through 1994–95." },
  { d: "1995-02-27", c: "sg",        t: "Barings collapses in Singapore", b: "Nick Leeson's hidden SIMEX derivatives losses (£827m) sink Britain's oldest merchant bank. The STI barely flinches, but Singapore overhauls exchange oversight." },
  { d: "1997-07-02", c: "crisis",    t: "Asian Financial Crisis begins", b: "Thailand floats the baht and contagion sweeps Asian markets. The STI loses more than half its value over the following fourteen months." },
  { d: "1998-09-01", c: "sg",        t: "Malaysia capital controls; CLOB frozen", b: "Kuala Lumpur imposes capital controls. Malaysian shares held by some 170,000 Singapore investors through CLOB International are frozen overnight." },
  { d: "1998-09-04", c: "milestone", t: "Asian-crisis low: 805", b: "The STI bottoms at 805 — roughly 60% below its 1996 highs — then stages one of the sharpest recoveries in its history." },
  { d: "2000-01-03", c: "milestone", t: "Dot-com era peak: 2,583", b: "The index has more than tripled off the 1998 low as tech mania peaks. The global tech bust then grinds the STI down through 2001." },
  { d: "2001-09-11", c: "crisis",    t: "September 11 attacks", b: "Global markets sell off. With the tech bust already underway, the STI sinks toward 1,200 in the weeks that follow." },
  { d: "2002-10-14", c: "crisis",    t: "Bali bombings", b: "Terror strikes Southeast Asia's doorstep with the STI already pinned near five-year lows, deepening the region's tourism and confidence gloom." },
  { d: "2003-03-10", c: "crisis",    t: "SARS trough: 1,214", b: "Singapore is among the economies hit hardest by SARS. The STI bottoms two days before the WHO's global alert — and a five-year bull run begins." },
  { d: "2005-04-18", c: "sg",        t: "Integrated Resorts approved", b: "Parliament approves two casino Integrated Resorts at Marina Bay and Sentosa, kicking off a tourism, construction and property boom." },
  { d: "2007-02-27", c: "crisis",    t: "Shanghai surprise", b: "A 9% one-day plunge in Shanghai ripples through world markets; the STI sheds about 6% in two sessions — an early tremor of the froth." },
  { d: "2007-08-09", c: "crisis",    t: "Credit crunch begins", b: "BNP Paribas freezes three funds and interbank lending seizes up — the opening tremor of the Global Financial Crisis." },
  { d: "2007-10-11", c: "milestone", t: "Pre-crisis record: 3,876", b: "A five-year bull run powered by China, commodities and property peaks at 3,875.77 — a closing record that stands for over seventeen years, until January 2025." },
  { d: "2008-01-10", c: "policy",    t: "STI revamped to 30 stocks", b: "The index moves to FTSE methodology and is slimmed down to 30 constituents — the modern STI takes shape." },
  { d: "2008-09-15", c: "crisis",    t: "Lehman Brothers collapses", b: "The Global Financial Crisis turns systemic. The Minibonds saga hits Singapore retail investors, and the STI halves in six months." },
  { d: "2008-10-16", c: "sg",        t: "Deposits guaranteed", b: "Singapore guarantees all bank deposits (S$150b) to head off regional deposit flight — one of the steadying moves at the heart of the crisis." },
  { d: "2009-01-22", c: "sg",        t: "Resilience Package", b: "A S$20.5b Budget with the first-ever draw on past reserves; Jobs Credit subsidises wages to keep retrenchments down." },
  { d: "2009-03-09", c: "milestone", t: "GFC low: 1,457", b: "Down 62% from the 2007 peak. Coordinated global stimulus then ignites a rebound that roughly doubles the index within a year." },
  { d: "2010-04-27", c: "sg",        t: "Marina Bay Sands opens", b: "Both Integrated Resorts open in 2010 — Resorts World Sentosa in February, MBS in April — transforming tourism receipts and Genting Singapore's fortunes." },
  { d: "2011-03-11", c: "crisis",    t: "Tōhoku earthquake & Fukushima", b: "Japan's quake, tsunami and nuclear crisis jolt Asian supply chains and risk appetite." },
  { d: "2011-08-08", c: "crisis",    t: "US downgrade & euro crisis", b: "S&P strips the United States of its AAA rating amid the eurozone debt crisis. The STI drops about 20% over the quarter." },
  { d: "2012-07-26", c: "policy",    t: "'Whatever it takes'", b: "Draghi's pledge to save the euro ends the crisis tail risk. The global hunt for yield that follows lifts Singapore's REIT-heavy market." },
  { d: "2013-01-11", c: "sg",        t: "Seventh round of property cooling", b: "Hefty ABSD hikes hit developers and investment demand; the curbs on residential property stay in place for the rest of the decade." },
  { d: "2013-06-20", c: "policy",    t: "Taper tantrum", b: "The Fed signals the end of quantitative easing. Yield plays sell off hard — a warning shot for the REIT-heavy Singapore market." },
  { d: "2013-10-04", c: "sg",        t: "Penny stock crash", b: "Blumont, Asiasons and LionGold collapse, erasing about S$8 billion in days. The scandal weighs on SGX sentiment and volumes for years." },
  { d: "2014-11-27", c: "crisis",    t: "OPEC opens the taps", b: "OPEC declines to cut output and oil collapses. Keppel's and Sembcorp's rig order books — and the banks' oil & gas loans — sour through 2016." },
  { d: "2015-08-24", c: "crisis",    t: "China devaluation 'Black Monday'", b: "A surprise yuan devaluation triggers a global rout. With oil in freefall, the STI slides into a bear market through early 2016." },
  { d: "2016-01-21", c: "milestone", t: "Oil-crash bear low: 2,533", b: "The STI bottoms with Brent near US$27 a barrel, ending a 25% slide from the 2015 highs." },
  { d: "2016-06-24", c: "crisis",    t: "Brexit vote", b: "The UK votes to leave the EU. The STI dips with global markets but recovers within weeks." },
  { d: "2016-07-28", c: "sg",        t: "Swiber default", b: "Swiber's collapse marks the depth of the offshore & marine debt crisis hobbling Keppel, Sembcorp Marine and the local banks' oil & gas loan books." },
  { d: "2016-11-09", c: "policy",    t: "Trump elected; reflation trade", b: "Asia dips on the result, then steeper yield curves spark a global bank rally — a tailwind for the STI's heavyweight lenders." },
  { d: "2018-03-22", c: "crisis",    t: "US–China trade war begins", b: "Washington announces its first China-specific tariffs. Trade-dependent Singapore gives back its early-2018 gains over the year." },
  { d: "2018-07-06", c: "sg",        t: "Surprise ABSD hike", b: "Cooling measures announced the evening before send property developers slumping; the STI drops 2% on the day." },
  { d: "2020-01-23", c: "crisis",    t: "COVID-19 reaches Singapore", b: "Wuhan locks down and Singapore confirms its first case the same day. Within two months the STI loses a third of its value." },
  { d: "2020-03-23", c: "milestone", t: "COVID low: 2,233", b: "The pandemic trough — a 32% collapse in nine weeks — is followed by an uneven, two-year recovery." },
  { d: "2020-04-07", c: "sg",        t: "Circuit breaker begins", b: "Singapore enters its COVID lockdown. GDP shrinks a record 5.4% in 2020, and SIA launches a S$15 billion rescue rights issue." },
  { d: "2020-11-09", c: "milestone", t: "Vaccine Monday", b: "Pfizer/BioNTech's 90% efficacy result turns the market. Reopening plays surge and the STI jumps over 5% in three sessions — the start of the recovery leg." },
  { d: "2022-02-24", c: "crisis",    t: "Russia invades Ukraine", b: "The STI drops 3.4% on the day. Commodity prices spike, cushioning Singapore's agri and energy-linked names in the weeks that follow." },
  { d: "2022-03-16", c: "policy",    t: "Fed's fastest hiking cycle", b: "The Fed begins its steepest rate rises in decades. Net interest margins swell at DBS, OCBC and UOB — together roughly half the STI's weight." },
  { d: "2023-03-10", c: "crisis",    t: "SVB & Credit Suisse stress", b: "US regional-bank failures and the Credit Suisse rescue rattle global financials. Singapore's banks prove resilient." },
  { d: "2023-10-23", c: "milestone", t: "'Higher for longer' low: 3,053", b: "The post-COVID rate scare troughs as 10-year Treasury yields touch 5% — the launchpad for the 2024–26 rally." },
  { d: "2024-08-05", c: "crisis",    t: "Yen carry-trade unwind", b: "A violent unwind of yen-funded trades hits Asia. The Nikkei has its worst day since 1987; the STI falls 4.1%." },
  { d: "2025-02-21", c: "policy",    t: "MAS S$5b market revival plan", b: "The MAS-led review group unveils a S$5 billion Equity Market Development Programme plus tax incentives to revitalise the Singapore market." },
  { d: "2025-04-07", c: "crisis",    t: "'Liberation Day' tariff crash", b: "Sweeping US tariffs trigger the STI's worst one-day fall since 2008: −7.5%. A 90-day tariff pause two days later sparks a V-shaped rebound." },
  { d: "2025-07-02", c: "milestone", t: "STI crosses 4,000", b: "The index closes above 4,000 for the first time, lifted by bank earnings, MAS market reforms and returning fund inflows." },
];
const dayOf = iso => Math.round(Date.parse(iso + "T00:00:00Z") / 86400000);
EVENTS.forEach(e => e.day = dayOf(e.d));

const evCache = {};
function ALL() {
  const k = state.ticker;
  if (!evCache[k]) {
    const earn = (EARN[k] || []).map(([day, est, act, sur]) => {
      let title, blurb;
      if (act != null && est != null) {
        const beat = act >= est;
        title = "Earnings " + (beat ? "\u25b2 beat estimates" : "\u25bc missed estimates");
        blurb = `Reported EPS ${act} vs ${est} consensus` + (sur != null ? ` \u2014 ${sur >= 0 ? "+" : ""}${sur.toFixed(1)}% surprise.` : ".");
      } else if (act != null) {
        title = "Earnings released"; blurb = `Reported EPS ${act}; no consensus estimate recorded.`;
      } else {
        title = "Earnings released"; blurb = "No EPS figures recorded for this release.";
      }
      return { day, c: "earnings", t: title, b: blurb };
    });
    evCache[k] = EVENTS.concat(earn).sort((a, b) => a.day - b.day);
  }
  return evCache[k];
}

const GROUPS = [
  ["Index", ["^STI"]],
  ["Banks & exchange", ["D05.SI", "O39.SI", "U11.SI", "S68.SI"]],
  ["Telco & tech", ["Z74.SI", "V03.SI"]],
  ["Industrials & transport", ["S63.SI", "C6L.SI", "U96.SI", "BN4.SI", "5E2.SI", "BS6.SI", "S58.SI", "C52.SI"]],
  ["Consumer & conglomerates", ["F34.SI", "Y92.SI", "G13.SI", "D01.SI", "J36.SI", "C07.SI"]],
  ["Property", ["H78.SI", "9CI.SI", "C09.SI", "U14.SI"]],
  ["REITs", ["C38U.SI", "A17U.SI", "M44U.SI", "ME8U.SI", "N2IU.SI", "J69U.SI"]],
];

/* ---------------- state ---------------- */
const state = {
  ticker: "^STI",
  t0: 0, t1: 0,           // view range, epoch days
  log: false,
  bench: new Set(),        // active comparison benchmarks
  cats: new Set(Object.keys(CATS)),
  sel: -1,                 // selected event index
  preset: "1Y",
};

/* ---------------- helpers ---------------- */
const $ = id => document.getElementById(id);
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const cur = () => SERIES[state.ticker];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function dstr(day, long) {
  const dt = new Date(day * 86400000);
  return long ? `${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`
              : `${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
}
const fmtP = (v, dp) => v.toLocaleString("en-SG", { minimumFractionDigits: dp, maximumFractionDigits: dp });
const priceDp = v => (v >= 100 ? 0 : v >= 10 ? 2 : 3);
const fmtPct = v => (v >= 0 ? "+" : "") + (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1)) + "%";
function lowerBound(arr, x) { let lo = 0, hi = arr.length; while (lo < hi) { const m = (lo + hi) >> 1; arr[m] < x ? lo = m + 1 : hi = m; } return lo; }
function nearestIdx(s, day) {
  const i = lowerBound(s.d, day);
  if (i <= 0) return 0;
  if (i >= s.d.length) return s.d.length - 1;
  return (day - s.d[i - 1] <= s.d[i] - day) ? i - 1 : i;
}
function closeAt(s, day) { return s.c[nearestIdx(s, day)]; }
const extent = s => [s.d[0], s.d[s.d.length - 1]];

/* ---------------- canvases ---------------- */
const wrap = $("sti-chartWrap"), base = $("sti-base"), overlay = $("sti-overlay");
const ovWrap = $("sti-ovWrap"), ovCanvas = $("sti-ovCanvas");
const PAD = { l: 52, r: 14, t: 28, b: 26 };
let W = 0, H = 0, OW = 0, OH = 0;

function sizeCanvases() {
  const dpr = window.devicePixelRatio || 1;
  W = wrap.clientWidth; H = wrap.clientHeight;
  for (const c of [base, overlay]) { c.width = W * dpr; c.height = H * dpr; c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0); }
  OW = ovWrap.clientWidth; OH = ovWrap.clientHeight;
  ovCanvas.width = OW * dpr; ovCanvas.height = OH * dpr;
  ovCanvas.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
}

const xPx = day => PAD.l + (day - state.t0) / (state.t1 - state.t0) * (W - PAD.l - PAD.r);
const pxDay = px => state.t0 + (px - PAD.l) / (W - PAD.l - PAD.r) * (state.t1 - state.t0);
let yLo = 0, yHi = 1;
let logNow = false;            // log scale actually in effect (off while comparing)
let curComps = [];             // active benchmarks with view-start bases, set by renderMain
let mainBase = 1;
const cmpOn = () => state.bench.size > 0;
function yPx(v) {
  const a = logNow ? Math.log10(yLo) : yLo, b = logNow ? Math.log10(yHi) : yHi;
  const t = ((logNow ? Math.log10(v) : v) - a) / (b - a);
  return H - PAD.b - t * (H - PAD.t - PAD.b);
}

function viewSlice() {
  const s = cur();
  let i0 = lowerBound(s.d, state.t0), i1 = lowerBound(s.d, state.t1 + 1);
  i0 = Math.max(0, i0 - 1); i1 = Math.min(s.d.length, i1 + 1);
  return [i0, i1];
}

function niceTicksLinear(lo, hi, n) {
  const span = hi - lo, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const step = [1, 2, 5, 10].map(m => m * mag).find(s => span / s <= n) || 10 * mag;
  const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(v);
  return out;
}
function ticksLog(lo, hi) {
  const out = [];
  for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++)
    for (const m of [1, 2, 5]) { const v = m * Math.pow(10, e); if (v >= lo && v <= hi) out.push(v); }
  return out.length >= 3 ? out : niceTicksLinear(lo, hi, 5);
}
function xTicks() {
  const maxN = Math.max(3, Math.floor((W - PAD.l - PAD.r) / 64));   // labels the width can fit
  const spanD = state.t1 - state.t0;
  if (spanD <= 45) {                    // day-level ticks for 1W / 1M views
    const all = [];
    for (let day = Math.ceil(state.t0); day <= state.t1; day++) {
      const dt = new Date(day * 86400000);
      if (spanD > 10 && dt.getUTCDay() !== 1) continue;   // Mondays
      all.push({ day, label: dt.getUTCDate() + " " + MONTHS[dt.getUTCMonth()] });
    }
    const k = Math.ceil(all.length / maxN);
    return all.filter((_, i) => i % k === 0);
  }
  const totalM = spanD / 30.44;
  const stepM = [1, 2, 3, 6, 12, 24, 60, 120].find(s => totalM / s <= maxN) || 240;
  const d0 = new Date(state.t0 * 86400000);
  let m = Math.ceil((d0.getUTCFullYear() * 12 + d0.getUTCMonth()) / stepM) * stepM;
  const out = [];
  while (true) {
    const y = Math.floor(m / 12), mo = m % 12;
    const day = Date.UTC(y, mo, 1) / 86400000;
    if (day > state.t1) break;
    out.push({ day, label: stepM >= 12 ? String(y) : MONTHS[mo] + " '" + String(y).slice(2) });
    m += stepM;
  }
  return out;
}

function visibleEvents() {
  const s = cur(), [lo] = extent(s);
  return ALL().map((e, i) => ({ ...e, i }))
    .filter(e => state.cats.has(e.c) && e.day >= lo);
}

/* ---------------- main render ---------------- */
// % change vs the close at view start, the shared scale of compare mode
const reb = (v, base) => (v / base - 1) * 100;
function baseAt(sr) {
  return sr.c[Math.min(lowerBound(sr.d, state.t0), sr.c.length - 1)];
}
function benchSlice(sr) {
  let j0 = lowerBound(sr.d, state.t0), j1 = lowerBound(sr.d, state.t1 + 1);
  j0 = Math.max(0, j0 - 1); j1 = Math.min(sr.d.length, j1 + 1);
  return [j0, j1];
}
// per-pixel min/max decimation shared by the main line and benchmark lines
function linePts(sr, j0, j1, toV) {
  const plotW = W - PAD.l - PAD.r, pts = [];
  if (j1 - j0 > plotW * 2) {
    let px = -1, mn = 0, mx = 0, mnI = 0, mxI = 0;
    for (let i = j0; i < j1; i++) {
      const v = toV(sr.c[i]), p = Math.round(xPx(sr.d[i]));
      if (p !== px) {
        if (px >= 0) { if (mnI <= mxI) { pts.push([px, mn]); if (mxI !== mnI) pts.push([px, mx]); } else { pts.push([px, mx]); pts.push([px, mn]); } }
        px = p; mn = mx = v; mnI = mxI = i;
      } else { if (v < mn) { mn = v; mnI = i; } if (v > mx) { mx = v; mxI = i; } }
    }
    if (px >= 0) pts.push([px, mn]);
  } else {
    for (let i = j0; i < j1; i++) pts.push([xPx(sr.d[i]), toV(sr.c[i])]);
  }
  return pts;
}

function renderMain() {
  const ctx = base.getContext("2d");
  ctx.clearRect(0, 0, W, H);
  const s = cur(), [i0, i1] = viewSlice();
  if (i1 - i0 < 2) return;

  const cmp = cmpOn();
  logNow = state.log && !cmp;
  mainBase = baseAt(s);
  curComps = !cmp ? [] : BENCH_ORDER
    .filter(([sym]) => state.bench.has(sym) && BENCH[sym])
    .map(([sym, cssVar]) => {
      const sr = BENCH[sym], [j0, j1] = benchSlice(sr);
      return { sym, sr, cssVar, j0, j1, base: baseAt(sr) };
    })
    .filter(cp => cp.j1 - cp.j0 >= 2);

  let lo = Infinity, hi = -Infinity;
  const toMain = v => cmp ? reb(v, mainBase) : v;
  for (let i = i0; i < i1; i++) { const v = toMain(s.c[i]); if (v < lo) lo = v; if (v > hi) hi = v; }
  for (const cp of curComps)
    for (let i = cp.j0; i < cp.j1; i++) { const v = reb(cp.sr.c[i], cp.base); if (v < lo) lo = v; if (v > hi) hi = v; }
  const padF = logNow ? 1.06 : (hi - lo) * 0.07 || Math.abs(lo) * 0.05 || 1;
  yLo = logNow ? lo / padF : cmp ? lo - padF : Math.max(0, lo - padF);
  yHi = logNow ? hi * padF : hi + padF;

  // grid + y labels
  ctx.font = "11px Inter, system-ui, sans-serif";
  const yt = logNow ? ticksLog(yLo, yHi) : niceTicksLinear(yLo, yHi, 6);
  ctx.strokeStyle = css("--grid"); ctx.fillStyle = css("--muted"); ctx.lineWidth = 1;
  const fmtTick = v => cmp
    ? (v > 0 ? "+" : "") + (Math.abs(v) >= 1000 ? Math.round(v / 100) / 10 + "k" : +v.toFixed(1)) + "%"
    : v >= 1000 ? (v / 1000) + "k" : String(+v.toFixed(2));
  for (const v of yt) {
    const y = Math.round(yPx(v)) + 0.5;
    ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(W - PAD.r, y); ctx.stroke();
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    ctx.fillText(fmtTick(v), PAD.l - 7, y);
  }
  if (cmp && yLo < 0 && yHi > 0) {           // emphasized zero line
    const y = Math.round(yPx(0)) + 0.5;
    ctx.strokeStyle = css("--baseline");
    ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(W - PAD.r, y); ctx.stroke();
  }
  // x labels + baseline
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  for (const t of xTicks()) ctx.fillText(t.label, xPx(t.day), H - PAD.b + 7);
  ctx.strokeStyle = css("--baseline");
  ctx.beginPath(); ctx.moveTo(PAD.l, H - PAD.b + 0.5); ctx.lineTo(W - PAD.r, H - PAD.b + 0.5); ctx.stroke();

  // series lines (benchmarks under the main line)
  const plotW = W - PAD.l - PAD.r;
  const seriesCol = css("--series-1");
  const pts = linePts(s, i0, i1, toMain);
  ctx.save();
  ctx.beginPath(); ctx.rect(PAD.l, PAD.t, plotW, H - PAD.t - PAD.b); ctx.clip();
  const ends = [];                              // [{name, col, y}] for direct end labels
  for (const cp of curComps) {
    const cpts = linePts(cp.sr, cp.j0, cp.j1, v => reb(v, cp.base));
    const col = css(cp.cssVar);
    ctx.beginPath();
    cpts.forEach(([x, v], k) => k ? ctx.lineTo(x, yPx(v)) : ctx.moveTo(x, yPx(v)));
    ctx.strokeStyle = col; ctx.lineWidth = 1.75; ctx.lineJoin = "round"; ctx.stroke();
    ends.push({ name: cp.sr.name, col, y: yPx(cpts[cpts.length - 1][1]) });
  }
  ctx.beginPath();
  pts.forEach(([x, v], k) => k ? ctx.lineTo(x, yPx(v)) : ctx.moveTo(x, yPx(v)));
  ctx.strokeStyle = seriesCol; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.stroke();
  if (!cmp) {
    const grad = ctx.createLinearGradient(0, PAD.t, 0, H - PAD.b);
    grad.addColorStop(0, seriesCol + "2e"); grad.addColorStop(1, seriesCol + "00");
    ctx.lineTo(pts[pts.length - 1][0], H - PAD.b); ctx.lineTo(pts[0][0], H - PAD.b); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
  } else {
    // direct end labels, nudged apart when they collide
    ends.push({ name: state.ticker === "^STI" ? "STI" : state.ticker.replace(".SI", ""), col: seriesCol, y: yPx(pts[pts.length - 1][1]) });
    ends.sort((a, b) => a.y - b.y);
    for (let k = 1; k < ends.length; k++) ends[k].y = Math.max(ends[k].y, ends[k - 1].y + 13);
    for (let k = ends.length - 1; k >= 0; k--) {
      ends[k].y = Math.min(ends[k].y, H - PAD.b - 6 - (ends.length - 1 - k) * 13);
      if (k < ends.length - 1) ends[k].y = Math.min(ends[k].y, ends[k + 1].y - 13);
    }
    ctx.font = "600 10.5px Inter, system-ui, sans-serif";
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for (const e of ends) {
      const y = Math.max(PAD.t + 6, e.y);
      ctx.lineWidth = 3; ctx.strokeStyle = css("--surface-1");
      ctx.strokeText(e.name, W - PAD.r - 3, y);
      ctx.fillStyle = e.col; ctx.fillText(e.name, W - PAD.r - 3, y);
    }
  }
  ctx.restore();

  // event markers: dot on the price line; callout box + leader when there is room
  const surface = css("--surface-1"), ink = css("--ink-1");
  evMarkers.length = 0;
  const evs = visibleEvents().filter(e => e.day >= state.t0 && e.day <= state.t1);
  const labelMode = evs.length <= 8;
  const rows = [[], [], []];                      // occupied x-spans per stacking level
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); };
  ctx.font = "11px Inter, system-ui, sans-serif";
  for (const e of evs) {
    const x = xPx(e.day), y = yPx(toMain(s.c[nearestIdx(s, e.day)]));
    const col = css(CATS[e.c].cssVar), isSel = e.i === state.sel;
    const m = { i: e.i, x, y, box: null };
    if (isSel) {                                  // selected: faint full-height hairline
      ctx.strokeStyle = col; ctx.globalAlpha = 0.35; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, PAD.t); ctx.lineTo(Math.round(x) + 0.5, H - PAD.b); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (labelMode || isSel) {
      const label = e.t.length > 28 ? e.t.slice(0, 27) + "\u2026" : e.t;
      const bw = ctx.measureText(label).width + 16, bh = 20;
      const bx = Math.max(PAD.l + 2, Math.min(x - bw / 2, W - PAD.r - bw - 2));
      let lvl = 0;
      while (lvl < 3 && !rows[lvl].every(([a, b]) => bx > b + 6 || bx + bw < a - 6)) lvl++;
      if (lvl < 3 || isSel) {                     // no free level and not selected -> dot only
        if (lvl >= 3) lvl = 2;
        rows[lvl].push([bx, bx + bw]);
        const above = y - 38 - lvl * 26 >= PAD.t;
        const by = above ? y - 38 - lvl * 26 : Math.min(y + 16 + lvl * 26, H - PAD.b - bh - 2);
        ctx.strokeStyle = col; ctx.globalAlpha = 0.7; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, above ? y - 6 : y + 6);
        ctx.lineTo(Math.round(x) + 0.5, above ? by + bh : by);
        ctx.stroke(); ctx.globalAlpha = 1;
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.14)"; ctx.shadowBlur = 5; ctx.shadowOffsetY = 1;
        rr(bx, by, bw, bh, 5); ctx.fillStyle = surface; ctx.fill();
        ctx.restore();
        rr(bx, by, bw, bh, 5); ctx.strokeStyle = col; ctx.lineWidth = isSel ? 1.8 : 1.2; ctx.stroke();
        ctx.fillStyle = ink; ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText(label, bx + 8, by + bh / 2 + 0.5);
        m.box = { x: bx, y: by, w: bw, h: bh };
      }
    }
    const quiet = !labelMode && e.c === "earnings" && !isSel;   // dense view: earnings recede
    ctx.beginPath(); ctx.arc(x, y, isSel ? 6 : quiet ? 2.5 : 4.5, 0, Math.PI * 2);
    ctx.fillStyle = col; ctx.globalAlpha = quiet ? 0.6 : 1; ctx.fill(); ctx.globalAlpha = 1;
    if (!quiet) { ctx.lineWidth = 2; ctx.strokeStyle = surface; ctx.stroke(); }
    evMarkers.push(m);
  }
  $("sti-rangeLabel").textContent = dstr(state.t0, true) + " — " + dstr(state.t1, true);
}

/* ---------------- overview render ---------------- */
function renderOverview() {
  const ctx = ovCanvas.getContext("2d");
  ctx.clearRect(0, 0, OW, OH);
  const s = cur(), [lo0, hi0] = extent(s);
  let lo = Infinity, hi = -Infinity;
  for (const v of s.c) { if (v < lo) lo = v; if (v > hi) hi = v; }
  const ox = day => (day - lo0) / (hi0 - lo0) * OW;
  const oy = v => OH - 4 - (v - lo) / (hi - lo) * (OH - 10);
  ctx.beginPath();
  const stride = Math.max(1, Math.floor(s.d.length / OW / 2));
  for (let i = 0; i < s.d.length; i += stride) { const x = ox(s.d[i]), y = oy(s.c[i]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.strokeStyle = css("--muted"); ctx.lineWidth = 1; ctx.stroke();
  // brush window
  const bx0 = ox(state.t0), bx1 = ox(state.t1);
  ctx.fillStyle = css("--series-1") + "22"; ctx.fillRect(bx0, 0, bx1 - bx0, OH);
  ctx.strokeStyle = css("--series-1"); ctx.lineWidth = 1.5;
  ctx.strokeRect(bx0 + 0.75, 0.75, bx1 - bx0 - 1.5, OH - 1.5);
}

/* ---------------- overlay: crosshair + tooltip ---------------- */
const tooltip = $("sti-tooltip");
const evMarkers = [];
function clearOverlay() { overlay.getContext("2d").clearRect(0, 0, W, H); tooltip.style.display = "none"; }
function hoveredEvent(mx, my) {
  let best = null, bestD = 11;                    // generous hit radius around the dot
  for (const m of evMarkers) {
    if (m.box && mx >= m.box.x && mx <= m.box.x + m.box.w && my >= m.box.y && my <= m.box.y + m.box.h)
      return { ...ALL()[m.i], i: m.i };
    const d = Math.hypot(m.x - mx, m.y - my);
    if (d < bestD) { best = { ...ALL()[m.i], i: m.i }; bestD = d; }
  }
  return best;
}
function drawOverlay(mx, my) {
  const ctx = overlay.getContext("2d");
  ctx.clearRect(0, 0, W, H);
  if (mx < PAD.l || mx > W - PAD.r) { tooltip.style.display = "none"; return; }
  const s = cur(), day = pxDay(mx), idx = nearestIdx(s, day);
  const cmp = cmpOn();
  const sx = xPx(s.d[idx]), sy = yPx(cmp ? reb(s.c[idx], mainBase) : s.c[idx]);
  ctx.strokeStyle = css("--baseline"); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(Math.round(sx) + 0.5, PAD.t); ctx.lineTo(Math.round(sx) + 0.5, H - PAD.b); ctx.stroke();
  const hov = [];                     // benchmark values at the hovered day
  for (const cp of curComps) {
    if (day < cp.sr.d[0] - 3) continue;               // series not born yet
    const j = nearestIdx(cp.sr, day);
    const pct = reb(cp.sr.c[j], cp.base);
    hov.push({ name: cp.sr.name, cssVar: cp.cssVar, pct });
    ctx.beginPath(); ctx.arc(xPx(cp.sr.d[j]), yPx(pct), 4, 0, Math.PI * 2);
    ctx.fillStyle = css(cp.cssVar); ctx.fill();
    ctx.strokeStyle = css("--surface-1"); ctx.lineWidth = 2; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = css("--series-1"); ctx.fill();
  ctx.strokeStyle = css("--surface-1"); ctx.lineWidth = 2; ctx.stroke();

  // tooltip content (textContent only — no innerHTML with data)
  tooltip.textContent = "";
  const add = (cls, txt) => { const el = document.createElement("div"); el.className = cls; el.textContent = txt; tooltip.appendChild(el); return el; };
  add("d", dstr(s.d[idx], true));
  add("p", fmtP(s.c[idx], priceDp(s.c[idx])));
  const first = s.c[Math.min(lowerBound(s.d, state.t0), s.c.length - 1)];
  add("r", fmtPct((s.c[idx] / first - 1) * 100) + " over shown range");
  for (const h of hov) {
    const row = document.createElement("div"); row.className = "ev";
    row.style.setProperty("--c", css(h.cssVar));
    const key = document.createElement("span"); key.className = "key";
    const span = document.createElement("span"); span.textContent = h.name + " " + fmtPct(h.pct);
    row.append(key, span); tooltip.appendChild(row);
  }
  const ev = hoveredEvent(mx, my);
  if (ev) {
    const row = document.createElement("div"); row.className = "ev";
    row.style.setProperty("--c", css(CATS[ev.c].cssVar));
    const key = document.createElement("span"); key.className = "key";
    const span = document.createElement("span"); span.textContent = ev.t;
    row.append(key, span); tooltip.appendChild(row);
    wrap.style.cursor = "pointer";
  } else wrap.style.cursor = "crosshair";

  tooltip.style.display = "block";
  const tw = tooltip.offsetWidth;
  tooltip.style.left = Math.min(Math.max(6, sx + (sx > W - tw - 40 ? -tw - 14 : 14)), W - tw - 6) + "px";
  tooltip.style.top = Math.max(6, Math.min(my - 20, H - tooltip.offsetHeight - 10)) + "px";
}

/* ---------------- view changes ---------------- */
function clampView() {
  const [lo, hi] = extent(cur());
  const span = Math.max(6, Math.min(state.t1 - state.t0, hi - lo));
  state.t0 = Math.max(lo, Math.min(state.t0, hi - span));
  state.t1 = state.t0 + span;
}
function setView(t0, t1, keepSel) {
  state.t0 = t0; state.t1 = t1; clampView();
  if (!keepSel) state.preset = "";
  renderMain(); renderOverview(); clearOverlay(); refreshChrome();
}
function applyPreset(name) {
  const [lo, hi] = extent(cur());
  const days = { "1W": 7, "1M": 30.44, "3M": 91.3, "1Y": 365.25, "5Y": 1826.25 }[name];
  state.preset = name;
  setView(days ? hi - days : lo, hi, true);
}

/* ---------------- chrome: tiles, sidebar, events, table ---------------- */
function refreshChrome() {
  // range preset buttons
  for (const b of $("sti-ranges").children) b.setAttribute("aria-pressed", String(b.textContent === state.preset));
  // tiles
  const s = cur(), n = s.c.length, last = s.c[n - 1], prev = s.c[n - 2] || last;
  let athV = -Infinity, athI = 0;
  for (let i = 0; i < n; i++) if (s.c[i] > athV) { athV = s.c[i]; athI = i; }
  const v0 = Math.min(lowerBound(s.d, state.t0), n - 1);
  const v1 = Math.min(lowerBound(s.d, state.t1 + 1), n) - 1;
  const viewChg = v1 > v0 ? (s.c[v1] / s.c[v0] - 1) * 100 : 0;
  const dayChg = (last / prev - 1) * 100;
  const prof = PROFILES[state.ticker] || {};
  const sign = prof.cur === "USD" ? "US$" : "S$";
  const isoStr = iso => { const [y, m, d] = iso.split("-").map(Number); return d + " " + MONTHS[m - 1] + " " + y; };
  const todayISO = new Date().toISOString().slice(0, 10);
  let divSub;
  if (prof.ldiv) {
    divSub = "Last " + sign + prof.ldiv + " · " + isoStr(prof.ldivd);
    if (prof.ndivd && prof.ndivd > todayISO) divSub += " · next " + isoStr(prof.ndivd);
  } else divSub = state.ticker === "^STI" ? "cap-weighted, 30 constituents" : "no recent payouts";
  const tiles = [
    ["Last close", fmtP(last, priceDp(last)), fmtPct(dayChg) + " on the day", dayChg],
    ["Shown range", fmtPct(viewChg), dstr(state.t0) + " — " + dstr(state.t1), viewChg],
    ["All-time high", fmtP(athV, priceDp(athV)), dstr(s.d[athI], true), null],
    ["Valuation", [["P/E", prof.pe ? prof.pe.toFixed(1) : "—"], ["P/B", prof.pb ? prof.pb.toFixed(2) : "—"]],
      state.ticker === "^STI" ? "cap-weighted, 30 constituents" : "", null],
    ["Dividend yield", prof.dy != null ? prof.dy.toFixed(2) + "%" : "—", divSub, null],
  ];
  const tl = $("sti-tiles"); tl.textContent = "";
  {   // company profile tile, leftmost
    const pt = document.createElement("div"); pt.className = "tile profile";
    const ph = document.createElement("div"); ph.className = "ph";
    const pn = document.createElement("span"); pn.className = "pn"; pn.textContent = s.name;
    ph.append(logoEl(state.ticker), pn);
    const pb = document.createElement("div"); pb.className = "pb";
    pb.textContent = prof.blurb || "";
    const pm = document.createElement("div"); pm.className = "pm";
    if (prof.mcap) {
      const sign = prof.cur === "USD" ? "US$" : "S$";
      pm.textContent = "Market cap " + sign + (prof.mcap / 1e9).toFixed(1) + "b" +
        (state.ticker === "^STI" ? " (combined)" : "");
    }
    pt.append(ph, pb, pm); tl.appendChild(pt);
  }
  for (const [k, v, sub, delta] of tiles) {
    const t = document.createElement("div"); t.className = "tile";
    const ke = document.createElement("div"); ke.className = "k"; ke.textContent = k;
    t.appendChild(ke);
    if (Array.isArray(v)) {          // stacked label+value rows (valuation tile)
      for (const [rl, rv] of v) {
        const row = document.createElement("div"); row.className = "vr";
        const le = document.createElement("span"); le.className = "vl"; le.textContent = rl;
        const ve = document.createElement("span"); ve.className = "vv"; ve.textContent = rv;
        row.append(le, ve); t.appendChild(row);
      }
    } else {
      const ve = document.createElement("div"); ve.className = "v"; ve.textContent = v;
      if (delta !== null) ve.classList.add(delta >= 0 ? "pos" : "neg");
      t.appendChild(ve);
    }
    if (sub) {
      const se = document.createElement("div"); se.className = "s"; se.textContent = sub;
      t.appendChild(se);
    }
    tl.appendChild(t);
  }
  // sidebar % over current view
  document.querySelectorAll("#sti-app .tk").forEach(btn => {
    const sym = btn.dataset.sym, sr = SERIES[sym];
    const j0 = Math.min(lowerBound(sr.d, state.t0), sr.d.length - 1);
    const j1 = Math.min(lowerBound(sr.d, state.t1 + 1), sr.d.length) - 1;
    const pc = btn.querySelector(".pc");
    if (j1 > j0) {
      const chg = (sr.c[j1] / sr.c[j0] - 1) * 100;
      pc.textContent = fmtPct(chg);
      pc.className = "pc " + (chg >= 0 ? "pos" : "neg");
    } else pc.textContent = "—";
    btn.setAttribute("aria-current", String(sym === state.ticker));
  });
  refreshEventList();
  buildYearTable();
}

function refreshEventList() {
  const list = $("sti-evList"); list.textContent = ""; list.scrollTop = 0;
  const evs = visibleEvents().filter(e => e.day >= state.t0 && e.day <= state.t1);
  for (const e of evs) {
    const card = document.createElement("button");
    card.type = "button"; card.className = "ev-card";
    card.style.setProperty("--c", css(CATS[e.c].cssVar));
    if (e.i === state.sel) card.classList.add("sel");
    const dt = document.createElement("div"); dt.className = "dt";
    dt.textContent = dstr(e.day, true) + " · " + CATS[e.c].label;
    const tt = document.createElement("div"); tt.className = "tt"; tt.textContent = e.t;
    const bb = document.createElement("div"); bb.className = "bb"; bb.textContent = e.b;
    card.append(dt, tt, bb);
    card.addEventListener("click", () => selectEvent(e.i, true));
    list.appendChild(card);
  }
  $("sti-evCount").textContent = `· ${evs.length} in the shown window`;
  if (!evs.length) {
    const empty = document.createElement("div");
    empty.className = "hint"; empty.style.padding = "6px 2px";
    empty.textContent = "No events in this window — zoom out or pick a longer range." +
      (state.cats.has("earnings") && !(EARN[state.ticker] || []).length
        ? " Earnings flags appear when a company is selected in the sidebar." : "");
    list.appendChild(empty);
  }
  // detail strip
  const det = $("sti-evDetail");
  if (state.sel >= 0 && state.cats.has(ALL()[state.sel].c)) {
    const e = ALL()[state.sel];
    det.style.display = "block";
    det.style.setProperty("--c", css(CATS[e.c].cssVar));
    det.querySelector(".dt").textContent = dstr(e.day, true) + " · " + CATS[e.c].label +
      " · " + cur().name + " at " + fmtP(closeAt(cur(), e.day), priceDp(closeAt(cur(), e.day)));
    det.querySelector(".tt").textContent = e.t;
    det.querySelector(".bb").textContent = e.b;
  } else det.style.display = "none";
}

function selectEvent(i, zoom) {
  state.sel = (state.sel === i && !zoom) ? -1 : i;
  if (zoom && state.sel >= 0) {
    const e = ALL()[i], half = Math.max(240, (state.t1 - state.t0) / 2 > 3000 ? 540 : 300);
    setView(e.day - half, e.day + half);
  } else { renderMain(); refreshChrome(); }
}

function buildYearTable() {
  const s = cur(), tbl = $("sti-yearTable"); tbl.textContent = "";
  const head = tbl.insertRow();
  for (const h of ["Year", "Close", "Change"]) { const th = document.createElement("th"); th.textContent = h; head.appendChild(th); }
  let prevClose = null, lastYear = -1;
  const rows = [];
  for (let i = 0; i < s.d.length; i++) {
    const y = new Date(s.d[i] * 86400000).getUTCFullYear();
    if (y !== lastYear) { rows.push([y, s.c[i]]); lastYear = y; }
    rows[rows.length - 1][1] = s.c[i];
  }
  const out = rows.map(([y, close]) => {
    const chg = prevClose !== null ? (close / prevClose - 1) * 100 : null;
    prevClose = close;
    return [y, close, chg];
  });
  for (const [y, close, chg] of out.reverse()) {   // latest year first
    const tr = tbl.insertRow();
    tr.insertCell().textContent = y;
    tr.insertCell().textContent = fmtP(close, priceDp(close));
    const c = tr.insertCell();
    if (chg !== null) { c.textContent = fmtPct(chg); c.className = chg >= 0 ? "pos" : "neg"; }
    else c.textContent = "—";
  }
}

/* ---------------- build static chrome ---------------- */
function buildControls() {
  for (const name of ["1W", "1M", "3M", "1Y", "5Y", "Max"]) {
    const b = document.createElement("button"); b.type = "button"; b.textContent = name;
    b.addEventListener("click", () => applyPreset(name));
    $("sti-ranges").appendChild(b);
  }
  for (const [key, cat] of Object.entries(CATS)) {
    const c = document.createElement("button");
    c.type = "button"; c.className = "chip"; c.setAttribute("aria-pressed", "true");
    c.style.setProperty("--c", `var(${cat.cssVar})`);
    const dot = document.createElement("span"); dot.className = "dot";
    c.append(dot, document.createTextNode(cat.label));
    c.addEventListener("click", () => {
      state.cats.has(key) ? state.cats.delete(key) : state.cats.add(key);
      c.setAttribute("aria-pressed", String(state.cats.has(key)));
      renderMain(); refreshEventList();
    });
    $("sti-catChips").appendChild(c);
  }
  for (const [sym, cssVar] of BENCH_ORDER) {
    if (!BENCH[sym]) continue;
    const c = document.createElement("button");
    c.type = "button"; c.className = "chip"; c.setAttribute("aria-pressed", "false");
    c.style.setProperty("--c", `var(${cssVar})`);
    const dot = document.createElement("span"); dot.className = "dot";
    c.append(dot, document.createTextNode(BENCH[sym].name));
    c.addEventListener("click", () => {
      state.bench.has(sym) ? state.bench.delete(sym) : state.bench.add(sym);
      c.setAttribute("aria-pressed", String(state.bench.has(sym)));
      $("sti-scaleSeg").classList.toggle("dim", cmpOn());   // % scale while comparing — log paused
      renderMain(); clearOverlay();
    });
    $("sti-benchChips").appendChild(c);
  }
  if (!Object.keys(BENCH).length) $("sti-benchHint").style.display = "none";
  $("sti-scaleSeg").addEventListener("click", ev => {
    const b = ev.target.closest("button"); if (!b) return;
    state.log = b.dataset.scale === "log";
    for (const x of $("sti-scaleSeg").children) x.setAttribute("aria-pressed", String(x === b));
    renderMain(); clearOverlay();
  });
  $("sti-evClose").addEventListener("click", () => { state.sel = -1; renderMain(); refreshChrome(); });
}

function buildSidebar() {
  const sb = $("sti-sidebar");
  for (const [label, syms] of GROUPS) {
    const g = document.createElement("div"); g.className = "grp"; g.textContent = label; sb.appendChild(g);
    for (const sym of syms) {
      if (!SERIES[sym]) continue;
      const b = document.createElement("button");
      b.type = "button"; b.className = "tk"; b.dataset.sym = sym;
      const nm = document.createElement("span"); nm.className = "nm"; nm.textContent = SERIES[sym].name;
      const pc = document.createElement("span"); pc.className = "pc";
      b.append(logoEl(sym), nm, pc);
      b.addEventListener("click", () => switchTicker(sym));
      sb.appendChild(b);
    }
  }
}

function logoEl(sym) {
  if (LOGOS[sym]) {
    const img = document.createElement("img");
    img.className = "lg"; img.alt = ""; img.src = LOGOS[sym];
    return img;
  }
  const m = document.createElement("span"); m.className = "mono";
  m.textContent = sym === "^STI" ? "STI"
    : SERIES[sym].name.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return m;
}

function switchTicker(sym) {
  state.ticker = sym; state.sel = -1;
  const s = SERIES[sym], [lo, hi] = extent(s);
  const cl = $("sti-chartLogo");
  if (LOGOS[sym]) { cl.src = LOGOS[sym]; cl.style.display = ""; } else cl.style.display = "none";
  $("sti-chartName").textContent = s.name;
  $("sti-chartCode").textContent = sym === "^STI" ? "SGX index · 1987–present" : "SGX: " + sym.replace(".SI", "");
  if (state.preset) applyPreset(state.preset);
  else setView(Math.max(lo, state.t0), Math.min(hi, state.t1), true);
  renderMain(); renderOverview(); clearOverlay(); refreshChrome();
}

/* ---------------- pointer interactions: main chart ---------------- */
let dragging = null, pinch = null;
const touches = new Map();          // active pointers on the chart (for pinch)
wrap.addEventListener("pointerdown", ev => {
  const r = wrap.getBoundingClientRect(), mx = ev.clientX - r.left;
  touches.set(ev.pointerId, mx);
  if (touches.size === 2) {         // second finger: switch from pan to pinch
    const xs = [...touches.values()];
    dragging = null;
    pinch = { d0: Math.max(20, Math.abs(xs[0] - xs[1])), c: pxDay((xs[0] + xs[1]) / 2),
              t0: state.t0, t1: state.t1 };
  } else if (touches.size === 1) {
    dragging = { x: mx, t0: state.t0, t1: state.t1, moved: false };
  }
  wrap.setPointerCapture(ev.pointerId);
});
wrap.addEventListener("pointermove", ev => {
  const r = wrap.getBoundingClientRect(), mx = ev.clientX - r.left, my = ev.clientY - r.top;
  if (touches.has(ev.pointerId)) touches.set(ev.pointerId, mx);
  if (pinch && touches.size >= 2) {
    const xs = [...touches.values()];
    const k = pinch.d0 / Math.max(20, Math.abs(xs[0] - xs[1]));
    setView(pinch.c - (pinch.c - pinch.t0) * k, pinch.c + (pinch.t1 - pinch.c) * k);
    return;
  }
  if (dragging) {
    const dpx = mx - dragging.x;
    if (Math.abs(dpx) > 3) dragging.moved = true;
    const dDays = -dpx / (W - PAD.l - PAD.r) * (dragging.t1 - dragging.t0);
    setView(dragging.t0 + dDays, dragging.t1 + dDays);
    return;
  }
  drawOverlay(mx, my);
});
wrap.addEventListener("pointerup", ev => {
  const r = wrap.getBoundingClientRect(), mx = ev.clientX - r.left, my = ev.clientY - r.top;
  if (dragging && !dragging.moved && !pinch) {
    const e = hoveredEvent(mx, my);
    if (e) selectEvent(e.i, false);
  }
  touches.delete(ev.pointerId);
  if (touches.size < 2) pinch = null;
  dragging = null;
});
wrap.addEventListener("pointercancel", ev => { touches.delete(ev.pointerId); pinch = null; dragging = null; });
wrap.addEventListener("pointerleave", () => { if (!dragging && !pinch) clearOverlay(); });
wrap.addEventListener("wheel", ev => {
  ev.preventDefault();
  const r = wrap.getBoundingClientRect(), mx = ev.clientX - r.left;
  const f = Math.exp(ev.deltaY * 0.0016), c = pxDay(mx);
  setView(c - (c - state.t0) * f, c + (state.t1 - c) * f);
  drawOverlay(mx, ev.clientY - r.top);
}, { passive: false });
wrap.addEventListener("dblclick", () => applyPreset("Max"));

/* ---------------- pointer interactions: overview brush ---------------- */
let ovDrag = null;
function ovDayAt(px) { const [lo, hi] = extent(cur()); return lo + px / OW * (hi - lo); }
ovWrap.addEventListener("pointerdown", ev => {
  const r = ovWrap.getBoundingClientRect(), x = ev.clientX - r.left;
  const [lo, hi] = extent(cur());
  const bx0 = (state.t0 - lo) / (hi - lo) * OW, bx1 = (state.t1 - lo) / (hi - lo) * OW;
  ovDrag = (x > bx0 + 5 && x < bx1 - 5)
    ? { mode: "move", x, t0: state.t0, t1: state.t1 }
    : { mode: "new", anchor: ovDayAt(x) };
  ovWrap.setPointerCapture(ev.pointerId);
  ovWrap.style.cursor = "grabbing";
});
ovWrap.addEventListener("pointermove", ev => {
  if (!ovDrag) return;
  const r = ovWrap.getBoundingClientRect(), x = ev.clientX - r.left;
  if (ovDrag.mode === "move") {
    const [lo, hi] = extent(cur());
    const dDays = (x - ovDrag.x) / OW * (hi - lo);
    setView(ovDrag.t0 + dDays, ovDrag.t1 + dDays);
  } else {
    const a = ovDrag.anchor, b = ovDayAt(x);
    if (Math.abs(b - a) > 20) setView(Math.min(a, b), Math.max(a, b));
  }
});
["pointerup", "pointercancel"].forEach(t => ovWrap.addEventListener(t, () => { ovDrag = null; ovWrap.style.cursor = "grab"; }));

/* ---------------- theme: follow the guide's toggle ---------------- */
new MutationObserver(() => { renderMain(); renderOverview(); clearOverlay(); refreshChrome(); })
  .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { renderMain(); renderOverview(); refreshChrome(); });

/* ---------------- boot ---------------- */
buildControls();
buildSidebar();
new ResizeObserver(() => { sizeCanvases(); renderMain(); renderOverview(); }).observe(wrap);
sizeCanvases();
switchTicker("D05.SI");
applyPreset("1Y");

document.getElementById("sti-app").classList.add("ready");
})();
