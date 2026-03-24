/**
 * MODULE 3 — Analytics
 * M3_Constants.gs
 *
 * Immutable constants and exact 0-based column maps.
 * Column maps are the single source of truth for every array read/write
 * in this module. If a sheet header changes, update here only.
 *
 * No functions — pure data.
 * @version 3.3.0
 */

var M3_CONST = Object.freeze({
  VERSION: '3.3.0',

  // ── Sheet names ──────────────────────────────────────────────────────────
  SHEETS: Object.freeze({
    LEVELS     : 'LEVELS',
    INDICATORS : 'INDICATORS',
    REGIME     : 'REGIME',
    DATA_CLEAN : 'DATA_CLEAN',
    UNIVERSE   : 'UNIVERSE',
    INSTRUMENTS: 'INSTRUMENTS',
    CONFIG     : 'CONFIG'
  }),

  // ── Indicator parameters ─────────────────────────────────────────────────
  ATR_PERIOD            : 14,
  ATR_LAG_CANDLES       : 30,   // offset for compression denominator
  BB_PERIOD             : 20,
  BB_STDDEV_MULT        : 2,
  BB_SQUEEZE_LOOKBACK   : 60,   // candle window for percentile rank
  BB_SQUEEZE_PCTILE     : 0.10, // bottom 10th percentile = squeeze
  RSI_PERIOD            : 14,
  VOLUME_SMA_PERIOD     : 30,
  OBV_SLOPE_LOOKBACK    : 20,
  SMA_DAILY_PERIOD      : 50,
  REL_PERF_4H_CANDLES   : 42,   // 7 days × 6 4H candles
  WICK_LOOKBACK         : 30,

  // ── Level parameters ─────────────────────────────────────────────────────
  TEST_TOLERANCE_PCT    : 0.01, // within 1% = "tested"
  STALE_THRESHOLD_PCT   : 0.15, // >15% away without test = STALE
  CONSOL_TOLERANCE_PCT  : 0.05, // 5% band for consolidation count
  NH_NL_DAILY_LOOKBACK  : 20,   // days for new-high / new-low

  // ── Regime thresholds ────────────────────────────────────────────────────
  REGIME_BREADTH_HIGH_PCT : 60, // percent (not decimal)
  REGIME_BREADTH_LOW_PCT  : 40,
  PANIC_ATR_PCT           : 5   // percent (not decimal); median ATR%
});

// ── 0-based column index maps — must match Section 1 headers exactly ──────

var M3_COL = Object.freeze({

  LEVELS: Object.freeze({
    Symbol                  : 0,
    Timestamp               : 1,
    Resistance_Value        : 2,
    Support_Value           : 3,
    Lookback_N              : 4,
    Daily_Resistance        : 5,
    Daily_Support           : 6,
    Times_Tested_Resistance : 7,
    Times_Tested_Support    : 8,
    Resistance_Status       : 9,
    Support_Status          : 10,
    Next_Higher_Resistance  : 11,
    Next_Lower_Support      : 12,
    Room_to_Run_Long_R      : 13,
    Room_to_Fall_Short_R    : 14,
    ATR_14_At_Calc          : 15,
    Current_Close           : 16
  }),

  INDICATORS: Object.freeze({
    Symbol                    : 0,
    Timestamp                 : 1,
    Timeframe                 : 2,
    ATR_14                    : 3,
    ATR_14_Lagged_30          : 4,
    ATR_Ratio                 : 5,
    BB_Upper                  : 6,
    BB_Lower                  : 7,
    BB_Middle                 : 8,
    BB_Width                  : 9,
    BB_Width_Percentile_60    : 10,
    BB_Squeeze                : 11,
    SMA_50_Daily              : 12,
    Volume_SMA_30             : 13,
    Volume_Ratio              : 14,
    RSI_14                    : 15,
    OBV                       : 16,
    OBV_Slope_20              : 17,
    Rel_Perf_vs_BTC_7d        : 18,
    Consolidation_Count_High  : 19,
    Consolidation_Count_Low   : 20,
    Wick_To_Body_Ratio_Avg_30 : 21,
    Funding_Rate_Current      : 22
  }),

  REGIME: Object.freeze({
    Date                 : 0,
    BTC_Close            : 1,
    BTC_SMA_50           : 2,
    BTC_Above_SMA50      : 3,
    ETH_Close            : 4,
    ETH_SMA_50           : 5,
    ETH_Above_SMA50      : 6,
    Universe_Breadth_Pct : 7,
    NH_NL_Net            : 8,
    Median_ATR_Pct_4H    : 9,
    Panic_Flag           : 10,
    Funding_Bias_Pct     : 11,
    Market_Regime        : 12,
    Regime_Changed       : 13,
    Regime_Override      : 14,
    Notes                : 15
  }),

  // Read-only map for DATA_CLEAN (Module 2 writes this; we only read it).
  // These indexes must match whatever Module 2 actually writes.
  // Update here if Module 2 schema changes — no other file needs touching.
  DATA_CLEAN: Object.freeze({
    Timestamp          : 0,
    Symbol             : 1,
    Market_Type        : 2,
    Timeframe          : 3,
    Open               : 4,
    High               : 5,
    Low                : 6,
    Close              : 7,
    Volume             : 8,
    // columns 9-13 reserved for Module 2 fields
    Gap_Flag           : 14,
    Stale_Flag         : 15,
    Wick_To_Body_Ratio : 16
  }),

  // Read-only map for UNIVERSE (Module 2 writes this).
  UNIVERSE: Object.freeze({
    Symbol      : 0,
    Market_Type : 1,
    // ... other Module 2 cols
    In_Top_K    : 4
  }),

  // Read-only map for INSTRUMENTS (Module 2 writes this).
  INSTRUMENTS: Object.freeze({
    Symbol               : 0,
    Perp_Funding_Rate_8h : 9   // adjust if Module 2 schema differs
  }),

  // Read-only map for CONFIG (Module 1 writes this).
  CONFIG: Object.freeze({
    Parameter : 0,
    Value     : 1
  })
});



/**
 * MODULE 3 — Analytics
 * M3_Utilities.gs
 *
 * Sheet I/O, CONFIG access, and pure math helpers.
 * No business logic. No trading decisions.
 *
 * @version 3.3.0
 */

// ── Sheet I/O ────────────────────────────────────────────────────────────────

function M3__ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function M3__sh_(name) {
  var sh = M3__ss_().getSheetByName(name);
  if (!sh) throw new Error('[M3] Sheet not found: ' + name);
  return sh;
}

/**
 * Reads entire sheet including header row.
 * Returns [] if sheet has no data.
 */
function M3__readAll_(sheetName) {
  var sh = M3__sh_(sheetName);
  if (sh.getLastRow() < 1) return [];
  return sh.getDataRange().getValues();
}

/**
 * Clears rows 2..lastRow, preserving the header in row 1.
 */
function M3__clearDataRows_(sheetName) {
  var sh = M3__sh_(sheetName);
  var lr = sh.getLastRow();
  if (lr > 1) {
    sh.getRange(2, 1, lr - 1, sh.getLastColumn()).clearContent();
  }
}

/**
 * Writes rows starting at row 2. Header row is not touched.
 * rows must be a 2D array whose inner length matches the sheet's column count.
 */
function M3__writeFromRow2_(sheetName, rows) {
  if (!rows || rows.length === 0) return;
  var sh = M3__sh_(sheetName);
  sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

/** ISO 8601 UTC timestamp */
function M3__nowIso_() {
  return new Date().toISOString();
}

/** yyyy-MM-dd in UTC */
function M3__todayUtc_() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Validates that the first N columns of a sheet's header row match exactly.
 * Throws a descriptive error on first mismatch so integration errors surface immediately.
 */
function M3__assertHeaders_(sheetName, expected) {
  var sh    = M3__sh_(sheetName);
  var actual = sh.getRange(1, 1, 1, expected.length).getValues()[0];
  for (var i = 0; i < expected.length; i++) {
    var a = String(actual[i]).trim();
    var e = String(expected[i]).trim();
    if (a !== e) {
      throw new Error(
        '[M3] Schema mismatch on "' + sheetName + '" col ' + (i + 1) +
        ': expected "' + e + '", found "' + a + '"'
      );
    }
  }
}

// ── CONFIG access ─────────────────────────────────────────────────────────────

/** Module-local CONFIG cache. Reset by calling M3__clearCfgCache_(). */
var M3__cfgCache_ = null;

function M3__clearCfgCache_() {
  M3__cfgCache_ = null;
}

/**
 * Returns raw CONFIG value for key, or null if absent.
 * Prefers M1_cfgGetNum / M1_cfgGetStr if those Module 1 helpers exist.
 * Falls back to reading CONFIG sheet directly (Parameter | Value layout).
 */
function M3__cfgRaw_(key) {
  // Prefer Module 1 helpers if loaded
  if (typeof M1_cfgGetStr === 'function') {
    try {
      var v = M1_cfgGetStr(key);
      if (v !== null && v !== undefined && v !== '') return v;
    } catch (ignored) {}
  }
  // Direct CONFIG sheet fallback
  if (!M3__cfgCache_) {
    M3__cfgCache_ = {};
    try {
      var rows = M3__readAll_(M3_CONST.SHEETS.CONFIG);
      var pc = M3_COL.CONFIG.Parameter;
      var vc = M3_COL.CONFIG.Value;
      for (var i = 1; i < rows.length; i++) {
        var k = String(rows[i][pc] || '').trim();
        if (k) M3__cfgCache_[k] = rows[i][vc];
      }
    } catch (e) {
      console.warn('[M3] CONFIG sheet unreadable: ' + e.message);
    }
  }
  var found = M3__cfgCache_[key];
  return (found !== undefined) ? found : null;
}

function M3__cfgNum_(key, defaultVal) {
  var raw = M3__cfgRaw_(key);
  var n   = parseFloat(raw);
  return isFinite(n) ? n : defaultVal;
}

// ── Pure math helpers ─────────────────────────────────────────────────────────

/**
 * Simple moving average of the last n values in arr.
 * Returns null if insufficient data.
 */
function M3__sma_(arr, n) {
  if (!arr || arr.length < n) return null;
  var slice = arr.slice(-n);
  var sum = 0;
  for (var i = 0; i < n; i++) sum += slice[i];
  return sum / n;
}

/**
 * Population standard deviation of arr (all elements).
 */
function M3__stdDevPop_(arr) {
  if (!arr || arr.length < 2) return 0;
  var mean = 0;
  for (var i = 0; i < arr.length; i++) mean += arr[i];
  mean /= arr.length;
  var sq = 0;
  for (var j = 0; j < arr.length; j++) sq += Math.pow(arr[j] - mean, 2);
  return Math.sqrt(sq / arr.length);
}

/**
 * Median of arr (does not mutate).
 */
function M3__median_(arr) {
  if (!arr || arr.length === 0) return null;
  var s   = arr.slice().sort(function(a, b) { return a - b; });
  var mid = Math.floor(s.length / 2);
  return (s.length % 2 === 0) ? (s[mid - 1] + s[mid]) / 2 : s[mid];
}

/**
 * Percentile rank of value within arr (0 = lowest, 1 = highest).
 * arr does NOT need to be pre-sorted.
 */
function M3__pctileRank_(value, arr) {
  if (!arr || arr.length === 0) return null;
  var count = 0;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] < value) count++;
    else if (arr[i] === value) count += 0.5;
  }
  return count / arr.length;
}

/**
 * Maximum value of arr, or null if empty.
 */
function M3__max_(arr) {
  if (!arr || arr.length === 0) return null;
  var m = arr[0];
  for (var i = 1; i < arr.length; i++) if (arr[i] > m) m = arr[i];
  return m;
}

/**
 * Minimum value of arr, or null if empty.
 */
function M3__min_(arr) {
  if (!arr || arr.length === 0) return null;
  var m = arr[0];
  for (var i = 1; i < arr.length; i++) if (arr[i] < m) m = arr[i];
  return m;
}

/**
 * Ordinary least-squares slope of series against integer index.
 * Returns 0 if fewer than 2 points.
 */
function M3__olsSlope_(series) {
  var n = series.length;
  if (n < 2) return 0;
  var sx = 0, sy = 0, sxy = 0, sx2 = 0;
  for (var i = 0; i < n; i++) {
    sx  += i;
    sy  += series[i];
    sxy += i * series[i];
    sx2 += i * i;
  }
  var denom = n * sx2 - sx * sx;
  return denom === 0 ? 0 : (n * sxy - sx * sy) / denom;
}


/**
 * MODULE 3 — Analytics
 * M3_DataAccess.gs
 *
 * All reads from upstream sheets (DATA_CLEAN, UNIVERSE, INSTRUMENTS).
 * Returns structured objects; no writes; no business logic.
 *
 * @version 3.3.0
 */

/**
 * Returns all top-K symbols from UNIVERSE.
 * Shape: [ { symbol: string, marketType: string }, ... ]
 */
function M3__getTopKSymbols_() {
  var rows = M3__readAll_(M3_CONST.SHEETS.UNIVERSE);
  var uc   = M3_COL.UNIVERSE;
  var out  = [];

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][uc.In_Top_K] === true) {
      out.push({
        symbol    : String(rows[i][uc.Symbol]),
        marketType: String(rows[i][uc.Market_Type] || '')
      });
    }
  }
  return out;
}

/**
 * Builds a map of symbol -> perp funding rate (8h).
 * Returns {} if INSTRUMENTS is absent or has no funding column.
 */
function M3__buildFundingMap_() {
  var map = {};
  var sh  = M3__ss_().getSheetByName(M3_CONST.SHEETS.INSTRUMENTS);
  if (!sh || sh.getLastRow() < 2) return map;

  var rows = sh.getDataRange().getValues();
  var ic   = M3_COL.INSTRUMENTS;

  for (var i = 1; i < rows.length; i++) {
    var sym = String(rows[i][ic.Symbol] || '');
    var f   = rows[i][ic.Perp_Funding_Rate_8h];
    if (sym && f !== '' && f !== null && f !== undefined) {
      map[sym] = parseFloat(f);
    }
  }
  return map;
}

/**
 * Reads DATA_CLEAN and returns candle data bucketed by symbol and timeframe.
 *
 * Only loads symbols listed in `symbolSet` (a plain object used as a set).
 * Only loads timeframes '4H' and '1D'.
 * Gap_Flag = TRUE rows are included in the raw bucket but tagged .gap = true
 * so callers can filter them explicitly (prevents silent ATR/RSI corruption).
 *
 * Return shape:
 *   {
 *     'ETH/USDT': {
 *       '4H': [ { ts, o, h, l, c, v, gap, stale, wtb }, ... ],  // sorted asc
 *       '1D': [ ... ]
 *     },
 *     ...
 *   }
 */
function M3__loadCandles_(symbolSet) {
  var rows = M3__readAll_(M3_CONST.SHEETS.DATA_CLEAN);
  var dc   = M3_COL.DATA_CLEAN;

  var buckets = {};

  for (var i = 1; i < rows.length; i++) {
    var r   = rows[i];
    var sym = String(r[dc.Symbol] || '');
    var tf  = String(r[dc.Timeframe] || '');

    if (!symbolSet[sym])          continue;
    if (tf !== '4H' && tf !== '1D') continue;

    if (!buckets[sym])       buckets[sym]     = {};
    if (!buckets[sym][tf])   buckets[sym][tf] = [];

    buckets[sym][tf].push({
      ts   : r[dc.Timestamp],
      o    : +r[dc.Open]   || 0,
      h    : +r[dc.High]   || 0,
      l    : +r[dc.Low]    || 0,
      c    : +r[dc.Close]  || 0,
      v    : +r[dc.Volume] || 0,
      gap  : r[dc.Gap_Flag]           === true,
      stale: r[dc.Stale_Flag]         === true,
      wtb  : (r[dc.Wick_To_Body_Ratio] !== '' && r[dc.Wick_To_Body_Ratio] !== undefined)
               ? +r[dc.Wick_To_Body_Ratio] : null
    });
  }

  // Sort each bucket ascending by timestamp
  var syms = Object.keys(buckets);
  for (var s = 0; s < syms.length; s++) {
    var tfs = Object.keys(buckets[syms[s]]);
    for (var t = 0; t < tfs.length; t++) {
      buckets[syms[s]][tfs[t]].sort(function(a, b) {
        return new Date(a.ts) - new Date(b.ts);
      });
    }
  }

  return buckets;
}

/**
 * Returns the completed-candle subset of a candle array.
 * Excludes:
 * - gap rows
 * - stale rows
 *
 * Use this before any sequential math (ATR, RSI, OBV, BB, volume SMA, rel perf).
 */
function M3__ng_(candles) {
  return (candles || []).filter(function(r) {
    return !r.gap && !r.stale;
  });
}

/**
 * Determines the BTC benchmark symbol to use for a given instrument.
 * Matches quote currency (ZAR vs USDT).
 */
function M3__btcBench_(symbol) {
  if (symbol.indexOf('/ZAR') !== -1) return 'BTC/ZAR';
  return 'BTC/USDT';
}

/**
 * Determines the ETH benchmark symbol.
 */
function M3__ethBench_(symbol) {
  if (symbol.indexOf('/ZAR') !== -1) return 'ETH/ZAR';
  return 'ETH/USDT';
}


/**
 * MODULE 3 — Analytics
 * M3_Compute.gs
 *
 * All technical computations: indicators, levels, regime breadth.
 * Pure functions — take arrays, return numbers/objects.
 * No sheet reads or writes in this file.
 *
 * @version 3.3.0
 */

// ═══════════════════════════════════════════════════════════════
// INDICATOR MATH
// ═══════════════════════════════════════════════════════════════

/**
 * Wilder's ATR over the last (period) true ranges.
 * Input: non-gap candle objects { h, l, c }.
 * Returns 0 if insufficient data.
 */
function M3__calcAtr_(candles, period) {
  if (!candles || candles.length < period + 1) return 0;

  // Build TR series
  var tr = [];
  for (var i = 1; i < candles.length; i++) {
    var h  = candles[i].h,   l = candles[i].l;
    var pc = candles[i - 1].c;
    tr.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
  }

  // First ATR = simple average of first `period` TRs
  var atr = 0;
  for (var j = 0; j < period; j++) atr += tr[j];
  atr /= period;

  // Wilder smoothing for the rest
  for (var k = period; k < tr.length; k++) {
    atr = (atr * (period - 1) + tr[k]) / period;
  }
  return atr;
}

/**
 * Wilder's RSI.
 * Input: array of closing prices (non-gap, length >= period + 1).
 * Returns 50 (neutral) if insufficient data.
 */
function M3__calcRsi_(closes, period) {
  if (!closes || closes.length < period + 1) return 50;

  var gains = 0, losses = 0;

  // Seed with first `period` changes
  for (var i = 1; i <= period; i++) {
    var d = closes[i] - closes[i - 1];
    if (d >= 0) gains  += d;
    else        losses -= d;
  }
  var avgG = gains  / period;
  var avgL = losses / period;

  // Wilder smoothing
  for (var j = period + 1; j < closes.length; j++) {
    var diff = closes[j] - closes[j - 1];
    var g    = diff > 0 ?  diff : 0;
    var l2   = diff < 0 ? -diff : 0;
    avgG = (avgG * (period - 1) + g ) / period;
    avgL = (avgL * (period - 1) + l2) / period;
  }

  if (avgL === 0) return 100;
  var rs = avgG / avgL;
  return 100 - (100 / (1 + rs));
}

/**
 * Bollinger Bands (20, 2) on last `period` closes.
 * Returns { upper, middle, lower, width } or all-null if insufficient.
 */
function M3__calcBB_(closes, period, mult) {
  if (!closes || closes.length < period) {
    return { upper: null, middle: null, lower: null, width: null };
  }
  var slice  = closes.slice(-period);
  var middle = M3__sma_(slice, period);
  var sd     = M3__stdDevPop_(slice);
  var upper  = middle + mult * sd;
  var lower  = middle - mult * sd;
  var width  = (middle && middle !== 0) ? (upper - lower) / middle : 0;
  return { upper: upper, middle: middle, lower: lower, width: width };
}

/**
 * Computes BB_Width_Percentile_60 and BB_Squeeze.
 *
 * Algorithm:
 *   For each of the last `lookback` candle end-points (starting at index `period`),
 *   compute the BB width of the prior `period` closes. That gives a width history.
 *   The percentile rank of the *current* (most recent) width within that history is
 *   BB_Width_Percentile_60. BB_Squeeze = TRUE if that percentile <= squeezePctile.
 *
 * Returns { pctile: number|null, squeeze: boolean|null }.
 */
function M3__calcBBSqueeze_(closes, period, mult, lookback, squeezePctile) {
  // Need at least period + lookback closes to build a meaningful history
  if (!closes || closes.length < period + lookback) {
    return { pctile: null, squeeze: null };
  }

  var widths = [];
  // Build width history over the last `lookback` endpoints
  // Each endpoint i uses closes[i - period .. i - 1]
  var totalLen = closes.length;
  var start    = totalLen - lookback; // first endpoint index

  for (var i = start; i <= totalLen; i++) {
    var slice  = closes.slice(i - period, i);
    if (slice.length < period) continue;
    var mean   = M3__sma_(slice, period);
    var sd     = M3__stdDevPop_(slice);
    var w      = (mean && mean !== 0) ? ((mean + mult * sd) - (mean - mult * sd)) / mean : 0;
    widths.push(w);
  }

  if (widths.length === 0) return { pctile: null, squeeze: null };

  var currentWidth = widths[widths.length - 1];
  var pctile       = M3__pctileRank_(currentWidth, widths);
  var squeeze      = pctile !== null ? pctile <= squeezePctile : null;

  return { pctile: pctile, squeeze: squeeze };
}

/**
 * Cumulative OBV series from candle array.
 * Returns array of same length as candles (first value = 0).
 */
function M3__calcObvSeries_(closes, volumes) {
  var obv = [0];
  for (var i = 1; i < closes.length; i++) {
    var prev = obv[obv.length - 1];
    if (closes[i] > closes[i - 1])      obv.push(prev + volumes[i]);
    else if (closes[i] < closes[i - 1]) obv.push(prev - volumes[i]);
    else                                 obv.push(prev);
  }
  return obv;
}

/**
 * 7-day relative performance: coin return minus BTC return.
 * Uses 4H candles (42 candles = 7 days × 6).
 * Returns null if insufficient data.
 */
function M3__calcRelPerf7d_(coinCloses, btcCloses) {
  var n = M3_CONST.REL_PERF_4H_CANDLES;
  if (!coinCloses || coinCloses.length <= n ||
      !btcCloses  || btcCloses.length  <= n) return null;

  var coinStart = coinCloses[coinCloses.length - n - 1];
  var coinEnd   = coinCloses[coinCloses.length - 1];
  var btcStart  = btcCloses [btcCloses.length  - n - 1];
  var btcEnd    = btcCloses [btcCloses.length  - 1];

  if (!coinStart || !btcStart) return null;

  var rCoin = (coinEnd - coinStart) / coinStart;
  var rBtc  = (btcEnd  - btcStart ) / btcStart;
  return rCoin - rBtc; // fractional, e.g. 0.05 = coin outperformed BTC by 5pp
}

// ═══════════════════════════════════════════════════════════════
// LEVEL MATH
// ═══════════════════════════════════════════════════════════════

/**
 * Fractal-pivot resistance zone:
 * - find pivot highs in the recent lookback
 * - average the latest 2 pivots into a more stable resistance level
 * - fallback to Donchian max if not enough pivots exist
 */
function M3__calcResistance_(ng4H, n) {
  var span = 2;
  var pivotsToAvg = 2;

  var window = ng4H.slice(-n);
  var pivots = M3__fractalPivotHighs_(window, span);

  if (pivots.length > 0) {
    var zone = M3__avgLastN_(pivots, pivotsToAvg);
    if (zone !== null && isFinite(zone)) return zone;
  }

  var highs = window.map(function(r) { return r.h; });
  return M3__max_(highs);
}

/**
 * Fractal-pivot support zone:
 * - find pivot lows in the recent lookback
 * - average the latest 2 pivots into a more stable support level
 * - fallback to Donchian min if not enough pivots exist
 */
function M3__calcSupport_(ng4H, n) {
  var span = 2;
  var pivotsToAvg = 2;

  var window = ng4H.slice(-n);
  var pivots = M3__fractalPivotLows_(window, span);

  if (pivots.length > 0) {
    var zone = M3__avgLastN_(pivots, pivotsToAvg);
    if (zone !== null && isFinite(zone)) return zone;
  }

  var lows = window.map(function(r) { return r.l; });
  return M3__min_(lows);
}

/**
 * Times tested: count of candles where High is within `tol` fraction of `level`.
 */
function M3__timesTestedHigh_(ng4H, level, tol) {
  if (!level) return 0;
  var count = 0;
  for (var i = 0; i < ng4H.length; i++) {
    if (Math.abs(ng4H[i].h - level) / level <= tol) count++;
  }
  return count;
}

/**
 * Times tested: count of candles where Low is within `tol` fraction of `level`.
 */
function M3__timesTestedLow_(ng4H, level, tol) {
  if (!level) return 0;
  var count = 0;
  for (var i = 0; i < ng4H.length; i++) {
    if (Math.abs(ng4H[i].l - level) / level <= tol) count++;
  }
  return count;
}

/**
 * Resistance status.
 * BROKEN: any candle closed above resistance (most recent takes priority).
 * STALE : current close > 15% below resistance AND times-tested = 0.
 * ACTIVE: otherwise.
 */
function M3__resistanceStatus_(ng4H, resistance, currentClose, timesTestedR) {
  if (!resistance) return 'ACTIVE';

  // Check for BROKEN: scan from newest to oldest for a close > resistance
  for (var i = ng4H.length - 1; i >= 0; i--) {
    if (ng4H[i].c > resistance) return 'BROKEN';
  }

  if (currentClose < resistance * (1 - M3_CONST.STALE_THRESHOLD_PCT) &&
      timesTestedR === 0) {
    return 'STALE';
  }

  return 'ACTIVE';
}

/**
 * Support status.
 * BROKEN: any candle closed below support.
 * STALE : current close > 15% above support AND times-tested = 0.
 * ACTIVE: otherwise.
 */
function M3__supportStatus_(ng4H, support, currentClose, timesTestedS) {
  if (!support) return 'ACTIVE';

  for (var i = ng4H.length - 1; i >= 0; i--) {
    if (ng4H[i].c < support) return 'BROKEN';
  }

  if (currentClose > support * (1 + M3_CONST.STALE_THRESHOLD_PCT) &&
      timesTestedS === 0) {
    return 'STALE';
  }

  return 'ACTIVE';
}

/**
 * Consolidation count HIGH:
 * Candles where High < resistance AND Low > resistance × (1 - consolTol).
 * These candles are "coiling under resistance".
 */
function M3__consolCountHigh_(ng4H, resistance) {
  if (!resistance) return 0;
  var count = 0;
  for (var i = 0; i < ng4H.length; i++) {
    var r = ng4H[i];
    if (r.h < resistance && r.l > resistance * (1 - M3_CONST.CONSOL_TOLERANCE_PCT)) count++;
  }
  return count;
}

/**
 * Consolidation count LOW:
 * Candles where Low > support AND High < support × (1 + consolTol).
 */
function M3__consolCountLow_(ng4H, support) {
  if (!support) return 0;
  var count = 0;
  for (var i = 0; i < ng4H.length; i++) {
    var r = ng4H[i];
    if (r.l > support && r.h < support * (1 + M3_CONST.CONSOL_TOLERANCE_PCT)) count++;
  }
  return count;
}

// ═══════════════════════════════════════════════════════════════
// REGIME MATH
// ═══════════════════════════════════════════════════════════════

/**
 * Determines RISK-ON / NEUTRAL / RISK-OFF with slightly faster responsiveness.
 *
 * breadthPct : percent of top-K above daily SMA50 (0-100)
 * btcAbove   : BTC close > BTC SMA50 daily
 * ethAbove   : ETH close > ETH SMA50 daily
 * medAtrPct  : median ATR% across universe 4H (0-100)
 */
function M3__determineRegime_(breadthPct, btcAbove, ethAbove, medAtrPct) {
  // Panic override remains absolute
  if (medAtrPct > M3_CONST.PANIC_ATR_PCT) {
    return 'RISK-OFF';
  }

  // Strong risk-off only if breadth is weak and both leaders are weak
  if (breadthPct < M3_CONST.REGIME_BREADTH_LOW_PCT && !btcAbove && !ethAbove) {
    return 'RISK-OFF';
  }

  // Faster risk-on if both leaders are strong and breadth is decent
  if (btcAbove && ethAbove && breadthPct >= 60) {
    return 'RISK-ON';
  }

  // Standard risk-on rule
  if (breadthPct > M3_CONST.REGIME_BREADTH_HIGH_PCT && (btcAbove || ethAbove)) {
    return 'RISK-ON';
  }

  return 'NEUTRAL';
}


/**
 * Returns an array of pivot high values using a simple fractal rule:
 * high[i] must exceed highs of `span` candles on both sides.
 */
function M3__fractalPivotHighs_(rows, span) {
  var out = [];
  if (!rows || rows.length < (span * 2 + 1)) return out;

  for (var i = span; i < rows.length - span; i++) {
    var h = rows[i].h;
    var isPivot = true;

    for (var j = i - span; j <= i + span; j++) {
      if (j === i) continue;
      if (!(h > rows[j].h)) {
        isPivot = false;
        break;
      }
    }

    if (isPivot) out.push(h);
  }

  return out;
}


/**
 * Returns an array of pivot low values using a simple fractal rule:
 * low[i] must be below lows of `span` candles on both sides.
 */
function M3__fractalPivotLows_(rows, span) {
  var out = [];
  if (!rows || rows.length < (span * 2 + 1)) return out;

  for (var i = span; i < rows.length - span; i++) {
    var l = rows[i].l;
    var isPivot = true;

    for (var j = i - span; j <= i + span; j++) {
      if (j === i) continue;
      if (!(l < rows[j].l)) {
        isPivot = false;
        break;
      }
    }

    if (isPivot) out.push(l);
  }

  return out;
}


/**
 * Averages the last N values of an array.
 * Returns null if there are no values.
 */
function M3__avgLastN_(arr, n) {
  if (!arr || arr.length === 0) return null;
  var take = Math.min(arr.length, n);
  var sum = 0;

  for (var i = arr.length - take; i < arr.length; i++) {
    sum += arr[i];
  }

  return sum / take;
}




/**
 * MODULE 3 — Analytics
 * M3_Main.gs
 *
 * Public entry points (the only functions other modules may call).
 * Orchestrates data access, compute, and sheet writes.
 * No math lives here — all computation is delegated to M3_Compute.gs.
 *
 * PUBLIC API (M3_ prefix):
 *   M3_runIndicatorsAndLevels()   — full LEVELS + INDICATORS cycle
 *   M3_runRegimeUpdate()          — daily REGIME row
 *   M3_checkPanicConditions()     — intra-day panic monitor
 *   M3_getCurrentRegime()         — read-only accessor
 *   M3_getIndicatorsRow(sym)      — read-only accessor
 *   M3_getLevelsRow(sym)          — read-only accessor
 *   M3_testRunAll()               — self-test suite
 *
 * @version 3.3.0
 */

// ═══════════════════════════════════════════════════════════════
// PUBLIC: INDICATORS + LEVELS
// ═══════════════════════════════════════════════════════════════

function M3_runIndicatorsAndLevels() {
  // Validate owned schemas before touching data
  M3__validateSchemas_();

  var ts       = M3__nowIso_();
  var lookbackN = M3__cfgNum_('Resistance_Lookback_N', 30);
  var atrMult   = M3__cfgNum_('ATR_Stop_Multiple', 1.5);

  var topK = M3__getTopKSymbols_();
  if (topK.length === 0) {
    console.log('[M3] No In_Top_K symbols. Nothing to compute.');
    return;
  }

  // Build the superset of symbols we need candles for
  var symbolSet = {};
  for (var i = 0; i < topK.length; i++) {
    var s = topK[i].symbol;
    symbolSet[s] = true;
    symbolSet[M3__btcBench_(s)] = true;
    symbolSet[M3__ethBench_(s)] = true;
  }

  var buckets    = M3__loadCandles_(symbolSet);
  var fundingMap = M3__buildFundingMap_();

  var indRows = [];
  var lvlRows = [];

  for (var j = 0; j < topK.length; j++) {
    var sym  = topK[j].symbol;
    var btcS = M3__btcBench_(sym);

    // Raw (includes gap rows for reference) and non-gap (for math)
    var raw4H = (buckets[sym]  && buckets[sym]['4H'])  || [];
    var raw1D = (buckets[sym]  && buckets[sym]['1D'])  || [];
    var btcRaw4H = (buckets[btcS] && buckets[btcS]['4H']) || [];

    var ng4H    = M3__ng_(raw4H);
    var ng1D    = M3__ng_(raw1D);
    var btcNg4H = M3__ng_(btcRaw4H);

    // Silently skip if not enough candles to compute any meaningful value
    if (ng4H.length < M3_CONST.ATR_PERIOD + 1) {
      console.warn('[M3] Skipping ' + sym + ': insufficient non-gap 4H candles (' + ng4H.length + ')');
      continue;
    }

    var closes4H  = ng4H.map(function(r)    { return r.c; });
    var highs4H   = ng4H.map(function(r)    { return r.h; });
    var lows4H    = ng4H.map(function(r)    { return r.l; });
    var vols4H    = ng4H.map(function(r)    { return r.v; });
    var closes1D  = ng1D.map(function(r)    { return r.c; });
    var btcC4H    = btcNg4H.map(function(r) { return r.c; });

    var currentClose = closes4H[closes4H.length - 1];

    // ── INDICATORS ──────────────────────────────────────────────

    var atr14 = M3__calcAtr_(ng4H, M3_CONST.ATR_PERIOD);

    // Lagged ATR: use candles up to 30 candles before the last candle
    var atr14Lagged = 0;
    var lagEnd      = ng4H.length - M3_CONST.ATR_LAG_CANDLES;
    if (lagEnd >= M3_CONST.ATR_PERIOD + 1) {
      atr14Lagged = M3__calcAtr_(ng4H.slice(0, lagEnd), M3_CONST.ATR_PERIOD);
    }

    var atrRatio = atr14Lagged > 0 ? atr14 / atr14Lagged : null;

    var bb      = M3__calcBB_(closes4H, M3_CONST.BB_PERIOD, M3_CONST.BB_STDDEV_MULT);
    var bbSq    = M3__calcBBSqueeze_(
                    closes4H,
                    M3_CONST.BB_PERIOD,
                    M3_CONST.BB_STDDEV_MULT,
                    M3_CONST.BB_SQUEEZE_LOOKBACK,
                    M3_CONST.BB_SQUEEZE_PCTILE
                  );

    var sma50D  = M3__sma_(closes1D, M3_CONST.SMA_DAILY_PERIOD);
    var volSma  = M3__sma_(vols4H,   M3_CONST.VOLUME_SMA_PERIOD);
    var volRat  = (volSma && volSma > 0) ? vols4H[vols4H.length - 1] / volSma : null;

    var rsi14   = M3__calcRsi_(closes4H, M3_CONST.RSI_PERIOD);

    var obvSeries = M3__calcObvSeries_(closes4H, vols4H);
    var obvLast   = obvSeries[obvSeries.length - 1];
    var obvSlope  = (obvSeries.length >= M3_CONST.OBV_SLOPE_LOOKBACK)
                    ? M3__olsSlope_(obvSeries.slice(-M3_CONST.OBV_SLOPE_LOOKBACK))
                    : null;

    var relPerf = M3__calcRelPerf7d_(closes4H, btcC4H);

    // Wick-to-body average (last 30 non-gap candles)
    var wickSlice = ng4H.slice(-M3_CONST.WICK_LOOKBACK);
    var wickSum = 0, wickN = 0;
    for (var wi = 0; wi < wickSlice.length; wi++) {
      if (wickSlice[wi].wtb !== null && !isNaN(wickSlice[wi].wtb)) {
        wickSum += wickSlice[wi].wtb;
        wickN++;
      }
    }
    var wickAvg = wickN > 0 ? wickSum / wickN : null;

    var funding = (fundingMap[sym] !== undefined) ? fundingMap[sym] : '';

    // ── LEVELS ───────────────────────────────────────────────────

    var resistance = M3__calcResistance_(ng4H, lookbackN);
    var support    = M3__calcSupport_(ng4H, lookbackN);

    // Daily levels
    var dHighs = ng1D.map(function(r) { return r.h; });
    var dLows  = ng1D.map(function(r) { return r.l; });
    var dailyRes = M3__max_(dHighs.slice(-lookbackN));
    var dailySup = M3__min_(dLows.slice(-lookbackN));

    // Extended window (N×2)
    var extRes = M3__max_(highs4H.slice(-(lookbackN * 2)));
    var extSup = M3__min_(lows4H.slice(-(lookbackN * 2)));

    var timesTestedR = M3__timesTestedHigh_(ng4H, resistance, M3_CONST.TEST_TOLERANCE_PCT);
    var timesTestedS = M3__timesTestedLow_ (ng4H, support,    M3_CONST.TEST_TOLERANCE_PCT);

    var resStatus = M3__resistanceStatus_(ng4H, resistance, currentClose, timesTestedR);
    var supStatus = M3__supportStatus_   (ng4H, support,    currentClose, timesTestedS);

    var stopDist = atr14 * atrMult;
    var roomRun  = (stopDist > 0 && extRes !== null) ? (extRes - currentClose) / stopDist : null;
    var roomFall = (stopDist > 0 && extSup !== null) ? (currentClose - extSup) / stopDist : null;

    // Consolidation counts (use same non-gap window)
    var consHigh = M3__consolCountHigh_(ng4H, resistance);
    var consLow  = M3__consolCountLow_ (ng4H, support);

    // ── Pack rows in exact column-map order ──────────────────────

    var indRow = M3__makeIndRow_(ts, sym, {
      atr14, atr14Lagged, atrRatio,
      bbUpper: bb.upper, bbLower: bb.lower, bbMiddle: bb.middle, bbWidth: bb.width,
      bbPctile: bbSq.pctile, bbSqueeze: bbSq.squeeze,
      sma50D, volSma, volRat, rsi14,
      obvLast, obvSlope, relPerf,
      consHigh, consLow, wickAvg, funding
    });

    var lvlRow = M3__makeLvlRow_(ts, sym, {
      resistance, support, lookbackN,
      dailyRes, dailySup,
      timesTestedR, timesTestedS,
      resStatus, supStatus,
      extRes, extSup,
      roomRun, roomFall,
      atr14, currentClose
    });

    indRows.push(indRow);
    lvlRows.push(lvlRow);
  }

  M3__clearDataRows_(M3_CONST.SHEETS.INDICATORS);
  M3__writeFromRow2_(M3_CONST.SHEETS.INDICATORS, indRows);

  M3__clearDataRows_(M3_CONST.SHEETS.LEVELS);
  M3__writeFromRow2_(M3_CONST.SHEETS.LEVELS, lvlRows);

  console.log('[M3] INDICATORS + LEVELS written for ' + indRows.length + ' symbols at ' + ts);
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC: REGIME
// ═══════════════════════════════════════════════════════════════

function M3_runRegimeUpdate() {
  M3__validateSchemas_();

  var dateStr = M3__todayUtc_();
  var topK    = M3__getTopKSymbols_();

  if (topK.length === 0) {
    console.log('[M3] Regime: no top-K symbols.');
    return;
  }

  // Load candles for all top-K + BTC/ETH benchmarks
  var symbolSet = {};
  for (var i = 0; i < topK.length; i++) {
    symbolSet[topK[i].symbol] = true;
  }
  symbolSet['BTC/USDT'] = true; symbolSet['BTC/ZAR'] = true;
  symbolSet['ETH/USDT'] = true; symbolSet['ETH/ZAR'] = true;

  var buckets    = M3__loadCandles_(symbolSet);
  var fundingMap = M3__buildFundingMap_();

  // BTC leader data
  var btcData = M3__leaderStats_(buckets, ['BTC/USDT', 'BTC/ZAR']);
  var ethData = M3__leaderStats_(buckets, ['ETH/USDT', 'ETH/ZAR']);
  var btcAbove = !!(btcData.close && btcData.sma50 && btcData.close > btcData.sma50);
  var ethAbove = !!(ethData.close && ethData.sma50 && ethData.close > ethData.sma50);

  // Universe breadth
  var aboveSma50  = 0;
  var nhCount     = 0, nlCount = 0;
  var atrPcts     = [];
  var perpTotal   = 0, perpPosFunding = 0;
  var validTotal  = 0;

  for (var j = 0; j < topK.length; j++) {
    var sym  = topK[j].symbol;
    var mtyp = topK[j].marketType;

    var ng4H = M3__ng_((buckets[sym] && buckets[sym]['4H']) || []);
    var ng1D = M3__ng_((buckets[sym] && buckets[sym]['1D']) || []);

    if (ng1D.length < M3_CONST.SMA_DAILY_PERIOD) continue; // skip under-data symbols
    validTotal++;

    // Breadth: daily close vs SMA50
    var closes1D = ng1D.map(function(r) { return r.c; });
    var sma50    = M3__sma_(closes1D, M3_CONST.SMA_DAILY_PERIOD);
    if (sma50 && closes1D[closes1D.length - 1] > sma50) aboveSma50++;

    // New 20-day high / low (daily candles, compare today vs prior 20)
    if (ng1D.length >= M3_CONST.NH_NL_DAILY_LOOKBACK + 1) {
      var priorHigh = ng1D.slice(-(M3_CONST.NH_NL_DAILY_LOOKBACK + 1), -1).map(function(r) { return r.h; });
      var priorLow  = ng1D.slice(-(M3_CONST.NH_NL_DAILY_LOOKBACK + 1), -1).map(function(r) { return r.l; });
      var todayH    = ng1D[ng1D.length - 1].h;
      var todayL    = ng1D[ng1D.length - 1].l;
      if (todayH >= M3__max_(priorHigh)) nhCount++;
      if (todayL <= M3__min_(priorLow))  nlCount++;
    }

    // ATR% 4H
    if (ng4H.length >= M3_CONST.ATR_PERIOD + 1) {
      var atr4H = M3__calcAtr_(ng4H, M3_CONST.ATR_PERIOD);
      var cls4H = ng4H[ng4H.length - 1].c;
      if (cls4H > 0) atrPcts.push((atr4H / cls4H) * 100);
    }

    // Funding bias (perps only)
    if (mtyp.toUpperCase() === 'PERP') {
      perpTotal++;
      var fr = fundingMap[sym];
      if (fr !== undefined && fr !== null && !isNaN(fr) && fr > 0) perpPosFunding++;
    }
  }

  var breadthPct = validTotal > 0 ? (aboveSma50 / validTotal) * 100 : 0;
  var nhNlNet    = nhCount - nlCount;
  var medAtrPct  = M3__median_(atrPcts) || 0;
  var panicFlag  = medAtrPct > M3_CONST.PANIC_ATR_PCT;
  var fundBiasPct = perpTotal > 0 ? (perpPosFunding / perpTotal) * 100 : 0;

  var regime = M3__determineRegime_(breadthPct, btcAbove, ethAbove, medAtrPct);

  // Detect regime change
  var prevRegime = M3__lastStoredRegime_();
  var changed    = (prevRegime !== null) && (prevRegime !== regime);

  // Check for existing manual override for today — do not overwrite
  var existingRow = M3__findRegimeRowForDate_(dateStr);
  if (existingRow && existingRow[M3_COL.REGIME.Regime_Override] === true) {
    console.log('[M3] Regime override active for ' + dateStr + '. Skipping update.');
    return;
  }

  var row = new Array(16).fill('');
  var rc  = M3_COL.REGIME;
  row[rc.Date]                = dateStr;
  row[rc.BTC_Close]           = M3__safeNum_(btcData.close);
  row[rc.BTC_SMA_50]          = M3__safeNum_(btcData.sma50);
  row[rc.BTC_Above_SMA50]     = btcAbove;
  row[rc.ETH_Close]           = M3__safeNum_(ethData.close);
  row[rc.ETH_SMA_50]          = M3__safeNum_(ethData.sma50);
  row[rc.ETH_Above_SMA50]     = ethAbove;
  row[rc.Universe_Breadth_Pct]= breadthPct;
  row[rc.NH_NL_Net]           = nhNlNet;
  row[rc.Median_ATR_Pct_4H]   = medAtrPct;
  row[rc.Panic_Flag]          = panicFlag;
  row[rc.Funding_Bias_Pct]    = fundBiasPct;
  row[rc.Market_Regime]       = regime;
  row[rc.Regime_Changed]      = changed;
  row[rc.Regime_Override]     = false;
  row[rc.Notes]               = '';

  // Upsert
  var sh = M3__sh_(M3_CONST.SHEETS.REGIME);
  if (existingRow && existingRow._rowIndex) {
    sh.getRange(existingRow._rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sh.appendRow(row);
  }

  if (changed) {
    console.log('[M3] REGIME CHANGED: ' + prevRegime + ' → ' + regime);
  }
  console.log('[M3] Regime updated: ' + regime +
    ' (breadth=' + breadthPct.toFixed(1) + '%, medATR%=' + medAtrPct.toFixed(2) + '%)');
}

/**
 * Intra-day panic monitor. Called every 15 minutes.
 * If median ATR% across top-K exceeds the panic threshold,
 * forces a regime update immediately.
 */
function M3_checkPanicConditions() {
  var topK = M3__getTopKSymbols_();
  if (topK.length === 0) return;

  var symbolSet = {};
  for (var i = 0; i < topK.length; i++) symbolSet[topK[i].symbol] = true;

  var buckets  = M3__loadCandles_(symbolSet);
  var atrPcts  = [];

  for (var j = 0; j < topK.length; j++) {
    var sym  = topK[j].symbol;
    var ng4H = M3__ng_((buckets[sym] && buckets[sym]['4H']) || []);
    if (ng4H.length < M3_CONST.ATR_PERIOD + 1) continue;
    var atr4H = M3__calcAtr_(ng4H, M3_CONST.ATR_PERIOD);
    var cls   = ng4H[ng4H.length - 1].c;
    if (cls > 0) atrPcts.push((atr4H / cls) * 100);
  }

  var med = M3__median_(atrPcts) || 0;
  if (med > M3_CONST.PANIC_ATR_PCT) {
    console.warn('[M3] PANIC: median ATR% = ' + med.toFixed(2) + '% — forcing regime update.');
    M3_runRegimeUpdate();
  }
}

/**
 * Returns the current market regime string.
 * Returns 'NEUTRAL' as a safe default if no data exists.
 */
function M3_getCurrentRegime() {
  var s = M3__lastStoredRegime_();
  return s || 'NEUTRAL';
}

/**
 * Returns the most recent INDICATORS row for the symbol, or null.
 */
function M3_getIndicatorsRow(sym) {
  var data = M3__readAll_(M3_CONST.SHEETS.INDICATORS);
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][M3_COL.INDICATORS.Symbol]) === sym) return data[i];
  }
  return null;
}

/**
 * Returns the most recent LEVELS row for the symbol, or null.
 */
function M3_getLevelsRow(sym) {
  var data = M3__readAll_(M3_CONST.SHEETS.LEVELS);
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][M3_COL.LEVELS.Symbol]) === sym) return data[i];
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════════════════

function M3_testRunAll() {
  console.log('══════════════════════════════════════════════');
  console.log('  MODULE 3 TEST SUITE v' + M3_CONST.VERSION);
  console.log('══════════════════════════════════════════════');

  var results = [];

  function assert_(name, cond, detail) {
    results.push({ name: name, pass: !!cond, detail: detail || '' });
  }

  // ── Schema checks ────────────────────────────────────────────
  try {
    M3__validateSchemas_();
    assert_('Schema: all 3 headers valid', true);
  } catch (e) {
    assert_('Schema: all 3 headers valid', false, e.message);
  }

  // ── Math: SMA ────────────────────────────────────────────────
  var smaResult = M3__sma_([10, 20, 30, 40, 50], 3);
  assert_('SMA last 3 of [10,20,30,40,50] = 40', Math.abs(smaResult - 40) < 1e-9, smaResult);

  assert_('SMA insufficient data = null', M3__sma_([10, 20], 5) === null);

  // ── Math: ATR (synthetic candles with known TR) ───────────────
  // Candles: c=100 throughout, each H-L spread = 10 → TR = 10 every bar
  var synthCandles = [];
  for (var a = 0; a < 20; a++) {
    synthCandles.push({ h: 105, l: 95, c: 100 });
  }
  var atrResult = M3__calcAtr_(synthCandles, 14);
  assert_('ATR flat candles = 10', Math.abs(atrResult - 10) < 0.01, atrResult);

  // ── Math: RSI rising ─────────────────────────────────────────
  var rising = [];
  for (var b = 0; b < 20; b++) rising.push(100 + b);
  var rsiRising = M3__calcRsi_(rising, 14);
  assert_('RSI monotone rising > 99', rsiRising > 99, rsiRising);

  // RSI monotone falling
  var falling = [];
  for (var c2 = 0; c2 < 20; c2++) falling.push(100 - c2);
  var rsiFalling = M3__calcRsi_(falling, 14);
  assert_('RSI monotone falling < 1', rsiFalling < 1, rsiFalling);

  // RSI alternating ~50
  var altern = [100];
  for (var d = 0; d < 30; d++) altern.push(altern[altern.length - 1] + (d % 2 === 0 ? 1 : -1));
  var rsiAltern = M3__calcRsi_(altern, 14);
  assert_('RSI alternating near 50 (40-60)', rsiAltern > 40 && rsiAltern < 60, rsiAltern);

  // ── Math: BB constant price → width = 0 ──────────────────────
  var constCloses = [];
  for (var e = 0; e < 25; e++) constCloses.push(100);
  var bb0 = M3__calcBB_(constCloses, 20, 2);
  assert_('BB constant price: width = 0', Math.abs(bb0.width) < 1e-9, bb0.width);
  assert_('BB constant price: middle = 100', Math.abs(bb0.middle - 100) < 1e-9, bb0.middle);

  // ── Math: BB squeeze percentile ───────────────────────────────
  // First 80 candles: wide swings → large width. Last 20: tight → small width.
  var wideCloses = [], v2 = 100;
  for (var f = 0; f < 80; f++) {
    v2 += (f % 2 === 0 ? 10 : -10);
    wideCloses.push(v2);
  }
  var tightCloses = [];
  for (var g = 0; g < 40; g++) tightCloses.push(100 + (g % 2 === 0 ? 0.01 : -0.01));
  var allCloses = wideCloses.concat(tightCloses);
  var sqResult = M3__calcBBSqueeze_(allCloses, 20, 2, 60, 0.10);
  assert_('BB squeeze: tight band after wide = squeeze TRUE', sqResult.squeeze === true, JSON.stringify(sqResult));

  // ── Math: OBV ─────────────────────────────────────────────────
  // Rising closes → OBV should equal sum of all volumes
  var obv = M3__calcObvSeries_([100, 101, 102, 103], [0, 500, 600, 700]);
  assert_('OBV rising closes: last = 1800', obv[obv.length - 1] === 1800, obv);

  // ── Math: OLS slope ──────────────────────────────────────────
  var slope = M3__olsSlope_([0, 1, 2, 3, 4]);
  assert_('OLS slope [0,1,2,3,4] = 1', Math.abs(slope - 1) < 1e-9, slope);

  var slope0 = M3__olsSlope_([5, 5, 5, 5, 5]);
  assert_('OLS slope flat = 0', Math.abs(slope0) < 1e-9, slope0);

  // ── Math: Regime determination ────────────────────────────────
  assert_('Regime: breadth>60, BTC above, no panic = RISK-ON',
    M3__determineRegime_(65, true,  false, 2) === 'RISK-ON');
  assert_('Regime: breadth>60, ETH above, no panic = RISK-ON',
    M3__determineRegime_(70, false, true,  1) === 'RISK-ON');
  assert_('Regime: breadth<40, both below, no panic = RISK-OFF',
    M3__determineRegime_(30, false, false, 2) === 'RISK-OFF');
  assert_('Regime: panic override regardless of breadth = RISK-OFF',
    M3__determineRegime_(80, true,  true,  6) === 'RISK-OFF');
  assert_('Regime: breadth 50%, mixed = NEUTRAL',
    M3__determineRegime_(50, true,  false, 2) === 'NEUTRAL');
  assert_('Regime: breadth>60 but both below SMA = NEUTRAL',
    M3__determineRegime_(65, false, false, 2) === 'NEUTRAL');

  // ── Math: Level statuses ──────────────────────────────────────
  // Build synthetic candles with a known high (resistance = 120)
  var levelCandles = [];
  for (var h2 = 0; h2 < 10; h2++) levelCandles.push({ h: 115, l: 95, c: 105, gap: false });
  // Most recent candle closes above resistance
  var breakoutCandles = levelCandles.concat([{ h: 125, l: 110, c: 122, gap: false }]);
  assert_('Resistance: close > level = BROKEN',
    M3__resistanceStatus_(breakoutCandles, 120, 122, 0) === 'BROKEN');
  // Price far below with no tests
  assert_('Resistance: price >15% below, untested = STALE',
    M3__resistanceStatus_(levelCandles, 120, 100, 0) === 'STALE');
  // Active
  assert_('Resistance: just below with tests = ACTIVE',
    M3__resistanceStatus_(levelCandles, 120, 115, 3) === 'ACTIVE');

  // ── Median ───────────────────────────────────────────────────
  assert_('Median odd [3,1,4,1,5] = 3',    M3__median_([3,1,4,1,5])    === 3);
  assert_('Median even [1,2,3,4] = 2.5',   M3__median_([1,2,3,4])      === 2.5);

  // ── Percentile rank ───────────────────────────────────────────
  var pr = M3__pctileRank_(3, [1, 2, 3, 4, 5]);
  assert_('Percentile rank of 3 in [1-5] = 0.6', Math.abs(pr - 0.6) < 1e-9, pr);

  // ── Report ───────────────────────────────────────────────────
  var passed = 0, failed = 0;
  for (var k = 0; k < results.length; k++) {
    var r = results[k];
    if (r.pass) {
      passed++;
      console.log('  ✓ ' + r.name);
    } else {
      failed++;
      console.log('  ✗ ' + r.name + (r.detail ? ' [' + r.detail + ']' : ''));
    }
  }

  console.log('──────────────────────────────────────────────');
  if (failed === 0) {
    console.log('  ✅ ALL ' + passed + ' TESTS PASSED');
  } else {
    console.log('  ❌ ' + failed + ' FAILED  (' + passed + ' passed)');
  }
  console.log('══════════════════════════════════════════════');

  return failed === 0;
}

// ═══════════════════════════════════════════════════════════════
// PRIVATE ORCHESTRATION HELPERS
// ═══════════════════════════════════════════════════════════════

/** Validates all three Module 3 sheet schemas. Throws on first mismatch. */
function M3__validateSchemas_() {
  M3__assertHeaders_(M3_CONST.SHEETS.LEVELS, [
    'Symbol','Timestamp','Resistance_Value','Support_Value','Lookback_N',
    'Daily_Resistance','Daily_Support','Times_Tested_Resistance','Times_Tested_Support',
    'Resistance_Status','Support_Status','Next_Higher_Resistance','Next_Lower_Support',
    'Room_to_Run_Long_R','Room_to_Fall_Short_R','ATR_14_At_Calc','Current_Close'
  ]);
  M3__assertHeaders_(M3_CONST.SHEETS.INDICATORS, [
    'Symbol','Timestamp','Timeframe','ATR_14','ATR_14_Lagged_30','ATR_Ratio',
    'BB_Upper','BB_Lower','BB_Middle','BB_Width','BB_Width_Percentile_60','BB_Squeeze',
    'SMA_50_Daily','Volume_SMA_30','Volume_Ratio','RSI_14','OBV','OBV_Slope_20',
    'Rel_Perf_vs_BTC_7d','Consolidation_Count_High','Consolidation_Count_Low',
    'Wick_To_Body_Ratio_Avg_30','Funding_Rate_Current'
  ]);
  M3__assertHeaders_(M3_CONST.SHEETS.REGIME, [
    'Date','BTC_Close','BTC_SMA_50','BTC_Above_SMA50',
    'ETH_Close','ETH_SMA_50','ETH_Above_SMA50',
    'Universe_Breadth_Pct','NH_NL_Net','Median_ATR_Pct_4H',
    'Panic_Flag','Funding_Bias_Pct','Market_Regime',
    'Regime_Changed','Regime_Override','Notes'
  ]);
}

/** Builds the INDICATORS output row in exact schema order. */
function M3__makeIndRow_(ts, sym, v) {
  var row = new Array(23).fill('');
  var ic  = M3_COL.INDICATORS;
  row[ic.Symbol]                    = sym;
  row[ic.Timestamp]                 = ts;
  row[ic.Timeframe]                 = '4H';
  row[ic.ATR_14]                    = M3__safeNum_(v.atr14);
  row[ic.ATR_14_Lagged_30]          = M3__safeNum_(v.atr14Lagged);
  row[ic.ATR_Ratio]                 = M3__safeNum_(v.atrRatio);
  row[ic.BB_Upper]                  = M3__safeNum_(v.bbUpper);
  row[ic.BB_Lower]                  = M3__safeNum_(v.bbLower);
  row[ic.BB_Middle]                 = M3__safeNum_(v.bbMiddle);
  row[ic.BB_Width]                  = M3__safeNum_(v.bbWidth);
  row[ic.BB_Width_Percentile_60]    = M3__safeNum_(v.bbPctile);
  row[ic.BB_Squeeze]                = (v.bbSqueeze === null ? '' : v.bbSqueeze);
  row[ic.SMA_50_Daily]              = M3__safeNum_(v.sma50D);
  row[ic.Volume_SMA_30]             = M3__safeNum_(v.volSma);
  row[ic.Volume_Ratio]              = M3__safeNum_(v.volRat);
  row[ic.RSI_14]                    = M3__safeNum_(v.rsi14);
  row[ic.OBV]                       = M3__safeNum_(v.obvLast);
  row[ic.OBV_Slope_20]              = M3__safeNum_(v.obvSlope);
  row[ic.Rel_Perf_vs_BTC_7d]        = M3__safeNum_(v.relPerf);
  row[ic.Consolidation_Count_High]  = v.consHigh;
  row[ic.Consolidation_Count_Low]   = v.consLow;
  row[ic.Wick_To_Body_Ratio_Avg_30] = M3__safeNum_(v.wickAvg);
  row[ic.Funding_Rate_Current]      = v.funding !== undefined ? v.funding : '';
  return row;
}

/** Builds the LEVELS output row in exact schema order. */
function M3__makeLvlRow_(ts, sym, v) {
  var row = new Array(17).fill('');
  var lc  = M3_COL.LEVELS;
  row[lc.Symbol]                  = sym;
  row[lc.Timestamp]               = ts;
  row[lc.Resistance_Value]        = M3__safeNum_(v.resistance);
  row[lc.Support_Value]           = M3__safeNum_(v.support);
  row[lc.Lookback_N]              = v.lookbackN;
  row[lc.Daily_Resistance]        = M3__safeNum_(v.dailyRes);
  row[lc.Daily_Support]           = M3__safeNum_(v.dailySup);
  row[lc.Times_Tested_Resistance] = v.timesTestedR;
  row[lc.Times_Tested_Support]    = v.timesTestedS;
  row[lc.Resistance_Status]       = v.resStatus;
  row[lc.Support_Status]          = v.supStatus;
  row[lc.Next_Higher_Resistance]  = M3__safeNum_(v.extRes);
  row[lc.Next_Lower_Support]      = M3__safeNum_(v.extSup);
  row[lc.Room_to_Run_Long_R]      = M3__safeNum_(v.roomRun);
  row[lc.Room_to_Fall_Short_R]    = M3__safeNum_(v.roomFall);
  row[lc.ATR_14_At_Calc]          = M3__safeNum_(v.atr14);
  row[lc.Current_Close]           = M3__safeNum_(v.currentClose);
  return row;
}

/** Gets close + SMA50 from the first candidate symbol that has enough 1D data. */
function M3__leaderStats_(buckets, candidates) {
  for (var i = 0; i < candidates.length; i++) {
    var sym  = candidates[i];
    var ng1D = M3__ng_((buckets[sym] && buckets[sym]['1D']) || []);
    if (ng1D.length >= M3_CONST.SMA_DAILY_PERIOD) {
      var closes = ng1D.map(function(r) { return r.c; });
      return {
        close: closes[closes.length - 1],
        sma50: M3__sma_(closes, M3_CONST.SMA_DAILY_PERIOD)
      };
    }
  }
  return { close: null, sma50: null };
}

/** Returns the Market_Regime string from the most recent REGIME row, or null. */
function M3__lastStoredRegime_() {
  var data = M3__readAll_(M3_CONST.SHEETS.REGIME);
  if (data.length < 2) return null;
  return String(data[data.length - 1][M3_COL.REGIME.Market_Regime] || '');
}

/**
 * Finds the REGIME row for a given dateStr (yyyy-MM-dd).
 * Returns the row array augmented with ._rowIndex (1-based sheet row), or null.
 */
function M3__findRegimeRowForDate_(dateStr) {
  var data = M3__readAll_(M3_CONST.SHEETS.REGIME);
  for (var i = 1; i < data.length; i++) {
    var d = data[i][M3_COL.REGIME.Date];
    var ds = (d instanceof Date) ? d.toISOString().slice(0, 10) : String(d).slice(0, 10);
    if (ds === dateStr) {
      var row       = data[i];
      row._rowIndex = i + 1; // sheet row number (1-based, offset by header)
      return row;
    }
  }
  return null;
}

/** Returns value if finite number, else '' (prevents NaN/Infinity in sheet). */
function M3__safeNum_(v) {
  return (v !== null && v !== undefined && isFinite(v)) ? v : '';
}


/**
 * MODULE 3 — Diagnostic
 *
 * Read-only diagnostic for Volume_SMA_30 and Volume_Ratio.
 * Helps confirm whether tiny Volume_Ratio values are caused by stale/incomplete candles.
 *
 * Run:
 *   M3_diagVolumeRatio()
 */
function M3_diagVolumeRatio() {
  console.log('[M3][DIAG] ═══════════════════════════════════════');
  console.log('[M3][DIAG] Volume Ratio Diagnostic Starting');
  console.log('[M3][DIAG] ═══════════════════════════════════════');

  try {
    var topK = M3__getTopKSymbols_();
    if (!topK || topK.length === 0) {
      console.log('[M3][DIAG] No top-K symbols found.');
      console.log('[M3][DIAG] ═══════════════════════════════════════');
      return;
    }

    var symbolSet = {};
    for (var i = 0; i < topK.length; i++) {
      symbolSet[topK[i].symbol] = true;
    }

    var buckets = M3__loadCandles_(symbolSet);

    console.log('[M3][DIAG] TopK symbols=' + topK.length +
      ' | Volume SMA period=' + M3_CONST.VOLUME_SMA_PERIOD);

    for (var j = 0; j < topK.length; j++) {
      var sym = topK[j].symbol;

      var raw4H = (buckets[sym] && buckets[sym]['4H']) || [];
      var ng4H = M3__ng_(raw4H);

      console.log('[M3][DIAG] ──────────────────────────────────────');
      console.log('[M3][DIAG] Symbol=' + sym +
        ' | raw4H=' + raw4H.length +
        ' | completed4H=' + ng4H.length);

      if (raw4H.length === 0) {
        console.log('[M3][DIAG]   No raw 4H candles.');
        continue;
      }

      // Last 5 raw candles
      var rawTail = raw4H.slice(-5);
      console.log('[M3][DIAG]   Last raw 4H candles:');
      for (var r = 0; r < rawTail.length; r++) {
        var rr = rawTail[r];
        console.log(
          '[M3][DIAG]     ts=' + rr.ts +
          ' v=' + rr.v +
          ' c=' + rr.c +
          ' gap=' + rr.gap +
          ' stale=' + rr.stale
        );
      }

      // Last 5 completed candles
      var ngTail = ng4H.slice(-5);
      console.log('[M3][DIAG]   Last completed 4H candles:');
      for (var n = 0; n < ngTail.length; n++) {
        var nr = ngTail[n];
        console.log(
          '[M3][DIAG]     ts=' + nr.ts +
          ' v=' + nr.v +
          ' c=' + nr.c +
          ' gap=' + nr.gap +
          ' stale=' + nr.stale
        );
      }

      if (ng4H.length < M3_CONST.VOLUME_SMA_PERIOD) {
        console.log('[M3][DIAG]   Insufficient completed candles for Volume_SMA_30.');
        continue;
      }

      var vols4H = ng4H.map(function(x) { return x.v; });
      var latestVol = vols4H[vols4H.length - 1];
      var volSma = M3__sma_(vols4H, M3_CONST.VOLUME_SMA_PERIOD);
      var volRatio = (volSma && volSma > 0) ? latestVol / volSma : null;

      console.log('[M3][DIAG]   latestCompletedVolume=' + latestVol);
      console.log('[M3][DIAG]   volumeSMA30=' + volSma);
      console.log('[M3][DIAG]   volumeRatio=' + volRatio);

      // Compare against raw last candle to catch partial/stale distortions
      var rawLast = raw4H[raw4H.length - 1];
      if (rawLast) {
        console.log('[M3][DIAG]   rawLastVsCompletedLastSame=' +
          ((ng4H.length > 0 && rawLast.ts === ng4H[ng4H.length - 1].ts) ? 'YES' : 'NO'));
      }
    }

    console.log('[M3][DIAG] ═══════════════════════════════════════');
    console.log('[M3][DIAG] Volume Ratio Diagnostic Complete');
    console.log('[M3][DIAG] ═══════════════════════════════════════');

  } catch (e) {
    console.error('[M3][DIAG] FATAL: ' + e.message);
    console.error('[M3][DIAG] Stack: ' + e.stack);
  }
}
