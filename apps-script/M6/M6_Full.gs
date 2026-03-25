/**
 * MODULE 6 — Execution Engine
 * M6_Constants.gs
 *
 * Immutable constants and exact 0-based column maps.
 * Single source of truth for M6 schemas and lifecycle thresholds.
 */

var M6_CONST = Object.freeze({
  VERSION: '3.2.1',

  SHEETS: Object.freeze({
    ORDERS     : 'ORDERS',
    POSITIONS  : 'POSITIONS',
    RISK_CALC  : 'RISK_CALC',
    SIGNALS    : 'SIGNALS',
    DATA_CLEAN : 'DATA_CLEAN',
    CONFIG     : 'CONFIG',
    LEVELS     : 'LEVELS'
  }),

  BREAKEVEN_R: 1.5,
  TRAIL_TIGHTEN_R: 5.0,
  TRAIL_TIGHTEN_MULT: 0.75,
  TIMEOUT_CORE: 20,
  TIMEOUT_RUNNER: 40,
  RUNNER_TP2_R_MULT: 3.0
});

var M6_COL = Object.freeze({
  ORDERS: Object.freeze({
    Order_ID                : 0,
    Timestamp_Created       : 1,
    Symbol                  : 2,
    Direction               : 3,
    Order_Type              : 4,
    Portion                 : 5,
    Leverage                : 6,
    Reduce_Only             : 7,
    Intended_Price_Quote    : 8,
    Intended_Size           : 9,
    Fill_Price_Quote        : 10,
    Fill_Price_ZAR          : 11,
    Fill_Size               : 12,
    Slippage_Quote          : 13,
    Fee_ZAR                 : 14,
    Status                  : 15,
    Stop_Placement_Verified : 16,
    Mode                    : 17,
    Linked_Signal_ID        : 18,
    Exchange_Order_ID       : 19
  }),

  POSITIONS: Object.freeze({
    Position_ID                : 0,
    Symbol                     : 1,
    Direction                  : 2,
    Market_Type                : 3,
    Leverage                   : 4,
    Margin_Mode                : 5,
    DQS_Grade                  : 6,
    Entry_Price_Quote          : 7,
    Entry_Price_ZAR            : 8,
    Entry_Timestamp            : 9,
    USDT_ZAR_At_Entry          : 10,
    Total_Size                 : 11,
    Core_Size                  : 12,
    Runner_Size                : 13,
    Core_Status                : 14,
    Runner_Status              : 15,
    Current_Price_Quote        : 16,
    Initial_Stop_Quote         : 17,
    Core_Stop_Quote            : 18,
    Runner_Stop_Quote          : 19,
    Runner_Trail_ATR_Mult      : 20,
    Runner_Best_Price_Quote    : 21,
    Runner_Candles_Since_Best  : 22,
    Take_Profit_1_Quote        : 23,
    Take_Profit_2_Quote        : 24,
    Unrealized_PnL_ZAR         : 25,
    Unrealized_PnL_Pct         : 26,
    Current_R_Multiple         : 27,
    Funding_Accrued_ZAR        : 28,
    Borrow_Accrued_ZAR         : 29,
    Core_Exit_Price_Quote      : 30,
    Core_Exit_Price_ZAR        : 31,
    Core_Exit_Timestamp        : 32,
    Core_Realized_PnL_ZAR      : 33,
    Runner_Exit_Price_Quote    : 34,
    Runner_Exit_Price_ZAR      : 35,
    Runner_Exit_Timestamp      : 36,
    Runner_Realized_PnL_ZAR    : 37,
    Total_Realized_PnL_ZAR     : 38,
    Hold_Duration_Candles      : 39,
    Position_Status            : 40,
    Exit_Reason                : 41,
    MFE_Quote                  : 42,
    MFE_R                      : 43,
    MAE_Quote                  : 44,
    MAE_R                      : 45,
    USDT_ZAR_At_Close          : 46,
    FX_PnL_ZAR                 : 47,
    Liquidation_Price_Source   : 48,
    Is_Leveraged_Slot          : 49,
    MarginFraction_At_Entry    : 50,
    MarginFraction_Lowest      : 51
  }),

  RISK_CALC: Object.freeze({
    Signal_ID                 : 0,
    Symbol                    : 1,
    Direction                 : 2,
    Market_Type               : 3,
    Entry_Price_Est           : 4,
    Stop_Loss                 : 5,
    Stop_Distance_Quote       : 6,
    Chosen_Leverage           : 10,
    Margin_Mode_Used          : 12,
    Liquidation_Price_Source  : 14,
    Effective_Position_Size   : 19,
    Core_Size                 : 21,
    Runner_Size               : 22,
    Core_TP                   : 23,
    Runner_Trail_ATR_Multiple : 24,
    MarginFraction_At_Signal  : 30,
    APPROVED                  : 32
  }),

  SIGNALS: Object.freeze({
    Signal_ID          : 0,
    Timestamp          : 1,
    Symbol             : 2,
    Market_Type        : 3,
    Direction          : 4,
    Close_Price        : 6,
    ATR_14             : 7,
    DQS_Grade          : 23,
    Market_Regime      : 24,
    Final_Signal_State : 25
  }),

  DATA_CLEAN: Object.freeze({
    Timestamp : 0,
    Symbol    : 1,
    Pair      : 2,
    Timeframe : 3,
    Open      : 4,
    High      : 5,
    Low       : 6,
    Close     : 7,
    Volume    : 8,
    Gap_Flag  : 14
  }),

  CONFIG: Object.freeze({
    Parameter : 0,
    Value     : 1
  })
});


/**
 * MODULE 6 — Execution Engine
 * M6_Utils.gs
 *
 * Private utility functions: I/O, config access, state readers, shared helpers.
 */

function M6__ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function M6__getSheet_(name) {
  var sh = M6__ss_().getSheetByName(name);
  if (!sh) throw new Error('[M6] Sheet not found: ' + name);
  return sh;
}

function M6__readAll_(sheetName) {
  var sh = M6__getSheet_(sheetName);
  var lastRow = sh.getLastRow();
  if (lastRow < 1) return [];
  return sh.getDataRange().getValues();
}

function M6__appendRows_(sheetName, rows) {
  if (!rows || rows.length === 0) return;
  var sh = M6__getSheet_(sheetName);
  var nextRow = sh.getLastRow() + 1;
  sh.getRange(nextRow, 1, rows.length, rows[0].length).setValues(rows);
}

function M6__writePositions_(posRows) {
  var sh = M6__getSheet_(M6_CONST.SHEETS.POSITIONS);
  var existingRows = Math.max(0, sh.getLastRow() - 1);

  if (existingRows > 0) {
    sh.getRange(2, 1, existingRows, sh.getLastColumn()).clearContent();
  }

  if (!posRows || posRows.length === 0) return;
  sh.getRange(2, 1, posRows.length, posRows[0].length).setValues(posRows);
}

function M6__nowIso_() {
  return new Date().toISOString();
}

function M6__safeNum_(val) {
  return (val !== null && val !== undefined && isFinite(val)) ? val : '';
}

function M6__generateId_(prefix) {
  var ts = new Date().getTime().toString().slice(-6);
  var rnd = Math.floor(Math.random() * 10000).toString();
  while (rnd.length < 4) rnd = '0' + rnd;
  return prefix + '-' + ts + '-' + rnd;
}





function M6__getMode_() {
  return M6__cfgStr_('System_Mode', 'BACKTEST').toUpperCase();
}

function M6__getUsdtZarRate_() {
  var rate = M6__cfgNum_('USDT_ZAR_Rate', 0);
  if (rate <= 0) rate = M6__cfgNum_('USDT_ZAR_Rate_Source', 18.50);
  return rate > 0 ? rate : 18.50;
}

function M6__getZarFactor_(sym, usdtZar) {
  return (String(sym).toUpperCase().indexOf('USDT') !== -1) ? usdtZar : 1;
}

function M6__getKillSwitch_() {
  return M6__cfgBool_('Kill_Switch', false);
}

function M6__getMarginFraction_() {
  var mode = M6__getMode_();
  if (mode === 'BACKTEST') return 999.0;
  if (mode === 'LIVE') return M6__fetchMarginFraction_();
  return null;
}

function M6__getLatestCandle_(cleanData, sym) {
  var dc = M6_COL.DATA_CLEAN;

  for (var i = cleanData.length - 1; i >= 1; i--) {
    if (String(cleanData[i][dc.Symbol]) === sym &&
        String(cleanData[i][dc.Timeframe]).trim() === '4H') {
      var gapFlag = cleanData[i][dc.Gap_Flag];
      if (gapFlag === true || String(gapFlag).toUpperCase() === 'TRUE') continue;

      var h = parseFloat(cleanData[i][dc.High]);
      var l = parseFloat(cleanData[i][dc.Low]);
      var c = parseFloat(cleanData[i][dc.Close]);

      if (isFinite(h) && isFinite(l) && isFinite(c)) {
        return { high: h, low: l, close: c };
      }
    }
  }

  return null;
}

function M6__hasDuplicatePosition_(sym, dir) {
  try {
    var data = M6__readAll_(M6_CONST.SHEETS.POSITIONS);
    var pc = M6_COL.POSITIONS;

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][pc.Symbol]) === sym &&
          String(data[i][pc.Direction]) === dir) {
        var status = String(data[i][pc.Position_Status] || '').trim();
        if (status === 'OPEN' || status === 'PARTIAL') return true;
      }
    }
  } catch (e) {}

  return false;
}

function M6__findStructureTarget_(sym, dir) {
  try {
    var data = M6__readAll_(M6_CONST.SHEETS.LEVELS);
    if (!data || data.length < 2) return null;

    var header = data[0];
    var hm = {};
    for (var i = 0; i < header.length; i++) {
      hm[String(header[i] || '').trim()] = i;
    }

    var cSym = hm.Symbol;
    var cNextRes = hm.Next_Higher_Resistance;
    var cNextSup = hm.Next_Lower_Support;
    if (cSym === undefined) return null;

    for (var r = data.length - 1; r >= 1; r--) {
      if (String(data[r][cSym] || '') !== sym) continue;

      var px = null;
      if (dir === 'LONG' && cNextRes !== undefined) px = parseFloat(data[r][cNextRes]);
      if (dir === 'SHORT' && cNextSup !== undefined) px = parseFloat(data[r][cNextSup]);

      if (isFinite(px) && px > 0) return px;
      return null;
    }
  } catch (e) {}

  return null;
}


/**
 * MODULE 6 — Execution Engine
 * M6_Execution.gs
 *
 * Processes APPROVED risks into entry orders and initial position rows.
 */

function M6__processApprovedRisks_() {
  console.log('[M6] Processing approved risks...');

  if (M6__getKillSwitch_()) {
    console.log('[M6] Kill Switch ON. Skipping all entries.');
    return;
  }

  var ts = M6__nowIso_();
  var mode = M6__getMode_();
  var usdtZar = M6__getUsdtZarRate_();

  var slipPct = M6__cfgNum_('Slippage_Assumption_Pct', 0.0015);
  var feePct = M6__cfgNum_('Fee_Taker_Pct', 0.001);
  var minSize = M6__cfgNum_('Min_Order_Size_Base', 0.001);
  var structureRoomBufferR = M6__cfgNum_('Structure_Min_Room_Buffer_R', 0.5);
  var failClosedOnStopFailure = M6__cfgBool_('Fail_Closed_On_Stop_Verify_Failure', true);

  var risks = M6__readAll_(M6_CONST.SHEETS.RISK_CALC);
  var signals = M6__readAll_(M6_CONST.SHEETS.SIGNALS);
  var orders = M6__readAll_(M6_CONST.SHEETS.ORDERS);

  var rc = M6_COL.RISK_CALC;
  var sc = M6_COL.SIGNALS;
  var oc = M6_COL.ORDERS;

  var sigMap = {};
  for (var s = 1; s < signals.length; s++) {
    sigMap[String(signals[s][sc.Signal_ID] || '')] = signals[s];
  }

  var processedIds = {};
  for (var o = 1; o < orders.length; o++) {
    var linkedId = String(orders[o][oc.Linked_Signal_ID] || '');
    if (linkedId) processedIds[linkedId] = true;
  }

  var marginFraction = M6__getMarginFraction_();
  var newOrders = [];
  var newPositions = [];

  for (var r = 1; r < risks.length; r++) {
    var riskRow = risks[r];
    if (riskRow[rc.APPROVED] !== true) continue;

    var sigId = String(riskRow[rc.Signal_ID] || '');
    if (!sigId || processedIds[sigId]) continue;

    var sig = sigMap[sigId];
    if (!sig) {
      console.log('[M6] Signal not found for risk: ' + sigId);
      continue;
    }

    var sym = String(riskRow[rc.Symbol] || '');
    var dir = String(riskRow[rc.Direction] || '');
    var mkt = String(riskRow[rc.Market_Type] || '');
    var lev = parseInt(riskRow[rc.Chosen_Leverage], 10) || 1;
    var size = parseFloat(riskRow[rc.Effective_Position_Size]) || 0;
    var entry = parseFloat(riskRow[rc.Entry_Price_Est]) || 0;
    var stop = parseFloat(riskRow[rc.Stop_Loss]) || 0;
    var coreTp = parseFloat(riskRow[rc.Core_TP]) || 0;

    if (size < minSize) {
      console.log('[M6] SKIP ' + sym + ': size ' + size + ' below minimum ' + minSize);
      continue;
    }

    if (!(entry > 0) || !(stop > 0)) {
      console.log('[M6] SKIP ' + sym + ': invalid entry or stop price');
      continue;
    }

    if (M6__hasDuplicatePosition_(sym, dir)) {
      console.log('[M6] SKIP ' + sym + ' ' + dir + ': duplicate position already open');
      continue;
    }

    var stopDist = Math.abs(entry - stop);
    var structureTarget = M6__findStructureTarget_(sym, dir);
    if (isFinite(structureTarget) && structureTarget > 0 && stopDist > 0 && coreTp > 0) {
      var roomR = (dir === 'LONG')
        ? ((structureTarget - entry) / stopDist)
        : ((entry - structureTarget) / stopDist);
      var tp1R = Math.abs(coreTp - entry) / stopDist;

      if (roomR > 0 && roomR < (tp1R + structureRoomBufferR)) {
        console.log('[M6] SKIP ' + sym + ' ' + dir + ': insufficient structure room. roomR=' +
          roomR.toFixed(2) + ' < tp1R+buffer=' + (tp1R + structureRoomBufferR).toFixed(2));
        continue;
      }
    }

    var fillPrice = entry;
    var slippage = 0;
    var exOrderId = '';
    var stopVerified = false;
    var orderStatus = 'FILLED';

    if (mode === 'LIVE') {
      var liveRes = M6__executeLiveMarketOrder_(sym, dir, size, mkt);

      if (!liveRes.success) {
        console.error('[M6] LIVE order FAILED for ' + sym + ': ' + liveRes.error);
        orderStatus = 'FAILED';

        var failFillZar = entry * M6__getZarFactor_(sym, usdtZar);
        var failFeeZar = entry * size * feePct * M6__getZarFactor_(sym, usdtZar);

        newOrders.push(M6__buildEntryOrderRow_(
          ts, sym, dir, lev, entry, size,
          entry, failFillZar, size, 0, failFeeZar,
          orderStatus, false, mode, sigId, ''
        ));
        continue;
      }

      exOrderId = liveRes.orderId || '';
      if (liveRes.avgPrice && isFinite(liveRes.avgPrice)) {
        fillPrice = liveRes.avgPrice;
      }

      slippage = Math.abs(fillPrice - entry);

      var stopRes = M6__placeAndVerifyServerStop_(sym, dir, size, stop, mkt);
      stopVerified = stopRes.verified;

      if (!stopVerified) {
        console.error('[M6] CRITICAL: Stop placement failed for ' + sym);

        try {
          if (typeof M1_ksOn === 'function') M1_ksOn('STOP_ORDER_FAILED_' + sym);
        } catch (e1) {}

        if (failClosedOnStopFailure) {
          var failClosedFillZar = fillPrice * M6__getZarFactor_(sym, usdtZar);
          var failClosedFeeZar = fillPrice * size * feePct * M6__getZarFactor_(sym, usdtZar);

          newOrders.push(M6__buildEntryOrderRow_(
            ts, sym, dir, lev, entry, size,
            fillPrice, failClosedFillZar, size, slippage, failClosedFeeZar,
            'FAILED_STOP_VERIFY', false, mode, sigId, exOrderId
          ));
          continue;
        }
      }
    } else {
      var slipFactor = (dir === 'LONG') ? (1 + slipPct) : (1 - slipPct);
      fillPrice = entry * slipFactor;
      slippage = Math.abs(fillPrice - entry);
      stopVerified = true;
    }

    var zarFactor = M6__getZarFactor_(sym, usdtZar);
    var fillZar = fillPrice * zarFactor;
    var feeZar = fillPrice * size * feePct * zarFactor;

    newOrders.push(M6__buildEntryOrderRow_(
      ts, sym, dir, lev, entry, size,
      fillPrice, fillZar, size, slippage, feeZar,
      orderStatus, stopVerified, mode, sigId, exOrderId
    ));

    if (orderStatus === 'FILLED') {
      newPositions.push(M6__buildPositionRow_(
        ts, sym, dir, mkt, lev, sig, riskRow, fillPrice, usdtZar, marginFraction
      ));

      console.log('[M6] EXECUTED ' + sigId + ': ' + sym + ' ' + dir +
        ' @ ' + fillPrice.toFixed(4) + ' size=' + size.toFixed(6));
    }
  }

  if (newOrders.length > 0) {
    M6__appendRows_(M6_CONST.SHEETS.ORDERS, newOrders);
  }

  if (newPositions.length > 0) {
    M6__appendRows_(M6_CONST.SHEETS.POSITIONS, newPositions);
  }

  console.log('[M6] Entry processing complete. Orders: ' + newOrders.length +
    ' | Positions: ' + newPositions.length);
}

function M6__buildEntryOrderRow_(ts, sym, dir, lev, intendedPrice, intendedSize,
  fillPrice, fillZar, fillSize, slippage, feeZar, status, stopVerified,
  mode, sigId, exOrderId) {
  var oc = M6_COL.ORDERS;
  var row = new Array(20).fill('');

  row[oc.Order_ID] = M6__generateId_('ORD');
  row[oc.Timestamp_Created] = ts;
  row[oc.Symbol] = sym;
  row[oc.Direction] = dir;
  row[oc.Order_Type] = 'MARKET';
  row[oc.Portion] = 'FULL';
  row[oc.Leverage] = lev;
  row[oc.Reduce_Only] = false;
  row[oc.Intended_Price_Quote] = M6__safeNum_(intendedPrice);
  row[oc.Intended_Size] = M6__safeNum_(intendedSize);
  row[oc.Fill_Price_Quote] = M6__safeNum_(fillPrice);
  row[oc.Fill_Price_ZAR] = M6__safeNum_(fillZar);
  row[oc.Fill_Size] = M6__safeNum_(fillSize);
  row[oc.Slippage_Quote] = M6__safeNum_(slippage);
  row[oc.Fee_ZAR] = M6__safeNum_(feeZar);
  row[oc.Status] = status;
  row[oc.Stop_Placement_Verified] = stopVerified;
  row[oc.Mode] = mode;
  row[oc.Linked_Signal_ID] = sigId;
  row[oc.Exchange_Order_ID] = exOrderId;

  return row;
}

function M6__buildPositionRow_(ts, sym, dir, mkt, lev, sig, riskRow, fillPrice, usdtZar, marginFraction) {
  var pc = M6_COL.POSITIONS;
  var rc = M6_COL.RISK_CALC;
  var sc = M6_COL.SIGNALS;
  var row = new Array(52).fill('');

  var zarFactor = M6__getZarFactor_(sym, usdtZar);
  var stop = parseFloat(riskRow[rc.Stop_Loss]) || 0;
  var coreSize = parseFloat(riskRow[rc.Core_Size]) || 0;
  var runnerSize = parseFloat(riskRow[rc.Runner_Size]) || 0;
  var totalSize = parseFloat(riskRow[rc.Effective_Position_Size]) || 0;
  var tp1 = parseFloat(riskRow[rc.Core_TP]) || 0;
  var stopDist = Math.abs(fillPrice - stop);

  var defaultLongTrail = M6__cfgNum_('Long_Trail_ATR_Mult', 2.0);
  var defaultShortTrail = M6__cfgNum_('Short_Trail_ATR_Mult', 1.5);
  var trailMult = (dir === 'SHORT') ? defaultShortTrail : defaultLongTrail;

  var tp2 = 0;
  var structureTarget = M6__findStructureTarget_(sym, dir);
  if (isFinite(structureTarget) && structureTarget > 0) {
    tp2 = structureTarget;
  } else {
    tp2 = (dir === 'LONG')
      ? fillPrice + (M6_CONST.RUNNER_TP2_R_MULT * stopDist)
      : fillPrice - (M6_CONST.RUNNER_TP2_R_MULT * stopDist);
  }

  row[pc.Position_ID] = M6__generateId_('POS');
  row[pc.Symbol] = sym;
  row[pc.Direction] = dir;
  row[pc.Market_Type] = mkt;
  row[pc.Leverage] = lev;
  row[pc.Margin_Mode] = String(riskRow[rc.Margin_Mode_Used] || 'CROSS');
  row[pc.DQS_Grade] = String(sig[sc.DQS_Grade] || '');
  row[pc.Entry_Price_Quote] = M6__safeNum_(fillPrice);
  row[pc.Entry_Price_ZAR] = M6__safeNum_(fillPrice * zarFactor);
  row[pc.Entry_Timestamp] = ts;
  row[pc.USDT_ZAR_At_Entry] = M6__safeNum_(usdtZar);
  row[pc.Total_Size] = M6__safeNum_(totalSize);
  row[pc.Core_Size] = M6__safeNum_(coreSize);
  row[pc.Runner_Size] = M6__safeNum_(runnerSize);
  row[pc.Core_Status] = coreSize > 0 ? 'OPEN' : 'CLOSED';
  row[pc.Runner_Status] = runnerSize > 0 ? 'OPEN' : 'CLOSED';
  row[pc.Current_Price_Quote] = M6__safeNum_(fillPrice);
  row[pc.Initial_Stop_Quote] = M6__safeNum_(stop);
  row[pc.Core_Stop_Quote] = M6__safeNum_(stop);
  row[pc.Runner_Stop_Quote] = M6__safeNum_(stop);
  row[pc.Runner_Trail_ATR_Mult] = M6__safeNum_(trailMult);
  row[pc.Runner_Best_Price_Quote] = M6__safeNum_(fillPrice);
  row[pc.Runner_Candles_Since_Best] = 0;
  row[pc.Take_Profit_1_Quote] = M6__safeNum_(tp1);
  row[pc.Take_Profit_2_Quote] = M6__safeNum_(tp2);
  row[pc.Unrealized_PnL_ZAR] = 0;
  row[pc.Unrealized_PnL_Pct] = 0;
  row[pc.Current_R_Multiple] = 0;
  row[pc.Funding_Accrued_ZAR] = 0;
  row[pc.Borrow_Accrued_ZAR] = 0;
  row[pc.Core_Exit_Price_Quote] = '';
  row[pc.Core_Exit_Price_ZAR] = '';
  row[pc.Core_Exit_Timestamp] = '';
  row[pc.Core_Realized_PnL_ZAR] = '';
  row[pc.Runner_Exit_Price_Quote] = '';
  row[pc.Runner_Exit_Price_ZAR] = '';
  row[pc.Runner_Exit_Timestamp] = '';
  row[pc.Runner_Realized_PnL_ZAR] = '';
  row[pc.Total_Realized_PnL_ZAR] = 0;
  row[pc.Hold_Duration_Candles] = 0;
  row[pc.Position_Status] = 'OPEN';
  row[pc.Exit_Reason] = '';
  row[pc.MFE_Quote] = 0;
  row[pc.MFE_R] = 0;
  row[pc.MAE_Quote] = 0;
  row[pc.MAE_R] = 0;
  row[pc.USDT_ZAR_At_Close] = '';
  row[pc.FX_PnL_ZAR] = '';
  row[pc.Liquidation_Price_Source] = String(riskRow[rc.Liquidation_Price_Source] || 'PROXY_ESTIMATE');
  row[pc.Is_Leveraged_Slot] = (lev > 1);

  var mf = marginFraction;
  if (!isFinite(mf) || mf <= 0) mf = parseFloat(riskRow[rc.MarginFraction_At_Signal]) || '';
  row[pc.MarginFraction_At_Entry] = M6__safeNum_(mf);
  row[pc.MarginFraction_Lowest] = M6__safeNum_(mf);

  return row;
}

function M6__buildExitOrderRow_(pos, portion, exitSize, exitPrice, usdtZar, ts) {
  var pc = M6_COL.POSITIONS;
  var oc = M6_COL.ORDERS;
  var row = new Array(20).fill('');

  var sym = String(pos[pc.Symbol] || '');
  var dir = String(pos[pc.Direction] || '');
  var exitDir = (dir === 'LONG') ? 'SHORT' : 'LONG';
  var zarFactor = M6__getZarFactor_(sym, usdtZar);

  row[oc.Order_ID] = M6__generateId_('EXT');
  row[oc.Timestamp_Created] = ts;
  row[oc.Symbol] = sym;
  row[oc.Direction] = exitDir;
  row[oc.Order_Type] = 'MARKET';
  row[oc.Portion] = portion;
  row[oc.Leverage] = pos[pc.Leverage];
  row[oc.Reduce_Only] = true;
  row[oc.Intended_Price_Quote] = M6__safeNum_(exitPrice);
  row[oc.Intended_Size] = M6__safeNum_(exitSize);
  row[oc.Fill_Price_Quote] = M6__safeNum_(exitPrice);
  row[oc.Fill_Price_ZAR] = M6__safeNum_(exitPrice * zarFactor);
  row[oc.Fill_Size] = M6__safeNum_(exitSize);
  row[oc.Slippage_Quote] = 0;
  row[oc.Fee_ZAR] = M6__safeNum_(exitPrice * exitSize * M6__cfgNum_('Fee_Taker_Pct', 0.001) * zarFactor);
  row[oc.Status] = 'FILLED';
  row[oc.Stop_Placement_Verified] = false;
  row[oc.Mode] = M6__getMode_();
  row[oc.Linked_Signal_ID] = '';
  row[oc.Exchange_Order_ID] = '';

  return row;
}


/**
 * MODULE 6 — Execution Engine
 * M6_PositionManager.gs
 *
 * Position lifecycle management.
 */

function M6__manageOpenPositions_() {
  console.log('[M6] Managing open positions...');

  var ts = M6__nowIso_();
  var usdtZar = M6__getUsdtZarRate_();
  var mfFloor = M6__cfgNum_('MarginFraction_Floor_Pct', 300);
  var atrMult = M6__cfgNum_('ATR_Stop_Multiple', 1.5);
  var longTrailStartR = M6__cfgNum_('Long_Trail_Start_R', 3.0);
  var shortTrailStartR = M6__cfgNum_('Short_Trail_Start_R', 1.5);

  var mf = M6__getMarginFraction_();
  var mfKillTriggered = false;

  if (mf !== null && isFinite(mf) && mf <= mfFloor) {
    mfKillTriggered = true;
    console.error('[M6] RULE 16: marginFraction ' + mf.toFixed(0) +
      '% <= floor ' + mfFloor + '%. Force-closing leveraged positions.');
    try {
      if (typeof M1_ksOn === 'function') M1_ksOn('MARGIN_FRACTION_FLOOR_BREACHED');
    } catch (e) {}
  }

  var posData = M6__readAll_(M6_CONST.SHEETS.POSITIONS);
  var cleanData = M6__readAll_(M6_CONST.SHEETS.DATA_CLEAN);
  var pc = M6_COL.POSITIONS;

  var exitOrders = [];
  var updatedRows = [];

  for (var i = 1; i < posData.length; i++) {
    var pos = posData[i];
    var status = String(pos[pc.Position_Status] || '').trim();

    if (status !== 'OPEN' && status !== 'PARTIAL') {
      updatedRows.push(pos);
      continue;
    }

    var sym = String(pos[pc.Symbol] || '');
    var dir = String(pos[pc.Direction] || '');
    var entry = parseFloat(pos[pc.Entry_Price_Quote]) || 0;
    var initStop = parseFloat(pos[pc.Initial_Stop_Quote]) || 0;
    var stopDist = Math.abs(entry - initStop);

    var isLeveraged = (
      pos[pc.Is_Leveraged_Slot] === true ||
      String(pos[pc.Is_Leveraged_Slot]).toUpperCase() === 'TRUE'
    );

    var latest = M6__getLatestCandle_(cleanData, sym);
    if (!latest) {
      updatedRows.push(pos);
      continue;
    }

    var zarFactor = M6__getZarFactor_(sym, usdtZar);

    pos[pc.Current_Price_Quote] = M6__safeNum_(latest.close);

    var hold = (parseInt(pos[pc.Hold_Duration_Candles], 10) || 0) + 1;
    pos[pc.Hold_Duration_Candles] = hold;

    var currentR = 0;
    if (stopDist > 0) {
      currentR = (dir === 'LONG')
        ? (latest.close - entry) / stopDist
        : (entry - latest.close) / stopDist;
    }
    pos[pc.Current_R_Multiple] = M6__safeNum_(currentR);

    var prevMfe = parseFloat(pos[pc.MFE_Quote]) || 0;
    var prevMae = parseFloat(pos[pc.MAE_Quote]) || 0;
    var newMfe = prevMfe;
    var newMae = prevMae;

    if (dir === 'LONG') {
      if (latest.high - entry > newMfe) newMfe = latest.high - entry;
      if (entry - latest.low > newMae) newMae = entry - latest.low;
    } else {
      if (entry - latest.low > newMfe) newMfe = entry - latest.low;
      if (latest.high - entry > newMae) newMae = latest.high - entry;
    }

    pos[pc.MFE_Quote] = M6__safeNum_(newMfe);
    pos[pc.MAE_Quote] = M6__safeNum_(newMae);
    pos[pc.MFE_R] = stopDist > 0 ? M6__safeNum_(newMfe / stopDist) : 0;
    pos[pc.MAE_R] = stopDist > 0 ? M6__safeNum_(newMae / stopDist) : 0;

    var totalSize = parseFloat(pos[pc.Total_Size]) || 0;
    var unrealPnlQuote = (dir === 'LONG')
      ? (latest.close - entry) * totalSize
      : (entry - latest.close) * totalSize;
    var unrealPnlZar = unrealPnlQuote * zarFactor;
    pos[pc.Unrealized_PnL_ZAR] = M6__safeNum_(unrealPnlZar);

    var entryNotional = entry * totalSize * zarFactor;
    pos[pc.Unrealized_PnL_Pct] = entryNotional > 0
      ? M6__safeNum_((unrealPnlZar / entryNotional) * 100)
      : 0;

    if (mf !== null && isFinite(mf)) {
      var lowestMf = parseFloat(pos[pc.MarginFraction_Lowest]);
      if (!isFinite(lowestMf) || mf < lowestMf) {
        pos[pc.MarginFraction_Lowest] = M6__safeNum_(mf);
      }
    }

    var forceExit = (mfKillTriggered && isLeveraged);
    var atr = (atrMult > 0) ? (stopDist / atrMult) : stopDist;

    // CORE
    var coreStat = String(pos[pc.Core_Status] || '').trim();
    if (coreStat === 'OPEN') {
      var coreStop = parseFloat(pos[pc.Core_Stop_Quote]) || initStop;
      var tp1 = parseFloat(pos[pc.Take_Profit_1_Quote]) || 0;
      var coreSize = parseFloat(pos[pc.Core_Size]) || 0;

      if (currentR >= M6_CONST.BREAKEVEN_R) {
        if (Math.abs(coreStop - entry) > 0.00000001) {
          pos[pc.Core_Stop_Quote] = M6__safeNum_(entry);
          coreStop = entry;
        }
      }

      var coreTpHit = (dir === 'LONG' && latest.high >= tp1) ||
                      (dir === 'SHORT' && latest.low <= tp1);
      var coreStopHit = (dir === 'LONG' && latest.low <= coreStop) ||
                        (dir === 'SHORT' && latest.high >= coreStop);
      var coreMfeR = stopDist > 0 ? (newMfe / stopDist) : 0;
      var coreTimeout = (hold >= M6_CONST.TIMEOUT_CORE && coreMfeR < 1.0);

      if (forceExit || coreTpHit || coreStopHit || coreTimeout) {
        var coreExitPrice = forceExit ? latest.close
          : coreTpHit ? tp1
          : coreStopHit ? coreStop
          : latest.close;

        var coreReason = forceExit ? 'LIQUIDATION_PROTECT'
          : coreTpHit ? 'TP1'
          : coreStopHit ? 'STOP'
          : 'TIMEOUT';

        M6__closePortion_(pos, 'CORE', coreExitPrice, zarFactor, ts, coreReason);
        exitOrders.push(M6__buildExitOrderRow_(pos, 'CORE', coreSize, coreExitPrice, usdtZar, ts));
      }
    }

    // RUNNER
    var runStat = String(pos[pc.Runner_Status] || '').trim();
    if (runStat === 'OPEN') {
      var runStop = parseFloat(pos[pc.Runner_Stop_Quote]) || initStop;
      var runSize = parseFloat(pos[pc.Runner_Size]) || 0;
      var trailMult = parseFloat(pos[pc.Runner_Trail_ATR_Mult]) || 0;
      var bestPrice = parseFloat(pos[pc.Runner_Best_Price_Quote]);
      if (!isFinite(bestPrice) || bestPrice <= 0) bestPrice = entry;

      var candlesSinceBest = parseInt(pos[pc.Runner_Candles_Since_Best], 10) || 0;
      var newBest = false;

      if (dir === 'LONG' && latest.close > bestPrice) {
        newBest = true;
        bestPrice = latest.close;
        pos[pc.Runner_Best_Price_Quote] = M6__safeNum_(bestPrice);
      } else if (dir === 'SHORT' && latest.close < bestPrice) {
        newBest = true;
        bestPrice = latest.close;
        pos[pc.Runner_Best_Price_Quote] = M6__safeNum_(bestPrice);
      }

      candlesSinceBest = newBest ? 0 : (candlesSinceBest + 1);
      pos[pc.Runner_Candles_Since_Best] = candlesSinceBest;

      if (currentR >= M6_CONST.BREAKEVEN_R) {
        if (Math.abs(runStop - entry) > 0.00000001) {
          pos[pc.Runner_Stop_Quote] = M6__safeNum_(entry);
          runStop = entry;
        }
      }

      var trailStartR = (dir === 'SHORT') ? shortTrailStartR : longTrailStartR;
      if (currentR >= trailStartR && trailMult > 0 && atr > 0) {
        var trailedStop = (dir === 'LONG')
          ? bestPrice - (trailMult * atr)
          : bestPrice + (trailMult * atr);

        if ((dir === 'LONG' && trailedStop > runStop) ||
            (dir === 'SHORT' && trailedStop < runStop)) {
          pos[pc.Runner_Stop_Quote] = M6__safeNum_(trailedStop);
          runStop = trailedStop;
        }
      }

      if (currentR >= M6_CONST.TRAIL_TIGHTEN_R && trailMult > 1.0) {
        var tightened = trailMult * M6_CONST.TRAIL_TIGHTEN_MULT;
        pos[pc.Runner_Trail_ATR_Mult] = M6__safeNum_(tightened);
        trailMult = tightened;
      }

      var runStopHit = (dir === 'LONG' && latest.low <= runStop) ||
                       (dir === 'SHORT' && latest.high >= runStop);
      var runTimeout = (candlesSinceBest >= M6_CONST.TIMEOUT_RUNNER);

      if (forceExit || runStopHit || runTimeout) {
        var runExitPrice = forceExit ? latest.close : runStopHit ? runStop : latest.close;
        var runReason = forceExit ? 'LIQUIDATION_PROTECT'
          : runStopHit ? 'TRAILING'
          : 'TIMEOUT';

        M6__closePortion_(pos, 'RUNNER', runExitPrice, zarFactor, ts, runReason);
        exitOrders.push(M6__buildExitOrderRow_(pos, 'RUNNER', runSize, runExitPrice, usdtZar, ts));
      }
    }

    var finalCore = String(pos[pc.Core_Status] || '').trim();
    var finalRunner = String(pos[pc.Runner_Status] || '').trim();

    if (finalCore === 'CLOSED' && finalRunner === 'CLOSED') {
      pos[pc.Position_Status] = 'CLOSED';
      pos[pc.USDT_ZAR_At_Close] = M6__safeNum_(usdtZar);

      var cReal = parseFloat(pos[pc.Core_Realized_PnL_ZAR]) || 0;
      var rReal = parseFloat(pos[pc.Runner_Realized_PnL_ZAR]) || 0;
      pos[pc.Total_Realized_PnL_ZAR] = M6__safeNum_(cReal + rReal);
    } else if (finalCore === 'CLOSED' || finalRunner === 'CLOSED') {
      pos[pc.Position_Status] = 'PARTIAL';
    } else {
      pos[pc.Position_Status] = 'OPEN';
    }

    updatedRows.push(pos);
  }

  M6__writePositions_(updatedRows);

  if (exitOrders.length > 0) {
    M6__appendRows_(M6_CONST.SHEETS.ORDERS, exitOrders);
  }

  console.log('[M6] Position management complete. Processed: ' +
    updatedRows.length + ' | Exits: ' + exitOrders.length);
}

function M6__closePortion_(pos, portion, exitPrice, zarFactor, ts, reason) {
  var pc = M6_COL.POSITIONS;
  var dir = String(pos[pc.Direction] || '');
  var entry = parseFloat(pos[pc.Entry_Price_Quote]) || 0;

  if (portion === 'CORE' || portion === 'FULL') {
    if (String(pos[pc.Core_Status] || '').trim() !== 'CLOSED') {
      var coreSize = parseFloat(pos[pc.Core_Size]) || 0;
      var corePnlQ = (dir === 'LONG')
        ? (exitPrice - entry) * coreSize
        : (entry - exitPrice) * coreSize;

      pos[pc.Core_Status] = 'CLOSED';
      pos[pc.Core_Exit_Price_Quote] = M6__safeNum_(exitPrice);
      pos[pc.Core_Exit_Price_ZAR] = M6__safeNum_(exitPrice * zarFactor);
      pos[pc.Core_Exit_Timestamp] = ts;
      pos[pc.Core_Realized_PnL_ZAR] = M6__safeNum_(corePnlQ * zarFactor);
    }
  }

  if (portion === 'RUNNER' || portion === 'FULL') {
    if (String(pos[pc.Runner_Status] || '').trim() !== 'CLOSED') {
      var runSize = parseFloat(pos[pc.Runner_Size]) || 0;
      var runPnlQ = (dir === 'LONG')
        ? (exitPrice - entry) * runSize
        : (entry - exitPrice) * runSize;

      pos[pc.Runner_Status] = 'CLOSED';
      pos[pc.Runner_Exit_Price_Quote] = M6__safeNum_(exitPrice);
      pos[pc.Runner_Exit_Price_ZAR] = M6__safeNum_(exitPrice * zarFactor);
      pos[pc.Runner_Exit_Timestamp] = ts;
      pos[pc.Runner_Realized_PnL_ZAR] = M6__safeNum_(runPnlQ * zarFactor);
    }
  }

  pos[pc.Exit_Reason] = reason;
}



/**
 * MODULE 6 — Execution Engine
 * M6_ValrApi.gs
 *
 * LIVE-mode API wrappers. Gracefully degrade in BACKTEST/PAPER.
 */

function M6__executeLiveMarketOrder_(sym, dir, size, mktType) {
  try {
    if (typeof M2__executeRequest_ !== 'function') {
      return {
        success: false,
        orderId: '',
        avgPrice: null,
        error: 'M2 API wrapper not loaded'
      };
    }

    var pair = String(sym || '').replace(/\//g, '').toUpperCase();
    var side = (dir === 'LONG') ? 'BUY' : 'SELL';
    var endpoint = (mktType === 'PERP')
      ? '/v1/perpetual/market'
      : '/v1/margin/market';

    var payload = {
      side: side,
      pair: pair,
      baseAmount: size.toFixed(8)
    };

    var res = M2__executeRequest_('POST', endpoint, payload, true);

    return {
      success: true,
      orderId: res && res.id ? String(res.id) : '',
      avgPrice: (res && isFinite(parseFloat(res.avgPrice))) ? parseFloat(res.avgPrice) : null,
      error: ''
    };
  } catch (e) {
    console.error('[M6] LIVE order exception: ' + e.message);
    return {
      success: false,
      orderId: '',
      avgPrice: null,
      error: e.message
    };
  }
}

function M6__placeAndVerifyServerStop_(sym, dir, size, stopPrice, mktType) {
  var mode = M6__getMode_();

  if (mode !== 'LIVE') {
    return {
      verified: true,
      error: '',
      orderId: '',
      pair: String(sym || '').replace(/\//g, '').toUpperCase(),
      stopSide: (dir === 'LONG') ? 'SELL' : 'BUY',
      stopPrice: stopPrice,
      matchedOrder: null
    };
  }

  var pair = String(sym || '').replace(/\//g, '').toUpperCase();
  var stopSide = (dir === 'LONG') ? 'SELL' : 'BUY';
  var endpoint = (mktType === 'PERP') ? '/v1/perpetual/stop' : '/v1/margin/stop';

  try {
    if (typeof M2__executeRequest_ !== 'function') {
      return {
        verified: false,
        error: 'M2 API wrapper not loaded',
        orderId: '',
        pair: pair,
        stopSide: stopSide,
        stopPrice: stopPrice,
        matchedOrder: null
      };
    }

    var payload = {
      side: stopSide,
      pair: pair,
      baseAmount: size.toFixed(8),
      stopPrice: stopPrice.toFixed(8),
      type: 'STOP_LOSS',
      reduceOnly: true
    };

    var placeRes = M2__executeRequest_('POST', endpoint, payload, true);
    var orderId = (placeRes && placeRes.id) ? String(placeRes.id) : '';

    Utilities.sleep(2000);

    var tolerancePx = Math.max(0.0001, Math.abs(stopPrice) * 0.0005);
    var toleranceQty = Math.max(0.00000001, Math.abs(size) * 0.001);

    for (var retry = 0; retry < 3; retry++) {
      try {
        var openOrders = M2__executeRequest_('GET', '/v1/orders/open', null, true);

        for (var j = 0; j < openOrders.length; j++) {
          var o = openOrders[j];

          var oPair = String(o.pair || '').toUpperCase();
          var oSide = String(o.side || '').toUpperCase();
          var oStopPrice = parseFloat(o.stopPrice);
          var oBaseAmount = parseFloat(o.baseAmount || o.quantity || o.size || 0);

          var stopMatches = isFinite(oStopPrice) && Math.abs(oStopPrice - stopPrice) <= tolerancePx;
          var qtyMatches = isFinite(oBaseAmount) ? (Math.abs(oBaseAmount - size) <= toleranceQty) : true;

          var reduceOnlyMatches = true;
          if (o.hasOwnProperty('reduceOnly')) {
            reduceOnlyMatches = (o.reduceOnly === true || String(o.reduceOnly).toUpperCase() === 'TRUE');
          }

          if (oPair === pair &&
              oSide === stopSide &&
              stopMatches &&
              qtyMatches &&
              reduceOnlyMatches) {
            return {
              verified: true,
              error: '',
              orderId: orderId || String(o.id || ''),
              pair: pair,
              stopSide: stopSide,
              stopPrice: stopPrice,
              matchedOrder: o
            };
          }
        }
      } catch (pollErr) {
        console.warn('[M6] Stop verify retry ' + (retry + 1) + ': ' + pollErr.message);
      }

      Utilities.sleep(1000);
    }

    return {
      verified: false,
      error: 'Stop not found in open orders after 3 retries',
      orderId: orderId,
      pair: pair,
      stopSide: stopSide,
      stopPrice: stopPrice,
      matchedOrder: null
    };
  } catch (e) {
    console.error('[M6] Stop placement exception: ' + e.message);
    return {
      verified: false,
      error: e.message,
      orderId: '',
      pair: pair,
      stopSide: stopSide,
      stopPrice: stopPrice,
      matchedOrder: null
    };
  }
}

function M6__fetchMarginFraction_() {
  try {
    if (typeof M2__executeRequest_ !== 'function') return null;
    var res = M2__executeRequest_('GET', '/v1/account/margins', null, true);
    if (res && res.marginFraction !== undefined) {
      return parseFloat(res.marginFraction) * 100;
    }
  } catch (e) {
    console.warn('[M6] marginFraction fetch failed: ' + e.message);
  }
  return null;
}

/**
 * MODULE 6 — Execution Engine
 * M6_Engine.gs
 *
 * Public orchestrator.
 */

function M6_runExecutionCycle() {
  console.log('[M6] ═══════════════════════════════════════');
  console.log('[M6] Execution Cycle Starting (v' + M6_CONST.VERSION + ')');
  console.log('[M6] Mode: ' + M6__getMode_());
  console.log('[M6] ═══════════════════════════════════════');

  try {
    M6__processApprovedRisks_();
    M6__manageOpenPositions_();
  } catch (e) {
    console.error('[M6] FATAL: ' + e.message);
    console.error('[M6] Stack: ' + e.stack);

    try {
      if (typeof M1_ksOn === 'function') M1_ksOn('M6_EXECUTION_FATAL');
    } catch (ksErr) {}
  }

  console.log('[M6] ═══════════════════════════════════════');
  console.log('[M6] Execution Cycle Complete');
  console.log('[M6] ═══════════════════════════════════════');
}


/**
 * MODULE 6 — Execution Engine
 * M6_Tests.gs
 *
 * Validation tests for schemas and critical helpers.
 */

function M6_testRunAll() {
  console.log('╔═════════════════════════════════════════════╗');
  console.log('║ MODULE 6 TEST SUITE v' + M6_CONST.VERSION + ' ║');
  console.log('╚═════════════════════════════════════════════╝');

  var results = [];

  function assert_(name, cond) {
    results.push({ name: name, pass: !!cond });
  }

  try {
    var oSh = M6__getSheet_(M6_CONST.SHEETS.ORDERS);
    var oHr = oSh.getRange(1, 1, 1, 20).getValues()[0];
    assert_('Schema: ORDERS has 20 columns', oHr.length === 20);
    assert_('Schema: ORDERS col 0 = Order_ID', String(oHr[0]).trim() === 'Order_ID');
    assert_('Schema: ORDERS col 19 = Exchange_Order_ID', String(oHr[19]).trim() === 'Exchange_Order_ID');
  } catch (e1) {
    assert_('Schema ORDERS: ' + e1.message, false);
  }

  try {
    var pSh = M6__getSheet_(M6_CONST.SHEETS.POSITIONS);
    var pHr = pSh.getRange(1, 1, 1, 52).getValues()[0];
    assert_('Schema: POSITIONS has 52 columns', pHr.length === 52);
    assert_('Schema: POSITIONS col 0 = Position_ID', String(pHr[0]).trim() === 'Position_ID');
    assert_('Schema: POSITIONS col 40 = Position_Status', String(pHr[40]).trim() === 'Position_Status');
    assert_('Schema: POSITIONS col 51 = MarginFraction_Lowest', String(pHr[51]).trim() === 'MarginFraction_Lowest');
  } catch (e2) {
    assert_('Schema POSITIONS: ' + e2.message, false);
  }

  var id1 = M6__generateId_('ORD');
  var id2 = M6__generateId_('POS');
  var id3 = M6__generateId_('EXT');

  assert_('ID: ORD prefix correct', id1.indexOf('ORD-') === 0);
  assert_('ID: POS prefix correct', id2.indexOf('POS-') === 0);
  assert_('ID: EXT prefix correct', id3.indexOf('EXT-') === 0);
  assert_('ID: Sufficient length', id1.length >= 10);
  assert_('ID: Unique (ORD vs POS)', id1 !== id2);

  assert_('SafeNum: Valid number passes through', M6__safeNum_(3.14) === 3.14);
  assert_('SafeNum: Zero passes through', M6__safeNum_(0) === 0);
  assert_('SafeNum: Null returns empty string', M6__safeNum_(null) === '');
  assert_('SafeNum: Undefined returns empty string', M6__safeNum_(undefined) === '');
  assert_('SafeNum: NaN returns empty string', M6__safeNum_(NaN) === '');
  assert_('SafeNum: Infinity returns empty string', M6__safeNum_(Infinity) === '');
  assert_('SafeNum: -Infinity returns empty string', M6__safeNum_(-Infinity) === '');

  var zarFactorUsdt = M6__getZarFactor_('BTC/USDT', 18.50);
  var zarFactorZar = M6__getZarFactor_('BTC/ZAR', 18.50);
  assert_('ZarFactor: USDT pair returns rate', zarFactorUsdt === 18.50);
  assert_('ZarFactor: ZAR pair returns 1', zarFactorZar === 1);

  var mode = M6__getMode_();
  assert_('Config: Mode returns valid value', mode === 'BACKTEST' || mode === 'PAPER' || mode === 'LIVE');

  assert_('Const: BREAKEVEN_R = 1.5', M6_CONST.BREAKEVEN_R === 1.5);
  assert_('Const: TRAIL_TIGHTEN_R = 5.0', M6_CONST.TRAIL_TIGHTEN_R === 5.0);
  assert_('Const: TRAIL_TIGHTEN_MULT = 0.75', M6_CONST.TRAIL_TIGHTEN_MULT === 0.75);
  assert_('Const: TIMEOUT_CORE = 20', M6_CONST.TIMEOUT_CORE === 20);
  assert_('Const: TIMEOUT_RUNNER = 40', M6_CONST.TIMEOUT_RUNNER === 40);

  assert_('ColMap: ORDERS last col = 19', M6_COL.ORDERS.Exchange_Order_ID === 19);
  assert_('ColMap: POSITIONS last col = 51', M6_COL.POSITIONS.MarginFraction_Lowest === 51);
  assert_('ColMap: POSITIONS Position_Status = 40', M6_COL.POSITIONS.Position_Status === 40);
  assert_('ColMap: RISK_CALC APPROVED = 32', M6_COL.RISK_CALC.APPROVED === 32);

  var mockPos = new Array(52).fill('');
  var pc = M6_COL.POSITIONS;
  mockPos[pc.Direction] = 'LONG';
  mockPos[pc.Entry_Price_Quote] = 100;
  mockPos[pc.Core_Size] = 2;
  mockPos[pc.Runner_Size] = 1;
  mockPos[pc.Core_Status] = 'OPEN';
  mockPos[pc.Runner_Status] = 'OPEN';

  M6__closePortion_(mockPos, 'CORE', 110, 1, '2026-01-01T00:00:00.000Z', 'TP1');
  assert_('ClosePortion: CORE closes core only', String(mockPos[pc.Core_Status]) === 'CLOSED');
  assert_('ClosePortion: CORE leaves runner open', String(mockPos[pc.Runner_Status]) === 'OPEN');
  assert_('ClosePortion: CORE realized pnl set', parseFloat(mockPos[pc.Core_Realized_PnL_ZAR]) === 20);

  var pass = 0;
  var fail = 0;

  for (var r = 0; r < results.length; r++) {
    if (results[r].pass) {
      pass++;
      console.log(' ✓ ' + results[r].name);
    } else {
      fail++;
      console.log(' ✗ ' + results[r].name);
    }
  }

  console.log('─────────────────────────────────────────────');
  if (fail === 0) {
    console.log(' ✅ ALL TESTS PASSED (' + pass + '/' + pass + ')');
  } else {
    console.log(' ❌ ' + fail + ' FAILED (' + pass + ' passed)');
  }
}


/**
 * MODULE 6 — Diagnostic
 *
 * Full read-only diagnostic for the M6 entry pipeline.
 * Explains why M6__processApprovedRisks_() produced 0 orders / 0 positions.
 *
 * Run:
 *   M6_diagEntryPipeline()
 */
function M6_diagEntryPipeline() {
  console.log('[M6][DIAG] ═══════════════════════════════════════');
  console.log('[M6][DIAG] Entry Pipeline Diagnostic Starting');
  console.log('[M6][DIAG] ═══════════════════════════════════════');

  try {
    var mode = M6__getMode_();
    var usdtZar = M6__getUsdtZarRate_();
    var killSwitch = M6__getKillSwitch_();

    var slipPct = M6__cfgNum_('Slippage_Assumption_Pct', 0.0015);
    var feePct = M6__cfgNum_('Fee_Taker_Pct', 0.001);
    var minSize = M6__cfgNum_('Min_Order_Size_Base', 0.001);
    var structureRoomBufferR = M6__cfgNum_('Structure_Min_Room_Buffer_R', 0.5);
    var failClosedOnStopFailure = M6__cfgBool_('Fail_Closed_On_Stop_Verify_Failure', true);

    console.log('[M6][DIAG] Mode=' + mode +
      ' | KillSwitch=' + killSwitch +
      ' | USDT/ZAR=' + usdtZar +
      ' | SlipPct=' + slipPct +
      ' | FeePct=' + feePct +
      ' | MinSize=' + minSize +
      ' | StructureBufferR=' + structureRoomBufferR +
      ' | FailClosedOnStopVerify=' + failClosedOnStopFailure);

    var risks = M6__readAll_(M6_CONST.SHEETS.RISK_CALC);
    var signals = M6__readAll_(M6_CONST.SHEETS.SIGNALS);
    var orders = M6__readAll_(M6_CONST.SHEETS.ORDERS);
    var positions = M6__readAll_(M6_CONST.SHEETS.POSITIONS);

    var rc = M6_COL.RISK_CALC;
    var sc = M6_COL.SIGNALS;
    var oc = M6_COL.ORDERS;
    var pc = M6_COL.POSITIONS;

    console.log('[M6][DIAG] Sheet rows | RISK_CALC=' + Math.max(0, risks.length - 1) +
      ' | SIGNALS=' + Math.max(0, signals.length - 1) +
      ' | ORDERS=' + Math.max(0, orders.length - 1) +
      ' | POSITIONS=' + Math.max(0, positions.length - 1));

    if (killSwitch) {
      console.log('[M6][DIAG] HARD STOP: Kill Switch is TRUE. M6 will skip all entries.');
      console.log('[M6][DIAG] ═══════════════════════════════════════');
      return;
    }

    var sigMap = {};
    for (var s = 1; s < signals.length; s++) {
      var sid = String(signals[s][sc.Signal_ID] || '');
      if (sid) sigMap[sid] = signals[s];
    }

    var processedIds = {};
    for (var o = 1; o < orders.length; o++) {
      var linkedId = String(orders[o][oc.Linked_Signal_ID] || '');
      if (linkedId) processedIds[linkedId] = true;
    }

    var openPosMap = {};
    for (var p = 1; p < positions.length; p++) {
      var posSym = String(positions[p][pc.Symbol] || '');
      var posDir = String(positions[p][pc.Direction] || '');
      var posStatus = String(positions[p][pc.Position_Status] || '').trim();
      if ((posStatus === 'OPEN' || posStatus === 'PARTIAL') && posSym && posDir) {
        openPosMap[posSym + '|' + posDir] = true;
      }
    }

    var counters = {
      totalRiskRows: Math.max(0, risks.length - 1),
      approvedBoolTrue: 0,
      approvedStringTrue: 0,
      approvedNumericOne: 0,
      approvedOtherTruthy: 0,
      approvedRejectedByStrictCheck: 0,

      missingSignalId: 0,
      alreadyProcessed: 0,
      signalMissing: 0,
      sizeTooSmall: 0,
      invalidEntryOrStop: 0,
      duplicatePosition: 0,
      structureRejected: 0,

      wouldPassToExecution: 0
    };

    var samples = {
      approvedRejectedByStrictCheck: [],
      alreadyProcessed: [],
      signalMissing: [],
      sizeTooSmall: [],
      invalidEntryOrStop: [],
      duplicatePosition: [],
      structureRejected: [],
      wouldPassToExecution: []
    };

    function pushSample_(bucket, msg) {
      if (samples[bucket] && samples[bucket].length < 10) {
        samples[bucket].push(msg);
      }
    }

    for (var r = 1; r < risks.length; r++) {
      var riskRow = risks[r];
      var rawApproved = riskRow[rc.APPROVED];

      if (rawApproved === true) {
        counters.approvedBoolTrue++;
      } else if (String(rawApproved).trim().toUpperCase() === 'TRUE') {
        counters.approvedStringTrue++;
      } else if (rawApproved === 1 || String(rawApproved).trim() === '1') {
        counters.approvedNumericOne++;
      } else if (rawApproved) {
        counters.approvedOtherTruthy++;
      }

      if (rawApproved !== true) {
        if (rawApproved === 'TRUE' || String(rawApproved).trim().toUpperCase() === 'TRUE' ||
            rawApproved === 1 || String(rawApproved).trim() === '1') {
          counters.approvedRejectedByStrictCheck++;
          pushSample_(
            'approvedRejectedByStrictCheck',
            'row=' + (r + 1) + ' signalId=' + String(riskRow[rc.Signal_ID] || '') +
            ' APPROVED raw=' + String(rawApproved) + ' type=' + typeof rawApproved
          );
        }
        continue;
      }

      var sigId = String(riskRow[rc.Signal_ID] || '');
      if (!sigId) {
        counters.missingSignalId++;
        continue;
      }

      if (processedIds[sigId]) {
        counters.alreadyProcessed++;
        pushSample_(
          'alreadyProcessed',
          'row=' + (r + 1) + ' signalId=' + sigId
        );
        continue;
      }

      var sig = sigMap[sigId];
      if (!sig) {
        counters.signalMissing++;
        pushSample_(
          'signalMissing',
          'row=' + (r + 1) + ' signalId=' + sigId
        );
        continue;
      }

      var sym = String(riskRow[rc.Symbol] || '');
      var dir = String(riskRow[rc.Direction] || '');
      var size = parseFloat(riskRow[rc.Effective_Position_Size]) || 0;
      var entry = parseFloat(riskRow[rc.Entry_Price_Est]) || 0;
      var stop = parseFloat(riskRow[rc.Stop_Loss]) || 0;
      var coreTp = parseFloat(riskRow[rc.Core_TP]) || 0;

      if (size < minSize) {
        counters.sizeTooSmall++;
        pushSample_(
          'sizeTooSmall',
          'row=' + (r + 1) + ' signalId=' + sigId + ' sym=' + sym + ' size=' + size + ' min=' + minSize
        );
        continue;
      }

      if (!(entry > 0) || !(stop > 0)) {
        counters.invalidEntryOrStop++;
        pushSample_(
          'invalidEntryOrStop',
          'row=' + (r + 1) + ' signalId=' + sigId + ' sym=' + sym +
          ' entry=' + entry + ' stop=' + stop
        );
        continue;
      }

      if (openPosMap[sym + '|' + dir]) {
        counters.duplicatePosition++;
        pushSample_(
          'duplicatePosition',
          'row=' + (r + 1) + ' signalId=' + sigId + ' sym=' + sym + ' dir=' + dir
        );
        continue;
      }

      var stopDist = Math.abs(entry - stop);
      var structureTarget = M6__findStructureTarget_(sym, dir);

      if (isFinite(structureTarget) && structureTarget > 0 && stopDist > 0 && coreTp > 0) {
        var roomR = (dir === 'LONG')
          ? ((structureTarget - entry) / stopDist)
          : ((entry - structureTarget) / stopDist);
        var tp1R = Math.abs(coreTp - entry) / stopDist;

        if (roomR > 0 && roomR < (tp1R + structureRoomBufferR)) {
          counters.structureRejected++;
          pushSample_(
            'structureRejected',
            'row=' + (r + 1) + ' signalId=' + sigId + ' sym=' + sym + ' dir=' + dir +
            ' roomR=' + roomR.toFixed(2) +
            ' tp1R=' + tp1R.toFixed(2) +
            ' req=' + (tp1R + structureRoomBufferR).toFixed(2)
          );
          continue;
        }
      }

      counters.wouldPassToExecution++;
      pushSample_(
        'wouldPassToExecution',
        'row=' + (r + 1) + ' signalId=' + sigId + ' sym=' + sym + ' dir=' + dir +
        ' size=' + size + ' entry=' + entry + ' stop=' + stop
      );
    }

    console.log('[M6][DIAG] ── Approval shape ─────────────────────────');
    console.log('[M6][DIAG] approvedBoolTrue=' + counters.approvedBoolTrue);
    console.log('[M6][DIAG] approvedStringTrue=' + counters.approvedStringTrue);
    console.log('[M6][DIAG] approvedNumericOne=' + counters.approvedNumericOne);
    console.log('[M6][DIAG] approvedOtherTruthy=' + counters.approvedOtherTruthy);
    console.log('[M6][DIAG] approvedRejectedByStrictCheck=' + counters.approvedRejectedByStrictCheck);

    console.log('[M6][DIAG] ── Pipeline blockers ───────────────────────');
    console.log('[M6][DIAG] missingSignalId=' + counters.missingSignalId);
    console.log('[M6][DIAG] alreadyProcessed=' + counters.alreadyProcessed);
    console.log('[M6][DIAG] signalMissing=' + counters.signalMissing);
    console.log('[M6][DIAG] sizeTooSmall=' + counters.sizeTooSmall);
    console.log('[M6][DIAG] invalidEntryOrStop=' + counters.invalidEntryOrStop);
    console.log('[M6][DIAG] duplicatePosition=' + counters.duplicatePosition);
    console.log('[M6][DIAG] structureRejected=' + counters.structureRejected);

    console.log('[M6][DIAG] ── Survivors ───────────────────────────────');
    console.log('[M6][DIAG] wouldPassToExecution=' + counters.wouldPassToExecution);

    function logSamples_(title, arr) {
      if (!arr || arr.length === 0) return;
      console.log('[M6][DIAG] ' + title + ':');
      for (var i = 0; i < arr.length; i++) {
        console.log('[M6][DIAG]   ' + arr[i]);
      }
    }

    logSamples_('Samples approvedRejectedByStrictCheck', samples.approvedRejectedByStrictCheck);
    logSamples_('Samples alreadyProcessed', samples.alreadyProcessed);
    logSamples_('Samples signalMissing', samples.signalMissing);
    logSamples_('Samples sizeTooSmall', samples.sizeTooSmall);
    logSamples_('Samples invalidEntryOrStop', samples.invalidEntryOrStop);
    logSamples_('Samples duplicatePosition', samples.duplicatePosition);
    logSamples_('Samples structureRejected', samples.structureRejected);
    logSamples_('Samples wouldPassToExecution', samples.wouldPassToExecution);

    console.log('[M6][DIAG] ═══════════════════════════════════════');
    console.log('[M6][DIAG] Entry Pipeline Diagnostic Complete');
    console.log('[M6][DIAG] ═══════════════════════════════════════');

  } catch (e) {
    console.error('[M6][DIAG] FATAL: ' + e.message);
    console.error('[M6][DIAG] Stack: ' + e.stack);
  }
}



// ── CONFIG Readers
// Minimal safe patch: reads CONFIG sheet, then overlays M6_CFG_OVERRIDE from Document Properties.

var M6__cfgCache_ = null;

function M6__clearCfgCache_() {
  M6__cfgCache_ = null;
}

function M6__cfgLoadMap_() {
  if (M6__cfgCache_) return M6__cfgCache_;

  var out = {};
  try {
    var data = M6__readAll_(M6_CONST.SHEETS.CONFIG);
    var cc = M6_COL.CONFIG;
    for (var i = 1; i < data.length; i++) {
      var key = String(data[i][cc.Parameter] || '').trim();
      if (!key) continue;
      out[key] = data[i][cc.Value];
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

    var raw = props.getProperty('M6_CFG_OVERRIDE');
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

  M6__cfgCache_ = out;
  return out;
}

function M6__cfgNum_(key, defaultVal) {
  try {
    var cfg = M6__cfgLoadMap_();
    if (cfg.hasOwnProperty(key)) {
      var v = cfg[key];
      var s = String(v === null || v === undefined ? '' : v).trim();

      if (s.charAt(s.length - 1) === '%') {
        var pct = parseFloat(s);
        return isFinite(pct) ? pct / 100 : defaultVal;
      }

      var n = parseFloat(s);
      return isFinite(n) ? n : defaultVal;
    }
  } catch (e) {}
  return defaultVal;
}

function M6__cfgStr_(key, defaultVal) {
  try {
    var cfg = M6__cfgLoadMap_();
    if (cfg.hasOwnProperty(key)) {
      var s = String(cfg[key] === null || cfg[key] === undefined ? '' : cfg[key]).trim();
      return s !== '' ? s : defaultVal;
    }
  } catch (e) {}
  return defaultVal;
}

function M6__cfgBool_(key, defaultVal) {
  try {
    var cfg = M6__cfgLoadMap_();
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


function RUN__getProps_() {
  try {
    return PropertiesService.getDocumentProperties();
  } catch (e) {
    return PropertiesService.getScriptProperties();
  }
}

function RUN_clearOverrideCaches() {
  try {
    if (typeof M3__clearCfgCache_ === 'function') M3__clearCfgCache_();
  } catch (e1) {}

  try {
    if (typeof M4__clearCfgCache_ === 'function') M4__clearCfgCache_();
  } catch (e2) {}

  try {
    if (typeof M6__clearCfgCache_ === 'function') M6__clearCfgCache_();
  } catch (e3) {}
}

function RUN_setOverride_(propKey, obj) {
  if (!propKey) throw new Error('propKey required');
  RUN__getProps_().setProperty(propKey, JSON.stringify(obj || {}));
  RUN_clearOverrideCaches();
  SpreadsheetApp.flush();
}

function RUN_clearOverride_(propKey) {
  if (!propKey) throw new Error('propKey required');
  RUN__getProps_().deleteProperty(propKey);
  RUN_clearOverrideCaches();
  SpreadsheetApp.flush();
}

function RUN_getOverride_(propKey) {
  if (!propKey) throw new Error('propKey required');
  var raw = RUN__getProps_().getProperty(propKey);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}




function RUN_restoreAllOverridesNow() {
  var props = RUN__getProps_();
  props.deleteProperty('M9_CFG_OVERRIDE');
  props.deleteProperty('M4_CFG_OVERRIDE');
  props.deleteProperty('M6_CFG_OVERRIDE');
  RUN_clearOverrideCaches();
  SpreadsheetApp.flush();
  Logger.log('[RUN] Cleared M9/M4/M6 override properties.');
}




function RUN__expStateKey_() {
  return 'RUN_EXPERIMENT_MATRIX_STATE';
}

function RUN__expTriggerTag_() {
  return 'RUN_experimentMatrix_resumableContinue';
}

function RUN__expRescueTriggerTag_() {
  return 'RUN_experimentMatrix_rescueContinue';
}

function RUN__expSaveState_(state) {
  RUN__getProps_().setProperty(RUN__expStateKey_(), JSON.stringify(state || {}));
}

function RUN__expLoadState_() {
  var raw = RUN__getProps_().getProperty(RUN__expStateKey_());
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    Logger.log('[EXP][WARN] Could not parse experiment state JSON: ' + e.message);
    return null;
  }
}

function RUN__expDeleteState_() {
  RUN__getProps_().deleteProperty(RUN__expStateKey_());
}

function RUN__expDeleteContinueTriggers_() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === RUN__expTriggerTag_()) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}


function RUN__expDeleteRescueTriggers_() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === RUN__expRescueTriggerTag_()) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}


function RUN__expEnsureContinueTrigger_() {
  RUN__expDeleteContinueTriggers_();
  ScriptApp.newTrigger(RUN__expTriggerTag_())
    .timeBased()
    .after(60 * 1000)
    .create();
}


function RUN__expEnsureRescueTrigger_() {
  RUN__expDeleteRescueTriggers_();
  ScriptApp.newTrigger(RUN__expRescueTriggerTag_())
    .timeBased()
    .after(7 * 60 * 1000)
    .create();
}


function RUN__expClearAllTriggers_() {
  RUN__expDeleteContinueTriggers_();
  RUN__expDeleteRescueTriggers_();
}


function RUN__expInitStateFields_(state) {
  if (!state) return state;
  if (state.idx === undefined || state.idx === null) state.idx = 0;
  if (state.lastCompletedIdx === undefined) state.lastCompletedIdx = -1;
  if (state.lastCompletedAt === undefined) state.lastCompletedAt = '';
  if (state.activeJobIdx === undefined) state.activeJobIdx = -1;
  if (state.activeJobStartedAt === undefined) state.activeJobStartedAt = '';
  if (state.status === undefined) state.status = 'RUNNING';
  if (!state.jobs) state.jobs = [];
  return state;
}


function RUN__expBuildJobs_(opts) {
  opts = opts || {};

  var name = String(opts.name || 'MULTI_STRAT').trim();
  var universeMode = String(opts.universeMode || 'MAJORS_ONLY').trim().toUpperCase();
  var invertProfiles = !!opts.invertProfiles;

  var profiles = opts.strategyProfiles || [
    'BREAKOUT_LONG',
    'TREND_PULLBACK_LONG',
    'LOOSE_MOMO_LONG',
    'FAKEOUT_SHORT',
    'EXHAUSTION_FADE_SHORT',
    'BREAKDOWN_SHORT'
  ];

  var expandVariants = (opts.expandVariants !== undefined) ? !!opts.expandVariants : false;
  var variantMode = String(opts.variantMode || 'STANDARD').trim().toUpperCase();

  var jobs = [];
  var dedupe = {};

  function deepCopy_(o) {
    return JSON.parse(JSON.stringify(o || {}));
  }

  function clamp_(x, lo, hi) {
    x = parseFloat(x);
    if (!isFinite(x)) x = lo;
    if (x < lo) return lo;
    if (x > hi) return hi;
    return x;
  }

  function intClamp_(x, lo, hi) {
    x = Math.round(parseFloat(x));
    if (!isFinite(x)) x = lo;
    if (x < lo) return lo;
    if (x > hi) return hi;
    return x;
  }

  function normalizeOv_(ov) {
    ov = deepCopy_(ov);

    ov.DQS_Gate_V2 = intClamp_(ov.DQS_Gate_V2, 10, 60);
    ov.V2_Retest_Window_Candles = intClamp_(ov.V2_Retest_Window_Candles, 3, 12);
    ov.V2_Retest_Max_Deviation_ATR = clamp_(ov.V2_Retest_Max_Deviation_ATR, 0.50, 1.50);
    ov.Volume_Multiplier_Threshold = clamp_(ov.Volume_Multiplier_Threshold, 0.80, 1.50);
    ov.RSI_Overbought_Long = intClamp_(ov.RSI_Overbought_Long, 50, 90);
    ov.V2_Confirmation_Body_Min_Frac = clamp_(ov.V2_Confirmation_Body_Min_Frac, 0.00, 0.60);
    ov.V2_Breakout_Buffer_ATR = clamp_(ov.V2_Breakout_Buffer_ATR, 0.00, 0.20);

    ov.Invert_All_Signals = !!ov.Invert_All_Signals;
    ov.V2_Long_Only = !!ov.V2_Long_Only;

    if (ov.Invert_All_Signals === true && ov.V2_Long_Only === true) {
      ov.V2_Long_Only = false;
    }

    return ov;
  }

  function stableKey_(ov) {
    ov = normalizeOv_(ov);
    return [
      String(ov.Strategy_Profile || ''),
      String(ov.Universe_Mode || ''),
      String(ov.Invert_All_Signals),
      String(ov.V2_Long_Only),
      String(ov.DQS_Gate_V2),
      String(ov.V2_Retest_Window_Candles),
      String(ov.V2_Retest_Max_Deviation_ATR),
      String(ov.Volume_Multiplier_Threshold),
      String(ov.RSI_Overbought_Long),
      String(ov.V2_Confirmation_Body_Min_Frac),
      String(ov.V2_Breakout_Buffer_ATR)
    ].join('|');
  }

  function pushJob_(label, mode, ov) {
    ov = normalizeOv_(ov);

    var key = stableKey_(ov);
    if (dedupe[key]) return;
    dedupe[key] = true;

    jobs.push({
      runName: name + ' | ' + label,
      mode: mode,
      ov: deepCopy_(ov)
    });
  }

  function buildProfileBase_(profileName, uniMode) {
    var p = String(profileName || '').trim().toUpperCase();
    var u = String(uniMode || universeMode).trim().toUpperCase();

    if (p === 'BREAKOUT_LONG') {
      return {
        label: 'BREAKOUT_LONG',
        ov: {
          Strategy_Profile: 'BREAKOUT_LONG',
          Universe_Mode: u,
          DQS_Gate_V2: 25,
          V2_Retest_Window_Candles: 6,
          V2_Retest_Max_Deviation_ATR: 0.75,
          Volume_Multiplier_Threshold: 1.10,
          RSI_Overbought_Long: 65,
          V2_Confirmation_Body_Min_Frac: 0.35,
          V2_Breakout_Buffer_ATR: 0.05,
          Invert_All_Signals: false,
          V2_Long_Only: true
        }
      };
    }

    if (p === 'TREND_PULLBACK_LONG') {
      return {
        label: 'TREND_PULLBACK_LONG',
        ov: {
          Strategy_Profile: 'TREND_PULLBACK_LONG',
          Universe_Mode: u,
          DQS_Gate_V2: 22,
          V2_Retest_Window_Candles: 8,
          V2_Retest_Max_Deviation_ATR: 1.00,
          Volume_Multiplier_Threshold: 1.00,
          RSI_Overbought_Long: 60,
          V2_Confirmation_Body_Min_Frac: 0.25,
          V2_Breakout_Buffer_ATR: 0.00,
          Invert_All_Signals: false,
          V2_Long_Only: true
        }
      };
    }

    if (p === 'LOOSE_MOMO_LONG') {
      return {
        label: 'LOOSE_MOMO_LONG',
        ov: {
          Strategy_Profile: 'LOOSE_MOMO_LONG',
          Universe_Mode: u,
          DQS_Gate_V2: 18,
          V2_Retest_Window_Candles: 6,
          V2_Retest_Max_Deviation_ATR: 1.00,
          Volume_Multiplier_Threshold: 1.00,
          RSI_Overbought_Long: 72,
          V2_Confirmation_Body_Min_Frac: 0.25,
          V2_Breakout_Buffer_ATR: 0.00,
          Invert_All_Signals: false,
          V2_Long_Only: true
        }
      };
    }

    if (p === 'FAKEOUT_SHORT') {
      return {
        label: 'FAKEOUT_SHORT',
        ov: {
          Strategy_Profile: 'FAKEOUT_SHORT',
          Universe_Mode: u,
          DQS_Gate_V2: 20,
          V2_Retest_Window_Candles: 6,
          V2_Retest_Max_Deviation_ATR: 0.75,
          Volume_Multiplier_Threshold: 1.00,
          RSI_Overbought_Long: 75,
          V2_Confirmation_Body_Min_Frac: 0.30,
          V2_Breakout_Buffer_ATR: 0.05,
          Invert_All_Signals: true,
          V2_Long_Only: false
        }
      };
    }

    if (p === 'EXHAUSTION_FADE_SHORT') {
      return {
        label: 'EXHAUSTION_FADE_SHORT',
        ov: {
          Strategy_Profile: 'EXHAUSTION_FADE_SHORT',
          Universe_Mode: u,
          DQS_Gate_V2: 18,
          V2_Retest_Window_Candles: 6,
          V2_Retest_Max_Deviation_ATR: 1.00,
          Volume_Multiplier_Threshold: 1.20,
          RSI_Overbought_Long: 80,
          V2_Confirmation_Body_Min_Frac: 0.25,
          V2_Breakout_Buffer_ATR: 0.00,
          Invert_All_Signals: true,
          V2_Long_Only: false
        }
      };
    }

    if (p === 'BREAKDOWN_SHORT') {
      return {
        label: 'BREAKDOWN_SHORT',
        ov: {
          Strategy_Profile: 'BREAKDOWN_SHORT',
          Universe_Mode: u,
          DQS_Gate_V2: 25,
          V2_Retest_Window_Candles: 8,
          V2_Retest_Max_Deviation_ATR: 0.75,
          Volume_Multiplier_Threshold: 1.10,
          RSI_Overbought_Long: 60,
          V2_Confirmation_Body_Min_Frac: 0.35,
          V2_Breakout_Buffer_ATR: 0.05,
          Invert_All_Signals: true,
          V2_Long_Only: false
        }
      };
    }

    return null;
  }

  function emitPersistenceHunt_() {
    var segments = [
      'MAJORS_ONLY',
      'BTC_ONLY',
      'ETH_ONLY',
      'MAJORS_EX_BTC_ETH'
    ];

    var looseMomoInvBase = {
      Strategy_Profile: 'LOOSE_MOMO_LONG',
      Universe_Mode: 'MAJORS_ONLY',
      DQS_Gate_V2: 20,
      V2_Retest_Window_Candles: 5,
      V2_Retest_Max_Deviation_ATR: 0.97,
      Volume_Multiplier_Threshold: 0.28,
      RSI_Overbought_Long: 72,
      V2_Confirmation_Body_Min_Frac: 0.01,
      V2_Breakout_Buffer_ATR: 0.00,
      Invert_All_Signals: true,
      V2_Long_Only: false
    };

    var fakeoutShortBase = {
      Strategy_Profile: 'FAKEOUT_SHORT',
      Universe_Mode: 'MAJORS_ONLY',
      DQS_Gate_V2: 23,
      V2_Retest_Window_Candles: 6,
      V2_Retest_Max_Deviation_ATR: 1.08,
      Volume_Multiplier_Threshold: 0.30,
      RSI_Overbought_Long: 70,
      V2_Confirmation_Body_Min_Frac: 0.05,
      V2_Breakout_Buffer_ATR: 0.00,
      Invert_All_Signals: true,
      V2_Long_Only: false
    };

    var looseVariants = [
      { tag: 'R1', dqs: 0,  win: 0,  dev: 0.00, vol: 0.00, rsi: 0,  body: 0.00, buf: 0.00 },
      { tag: 'R2', dqs: 2,  win: 0,  dev: -0.05, vol: 0.02, rsi: -2, body: 0.00, buf: 0.00 },
      { tag: 'R3', dqs: -2, win: 1,  dev: 0.05, vol: -0.03, rsi: 2,  body: 0.00, buf: 0.00 },
      { tag: 'R4', dqs: 0,  win: -1, dev: 0.00, vol: 0.05, rsi: -1, body: 0.00, buf: 0.01 }
    ];

    var fakeVariants = [
      { tag: 'R1', dqs: 0,  win: 0,  dev: 0.00, vol: 0.00, rsi: 0,  body: 0.00, buf: 0.00 },
      { tag: 'R2', dqs: 2,  win: 0,  dev: -0.08, vol: 0.04, rsi: -2, body: 0.00, buf: 0.00 },
      { tag: 'R3', dqs: -2, win: 1,  dev: 0.08, vol: -0.02, rsi: 2,  body: 0.00, buf: 0.00 },
      { tag: 'R4', dqs: 0,  win: -1, dev: 0.00, vol: 0.06, rsi: -1, body: 0.00, buf: 0.02 }
    ];

    function applyVariant_(baseOv, k) {
      var ov = deepCopy_(baseOv);

      ov.DQS_Gate_V2 = (+ov.DQS_Gate_V2 || 0) + (k.dqs || 0);
      ov.V2_Retest_Window_Candles = (+ov.V2_Retest_Window_Candles || 6) + (k.win || 0);
      ov.V2_Retest_Max_Deviation_ATR = (+ov.V2_Retest_Max_Deviation_ATR || 1.0) + (k.dev || 0);
      ov.Volume_Multiplier_Threshold = (+ov.Volume_Multiplier_Threshold || 1.0) + (k.vol || 0);
      ov.V2_Confirmation_Body_Min_Frac = (+ov.V2_Confirmation_Body_Min_Frac || 0.25) + (k.body || 0);
      ov.RSI_Overbought_Long = (+ov.RSI_Overbought_Long || 65) + (k.rsi || 0);
      ov.V2_Breakout_Buffer_ATR = (+ov.V2_Breakout_Buffer_ATR || 0.0) + (k.buf || 0);

      return normalizeOv_(ov);
    }

    for (var s = 0; s < segments.length; s++) {
      var seg = segments[s];

      for (var i = 0; i < looseVariants.length; i++) {
        var lov = applyVariant_(looseMomoInvBase, looseVariants[i]);
        lov.Universe_Mode = seg;
        pushJob_('LOOSE_MOMO_LONG | INVERTED_MIRROR | ' + looseVariants[i].tag, 'PERSISTENCE_HUNT', lov);
      }

      for (var j = 0; j < fakeVariants.length; j++) {
        var fov = applyVariant_(fakeoutShortBase, fakeVariants[j]);
        fov.Universe_Mode = seg;
        pushJob_('FAKEOUT_SHORT | ' + fakeVariants[j].tag, 'PERSISTENCE_HUNT', fov);
      }
    }
  }

  function buildStandardVariants_() {
    return [
      { tag: 'BASE',      dqs: 0,  win: 0,  dev: 0.00, vol: 0.00, body: 0.00, rsi: 0,  buf: 0.00 },
      { tag: 'TIGHT',     dqs: 3,  win: -1, dev: -0.10, vol: 0.05, body: 0.05, rsi: -3, buf: 0.02 },
      { tag: 'LOOSE',     dqs: -3, win: 1,  dev: 0.10, vol: -0.05, body: -0.05, rsi: 3,  buf: -0.02 },
      { tag: 'QUAL_BIAS', dqs: 1,  win: 0,  dev: -0.05, vol: 0.10, body: 0.03, rsi: -2, buf: 0.00 }
    ];
  }

  function buildDenseVariants_() {
    return [
      { tag: 'V01', dqs: -6, win:  2, dev:  0.15, vol: -0.10, body: -0.08, rsi:  4, buf: -0.03 },
      { tag: 'V02', dqs: -4, win:  1, dev:  0.10, vol: -0.08, body: -0.05, rsi:  3, buf: -0.02 },
      { tag: 'V03', dqs: -3, win:  1, dev:  0.08, vol: -0.05, body: -0.05, rsi:  2, buf: -0.02 },
      { tag: 'V04', dqs: -2, win:  1, dev:  0.05, vol: -0.03, body: -0.03, rsi:  1, buf: -0.01 },
      { tag: 'V05', dqs: -1, win:  0, dev:  0.03, vol: -0.02, body: -0.02, rsi:  1, buf:  0.00 },
      { tag: 'V06', dqs:  0, win:  0, dev:  0.00, vol:  0.00, body:  0.00, rsi:  0, buf:  0.00 },
      { tag: 'V07', dqs:  1, win:  0, dev: -0.03, vol:  0.02, body:  0.02, rsi: -1, buf:  0.00 },
      { tag: 'V08', dqs:  2, win: -1, dev: -0.05, vol:  0.03, body:  0.03, rsi: -1, buf:  0.01 },
      { tag: 'V09', dqs:  3, win: -1, dev: -0.08, vol:  0.05, body:  0.05, rsi: -2, buf:  0.01 },
      { tag: 'V10', dqs:  4, win: -1, dev: -0.10, vol:  0.08, body:  0.06, rsi: -3, buf:  0.02 },
      { tag: 'V11', dqs:  5, win: -2, dev: -0.12, vol:  0.10, body:  0.08, rsi: -4, buf:  0.02 },
      { tag: 'V12', dqs:  6, win: -2, dev: -0.15, vol:  0.12, body:  0.10, rsi: -5, buf:  0.03 },
      { tag: 'V13', dqs: -5, win:  2, dev:  0.12, vol: -0.12, body: -0.06, rsi:  5, buf: -0.03 },
      { tag: 'V14', dqs: -3, win:  2, dev:  0.10, vol: -0.07, body: -0.04, rsi:  3, buf: -0.02 },
      { tag: 'V15', dqs: -1, win:  1, dev:  0.06, vol: -0.02, body: -0.01, rsi:  2, buf: -0.01 },
      { tag: 'V16', dqs:  1, win: -1, dev: -0.06, vol:  0.04, body:  0.03, rsi: -2, buf:  0.01 }
    ];
  }

  function applyVariant_(baseOv, k) {
    var ov = deepCopy_(baseOv);

    ov.DQS_Gate_V2 = (+ov.DQS_Gate_V2 || 0) + (k.dqs || 0);
    ov.V2_Retest_Window_Candles = (+ov.V2_Retest_Window_Candles || 6) + (k.win || 0);
    ov.V2_Retest_Max_Deviation_ATR = (+ov.V2_Retest_Max_Deviation_ATR || 1.0) + (k.dev || 0);
    ov.Volume_Multiplier_Threshold = (+ov.Volume_Multiplier_Threshold || 1.0) + (k.vol || 0);
    ov.V2_Confirmation_Body_Min_Frac = (+ov.V2_Confirmation_Body_Min_Frac || 0.25) + (k.body || 0);
    ov.RSI_Overbought_Long = (+ov.RSI_Overbought_Long || 65) + (k.rsi || 0);
    ov.V2_Breakout_Buffer_ATR = (+ov.V2_Breakout_Buffer_ATR || 0.0) + (k.buf || 0);

    return normalizeOv_(ov);
  }

  function emitStandardOrDense_(label, mode, baseOv) {
    var variants = (mode === 'DENSE') ? buildDenseVariants_() : buildStandardVariants_();

    if (!expandVariants) {
      pushJob_(label, 'PROFILE', normalizeOv_(baseOv));
      return;
    }

    for (var i = 0; i < variants.length; i++) {
      var ov = applyVariant_(baseOv, variants[i]);
      pushJob_(label + ' | ' + variants[i].tag, 'PROFILE', ov);
    }
  }

  function profileResearchGrid_(baseOv) {
    var p = String(baseOv.Strategy_Profile || '').toUpperCase();
    var out = [];

    function addCombo_(tag, dqs, win, vol, body, rsi, buf, dev) {
      out.push({
        tag: tag,
        dqs: dqs,
        win: win,
        vol: vol,
        body: body,
        rsi: rsi,
        buf: buf,
        dev: dev
      });
    }

    if (p === 'BREAKOUT_LONG') {
      var dqsA = [-4, 0, 4];
      var winA = [-1, 0, 1];
      var volA = [-0.05, 0.00, 0.10];
      var bodyA = [-0.05, 0.00, 0.05];
      var rsiA = [-4, 0, 4];
      var bufA = [-0.03, 0.00, 0.03];
      var devA = [-0.10, 0.00, 0.10];

      for (var a1 = 0; a1 < dqsA.length; a1++) {
        for (var a2 = 0; a2 < winA.length; a2++) {
          for (var a3 = 0; a3 < volA.length; a3++) {
            addCombo_(
              'R' + (out.length + 1),
              dqsA[a1],
              winA[a2],
              volA[a3],
              bodyA[(a1 + a2 + a3) % bodyA.length],
              rsiA[(a2 + a3) % rsiA.length],
              bufA[(a1 + a3) % bufA.length],
              devA[(a1 + a2 + a3) % devA.length]
            );
          }
        }
      }
    } else if (p === 'TREND_PULLBACK_LONG') {
      var dqsB = [-3, 0, 3];
      var winB = [-2, 0, 2];
      var volB = [-0.05, 0.00, 0.05];
      var bodyB = [-0.03, 0.00, 0.03];
      var rsiB = [-3, 0, 3];
      var bufB = [0.00, 0.02];
      var devB = [-0.10, 0.00, 0.10];

      for (var b1 = 0; b1 < dqsB.length; b1++) {
        for (var b2 = 0; b2 < winB.length; b2++) {
          for (var b3 = 0; b3 < devB.length; b3++) {
            addCombo_(
              'R' + (out.length + 1),
              dqsB[b1],
              winB[b2],
              volB[(b1 + b2 + b3) % volB.length],
              bodyB[(b2 + b3) % bodyB.length],
              rsiB[(b1 + b3) % rsiB.length],
              bufB[(b1 + b2 + b3) % bufB.length],
              devB[b3]
            );
          }
        }
      }
    } else if (p === 'LOOSE_MOMO_LONG') {
      var dqsC = [-4, -2, 0, 2];
      var winC = [-1, 0, 1];
      var volC = [-0.08, -0.03, 0.00, 0.05];
      var bodyC = [-0.05, -0.02, 0.00, 0.03];
      var rsiC = [-6, -3, 0, 3];
      var bufC = [0.00, 0.01, 0.03];
      var devC = [-0.10, 0.00, 0.10];

      for (var c1 = 0; c1 < dqsC.length; c1++) {
        for (var c2 = 0; c2 < rsiC.length; c2++) {
          for (var c3 = 0; c3 < volC.length; c3++) {
            addCombo_(
              'R' + (out.length + 1),
              dqsC[c1],
              winC[(c1 + c2 + c3) % winC.length],
              volC[c3],
              bodyC[(c2 + c3) % bodyC.length],
              rsiC[c2],
              bufC[(c1 + c3) % bufC.length],
              devC[(c1 + c2 + c3) % devC.length]
            );
          }
        }
      }
    } else if (p === 'FAKEOUT_SHORT') {
      var dqsD = [-3, 0, 3];
      var winD = [-1, 0, 1];
      var volD = [-0.05, 0.00, 0.08];
      var bodyD = [-0.04, 0.00, 0.04];
      var rsiD = [-5, 0, 5];
      var bufD = [-0.03, 0.00, 0.03];
      var devD = [-0.08, 0.00, 0.08];

      for (var d1 = 0; d1 < dqsD.length; d1++) {
        for (var d2 = 0; d2 < bodyD.length; d2++) {
          for (var d3 = 0; d3 < bufD.length; d3++) {
            addCombo_(
              'R' + (out.length + 1),
              dqsD[d1],
              winD[(d1 + d2 + d3) % winD.length],
              volD[(d2 + d3) % volD.length],
              bodyD[d2],
              rsiD[(d1 + d3) % rsiD.length],
              bufD[d3],
              devD[(d1 + d2 + d3) % devD.length]
            );
          }
        }
      }
    } else if (p === 'EXHAUSTION_FADE_SHORT') {
      var dqsE = [-4, -1, 2];
      var winE = [-1, 0, 1];
      var volE = [0.00, 0.08, 0.15];
      var bodyE = [-0.03, 0.00, 0.03];
      var rsiE = [-6, -3, 0, 3];
      var bufE = [0.00, 0.02];
      var devE = [-0.10, 0.00, 0.10];

      for (var e1 = 0; e1 < dqsE.length; e1++) {
        for (var e2 = 0; e2 < volE.length; e2++) {
          for (var e3 = 0; e3 < rsiE.length; e3++) {
            addCombo_(
              'R' + (out.length + 1),
              dqsE[e1],
              winE[(e1 + e2 + e3) % winE.length],
              volE[e2],
              bodyE[(e2 + e3) % bodyE.length],
              rsiE[e3],
              bufE[(e1 + e2 + e3) % bufE.length],
              devE[(e1 + e3) % devE.length]
            );
          }
        }
      }
    } else if (p === 'BREAKDOWN_SHORT') {
      var dqsF = [-4, 0, 4];
      var winF = [-2, 0, 1];
      var volF = [-0.05, 0.00, 0.08];
      var bodyF = [-0.05, 0.00, 0.05];
      var rsiF = [-4, 0, 4];
      var bufF = [-0.03, 0.00, 0.03];
      var devF = [-0.10, 0.00, 0.10];

      for (var f1 = 0; f1 < dqsF.length; f1++) {
        for (var f2 = 0; f2 < winF.length; f2++) {
          for (var f3 = 0; f3 < bodyF.length; f3++) {
            addCombo_(
              'R' + (out.length + 1),
              dqsF[f1],
              winF[f2],
              volF[(f1 + f2 + f3) % volF.length],
              bodyF[f3],
              rsiF[(f2 + f3) % rsiF.length],
              bufF[(f1 + f3) % bufF.length],
              devF[(f1 + f2 + f3) % devF.length]
            );
          }
        }
      }
    }

    return out;
  }

  function profileResearchGridWide_(baseOv) {
    var base = profileResearchGrid_(baseOv);
    var extra = [];

    for (var i = 0; i < base.length; i++) {
      var x = deepCopy_(base[i]);

      if (i % 2 === 0) x.dqs += 2;
      if (i % 3 === 0) x.body += 0.02;
      if (i % 4 === 0) x.vol += 0.05;
      if (i % 5 === 0) x.buf += 0.02;
      if (i % 6 === 0) x.rsi -= 2;

      x.tag = String(x.tag) + '_W';
      extra.push(x);
    }

    return base.concat(extra);
  }

  function emitResearch_(label, baseOv, wide) {
    var grid = wide ? profileResearchGridWide_(baseOv) : profileResearchGrid_(baseOv);

    for (var i = 0; i < grid.length; i++) {
      var g = grid[i];
      var ov = deepCopy_(baseOv);

      ov.DQS_Gate_V2 = (+ov.DQS_Gate_V2 || 0) + (g.dqs || 0);
      ov.V2_Retest_Window_Candles = (+ov.V2_Retest_Window_Candles || 6) + (g.win || 0);
      ov.V2_Retest_Max_Deviation_ATR = (+ov.V2_Retest_Max_Deviation_ATR || 1.0) + (g.dev || 0);
      ov.Volume_Multiplier_Threshold = (+ov.Volume_Multiplier_Threshold || 1.0) + (g.vol || 0);
      ov.V2_Confirmation_Body_Min_Frac = (+ov.V2_Confirmation_Body_Min_Frac || 0.25) + (g.body || 0);
      ov.RSI_Overbought_Long = (+ov.RSI_Overbought_Long || 65) + (g.rsi || 0);
      ov.V2_Breakout_Buffer_ATR = (+ov.V2_Breakout_Buffer_ATR || 0.0) + (g.buf || 0);

      ov = normalizeOv_(ov);

      pushJob_(label + ' | ' + String(g.tag || ('R' + i)), 'PROFILE', ov);
    }
  }

  if (variantMode === 'PERSISTENCE_HUNT') {
    emitPersistenceHunt_();
    return jobs;
  }

  for (var p = 0; p < profiles.length; p++) {
    var built = buildProfileBase_(profiles[p], universeMode);
    if (!built) continue;

    var mirrorSet = [];

    mirrorSet.push({
      label: built.label,
      ov: normalizeOv_(built.ov)
    });

    if (invertProfiles) {
      var inv = deepCopy_(built.ov);
      inv.Invert_All_Signals = !inv.Invert_All_Signals;
      inv = normalizeOv_(inv);

      mirrorSet.push({
        label: built.label + ' | INVERTED_MIRROR',
        ov: inv
      });
    }

    for (var m = 0; m < mirrorSet.length; m++) {
      var label = mirrorSet[m].label;
      var ov = mirrorSet[m].ov;

      if (variantMode === 'RESEARCH') {
        emitResearch_(label, ov, false);
      } else if (variantMode === 'RESEARCH_WIDE') {
        emitResearch_(label, ov, true);
      } else if (variantMode === 'DENSE') {
        emitStandardOrDense_(label, 'DENSE', ov);
      } else {
        emitStandardOrDense_(label, 'STANDARD', ov);
      }
    }
  }

  return jobs;
}


function TRG_deleteBrokenTriggersNow() {
  var triggers = ScriptApp.getProjectTriggers();
  var deleted = 0;

  for (var i = 0; i < triggers.length; i++) {
    var t = triggers[i];
    var h = '';
    try { h = t.getHandlerFunction(); } catch (e1) {}

    var exists = false;
    try { exists = !!h && (typeof this[h] === 'function'); } catch (e2) {}

    if (!exists) {
      ScriptApp.deleteTrigger(t);
      deleted++;
      Logger.log('[TRG] Deleted broken trigger handler=' + h);
    }
  }

  Logger.log('[TRG] Broken trigger cleanup complete. deleted=' + deleted);
  return { deleted: deleted };
}


function MAIN_scheduledCycle() {
  Logger.log('[MAIN] ═══════════════════════════════════════');
  Logger.log('[MAIN] MAIN_scheduledCycle starting');
  Logger.log('[MAIN] ═══════════════════════════════════════');

  try {
    if (typeof M1_ksRequireOff === 'function') {
      try {
        M1_ksRequireOff();
      } catch (ksErr) {
        Logger.log('[MAIN] Kill switch active. Scheduled cycle aborted: ' + ksErr.message);
        return;
      }
    }

    if (typeof M2_fetchTopKCandlesIncremental === 'function') {
      try {
        M2_fetchTopKCandlesIncremental();
      } catch (e2) {
        Logger.log('[MAIN][WARN] M2_fetchTopKCandlesIncremental failed: ' + e2.message);
      }
    }

    if (typeof M6_runExecutionCycle === 'function') {
      try {
        M6_runExecutionCycle();
      } catch (e6) {
        Logger.log('[MAIN][WARN] M6_runExecutionCycle failed: ' + e6.message);
      }
    }

  } catch (e) {
    Logger.log('[MAIN][FATAL] MAIN_scheduledCycle failed: ' + e.message);
    if (e && e.stack) Logger.log('[MAIN][STACK] ' + e.stack);
  }

  Logger.log('[MAIN] MAIN_scheduledCycle complete');
}



function MAIN_dailyMaintenance() {
  Logger.log('[MAIN] ═══════════════════════════════════════');
  Logger.log('[MAIN] MAIN_dailyMaintenance starting');
  Logger.log('[MAIN] ═══════════════════════════════════════');

  try {
    if (typeof M2_pollAndLogFundingSettlements === 'function') {
      try {
        M2_pollAndLogFundingSettlements();
      } catch (e1) {
        Logger.log('[MAIN][WARN] M2_pollAndLogFundingSettlements failed: ' + e1.message);
      }
    }

    if (typeof M10_createPendingCouncilDeliberationNow === 'function') {
      try {
        M10_createPendingCouncilDeliberationNow();
      } catch (e2) {
        Logger.log('[MAIN][WARN] M10_createPendingCouncilDeliberationNow failed: ' + e2.message);
      }
    }

  } catch (e) {
    Logger.log('[MAIN][FATAL] MAIN_dailyMaintenance failed: ' + e.message);
    if (e && e.stack) Logger.log('[MAIN][STACK] ' + e.stack);
  }

  Logger.log('[MAIN] MAIN_dailyMaintenance complete');
}


function TRG_listAllNow() {
  var triggers = ScriptApp.getProjectTriggers();
  var out = [];

  for (var i = 0; i < triggers.length; i++) {
    var t = triggers[i];
    var row = {
      handler: '',
      eventType: '',
      source: ''
    };

    try { row.handler = t.getHandlerFunction(); } catch (e1) {}
    try { row.eventType = String(t.getEventType()); } catch (e2) {}
    try { row.source = String(t.getTriggerSource()); } catch (e3) {}

    Logger.log('[TRG] handler=' + row.handler + ' eventType=' + row.eventType + ' source=' + row.source);
    out.push(row);
  }

  Logger.log('[TRG] Total triggers=' + out.length);
  return out;
}



function RUN_logExperimentMatrixStatus() {
  var state = RUN__expLoadState_();
  if (!state) {
    Logger.log('[EXP] No experiment matrix state.');
    return { active: false };
  }

  state = RUN__expInitStateFields_(state);

  var total = (state.jobs && state.jobs.length) ? state.jobs.length : 0;
  var idx = state.idx || 0;
  var remaining = Math.max(0, total - idx);
  var currentJob = (state.jobs && state.jobs[idx]) ? state.jobs[idx] : null;

  Logger.log('[EXP] ═══════════════════════════════════════');
  Logger.log('[EXP] Matrix status');
  Logger.log('[EXP] idx=' + idx + '/' + total);
  Logger.log('[EXP] remaining=' + remaining);
  Logger.log('[EXP] startedAt=' + String(state.startedAt || ''));
  Logger.log('[EXP] status=' + String(state.status || ''));
  Logger.log('[EXP] lastCompletedIdx=' + String(state.lastCompletedIdx));
  Logger.log('[EXP] lastCompletedAt=' + String(state.lastCompletedAt || ''));
  Logger.log('[EXP] activeJobIdx=' + String(state.activeJobIdx));
  Logger.log('[EXP] activeJobStartedAt=' + String(state.activeJobStartedAt || ''));
  Logger.log('[EXP] expandVariants=' + (!!(state.opts && state.opts.expandVariants)));
  Logger.log('[EXP] name=' + String((state.opts && state.opts.name) || ''));
  Logger.log('[EXP] universeMode=' + String((state.opts && state.opts.universeMode) || ''));

  if (currentJob) {
    Logger.log('[EXP] currentRunName=' + String(currentJob.runName || ''));
    Logger.log('[EXP] currentMode=' + String(currentJob.mode || ''));
    Logger.log('[EXP] currentAttempts=' + String(currentJob.attempts || 0));
    Logger.log('[EXP] currentLastStartedAt=' + String(currentJob.lastStartedAt || ''));
  } else {
    Logger.log('[EXP] currentRunName=(none)');
  }

  Logger.log('[EXP] ═══════════════════════════════════════');

  return {
    active: idx < total,
    idx: idx,
    total: total,
    remaining: remaining,
    startedAt: state.startedAt || '',
    status: state.status || '',
    lastCompletedIdx: state.lastCompletedIdx,
    lastCompletedAt: state.lastCompletedAt || '',
    activeJobIdx: state.activeJobIdx,
    activeJobStartedAt: state.activeJobStartedAt || '',
    opts: state.opts || {},
    currentJob: currentJob || null
  };
}



function RUN_resetExperimentsSheetNow() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('EXPERIMENTS');
  if (!sh) {
    sh = ss.insertSheet('EXPERIMENTS');
  }

  var header = [
    'Timestamp',
    'Run_Name',
    'Mode',
    'Universe_Mode',
    'DQS_Gate_V2',
    'V2_Retest_Window_Candles',
    'V2_Retest_Max_Deviation_ATR',
    'Volume_Multiplier_Threshold',
    'RSI_Overbought_Long',
    'V2_Confirmation_Body_Min_Frac',
    'V2_Breakout_Buffer_ATR',
    'Invert_All_Signals',
    'V2_Long_Only',
    'Backtest_ID',
    'Total_Trades',
    'Win_Rate_Total',
    'Profit_Factor',
    'Expectancy_R',
    'Max_Drawdown_Pct',
    'Sharpe_Ratio',
    'OOS_Total_Trades',
    'OOS_Passed',
    'OOS_Fail_Reasons_JSON',
    'setupConfirmed',
    'confirmedQueued',
    'rejectedDqsAfterConfirm',
    'pendingFilled'
  ];

  var wantCols = header.length;
  var wantRows = RUN__experimentsMaxRows_();

  if (sh.getMaxColumns() > wantCols) {
    sh.deleteColumns(wantCols + 1, sh.getMaxColumns() - wantCols);
  }
  if (sh.getMaxRows() > wantRows) {
    sh.deleteRows(wantRows + 1, sh.getMaxRows() - wantRows);
  }

  sh.clearContents();
  sh.getRange(1, 1, 1, wantCols).setValues([header]).setFontWeight('bold');
  SpreadsheetApp.flush();

  Logger.log('[RUN] EXPERIMENTS sheet reset (bounded). rows=' + sh.getMaxRows() + ' cols=' + sh.getMaxColumns());
}






function RUN__expIsActive_() {
  var state = RUN__expLoadState_();
  return !!(state && state.jobs && state.idx < state.jobs.length);
}

function RUN__dqsHasJobs_() { return false; }


function RUN_experimentMatrix_resumableCancel() {
  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(3000)) {
    Logger.log('[EXP] Cancel could not acquire lock quickly. Proceeding with cleanup without lock.');
  }

  try {
    RUN__expClearAllTriggers_();
    try { RUN__dqsDeleteTriggers_(); } catch (e1) {}
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }

  RUN__expDeleteState_();
  try { RUN__dqsDeleteQueue_(); } catch (e2) {}
  RUN_restoreAllOverridesNow();
  SpreadsheetApp.flush();

  Logger.log('[EXP] Resumable experiment canceled. State deleted, triggers removed, overrides restored.');
  return { status: 'CANCELED' };
}



function RUN_experimentMatrix_resumableStart(opts) {
  opts = opts || {};

  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(5000)) {
    throw new Error('[RUN] Could not acquire lock to start experiment matrix.');
  }

  try {
    RUN__expClearAllTriggers_();
    try { RUN__dqsDeleteTriggers_(); } catch (e0) {}

    var props = RUN__getProps_();
    var jobs = RUN__expBuildJobs_(opts);
    var maxJobs = (opts.maxJobs !== undefined && opts.maxJobs !== null) ? opts.maxJobs : 120;
    RUN__assertExperimentJobCountSafe_(jobs, maxJobs);

    var state = {
      opts: opts,
      jobs: jobs,
      idx: 0,
      startedAt: new Date().toISOString(),
      oldM9: props.getProperty('M9_CFG_OVERRIDE'),
      oldM4: props.getProperty('M4_CFG_OVERRIDE'),
      oldM6: props.getProperty('M6_CFG_OVERRIDE'),
      lastCompletedIdx: -1,
      lastCompletedAt: '',
      activeJobIdx: -1,
      activeJobStartedAt: '',
      status: 'RUNNING'
    };

    RUN__expSaveState_(state);
    SpreadsheetApp.flush();

    Logger.log('[EXP] Registered experiment matrix. jobs=' + jobs.length + ' maxJobs=' + maxJobs);
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }

  return RUN_experimentMatrix_resumableContinue();
}







function RUN_logLargePropertiesNow() {
  var props = RUN__getProps_();
  var all = props.getProperties();
  var keys = Object.keys(all);
  var rows = [];

  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var v = String(all[k] || '');
    rows.push({
      key: k,
      size: v.length
    });
  }

  rows.sort(function(a, b) { return b.size - a.size; });

  Logger.log('[RUN] Property count=' + rows.length);
  for (var j = 0; j < Math.min(rows.length, 50); j++) {
    Logger.log('[RUN] PROP ' + rows[j].key + ' | size=' + rows[j].size);
  }
}












function RUN_forceStopAllResearchPipelinesNow() {
  Logger.log('[RUN] ═══════════════════════════════════════');
  Logger.log('[RUN] Force-stopping all research pipelines');
  Logger.log('[RUN] ═══════════════════════════════════════');

  try { RUN__expClearAllTriggers_(); } catch (e1) {}
  try { RUN__dqsDeleteTriggers_(); } catch (e2) {}
  try { RUN__expDeleteState_(); } catch (e3) {}
  try { RUN__dqsDeleteQueue_(); } catch (e4) {}
  try { RUN_restoreAllOverridesNow(); } catch (e5) {}

  SpreadsheetApp.flush();
  Logger.log('[RUN] Force stop complete. Triggers removed, queues deleted, overrides cleared.');
}


function RUN__experimentsMaxRows_() {
  return 5000;
}



function RUN_pushToMemoryAndConveneCouncil() {
  var insertedExperiment = MEM_pushLatestExperimentToSupabaseNow();
  MEM_addDiagnosticNoteNow(
    'Initial hybrid memory bootstrap push from Apps Script.',
    'bootstrap',
    'human'
  );
  var insertedCouncil = M10_createPendingCouncilDeliberationNow();

  Logger.log('[RUN] Memory + council bootstrap complete.');
  Logger.log(JSON.stringify({
    experiment: insertedExperiment,
    council: insertedCouncil
  }, null, 2));

  return {
    experiment: insertedExperiment,
    council: insertedCouncil
  };
}


/**
 * RUN_ResearchMatrix_Clean.gs
 * - Removes DQS_FORENSICS pipeline usage
 * - Stores compact DQS summary from M9_DIAG_<btId> (no rescans)
 */

function RUN__dqsSummaryKey_(btId) {
  btId = String(btId || '').trim();
  return 'M10_DQS_SUMMARY_' + btId;
}
function RUN__dqsSummaryLatestKey_() {
  return 'M10_DQS_SUMMARY_LATEST';
}
function RUN__safeJsonParse_(raw, fallback) {
  try { return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
}

function RUN__setDqsSummary_(btId, obj) {
  btId = String(btId || '').trim();
  if (!btId) return null;

  var body = {
    dqs_summary: obj || {}
  };

  try {
    var rows = M10__sbFetchJson_(
      'patch',
      '/rest/v1/experiment_logs?backtest_id=eq.' + encodeURIComponent(btId),
      body
    );
    Logger.log('[RUN][DQS] Supabase dqs_summary upserted for btId=' + btId);
    return rows;
  } catch (e) {
    Logger.log('[RUN][DQS][WARN] Could not push dqs_summary to Supabase for btId=' + btId + ': ' + e.message);
    return null;
  }
}

function RUN__getDqsSummary_(btId) {
  btId = String(btId || '').trim();
  if (!btId) return {};

  try {
    var rows = M10__sbFetchJson_(
      'get',
      '/rest/v1/experiment_logs?backtest_id=eq.' + encodeURIComponent(btId) +
      '&select=dqs_summary&order=created_at.desc&limit=1'
    );

    if (rows && rows.length && rows[0] && rows[0].dqs_summary) {
      return rows[0].dqs_summary;
    }
  } catch (e) {
    Logger.log('[RUN][DQS][WARN] Could not fetch dqs_summary from Supabase for btId=' + btId + ': ' + e.message);
  }

  return {};
}


function RUN_experimentMatrix_resumableContinue() {
  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(5000)) {
    Logger.log('[EXP] Could not acquire document lock. Rescheduling normal continuation.');
    RUN__expEnsureContinueTrigger_();
    return { status: 'LOCKED' };
  }

  try {
    var state = RUN__expLoadState_();
    if (!state) {
      throw new Error('No resumable experiment state found. Run RUN_experimentMatrix_resumableStart(...) first.');
    }
    state = RUN__expInitStateFields_(state);

    var props = RUN__getProps_();
    var jobsPerInvocation = 1;
    var ran = 0;

    while (state.idx < state.jobs.length && ran < jobsPerInvocation) {
      var job = state.jobs[state.idx];
      if (!job) {
        Logger.log('[EXP][WARN] Missing job object at idx=' + state.idx + '. Skipping.');
        state.lastCompletedIdx = state.idx;
        state.lastCompletedAt = new Date().toISOString();
        state.idx++;
        RUN__expSaveState_(state);
        continue;
      }

      job.attempts = (job.attempts || 0) + 1;
      job.lastStartedAt = new Date().toISOString();

      state.activeJobIdx = state.idx;
      state.activeJobStartedAt = job.lastStartedAt;
      state.status = 'RUNNING';

      RUN__expSaveState_(state);
      SpreadsheetApp.flush();

      // Dead-man rescue trigger: if we timeout before we schedule next step,
      // this rescue invocation will check whether the job actually completed.
      RUN__expEnsureRescueTrigger_();

      Logger.log('[EXP] Starting job idx=' + state.idx + '/' + state.jobs.length +
        ' attempts=' + job.attempts +
        ' runName=' + String(job.runName || ''));

      RUN__expRunOneJob_(job);

      // If we get here, heavy work completed successfully.
      state.lastCompletedIdx = state.idx;
      state.lastCompletedAt = new Date().toISOString();
      state.idx++;
      state.activeJobIdx = -1;
      state.activeJobStartedAt = '';
      ran++;

      RUN__expSaveState_(state);
      SpreadsheetApp.flush();

      // Clear rescue since this job completed.
      RUN__expDeleteRescueTriggers_();
    }

    if (state.idx < state.jobs.length) {
      RUN__expEnsureContinueTrigger_();
      Logger.log('[EXP] Pausing at idx=' + state.idx + '/' + state.jobs.length +
        ' — normal continuation trigger scheduled.');
      return { status: 'PAUSED', idx: state.idx, total: state.jobs.length };
    }

    if (state.oldM9 === null || state.oldM9 === undefined) props.deleteProperty('M9_CFG_OVERRIDE');
    else props.setProperty('M9_CFG_OVERRIDE', state.oldM9);

    if (state.oldM4 === null || state.oldM4 === undefined) props.deleteProperty('M4_CFG_OVERRIDE');
    else props.setProperty('M4_CFG_OVERRIDE', state.oldM4);

    if (state.oldM6 === null || state.oldM6 === undefined) props.deleteProperty('M6_CFG_OVERRIDE');
    else props.setProperty('M6_CFG_OVERRIDE', state.oldM6);

    RUN_clearOverrideCaches();
    state.status = 'DONE';
    RUN__expSaveState_(state);

    RUN__expDeleteState_();
    RUN__expClearAllTriggers_();
    SpreadsheetApp.flush();

    Logger.log('[EXP] Resumable experiment complete.');
    return { status: 'DONE', idx: state.jobs.length, total: state.jobs.length };

  } finally {
    try { lock.releaseLock(); } catch (e3) {}
  }
}



function RUN_experimentMatrix_rescueContinue() {
  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(5000)) {
    Logger.log('[EXP][RESCUE] Could not acquire lock. Re-arming rescue trigger.');
    RUN__expEnsureRescueTrigger_();
    return { status: 'LOCKED' };
  }

  try {
    var state = RUN__expLoadState_();
    if (!state) {
      Logger.log('[EXP][RESCUE] No active experiment state found. Clearing rescue triggers.');
      RUN__expDeleteRescueTriggers_();
      return { status: 'NO_STATE' };
    }
    state = RUN__expInitStateFields_(state);

    // If already done, nothing to rescue.
    if (state.idx >= state.jobs.length) {
      Logger.log('[EXP][RESCUE] State already complete. Clearing rescue triggers.');
      RUN__expClearAllTriggers_();
      return { status: 'DONE_ALREADY' };
    }

    // If no active job is marked, just ensure normal continuation exists.
    if (state.activeJobIdx === -1) {
      Logger.log('[EXP][RESCUE] No active job marked. Scheduling normal continuation.');
      RUN__expDeleteRescueTriggers_();
      RUN__expEnsureContinueTrigger_();
      return { status: 'NO_ACTIVE_JOB' };
    }

    // If last completed idx caught up to active job, then the job actually finished.
    if (state.lastCompletedIdx >= state.activeJobIdx) {
      Logger.log('[EXP][RESCUE] Active job already completed (idx=' + state.activeJobIdx + '). Scheduling normal continuation.');
      state.activeJobIdx = -1;
      state.activeJobStartedAt = '';
      RUN__expSaveState_(state);
      RUN__expDeleteRescueTriggers_();
      if (state.idx < state.jobs.length) RUN__expEnsureContinueTrigger_();
      return { status: 'ALREADY_COMPLETED', idx: state.idx, total: state.jobs.length };
    }

    var idx = state.activeJobIdx;
    var job = state.jobs[idx];

    if (!job) {
      Logger.log('[EXP][RESCUE][WARN] Missing job at activeJobIdx=' + idx + '. Skipping.');
      state.lastCompletedIdx = idx;
      state.lastCompletedAt = new Date().toISOString();
      state.idx = idx + 1;
      state.activeJobIdx = -1;
      state.activeJobStartedAt = '';
      RUN__expSaveState_(state);
      RUN__expDeleteRescueTriggers_();
      if (state.idx < state.jobs.length) RUN__expEnsureContinueTrigger_();
      return { status: 'SKIPPED_MISSING_JOB', idx: state.idx, total: state.jobs.length };
    }

    var attempts = job.attempts || 0;
    if (attempts >= 3) {
      Logger.log('[EXP][RESCUE][FAIL] Job idx=' + idx + ' exceeded retry limit. Skipping permanently.');
      job.failedPermanently = true;
      job.failedReason = 'Exceeded rescue retry limit';
      job.lastFailedAt = new Date().toISOString();

      state.lastCompletedIdx = idx;
      state.lastCompletedAt = new Date().toISOString();
      state.idx = idx + 1;
      state.activeJobIdx = -1;
      state.activeJobStartedAt = '';
      RUN__expSaveState_(state);

      RUN__expDeleteRescueTriggers_();
      if (state.idx < state.jobs.length) RUN__expEnsureContinueTrigger_();

      return { status: 'SKIPPED_AFTER_RETRIES', idx: state.idx, total: state.jobs.length };
    }

    Logger.log('[EXP][RESCUE] Retrying stale job idx=' + idx +
      ' attempts=' + attempts +
      ' runName=' + String(job.runName || ''));

    // Clear active markers and let the normal continuation rerun the same idx.
    state.activeJobIdx = -1;
    state.activeJobStartedAt = '';
    RUN__expSaveState_(state);

    RUN__expDeleteRescueTriggers_();
    return RUN_experimentMatrix_resumableContinue();

  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}



function RUN__expRunOneJob_(job) {
  if (!job || !job.ov) throw new Error('Invalid job');

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var exp = ss.getSheetByName('EXPERIMENTS');

  if (!exp) {
    exp = ss.insertSheet('EXPERIMENTS');
    exp.appendRow([
      'Timestamp','Run_Name','Mode','Universe_Mode',
      'DQS_Gate_V2','V2_Retest_Window_Candles','V2_Retest_Max_Deviation_ATR',
      'Volume_Multiplier_Threshold','RSI_Overbought_Long','V2_Confirmation_Body_Min_Frac',
      'V2_Breakout_Buffer_ATR','Invert_All_Signals','V2_Long_Only',
      'Backtest_ID','Total_Trades','Win_Rate_Total','Profit_Factor','Expectancy_R',
      'Max_Drawdown_Pct','Sharpe_Ratio','OOS_Total_Trades','OOS_Passed','OOS_Fail_Reasons_JSON',
      'setupConfirmed','confirmedQueued','rejectedDqsAfterConfirm','pendingFilled'
    ]);
  }

  function latestBacktestMap_() {
    var sh = ss.getSheetByName('BACKTEST_RESULTS');
    if (!sh || sh.getLastRow() < 2) return {};
    var hdr = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
    var row = sh.getRange(sh.getLastRow(), 1, 1, sh.getLastColumn()).getValues()[0];
    var out = {};
    for (var i = 0; i < hdr.length; i++) out[String(hdr[i] || '').trim()] = row[i];
    return out;
  }

  var ov = job.ov;
  RUN_setOverride_('M9_CFG_OVERRIDE', ov);
  RUN_setOverride_('M4_CFG_OVERRIDE', ov);
  RUN_setOverride_('M6_CFG_OVERRIDE', {});

  var btResult = RUN_backtestSafe();
  var btId = btResult.backtestId;
  var btMap = latestBacktestMap_();

  var d = btResult && btResult.diagV2 ? btResult.diagV2 : {};
  var passFail = btResult && btResult.passFail ? btResult.passFail : {};
  var oosTotal = (btResult && btResult.oos && btResult.oos.metrics) ? btResult.oos.metrics.total : '';
  var reasonsArr = (passFail && passFail.reasons) ? passFail.reasons : [];
  var reasonsJson = JSON.stringify(reasonsArr || []);

  exp.appendRow([
    new Date().toISOString(),
    job.runName,
    job.mode,
    ov.Universe_Mode,
    ov.DQS_Gate_V2,
    ov.V2_Retest_Window_Candles,
    ov.V2_Retest_Max_Deviation_ATR,
    ov.Volume_Multiplier_Threshold,
    ov.RSI_Overbought_Long,
    ov.V2_Confirmation_Body_Min_Frac,
    ov.V2_Breakout_Buffer_ATR,
    ov.Invert_All_Signals,
    ov.V2_Long_Only,
    btId,
    btMap.Total_Trades || 0,
    btMap.Win_Rate_Total || 0,
    btMap.Profit_Factor || 0,
    btMap.Expectancy_R || 0,
    btMap.Max_Drawdown_Pct || 0,
    btMap.Sharpe_Ratio || 0,
    oosTotal,
    (passFail.passed !== undefined ? passFail.passed : ''),
    reasonsJson,
    d.setupConfirmed || 0,
    d.confirmedQueued || 0,
    d.rejectedDqsAfterConfirm || 0,
    d.pendingFilled || 0
  ]);

  Logger.log('[EXP] DONE ' + job.runName + ' | ' + job.mode + ' | BT=' + btId);

  var dqsSummary = (btResult && btResult.dqs_summary) ? btResult.dqs_summary : {};
  if (!dqsSummary || typeof dqsSummary !== 'object') dqsSummary = {};
  if (!dqsSummary.version) {
    dqsSummary = {
      version: 'M9_DQS_SUMMARY_MISSING',
      backtest_id: btId,
      note: 'M9 did not emit dqs_summary.'
    };
  }

  var fullDiagBlob = {
    backtest_id: btId,
    run_name: job.runName,
    mode: job.mode,
    captured_at: new Date().toISOString(),
    config_snapshot: {
      strategy_profile: ov.Strategy_Profile,
      universe_mode: ov.Universe_Mode,
      dqs_gate_v2: ov.DQS_Gate_V2,
      retest_window_candles: ov.V2_Retest_Window_Candles,
      retest_max_deviation_atr: ov.V2_Retest_Max_Deviation_ATR,
      volume_multiplier_threshold: ov.Volume_Multiplier_Threshold,
      rsi_overbought_long: ov.RSI_Overbought_Long,
      confirmation_body_min_frac: ov.V2_Confirmation_Body_Min_Frac,
      breakout_buffer_atr: ov.V2_Breakout_Buffer_ATR,
      invert_all_signals: ov.Invert_All_Signals,
      v2_long_only: ov.V2_Long_Only
    },
    bt_result: btResult || {},
    dqs_summary: dqsSummary,
    oos_fail_reasons_json: reasonsArr || []
  };

  try {
    var supabaseBody = {
      strategy_id: MEM__strategyIdFromRunName_(job.runName),
      run_name: job.runName,
      mode: job.mode,
      universe_mode: ov.Universe_Mode,
      backtest_id: btId,
      config_snapshot: {
        strategy_profile: ov.Strategy_Profile,
        dqs_gate_v2: ov.DQS_Gate_V2,
        retest_window_candles: ov.V2_Retest_Window_Candles,
        retest_max_deviation_atr: ov.V2_Retest_Max_Deviation_ATR,
        volume_multiplier_threshold: ov.Volume_Multiplier_Threshold,
        rsi_overbought_long: ov.RSI_Overbought_Long,
        confirmation_body_min_frac: ov.V2_Confirmation_Body_Min_Frac,
        breakout_buffer_atr: ov.V2_Breakout_Buffer_ATR,
        invert_all_signals: ov.Invert_All_Signals,
        v2_long_only: ov.V2_Long_Only
      },
      total_trades: btMap.Total_Trades || 0,
      oos_total_trades: oosTotal || 0,
      win_rate_total: btMap.Win_Rate_Total || 0,
      profit_factor: btMap.Profit_Factor || 0,
      expectancy_r: btMap.Expectancy_R || 0,
      max_drawdown_pct: btMap.Max_Drawdown_Pct || 0,
      sharpe_ratio: btMap.Sharpe_Ratio || 0,
      oos_passed: (passFail.passed !== undefined ? !!passFail.passed : null),
      oos_fail_reasons_json: reasonsArr || [],
      setup_confirmed: d.setupConfirmed || 0,
      confirmed_queued: d.confirmedQueued || 0,
      rejected_dqs_after_confirm: d.rejectedDqsAfterConfirm || 0,
      pending_filled: d.pendingFilled || 0,
      dqs_summary: dqsSummary,
      diag_blob: fullDiagBlob
    };

    M10__sbFetchJson_('post', '/rest/v1/experiment_logs', supabaseBody);
    Logger.log('[EXP][SB] experiment_logs inserted for BT=' + btId);
  } catch (e1) {
    Logger.log('[EXP][SB][WARN] Could not insert experiment_logs row for BT=' + btId + ': ' + e1.message);
  }

  return btId;
}



function RUN_cleanupOldExperimentDataNow() {
  Logger.log('[RUN] ═══════════════════════════════════════');
  Logger.log('[RUN] Cleaning old experiment data');
  Logger.log('[RUN] ═══════════════════════════════════════');

  try { RUN__expDeleteState_(); } catch (e1) {}
  try { RUN__expDeleteContinueTriggers_(); } catch (e2) {}

  try { RUN_restoreAllOverridesNow(); } catch (e3) {}
  try { RUN_clearPropertyQuotaPressureNow(); } catch (e4) {}
  try { RUN_resetExperimentsSheetNow(); } catch (e5) {}

  SpreadsheetApp.flush();
  Logger.log('[RUN] Old experiment data cleanup complete.');
}



function RUN_clearPropertyQuotaPressureNow() {
  var props = RUN__getProps_();
  var all = props.getProperties();
  var keys = Object.keys(all || {});
  var deleted = 0;

  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (
      k.indexOf('M9_DIAG_') === 0 ||
      k.indexOf('M9_WF_') === 0 ||
      k.indexOf('M9_OOS_') === 0 ||
      k.indexOf('M10_DQS_SUMMARY_') === 0 ||
      k === 'M10_DQS_SUMMARY_LATEST' ||
      k.indexOf('RUN_EXPERIMENT_') === 0 ||
      k === 'RUN_EXPERIMENT_MATRIX_STATE' ||
      k === 'M9_CFG_OVERRIDE' ||
      k === 'M4_CFG_OVERRIDE' ||
      k === 'M6_CFG_OVERRIDE'
    ) {
      props.deleteProperty(k);
      deleted++;
    }
  }

  try { RUN_clearOverrideCaches(); } catch (e1) {}
  SpreadsheetApp.flush();
  Logger.log('[RUN] Cleared property quota pressure. Deleted keys=' + deleted);
}


function RUN__assertExperimentJobCountSafe_(jobs, maxJobs) {
  var n = jobs && jobs.length ? jobs.length : 0;
  var cap = (maxJobs !== undefined && maxJobs !== null) ? maxJobs : 140;

  if (n > cap) {
    throw new Error(
      '[RUN] Refusing to start experiment matrix with ' + n +
      ' jobs. Safe cap=' + cap +
      '. Pass opts.maxJobs explicitly if this is intentional.'
    );
  }
}


RUN_experimentMatrix_resumableStart({
  name: 'PERSISTENCE_HUNT_V1',
  variantMode: 'PERSISTENCE_HUNT',
  maxJobs: 100
});


