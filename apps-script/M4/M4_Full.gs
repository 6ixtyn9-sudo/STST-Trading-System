/**
 * MODULE 4 — Signal Engine + DQS Scoring
 * M4_Constants.gs
 *
 * Immutable constants, exact 0-based column indexes, config thresholds.
 * Single source of truth for all schema and parameter definitions.
 *
 * Naming: M4_CONST, M4_COL (module-scoped constants).
 *
 * @version 3.2.1
 */

var M4_CONST = Object.freeze({
  VERSION: '3.2.1',

  // ── Sheet Names ─────────────────────────────────────────────────────
  SHEETS: Object.freeze({
    SIGNALS : 'SIGNALS',
    UNIVERSE : 'UNIVERSE',
    LEVELS : 'LEVELS',
    INDICATORS : 'INDICATORS',
    REGIME : 'REGIME',
    POSITIONS : 'POSITIONS',
    CONFIG : 'CONFIG',
    DATA_CLEAN : 'DATA_CLEAN'
  }),

  // ── Time Constants ──────────────────────────────────────────────────
  PERIOD_4H_MS: 4 * 60 * 60 * 1000,

  // ── DQS Component Max Scores ────────────────────────────────────────
  DQS_MAX: Object.freeze({
    COMPRESSION : 25,
    DURATION : 10,
    VOLUME : 20,
    MULTITF : 15,
    MULTITF_SOLO : 10,
    MOMENTUM : 15,
    ACCUMULATION : 5,
    TOTAL_BEFORE_ADJ : 90
  }),

  // ── DQS Component Thresholds ────────────────────────────────────────
  DQS_THRESH: Object.freeze({
    COMP_LO : 0.5,
    COMP_HI : 1.0,
    DUR_LO : 4,
    DUR_HI : 16,
    VOL_LO : 1.5,
    VOL_HI : 3.0,
    MOM_HI : 0.02,
    ACC_HI_PCT : 0.55,
    ACC_MID_PCT : 0.40
  }),

  // ── Gate Parameters ─────────────────────────────────────────────────
  GATE: Object.freeze({
    BREAKOUT_BUFFER_ATR : 0.5,
    RSI_OVERBOUGHT_LONG : 75,
    RSI_OVERSOLD_SHORT : 25
  }),

  // ── DQS Grade Definitions ───────────────────────────────────────────
  GRADES: Object.freeze({
    PREMIUM : { min: 72, max: 90, name: 'PREMIUM' },
    HIGH : { min: 54, max: 71, name: 'HIGH' },
    STANDARD : { min: 36, max: 53, name: 'STANDARD' },
    SKIP : { min: 0, max: 35, name: 'SKIP' }
  }),

  // ── Regime DQS Requirements ─────────────────────────────────────────
  REGIME_RULES: Object.freeze({
    'RISK-ON_LONG' : { minDqs: 36, sizeMod: 1.0 },
    'RISK-ON_SHORT' : { minDqs: 54, sizeMod: 0.5 },
    'NEUTRAL_LONG' : { minDqs: 54, sizeMod: 0.5 },
    'NEUTRAL_SHORT' : { minDqs: 54, sizeMod: 0.5 },
    'RISK-OFF_LONG' : { minDqs: 999, sizeMod: 0.0 },
    'RISK-OFF_SHORT' : { minDqs: 45, sizeMod: 0.75 }
  }),

  // ── Funding Penalty ─────────────────────────────────────────────────
  FUNDING_PENALTY_PTS: -20
});

/**
 * 0-based column index maps for all sheets read/written by M4.
 * Single source of truth — if headers change, update here only.
 */
var M4_COL = Object.freeze({

  // ── SIGNALS sheet (M4 writes) ────────────────────────────────────────────
  SIGNALS: Object.freeze({
    Signal_ID              : 0,
    Timestamp              : 1,
    Symbol                 : 2,
    Market_Type            : 3,
    Direction              : 4,
    Level_Value            : 5,
    Close_Price            : 6,
    ATR_14                 : 7,
    Volume_Ratio           : 8,
    RSI_14                 : 9,
    Trend_Aligned          : 10,
    Room_To_Run_R          : 11,
    SPS_At_Signal          : 12,
    Gate_All_Passed        : 13,
    Gate_Rejection_Reasons : 14,
    DQS_Compression        : 15,
    DQS_Duration           : 16,
    DQS_Volume             : 17,
    DQS_MultiTF            : 18,
    DQS_Momentum           : 19,
    DQS_Accumulation       : 20,
    DQS_Funding_Adjustment : 21,
    DQS_Total              : 22,
    DQS_Grade              : 23,
    Market_Regime          : 24,
    Final_Signal_State     : 25,
    Final_Rejection_Reason : 26
  }),

  // ── Upstream sheet column maps (read-only) ────────────────────────────────

  UNIVERSE: Object.freeze({
    Symbol      : 0,
    Market_Type : 1,
    SPS_Final   : 2,
    SPS_Rank    : 3,
    In_Top_K    : 4,
    ATR_4H_Pct  : 5,
    ATR_Ratio   : 6,
    BB_Squeeze  : 7,
    Vol_24h_ZAR : 8,
    OBV_Slope_20: 9,
    Data_Reliable: 10
  }),

  LEVELS: Object.freeze({
    Symbol               : 0,
    Timestamp            : 1,
    Resistance_Value     : 2,
    Support_Value        : 3,
    Lookback_N           : 4,
    Daily_Resistance     : 5,
    Daily_Support        : 6,
    Times_Tested_Res     : 7,
    Times_Tested_Sup     : 8,
    Res_Status           : 9,
    Sup_Status           : 10,
    Next_Higher_Res      : 11,
    Next_Lower_Sup       : 12,
    Room_to_Run_Long_R   : 13,
    Room_to_Fall_Short_R : 14
  }),

  INDICATORS: Object.freeze({
    Symbol                   : 0,
    Timestamp                : 1,
    Timeframe                : 2,
    ATR_14                   : 3,
    ATR_Lagged_30            : 4,
    ATR_Ratio                : 5,
    BB_Upper                 : 6,
    BB_Lower                 : 7,
    BB_Middle                : 8,
    BB_Width                 : 9,
    BB_Width_Percentile_60   : 10,
    BB_Squeeze               : 11,
    SMA_50_Daily             : 12,
    Volume_SMA_30            : 13,
    Volume_Ratio             : 14,
    RSI_14                   : 15,
    OBV                      : 16,
    OBV_Slope_20             : 17,
    Rel_Perf_vs_BTC_7d       : 18,
    Consolidation_Count_High : 19,
    Consolidation_Count_Low  : 20,
    Wick_To_Body_Avg_30      : 21,
    Funding_Rate_Current     : 22
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

  POSITIONS: Object.freeze({
    Position_ID               : 0,
    Signal_ID                 : 1,
    Opened_Ts                 : 2,
    Last_Update_Ts            : 3,
    Symbol                    : 4,
    Side                      : 5,
    Leverage                  : 6,
    Margin_Mode               : 7,
    Entry_Price               : 8,
    Initial_Stop              : 9,
    Current_Stop              : 10,
    TP1_Price                 : 11,
    TP2_Price                 : 12,
    Position_Size_Base        : 13,
    Position_Notional_ZAR     : 14,
    Risk_Amount_ZAR           : 15,
    Fee_Est_ZAR               : 16,
    Funding_Est_ZAR           : 17,
    Slippage_Est_ZAR          : 18,
    ATR_At_Entry              : 19,
    R_At_Entry                : 20,
    Regime_At_Entry           : 21,
    DQS_At_Entry              : 22,
    SPS_At_Entry              : 23,
    Entry_Reason              : 24,
    Exit_Price                : 25,
    Exit_Ts                   : 26,
    Exit_Reason               : 27,
    Realized_PnL_ZAR          : 28,
    Realized_R                : 29,
    Max_Favorable_Excursion_R : 30,
    Max_Adverse_Excursion_R   : 31,
    Trailing_Active           : 32,
    TP1_Hit                   : 33,
    TP2_Hit                   : 34,
    Partial_Exit_Done         : 35,
    Stop_Server_Order_ID      : 36,
    Entry_Order_ID            : 37,
    Exit_Order_ID             : 38,
    Notes                     : 39,
    Position_Status           : 40,
    Cooldown_Until_Ts         : 41,
    Liquidation_Price_Est     : 42,
    Liquidation_Buffer_R      : 43,
    Margin_Fraction_At_Entry  : 44,
    Margin_Fraction_Current   : 45,
    Funding_Rate_At_Entry     : 46,
    Borrow_Rate_At_Entry      : 47,
    Exchange                  : 48,
    Strategy_Version          : 49,
    Created_By                : 50,
    Updated_By                : 51
  }),

  CONFIG: Object.freeze({
    Parameter : 0,
    Value     : 1
  })
});



/**
 * MODULE 4 — Signal Engine + DQS Scoring
 * M4_Utils.gs
 *
 * Private utility functions: I/O, math, config access.
 * All functions prefixed M4__ (double underscore = private).
 *
 * @version 3.2.1
 */

// ── Sheet I/O ──────────────────────────────────────────────────────────────

/**
 * Gets a sheet by name or throws.
 */
function M4__getSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) throw new Error('[M4] Sheet not found: ' + name);
  return sh;
}

/**
 * Reads all data from a sheet as 2D array (includes header row).
 * Returns empty array if sheet is empty.
 */
function M4__readAll_(sheetName) {
  var sh = M4__getSheet_(sheetName);
  var lastRow = sh.getLastRow();
  if (lastRow < 1) return [];
  return sh.getDataRange().getValues();
}

/**
 * Appends rows to a sheet. No-op if rows is empty.
 */
function M4__appendRows_(sheetName, rows) {
  if (!rows || rows.length === 0) return;
  var sh = M4__getSheet_(sheetName);
  var nextRow = sh.getLastRow() + 1;
  sh.getRange(nextRow, 1, rows.length, rows[0].length).setValues(rows);
}


// ── ID & Timestamp ─────────────────────────────────────────────────────────

/**
 * Generates a unique Signal ID.
 * Format: SIG-{SYMBOL}-{L|S}-{timestamp_suffix}
 */
function M4__generateSignalId_(sym, dir) {
  var ts = new Date().getTime().toString().slice(-8);
  return 'SIG-' + sym.replace(/\//g, '') + '-' + dir.charAt(0) + '-' + ts;
}

/**
 * Returns current UTC timestamp as ISO 8601 string.
 */
function M4__nowIso_() {
  return new Date().toISOString();
}




/**
 * Loads all CONFIG values into a single config object.
 * Central point for all configurable parameters used by M4.
 *
 * UPDATED for Phase 3 (DQS Goldilocks + adaptive breakout buffer)
 * New fields added exactly as requested.
 */
function M4__loadConfig_() {
  return {
    // ── Original fields (unchanged) ───────────────────────────────────────
    killSwitch:      M4__cfgBool_('Kill_Switch', false),
    maxConcurrent:   M4__cfgNum_('Max_Concurrent_Positions', 3),
    volThresh:       M4__cfgNum_('Volume_Multiplier_Threshold', 1.5),
    rrMin:           M4__cfgNum_('RR_Minimum', 3.0),
    maxFundPct:      M4__cfgNum_('Max_Funding_Cost_Per_Day_Pct', 0.003),
    cooldownCandles: M4__cfgNum_('Cooldown_After_Stopout_Candles', 12),

    // ── NEW Phase 3 fields (Goldilocks + adaptive breakout) ───────────────
    // Compression Goldilocks zone
    compOptLo:       M4__cfgNum_('DQS_Compression_Optimal_Low', 0.55),
    compOptHi:       M4__cfgNum_('DQS_Compression_Optimal_High', 0.75),
    compRejectHi:    M4__cfgNum_('DQS_Compression_Reject_High', 1.05),

    // Volume Goldilocks zone
    volOptLo:        M4__cfgNum_('DQS_Volume_Optimal_Low', 1.8),
    volOptHi:        M4__cfgNum_('DQS_Volume_Optimal_High', 2.6),
    volClimaxHi:     M4__cfgNum_('DQS_Volume_Climax_High', 4.0),

    // Adaptive breakout buffer
    breakoutBufferAdaptive: M4__cfgStr_('DQS_Breakout_Buffer_Adaptive', 'TRUE').toUpperCase() === 'TRUE',
    breakoutBufferAtrMin:   M4__cfgNum_('DQS_Breakout_Buffer_ATR_Min', 0.10),
    breakoutBufferAtrMax:   M4__cfgNum_('DQS_Breakout_Buffer_ATR_Max', 0.35)
  };
}



/**
 * MODULE 4 — Signal Engine + DQS Scoring
 * M4_StateReader.gs
 *
 * Reads state from upstream modules (UNIVERSE, LEVELS, INDICATORS, REGIME, POSITIONS).
 * All functions prefixed M4__ (double underscore = private).
 *
 * @version 3.2.1
 */

// ── REGIME ─────────────────────────────────────────────────────────────────

/**
 * Gets current market regime from REGIME sheet (last row).
 * Returns: 'RISK-ON' | 'NEUTRAL' | 'RISK-OFF'
 */
function M4__getRegime_() {
  try {
    var data = M4__readAll_(M4_CONST.SHEETS.REGIME);
    if (data.length < 2) return 'RISK-OFF';
    var lastRow = data[data.length - 1];
    var regime = String(lastRow[M4_COL.REGIME.Market_Regime] || 'RISK-OFF').trim();
    var valid = ['RISK-ON', 'NEUTRAL', 'RISK-OFF'];
    return valid.indexOf(regime) >= 0 ? regime : 'RISK-OFF';
  } catch (e) {
    return 'RISK-OFF';
  }
}

// ── POSITIONS ──────────────────────────────────────────────────────────────

/**
 * Gets total count of open positions.
 */
function M4__getOpenPositionCount_() {
  try {
    var data = M4__readAll_(M4_CONST.SHEETS.POSITIONS);
    var pc = M4_COL.POSITIONS;
    var count = 0;

    for (var i = 1; i < data.length; i++) {
      var status = String(data[i][pc.Position_Status] || '');
      if (status === 'OPEN' || status === 'PARTIAL') count++;
    }

    return count;
  } catch (e) {
    return 0;
  }
}

/**
 * Checks if symbol has an open position in the given direction.
 */
function M4__hasOpenPosition_(sym, dir) {
  try {
    var data = M4__readAll_(M4_CONST.SHEETS.POSITIONS);
    var pc = M4_COL.POSITIONS;

    for (var i = 1; i < data.length; i++) {
      var symbol = String(data[i][pc.Symbol] || '');
      var side   = String(data[i][pc.Side] || '');
      var status = String(data[i][pc.Position_Status] || '');

      if (symbol === sym &&
          side === dir &&
          (status === 'OPEN' || status === 'PARTIAL')) {
        return true;
      }
    }
  } catch (e) { /* fallback */ }

  return false;
}

/**
 * Checks if symbol is in cooldown after a recent stop-out.
 * Uses explicit Cooldown_Until_Ts when available, otherwise falls back to Exit_Ts.
 */
function M4__inCooldown_(sym, cfg) {
  try {
    var cooldownMs = cfg.cooldownCandles * M4_CONST.PERIOD_4H_MS;
    var now = Date.now();
    var data = M4__readAll_(M4_CONST.SHEETS.POSITIONS);
    var pc = M4_COL.POSITIONS;

    for (var i = data.length - 1; i >= 1; i--) {
      var symbol = String(data[i][pc.Symbol] || '');
      var exitReason = String(data[i][pc.Exit_Reason] || '');

      if (symbol !== sym) continue;
      if (exitReason !== 'STOP') continue;

      // Preferred: explicit cooldown timestamp
      var cooldownUntilRaw = data[i][pc.Cooldown_Until_Ts];
      var cooldownUntil = new Date(String(cooldownUntilRaw || ''));
      if (!isNaN(cooldownUntil.getTime())) {
        if (now < cooldownUntil.getTime()) return true;
        return false;
      }

      // Fallback: derive cooldown from exit timestamp
      var exitTsRaw = data[i][pc.Exit_Ts];
      var exitTs = new Date(String(exitTsRaw || ''));
      if (!isNaN(exitTs.getTime()) && (now - exitTs.getTime()) < cooldownMs) {
        return true;
      }

      // Most recent STOP found, but no valid time => stop scanning
      return false;
    }
  } catch (e) { /* fallback */ }

  return false;
}

// ── UNIVERSE ───────────────────────────────────────────────────────────────

/**
 * Loads all Top-K instruments from UNIVERSE.
 * Returns array of { sym, marketType, sps }.
 */
function M4__loadTopK_() {
  var data = M4__readAll_(M4_CONST.SHEETS.UNIVERSE);
  var uc = M4_COL.UNIVERSE;
  var topK = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][uc.In_Top_K] === true) {
      topK.push({
        sym:        String(data[i][uc.Symbol]),
        marketType: String(data[i][uc.Market_Type]),
        sps:        parseInt(data[i][uc.SPS_Final]) || 0
      });
    }
  }
  return topK;
}

// ── LEVELS ─────────────────────────────────────────────────────────────────

/**
 * Gets LEVELS data for a symbol (last occurrence = most recent).
 * Returns object or null if not found.
 */
function M4__getLevels_(sym) {
  try {
    var data = M4__readAll_(M4_CONST.SHEETS.LEVELS);
    var lc = M4_COL.LEVELS;
    for (var i = data.length - 1; i >= 1; i--) {
      if (String(data[i][lc.Symbol]) === sym) {
        return {
          res:       parseFloat(data[i][lc.Resistance_Value]) || 0,
          sup:       parseFloat(data[i][lc.Support_Value]) || 0,
          dailyRes:  parseFloat(data[i][lc.Daily_Resistance]) || 0,
          dailySup:  parseFloat(data[i][lc.Daily_Support]) || 0,
          roomRun:   parseFloat(data[i][lc.Room_to_Run_Long_R]) || 0,
          roomFall:  parseFloat(data[i][lc.Room_to_Fall_Short_R]) || 0
        };
      }
    }
  } catch (e) { /* fallback */ }
  return null;
}

// ── INDICATORS ─────────────────────────────────────────────────────────────

/**
 * Gets INDICATORS data for a symbol on 4H timeframe (last occurrence).
 * Returns object or null if not found.
 */
function M4__getIndicators_(sym) {
  try {
    var data = M4__readAll_(M4_CONST.SHEETS.INDICATORS);
    var ic = M4_COL.INDICATORS;
    for (var i = data.length - 1; i >= 1; i--) {
      if (String(data[i][ic.Symbol]) === sym &&
          String(data[i][ic.Timeframe]) === '4H') {
        return {
          atr:        parseFloat(data[i][ic.ATR_14]) || 0,
          atrRatio:   parseFloat(data[i][ic.ATR_Ratio]) || 1,
          sma50Daily: parseFloat(data[i][ic.SMA_50_Daily]) || 0,
          volRatio:   parseFloat(data[i][ic.Volume_Ratio]) || 0,
          rsi:        parseFloat(data[i][ic.RSI_14]) || 50,
          obvSlope20: parseFloat(data[i][ic.OBV_Slope_20]) || 0,
          relPerf:    parseFloat(data[i][ic.Rel_Perf_vs_BTC_7d]) || 0,
          consolHigh: parseInt(data[i][ic.Consolidation_Count_High]) || 0,
          consolLow:  parseInt(data[i][ic.Consolidation_Count_Low]) || 0,
          funding:    parseFloat(data[i][ic.Funding_Rate_Current]) || 0
        };
      }
    }
  } catch (e) { /* fallback */ }
  return null;
}

/**
 * Gets the latest close price for a symbol from INDICATORS (SMA50 proximity check)
 * or from LEVELS data if available.
 * Falls back to DATA_CLEAN if other sources unavailable.
 */
function M4__getLatestClose_(sym) {
  try {
    var data = M4__readAll_(M4_CONST.SHEETS.DATA_CLEAN);
    for (var i = data.length - 1; i >= 1; i--) {
      if (String(data[i][1]) === sym &&     // Column 1 = Symbol
          String(data[i][3]) === '4H' &&    // Column 3 = Timeframe
          data[i][14] !== true) {           // Column 14 = Gap_Flag
        var close = parseFloat(data[i][7]); // Column 7 = Close
        if (isFinite(close) && close > 0) return close;
      }
    }
  } catch (e) { /* fallback */ }
  return null;
}

/**
 * Returns percentage of recent consolidation candles with positive OBV slope.
 * Used for Accumulation/Distribution DQS component.
 */
function M4__getObvPositiveSlopePct_(sym, consolCandles) {
  if (consolCandles <= 0) return 0;

  try {
    var data = M4__readAll_(M4_CONST.SHEETS.INDICATORS);
    var ic = M4_COL.INDICATORS;
    var slopes = [];

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][ic.Symbol]) === sym &&
          String(data[i][ic.Timeframe]) === '4H') {
        var slope = parseFloat(data[i][ic.OBV_Slope_20]) || 0;
        slopes.push(slope);
      }
    }

    if (slopes.length === 0) return 0;

    // Take the last N slopes (N = min of consolCandles and available data)
    var recent = slopes.slice(-Math.min(consolCandles, slopes.length));
    var positiveCount = 0;
    for (var j = 0; j < recent.length; j++) {
      if (recent[j] > 0) positiveCount++;
    }
    return positiveCount / recent.length;
  } catch (e) {
    return 0;
  }
}


function M4__computeDQS_(sym, dir, levels, indicators, marketType, cfg) {
  var isLong = (dir === 'LONG');
  var T = M4_CONST.DQS_THRESH;
  var M = M4_CONST.DQS_MAX;

  // ── 1. Compression (0–25) ───────────────────────────────────────────
  var compression = Math.round(M4__goldilocks_(
    indicators.atrRatio,
    T.COMP_LO,
    cfg.compOptLo,
    cfg.compOptHi,
    cfg.compRejectHi,
    M.COMPRESSION
  ));

  // ── 2. Consolidation Duration (0–10) ────────────────────────────────
  var consolCount = isLong ? indicators.consolHigh : indicators.consolLow;
  var duration = Math.round(
    M4__linear_(consolCount, T.DUR_LO, T.DUR_HI, 0, M.DURATION)
  );

  // ── 3. Volume Surge (0–20) ──────────────────────────────────────────
  var volume = Math.round(M4__goldilocks_(
    indicators.volRatio,
    T.VOL_LO,
    cfg.volOptLo,
    cfg.volOptHi,
    cfg.volClimaxHi,
    M.VOLUME
  ));

  // ── 4. Multi-Timeframe Alignment (10 or 15) ─────────────────────────
  var breaksBoth = false;
  if (isLong && levels.res > 0 && levels.dailyRes > 0) {
    breaksBoth = (levels.res >= levels.dailyRes);
  } else if (!isLong && levels.sup > 0 && levels.dailySup > 0) {
    breaksBoth = (levels.sup <= levels.dailySup);
  }
  var multitf = breaksBoth ? M.MULTITF : M.MULTITF_SOLO;

  // ── 5. Directional Momentum vs BTC (0–15) ───────────────────────────
  var relPerf = indicators.relPerf;
  var momentum = 0;

  if (isLong) {
    if (relPerf >= T.MOM_HI) {
      momentum = M.MOMENTUM;
    } else if (relPerf > -0.01) {
      momentum = Math.round(
        M4__linear_(relPerf + 0.01, 0, T.MOM_HI + 0.01, 0, M.MOMENTUM)
      );
    }
  } else {
    if (relPerf <= -T.MOM_HI) {
      momentum = M.MOMENTUM;
    } else if (relPerf < 0.01) {
      momentum = Math.round(
        M4__linear_(0.01 - relPerf, 0, T.MOM_HI + 0.01, 0, M.MOMENTUM)
      );
    }
  }

  // ── 6. Accumulation / Distribution (0–5) ────────────────────────────
  var obvPosPct = M4__getObvPositiveSlopePct_(sym, consolCount);
  var dirPct = isLong ? obvPosPct : (1 - obvPosPct);
  var accumulation = 0;

  if (dirPct >= T.ACC_HI_PCT) {
    accumulation = M.ACCUMULATION;
  } else if (dirPct >= T.ACC_MID_PCT) {
    accumulation = Math.round(M.ACCUMULATION / 2);
  }

  var rawSum = compression + duration + volume + multitf + momentum + accumulation;

  // ── 7. Funding penalty (PERP only) ───────────────────────────────────
  var fundAdj = 0;
  if (marketType === 'PERP') {
    var dailyFundRate = indicators.funding * 3;
    if (isLong && dailyFundRate > cfg.maxFundPct) {
      fundAdj = M4_CONST.FUNDING_PENALTY_PTS;
    } else if (!isLong && dailyFundRate < -cfg.maxFundPct) {
      fundAdj = M4_CONST.FUNDING_PENALTY_PTS;
    }
  }

  var total = Math.max(0, rawSum + fundAdj);

  var grade = 'SKIP';
  var gradeKeys = ['PREMIUM', 'HIGH', 'STANDARD', 'SKIP'];
  for (var g = 0; g < gradeKeys.length; g++) {
    var gr = M4_CONST.GRADES[gradeKeys[g]];
    if (total >= gr.min && total <= gr.max) {
      grade = gr.name;
      break;
    }
  }

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


/**
 * MODULE 4 — Signal Engine + DQS Scoring
 * M4_Engine.gs
 *
 * Main orchestration: loads state, evaluates gates, scores DQS,
 * enforces regime rules and concurrency cap, writes to SIGNALS.
 *
 * Public API:
 *   M4_runSignalEngine()  — full evaluation cycle
 *   M4_testRunAll()       — validation test suite
 *
 * @version 3.2.1
 */

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC FUNCTION 1: Run full signal evaluation cycle
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Runs the Strategy signal engine using the new confirmation thesis.
 *
 * Baseline strategy:
 * - BTC / ETH only
 * - RISK-ON only
 * - LONG only
 * - breakout -> retest -> confirmation
 * - DQS as hard quality gate
 *
 * Writes only confirmed rows to SIGNALS.
 */
function M4_runSignalEngine() {
  console.log('[M4] ═══════════════════════════════════════');
  console.log('[M4] Signal Engine Cycle Starting (v' + M4_CONST.VERSION + ')');
  console.log('[M4] ═══════════════════════════════════════');

  try {
    var ts = M4__nowIso_();
    var regime = M4__getRegime_();
    var topK = M4__loadTopK_();
    var openCount = M4__getOpenPositionCount_();
    var baseCfg = M4__loadConfig_();
    var strategyCfg = M4__loadStrategyConfig_();

    console.log('[M4] Regime: ' + regime + ' | Top-K: ' + topK.length +
                ' | Open: ' + openCount + '/' + baseCfg.maxConcurrent);

    var sc = M4_COL.SIGNALS;
    var allSignals = [];

    // v2 baseline: only proceed in RISK-ON
    if (strategyCfg.riskOnOnly && regime !== 'RISK-ON' && regime !== 'RISK-ON_LONG') {
      console.log('[M4] Strategy gated off: regime is not RISK-ON.');
      console.log('[M4] ═══════════════════════════════════════');
      console.log('[M4] Rows Written:      0');
      console.log('[M4] CONFIRMED:         0');
      console.log('[M4] Capacity-Limited:  0');
      console.log('[M4] Rejected/Skipped:  0');
      console.log('[M4] ═══════════════════════════════════════');
      return;
    }

    // Evaluate only eligible symbols under new thesis
    for (var i = 0; i < topK.length; i++) {
      var sym = topK[i].sym;
      var marketType = topK[i].marketType;
      var sps = topK[i].sps;

      if (!M4__isEligibleSymbol_(sym, strategyCfg)) {
        continue;
      }

      var levels = M4__getLevels_(sym);
      var indicators = M4__getIndicators_(sym);
      if (!levels || !indicators) {
        console.log('[M4] SKIP ' + sym + ': missing levels or indicators');
        continue;
      }

      var candles = M4__getRecentCandlesForSymbol_(sym, Math.max(8, strategyCfg.retestWindowCandles + 4));
      if (!candles || candles.length < 3) {
        console.log('[M4] SKIP ' + sym + ': insufficient recent candles');
        continue;
      }

      var row = M4__buildConfirmedSignalRow_(
        sym,
        candles,
        levels,
        indicators,
        { regime: regime },
        strategyCfg,
        baseCfg
      );

      if (row) {
        row[sc.Timestamp] = ts;                 // stamp cycle time
        row[sc.Market_Type] = marketType || 'SPOT_MARGIN';
        row[sc.SPS_At_Signal] = sps;
        allSignals.push(row);
      }
    }

    // Separate confirmed rows
    var confirmed = [];
    var notConfirmed = []; // retained for future expansion if you later log invalidated setups

    for (var j = 0; j < allSignals.length; j++) {
      if (allSignals[j][sc.Final_Signal_State] === 'CONFIRMED') {
        confirmed.push(allSignals[j]);
      } else {
        notConfirmed.push(allSignals[j]);
      }
    }

    // Priority sort confirmed by SPS descending
    confirmed.sort(function(a, b) {
      return (b[sc.SPS_At_Signal] || 0) - (a[sc.SPS_At_Signal] || 0);
    });

    // Apply concurrency cap
    var availableSlots = Math.max(0, baseCfg.maxConcurrent - openCount);
    var finalConfirmed = [];
    var capacityLimited = [];

    for (var k = 0; k < confirmed.length; k++) {
      if (availableSlots > 0) {
        finalConfirmed.push(confirmed[k]);
        availableSlots--;
      } else {
        confirmed[k][sc.Final_Signal_State] = 'SKIPPED';
        confirmed[k][sc.Final_Rejection_Reason] = 'Capacity limit (SPS rank ' + (k + 1) + ')';
        capacityLimited.push(confirmed[k]);
      }
    }

    var writeRows = finalConfirmed.concat(capacityLimited).concat(notConfirmed);
    if (writeRows.length > 0) {
      M4__appendRows_(M4_CONST.SHEETS.SIGNALS, writeRows);
    }

    console.log('[M4] ═══════════════════════════════════════');
    console.log('[M4] Rows Written:      ' + writeRows.length);
    console.log('[M4] CONFIRMED:         ' + finalConfirmed.length);
    console.log('[M4] Capacity-Limited:  ' + capacityLimited.length);
    console.log('[M4] Rejected/Skipped:  ' + notConfirmed.length);
    console.log('[M4] ═══════════════════════════════════════');

  } catch (e) {
    console.error('[M4] FATAL: ' + e.message);
    console.error('[M4] Stack: ' + e.stack);
  }
}



/**
 * Returns the most recent completed non-gap 4H candles for a symbol.
 * Output format: [{ ts, o, h, l, c, v }]
 */
function M4__getRecentCandlesForSymbol_(sym, n) {
  try {
    var data = M4__readAll_(M4_CONST.SHEETS.DATA_CLEAN);
    if (!data || data.length < 2) return [];

    var out = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];

      var rowSym = String(row[1] || '').trim();   // Symbol
      var tf     = String(row[3] || '').trim();   // Timeframe
      var gap    = row[14];                       // Gap_Flag

      if (rowSym !== sym) continue;
      if (tf !== '4H') continue;
      if (gap === true || String(gap).toUpperCase() === 'TRUE') continue;

      var ts = row[0];
      var o  = parseFloat(row[4]);
      var h  = parseFloat(row[5]);
      var l  = parseFloat(row[6]);
      var c  = parseFloat(row[7]);
      var v  = parseFloat(row[8]);

      if (!isFinite(o) || !isFinite(h) || !isFinite(l) || !isFinite(c)) continue;

      out.push({
        ts: ts,
        o: o,
        h: h,
        l: l,
        c: c,
        v: isFinite(v) ? v : 0
      });
    }

    if (out.length <= n) return out;
    return out.slice(out.length - n);
  } catch (e) {
    return [];
  }
}



// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC FUNCTION 2: Validation test suite
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Validates schema, math helpers, Goldilocks DQS scoring, and adaptive breakout buffer.
 * Run this after installation to confirm correctness.
 */
function M4_testRunAll() {
  console.log('╔═════════════════════════════════════════════╗');
  console.log('║  MODULE 4 TEST SUITE v' + M4_CONST.VERSION + '               ║');
  console.log('╚═════════════════════════════════════════════╝');

  var results = [];
  function assert_(name, cond) {
    results.push({ name: name, pass: !!cond });
  }

  // ── 1. Schema Validation ─────────────────────────────────────────────
  try {
    var sh = M4__getSheet_(M4_CONST.SHEETS.SIGNALS);
    var hr = sh.getRange(1, 1, 1, 27).getValues()[0];
    assert_('Schema: SIGNALS has 27 columns', hr.length === 27);
    assert_('Schema: Col 0 = Signal_ID', String(hr[0]).trim() === 'Signal_ID');
    assert_('Schema: Col 13 = Gate_All_Passed', String(hr[13]).trim() === 'Gate_All_Passed');
    assert_('Schema: Col 22 = DQS_Total', String(hr[22]).trim() === 'DQS_Total');
    assert_('Schema: Col 26 = Final_Rejection_Reason', String(hr[26]).trim() === 'Final_Rejection_Reason');
  } catch (e) {
    assert_('Schema: Sheet access failed (' + e.message + ')', false);
  }

  // ── 2. Linear Interpolation Math ─────────────────────────────────────
  var l1 = M4__linear_(0.75, 0.5, 1.0, 25, 0);
  assert_('Math: Interp midpoint (0.75 in [0.5,1.0] → [25,0]) = 12.5',
    Math.abs(l1 - 12.5) < 0.01);

  var l2 = M4__linear_(5.0, 1.5, 3.0, 0, 20);
  assert_('Math: Interp ceiling (5.0 >= 3.0 → 20)', Math.abs(l2 - 20) < 0.01);

  var l3 = M4__linear_(0.0, 1.5, 3.0, 0, 20);
  assert_('Math: Interp floor (0.0 <= 1.5 → 0)', Math.abs(l3 - 0) < 0.01);

  // ── 3. Goldilocks Helper ─────────────────────────────────────────────
  var g1 = M4__goldilocks_(0.40, 0.50, 0.55, 0.75, 1.05, 25);
  var g2 = M4__goldilocks_(0.60, 0.50, 0.55, 0.75, 1.05, 25);
  var g3 = M4__goldilocks_(1.10, 0.50, 0.55, 0.75, 1.05, 25);

  assert_('Goldilocks: Below floor → 0', g1 === 0);
  assert_('Goldilocks: In optimal zone → max', g2 === 25);
  assert_('Goldilocks: Above ceiling → 0', g3 === 0);

  // ── 4. Adaptive Breakout Buffer ──────────────────────────────────────
  var mockCfg = {
    maxFundPct: 0.003,
    volThresh: 1.5,
    cooldownCandles: 12,

    compOptLo: 0.55,
    compOptHi: 0.75,
    compRejectHi: 1.05,

    volOptLo: 1.8,
    volOptHi: 2.6,
    volClimaxHi: 4.0,

    breakoutBufferAdaptive: true,
    breakoutBufferAtrMin: 0.10,
    breakoutBufferAtrMax: 0.35
  };

  var lowVolBuf = M4__adaptiveBreakoutBufferAtr_({ atrRatio: 0.5 }, mockCfg);
  var highVolBuf = M4__adaptiveBreakoutBufferAtr_({ atrRatio: 1.5 }, mockCfg);
  var staticBuf = M4__adaptiveBreakoutBufferAtr_({ atrRatio: 1.0 }, {
    breakoutBufferAdaptive: false,
    breakoutBufferAtrMin: 0.10,
    breakoutBufferAtrMax: 0.35
  });

  assert_('Adaptive buffer: low ATR ratio near min', Math.abs(lowVolBuf - 0.10) < 0.001);
  assert_('Adaptive buffer: high ATR ratio near max', Math.abs(highVolBuf - 0.35) < 0.001);
  assert_('Adaptive buffer: static mode returns const', Math.abs(staticBuf - M4_CONST.GATE.BREAKOUT_BUFFER_ATR) < 0.001);

  // ── 5. DQS Component Scoring (Goldilocks mock data) ─────────────────
  var mockLevels = {
    res: 100,
    sup: 90,
    dailyRes: 95,
    dailySup: 85,
    roomRun: 5,
    roomFall: 4
  };

  var mockInd = {
    atr: 1.0,
    atrRatio: 0.60,      // inside optimal compression zone
    sma50Daily: 95,
    volRatio: 2.20,      // inside optimal volume zone
    rsi: 50,
    obvSlope20: 1.0,
    relPerf: 0.06,
    consolHigh: 40,
    consolLow: 20,
    funding: 0.0
  };

  var dqs = M4__computeDQS_('TEST/USDT', 'LONG', mockLevels, mockInd, 'SPOT_MARGIN', mockCfg);

  assert_('DQS: Compression max in optimal zone', dqs.compression === 25);
  assert_('DQS: Duration = 20 (consolHigh 40)', dqs.duration === 20);
  assert_('DQS: Volume max in optimal zone', dqs.volume === 20);
  assert_('DQS: MultiTF = 15 (res >= dailyRes)', dqs.multitf === 15);
  assert_('DQS: Momentum = 10 (relPerf 0.06)', dqs.momentum === 10);
  assert_('DQS: No funding penalty (SPOT_MARGIN)', dqs.fundAdj === 0);
  assert_('DQS: Grade is HIGH or PREMIUM under strong fixture', dqs.grade === 'HIGH' || dqs.grade === 'PREMIUM');

  // ── 6. DQS Funding Penalty ───────────────────────────────────────────
  var perpInd = {};
  for (var key in mockInd) { perpInd[key] = mockInd[key]; }
  perpInd.funding = 0.002; // daily = 0.006 > maxFundPct

  var dqsPerp = M4__computeDQS_('TEST/USDT', 'LONG', mockLevels, perpInd, 'PERP', mockCfg);
  assert_('DQS: Funding penalty -20 on PERP with high funding', dqsPerp.fundAdj === -20);
  assert_('DQS: Total reduced by penalty', dqsPerp.total === Math.max(0, dqs.total - 20));

  // ── 7. Constants Integrity ───────────────────────────────────────────
  assert_('Const: DQS max sum = 100',
    M4_CONST.DQS_MAX.COMPRESSION + M4_CONST.DQS_MAX.DURATION +
    M4_CONST.DQS_MAX.VOLUME + M4_CONST.DQS_MAX.MULTITF +
    M4_CONST.DQS_MAX.MOMENTUM + M4_CONST.DQS_MAX.ACCUMULATION === 100);
  assert_('Const: SIGNALS column count = 27',
    M4_COL.SIGNALS.Final_Rejection_Reason === 26);

  // ── Report ───────────────────────────────────────────────────────────
  var pass = 0, fail = 0;
  for (var r = 0; r < results.length; r++) {
    if (results[r].pass) {
      pass++;
      console.log('  ✓ ' + results[r].name);
    } else {
      fail++;
      console.log('  ✗ ' + results[r].name);
    }
  }

  console.log('─────────────────────────────────────────────');
  if (fail === 0) {
    console.log('  ✅ ALL TESTS PASSED (' + pass + '/' + pass + ')');
  } else {
    console.log('  ❌ ' + fail + ' FAILED (' + pass + ' passed)');
  }
}


// ═══════════════════════════════════════════════════════════════════════════
// PRIVATE: Build a complete signal row (27-element array)
// ═══════════════════════════════════════════════════════════════════════════



/**
 * Goldilocks scorer:
 * - 0 below hard floor
 * - ramps up into optimal zone
 * - max score inside optimal zone
 * - fades out toward hard ceiling
 * - 0 beyond hard ceiling
 */
function M4__goldilocks_(value, floorLo, optLo, optHi, ceilHi, maxPts) {
  if (!isFinite(value) || !isFinite(maxPts) || maxPts <= 0) return 0;

  if (value <= floorLo) return 0;
  if (value >= ceilHi) return 0;

  if (value >= optLo && value <= optHi) return maxPts;

  if (value > floorLo && value < optLo) {
    return M4__linear_(value, floorLo, optLo, 0, maxPts);
  }

  return M4__linear_(value, optHi, ceilHi, maxPts, 0);
}


/**
 * Adaptive breakout buffer in ATR multiples.
 * Lower ATR ratio → smaller required buffer.
 * Higher ATR ratio → larger required buffer.
 */
function M4__adaptiveBreakoutBufferAtr_(indicators, cfg) {
  var minAtr = cfg.breakoutBufferAtrMin;
  var maxAtr = cfg.breakoutBufferAtrMax;

  if (!cfg.breakoutBufferAdaptive) {
    return M4_CONST.GATE.BREAKOUT_BUFFER_ATR;
  }

  var atrRatio = isFinite(indicators.atrRatio) ? indicators.atrRatio : 1.0;

  // Map ATR ratio roughly from [0.5, 1.5] -> [minAtr, maxAtr]
  return M4__linear_(atrRatio, 0.5, 1.5, minAtr, maxAtr);
}


/**
 * Linear interpolation: maps value in [minVal, maxVal] → [minPts, maxPts].
 * Clamps output to the [minPts, maxPts] range (handles either direction).
 */
function M4__linear_(value, minVal, maxVal, minPts, maxPts) {
  if (minVal === maxVal) return minPts;
  if (value <= minVal) return minPts;
  if (value >= maxVal) return maxPts;
  var pct = (value - minVal) / (maxVal - minVal);
  return minPts + pct * (maxPts - minPts);
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// ── CONFIG Readers
// Minimal safe patch: reads CONFIG sheet, then overlays M4_CFG_OVERRIDE from Document Properties.

var M4__cfgCache_ = null;

function M4__clearCfgCache_() {
  M4__cfgCache_ = null;
}

function M4__cfgLoadMap_() {
  if (M4__cfgCache_) return M4__cfgCache_;

  var out = {};
  try {
    var data = M4__readAll_(M4_CONST.SHEETS.CONFIG);
    for (var i = 1; i < data.length; i++) {
      var key = String(data[i][M4_COL.CONFIG.Parameter] || '').trim();
      if (!key) continue;
      out[key] = data[i][M4_COL.CONFIG.Value];
    }
  } catch (e) {
    // fail soft
  }

  try {
    var props = null;
    try {
      props = PropertiesService.getDocumentProperties();
    } catch (e2) {
      props = PropertiesService.getScriptProperties();
    }

    var raw = props.getProperty('M4_CFG_OVERRIDE');
    if (raw) {
      var ov = JSON.parse(raw);
      if (ov) {
        for (var k in ov) {
          if (ov.hasOwnProperty(k)) out[k] = ov[k];
        }
      }
    }
  } catch (e3) {
    // fail soft
  }

  M4__cfgCache_ = out;
  return out;
}

/**
 * Gets a numeric CONFIG value with a default fallback.
 */
function M4__cfgNum_(key, defaultVal) {
  try {
    var cfg = M4__cfgLoadMap_();
    if (cfg.hasOwnProperty(key)) {
      var n = parseFloat(cfg[key]);
      return isFinite(n) ? n : defaultVal;
    }
  } catch (e) {}
  return defaultVal;
}

/**
 * Gets a boolean CONFIG value with a default fallback.
 */
function M4__cfgBool_(key, defaultVal) {
  try {
    var cfg = M4__cfgLoadMap_();
    if (cfg.hasOwnProperty(key)) {
      var v = cfg[key];
      if (v === true) return true;
      if (v === false) return false;
      if (typeof v === 'number') return v !== 0;

      var s = String(v === null || v === undefined ? '' : v).trim().toUpperCase();
      if (s === 'TRUE' || s === 'YES' || s === 'Y' || s === '1' || s === 'ON') return true;
      if (s === 'FALSE' || s === 'NO' || s === 'N' || s === '0' || s === 'OFF' || s === '') return false;
    }
  } catch (e) {}
  return !!defaultVal;
}

/**
 * Gets a string CONFIG value with a default fallback.
 */
function M4__cfgStr_(key, defaultVal) {
  try {
    var cfg = M4__cfgLoadMap_();
    if (cfg.hasOwnProperty(key)) {
      var s = String(cfg[key] === null || cfg[key] === undefined ? '' : cfg[key]).trim();
      return s !== '' ? s : defaultVal;
    }
  } catch (e) {}
  return defaultVal;
}



/**
 * Loads strategy-thesis config for the current M4 engine.
 *
 * Baseline thesis:
 * - majors only
 * - RISK-ON only
 * - LONG only
 * - breakout -> retest -> confirmation
 */
function M4__loadStrategyConfig_() {
  return {
    strategyVersion: M4__cfgStr_('Strategy_Version', 'V2').toUpperCase(),
    universeMode: M4__cfgStr_('Universe_Mode', 'MAJORS_ONLY').toUpperCase(),
    leverageMode: M4__cfgStr_('Leverage_Mode', 'FIXED_1X').toUpperCase(),
    correlationFilterEnabled: M4__cfgBool_('Correlation_Filter_Enabled', false),

    dqsGate: M4__cfgNum_('DQS_Gate_V2', 45),

    breakoutBufferAtr: M4__cfgNum_('V2_Breakout_Buffer_ATR', 0.05),
    retestWindowCandles: Math.max(1, M4__cfgNum_('V2_Retest_Window_Candles', 6)),
    retestMaxDeviationAtr: M4__cfgNum_('V2_Retest_Max_Deviation_ATR', 0.50),
    confirmationBodyMinFrac: M4__cfgNum_('V2_Confirmation_Body_Min_Frac', 0.35),

    riskOnOnly: M4__cfgBool_('V2_Risk_On_Only', true),
    longOnly: M4__cfgBool_('V2_Long_Only', true)
  };
}


function M4__isEligibleSymbol_(sym, cfg) {
  if (!sym) return false;

  var s = String(sym).toUpperCase();
  var mode = String((cfg && cfg.universeMode) || 'ALL').toUpperCase();

  if (mode === 'MAJORS_ONLY') {
    return (
      s.indexOf('BTC') !== -1 ||
      s.indexOf('ETH') !== -1 ||
      s.indexOf('SOL') !== -1 ||
      s.indexOf('XRP') !== -1
    );
  }

  // ALL / EXPANDED / anything else => allow all symbols
  return true;
}


/**
 * Evaluates the current setup state for the confirmation thesis.
 *
 * Canonical setup flow:
 * - use latest breakout in the recent window
 * - require a valid retest that touches/holds the level zone
 * - require a bullish confirmation candle that closes above level + breakout buffer
 *
 * States:
 * - IDLE
 * - BREAKOUT_DETECTED
 * - RETEST_PENDING
 * - CONFIRMED
 * - INVALIDATED
 */
function M4__evaluateSetupState_(sym, candles, levels, indicators, regimeObj, cfg) {
  var out = {
    state: 'IDLE',
    direction: 'LONG',
    reason: '',
    breakoutIdx: -1,
    retestIdx: -1,
    confirmIdx: -1,
    entryPrice: 0,
    adaptive: null
  };

  if (!candles || candles.length < 4) {
    out.reason = 'Not enough candles';
    return out;
  }

  if (!levels || !isFinite(levels.res) || levels.res <= 0) {
    out.state = 'INVALIDATED';
    out.reason = 'No valid resistance level';
    return out;
  }

  if (!indicators || !isFinite(indicators.atr) || indicators.atr <= 0) {
    out.state = 'INVALIDATED';
    out.reason = 'Invalid ATR';
    return out;
  }

  var regime = regimeObj && regimeObj.regime ? String(regimeObj.regime).toUpperCase() : '';
  if (cfg.riskOnOnly && regime !== 'RISK-ON' && regime !== 'RISK-ON_LONG') {
    out.state = 'INVALIDATED';
    out.reason = 'Regime not RISK-ON';
    return out;
  }

  var adaptive = M4__getAdaptiveStrategyParams_(indicators, cfg);
  out.adaptive = adaptive;

  var level = levels.res;
  var atr = indicators.atr;
  var breakoutBufferPx = adaptive.breakoutBufferAtr * atr;
  var retestMaxDevPx = adaptive.retestMaxDeviationAtr * atr;
  var confirmBodyMin = adaptive.confirmationBodyMinFrac;

  // 1) Find latest valid breakout close above level + breakout buffer
  var breakoutIdx = -1;
  for (var i = candles.length - 2; i >= 0; i--) {
    if (candles[i].c > level + breakoutBufferPx) {
      breakoutIdx = i;
      break;
    }
  }

  if (breakoutIdx < 0) {
    out.state = 'IDLE';
    out.reason = 'No breakout detected';
    return out;
  }

  out.breakoutIdx = breakoutIdx;
  out.state = 'BREAKOUT_DETECTED';

  // 2) Search for retest after breakout, within adaptive window
  var retestIdx = -1;
  var retestEnd = Math.min(candles.length - 2, breakoutIdx + adaptive.retestWindowCandles);

  for (var j = breakoutIdx + 1; j <= retestEnd; j++) {
    var r = candles[j];

    var touchedZone = (r.l <= (level + retestMaxDevPx));
    var heldZone = (r.c >= (level - retestMaxDevPx));
    var notTooDeep = (r.l >= (level - 1.25 * retestMaxDevPx));

    if (touchedZone && heldZone && notTooDeep) {
      retestIdx = j;
      break;
    }

    if (r.c < level - retestMaxDevPx) {
      out.state = 'INVALIDATED';
      out.reason = 'Retest failed below level';
      return out;
    }
  }

  if (retestIdx < 0) {
    out.state = 'BREAKOUT_DETECTED';
    out.reason = 'Breakout found; no valid retest in window';
    return out;
  }

  out.retestIdx = retestIdx;
  out.state = 'RETEST_PENDING';

  // 3) Confirmation must happen soon after retest
  var confirmStart = retestIdx + 1;
  var confirmEnd = Math.min(candles.length - 1, retestIdx + adaptive.retestWindowCandles);

  for (var k = confirmStart; k <= confirmEnd; k++) {
    var x = candles[k];
    var range = Math.max(0.00000001, x.h - x.l);
    var bodyFrac = Math.abs(x.c - x.o) / range;

    if (x.c < level - retestMaxDevPx) {
      out.state = 'INVALIDATED';
      out.reason = 'Confirmation failed below level';
      return out;
    }

    var bullishCandle = (x.c > x.o);
    var strongClose = (x.c > level + breakoutBufferPx);
    var decentBody = (bodyFrac >= confirmBodyMin);

    if (bullishCandle && strongClose && decentBody) {
      out.confirmIdx = k;
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


/**
 * Builds a SIGNALS row for a confirmed strategy setup.
 * Returns null if setup is not confirmed or fails DQS / relPerf gate.
 */
function M4__buildConfirmedSignalRow_(sym, candles, levels, indicators, regimeObj, strategyCfg, baseCfg, marketType, sps, ts) {
  if (!M4__isEligibleSymbol_(sym, strategyCfg)) return null;

  var stateRes = M4__evaluateSetupState_(sym, candles, levels, indicators, regimeObj, strategyCfg);
  if (stateRes.state !== 'CONFIRMED') return null;

  var latest = candles[stateRes.confirmIdx];
  var dir = 'LONG';

  var dqs = M4__computeDQS_(sym, dir, levels, indicators, marketType || 'SPOT_MARGIN', baseCfg);
  if (!dqs || !isFinite(dqs.total) || dqs.total < strategyCfg.dqsGate) {
    return null;
  }

  var sc = M4_COL.SIGNALS;
  var row = new Array(27).fill('');

  row[sc.Signal_ID]              = M4__generateSignalId_(sym, dir);
  row[sc.Timestamp]              = ts || latest.ts || M4__nowIso_();
  row[sc.Symbol]                 = sym;
  row[sc.Market_Type]            = marketType || 'SPOT_MARGIN';
  row[sc.Direction]              = dir;
  row[sc.Level_Value]            = levels.res;
  row[sc.Close_Price]            = latest.c;
  row[sc.ATR_14]                 = indicators.atr;
  row[sc.Volume_Ratio]           = indicators.volRatio;
  row[sc.RSI_14]                 = indicators.rsi;
  row[sc.Trend_Aligned]          = true;
  row[sc.Room_To_Run_R]          = levels.roomRun || '';
  row[sc.SPS_At_Signal]          = sps || '';
  row[sc.Gate_All_Passed]        = true;
  row[sc.Gate_Rejection_Reasons] = '';
  row[sc.DQS_Compression]        = dqs.compression;
  row[sc.DQS_Duration]           = dqs.duration;
  row[sc.DQS_Volume]             = dqs.volume;
  row[sc.DQS_MultiTF]            = dqs.multitf;
  row[sc.DQS_Momentum]           = dqs.momentum;
  row[sc.DQS_Accumulation]       = dqs.accumulation;
  row[sc.DQS_Funding_Adjustment] = dqs.fundAdj;
  row[sc.DQS_Total]              = dqs.total;
  row[sc.DQS_Grade]              = dqs.grade;
  row[sc.Market_Regime]          = regimeObj.regime || 'RISK-ON';
  row[sc.Final_Signal_State]     = 'CONFIRMED';
  row[sc.Final_Rejection_Reason] = '';

  return row;
}


/**
 * Builds adaptive strategy thresholds from ATR ratio.
 * Lower ATR ratio = tighter / faster setup requirements.
 * Higher ATR ratio = wider / slower setup requirements.
 *
 * Uses one canonical adaptive path so live and research can be aligned.
 */
function M4__getAdaptiveStrategyParams_(indicators, cfg) {
  var atrRatio = isFinite(indicators.atrRatio) ? indicators.atrRatio : 1.0;

  var breakoutBufferAtr;
  if (cfg && cfg.breakoutBufferAdaptive) {
    breakoutBufferAtr = M4__linear_(
      atrRatio,
      0.5,
      1.5,
      cfg.breakoutBufferAtrMin,
      cfg.breakoutBufferAtrMax
    );
  } else if (cfg) {
    breakoutBufferAtr = M4_CONST.GATE.BREAKOUT_BUFFER_ATR;
  } else {
    breakoutBufferAtr = M4__linear_(atrRatio, 0.5, 1.5, 0.05, 0.30);
  }

  return {
    breakoutBufferAtr: breakoutBufferAtr,
    retestWindowCandles: Math.round(M4__linear_(atrRatio, 0.5, 1.5, 3, 8)),
    retestMaxDeviationAtr: M4__linear_(atrRatio, 0.5, 1.5, 0.25, 0.70),
    confirmationBodyMinFrac: M4__linear_(atrRatio, 0.5, 1.5, 0.30, 0.60)
  };
}



/**
 * MODULE 4 — Diagnostic
 *
 * Read-only diagnostic for the M4 signal engine.
 * Explains why latest SIGNALS batch contains no CONFIRMED rows.
 *
 * Run:
 *   M4_diagSignalPipeline()
 */
function M4_diagSignalPipeline() {
  console.log('[M4][DIAG] ═══════════════════════════════════════');
  console.log('[M4][DIAG] Signal Pipeline Diagnostic Starting');
  console.log('[M4][DIAG] ═══════════════════════════════════════');

  try {
    var ts = M4__nowIso_();
    var regime = M4__getRegime_();
    var topK = M4__loadTopK_();
    var openCount = M4__getOpenPositionCount_();
    var baseCfg = M4__loadConfig_();
    var strategyCfg = M4__loadStrategyConfig_();

    console.log('[M4][DIAG] Now=' + ts +
      ' | Regime=' + regime +
      ' | TopK=' + topK.length +
      ' | OpenPositions=' + openCount +
      ' | MaxConcurrent=' + baseCfg.maxConcurrent +
      ' | DQSGate=' + strategyCfg.dqsGate +
      ' | RiskOnOnly=' + strategyCfg.riskOnOnly +
      ' | LongOnly=' + strategyCfg.longOnly +
      ' | UniverseMode=' + strategyCfg.universeMode);

    var states = {
      ELIGIBLE: 0,
      INELIGIBLE: 0,
      MISSING_LEVELS: 0,
      MISSING_INDICATORS: 0,
      INSUFFICIENT_CANDLES: 0,
      IDLE: 0,
      BREAKOUT_DETECTED: 0,
      RETEST_PENDING: 0,
      INVALIDATED: 0,
      CONFIRMED_PRE_DQS: 0,
      REJECTED_DQS: 0,
      BUILT_CONFIRMED_ROW: 0
    };

    var samples = {
      MISSING_LEVELS: [],
      MISSING_INDICATORS: [],
      INSUFFICIENT_CANDLES: [],
      IDLE: [],
      BREAKOUT_DETECTED: [],
      RETEST_PENDING: [],
      INVALIDATED: [],
      CONFIRMED_PRE_DQS: [],
      REJECTED_DQS: [],
      BUILT_CONFIRMED_ROW: []
    };

    function pushSample_(bucket, msg) {
      if (samples[bucket] && samples[bucket].length < 10) {
        samples[bucket].push(msg);
      }
    }

    if (strategyCfg.riskOnOnly && regime !== 'RISK-ON' && regime !== 'RISK-ON_LONG') {
      console.log('[M4][DIAG] HARD GATE: Strategy is disabled because regime is not RISK-ON.');
      console.log('[M4][DIAG] ═══════════════════════════════════════');
      return;
    }

    for (var i = 0; i < topK.length; i++) {
      var sym = topK[i].sym;
      var marketType = topK[i].marketType;
      var sps = topK[i].sps;

      if (!M4__isEligibleSymbol_(sym, strategyCfg)) {
        states.INELIGIBLE++;
        continue;
      }
      states.ELIGIBLE++;

      var levels = M4__getLevels_(sym);
      if (!levels) {
        states.MISSING_LEVELS++;
        pushSample_('MISSING_LEVELS', 'sym=' + sym + ' sps=' + sps);
        continue;
      }

      var indicators = M4__getIndicators_(sym);
      if (!indicators) {
        states.MISSING_INDICATORS++;
        pushSample_('MISSING_INDICATORS', 'sym=' + sym + ' sps=' + sps);
        continue;
      }

      var candles = M4__getRecentCandlesForSymbol_(sym, Math.max(8, strategyCfg.retestWindowCandles + 4));
      if (!candles || candles.length < 3) {
        states.INSUFFICIENT_CANDLES++;
        pushSample_('INSUFFICIENT_CANDLES', 'sym=' + sym + ' candles=' + (candles ? candles.length : 0));
        continue;
      }

      var stateRes = M4__evaluateSetupState_(
        sym,
        candles,
        levels,
        indicators,
        { regime: regime },
        strategyCfg
      );

      var adaptive = stateRes && stateRes.adaptive ? stateRes.adaptive : null;
      var adaptiveStr = adaptive
        ? ('buf=' + adaptive.breakoutBufferAtr +
           ' win=' + adaptive.retestWindowCandles +
           ' dev=' + adaptive.retestMaxDeviationAtr +
           ' body=' + adaptive.confirmationBodyMinFrac)
        : 'adaptive=n/a';

      var baseMsg =
        'sym=' + sym +
        ' sps=' + sps +
        ' state=' + stateRes.state +
        ' reason=' + stateRes.reason +
        ' breakoutIdx=' + stateRes.breakoutIdx +
        ' retestIdx=' + stateRes.retestIdx +
        ' confirmIdx=' + stateRes.confirmIdx +
        ' atr=' + indicators.atr +
        ' atrRatio=' + indicators.atrRatio +
        ' volRatio=' + indicators.volRatio +
        ' rsi=' + indicators.rsi +
        ' level=' + levels.res +
        ' latestClose=' + candles[candles.length - 1].c +
        ' ' + adaptiveStr;

      if (stateRes.state === 'IDLE') {
        states.IDLE++;
        pushSample_('IDLE', baseMsg);
        continue;
      }

      if (stateRes.state === 'BREAKOUT_DETECTED') {
        states.BREAKOUT_DETECTED++;
        pushSample_('BREAKOUT_DETECTED', baseMsg);
        continue;
      }

      if (stateRes.state === 'RETEST_PENDING') {
        states.RETEST_PENDING++;
        pushSample_('RETEST_PENDING', baseMsg);
        continue;
      }

      if (stateRes.state === 'INVALIDATED') {
        states.INVALIDATED++;
        pushSample_('INVALIDATED', baseMsg);
        continue;
      }

      if (stateRes.state === 'CONFIRMED') {
        states.CONFIRMED_PRE_DQS++;

        var dqs = M4__computeDQS_(sym, 'LONG', levels, indicators, marketType || 'SPOT_MARGIN', baseCfg);
        var dqsMsg = baseMsg +
          ' dqsTotal=' + (dqs ? dqs.total : 'n/a') +
          ' dqsGrade=' + (dqs ? dqs.grade : 'n/a');

        pushSample_('CONFIRMED_PRE_DQS', dqsMsg);

        if (!dqs || !isFinite(dqs.total) || dqs.total < strategyCfg.dqsGate) {
          states.REJECTED_DQS++;
          pushSample_('REJECTED_DQS', dqsMsg);
          continue;
        }

        var row = M4__buildConfirmedSignalRow_(
          sym,
          candles,
          levels,
          indicators,
          { regime: regime },
          strategyCfg,
          baseCfg,
          marketType,
          sps,
          ts
        );

        if (row) {
          states.BUILT_CONFIRMED_ROW++;
          pushSample_(
            'BUILT_CONFIRMED_ROW',
            dqsMsg + ' signalId=' + row[M4_COL.SIGNALS.Signal_ID]
          );
        } else {
          states.REJECTED_DQS++;
          pushSample_('REJECTED_DQS', dqsMsg + ' rowBuildReturnedNull=true');
        }
      }
    }

    console.log('[M4][DIAG] ── State counts ──────────────────────────');
    console.log('[M4][DIAG] ELIGIBLE=' + states.ELIGIBLE);
    console.log('[M4][DIAG] INELIGIBLE=' + states.INELIGIBLE);
    console.log('[M4][DIAG] MISSING_LEVELS=' + states.MISSING_LEVELS);
    console.log('[M4][DIAG] MISSING_INDICATORS=' + states.MISSING_INDICATORS);
    console.log('[M4][DIAG] INSUFFICIENT_CANDLES=' + states.INSUFFICIENT_CANDLES);
    console.log('[M4][DIAG] IDLE=' + states.IDLE);
    console.log('[M4][DIAG] BREAKOUT_DETECTED=' + states.BREAKOUT_DETECTED);
    console.log('[M4][DIAG] RETEST_PENDING=' + states.RETEST_PENDING);
    console.log('[M4][DIAG] INVALIDATED=' + states.INVALIDATED);
    console.log('[M4][DIAG] CONFIRMED_PRE_DQS=' + states.CONFIRMED_PRE_DQS);
    console.log('[M4][DIAG] REJECTED_DQS=' + states.REJECTED_DQS);
    console.log('[M4][DIAG] BUILT_CONFIRMED_ROW=' + states.BUILT_CONFIRMED_ROW);

    function logBucket_(title, arr) {
      if (!arr || arr.length === 0) return;
      console.log('[M4][DIAG] ' + title + ':');
      for (var i = 0; i < arr.length; i++) {
        console.log('[M4][DIAG]   ' + arr[i]);
      }
    }

    logBucket_('Samples MISSING_LEVELS', samples.MISSING_LEVELS);
    logBucket_('Samples MISSING_INDICATORS', samples.MISSING_INDICATORS);
    logBucket_('Samples INSUFFICIENT_CANDLES', samples.INSUFFICIENT_CANDLES);
    logBucket_('Samples IDLE', samples.IDLE);
    logBucket_('Samples BREAKOUT_DETECTED', samples.BREAKOUT_DETECTED);
    logBucket_('Samples RETEST_PENDING', samples.RETEST_PENDING);
    logBucket_('Samples INVALIDATED', samples.INVALIDATED);
    logBucket_('Samples CONFIRMED_PRE_DQS', samples.CONFIRMED_PRE_DQS);
    logBucket_('Samples REJECTED_DQS', samples.REJECTED_DQS);
    logBucket_('Samples BUILT_CONFIRMED_ROW', samples.BUILT_CONFIRMED_ROW);

    try {
      var sigData = M4__readAll_(M4_CONST.SHEETS.SIGNALS);
      var sc = M4_COL.SIGNALS;

      function toMs_(v) {
        if (v instanceof Date) return v.getTime();
        var ms = new Date(String(v || '')).getTime();
        return isFinite(ms) ? ms : NaN;
      }

      var latestTsMs = NaN;
      for (var j = sigData.length - 1; j >= 1; j--) {
        var m = toMs_(sigData[j][sc.Timestamp]);
        if (isFinite(m)) {
          latestTsMs = m;
          break;
        }
      }

      if (isFinite(latestTsMs)) {
        var latestBatchRows = 0;
        var latestBatchConfirmed = 0;
        var latestBatchSkipped = 0;
        var latestBatchOther = 0;

        for (var k = 1; k < sigData.length; k++) {
          var rowMs = toMs_(sigData[k][sc.Timestamp]);
          if (rowMs !== latestTsMs) continue;

          latestBatchRows++;
          var finalState = String(sigData[k][sc.Final_Signal_State] || '').trim();
          if (finalState === 'CONFIRMED') latestBatchConfirmed++;
          else if (finalState === 'SKIPPED') latestBatchSkipped++;
          else latestBatchOther++;
        }

        console.log('[M4][DIAG] ── Existing SIGNALS latest batch ──────');
        console.log('[M4][DIAG] latestBatchTimestamp=' + new Date(latestTsMs).toISOString());
        console.log('[M4][DIAG] latestBatchRows=' + latestBatchRows);
        console.log('[M4][DIAG] latestBatchConfirmed=' + latestBatchConfirmed);
        console.log('[M4][DIAG] latestBatchSkipped=' + latestBatchSkipped);
        console.log('[M4][DIAG] latestBatchOther=' + latestBatchOther);
      }
    } catch (sheetDiagErr) {
      console.log('[M4][DIAG] Existing SIGNALS batch inspection failed: ' + sheetDiagErr.message);
    }

    console.log('[M4][DIAG] ═══════════════════════════════════════');
    console.log('[M4][DIAG] Signal Pipeline Diagnostic Complete');
    console.log('[M4][DIAG] ═══════════════════════════════════════');

  } catch (e) {
    console.error('[M4][DIAG] FATAL: ' + e.message);
    console.error('[M4][DIAG] Stack: ' + e.stack);
  }
}
