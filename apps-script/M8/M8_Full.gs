/**
 * MODULE 8 — Behavior + Governance
 * M8_Constants.gs
 *
 * Immutable constants, 0-based column maps, rule thresholds.
 * Single source of truth for all M8 schemas and behavioral parameters.
 *
 * Chair Decision v4.0.0 — FINAL
 */

var M8_CONST = Object.freeze({
  VERSION: '4.0.0',

  // ── Sheet Names ────────────────────────────────────────────────────────
  SHEETS: Object.freeze({
    MOOD_JOURNAL   : 'MOOD_JOURNAL',
    BEHAVIOR_SCORE : 'BEHAVIOR_SCORE',
    CONFIG         : 'CONFIG'
  }),

  // ── Mood Rule Thresholds ───────────────────────────────────────────────
  MOOD_BLOCK_BELOW        : 4,    // Mood < 4  → Trading_Allowed = FALSE
  MOOD_REDUCED_BELOW      : 6,    // Mood 4-5  → sizeMod 0.5×
  MOOD_REDUCED_SIZE_MOD   : 0.5,  // size modifier when mood 4-5
  MOOD_CONSEC_THRESHOLD   : 5,    // "low" for consecutive counting
  MOOD_CONSEC_DAYS        : 3,    // 3+ consecutive < 5 → Kill Switch
  JOURNAL_DEADLINE_HOUR   : 10,   // SAST hour; no entry by 10:00 = blocked
  SUBSTANCE_BAN_DAYS      : 2,    // blocks today + tomorrow

  // ── Behavior Rule Thresholds ───────────────────────────────────────────
  BEHAVIOR_MAX_SCORE      : 25,   // 5 questions × 5 max each
  BEHAVIOR_OK_PCT         : 80,   // ≥ 80% = OK
  BEHAVIOR_WARN_PCT       : 60,   // 60-79% = WARNING; < 60% = FAIL
  BEHAVIOR_CONSEC_WEEKS   : 2,    // 2 weeks < 60% → Kill Switch + pause
  BEHAVIOR_PAUSE_DAYS     : 7,    // 1-week mandatory pause

  // ── Go-Live Gates ──────────────────────────────────────────────────────
  GATE_MOOD_DAYS          : 14,   // min consecutive mood journal days
  GATE_BEHAVIOR_WEEKS     : 2,    // min consecutive weeks ≥ 80%
  GATE_SUBSTANCE_ENTRIES  : 2,    // last N entries must be substance-free

  // ── Script Property Keys ───────────────────────────────────────────────
  PROP_SUBSTANCE_BAN      : 'M8_SUBSTANCE_BAN_UNTIL',
  PROP_BEHAVIOR_PAUSE     : 'M8_BEHAVIOR_PAUSE_UNTIL',

  // ── Enums ──────────────────────────────────────────────────────────────
  EMOTIONAL_STATES: Object.freeze([
    'Calm', 'Anxious', 'Excited', 'Frustrated', 'Neutral'
  ]),

  STATUS: Object.freeze({
    OK      : 'OK',
    WARNING : 'WARNING',
    FAIL    : 'FAIL'
  })
});

/**
 * 0-based column index maps for M8-owned sheets.
 * Update here ONLY if sheet headers change.
 */
var M8_COL = Object.freeze({

  // MOOD_JOURNAL — 9 columns (A–I)
  MJ: Object.freeze({
    Date               : 0,
    Mood_Score          : 1,
    Slept_Hours         : 2,
    Substance_Free      : 3,
    Exercise_Today      : 4,
    Emotional_State     : 5,
    Notes               : 6,
    Trading_Allowed     : 7,
    Size_Modifier_Force : 8
  }),

  // BEHAVIOR_SCORE — 8 columns (A–H)
  BS: Object.freeze({
    Date                  : 0,
    Q1_Plan_Followed      : 1,
    Q2_Journaled          : 2,
    Q3_Reviewed_Rejects   : 3,
    Q4_No_Impulsive_Acts  : 4,
    Q5_Routine_Maintained : 5,
    Weekly_Score_Pct      : 6,
    Status                : 7
  })
});



/**
 * MODULE 8 — Behavior + Governance
 * M8_Utils.gs
 *
 * Private utility functions: sheet I/O, date handling, safe parsing,
 * Script Properties, alert delegation.
 * All functions prefixed M8__ (double underscore = private).
 *
 * Chair Decision v4.0.0 — FINAL
 */

// ═════════════════════════════════════════════════════════════════════════
// SHEET I/O
// ═════════════════════════════════════════════════════════════════════════

function M8__getSheet(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('[M8] Sheet not found: ' + name);
  return sheet;
}

function M8__readAll(sheetName) {
  var sheet = M8__getSheet(sheetName);
  if (sheet.getLastRow() < 1) return [];
  return sheet.getDataRange().getValues();
}

function M8__appendRow(sheetName, row) {
  M8__getSheet(sheetName).appendRow(row);
}

/**
 * Updates an existing row. rowIdx is 0-based (matching data array index).
 * data[0] = header = sheet row 1, so data[i] = sheet row i+1.
 */
function M8__updateRow(sheetName, rowIdx, row) {
  var sheet = M8__getSheet(sheetName);
  sheet.getRange(rowIdx + 1, 1, 1, row.length).setValues([row]);
}

function M8__getLastNRows(sheetName, n) {
  var data = M8__readAll(sheetName);
  // Skip header (index 0); return last n data rows
  return data.slice(Math.max(data.length - n, 1));
}

// ═════════════════════════════════════════════════════════════════════════
// DATE HELPERS (SAST = Africa/Johannesburg)
// ═════════════════════════════════════════════════════════════════════════

function M8__todayStr() {
  return Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'yyyy-MM-dd');
}

function M8__currentHour() {
  return parseInt(Utilities.formatDate(new Date(), 'Africa/Johannesburg', 'H'), 10);
}

/** Normalizes a Date object or string to 'yyyy-MM-dd' in SAST. */
function M8__normDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, 'Africa/Johannesburg', 'yyyy-MM-dd');
  }
  return String(val).slice(0, 10);
}

/**
 * Adds days to a 'yyyy-MM-dd' string, returns 'yyyy-MM-dd'.
 * Pure date arithmetic — no timezone drift.
 */
function M8__addDaysStr(dateStr, days) {
  var p = String(dateStr).split('-');
  var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  d.setDate(d.getDate() + days);
  var yy = d.getFullYear();
  var mm = d.getMonth() + 1;
  var dd = d.getDate();
  return yy + '-' + (mm < 10 ? '0' : '') + mm + '-' + (dd < 10 ? '0' : '') + dd;
}

// ═════════════════════════════════════════════════════════════════════════
// TYPE HELPERS
// ═════════════════════════════════════════════════════════════════════════

function M8__safeInt(v) {
  var n = parseInt(v, 10);
  return isNaN(n) ? 0 : n;
}

function M8__safeFloat(v) {
  var n = parseFloat(v);
  return isFinite(n) ? n : 0;
}

function M8__safeBool(v) {
  if (v === true) return true;
  if (v === false) return false;
  return String(v).trim().toUpperCase() === 'TRUE';
}

function M8__safeStr(v) {
  return v != null ? String(v).trim() : '';
}

function M8__clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// ═════════════════════════════════════════════════════════════════════════
// SCRIPT PROPERTIES (for bans / pauses — immutable from UI)
// ═════════════════════════════════════════════════════════════════════════

function M8__getProp(key, fallback) {
  var v = PropertiesService.getScriptProperties().getProperty(key);
  return v === null ? fallback : v;
}

function M8__setProp(key, value) {
  PropertiesService.getScriptProperties().setProperty(key, String(value));
}

function M8__clearProp(key) {
  PropertiesService.getScriptProperties().deleteProperty(key);
}

// ═════════════════════════════════════════════════════════════════════════
// ALERT DELEGATION (M7 with console fallback)
// ═════════════════════════════════════════════════════════════════════════

function M8__alert(type, message, priority) {
  priority = priority || 'CAUTION';
  try {
    if (typeof M7_sendAlert === 'function') {
      M7_sendAlert(type, priority, message, M8__todayStr());
      return;
    }
  } catch (e) { /* fallthrough to console */ }
  console.log('[M8] ' + type + ' (' + priority + '): ' + message);
}

// ═════════════════════════════════════════════════════════════════════════
// CONFIG ACCESS (reads from CONFIG sheet via M1 or direct)
// ═════════════════════════════════════════════════════════════════════════

function M8__cfgGet(key, fallback) {
  try {
    if (typeof M1_cfgGet === 'function') return M1_cfgGet(key);
  } catch (e) { /* fallthrough */ }
  try {
    var data = M8__readAll(M8_CONST.SHEETS.CONFIG);
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === key) {
        return data[i][1] != null ? data[i][1] : fallback;
      }
    }
  } catch (e) { /* fallthrough */ }
  return fallback;
}

function M8__cfgGetBool(key) {
  return M8__safeBool(M8__cfgGet(key, false));
}


/**
 * MODULE 8 — Behavior + Governance
 * M8_Mood.gs
 *
 * Mood journal entry: validation, trading permission calculation,
 * consecutive day tracking, substance carryover enforcement.
 * Includes UI menu function for manual entry.
 *
 * Chair Decision v4.0.0 — FINAL
 */

// ═════════════════════════════════════════════════════════════════════════
// PUBLIC: SAVE MOOD JOURNAL ENTRY
// ═════════════════════════════════════════════════════════════════════════

/**
 * Saves mood journal entry. Auto-calculates Trading_Allowed and
 * Size_Modifier_Force. Enforces substance ban and consecutive low check.
 *
 * @param {number} moodScore      1-10
 * @param {number} sleptHours     0-24
 * @param {boolean} substanceFree no alcohol/drugs today
 * @param {boolean} exerciseToday exercised today
 * @param {string} emotionalState Calm/Anxious/Excited/Frustrated/Neutral
 * @param {string} notes          free text
 * @returns {Object} { success, allowed, sizeMod, warnings[] }
 */
function M8_saveMoodEntry(moodScore, sleptHours, substanceFree, exerciseToday, emotionalState, notes) {
  var today = M8__todayStr();
  var mj = M8_COL.MJ;
  var warnings = [];

  // ── 1. Validate and clamp inputs ───────────────────────────────────────
  moodScore     = M8__clamp(M8__safeInt(moodScore) || 5, 1, 10);
  sleptHours    = M8__clamp(M8__safeFloat(sleptHours), 0, 24);
  substanceFree = M8__safeBool(substanceFree);
  exerciseToday = M8__safeBool(exerciseToday);
  if (M8_CONST.EMOTIONAL_STATES.indexOf(emotionalState) === -1) {
    emotionalState = 'Neutral';
  }
  notes = M8__safeStr(notes);

  // ── 2. Load existing data and find today's row ─────────────────────────
  var data = M8__readAll(M8_CONST.SHEETS.MOOD_JOURNAL);
  var todayIdx = -1;
  for (var i = 1; i < data.length; i++) {
    if (M8__normDate(data[i][mj.Date]) === today) {
      todayIdx = i;
      break;
    }
  }

  // ── 3. Calculate Trading_Allowed and Size_Modifier_Force ───────────────
  var tradingAllowed = true;
  var sizeMod = 1.0;

  // Rule A: Mood threshold
  if (moodScore < M8_CONST.MOOD_BLOCK_BELOW) {
    tradingAllowed = false;
    sizeMod = 0;
    warnings.push('Mood ' + moodScore + ' < ' + M8_CONST.MOOD_BLOCK_BELOW + ': trading blocked.');
  } else if (moodScore < M8_CONST.MOOD_REDUCED_BELOW) {
    sizeMod = M8_CONST.MOOD_REDUCED_SIZE_MOD;
    warnings.push('Mood ' + moodScore + ': size modifier ' + sizeMod + '\u00D7.');
  }

  // Rule B: Substance use today → ban today + tomorrow
  if (!substanceFree) {
    tradingAllowed = false;
    sizeMod = 0;
    var banUntil = M8__addDaysStr(today, M8_CONST.SUBSTANCE_BAN_DAYS);
    M8__setProp(M8_CONST.PROP_SUBSTANCE_BAN, banUntil);
    warnings.push('Substance use: blocked today + tomorrow (until ' + banUntil + ').');
  }

  // Rule C: Active substance ban from previous day
  var banStr = M8__getProp(M8_CONST.PROP_SUBSTANCE_BAN, '');
  if (banStr && today < banStr) {
    tradingAllowed = false;
    sizeMod = 0;
    warnings.push('Substance ban active until ' + banStr + '.');
  }

  // Rule D: Consecutive low moods (check previous entries + today)
  if (moodScore < M8_CONST.MOOD_CONSEC_THRESHOLD) {
    var consecLow = 1; // today counts as 1
    for (var c = data.length - 1; c >= 1 && consecLow < M8_CONST.MOOD_CONSEC_DAYS; c--) {
      if (M8__normDate(data[c][mj.Date]) === today) continue; // skip existing today
      var prevMood = M8__safeInt(data[c][mj.Mood_Score]);
      if (prevMood > 0 && prevMood < M8_CONST.MOOD_CONSEC_THRESHOLD) {
        consecLow++;
      } else {
        break; // streak broken
      }
    }
    if (consecLow >= M8_CONST.MOOD_CONSEC_DAYS) {
      tradingAllowed = false;
      sizeMod = 0;
      warnings.push(M8_CONST.MOOD_CONSEC_DAYS + '+ consecutive low moods: Kill Switch ON.');
      try {
        if (typeof M1_ksOn === 'function') {
          M1_ksOn('BEHAVIORAL: ' + consecLow + ' consecutive days Mood < ' + M8_CONST.MOOD_CONSEC_THRESHOLD);
        }
      } catch (e) {
        console.log('[M8] M1_ksOn call failed: ' + e.message);
      }
    }
  }

  // ── 4. Build row and write ─────────────────────────────────────────────
  var row = [
    today,            // A: Date
    moodScore,        // B: Mood_Score
    sleptHours,       // C: Slept_Hours
    substanceFree,    // D: Substance_Free
    exerciseToday,    // E: Exercise_Today
    emotionalState,   // F: Emotional_State
    notes,            // G: Notes
    tradingAllowed,   // H: Trading_Allowed
    sizeMod           // I: Size_Modifier_Force
  ];

  if (todayIdx > 0) {
    M8__updateRow(M8_CONST.SHEETS.MOOD_JOURNAL, todayIdx, row);
  } else {
    M8__appendRow(M8_CONST.SHEETS.MOOD_JOURNAL, row);
  }

  // ── 5. Alert on rule violations ────────────────────────────────────────
  if (warnings.length > 0) {
    M8__alert('MOOD_RULES', warnings.join(' | '), tradingAllowed ? 'CAUTION' : 'CRITICAL');
  }

  return {
    success  : true,
    allowed  : tradingAllowed,
    sizeMod  : sizeMod,
    warnings : warnings
  };
}

// ═════════════════════════════════════════════════════════════════════════
// UI MENU: RECORD MOOD
// ═════════════════════════════════════════════════════════════════════════

function M8_menuRecordMood() {
  var ui = SpreadsheetApp.getUi();

  var r1 = ui.prompt('Mood Journal', 'Mood score (1-10):', ui.ButtonSet.OK_CANCEL);
  if (r1.getSelectedButton() !== ui.Button.OK) return;
  var mood = parseInt(r1.getResponseText(), 10) || 5;

  var r2 = ui.prompt('Mood Journal', 'Hours of sleep last night:', ui.ButtonSet.OK_CANCEL);
  if (r2.getSelectedButton() !== ui.Button.OK) return;
  var sleep = parseFloat(r2.getResponseText()) || 0;

  var r3 = ui.alert('Mood Journal', 'Substance-free today?\n(No alcohol, drugs, or stimulants)', ui.ButtonSet.YES_NO_CANCEL);
  if (r3 === ui.Button.CANCEL) return;
  var subst = (r3 === ui.Button.YES);

  var r4 = ui.alert('Mood Journal', 'Did you exercise today?', ui.ButtonSet.YES_NO_CANCEL);
  if (r4 === ui.Button.CANCEL) return;
  var exercise = (r4 === ui.Button.YES);

  var r5 = ui.prompt('Mood Journal', 'Emotional state:\n(Calm / Anxious / Excited / Frustrated / Neutral)', ui.ButtonSet.OK_CANCEL);
  if (r5.getSelectedButton() !== ui.Button.OK) return;
  var emo = r5.getResponseText() || 'Neutral';

  var r6 = ui.prompt('Mood Journal', 'Notes (optional):', ui.ButtonSet.OK_CANCEL);
  var notes = (r6.getSelectedButton() === ui.Button.OK) ? r6.getResponseText() : '';

  var result = M8_saveMoodEntry(mood, sleep, subst, exercise, emo, notes);

  var msg = 'Mood Journal Saved\n\n';
  msg += 'Trading Allowed: ' + (result.allowed ? 'YES' : 'NO') + '\n';
  msg += 'Size Modifier: ' + result.sizeMod + '\u00D7\n';
  if (result.warnings.length > 0) {
    msg += '\nWarnings:\n' + result.warnings.join('\n');
  }
  ui.alert('Mood Journal', msg, ui.ButtonSet.OK);
}

/**
 * MODULE 8 — Behavior + Governance
 * M8_Behavior.gs
 *
 * Weekly behavior score: entry, percentage calculation, status assignment,
 * consecutive failure detection, pause enforcement.
 * Includes UI menu function.
 *
 * Chair Decision v4.0.0 — FINAL
 */

// ═════════════════════════════════════════════════════════════════════════
// PUBLIC: SAVE BEHAVIOR SCORE ENTRY
// ═════════════════════════════════════════════════════════════════════════

/**
 * Saves weekly behavior score. Calculates percentage and status.
 * Detects 2+ consecutive weeks < 60% → Kill Switch + 1-week pause.
 *
 * @param {number} q1 Plan followed (1-5)
 * @param {number} q2 Journaled (1-5)
 * @param {number} q3 Reviewed rejects (1-5)
 * @param {number} q4 Avoided impulsive acts (1-5)
 * @param {number} q5 Maintained routine (1-5)
 * @returns {Object} { success, score, status, warnings[] }
 */
function M8_saveBehaviorScore(q1, q2, q3, q4, q5) {
  var today = M8__todayStr();
  var bs = M8_COL.BS;
  var warnings = [];

  // ── 1. Validate and clamp (1-5 per question) ──────────────────────────
  var clamp15 = function(v) { return M8__clamp(M8__safeInt(v) || 3, 1, 5); };
  q1 = clamp15(q1);
  q2 = clamp15(q2);
  q3 = clamp15(q3);
  q4 = clamp15(q4);
  q5 = clamp15(q5);

  // ── 2. Calculate percentage and status ─────────────────────────────────
  var total = q1 + q2 + q3 + q4 + q5;
  var scorePct = Math.round((total / M8_CONST.BEHAVIOR_MAX_SCORE) * 100);

  var status = M8_CONST.STATUS.OK;
  if (scorePct < M8_CONST.BEHAVIOR_WARN_PCT) {
    status = M8_CONST.STATUS.FAIL;
  } else if (scorePct < M8_CONST.BEHAVIOR_OK_PCT) {
    status = M8_CONST.STATUS.WARNING;
  }

  // ── 3. Find existing entry for today ───────────────────────────────────
  var data = M8__readAll(M8_CONST.SHEETS.BEHAVIOR_SCORE);
  var todayIdx = -1;
  for (var i = 1; i < data.length; i++) {
    if (M8__normDate(data[i][bs.Date]) === today) {
      todayIdx = i;
      break;
    }
  }

  // ── 4. Build row and write ─────────────────────────────────────────────
  var row = [
    today,      // A: Date
    q1,         // B: Q1_Plan_Followed
    q2,         // C: Q2_Journaled
    q3,         // D: Q3_Reviewed_Rejects
    q4,         // E: Q4_No_Impulsive_Acts
    q5,         // F: Q5_Routine_Maintained
    scorePct,   // G: Weekly_Score_Pct
    status      // H: Status
  ];

  if (todayIdx > 0) {
    M8__updateRow(M8_CONST.SHEETS.BEHAVIOR_SCORE, todayIdx, row);
  } else {
    M8__appendRow(M8_CONST.SHEETS.BEHAVIOR_SCORE, row);
  }

  // ── 5. Check consecutive low weeks (AFTER write so today is included) ──
  var pauseTriggered = false;
  var recentScores = M8__getLastNRows(M8_CONST.SHEETS.BEHAVIOR_SCORE, M8_CONST.BEHAVIOR_CONSEC_WEEKS);
  var lowWeeks = 0;
  for (var j = 0; j < recentScores.length; j++) {
    var pct = M8__safeFloat(recentScores[j][bs.Weekly_Score_Pct]);
    if (pct < M8_CONST.BEHAVIOR_WARN_PCT) {
      lowWeeks++;
    } else {
      lowWeeks = 0; // reset — must be consecutive
    }
  }

  if (lowWeeks >= M8_CONST.BEHAVIOR_CONSEC_WEEKS) {
    pauseTriggered = true;
    var pauseUntil = M8__addDaysStr(today, M8_CONST.BEHAVIOR_PAUSE_DAYS);
    M8__setProp(M8_CONST.PROP_BEHAVIOR_PAUSE, pauseUntil);
    warnings.push(M8_CONST.BEHAVIOR_CONSEC_WEEKS + '+ consecutive weeks < '
      + M8_CONST.BEHAVIOR_WARN_PCT + '%: Kill Switch ON + '
      + M8_CONST.BEHAVIOR_PAUSE_DAYS + '-day pause (until ' + pauseUntil + ').');
    try {
      if (typeof M1_ksOn === 'function') {
        M1_ksOn('BEHAVIORAL: ' + lowWeeks + ' consecutive weeks score < ' + M8_CONST.BEHAVIOR_WARN_PCT + '%');
      }
    } catch (e) {
      console.log('[M8] M1_ksOn call failed: ' + e.message);
    }
  }

  if (status === M8_CONST.STATUS.WARNING) {
    warnings.push('Score ' + scorePct + '% is below target (' + M8_CONST.BEHAVIOR_OK_PCT + '%).');
  }
  if (status === M8_CONST.STATUS.FAIL) {
    warnings.push('Score ' + scorePct + '% is critical (< ' + M8_CONST.BEHAVIOR_WARN_PCT + '%).');
  }

  // ── 6. Alert ───────────────────────────────────────────────────────────
  if (warnings.length > 0) {
    M8__alert('BEHAVIOR_SCORE', warnings.join(' | '), pauseTriggered ? 'CRITICAL' : 'CAUTION');
  }

  return {
    success  : true,
    score    : scorePct,
    status   : status,
    warnings : warnings
  };
}

// ═════════════════════════════════════════════════════════════════════════
// PUBLIC: GET LATEST BEHAVIOR SCORE (for M7 dashboard)
// ═════════════════════════════════════════════════════════════════════════

/**
 * Returns most recent behavior score entry.
 * @returns {Object} { week, score, status }
 */
function M8_getLatestBehaviorScore() {
  var data = M8__readAll(M8_CONST.SHEETS.BEHAVIOR_SCORE);
  if (data.length < 2) {
    return { week: 'None', score: 0, status: 'NONE' };
  }
  var bs = M8_COL.BS;
  var last = data[data.length - 1];
  return {
    week   : M8__normDate(last[bs.Date]),
    score  : M8__safeFloat(last[bs.Weekly_Score_Pct]),
    status : M8__safeStr(last[bs.Status]) || M8_CONST.STATUS.FAIL
  };
}

// ═════════════════════════════════════════════════════════════════════════
// UI MENU: RECORD BEHAVIOR SCORE
// ═════════════════════════════════════════════════════════════════════════

function M8_menuRecordBehavior() {
  var ui = SpreadsheetApp.getUi();

  var r1 = ui.prompt('Weekly Behavior Score', 'Q1: Did I follow the trading plan every day? (1-5)', ui.ButtonSet.OK_CANCEL);
  if (r1.getSelectedButton() !== ui.Button.OK) return;
  var q1 = parseInt(r1.getResponseText(), 10) || 3;

  var r2 = ui.prompt('Weekly Behavior Score', 'Q2: Did I journal every trading day? (1-5)', ui.ButtonSet.OK_CANCEL);
  if (r2.getSelectedButton() !== ui.Button.OK) return;
  var q2 = parseInt(r2.getResponseText(), 10) || 3;

  var r3 = ui.prompt('Weekly Behavior Score', 'Q3: Did I review rejected/skipped signals? (1-5)', ui.ButtonSet.OK_CANCEL);
  if (r3.getSelectedButton() !== ui.Button.OK) return;
  var q3 = parseInt(r3.getResponseText(), 10) || 3;

  var r4 = ui.prompt('Weekly Behavior Score', 'Q4: Did I avoid impulsive actions? (1-5)', ui.ButtonSet.OK_CANCEL);
  if (r4.getSelectedButton() !== ui.Button.OK) return;
  var q4 = parseInt(r4.getResponseText(), 10) || 3;

  var r5 = ui.prompt('Weekly Behavior Score', 'Q5: Did I maintain health routine? (1-5)', ui.ButtonSet.OK_CANCEL);
  if (r5.getSelectedButton() !== ui.Button.OK) return;
  var q5 = parseInt(r5.getResponseText(), 10) || 3;

  var result = M8_saveBehaviorScore(q1, q2, q3, q4, q5);

  var msg = 'Weekly Behavior Score Saved\n\n';
  msg += 'Score: ' + result.score + '%\n';
  msg += 'Status: ' + result.status + '\n';
  if (result.warnings.length > 0) {
    msg += '\nWarnings:\n' + result.warnings.join('\n');
  }
  ui.alert('Behavior Score', msg, ui.ButtonSet.OK);
}





/**
 * MODULE 8 — Behavior + Governance
 * M8_Gates.gs
 *
 * Trading status API (consumed by M5), go-live gate validation,
 * governance cycle housekeeping.
 *
 * Chair Decision v4.0.0 — FINAL
 */

// ═════════════════════════════════════════════════════════════════════════
// PUBLIC: TODAY'S TRADING STATUS (M5 consumption)
// ═════════════════════════════════════════════════════════════════════════
function M8_getTodayTradingStatus() {
  var gov = M8_getSystemGovernanceState();

  return {
    allowed: gov.state !== 'PAUSED',
    tradingAllowed: gov.state !== 'PAUSED',
    sizeMod: gov.sizeMod,
    reason: gov.reason,
    governanceState: gov.state,
    requiresPresidentialReview: gov.requiresPresidentialReview
  };
}


function M8_getSystemGovernanceState() {
  try {
    if (typeof M1_ksIsOn === 'function' && M1_ksIsOn()) {
      return {
        state: 'PAUSED',
        sizeMod: 0,
        requiresPresidentialReview: true,
        reason: 'M1_KILL_SWITCH_ACTIVE'
      };
    }
  } catch (e) {}

  var today = M8__todayStr();

  var pauseUntil = '';
  try { pauseUntil = M8__getProp(M8_CONST.PROP_BEHAVIOR_PAUSE, ''); } catch (e2) {}
  if (pauseUntil && today < pauseUntil) {
    return {
      state: 'PAUSED',
      sizeMod: 0,
      requiresPresidentialReview: true,
      reason: 'M8_BEHAVIOR_PAUSE_ACTIVE_UNTIL_' + pauseUntil
    };
  }

  var banUntil = '';
  try { banUntil = M8__getProp(M8_CONST.PROP_SUBSTANCE_BAN, ''); } catch (e3) {}
  if (banUntil && today < banUntil) {
    return {
      state: 'RESTRICTED',
      sizeMod: 0,
      requiresPresidentialReview: true,
      reason: 'M8_SUBSTANCE_BAN_ACTIVE_UNTIL_' + banUntil
    };
  }

  var latest = { score: 100, status: 'OK' };
  try {
    if (typeof M8_getLatestBehaviorScore === 'function') {
      latest = M8_getLatestBehaviorScore();
    }
  } catch (e4) {}

  var score = Number(latest.score || 0);
  var status = String(latest.status || 'OK').toUpperCase();

  if (status === 'FAIL' || score < 60) {
    return {
      state: 'RESTRICTED',
      sizeMod: 0.25,
      requiresPresidentialReview: true,
      reason: 'BEHAVIOR_FAIL'
    };
  }

  if (status === 'WARNING' || score < 80) {
    return {
      state: 'CAUTION',
      sizeMod: 0.5,
      requiresPresidentialReview: true,
      reason: 'BEHAVIOR_WARNING'
    };
  }

  return {
    state: 'NORMAL',
    sizeMod: 1.0,
    requiresPresidentialReview: false,
    reason: 'CONDITIONS_NORMAL'
  };
}


// ═════════════════════════════════════════════════════════════════════════
// PUBLIC: GO-LIVE GATES VALIDATION
// ═════════════════════════════════════════════════════════════════════════

/**
 * Validates all go-live gate requirements.
 * Must pass before Phase 7 (LIVE mode) transition.
 *
 * @returns {Object} { passed: boolean, details: string[] }
 */
function M8_checkGoLiveGates() {
  var details = [];
  var mj = M8_COL.MJ;
  var bs = M8_COL.BS;

  // ── Gate 1: 14+ mood journal entries ───────────────────────────────────
  var moodData = M8__readAll(M8_CONST.SHEETS.MOOD_JOURNAL);
  var moodCount = moodData.length - 1; // exclude header
  if (moodCount < M8_CONST.GATE_MOOD_DAYS) {
    details.push('\u2717 Mood journal: need ' + M8_CONST.GATE_MOOD_DAYS + '+ entries, have ' + moodCount);
  } else {
    // Check for gaps in last 14 entries
    var recent = M8__getLastNRows(M8_CONST.SHEETS.MOOD_JOURNAL, M8_CONST.GATE_MOOD_DAYS);
    var hasGap = false;
    for (var i = 0; i < recent.length; i++) {
      if (!recent[i][mj.Date]) { hasGap = true; break; }
    }
    if (hasGap) {
      details.push('\u2717 Mood journal: gaps found in last ' + M8_CONST.GATE_MOOD_DAYS + ' entries');
    } else {
      details.push('\u2713 Mood journal: ' + M8_CONST.GATE_MOOD_DAYS + '+ entries present');
    }
  }

  // ── Gate 2: 2+ consecutive weeks behavior score >= 80% ─────────────────
  var behavData = M8__readAll(M8_CONST.SHEETS.BEHAVIOR_SCORE);
  var behavCount = behavData.length - 1;
  if (behavCount < M8_CONST.GATE_BEHAVIOR_WEEKS) {
    details.push('\u2717 Behavior score: need ' + M8_CONST.GATE_BEHAVIOR_WEEKS + '+ weeks, have ' + behavCount);
  } else {
    var recentBehav = M8__getLastNRows(M8_CONST.SHEETS.BEHAVIOR_SCORE, M8_CONST.GATE_BEHAVIOR_WEEKS);
    var allAbove = true;
    for (var j = 0; j < recentBehav.length; j++) {
      var pct = M8__safeFloat(recentBehav[j][bs.Weekly_Score_Pct]);
      if (pct < M8_CONST.BEHAVIOR_OK_PCT) { allAbove = false; break; }
    }
    if (allAbove) {
      details.push('\u2713 Behavior score: ' + M8_CONST.GATE_BEHAVIOR_WEEKS + '+ weeks \u2265 ' + M8_CONST.BEHAVIOR_OK_PCT + '%');
    } else {
      details.push('\u2717 Behavior score: not all recent weeks \u2265 ' + M8_CONST.BEHAVIOR_OK_PCT + '%');
    }
  }

  // ── Gate 3: Substance-free last 2 entries (48h proxy) ──────────────────
  var recentMood = M8__getLastNRows(M8_CONST.SHEETS.MOOD_JOURNAL, M8_CONST.GATE_SUBSTANCE_ENTRIES);
  var substOk = true;
  if (recentMood.length < M8_CONST.GATE_SUBSTANCE_ENTRIES) {
    substOk = false;
    details.push('\u2717 Substance-free: fewer than ' + M8_CONST.GATE_SUBSTANCE_ENTRIES + ' recent entries');
  } else {
    for (var k = 0; k < recentMood.length; k++) {
      if (!M8__safeBool(recentMood[k][mj.Substance_Free])) { substOk = false; break; }
    }
    details.push(substOk
      ? '\u2713 Substance-free: last ' + M8_CONST.GATE_SUBSTANCE_ENTRIES + ' entries confirmed'
      : '\u2717 Substance-free: substance use found in last ' + M8_CONST.GATE_SUBSTANCE_ENTRIES + ' entries');
  }

  // ── Gate 4: Starting capital confirmed ─────────────────────────────────
  var capOk = M8__cfgGetBool('Starting_Capital_Confirmed');
  details.push(capOk
    ? '\u2713 Starting capital risk acknowledged'
    : '\u2717 Starting capital not confirmed in CONFIG');

  // ── Gate 5: Leverage acknowledged ──────────────────────────────────────
  var levOk = M8__cfgGetBool('Leverage_Acknowledged');
  details.push(levOk
    ? '\u2713 Leverage emotional impact acknowledged'
    : '\u2717 Leverage not acknowledged in CONFIG');

  // ── Result ─────────────────────────────────────────────────────────────
  var failCount = 0;
  for (var d = 0; d < details.length; d++) {
    if (details[d].charAt(0) === '\u2717') failCount++;
  }
  var passed = (failCount === 0);

  console.log('[M8] Go-Live Gates: ' + (passed ? 'ALL PASSED' : failCount + ' FAILED'));
  for (var p = 0; p < details.length; p++) {
    console.log('  ' + details[p]);
  }

  return { passed: passed, details: details };
}

// ═════════════════════════════════════════════════════════════════════════
// PUBLIC: GOVERNANCE CYCLE (called by M1 scheduler)
// ═════════════════════════════════════════════════════════════════════════
function M8_runGovernanceCycle() {
  console.log('[M8] Running Governance Cycle...');

  var today = M8__todayStr();

  // 1. Clear expired substance ban
  var banStr = M8__getProp(M8_CONST.PROP_SUBSTANCE_BAN, '');
  if (banStr && today >= banStr) {
    M8__clearProp(M8_CONST.PROP_SUBSTANCE_BAN);
    console.log('[M8] Substance ban expired — cleared.');
  }

  // 2. Clear expired behavior pause
  var pauseStr = M8__getProp(M8_CONST.PROP_BEHAVIOR_PAUSE, '');
  if (pauseStr && today >= pauseStr) {
    M8__clearProp(M8_CONST.PROP_BEHAVIOR_PAUSE);
    console.log('[M8] Behavior pause expired — cleared.');

    try {
      if (typeof M1_ksOff === 'function') {
        M1_ksOff('Governance pause expired');
      }
    } catch (e) {
      console.log('[M8] M1_ksOff call failed: ' + e.message);
    }
  }

  // 3. Compute and log current governance state
  var gov = M8_getSystemGovernanceState();
  console.log('[M8] Governance State = ' + gov.state + ' | sizeMod=' + gov.sizeMod + ' | reason=' + gov.reason);

  // 4. If system is paused, ensure kill switch is on
  if (gov.state === 'PAUSED') {
    try {
      if (typeof M1_ksOn === 'function' && !M1_ksIsOn()) {
        M1_ksOn('M8 Governance State = PAUSED (' + gov.reason + ')');
      }
    } catch (e2) {
      console.log('[M8] M1_ksOn call failed: ' + e2.message);
    }
  }

  console.log('[M8] Governance Cycle complete.');
}

// ═════════════════════════════════════════════════════════════════════════
// UI MENU: CHECK GO-LIVE GATES
// ═════════════════════════════════════════════════════════════════════════

function M8_menuCheckGoLiveGates() {
  var ui = SpreadsheetApp.getUi();
  var result = M8_checkGoLiveGates();
  var heading = result.passed ? '\u2705 ALL GATES PASSED' : '\u26A0\uFE0F SOME GATES BLOCKED';
  var msg = heading + '\n\n' + result.details.join('\n');
  ui.alert('Go-Live Gates', msg, ui.ButtonSet.OK);
}


/**
 * MODULE 8 — Behavior + Governance
 * M8_Tests.gs
 *
 * Comprehensive test suite: schema validation, rule logic, gate checks.
 * Run via Extensions > Apps Script > select M8_testRunAll > Run.
 *
 * Chair Decision v4.0.0 — FINAL
 */

function M8_testRunAll() {
  console.log('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
  console.log('\u2551  MODULE 8 TEST SUITE v' + M8_CONST.VERSION + '                       \u2551');
  console.log('\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n');

  var results = [];
  function assert(name, condition) {
    results.push({ name: name, pass: !!condition });
  }

  // ════════════════════════════════════════════════════════════════════════
  // SECTION 1: SCHEMA VALIDATION
  // ════════════════════════════════════════════════════════════════════════
  console.log('[1] Schema Validation');

  try {
    var mjSh = M8__getSheet(M8_CONST.SHEETS.MOOD_JOURNAL);
    var mjHeaders = mjSh.getRange(1, 1, 1, 9).getValues()[0];
    assert('Schema: MOOD_JOURNAL exists', !!mjSh);
    assert('Schema: MOOD_JOURNAL has 9 columns', mjHeaders.length === 9);
    assert('Schema: MJ col A = Date', String(mjHeaders[0]).trim() === 'Date');
    assert('Schema: MJ col B = Mood_Score', String(mjHeaders[1]).trim() === 'Mood_Score');
    assert('Schema: MJ col H = Trading_Allowed', String(mjHeaders[7]).trim() === 'Trading_Allowed');
    assert('Schema: MJ col I = Size_Modifier_Force', String(mjHeaders[8]).trim() === 'Size_Modifier_Force');
  } catch (e) {
    assert('Schema: MOOD_JOURNAL accessible (' + e.message + ')', false);
  }

  try {
    var bsSh = M8__getSheet(M8_CONST.SHEETS.BEHAVIOR_SCORE);
    var bsHeaders = bsSh.getRange(1, 1, 1, 8).getValues()[0];
    assert('Schema: BEHAVIOR_SCORE exists', !!bsSh);
    assert('Schema: BEHAVIOR_SCORE has 8 columns', bsHeaders.length === 8);
    assert('Schema: BS col A = Date', String(bsHeaders[0]).trim() === 'Date');
    assert('Schema: BS col G = Weekly_Score_Pct', String(bsHeaders[6]).trim() === 'Weekly_Score_Pct');
    assert('Schema: BS col H = Status', String(bsHeaders[7]).trim() === 'Status');
  } catch (e) {
    assert('Schema: BEHAVIOR_SCORE accessible (' + e.message + ')', false);
  }

  // ════════════════════════════════════════════════════════════════════════
  // SECTION 2: CONSTANTS INTEGRITY
  // ════════════════════════════════════════════════════════════════════════
  console.log('\n[2] Constants Integrity');

  assert('Const: MOOD_BLOCK_BELOW = 4', M8_CONST.MOOD_BLOCK_BELOW === 4);
  assert('Const: MOOD_REDUCED_BELOW = 6', M8_CONST.MOOD_REDUCED_BELOW === 6);
  assert('Const: MOOD_REDUCED_SIZE_MOD = 0.5', M8_CONST.MOOD_REDUCED_SIZE_MOD === 0.5);
  assert('Const: MOOD_CONSEC_DAYS = 3', M8_CONST.MOOD_CONSEC_DAYS === 3);
  assert('Const: BEHAVIOR_MAX_SCORE = 25', M8_CONST.BEHAVIOR_MAX_SCORE === 25);
  assert('Const: BEHAVIOR_OK_PCT = 80', M8_CONST.BEHAVIOR_OK_PCT === 80);
  assert('Const: BEHAVIOR_WARN_PCT = 60', M8_CONST.BEHAVIOR_WARN_PCT === 60);
  assert('Const: BEHAVIOR_CONSEC_WEEKS = 2', M8_CONST.BEHAVIOR_CONSEC_WEEKS === 2);
  assert('Const: GATE_MOOD_DAYS = 14', M8_CONST.GATE_MOOD_DAYS === 14);
  assert('Const: SUBSTANCE_BAN_DAYS = 2', M8_CONST.SUBSTANCE_BAN_DAYS === 2);

  // ════════════════════════════════════════════════════════════════════════
  // SECTION 3: UTILITY FUNCTIONS
  // ════════════════════════════════════════════════════════════════════════
  console.log('\n[3] Utility Functions');

  assert('Util: M8__safeInt("7") = 7', M8__safeInt('7') === 7);
  assert('Util: M8__safeInt("abc") = 0', M8__safeInt('abc') === 0);
  assert('Util: M8__safeBool(true) = true', M8__safeBool(true) === true);
  assert('Util: M8__safeBool("TRUE") = true', M8__safeBool('TRUE') === true);
  assert('Util: M8__safeBool("false") = false', M8__safeBool('false') === false);
  assert('Util: M8__safeFloat("3.14") = 3.14', M8__safeFloat('3.14') === 3.14);
  assert('Util: M8__safeFloat("NaN") = 0', M8__safeFloat('NaN') === 0);
  assert('Util: M8__clamp(3, 1, 5) = 3', M8__clamp(3, 1, 5) === 3);
  assert('Util: M8__clamp(0, 1, 5) = 1', M8__clamp(0, 1, 5) === 1);
  assert('Util: M8__clamp(9, 1, 5) = 5', M8__clamp(9, 1, 5) === 5);
  assert('Util: M8__addDaysStr("2024-01-15", 2) = "2024-01-17"', M8__addDaysStr('2024-01-15', 2) === '2024-01-17');
  assert('Util: M8__addDaysStr("2024-01-31", 1) = "2024-02-01"', M8__addDaysStr('2024-01-31', 1) === '2024-02-01');
  assert('Util: M8__todayStr() is 10 chars', M8__todayStr().length === 10);

  // ════════════════════════════════════════════════════════════════════════
  // SECTION 4: MOOD ENTRY LOGIC (writes test data!)
  // ════════════════════════════════════════════════════════════════════════
  console.log('\n[4] Mood Entry Logic');

  try {
    // Test: Mood 7, substance-free → allowed, sizeMod 1.0
    var m1 = M8_saveMoodEntry(7, 8, true, true, 'Calm', 'TEST: good state');
    assert('Mood: score 7 + clean → allowed', m1.allowed === true);
    assert('Mood: score 7 + clean → sizeMod 1.0', m1.sizeMod === 1.0);
    assert('Mood: returns success', m1.success === true);

    // Test: Mood 4, substance-free → allowed, sizeMod 0.5
    var m2 = M8_saveMoodEntry(4, 6, true, false, 'Anxious', 'TEST: moderate low');
    assert('Mood: score 4 + clean → allowed', m2.allowed === true);
    assert('Mood: score 4 + clean → sizeMod 0.5', m2.sizeMod === 0.5);

    // Test: Mood 3, substance-free → blocked
    var m3 = M8_saveMoodEntry(3, 5, true, false, 'Frustrated', 'TEST: low mood');
    assert('Mood: score 3 → blocked', m3.allowed === false);
    assert('Mood: score 3 → sizeMod 0', m3.sizeMod === 0);

    // Test: Mood 8, substance NOT free → blocked + ban set
    M8__clearProp(M8_CONST.PROP_SUBSTANCE_BAN); // clear any prior ban
    var m4 = M8_saveMoodEntry(8, 7, false, true, 'Calm', 'TEST: substance use');
    assert('Mood: substance use → blocked', m4.allowed === false);
    assert('Mood: substance use → sizeMod 0', m4.sizeMod === 0);
    var banCheck = M8__getProp(M8_CONST.PROP_SUBSTANCE_BAN, '');
    assert('Mood: substance ban set in Script Properties', banCheck.length === 10);

    // Clean up substance ban
    M8__clearProp(M8_CONST.PROP_SUBSTANCE_BAN);

    // Restore to good state for subsequent tests
    M8_saveMoodEntry(7, 8, true, true, 'Calm', 'TEST: restore good state');
  } catch (e) {
    assert('Mood entry logic (' + e.message + ')', false);
  }

  // ════════════════════════════════════════════════════════════════════════
  // SECTION 5: BEHAVIOR SCORE LOGIC (writes test data!)
  // ════════════════════════════════════════════════════════════════════════
  console.log('\n[5] Behavior Score Logic');

  try {
    // Test: All 5s = 100% OK
    M8__clearProp(M8_CONST.PROP_BEHAVIOR_PAUSE); // clear any prior pause
    var b1 = M8_saveBehaviorScore(5, 5, 5, 5, 5);
    assert('Behavior: all 5s → score 100', b1.score === 100);
    assert('Behavior: all 5s → status OK', b1.status === 'OK');

    // Test: All 3s = 60% WARNING
    var b2 = M8_saveBehaviorScore(3, 3, 3, 3, 3);
    assert('Behavior: all 3s → score 60', b2.score === 60);
    assert('Behavior: all 3s → status WARNING', b2.status === 'WARNING');

    // Test: All 1s = 20% FAIL
    var b3 = M8_saveBehaviorScore(1, 1, 1, 1, 1);
    assert('Behavior: all 1s → score 20', b3.score === 20);
    assert('Behavior: all 1s → status FAIL', b3.status === 'FAIL');

    // Clean up: restore good score to avoid triggering pause in production
    M8__clearProp(M8_CONST.PROP_BEHAVIOR_PAUSE);
    M8_saveBehaviorScore(5, 5, 5, 5, 5);
  } catch (e) {
    assert('Behavior score logic (' + e.message + ')', false);
  }

  // ════════════════════════════════════════════════════════════════════════
  // SECTION 6: TRADING STATUS API
  // ════════════════════════════════════════════════════════════════════════
  console.log('\n[6] Trading Status API');

  try {
    var status = M8_getTodayTradingStatus();
    assert('Status: returns object', typeof status === 'object');
    assert('Status: has .allowed (boolean)', typeof status.allowed === 'boolean');
    assert('Status: has .sizeMod (number)', typeof status.sizeMod === 'number');
    assert('Status: has .reason (string)', typeof status.reason === 'string');
    assert('Status: sizeMod >= 0', status.sizeMod >= 0);
    assert('Status: sizeMod <= 1', status.sizeMod <= 1);
  } catch (e) {
    assert('Trading status API (' + e.message + ')', false);
  }

  // ════════════════════════════════════════════════════════════════════════
  // SECTION 7: GO-LIVE GATES
  // ════════════════════════════════════════════════════════════════════════
  console.log('\n[7] Go-Live Gates');

  try {
    var gates = M8_checkGoLiveGates();
    assert('Gates: returns object', typeof gates === 'object');
    assert('Gates: has .passed (boolean)', typeof gates.passed === 'boolean');
    assert('Gates: has .details (array)', Array.isArray(gates.details));
    assert('Gates: details has 5 entries', gates.details.length === 5);
  } catch (e) {
    assert('Go-live gates (' + e.message + ')', false);
  }

  // ════════════════════════════════════════════════════════════════════════
  // SECTION 8: LATEST BEHAVIOR SCORE API
  // ════════════════════════════════════════════════════════════════════════
  console.log('\n[8] Latest Behavior Score API');

  try {
    var latest = M8_getLatestBehaviorScore();
    assert('LatestBS: returns object', typeof latest === 'object');
    assert('LatestBS: has .week', latest.hasOwnProperty('week'));
    assert('LatestBS: has .score (number)', typeof latest.score === 'number');
    assert('LatestBS: has .status (string)', typeof latest.status === 'string');
  } catch (e) {
    assert('Latest behavior score (' + e.message + ')', false);
  }

  // ════════════════════════════════════════════════════════════════════════
  // SECTION 9: SCRIPT PROPERTIES
  // ════════════════════════════════════════════════════════════════════════
  console.log('\n[9] Script Properties');

  try {
    var testKey = 'M8_TEST_PROP_' + Date.now();
    M8__setProp(testKey, '2024-12-31');
    assert('Props: write succeeded', M8__getProp(testKey, '') === '2024-12-31');
    M8__clearProp(testKey);
    assert('Props: clear succeeded', M8__getProp(testKey, 'gone') === 'gone');
  } catch (e) {
    assert('Script properties (' + e.message + ')', false);
  }

  // ════════════════════════════════════════════════════════════════════════
  // REPORT
  // ════════════════════════════════════════════════════════════════════════
  var passed = 0;
  var failed = 0;
  console.log('\n' + Array(51).join('\u2500'));

  for (var r = 0; r < results.length; r++) {
    if (results[r].pass) {
      passed++;
      console.log('  \u2713 ' + results[r].name);
    } else {
      failed++;
      console.log('  \u2717 ' + results[r].name);
    }
  }

  console.log('\n' + Array(51).join('\u2500'));
  if (failed === 0) {
    console.log('  \u2705 ALL TESTS PASSED (' + passed + '/' + passed + ')');
  } else {
    console.log('  \u274C ' + failed + ' FAILED (' + passed + ' passed, ' + (passed + failed) + ' total)');
  }

  return failed === 0;
}



/**
 * M8_Governance_AIHardening.gs
 * Deterministic, bounded fact pack for council + fail-closed evaluation.
 * ES5-only.
 */

function M8_getAIGovernancePacket() {
  var gov = M8_getSystemGovernanceState();
  var gates = M8_checkGoLiveGates();

  return {
    version: M8_CONST.VERSION,
    generated_at: new Date().toISOString(),

    governance_state: gov.state,
    size_mod: gov.sizeMod,
    reason: gov.reason,
    requires_presidential_review: !!gov.requiresPresidentialReview,

    go_live_gates_passed: !!gates.passed,
    go_live_gate_details: gates.details || [],

    hard_policy: {
      fail_closed: true,
      block_if_paused: true,
      block_if_presidential_review_required: true,
      block_live_if_gates_failed: true
    }
  };
}

function M8_getCouncilDecisionPolicy() {
  return {
    policy_version: 'M8_COUNCIL_POLICY_V3',
    thresholds: {
      profit_factor_min: 1.10,
      expectancy_r_min: 0.0,
      max_drawdown_max: 0.15,
      oos_total_trades_min: 20,
      require_oos_passed: true
    },
    governance: {
      reject_if_paused: true,
      reject_if_presidential_review_required: true
    },
    output_contract: {
      allowed_votes: ['APPROVED', 'REJECTED'],
      fail_closed: true,
      json_only: true,
      rationale_max_chars: 1200
    }
  };
}

function M8__num_(v, dflt) {
  var n = parseFloat(v);
  return isFinite(n) ? n : (dflt || 0);
}
function M8__bool_(v) {
  if (v === true) return true;
  if (v === false) return false;
  var s = String(v || '').trim().toUpperCase();
  return (s === 'TRUE' || s === 'YES' || s === '1');
}
function M8__normDrawdownToFrac_(x) {
  var n = M8__num_(x, NaN);
  if (!isFinite(n)) return NaN;
  if (n > 1.5) return n / 100;
  return n;
}

function M8_evalExperimentAgainstPolicy(expPayload, govPacket, policy) {
  expPayload = expPayload || {};
  govPacket = govPacket || M8_getAIGovernancePacket();
  policy = policy || M8_getCouncilDecisionPolicy();

  var t = policy.thresholds || {};
  var reasons = [];
  var soft = [];

  if (policy.governance && policy.governance.reject_if_paused) {
    if (String(govPacket.governance_state || '').toUpperCase() === 'PAUSED') reasons.push('GOV_PAUSED');
  }
  if (policy.governance && policy.governance.reject_if_presidential_review_required) {
    if (!!govPacket.requires_presidential_review) reasons.push('GOV_PRESIDENTIAL_REVIEW_REQUIRED');
  }

  var m = expPayload.metrics || {};
  var pf = M8__num_(m.profit_factor, NaN);
  var ex = M8__num_(m.expectancy_r, NaN);
  var dd = M8__normDrawdownToFrac_(m.max_drawdown_pct);
  var oosTrades = M8__num_(m.oos_total_trades, NaN);
  var oosPassed = M8__bool_(m.oos_passed);

  if (!isFinite(pf)) reasons.push('MISSING_PROFIT_FACTOR');
  if (!isFinite(ex)) reasons.push('MISSING_EXPECTANCY_R');
  if (!isFinite(dd)) reasons.push('MISSING_MAX_DRAWDOWN');
  if (!isFinite(oosTrades)) reasons.push('MISSING_OOS_TOTAL_TRADES');

  if (isFinite(pf) && pf < t.profit_factor_min) reasons.push('PROFIT_FACTOR_BELOW_MIN');
  if (isFinite(ex) && ex <= t.expectancy_r_min) reasons.push('EXPECTANCY_NOT_POSITIVE');
  if (isFinite(dd) && dd > t.max_drawdown_max) reasons.push('MAX_DRAWDOWN_TOO_HIGH');

  if (t.require_oos_passed && !oosPassed) reasons.push('OOS_NOT_PASSED');
  if (isFinite(oosTrades) && oosTrades < t.oos_total_trades_min) reasons.push('OOS_SAMPLE_TOO_SMALL');

  var sh = M8__num_(m.sharpe_ratio, NaN);
  if (isFinite(sh) && sh <= 0) soft.push('SHARPE_NOT_POSITIVE');

  return {
    policy_version: policy.policy_version,
    hard_reject_reasons: reasons,
    soft_concerns: soft
  };
}

function M8_buildCouncilFactPack(expPayload) {
  expPayload = expPayload || {};
  var gov = M8_getAIGovernancePacket();
  var policy = M8_getCouncilDecisionPolicy();
  var evalRes = M8_evalExperimentAgainstPolicy(expPayload, gov, policy);

  return {
    governance: gov,
    policy: policy,
    evaluation: evalRes,
    experiment: {
      strategy_id: expPayload.strategy_id || '',
      run_name: expPayload.run_name || '',
      mode: expPayload.mode || '',
      universe_mode: expPayload.universe_mode || '',
      backtest_id: expPayload.backtest_id || '',
      config_snapshot: expPayload.config_snapshot || {},
      metrics: expPayload.metrics || {},
      diagnostics: expPayload.diagnostics || {},
      dqs_summary: expPayload.dqs_summary || {}
    }
  };
}
