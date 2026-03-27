/**
 * MODULE 1 — Foundation
 * M1_ConfigStore.gs
 *
 * Single source of truth for all CONFIG parameters.
 * CONFIG_CHANGELOG is a range inside the CONFIG tab, separated by a marker row.
 * Config parsing stops at the marker. Changelog functions operate below it.
 *
 * @version 3.2.1
 */

/* ============================================================================
   CONSTANTS
   ============================================================================ */

const M1_CONST = Object.freeze({
  SHEET_CONFIG:      'CONFIG',
  CFG_HEADER_ROW:    1,
  CFG_COL_PARAM:     1,   // Column A
  CFG_COL_VALUE:     2,   // Column B
  CFG_COL_NOTES:     3,   // Column C

  CHANGELOG_MARKER:  '=== CONFIG_CHANGELOG ===',

  // Changelog columns (reuse A–F below the marker)
  CHG_COL_DATE:       1,
  CHG_COL_PARAM:      2,
  CHG_COL_OLD:        3,
  CHG_COL_NEW:        4,
  CHG_COL_REASON:     5,
  CHG_COL_REBACKTEST: 6,

  CACHE_KEY: 'M1_CONFIG_MAP',
  CACHE_SEC: 60
});

/* ============================================================================
   PRIVATE HELPERS — SHEET ACCESS
   ============================================================================ */

/**
 * Returns the CONFIG sheet or throws.
 * @private
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function M1__cfgSheet_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(M1_CONST.SHEET_CONFIG);
  if (!sh) throw new Error('[M1] Missing sheet "' + M1_CONST.SHEET_CONFIG + '".');
  return sh;
}

/**
 * Finds the row number (1-indexed) of the CHANGELOG_MARKER in column A.
 * Returns 0 if not found.
 * @private
 */
function M1__findChangelogMarkerRow_(sh) {
  const lastRow = sh.getLastRow();
  if (lastRow < 1) return 0;
  const colA = sh.getRange(1, 1, lastRow, 1).getValues();
  for (var i = 0; i < colA.length; i++) {
    if (String(colA[i][0]).trim() === M1_CONST.CHANGELOG_MARKER) return i + 1;
  }
  return 0;
}

/* ============================================================================
   PRIVATE HELPERS — CACHE
   ============================================================================ */

/** @private */
function M1__cfgInvalidateCache_() {
  CacheService.getScriptCache().remove(M1_CONST.CACHE_KEY);
}

/* ============================================================================
   PRIVATE HELPERS — MAP BUILDING
   ============================================================================ */

/**
 * Builds { paramName: rawValue } from CONFIG rows above the changelog marker.
 * Skips header row, blank rows, and section headers (starting with ===).
 * Throws on duplicate parameter names.
 * @private
 */
function M1__cfgBuildMap_() {
  var sh = M1__cfgSheet_();
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return {};

  var markerRow = M1__findChangelogMarkerRow_(sh);
  var endRow = markerRow > 0 ? markerRow - 1 : lastRow;
  var numRows = endRow - M1_CONST.CFG_HEADER_ROW;  // rows after header
  if (numRows <= 0) return {};

  var data = sh.getRange(2, M1_CONST.CFG_COL_PARAM, numRows, 2).getValues();
  var map = {};

  for (var i = 0; i < data.length; i++) {
    var p = String(data[i][0] || '').trim();
    if (!p) continue;
    if (p.startsWith('===')) continue;

    if (map.hasOwnProperty(p)) {
      throw new Error('[M1] Duplicate CONFIG parameter "' + p + '". Each name must be unique.');
    }
    map[p] = data[i][1];
  }
  return map;
}

/**
 * Returns config map, using script cache when available.
 * @private
 */
function M1__cfgGetMap_() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get(M1_CONST.CACHE_KEY);
  if (cached) {
    try { return JSON.parse(cached); } catch (_) { /* rebuild */ }
  }
  var map = M1__cfgBuildMap_();
  try {
    cache.put(M1_CONST.CACHE_KEY, JSON.stringify(map), M1_CONST.CACHE_SEC);
  } catch (e) {
    // Cache value too large — continue without caching
    Logger.log('[M1] Config cache put failed: ' + e.message);
  }
  return map;
}

/**
 * Finds the sheet row (1-indexed) of a parameter in the config section.
 * Returns 0 if not found.
 * @private
 */
function M1__cfgFindParamRow_(paramName) {
  var sh = M1__cfgSheet_();
  var markerRow = M1__findChangelogMarkerRow_(sh);
  var lastRow = sh.getLastRow();
  var endRow = markerRow > 0 ? markerRow - 1 : lastRow;
  var numRows = endRow - 1;
  if (numRows <= 0) return 0;

  var col = sh.getRange(2, M1_CONST.CFG_COL_PARAM, numRows, 1).getValues();
  for (var i = 0; i < col.length; i++) {
    if (String(col[i][0]).trim() === paramName) return i + 2;
  }
  return 0;
}

/* ============================================================================
   PUBLIC API — READ
   ============================================================================ */

/**
 * Gets the raw value of a CONFIG parameter. Throws if missing.
 * @param {string} paramName
 * @returns {*}
 */
function M1_cfgGet(paramName) {
  var map = M1__cfgGetMap_();
  if (!map.hasOwnProperty(paramName)) {
    throw new Error('[M1] CONFIG missing "' + paramName + '".');
  }
  return map[paramName];
}

/**
 * Gets a CONFIG parameter as a trimmed string.
 * @param {string} paramName
 * @returns {string}
 */
function M1_cfgGetStr(paramName) {
  return String(M1_cfgGet(paramName)).trim();
}

/**
 * Gets a CONFIG parameter as a number.
 * Handles: numeric cells, string "123", string "15%" → 0.15.
 * Throws on blank or non-numeric values.
 * @param {string} paramName
 * @returns {number}
 */
function M1_cfgGetNum(paramName) {
  var v = M1_cfgGet(paramName);

  if (typeof v === 'number') return v;

  var s = String(v).trim();
  if (s === '') throw new Error('[M1] CONFIG "' + paramName + '" is blank; expected number.');

  if (s.endsWith('%')) {
    var n = Number(s.slice(0, -1).trim());
    if (!isFinite(n)) throw new Error('[M1] CONFIG "' + paramName + '" invalid percent "' + s + '".');
    return n / 100;
  }

  var n2 = Number(s);
  if (!isFinite(n2)) throw new Error('[M1] CONFIG "' + paramName + '" invalid number "' + s + '".');
  return n2;
}

/**
 * Gets a CONFIG parameter as a boolean.
 * Accepts: TRUE/FALSE, true/false, yes/no, 1/0, native booleans.
 * @param {string} paramName
 * @returns {boolean}
 */
function M1_cfgGetBool(paramName) {
  var v = M1_cfgGet(paramName);
  if (typeof v === 'boolean') return v;

  var s = String(v).trim().toUpperCase();
  if (['TRUE', 'YES', '1'].indexOf(s) !== -1) return true;
  if (['FALSE', 'NO', '0', ''].indexOf(s) !== -1) return false;

  throw new Error('[M1] CONFIG "' + paramName + '" invalid boolean "' + v + '".');
}

/**
 * Gets multiple parameters at once. Throws if any are missing.
 * @param {string[]} paramNames
 * @returns {Object<string, *>}
 */
function M1_cfgGetMany(paramNames) {
  var map = M1__cfgGetMap_();
  var out = {};
  for (var i = 0; i < paramNames.length; i++) {
    var name = paramNames[i];
    if (!map.hasOwnProperty(name)) throw new Error('[M1] CONFIG missing "' + name + '".');
    out[name] = map[name];
  }
  return out;
}

/**
 * Gets every CONFIG parameter as a flat object.
 * @returns {Object<string, *>}
 */
function M1_cfgGetAll() {
  return M1__cfgGetMap_();
}

/* ============================================================================
   PUBLIC API — COMPUTED ACCESSORS
   ============================================================================ */

/**
 * Effective liquidation buffer in R-multiples.
 * = Min_Liquidation_Buffer_R + Liquidation_Buffer_Proxy_Uplift_R (when PROXY_ESTIMATE).
 * @returns {number}
 */
function M1_cfgEffectiveLiqBufferR() {
  var src = M1_cfgGetStr('Liquidation_Price_Source');
  var base = M1_cfgGetNum('Min_Liquidation_Buffer_R');
  if (src === 'PROXY_ESTIMATE') {
    return base + M1_cfgGetNum('Liquidation_Buffer_Proxy_Uplift_R');
  }
  return base;
}

/**
 * Parses Trigger_Schedule_SAST into an array of "HH:MM" strings.
 * Supports comma and/or semicolon delimiters.
 * @returns {string[]}
 */
function M1_cfgGetTriggerScheduleSAST() {
  var raw = String(M1_cfgGet('Trigger_Schedule_SAST') || '');
  return raw.split(/[;,]/).map(function(x) { return x.trim(); }).filter(Boolean);
}

/**
 * Gets the current System_Mode. Validates against allowed values.
 * @returns {string} 'BACKTEST' | 'PAPER' | 'LIVE'
 */
function M1_cfgGetSystemMode() {
  var mode = M1_cfgGetStr('System_Mode');
  var valid = ['BACKTEST', 'PAPER', 'LIVE'];
  if (valid.indexOf(mode) === -1) {
    throw new Error('[M1] Invalid System_Mode "' + mode + '". Must be one of: ' + valid.join(', '));
  }
  return mode;
}

/**
 * Convenience: is the system in LIVE mode?
 * @returns {boolean}
 */
function M1_cfgIsLive() {
  return M1_cfgGetSystemMode() === 'LIVE';
}

/* ============================================================================
   PUBLIC API — WRITE
   ============================================================================ */

/**
 * Sets a CONFIG parameter value and appends to CONFIG_CHANGELOG.
 * Requires a reason (no silent changes).
 *
 * @param {string} paramName
 * @param {*} newValue
 * @param {string} reason - Why (required, non-blank)
 * @param {boolean} [requiresRebacktest=false]
 * @returns {boolean} true on success
 */
function M1_cfgSet(paramName, newValue, reason, requiresRebacktest) {
  if (!reason || !String(reason).trim()) {
    throw new Error('[M1] Reason required for CONFIG changes.');
  }

  var sh = M1__cfgSheet_();
  var row = M1__cfgFindParamRow_(paramName);
  if (!row) {
    throw new Error('[M1] Cannot set unknown CONFIG param "' + paramName + '". Add it to the sheet first.');
  }

  var oldValue = sh.getRange(row, M1_CONST.CFG_COL_VALUE).getValue();
  sh.getRange(row, M1_CONST.CFG_COL_VALUE).setValue(newValue);

  // Append changelog entry
  M1_chgAppend(paramName, oldValue, newValue, reason, !!requiresRebacktest);

  M1__cfgInvalidateCache_();
  return true;
}


/**
 * MODULE 1 — Foundation
 * M1_Changelog.gs
 *
 * Append-only CONFIG_CHANGELOG stored inside the CONFIG tab,
 * below the marker row "=== CONFIG_CHANGELOG ===".
 *
 * @version 3.2.1
 */

/* ============================================================================
   PRIVATE HELPERS
   ============================================================================ */

/**
 * Returns the row number of the changelog column header row
 * (one row below the marker).
 * @private
 */
function M1__chgHeaderRow_() {
  var sh = M1__cfgSheet_();
  var markerRow = M1__findChangelogMarkerRow_(sh);
  if (!markerRow) {
    throw new Error('[M1] Missing changelog marker "' + M1_CONST.CHANGELOG_MARKER + '" in CONFIG tab.');
  }
  return markerRow + 1;
}

/**
 * Finds the next empty row to append a changelog entry.
 * Scans from header+1 downward.
 * @private
 */
function M1__chgFindAppendRow_() {
  var sh = M1__cfgSheet_();
  var headerRow = M1__chgHeaderRow_();
  var lastRow = sh.getLastRow();

  if (lastRow <= headerRow) return headerRow + 1;

  var numRows = lastRow - headerRow;
  var block = sh.getRange(headerRow + 1, 1, numRows, 6).getValues();

  for (var i = block.length - 1; i >= 0; i--) {
    var hasContent = false;
    for (var c = 0; c < block[i].length; c++) {
      if (String(block[i][c]).trim() !== '') { hasContent = true; break; }
    }
    if (hasContent) return headerRow + 1 + i + 1;
  }
  return headerRow + 1;
}

/* ============================================================================
   PUBLIC API
   ============================================================================ */

/**
 * Appends a single entry to CONFIG_CHANGELOG.
 * This is the only way changelog entries are created.
 *
 * @param {string} paramName
 * @param {*} oldValue
 * @param {*} newValue
 * @param {string} reason
 * @param {boolean} requiresRebacktest
 */
function M1_chgAppend(paramName, oldValue, newValue, reason, requiresRebacktest) {
  var sh = M1__cfgSheet_();

  var tz;
  try {
    tz = M1_cfgGetStr('Timezone');
  } catch (_) {
    tz = 'Africa/Johannesburg';
  }
  var ts = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss');

  var row = M1__chgFindAppendRow_();
  sh.getRange(row, M1_CONST.CHG_COL_DATE, 1, 6).setValues([[
    ts,
    String(paramName),
    (oldValue === undefined || oldValue === null) ? '(null)' : String(oldValue),
    (newValue === undefined || newValue === null) ? '(null)' : String(newValue),
    String(reason),
    requiresRebacktest ? 'YES' : 'NO'
  ]]);
}

/**
 * Returns all changelog entries as an array of objects.
 * @returns {Object[]}
 */
function M1_chgList() {
  var sh = M1__cfgSheet_();
  var headerRow;
  try {
    headerRow = M1__chgHeaderRow_();
  } catch (_) {
    return [];
  }

  var lastRow = sh.getLastRow();
  if (lastRow <= headerRow) return [];

  var data = sh.getRange(headerRow + 1, 1, lastRow - headerRow, 6).getValues();
  var results = [];

  for (var i = 0; i < data.length; i++) {
    var hasContent = false;
    for (var c = 0; c < data[i].length; c++) {
      if (String(data[i][c]).trim() !== '') { hasContent = true; break; }
    }
    if (hasContent) {
      results.push({
        date:               data[i][0],
        parameter:          data[i][1],
        oldValue:           data[i][2],
        newValue:           data[i][3],
        reason:             data[i][4],
        requiresRebacktest: data[i][5] === 'YES'
      });
    }
  }
  return results;
}

/**
 * Returns only changelog entries where Requires_Rebacktest = YES.
 * @returns {Object[]}
 */
function M1_chgListRebacktestRequired() {
  return M1_chgList().filter(function(e) { return e.requiresRebacktest; });
}


/**
 * MODULE 1 — Foundation
 * M1_Security.gs
 *
 * API credentials live ONLY in Script Properties.
 * This file provides storage, retrieval, HMAC signing, and security auditing.
 *
 * @version 3.2.1
 */


/* ============================================================================
   PUBLIC API — KEY MANAGEMENT
   ============================================================================ */

/**
 * Stores VALR API key in Script Properties.
 * Run once manually from Apps Script editor or via menu prompt.
 * @param {string} key
 */
function M1_secSetApiKey(key) {
  if (!key || !String(key).trim()) throw new Error('[M1] API key cannot be blank.');
  PropertiesService.getScriptProperties().setProperty(M1_SEC.VALR_KEY, String(key).trim());
  Logger.log('[M1_Security] VALR API key stored.');
}

/**
 * Stores VALR API secret in Script Properties.
 * @param {string} secret
 */
function M1_secSetApiSecret(secret) {
  if (!secret || !String(secret).trim()) throw new Error('[M1] API secret cannot be blank.');
  PropertiesService.getScriptProperties().setProperty(M1_SEC.VALR_SECRET, String(secret).trim());
  Logger.log('[M1_Security] VALR API secret stored.');
}

/**
 * Checks if both API credentials are present.
 * @returns {boolean}
 */
function M1_secHasCreds() {
  var p = PropertiesService.getScriptProperties();
  return !!(p.getProperty(M1_SEC.VALR_KEY) && p.getProperty(M1_SEC.VALR_SECRET));
}

/**
 * Gets API key. Throws if missing.
 * @returns {string}
 */
function M1_secGetApiKey() {
  var v = PropertiesService.getScriptProperties().getProperty(M1_SEC.VALR_KEY);
  if (!v) throw new Error('[M1] VALR API key missing. Set via M1_secSetApiKey() or Script Properties.');
  return v;
}

/**
 * Gets API secret. Throws if missing.
 * @returns {string}
 */
function M1_secGetApiSecret() {
  var v = PropertiesService.getScriptProperties().getProperty(M1_SEC.VALR_SECRET);
  if (!v) throw new Error('[M1] VALR API secret missing. Set via M1_secSetApiSecret() or Script Properties.');
  return v;
}

/* ============================================================================
   PUBLIC API — HMAC SIGNATURE
   ============================================================================ */

/**
 * Generates VALR API signature (HMAC-SHA512, hex-encoded).
 * Payload = timestamp + VERB + path + body
 *
 * @param {number|string} timestampMs - Unix timestamp in milliseconds
 * @param {string} httpVerb - GET, POST, DELETE, etc.
 * @param {string} path - API path e.g. /v1/account/balances
 * @param {string} [body=''] - Request body (for POST/PUT)
 * @returns {string} Hex-encoded signature
 */
function M1_secValrSignature(timestampMs, httpVerb, path, body) {
  var secret = M1_secGetApiSecret();
  var payload = String(timestampMs) + String(httpVerb).toUpperCase() + String(path) + (body || '');

  var sigBytes = Utilities.computeHmacSha512Signature(payload, secret);

  // Convert byte array to hex string
  var hex = '';
  for (var i = 0; i < sigBytes.length; i++) {
    var b = (sigBytes[i] + 256) % 256;
    hex += ('0' + b.toString(16)).slice(-2);
  }
  return hex;
}

/* ============================================================================
   PUBLIC API — SECURITY AUDIT
   ============================================================================ */

/**
 * Scans all sheet tabs for anything that looks like an exposed API key.
 * Returns { safe: boolean, issues: string[] }.
 * @returns {Object}
 */
function M1_secScanSheetsForKeys() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var issues = [];

  for (var s = 0; s < sheets.length; s++) {
    var name = sheets[s].getName();
    if (name === 'README') continue;

    try {
      var data = sheets[s].getDataRange().getValues();
      for (var r = 0; r < data.length; r++) {
        for (var c = 0; c < data[r].length; c++) {
          var cell = String(data[r][c]);
          // Flag any suspiciously long alphanumeric string (potential key)
          if (/^[a-zA-Z0-9]{32,}$/.test(cell)) {
            issues.push('Sheet "' + name + '", Row ' + (r + 1) + ', Col ' + (c + 1) + ': Possible key exposure');
          }
        }
      }
    } catch (e) {
      issues.push('Could not scan sheet "' + name + '": ' + e.message);
    }
  }

  return { safe: issues.length === 0, issues: issues };
}


/**
 * Full security audit. Checks credentials exist, no keys in sheets,
 * and API_Key_Storage config is correct.
 * @returns {Object} { passed: boolean, checks: Object[] }
 */
/* ============================================================================
   CONSTANTS
   ============================================================================ */

var M1_SEC = Object.freeze({
  VALR_KEY:          'VALR_API_KEY',
  VALR_SECRET:       'VALR_API_SECRET',
  SUPABASE_URL:      'SUPABASE_URL',
  SUPABASE_KEY:      'SUPABASE_API_KEY',
  CRYPTOCOMPARE_KEY: 'CRYPTOCOMPARE_API_KEY',
  OPENROUTER_KEY:    'OPENROUTER_API_KEY'         
});

/* ============================================================================
   PUBLIC API — KEY MANAGEMENT
   ============================================================================ */

// ... (Keep your existing VALR functions here: M1_secSetApiKey, M1_secSetApiSecret, etc) ...

/**
 * Stores Supabase URL in Script Properties.
 */
function M1_secSetSupabaseUrl(url) {
  if (!url || !String(url).trim()) throw new Error('[M1] Supabase URL cannot be blank.');
  PropertiesService.getScriptProperties().setProperty(M1_SEC.SUPABASE_URL, String(url).trim());
  Logger.log('[M1_Security] Supabase URL stored.');
}

/**
 * Stores Supabase API Key in Script Properties.
 */
function M1_secSetSupabaseKey(key) {
  if (!key || !String(key).trim()) throw new Error('[M1] Supabase API key cannot be blank.');
  PropertiesService.getScriptProperties().setProperty(M1_SEC.SUPABASE_KEY, String(key).trim());
  Logger.log('[M1_Security] Supabase API key stored.');
}

/**
 * Checks if Supabase credentials are present.
 * @returns {boolean}
 */
function M1_secHasSupabaseCreds() {
  var p = PropertiesService.getScriptProperties();
  return !!(p.getProperty(M1_SEC.SUPABASE_URL) && p.getProperty(M1_SEC.SUPABASE_KEY));
}

/**
 * Gets Supabase URL. Throws if missing.
 * @returns {string}
 */
function M1_secGetSupabaseUrl() {
  var v = PropertiesService.getScriptProperties().getProperty(M1_SEC.SUPABASE_URL);
  if (!v) throw new Error('[M1] Supabase URL missing. Set via menu or Script Properties.');
  return v;
}

/**
 * Gets Supabase API Key. Throws if missing.
 * @returns {string}
 */
function M1_secGetSupabaseKey() {
  var v = PropertiesService.getScriptProperties().getProperty(M1_SEC.SUPABASE_KEY);
  if (!v) throw new Error('[M1] Supabase API key missing. Set via menu or Script Properties.');
  return v;
}

// ... (Keep M1_secValrSignature and M1_secScanSheetsForKeys exactly as they are) ...

/* ============================================================================
   PUBLIC API — SECURITY AUDIT
   ============================================================================ */

/**
 * Full security audit. Checks credentials exist, no keys in sheets,
 * and API_Key_Storage config is correct.
 * @returns {Object} { passed: boolean, checks: Object[] }
 */
function M1_secAudit() {
  var checks = [];

  // 1. VALR Credentials exist
  var hasValr = M1_secHasCreds();
  checks.push({
    name: 'VALR Credentials Configured',
    passed: hasValr,
    detail: hasValr ? 'Key and secret found in Script Properties.' : 'MISSING — run M1_menuSetValrCredentials.'
  });

  // 2. Supabase Credentials exist
  var hasSupabase = M1_secHasSupabaseCreds();
  checks.push({
    name: 'Supabase Credentials Configured',
    passed: hasSupabase,
    detail: hasSupabase ? 'URL and key found in Script Properties.' : 'MISSING — run M1_menuSetSupabaseCredentials.'
  });

  var hasCC = M1_secHasCryptoCompareCreds();
  checks.push({
    name: 'CryptoCompare Credentials Configured',
    passed: hasCC,
    detail: hasCC ? 'Key found in Script Properties.' : 'MISSING — run M1_menuSetCryptoCompareCredentials.'
  });

  // 3. No keys in sheets
  var scan = M1_secScanSheetsForKeys();
  checks.push({
    name: 'No Keys In Sheets',
    passed: scan.safe,
    detail: scan.safe ? 'All sheets clean.' : scan.issues.join('; ')
  });

  // 4. CONFIG says Script Properties only
  try {
    var storage = M1_cfgGetStr('API_Key_Storage');
    var correct = (storage === 'Script Properties only');
    checks.push({
      name: 'API_Key_Storage Config',
      passed: correct,
      detail: correct ? 'Correctly set.' : 'Unexpected value: "' + storage + '"'
    });
  } catch (e) {
    checks.push({ name: 'API_Key_Storage Config', passed: false, detail: e.message });
  }

  var allPassed = true;
  for (var i = 0; i < checks.length; i++) {
    if (!checks[i].passed) { allPassed = false; break; }
  }

  return { passed: allPassed, checks: checks };
}


/**
 * MODULE 1 — Foundation
 * M1_KillSwitch.gs
 *
 * Kill Switch management. When Kill_Switch = TRUE, no new trades are allowed.
 *
 * @version 3.2.1
 */

/**
 * Checks if Kill Switch is currently active.
 * @returns {boolean}
 */
function M1_ksIsOn() {
  return M1_cfgGetBool('Kill_Switch');
}

/**
 * Activates Kill Switch. Blocks all new trade entries.
 * @param {string} reason - Required explanation
 * @returns {boolean}
 */
function M1_ksOn(reason) {
  if (!reason || !String(reason).trim()) {
    throw new Error('[M1] Kill switch activation requires a reason.');
  }
  if (M1_ksIsOn()) {
    Logger.log('[M1_KillSwitch] Already active. No change.');
    return true;
  }
  return M1_cfgSet('Kill_Switch', true, 'KILL SWITCH ACTIVATED: ' + reason, false);
}

/**
 * Deactivates Kill Switch. Allows new trade entries.
 * @param {string} reason - Required explanation
 * @returns {boolean}
 */
function M1_ksOff(reason) {
  if (!reason || !String(reason).trim()) {
    throw new Error('[M1] Kill switch deactivation requires a reason.');
  }
  if (!M1_ksIsOn()) {
    Logger.log('[M1_KillSwitch] Already inactive. No change.');
    return true;
  }
  return M1_cfgSet('Kill_Switch', false, 'KILL SWITCH DEACTIVATED: ' + reason, false);
}

/**
 * Guard function: throws if Kill Switch is active.
 * Call before any trade execution path.
 * @throws {Error}
 */
function M1_ksRequireOff() {
  if (M1_ksIsOn()) {
    throw new Error('[M1] Kill_Switch is TRUE. No new orders allowed.');
  }
}

/**
 * Returns the reason for the most recent Kill Switch state change.
 * @returns {string|null}
 */
function M1_ksLastReason() {
  var entries = M1_chgList();
  for (var i = entries.length - 1; i >= 0; i--) {
    if (entries[i].parameter === 'Kill_Switch') return entries[i].reason;
  }
  return null;
}


/**
 * MODULE 1 — Foundation
 * M1_Scheduler.gs
 *
 * Installs and manages time-based triggers.
 * Handler function names are read from CONFIG — never hardcoded here.
 *
 * @version 3.2.1
 */

/**
 * Deletes ALL project triggers.
 * @returns {number} Count of triggers removed
 */
function M1_schClearAll() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  Logger.log('[M1_Scheduler] Cleared ' + triggers.length + ' trigger(s).');
  return triggers.length;
}

/**
 * Lists all active project triggers.
 * @returns {Object[]}
 */
function M1_schList() {
  return ScriptApp.getProjectTriggers().map(function(t) {
    return {
      id:          t.getUniqueId(),
      handler:     t.getHandlerFunction(),
      eventType:   String(t.getEventType()),
      source:      String(t.getTriggerSource())
    };
  });
}

/**
 * Installs triggers based on CONFIG values:
 * - Trigger_Schedule_SAST times → Handler_Main_Cycle
 * - Daily 00:30 SAST → Handler_Daily_Maintenance
 *
 * Clears existing triggers first (prevents duplicates).
 *
 * @returns {Object} { mainCount, dailyCount, timezone }
 */
function M1_schInstallFromConfig() {
  var tz = M1_cfgGetStr('Timezone') || 'Africa/Johannesburg';
  var times = M1_cfgGetTriggerScheduleSAST();
  var mainHandler = M1_cfgGetStr('Handler_Main_Cycle');
  var dailyHandler = M1_cfgGetStr('Handler_Daily_Maintenance');

  function assertHandlerExists_(handlerName, label) {
    if (!handlerName || !String(handlerName).trim()) {
      throw new Error('[M1] ' + label + ' is blank in CONFIG.');
    }
    if (typeof this[handlerName] !== 'function') {
      throw new Error('[M1] ' + label + ' "' + handlerName + '" does not exist as a script function.');
    }
  }

  assertHandlerExists_.call(this, mainHandler, 'Handler_Main_Cycle');
  assertHandlerExists_.call(this, dailyHandler, 'Handler_Daily_Maintenance');

  M1_schClearAll();

  for (var i = 0; i < times.length; i++) {
    var parts = times[i].split(':');
    var hh = parseInt(parts[0], 10);
    var mm = parseInt(parts[1], 10);

    if (!isFinite(hh) || !isFinite(mm)) {
      throw new Error('[M1] Invalid schedule time "' + times[i] + '". Expected HH:MM.');
    }

    ScriptApp.newTrigger(mainHandler)
      .timeBased()
      .atHour(hh)
      .nearMinute(mm)
      .everyDays(1)
      .inTimezone(tz)
      .create();

    Logger.log('[M1_Scheduler] Created trigger: ' + mainHandler + ' at ' + times[i] + ' ' + tz);
  }

  ScriptApp.newTrigger(dailyHandler)
    .timeBased()
    .atHour(0)
    .nearMinute(30)
    .everyDays(1)
    .inTimezone(tz)
    .create();

  Logger.log('[M1_Scheduler] Created daily maintenance trigger: ' + dailyHandler + ' at 00:30 ' + tz);

  return {
    mainCount: times.length,
    dailyCount: 1,
    timezone: tz
  };
}



function M1_diagConfiguredHandlersNow() {
  var results = [];
  var mainHandler = '';
  var dailyHandler = '';

  try {
    mainHandler = M1_cfgGetStr('Handler_Main_Cycle');
  } catch (e1) {
    Logger.log('[M1][HANDLER DIAG] Could not read Handler_Main_Cycle: ' + e1.message);
  }

  try {
    dailyHandler = M1_cfgGetStr('Handler_Daily_Maintenance');
  } catch (e2) {
    Logger.log('[M1][HANDLER DIAG] Could not read Handler_Daily_Maintenance: ' + e2.message);
  }

  function inspect_(label, handlerName) {
    var exists = !!handlerName && (typeof this[handlerName] === 'function');
    Logger.log('[M1][HANDLER DIAG] ' + label +
      ' handler=' + handlerName +
      ' exists=' + exists);
    results.push({
      label: label,
      handler: handlerName,
      exists: exists
    });
  }

  inspect_.call(this, 'MAIN', mainHandler);
  inspect_.call(this, 'DAILY', dailyHandler);

  return results;
}

/* ============================================================================
   UTILITY — TIME HELPERS
   ============================================================================ */

/**
 * Formats a Date in SAST using the CONFIG timezone.
 * @param {Date} date
 * @returns {string}
 */
function M1_formatSAST(date) {
  var tz;
  try { tz = M1_cfgGetStr('Timezone'); } catch (_) { tz = 'Africa/Johannesburg'; }
  return Utilities.formatDate(date, tz, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Returns current timestamp formatted in SAST.
 * @returns {string}
 */
function M1_nowSAST() {
  return M1_formatSAST(new Date());
}

/**
 * Returns the UTC timestamp of the most recently completed 4H candle.
 * @returns {Date}
 */
function M1_lastCandleCloseUTC() {
  var now = new Date();
  var utcH = now.getUTCHours();
  var candleH = Math.floor(utcH / 4) * 4;

  var close = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
    candleH, 0, 0, 0
  ));

  // If exactly on boundary, use previous candle
  if (now.getTime() <= close.getTime()) {
    close.setUTCHours(close.getUTCHours() - 4);
  }

  return close;
}



/**
 * Simple trigger — only fires when a human opens the spreadsheet in a browser.
 * Guarded so that if anything goes wrong (or if it's somehow invoked from 
 * a non-UI context), it fails silently instead of throwing a runtime error.
 */
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('$T$T System')
      .addItem('🔑 Set VALR Credentials',          'M1_menuSetValrCredentials')
      .addItem('🔑 Set Supabase Credentials',       'M1_menuSetSupabaseCredentials')
      .addItem('🔑 Set CryptoCompare Credentials',  'M1_menuSetCryptoCompareCredentials')
      .addItem('🔑 Set OpenRouter Credentials',      'M1_menuSetOpenRouterCredentials')
      .addItem('🔒 Run Security Audit',              'M1_menuSecurityAudit')
      .addSeparator()
      .addItem('🔄 M2: Pull VALR Instruments',       'M2_runInstrumentMasterPull')
      .addItem('🔄 M2: Run Hard Filters & Build UNIVERSE', 'M2_runSpsAndBuildUniverse')
      .addItem('🔄 M2: Fetch Top-K Candles',         'M2_fetchTopKCandlesIncremental')
      .addItem('🔄 M2: Poll Funding Log',            'M2_pollAndLogFundingSettlements')
      .addSeparator()
      .addItem('🧪 Test M1 (Connectivity & Limit)',  'M1_testRunAll')
      .addItem('🧪 Test M2 (Math & Data Rules)',     'M2_testRunAll')
      .addSeparator()
      .addItem('⚠️ KILL SWITCH ON',                  'RUN_KillSwitchOn')
      .addItem('✅ KILL SWITCH OFF',                  'RUN_KillSwitchOff')
      .addToUi();
  } catch (e) {
    // Not in a UI context (time-driven trigger, API call, etc.) — swallow silently.
    // This is expected and not an error worth logging in production.
  }
}


/**
 * NEUTRALIZED. This function existed and had a trigger pointing at it.
 * The trigger has been deleted by RUN_auditAndCleanTriggers().
 * This stub remains so that any lingering references don't throw "function not found".
 * It does nothing.
 */
function IGN_onOpen() {
  // Intentionally empty — neutralized rogue function.
  return;
}

// Renamed from M1_menuSetCredentials to be specific
function M1_menuSetValrCredentials() {
  var ui = SpreadsheetApp.getUi();

  var keyResp = ui.prompt('VALR API Setup', 'Enter your VALR API Key:', ui.ButtonSet.OK_CANCEL);
  if (keyResp.getSelectedButton() !== ui.Button.OK) return;

  var secretResp = ui.prompt('VALR API Setup', 'Enter your VALR API Secret:', ui.ButtonSet.OK_CANCEL);
  if (secretResp.getSelectedButton() !== ui.Button.OK) return;

  try {
    M1_secSetApiKey(keyResp.getResponseText());
    M1_secSetApiSecret(secretResp.getResponseText());
    ui.alert('✅ Success', 'VALR API keys stored safely in Script Properties.', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('❌ Error', e.message, ui.ButtonSet.OK);
  }
}

// New handler for Supabase
function M1_menuSetSupabaseCredentials() {
  var ui = SpreadsheetApp.getUi();

  var urlResp = ui.prompt('Supabase Setup', 'Enter your Supabase Project URL\n(e.g., https://xyz.supabase.co):', ui.ButtonSet.OK_CANCEL);
  if (urlResp.getSelectedButton() !== ui.Button.OK) return;

  var keyResp = ui.prompt('Supabase Setup', 'Enter your Supabase API Key:', ui.ButtonSet.OK_CANCEL);
  if (keyResp.getSelectedButton() !== ui.Button.OK) return;

  try {
    M1_secSetSupabaseUrl(urlResp.getResponseText());
    M1_secSetSupabaseKey(keyResp.getResponseText());
    ui.alert('✅ Success', 'Supabase credentials stored safely in Script Properties.', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('❌ Error', e.message, ui.ButtonSet.OK);
  }
}

// ... Keep all your other M1_menu functions exactly as they are ...

function M1_menuSecurityAudit() {
  var ui = SpreadsheetApp.getUi();
  try {
    var result = M1_secAudit();
    var lines = result.checks.map(function(c) {
      return (c.passed ? '✅' : '❌') + ' ' + c.name + ': ' + c.detail;
    });
    var status = result.passed ? '✅ ALL CHECKS PASSED' : '❌ ISSUES FOUND';
    ui.alert('Security Audit', status + '\n\n' + lines.join('\n'), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('❌ Error', e.message, ui.ButtonSet.OK);
  }
}

function M1_menuInstallTriggers() {
  var ui = SpreadsheetApp.getUi();
  try {
    var result = M1_schInstallFromConfig();
    ui.alert('✅ Triggers Installed',
      'Signal cycle triggers: ' + result.mainCount + '\n' +
      'Daily maintenance triggers: ' + result.dailyCount + '\n' +
      'Timezone: ' + result.timezone,
      ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('❌ Error', e.message, ui.ButtonSet.OK);
  }
}

function M1_menuListTriggers() {
  var ui = SpreadsheetApp.getUi();
  var triggers = M1_schList();
  if (triggers.length === 0) {
    ui.alert('Triggers', 'No active triggers found.', ui.ButtonSet.OK);
    return;
  }
  var lines = triggers.map(function(t) {
    return t.handler + ' (' + t.eventType + ')';
  });
  ui.alert('Active Triggers (' + triggers.length + ')', lines.join('\n'), ui.ButtonSet.OK);
}

function M1_menuKillSwitchOn() {
  var ui = SpreadsheetApp.getUi();
  var resp = ui.prompt('Kill Switch', 'Enter reason for activation:', ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  try {
    M1_ksOn(resp.getResponseText());
    ui.alert('🛑 Kill Switch ACTIVATED', 'All new trades are blocked.', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('❌ Error', e.message, ui.ButtonSet.OK);
  }
}

function M1_menuKillSwitchOff() {
  var ui = SpreadsheetApp.getUi();
  var resp = ui.prompt('Kill Switch', 'Enter reason for deactivation:', ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  try {
    M1_ksOff(resp.getResponseText());
    ui.alert('✅ Kill Switch DEACTIVATED', 'Trading is now permitted.', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('❌ Error', e.message, ui.ButtonSet.OK);
  }
}

function M1_menuRunTests() {
  M1_testRunAll();
  SpreadsheetApp.getUi().alert('Tests Complete', 'Check Apps Script Execution Log for results.', SpreadsheetApp.getUi().ButtonSet.OK);
}


/**
 * MODULE 1 — Foundation
 * M1_Tests.gs
 *
 * Manual validation functions. Run from Apps Script editor or via menu.
 *
 * @version 3.2.1
 */

/**
 * Validates CONFIG tab structure: sheet exists, changelog marker present.
 */
function M1_testStructure() {
  Logger.log('=== TEST: Structure ===');

  var sh = M1__cfgSheet_();
  Logger.log('  CONFIG sheet found: YES');

  var marker = M1__findChangelogMarkerRow_(sh);
  Logger.log('  Changelog marker row: ' + (marker || 'NOT FOUND'));

  if (!marker) {
    Logger.log('  ✗ FAIL: Changelog marker missing. Add row with "' + M1_CONST.CHANGELOG_MARKER + '" to CONFIG tab.');
    return false;
  }

  Logger.log('  ✓ Structure OK');
  return true;
}

/**
 * Tests reading various CONFIG parameters.
 */
/**
 * Tests reading various CONFIG parameters.
 */
function M1_testConfigReads() {
  Logger.log('=== TEST: Config Reads ===');

  var tests = [
    { name: 'Exchange',                            type: 'str'  },
    { name: 'API_Rate_Limit_Per_Minute',          type: 'num'  },
    { name: 'Kill_Switch',                        type: 'bool' },
    { name: 'Preferred_Margin_Mode',              type: 'str'  },
    { name: 'Liquidation_Price_Source',           type: 'str'  },
    { name: 'Max_Concurrent_Leveraged_Positions', type: 'num'  },
    { name: 'MarginFraction_Floor_Pct',           type: 'num'  },
    { name: 'MarginFraction_Warning_Pct',         type: 'num'  },

    // Batch 1 additions
    { name: 'Backtest_Use_Mock_MarginFraction',   type: 'bool' },
    { name: 'MarginFraction_Current',             type: 'num'  },
    { name: 'Dynamic_Liq_Buffer_Base_R',          type: 'num'  },
    { name: 'Dynamic_Liq_Buffer_ATR_Mult',        type: 'num'  },
    { name: 'Ops_Liq_Buffer_Warn_R',              type: 'num'  },
    { name: 'Allow_Auto_Seed_Trading_Capital',    type: 'bool' },
    { name: 'Allow_Auto_Update_Month_Start_Equity', type: 'bool' }
  ];

  var allPassed = true;
  for (var i = 0; i < tests.length; i++) {
    try {
      var val;
      if (tests[i].type === 'num') val = M1_cfgGetNum(tests[i].name);
      else if (tests[i].type === 'bool') val = M1_cfgGetBool(tests[i].name);
      else val = M1_cfgGetStr(tests[i].name);

      Logger.log('  ✓ ' + tests[i].name + ' = ' + val);
    } catch (e) {
      Logger.log('  ✗ ' + tests[i].name + ': ' + e.message);
      allPassed = false;
    }
  }

  try {
    var buf = M1_cfgEffectiveLiqBufferR();
    Logger.log('  ✓ Effective Liq Buffer = ' + buf + 'R');
  } catch (e) {
    Logger.log('  ✗ Effective Liq Buffer: ' + e.message);
    allPassed = false;
  }

  try {
    var sched = M1_cfgGetTriggerScheduleSAST();
    Logger.log('  ✓ Trigger Schedule = [' + sched.join(', ') + ']');
  } catch (e) {
    Logger.log('  ✗ Trigger Schedule: ' + e.message);
    allPassed = false;
  }

  try {
    var mode = M1_cfgGetSystemMode();
    Logger.log('  ✓ System Mode = ' + mode);
  } catch (e) {
    Logger.log('  ✗ System Mode: ' + e.message);
    allPassed = false;
  }

  Logger.log(allPassed ? '  ✓ All config reads passed' : '  ✗ Some reads failed');
  return allPassed;
}

/**
 * Tests Kill Switch on/off cycle.
 */
function M1_testKillSwitch() {
  Logger.log('=== TEST: Kill Switch ===');

  var initial = M1_ksIsOn();
  Logger.log('  Initial state: ' + initial);

  try {
    M1_ksOn('MODULE 1 TEST');
    if (!M1_ksIsOn()) throw new Error('Should be ON after activation');
    Logger.log('  ✓ Activated successfully');

    M1_ksOff('MODULE 1 TEST COMPLETE');
    if (M1_ksIsOn()) throw new Error('Should be OFF after deactivation');
    Logger.log('  ✓ Deactivated successfully');

    Logger.log('  ✓ Kill Switch test passed');
    return true;
  } catch (e) {
    Logger.log('  ✗ Kill Switch test failed: ' + e.message);
    // Attempt recovery
    try { M1_ksOff('TEST ERROR RECOVERY'); } catch (_) {}
    return false;
  }
}

/**
 * Tests changelog append and read.
 */
function M1_testChangelog() {
  Logger.log('=== TEST: Changelog ===');

  try {
    var before = M1_chgList().length;
    Logger.log('  Entries before: ' + before);

    // Use a runtime state param for harmless test
    var paramName = 'Last_Data_Fetch_Timestamp';
    var row = M1__cfgFindParamRow_(paramName);
    if (!row) {
      Logger.log('  ⚠ Param "' + paramName + '" not in CONFIG. Skipping write test.');
      return true;
    }

    M1_cfgSet(paramName, new Date().toISOString(), 'MODULE 1 TEST: changelog append', false);

    var after = M1_chgList().length;
    Logger.log('  Entries after: ' + after);

    if (after <= before) throw new Error('Entry count did not increase');

    Logger.log('  ✓ Changelog test passed');
    return true;
  } catch (e) {
    Logger.log('  ✗ Changelog test failed: ' + e.message);
    return false;
  }
}

/**
 * Tests security functions (does NOT test actual credentials).
 */
function M1_testSecurity() {
  Logger.log('=== TEST: Security ===');

  var hasCreds = M1_secHasCreds();
  Logger.log('  Has credentials: ' + hasCreds);

  var scan = M1_secScanSheetsForKeys();
  Logger.log('  Sheets clean: ' + scan.safe);
  if (!scan.safe) {
    for (var i = 0; i < scan.issues.length; i++) {
      Logger.log('    ⚠ ' + scan.issues[i]);
    }
  }

  var audit = M1_secAudit();
  for (var j = 0; j < audit.checks.length; j++) {
    var c = audit.checks[j];
    Logger.log('  ' + (c.passed ? '✓' : '✗') + ' ' + c.name + ': ' + c.detail);
  }

  Logger.log('  Security test completed (passed=' + audit.passed + ')');
  return audit.passed;
}

/**
 * Tests scheduler utility functions (does NOT install triggers).
 */
function M1_testScheduler() {
  Logger.log('=== TEST: Scheduler ===');

  try {
    var now = M1_nowSAST();
    Logger.log('  Current time SAST: ' + now);

    var lastCandle = M1_lastCandleCloseUTC();
    Logger.log('  Last 4H candle close UTC: ' + lastCandle.toISOString());

    var triggers = M1_schList();
    Logger.log('  Active triggers: ' + triggers.length);

    Logger.log('  ✓ Scheduler test passed');
    return true;
  } catch (e) {
    Logger.log('  ✗ Scheduler test failed: ' + e.message);
    return false;
  }
}

/**
 * Runs all Module 1 tests.
 */
function M1_testRunAll() {
  Logger.log('════════════════════════════════════════');
  Logger.log('  MODULE 1 — FOUNDATION TEST SUITE');
  Logger.log('  Version: 3.2.1');
  Logger.log('  Time: ' + new Date().toISOString());
  Logger.log('════════════════════════════════════════');
  Logger.log('');

  var results = [];
  results.push({ name: 'Structure',   passed: M1_testStructure() });
  Logger.log('');
  results.push({ name: 'Config Reads', passed: M1_testConfigReads() });
  Logger.log('');
  results.push({ name: 'Kill Switch', passed: M1_testKillSwitch() });
  Logger.log('');
  results.push({ name: 'Changelog',   passed: M1_testChangelog() });
  Logger.log('');
  results.push({ name: 'Security',    passed: M1_testSecurity() });
  Logger.log('');
  results.push({ name: 'Scheduler',   passed: M1_testScheduler() });
  Logger.log('');

  Logger.log('════════════════════════════════════════');
  Logger.log('  RESULTS SUMMARY');
  Logger.log('════════════════════════════════════════');

  var allPassed = true;
  for (var i = 0; i < results.length; i++) {
    Logger.log('  ' + (results[i].passed ? '✅' : '❌') + ' ' + results[i].name);
    if (!results[i].passed) allPassed = false;
  }

  Logger.log('');
  Logger.log(allPassed ? '  ✅ ALL TESTS PASSED' : '  ❌ SOME TESTS FAILED');
  Logger.log('════════════════════════════════════════');
}



function M1_secSetCryptoCompareKey(key) {
  if (!key || !String(key).trim()) throw new Error('[M1] CryptoCompare API key cannot be blank.');
  PropertiesService.getScriptProperties().setProperty(M1_SEC.CRYPTOCOMPARE_KEY, String(key).trim());
  Logger.log('[M1_Security] CryptoCompare API key stored.');
}

function M1_secGetCryptoCompareKey() {
  var v = PropertiesService.getScriptProperties().getProperty(M1_SEC.CRYPTOCOMPARE_KEY);
  if (!v) throw new Error('[M1] CryptoCompare API key missing. Set via menu.');
  return v;
}

function M1_secSetOpenRouterKey(key) {
  if (!key || !String(key).trim()) throw new Error('[M1] OpenRouter API key cannot be blank.');
  PropertiesService.getScriptProperties().setProperty(M1_SEC.OPENROUTER_KEY, String(key).trim());
  Logger.log('[M1_Security] OpenRouter key stored.');
}

function M1_secGetOpenRouterKey() {
  var v = PropertiesService.getScriptProperties().getProperty(M1_SEC.OPENROUTER_KEY);
  if (!v) throw new Error('[M1] OpenRouter key missing. Set via custom menu.');
  return v;
}





function M1_secHasCryptoCompareCreds() {
  return !!PropertiesService.getScriptProperties().getProperty(M1_SEC.CRYPTOCOMPARE_KEY);
}




function M1_menuSetCryptoCompareCredentials() {
  var ui = SpreadsheetApp.getUi();
  var keyResp = ui.prompt('CryptoCompare Setup', 'Enter your CryptoCompare API Key:', ui.ButtonSet.OK_CANCEL);
  if (keyResp.getSelectedButton() !== ui.Button.OK) return;

  try {
    M1_secSetCryptoCompareKey(keyResp.getResponseText());
    ui.alert('✅ Success', 'CryptoCompare key stored safely in Script Properties.', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('❌ Error', e.message, ui.ButtonSet.OK);
  }
}

function M1_menuSetOpenRouterCredentials() {
  var ui = SpreadsheetApp.getUi();
  var keyResp = ui.prompt('AI Brain Setup', 'Enter your OpenRouter API Key (sk-or-v1-...):', ui.ButtonSet.OK_CANCEL);
  if (keyResp.getSelectedButton() !== ui.Button.OK) return;

  try {
    M1_secSetOpenRouterKey(keyResp.getResponseText());
    ui.alert('✅ Success', 'OpenRouter key stored safely.', ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('❌ Error', e.message, ui.ButtonSet.OK);
  }
}
