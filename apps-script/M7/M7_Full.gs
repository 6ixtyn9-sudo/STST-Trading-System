/**
 * MODULE 7 — Ops Console
 * M7_Constants.gs
 * @version 3.2.1
 */

var M7_CONST = Object.freeze({
  VERSION: '3.2.1',

  SHEETS: Object.freeze({
    ALERT_LOG    : 'ALERT_LOG',
    DASHBOARD    : 'DASHBOARD',
    API_LOG      : 'API_LOG',
    CONFIG       : 'CONFIG',
    POSITIONS    : 'POSITIONS',
    SIGNALS      : 'SIGNALS',
    ORDERS       : 'ORDERS',
    REGIME       : 'REGIME',
    UNIVERSE     : 'UNIVERSE',
    COLLATERAL   : 'COLLATERAL',
    MOOD_JOURNAL : 'MOOD_JOURNAL',
    DATA_CLEAN   : 'DATA_CLEAN',
    BEHAVIOR_SCORE: 'BEHAVIOR_SCORE'
  }),

  PRIORITY: Object.freeze({
    INFO     : 'INFO',
    NORMAL   : 'NORMAL',
    CAUTION  : 'CAUTION',
    CRITICAL : 'CRITICAL'
  }),

  EMAIL_SUBJECT_PREFIX: '[$T$T]',
  EMAIL_BATCH_INTERVAL_MS: 5 * 60 * 1000,
  EMAIL_QUEUE_PROP: 'M7_EMAIL_QUEUE',
  EMAIL_LAST_SEND_PROP: 'M7_EMAIL_LAST_SEND',
  LAST_SCAN_PREFIX: 'M7_LAST_SCAN_',
  LAST_ALERT_PREFIX: 'M7_LAST_ALERT_',

  THRESHOLDS: Object.freeze({
    CONSEC_LOSS_WARN      : 5,
    CONSEC_LOSS_KILL      : 7,
    DRAWDOWN_WARN_PCT     : 0.10,
    DRAWDOWN_KILL_PCT     : 0.15,
    STALE_DATA_PERIODS    : 2,
    UNIVERSE_TURNOVER_PCT : 0.30,
    SUBACCOUNT_MARGIN_MULT: 2.0,
    BEHAVIOR_SCORE_LOW    : 60
  }),

  ALERTS: Object.freeze({
    SIGNAL_CONFIRMED        : { type: 'New Signal Confirmed', priority: 'NORMAL', immediate: false },
    TRADE_ENTERED           : { type: 'Trade Entered', priority: 'NORMAL', immediate: false },
    CORE_TP1_HIT            : { type: 'Core TP1 Hit', priority: 'NORMAL', immediate: false },
    RUNNER_TRAILING_STOP    : { type: 'Runner Trailing Stop Hit', priority: 'NORMAL', immediate: false },
    STOP_LOSS_HIT           : { type: 'Stop Loss Hit', priority: 'CAUTION', immediate: false },
    FUNDING_COST_WARNING    : { type: 'Funding Cost Warning', priority: 'CAUTION', immediate: false },
    LIQ_BUFFER_WARNING      : { type: 'Liquidation Buffer Warning', priority: 'CRITICAL', immediate: true },
    STOP_ORDER_FAILED       : { type: 'STOP ORDER FAILED', priority: 'CRITICAL', immediate: true, forceSeparate: true },
    DAILY_LIMIT_REACHED     : { type: 'Daily Limit Reached', priority: 'CAUTION', immediate: false },
    CONSECUTIVE_LOSSES_5    : { type: 'Consecutive Losses (5)', priority: 'CAUTION', immediate: false },
    CONSECUTIVE_LOSSES_7    : { type: 'Consecutive Losses (7)', priority: 'CRITICAL', immediate: true },
    MONTHLY_DD_WARNING      : { type: 'Monthly Drawdown Warning', priority: 'CRITICAL', immediate: true },
    MONTHLY_DD_KILL         : { type: 'Monthly Drawdown Kill', priority: 'CRITICAL', immediate: true },
    REGIME_CHANGED          : { type: 'Regime Changed', priority: 'CAUTION', immediate: false },
    UNIVERSE_RESHUFFLED     : { type: 'Universe Reshuffled', priority: 'INFO', immediate: false },
    DATA_FEED_STALE         : { type: 'Data Feed Stale', priority: 'CRITICAL', immediate: true },
    API_ERROR               : { type: 'API Error', priority: 'CRITICAL', immediate: true },
    API_RATE_LIMIT_HIT      : { type: 'API Rate Limit Hit', priority: 'CAUTION', immediate: false },
    SCRIPT_QUOTA_WARNING    : { type: 'Script Quota Warning', priority: 'CAUTION', immediate: false },
    SCRIPT_EXEC_FAILED      : { type: 'Script Execution Failed', priority: 'CRITICAL', immediate: true },
    MOOD_JOURNAL_MISSING    : { type: 'Mood Journal Missing', priority: 'CAUTION', immediate: false },
    BEHAVIOR_SCORE_LOW      : { type: 'Behavior Score Low', priority: 'CAUTION', immediate: false },
    SUBACCOUNT_BAL_LOW      : { type: 'Subaccount Balance Low', priority: 'CRITICAL', immediate: true },
    MARGIN_FRACTION_WARNING : { type: 'MarginFraction Warning', priority: 'CAUTION', immediate: false },
    MARGIN_FRACTION_KILL    : { type: 'MarginFraction Kill', priority: 'CRITICAL', immediate: true, forceSeparate: true }
  })
});

var M7_COL = Object.freeze({
  ALERT_LOG: Object.freeze({
    Alert_ID     : 0,
    Timestamp    : 1,
    Alert_Type   : 2,
    Priority     : 3,
    Message      : 4,
    Email_Sent   : 5,
    Email_Batched: 6,
    Acknowledged : 7,
    Related_ID   : 8
  }),

  API_LOG: Object.freeze({
    Timestamp       : 0,
    Endpoint        : 1,
    HTTP_Status     : 2,
    Latency_ms      : 3,
    Response_Summary: 4
  }),

  CONFIG: Object.freeze({
    Parameter: 0,
    Value    : 1
  }),

  REGIME: Object.freeze({
    Date          : 0,
    Market_Regime : 12,
    Regime_Changed: 13
  }),

  COLLATERAL: Object.freeze({
    Location : 2,
    Value_ZAR: 5
  }),

  MOOD_JOURNAL: Object.freeze({
    Date            : 0,
    Mood_Score      : 6,
    Trading_Allowed : 7,
    Behavior_Score  : 8
  })
});



/**
 * MODULE 7 — Ops Console
 * M7_Utils.gs
 * @version 3.2.1
 */

function M7__ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function M7__sh_(name) {
  var sh = M7__ss_().getSheetByName(name);
  if (!sh) throw new Error('[M7] Sheet not found: ' + name);
  return sh;
}

function M7__readAll_(sheetName) {
  var sh = M7__sh_(sheetName);
  if (sh.getLastRow() < 1) return [];
  return sh.getDataRange().getValues();
}

function M7__appendRows_(sheetName, rows) {
  if (!rows || rows.length === 0) return;
  var sh = M7__sh_(sheetName);
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function M7__clearSheet_(sheetName) {
  M7__sh_(sheetName).clearContents();
}

function M7__nowIso_() {
  return new Date().toISOString();
}

function M7__nowSAST_() {
  return Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'yyyy-MM-dd HH:mm:ss');
}

function M7__todaySAST_() {
  return Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'yyyy-MM-dd');
}

function M7__safeNum_(v, d) {
  var n = parseFloat(v);
  return isFinite(n) ? n : (d || 0);
}

function M7__safeStr_(v) {
  return v === null || v === undefined ? '' : String(v);
}

function M7__safeBool_(v) {
  return v === true || String(v).toUpperCase() === 'TRUE';
}

function M7__generateId_(prefix) {
  return prefix + '-' + new Date().getTime().toString().slice(-8) + '-' + Math.floor(Math.random() * 9000 + 1000);
}

function M7__cfgStr_(key, defaultVal) {
  try {
    if (typeof M1_cfgGetStr === 'function') return M1_cfgGetStr(key);
  } catch (e) {}
  try {
    var data = M7__readAll_(M7_CONST.SHEETS.CONFIG);
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][M7_COL.CONFIG.Parameter]).trim() === key) {
        return String(data[i][M7_COL.CONFIG.Value]).trim();
      }
    }
  } catch (e2) {}
  return defaultVal;
}

function M7__cfgNum_(key, defaultVal) {
  try {
    if (typeof M1_cfgGetNum === 'function') return M1_cfgGetNum(key);
  } catch (e) {}
  try {
    var data = M7__readAll_(M7_CONST.SHEETS.CONFIG);
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][M7_COL.CONFIG.Parameter]).trim() === key) {
        var raw = String(data[i][M7_COL.CONFIG.Value]).trim();
        if (raw.slice(-1) === '%') return parseFloat(raw) / 100;
        var n = parseFloat(raw);
        return isFinite(n) ? n : defaultVal;
      }
    }
  } catch (e2) {}
  return defaultVal;
}

function M7__cfgBool_(key, defaultVal) {
  var v = M7__cfgStr_(key, defaultVal ? 'TRUE' : 'FALSE');
  return String(v).toUpperCase() === 'TRUE';
}

function M7__getEmailRecipient_() {
  var email = M7__cfgStr_('Alert_Email_Recipient', '');
  if (!email) email = M7__cfgStr_('Alert_Email_Address', '');
  if (!email) {
    try { email = Session.getActiveUser().getEmail(); } catch (e) {}
  }
  return email || '';
}

function M7__getProp_(k, d) {
  var v = PropertiesService.getScriptProperties().getProperty(k);
  return v === null ? d : v;
}

function M7__setProp_(k, v) {
  PropertiesService.getScriptProperties().setProperty(k, String(v));
}

function M7__getLastScan_(name) {
  return M7__getProp_(M7_CONST.LAST_SCAN_PREFIX + name, '');
}

function M7__setLastScan_(name) {
  M7__setProp_(M7_CONST.LAST_SCAN_PREFIX + name, M7__nowIso_());
}

function M7__getLastAlertDate_(name) {
  return M7__getProp_(M7_CONST.LAST_ALERT_PREFIX + name, '');
}

function M7__setLastAlertDate_(name, dateVal) {
  M7__setProp_(M7_CONST.LAST_ALERT_PREFIX + name, dateVal);
}

function M7__alertExists_(type, relatedId, lookbackHours) {
  var data = M7__readAll_(M7_CONST.SHEETS.ALERT_LOG);
  var cutoff = Date.now() - ((lookbackHours || 24) * 60 * 60 * 1000);
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][M7_COL.ALERT_LOG.Alert_Type]) !== type) continue;
    if (relatedId && String(data[i][M7_COL.ALERT_LOG.Related_ID]) !== String(relatedId)) continue;
    var ts = new Date(data[i][M7_COL.ALERT_LOG.Timestamp]).getTime();
    if (isFinite(ts) && ts >= cutoff) return true;
  }
  return false;
}

function M7__priorityEmoji_(priority) {
  switch (priority) {
    case 'CRITICAL': return '🔴';
    case 'CAUTION': return '🟡';
    case 'NORMAL': return '🟢';
    default: return '⚪';
  }
}


/**
 * MODULE 7 — Ops Console
 * M7_Email.gs
 * @version 3.2.1
 */

function M7__sendEmailNow_(subject, body) {
  var to = M7__getEmailRecipient_();
  if (!to) return false;
  try {
    MailApp.sendEmail({
      to: to,
      subject: subject,
      body: body
    });
    return true;
  } catch (e) {
    console.error('[M7] Email send failed: ' + e.message);
    return false;
  }
}

function M7__queueEmail_(payload) {
  var q = JSON.parse(M7__getProp_(M7_CONST.EMAIL_QUEUE_PROP, '[]'));
  q.push(payload);
  M7__setProp_(M7_CONST.EMAIL_QUEUE_PROP, JSON.stringify(q));
}

function M7__sendAlertEmail_(alertDef, message, relatedId) {
  var subject = M7_CONST.EMAIL_SUBJECT_PREFIX + ' ' + alertDef.type;
  var body = [
    alertDef.type,
    'Priority: ' + alertDef.priority,
    'Timestamp: ' + M7__nowSAST_() + ' SAST',
    relatedId ? 'Reference: ' + relatedId : '',
    '',
    message
  ].join('\n');

  if (alertDef.immediate) {
    return M7__sendEmailNow_(subject, body);
  }

  M7__queueEmail_({
    subject: subject,
    body: body,
    ts: M7__nowIso_()
  });
  return false;
}

function M7_processBatchedEmails() {
  var lastSend = parseInt(M7__getProp_(M7_CONST.EMAIL_LAST_SEND_PROP, '0'), 10);
  var now = Date.now();
  if (now - lastSend < M7_CONST.EMAIL_BATCH_INTERVAL_MS) return 0;

  var q = JSON.parse(M7__getProp_(M7_CONST.EMAIL_QUEUE_PROP, '[]'));
  if (!q || q.length === 0) return 0;

  var lines = [];
  for (var i = 0; i < q.length; i++) {
    lines.push('---');
    lines.push(q[i].subject);
    lines.push(q[i].body);
  }

  var sent = M7__sendEmailNow_(
    M7_CONST.EMAIL_SUBJECT_PREFIX + ' Alert Batch (' + q.length + ')',
    lines.join('\n')
  );

  if (sent) {
    M7__setProp_(M7_CONST.EMAIL_QUEUE_PROP, '[]');
    M7__setProp_(M7_CONST.EMAIL_LAST_SEND_PROP, String(now));
    M7__markBatchedAlertsSent_();
    return q.length;
  }
  return 0;
}

function M7__markBatchedAlertsSent_() {
  var sh = M7__sh_(M7_CONST.SHEETS.ALERT_LOG);
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][M7_COL.ALERT_LOG.Email_Batched] === true &&
        data[i][M7_COL.ALERT_LOG.Email_Sent] === false) {
      sh.getRange(i + 1, M7_COL.ALERT_LOG.Email_Sent + 1).setValue(true);
    }
  }
}



/**
 * MODULE 7 — Ops Console
 * M7_Alerts.gs
 * @version 3.2.1
 */

function M7_sendAlert(alertType, priority, message, relatedId) {
  var alertDef = {
    type: alertType,
    priority: priority,
    immediate: (priority === M7_CONST.PRIORITY.CRITICAL)
  };

  if (alertType === 'STOP ORDER FAILED' || alertType === 'MarginFraction Kill') {
    alertDef.immediate = true;
  }

  var emailSent = M7__sendAlertEmail_(alertDef, message, relatedId);
  var row = [
    M7__generateId_('ALT'),
    M7__nowIso_(),
    alertType,
    priority,
    message,
    emailSent,
    !alertDef.immediate,
    false,
    relatedId || ''
  ];
  M7__appendRows_(M7_CONST.SHEETS.ALERT_LOG, [row]);
}

function M7__emitCatalogAlert_(alertDef, message, relatedId, dedupeHours) {
  if (M7__alertExists_(alertDef.type, relatedId || '', dedupeHours || 24)) return false;
  var emailSent = M7__sendAlertEmail_(alertDef, message, relatedId);
  var row = [
    M7__generateId_('ALT'),
    M7__nowIso_(),
    alertDef.type,
    alertDef.priority,
    message,
    emailSent,
    !alertDef.immediate,
    false,
    relatedId || ''
  ];
  M7__appendRows_(M7_CONST.SHEETS.ALERT_LOG, [row]);
  return true;
}

function M7__setKillSwitchIfPossible_(reason) {
  try {
    if (typeof M1_ksOn === 'function') {
      M1_ksOn(reason);
      return true;
    }
  } catch (e) {}
  return false;
}


/**
 * MODULE 7 — Ops Console
 * M7_Scanner.gs
 * @version 3.2.1
 */

function M7_runScanner() {
  var count = 0;
  count += M7__scanSignals_();
  count += M7__scanTradeEvents_();
  count += M7__scanRegime_();
  count += M7__scanDrawdown_();
  count += M7__scanConsecutiveLosses_();
  count += M7__scanMoodJournal_();
  count += M7__scanBehaviorScore_();
  count += M7__scanSubaccountBalance_();
  count += M7__scanDataFreshness_();
  count += M7__scanApiLog_();
  count += M7__scanMarginFraction_();
  count += M7__scanDailyLimit_();
  count += M7__scanUniverseReshuffle_();
  count += M7__scanLiquidationBuffers_();
  return count;
}

function M7__scanSignals_() {
  var out = 0;
  try {
    var data = M7__readAll_(M7_CONST.SHEETS.SIGNALS);
    var lastScan = new Date(M7__getLastScan_('SIGNALS') || 0).getTime();
    var dqsThreshold = M7__cfgNum_('DQS_Threshold', 0);

    if (typeof M4_COL !== 'undefined' && M4_COL.SIGNALS) {
      for (var i = 1; i < data.length; i++) {
        var ts = new Date(data[i][M4_COL.SIGNALS.Timestamp]).getTime();
        if (!isFinite(ts) || ts <= lastScan) continue;
        var state = String(data[i][M4_COL.SIGNALS.Final_Signal_State] || '');
        var dqs = M7__safeNum_(data[i][M4_COL.SIGNALS.DQS_Total], 0);
        if (state === 'CONFIRMED' && dqs >= dqsThreshold) {
          if (M7__emitCatalogAlert_(
            M7_CONST.ALERTS.SIGNAL_CONFIRMED,
            String(data[i][M4_COL.SIGNALS.Symbol]) + ' confirmed with DQS ' + dqs,
            data[i][M4_COL.SIGNALS.Signal_ID],
            24
          )) out++;
        }
      }
    }
    M7__setLastScan_('SIGNALS');
  } catch (e) {}
  return out;
}

function M7__scanTradeEvents_() {
  var out = 0;
  try {
    var lastScan = new Date(M7__getLastScan_('TRADES') || 0).getTime();
    var orders = M7__readAll_(M7_CONST.SHEETS.ORDERS);
    var positions = M7__readAll_(M7_CONST.SHEETS.POSITIONS);

    if (typeof M6_COL !== 'undefined' && M6_COL.ORDERS) {
      for (var i = 1; i < orders.length; i++) {
        var ts = new Date(orders[i][M6_COL.ORDERS.Timestamp_Created]).getTime();
        if (!isFinite(ts) || ts <= lastScan) continue;
        if (String(orders[i][M6_COL.ORDERS.Status]) === 'FILLED') {
          var reduceOnly = M6_COL.ORDERS.Reduce_Only !== undefined ? orders[i][M6_COL.ORDERS.Reduce_Only] : false;
          if (!reduceOnly) {
            if (M7__emitCatalogAlert_(
              M7_CONST.ALERTS.TRADE_ENTERED,
              String(orders[i][M6_COL.ORDERS.Symbol]) + ' order filled',
              orders[i][M6_COL.ORDERS.Order_ID],
              24
            )) out++;
          }
        }
        if (String(orders[i][M6_COL.ORDERS.Status]) === 'FAILED') {
          if (M7__emitCatalogAlert_(
            M7_CONST.ALERTS.STOP_ORDER_FAILED,
            'Exit/stop order failed for ' + String(orders[i][M6_COL.ORDERS.Symbol]),
            orders[i][M6_COL.ORDERS.Order_ID],
            2
          )) {
            M7__setKillSwitchIfPossible_('STOP_ORDER_FAILED');
            out++;
          }
        }
      }
    }

    if (typeof M6_COL !== 'undefined' && M6_COL.POSITIONS) {
      for (var j = 1; j < positions.length; j++) {
        var pStatus = String(positions[j][M6_COL.POSITIONS.Position_Status] || '');
        if (pStatus !== 'CLOSED') continue;
        var relatedId = positions[j][M6_COL.POSITIONS.Position_ID];
        var reason = String(positions[j][M6_COL.POSITIONS.Exit_Reason] || '');
        if (reason === 'TP1') {
          if (M7__emitCatalogAlert_(M7_CONST.ALERTS.CORE_TP1_HIT, 'Core TP1 hit for ' + positions[j][M6_COL.POSITIONS.Symbol], relatedId, 168)) out++;
        } else if (reason === 'TRAILING') {
          if (M7__emitCatalogAlert_(M7_CONST.ALERTS.RUNNER_TRAILING_STOP, 'Runner trailing stop hit for ' + positions[j][M6_COL.POSITIONS.Symbol], relatedId, 168)) out++;
        } else if (reason === 'STOP' || reason === 'LIQUIDATION_PROTECT') {
          if (M7__emitCatalogAlert_(M7_CONST.ALERTS.STOP_LOSS_HIT, 'Stop loss hit for ' + positions[j][M6_COL.POSITIONS.Symbol], relatedId, 168)) out++;
        }
      }
    }

    M7__setLastScan_('TRADES');
  } catch (e) {}
  return out;
}

function M7__scanRegime_() {
  var out = 0;
  try {
    var data = M7__readAll_(M7_CONST.SHEETS.REGIME);
    if (data.length >= 3) {
      var last = data[data.length - 1];
      var prev = data[data.length - 2];
      if (M7__safeBool_(last[M7_COL.REGIME.Regime_Changed])) {
        if (M7__emitCatalogAlert_(
          M7_CONST.ALERTS.REGIME_CHANGED,
          'Regime changed from ' + prev[M7_COL.REGIME.Market_Regime] + ' to ' + last[M7_COL.REGIME.Market_Regime],
          '',
          24
        )) out++;
      }
    }
  } catch (e) {}
  return out;
}

function M7__scanDrawdown_() {
  var out = 0;
  try {
    var startEq = M7__cfgNum_('Month_Start_Equity_ZAR', 0);
    if (startEq <= 0) return 0;

    var coll = M7__readAll_(M7_CONST.SHEETS.COLLATERAL);
    var eq = 0;
    for (var i = 1; i < coll.length; i++) {
      if (String(coll[i][M7_COL.COLLATERAL.Location]) === 'FUTURES_SUBACCOUNT') {
        eq += M7__safeNum_(coll[i][M7_COL.COLLATERAL.Value_ZAR], 0);
      }
    }

    var dd = (startEq - eq) / startEq;
    if (dd > M7_CONST.THRESHOLDS.DRAWDOWN_KILL_PCT) {
      if (M7__emitCatalogAlert_(M7_CONST.ALERTS.MONTHLY_DD_KILL, 'Equity down ' + (dd * 100).toFixed(1) + '% from month start', '', 24)) {
        M7__setKillSwitchIfPossible_('MONTHLY_DRAWDOWN_KILL');
        out++;
      }
    } else if (dd > M7_CONST.THRESHOLDS.DRAWDOWN_WARN_PCT) {
      if (M7__emitCatalogAlert_(M7_CONST.ALERTS.MONTHLY_DD_WARNING, 'Equity down ' + (dd * 100).toFixed(1) + '% from month start', '', 24)) out++;
    }
  } catch (e) {}
  return out;
}

function M7__scanConsecutiveLosses_() {
  var out = 0;
  try {
    if (typeof M6_COL === 'undefined' || !M6_COL.POSITIONS) return 0;
    var data = M7__readAll_(M7_CONST.SHEETS.POSITIONS);
    var losses = 0;
    for (var i = data.length - 1; i >= 1; i--) {
      if (String(data[i][M6_COL.POSITIONS.Position_Status]) !== 'CLOSED') continue;
      var pnl = M7__safeNum_(data[i][M6_COL.POSITIONS.Total_Realized_PnL_ZAR], 0);
      if (pnl < 0) losses++;
      else break;
    }

    if (losses >= M7_CONST.THRESHOLDS.CONSEC_LOSS_KILL) {
      if (M7__emitCatalogAlert_(M7_CONST.ALERTS.CONSECUTIVE_LOSSES_7, losses + ' consecutive losing trades', '', 24)) {
        M7__setKillSwitchIfPossible_('CONSECUTIVE_LOSSES_7');
        out++;
      }
    } else if (losses >= M7_CONST.THRESHOLDS.CONSEC_LOSS_WARN) {
      if (M7__emitCatalogAlert_(M7_CONST.ALERTS.CONSECUTIVE_LOSSES_5, losses + ' consecutive losing trades', '', 24)) out++;
    }
  } catch (e) {}
  return out;
}

function M7__scanMoodJournal_() {
  var out = 0;
  try {
    var hour = parseInt(Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'H'), 10);
    if (hour < 10) return 0;

    var today = M7__todaySAST_();
    var data = M7__readAll_(M7_CONST.SHEETS.MOOD_JOURNAL);
    var found = false;
    for (var i = 1; i < data.length; i++) {
      var d = data[i][M7_COL.MOOD_JOURNAL.Date];
      var s = d instanceof Date ? Utilities.formatDate(d, 'Africa/Johannesburg', 'yyyy-MM-dd') : String(d).slice(0, 10);
      if (s === today) { found = true; break; }
    }

    if (!found && M7__getLastAlertDate_('MOOD_JOURNAL') !== today) {
      if (M7__emitCatalogAlert_(M7_CONST.ALERTS.MOOD_JOURNAL_MISSING, 'No mood journal entry by 10:00 SAST', '', 24)) {
        M7__setLastAlertDate_('MOOD_JOURNAL', today);
        out++;
      }
    }
  } catch (e) {}
  return out;
}

function M7__scanBehaviorScore_() {
  var out = 0;
  try {
    var data = M7__readAll_(M7_CONST.SHEETS.BEHAVIOR_SCORE);
    if (data.length < 2) return 0;
    var last = data[data.length - 1];
    var score = M7__safeNum_(last[0], 100);
    if (score < M7_CONST.THRESHOLDS.BEHAVIOR_SCORE_LOW) {
      if (M7__emitCatalogAlert_(M7_CONST.ALERTS.BEHAVIOR_SCORE_LOW, 'Weekly behavior score low: ' + score + '%', '', 168)) out++;
    }
  } catch (e) {}
  return out;
}

function M7__scanSubaccountBalance_() {
  var out = 0;
  try {
    if (typeof M6_COL === 'undefined' || !M6_COL.POSITIONS) return 0;
    var pos = M7__readAll_(M7_CONST.SHEETS.POSITIONS);
    var requiredMargin = 0;
    for (var i = 1; i < pos.length; i++) {
      var status = String(pos[i][M6_COL.POSITIONS.Position_Status] || '');
      if (status !== 'OPEN' && status !== 'PARTIAL') continue;
      var size = M7__safeNum_(pos[i][M6_COL.POSITIONS.Total_Size], 0);
      var price = M7__safeNum_(pos[i][M6_COL.POSITIONS.Current_Price_Quote], M7__safeNum_(pos[i][M6_COL.POSITIONS.Entry_Price_Quote], 0));
      var lev = M7__safeNum_(pos[i][M6_COL.POSITIONS.Leverage], 1);
      var notional = size * price;
      requiredMargin += lev > 0 ? (notional / lev) : notional;
    }
    if (requiredMargin <= 0) return 0;

    var coll = M7__readAll_(M7_CONST.SHEETS.COLLATERAL);
    var equity = 0;
    for (var j = 1; j < coll.length; j++) {
      if (String(coll[j][M7_COL.COLLATERAL.Location]) === 'FUTURES_SUBACCOUNT') {
        equity += M7__safeNum_(coll[j][M7_COL.COLLATERAL.Value_ZAR], 0);
      }
    }

    if (equity < requiredMargin * M7_CONST.THRESHOLDS.SUBACCOUNT_MARGIN_MULT) {
      if (M7__emitCatalogAlert_(M7_CONST.ALERTS.SUBACCOUNT_BAL_LOW, 'Subaccount equity below 2× required margin', '', 4)) out++;
    }
  } catch (e) {}
  return out;
}

function M7__scanDataFreshness_() {
  var out = 0;
  try {
    var data = M7__readAll_(M7_CONST.SHEETS.DATA_CLEAN);
    if (data.length < 2) return 0;
    var lastTs = data[data.length - 1][0];
    var ts = new Date(lastTs).getTime();
    var maxAge = M7_CONST.THRESHOLDS.STALE_DATA_PERIODS * 4 * 60 * 60 * 1000;
    if (isFinite(ts) && Date.now() - ts > maxAge) {
      if (M7__emitCatalogAlert_(M7_CONST.ALERTS.DATA_FEED_STALE, 'No new candle for >2 expected periods', '', 4)) out++;
    }
  } catch (e) {}
  return out;
}

function M7__scanApiLog_() {
  var out = 0;
  try {
    var data = M7__readAll_(M7_CONST.SHEETS.API_LOG);
    if (data.length < 2) return 0;
    var last = data[data.length - 1];
    var status = parseInt(last[M7_COL.API_LOG.HTTP_Status], 10);
    var endpoint = String(last[M7_COL.API_LOG.Endpoint] || '');
    if (status === 429) {
      if (M7__emitCatalogAlert_(M7_CONST.ALERTS.API_RATE_LIMIT_HIT, 'HTTP 429 received from ' + endpoint, endpoint, 1)) out++;
    } else if (status >= 400) {
      if (M7__emitCatalogAlert_(M7_CONST.ALERTS.API_ERROR, 'Non-200 response from ' + endpoint + ' (' + status + ')', endpoint, 1)) out++;
    }
  } catch (e) {}
  return out;
}

function M7__scanMarginFraction_() {
  var out = 0;
  try {
    if (typeof M6_COL === 'undefined' || !M6_COL.POSITIONS) return 0;
    var pos = M7__readAll_(M7_CONST.SHEETS.POSITIONS);
    var hasLeveraged = false;
    for (var i = 1; i < pos.length; i++) {
      var status = String(pos[i][M6_COL.POSITIONS.Position_Status] || '');
      if (status !== 'OPEN' && status !== 'PARTIAL') continue;
      var lev = M7__safeNum_(pos[i][M6_COL.POSITIONS.Leverage], 1);
      if (lev > 1) { hasLeveraged = true; break; }
    }
    if (!hasLeveraged) return 0;

    var mf = M7_pollMarginFraction();
    var warn = M7__cfgNum_('MarginFraction_Warning_Pct', 400);
    var floor = M7__cfgNum_('MarginFraction_Floor_Pct', 300);

    if (mf <= floor) {
      if (M7__emitCatalogAlert_(M7_CONST.ALERTS.MARGIN_FRACTION_KILL, 'marginFraction ' + mf + '% <= floor ' + floor + '%', '', 1)) {
        M7__setKillSwitchIfPossible_('MARGIN_FRACTION_KILL');
        out++;
      }
    } else if (mf <= warn) {
      if (M7__emitCatalogAlert_(M7_CONST.ALERTS.MARGIN_FRACTION_WARNING, 'marginFraction warning: ' + mf + '%', '', 2)) out++;
    }
  } catch (e) {}
  return out;
}

function M7__scanDailyLimit_() {
  var out = 0;
  try {
    if (typeof M6_COL === 'undefined' || !M6_COL.ORDERS) return 0;
    var data = M7__readAll_(M7_CONST.SHEETS.ORDERS);
    var today = M7__todaySAST_();
    var count = 0;
    for (var i = 1; i < data.length; i++) {
      var ts = new Date(data[i][M6_COL.ORDERS.Timestamp_Created]);
      var d = Utilities.formatDate(ts, 'Africa/Johannesburg', 'yyyy-MM-dd');
      var status = String(data[i][M6_COL.ORDERS.Status] || '');
      var reduceOnly = M6_COL.ORDERS.Reduce_Only !== undefined ? data[i][M6_COL.ORDERS.Reduce_Only] : false;
      if (d === today && status === 'FILLED' && !reduceOnly) count++;
    }
    if (count >= 2 && M7__getLastAlertDate_('DAILY_LIMIT') !== today) {
      if (M7__emitCatalogAlert_(M7_CONST.ALERTS.DAILY_LIMIT_REACHED, '2 trades entered today', '', 24)) {
        M7__setLastAlertDate_('DAILY_LIMIT', today);
        out++;
      }
    }
  } catch (e) {}
  return out;
}

function M7__scanUniverseReshuffle_() {
  var out = 0;
  try {
    var data = M7__readAll_(M7_CONST.SHEETS.UNIVERSE);
    if (data.length < 2 || typeof M2_COL === 'undefined' || !M2_COL.UNIVERSE) return 0;

    var currentTop = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][M2_COL.UNIVERSE.In_Top_K] === true) currentTop.push(String(data[i][M2_COL.UNIVERSE.Symbol]));
    }

    var propsKey = 'M7_LAST_TOP10';
    var prevTop = JSON.parse(M7__getProp_(propsKey, '[]'));
    if (prevTop.length > 0) {
      var kept = 0;
      for (var j = 0; j < currentTop.length; j++) {
        if (prevTop.indexOf(currentTop[j]) !== -1) kept++;
      }
      var turnover = currentTop.length > 0 ? 1 - (kept / currentTop.length) : 0;
      if (turnover > M7_CONST.THRESHOLDS.UNIVERSE_TURNOVER_PCT) {
        if (M7__emitCatalogAlert_(M7_CONST.ALERTS.UNIVERSE_RESHUFFLED, 'Top-10 SPS turnover exceeded 30%', '', 24)) out++;
      }
    }
    M7__setProp_(propsKey, JSON.stringify(currentTop));
  } catch (e) {}
  return out;
}



function M7__scanLiquidationBuffers_() {
  var out = 0;
  try {
    if (typeof M6_COL === 'undefined' || !M6_COL.POSITIONS) return 0;

    var warnR = M7__cfgNum_('Ops_Liq_Buffer_Warn_R', 1.5);
    var data = M7__readAll_(M7_CONST.SHEETS.POSITIONS);

    for (var i = 1; i < data.length; i++) {
      var status = String(data[i][M6_COL.POSITIONS.Position_Status] || '');
      if (status !== 'OPEN' && status !== 'PARTIAL') continue;

      var liqR = 999;
      if (M6_COL.POSITIONS.Liquidation_Buffer_R !== undefined) {
        liqR = M7__safeNum_(data[i][M6_COL.POSITIONS.Liquidation_Buffer_R], 999);
      }

      if (liqR < warnR) {
        if (M7__emitCatalogAlert_(
          M7_CONST.ALERTS.LIQ_BUFFER_WARNING,
          'Liquidation buffer ' + liqR.toFixed(2) + 'R below warning threshold ' + warnR.toFixed(2) + 'R for ' +
            String(data[i][M6_COL.POSITIONS.Symbol] || ''),
          String(data[i][M6_COL.POSITIONS.Position_ID] || ''),
          4
        )) {
          out++;
        }
      }
    }
  } catch (e) {
    console.error('[M7] scanLiquidationBuffers failed: ' + e.message);
  }
  return out;
}



/**
 * MODULE 7 — Ops Console
 * M7_Dashboard.gs
 * @version 3.2.1
 *
 * Final polished Google Sheets dashboard with cards, color, and fixed table layout.
 */
function M7_refreshDashboard() {
  var sh = M7__sh_(M7_CONST.SHEETS.DASHBOARD);
  sh.clear();

  // ── Theme ─────────────────────────────────────────────────────────────
  var C = {
    bgDark:      '#0F172A',
    bgSection:   '#1E293B',
    bgCard:      '#F8FAFC',
    bgHeader:    '#E2E8F0',
    border:      '#CBD5E1',
    textDark:    '#0F172A',
    textMid:     '#334155',
    textLight:   '#FFFFFF',

    ok:          '#DCFCE7',
    okText:      '#166534',

    warn:        '#FEF3C7',
    warnText:    '#92400E',

    crit:        '#FEE2E2',
    critText:    '#991B1B',

    info:        '#DBEAFE',
    infoText:    '#1D4ED8',

    neutral:     '#F1F5F9',
    neutralText: '#475569'
  };

  // ── Helpers ───────────────────────────────────────────────────────────
  function setBox(r, c, nr, nc, value, bg, fg, bold, hAlign, vAlign, fontSize) {
    var rng = sh.getRange(r, c, nr, nc);
    if (nr > 1 || nc > 1) rng.merge();
    rng.setValue(value);
    rng.setBackground(bg || '#FFFFFF');
    rng.setFontColor(fg || C.textDark);
    rng.setFontWeight(bold ? 'bold' : 'normal');
    rng.setHorizontalAlignment(hAlign || 'left');
    rng.setVerticalAlignment(vAlign || 'middle');
    if (fontSize) rng.setFontSize(fontSize);
    rng.setBorder(true, true, true, true, true, true, C.border, SpreadsheetApp.BorderStyle.SOLID);
    return rng;
  }

  function sectionHeader(row, title, width) {
    width = width || 12;
    return setBox(row, 1, 1, width, title, C.bgSection, C.textLight, true, 'left', 'middle', 11);
  }

  function statusColors(status) {
    var s = String(status || '').toUpperCase();

    if (s === 'OK' || s === 'FRESH' || s === 'RISK-ON' || s === 'PASS' || s === 'YES') {
      return { bg: C.ok, fg: C.okText };
    }
    if (s === 'WARNING' || s === 'WARN') {
      return { bg: C.warn, fg: C.warnText };
    }
    if (s === 'CRITICAL' || s === 'FAIL' || s === 'NO') {
      return { bg: C.crit, fg: C.critText };
    }
    if (s === 'INFO' || s === 'BACKTEST' || s === 'OUT_OF_SCOPE' || s === 'N/A') {
      return { bg: C.info, fg: C.infoText };
    }
    if (s === 'OFF' || s === 'UNKNOWN' || s === 'STALE') {
      return { bg: C.neutral, fg: C.neutralText };
    }

    return { bg: C.neutral, fg: C.neutralText };
  }

  function drawCard(row, col, title, value, status, width) {
    width = width || 2;

    setBox(row, col, 1, width, title, C.bgHeader, C.textMid, true, 'center', 'middle', 8);

    var colors = statusColors(status || value);
    var valueRng = sh.getRange(row + 1, col, 2, width);
    valueRng.merge();
    valueRng.setValue(value);
    valueRng.setBackground(colors.bg);
    valueRng.setFontColor(colors.fg);
    valueRng.setFontWeight('bold');
    valueRng.setFontSize(13);
    valueRng.setHorizontalAlignment('center');
    valueRng.setVerticalAlignment('middle');
    valueRng.setBorder(true, true, true, true, true, true, C.border, SpreadsheetApp.BorderStyle.SOLID);
  }

  function kvGrid(row, items) {
    for (var i = 0; i < items.length; i++) {
      var r = row + i;

      setBox(r, 1, 1, 3, items[i][0], C.bgCard, C.textDark, true, 'left', 'middle', 10);
      var leftColors = statusColors(items[i][2] || items[i][1]);
      setBox(r, 4, 1, 3, items[i][1], leftColors.bg, leftColors.fg, true, 'center', 'middle', 10);

      setBox(r, 7, 1, 3, items[i][3], C.bgCard, C.textDark, true, 'left', 'middle', 10);
      var rightColors = statusColors(items[i][5] || items[i][4]);
      setBox(r, 10, 1, 3, items[i][4], rightColors.bg, rightColors.fg, true, 'center', 'middle', 10);
    }
    return row + items.length;
  }

  function tableHeader(row, headers) {
    sh.getRange(row, 1, 1, headers.length)
      .setValues([headers])
      .setBackground(C.bgHeader)
      .setFontWeight('bold')
      .setFontColor(C.textDark)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle')
      .setBorder(true, true, true, true, true, true, C.border, SpreadsheetApp.BorderStyle.SOLID);
    sh.setRowHeight(row, 24);
  }

  function tableRows(row, rows, width, alignments) {
    if (!rows || rows.length === 0) {
      setBox(row, 1, 1, width, 'No data available.', '#FFFFFF', C.neutralText, false, 'center', 'middle', 10);
      sh.setRowHeight(row, 24);
      return row + 1;
    }

    var rng = sh.getRange(row, 1, rows.length, width);
    rng.setValues(rows)
      .setBorder(true, true, true, true, true, true, C.border, SpreadsheetApp.BorderStyle.SOLID)
      .setVerticalAlignment('middle')
      .setWrap(true);

    for (var i = 0; i < rows.length; i++) {
      var bg = (i % 2 === 0) ? '#FFFFFF' : '#F8FAFC';
      sh.getRange(row + i, 1, 1, width).setBackground(bg);
      sh.setRowHeight(row + i, 22);
    }

    if (alignments && alignments.length === width) {
      for (var c = 0; c < width; c++) {
        sh.getRange(row, c + 1, rows.length, 1).setHorizontalAlignment(alignments[c]);
      }
    }

    return row + rows.length;
  }

  // ── Data collection ───────────────────────────────────────────────────
  var mode = M7__cfgStr_('System_Mode', 'BACKTEST');
  var killSwitch = M7__cfgBool_('Kill_Switch', false) ? 'ON' : 'OFF';
  var liqWarnR = M7__cfgNum_('Ops_Liq_Buffer_Warn_R', 1.5);
  var behaviorStatus = 'OUT_OF_SCOPE';

  var regime = 'UNKNOWN';
  try {
    var regimeData = M7__readAll_(M7_CONST.SHEETS.REGIME);
    if (regimeData.length >= 2) {
      regime = String(regimeData[regimeData.length - 1][M7_COL.REGIME.Market_Regime] || 'UNKNOWN');
    }
  } catch (e) {}

  var fresh = 'UNKNOWN';
  try {
    var dc = M7__readAll_(M7_CONST.SHEETS.DATA_CLEAN);
    if (dc.length >= 2) {
      var lastTs = new Date(dc[dc.length - 1][0]).getTime();
      var maxAge = 2 * 4 * 60 * 60 * 1000;
      fresh = (Date.now() - lastTs <= maxAge) ? 'FRESH' : 'STALE';
    }
  } catch (e2) {}

  var equity = 0;
  try {
    var coll = M7__readAll_(M7_CONST.SHEETS.COLLATERAL);
    for (var i = 1; i < coll.length; i++) {
      if (String(coll[i][M7_COL.COLLATERAL.Location]) === 'FUTURES_SUBACCOUNT') {
        equity += M7__safeNum_(coll[i][M7_COL.COLLATERAL.Value_ZAR], 0);
      }
    }
  } catch (e3) {}

  var openPnl = 0, monthPnl = 0, openPositions = [], closedPositions = [];
  var openCount = 0, levCount = 0, totalExpPct = 0, avgLev = 0, consecLosses = 0;

  try {
    if (typeof M6_COL !== 'undefined' && M6_COL.POSITIONS) {
      var pos = M7__readAll_(M7_CONST.SHEETS.POSITIONS);
      var levSum = 0;

      for (var p = 1; p < pos.length; p++) {
        var status = String(pos[p][M6_COL.POSITIONS.Position_Status] || '');
        if (status === 'OPEN' || status === 'PARTIAL') {
          openCount++;
          openPositions.push(pos[p]);
          openPnl += M7__safeNum_(pos[p][M6_COL.POSITIONS.Unrealized_PnL_ZAR], 0);

          var lev = M7__safeNum_(pos[p][M6_COL.POSITIONS.Leverage], 1);
          levSum += lev;
          if (lev > 1) levCount++;

          var size = M7__safeNum_(pos[p][M6_COL.POSITIONS.Total_Size], 0);
          var price = M7__safeNum_(
            pos[p][M6_COL.POSITIONS.Current_Price_Quote],
            M7__safeNum_(pos[p][M6_COL.POSITIONS.Entry_Price_Quote], 0)
          );
          if (equity > 0) totalExpPct += ((size * price) / equity) * 100;
        } else if (status === 'CLOSED') {
          closedPositions.push(pos[p]);
          monthPnl += M7__safeNum_(pos[p][M6_COL.POSITIONS.Total_Realized_PnL_ZAR], 0);
        }
      }

      avgLev = openCount > 0 ? levSum / openCount : 0;

      for (var c = closedPositions.length - 1; c >= 0; c--) {
        var pnl = M7__safeNum_(closedPositions[c][M6_COL.POSITIONS.Total_Realized_PnL_ZAR], 0);
        if (pnl < 0) consecLosses++;
        else break;
      }
    }
  } catch (e4) {}

  var monthStart = M7__cfgNum_('Month_Start_Equity_ZAR', 0);
  var ddPct = monthStart > 0 ? ((monthStart - equity) / monthStart) * 100 : 0;
  var ddVsKill = monthStart > 0 ? (ddPct.toFixed(1) + '% / 15.0%') : 'N/A';

  var mf = M7_pollMarginFraction();
  var mfStatus = 'N/A';
  if (mf > 0) {
    var warn = M7__cfgNum_('MarginFraction_Warning_Pct', 400);
    var floor = M7__cfgNum_('MarginFraction_Floor_Pct', 300);
    if (mf <= floor) mfStatus = 'CRITICAL';
    else if (mf <= warn) mfStatus = 'WARNING';
    else mfStatus = 'OK';
  }

  var top5 = [];
  try {
    if (typeof M2_COL !== 'undefined' && M2_COL.UNIVERSE) {
      var uni = M7__readAll_(M7_CONST.SHEETS.UNIVERSE);
      var tmp = [];
      for (var u = 1; u < uni.length; u++) tmp.push(uni[u]);
      tmp.sort(function(a, b) {
        return M7__safeNum_(b[M2_COL.UNIVERSE.SPS_Final], 0) - M7__safeNum_(a[M2_COL.UNIVERSE.SPS_Final], 0);
      });
      top5 = tmp.slice(0, 5);
    }
  } catch (e5) {}

  var unack = 0;
  try {
    var alerts = M7__readAll_(M7_CONST.SHEETS.ALERT_LOG);
    for (var a = 1; a < alerts.length; a++) {
      if (alerts[a][M7_COL.ALERT_LOG.Acknowledged] !== true) unack++;
    }
  } catch (e6) {}

  // ── Layout setup ──────────────────────────────────────────────────────
  sh.setHiddenGridlines(true);
  sh.setColumnWidths(1, 12, 110);
  sh.setColumnWidth(1, 155);
  sh.setColumnWidth(2, 95);
  sh.setColumnWidth(3, 95);
  sh.setColumnWidth(4, 115);
  sh.setColumnWidth(5, 105);
  sh.setColumnWidth(6, 115);
  sh.setColumnWidth(7, 105);
  sh.setColumnWidth(8, 105);
  sh.setColumnWidth(9, 90);
  sh.setColumnWidth(10, 110);
  sh.setColumnWidth(11, 120);
  sh.setColumnWidth(12, 140);

  var row = 1;

  // ── Title ─────────────────────────────────────────────────────────────
  setBox(row, 1, 1, 12, '$T$T DASHBOARD v3.2.1', C.bgDark, C.textLight, true, 'center', 'middle', 16);
  sh.setRowHeight(row, 28);
  row++;

  setBox(row, 1, 1, 12, 'Last Updated: ' + M7__nowSAST_() + ' SAST', C.neutral, C.textMid, false, 'center', 'middle', 10);
  sh.setRowHeight(row, 22);
  row += 2;

  // ── Summary cards ─────────────────────────────────────────────────────
  drawCard(row, 1, 'MODE', mode, mode, 2);
  drawCard(row, 3, 'REGIME', regime, regime, 2);
  drawCard(row, 5, 'DATA', fresh, fresh, 2);
  drawCard(row, 7, 'MARGIN FRACTION', (mf > 0 ? mf + '%' : 'N/A'), mfStatus, 2);
  drawCard(row, 9, 'EQUITY', equity.toFixed(2) + ' ZAR', 'INFO', 2);
  drawCard(row, 11, 'ALERTS', String(unack), unack > 0 ? 'WARNING' : 'OK', 2);

  sh.setRowHeights(row, 3, 24);
  row += 4;

  // ── System status ─────────────────────────────────────────────────────
  sectionHeader(row, 'SYSTEM STATUS', 12);
  sh.setRowHeight(row, 24);
  row++;
  row = kvGrid(row, [
    ['Mode', mode, mode, 'Kill Switch', killSwitch, 'INFO'],
    ['Regime', regime, regime, 'Data Freshness', fresh, fresh],
    ['Behavior', behaviorStatus, 'INFO', 'Unacknowledged Alerts', String(unack), unack > 0 ? 'WARNING' : 'INFO']
  ]);
  row += 1;

  // ── Account & risk ────────────────────────────────────────────────────
  sectionHeader(row, 'ACCOUNT & RISK', 12);
  sh.setRowHeight(row, 24);
  row++;
  row = kvGrid(row, [
    ['Equity (ZAR)', equity.toFixed(2), 'INFO', 'Open P&L', openPnl.toFixed(2), 'INFO'],
    ['Month P&L', monthPnl.toFixed(2), 'INFO', 'DD vs Kill', ddVsKill, 'INFO'],
    ['Open Positions', String(openCount), 'INFO', 'Leveraged Positions', String(levCount), 'INFO'],
    ['Total Exposure %', totalExpPct.toFixed(2) + '%', 'INFO', 'Avg Leverage', avgLev.toFixed(2), 'INFO'],
    ['Margin Fraction', mf > 0 ? (mf + '%') : 'N/A', mfStatus, 'Margin Status', mfStatus, mfStatus],
    ['Liq Buffer Warn R', liqWarnR.toFixed(2), 'INFO', 'Consecutive Losses', String(consecLosses), 'INFO']
  ]);
  row += 1;

  // ── Governance ────────────────────────────────────────────────────────
  sectionHeader(row, 'GOVERNANCE', 12);
  sh.setRowHeight(row, 24);
  row++;
  setBox(row, 1, 1, 12, 'Behavioral governance is out of scope for $T$T', '#FFFFFF', C.textDark, false, 'left', 'middle', 10);
  sh.setRowHeight(row, 22);
  row++;
  setBox(row, 1, 1, 12, 'Operator discipline is managed outside the trading engine', '#FFFFFF', C.textDark, false, 'left', 'middle', 10);
  sh.setRowHeight(row, 22);
  row += 2;

  // ── Top candidates ────────────────────────────────────────────────────
  sectionHeader(row, 'TOP 5 SWING CANDIDATES', 12);
  sh.setRowHeight(row, 24);
  row++;
  tableHeader(row, ['Symbol', 'SPS', 'Type', 'Distance to Level', 'Squeeze', 'Direction']);
  row++;

  var candidateRows = [];
  for (var t = 0; t < top5.length; t++) {
    candidateRows.push([
      String(top5[t][M2_COL.UNIVERSE.Symbol] || ''),
      String(top5[t][M2_COL.UNIVERSE.SPS_Final] || ''),
      String((M2_COL.UNIVERSE.Market_Type !== undefined ? top5[t][M2_COL.UNIVERSE.Market_Type] : 'N/A')),
      String((M2_COL.UNIVERSE.Distance_to_Level !== undefined ? top5[t][M2_COL.UNIVERSE.Distance_to_Level] : 'N/A')),
      String((M2_COL.UNIVERSE.BB_Squeeze !== undefined ? top5[t][M2_COL.UNIVERSE.BB_Squeeze] : 'N/A')),
      String((M2_COL.UNIVERSE.Direction !== undefined ? top5[t][M2_COL.UNIVERSE.Direction] : 'N/A'))
    ]);
  }
  row = tableRows(row, candidateRows, 6, ['left', 'center', 'center', 'center', 'center', 'center']);
  row += 2;

  // ── Open positions ────────────────────────────────────────────────────
  sectionHeader(row, 'OPEN POSITIONS', 12);
  sh.setRowHeight(row, 24);
  row++;
  tableHeader(row, ['Dir', 'Symbol', 'Lev', 'Margin Mode', 'Entry', 'Stop', 'PnL%', 'R', 'DQS', 'Liq Buffer OK?', 'Liq Source']);
  row++;

  var openRows = [];
  for (var op = 0; op < openPositions.length; op++) {
    var prow = openPositions[op];
    var liqOk = 'N/A';
    if (M6_COL.POSITIONS.Liquidation_Buffer_R !== undefined) {
      liqOk = M7__safeNum_(prow[M6_COL.POSITIONS.Liquidation_Buffer_R], 999) >= liqWarnR ? 'YES' : 'NO';
    }

    openRows.push([
      String(prow[M6_COL.POSITIONS.Direction] || ''),
      String(prow[M6_COL.POSITIONS.Symbol] || ''),
      String(M7__safeNum_(prow[M6_COL.POSITIONS.Leverage], 1)) + '×',
      String(prow[M6_COL.POSITIONS.Margin_Mode] || ''),
      String(prow[M6_COL.POSITIONS.Entry_Price_Quote] || ''),
      String(prow[M6_COL.POSITIONS.Initial_Stop_Quote] || ''),
      String((M6_COL.POSITIONS.Unrealized_PnL_Pct !== undefined ? prow[M6_COL.POSITIONS.Unrealized_PnL_Pct] : 'N/A')),
      String(prow[M6_COL.POSITIONS.Current_R_Multiple] || ''),
      String((M6_COL.POSITIONS.DQS_Grade !== undefined ? prow[M6_COL.POSITIONS.DQS_Grade] : 'N/A')),
      liqOk,
      String((M6_COL.POSITIONS.Liquidation_Price_Source !== undefined ? prow[M6_COL.POSITIONS.Liquidation_Price_Source] : 'N/A'))
    ]);
  }

  if (openRows.length === 0) {
    setBox(row, 1, 1, 11, 'No open positions.', '#FFFFFF', C.neutralText, false, 'center', 'middle', 10);
    sh.setRowHeight(row, 24);
    row++;
  } else {
    row = tableRows(row, openRows, 11, ['center', 'left', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center']);
  }
  row += 2;

  // ── Closed trades ─────────────────────────────────────────────────────
  sectionHeader(row, 'RECENT CLOSED TRADES', 12);
  sh.setRowHeight(row, 24);
  row++;
  tableHeader(row, ['Dir', 'Symbol', 'Entry', 'Exit', 'PnL ZAR', 'R-mult', 'Reason']);
  row++;

  var recent = closedPositions.slice(-5).reverse();
  var recentRows = [];
  for (var rc = 0; rc < recent.length; rc++) {
    recentRows.push([
      String(recent[rc][M6_COL.POSITIONS.Direction] || ''),
      String(recent[rc][M6_COL.POSITIONS.Symbol] || ''),
      String(recent[rc][M6_COL.POSITIONS.Entry_Price_Quote] || ''),
      String((M6_COL.POSITIONS.Core_Exit_Price_Quote !== undefined ? recent[rc][M6_COL.POSITIONS.Core_Exit_Price_Quote] : 'N/A')),
      String(recent[rc][M6_COL.POSITIONS.Total_Realized_PnL_ZAR] || ''),
      String(recent[rc][M6_COL.POSITIONS.Current_R_Multiple] || ''),
      String(recent[rc][M6_COL.POSITIONS.Exit_Reason] || '')
    ]);
  }

  if (recentRows.length === 0) {
    setBox(row, 1, 1, 7, 'No closed trades available.', '#FFFFFF', C.neutralText, false, 'center', 'middle', 10);
    sh.setRowHeight(row, 24);
    row++;
  } else {
    row = tableRows(row, recentRows, 7, ['center', 'left', 'center', 'center', 'center', 'center', 'left']);
  }
  row += 2;

  // ── Performance ───────────────────────────────────────────────────────
  sectionHeader(row, 'PERFORMANCE', 12);
  sh.setRowHeight(row, 24);
  row++;
  row = kvGrid(row, [
    ['Long Win %', 'N/A', 'INFO', 'Short Win %', 'N/A', 'INFO'],
    ['Expectancy', 'N/A', 'INFO', 'Profit Factor', 'N/A', 'INFO'],
    ['Avg Leverage', avgLev.toFixed(2), 'INFO', 'Carry Cost Total ZAR', 'N/A', 'INFO']
  ]);
  row += 1;

  // ── Creed ─────────────────────────────────────────────────────────────
  sectionHeader(row, 'TRADING CREED', 12);
  sh.setRowHeight(row, 24);
  row++;
  setBox(row, 1, 1, 12, 'I trade what I see, not what I think.', '#FFFFFF', C.textDark, false, 'center', 'middle', 10);
  sh.setRowHeight(row, 22);
  row++;
  setBox(row, 1, 1, 12, 'Leverage multiplies discipline — not greed.', '#FFFFFF', C.textDark, false, 'center', 'middle', 10);
  sh.setRowHeight(row, 22);
  row++;
  setBox(row, 1, 1, 12, 'I am building my freedom. Consistency is my edge.', '#FFFFFF', C.textDark, false, 'center', 'middle', 10);
  sh.setRowHeight(row, 22);

  // ── Final formatting ──────────────────────────────────────────────────
  sh.setFrozenRows(2);
  sh.getDataRange().setWrap(true);
  sh.getDataRange().setVerticalAlignment('middle');
  sh.getDataRange().setFontFamily('Arial');
}


/**
 * MODULE 7 — Ops Console
 * M7_Main.gs
 * @version 3.2.1
 */

function M7_runOpsConsole() {
  try {
    M7_runScanner();
    M7_processBatchedEmails();
    M7_refreshDashboard();
  } catch (e) {
    console.error('[M7] Fatal error: ' + e.message);
    try {
      M7_sendAlert('Script Execution Failed', 'CRITICAL', e.message, '');
    } catch (e2) {}
  }
}

function M7_logApiCall(timestamp, endpoint, code, ms, body) {
  try {
    var row = [
      timestamp || M7__nowIso_(),
      endpoint || '',
      code || '',
      ms || '',
      M7__safeStr_(body).slice(0, 200)
    ];
    M7__appendRows_(M7_CONST.SHEETS.API_LOG, [row]);
  } catch (e) {
    console.error('[M7] API log failed: ' + e.message);
  }
}

function M7_API_logCall(timestamp, endpoint, code, ms, body) {
  M7_logApiCall(timestamp, endpoint, code, ms, body);
}

function M7_pollMarginFraction() {
  var mode = M7__cfgStr_('System_Mode', 'BACKTEST').toUpperCase();
  if (mode === 'BACKTEST') {
    var mockVal = M7__cfgNum_('MarginFraction_Current', 500);
    M7_logApiCall(M7__nowIso_(), '/v1/margin/status', 200, 0, 'mock marginFraction=' + mockVal);
    return mockVal;
  }

  var endpoint = M7__cfgStr_('MarginFraction_Endpoint', '/v1/margin/status');
  var start = new Date().getTime();
  try {
    var response = UrlFetchApp.fetch('https://api.valr.com' + endpoint, { method: 'get', muteHttpExceptions: true });
    var latency = new Date().getTime() - start;
    var code = response.getResponseCode();
    var text = response.getContentText();
    M7_logApiCall(M7__nowIso_(), endpoint, code, latency, text.slice(0, 200));

    if (code === 429) {
      M7__emitCatalogAlert_(M7_CONST.ALERTS.API_RATE_LIMIT_HIT, 'HTTP 429 from ' + endpoint, endpoint, 1);
      return 0;
    }
    if (code !== 200) {
      M7__emitCatalogAlert_(M7_CONST.ALERTS.API_ERROR, 'Non-200 response from ' + endpoint + ' (' + code + ')', endpoint, 1);
      return 0;
    }

    var parsed = JSON.parse(text);
    var mf = M7__safeNum_(parsed.marginFraction, 0);
    return mf;
  } catch (e) {
    var latency2 = new Date().getTime() - start;
    M7_logApiCall(M7__nowIso_(), endpoint, 500, latency2, 'Error: ' + e.message);
    M7__emitCatalogAlert_(M7_CONST.ALERTS.API_ERROR, 'marginFraction poll failed: ' + e.message, endpoint, 1);
    return 0;
  }
}

function M7_testRunAll() {
  var results = [];
  try { M7__sh_(M7_CONST.SHEETS.ALERT_LOG); results.push('✅ ALERT_LOG'); } catch (e) { results.push('❌ ALERT_LOG ' + e.message); }
  try { M7__sh_(M7_CONST.SHEETS.DASHBOARD); results.push('✅ DASHBOARD'); } catch (e2) { results.push('❌ DASHBOARD ' + e2.message); }
  try { M7__sh_(M7_CONST.SHEETS.API_LOG); results.push('✅ API_LOG'); } catch (e3) { results.push('❌ API_LOG ' + e3.message); }
  try { M7_logApiCall(M7__nowIso_(), '/test', 200, 1, 'ok'); results.push('✅ API LOG WRITE'); } catch (e4) { results.push('❌ API LOG WRITE ' + e4.message); }
  try { M7_refreshDashboard(); results.push('✅ DASHBOARD REFRESH'); } catch (e5) { results.push('❌ DASHBOARD REFRESH ' + e5.message); }
  try { M7_sendAlert('Test Alert', 'NORMAL', 'Test batch alert', ''); results.push('✅ ALERT WRITE'); } catch (e6) { results.push('❌ ALERT WRITE ' + e6.message); }

  for (var i = 0; i < results.length; i++) console.log(results[i]);
  return results;
}
