/**
 * MODULE 5 — Risk + Portfolio
 * M5_Constants.gs
 *
 * Immutable constants, exact 0-based column maps, default thresholds.
 * Single source of truth for all M5 schemas and parameter definitions.
 *
 * Naming: M5_CONST, M5_COL (module-scoped constants).
 *
 * @version 3.2.1
 */

var M5_CONST = Object.freeze({
  VERSION: '3.2.1',

  // ── Sheet Names ──────────────────────────────────────────────────────────
  SHEETS: Object.freeze({
    RISK_CALC    : 'RISK_CALC',
    COLLATERAL   : 'COLLATERAL',
    SIGNALS      : 'SIGNALS',
    CONFIG       : 'CONFIG',
    POSITIONS    : 'POSITIONS',
    INDICATORS   : 'INDICATORS',
    MOOD_JOURNAL : 'MOOD_JOURNAL'
  }),

  // ── Sizing Defaults (used when CONFIG values missing) ────────────────────
  DEFAULTS: Object.freeze({
    RISK_PER_TRADE_PCT       : 0.02,
    ATR_STOP_MULTIPLE        : 1.5,
    MAX_LEV_STANDARD         : 2,
    MAX_LEV_HIGH             : 3,
    MAX_LEV_PREMIUM          : 4,
    MIN_LIQ_BUFFER_R         : 2.0,
    LIQ_BUFFER_PROXY_UPLIFT_R: 1.0,
    MAX_TOTAL_EXPOSURE_PCT   : 0.15,
    RR_MINIMUM               : 3.0,
    MAX_MARGIN_USED_PCT      : 0.20,
    MAX_CONCURRENT_LEV       : 1,
    MARGIN_FRACTION_FLOOR    : 300,
    MARGIN_FRACTION_WARNING  : 400,
    USDT_ZAR_RATE            : 18.50,
    DAILY_MAX_NEW_TRADES     : 2,
    MONTHLY_DRAWDOWN_KILL_PCT: 0.15,
    FUNDING_HOLD_DAYS_EST    : 5,
    MAX_CARRY_COST_PCT       : 0.01,
    STOP_MIN_PCT             : 0.005,
    STOP_MAX_PCT             : 0.10,
    MAX_SINGLE_POSITION_PCT  : 0.20
  }),

  // ── DQS Grade Sizing Rules ───────────────────────────────────────────────
  GRADE_RULES: Object.freeze({
    PREMIUM:  { sizeMult: 1.5, corePct: 0.50, runnerPct: 0.50, trailATR: 2.5 },
    HIGH:     { sizeMult: 1.0, corePct: 0.60, runnerPct: 0.40, trailATR: 2.0 },
    STANDARD: { sizeMult: 1.0, corePct: 0.70, runnerPct: 0.30, trailATR: 1.5 }
  }),

  // ── Regime Sizing Multipliers ────────────────────────────────────────────
  REGIME_SIZE: Object.freeze({
    'RISK-ON' : 1.0,
    'NEUTRAL' : 0.5,
    'RISK-OFF': 0.25
  }),

  // ── Core TP as multiple of stop distance ─────────────────────────────────
  CORE_TP_R_MULTIPLE: 2.0,

  // ── Liquidation Proxy ────────────────────────────────────────────────────
  LIQ_PROXY_MARGIN_FACTOR: 1.1   // 10% safety margin on proxy estimate
});

/**
 * 0-based column index maps for all sheets read/written by M5.
 * Update here only if upstream sheet headers change.
 */
var M5_COL = Object.freeze({

  // ── RISK_CALC (M5 writes, 34 columns) ────────────────────────────────────
  RISK_CALC: Object.freeze({
    Signal_ID                         : 0,
    Symbol                            : 1,
    Direction                         : 2,
    Market_Type                       : 3,
    Entry_Price_Est                   : 4,
    Stop_Loss                         : 5,
    Stop_Distance_Quote               : 6,
    Stop_Distance_ZAR                 : 7,
    Risk_Amount_ZAR                   : 8,
    Full_Position_Size                : 9,
    Chosen_Leverage                   : 10,
    Required_Margin_ZAR               : 11,
    Margin_Mode_Used                  : 12,
    Liquidation_Price_Est             : 13,
    Liquidation_Price_Source          : 14,
    Liquidation_Buffer_R              : 15,
    Liquidation_Buffer_Required_R     : 16,
    DQS_Size_Multiplier               : 17,
    Regime_Size_Multiplier            : 18,
    Effective_Position_Size           : 19,
    Position_Notional_ZAR             : 20,
    Core_Size                         : 21,
    Runner_Size                       : 22,
    Core_TP                           : 23,
    Runner_Trail_ATR_Multiple         : 24,
    Funding_Cost_Est_ZAR              : 25,
    Borrow_Cost_Est_ZAR               : 26,
    Room_to_Run_R                     : 27,
    Leveraged_Positions_Open_At_Signal: 28,
    Leverage_Capped_Reason            : 29,
    MarginFraction_At_Signal          : 30,
    MarginFraction_Adequate           : 31,
    APPROVED                          : 32,
    Rejection_Reasons                 : 33
  }),

  // ── COLLATERAL (M5 owns, 11 columns) ─────────────────────────────────────
  COLLATERAL: Object.freeze({
    Timestamp                : 0,
    Asset                    : 1,
    Location                 : 2,
    Quantity                 : 3,
    Price_ZAR                : 4,
    Value_ZAR                : 5,
    Avg_Cost_ZAR             : 6,
    Collateral_Haircut       : 7,
    Effective_Collateral_ZAR : 8,
    Role                     : 9,
    Notes                    : 10
  }),

  // ── Upstream: SIGNALS (M4, read-only) ────────────────────────────────────
  SIGNALS: Object.freeze({
    Signal_ID          : 0,
    Timestamp          : 1,
    Symbol             : 2,
    Market_Type        : 3,
    Direction          : 4,
    Level_Value        : 5,
    Close_Price        : 6,
    ATR_14             : 7,
    Volume_Ratio       : 8,
    RSI_14             : 9,
    Room_To_Run_R      : 11,
    SPS_At_Signal      : 12,
    DQS_Total          : 22,
    DQS_Grade          : 23,
    Market_Regime      : 24,
    Final_Signal_State : 25
  }),

  // ── Upstream: INDICATORS (M3, read-only) ─────────────────────────────────
  INDICATORS: Object.freeze({
    Symbol               : 0,
    Timestamp            : 1,
    Timeframe            : 2,
    ATR_14               : 3,
    Funding_Rate_Current : 22
  }),

  // ── Upstream: POSITIONS (M6, read-only) ──────────────────────────────────
  POSITIONS: Object.freeze({
    Position_ID               : 0,
    Symbol                    : 1,
    Direction                 : 2,
    Market_Type               : 3,
    Leverage                  : 4,
    Margin_Mode               : 5,
    DQS_Grade                 : 6,
    Entry_Price_Quote         : 7,
    Entry_Price_ZAR           : 8,
    Entry_Timestamp           : 9,
    USDT_ZAR_At_Entry         : 10,
    Total_Size                : 11,
    Core_Size                 : 12,
    Runner_Size               : 13,
    Core_Status               : 14,
    Runner_Status             : 15,
    Current_Price_Quote       : 16,
    Initial_Stop_Quote        : 17,
    Core_Stop_Quote           : 18,
    Runner_Stop_Quote         : 19,
    Runner_Trail_ATR_Mult     : 20,
    Runner_Best_Price_Quote   : 21,
    Runner_Candles_Since_Best : 22,
    Take_Profit_1_Quote       : 23,
    Take_Profit_2_Quote       : 24,
    Unrealized_PnL_ZAR        : 25,
    Unrealized_PnL_Pct        : 26,
    Current_R_Multiple        : 27,
    Funding_Accrued_ZAR       : 28,
    Borrow_Accrued_ZAR        : 29,
    Core_Exit_Price_Quote     : 30,
    Core_Exit_Price_ZAR       : 31,
    Core_Exit_Timestamp       : 32,
    Core_Realized_PnL_ZAR     : 33,
    Runner_Exit_Price_Quote   : 34,
    Runner_Exit_Price_ZAR     : 35,
    Runner_Exit_Timestamp     : 36,
    Runner_Realized_PnL_ZAR   : 37,
    Total_Realized_PnL_ZAR    : 38,
    Hold_Duration_Candles     : 39,
    Position_Status           : 40,
    Exit_Reason               : 41,
    MFE_Quote                 : 42,
    MFE_R                     : 43,
    MAE_Quote                 : 44,
    MAE_R                     : 45,
    USDT_ZAR_At_Close         : 46,
    FX_PnL_ZAR                : 47,
    Liquidation_Price_Source  : 48,
    Is_Leveraged_Slot         : 49,
    MarginFraction_At_Entry   : 50,
    MarginFraction_Lowest     : 51
  }),

  // ── Upstream: MOOD_JOURNAL (M8, read-only) ───────────────────────────────
  MOOD_JOURNAL: Object.freeze({
    Date            : 0,
    Trading_Allowed : 7
  }),

  // ── Upstream: CONFIG (M1, read-only) ─────────────────────────────────────
  CONFIG: Object.freeze({
    Parameter : 0,
    Value     : 1
  })
});



/**
 * MODULE 5 — Risk + Portfolio
 * M5_Utils.gs
 *
 * Private utility functions: I/O, config access, math helpers.
 * All functions prefixed M5__ (double underscore = private).
 *
 * @version 3.2.1
 */

// ── Sheet I/O ──────────────────────────────────────────────────────────────

/**
 * Gets the active spreadsheet.
 */
function M5__ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Gets a sheet by name or throws.
 */
function M5__getSheet_(name) {
  var sh = M5__ss_().getSheetByName(name);
  if (!sh) throw new Error('[M5] Sheet not found: ' + name);
  return sh;
}

/**
 * Reads all data from a sheet as 2D array (includes header row).
 * Returns empty array if sheet is empty.
 */
function M5__readAll_(sheetName) {
  var sh = M5__getSheet_(sheetName);
  var lastRow = sh.getLastRow();
  if (lastRow < 1) return [];
  return sh.getDataRange().getValues();
}

/**
 * Appends rows to a sheet. No-op if rows is empty.
 */
function M5__appendRows_(sheetName, rows) {
  if (!rows || rows.length === 0) return;
  var sh = M5__getSheet_(sheetName);
  var nextRow = sh.getLastRow() + 1;
  sh.getRange(nextRow, 1, rows.length, rows[0].length).setValues(rows);
}

// ── Value Helpers ──────────────────────────────────────────────────────────

/**
 * Returns current UTC timestamp as ISO 8601 string.
 */
function M5__nowIso_() {
  return new Date().toISOString();
}

/**
 * Returns value if it's a valid finite number, else empty string.
 * Used when building output rows to prevent NaN/undefined in sheets.
 */
function M5__safeNum_(val) {
  return (val !== null && val !== undefined && isFinite(val)) ? val : '';
}

// ── CONFIG Readers ─────────────────────────────────────────────────────────

/**
 * Gets a numeric CONFIG value with a default fallback.
 * Handles percentage strings (e.g. "2%" → 0.02).
 */
function M5__cfgNum_(key, defaultVal) {
  try {
    var data = M5__readAll_(M5_CONST.SHEETS.CONFIG);
    var cc = M5_COL.CONFIG;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][cc.Parameter]).trim() === key) {
        var s = String(data[i][cc.Value]).trim();
        if (s.charAt(s.length - 1) === '%') {
          var pct = parseFloat(s);
          return isFinite(pct) ? pct / 100 : defaultVal;
        }
        var n = parseFloat(s);
        return isFinite(n) ? n : defaultVal;
      }
    }
  } catch (e) { /* fallback */ }
  return defaultVal;
}

/**
 * Gets a boolean CONFIG value with a default fallback.
 */
function M5__cfgBool_(key, defaultVal) {
  try {
    var data = M5__readAll_(M5_CONST.SHEETS.CONFIG);
    var cc = M5_COL.CONFIG;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][cc.Parameter]).trim() === key) {
        var s = String(data[i][cc.Value]).trim().toUpperCase();
        return (s === 'TRUE' || s === 'YES' || s === '1');
      }
    }
  } catch (e) { /* fallback */ }
  return defaultVal;
}

/**
 * Gets a string CONFIG value with a default fallback.
 */
function M5__cfgStr_(key, defaultVal) {
  try {
    var data = M5__readAll_(M5_CONST.SHEETS.CONFIG);
    var cc = M5_COL.CONFIG;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][cc.Parameter]).trim() === key) {
        return String(data[i][cc.Value]).trim();
      }
    }
  } catch (e) { /* fallback */ }
  return defaultVal;
}


/**
 * Loads all CONFIG values into a single config object.
 * Central point for all configurable parameters used by M5.
 */
function M5__loadConfig_() {
  var D = M5_CONST.DEFAULTS;
  return {
    usdtZar:           M5__cfgNum_('USDT_ZAR_Rate', D.USDT_ZAR_RATE),
    riskPct:           M5__cfgNum_('Risk_Per_Trade_Pct', D.RISK_PER_TRADE_PCT),
    atrMult:           M5__cfgNum_('ATR_Stop_Multiple', D.ATR_STOP_MULTIPLE),
    maxLevStandard:    M5__cfgNum_('Max_Leverage_STANDARD', D.MAX_LEV_STANDARD),
    maxLevHigh:        M5__cfgNum_('Max_Leverage_HIGH', D.MAX_LEV_HIGH),
    maxLevPremium:     M5__cfgNum_('Max_Leverage_PREMIUM', D.MAX_LEV_PREMIUM),
    minLiqBufferR:     M5__cfgNum_('Min_Liquidation_Buffer_R', D.MIN_LIQ_BUFFER_R),
    liqBufferUpliftR:  M5__cfgNum_('Liquidation_Buffer_Proxy_Uplift_R', D.LIQ_BUFFER_PROXY_UPLIFT_R),
    maxTotalExpPct:    M5__cfgNum_('Max_Total_Exposure_Pct', D.MAX_TOTAL_EXPOSURE_PCT),
    rrMin:             M5__cfgNum_('RR_Minimum', D.RR_MINIMUM),
    maxMarginUsedPct:  M5__cfgNum_('Max_Margin_Used_Pct', D.MAX_MARGIN_USED_PCT),
    maxConcurrentLev:  M5__cfgNum_('Max_Concurrent_Leveraged_Positions', D.MAX_CONCURRENT_LEV),
    marginFloor:       M5__cfgNum_('MarginFraction_Floor_Pct', D.MARGIN_FRACTION_FLOOR),
    marginWarning:     M5__cfgNum_('MarginFraction_Warning_Pct', D.MARGIN_FRACTION_WARNING),
    dailyMaxNewTrades: M5__cfgNum_('Daily_Max_New_Trades', D.DAILY_MAX_NEW_TRADES),
    monthDrawdownKill: M5__cfgNum_('Monthly_Drawdown_Kill_Pct', D.MONTHLY_DRAWDOWN_KILL_PCT),
    monthStartEquity:  M5__cfgNum_('Month_Start_Equity_ZAR', 100000),
    maxSinglePosPct:   M5__cfgNum_('Max_Single_Position_Pct', D.MAX_SINGLE_POSITION_PCT),
    fundingHoldDays:   M5__cfgNum_('Funding_Hold_Days_Est', D.FUNDING_HOLD_DAYS_EST),
    maxCarryCostPct:   M5__cfgNum_('Max_Carry_Cost_Pct', D.MAX_CARRY_COST_PCT),

    // Explicit behavior/margin/liquidation controls
    behaviorMode:      M5__cfgStr_('Behavioral_Gating_Mode', 'BYPASS'),
    marginFractionCurrent: M5__cfgNum_('MarginFraction_Current', D.MARGIN_FRACTION_WARNING),
    backtestUseMockMargin: M5__cfgBool_('Backtest_Use_Mock_MarginFraction', true),
    liqBufferBaseR:    M5__cfgNum_('Dynamic_Liq_Buffer_Base_R', D.MIN_LIQ_BUFFER_R),
    liqBufferAtrMult:  M5__cfgNum_('Dynamic_Liq_Buffer_ATR_Mult', 0),
    allowAutoSeedTradingCapital: M5__cfgBool_('Allow_Auto_Seed_Trading_Capital', false),
    allowAutoUpdateMonthStartEquity: M5__cfgBool_('Allow_Auto_Update_Month_Start_Equity', false),

    // Runtime-populated fields
    marginFraction:    0,       // Set by caller from M5__getMarginFraction_()
    behavioralPass:    false,   // Set by caller from M5__checkBehavioralGate_()
    behavioralSizeMod: 1.0,     // Set by caller from M5__checkBehavioralGate_()
    behavioralReason:  ''       // Set by caller from M5__checkBehavioralGate_()
  };
}


/**
 * MODULE 5 — Risk + Portfolio
 * M5_Portfolio.gs
 *
 * Reads portfolio state: collateral, exposure, margin, behavioral gate.
 * All functions prefixed M5__ (double underscore = private).
 *
 * @version 3.2.1
 */

// ── Collateral & Portfolio Equity ──────────────────────────────────────────
/**
 * Reads portfolio state from COLLATERAL tab.
 * Optional auto-seeding and month-start updates are controlled by CONFIG.
 */
function M5__getPortfolioState_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var state = {
    totalPortfolioZar:   0,
    subaccountEquityZar: 0,
    tradingCapitalZar:   0
  };

  var allowAutoSeed = M5__cfgBool_('Allow_Auto_Seed_Trading_Capital', false);
  var allowAutoMonthStartUpdate = M5__cfgBool_('Allow_Auto_Update_Month_Start_Equity', false);

  try {
    var colSh = ss.getSheetByName('COLLATERAL');
    if (!colSh) throw new Error('COLLATERAL sheet missing');
    var data  = colSh.getDataRange().getValues();
    var cc    = M5_COL.COLLATERAL;

    var hasCapital = false;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][cc.Role] || '').trim().toUpperCase() === 'TRADING_CAPITAL') {
        hasCapital = true;
        break;
      }
    }

    if (!hasCapital && allowAutoSeed) {
      colSh.appendRow([
        new Date().toISOString(),
        'LTC',
        'FUTURES_SUBACCOUNT',
        0.45657600,
        980.88,
        447.85,
        447.85,
        0,
        447.85,
        'TRADING_CAPITAL',
        'Auto-seeded LTC balance'
      ]);
      data = colSh.getDataRange().getValues();
      console.log('[M5] Auto-seeded LTC as TRADING_CAPITAL (447.85 ZAR)');
    } else if (!hasCapital) {
      console.log('[M5] No TRADING_CAPITAL row found; auto-seed disabled by config.');
    }

    for (var j = 1; j < data.length; j++) {
      var loc  = String(data[j][cc.Location] || '').trim();
      var val  = parseFloat(data[j][cc.Value_ZAR]) || 0;
      var eff  = parseFloat(data[j][cc.Effective_Collateral_ZAR]) || 0;
      var role = String(data[j][cc.Role] || '').trim().toUpperCase();

      state.totalPortfolioZar += val;

      if (loc === 'FUTURES_SUBACCOUNT') {
        state.subaccountEquityZar += val;
        if (role === 'TRADING_CAPITAL') {
          state.tradingCapitalZar += eff;
        }
      }
    }
  } catch (e) {
    console.log('[M5] COLLATERAL read error: ' + e.message);
  }

  if (state.subaccountEquityZar === 0) {
    state.subaccountEquityZar = 447.85;
    state.tradingCapitalZar   = 447.85;
    console.log('[M5] WARNING: Fallback to 447.85 ZAR (known LTC balance)');
  }

  try {
    if (allowAutoMonthStartUpdate) {
      var cfgSh   = ss.getSheetByName('CONFIG');
      if (cfgSh) {
        var cfgData = cfgSh.getDataRange().getValues();
        for (var k = 0; k < cfgData.length; k++) {
          if (String(cfgData[k][0]).trim() === 'Month_Start_Equity_ZAR') {
            var currentMSE = parseFloat(cfgData[k][1]);
            var equity = state.subaccountEquityZar;

            if (!isFinite(currentMSE) || currentMSE <= 0 || equity < currentMSE * (1 - 0.10)) {
              cfgSh.getRange(k + 1, 2).setValue(equity);
              console.log('[M5] Auto-corrected Month_Start_Equity_ZAR → ' + equity);
            }
            break;
          }
        }
      }
    } else {
      console.log('[M5] Auto-update of Month_Start_Equity_ZAR disabled by config.');
    }
  } catch (e2) {
    console.log('[M5] CONFIG update error: ' + e2.message);
  }

  return state;
}

// ── Exposure State ─────────────────────────────────────────────────────────

/**
 * Counts open positions and calculates total notional exposure.
 * Returns { openPositionsCount, leveragedPositionsCount, totalNotionalZar }.
 */
function M5__getExposureState_(usdtZar) {
  var state = {
    openPositionsCount:     0,
    leveragedPositionsCount: 0,
    totalNotionalZar:       0
  };

  try {
    var data = M5__readAll_(M5_CONST.SHEETS.POSITIONS);
    var pc = M5_COL.POSITIONS;

    for (var i = 1; i < data.length; i++) {
      var status = String(data[i][pc.Position_Status] || '').trim();
      if (status === 'OPEN' || status === 'PARTIAL') {
        state.openPositionsCount++;

        var lev = parseInt(data[i][pc.Leverage]) || 1;
        if (lev > 1) state.leveragedPositionsCount++;

        // Estimate notional from size × current price
        var size     = parseFloat(data[i][pc.Total_Size]) || 0;
        var curPrice = parseFloat(data[i][pc.Current_Price]) || 0;
        var sym      = String(data[i][pc.Symbol] || '');
        var isUsdt   = sym.indexOf('USDT') !== -1;
        var notional = size * curPrice * (isUsdt ? usdtZar : 1);
        state.totalNotionalZar += notional;
      }
    }
  } catch (e) {
    console.log('[M5] POSITIONS read error: ' + e.message);
  }

  return state;
}

// ── Margin Fraction ────────────────────────────────────────────────────────

/**
 * Gets current marginFraction.
 * Priority:
 * 1) Use M7 polling if available
 * 2) In BACKTEST mode, use CONFIG mock value if enabled
 * 3) Fallback to warning threshold
 */
function M5__getMarginFraction_() {
  try {
    if (typeof M7_pollMarginFraction === 'function') {
      var mf = M7_pollMarginFraction();
      if (isFinite(mf) && mf > 0) {
        console.log('[M5] MarginFraction source: M7 poll (' + mf + '%)');
        return mf;
      }
    }
  } catch (e) {
    console.log('[M5] MarginFraction poll via M7 failed: ' + e.message);
  }

  var mode = M5__cfgStr_('System_Mode', 'BACKTEST').toUpperCase();

  if (mode === 'BACKTEST' && M5__cfgBool_('Backtest_Use_Mock_MarginFraction', true)) {
    var mockMf = M5__cfgNum_('MarginFraction_Current', M5_CONST.DEFAULTS.MARGIN_FRACTION_WARNING);
    console.log('[M5] MarginFraction source: BACKTEST mock (' + mockMf + '%)');
    return mockMf;
  }

  var fallbackMf = M5__cfgNum_('MarginFraction_Warning_Pct', M5_CONST.DEFAULTS.MARGIN_FRACTION_WARNING);
  console.log('[M5] MarginFraction source: fallback warning threshold (' + fallbackMf + '%)');
  return fallbackMf;
}

// ── Behavioral Gate ────────────────────────────────────────────────────────
/**
 * Behavioral gating is intentionally out of scope for $T$T.
 * $T$T is an autonomous trading robot and must not depend on human
 * lifestyle, mood, journaling, holidays, or external operator-state systems.
 *
 * This function remains only for interface compatibility with the risk flow.
 *
 * @returns {{allowed:boolean,sizeMod:number,reason:string}}
 */
function M5__checkBehavioralGate_() {
  return {
    allowed: true,
    sizeMod: 1.0,
    reason: 'OUT_OF_SCOPE'
  };
}

// ── Funding Rate Lookup ────────────────────────────────────────────────────

/**
 * Gets the latest funding rate for a symbol from INDICATORS.
 * Returns 8-hour rate (multiply by 3 for daily equivalent).
 */
function M5__getFundingRate_(sym) {
  try {
    var data = M5__readAll_(M5_CONST.SHEETS.INDICATORS);
    var ic = M5_COL.INDICATORS;
    for (var i = data.length - 1; i >= 1; i--) {
      if (String(data[i][ic.Symbol]) === sym &&
          String(data[i][ic.Timeframe]) === '4H') {
        return parseFloat(data[i][ic.Funding_Rate_Current]) || 0;
      }
    }
  } catch (e) { /* fallback */ }
  return 0;
}

/**
 * Gets the latest ATR for a symbol from INDICATORS (4H timeframe).
 */
function M5__getATR_(sym) {
  try {
    var data = M5__readAll_(M5_CONST.SHEETS.INDICATORS);
    var ic = M5_COL.INDICATORS;
    for (var i = data.length - 1; i >= 1; i--) {
      if (String(data[i][ic.Symbol]) === sym &&
          String(data[i][ic.Timeframe]) === '4H') {
        return parseFloat(data[i][ic.ATR_14]) || 0;
      }
    }
  } catch (e) { /* fallback */ }
  return 0;
}


/**
 * MODULE 5 — Risk + Portfolio
 * M5_RiskCalculator.gs
 *
 * Core risk calculations: position sizing, leverage selection,
 * liquidation buffer (Tier 2 proxy with stepping), 17 hard rejection rules.
 * All functions prefixed M5__ (double underscore = private).
 *
 * @version 3.2.1
 */
/**
 * Calculates full risk parameters for a CONFIRMED signal.
 * Returns an output object matching the RISK_CALC schema.
 *
 * @param {Object} sig  - Signal data { id, sym, dir, mkt, entry, atr, rr, dqsGrade, regime, sps, fundingRate }
 * @param {Object} cfg  - Config from M5__loadConfig_()
 * @param {Object} port - Portfolio state from M5__getPortfolioState_()
 * @param {Object} exp  - Exposure state from M5__getExposureState_()
 * @returns {Object}      Result object with all 34 RISK_CALC fields
 */
function M5__calculateRisk_(sig, cfg, port, exp) {
  var isLong = (sig.dir === 'LONG');
  var isUsdt = sig.sym.indexOf('USDT') !== -1;
  var zarRate = isUsdt ? cfg.usdtZar : 1;

  var out = {
    Signal_ID:                sig.id,
    Symbol:                   sig.sym,
    Direction:                sig.dir,
    Market_Type:              sig.mkt,
    Entry_Price_Est:          sig.entry,
    Stop_Loss:                0,
    Stop_Distance_Quote:      0,
    Stop_Distance_ZAR:        0,
    Risk_Amount_ZAR:          0,
    Full_Position_Size:       0,
    Chosen_Leverage:          1,
    Required_Margin_ZAR:      0,
    Margin_Mode_Used:         'CROSS',
    Liquidation_Price_Est:    0,
    Liquidation_Price_Source: 'PROXY_ESTIMATE',
    Liquidation_Buffer_R:     0,
    Liquidation_Buffer_Required_R: 0,
    DQS_Size_Multiplier:      1.0,
    Regime_Size_Multiplier:   1.0,
    Effective_Position_Size:  0,
    Position_Notional_ZAR:    0,
    Core_Size:                0,
    Runner_Size:              0,
    Core_TP:                  0,
    Runner_Trail_ATR_Multiple: 0,
    Funding_Cost_Est_ZAR:     0,
    Borrow_Cost_Est_ZAR:      0,
    Room_to_Run_R:            sig.rr,
    Leveraged_Positions_Open: exp.leveragedPositionsCount,
    Leverage_Capped_Reason:   '',
    MarginFraction_At_Signal: cfg.marginFraction,
    MarginFraction_Adequate:  true,
    APPROVED:                 false,
    Rejection_Reasons:        ''
  };

  var rejections = [];

  // STEP 1: STOP LOSS & STOP DISTANCE
  var atrDist = cfg.atrMult * sig.atr;
  out.Stop_Loss = isLong ? sig.entry - atrDist : sig.entry + atrDist;
  out.Stop_Distance_Quote = Math.abs(sig.entry - out.Stop_Loss);
  out.Stop_Distance_ZAR = out.Stop_Distance_Quote * zarRate;

  var stopPct = sig.entry > 0 ? out.Stop_Distance_Quote / sig.entry : 0;
  if (stopPct < M5_CONST.DEFAULTS.STOP_MIN_PCT || stopPct > M5_CONST.DEFAULTS.STOP_MAX_PCT) {
    rejections.push('Rule 7: Stop distance ' + (stopPct * 100).toFixed(2) + '% outside [0.5%, 10%]');
  }

  // STEP 2: RISK AMOUNT & BASE POSITION SIZE
  out.Risk_Amount_ZAR = port.subaccountEquityZar * cfg.riskPct;
  out.Full_Position_Size = out.Stop_Distance_ZAR > 0
    ? (out.Risk_Amount_ZAR / out.Stop_Distance_ZAR)
    : 0;

  // STEP 3: DQS GRADE → SIZING, CORE/RUNNER, LEVERAGE, TRAIL
  var gradeRule = M5_CONST.GRADE_RULES[sig.dqsGrade];
  if (!gradeRule) {
    rejections.push('DQS Grade SKIP or invalid (' + sig.dqsGrade + ')');
    gradeRule = { sizeMult: 0, corePct: 0.70, runnerPct: 0.30, trailATR: 1.5 };
  }

  out.DQS_Size_Multiplier = gradeRule.sizeMult;
  out.Runner_Trail_ATR_Multiple = gradeRule.trailATR;

  if (sig.dqsGrade === 'PREMIUM') {
    out.Chosen_Leverage = cfg.maxLevPremium;
  } else if (sig.dqsGrade === 'HIGH') {
    out.Chosen_Leverage = cfg.maxLevHigh;
  } else if (sig.dqsGrade === 'STANDARD') {
    out.Chosen_Leverage = cfg.maxLevStandard;
  } else {
    out.Chosen_Leverage = 1;
  }

  // STEP 4: REGIME SIZE MULTIPLIER
  var regimeMult = M5_CONST.REGIME_SIZE[sig.regime];
  if (regimeMult === undefined || regimeMult === null) regimeMult = 0;
  out.Regime_Size_Multiplier = regimeMult;

  if (regimeMult === 0) {
    rejections.push('Regime RISK-OFF: sizing multiplier = 0');
  }

  // STEP 5: EFFECTIVE SIZE, NOTIONAL, CORE/RUNNER SPLIT
  out.Effective_Position_Size =
    out.Full_Position_Size *
    out.DQS_Size_Multiplier *
    out.Regime_Size_Multiplier *
    (cfg.behavioralSizeMod || 1.0);

  out.Position_Notional_ZAR = out.Effective_Position_Size * sig.entry * zarRate;
  out.Core_Size = out.Effective_Position_Size * gradeRule.corePct;
  out.Runner_Size = out.Effective_Position_Size * gradeRule.runnerPct;

  out.Core_TP = isLong
    ? sig.entry + (M5_CONST.CORE_TP_R_MULTIPLE * out.Stop_Distance_Quote)
    : sig.entry - (M5_CONST.CORE_TP_R_MULTIPLE * out.Stop_Distance_Quote);

  // STEP 6: SINGLE-POSITION LEVERAGE CONSTRAINT
  if (exp.leveragedPositionsCount >= cfg.maxConcurrentLev && out.Chosen_Leverage > 1) {
    out.Chosen_Leverage = 1;
    out.Leverage_Capped_Reason = 'MAX_CONCURRENT_LEVERAGED';
  }

  // STEP 7: TIER 2 LIQUIDATION PROXY WITH BUFFER STEPPING
  var atrPct = (sig.entry > 0 && sig.atr > 0) ? (sig.atr / sig.entry) : 0;
  var dynamicReq = (cfg.liqBufferBaseR || cfg.minLiqBufferR) + ((cfg.liqBufferAtrMult || 0) * atrPct * 100);
  out.Liquidation_Buffer_Required_R = Math.max(cfg.minLiqBufferR, dynamicReq + cfg.liqBufferUpliftR);

  var bufferSatisfied = false;

  while (out.Chosen_Leverage >= 1) {
    if (out.Chosen_Leverage === 1) {
      out.Liquidation_Price_Est = 0;
      out.Liquidation_Buffer_R = 999.0;
      bufferSatisfied = true;
      break;
    }

    var liqFactor = M5_CONST.LIQ_PROXY_MARGIN_FACTOR;
    var liqEst;

    if (isLong) {
      liqEst = sig.entry * (1 - (1 / out.Chosen_Leverage) * liqFactor);
      out.Liquidation_Buffer_R = out.Stop_Distance_Quote > 0
        ? (out.Stop_Loss - liqEst) / out.Stop_Distance_Quote
        : 0;
    } else {
      liqEst = sig.entry * (1 + (1 / out.Chosen_Leverage) * liqFactor);
      out.Liquidation_Buffer_R = out.Stop_Distance_Quote > 0
        ? (liqEst - out.Stop_Loss) / out.Stop_Distance_Quote
        : 0;
    }

    out.Liquidation_Price_Est = liqEst;

    if (out.Liquidation_Buffer_R >= out.Liquidation_Buffer_Required_R) {
      bufferSatisfied = true;
      break;
    } else {
      out.Chosen_Leverage--;
    }
  }

  if (!bufferSatisfied) {
    rejections.push('Rule 11: Liquidation buffer fails at all leverage levels');
  }

  out.Required_Margin_ZAR = out.Chosen_Leverage > 0
    ? (out.Position_Notional_ZAR / out.Chosen_Leverage)
    : out.Position_Notional_ZAR;

  // STEP 8: FUNDING & BORROW COST ESTIMATION
  if (sig.mkt === 'PERP' && sig.fundingRate !== 0) {
    var dailyFundRate = Math.abs(sig.fundingRate) * 3;
    var estFundCost = out.Position_Notional_ZAR * dailyFundRate * cfg.fundingHoldDays;
    out.Funding_Cost_Est_ZAR = Math.round(estFundCost * 100) / 100;

    var carryCostPct = out.Position_Notional_ZAR > 0
      ? estFundCost / out.Position_Notional_ZAR
      : 0;

    if (carryCostPct > cfg.maxCarryCostPct) {
      rejections.push('Rule 14: Est. funding cost ' + (carryCostPct * 100).toFixed(2) +
        '% > ' + (cfg.maxCarryCostPct * 100) + '% of notional');
    }
  }

  // STEP 9: HARD REJECTION RULES
  if (out.Position_Notional_ZAR > (port.subaccountEquityZar * cfg.maxSinglePosPct)) {
    rejections.push('Rule 1: Position notional ' + Math.round(out.Position_Notional_ZAR) +
      ' > ' + (cfg.maxSinglePosPct * 100) + '% of equity');
  }

  var projectedTotalNotional = exp.totalNotionalZar + out.Position_Notional_ZAR;
  if (projectedTotalNotional > (port.subaccountEquityZar * cfg.maxTotalExpPct)) {
    rejections.push('Rule 2: Projected total exposure ' + Math.round(projectedTotalNotional) +
      ' > ' + (cfg.maxTotalExpPct * 100) + '% of equity');
  }

  if (out.Room_to_Run_R < cfg.rrMin) {
    rejections.push('Rule 3: R:R ' + out.Room_to_Run_R.toFixed(1) + ' < min ' + cfg.rrMin);
  }

  var drawdownThreshold = cfg.monthStartEquity * (1 - cfg.monthDrawdownKill);
  if (port.subaccountEquityZar < drawdownThreshold) {
    rejections.push('Rule 4: Equity ' + Math.round(port.subaccountEquityZar) +
      ' below monthly drawdown kill (' + Math.round(drawdownThreshold) + ')');
  }

  if (sig.tradesEnteredToday >= cfg.dailyMaxNewTrades) {
    rejections.push('Rule 5: Daily trade limit reached (' + cfg.dailyMaxNewTrades + ')');
  }

  if (sig.dataUnreliable) {
    rejections.push('Rule 9: Data flagged as unreliable for ' + sig.sym);
  }

  if (!cfg.behavioralPass) {
    rejections.push('Rule 10: Behavioral gate blocked trade (' + (cfg.behavioralReason || 'UNKNOWN') + ')');
  }

  if (out.Required_Margin_ZAR > (port.subaccountEquityZar * cfg.maxMarginUsedPct)) {
    rejections.push('Rule 12: Required margin ' + Math.round(out.Required_Margin_ZAR) +
      ' > ' + (cfg.maxMarginUsedPct * 100) + '% of equity');
  }

  if (cfg.marginFraction <= cfg.marginFloor) {
    rejections.push('Rule 16: MarginFraction CRITICAL (' + cfg.marginFraction.toFixed(0) +
      '% <= floor ' + cfg.marginFloor + '%)');
    out.MarginFraction_Adequate = false;
  } else if (cfg.marginFraction <= cfg.marginWarning) {
    out.MarginFraction_Adequate = false;
  }

  if (cfg.marginFraction <= cfg.marginWarning && out.Liquidation_Buffer_R > 4.0) {
    out.MarginFraction_Adequate = false;
  }

  // STEP 10: FINAL APPROVAL
  if (rejections.length === 0 && out.Effective_Position_Size > 0) {
    out.APPROVED = true;
  } else {
    out.APPROVED = false;
    if (out.Effective_Position_Size <= 0 && rejections.length === 0) {
      rejections.push('Effective position size is zero');
    }
    out.Rejection_Reasons = rejections.join('; ');
  }

  return out;
}



/**
 * MODULE 5 — Risk + Portfolio
 * M5_Main.gs
 *
 * Main orchestration: loads state, processes CONFIRMED signals
 * through risk calculations, writes results to RISK_CALC.
 *
 * Public API:
 *   M5_runRiskAndPortfolio()  — full risk evaluation cycle
 *
 * @version 3.2.1
 */

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC FUNCTION: Run full risk & portfolio evaluation cycle
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Processes all CONFIRMED signals from the current cycle through
 * position sizing, leverage selection, liquidation buffer checks,
 * and 17 hard rejection rules. Writes results to RISK_CALC.
 *
 * Called after M4_runSignalEngine() completes, before M6 (Execution).
 */
function M5_runRiskAndPortfolio() {
  console.log('[M5] ═══════════════════════════════════════');
  console.log('[M5] Risk & Portfolio Cycle Starting (v' + M5_CONST.VERSION + ')');
  console.log('[M5] ═══════════════════════════════════════');

  try {
    // ── 1. Load config and state ───────────────────────────────────────
    var cfg  = M5__loadConfig_();
    cfg.marginFraction = M5__getMarginFraction_();
    var behavior = M5__checkBehavioralGate_();
    cfg.behavioralPass = !!behavior.allowed;
    cfg.behavioralSizeMod = isFinite(behavior.sizeMod) ? behavior.sizeMod : 1.0;
    cfg.behavioralReason = behavior.reason || '';

    var port = M5__getPortfolioState_();
    var exp  = M5__getExposureState_(cfg.usdtZar);

    console.log('[M5] Equity: '     + port.subaccountEquityZar + ' ZAR');
    console.log('[M5] Open: '       + exp.openPositionsCount +
                ' | Leveraged: '    + exp.leveragedPositionsCount);
    console.log('[M5] Margin%: '    + cfg.marginFraction.toFixed(0) + '%');
    console.log('[M5] Behavioral: ' + (cfg.behavioralPass ? 'PASS' : 'FAIL') +
                ' | SizeMod: ' + cfg.behavioralSizeMod +
                ' | Reason: ' + cfg.behavioralReason);

    // ── 2. Read CONFIRMED signals from current cycle ───────────────────
    var candidates = M5__loadConfirmedSignals_(cfg);
    if (candidates.length === 0) {
      console.log('[M5] No CONFIRMED signals in current cycle.');
      return;
    }

    console.log('[M5] Evaluating ' + candidates.length + ' CONFIRMED signals...');

    // ── 3. Process each signal through risk calculator ──────────────────
    var writeRows = [];
    var approvedCount = 0;
    var tradesEnteredToday = 0; // Track within this cycle

    for (var k = 0; k < candidates.length; k++) {
      var sig = candidates[k];
      sig.tradesEnteredToday = tradesEnteredToday;

      var result = M5__calculateRisk_(sig, cfg, port, exp);
      var row = M5__resultToRow_(result);
      writeRows.push(row);

      // Update running state if approved (for next iteration's checks)
      if (result.APPROVED) {
        approvedCount++;
        tradesEnteredToday++;
        exp.openPositionsCount++;
        if (result.Chosen_Leverage > 1) {
          exp.leveragedPositionsCount++;
        }
        exp.totalNotionalZar += result.Position_Notional_ZAR;
      }
    }

    // ── 4. Write all results to RISK_CALC ──────────────────────────────
    if (writeRows.length > 0) {
      M5__appendRows_(M5_CONST.SHEETS.RISK_CALC, writeRows);
    }

    console.log('[M5] ═══════════════════════════════════════');
    console.log('[M5] Rows Written: ' + writeRows.length);
    console.log('[M5] APPROVED:     ' + approvedCount);
    console.log('[M5] REJECTED:     ' + (writeRows.length - approvedCount));
    console.log('[M5] ═══════════════════════════════════════');

  } catch (e) {
    console.error('[M5] FATAL: ' + e.message);
    console.error('[M5] Stack: ' + e.stack);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PRIVATE: Load CONFIRMED signals from SIGNALS sheet
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Reads SIGNALS and extracts the latest batch of CONFIRMED signals.
 *
 * Batch rule:
 * - find the most recent valid timestamp present in SIGNALS
 * - collect all rows with that exact timestamp
 * - from those, keep only CONFIRMED rows
 *
 * This is more robust than a wall-clock 15-minute cutoff.
 * Returns candidates sorted by SPS descending.
 */
function M5__loadConfirmedSignals_(cfg) {
  var sigData = M5__readAll_(M5_CONST.SHEETS.SIGNALS);
  if (sigData.length < 2) return [];

  var sc = M5_COL.SIGNALS;

  function toMs_(v) {
    if (v instanceof Date) return v.getTime();
    var ms = new Date(String(v || '')).getTime();
    return isFinite(ms) ? ms : NaN;
  }

  // Find latest valid timestamp in SIGNALS
  var latestTsMs = NaN;
  for (var i = sigData.length - 1; i >= 1; i--) {
    var candidateMs = toMs_(sigData[i][sc.Timestamp]);
    if (isFinite(candidateMs)) {
      latestTsMs = candidateMs;
      break;
    }
  }

  if (!isFinite(latestTsMs)) return [];

  var candidates = [];

  for (var j = sigData.length - 1; j >= 1; j--) {
    var row = sigData[j];
    var rowTsMs = toMs_(row[sc.Timestamp]);

    if (!isFinite(rowTsMs)) continue;
    if (rowTsMs !== latestTsMs) continue;

    if (String(row[sc.Final_Signal_State] || '').trim() !== 'CONFIRMED') continue;

    var sym = String(row[sc.Symbol] || '');
    var atr = parseFloat(row[sc.ATR_14]) || 0;
    if (!(atr > 0)) {
      atr = M5__getATR_(sym);
    }

    var fundingRate = M5__getFundingRate_(sym);

    candidates.push({
      id:               String(row[sc.Signal_ID] || ''),
      sym:              sym,
      mkt:              String(row[sc.Market_Type] || ''),
      dir:              String(row[sc.Direction] || ''),
      entry:            parseFloat(row[sc.Close_Price]) || 0,
      atr:              atr,
      rr:               parseFloat(row[sc.Room_To_Run_R]) || 0,
      dqsGrade:         String(row[sc.DQS_Grade] || '').trim(),
      regime:           String(row[sc.Market_Regime] || '').trim(),
      sps:              parseInt(row[sc.SPS_At_Signal], 10) || 0,
      fundingRate:      fundingRate,
      dataUnreliable:   false,
      tradesEnteredToday: 0,
      signalTsMs:       rowTsMs
    });
  }

  candidates.sort(function(a, b) {
    return b.sps - a.sps;
  });

  return candidates;
}

// ═══════════════════════════════════════════════════════════════════════════
// PRIVATE: Convert result object to 34-element row array
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Maps a risk calculation result object to a 34-element array
 * matching the RISK_CALC sheet schema.
 */
function M5__resultToRow_(res) {
  var rc = M5_COL.RISK_CALC;
  var row = new Array(34).fill('');

  row[rc.Signal_ID]                         = res.Signal_ID;
  row[rc.Symbol]                            = res.Symbol;
  row[rc.Direction]                         = res.Direction;
  row[rc.Market_Type]                       = res.Market_Type;
  row[rc.Entry_Price_Est]                   = M5__safeNum_(res.Entry_Price_Est);
  row[rc.Stop_Loss]                         = M5__safeNum_(res.Stop_Loss);
  row[rc.Stop_Distance_Quote]               = M5__safeNum_(res.Stop_Distance_Quote);
  row[rc.Stop_Distance_ZAR]                 = M5__safeNum_(res.Stop_Distance_ZAR);
  row[rc.Risk_Amount_ZAR]                   = M5__safeNum_(res.Risk_Amount_ZAR);
  row[rc.Full_Position_Size]                = M5__safeNum_(res.Full_Position_Size);
  row[rc.Chosen_Leverage]                   = res.Chosen_Leverage;
  row[rc.Required_Margin_ZAR]               = M5__safeNum_(res.Required_Margin_ZAR);
  row[rc.Margin_Mode_Used]                  = res.Margin_Mode_Used;
  row[rc.Liquidation_Price_Est]             = M5__safeNum_(res.Liquidation_Price_Est);
  row[rc.Liquidation_Price_Source]          = res.Liquidation_Price_Source;
  row[rc.Liquidation_Buffer_R]              = M5__safeNum_(res.Liquidation_Buffer_R);
  row[rc.Liquidation_Buffer_Required_R]     = res.Liquidation_Buffer_Required_R;
  row[rc.DQS_Size_Multiplier]               = res.DQS_Size_Multiplier;
  row[rc.Regime_Size_Multiplier]            = res.Regime_Size_Multiplier;
  row[rc.Effective_Position_Size]           = M5__safeNum_(res.Effective_Position_Size);
  row[rc.Position_Notional_ZAR]             = M5__safeNum_(res.Position_Notional_ZAR);
  row[rc.Core_Size]                         = M5__safeNum_(res.Core_Size);
  row[rc.Runner_Size]                       = M5__safeNum_(res.Runner_Size);
  row[rc.Core_TP]                           = M5__safeNum_(res.Core_TP);
  row[rc.Runner_Trail_ATR_Multiple]         = res.Runner_Trail_ATR_Multiple;
  row[rc.Funding_Cost_Est_ZAR]              = M5__safeNum_(res.Funding_Cost_Est_ZAR);
  row[rc.Borrow_Cost_Est_ZAR]               = M5__safeNum_(res.Borrow_Cost_Est_ZAR);
  row[rc.Room_to_Run_R]                     = M5__safeNum_(res.Room_to_Run_R);
  row[rc.Leveraged_Positions_Open_At_Signal] = res.Leveraged_Positions_Open;
  row[rc.Leverage_Capped_Reason]            = res.Leverage_Capped_Reason;
  row[rc.MarginFraction_At_Signal]          = res.MarginFraction_At_Signal;
  row[rc.MarginFraction_Adequate]           = res.MarginFraction_Adequate;
  row[rc.APPROVED]                          = res.APPROVED;
  row[rc.Rejection_Reasons]                 = res.Rejection_Reasons;

  return row;
}


/**
 * MODULE 5 — Risk + Portfolio
 * M5_Tests.gs
 *
 * Validation tests for schemas, sizing math, leverage constraints,
 * liquidation buffer stepping, and rejection rules.
 *
 * Public API:
 *   M5_testRunAll() — run all acceptance tests
 *
 * @version 3.2.1
 */

function M5_testRunAll() {
  console.log('╔═════════════════════════════════════════════╗');
  console.log('║  MODULE 5 TEST SUITE v' + M5_CONST.VERSION + '               ║');
  console.log('╚═════════════════════════════════════════════╝');

  var results = [];
  function assert_(name, cond) {
    results.push({ name: name, pass: !!cond });
  }

  // ── 1. RISK_CALC Schema ──────────────────────────────────────────────
  try {
    var rcSh = M5__getSheet_(M5_CONST.SHEETS.RISK_CALC);
    var rcHr = rcSh.getRange(1, 1, 1, 34).getValues()[0];
    assert_('Schema: RISK_CALC has 34 columns', rcHr.length === 34);
    assert_('Schema: Col 0 = Signal_ID', String(rcHr[0]).trim() === 'Signal_ID');
    assert_('Schema: Col 32 = APPROVED', String(rcHr[32]).trim() === 'APPROVED');
    assert_('Schema: Col 33 = Rejection_Reasons', String(rcHr[33]).trim() === 'Rejection_Reasons');
  } catch (e) {
    assert_('Schema RISK_CALC: ' + e.message, false);
  }

  // ── 2. COLLATERAL Schema ─────────────────────────────────────────────
  try {
    var colSh = M5__getSheet_(M5_CONST.SHEETS.COLLATERAL);
    var colHr = colSh.getRange(1, 1, 1, 11).getValues()[0];
    assert_('Schema: COLLATERAL has 11 columns', colHr.length === 11);
    assert_('Schema: Col 0 = Timestamp', String(colHr[0]).trim() === 'Timestamp');
    assert_('Schema: Col 10 = Notes', String(colHr[10]).trim() === 'Notes');
  } catch (e) {
    assert_('Schema COLLATERAL: ' + e.message, false);
  }

  // ── 3. Core Sizing Math ──────────────────────────────────────────────
  var D = M5_CONST.DEFAULTS;
  var mockSig = {
    id: 'TEST-SIG-1', sym: 'BTC/USDT', mkt: 'PERP', dir: 'LONG',
    entry: 100000, atr: 1000, rr: 5.0, dqsGrade: 'HIGH', regime: 'RISK-ON',
    sps: 75, fundingRate: 0, dataUnreliable: false, tradesEnteredToday: 0
  };
  var mockCfg = {
    usdtZar: 20, riskPct: 0.02, atrMult: 1.5,
    maxLevStandard: 2, maxLevHigh: 3, maxLevPremium: 4,
    minLiqBufferR: 2.0, liqBufferUpliftR: 1.0,
    maxTotalExpPct: 1.0, rrMin: 3.0, maxMarginUsedPct: 1.0,
    maxConcurrentLev: 1, marginFloor: 300, marginWarning: 400,
    marginFraction: 500, behavioralPass: true,
    monthDrawdownKill: 0.15, monthStartEquity: 100000,
    dailyMaxNewTrades: 5, maxSinglePosPct: 1.0,
    fundingHoldDays: 5, maxCarryCostPct: 0.01
  };
  var mockPort = { subaccountEquityZar: 100000, tradingCapitalZar: 100000 };
  var mockExp  = { openPositionsCount: 0, leveragedPositionsCount: 0, totalNotionalZar: 0 };

  var r1 = M5__calculateRisk_(mockSig, mockCfg, mockPort, mockExp);

  // Stop: Entry 100000 - (1.5 × 1000) = 98500
  assert_('Math: Stop Loss = 98500', r1.Stop_Loss === 98500);

  // Stop Distance Quote = 1500
  assert_('Math: Stop Distance Quote = 1500', r1.Stop_Distance_Quote === 1500);

  // Stop Distance ZAR = 1500 × 20 = 30000
  assert_('Math: Stop Distance ZAR = 30000', r1.Stop_Distance_ZAR === 30000);

  // Risk = 100000 × 0.02 = 2000
  assert_('Math: Risk Amount ZAR = 2000', r1.Risk_Amount_ZAR === 2000);

  // Full Size = 2000 / 30000 ≈ 0.0667
  assert_('Math: Full Position Size > 0', r1.Full_Position_Size > 0);
  assert_('Math: Full Position Size ≈ 0.0667',
    Math.abs(r1.Full_Position_Size - 0.06667) < 0.001);

  // HIGH grade → 3× leverage, 1.0 size mult, 60/40 split
  assert_('Grade: HIGH → Chosen Leverage = 3', r1.Chosen_Leverage === 3);
  assert_('Grade: HIGH → DQS Size Mult = 1.0', r1.DQS_Size_Multiplier === 1.0);
  assert_('Grade: HIGH → Trail ATR = 2.0', r1.Runner_Trail_ATR_Multiple === 2.0);

  // Core TP = Entry + 2 × StopDist = 100000 + 3000 = 103000
  assert_('Math: Core TP = 103000', r1.Core_TP === 103000);

  // Liquidation buffer required = 2.0 + 1.0 = 3.0
  assert_('Proxy: Buffer Required = 3.0R', r1.Liquidation_Buffer_Required_R === 3.0);

  // Should be approved
  assert_('Approval: Should pass with clean config', r1.APPROVED === true);

  // ── 4. Single-Leverage Constraint ────────────────────────────────────
  var mockExp2 = { openPositionsCount: 1, leveragedPositionsCount: 1, totalNotionalZar: 0 };
  var r2 = M5__calculateRisk_(mockSig, mockCfg, mockPort, mockExp2);

  assert_('Constraint: Leverage capped to 1× when concurrent leveraged exists',
    r2.Chosen_Leverage === 1);
  assert_('Constraint: Cap reason logged',
    r2.Leverage_Capped_Reason === 'MAX_CONCURRENT_LEVERAGED');

  // ── 5. Regime Multiplier ─────────────────────────────────────────────
  var mockSigNeutral = {};
  for (var k1 in mockSig) { mockSigNeutral[k1] = mockSig[k1]; }
  mockSigNeutral.regime = 'NEUTRAL';

  var r3 = M5__calculateRisk_(mockSigNeutral, mockCfg, mockPort, mockExp);
  assert_('Regime: NEUTRAL → size multiplier = 0.5', r3.Regime_Size_Multiplier === 0.5);
  assert_('Regime: Effective size halved',
    Math.abs(r3.Effective_Position_Size - r1.Effective_Position_Size * 0.5) < 0.0001);

  // ── 6. RISK-OFF Rejection ────────────────────────────────────────────
  var mockSigOff = {};
  for (var k2 in mockSig) { mockSigOff[k2] = mockSig[k2]; }
  mockSigOff.regime = 'RISK-OFF';

  var r4 = M5__calculateRisk_(mockSigOff, mockCfg, mockPort, mockExp);
  assert_('Regime: RISK-OFF → size multiplier = 0', r4.Regime_Size_Multiplier === 0);
  assert_('Regime: RISK-OFF → rejected', r4.APPROVED === false);

  // ── 7. MarginFraction Critical ───────────────────────────────────────
  var mockCfgCrit = {};
  for (var k3 in mockCfg) { mockCfgCrit[k3] = mockCfg[k3]; }
  mockCfgCrit.marginFraction = 250; // Below floor of 300

  var r5 = M5__calculateRisk_(mockSig, mockCfgCrit, mockPort, mockExp);
  assert_('Alert: MarginFraction critical → rejected', r5.APPROVED === false);
  assert_('Alert: MarginFraction reason logged',
    r5.Rejection_Reasons.indexOf('marginFraction') !== -1 ||
    r5.Rejection_Reasons.indexOf('MarginFraction') !== -1);
  assert_('Alert: MarginFraction_Adequate = false', r5.MarginFraction_Adequate === false);

  // ── 8. Behavioral Gate Rejection ─────────────────────────────────────
  var mockCfgBeh = {};
  for (var k4 in mockCfg) { mockCfgBeh[k4] = mockCfg[k4]; }
  mockCfgBeh.behavioralPass = false;

  var r6 = M5__calculateRisk_(mockSig, mockCfgBeh, mockPort, mockExp);
  assert_('Behavioral: Trading_Allowed=FALSE → rejected', r6.APPROVED === false);
  assert_('Behavioral: Reason logged',
    r6.Rejection_Reasons.indexOf('Mood Journal') !== -1 ||
    r6.Rejection_Reasons.indexOf('Trading_Allowed') !== -1);

  // ── 9. PREMIUM Grade Sizing ──────────────────────────────────────────
  var mockSigPrem = {};
  for (var k5 in mockSig) { mockSigPrem[k5] = mockSig[k5]; }
  mockSigPrem.dqsGrade = 'PREMIUM';

  var r7 = M5__calculateRisk_(mockSigPrem, mockCfg, mockPort, mockExp);
  assert_('Premium: Size multiplier = 1.5', r7.DQS_Size_Multiplier === 1.5);
  assert_('Premium: Trail ATR = 2.5', r7.Runner_Trail_ATR_Multiple === 2.5);

  // ── 10. Constants Integrity ──────────────────────────────────────────
  assert_('Const: RISK_CALC last col = 33',
    M5_COL.RISK_CALC.Rejection_Reasons === 33);
  assert_('Const: COLLATERAL last col = 10',
    M5_COL.COLLATERAL.Notes === 10);
  assert_('Const: Grade rules exist for PREMIUM/HIGH/STANDARD',
    M5_CONST.GRADE_RULES.PREMIUM && M5_CONST.GRADE_RULES.HIGH && M5_CONST.GRADE_RULES.STANDARD);

  // ── 11. Row Builder ──────────────────────────────────────────────────
  var testRow = M5__resultToRow_(r1);
  assert_('RowBuilder: Produces 34-element array', testRow.length === 34);
  assert_('RowBuilder: Signal_ID in col 0', testRow[0] === r1.Signal_ID);
  assert_('RowBuilder: APPROVED in col 32', testRow[32] === r1.APPROVED);

  // ══════════════════════════════════════════════════════════════════════
  // REPORT
  // ══════════════════════════════════════════════════════════════════════
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


/**
 * MODULE 5 — Diagnostic
 *
 * Read-only diagnostic for why M5 is not populating RISK_CALC.
 *
 * Run:
 *   M5_diagRiskPipeline()
 */
function M5_diagRiskPipeline() {
  console.log('[M5][DIAG] ═══════════════════════════════════════');
  console.log('[M5][DIAG] Risk Pipeline Diagnostic Starting');
  console.log('[M5][DIAG] ═══════════════════════════════════════');

  try {
    var cfg = M5__loadConfig_();
    cfg.marginFraction = M5__getMarginFraction_();

    var behavior = M5__checkBehavioralGate_();
    cfg.behavioralPass = !!behavior.allowed;
    cfg.behavioralSizeMod = isFinite(behavior.sizeMod) ? behavior.sizeMod : 1.0;
    cfg.behavioralReason = behavior.reason || '';

    var port = M5__getPortfolioState_();
    var exp = M5__getExposureState_(cfg.usdtZar);

    console.log('[M5][DIAG] Config snapshot | usdtZar=' + cfg.usdtZar +
      ' | riskPct=' + cfg.riskPct +
      ' | atrMult=' + cfg.atrMult +
      ' | rrMin=' + cfg.rrMin +
      ' | maxTotalExpPct=' + cfg.maxTotalExpPct +
      ' | maxMarginUsedPct=' + cfg.maxMarginUsedPct +
      ' | maxConcurrentLev=' + cfg.maxConcurrentLev +
      ' | marginFraction=' + cfg.marginFraction +
      ' | behavioralPass=' + cfg.behavioralPass +
      ' | behavioralSizeMod=' + cfg.behavioralSizeMod +
      ' | behavioralReason=' + cfg.behavioralReason);

    console.log('[M5][DIAG] Portfolio snapshot | subaccountEquity=' + port.subaccountEquityZar +
      ' | tradingCapital=' + port.tradingCapitalZar +
      ' | totalPortfolio=' + port.totalPortfolioZar);

    console.log('[M5][DIAG] Exposure snapshot | openPositions=' + exp.openPositionsCount +
      ' | leveragedOpen=' + exp.leveragedPositionsCount +
      ' | totalNotional=' + exp.totalNotionalZar);

    var sigData = M5__readAll_(M5_CONST.SHEETS.SIGNALS);
    var riskData = M5__readAll_(M5_CONST.SHEETS.RISK_CALC);

    var sc = M5_COL.SIGNALS;

    console.log('[M5][DIAG] Sheet rows | SIGNALS=' + Math.max(0, sigData.length - 1) +
      ' | RISK_CALC=' + Math.max(0, riskData.length - 1));

    if (sigData.length < 2) {
      console.log('[M5][DIAG] No SIGNALS rows found.');
      console.log('[M5][DIAG] ═══════════════════════════════════════');
      return;
    }

    function toMs_(v) {
      if (v instanceof Date) return v.getTime();
      var ms = new Date(String(v || '')).getTime();
      return isFinite(ms) ? ms : NaN;
    }

    var counts = {
      totalSignals: Math.max(0, sigData.length - 1),
      validTimestampRows: 0,
      invalidTimestampRows: 0,
      confirmedRows: 0,
      latestBatchRows: 0,
      latestBatchConfirmedRows: 0,
      loaderCandidates: 0,
      approved: 0,
      rejected: 0
    };

    var latestTsMs = NaN;
    for (var i = sigData.length - 1; i >= 1; i--) {
      var ms0 = toMs_(sigData[i][sc.Timestamp]);
      if (isFinite(ms0)) {
        latestTsMs = ms0;
        break;
      }
    }

    for (var j = 1; j < sigData.length; j++) {
      var row = sigData[j];
      var rowMs = toMs_(row[sc.Timestamp]);

      if (isFinite(rowMs)) counts.validTimestampRows++;
      else counts.invalidTimestampRows++;

      if (String(row[sc.Final_Signal_State] || '').trim() === 'CONFIRMED') {
        counts.confirmedRows++;
      }

      if (isFinite(latestTsMs) && rowMs === latestTsMs) {
        counts.latestBatchRows++;
        if (String(row[sc.Final_Signal_State] || '').trim() === 'CONFIRMED') {
          counts.latestBatchConfirmedRows++;
        }
      }
    }

    var candidates = M5__loadConfirmedSignals_(cfg);
    counts.loaderCandidates = candidates.length;

    console.log('[M5][DIAG] ── SIGNALS summary ─────────────────────');
    console.log('[M5][DIAG] validTimestampRows=' + counts.validTimestampRows);
    console.log('[M5][DIAG] invalidTimestampRows=' + counts.invalidTimestampRows);
    console.log('[M5][DIAG] confirmedRows=' + counts.confirmedRows);
    console.log('[M5][DIAG] latestBatchRows=' + counts.latestBatchRows);
    console.log('[M5][DIAG] latestBatchConfirmedRows=' + counts.latestBatchConfirmedRows);
    console.log('[M5][DIAG] loaderCandidates=' + counts.loaderCandidates);

    if (isFinite(latestTsMs)) {
      console.log('[M5][DIAG] latestBatchTimestamp=' + new Date(latestTsMs).toISOString());
    } else {
      console.log('[M5][DIAG] latestBatchTimestamp=INVALID');
    }

    if (candidates.length === 0) {
      console.log('[M5][DIAG] No candidates loaded by M5__loadConfirmedSignals_.');
      console.log('[M5][DIAG] This is why RISK_CALC stays empty.');
      console.log('[M5][DIAG] ═══════════════════════════════════════');
      return;
    }

    var sampleLimit = 10;
    var approvedSamples = [];
    var rejectedSamples = [];

    var tradesEnteredToday = 0;

    for (var k = 0; k < candidates.length; k++) {
      var sig = candidates[k];
      sig.tradesEnteredToday = tradesEnteredToday;

      var result = M5__calculateRisk_(sig, cfg, port, exp);

      if (result.APPROVED) {
        counts.approved++;
        if (approvedSamples.length < sampleLimit) {
          approvedSamples.push(
            'sigId=' + result.Signal_ID +
            ' sym=' + result.Symbol +
            ' dir=' + result.Direction +
            ' lev=' + result.Chosen_Leverage +
            ' effSize=' + result.Effective_Position_Size +
            ' notional=' + result.Position_Notional_ZAR
          );
        }

        tradesEnteredToday++;
        exp.openPositionsCount++;
        if (result.Chosen_Leverage > 1) exp.leveragedPositionsCount++;
        exp.totalNotionalZar += result.Position_Notional_ZAR;
      } else {
        counts.rejected++;
        if (rejectedSamples.length < sampleLimit) {
          rejectedSamples.push(
            'sigId=' + result.Signal_ID +
            ' sym=' + result.Symbol +
            ' dir=' + result.Direction +
            ' reasons=' + result.Rejection_Reasons
          );
        }
      }
    }

    console.log('[M5][DIAG] ── Risk outcomes ───────────────────────');
    console.log('[M5][DIAG] approved=' + counts.approved);
    console.log('[M5][DIAG] rejected=' + counts.rejected);

    if (approvedSamples.length > 0) {
      console.log('[M5][DIAG] Approved samples:');
      for (var a = 0; a < approvedSamples.length; a++) {
        console.log('[M5][DIAG]   ' + approvedSamples[a]);
      }
    }

    if (rejectedSamples.length > 0) {
      console.log('[M5][DIAG] Rejected samples:');
      for (var b = 0; b < rejectedSamples.length; b++) {
        console.log('[M5][DIAG]   ' + rejectedSamples[b]);
      }
    }

    console.log('[M5][DIAG] ═══════════════════════════════════════');
    console.log('[M5][DIAG] Risk Pipeline Diagnostic Complete');
    console.log('[M5][DIAG] ═══════════════════════════════════════');

  } catch (e) {
    console.error('[M5][DIAG] FATAL: ' + e.message);
    console.error('[M5][DIAG] Stack: ' + e.stack);
  }
}
