/**
 * MODULE 9 — Research + Audit
 * Consolidated SIM (Response 1) + optional LOGS scoring (Response 3)
 * ES5-only
 * @version 3.2.5
 *
 * NOTES (3.2.5):
 * - Single authoritative M9__rangeIsEmpty_ (no duplicates)
 * - M9__ensureHeader_ now ignores row 1 when checking “extra columns empty”
 * - M9-owned sheets (BACKTEST_RESULTS, ARCHIVE) self-heal via backup+rebuild on schema drift
 * - SIM TP1/RR bug fixed via M9__tp1PriceFromRR_ (no silent zero-trade due to RR_Minimum)
 */

var __M9G__ = (typeof globalThis !== 'undefined') ? globalThis : this;

if (!__M9G__.M9_CONST) {
  __M9G__.M9_CONST = {
    VERSION: '3.2.5',

    SHEETS: {
      // Upstream (read-only)
      CONFIG: 'CONFIG',
      DATA_CLEAN: 'DATA_CLEAN',
      POSITIONS: 'POSITIONS',
      ORDERS: 'ORDERS',
      FUNDING_LOG: 'FUNDING_LOG',
      COLLATERAL: 'COLLATERAL',
      REGIME: 'REGIME',       // optional (SIM)
      SIGNALS: 'SIGNALS',     // optional (LOGS)
      RISK_CALC: 'RISK_CALC', // optional (LOGS)

      // M9-owned (write)
      BACKTEST_RESULTS: 'BACKTEST_RESULTS',
      ARCHIVE: 'ARCHIVE'
    },

    HEADERS: {
      BACKTEST_RESULTS: [
        'Backtest_ID','Start_Date','End_Date','Total_Trades','Long_Trades','Short_Trades',
        'Win_Rate_Total','Win_Rate_Long','Win_Rate_Short','Avg_Win_Loss_Ratio','Profit_Factor',
        'Expectancy_R','Max_Drawdown_Pct','Max_Drawdown_Duration_Days','Sharpe_Ratio',
        'Liquidation_Events_Pct','Liquidation_Events_Count','Avg_Funding_Cost_Per_Trade',
        'Avg_Borrow_Cost_Per_Trade','Carry_Cost_Pct_Gross_Profit','Effective_Leverage_Avg',
        'DQS_Winners_Avg','DQS_Losers_Avg','R_Multiple_Premium','R_Multiple_High',
        'R_Multiple_Standard','Win_Rate_RiskOn','Win_Rate_Neutral'
      ],
      ARCHIVE: [
        'Date_Opened','Date_Closed','Asset','Direction','Qty',
        'Entry_ZAR','Exit_ZAR','Fees_ZAR','Funding_Paid_ZAR',
        'Funding_Received_ZAR','Borrow_Cost_ZAR','Net_PnL_ZAR',
        'Holding_Days','FX_Rate_At_Open','FX_Rate_At_Close','Event_Type'
      ]
    },

    TAX_EVENT: {
      TRADE_CLOSE: 'TRADE_CLOSE',
      CORE_PARTIAL_CLOSE: 'CORE_PARTIAL_CLOSE',
      RUNNER_PARTIAL_CLOSE: 'RUNNER_PARTIAL_CLOSE',
      FUNDING_SETTLEMENT: 'FUNDING_SETTLEMENT',
      COLLATERAL_CONVERSION: 'COLLATERAL_CONVERSION'
    },

    BACKTEST: {
      IN_SAMPLE_PCT: 0.60,
      MIN_MONTHS: 12,
      RISK_FREE_ANNUAL: 0.05,

      // Conservative fallback drags (SIM)
      FUNDING_AVG_EST_PER_8H_PCT: 0.00003,
      BORROW_AVG_EST_PER_DAY_PCT: 0.0005,

      // Liquidation proxy (SIM)
      LIQ_PROXY_MM_MULT: 1.1,
      LIQ_BUFFER_R: 3.0,

      MAX_CONCURRENT_LEVERAGED: 1
    },

    THRESH_OOS: {
      MIN_TRADES: 50,
      WIN_RATE_LONG: 0.40,
      WIN_RATE_SHORT: 0.35,
      AVG_WIN_LOSS: 2.5,
      PROFIT_FACTOR: 1.5,
      EXPECTANCY_R: 0.50,
      MAX_DD_PCT: 0.20,
      MAX_DD_DAYS: 45,
      SHARPE: 1.0,
      LIQ_EVENTS_PCT: 0.05
    }
  };
}

if (!__M9G__.M9_COL) {
  __M9G__.M9_COL = {
    BACKTEST_RESULTS: {
      Backtest_ID: 0, Start_Date: 1, End_Date: 2, Total_Trades: 3,
      Long_Trades: 4, Short_Trades: 5, Win_Rate_Total: 6, Win_Rate_Long: 7,
      Win_Rate_Short: 8, Avg_Win_Loss_Ratio: 9, Profit_Factor: 10, Expectancy_R: 11,
      Max_Drawdown_Pct: 12, Max_Drawdown_Duration_Days: 13, Sharpe_Ratio: 14,
      Liquidation_Events_Pct: 15, Liquidation_Events_Count: 16,
      Avg_Funding_Cost_Per_Trade: 17, Avg_Borrow_Cost_Per_Trade: 18,
      Carry_Cost_Pct_Gross_Profit: 19, Effective_Leverage_Avg: 20,
      DQS_Winners_Avg: 21, DQS_Losers_Avg: 22, R_Multiple_Premium: 23,
      R_Multiple_High: 24, R_Multiple_Standard: 25, Win_Rate_RiskOn: 26,
      Win_Rate_Neutral: 27
    },

    ARCHIVE: {
      Date_Opened: 0, Date_Closed: 1, Asset: 2, Direction: 3, Qty: 4,
      Entry_ZAR: 5, Exit_ZAR: 6, Fees_ZAR: 7, Funding_Paid_ZAR: 8,
      Funding_Received_ZAR: 9, Borrow_Cost_ZAR: 10, Net_PnL_ZAR: 11,
      Holding_Days: 12, FX_Rate_At_Open: 13, FX_Rate_At_Close: 14, Event_Type: 15
    }
  };
}

var M9_CONST = __M9G__.M9_CONST;
var M9_COL = __M9G__.M9_COL;

/* =========================================================
 * MODULE 9 — Utilities (ES5-only)
 * ========================================================= */

function M9__ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }

function M9__sheetExists_(name) {
  return !!M9__ss_().getSheetByName(name);
}

function M9__sh_(name) {
  var sh = M9__ss_().getSheetByName(name);
  if (!sh) throw new Error('[M9] Missing sheet: ' + name);
  return sh;
}

/**
 * Range emptiness test: returns true only if BOTH values and formulas are blank.
 * ES5-only.
 */
function M9__rangeIsEmpty_(sheet, startRow, startCol, numRows, numCols) {
  if (numRows <= 0 || numCols <= 0) return true;

  var r = sheet.getRange(startRow, startCol, numRows, numCols);
  var vals = r.getValues();
  var formulas = r.getFormulas();

  for (var i = 0; i < vals.length; i++) {
    for (var j = 0; j < vals[i].length; j++) {
      if (formulas[i][j] && String(formulas[i][j]).trim() !== '') return false;
      var v = vals[i][j];
      if (v === '' || v === null) continue;
      return false;
    }
  }
  return true;
}

/**
 * Backup current sheet as a new tab, then rebuild the original tab to EXACT schema.
 * Used only for M9-owned tabs (BACKTEST_RESULTS, ARCHIVE) to self-heal schema drift.
 */
function M9__backupAndRebuildSheetToSchema_(sheet, headers, reasonTag) {
  var ss = M9__ss_();
  var ts = new Date().toISOString().replace(/[:.]/g, '-');
  var base = sheet.getName();

  var backupName = base + '__BACKUP__' + String(reasonTag || 'SCHEMA') + '__' + ts;
  if (backupName.length > 99) backupName = backupName.slice(0, 99);

  // 1) Backup exact current state
  var copy = sheet.copyTo(ss);
  copy.setName(backupName);

  // 2) Rebuild original to exact schema
  sheet.clear();

  var want = headers.length;
  var maxCols = sheet.getMaxColumns();

  if (maxCols > want) sheet.deleteColumns(want + 1, maxCols - want);
  else if (maxCols < want) sheet.insertColumnsAfter(maxCols, want - maxCols);

  sheet.getRange(1, 1, 1, want).setValues([headers]).setFontWeight('bold');
}

/**
 * Strict schema enforcer:
 * - Exact header match (ordered)
 * - Exact column width match
 * - Extra columns allowed ONLY if rows 2..N in those columns are empty (header text ignored)
 * - For M9-owned tabs, schema conflicts auto-backup + rebuild instead of hard-failing
 */
function M9__ensureHeader_(sheetName, headerArr) {
  var ss = M9__ss_();
  var sh = ss.getSheetByName(sheetName);
  if (!sh) sh = ss.insertSheet(sheetName);

  var expectedCols = headerArr.length;

  var isM9Owned =
    (sheetName === M9_CONST.SHEETS.BACKTEST_RESULTS) ||
    (sheetName === M9_CONST.SHEETS.ARCHIVE);

  // Ensure enough physical columns exist to read/write header safely
  var lastCol = sh.getLastColumn();
  if (lastCol < expectedCols) {
    if (lastCol === 0) lastCol = 1;
    sh.insertColumnsAfter(lastCol, expectedCols - lastCol);
  }

  // Strict header check (ordered)
  var existing = sh.getRange(1, 1, 1, expectedCols).getValues()[0];
  var mismatchAt = -1;
  for (var i = 0; i < expectedCols; i++) {
    if (String(existing[i] || '').trim() !== String(headerArr[i]).trim()) {
      mismatchAt = i;
      break;
    }
  }

  if (mismatchAt !== -1) {
    if (sh.getLastRow() <= 1) {
      sh.getRange(1, 1, 1, expectedCols).setValues([headerArr]).setFontWeight('bold');
    } else if (isM9Owned) {
      M9__backupAndRebuildSheetToSchema_(sh, headerArr, 'HEADER_MISMATCH_COL_' + (mismatchAt + 1));
      return sh;
    } else {
      throw new Error('[M9] Header mismatch on ' + sheetName + ' col ' + (mismatchAt + 1) +
                      ': expected "' + headerArr[mismatchAt] + '" got "' + (existing[mismatchAt] || '') + '"');
    }
  }

  // Enforce exact width: trim extra cols ONLY if rows 2..N are empty in extra area
  lastCol = sh.getLastColumn();
  if (lastCol > expectedCols) {
    var extraCols = lastCol - expectedCols;
    var numDataRows = Math.max(sh.getLastRow() - 1, 0); // rows below header
    var extrasEmptyBelowHeader = M9__rangeIsEmpty_(sh, 2, expectedCols + 1, numDataRows, extraCols);

    if (extrasEmptyBelowHeader) {
      sh.deleteColumns(expectedCols + 1, extraCols);
    } else if (isM9Owned) {
      M9__backupAndRebuildSheetToSchema_(sh, headerArr, 'EXTRA_COLS_HAVE_DATA');
      return sh;
    } else {
      throw new Error('[M9] Sheet "' + sheetName + '" has more than ' + expectedCols +
                      ' columns (lastCol=' + lastCol + ') AND extra columns contain data/formulas (rows 2+). ' +
                      'Schema requires EXACT width.');
    }
  }

  // If sheet is blank/header-only, stamp the header
  if (sh.getLastRow() <= 1) {
    sh.getRange(1, 1, 1, expectedCols).setValues([headerArr]).setFontWeight('bold');
  }

  if (sh.getLastColumn() !== expectedCols) {
    throw new Error('[M9] Width mismatch on ' + sheetName + ': expected ' + expectedCols +
                    ' cols, got ' + sh.getLastColumn());
  }

  return sh;
}

function M9__readAll_(sheetName) {
  var sh = M9__sh_(sheetName);
  if (sh.getLastRow() === 0) return [];
  return sh.getDataRange().getValues();
}

function M9__readAllIfExists_(sheetName) {
  if (!M9__sheetExists_(sheetName)) return [];
  return M9__readAll_(sheetName);
}

function M9__appendRows_(sheetName, rows) {
  if (!rows || rows.length === 0) return;
  var sh = M9__sh_(sheetName);
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function M9__headerMap_(headerRow) {
  var m = {};
  for (var i = 0; i < headerRow.length; i++) {
    var k = String(headerRow[i] || '').trim();
    if (k) m[k] = i;
  }
  return m;
}

function M9__idx_(hm, name, required) {
  if (hm.hasOwnProperty(name)) return hm[name];
  if (required) throw new Error('[M9] Missing required column: ' + name);
  return -1;
}

function M9__safeNum_(v) {
  var n = parseFloat(v);
  return isFinite(n) ? n : 0;
}

function M9__isoDate_(d, tz) {
  return Utilities.formatDate(d, tz || 'Africa/Johannesburg', 'yyyy-MM-dd');
}

function M9__uuid_() { return Utilities.getUuid(); }

function M9__blankRow_(n) {
  var r = [];
  for (var i = 0; i < n; i++) r.push('');
  return r;
}

function M9__props_() {
  try { return PropertiesService.getDocumentProperties(); } catch (e) {}
  return PropertiesService.getScriptProperties();
}

/* ---------------- CONFIG (best-effort) ----------------
 * CONFIG: rows Key|Value
 * Optional override JSON in Document Properties key "M9_CFG_OVERRIDE"
 */
function M9__cfgLoadMap_() {
  var out = {};
  var rows = M9__readAllIfExists_(M9_CONST.SHEETS.CONFIG);

  for (var i = 0; i < rows.length; i++) {
    var k = String(rows[i][0] || '').trim();
    var v = rows[i][1];
    if (!k || k === 'Key') continue;
    out[k] = v;
  }

  var ovRaw = M9__props_().getProperty('M9_CFG_OVERRIDE');
  if (ovRaw) {
    try {
      var ov = JSON.parse(ovRaw);
      for (var kk in ov) if (ov.hasOwnProperty(kk)) out[kk] = ov[kk];
    } catch (e2) {}
  }
  return out;
}

function M9__cfgNum_(cfg, key, dflt) {
  if (cfg && cfg.hasOwnProperty(key)) return M9__safeNum_(cfg[key]);
  return dflt;
}

function M9__cfgStr_(cfg, key, dflt) {
  if (cfg && cfg.hasOwnProperty(key)) return String(cfg[key]);
  return dflt;
}

/* ---------------- Stats ---------------- */

function M9__mean_(arr) {
  if (!arr || arr.length === 0) return 0;
  var s = 0;
  for (var i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}

function M9__stdDev_(arr) {
  if (!arr || arr.length < 2) return 0;
  var m = M9__mean_(arr);
  var s2 = 0;
  for (var i = 0; i < arr.length; i++) {
    var d = arr[i] - m;
    s2 += d * d;
  }
  return Math.sqrt(s2 / (arr.length - 1));
}

function M9__maxDrawdown_(equityCurve) {
  if (!equityCurve || equityCurve.length < 2) return { maxPct: 0, maxDurSteps: 0 };
  var peak = equityCurve[0];
  var peakIdx = 0;
  var maxDD = 0;
  var maxDur = 0;

  for (var i = 1; i < equityCurve.length; i++) {
    if (equityCurve[i] > peak) { peak = equityCurve[i]; peakIdx = i; }
    var dd = (peak - equityCurve[i]) / (peak === 0 ? 1 : peak);
    if (dd > maxDD) maxDD = dd;
    var dur = i - peakIdx;
    if (dd > 0 && dur > maxDur) maxDur = dur;
  }
  return { maxPct: maxDD, maxDurSteps: maxDur };
}

function M9__sharpeDaily_(dailyEquity, rfAnnual) {
  if (!dailyEquity || dailyEquity.length < 3) return 0;
  var rets = [];
  for (var i = 1; i < dailyEquity.length; i++) {
    var prev = dailyEquity[i - 1];
    var cur = dailyEquity[i];
    rets.push(prev === 0 ? 0 : (cur - prev) / prev);
  }
  var mean = M9__mean_(rets);
  var sd = M9__stdDev_(rets);
  var rfDaily = (rfAnnual || 0) / 365;
  return sd === 0 ? 0 : (mean - rfDaily) / sd * Math.sqrt(365);
}

/* ---------------- Indicators (Wilder) — SIM ---------------- */

function M9__atrWilder_(highs, lows, closes, period) {
  var n = closes.length;
  var atr = [];
  for (var i = 0; i < n; i++) atr.push(null);
  if (n <= period) return atr;

  var sumTR = 0;
  for (i = 1; i <= period; i++) {
    var tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    sumTR += tr;
  }

  var prevAtr = sumTR / period;
  atr[period] = prevAtr;

  for (i = period + 1; i < n; i++) {
    tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    prevAtr = ((prevAtr * (period - 1)) + tr) / period;
    atr[i] = prevAtr;
  }
  return atr;
}

function M9__rsiWilder_(closes, period) {
  var n = closes.length;
  var rsi = [];
  for (var i = 0; i < n; i++) rsi.push(null);
  if (n <= period) return rsi;

  var gain = 0, loss = 0;
  for (i = 1; i <= period; i++) {
    var chg = closes[i] - closes[i - 1];
    if (chg >= 0) gain += chg; else loss += (-chg);
  }
  var avgG = gain / period;
  var avgL = loss / period;

  rsi[period] = (avgL === 0) ? 100 : (100 - (100 / (1 + (avgG / avgL))));

  for (i = period + 1; i < n; i++) {
    chg = closes[i] - closes[i - 1];
    var g = (chg > 0) ? chg : 0;
    var l = (chg < 0) ? (-chg) : 0;
    avgG = ((avgG * (period - 1)) + g) / period;
    avgL = ((avgL * (period - 1)) + l) / period;
    rsi[i] = (avgL === 0) ? 100 : (100 - (100 / (1 + (avgG / avgL))));
  }
  return rsi;
}

function M9__sma_(arr, period) {
  var n = arr.length;
  var out = [];
  for (var i = 0; i < n; i++) out.push(null);
  if (period <= 0) return out;

  var sum = 0;
  for (i = 0; i < n; i++) {
    sum += arr[i];
    if (i >= period) sum -= arr[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

/* ---------------- Equity curve utilities ---------------- */

function M9__dailyEquityFromCurve_(curve, tz) {
  var map = {};
  for (var i = 0; i < curve.length; i++) {
    var k = M9__isoDate_(new Date(curve[i].ms), tz);
    map[k] = curve[i].equity; // last close of day
  }
  var keys = [];
  for (var kk in map) if (map.hasOwnProperty(kk)) keys.push(kk);
  keys.sort();
  var out = [];
  for (i = 0; i < keys.length; i++) out.push(map[keys[i]]);
  return out;
}

function M9__curveSegmentFromMs_(curve, fromMs) {
  if (!curve || curve.length === 0) return [];
  var lastEq = curve[0].equity;
  for (var i = 0; i < curve.length; i++) {
    if (curve[i].ms <= fromMs) lastEq = curve[i].equity;
    else break;
  }
  var out = [{ ms: fromMs, equity: lastEq }];
  for (i = 0; i < curve.length; i++) if (curve[i].ms > fromMs) out.push(curve[i]);
  return out;
}

/* ---------------- CSV ---------------- */

function M9__rowsToCsv_(rows) {
  function esc_(v) {
    var s = String(v === null || v === undefined ? '' : v);
    if (s.indexOf('"') >= 0) s = s.replace(/"/g, '""');
    if (s.indexOf(',') >= 0 || s.indexOf('\n') >= 0) s = '"' + s + '"';
    return s;
  }
  var lines = [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var parts = [];
    for (var j = 0; j < r.length; j++) parts.push(esc_(r[j]));
    lines.push(parts.join(','));
  }
  return lines.join('\n');
}

/* ---------------- ARCHIVE DEDUP KEY ---------------- */

function M9__archiveKeyPart_(v) {
  if (v instanceof Date) return 'D:' + v.getTime();
  if (typeof v === 'number') return 'N:' + String(v);
  if (v === null || v === undefined) return '';
  return 'S:' + String(v);
}

function M9__archiveKey_(row16) {
  // Collision-resistant: all 16 fields normalized.
  var parts = [];
  for (var i = 0; i < 16; i++) parts.push(M9__archiveKeyPart_(row16[i]));
  return parts.join('¦');
}

/* ---------------- SIM TP1 helper ---------------- */

/**
 * TP1 helper: sets TP1 at max(2R, rrMin).
 * Prevents rrMin > 2 from creating internally inconsistent SIM behavior.
 */
function M9__tp1PriceFromRR_(entryProxyPrice, rDist, rrMin, dir) {
  if (!isFinite(entryProxyPrice) || !isFinite(rDist) || rDist <= 0) return entryProxyPrice;

  var rr = isFinite(rrMin) ? Math.max(2.0, rrMin) : 2.0;

  if (dir === 'LONG') return entryProxyPrice + rr * rDist;
  return entryProxyPrice - rr * rDist;
}

/* =========================================================
 * MODULE 9 — Backtesting (SIM + optional LOGS scoring)
 * ========================================================= */

function M9_runBacktestAuto() {
  var cfg = M9__cfgLoadMap_();
  var mode = String(M9__cfgStr_(cfg, 'M9_Backtest_Mode', 'SIM')).toUpperCase();
  if (mode === 'LOGS') return M9_runBacktestMetricsFromLogs();
  return M9_runWalkForwardBacktest();
}



/* =========================================================
 * MODULE 9 — SIM Walk-forward (Modularized)
 * ES5-only. Drop-in replacement for M9_runWalkForwardBacktest()
 * ========================================================= */

/** ---- Params / Date Range ---- **/
function M9__btLoadSimParams_(cfg) {
  var p = {};

  M9__cfgLogRaw_(cfg, 'Invert_All_Signals', 'FALSE');
  M9__cfgLogRaw_(cfg, 'V2_Long_Only', 'TRUE');
  M9__cfgLogRaw_(cfg, 'DQS_Gate_V2', '45');
  M9__cfgLogRaw_(cfg, 'Leverage_Mode', 'FIXED_1X');
  M9__cfgLogRaw_(cfg, 'Max_Leverage', '1');

  p.tz = M9__cfgStr_(cfg, 'Timezone', 'Africa/Johannesburg');
  p.riskPct = M9__cfgNum_(cfg, 'Risk_Per_Trade_Pct', 0.02);
  p.maxConcurrentPos = Math.max(1, M9__cfgNum_(cfg, 'Max_Concurrent_Positions', 3));
  p.maxMarginUsedPct = M9__cfgNum_(cfg, 'Max_Margin_Used_Pct', 1.00);

  p.lookbackN = Math.max(15, M9__cfgNum_(cfg,
    'Resistance_Lookback_N',
    M9__cfgNum_(cfg, 'Breakout_Lookback_Candles', 30)
  ));

  p.v2BreakoutLookbackN = Math.max(6, M9__cfgNum_(cfg,
    'V2_Breakout_Lookback_N',
    M9__cfgNum_(cfg, 'V2_Breakout_Lookback_Candles', 12)
  ));

  p.atrPeriod = Math.max(5, M9__cfgNum_(cfg, 'ATR_Period', 14));

  p.atrStopMult = M9__cfgNum_(cfg,
    'ATR_Stop_Multiple',
    M9__cfgNum_(cfg, 'ATR_Stop_Multiplier', 1.5)
  );

  p.rrMin = M9__cfgNum_(cfg,
    'RR_Minimum',
    M9__cfgNum_(cfg, 'Reward_To_Risk_Min', 2.0)
  );

  p.rsiPeriod = Math.max(5, M9__cfgNum_(cfg, 'RSI_Period', 14));

  p.rsiLongMax = M9__cfgNum_(cfg,
    'RSI_Overbought_Long',
    M9__cfgNum_(cfg, 'RSI_Long_Max', 75)
  );

  p.volMult = M9__cfgNum_(cfg,
    'Volume_Multiplier_Threshold',
    M9__cfgNum_(cfg, 'Volume_Multiplier', 1.5)
  );

  p.cooldownCandles = Math.max(0, M9__cfgNum_(cfg,
    'Cooldown_After_Stopout_Candles',
    M9__cfgNum_(cfg, 'Cooldown_Period_Candles', 12)
  ));

  p.feeTaker = M9__cfgNum_(cfg,
    'Taker_Fee_Pct',
    M9__cfgNum_(cfg, 'Fee_Taker_Pct', 0.001)
  );

  p.slipPct = M9__cfgNum_(cfg,
    'Slippage_Pct',
    M9__cfgNum_(cfg, 'Slippage_Assumption_Pct', 0.0015)
  );

  p.fundingAvgEstPer8hPct = M9__cfgNum_(cfg,
    'Funding_Avg_Est_Per_8H_Pct',
    M9_CONST.BACKTEST.FUNDING_AVG_EST_PER_8H_PCT
  );

  p.borrowAvgEstPerDayPct = M9__cfgNum_(cfg,
    'Borrow_Avg_Est_Per_Day_Pct',
    M9_CONST.BACKTEST.BORROW_AVG_EST_PER_DAY_PCT
  );

  p.forceLiqEnabled = M9__cfgBool_(cfg, 'Backtest_Force_Liquidation_Enabled', true);
  p.marginFractionFloorPct = M9__cfgNum_(cfg, 'MarginFraction_Floor_Pct', 300);
  p.liqProxyMmMult = M9__cfgNum_(cfg,
    'Liq_Proxy_MM_Mult',
    M9__cfgNum_(cfg, 'Liquidation_Maintenance_Margin_Mult', M9_CONST.BACKTEST.LIQ_PROXY_MM_MULT)
  );
  p.liqBufferRReq = M9__cfgNum_(cfg,
    'Min_Liquidation_Buffer_R',
    M9_CONST.BACKTEST.LIQ_BUFFER_R
  );

  p.invertAllSignals = M9__cfgBool_(cfg, 'Invert_All_Signals', false);
  p.v2LongOnly = M9__cfgBool_(cfg, 'V2_Long_Only', true);
  p.v2RiskOnOnly = M9__cfgBool_(cfg, 'V2_Risk_On_Only', true);
  p.universeMode = String(M9__cfgStr_(cfg, 'Universe_Mode', 'MAJORS_ONLY')).toUpperCase();

  p.Symbol_Allowlist = [];
  try {
    var rawAllow = cfg['Symbol_Allowlist'];
    if (rawAllow !== undefined && rawAllow !== null && rawAllow !== '') {
      if (Object.prototype.toString.call(rawAllow) === '[object Array]') {
        p.Symbol_Allowlist = rawAllow;
      } else {
        var parsedAllow = JSON.parse(String(rawAllow));
        if (Object.prototype.toString.call(parsedAllow) === '[object Array]') {
          p.Symbol_Allowlist = parsedAllow;
        }
      }
    }
  } catch (eAllow) {
    Logger.log('[M9] WARN Symbol_Allowlist parse failed: ' + eAllow);
    p.Symbol_Allowlist = [];
  }

  p.dqsGateV2 = M9__cfgNum_(cfg, 'DQS_Gate_V2', 45);
  p.dqsMin = M9__cfgNum_(cfg, 'DQS_Minimum', 40);

  p.v2BreakoutBufferAtr = M9__cfgNum_(cfg, 'V2_Breakout_Buffer_ATR', 0.10);
  p.v2RetestWindowCandles = Math.max(1, M9__cfgNum_(cfg, 'V2_Retest_Window_Candles', 3));
  p.v2RetestMaxDeviationAtr = M9__cfgNum_(cfg, 'V2_Retest_Max_Deviation_ATR', 0.50);
  p.v2ConfirmationBodyMinFrac = M9__cfgNum_(cfg, 'V2_Confirmation_Body_Min_Frac', 0.40);

  p.breakevenMoveR = M9__cfgNum_(cfg, 'Breakeven_Move_R', 1.0);

  p.leverageMode = String(M9__cfgStr_(cfg, 'Leverage_Mode', 'FIXED_1X')).toUpperCase();
  if (p.leverageMode === 'FIXED_1X') {
    p.maxLev = 1;
    p.maxLevSlot = 0;
  } else {
    p.maxLev = Math.max(1, M9__cfgNum_(cfg, 'Max_Leverage', 4));
    p.maxLevSlot = Math.max(1, M9__cfgNum_(cfg,
      'Max_Concurrent_Leveraged_Positions',
      M9_CONST.BACKTEST.MAX_CONCURRENT_LEVERAGED
    ));
  }

  // ===== V3 payoff overlay params =====
  p.payoffOverlayMode = String(M9__cfgStr_(cfg, 'Payoff_Overlay_Mode', 'CONTROL')).toUpperCase();
  p.progressDeadlineBars = Math.max(1, Math.round(M9__cfgNum_(cfg, 'Progress_Deadline_Bars', 12)));
  p.progressMinR = M9__cfgNum_(cfg, 'Progress_Min_R', 0.35);
  p.maxHoldBars = Math.max(2, Math.round(M9__cfgNum_(cfg, 'Max_Hold_Bars', 28)));

  p.fullExitOnTp1 = M9__cfgBool_(cfg, 'Full_Exit_On_TP1', false);

  p.tailClampEnabled = M9__cfgBool_(cfg, 'Tail_Clamp_Enabled', false);
  p.tailClampTriggerR = M9__cfgNum_(cfg, 'Tail_Clamp_Trigger_R', 0.75);
  p.tailClampStopR = M9__cfgNum_(cfg, 'Tail_Clamp_Stop_R', 0.00);

  // Phase 2 placeholder
  p.centerExitEnabled = M9__cfgBool_(cfg, 'Center_Exit_Enabled', false);
  p.centerExitMode = String(M9__cfgStr_(cfg, 'Center_Exit_Mode', 'NONE')).toUpperCase();
  p.centerExitBufferAtr = M9__cfgNum_(cfg, 'Center_Exit_Buffer_ATR', 0.10);

  p.corePct = 1.0;
  p.runnerPct = 0.0;
  p.longTrailStartR = 999999;
  p.shortTrailStartR = 999999;
  p.longTrailAtrMult = 0;
  p.shortTrailAtrMult = 0;
  p.runnerTimeoutCandles = 999999;
  p.relPerfLookback = 42;

  if (p.invertAllSignals && p.v2LongOnly) {
    throw new Error(
      '[M9] FATAL CONFIG CONFLICT:\n' +
      'Invert_All_Signals=TRUE + V2_Long_Only=TRUE\n' +
      '→ all signals invert to SHORT and get rejected by long-only.'
    );
  }

  Logger.log(
    '[M9][V2/V3 PARAM CLEAN] ' +
    'invertAllSignals=' + p.invertAllSignals +
    ' v2LongOnly=' + p.v2LongOnly +
    ' dqsGateV2=' + p.dqsGateV2.toFixed(1) +
    ' dqsMin=' + p.dqsMin.toFixed(1) +
    ' leverageMode=' + p.leverageMode +
    ' maxLev=' + p.maxLev +
    ' breakevenMoveR=' + p.breakevenMoveR.toFixed(2) +
    ' volMult=' + p.volMult.toFixed(2) +
    ' payoffOverlayMode=' + p.payoffOverlayMode +
    ' progressDeadlineBars=' + p.progressDeadlineBars +
    ' progressMinR=' + p.progressMinR +
    ' maxHoldBars=' + p.maxHoldBars +
    ' fullExitOnTp1=' + p.fullExitOnTp1 +
    ' tailClampEnabled=' + p.tailClampEnabled +
    ' tailClampTriggerR=' + p.tailClampTriggerR +
    ' tailClampStopR=' + p.tailClampStopR +
    ' centerExitEnabled=' + p.centerExitEnabled +
    ' centerExitMode=' + p.centerExitMode
  );

  return p;
}


function M9__btResolveDateRange_(cfg) {
  var endDate = new Date();
  var startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);

  var startCfg = M9__cfgStr_(cfg, 'Backtest_Start_Date', '');
  var endCfg = M9__cfgStr_(cfg, 'Backtest_End_Date', '');
  if (startCfg) startDate = new Date(startCfg);
  if (endCfg) endDate = new Date(endCfg);

  var startMs = startDate.getTime();
  var endMs = endDate.getTime();
  if (!isFinite(startMs) || !isFinite(endMs) || endMs <= startMs) {
    throw new Error('[M9] Invalid backtest date range.');
  }

  var months = (endMs - startMs) / (30 * 24 * 60 * 60 * 1000);
  if (months < M9_CONST.BACKTEST.MIN_MONTHS) {
    throw new Error('[M9] Backtest period < ' + M9_CONST.BACKTEST.MIN_MONTHS + ' months.');
  }

  var splitMs = startMs + (endMs - startMs) * M9_CONST.BACKTEST.IN_SAMPLE_PCT;

  return {
    startDate: startDate,
    endDate: endDate,
    startMs: startMs,
    endMs: endMs,
    splitMs: splitMs
  };
}

/** ---- Data Load / Prep ---- **/

function M9__btLoadDataClean4h_(startMs, endMs) {
  Logger.log('[M9][LOAD4H] ENTER M9__btLoadDataClean4h_ useSupabase=' + M9__useSupabaseBacktestHistory_());

  if (M9__useSupabaseBacktestHistory_()) {
    var datasetId = M9__activeDatasetId_();
    Logger.log('[M9][LOAD4H] USING SUPABASE dataset=' + datasetId);

    var sb = M9__btLoadDataClean4hFromSupabase_(startMs, endMs, datasetId);
    var sbKeys = Object.keys(sb.bySym || {}).sort();

    Logger.log('[M9][LOAD4H] SUPABASE symbols=' + JSON.stringify(sbKeys));
    Logger.log('[M9][LOAD4H] SUPABASE masterMs=' + (sb.masterMs ? sb.masterMs.length : 0));

    if (!sb || !sb.bySym || sbKeys.length === 0) {
      throw new Error('[M9][SB] No 4H candles found in Supabase for dataset ' + datasetId);
    }

    return sb;
  }

  Logger.log('[M9][LOAD4H] FALLING BACK TO SHEET DATA_CLEAN');

  var raw = M9__readAll_(M9_CONST.SHEETS.DATA_CLEAN);
  if (!raw || raw.length < 2) throw new Error('[M9] DATA_CLEAN empty.');

  var hm = M9__headerMap_(raw[0]);
  var cTs = M9__idx_(hm, 'Timestamp', true);
  var cSym = M9__idx_(hm, 'Symbol', true);
  var cTf = M9__idx_(hm, 'Timeframe', true);
  var cO = M9__idx_(hm, 'Open', true);
  var cH = M9__idx_(hm, 'High', true);
  var cL = M9__idx_(hm, 'Low', true);
  var cC = M9__idx_(hm, 'Close', true);
  var cV = M9__idx_(hm, 'Volume', true);
  var cFunding = M9__idx_(hm, 'FundingRate', false);
  var cBorrow = M9__idx_(hm, 'BorrowRate', false);
  var cGap = M9__idx_(hm, 'Gap_Flag', false);

  var bySym = {};
  var masterMs = [];

  for (var i = 1; i < raw.length; i++) {
    var rr = raw[i];

    var tf = String(rr[cTf] || '').trim();
    if (tf !== '4H') continue;

    if (cGap >= 0) {
      var gapVal = rr[cGap];
      if (gapVal === true || String(gapVal).toUpperCase() === 'TRUE' || String(gapVal) === '1') continue;
    }

    if (M9__isBlank_(rr[cO]) || M9__isBlank_(rr[cH]) || M9__isBlank_(rr[cL]) || M9__isBlank_(rr[cC])) continue;

    var sym = String(rr[cSym] || '').trim();
    if (!sym) continue;

    var ts = new Date(rr[cTs]);
    var tms = ts.getTime();
    if (!isFinite(tms) || tms < startMs || tms > endMs) continue;

    var o = M9__safeNum_(rr[cO]);
    var h = M9__safeNum_(rr[cH]);
    var l = M9__safeNum_(rr[cL]);
    var c = M9__safeNum_(rr[cC]);
    var v = M9__safeNum_(rr[cV]);
    if (!(o > 0 && h > 0 && l > 0 && c > 0)) continue;

    var fxRate = M9__extractFxRateFromRow_(rr, hm);

    if (!bySym[sym]) bySym[sym] = [];
    bySym[sym].push({
      ms: tms,
      o: o, h: h, l: l, c: c, v: v,
      funding: (cFunding >= 0 ? M9__safeNum_(rr[cFunding]) : null),
      borrow: (cBorrow >= 0 ? M9__safeNum_(rr[cBorrow]) : null),
      fx: fxRate
    });

    masterMs.push(tms);
  }

  var keys = Object.keys(bySym).sort();
  Logger.log('[M9][LOAD4H] SHEET symbols=' + JSON.stringify(keys));
  Logger.log('[M9][LOAD4H] SHEET masterMs=' + masterMs.length);

  return { bySym: bySym, masterMs: masterMs };
}



function RUN_M9_diagDirectLoad4hNow() {
  var cfg = M9__cfgLoadMap_();
  var dr = M9__btResolveDateRange_(cfg);

  var dc = M9__btLoadDataClean4h_(dr.startMs, dr.endMs);
  var syms = Object.keys(dc.bySym || {}).sort();

  Logger.log('[RUN][M9][DIRECTLOAD] ═══════════════════════════════════════');
  Logger.log('[RUN][M9][DIRECTLOAD] symbol count=' + syms.length);
  Logger.log('[RUN][M9][DIRECTLOAD] syms=' + JSON.stringify(syms));

  for (var i = 0; i < syms.length; i++) {
    var s = syms[i];
    var arr = dc.bySym[s] || [];
    if (!arr.length) continue;
    Logger.log('[RUN][M9][DIRECTLOAD] ' + s +
      ' rows=' + arr.length +
      ' first=' + new Date(arr[0].ms).toISOString() +
      ' last=' + new Date(arr[arr.length - 1].ms).toISOString());
  }

  Logger.log('[RUN][M9][DIRECTLOAD] masterMs=' + (dc.masterMs ? dc.masterMs.length : 0));
  Logger.log('[RUN][M9][DIRECTLOAD] ═══════════════════════════════════════');
}

function M9__btBuildSymbolList_(bySym) {
  var syms = [];
  for (var s in bySym) if (bySym.hasOwnProperty(s)) {
    bySym[s].sort(function(a, b) { return a.ms - b.ms; });
    syms.push(s);
  }
  if (syms.length === 0) throw new Error('[M9] No 4H candles in range.');
  return syms;
}

function M9__btBuildEligibleSyms_(syms, universeMode, ov) {
  var allowedMap = M9__resolveUniverseSymbolMap_(universeMode, ov);
  var eligible = [];

  for (var i = 0; i < syms.length; i++) {
    var s = String(syms[i] || '').trim();
    if (!s) continue;

    if (allowedMap === null || allowedMap[s.toUpperCase()]) {
      eligible.push(s);
    }
  }
  return eligible;
}

function M9__resolveUniverseSymbolMap_(universeMode, ov) {
  ov = ov || {};

  var mode = String(universeMode || ov.Universe_Mode || 'ALL').trim().toUpperCase();

  // Explicit custom allowlist support
  if (mode === 'CUSTOM') {
    return M9__symbolArrayToMap_(ov.Symbol_Allowlist || []);
  }

  // New canonical curated modes (USDT-only, no ZAR)
  if (mode === 'HARD_FILTER_ALL') {
    return M9__symbolArrayToMap_([
      'BTC/USDT',
      'BTC/USDTPERP',
      'ETH/USDT',
      'ETH/USDTPERP',
      'SOL/USDT',
      'SOL/USDTPERP',
      'XRP/USDT',
      'XRP/USDTPERP',
      'DOGE/USDT',
      'DOGE/USDTPERP'
    ]);
  }

  if (mode === 'TOP_K') {
    return M9__symbolArrayToMap_([
      'BTC/USDT',
      'BTC/USDTPERP',
      'ETH/USDT',
      'ETH/USDTPERP',
      'SOL/USDT',
      'SOL/USDTPERP',
      'XRP/USDT',
      'XRP/USDTPERP',
      'DOGE/USDT',
      'DOGE/USDTPERP'
    ]);
  }

  if (mode === 'TOP_SPS_CORE') {
    return M9__symbolArrayToMap_([
      'BTC/USDT',
      'BTC/USDTPERP',
      'ETH/USDT',
      'ETH/USDTPERP',
      'SOL/USDT',
      'SOL/USDTPERP',
      'XRP/USDT',
      'XRP/USDTPERP'
    ]);
  }

  if (mode === 'TOP_SPS_WITH_DOGE') {
    return M9__symbolArrayToMap_([
      'BTC/USDT',
      'BTC/USDTPERP',
      'ETH/USDT',
      'ETH/USDTPERP',
      'SOL/USDT',
      'SOL/USDTPERP',
      'XRP/USDT',
      'XRP/USDTPERP',
      'DOGE/USDT',
      'DOGE/USDTPERP'
    ]);
  }

  if (mode === 'PERP_CORE') {
    return M9__symbolArrayToMap_([
      'BTC/USDTPERP',
      'ETH/USDTPERP',
      'SOL/USDTPERP',
      'XRP/USDTPERP',
      'DOGE/USDTPERP'
    ]);
  }

  if (mode === 'SPOT_CORE') {
    return M9__symbolArrayToMap_([
      'BTC/USDT',
      'ETH/USDT',
      'SOL/USDT',
      'XRP/USDT',
      'DOGE/USDT'
    ]);
  }

  if (mode === 'HARD_FILTER_SPOT') {
    return M9__symbolArrayToMap_([
      'BTC/USDT',
      'ETH/USDT',
      'SOL/USDT',
      'XRP/USDT',
      'DOGE/USDT'
    ]);
  }

  if (mode === 'HARD_FILTER_PERP') {
    return M9__symbolArrayToMap_([
      'BTC/USDTPERP',
      'ETH/USDTPERP',
      'SOL/USDTPERP',
      'XRP/USDTPERP',
      'DOGE/USDTPERP'
    ]);
  }

  // Legacy fallback preserved
  return M9__resolveLegacyUniverseSymbolMap_(mode);
}


function M9__resolveLegacyUniverseSymbolMap_(mode) {
  mode = String(mode || 'ALL').trim().toUpperCase();

  if (mode === 'ALL') return null;

  var hard = M2_getHardFilterPassSymbols();
  var out = {};

  for (var i = 0; i < hard.length; i++) {
    var sym = String(hard[i] || '').trim();
    if (!sym) continue;

    var s = sym.toUpperCase();
    var isBTC = (s.indexOf('BTC') !== -1);
    var isETH = (s.indexOf('ETH') !== -1);
    var isSOL = (s.indexOf('SOL') !== -1);
    var isXRP = (s.indexOf('XRP') !== -1);

    var isMajor = isBTC || isETH || isSOL || isXRP;

    var ok = false;
    if (mode === 'BTC_ONLY') ok = isBTC;
    else if (mode === 'ETH_ONLY') ok = isETH;
    else if (mode === 'MAJORS_EX_BTC_ETH') ok = isMajor && !isBTC && !isETH;
    else if (mode === 'MAJORS_ONLY') ok = isMajor;
    else if (mode === 'LIQUID_MINORS') ok = !isMajor;
    else ok = true;

    if (ok) out[s] = true;
  }

  return out;
}

function M9__symbolArrayToMap_(arr) {
  var out = {};
  arr = arr || [];
  for (var i = 0; i < arr.length; i++) {
    var s = String(arr[i] || '').trim().toUpperCase();
    if (s) out[s] = true;
  }
  return out;
}

function M9__symbolObjArrayToMap_(arr) {
  var out = {};
  arr = arr || [];
  for (var i = 0; i < arr.length; i++) {
    var s = String((arr[i] && arr[i].sym) || '').trim().toUpperCase();
    if (s) out[s] = true;
  }
  return out;
}


function M9__resolveLegacyUniverseSymbolMap_(mode) {
  mode = String(mode || 'ALL').toUpperCase();

  if (mode === 'ALL') return null;

  var hard = M2_getHardFilterPassSymbols();
  var out = {};

  for (var i = 0; i < hard.length; i++) {
    var sym = String(hard[i] || '').trim();
    if (!sym) continue;

    var s = sym.toUpperCase();
    var isBTC = (s.indexOf('BTC') !== -1);
    var isETH = (s.indexOf('ETH') !== -1);
    var isSOL = (s.indexOf('SOL') !== -1);
    var isXRP = (s.indexOf('XRP') !== -1);

    var isMajor = isBTC || isETH || isSOL || isXRP;

    var ok = false;
    if (mode === 'BTC_ONLY') ok = isBTC;
    else if (mode === 'ETH_ONLY') ok = isETH;
    else if (mode === 'MAJORS_EX_BTC_ETH') ok = isMajor && !isBTC && !isETH;
    else if (mode === 'MAJORS_ONLY') ok = isMajor;
    else if (mode === 'LIQUID_MINORS') ok = !isMajor;

    if (ok) out[s] = true;
  }

  return out;
}

function M9__symbolArrayToMap_(arr) {
  var out = {};
  arr = arr || [];
  for (var i = 0; i < arr.length; i++) {
    var s = String(arr[i] || '').trim().toUpperCase();
    if (s) out[s] = true;
  }
  return out;
}

function M9__symbolObjArrayToMap_(arr) {
  var out = {};
  arr = arr || [];
  for (var i = 0; i < arr.length; i++) {
    var s = String((arr[i] && arr[i].sym) || '').trim().toUpperCase();
    if (s) out[s] = true;
  }
  return out;
}

function M9__btUniqueSortedMs_(masterMs) {
  masterMs.sort(function(a, b) { return a - b; });
  var out = [];
  var last = null;
  for (var i = 0; i < masterMs.length; i++) {
    if (last === null || masterMs[i] !== last) out.push(masterMs[i]);
    last = masterMs[i];
  }
  return out;
}

function M9__btMakeSeekIdx_(bySym, syms) {
  var ptr = {};
  for (var i = 0; i < syms.length; i++) ptr[syms[i]] = 0;

  function seekIdx_(sym0, ms0) {
    var arr0 = bySym[sym0];
    if (!arr0) return -1;

    var p0 = ptr[sym0] || 0;
    while (p0 < arr0.length && arr0[p0].ms < ms0) p0++;
    ptr[sym0] = p0;

    if (p0 < arr0.length && arr0[p0].ms === ms0) return p0;
    return -1;
  }

  return { seekIdx: seekIdx_, ptr: ptr };
}

function M9__btPrecomputeIndicators_(bySym, syms, atrPeriod, rsiPeriod, lookbackN) {
  var ind = {};
  for (var i = 0; i < syms.length; i++) {
    var sym = syms[i];
    var arr = bySym[sym];

    var highs = [], lows = [], closes = [], vols = [];
    for (var j = 0; j < arr.length; j++) {
      highs.push(arr[j].h);
      lows.push(arr[j].l);
      closes.push(arr[j].c);
      vols.push(arr[j].v);
    }

    ind[sym] = {
      atr: M9__atrWilder_(highs, lows, closes, atrPeriod),
      rsi: M9__rsiWilder_(closes, rsiPeriod),
      volSma: M9__sma_(vols, Math.max(10, lookbackN)),
      highs: highs,
      lows: lows,
      closes: closes,
      vols: vols
    };
  }
  return ind;
}

function M9__btDetectBtcBenchmark_(bySym, ind) {
  var btcCandidates = ['BTC/USDT', 'BTCUSDT', 'BTC-USDT', 'XBTUSDT'];
  for (var i = 0; i < btcCandidates.length; i++) {
    var s = btcCandidates[i];
    if (bySym[s] && ind[s]) return s;
  }
  return null;
}



/**
 * Builds a fast regime getter keyed by day-stamp (no per-bar formatDate).
 *
 * REGIME sheet expected columns:
 * - Date
 * - Market_Regime
 *
 * Returns:
 *   function(msNow) -> string regime
 */
function M9__btBuildRegimeGetter_(tz) {
  var regimeMap = {};

  try {
    var rg = M9__readAllIfExists_(M9_CONST.SHEETS.REGIME);
    if (rg && rg.length >= 2) {
      var hmR = M9__headerMap_(rg[0]);
      var cD = M9__idx_(hmR, 'Date', true);
      var cR = M9__idx_(hmR, 'Market_Regime', true);

      for (var i = 1; i < rg.length; i++) {
        var dms = new Date(rg[i][cD]).getTime();
        if (!isFinite(dms)) continue;

        var stamp = M9__dayStamp_(dms, tz);
        regimeMap[String(stamp)] = String(rg[i][cR] || 'RISK-ON');
      }
    }
  } catch (e) {
    // fail-soft: default regime will be used
  }

  // Cache regime per day to avoid repeated map lookups
  var lastStamp = null;
  var lastVal = null;

  return function getRegimeFast_(msNow) {
    var stampNow = M9__dayStamp_(msNow, tz);
    var k = String(stampNow);

    if (lastStamp !== null && k === lastStamp) {
      return lastVal || 'RISK-ON';
    }

    lastStamp = k;
    lastVal = regimeMap.hasOwnProperty(k) ? regimeMap[k] : 'RISK-ON';
    return lastVal;
  };
}


/**
 * Builds daily equity closes for the FULL curve.
 * Output: array of numbers (equity at each day close)
 */
function M9__dailyEquityFromCurveAllFast_(curve, tz) {
  if (!curve || curve.length === 0) return [];

  var out = [];
  var lastStamp = null;
  var lastEq = curve[0].equity;

  for (var i = 0; i < curve.length; i++) {
    var stamp = M9__dayStamp_(curve[i].ms, tz);
    var key = String(stamp);

    if (lastStamp === null) {
      lastStamp = key;
      lastEq = curve[i].equity;
      continue;
    }

    if (key === lastStamp) {
      lastEq = curve[i].equity; // same day: keep updating close
    } else {
      out.push(lastEq);         // close previous day
      lastStamp = key;
      lastEq = curve[i].equity;
    }
  }

  out.push(lastEq); // close final day
  return out;
}



/**
 * Builds daily equity closes for the OOS segment (fromMs onward),
 * with the split-day baseline included.
 *
 * Output: array of numbers (equity at each day close, starting at split baseline).
 */
function M9__dailyEquityFromCurveSinceMsFast_(curve, fromMs, tz) {
  if (!curve || curve.length === 0) return [];

  // Baseline equity at split (last equity at/before fromMs)
  var baseEq = curve[0].equity;
  for (var i = 0; i < curve.length; i++) {
    if (curve[i].ms <= fromMs) baseEq = curve[i].equity;
    else break;
  }

  var out = [];
  var lastStamp = String(M9__dayStamp_(fromMs, tz));
  var lastEq = baseEq;
  var started = false;

  for (i = 0; i < curve.length; i++) {
    if (curve[i].ms <= fromMs) continue;

    started = true;

    var key = String(M9__dayStamp_(curve[i].ms, tz));
    if (key === lastStamp) {
      lastEq = curve[i].equity;
    } else {
      out.push(lastEq);
      lastStamp = key;
      lastEq = curve[i].equity;
    }
  }

  // If there were no points after fromMs, still return a 1-point series
  if (!started) return [baseEq];

  out.push(lastEq);
  return out;
}

function M9__btBuildStructureTargetGetter_() {
  var levelsMap = {};
  try {
    var lvl = M9__readAllIfExists_('LEVELS');
    if (lvl && lvl.length >= 2) {
      var hmL = M9__headerMap_(lvl[0]);
      var cLSym = M9__idx_(hmL, 'Symbol', true);
      var cLRes = M9__idx_(hmL, 'Next_Higher_Resistance', false);
      var cLSup = M9__idx_(hmL, 'Next_Lower_Support', false);

      for (var i = 1; i < lvl.length; i++) {
        var lsym = String(lvl[i][cLSym] || '');
        if (!lsym) continue;
        levelsMap[lsym] = {
          nextRes: (cLRes >= 0 ? M9__safeNum_(lvl[i][cLRes]) : 0),
          nextSup: (cLSup >= 0 ? M9__safeNum_(lvl[i][cLSup]) : 0)
        };
      }
    }
  } catch (e2) {}

  return function getStructureTarget_(sym, dir) {
    var x = levelsMap[sym];
    if (!x) return 0;
    if (dir === 'LONG') return x.nextRes || 0;
    return x.nextSup || 0;
  };
}


function M9__btDqsScore_(ctx, sym, idxNow, dir, regimeNow, marketType) {
  var isLong = (dir === 'LONG');
  var p = ctx.p;

  var T = {
    COMP_LO: 0.5,
    DUR_LO: 4,
    DUR_HI: 16,
    VOL_LO: 1.5,
    MOM_HI: 0.02,
    ACC_HI_PCT: 0.55,
    ACC_MID_PCT: 0.40
  };

  var M = {
    COMPRESSION: 25,
    DURATION: 10,
    VOLUME: 20,
    MULTITF: 15,
    MULTITF_SOLO: 10,
    MOMENTUM: 15,
    ACCUMULATION: 5
  };

  var ind = ctx.ind[sym];
  if (!ind) return { total: 0, grade: 'SKIP' };

  var atrNow = ind.atr[idxNow];
  var atrLag = (idxNow >= 30) ? ind.atr[idxNow - 30] : null;
  var atrRatio = (atrLag && atrLag !== 0) ? (atrNow / atrLag) : 1.0;

  // ── 1. Compression ──────────────────────────────────────────────────
  var compression = Math.round(M9__goldilocks_(
    atrRatio,
    T.COMP_LO,
    0.55,
    0.75,
    1.05,
    M.COMPRESSION
  ));

  // ── 2. Volume ───────────────────────────────────────────────────────
  var vSma = ind.volSma[idxNow];
  var v = ind.vols[idxNow];
  var volRatio = (vSma && vSma !== 0) ? (v / vSma) : 0;
  var volume = Math.round(M9__goldilocks_(
    volRatio,
    T.VOL_LO,
    1.8,
    2.6,
    4.0,
    M.VOLUME
  ));

  // ── 3. Duration ─────────────────────────────────────────────────────
  var recentCandles = ctx.bySym[sym].slice(Math.max(0, idxNow - 60), idxNow + 1);
  var level = 0;
  if (ctx.levelsMap && ctx.levelsMap[sym]) {
    level = isLong ? (ctx.levelsMap[sym].res || 0) : (ctx.levelsMap[sym].sup || 0);
  }

  var consolCount = 0;
  var i, j;

  if (isLong && level > 0) {
    for (i = 0; i < recentCandles.length; i++) {
      if (recentCandles[i].h < level && recentCandles[i].l > level * (1 - 0.05)) {
        consolCount++;
      }
    }
  } else if (!isLong && level > 0) {
    for (j = 0; j < recentCandles.length; j++) {
      if (recentCandles[j].l > level && recentCandles[j].h < level * (1 + 0.05)) {
        consolCount++;
      }
    }
  }

  var duration = Math.round(
    M9__linearAdaptive_(consolCount, T.DUR_LO, T.DUR_HI, 0, M.DURATION)
  );

  // ── 4. Multi-timeframe ──────────────────────────────────────────────
  var multitf = M.MULTITF_SOLO;
  if (ctx.levelsMap && ctx.levelsMap[sym]) {
    var lm = ctx.levelsMap[sym];
    var breaksBoth = false;

    if (isLong && lm.res > 0 && lm.dailyRes > 0) {
      breaksBoth = (lm.res >= lm.dailyRes);
    } else if (!isLong && lm.sup > 0 && lm.dailySup > 0) {
      breaksBoth = (lm.sup <= lm.dailySup);
    }

    multitf = breaksBoth ? M.MULTITF : M.MULTITF_SOLO;
  }

  // ── 5. Momentum vs BTC ──────────────────────────────────────────────
  var relPerf = 0;
  if (ctx.btcBenchSym && ctx.bySym[ctx.btcBenchSym]) {
    var n = 42;
    var coinCloses = ind.closes;
    var btcCloses = ctx.ind[ctx.btcBenchSym].closes;

    if (coinCloses.length > n &&
        btcCloses.length > n &&
        idxNow >= n &&
        idxNow < coinCloses.length &&
        idxNow < btcCloses.length) {
      var coinStart = coinCloses[idxNow - n];
      var coinEnd = coinCloses[idxNow];
      var btcStart = btcCloses[idxNow - n];
      var btcEnd = btcCloses[idxNow];

      if (coinStart > 0 && btcStart > 0) {
        relPerf = ((coinEnd - coinStart) / coinStart) -
                  ((btcEnd - btcStart) / btcStart);
      }
    }
  }

  var momentum = 0;
  if (isLong) {
    if (relPerf >= T.MOM_HI) {
      momentum = M.MOMENTUM;
    } else if (relPerf > -0.01) {
      momentum = Math.round(
        M9__linearAdaptive_(relPerf + 0.01, 0, T.MOM_HI + 0.01, 0, M.MOMENTUM)
      );
    }
  } else {
    if (relPerf <= -T.MOM_HI) {
      momentum = M.MOMENTUM;
    } else if (relPerf < 0.01) {
      momentum = Math.round(
        M9__linearAdaptive_(0.01 - relPerf, 0, T.MOM_HI + 0.01, 0, M.MOMENTUM)
      );
    }
  }

  // ── 6. Accumulation / Distribution ──────────────────────────────────
  var obv = 0;
  var obvSeries = [0];
  for (var t = 1; t <= idxNow; t++) {
    var prev = obvSeries[obvSeries.length - 1];
    if (ind.closes[t] > ind.closes[t - 1]) obv = prev + ind.vols[t];
    else if (ind.closes[t] < ind.closes[t - 1]) obv = prev - ind.vols[t];
    else obv = prev;
    obvSeries.push(obv);
  }

  var sliceStart = Math.max(0, obvSeries.length - Math.max(1, consolCount));
  var recentObv = obvSeries.slice(sliceStart);
  var positiveCount = 0;

  for (var z = 1; z < recentObv.length; z++) {
    if (recentObv[z] > recentObv[z - 1]) positiveCount++;
  }

  var obvPosPct = recentObv.length > 1 ? (positiveCount / (recentObv.length - 1)) : 0;
  var dirPct = isLong ? obvPosPct : (1 - obvPosPct);
  var accumulation = 0;

  if (dirPct >= T.ACC_HI_PCT) {
    accumulation = M.ACCUMULATION;
  } else if (dirPct >= T.ACC_MID_PCT) {
    accumulation = Math.round(M.ACCUMULATION / 2);
  }

  var rawSum = compression + duration + volume + multitf + momentum + accumulation;

  // ── 7. Funding adjustment ────────────────────────────────────────────
  var fundAdj = 0;
  if (marketType === 'PERP') {
    var candle = ctx.bySym[sym][idxNow];
    var fundingRate = candle && candle.funding ? candle.funding : 0;
    var dailyFundRate = fundingRate * 3;

    if (isLong && dailyFundRate > 0.003) {
      fundAdj = -20;
    } else if (!isLong && dailyFundRate < -0.003) {
      fundAdj = -20;
    }
  }

  var total = Math.max(0, rawSum + fundAdj);
  var effectiveGradeFloor = isFinite(p.dqsGateV2) ? p.dqsGateV2 : p.dqsMin;
  var grade = M9__btGradeFromDqs_(Math.round(total), effectiveGradeFloor);

  return {
    compression: compression,
    duration: duration,
    volume: volume,
    multitf: multitf,
    momentum: momentum,
    accumulation: accumulation,
    rawSum: rawSum,
    fundAdj: fundAdj,
    total: Math.round(total),
    grade: grade
  };
}

function M9__btGradeFromDqs_(dqs, standardFloor) {
  var floor = isFinite(standardFloor) ? standardFloor : 40;
  if (dqs >= 80) return 'PREMIUM';
  if (dqs >= 60) return 'HIGH';
  if (dqs >= floor) return 'STANDARD';
  return 'SKIP';
}

function M9__btLevFromGrade_(grade, maxLev) {
  var lev = maxLev;
  if (grade === 'STANDARD') lev = Math.min(2, maxLev);
  else if (grade === 'HIGH') lev = Math.min(3, maxLev);
  else if (grade === 'PREMIUM') lev = Math.min(5, maxLev);
  if (lev < 1) lev = 1;
  return lev;
}

function M9__btLiqPrice_(entry, dir, lev, liqProxyMmMult) {
  if (lev <= 0) lev = 1;
  if (dir === 'LONG') return entry * (1 - (1 / lev) * liqProxyMmMult);
  return entry * (1 + (1 / lev) * liqProxyMmMult);
}

function M9__btBufferR_(stop, liq, rDist, dir) {
  if (rDist <= 0) return 0;
  if (dir === 'LONG') return (stop - liq) / rDist;
  return (liq - stop) / rDist;
}

function M9__btHasOpenSym_(openPos, sym) {
  for (var i = 0; i < openPos.length; i++) if (openPos[i].sym === sym) return true;
  return false;
}

function M9__btHasPendingSym_(pending, sym) {
  for (var i = 0; i < pending.length; i++) if (pending[i].sym === sym) return true;
  return false;
}

function M9__btCountLeveragedOpen_(openPos) {
  var c = 0;
  for (var i = 0; i < openPos.length; i++) if ((openPos[i].lev || 1) > 1) c++;
  return c;
}

/** ---- Execution / Accounting ---- **/

function M9__btApplyFundingBorrow_(ctx, pos, candle, masterIdx) {
  var p = ctx.p;
  var notionalZar = Math.abs(pos.entryZar * pos.qty);

  // funding every 8h ≈ every 2 bars of 4H
  if (masterIdx !== 0 && masterIdx % 2 === 0) {
    var rate = candle.funding;
    var f = 0;

    if (rate === null || rate === undefined) {
      f = -Math.abs(notionalZar * p.fundingAvgEstPer8hPct);
    } else {
      if (rate > 0) f = (pos.dir === 'LONG') ? -Math.abs(notionalZar * rate) : Math.abs(notionalZar * rate);
      else f = (pos.dir === 'SHORT') ? -Math.abs(notionalZar * rate) : Math.abs(notionalZar * rate);
    }

    pos.fundingZar += f;
    ctx.equity += f;
  }

  // borrow daily ≈ every 6 bars of 4H
  if (masterIdx !== 0 && masterIdx % 6 === 0) {
    var br = candle.borrow;
    var b = 0;

    if (br === null || br === undefined) b = Math.abs(notionalZar * p.borrowAvgEstPerDayPct);
    else b = Math.abs(notionalZar * br);

    pos.borrowZar += b;
    ctx.equity -= b;
  }
}

function M9__btCloseLeg_(ctx, pos, px, qtyLeg, fxExit) {
  if (qtyLeg <= 0) return { realized: 0, fee: 0 };

  var p = ctx.p;

  var exitPx = px;
  if (pos.dir === 'LONG') exitPx = px * (1 - p.slipPct);
  else exitPx = px * (1 + p.slipPct);

  var entryZar = pos.entryZar;
  var exitZar = M9__priceToZar_(pos.sym, exitPx, fxExit);

  var pnl = (pos.dir === 'LONG') ? (exitZar - entryZar) * qtyLeg : (entryZar - exitZar) * qtyLeg;
  var fee = Math.abs(exitZar * qtyLeg) * p.feeTaker;

  return { realized: pnl - fee, fee: fee };
}

function M9__btFinalizeTrade_(pos, exitReason) {
  var riskAmt = Math.abs(pos.rDistZar * pos.qty);
  var net = pos.coreRealizedZar + pos.runnerRealizedZar - pos.feesEntryZar + pos.fundingZar - pos.borrowZar;
  var rMult = (riskAmt === 0) ? 0 : (net / riskAmt);

  return {
    sym: pos.sym,
    dir: pos.dir,
    entryMs: pos.entryMs,
    exitMs: pos.exitMs,
    lev: pos.lev,
    grade: pos.grade,
    dqs: pos.dqs,
    regime: pos.regime,
    netPnlZar: net,
    rMult: rMult,
    riskZar: riskAmt,
    fundingZar: pos.fundingZar,
    borrowZar: pos.borrowZar,
    feesZar: pos.feesEntryZar + pos.feesExitZar,
    exitReason: exitReason || pos.exitReason,
    mfeR: pos.mfeR,
    maeR: pos.maeR
  };
}

function M9__btPortfolioMarginFraction_(ctx, openPositions, nowMs) {
  var totalRequiredMargin = 0;
  var totalUnrealized = 0;

  for (var i = 0; i < openPositions.length; i++) {
    var pos = openPositions[i];
    var idxNow = ctx.seekIdx(pos.sym, nowMs);
    if (idxNow < 0) continue;

    var cd = ctx.bySym[pos.sym][idxNow];
    var fxNow = cd.fx;
    if (M9__symbolLooksUsdtQuoted_(pos.sym) && (!isFinite(fxNow) || fxNow <= 0)) fxNow = pos.fxEntry;

    var markPx = cd.c;
    var markZar = M9__priceToZar_(pos.sym, markPx, fxNow);

    var qtyOpen = (pos.coreOpen ? pos.qtyCore : 0) + (pos.runnerOpen ? pos.qtyRunner : 0);
    if (qtyOpen <= 0) continue;

    var unreal = (pos.dir === 'LONG')
      ? (markZar - pos.entryZar) * qtyOpen
      : (pos.entryZar - markZar) * qtyOpen;

    var notionalZar = Math.abs(markZar * qtyOpen);
    var lev = Math.max(1, pos.lev || 1);
    var reqMargin = notionalZar / lev;

    totalUnrealized += unreal;
    totalRequiredMargin += reqMargin;
  }

  if (!(totalRequiredMargin > 0)) return 999999;

  var simEquity = ctx.equity + totalUnrealized;
  return (simEquity / totalRequiredMargin) * 100;
}

/** ---- Per-bar simulation steps ---- **/

function M9__btProcessPendingEntries_(ctx, nowMs, tIdx) {
  var p = ctx.p;
  var diag = ctx.diagV2 || (ctx.diagV2 = {});
  var stillPending = [];

  function bump(k) {
    diag[k] = (diag[k] || 0) + 1;
  }

  for (var i = 0; i < ctx.pending.length; i++) {
    var pe = ctx.pending[i];

    if (!pe || pe.entryMs > nowMs) {
      stillPending.push(pe);
      continue;
    }

    if (ctx.openPos.length >= p.maxConcurrentPos) continue;
    if (M9__btHasOpenSym_(ctx.openPos, pe.sym)) continue;

    var idx = ctx.seekIdx(pe.sym, nowMs);
    if (idx < 0) continue;

    var cd = ctx.bySym[pe.sym][idx];
    if (!cd) continue;

    var fxEntry = cd.fx;
    if (M9__symbolLooksUsdtQuoted_(pe.sym) && (!isFinite(fxEntry) || fxEntry <= 0)) {
      fxEntry = 1;
    }
    if (!(isFinite(fxEntry) && fxEntry > 0)) {
      bump('rejectedFx');
      continue;
    }

    var rawEntry = cd.o;
    if (!(isFinite(rawEntry) && rawEntry > 0)) {
      bump('rejectedEntryPx');
      continue;
    }

    var slipPx = rawEntry * (p.slipPct || 0);
    var entry = (pe.dir === 'LONG') ? (rawEntry + slipPx) : (rawEntry - slipPx);
    if (!(isFinite(entry) && entry > 0)) {
      bump('rejectedEntryPx');
      continue;
    }

    var stopDistPx = pe.stopDistPx;
    if (!(isFinite(stopDistPx) && stopDistPx > 0)) {
      bump('rejectedRDist');
      continue;
    }

    var stop = (pe.dir === 'LONG') ? (entry - stopDistPx) : (entry + stopDistPx);
    var rDistPx = Math.abs(entry - stop);
    if (!(isFinite(rDistPx) && rDistPx > 0)) {
      bump('rejectedRDist');
      continue;
    }

    var tp1 = M9__tp1PriceFromRR_(entry, rDistPx, p.rrMin, pe.dir);
    if (!isFinite(tp1) || tp1 <= 0) {
      bump('rejectedTp');
      continue;
    }

    var lev = 1;
    if (isFinite(pe.lev) && pe.lev > 0) lev = Math.max(1, pe.lev);
    if (p.maxLev && lev > p.maxLev) lev = p.maxLev;
    if (lev < 1) lev = 1;

    var rDistZar = M9__rDistToZar_(pe.sym, rDistPx, fxEntry);
    if (!(isFinite(rDistZar) && rDistZar > 0)) {
      bump('rejectedRDist');
      continue;
    }

    var riskAmt = ctx.equity * p.riskPct;
    if (!(isFinite(riskAmt) && riskAmt > 0)) {
      bump('rejectedRiskAmt');
      continue;
    }

    var qty = riskAmt / rDistZar;
    if (!(isFinite(qty) && qty > 0)) {
      bump('rejectedQty');
      continue;
    }

    var entryZar = M9__priceToZar_(pe.sym, entry, fxEntry);
    if (!(isFinite(entryZar) && entryZar > 0)) {
      bump('rejectedFx');
      continue;
    }

    var notionalZar = Math.abs(entryZar * qty);
    if (!(isFinite(notionalZar) && notionalZar > 0)) {
      bump('rejectedQty');
      continue;
    }

    if (lev <= 1 && notionalZar > ctx.equity) {
      qty = ctx.equity / entryZar;
      notionalZar = Math.abs(entryZar * qty);
      bump('qtyScaledByEquityCap');
    }

    var maxMarginUsedPct = isFinite(p.maxMarginUsedPct) ? p.maxMarginUsedPct : 0;
    if (maxMarginUsedPct > 0) {
      var reqMarginZar = notionalZar / Math.max(1, lev);
      var maxMarginZar = ctx.equity * maxMarginUsedPct;
      if (reqMarginZar > maxMarginZar) {
        var scale = maxMarginZar / reqMarginZar;
        qty = qty * scale;
        notionalZar = Math.abs(entryZar * qty);
        bump('qtyScaledByMarginCap');
      }
    }

    if (!(isFinite(qty) && qty > 0)) {
      bump('rejectedQty');
      continue;
    }

    notionalZar = Math.abs(entryZar * qty);
    if (!(isFinite(notionalZar) && notionalZar > 0)) {
      bump('rejectedQty');
      continue;
    }

    var feeEntry = notionalZar * p.feeTaker;
    if (!isFinite(feeEntry) || feeEntry < 0) feeEntry = 0;

    if (feeEntry > ctx.equity) {
      bump('rejectedFee');
      continue;
    }

    ctx.equity -= feeEntry;

    ctx.openPos.push({
      sym: pe.sym,
      dir: pe.dir,
      entryMs: nowMs,
      entryTIdx: tIdx,
      entry: entry,
      entryZar: entryZar,
      fxEntry: fxEntry,
      stop: stop,
      initialStop: stop,
      rDistPx: rDistPx,
      rDistZar: rDistZar,
      tp1: tp1,
      tp2: tp1,
      lev: lev,
      grade: pe.grade,
      dqs: pe.dqs,
      regime: pe.regime,
      qty: qty,
      qtyCore: qty,
      qtyRunner: 0,
      coreOpen: true,
      runnerOpen: false,
      feesEntryZar: feeEntry,
      feesExitZar: 0,
      fundingZar: 0,
      borrowZar: 0,
      coreRealizedZar: 0,
      runnerRealizedZar: 0,
      mfeR: 0,
      maeR: 0,
      overlayMode: String(p.payoffOverlayMode || 'CONTROL').toUpperCase(),
      progressDeadlineBars: p.progressDeadlineBars,
      progressMinR: p.progressMinR,
      maxHoldBars: p.maxHoldBars,
      fullExitOnTp1: !!p.fullExitOnTp1,
      tailClampEnabled: !!p.tailClampEnabled,
      tailClampTriggerR: p.tailClampTriggerR,
      tailClampStopR: p.tailClampStopR,
      centerExitEnabled: !!p.centerExitEnabled,
      centerExitMode: String(p.centerExitMode || 'NONE').toUpperCase(),
      centerExitBufferAtr: p.centerExitBufferAtr,
      tailClamped: false,
      timeExitArmed: true,
      exitMs: null,
      exitReason: ''
    });

    bump('pendingFilled');
  }

  ctx.pending = stillPending;
}

function M9__btManageOpenPositions_(ctx, nowMs, tIdx) {
  var p = ctx.p;
  var diag = ctx.diagV2 || (ctx.diagV2 = {});
  var stillOpen = [];

  function bump(k) {
    diag[k] = (diag[k] || 0) + 1;
  }

  function closeWholePos_(pos, exitPx, fxExit, nowMs, reason) {
    var r = M9__btCloseLeg_(ctx, pos, exitPx, pos.qtyCore, fxExit);
    pos.coreRealizedZar += r.realized;
    pos.feesExitZar += r.fee;
    ctx.equity += r.realized;
    pos.coreOpen = false;
    pos.exitMs = nowMs;
    pos.exitReason = reason;
    ctx.trades.push(M9__btFinalizeTrade_(pos, reason));
    return r;
  }

  function deriveCenterExitPx_(pos, cd) {
    return pos.tp2;
  }

  for (var i = 0; i < ctx.openPos.length; i++) {
    var pos = ctx.openPos[i];
    var idxC = ctx.seekIdx(pos.sym, nowMs);

    if (idxC < 0) {
      stillOpen.push(pos);
      continue;
    }

    var cd = ctx.bySym[pos.sym][idxC];
    if (!cd) {
      stillOpen.push(pos);
      continue;
    }

    var fxExit = cd.fx;
    if (M9__symbolLooksUsdtQuoted_(pos.sym) && (!isFinite(fxExit) || fxExit <= 0)) {
      fxExit = pos.fxEntry;
    }

    M9__btApplyFundingBorrow_(ctx, pos, cd, tIdx);

    if (pos.dir === 'LONG') {
      pos.mfeR = Math.max(pos.mfeR || 0, (cd.h - pos.entry) / (pos.rDistPx || 1));
      pos.maeR = Math.max(pos.maeR || 0, (pos.entry - cd.l) / (pos.rDistPx || 1));
    } else {
      pos.mfeR = Math.max(pos.mfeR || 0, (pos.entry - cd.l) / (pos.rDistPx || 1));
      pos.maeR = Math.max(pos.maeR || 0, (cd.h - pos.entry) / (pos.rDistPx || 1));
    }

    var qtyOpen = pos.coreOpen ? pos.qtyCore : 0;
    if (!(qtyOpen > 0)) continue;

    if (pos.tailClampEnabled && !pos.tailClamped && isFinite(pos.tailClampTriggerR) && pos.mfeR >= pos.tailClampTriggerR) {
      var clampStop;
      if (pos.dir === 'LONG') {
        clampStop = pos.entry + (pos.tailClampStopR * pos.rDistPx);
        pos.stop = Math.max(pos.stop, clampStop);
      } else {
        clampStop = pos.entry - (pos.tailClampStopR * pos.rDistPx);
        pos.stop = Math.min(pos.stop, clampStop);
      }
      pos.tailClamped = true;
      bump('tailClampApplied');
    }

    var beR = isFinite(p.breakevenMoveR) ? p.breakevenMoveR : 1.0;
    if (pos.mfeR >= beR) {
      if (pos.dir === 'LONG') pos.stop = Math.max(pos.stop, pos.entry);
      else pos.stop = Math.min(pos.stop, pos.entry);
    }

    var stopHit = (pos.dir === 'LONG') ? (cd.l <= pos.stop) : (cd.h >= pos.stop);
    var tpHit = (pos.dir === 'LONG') ? (cd.h >= pos.tp2) : (cd.l <= pos.tp2);

    if (stopHit) {
      closeWholePos_(pos, pos.stop, fxExit, nowMs, 'STOP');
      if (!ctx.cooldown) ctx.cooldown = {};
      ctx.cooldown[pos.sym] = tIdx;
      bump('exitStop');
      continue;
    }

    if (tpHit) {
      if (pos.fullExitOnTp1 || !pos.centerExitEnabled) {
        closeWholePos_(pos, pos.tp2, fxExit, nowMs, 'TP');
        bump('exitTp');
        continue;
      }
    }

    if (pos.centerExitEnabled) {
      var centerPx = deriveCenterExitPx_(pos, cd);
      var centerHit = false;
      if (pos.dir === 'LONG') centerHit = (cd.h >= centerPx);
      else centerHit = (cd.l <= centerPx);

      if (centerHit) {
        closeWholePos_(pos, centerPx, fxExit, nowMs, 'CENTER_EXIT');
        bump('exitCenter');
        continue;
      }
    } else if (tpHit) {
      closeWholePos_(pos, pos.tp2, fxExit, nowMs, 'TP');
      bump('exitTp');
      continue;
    }

    var barsHeld = (isFinite(pos.entryTIdx) ? (tIdx - pos.entryTIdx) : 0);

    if (barsHeld >= pos.progressDeadlineBars && pos.mfeR < pos.progressMinR) {
      closeWholePos_(pos, cd.c, fxExit, nowMs, 'PROGRESS_FAIL');
      if (!ctx.cooldown) ctx.cooldown = {};
      ctx.cooldown[pos.sym] = tIdx;
      bump('exitProgressFail');
      continue;
    }

    if (barsHeld >= pos.maxHoldBars) {
      closeWholePos_(pos, cd.c, fxExit, nowMs, 'TIME_STOP');
      if (!ctx.cooldown) ctx.cooldown = {};
      ctx.cooldown[pos.sym] = tIdx;
      bump('exitTimeStop');
      continue;
    }

    stillOpen.push(pos);
  }

  ctx.openPos = stillOpen;
}

function M9__btPortfolioLiquidationProtect_(ctx, nowMs) {
  var p = ctx.p;
  if (!p.forceLiqEnabled) return;
  if (!ctx.openPos || !ctx.openPos.length) return;

  // In baseline 1x mode, portfolio liquidation protection should not fire.
  // These are fully funded positions, not leveraged fragility tests.
  if (!p.maxLev || p.maxLev <= 1) return;

  var simMf = M9__btPortfolioMarginFraction_(ctx, ctx.openPos, nowMs);
  if (simMf >= p.marginFractionFloorPct) return;

  var survivors = [];

  for (var i = 0; i < ctx.openPos.length; i++) {
    var fpos = ctx.openPos[i];

    // Never force-liquidate 1x positions in this function.
    if (!fpos.lev || fpos.lev <= 1) {
      survivors.push(fpos);
      continue;
    }

    var idxF = ctx.seekIdx(fpos.sym, nowMs);
    if (idxF < 0) {
      survivors.push(fpos);
      continue;
    }

    var cdf = ctx.bySym[fpos.sym][idxF];
    if (!cdf) {
      survivors.push(fpos);
      continue;
    }

    var fxForced = cdf.fx;
    if (M9__symbolLooksUsdtQuoted_(fpos.sym) && (!isFinite(fxForced) || fxForced <= 0)) {
      fxForced = fpos.fxEntry;
    }

    var mktPx = cdf.c;

    if (fpos.coreOpen) {
      var fC = M9__btCloseLeg_(ctx, fpos, mktPx, fpos.qtyCore, fxForced);
      fpos.coreRealizedZar += fC.realized;
      fpos.feesExitZar += fC.fee;
      ctx.equity += fC.realized;
      fpos.coreOpen = false;
    }

    if (fpos.runnerOpen) {
      var fR = M9__btCloseLeg_(ctx, fpos, mktPx, fpos.qtyRunner, fxForced);
      fpos.runnerRealizedZar += fR.realized;
      fpos.feesExitZar += fR.fee;
      ctx.equity += fR.realized;
      fpos.runnerOpen = false;
    }

    fpos.exitMs = nowMs;
    fpos.exitReason = 'LIQUIDATION_PROTECT';
    ctx.trades.push(M9__btFinalizeTrade_(fpos, 'LIQUIDATION_PROTECT'));

    if (ctx.diagV2) {
      ctx.diagV2.portfolioLiquidationProtectFires =
        (ctx.diagV2.portfolioLiquidationProtectFires || 0) + 1;
    }
  }

  ctx.openPos = survivors;
}

function M9__btGenerateSignalsV2_(ctx, nowMs, tIdx) {
  var cfg = ctx && ctx.cfg ? ctx.cfg : {};
  var profile = '';
  try {
    profile = String(M9__cfgStr_(cfg, 'Strategy_Profile', 'BREAKOUT_LONG')).toUpperCase();
  } catch (e) {
    profile = 'BREAKOUT_LONG';
  }

  if (profile === 'BREAKDOWN_SHORT') {
    return M9__btGenerateSignalsBreakdownShort_(ctx, nowMs, tIdx);
  }

  return M9__btGenerateSignals_(ctx, nowMs, tIdx);
}


function M9__btGenerateSignalsBreakdownShort_(ctx, nowMs, tIdx) {
  var p = ctx.p;
  var diag = ctx.diagV2 || (ctx.diagV2 = {});

  function bump(k) {
    diag[k] = (diag[k] || 0) + 1;
  }

  if (ctx.openPos.length + ctx.pending.length >= p.maxConcurrentPos) return;
  if (tIdx >= ctx.master.length - 2) return;

  var regimeNow = ctx.getRegimeFast(nowMs);

  // For native shorts, allow NEUTRAL and RISK-ON for now.
  // Later you can specialize this further if needed.
  var refLookbackN = (p.v2BreakoutLookbackN && p.v2BreakoutLookbackN > 0)
    ? p.v2BreakoutLookbackN
    : p.lookbackN;

  var familyBest = {};

  for (var i = 0; i < ctx.eligibleSyms.length; i++) {
    if (ctx.openPos.length + ctx.pending.length >= p.maxConcurrentPos) break;

    var sym = ctx.eligibleSyms[i];
    bump('eligible');

    if (M9__btHasOpenSym_(ctx.openPos, sym)) continue;
    if (M9__btHasPendingSym_(ctx.pending, sym)) continue;

    if (ctx.cooldown && ctx.cooldown.hasOwnProperty(sym)) {
      if ((tIdx - ctx.cooldown[sym]) < p.cooldownCandles) {
        bump('rejectedCooldown');
        continue;
      }
    }

    var idxNow = ctx.seekIdx(sym, nowMs);
    if (idxNow < 0) {
      bump('rejectedMissingIdx');
      continue;
    }

    if (idxNow < Math.max(p.lookbackN + p.atrPeriod + 20, 60)) {
      bump('rejectedWarmup');
      continue;
    }

    var atrVal = ctx.ind[sym].atr[idxNow];
    var rsiVal = ctx.ind[sym].rsi[idxNow];
    var volS = ctx.ind[sym].volSma[idxNow];

    if (!(atrVal > 0)) {
      bump('rejectedNoAtr');
      continue;
    }
    if (rsiVal === null || rsiVal === '' || !isFinite(rsiVal)) {
      bump('rejectedNoRsi');
      continue;
    }
    if (!(volS > 0)) {
      bump('rejectedNoVolSma');
      continue;
    }

    var cNow = ctx.bySym[sym][idxNow];
    if (!cNow) {
      bump('rejectedNoCandle');
      continue;
    }

    var volRatio = cNow.v / volS;
    if (!(volRatio >= p.volMult)) {
      bump('rejectedVol');
      continue;
    }

    // For breakdown shorts, avoid already deeply oversold conditions.
    if (!(rsiVal > 35 && rsiVal < 65)) {
      bump('rejectedRsi');
      continue;
    }

    var atrRatio = 1.0;
    if (ctx.ind[sym].atr && idxNow >= 30 && ctx.ind[sym].atr[idxNow - 30]) {
      var atrLag = ctx.ind[sym].atr[idxNow - 30];
      atrRatio = (atrLag && atrLag !== 0) ? (atrVal / atrLag) : 1.0;
    }

    var adaptive = M9__getAdaptiveStrategyParams_(atrRatio);

    var winSize = Math.max(6, adaptive.retestWindowCandles + 3);
    var startWin = Math.max(0, idxNow - winSize + 1);

    var endLb = startWin - 1;
    var startLb = Math.max(0, startWin - refLookbackN);
    if (endLb < startLb) {
      bump('rejectedNoSupportWindow');
      continue;
    }

    // Build support from lows
    var sup = Infinity;
    for (var j = startLb; j <= endLb; j++) {
      var lv = (ctx.ind[sym].lows && ctx.ind[sym].lows[j] !== null)
        ? ctx.ind[sym].lows[j]
        : ctx.ind[sym].closes[j];
      if (lv < sup) sup = lv;
    }

    if (!(isFinite(sup) && sup > 0)) {
      bump('rejectedNoSupport');
      continue;
    }

    var rb = adaptive.breakoutBufferAtr * atrVal;
    if (cNow.c < (sup - rb)) {
      bump('rawBreakout');
    }

    var recentCandles = [];
    for (j = startWin; j <= idxNow; j++) {
      var cj = ctx.bySym[sym][j];
      recentCandles.push({
        ms: cj.ms,
        o: cj.o,
        h: cj.h,
        l: cj.l,
        c: cj.c,
        v: cj.v
      });
    }

    var stateRes = M9__evaluateBreakdownShortState_(
      recentCandles,
      sup,
      atrVal,
      regimeNow,
      adaptive.breakoutBufferAtr,
      adaptive.retestWindowCandles,
      adaptive.retestMaxDeviationAtr,
      adaptive.confirmationBodyMinFrac
    );

    if (!stateRes) {
      bump('stateNull');
      continue;
    }

    if (stateRes.breakdownIdx >= 0) {
      bump('breakoutDetected');
    }

    if (stateRes.state === 'BREAKDOWN_DETECTED') {
      bump('stateBreakdownDetected');
      continue;
    }

    if (stateRes.state === 'RETEST_PENDING') {
      bump('retestPending');
      bump('stateRetestPending');
      continue;
    }

    if (stateRes.state === 'INVALIDATED') {
      bump('stateInvalidated');
      continue;
    }

    if (stateRes.state !== 'CONFIRMED') {
      bump('stateOther');
      continue;
    }

    bump('setupConfirmed');
    bump('confirmed');

    var dir = 'SHORT';
    var stopDistPx = p.atrStopMult * atrVal;
    if (!(stopDistPx > 0)) {
      bump('rejectedBadRDistPx');
      continue;
    }

    var marketType = (sym.indexOf('PERP') !== -1) ? 'PERP' : 'SPOT_MARGIN';
    var dqsObj = M9__btDqsScore_(ctx, sym, idxNow, dir, regimeNow, marketType);
    M9__dqsSumRecord_(ctx, sym, dir, regimeNow, dqsObj, p.dqsGateV2);

    if (!dqsObj || !isFinite(dqsObj.total)) {
      bump('failedDqs');
      bump('rejectedDqsAfterConfirm');
      continue;
    }

    if (dqsObj.total < p.dqsGateV2) {
      bump('failedDqs');
      bump('rejectedDqsAfterConfirm');
      continue;
    }

    var effectiveGradeFloor = isFinite(p.dqsGateV2) ? p.dqsGateV2 : p.dqsMin;
    var grade = M9__btGradeFromDqs_(dqsObj.total, effectiveGradeFloor);
    if (grade === 'SKIP') {
      bump('rejectedGradeSkip');
      continue;
    }

    var candidate = {
      sym: sym,
      family: M9__symFamilyKey_(sym),
      dir: dir,
      entryMs: ctx.master[tIdx + 1],
      lev: 1,
      stopDistPx: stopDistPx,
      grade: grade,
      dqs: dqsObj.total,
      regime: regimeNow
    };

    var fam = candidate.family;
    familyBest[fam] = M9__btChooseBetterCandidate_(familyBest[fam], candidate);
  }

  var selected = [];
  for (var famKey in familyBest) {
    if (familyBest.hasOwnProperty(famKey) && familyBest[famKey]) {
      selected.push(familyBest[famKey]);
    }
  }

  selected.sort(function(a, b) {
    return (b.dqs || 0) - (a.dqs || 0);
  });

  for (var s = 0; s < selected.length; s++) {
    if (ctx.openPos.length + ctx.pending.length >= p.maxConcurrentPos) break;
    ctx.pending.push(selected[s]);
    bump('pendingCreated');
    bump('confirmedQueued');
  }
}



function M9__evaluateBreakdownShortState_(
  candles,
  level,
  atr,
  regime,
  breakoutBufferAtr,
  retestWindowCandles,
  retestMaxDeviationAtr,
  confirmationBodyMinFrac
) {
  var out = {
    state: 'IDLE',
    reason: '',
    breakdownIdx: -1,
    retestIdx: -1,
    confirmIdx: -1,
    entryPrice: 0
  };

  if (!candles || candles.length < 4) {
    out.reason = 'Not enough candles';
    return out;
  }

  if (!(isFinite(level) && level > 0 && isFinite(atr) && atr > 0)) {
    out.state = 'INVALIDATED';
    out.reason = 'Invalid level/atr';
    return out;
  }

  var rb = (isFinite(breakoutBufferAtr) ? breakoutBufferAtr : 0.10) * atr;
  var dev = (isFinite(retestMaxDeviationAtr) ? retestMaxDeviationAtr : 0.50) * atr;
  var confirmBodyMin = isFinite(confirmationBodyMinFrac) ? confirmationBodyMinFrac : 0.40;
  var maxRetestBars = Math.max(1, isFinite(retestWindowCandles) ? retestWindowCandles : 3);

  var i;

  // 1) Find latest valid breakdown close below support-buffer
  for (i = candles.length - 2; i >= 0; i--) {
    if (candles[i].c < level - rb) {
      out.breakdownIdx = i;
      break;
    }
  }

  if (out.breakdownIdx < 0) {
    out.state = 'IDLE';
    out.reason = 'No breakdown detected';
    return out;
  }

  out.state = 'BREAKDOWN_DETECTED';

  // 2) Search for retest from below
  var retestEnd = Math.min(candles.length - 2, out.breakdownIdx + maxRetestBars);
  for (i = out.breakdownIdx + 1; i <= retestEnd; i++) {
    var r = candles[i];

    var touchedZone = (r.h >= (level - dev));
    var heldBelow = (r.c <= (level + dev));
    var notTooHigh = (r.h <= (level + 1.25 * dev));

    if (touchedZone && heldBelow && notTooHigh) {
      out.retestIdx = i;
      break;
    }

    if (r.c > level + dev) {
      out.state = 'INVALIDATED';
      out.reason = 'Retest reclaimed above level';
      return out;
    }
  }

  if (out.retestIdx < 0) {
    out.state = 'BREAKDOWN_DETECTED';
    out.reason = 'Breakdown found; no valid retest in window';
    return out;
  }

  out.state = 'RETEST_PENDING';

  // 3) Confirmation must happen after retest
  var cStart = out.retestIdx + 1;
  var cEnd = Math.min(candles.length - 1, out.retestIdx + maxRetestBars);

  for (i = cStart; i <= cEnd; i++) {
    var x = candles[i];
    var range = Math.max(0.00000001, x.h - x.l);
    var bodyFrac = Math.abs(x.c - x.o) / range;

    if (x.c > level + dev) {
      out.state = 'INVALIDATED';
      out.reason = 'Confirmation reclaimed above level';
      return out;
    }

    var bearish = x.c < x.o;
    var strongClose = x.c < level - rb;
    var decentBody = bodyFrac >= confirmBodyMin;

    if (bearish && strongClose && decentBody) {
      out.confirmIdx = i;
      out.entryPrice = x.c;
      out.state = 'CONFIRMED';
      out.reason = 'Breakdown-retest-confirmation complete';
      return out;
    }
  }

  out.state = 'RETEST_PENDING';
  out.reason = 'Retest found; awaiting confirmation';
  return out;
}



function M9_runWalkForwardBacktest() {
  if (typeof M9_CONST === 'undefined' || !M9_CONST) {
    throw new Error('[M9] M9_CONST is undefined. Module 9 constants are not loaded.');
  }

  if (typeof M9_COL === 'undefined' || !M9_COL) {
    throw new Error('[M9] M9_COL is undefined. Module 9 column map is not loaded.');
  }

  if (!M9_CONST.SHEETS) {
    throw new Error('[M9] M9_CONST.SHEETS is undefined. Fix Module 9 constants.');
  }

  if (!M9_CONST.HEADERS) {
    throw new Error('[M9] M9_CONST.HEADERS is undefined. Fix Module 9 constants.');
  }

  if (!M9_CONST.SHEETS.BACKTEST_RESULTS) {
    throw new Error('[M9] M9_CONST.SHEETS.BACKTEST_RESULTS is missing.');
  }

  if (!M9_CONST.HEADERS.BACKTEST_RESULTS) {
    throw new Error('[M9] M9_CONST.HEADERS.BACKTEST_RESULTS is missing.');
  }

  if (!M9_COL.BACKTEST_RESULTS) {
    throw new Error('[M9] M9_COL.BACKTEST_RESULTS is missing.');
  }

  M9__ensureHeader_(M9_CONST.SHEETS.BACKTEST_RESULTS, M9_CONST.HEADERS.BACKTEST_RESULTS);

  try {
    M2_requireCanonicalHistoryForBacktest();
  } catch (eHist) {
    throw new Error('[M9] Backtest blocked by Module 2 history gate: ' + eHist.message);
  }

  var cfg = M9__cfgLoadMap_();
  var p = M9__btLoadSimParams_(cfg);

  var dr = M9__btResolveDateRange_(cfg);
  var startDate = dr.startDate;
  var endDate = dr.endDate;

  var dc = M9__btLoadDataClean4h_(dr.startMs, dr.endMs);
  var bySym = dc.bySym;

  var syms = M9__btBuildSymbolList_(bySym);
  var eligibleSyms = M9__btBuildEligibleSyms_(syms, p.universeMode, p);

  M9__assertTrue4HData_(bySym);

  var master = M9__btUniqueSortedMs_(dc.masterMs);

  var seekObj = M9__btMakeSeekIdx_(bySym, syms);
  var seekIdx = seekObj.seekIdx;

  var ind = M9__btPrecomputeIndicators_(bySym, syms, p.atrPeriod, p.rsiPeriod, p.lookbackN);
  var btcBenchSym = M9__btDetectBtcBenchmark_(bySym, ind);

  var getRegimeFast = M9__btBuildRegimeGetter_(p.tz);
  var getStructureTarget = M9__btBuildStructureTargetGetter_();

  var diagV2 = {
    eligibleSymbols: eligibleSyms.length,

    skippedByRegime: 0,

    rawBreakoutCandidates: 0,
    breakoutDetected: 0,
    retestPending: 0,

    setupConfirmed: 0,
    confirmed: 0,
    confirmedQueued: 0,

    rejectedByLongOnly: 0,
    rejectedGradeSkip: 0,
    rejectedBadRDistPx: 0,
    rejectedDqsAfterConfirm: 0,

    failedDqs: 0,
    pendingCreated: 0,
    pendingFilled: 0,
    rejectedFx: 0,
    rejectedLiqBuffer: 0,
    rejectedRDist: 0,
    rejectedQty: 0
  };

  var ctx = {
    cfg: cfg,
    p: p,

    bySym: bySym,
    syms: syms,
    eligibleSyms: eligibleSyms,
    master: master,
    ind: ind,

    btcBenchSym: btcBenchSym,

    seekIdx: seekIdx,
    getRegimeFast: getRegimeFast,
    getStructureTarget: getStructureTarget,

    diagV2: diagV2,

    equity: M9__cfgNum_(cfg, 'Backtest_Start_Equity_ZAR', 100000),
    equityCurve4h: [],
    openPos: [],
    pending: [],
    cooldown: {},
    trades: []
  };

  for (var tIdx = 0; tIdx < master.length; tIdx++) {
    var nowMs = master[tIdx];

    M9__btProcessPendingEntries_(ctx, nowMs, tIdx);
    M9__btManageOpenPositions_(ctx, nowMs, tIdx);
    M9__btPortfolioLiquidationProtect_(ctx, nowMs);

    ctx.equityCurve4h.push({ ms: nowMs, equity: ctx.equity });

    if (tIdx >= master.length - 2) continue;
    if (ctx.openPos.length + ctx.pending.length >= p.maxConcurrentPos) continue;

    M9__btGenerateSignalsV2_(ctx, nowMs, tIdx);
  }

  Logger.log(
    '[M9][V2 PARAM] invertAllSignals=%s v2LongOnly=%s dqsGateV2=%s dqsMin=%s',
    p.invertAllSignals,
    p.v2LongOnly,
    p.dqsGateV2,
    p.dqsMin
  );

  Logger.log(
    '[M9][V2 DIAG] eligible=%s skippedByRegime=%s rawBreakout=%s breakoutDetected=%s retestPending=%s setupConfirmed=%s confirmedLegacy=%s confirmedQueued=%s rejectedByLongOnly=%s rejectedGradeSkip=%s rejectedBadRDistPx=%s rejectedDqsAfterConfirm=%s failedDqs=%s pendingCreated=%s pendingFilled=%s rejectedFx=%s rejectedLiqBuffer=%s rejectedRDist=%s rejectedQty=%s',
    diagV2.eligibleSymbols,
    diagV2.skippedByRegime,
    diagV2.rawBreakoutCandidates,
    diagV2.breakoutDetected,
    diagV2.retestPending,
    diagV2.setupConfirmed,
    diagV2.confirmed,
    diagV2.confirmedQueued,
    diagV2.rejectedByLongOnly,
    diagV2.rejectedGradeSkip,
    diagV2.rejectedBadRDistPx,
    diagV2.rejectedDqsAfterConfirm,
    diagV2.failedDqs,
    diagV2.pendingCreated,
    diagV2.pendingFilled,
    diagV2.rejectedFx,
    diagV2.rejectedLiqBuffer,
    diagV2.rejectedRDist,
    diagV2.rejectedQty
  );

  var lastMs = master[master.length - 1];
  M9__btForceCloseOpenPositionsAtEnd_(ctx, lastMs);

  var allTrades = ctx.trades;
  var oosTrades = M9__btFilterOosTrades_(allTrades, dr.splitMs);

  var metricsAll = M9__metricsFromTrades_(allTrades);
  var metricsOos = M9__metricsFromTrades_(oosTrades);

  var dailyEqAll = M9__dailyEquityFromCurveAllFast_(ctx.equityCurve4h, p.tz);
  var ddAll = M9__maxDrawdown_(dailyEqAll);
  var sharpeAll = M9__sharpeDaily_(dailyEqAll, M9_CONST.BACKTEST.RISK_FREE_ANNUAL);

  var dailyEqOos = M9__dailyEquityFromCurveSinceMsFast_(ctx.equityCurve4h, dr.splitMs, p.tz);
  var ddOos = M9__maxDrawdown_(dailyEqOos);
  var sharpeOos = M9__sharpeDaily_(dailyEqOos, M9_CONST.BACKTEST.RISK_FREE_ANNUAL);

  var row = M9__blankRow_(28);
  var c = M9_COL.BACKTEST_RESULTS;
  var btId = 'BT-' + M9__uuid_();

  row[c.Backtest_ID] = btId;
  row[c.Start_Date]  = M9__isoDate_(startDate, p.tz);
  row[c.End_Date]    = M9__isoDate_(endDate, p.tz);

  row[c.Total_Trades] = metricsAll.total;
  row[c.Long_Trades]  = metricsAll.longs;
  row[c.Short_Trades] = metricsAll.shorts;

  row[c.Win_Rate_Total] = metricsAll.winRate;
  row[c.Win_Rate_Long]  = metricsAll.winRateLong;
  row[c.Win_Rate_Short] = metricsAll.winRateShort;

  row[c.Avg_Win_Loss_Ratio] = metricsAll.avgWinLoss;
  row[c.Profit_Factor]      = metricsAll.profitFactor;
  row[c.Expectancy_R]       = metricsAll.expectancyR;

  row[c.Max_Drawdown_Pct]           = ddAll.maxPct;
  row[c.Max_Drawdown_Duration_Days] = ddAll.maxDurSteps;
  row[c.Sharpe_Ratio]               = sharpeAll;

  row[c.Liquidation_Events_Pct]   = metricsAll.liqPct;
  row[c.Liquidation_Events_Count] = metricsAll.liqCount;

  row[c.Avg_Funding_Cost_Per_Trade]  = metricsAll.avgFunding;
  row[c.Avg_Borrow_Cost_Per_Trade]   = metricsAll.avgBorrow;
  row[c.Carry_Cost_Pct_Gross_Profit] = metricsAll.carryCostPct;
  row[c.Effective_Leverage_Avg]      = metricsAll.avgLev;

  row[c.DQS_Winners_Avg] = metricsAll.dqsWinAvg;
  row[c.DQS_Losers_Avg]  = metricsAll.dqsLossAvg;

  row[c.R_Multiple_Premium]  = metricsAll.rPrem;
  row[c.R_Multiple_High]     = metricsAll.rHigh;
  row[c.R_Multiple_Standard] = metricsAll.rStd;

  row[c.Win_Rate_RiskOn]  = metricsAll.winRiskOn;
  row[c.Win_Rate_Neutral] = metricsAll.winNeutral;

  M9__appendRows_(M9_CONST.SHEETS.BACKTEST_RESULTS, [row]);

  var passFail = M9__oosPassFail_(metricsOos, ddOos.maxPct, ddOos.maxDurSteps, sharpeOos);
  var dqsSummary = M9__dqsSumFinalize_(ctx);

  Logger.log('[M9] SIM backtest complete: %s ALL=%s OOS=%s Passed=%s',
    btId, metricsAll.total, metricsOos.total, passFail.passed);

  return {
    backtestId: btId,
    mode: 'SIM',
    version: M9_CONST.VERSION,
    splitMs: dr.splitMs,
    diagV2: ctx.diagV2,
    all: {
      metrics: metricsAll,
      dd: ddAll,
      sharpe: sharpeAll
    },
    oos: {
      metrics: metricsOos,
      dd: ddOos,
      sharpe: sharpeOos
    },
    passFail: passFail,
    dqs_summary: dqsSummary
  };
}

/**
 * Inverted-only DQS gate sweep runner.
 *
 * Stable research baseline used:
 * - Universe_Mode = MAJORS_ONLY
 * - Volume_Multiplier_Threshold = 1.5
 * - Invert_All_Signals = TRUE
 * - V2_Long_Only = FALSE
 *
 * Gates swept:
 * - 35
 * - 40
 * - 45
 *
 * Returns an array of result objects.
 */
function RUN_invertedOnlyDqsGateSweep() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var cfg = ss.getSheetByName('CONFIG');
  if (!cfg) throw new Error('CONFIG sheet not found.');

  function findConfigRow_(sheet, key) {
    var data = sheet.getDataRange().getValues();
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0] || '').trim() === key) return i + 1;
    }
    return -1;
  }

  function getConfigValue_(sheet, key, dflt) {
    var row = findConfigRow_(sheet, key);
    if (row < 1) return dflt;
    var v = sheet.getRange(row, 2).getValue();
    return (v === '' || v === null || v === undefined) ? dflt : v;
  }

  function setConfigValue_(sheet, key, value) {
    var row = findConfigRow_(sheet, key);
    if (row < 1) throw new Error('CONFIG key not found: ' + key);
    var oldVal = sheet.getRange(row, 2).getValue();
    sheet.getRange(row, 2).setValue(value);
    SpreadsheetApp.flush();
    Logger.log('[CFG] ' + key + ' updated: ' + oldVal + ' -> ' + value);
  }

  function latestBacktestRow_() {
    var sh = ss.getSheetByName('BACKTEST_RESULTS');
    if (!sh || sh.getLastRow() < 2) return null;
    return sh.getRange(sh.getLastRow(), 1, 1, sh.getLastColumn()).getValues()[0];
  }

  function headerMap_() {
    var sh = ss.getSheetByName('BACKTEST_RESULTS');
    if (!sh) throw new Error('BACKTEST_RESULTS sheet not found.');
    var hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    var hm = {};
    for (var i = 0; i < hdr.length; i++) hm[String(hdr[i] || '').trim()] = i;
    return hm;
  }

  function pick_(row, hm, name) {
    if (!row || !hm || hm[name] === undefined) return '';
    return row[hm[name]];
  }

  var original = {
    DQS_Gate_V2: getConfigValue_(cfg, 'DQS_Gate_V2', 40),
    Universe_Mode: getConfigValue_(cfg, 'Universe_Mode', 'MAJORS_ONLY'),
    Volume_Multiplier_Threshold: getConfigValue_(cfg, 'Volume_Multiplier_Threshold', 1.5),
    Invert_All_Signals: getConfigValue_(cfg, 'Invert_All_Signals', false),
    V2_Long_Only: getConfigValue_(cfg, 'V2_Long_Only', false)
  };

  var gates = [35, 40, 45];
  var hm = headerMap_();
  var results = [];

  try {
    Logger.log('══════════════════════════════════════════════');
    Logger.log('INVERTED-ONLY DQS GATE SWEEP');
    Logger.log('══════════════════════════════════════════════');

    setConfigValue_(cfg, 'Universe_Mode', 'MAJORS_ONLY');
    setConfigValue_(cfg, 'Volume_Multiplier_Threshold', 1.5);
    setConfigValue_(cfg, 'Invert_All_Signals', true);
    setConfigValue_(cfg, 'V2_Long_Only', false);

    for (var g = 0; g < gates.length; g++) {
      var gate = gates[g];
      setConfigValue_(cfg, 'DQS_Gate_V2', gate);

      Logger.log('──────────────────────────────────────────────');
      Logger.log('[SWEEP] Running inverted-only gate=' + gate);

      var btId = RUN_backtestSafe();
      var row = latestBacktestRow_();

      var result = {
        gate: gate,
        backtestId: btId,
        totalTrades: pick_(row, hm, 'Total_Trades'),
        winRate: pick_(row, hm, 'Win_Rate_Total'),
        profitFactor: pick_(row, hm, 'Profit_Factor'),
        expectancyR: pick_(row, hm, 'Expectancy_R'),
        maxDrawdownPct: pick_(row, hm, 'Max_Drawdown_Pct'),
        sharpe: pick_(row, hm, 'Sharpe_Ratio'),
        dqsWinnersAvg: pick_(row, hm, 'DQS_Winners_Avg'),
        dqsLosersAvg: pick_(row, hm, 'DQS_Losers_Avg')
      };

      results.push(result);

      Logger.log(
        '[SWEEP] gate=' + gate +
        ' | BT=' + btId +
        ' | trades=' + result.totalTrades +
        ' | winRate=' + result.winRate +
        ' | PF=' + result.profitFactor +
        ' | expR=' + result.expectancyR +
        ' | maxDD=' + result.maxDrawdownPct +
        ' | sharpe=' + result.sharpe +
        ' | dqsWin=' + result.dqsWinnersAvg +
        ' | dqsLoss=' + result.dqsLosersAvg
      );
    }

    Logger.log('══════════════════════════════════════════════');
    Logger.log('INVERTED-ONLY DQS GATE SWEEP COMPLETE');
    Logger.log('══════════════════════════════════════════════');

    return results;

  } finally {
    try { setConfigValue_(cfg, 'DQS_Gate_V2', original.DQS_Gate_V2); } catch (e1) {}
    try { setConfigValue_(cfg, 'Universe_Mode', original.Universe_Mode); } catch (e2) {}
    try { setConfigValue_(cfg, 'Volume_Multiplier_Threshold', original.Volume_Multiplier_Threshold); } catch (e3) {}
    try { setConfigValue_(cfg, 'Invert_All_Signals', original.Invert_All_Signals); } catch (e4) {}
    try { setConfigValue_(cfg, 'V2_Long_Only', original.V2_Long_Only); } catch (e5) {}
    SpreadsheetApp.flush();
  }
}
/* ──────────────────────────────────────────────
 *  Trade-level metrics aggregator
 * ────────────────────────────────────────────── */

function M9__metricsFromTrades_(trades) {
  var total = trades.length;
  var longs = 0, shorts = 0, wins = 0, winsL = 0, winsS = 0;
  var grossP = 0, grossL = 0;
  var sumR = 0, sumLev = 0;
  var liq = 0;

  var fundSum = 0, borrSum = 0;
  var carryCostAbs = 0;

  var dqsWin = [], dqsLoss = [];
  var rPrem = [], rHigh = [], rStd = [];
  var riskOn = { n: 0, w: 0 };
  var neutral = { n: 0, w: 0 };
  var mfeGt5 = 0;

  for (var i = 0; i < total; i++) {
    var t = trades[i];
    if (t.dir === 'LONG') longs++; else shorts++;

    var isWin = t.netPnlZar > 0;
    if (isWin) {
      wins++;
      grossP += t.netPnlZar;
      if (t.dir === 'LONG') winsL++; else winsS++;
      if (t.dqs !== null && t.dqs !== undefined) dqsWin.push(t.dqs);

      if (t.grade === 'PREMIUM') rPrem.push(t.rMult);
      else if (t.grade === 'HIGH') rHigh.push(t.rMult);
      else rStd.push(t.rMult);
    } else {
      grossL += Math.abs(t.netPnlZar);
      if (t.dqs !== null && t.dqs !== undefined) dqsLoss.push(t.dqs);
    }

    sumR += (t.rMult || 0);
    sumLev += (t.lev || 1);

    if (t.exitReason === 'LIQUIDATED' ||
        t.exitReason === 'LIQUIDATION' ||
        t.exitReason === 'LIQUIDATION_PROTECT') {
      liq++;
    }

    var f = (t.fundingZar || 0);
    var b = (t.borrowZar || 0);
    fundSum += f;
    borrSum += b;
    carryCostAbs += Math.max(0, -f) + Math.max(0, b);

    if (t.regime === 'RISK-ON') { riskOn.n++; if (isWin) riskOn.w++; }
    if (t.regime === 'NEUTRAL') { neutral.n++; if (isWin) neutral.w++; }

    if ((t.mfeR || 0) > 5.0) mfeGt5++;
  }

  var wr = total ? wins / total : 0;
  var wrL = longs ? winsL / longs : 0;
  var wrS = shorts ? winsS / shorts : 0;

  var avgWin = wins ? grossP / wins : 0;
  var avgLoss = (total - wins) ? grossL / (total - wins) : 0;
  var awl = avgLoss ? avgWin / avgLoss : 0;

  var pf = grossL ? grossP / grossL : 0;
  var expR = total ? sumR / total : 0;
  var liqPct = total ? liq / total : 0;

  return {
    total: total,
    longs: longs,
    shorts: shorts,
    winRate: wr,
    winRateLong: wrL,
    winRateShort: wrS,
    avgWinLoss: awl,
    profitFactor: pf,
    expectancyR: expR,
    liqCount: liq,
    liqPct: liqPct,
    avgFunding: total ? fundSum / total : 0,
    avgBorrow: total ? borrSum / total : 0,
    carryCostPct: grossP ? (carryCostAbs / grossP) : 0,
    avgLev: total ? sumLev / total : 1,
    dqsWinAvg: M9__mean_(dqsWin),
    dqsLossAvg: M9__mean_(dqsLoss),
    rPrem: M9__mean_(rPrem),
    rHigh: M9__mean_(rHigh),
    rStd: M9__mean_(rStd),
    winRiskOn: riskOn.n ? (riskOn.w / riskOn.n) : 0,
    winNeutral: neutral.n ? (neutral.w / neutral.n) : 0,
    mfeGt5R: total ? (mfeGt5 / total) : 0
  };
}




function M9__oosPassFail_(m, ddPct, ddDays, sharpe) {
  var reasons = [];

  var T = {
    MIN_TRADES: 20,
    WIN_RATE_LONG: 0.42,
    WIN_RATE_SHORT: 0.37,
    AVG_WIN_LOSS: 2.3,
    PROFIT_FACTOR: 1.30,
    EXPECTANCY_R: 0.18,
    MAX_DD_PCT: 0.22,
    MAX_DD_DAYS: 120,
    SHARPE: 0.8,
    LIQ_EVENTS_PCT: 0.06
  };

  var total = (m && isFinite(+m.total)) ? (+m.total) : 0;
  var longs = (m && isFinite(+m.longs)) ? (+m.longs) : 0;
  var shorts = (m && isFinite(+m.shorts)) ? (+m.shorts) : 0;
  var winRateLong = (m && isFinite(+m.winRateLong)) ? (+m.winRateLong) : 0;
  var winRateShort = (m && isFinite(+m.winRateShort)) ? (+m.winRateShort) : 0;
  var avgWinLoss = (m && isFinite(+m.avgWinLoss)) ? (+m.avgWinLoss) : 0;
  var profitFactor = (m && isFinite(+m.profitFactor)) ? (+m.profitFactor) : 0;
  var expectancyR = (m && isFinite(+m.expectancyR)) ? (+m.expectancyR) : 0;
  var liqPct = (m && isFinite(+m.liqPct)) ? (+m.liqPct) : 0;

  ddPct = isFinite(+ddPct) ? (+ddPct) : 0;
  ddDays = isFinite(+ddDays) ? (+ddDays) : 0;
  sharpe = isFinite(+sharpe) ? (+sharpe) : 0;

  function f3_(x) {
    return isFinite(x) ? (Math.round(x * 1000) / 1000) : x;
  }

  if (total < T.MIN_TRADES) {
    reasons.push('OOS_Total_Trades(' + total + ')<' + T.MIN_TRADES);
  }
  if (longs > 0 && winRateLong < T.WIN_RATE_LONG) {
    reasons.push('OOS_Long_WinRate(' + f3_(winRateLong) + ')<' + T.WIN_RATE_LONG);
  }
  if (shorts > 0 && winRateShort < T.WIN_RATE_SHORT) {
    reasons.push('OOS_Short_WinRate(' + f3_(winRateShort) + ')<' + T.WIN_RATE_SHORT);
  }
  if (avgWinLoss < T.AVG_WIN_LOSS) {
    reasons.push('OOS_AvgWinLoss(' + f3_(avgWinLoss) + ')<' + T.AVG_WIN_LOSS);
  }
  if (profitFactor < T.PROFIT_FACTOR) {
    reasons.push('OOS_PF(' + f3_(profitFactor) + ')<' + T.PROFIT_FACTOR);
  }
  if (expectancyR < T.EXPECTANCY_R) {
    reasons.push('OOS_ExpectancyR(' + f3_(expectancyR) + ')<' + T.EXPECTANCY_R);
  }
  if (ddPct > T.MAX_DD_PCT) {
    reasons.push('OOS_MaxDD(' + f3_(ddPct) + ')>' + T.MAX_DD_PCT);
  }
  if (ddDays > T.MAX_DD_DAYS) {
    reasons.push('OOS_MaxDD_Days(' + f3_(ddDays) + ')>' + T.MAX_DD_DAYS);
  }
  if (sharpe < T.SHARPE) {
    reasons.push('OOS_Sharpe(' + f3_(sharpe) + ')<' + T.SHARPE);
  }
  if (liqPct > T.LIQ_EVENTS_PCT) {
    reasons.push('OOS_LiqPct(' + f3_(liqPct) + ')>' + T.LIQ_EVENTS_PCT);
  }

  return {
    passed: reasons.length === 0,
    reasons: reasons
  };
}

function M9__assertTrue4HData_(input) {
  if (!input) {
    Logger.log('[M9] assertTrue4HData: no input, skipping.');
    return;
  }

  var syms;
  var counts = {};

  // Determine input type
  if (Array.isArray(input)) {
    // Array of symbol strings
    syms = input;
  } else if (typeof input === 'object') {
    // bySym object from SIM — keys are symbols, values are candle arrays
    syms = [];
    for (var k in input) {
      if (input.hasOwnProperty(k)) {
        syms.push(k);
        counts[k] = input[k].length || 0;
      }
    }
  } else {
    Logger.log('[M9] assertTrue4HData: unrecognized input type, skipping.');
    return;
  }

  if (!syms.length) {
    Logger.log('[M9] assertTrue4HData: empty symbol list.');
    return;
  }

  // If we don't have counts yet (array input), scan DATA_CLEAN
  if (Object.keys(counts).length === 0) {
    try {
      var dc = M9__readAll_(M9_CONST.SHEETS.DATA_CLEAN);
      var hm = M9__headerMap_(dc[0]);
      var cSym = M9__idx_(hm, 'Symbol', true);
      var cTf  = M9__idx_(hm, 'Timeframe', true);
      for (var i = 1; i < dc.length; i++) {
        if (String(dc[i][cTf]) === '4H') {
          var s = String(dc[i][cSym]);
          counts[s] = (counts[s] || 0) + 1;
        }
      }
    } catch (e) {
      Logger.log('[M9] assertTrue4HData: could not read DATA_CLEAN: ' + e.message);
      return;
    }
  }

  var missing = [];
  var thin = [];
  for (var j = 0; j < syms.length; j++) {
    var sym = syms[j];
    var cnt = counts[sym] || 0;
    if (cnt === 0) {
      missing.push(sym);
    } else if (cnt < 60) {
      // Need at least ~60 candles for ATR(14) + lookback(30) + warmup
      thin.push(sym + '(' + cnt + ')');
    }
  }

  if (missing.length) {
    Logger.log('[M9] WARNING: 4H data MISSING for: ' + missing.join(', '));
  }
  if (thin.length) {
    Logger.log('[M9] WARNING: 4H data THIN for: ' + thin.join(', '));
  }
  if (!missing.length && !thin.length) {
    Logger.log('[M9] assertTrue4HData: all ' + syms.length + ' symbols have sufficient 4H data. ✓');
  }
}


if (typeof M2_requireCanonicalHistoryForBacktest !== 'function') {
  function M2_requireCanonicalHistoryForBacktest() {
    Logger.log('[M9] M2_requireCanonicalHistoryForBacktest not defined in M2 — skipping gate check.');
  }
}

/* =========================
 * LOGS MODE — Score engine logs (optional)
 * ========================= */

function M9_runBacktestMetricsFromLogs() {
  M9__ensureHeader_(M9_CONST.SHEETS.BACKTEST_RESULTS, M9_CONST.HEADERS.BACKTEST_RESULTS);

  var cfg = M9__cfgLoadMap_();
  var tz = M9__cfgStr_(cfg, 'Timezone', 'Africa/Johannesburg');

  var posAll = M9__readAllIfExists_(M9_CONST.SHEETS.POSITIONS);
  if (!posAll || posAll.length < 2) throw new Error('[M9] POSITIONS empty. Use SIM mode or run engine BACKTEST first.');

  var sigAll = M9__readAllIfExists_(M9_CONST.SHEETS.SIGNALS);
  var riskAll = M9__readAllIfExists_(M9_CONST.SHEETS.RISK_CALC);
  var ordAll = M9__readAllIfExists_(M9_CONST.SHEETS.ORDERS);
  var fundAll = M9__readAllIfExists_(M9_CONST.SHEETS.FUNDING_LOG);

  var posH = M9__headerMap_(posAll[0]);
  var sigH = sigAll.length ? M9__headerMap_(sigAll[0]) : {};
  var riskH = riskAll.length ? M9__headerMap_(riskAll[0]) : {};
  var ordH = ordAll.length ? M9__headerMap_(ordAll[0]) : {};
  var fundH = fundAll.length ? M9__headerMap_(fundAll[0]) : {};

  // SIGNALS map
  var signalMap = {};
  if (sigAll.length >= 2) {
    var sId = M9__idx_(sigH, 'Signal_ID', false);
    var sDqs = M9__idx_(sigH, 'DQS_Total', false);
    var sGrade = M9__idx_(sigH, 'DQS_Grade', false);
    var sReg = M9__idx_(sigH, 'Market_Regime', false);
    if (sId >= 0) {
      for (var i = 1; i < sigAll.length; i++) {
        var sid = String(sigAll[i][sId] || '').trim();
        if (!sid) continue;
        signalMap[sid] = {
          dqs: (sDqs >= 0) ? M9__safeNum_(sigAll[i][sDqs]) : null,
          grade: (sGrade >= 0) ? String(sigAll[i][sGrade] || '') : '',
          regime: (sReg >= 0) ? String(sigAll[i][sReg] || '') : ''
        };
      }
    }
  }

  // Risk map
  var riskBySig = {};
  if (riskAll.length >= 2) {
    var rSid = M9__idx_(riskH, 'Signal_ID', false);
    var rAmt = M9__idx_(riskH, 'Risk_Amount_ZAR', false);
    if (rSid >= 0 && rAmt >= 0) {
      for (i = 1; i < riskAll.length; i++) {
        sid = String(riskAll[i][rSid] || '').trim();
        if (!sid) continue;
        riskBySig[sid] = M9__safeNum_(riskAll[i][rAmt]);
      }
    }
  }

  // Fees by Position or Signal
  var feeByPos = {}, feeBySig = {};
  if (ordAll.length >= 2) {
    var oFee = M9__idx_(ordH, 'Fee_ZAR', false);
    var oPid = M9__idx_(ordH, 'Linked_Position_ID', false);
    if (oPid < 0) oPid = M9__idx_(ordH, 'Position_ID', false);
    var oSid = M9__idx_(ordH, 'Linked_Signal_ID', false);
    if (oSid < 0) oSid = M9__idx_(ordH, 'Signal_ID', false);

    if (oFee >= 0) {
      for (i = 1; i < ordAll.length; i++) {
        var fee = M9__safeNum_(ordAll[i][oFee]);
        if (oPid >= 0) {
          var pid = String(ordAll[i][oPid] || '').trim();
          if (pid) feeByPos[pid] = (feeByPos[pid] || 0) + fee;
        }
        if (oSid >= 0) {
          sid = String(ordAll[i][oSid] || '').trim();
          if (sid) feeBySig[sid] = (feeBySig[sid] || 0) + fee;
        }
      }
    }
  }

  // Funding by Position if present
  var fundingByPos = {};
  if (fundAll.length >= 2) {
    var fPid = M9__idx_(fundH, 'Linked_Position_ID', false);
    if (fPid < 0) fPid = M9__idx_(fundH, 'Position_ID', false);
    var fAmt = M9__idx_(fundH, 'Amount_ZAR', false);
    if (fPid >= 0 && fAmt >= 0) {
      for (i = 1; i < fundAll.length; i++) {
        pid = String(fundAll[i][fPid] || '').trim();
        if (!pid) continue;
        fundingByPos[pid] = (fundingByPos[pid] || 0) + M9__safeNum_(fundAll[i][fAmt]);
      }
    }
  }

  var cStatus = M9__idx_(posH, 'Position_Status', false);
  var cPid2 = M9__idx_(posH, 'Position_ID', false);
  var cSym = M9__idx_(posH, 'Symbol', true);
  var cDir = M9__idx_(posH, 'Direction', true);
  var cEntryTs = M9__idx_(posH, 'Entry_Timestamp', true);
  var cExitTs = M9__idx_(posH, 'Exit_Timestamp', false);
  var cPnl = M9__idx_(posH, 'Total_Realized_PnL_ZAR', false);
  var cBorrow = M9__idx_(posH, 'Borrow_Accrued_ZAR', false);
  var cLev = M9__idx_(posH, 'Leverage', false);
  var cExitReason = M9__idx_(posH, 'Exit_Reason', false);
  var cLinkSig = M9__idx_(posH, 'Linked_Signal_ID', false);

  var trades = [];
  var minEntry = null, maxExit = null;

  for (i = 1; i < posAll.length; i++) {
    var pr = posAll[i];
    if (cStatus >= 0 && String(pr[cStatus] || '').trim() !== 'CLOSED') continue;

    var entryD = new Date(pr[cEntryTs]);
    var entryMs = entryD.getTime();
    if (!isFinite(entryMs)) continue;

    var exitVal = (cExitTs >= 0 && pr[cExitTs]) ? pr[cExitTs] : pr[cEntryTs];
    var exitD = new Date(exitVal);
    var exitMs = exitD.getTime();
    if (!isFinite(exitMs)) exitMs = entryMs;

    if (minEntry === null || entryMs < minEntry) minEntry = entryMs;
    if (maxExit === null || exitMs > maxExit) maxExit = exitMs;

    var pid2 = (cPid2 >= 0) ? String(pr[cPid2] || '').trim() : '';
    var sid2 = (cLinkSig >= 0) ? String(pr[cLinkSig] || '').trim() : '';

    var sig = (sid2 && signalMap[sid2]) ? signalMap[sid2] : { dqs: null, grade: '', regime: '' };
    var riskZ = (sid2 && riskBySig.hasOwnProperty(sid2)) ? riskBySig[sid2] : 0;

    var fees = 0;
    if (pid2 && feeByPos.hasOwnProperty(pid2)) fees = feeByPos[pid2];
    else if (sid2 && feeBySig.hasOwnProperty(sid2)) fees = feeBySig[sid2];

    trades.push({
      sym: String(pr[cSym] || ''),
      dir: String(pr[cDir] || ''),
      entryMs: entryMs,
      exitMs: exitMs,
      lev: (cLev >= 0) ? M9__safeNum_(pr[cLev]) : 1,
      exitReason: (cExitReason >= 0) ? String(pr[cExitReason] || '') : '',
      dqs: sig.dqs,
      grade: sig.grade,
      regime: sig.regime,
      netPnlZar: (cPnl >= 0) ? M9__safeNum_(pr[cPnl]) : 0,
      borrowZar: (cBorrow >= 0) ? M9__safeNum_(pr[cBorrow]) : 0,
      fundingZar: (pid2 && fundingByPos.hasOwnProperty(pid2)) ? fundingByPos[pid2] : 0,
      feesZar: fees,
      riskZar: riskZ
    });
  }

  if (!trades.length) throw new Error('[M9] No CLOSED trades found in POSITIONS.');

  var splitMs = minEntry + (maxExit - minEntry) * M9_CONST.BACKTEST.IN_SAMPLE_PCT;

  var oos = [];
  for (i = 0; i < trades.length; i++) {
    var t = trades[i];
    if (t.entryMs < splitMs) continue;
    t.rMult = (t.riskZar && t.riskZar > 0) ? (t.netPnlZar / t.riskZar) : 0;
    oos.push(t);
  }

  var metrics = M9__metricsFromTrades_(oos);

  // Daily equity by exit date (approx; best available from logs)
  var startEq = M9__cfgNum_(cfg, 'Backtest_Start_Equity_ZAR', 100000);
  var pnlByDay = {};
  for (i = 0; i < oos.length; i++) {
    var k = M9__isoDate_(new Date(oos[i].exitMs), tz);
    pnlByDay[k] = (pnlByDay[k] || 0) + oos[i].netPnlZar;
  }
  var days = [];
  for (var dk in pnlByDay) if (pnlByDay.hasOwnProperty(dk)) days.push(dk);
  days.sort();

  var dailyEq = [];
  var eq = startEq;
  for (i = 0; i < days.length; i++) { eq += pnlByDay[days[i]]; dailyEq.push(eq); }

  var dd = M9__maxDrawdown_(dailyEq);
  var sharpe = M9__sharpeDaily_(dailyEq, M9_CONST.BACKTEST.RISK_FREE_ANNUAL);

  var row = M9__blankRow_(28);
  var c = M9_COL.BACKTEST_RESULTS;
  var btId = 'BT-' + M9__uuid_();

  row[c.Backtest_ID] = btId;
  row[c.Start_Date] = M9__isoDate_(new Date(minEntry), tz);
  row[c.End_Date] = M9__isoDate_(new Date(maxExit), tz);

  row[c.Total_Trades] = metrics.total;
  row[c.Long_Trades] = metrics.longs;
  row[c.Short_Trades] = metrics.shorts;

  row[c.Win_Rate_Total] = metrics.winRate;
  row[c.Win_Rate_Long] = metrics.winRateLong;
  row[c.Win_Rate_Short] = metrics.winRateShort;

  row[c.Avg_Win_Loss_Ratio] = metrics.avgWinLoss;
  row[c.Profit_Factor] = metrics.profitFactor;
  row[c.Expectancy_R] = metrics.expectancyR;

  row[c.Max_Drawdown_Pct] = dd.maxPct;
  row[c.Max_Drawdown_Duration_Days] = dd.maxDurSteps;
  row[c.Sharpe_Ratio] = sharpe;

  row[c.Liquidation_Events_Pct] = metrics.liqPct;
  row[c.Liquidation_Events_Count] = metrics.liqCount;

  row[c.Avg_Funding_Cost_Per_Trade] = metrics.avgFunding;
  row[c.Avg_Borrow_Cost_Per_Trade] = metrics.avgBorrow;
  row[c.Carry_Cost_Pct_Gross_Profit] = metrics.carryCostPct;
  row[c.Effective_Leverage_Avg] = metrics.avgLev;

  row[c.DQS_Winners_Avg] = metrics.dqsWinAvg;
  row[c.DQS_Losers_Avg] = metrics.dqsLossAvg;

  row[c.R_Multiple_Premium] = metrics.rPrem;
  row[c.R_Multiple_High] = metrics.rHigh;
  row[c.R_Multiple_Standard] = metrics.rStd;

  row[c.Win_Rate_RiskOn] = metrics.winRiskOn;
  row[c.Win_Rate_Neutral] = metrics.winNeutral;

  M9__appendRows_(M9_CONST.SHEETS.BACKTEST_RESULTS, [row]);

  var passFail = M9__oosPassFail_(metrics, dd.maxPct, dd.maxDurSteps, sharpe);
  M9__props_().setProperty('M9_DIAG_' + btId, JSON.stringify({
    mode: 'LOGS',
    version: M9_CONST.VERSION,
    splitMs: splitMs,
    thresholds: M9_CONST.THRESH_OOS,
    oos: metrics,
    ddDailyOOS: { maxPct: dd.maxPct, durationDays: dd.maxDurSteps },
    sharpeOOS: sharpe,
    passFail: passFail
  }));

  Logger.log('[M9] LOGS metrics complete: %s OOS=%s Passed=%s', btId, metrics.total, passFail.passed);
  return btId;
}


function RUN__setBacktestDiagFull_(btId, obj) {
  btId = String(btId || '').trim();
  if (!btId) return null;

  var body = {
    diag_blob: obj || {}
  };

  try {
    var rows = M10__sbFetchJson_(
      'patch',
      '/rest/v1/experiment_logs?backtest_id=eq.' + encodeURIComponent(btId),
      body
    );
    Logger.log('[RUN][DIAG] Supabase diag_blob upserted for btId=' + btId);
    return rows;
  } catch (e) {
    Logger.log('[RUN][DIAG][WARN] Could not push diag_blob to Supabase for btId=' + btId + ': ' + e.message);
    return null;
  }
}


function RUN__getBacktestDiagFull_(btId) {
  btId = String(btId || '').trim();
  if (!btId) return {};

  try {
    var rows = M10__sbFetchJson_(
      'get',
      '/rest/v1/experiment_logs?backtest_id=eq.' + encodeURIComponent(btId) +
      '&select=diag_blob&order=created_at.desc&limit=1'
    );

    if (rows && rows.length && rows[0] && rows[0].diag_blob) {
      return rows[0].diag_blob;
    }
  } catch (e) {
    Logger.log('[RUN][DIAG][WARN] Could not fetch diag_blob from Supabase for btId=' + btId + ': ' + e.message);
  }

  return {};
}

/* =========================
 * Sensitivity sweep (SIM)
 * ========================= */
function M9_runSensitivitySweep(paramName) {
  var cap = 6;
  if (!paramName) throw new Error('[M9] Sensitivity requires paramName.');

  var vals = [];
  function pushRange_(min, max, step) { for (var v = min; v <= max; v += step) vals.push(v); }

  if (paramName === 'Resistance_Lookback_N') pushRange_(15, 60, 5);
  else if (paramName === 'Volume_Multiplier') pushRange_(1.2, 2.4, 0.2);
  else if (paramName === 'ATR_Stop_Multiple') pushRange_(1.0, 3.0, 0.5);
  else if (paramName === 'Cooldown_Period_Candles') pushRange_(6, 24, 6);
  else if (paramName === 'DQS_Minimum') pushRange_(30, 60, 10);
  else if (paramName === 'Runner_Trail_ATR_Multiple') pushRange_(1.0, 3.0, 0.5);
  else if (paramName === 'Max_Leverage') pushRange_(1, 5, 1);
  else throw new Error('[M9] Unsupported sensitivity param: ' + paramName);

  if (vals.length > cap) vals = vals.slice(0, cap);

  var p = M9__props_();
  var old = p.getProperty('M9_CFG_OVERRIDE');

  for (var i = 0; i < vals.length; i++) {
    var ov = {}; ov[paramName] = vals[i];
    p.setProperty('M9_CFG_OVERRIDE', JSON.stringify(ov));
    Logger.log('[M9] Sensitivity %s=%s', paramName, vals[i]);
    M9_runWalkForwardBacktest();
  }

  if (old) p.setProperty('M9_CFG_OVERRIDE', old);
  else p.deleteProperty('M9_CFG_OVERRIDE');
}

/* =========================================================
 * MODULE 9 — SARS Tax Export (append-only + dedup + CSV)
 * ========================================================= */

function M9_generateSarsTaxExport() {
  M9__ensureHeader_(M9_CONST.SHEETS.ARCHIVE, M9_CONST.HEADERS.ARCHIVE);

  var cfg = M9__cfgLoadMap_();
  var corePct = M9__cfgNum_(cfg, 'Core_Pct', 0.60);
  if (corePct <= 0 || corePct >= 1) corePct = 0.60;

  var archExisting = M9__readAll_(M9_CONST.SHEETS.ARCHIVE);
  var existingKeys = {};
  for (var i = 1; i < archExisting.length; i++) existingKeys[M9__archiveKey_(archExisting[i])] = true;

  var out = [];
  out = out.concat(M9__taxRowsFromPositions_(corePct));
  out = out.concat(M9__taxRowsFromFunding_());
  out = out.concat(M9__taxRowsFromCollateral_());

  var deduped = [];
  for (i = 0; i < out.length; i++) {
    var k = M9__archiveKey_(out[i]);
    if (existingKeys[k]) continue;
    existingKeys[k] = true;
    deduped.push(out[i]);
  }

  if (deduped.length === 0) {
    Logger.log('[M9] No new tax events to append.');
    return '';
  }

  M9__appendRows_(M9_CONST.SHEETS.ARCHIVE, deduped);

  var csv = M9_CONST.HEADERS.ARCHIVE.join(',') + '\n' + M9__rowsToCsv_(deduped);

  try {
    var fname = 'SARS_EXPORT_' + M9__isoDate_(new Date(), 'Africa/Johannesburg') + '.csv';
    var f = DriveApp.createFile(fname, csv, MimeType.CSV);
    Logger.log('[M9] SARS CSV created: %s', f.getUrl());
  } catch (e) {
    Logger.log('[M9] Drive CSV creation failed/skipped: %s', e.message);
  }

  return csv;
}

function M9__feesMaps_() {
  // Supports Position_ID OR Linked_Signal_ID
  var out = { byPosId: {}, bySigId: {} };
  var ord = M9__readAllIfExists_(M9_CONST.SHEETS.ORDERS);
  if (!ord || ord.length < 2) return out;

  var hm = M9__headerMap_(ord[0]);
  var cFee = M9__idx_(hm, 'Fee_ZAR', false);
  if (cFee < 0) return out;

  var cPid = M9__idx_(hm, 'Linked_Position_ID', false);
  if (cPid < 0) cPid = M9__idx_(hm, 'Position_ID', false);

  var cSid = M9__idx_(hm, 'Linked_Signal_ID', false);
  if (cSid < 0) cSid = M9__idx_(hm, 'Signal_ID', false);

  for (var i = 1; i < ord.length; i++) {
    var r = ord[i];
    var fee = M9__safeNum_(r[cFee]);

    if (cPid >= 0) {
      var pid = String(r[cPid] || '').trim();
      if (pid) out.byPosId[pid] = (out.byPosId[pid] || 0) + fee;
    }
    if (cSid >= 0) {
      var sid = String(r[cSid] || '').trim();
      if (sid) out.bySigId[sid] = (out.bySigId[sid] || 0) + fee;
    }
  }
  return out;
}

function M9__taxRowsFromPositions_(corePctCfg) {
  var rows = [];
  var pos = M9__readAllIfExists_(M9_CONST.SHEETS.POSITIONS);
  if (!pos || pos.length < 2) return rows;

  var hm = M9__headerMap_(pos[0]);

  var cStatus = M9__idx_(hm, 'Position_Status', false);
  var cSym = M9__idx_(hm, 'Symbol', true);
  var cDir = M9__idx_(hm, 'Direction', true);
  var cEntryTs = M9__idx_(hm, 'Entry_Timestamp', true);
  var cEntryZ = M9__idx_(hm, 'Entry_Price_ZAR', true);

  var cFxO = M9__idx_(hm, 'FX_Rate_At_Open', false);
  if (cFxO < 0) cFxO = M9__idx_(hm, 'USDT_ZAR_At_Entry', false);

  var cFxC = M9__idx_(hm, 'FX_Rate_At_Close', false);
  if (cFxC < 0) cFxC = M9__idx_(hm, 'USDT_ZAR_At_Close', false);

  var cBorrow = M9__idx_(hm, 'Borrow_Accrued_ZAR', false);

  var cPosId = M9__idx_(hm, 'Position_ID', false);
  var cSigId = M9__idx_(hm, 'Linked_Signal_ID', false);

  var cCoreQty = M9__idx_(hm, 'Core_Size', false);
  var cRunQty = M9__idx_(hm, 'Runner_Size', false);
  var cCoreExitTs = M9__idx_(hm, 'Core_Exit_Timestamp', false);
  var cRunExitTs = M9__idx_(hm, 'Runner_Exit_Timestamp', false);
  var cCoreExitZ = M9__idx_(hm, 'Core_Exit_Price_ZAR', false);
  var cRunExitZ = M9__idx_(hm, 'Runner_Exit_Price_ZAR', false);
  var cCorePnl = M9__idx_(hm, 'Core_Realized_PnL_ZAR', false);
  var cRunPnl = M9__idx_(hm, 'Runner_Realized_PnL_ZAR', false);
  var cTotalPnl = M9__idx_(hm, 'Total_Realized_PnL_ZAR', false);

  var cExitTs = M9__idx_(hm, 'Exit_Timestamp', false);
  var cExitZ = M9__idx_(hm, 'Exit_Price_ZAR', false);
  var cQty = M9__idx_(hm, 'Position_Size', false);

  var feeMaps = M9__feesMaps_();

  function feeFor_(pid, sid) {
    if (pid && feeMaps.byPosId.hasOwnProperty(pid)) return feeMaps.byPosId[pid];
    if (sid && feeMaps.bySigId.hasOwnProperty(sid)) return feeMaps.bySigId[sid];
    return 0;
  }

  for (var i = 1; i < pos.length; i++) {
    var r = pos[i];
    if (cStatus >= 0 && String(r[cStatus]).trim() === 'OPEN') continue;

    var entryTs = r[cEntryTs];
    var fxO = (cFxO >= 0) ? r[cFxO] : '';
    var fxC = (cFxC >= 0) ? r[cFxC] : fxO;
    var borrow = (cBorrow >= 0) ? M9__safeNum_(r[cBorrow]) : 0;

    var pid = (cPosId >= 0) ? String(r[cPosId] || '') : '';
    var sid = (cSigId >= 0) ? String(r[cSigId] || '') : '';
    var feeTot = feeFor_(pid, sid);

    var hasCore = (cCoreExitTs >= 0 && r[cCoreExitTs]);
    var hasRun  = (cRunExitTs >= 0 && r[cRunExitTs]);

    var coreQty = (cCoreQty >= 0) ? M9__safeNum_(r[cCoreQty]) : 0;
    var runQty  = (cRunQty  >= 0) ? M9__safeNum_(r[cRunQty])  : 0;
    var totQty  = coreQty + runQty;

    var coreW = (totQty > 0) ? (coreQty / totQty) : corePctCfg;
    var runW  = 1 - coreW;

    if (hasCore) {
      rows.push(M9__buildArchiveRow_(
        entryTs, r[cCoreExitTs], r[cSym], r[cDir],
        (cCoreQty >= 0 ? r[cCoreQty] : ''),
        r[cEntryZ], (cCoreExitZ >= 0 ? r[cCoreExitZ] : ''),
        feeTot * coreW, 0, 0, borrow * coreW,
        (cCorePnl >= 0 ? r[cCorePnl] : ''),
        M9__holdingDays_(entryTs, r[cCoreExitTs]),
        fxO, fxC,
        M9_CONST.TAX_EVENT.CORE_PARTIAL_CLOSE
      ));
    }

    if (hasRun) {
      rows.push(M9__buildArchiveRow_(
        entryTs, r[cRunExitTs], r[cSym], r[cDir],
        (cRunQty >= 0 ? r[cRunQty] : ''),
        r[cEntryZ], (cRunExitZ >= 0 ? r[cRunExitZ] : ''),
        feeTot * runW, 0, 0, borrow * runW,
        (cRunPnl >= 0 ? r[cRunPnl] : ''),
        M9__holdingDays_(entryTs, r[cRunExitTs]),
        fxO, fxC,
        M9_CONST.TAX_EVENT.RUNNER_PARTIAL_CLOSE
      ));
    }

    if (!hasCore && !hasRun) {
      var closeTs = (cExitTs >= 0 && r[cExitTs]) ? r[cExitTs] : entryTs;
      var exitZ = (cExitZ >= 0 && r[cExitZ]) ? r[cExitZ] : '';
      var qty = (cQty >= 0) ? r[cQty] : '';

      rows.push(M9__buildArchiveRow_(
        entryTs, closeTs, r[cSym], r[cDir],
        qty,
        r[cEntryZ], exitZ,
        feeTot, 0, 0, borrow,
        (cTotalPnl >= 0 ? r[cTotalPnl] : ''),
        M9__holdingDays_(entryTs, closeTs),
        fxO, fxC,
        M9_CONST.TAX_EVENT.TRADE_CLOSE
      ));
    }
  }

  return rows;
}

/**
 * Funding export with Direction fallback to Position_Side and supports Cost_Direction if present.
 */
function M9__taxRowsFromFunding_() {
  var rows = [];
  var f = M9__readAllIfExists_(M9_CONST.SHEETS.FUNDING_LOG);
  if (!f || f.length < 2) return rows;

  var hm = M9__headerMap_(f[0]);
  var cTs = M9__idx_(hm, 'Timestamp', true);
  var cSym = M9__idx_(hm, 'Symbol', true);

  var cDir = M9__idx_(hm, 'Direction', false);
  var cSide = M9__idx_(hm, 'Position_Side', false); // fallback if Direction missing

  var cQty = M9__idx_(hm, 'Qty', false);
  if (cQty < 0) cQty = M9__idx_(hm, 'Position_Size', false);

  var cAmt = M9__idx_(hm, 'Amount_ZAR', true);

  var cFx = M9__idx_(hm, 'FX_Rate_At_Settlement', false);
  if (cFx < 0) cFx = M9__idx_(hm, 'USDT_ZAR_Rate_At_Settlement', false);

  var cCostDir = M9__idx_(hm, 'Cost_Direction', false); // 'PAID'|'RECEIVED' (if logged)

  for (var i = 1; i < f.length; i++) {
    var r = f[i];
    var ts = r[cTs];
    var amt = M9__safeNum_(r[cAmt]);

    var paid = 0, rec = 0;
    if (cCostDir >= 0) {
      var cd = String(r[cCostDir] || '').trim();
      if (cd === 'PAID') paid = Math.abs(amt);
      else rec = Math.abs(amt);
    } else {
      if (amt < 0) paid = Math.abs(amt);
      else rec = amt;
    }

    var dirVal = '';
    if (cDir >= 0) dirVal = r[cDir];
    else if (cSide >= 0) dirVal = r[cSide];

    rows.push(M9__buildArchiveRow_(
      ts, ts,
      r[cSym],
      dirVal,
      (cQty >= 0 ? r[cQty] : ''),
      'N/A', 'N/A',
      0,
      paid, rec,
      0,
      amt,
      0,
      (cFx >= 0 ? r[cFx] : ''),
      (cFx >= 0 ? r[cFx] : ''),
      M9_CONST.TAX_EVENT.FUNDING_SETTLEMENT
    ));
  }

  return rows;
}

function M9__taxRowsFromCollateral_() {
  var rows = [];
  var c = M9__readAllIfExists_(M9_CONST.SHEETS.COLLATERAL);
  if (!c || c.length < 2) return rows;

  var hm = M9__headerMap_(c[0]);
  var cTs = M9__idx_(hm, 'Timestamp', false);
  var cAsset = M9__idx_(hm, 'Asset', false);
  var cQty = M9__idx_(hm, 'Quantity', false);
  var cEntry = M9__idx_(hm, 'Entry_ZAR', false);
  var cExit = M9__idx_(hm, 'Exit_ZAR', false);
  var cRole = M9__idx_(hm, 'Role', false);
  var cNet = M9__idx_(hm, 'Net_PnL_ZAR', false);

  for (var i = 1; i < c.length; i++) {
    var r = c[i];
    var role = (cRole >= 0) ? String(r[cRole] || '').trim() : '';
    if (role !== 'CONVERSION' && role !== 'COLLATERAL_CONVERSION') continue;

    rows.push(M9__buildArchiveRow_(
      (cTs >= 0 ? r[cTs] : ''),
      (cTs >= 0 ? r[cTs] : ''),
      (cAsset >= 0 ? r[cAsset] : ''),
      '',
      (cQty >= 0 ? r[cQty] : ''),
      (cEntry >= 0 ? r[cEntry] : ''),
      (cExit >= 0 ? r[cExit] : ''),
      0,
      0, 0,
      0,
      (cNet >= 0 ? r[cNet] : ''),
      0,
      1, 1,
      M9_CONST.TAX_EVENT.COLLATERAL_CONVERSION
    ));
  }
  return rows;
}

function M9__buildArchiveRow_(opened, closed, asset, direction, qty, entryZ, exitZ, feesZ, fPaid, fRec, borrowZ, netPnlZ, holdingDays, fxO, fxC, eventType) {
  var r = M9__blankRow_(16);
  var c = M9_COL.ARCHIVE;

  r[c.Date_Opened] = opened;
  r[c.Date_Closed] = closed;
  r[c.Asset] = asset;
  r[c.Direction] = direction;
  r[c.Qty] = qty;
  r[c.Entry_ZAR] = entryZ;
  r[c.Exit_ZAR] = exitZ;
  r[c.Fees_ZAR] = feesZ;
  r[c.Funding_Paid_ZAR] = fPaid;
  r[c.Funding_Received_ZAR] = fRec;
  r[c.Borrow_Cost_ZAR] = borrowZ;
  r[c.Net_PnL_ZAR] = netPnlZ;
  r[c.Holding_Days] = holdingDays;
  r[c.FX_Rate_At_Open] = fxO;
  r[c.FX_Rate_At_Close] = fxC;
  r[c.Event_Type] = eventType;

  return r;
}

function M9__holdingDays_(openTs, closeTs) {
  try {
    var o = new Date(openTs).getTime();
    var c = new Date(closeTs).getTime();
    if (!isFinite(o) || !isFinite(c) || c < o) return '';
    return Math.floor((c - o) / (24 * 60 * 60 * 1000));
  } catch (e) { return ''; }
}

/* =========================================================
 * MODULE 9 — UI + Tests
 * IMPORTANT: do NOT define global onOpen() here to avoid collisions.
 * Call M9_installMenu() from your system's existing onOpen().
 * ========================================================= */

function M9_installMenu() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('M9 Research')
    .addItem('Run Backtest (AUTO)', 'M9_menuBacktestAuto')
    .addItem('Run Backtest (SIM walk-forward)', 'M9_menuBacktestSim')
    .addItem('Run Backtest (LOGS scorer)', 'M9_menuBacktestLogs')
    .addSeparator()
    .addItem('Generate SARS Tax Export', 'M9_menuTax')
    .addSeparator()
    .addItem('Run M9 Tests', 'M9_testRunAll')
    .addToUi();
}

function M9_menuBacktestAuto() {
  try {
    var id = M9_runBacktestAuto();
    SpreadsheetApp.getUi().alert('M9 backtest complete.\nBacktest_ID=' + id + '\nSee BACKTEST_RESULTS and Document Properties M9_DIAG_' + id);
  } catch (e) {
    SpreadsheetApp.getUi().alert('M9 backtest error: ' + e.message);
  }
}

function M9_menuBacktestSim() {
  try {
    var id = M9_runWalkForwardBacktest();
    SpreadsheetApp.getUi().alert('M9 SIM backtest complete.\nBacktest_ID=' + id);
  } catch (e) {
    SpreadsheetApp.getUi().alert('M9 SIM error: ' + e.message);
  }
}

function M9_menuBacktestLogs() {
  try {
    var id = M9_runBacktestMetricsFromLogs();
    SpreadsheetApp.getUi().alert('M9 LOGS scoring complete.\nBacktest_ID=' + id);
  } catch (e) {
    SpreadsheetApp.getUi().alert('M9 LOGS error: ' + e.message);
  }
}

function M9_menuTax() {
  try {
    M9_generateSarsTaxExport();
    SpreadsheetApp.getUi().alert('SARS export appended to ARCHIVE (CSV attempted in Drive).');
  } catch (e) {
    SpreadsheetApp.getUi().alert('Tax export error: ' + e.message);
  }
}


function M9__isBlank_(v) {
  return v === '' || v === null || v === undefined;
}

function M9__symbolLooksUsdtQuoted_(sym) {
  sym = String(sym || '').toUpperCase();
  return sym.indexOf('USDT') >= 0 || sym.indexOf('/USDT') >= 0 || sym.indexOf('-USDT') >= 0;
}


function M9__extractFxRateFromRow_(row, hm) {
  var candidates = [
    'USDT_ZAR_Rate_At_Fetch',   // ← THE ACTUAL DATA_CLEAN COLUMN (was missing!)
    'USDT_ZAR',
    'USDTZAR',
    'USDT_ZAR_Rate',
    'FX_Rate',
    'FX_Rate_At_Open',
    'USD_ZAR',
    'USDZAR'
  ];

  for (var i = 0; i < candidates.length; i++) {
    if (hm.hasOwnProperty(candidates[i])) {
      var n = M9__safeNum_(row[hm[candidates[i]]]);
      if (n > 0) return n;
    }
  }
  return 0;
}

function M9__rDistToZar_(sym, rDistPx, fxRate) {
  if (!isFinite(rDistPx) || rDistPx <= 0) return 0;
  if (M9__symbolLooksUsdtQuoted_(sym)) {
    if (!isFinite(fxRate) || fxRate <= 0) return 0;
    return rDistPx * fxRate;
  }
  return rDistPx;
}

function M9__priceToZar_(sym, px, fxRate) {
  if (!isFinite(px)) return 0;
  if (M9__symbolLooksUsdtQuoted_(sym)) {
    if (!isFinite(fxRate) || fxRate <= 0) return 0;
    return px * fxRate;
  }
  return px;
}


function M9_testRunAll() {
  var results = [];
  function ok(name, pass, detail) { results.push({ n: name, p: !!pass, d: detail || '' }); }

  try {
    var bt = M9__ensureHeader_(M9_CONST.SHEETS.BACKTEST_RESULTS, M9_CONST.HEADERS.BACKTEST_RESULTS);
    ok('BACKTEST_RESULTS header strict + width', true, 'cols=' + bt.getLastColumn());
  } catch (e1) {
    ok('BACKTEST_RESULTS schema', false, e1.message);
  }

  try {
    var ar = M9__ensureHeader_(M9_CONST.SHEETS.ARCHIVE, M9_CONST.HEADERS.ARCHIVE);
    ok('ARCHIVE header strict + width', true, 'cols=' + ar.getLastColumn());
  } catch (e2) {
    ok('ARCHIVE schema', false, e2.message);
  }

  ok('mean([2,4,6])==4', M9__mean_([2,4,6]) === 4);
  ok('stdDev([1,2,3])>0', M9__stdDev_([1,2,3]) > 0);

  var dd = M9__maxDrawdown_([100, 90, 110, 80]);
  ok('drawdown max approx 0.273', dd.maxPct > 0.27 && dd.maxPct < 0.28, 'got=' + dd.maxPct);

  var r1 = M9__blankRow_(16); r1[0] = new Date(0); r1[15] = 'X';
  var r2 = M9__blankRow_(16); r2[0] = new Date(1); r2[15] = 'X';
  ok('archiveKey distinguishes different dates', M9__archiveKey_(r1) !== M9__archiveKey_(r2));

  var pass = 0;
  for (var i = 0; i < results.length; i++) if (results[i].p) pass++;
  for (i = 0; i < results.length; i++) Logger.log('%s %s %s', results[i].p ? '[PASS]' : '[FAIL]', results[i].n, results[i].d);

  Logger.log('[M9] Tests complete: ' + pass + '/' + results.length + ' passed.');
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function M9__isEligibleSymbol_(sym, universeMode, ov) {
  if (!sym) return false;

  var allowedMap = M9__resolveUniverseSymbolMap_(universeMode, ov);
  if (allowedMap === null) return true;

  return !!allowedMap[String(sym).trim().toUpperCase()];
}



function M9__evaluateSetupState_(
  candles,
  level,
  atr,
  regime,
  breakoutBufferAtr,
  retestWindowCandles,
  retestMaxDeviationAtr,
  confirmationBodyMinFrac
) {
  var out = {
    state: 'IDLE',
    reason: '',
    breakoutIdx: -1,
    retestIdx: -1,
    confirmIdx: -1,
    entryPrice: 0
  };

  if (!candles || candles.length < 4) {
    out.reason = 'Not enough candles';
    return out;
  }

  if (!(isFinite(level) && level > 0 && isFinite(atr) && atr > 0)) {
    out.state = 'INVALIDATED';
    out.reason = 'Invalid level/atr';
    return out;
  }

  var reg = String(regime || '').toUpperCase();
  if (reg !== 'RISK-ON' && reg !== 'RISK-ON_LONG') {
    out.state = 'INVALIDATED';
    out.reason = 'Regime not RISK-ON';
    return out;
  }

  var rb = (isFinite(breakoutBufferAtr) ? breakoutBufferAtr : 0.10) * atr;
  var dev = (isFinite(retestMaxDeviationAtr) ? retestMaxDeviationAtr : 0.50) * atr;
  var confirmBodyMin = isFinite(confirmationBodyMinFrac) ? confirmationBodyMinFrac : 0.40;
  var maxRetestBars = Math.max(1, isFinite(retestWindowCandles) ? retestWindowCandles : 3);

  var i;

  // 1) Find latest valid breakout close above level + buffer
  for (i = candles.length - 2; i >= 0; i--) {
    if (candles[i].c > level + rb) {
      out.breakoutIdx = i;
      break;
    }
  }

  if (out.breakoutIdx < 0) {
    out.state = 'IDLE';
    out.reason = 'No breakout detected';
    return out;
  }

  out.state = 'BREAKOUT_DETECTED';

  // 2) Search for retest after breakout, within adaptive window
  var retestEnd = Math.min(candles.length - 2, out.breakoutIdx + maxRetestBars);

  for (i = out.breakoutIdx + 1; i <= retestEnd; i++) {
    var r = candles[i];

    var touchedZone = (r.l <= (level + dev));
    var heldZone = (r.c >= (level - dev));
    var notTooDeep = (r.l >= (level - 1.25 * dev));

    if (touchedZone && heldZone && notTooDeep) {
      out.retestIdx = i;
      break;
    }

    if (r.c < level - dev) {
      out.state = 'INVALIDATED';
      out.reason = 'Retest failed below level';
      return out;
    }
  }

  if (out.retestIdx < 0) {
    out.state = 'BREAKOUT_DETECTED';
    out.reason = 'Breakout found; no valid retest in window';
    return out;
  }

  out.state = 'RETEST_PENDING';

  // 3) Confirmation must happen soon after retest
  var cStart = out.retestIdx + 1;
  var cEnd = Math.min(candles.length - 1, out.retestIdx + maxRetestBars);

  for (i = cStart; i <= cEnd; i++) {
    var x = candles[i];
    var range = Math.max(0.00000001, x.h - x.l);
    var bodyFrac = Math.abs(x.c - x.o) / range;

    if (x.c < level - dev) {
      out.state = 'INVALIDATED';
      out.reason = 'Confirmation failed below level';
      return out;
    }

    var bullish = x.c > x.o;
    var strongClose = x.c > level + rb;
    var decentBody = bodyFrac >= confirmBodyMin;

    if (bullish && strongClose && decentBody) {
      out.confirmIdx = i;
      out.entryPrice = x.c;
      out.state = 'CONFIRMED';
      out.reason = 'Breakout-retest-confirmation complete';
      return out;
    }
  }

  out.state = 'RETEST_PENDING';
  out.reason = 'Retest found; awaiting confirmation';
  return out;
}



function M9__linearAdaptive_(value, minVal, maxVal, minOut, maxOut) {
  if (minVal === maxVal) return minOut;
  if (value <= minVal) return minOut;
  if (value >= maxVal) return maxOut;
  var pct = (value - minVal) / (maxVal - minVal);
  return minOut + pct * (maxOut - minOut);
}


/**
 * Builds adaptive strategy thresholds from a volatility proxy.
 * Lower volatility proxy = tighter / faster setup requirements.
 * Higher volatility proxy = wider / slower setup requirements.
 */
function M9__getAdaptiveStrategyParams_(atrRatio) {
  var ar = isFinite(atrRatio) ? atrRatio : 1.0;

  return {
    breakoutBufferAtr: M9__linearAdaptive_(ar, 0.5, 1.5, 0.05, 0.30),
    retestWindowCandles: Math.round(M9__linearAdaptive_(ar, 0.5, 1.5, 3, 8)),
    retestMaxDeviationAtr: M9__linearAdaptive_(ar, 0.5, 1.5, 0.25, 0.70),
    confirmationBodyMinFrac: M9__linearAdaptive_(ar, 0.5, 1.5, 0.30, 0.60)
  };
}


/**
 * BULLETPROOF boolean reader for CONFIG + M9_CFG_OVERRIDE
 * Handles: true/false, 1/0, "TRUE"/"FALSE", "YES"/"NO", "ON"/"OFF", whitespace, empty
 * Unknown token -> returns default (fail closed to default).
 */
function M9__cfgBool_(cfg, key, dflt) {
  var defaultBool = !!dflt;

  if (!cfg || !cfg.hasOwnProperty(key)) return defaultBool;

  var v = cfg[key];

  if (v === true) return true;
  if (v === false) return false;

  if (typeof v === 'number') return v !== 0;

  // treat null/undefined as empty
  var s = String(v === null || v === undefined ? '' : v).trim().toUpperCase();

  if (s === 'TRUE' || s === 'YES' || s === 'Y' || s === '1' || s === 'ON') return true;
  if (s === 'FALSE' || s === 'NO' || s === 'N' || s === '0' || s === 'OFF' || s === '') return false;

  return defaultBool;
}

/**
 * RAW CONFIG TRACER — tells you exactly what the sheet/override is feeding you
 */
function M9__cfgLogRaw_(cfg, key, dflt) {
  var hasKey = !!(cfg && cfg.hasOwnProperty(key));
  var rawValue = hasKey ? cfg[key] : dflt;
  Logger.log('[M9][CFG RAW] %s | hasKey=%s | type=%s | raw="%s"',
             key, hasKey, typeof rawValue, String(rawValue));
  return rawValue;
}

/**
 * Hard guard: prevents “invert to shorts + long-only” from silently producing 0 trades.
 */
function M9__guardV2InvertVsLongOnly_(p) {
  if (!p) return;
  if (p.invertAllSignals && p.v2LongOnly) {
    throw new Error('[M9] FATAL CONFIG CONFLICT: Invert_All_Signals=TRUE + V2_Long_Only=TRUE => 0 trades.');
  }
}


/**
 * Returns the index of the last candle with ms <= targetMs, or -1 if none.
 * (Binary search; arr must be sorted by .ms ascending.)
 */
function M9__btLastIdxLE_(arr, targetMs) {
  if (!arr || !arr.length) return -1;
  var lo = 0, hi = arr.length - 1, ans = -1;
  while (lo <= hi) {
    var mid = (lo + hi) >> 1;
    var ms = arr[mid].ms;
    if (ms <= targetMs) { ans = mid; lo = mid + 1; }
    else { hi = mid - 1; }
  }
  return ans;
}

/**
 * Force-close ALL open SIM positions at the last available candle <= endMs.
 * Converts "open positions" into finalized trades so Total_Trades can’t be 0
 * when you clearly had fills.
 */
function M9__btForceCloseOpenPositionsAtEnd_(ctx, endMs) {
  if (!ctx || !ctx.openPos || !ctx.openPos.length) return;

  var closedCount = 0;
  var stillOpen = [];

  for (var i = 0; i < ctx.openPos.length; i++) {
    var pos = ctx.openPos[i];
    var arr = ctx.bySym[pos.sym];
    if (!arr || !arr.length) { stillOpen.push(pos); continue; }

    var idx = M9__btLastIdxLE_(arr, endMs);
    if (idx < 0) { stillOpen.push(pos); continue; }

    var cd = arr[idx];
    var fxExit = cd.fx;
    if (M9__symbolLooksUsdtQuoted_(pos.sym) && (!isFinite(fxExit) || fxExit <= 0)) fxExit = pos.fxEntry;

    // Use last candle close as the mark for EOD liquidation
    var px = cd.c;

    // Close any still-open legs
    if (pos.coreOpen) {
      var rC = M9__btCloseLeg_(ctx, pos, px, pos.qtyCore, fxExit);
      pos.coreRealizedZar += rC.realized;
      pos.feesExitZar += rC.fee;
      ctx.equity += rC.realized;
      pos.coreOpen = false;
    }

    if (pos.runnerOpen) {
      var rR = M9__btCloseLeg_(ctx, pos, px, pos.qtyRunner, fxExit);
      pos.runnerRealizedZar += rR.realized;
      pos.feesExitZar += rR.fee;
      ctx.equity += rR.realized;
      pos.runnerOpen = false;
    }

    pos.exitMs = cd.ms;
    pos.exitReason = 'EOD_FORCE_CLOSE';

    ctx.trades.push(M9__btFinalizeTrade_(pos, 'EOD_FORCE_CLOSE'));
    closedCount++;
  }

  // Clear openPos to prevent double-counting
  ctx.openPos = stillOpen;

  if (closedCount > 0) {
    Logger.log('[M9] EOD force-close: finalized %s open positions into trades.', closedCount);
  }
}

/**
 * Convenience: filter trades into OOS using splitMs.
 */
function M9__btFilterOosTrades_(trades, splitMs) {
  var out = [];
  for (var i = 0; i < trades.length; i++) {
    if (trades[i].entryMs >= splitMs) out.push(trades[i]);
  }
  return out;
}


function M9__btLogSplitAndTradeStats_(ctx, dr, tz) {
  try {
    var splitDate = Utilities.formatDate(new Date(dr.splitMs), tz, 'yyyy-MM-dd');
    var startDate = Utilities.formatDate(new Date(dr.startMs), tz, 'yyyy-MM-dd');
    var endDate   = Utilities.formatDate(new Date(dr.endMs), tz, 'yyyy-MM-dd');

    var isN = 0, oosN = 0;
    var firstTradeMs = null, lastTradeMs = null;

    var trades = (ctx && ctx.trades) ? ctx.trades : [];
    for (var i = 0; i < trades.length; i++) {
      var t = trades[i];
      if (t.entryMs >= dr.splitMs) oosN++; else isN++;

      if (firstTradeMs === null || t.entryMs < firstTradeMs) firstTradeMs = t.entryMs;
      if (lastTradeMs === null || t.entryMs > lastTradeMs) lastTradeMs = t.entryMs;
    }

    var firstTrade = firstTradeMs ? Utilities.formatDate(new Date(firstTradeMs), tz, 'yyyy-MM-dd') : 'N/A';
    var lastTrade  = lastTradeMs  ? Utilities.formatDate(new Date(lastTradeMs),  tz, 'yyyy-MM-dd') : 'N/A';

    Logger.log('[M9] Range=%s→%s | split(OOS starts)=%s | trades: IS=%s OOS=%s | firstTrade=%s lastTrade=%s',
      startDate, endDate, splitDate, isN, oosN, firstTrade, lastTrade
    );
  } catch (e) {
    Logger.log('[M9] Split/trade stats log failed: ' + e.message);
  }
}

/**
 * DROP-IN REPLACEMENT:
 * Make diag counters consistent with the patched evaluator.
 * - breakoutDetected increments only when breakoutIdx >= 0
 * - retestPending increments only for RECLAIM_PENDING
 */
function M9__diagV2BumpFromStateRes_(diag, stateRes) {
  if (!diag || !stateRes) return;

  if (stateRes.breakoutIdx !== undefined && stateRes.breakoutIdx >= 0) {
    diag.breakoutDetected = (diag.breakoutDetected || 0) + 1;
  }

  if (stateRes.state === 'RECLAIM_PENDING') {
    diag.retestPending = (diag.retestPending || 0) + 1;
  }
}


function M9__btGenerateSignals_(ctx, nowMs, tIdx) {
  var p = ctx.p;
  var diag = ctx.diagV2 || (ctx.diagV2 = {});

  function bump(k) {
    diag[k] = (diag[k] || 0) + 1;
  }

  if (ctx.openPos.length + ctx.pending.length >= p.maxConcurrentPos) return;
  if (tIdx >= ctx.master.length - 2) return;

  var regimeNow = ctx.getRegimeFast(nowMs);
  if (p.v2RiskOnOnly && regimeNow !== 'RISK-ON' && regimeNow !== 'RISK-ON_LONG') {
    bump('skippedByRegime');
    return;
  }

  var refLookbackN = (p.v2BreakoutLookbackN && p.v2BreakoutLookbackN > 0)
    ? p.v2BreakoutLookbackN
    : p.lookbackN;

  var familyBest = {};

  for (var i = 0; i < ctx.eligibleSyms.length; i++) {
    if (ctx.openPos.length + ctx.pending.length >= p.maxConcurrentPos) break;

    var sym = ctx.eligibleSyms[i];
    bump('eligible');

    if (M9__btHasOpenSym_(ctx.openPos, sym)) continue;
    if (M9__btHasPendingSym_(ctx.pending, sym)) continue;

    if (ctx.cooldown && ctx.cooldown.hasOwnProperty(sym)) {
      if ((tIdx - ctx.cooldown[sym]) < p.cooldownCandles) {
        bump('rejectedCooldown');
        continue;
      }
    }

    var idxNow = ctx.seekIdx(sym, nowMs);
    if (idxNow < 0) {
      bump('rejectedMissingIdx');
      continue;
    }

    if (idxNow < Math.max(p.lookbackN + p.atrPeriod + 20, 60)) {
      bump('rejectedWarmup');
      continue;
    }

    var atrVal = ctx.ind[sym].atr[idxNow];
    var rsiVal = ctx.ind[sym].rsi[idxNow];
    var volS = ctx.ind[sym].volSma[idxNow];

    if (!(atrVal > 0)) {
      bump('rejectedNoAtr');
      continue;
    }

    if (rsiVal === null || rsiVal === '' || !isFinite(rsiVal)) {
      bump('rejectedNoRsi');
      continue;
    }

    if (!(volS > 0)) {
      bump('rejectedNoVolSma');
      continue;
    }

    var cNow = ctx.bySym[sym][idxNow];
    if (!cNow) {
      bump('rejectedNoCandle');
      continue;
    }

    var volRatio = cNow.v / volS;
    if (!(volRatio >= p.volMult)) {
      bump('rejectedVol');
      continue;
    }

    if (!(rsiVal < p.rsiLongMax)) {
      bump('rejectedRsi');
      continue;
    }

    var atrRatio = 1.0;
    if (ctx.ind[sym].atr && idxNow >= 30 && ctx.ind[sym].atr[idxNow - 30]) {
      var atrLag = ctx.ind[sym].atr[idxNow - 30];
      atrRatio = (atrLag && atrLag !== 0) ? (atrVal / atrLag) : 1.0;
    }

    var adaptive = M9__getAdaptiveStrategyParams_(atrRatio);
    var winSize = Math.max(6, adaptive.retestWindowCandles + 3);
    var startWin = Math.max(0, idxNow - winSize + 1);
    var endLb = startWin - 1;
    var startLb = Math.max(0, startWin - refLookbackN);

    if (endLb < startLb) {
      bump('rejectedNoResistanceWindow');
      continue;
    }

    var res = -Infinity;
    for (var j = startLb; j <= endLb; j++) {
      var hv = (ctx.ind[sym].highs && ctx.ind[sym].highs[j] !== null)
        ? ctx.ind[sym].highs[j]
        : ctx.ind[sym].closes[j];
      if (hv > res) res = hv;
    }

    if (!(isFinite(res) && res > 0)) {
      bump('rejectedNoResistance');
      continue;
    }

    var breakoutBufferPx = adaptive.breakoutBufferAtr * atrVal;
    if (cNow.c > (res + breakoutBufferPx)) {
      bump('rawBreakout');
    }

    var recentCandles = [];
    for (j = startWin; j <= idxNow; j++) {
      var cj = ctx.bySym[sym][j];
      recentCandles.push({
        ms: cj.ms,
        o: cj.o,
        h: cj.h,
        l: cj.l,
        c: cj.c,
        v: cj.v
      });
    }

    var stateRes = M9__evaluateSetupState_(
      recentCandles,
      res,
      atrVal,
      regimeNow,
      adaptive.breakoutBufferAtr,
      adaptive.retestWindowCandles,
      adaptive.retestMaxDeviationAtr,
      adaptive.confirmationBodyMinFrac
    );

    if (!stateRes) {
      bump('stateNull');
      continue;
    }

    if (stateRes.breakoutIdx >= 0) {
      bump('breakoutDetected');
    }

    if (stateRes.state === 'BREAKOUT_DETECTED') {
      bump('stateBreakoutDetected');
      continue;
    }

    if (stateRes.state === 'RETEST_PENDING') {
      bump('retestPending');
      bump('stateRetestPending');
      continue;
    }

    if (stateRes.state === 'INVALIDATED') {
      bump('stateInvalidated');
      continue;
    }

    if (stateRes.state !== 'CONFIRMED') {
      bump('stateOther');
      continue;
    }

    bump('setupConfirmed');
    bump('confirmed');

    if (stateRes.confirmIdx < 0) {
      bump('rejectedOldConfirmation');
      continue;
    }

    var dir = p.invertAllSignals ? 'SHORT' : 'LONG';
    if (p.v2LongOnly && dir !== 'LONG') {
      bump('rejectedByLongOnly');
      continue;
    }

    var stopDistPx = p.atrStopMult * atrVal;
    if (!(stopDistPx > 0)) {
      bump('rejectedBadRDistPx');
      continue;
    }

    var marketType = (sym.indexOf('PERP') !== -1) ? 'PERP' : 'SPOT_MARGIN';
    var dqsObj = M9__btDqsScore_(ctx, sym, idxNow, dir, regimeNow, marketType);
    M9__dqsSumRecord_(ctx, sym, dir, regimeNow, dqsObj, p.dqsGateV2);

    if (!dqsObj || !isFinite(dqsObj.total)) {
      bump('failedDqs');
      bump('rejectedDqsAfterConfirm');
      continue;
    }

    if (dqsObj.total < p.dqsGateV2) {
      bump('failedDqs');
      bump('rejectedDqsAfterConfirm');
      continue;
    }

    var effectiveGradeFloor = isFinite(p.dqsGateV2) ? p.dqsGateV2 : p.dqsMin;
    var grade = M9__btGradeFromDqs_(dqsObj.total, effectiveGradeFloor);

    if (grade === 'SKIP') {
      bump('rejectedGradeSkip');
      continue;
    }

    var candidate = {
      sym: sym,
      family: M9__symFamilyKey_(sym),
      dir: dir,
      entryMs: ctx.master[tIdx + 1],
      lev: 1,
      stopDistPx: stopDistPx,
      grade: grade,
      dqs: dqsObj.total,
      regime: regimeNow
    };

    var fam = candidate.family;
    familyBest[fam] = M9__btChooseBetterCandidate_(familyBest[fam], candidate);
  }

  var selected = [];
  for (var famKey in familyBest) {
    if (familyBest.hasOwnProperty(famKey) && familyBest[famKey]) {
      selected.push(familyBest[famKey]);
    }
  }

  selected.sort(function(a, b) {
    return (b.dqs || 0) - (a.dqs || 0);
  });

  for (var s = 0; s < selected.length; s++) {
    if (ctx.openPos.length + ctx.pending.length >= p.maxConcurrentPos) break;
    ctx.pending.push(selected[s]);
    bump('pendingCreated');
    bump('confirmedQueued');
  }
}


function RUN_backtestSafe() {
  try {
    if (typeof M2_logCanonicalHistoryStatus === 'function') {
      M2_logCanonicalHistoryStatus();
    }
  } catch (e) {}

  RUN__ensureM9Globals_();

  Logger.log('[RUN][DIAG] typeof M9_runWalkForwardBacktest=' + typeof M9_runWalkForwardBacktest);
  Logger.log('[RUN][DIAG] typeof M9_CONST=' + typeof M9_CONST);
  Logger.log('[RUN][DIAG] typeof M9_COL=' + typeof M9_COL);

  if (typeof M9_runWalkForwardBacktest !== 'function') {
    throw new Error('M9_runWalkForwardBacktest is not defined');
  }
  if (typeof M9_CONST === 'undefined' || !M9_CONST) {
    throw new Error('M9_CONST is undefined');
  }
  if (!M9_CONST.SHEETS) {
    throw new Error('M9_CONST.SHEETS is undefined');
  }
  if (!M9_CONST.HEADERS) {
    throw new Error('M9_CONST.HEADERS is undefined');
  }
  if (typeof M9_COL === 'undefined' || !M9_COL) {
    throw new Error('M9_COL is undefined');
  }

  var result = M9_runWalkForwardBacktest();

  if (!result || !result.backtestId) {
    throw new Error('Backtest result missing backtestId');
  }

  Logger.log('[RUN] Backtest completed successfully. Backtest_ID=' + result.backtestId);
  return result;
}



/**
 * DROP-IN: print a backtest's stored diag blob (split date, OOS count, key V2 counters).
 * Reads Document Properties key: M9_DIAG_{Backtest_ID}
 */
function M9_printBacktestDiag(btId) {
  if (!btId) throw new Error('[M9] Missing btId.');

  btId = String(btId).trim();

  var blob = null;

  // 1) Preferred path: Supabase diag_blob
  try {
    if (typeof M10__sbFetchJson_ === 'function') {
      var rows = M10__sbFetchJson_(
        'get',
        '/rest/v1/experiment_logs?backtest_id=eq.' + encodeURIComponent(btId) +
        '&select=diag_blob&order=created_at.desc&limit=1'
      );

      if (rows && rows.length && rows[0] && rows[0].diag_blob) {
        blob = rows[0].diag_blob;
      }
    }
  } catch (eSb) {
    Logger.log('[M9 DIAG][WARN] Supabase diag_blob fetch failed for ' + btId + ': ' + eSb.message);
  }

  // 2) Fallback path: old Document Properties blob
  if (!blob) {
    try {
      var props = null;
      if (typeof M9__props_ === 'function') props = M9__props_();
      else props = PropertiesService.getDocumentProperties();

      var raw = props.getProperty('M9_DIAG_' + btId);
      if (raw) {
        blob = JSON.parse(raw);
      }
    } catch (eProps) {
      Logger.log('[M9 DIAG][WARN] Document Properties diag fetch failed for ' + btId + ': ' + eProps.message);
    }
  }

  if (!blob) {
    throw new Error('[M9] No diag blob found for ' + btId + ' in Supabase or Document Properties.');
  }

  var tz = 'Africa/Johannesburg';
  try {
    if (typeof M9__cfgLoadMap_ === 'function') {
      var cfg = M9__cfgLoadMap_();
      if (cfg && cfg.Timezone) tz = String(cfg.Timezone);
    }
  } catch (eCfg) {}

  // Support both old and new blob shapes
  var splitMs = blob.splitMs || (blob.bt_result && blob.bt_result.splitMs) || '';
  var splitStr = splitMs ? Utilities.formatDate(new Date(splitMs), tz, 'yyyy-MM-dd') : 'N/A';

  var allTotal = '';
  var oosTotal = '';

  if (blob.all && blob.all.metrics) {
    allTotal = blob.all.metrics.total || '';
  } else if (blob.bt_result && blob.bt_result.all && blob.bt_result.all.metrics) {
    allTotal = blob.bt_result.all.metrics.total || '';
  }

  if (blob.oos && blob.oos.metrics) {
    oosTotal = blob.oos.metrics.total || '';
  } else if (blob.bt_result && blob.bt_result.oos && blob.bt_result.oos.metrics) {
    oosTotal = blob.bt_result.oos.metrics.total || '';
  }

  var diagV2 = blob.diagV2 || (blob.bt_result ? blob.bt_result.diagV2 : null);
  var passFail = blob.passFail || (blob.bt_result ? blob.bt_result.passFail : null);
  var mode = blob.mode || (blob.bt_result ? blob.bt_result.mode : '');
  var version = blob.version || (blob.bt_result ? blob.bt_result.version : '');

  Logger.log('══════════════════════════════════════════════');
  Logger.log('[M9 DIAG] ' + btId);
  Logger.log('Mode=' + (mode || '') + ' Version=' + (version || '') + ' TZ=' + tz);
  Logger.log('Split (OOS starts) = ' + splitStr + ' (ms=' + splitMs + ')');
  Logger.log('Trades: ALL=' + allTotal + ' | OOS=' + oosTotal);

  if (diagV2) {
    var d = diagV2;
    Logger.log(
      '[V2] eligible=' + (d.eligibleSymbols || 0) +
      ' skippedByRegime=' + (d.skippedByRegime || 0) +
      ' rawBreakout=' + (d.rawBreakoutCandidates || 0) +
      ' breakoutDetected=' + (d.breakoutDetected || 0) +
      ' retestPending=' + (d.retestPending || 0) +
      ' setupConfirmed=' + (d.setupConfirmed || 0) +
      ' rejectedOldConfirmation=' + (d.rejectedOldConfirmation || 0) +
      ' confirmedQueued=' + (d.confirmedQueued || 0) +
      ' rejectedDqsAfterConfirm=' + (d.rejectedDqsAfterConfirm || 0) +
      ' pendingCreated=' + (d.pendingCreated || 0) +
      ' pendingFilled=' + (d.pendingFilled || 0)
    );
  }

  if (passFail) {
    Logger.log('OOS PassFail passed=' + passFail.passed + ' reasons=' + JSON.stringify(passFail.reasons || []));
  }

  if (blob.error || (blob.bt_result && blob.bt_result.error)) {
    var err = blob.error || blob.bt_result.error;
    Logger.log('[M9 DIAG] ERROR=' + JSON.stringify(err));
  }

  Logger.log('══════════════════════════════════════════════');
  return blob;
}


/**
 * DROP-IN: convenience to print the latest backtest diag
 * (reads BACKTEST_RESULTS last row Backtest_ID)
 */
function M9_printLastBacktestDiag() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('BACKTEST_RESULTS');
  if (!sh || sh.getLastRow() < 2) throw new Error('[M9] BACKTEST_RESULTS is empty.');

  var hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var hm = {};
  for (var i = 0; i < hdr.length; i++) hm[String(hdr[i] || '').trim()] = i;

  if (hm.Backtest_ID === undefined) {
    throw new Error('[M9] BACKTEST_RESULTS missing Backtest_ID column.');
  }

  var row = sh.getRange(sh.getLastRow(), 1, 1, sh.getLastColumn()).getValues()[0];
  var btId = String(row[hm.Backtest_ID] || '').trim();
  if (!btId) throw new Error('[M9] Latest BACKTEST_RESULTS row has blank Backtest_ID.');

  return M9_printBacktestDiag(btId);
}

/**
 * Goldilocks scorer:
 * - 0 below hard floor
 * - ramps up into optimal zone
 * - max score inside optimal zone
 * - fades out toward hard ceiling
 * - 0 beyond hard ceiling
 */
function M9__goldilocks_(value, floorLo, optLo, optHi, ceilHi, maxPts) {
  if (!isFinite(value) || !isFinite(maxPts) || maxPts <= 0) return 0;

  if (value <= floorLo) return 0;
  if (value >= ceilHi) return 0;

  if (value >= optLo && value <= optHi) return maxPts;

  if (value > floorLo && value < optLo) {
    return M9__linearAdaptive_(value, floorLo, optLo, 0, maxPts);
  }

  return M9__linearAdaptive_(value, optHi, ceilHi, maxPts, 0);
}



/**
 * MODULE 9 — Diagnostic
 *
 * Read-only diagnostic for confirmed setups that fail the DQS gate.
 * Uses the current M9 parity-aligned setup engine and DQS engine.
 *
 * Run:
 *   M9_diagDqsRejections()
 */
function M9_diagDqsRejections() {
  Logger.log('[M9][DIAG-DQS] ═══════════════════════════════════════');
  Logger.log('[M9][DIAG-DQS] DQS Rejection Diagnostic Starting');
  Logger.log('[M9][DIAG-DQS] ═══════════════════════════════════════');

  try {
    if (typeof M2_requireCanonicalHistoryForBacktest === 'function') {
      M2_requireCanonicalHistoryForBacktest();
    }

    var cfg = M9__cfgLoadMap_();
    var p = M9__btLoadSimParams_(cfg);
    var dr = M9__btResolveDateRange_(cfg);

    var dc = M9__btLoadDataClean4h_(dr.startMs, dr.endMs);
    var bySym = dc.bySym;
    var syms = M9__btBuildSymbolList_(bySym);
    var eligibleSyms = M9__btBuildEligibleSyms_(syms, p.universeMode, p);
    var master = M9__btUniqueSortedMs_(dc.masterMs);

    var seekObj = M9__btMakeSeekIdx_(bySym, syms);
    var seekIdx = seekObj.seekIdx;

    var ind = M9__btPrecomputeIndicators_(bySym, syms, p.atrPeriod, p.rsiPeriod, p.lookbackN);
    var btcBenchSym = M9__btDetectBtcBenchmark_(bySym, ind);
    var getRegimeFast = M9__btBuildRegimeGetter_(p.tz);
    var getStructureTarget = M9__btBuildStructureTargetGetter_();

    var levelsMap = {};
    try {
      var lvl = M9__readAllIfExists_('LEVELS');
      if (lvl && lvl.length >= 2) {
        var hmL = M9__headerMap_(lvl[0]);
        var cSym = M9__idx_(hmL, 'Symbol', true);
        var cRes = M9__idx_(hmL, 'Resistance_Value', false);
        var cSup = M9__idx_(hmL, 'Support_Value', false);
        var cDRes = M9__idx_(hmL, 'Daily_Resistance', false);
        var cDSup = M9__idx_(hmL, 'Daily_Support', false);

        for (var lr = 1; lr < lvl.length; lr++) {
          var lsym = String(lvl[lr][cSym] || '');
          if (!lsym) continue;
          levelsMap[lsym] = {
            res: (cRes >= 0) ? M9__safeNum_(lvl[lr][cRes]) : 0,
            sup: (cSup >= 0) ? M9__safeNum_(lvl[lr][cSup]) : 0,
            dailyRes: (cDRes >= 0) ? M9__safeNum_(lvl[lr][cDRes]) : 0,
            dailySup: (cDSup >= 0) ? M9__safeNum_(lvl[lr][cDSup]) : 0
          };
        }
      }
    } catch (lvlErr) {}

    var ctx = {
      cfg: cfg,
      p: p,
      bySym: bySym,
      syms: syms,
      eligibleSyms: eligibleSyms,
      master: master,
      ind: ind,
      btcBenchSym: btcBenchSym,
      seekIdx: seekIdx,
      getRegimeFast: getRegimeFast,
      getStructureTarget: getStructureTarget,
      levelsMap: levelsMap,
      openPos: [],
      pending: [],
      cooldown: {},
      trades: []
    };

    var counts = {
      eligible: 0,
      skippedByRegime: 0,
      confirmed: 0,
      rejectedByDqs: 0,
      passedDqs: 0
    };

    var rejected = [];
    var passed = [];

    for (var tIdx = 0; tIdx < master.length; tIdx++) {
      var nowMs = master[tIdx];

      if (tIdx >= master.length - 2) break;

      var regimeNow = ctx.getRegimeFast(nowMs);
      if (p.v2RiskOnOnly && regimeNow !== 'RISK-ON' && regimeNow !== 'RISK-ON_LONG') {
        counts.skippedByRegime++;
        continue;
      }

      var refLookbackN = (p.v2BreakoutLookbackN && p.v2BreakoutLookbackN > 0)
        ? p.v2BreakoutLookbackN
        : p.lookbackN;

      for (var i = 0; i < eligibleSyms.length; i++) {
        var sym = eligibleSyms[i];
        counts.eligible++;

        var idxNow = ctx.seekIdx(sym, nowMs);
        if (idxNow < 0) continue;
        if (idxNow < Math.max(p.lookbackN + p.atrPeriod + 20, 60)) continue;

        var atrVal = ctx.ind[sym].atr[idxNow];
        var rsiVal = ctx.ind[sym].rsi[idxNow];
        var volS = ctx.ind[sym].volSma[idxNow];
        if (!(atrVal > 0)) continue;
        if (rsiVal === null || rsiVal === '' || !isFinite(rsiVal)) continue;
        if (!(volS > 0)) continue;

        var cNow = ctx.bySym[sym][idxNow];
        if (!cNow) continue;

        var volRatio = cNow.v / volS;
        if (!(volRatio >= p.volMult)) continue;
        if (!(rsiVal < p.rsiLongMax)) continue;

        var atrRatio = 1.0;
        if (ctx.ind[sym].atr && idxNow >= 30 && ctx.ind[sym].atr[idxNow - 30]) {
          var atrLag = ctx.ind[sym].atr[idxNow - 30];
          atrRatio = (atrLag && atrLag !== 0) ? (atrVal / atrLag) : 1.0;
        }

        var adaptive = M9__getAdaptiveStrategyParams_(atrRatio);

        var winSize = Math.max(6, adaptive.retestWindowCandles + 3);
        var startWin = Math.max(0, idxNow - winSize + 1);

        var endLb = startWin - 1;
        var startLb = Math.max(0, startWin - refLookbackN);
        if (endLb < startLb) continue;

        var res = -Infinity;
        for (var j = startLb; j <= endLb; j++) {
          var hv = (ctx.ind[sym].highs && ctx.ind[sym].highs[j] !== null)
            ? ctx.ind[sym].highs[j]
            : ctx.ind[sym].closes[j];
          if (hv > res) res = hv;
        }
        if (!(isFinite(res) && res > 0)) continue;

        var recentCandles = [];
        for (j = startWin; j <= idxNow; j++) {
          var cj = ctx.bySym[sym][j];
          recentCandles.push({
            ms: cj.ms,
            o: cj.o,
            h: cj.h,
            l: cj.l,
            c: cj.c,
            v: cj.v
          });
        }

        var stateRes = M9__evaluateSetupState_(
          recentCandles,
          res,
          atrVal,
          regimeNow,
          adaptive.breakoutBufferAtr,
          adaptive.retestWindowCandles,
          adaptive.retestMaxDeviationAtr,
          adaptive.confirmationBodyMinFrac
        );

        if (!stateRes || stateRes.state !== 'CONFIRMED') continue;

        counts.confirmed++;

        var dir = p.invertAllSignals ? 'SHORT' : 'LONG';
        if (p.v2LongOnly && dir !== 'LONG') continue;

        var marketType = (sym.indexOf('PERP') !== -1) ? 'PERP' : 'SPOT_MARGIN';
        var dqsObj = M9__btDqsScore_(ctx, sym, idxNow, dir, regimeNow, marketType);
        if (!dqsObj || !isFinite(dqsObj.total)) continue;

        var row = {
          sym: sym,
          dir: dir,
          ts: nowMs,
          regime: regimeNow,
          dqsTotal: dqsObj.total,
          dqsGrade: dqsObj.grade,
          compression: dqsObj.compression,
          duration: dqsObj.duration,
          volume: dqsObj.volume,
          multitf: dqsObj.multitf,
          momentum: dqsObj.momentum,
          accumulation: dqsObj.accumulation,
          fundAdj: dqsObj.fundAdj,
          gate: p.dqsGateV2,
          missBy: Math.round((p.dqsGateV2 - dqsObj.total) * 100) / 100,
          atrRatio: atrRatio,
          volRatio: volRatio,
          rsi: rsiVal,
          level: res,
          close: cNow.c
        };

        if (dqsObj.total < p.dqsGateV2) {
          counts.rejectedByDqs++;
          rejected.push(row);
        } else {
          counts.passedDqs++;
          passed.push(row);
        }
      }
    }

    rejected.sort(function(a, b) {
      return b.dqsTotal - a.dqsTotal;
    });

    passed.sort(function(a, b) {
      return b.dqsTotal - a.dqsTotal;
    });

    Logger.log('[M9][DIAG-DQS] ── Summary ─────────────────────────');
    Logger.log('[M9][DIAG-DQS] eligibleChecks=' + counts.eligible);
    Logger.log('[M9][DIAG-DQS] skippedByRegime=' + counts.skippedByRegime);
    Logger.log('[M9][DIAG-DQS] confirmedSetups=' + counts.confirmed);
    Logger.log('[M9][DIAG-DQS] rejectedByDqs=' + counts.rejectedByDqs);
    Logger.log('[M9][DIAG-DQS] passedDqs=' + counts.passedDqs);
    Logger.log('[M9][DIAG-DQS] gate=' + p.dqsGateV2);

    Logger.log('[M9][DIAG-DQS] ── Top DQS misses ──────────────────');
    for (var r = 0; r < Math.min(15, rejected.length); r++) {
      var x = rejected[r];
      Logger.log(
        '[M9][DIAG-DQS] MISS sym=' + x.sym +
        ' dir=' + x.dir +
        ' regime=' + x.regime +
        ' dqs=' + x.dqsTotal +
        ' gate=' + x.gate +
        ' missBy=' + x.missBy +
        ' | comp=' + x.compression +
        ' dur=' + x.duration +
        ' vol=' + x.volume +
        ' mtf=' + x.multitf +
        ' mom=' + x.momentum +
        ' acc=' + x.accumulation +
        ' fund=' + x.fundAdj +
        ' | atrRatio=' + x.atrRatio +
        ' volRatio=' + x.volRatio +
        ' rsi=' + x.rsi +
        ' close=' + x.close +
        ' level=' + x.level
      );
    }

    Logger.log('[M9][DIAG-DQS] ── Passed DQS setups ───────────────');
    for (var pidx = 0; pidx < Math.min(15, passed.length); pidx++) {
      var y = passed[pidx];
      Logger.log(
        '[M9][DIAG-DQS] PASS sym=' + y.sym +
        ' dir=' + y.dir +
        ' regime=' + y.regime +
        ' dqs=' + y.dqsTotal +
        ' | comp=' + y.compression +
        ' dur=' + y.duration +
        ' vol=' + y.volume +
        ' mtf=' + y.multitf +
        ' mom=' + y.momentum +
        ' acc=' + y.accumulation +
        ' fund=' + y.fundAdj +
        ' | atrRatio=' + y.atrRatio +
        ' volRatio=' + y.volRatio +
        ' rsi=' + y.rsi +
        ' close=' + y.close +
        ' level=' + y.level
      );
    }

    Logger.log('[M9][DIAG-DQS] ═══════════════════════════════════════');
    Logger.log('[M9][DIAG-DQS] DQS Rejection Diagnostic Complete');
    Logger.log('[M9][DIAG-DQS] ═══════════════════════════════════════');

  } catch (e) {
    Logger.log('[M9][DIAG-DQS] FATAL: ' + e.message);
    if (e && e.stack) Logger.log('[M9][DIAG-DQS] Stack: ' + e.stack);
    throw e;
  }
}


/**
 * MODULE 9 — Diagnostic
 *
 * Read-only diagnostic for CONFIG resolution of key M9 parameters.
 * Focuses on why DQS_Gate_V2 may remain sticky at an old value.
 *
 * Run:
 *   M9_diagConfigResolution()
 */
function M9_diagConfigResolution() {
  Logger.log('[M9][DIAG-CFG] ═══════════════════════════════════════');
  Logger.log('[M9][DIAG-CFG] Config Resolution Diagnostic Starting');
  Logger.log('[M9][DIAG-CFG] ═══════════════════════════════════════');

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName('CONFIG');
    if (!sh) throw new Error('CONFIG sheet not found.');

    var data = sh.getDataRange().getValues();
    var matches = [];
    var keyCounts = {};

    for (var i = 0; i < data.length; i++) {
      var key = String(data[i][0] || '').trim();
      if (!key) continue;

      keyCounts[key] = (keyCounts[key] || 0) + 1;

      if (key === 'DQS_Gate_V2') {
        matches.push({
          row: i + 1,
          key: key,
          value: data[i][1],
          notes: data[i].length > 2 ? data[i][2] : ''
        });
      }
    }

    Logger.log('[M9][DIAG-CFG] CONFIG rows total=' + data.length);
    Logger.log('[M9][DIAG-CFG] DQS_Gate_V2 occurrences=' + matches.length);

    if (matches.length === 0) {
      Logger.log('[M9][DIAG-CFG] No CONFIG row found for DQS_Gate_V2');
    } else {
      for (var m = 0; m < matches.length; m++) {
        Logger.log(
          '[M9][DIAG-CFG] DQS_Gate_V2 row=' + matches[m].row +
          ' value=' + String(matches[m].value) +
          ' type=' + (typeof matches[m].value) +
          ' notes=' + String(matches[m].notes || '')
        );
      }
    }

    var duplicateKeys = [];
    for (var k in keyCounts) {
      if (keyCounts.hasOwnProperty(k) && keyCounts[k] > 1) {
        duplicateKeys.push(k + '(' + keyCounts[k] + ')');
      }
    }

    if (duplicateKeys.length > 0) {
      Logger.log('[M9][DIAG-CFG] Duplicate CONFIG keys found: ' + duplicateKeys.join(', '));
    } else {
      Logger.log('[M9][DIAG-CFG] No duplicate CONFIG keys detected.');
    }

    var props = null;
    if (typeof M9__props_ === 'function') props = M9__props_();
    else props = PropertiesService.getDocumentProperties();

    var ovRaw = props.getProperty('M9_CFG_OVERRIDE');
    if (ovRaw) {
      Logger.log('[M9][DIAG-CFG] M9_CFG_OVERRIDE present: ' + ovRaw);

      try {
        var ov = JSON.parse(ovRaw);
        if (ov && ov.hasOwnProperty('DQS_Gate_V2')) {
          Logger.log('[M9][DIAG-CFG] Override DQS_Gate_V2=' + String(ov['DQS_Gate_V2']) +
                     ' type=' + (typeof ov['DQS_Gate_V2']));
        } else {
          Logger.log('[M9][DIAG-CFG] Override present but DQS_Gate_V2 not set in override.');
        }
      } catch (ovErr) {
        Logger.log('[M9][DIAG-CFG] Override JSON parse failed: ' + ovErr.message);
      }
    } else {
      Logger.log('[M9][DIAG-CFG] No M9_CFG_OVERRIDE property present.');
    }

    var cfg = M9__cfgLoadMap_();
    var resolvedRaw = (cfg && cfg.hasOwnProperty('DQS_Gate_V2')) ? cfg['DQS_Gate_V2'] : '(missing)';
    var resolvedNum = M9__cfgNum_(cfg, 'DQS_Gate_V2', 45);

    Logger.log('[M9][DIAG-CFG] Resolved cfg[DQS_Gate_V2] raw=' + String(resolvedRaw) +
               ' type=' + (typeof resolvedRaw));
    Logger.log('[M9][DIAG-CFG] Resolved cfgNum(DQS_Gate_V2,45)=' + resolvedNum);

    // Also inspect related keys to catch accidental drift
    var relatedKeys = [
      'V2_Long_Only',
      'Invert_All_Signals',
      'Leverage_Mode',
      'Max_Leverage',
      'RR_Minimum',
      'Volume_Multiplier_Threshold',
      'V2_Breakout_Buffer_ATR',
      'V2_Retest_Window_Candles',
      'V2_Retest_Max_Deviation_ATR',
      'V2_Confirmation_Body_Min_Frac'
    ];

    for (var rk = 0; rk < relatedKeys.length; rk++) {
      var kk = relatedKeys[rk];
      var rawVal = (cfg && cfg.hasOwnProperty(kk)) ? cfg[kk] : '(missing)';
      Logger.log('[M9][DIAG-CFG] Resolved ' + kk + ' raw=' + String(rawVal) + ' type=' + (typeof rawVal));
    }

    Logger.log('[M9][DIAG-CFG] ═══════════════════════════════════════');
    Logger.log('[M9][DIAG-CFG] Config Resolution Diagnostic Complete');
    Logger.log('[M9][DIAG-CFG] ═══════════════════════════════════════');

  } catch (e) {
    Logger.log('[M9][DIAG-CFG] FATAL: ' + e.message);
    if (e && e.stack) Logger.log('[M9][DIAG-CFG] Stack: ' + e.stack);
    throw e;
  }
}

function M9_printProfitabilitySnapshot() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var shPos = ss.getSheetByName('POSITIONS');
  var shBt  = ss.getSheetByName('BACKTEST_RESULTS');
  var shCfg = ss.getSheetByName('CONFIG');

  var mode = 'UNKNOWN';
  if (shCfg) {
    var cfg = shCfg.getDataRange().getValues();
    for (var i = 0; i < cfg.length; i++) {
      if (String(cfg[i][0]).trim() === 'System_Mode') {
        mode = String(cfg[i][1] || '').trim();
        break;
      }
    }
  }

  Logger.log('══════════════════════════════════════════════');
  Logger.log('[PROFITABILITY SNAPSHOT] Mode=' + mode);

  if (mode === 'BACKTEST' && shBt && shBt.getLastRow() >= 2) {
    var hdr = shBt.getRange(1, 1, 1, shBt.getLastColumn()).getValues()[0];
    var row = shBt.getRange(shBt.getLastRow(), 1, 1, shBt.getLastColumn()).getValues()[0];
    var hm = {};
    for (var j = 0; j < hdr.length; j++) hm[String(hdr[j] || '').trim()] = j;

    Logger.log('Backtest_ID      = ' + row[hm['Backtest_ID']]);
    Logger.log('Total_Trades     = ' + row[hm['Total_Trades']]);
    Logger.log('Win_Rate_Total   = ' + row[hm['Win_Rate_Total']]);
    Logger.log('Profit_Factor    = ' + row[hm['Profit_Factor']]);
    Logger.log('Expectancy_R     = ' + row[hm['Expectancy_R']]);
    Logger.log('Max_Drawdown_Pct = ' + row[hm['Max_Drawdown_Pct']]);
    Logger.log('Sharpe_Ratio     = ' + row[hm['Sharpe_Ratio']]);
  }

  if (shPos && shPos.getLastRow() >= 2) {
    var data = shPos.getDataRange().getValues();
    var h = data[0];
    var ix = {};
    for (var k = 0; k < h.length; k++) ix[String(h[k] || '').trim()] = k;

    var realized = 0, unrealized = 0, closed = 0, open = 0, wins = 0, losses = 0;
    for (var r = 1; r < data.length; r++) {
      var status = String(data[r][ix['Position_Status']] || '').trim();
      if (status === 'CLOSED') {
        closed++;
        var pnl = Number(data[r][ix['Total_Realized_PnL_ZAR']] || 0);
        realized += pnl;
        if (pnl > 0) wins++;
        else if (pnl < 0) losses++;
      }
      if (status === 'OPEN' || status === 'PARTIAL') {
        open++;
        unrealized += Number(data[r][ix['Unrealized_PnL_ZAR']] || 0);
      }
    }

    Logger.log('Open_Positions        = ' + open);
    Logger.log('Closed_Positions      = ' + closed);
    Logger.log('Realized_PnL_ZAR      = ' + realized);
    Logger.log('Unrealized_PnL_ZAR    = ' + unrealized);
    Logger.log('Net_PnL_ZAR           = ' + (realized + unrealized));
    Logger.log('Closed_Wins           = ' + wins);
    Logger.log('Closed_Losses         = ' + losses);
    Logger.log('Closed_Win_Rate       = ' + (closed > 0 ? wins / closed : 'N/A'));
  }

  Logger.log('══════════════════════════════════════════════');
}


function M9__symFamilyKey_(sym) {
  var s = String(sym || '').toUpperCase();

  if (s.indexOf('BTC') !== -1) return 'BTC';
  if (s.indexOf('ETH') !== -1) return 'ETH';
  if (s.indexOf('SOL') !== -1) return 'SOL';
  if (s.indexOf('XRP') !== -1) return 'XRP';

  // fallback: take text before slash if present
  var slash = s.indexOf('/');
  if (slash > 0) return s.slice(0, slash);

  // fallback: take leading alpha chunk
  var m = s.match(/^[A-Z]+/);
  if (m && m[0]) return m[0];

  return s;
}

function M9__btChooseBetterCandidate_(a, b) {
  if (!a) return b;
  if (!b) return a;

  // Primary: higher DQS
  if ((b.dqs || 0) > (a.dqs || 0)) return b;
  if ((b.dqs || 0) < (a.dqs || 0)) return a;

  // Secondary: stronger grade
  var rank = { 'PREMIUM': 4, 'HIGH': 3, 'STANDARD': 2, 'SKIP': 1 };
  var ar = rank[a.grade] || 0;
  var br = rank[b.grade] || 0;
  if (br > ar) return b;
  if (br < ar) return a;

  // Tertiary: prefer PERP/USDT? No. Prefer simpler spot quote if tied.
  var aSym = String(a.sym || '').toUpperCase();
  var bSym = String(b.sym || '').toUpperCase();

  var aPenalty = 0;
  var bPenalty = 0;
  if (aSym.indexOf('PERP') !== -1) aPenalty += 1;
  if (aSym.indexOf('/ZAR') !== -1) aPenalty += 1;
  if (bSym.indexOf('PERP') !== -1) bPenalty += 1;
  if (bSym.indexOf('/ZAR') !== -1) bPenalty += 1;

  if (aPenalty < bPenalty) return a;
  if (bPenalty < aPenalty) return b;

  // Otherwise keep first
  return a;
}


/**
 * Fast "day stamp" for grouping by local day without Utilities.formatDate().
 *
 * - If tz === 'Africa/Johannesburg' (UTC+2, no DST), returns a NUMBER dayStamp.
 * - Otherwise returns a STRING 'yyyy-MM-dd' (fallback correctness for DST zones).
 *
 * IMPORTANT:
 * - All callers should treat the stamp as an opaque key (stringify only when needed).
 */
function M9__dayStamp_(ms, tz) {
  var z = String(tz || '').trim();
  if (z === 'Africa/Johannesburg') {
    // UTC+2 fixed offset
    return Math.floor((ms + (2 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
  }

  // Fallback correctness for arbitrary TZ/DST.
  return Utilities.formatDate(new Date(ms), z || 'UTC', 'yyyy-MM-dd');
}


/**
M9_DqsSummary_Emit.gs
Compact DQS summary emitter to avoid DQS_FORENSICS + avoid rescans.
ES5-only.
*/

function M9__dqsSumInit_(ctx) {
  if (!ctx) return;
  if (ctx.dqsSummary) return;

  ctx.dqsSummary = {
    version: 'M9_DQS_SUMMARY_V1',
    created_at: new Date().toISOString(),
    gate: null,

    scored: 0,
    passed: 0,
    rejected: 0,
    near_miss_band: 2,
    near_miss: 0,

    sum_total_all: 0,
    sum_total_pass: 0,
    sum_total_rej: 0,

    sum_comp_all: { compression: 0, duration: 0, volume: 0, multitf: 0, momentum: 0, accumulation: 0, fundAdj: 0 },
    sum_comp_pass:{ compression: 0, duration: 0, volume: 0, multitf: 0, momentum: 0, accumulation: 0, fundAdj: 0 },
    sum_comp_rej: { compression: 0, duration: 0, volume: 0, multitf: 0, momentum: 0, accumulation: 0, fundAdj: 0 },

    sample_passes: [],
    sample_rejects: [],

    reject_by_sym: {},
    pass_by_sym: {},

    _cap: 240,
    _seen_all: 0,
    _seen_pass: 0,
    _seen_rej: 0,
    _s_all: [],
    _s_pass: [],
    _s_rej: []
  };
}

function M9__dqsSum__num_(x, dflt) {
  var n = parseFloat(x);
  return isFinite(n) ? n : (dflt || 0);
}

function M9__dqsSum__inc_(m, k) {
  k = String(k || 'UNKNOWN');
  m[k] = (m[k] || 0) + 1;
}

function M9__dqsSum__reservoirPush_(arr, seenCount, cap, v) {
  seenCount++;
  if (arr.length < cap) {
    arr.push(v);
    return seenCount;
  }
  var j = Math.floor(Math.random() * seenCount);
  if (j < cap) arr[j] = v;
  return seenCount;
}

function M9__dqsSumRecord_(ctx, sym, dir, regimeNow, dqsObj, gate) {
  if (!ctx || !ctx.dqsSummary) M9__dqsSumInit_(ctx);
  var S = ctx.dqsSummary;
  if (!S) return;

  var total = M9__dqsSum__num_(dqsObj && dqsObj.total, NaN);
  if (!isFinite(total)) return;

  gate = M9__dqsSum__num_(gate, NaN);
  if (!isFinite(gate)) gate = total;

  if (S.gate === null) S.gate = gate;

  S.scored++;
  S.sum_total_all += total;
  S._seen_all = M9__dqsSum__reservoirPush_(S._s_all, S._seen_all, S._cap, total);

  S.sum_comp_all.compression += M9__dqsSum__num_(dqsObj.compression, 0);
  S.sum_comp_all.duration += M9__dqsSum__num_(dqsObj.duration, 0);
  S.sum_comp_all.volume += M9__dqsSum__num_(dqsObj.volume, 0);
  S.sum_comp_all.multitf += M9__dqsSum__num_(dqsObj.multitf, 0);
  S.sum_comp_all.momentum += M9__dqsSum__num_(dqsObj.momentum, 0);
  S.sum_comp_all.accumulation += M9__dqsSum__num_(dqsObj.accumulation, 0);
  S.sum_comp_all.fundAdj += M9__dqsSum__num_(dqsObj.fundAdj, 0);

  var passed = total >= gate;
  var missBy = gate - total;

  if (passed) {
    S.passed++;
    S.sum_total_pass += total;
    S._seen_pass = M9__dqsSum__reservoirPush_(S._s_pass, S._seen_pass, S._cap, total);

    S.sum_comp_pass.compression += M9__dqsSum__num_(dqsObj.compression, 0);
    S.sum_comp_pass.duration += M9__dqsSum__num_(dqsObj.duration, 0);
    S.sum_comp_pass.volume += M9__dqsSum__num_(dqsObj.volume, 0);
    S.sum_comp_pass.multitf += M9__dqsSum__num_(dqsObj.multitf, 0);
    S.sum_comp_pass.momentum += M9__dqsSum__num_(dqsObj.momentum, 0);
    S.sum_comp_pass.accumulation += M9__dqsSum__num_(dqsObj.accumulation, 0);
    S.sum_comp_pass.fundAdj += M9__dqsSum__num_(dqsObj.fundAdj, 0);

    M9__dqsSum__inc_(S.pass_by_sym, sym);

    if (S.sample_passes.length < 6) {
      S.sample_passes.push({
        sym: sym, dir: dir, regime: regimeNow,
        total: total, grade: String(dqsObj.grade || '')
      });
    }
  } else {
    S.rejected++;
    S.sum_total_rej += total;
    S._seen_rej = M9__dqsSum__reservoirPush_(S._s_rej, S._seen_rej, S._cap, total);

    S.sum_comp_rej.compression += M9__dqsSum__num_(dqsObj.compression, 0);
    S.sum_comp_rej.duration += M9__dqsSum__num_(dqsObj.duration, 0);
    S.sum_comp_rej.volume += M9__dqsSum__num_(dqsObj.volume, 0);
    S.sum_comp_rej.multitf += M9__dqsSum__num_(dqsObj.multitf, 0);
    S.sum_comp_rej.momentum += M9__dqsSum__num_(dqsObj.momentum, 0);
    S.sum_comp_rej.accumulation += M9__dqsSum__num_(dqsObj.accumulation, 0);
    S.sum_comp_rej.fundAdj += M9__dqsSum__num_(dqsObj.fundAdj, 0);

    M9__dqsSum__inc_(S.reject_by_sym, sym);

    if (missBy > 0 && missBy <= S.near_miss_band) S.near_miss++;

    if (S.sample_rejects.length < 6) {
      S.sample_rejects.push({
        sym: sym, dir: dir, regime: regimeNow,
        total: total, miss_by: missBy, grade: String(dqsObj.grade || '')
      });
    }
  }
}

function M9__dqsSum__quantilesFromSample_(arr) {
  if (!arr || !arr.length) return { n: 0, p10: 0, p50: 0, p90: 0, min: 0, max: 0, mean: 0 };
  var s = arr.slice().sort(function(a, b) { return a - b; });
  var sum = 0;
  for (var i = 0; i < s.length; i++) sum += s[i];
  function q_(p) {
    var idx = Math.floor((s.length - 1) * p);
    return s[Math.max(0, Math.min(s.length - 1, idx))];
  }
  return {
    n: s.length,
    min: s[0],
    p10: q_(0.10),
    p50: q_(0.50),
    p90: q_(0.90),
    max: s[s.length - 1],
    mean: sum / s.length
  };
}

function M9__dqsSum__topN_(m, n) {
  var arr = [];
  for (var k in m) if (m.hasOwnProperty(k)) arr.push({ sym: k, count: m[k] });
  arr.sort(function(a, b) { return b.count - a.count; });
  return arr.slice(0, n);
}

function M9__dqsSumFinalize_(ctx) {
  var S = ctx && ctx.dqsSummary ? ctx.dqsSummary : null;
  if (!S) return {};

  function mean_(sum, denom) { return denom > 0 ? (sum / denom) : 0; }
  function meanComp_(sumObj, denom) {
    denom = Math.max(1, denom || 1);
    return {
      compression: sumObj.compression / denom,
      duration: sumObj.duration / denom,
      volume: sumObj.volume / denom,
      multitf: sumObj.multitf / denom,
      momentum: sumObj.momentum / denom,
      accumulation: sumObj.accumulation / denom,
      fundAdj: sumObj.fundAdj / denom
    };
  }

  return {
    version: S.version,
    created_at: S.created_at,
    gate: S.gate,

    scored: S.scored,
    passed: S.passed,
    rejected: S.rejected,
    pass_rate: S.scored ? (S.passed / S.scored) : 0,

    near_miss_band: S.near_miss_band,
    near_miss: S.near_miss,
    near_miss_rate: S.scored ? (S.near_miss / S.scored) : 0,

    mean_total_all: mean_(S.sum_total_all, S.scored),
    mean_total_pass: mean_(S.sum_total_pass, S.passed),
    mean_total_rej: mean_(S.sum_total_rej, S.rejected),

    score_quantiles_sampled: {
      all: M9__dqsSum__quantilesFromSample_(S._s_all),
      passed: M9__dqsSum__quantilesFromSample_(S._s_pass),
      rejected: M9__dqsSum__quantilesFromSample_(S._s_rej)
    },

    components_mean: {
      all: meanComp_(S.sum_comp_all, S.scored),
      passed: meanComp_(S.sum_comp_pass, S.passed),
      rejected: meanComp_(S.sum_comp_rej, S.rejected)
    },

    top: {
      rejected_symbols: M9__dqsSum__topN_(S.reject_by_sym, 5),
      passed_symbols: M9__dqsSum__topN_(S.pass_by_sym, 5)
    },

    samples: {
      passes: S.sample_passes,
      rejects: S.sample_rejects
    },

    note: 'Computed during backtest on CONFIRMED setups only. No rescans. Samples are bounded.'
  };
}



function RUN_diagM9ConstNow() {
  var g = (typeof globalThis !== 'undefined') ? globalThis : this;
  var st = RUN__ensureM9Globals_();

  Logger.log('[RUN][M9 DIAG] ═══════════════════════════════════════');
  Logger.log('[RUN][M9 DIAG] Starting');
  Logger.log('[RUN][M9 DIAG] ═══════════════════════════════════════');

  Logger.log('[RUN][M9 DIAG] typeof M9_runWalkForwardBacktest = ' + typeof M9_runWalkForwardBacktest);
  Logger.log('[RUN][M9 DIAG] typeof M9_CONST = ' + typeof M9_CONST);
  Logger.log('[RUN][M9 DIAG] typeof M9_COL = ' + typeof M9_COL);
  Logger.log('[RUN][M9 DIAG] typeof globalThis.M9_CONST = ' + typeof g.M9_CONST);
  Logger.log('[RUN][M9 DIAG] typeof globalThis.M9_COL = ' + typeof g.M9_COL);

  Logger.log('[RUN][M9 DIAG] ensure.hasFn = ' + st.hasFn);
  Logger.log('[RUN][M9 DIAG] ensure.hasConstLocal = ' + st.hasConstLocal);
  Logger.log('[RUN][M9 DIAG] ensure.hasColLocal = ' + st.hasColLocal);
  Logger.log('[RUN][M9 DIAG] ensure.hasConstGlobal = ' + st.hasConstGlobal);
  Logger.log('[RUN][M9 DIAG] ensure.hasColGlobal = ' + st.hasColGlobal);

  try {
    Logger.log('[RUN][M9 DIAG] M9_CONST.SHEETS = ' + JSON.stringify((typeof M9_CONST !== 'undefined' && M9_CONST) ? M9_CONST.SHEETS : null));
  } catch (e1) {
    Logger.log('[RUN][M9 DIAG] M9_CONST.SHEETS failed: ' + e1.message);
  }

  try {
    Logger.log('[RUN][M9 DIAG] M9_CONST.HEADERS keys = ' + Object.keys((typeof M9_CONST !== 'undefined' && M9_CONST && M9_CONST.HEADERS) ? M9_CONST.HEADERS : {}).join(', '));
  } catch (e2) {
    Logger.log('[RUN][M9 DIAG] M9_CONST.HEADERS failed: ' + e2.message);
  }

  try {
    Logger.log('[RUN][M9 DIAG] M9_COL keys = ' + Object.keys((typeof M9_COL !== 'undefined' && M9_COL) ? M9_COL : {}).join(', '));
  } catch (e3) {
    Logger.log('[RUN][M9 DIAG] M9_COL keys failed: ' + e3.message);
  }

  Logger.log('[RUN][M9 DIAG] ═══════════════════════════════════════');
  Logger.log('[RUN][M9 DIAG] Complete');
  Logger.log('[RUN][M9 DIAG] ═══════════════════════════════════════');
}


function RUN__assertM9Loaded_() {
  var g = (typeof globalThis !== 'undefined') ? globalThis : this;
  var st = RUN__ensureM9Globals_();

  var ok =
    st.hasFn &&
    (st.hasConstLocal || st.hasConstGlobal) &&
    (st.hasColLocal || st.hasColGlobal) &&
    ((typeof M9_CONST !== 'undefined' && M9_CONST && M9_CONST.SHEETS && M9_CONST.HEADERS) ||
     (typeof g.M9_CONST !== 'undefined' && g.M9_CONST && g.M9_CONST.SHEETS && g.M9_CONST.HEADERS)) &&
    ((typeof M9_COL !== 'undefined' && M9_COL && M9_COL.BACKTEST_RESULTS) ||
     (typeof g.M9_COL !== 'undefined' && g.M9_COL && g.M9_COL.BACKTEST_RESULTS));

  if (!ok) {
    throw new Error(
      '[RUN] M9 not loaded correctly in this execution context.\n' +
      'typeof M9_runWalkForwardBacktest=' + (typeof M9_runWalkForwardBacktest) + '\n' +
      'typeof M9_CONST=' + (typeof M9_CONST) + '\n' +
      'typeof M9_COL=' + (typeof M9_COL) + '\n' +
      'typeof globalThis.M9_CONST=' + (typeof g.M9_CONST) + '\n' +
      'typeof globalThis.M9_COL=' + (typeof g.M9_COL) + '\n' +
      'Expected M9 function + constants + column maps in the same runtime.'
    );
  }
}




function AUDIT__UniverseResolutionSmokeTest() {
  var fakeSyms = [
    'BTC/ZAR',
    'BTC/USDT',
    'BTC/USDTPERP',
    'ETH/USDT',
    'XRP/ZAR',
    'XRP/USDT',
    'XRP/USDTPERP',
    'SOL/ZAR',
    'SOL/USDTPERP',
    'DOGE/ZAR',
    'DOGE/USDTPERP',
    'BNB/ZAR'
  ];

  var tests = [
    { label: 'MAJORS_ONLY', mode: 'MAJORS_ONLY', p: { universeMode: 'MAJORS_ONLY' } },
    { label: 'HARD_FILTER_ALL', mode: 'HARD_FILTER_ALL', p: { universeMode: 'HARD_FILTER_ALL' } },
    { label: 'TOP_K', mode: 'TOP_K', p: { universeMode: 'TOP_K' } },
    { label: 'TOP_SPS_CORE', mode: 'TOP_SPS_CORE', p: { universeMode: 'TOP_SPS_CORE' } },
    { label: 'TOP_SPS_WITH_DOGE', mode: 'TOP_SPS_WITH_DOGE', p: { universeMode: 'TOP_SPS_WITH_DOGE' } },
    { label: 'PERP_CORE', mode: 'PERP_CORE', p: { universeMode: 'PERP_CORE' } },
    { label: 'SPOT_CORE', mode: 'SPOT_CORE', p: { universeMode: 'SPOT_CORE' } },
    {
      label: 'CUSTOM',
      mode: 'CUSTOM',
      p: {
        universeMode: 'CUSTOM',
        Symbol_Allowlist: ['BTC/USDT', 'XRP/USDTPERP', 'DOGE/ZAR']
      }
    }
  ];

  var out = [];
  for (var i = 0; i < tests.length; i++) {
    var t = tests[i];
    var eligible = M9__btBuildEligibleSyms_(fakeSyms, t.mode, t.p);
    out.push('[' + t.label + '] ' + JSON.stringify(eligible));
  }

  Logger.log(out.join('\n'));
  return out.join('\n');
}



/*
══════════════════════════════════════════════════════════════
M9_SupabaseBridge.gs
Minimal bridge from Supabase canonical candles into M9 backtest loader shape.
══════════════════════════════════════════════════════════════
*/

function M9__useSupabaseBacktestHistory_() {
  try {
    var sp = PropertiesService.getScriptProperties();
    var v = sp.getProperty('USE_SUPABASE_BACKTEST_HISTORY') || 'TRUE';
    v = String(v).trim().toUpperCase();
    return (v === 'TRUE' || v === '1' || v === 'YES' || v === 'ON');
  } catch (e1) {}
  return true;
}

function M9__activeDatasetId_() {
  try {
    var sp = PropertiesService.getScriptProperties();
    var v = sp.getProperty('ACTIVE_DATASET_ID') || '';
    if (v) return String(v).trim();
  } catch (e1) {}
  return 'OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1';
}

function M9__baseSymbolToPerp_(sym) {
  var s = String(sym || '').trim().toUpperCase();
  if (!s) return s;
  if (s.indexOf('/USDTPERP') !== -1) return s;
  if (s.indexOf('/USDT') !== -1) return s.split('/')[0] + '/USDTPERP';
  return s;
}

function M9__baseSymbolToSpot_(sym) {
  var s = String(sym || '').trim().toUpperCase();
  if (!s) return s;
  if (s.indexOf('/USDT') !== -1 && s.indexOf('/USDTPERP') === -1) return s;
  if (s.indexOf('/USDTPERP') !== -1) return s.split('/')[0] + '/USDT';
  return s;
}

/**
 * Pulls all 4H candles from Supabase coverage universe and builds
 * the exact M9 loader shape: { bySym, masterMs }
 */
function M9__btLoadDataClean4hFromSupabase_(startMs, endMs, datasetId) {
  datasetId = datasetId || M9__activeDatasetId_();

  var hs = M2_sbGetCanonicalHistoryStatus_(datasetId);
  if (!hs || !hs.rows || !hs.rows.length) {
    throw new Error('[M9][SB] No coverage rows found for dataset ' + datasetId);
  }

  var bySym = {};
  var masterMs = [];
  var loadedPairs = {};

  for (var i = 0; i < hs.rows.length; i++) {
    var cov = hs.rows[i];
    if (String(cov.timeframe || '') !== '4H') continue;
    if (cov.is_ready !== true) continue;

    var symbol = String(cov.symbol || '').trim();
    var marketTypeRaw = String(cov.market_type || '').trim().toLowerCase();
    if (!symbol) continue;

    var pairKey = symbol + '||4H||' + marketTypeRaw;
    if (loadedPairs[pairKey]) continue;
    loadedPairs[pairKey] = true;

    var sbRows = M2_sbFetchCandles_(datasetId, symbol, '4H', marketTypeRaw);
    if (!sbRows || !sbRows.length) continue;

    for (var j = 0; j < sbRows.length; j++) {
      var r = sbRows[j];

      var tms = new Date(r.ts).getTime();
      if (!isFinite(tms) || tms < startMs || tms > endMs) continue;

      var o = M9__safeNum_(r.open);
      var h = M9__safeNum_(r.high);
      var l = M9__safeNum_(r.low);
      var c = M9__safeNum_(r.close);
      var v = M9__safeNum_(r.volume);

      if (!(o > 0 && h > 0 && l > 0 && c > 0)) continue;

      if (!bySym[symbol]) bySym[symbol] = [];
      bySym[symbol].push({
        ms: tms,
        o: o,
        h: h,
        l: l,
        c: c,
        v: v,
        funding: null,
        borrow: null,
        fx: 1
      });

      masterMs.push(tms);
    }
  }

  return { bySym: bySym, masterMs: masterMs };
}

function RUN_M9_verifySupabaseHistoryAndUniverseNow() {
  var cfg = M9__cfgLoadMap_();
  var p = M9__btLoadSimParams_(cfg);
  var dr = M9__btResolveDateRange_(cfg);

  var dc = M9__btLoadDataClean4h_(dr.startMs, dr.endMs);
  var bySym = dc.bySym;
  var syms = M9__btBuildSymbolList_(bySym);

  Logger.log('[RUN][M9][VERIFY] ═══════════════════════════════════════');
  Logger.log('[RUN][M9][VERIFY] dataset=' + M9__activeDatasetId_());
  Logger.log('[RUN][M9][VERIFY] all loaded syms=' + JSON.stringify(syms));

  var modes = [
    'TOP_SPS_CORE',
    'TOP_SPS_WITH_DOGE',
    'PERP_CORE',
    'SPOT_CORE',
    'HARD_FILTER_ALL'
  ];

  for (var i = 0; i < modes.length; i++) {
    var mode = modes[i];
    var eligible = M9__btBuildEligibleSyms_(syms, mode, p);
    Logger.log('[RUN][M9][VERIFY] mode=' + mode + ' eligible=' + JSON.stringify(eligible));
  }

  Logger.log('[RUN][M9][VERIFY] ═══════════════════════════════════════');
}


/*
══════════════════════════════════════════════════════════════
TEMP_RuntimeGhostAudit.gs
READ-ONLY runtime ghost audit helpers.
Do not mutate runtime from this file.
══════════════════════════════════════════════════════════════
*/

function TEMP__safeTypeofGlobal_(name) {
  try {
    var g = (typeof globalThis !== 'undefined') ? globalThis : this;
    return typeof g[name];
  } catch (e) {
    return 'ERROR:' + e.message;
  }
}

function TEMP__safeFunctionExists_(name) {
  try {
    var g = (typeof globalThis !== 'undefined') ? globalThis : this;
    return (typeof g[name] === 'function');
  } catch (e) {
    return false;
  }
}

function TEMP_listTriggersDetailed() {
  var triggers = ScriptApp.getProjectTriggers();
  Logger.log('[GHOST][TRIGGERS] count=' + triggers.length);

  for (var i = 0; i < triggers.length; i++) {
    var t = triggers[i];
    var handler = '';
    var eventType = '';
    var source = '';
    var exists = false;

    try { handler = t.getHandlerFunction(); } catch (e1) { handler = 'ERR:' + e1.message; }
    try { eventType = String(t.getEventType()); } catch (e2) { eventType = 'ERR:' + e2.message; }
    try { source = String(t.getTriggerSource()); } catch (e3) { source = 'ERR:' + e3.message; }

    exists = TEMP__safeFunctionExists_(handler);

    Logger.log(
      '[GHOST][TRIGGER] idx=' + i +
      ' handler=' + handler +
      ' exists=' + exists +
      ' eventType=' + eventType +
      ' source=' + source
    );
  }
}

function TEMP_checkCriticalEntrypoints() {
  var names = [
    'MAIN_scheduledCycle',
    'MAIN_dailyMaintenance',
    'RUN_experimentMatrix_resumableStart',
    'RUN_experimentMatrix_resumableContinue',
    'RUN_experimentMatrix_rescueContinue',
    'START_PERSISTENCE_HUNT_V2',
    'START_PERSISTENCE_HUNT_V3',
    'RUN_M2_sbAuditDatasetNow',
    'RUN_M9_diagDirectLoad4hNow',
    'RUN_M9_verifySupabaseHistoryAndUniverseNow',
    'RUN_M9_freshDataSmokeBacktestNow',
    'IGN_onOpen'
  ];

  Logger.log('[GHOST][ENTRYPOINTS] checking=' + names.length);

  for (var i = 0; i < names.length; i++) {
    var n = names[i];
    Logger.log(
      '[GHOST][ENTRYPOINT] name=' + n +
      ' typeof=' + TEMP__safeTypeofGlobal_(n) +
      ' exists=' + TEMP__safeFunctionExists_(n)
    );
  }
}

function TEMP_checkExperimentStateReadOnly() {
  try {
    if (typeof RUN__expLoadState_ !== 'function') {
      Logger.log('[GHOST][EXPSTATE] RUN__expLoadState_ missing');
      return;
    }

    var st = RUN__expLoadState_();
    if (!st) {
      Logger.log('[GHOST][EXPSTATE] no active experiment state');
      return;
    }

    Logger.log('[GHOST][EXPSTATE] idx=' + st.idx +
               ' jobs=' + (st.jobs ? st.jobs.length : 0) +
               ' status=' + String(st.status || '') +
               ' activeJobIdx=' + String(st.activeJobIdx) +
               ' activeJobStartedAt=' + String(st.activeJobStartedAt || '') +
               ' lastCompletedIdx=' + String(st.lastCompletedIdx) +
               ' lastCompletedAt=' + String(st.lastCompletedAt || ''));
  } catch (e) {
    Logger.log('[GHOST][EXPSTATE] ERROR ' + e.message);
  }
}

function TEMP_listInterestingPropertiesOnly() {
  var props = null;
  try {
    props = RUN__getProps_();
  } catch (e1) {
    props = PropertiesService.getScriptProperties();
  }

  var all = props.getProperties();
  var keys = Object.keys(all || {}).sort();

  Logger.log('[GHOST][PROPS] count=' + keys.length);

  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];

    if (
      k.indexOf('RUN_') === 0 ||
      k.indexOf('M9_') === 0 ||
      k.indexOf('M10_') === 0 ||
      k.indexOf('M6_') === 0 ||
      k.indexOf('M4_') === 0 ||
      k.indexOf('M2B_') === 0 ||
      k.indexOf('SUPABASE') === 0 ||
      k.indexOf('VALR') === 0 ||
      k.indexOf('CRYPTOCOMPARE') === 0 ||
      k.indexOf('OPENROUTER') === 0
    ) {
      var v = String(all[k] || '');
      Logger.log('[GHOST][PROP] key=' + k + ' len=' + v.length);
    }
  }
}

function TEMP_checkKnownFunctionSet() {
  var names = [
    'M2__executeRequest_',
    'M2_valrPublicGet',
    'M2_valrAuthGet',
    'M2_fetchTopKCandlesIncremental',
    'M2_fetchResearchUniverseCandlesIncremental',
    'M2B_bootstrapFullActiveUniverse',
    'M2B_bootstrapResearchUniverseResumableStart',
    'M2B_bootstrapResearchUniverseResumableContinue',
    'M2_sbGetCanonicalHistoryStatus_',
    'M2_sbFetchCandles_',
    'M9__btLoadDataClean4h_',
    'M9__btLoadDataClean4hFromSupabase_',
    'M9__resolveUniverseSymbolMap_',
    'M6_runExecutionCycle',
    'M10_createPendingCouncilDeliberationNow'
  ];

  for (var i = 0; i < names.length; i++) {
    var n = names[i];
    Logger.log('[GHOST][FNSET] ' + n + ' exists=' + TEMP__safeFunctionExists_(n));
  }
}

/**
 * Search source code files for suspicious references.
 * Reads project files via Drive is not available directly in standard GAS source,
 * so this helper is manual-reference only.
 * Use this as a reminder runner.
 */
function TEMP_logManualSearchChecklist() {
  Logger.log('[GHOST][SEARCH] Manual source search checklist:');
  Logger.log('[GHOST][SEARCH] Search project for: IGN_onOpen');
  Logger.log('[GHOST][SEARCH] Search project for: getDocumentById(');
  Logger.log('[GHOST][SEARCH] Search project for: openById(');
  Logger.log('[GHOST][SEARCH] Search project for: RUN_experimentMatrix_resumableContinue');
  Logger.log('[GHOST][SEARCH] Search project for: RUN_experimentMatrix_rescueContinue');
  Logger.log('[GHOST][SEARCH] Search project for: START_PERSISTENCE_HUNT_V2');
  Logger.log('[GHOST][SEARCH] Search project for: START_PERSISTENCE_HUNT_V3');
  Logger.log('[GHOST][SEARCH] Search project for duplicate definitions of: M9__btLoadDataClean4h_');
  Logger.log('[GHOST][SEARCH] Search project for duplicate definitions of: RUN__ensureM9Globals_');
  Logger.log('[GHOST][SEARCH] Search project for duplicate definitions of: M9__resolveUniverseSymbolMap_');
}

/**
 * Master runner: read-only audit.
 */
function RUN_RuntimeGhostAuditNow() {
  Logger.log('[GHOST][AUDIT] ═══════════════════════════════════════');
  Logger.log('[GHOST][AUDIT] Runtime Ghost Audit starting');
  Logger.log('[GHOST][AUDIT] READ-ONLY MODE');
  Logger.log('[GHOST][AUDIT] ═══════════════════════════════════════');

  TEMP_listTriggersDetailed();
  TEMP_checkCriticalEntrypoints();
  TEMP_checkExperimentStateReadOnly();
  TEMP_listInterestingPropertiesOnly();
  TEMP_checkKnownFunctionSet();
  TEMP_logManualSearchChecklist();

  Logger.log('[GHOST][AUDIT] ═══════════════════════════════════════');
  Logger.log('[GHOST][AUDIT] Runtime Ghost Audit complete');
  Logger.log('[GHOST][AUDIT] ═══════════════════════════════════════');
}
