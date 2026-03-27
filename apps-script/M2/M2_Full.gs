/* ═══════════════════════════════════════════════════════════════
   M2_Constants.gs  —  Module 2 constants & column maps
   v3.2.1-final
   ═══════════════════════════════════════════════════════════════ */

var M2_CONST = Object.freeze({
  VERSION  : '3.2.1',
  BASE_URL : 'https://api.valr.com',
  SOURCE   : 'VALR',

  /* ── Tab names (exactly 5) ── */
  SHEETS: Object.freeze({
    INSTRUMENTS : 'INSTRUMENTS',
    UNIVERSE    : 'UNIVERSE',
    DATA_RAW    : 'DATA_RAW',
    DATA_CLEAN  : 'DATA_CLEAN',
    FUNDING_LOG : 'FUNDING_LOG'
  }),

  /* ── Period helpers ── */
  PERIOD_MS: Object.freeze({
    '4H' : 4  * 60 * 60 * 1000,
    '1D' : 24 * 60 * 60 * 1000
  }),
  VALR_RESOLUTION: Object.freeze({
    '4H' : '14400',
    '1D' : '86400'
  }),

  /* ── Deterministic filter lists ── */
  STABLECOIN_PAIRS: Object.freeze([
    'USDT/ZAR','USDC/ZAR','RLUSD/ZAR','EURC/USDC',
    'USDT/USDC','USDC/USDT','BUSD/USDT','DAI/USDT'
  ]),
  XSTOCK_SUBSTRINGS: Object.freeze([
    'NVDAX','TSLAX','MSTRX','SPYX','HOODX','COINX','CRCLX'
  ]),
  DUST_PAIRS: Object.freeze([
    'MEME/USDT','PNUT/USDT','SWEAT/USDT','USDPC/USDT'
  ]),

  /* ── Thresholds ── */
  GAP_THRESHOLD_MULTIPLIER    : 1.5,
  MAX_CONSECUTIVE_GAPS        : 3,
  MIN_4H_CANDLES_90D          : 50,
  WICKINESS_FILTER_THRESHOLD  : 8.5,
  WICKINESS_PENALTY_THRESHOLD : 6.5,
  STALE_PERIODS               : 2,
  ATR_PERIOD                  : 14,
  OBV_SLOPE_LOOKBACK          : 20,
  BB_SQUEEZE_PERCENTILE       : 0.10,
  BB_PERIOD                   : 20,
  BB_SQUEEZE_LOOKBACK         : 60,
  ATR_RATIO_LOOKBACK_CANDLES  : 30,

  /* ── Rate-limit cache ── */
  API_CACHE_KEY     : 'M2_API_CALLS_THIS_MINUTE',
  API_CACHE_TTL_SEC : 60
});

/* ── Column ordinal maps (0-based) ── */
var M2_COL = Object.freeze({

  INSTRUMENTS: Object.freeze({
    Symbol               : 0,
    Market_Type          : 1,
    Quote_Currency       : 2,
    Max_Leverage_VALR    : 3,
    Margin_Mode_Available: 4,
    Min_Order_Size_Base  : 5,
    Tick_Size            : 6,
    Vol_24h_Quote        : 7,
    Vol_24h_ZAR          : 8,
    Perp_Funding_Rate_8h : 9,
    Hard_Filter_Pass     : 10,
    Fetch_Timestamp      : 11
  }),

  UNIVERSE: Object.freeze({
    Symbol                     : 0,
    Market_Type                : 1,
    SPS_Final                  : 2,
    SPS_Rank                   : 3,
    In_Top_K                   : 4,
    ATR_4H_Pct                 : 5,
    ATR_Ratio                  : 6,
    BB_Squeeze                 : 7,
    Vol_24h_ZAR                : 8,
    OBV_Slope_20               : 9,
    Data_Reliable              : 10,
    Gap_Frequency_30d          : 11,
    Funding_Penalty_Applied    : 12,
    Sector_Tag                 : 13,
    Max_Leverage_Allowed       : 14,
    Preferred_Product          : 15,
    Nearest_Opportunity        : 16,
    Distance_to_Resistance_Pct : 17,
    Distance_to_Support_Pct    : 18,
    Last_Updated               : 19
  }),

  DATA_RAW: Object.freeze({
    Timestamp              : 0,
    Symbol                 : 1,
    Market_Type            : 2,
    Timeframe              : 3,
    Open                   : 4,
    High                   : 5,
    Low                    : 6,
    Close                  : 7,
    Volume                 : 8,
    Volume_Quote           : 9,
    Volume_ZAR             : 10,
    USDT_ZAR_Rate_At_Fetch : 11,
    Source                 : 12,
    Fetch_Timestamp        : 13
  }),

  DATA_CLEAN: Object.freeze({
    Timestamp              : 0,
    Symbol                 : 1,
    Market_Type            : 2,
    Timeframe              : 3,
    Open                   : 4,
    High                   : 5,
    Low                    : 6,
    Close                  : 7,
    Volume                 : 8,
    Volume_Quote           : 9,
    Volume_ZAR             : 10,
    USDT_ZAR_Rate_At_Fetch : 11,
    Source                 : 12,
    Fetch_Timestamp        : 13,
    Gap_Flag               : 14,
    Stale_Flag             : 15,
    Wick_To_Body_Ratio     : 16
  }),

  FUNDING_LOG: Object.freeze({
    Timestamp                    : 0,
    Symbol                       : 1,
    Funding_Rate                 : 2,
    Daily_Rate_Equiv             : 3,
    Position_Side                : 4,
    Cost_Direction               : 5,
    Amount_USDT                  : 6,
    Amount_ZAR                   : 7,
    USDT_ZAR_Rate_At_Settlement  : 8,
    Linked_Position_ID           : 9
  })
});


/* ═══════════════════════════════════════════════════════════════
   M2_Utilities.gs  —  Sheet I/O, normalisation, scoring helpers
   ═══════════════════════════════════════════════════════════════ */

function M2__ss_()      { return SpreadsheetApp.getActiveSpreadsheet(); }

function M2__sh_(name) {
  var sh = M2__ss_().getSheetByName(name);
  if (!sh) throw new Error('[M2] Sheet not found: ' + name);
  return sh;
}

function M2__readAll_(sheetName) {
  var sh = M2__sh_(sheetName);
  if (sh.getLastRow() < 1) return [];
  return sh.getDataRange().getValues();
}

function M2__clearDataRows_(sheetName) {
  var sh = M2__sh_(sheetName);
  var lr = sh.getLastRow(), lc = sh.getLastColumn();
  if (lr > 1 && lc > 0) sh.getRange(2, 1, lr - 1, lc).clearContent();
}

function M2__writeFromRow2_(sheetName, rows) {
  if (!rows || rows.length === 0) return;

  var sh = M2__sh_(sheetName);
  var chunkSize = 5000;
  var width = rows[0].length;
  var startRow = 2;

  for (var i = 0; i < rows.length; i += chunkSize) {
    var chunk = rows.slice(i, i + chunkSize);
    sh.getRange(startRow + i, 1, chunk.length, width).setValues(chunk);
    SpreadsheetApp.flush();
    Utilities.sleep(100);
  }
}

function M2__appendRows_(sheetName, rows) {
  if (!rows || rows.length === 0) return;
  var sh = M2__sh_(sheetName);
  var next = sh.getLastRow() + 1;
  sh.getRange(next, 1, rows.length, rows[0].length).setValues(rows);
}

function M2__assertColumnCount_(sheetName, expectedCount) {
  var sh = M2__sh_(sheetName);
  if (sh.getLastColumn() === 0)
    throw new Error('[M2] ' + sheetName + ' has no columns.');
  var header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var actual = header.filter(function(v) { return String(v).trim() !== ''; }).length;
  if (actual !== expectedCount)
    throw new Error('[M2] Schema mismatch on ' + sheetName +
                    ': expected ' + expectedCount + ', found ' + actual);
}

/* ── Timestamp helpers ── */

function M2__nowIso_() { return new Date().toISOString(); }

function M2__toIsoUtc_(ts) {
  var d = null;

  if (ts instanceof Date) {
    d = ts;
  } else if (typeof ts === 'number') {
    d = new Date(ts);
  } else if (typeof ts === 'string') {
    var trimmed = ts.trim();
    if (!trimmed) return '';
    if (/^\d{10,13}$/.test(trimmed)) {
      var n = parseInt(trimmed, 10);
      if (n < 1e12) n *= 1000;
      d = new Date(n);
    } else {
      d = new Date(trimmed);
    }
  } else {
    return '';
  }

  if (!d || !isFinite(d.getTime())) return '';
  return d.toISOString();
}



function M2__normaliseCandleTimestamp_(tsRaw, tf) {
  var iso = M2__toIsoUtc_(tsRaw);
  if (!iso) return '';

  var ms = new Date(iso).getTime();
  if (!isFinite(ms)) return '';

  var bucketMs = M2__bucketStartMs_(ms, tf);
  if (!isFinite(bucketMs)) return '';

  return new Date(bucketMs).toISOString();
}

/* ── Symbol helpers ── */

function M2__normaliseSymbol_(marketRow) {
  var raw = String(marketRow.currencyPair || marketRow.symbol ||
                   marketRow.name || '').toUpperCase().trim();
  if (!raw) return '';
  if (raw.indexOf('/') !== -1) return raw;

  var quoteSuffixes = ['USDTPERP','ZARPERP','USDT','ZAR','BTC','ETH'];
  for (var i = 0; i < quoteSuffixes.length; i++) {
    var qs = quoteSuffixes[i];
    if (raw.length > qs.length && raw.slice(-qs.length) === qs)
      return raw.slice(0, raw.length - qs.length) + '/' + qs;
  }
  return '';
}

function M2__marketType_(sym) {
  return sym.indexOf('PERP') !== -1 ? 'PERP' : 'SPOT_MARGIN';
}
function M2__quoteCcy_(sym) {
  return sym.indexOf('/ZAR') !== -1 ? 'ZAR' : 'USDT';
}
function M2__isUsdtQuoted_(sym) {
  return sym.indexOf('USDT') !== -1;
}

/* ── Dedup key ── */

function M2__cleanKey_(sym, tf, ts) {
  return sym + '|||' + tf + '|||' + ts;
}

/* ── Scoring helpers ── */

function M2__linear_(value, inLo, inHi, outLo, outHi) {
  if (inHi === inLo) return outLo;
  var t = (value - inLo) / (inHi - inLo);
  t = Math.max(0, Math.min(1, t));
  var result = outLo + t * (outHi - outLo);
  var lo = Math.min(outLo, outHi), hi = Math.max(outLo, outHi);
  return Math.max(lo, Math.min(hi, result));
}

function M2__percentileScore_(value, sortedValues, maxScore) {
  if (!sortedValues || sortedValues.length < 2) return 0;
  var n = sortedValues.length, rank = 0;
  for (var i = 0; i < n; i++) {
    if (sortedValues[i] <= value) rank = i;
  }
  var pct = rank / (n - 1);
  return M2__linear_(pct, 0.10, 0.90, 0, maxScore);
}


/* ═══════════════════════════════════════════════════════════════
   M2_ApiClient.gs  —  VALR REST client with throttle & retry
   ═══════════════════════════════════════════════════════════════ */

/* ── Exported functions ── */

function M2_valrPublicGet(endpoint) {
  return M2__executeRequest_('GET', endpoint, null, false);
}

function M2_valrAuthGet(endpoint) {
  return M2__executeRequest_('GET', endpoint, null, true);
}

function M2_getUsdtZarRate() {
  var res  = M2_valrPublicGet('/v1/public/USDTZAR/marketsummary');
  var rate = parseFloat(res.lastTradedPrice || res.markPrice || '0');
  if (!rate || rate < 1)
    throw new Error('[M2] USDT/ZAR rate invalid: ' + JSON.stringify(res));
  return rate;
}

/* ── Internal ── */

function M2__executeRequest_(method, endpoint, payload, isAuth) {
  var limit       = M1_cfgGetNum('API_Rate_Limit_Per_Minute');
  var backoffBase = M1_cfgGetNum('API_Backoff_ms');
  var url         = M2_CONST.BASE_URL + endpoint;

  var options = { method: method, muteHttpExceptions: true, headers: {} };
  var bodyStr = '';

  if (payload && method !== 'GET') {
    bodyStr = JSON.stringify(payload);
    options.contentType = 'application/json';
    options.payload     = bodyStr;
  }

  if (isAuth) {
    var ts  = Date.now().toString();
    var sig = M1_secValrSignature(ts, method, endpoint, bodyStr);
    options.headers['X-VALR-API-KEY']       = M1_secGetApiKey();
    options.headers['X-VALR-SIGNATURE']     = sig;
    options.headers['X-VALR-TIMESTAMP']     = ts;
  }

  for (var attempt = 1; attempt <= 3; attempt++) {
    M2__throttle_(limit);

    var t0   = Date.now();
    var resp = UrlFetchApp.fetch(url, options);
    var ms   = Date.now() - t0;
    var code = resp.getResponseCode();
    var body = resp.getContentText();

    /* Optional M7 telemetry (safe if M7 absent) */
    try {
      if (typeof M7_logApiCall === 'function')
        M7_logApiCall(M2__nowIso_(), endpoint, code, ms, String(body).substring(0, 300));
      else if (typeof M7_API_logCall === 'function')
        M7_API_logCall(M2__nowIso_(), endpoint, code, ms, String(body).substring(0, 300));
    } catch (ignore) {}

    if (code >= 200 && code < 300) return JSON.parse(body);

    if (code === 429) {
      if (attempt === 3)
        throw new Error('[M2] HTTP 429 retries exhausted on ' + endpoint);
      Utilities.sleep(backoffBase * Math.pow(2, attempt - 1));
      continue;
    }

    throw new Error('[M2] VALR API error ' + code + ' on ' + endpoint + ': ' + body);
  }

  throw new Error('[M2] Request loop exited unexpectedly for ' + endpoint);
}

function M2__throttle_(limit) {
  var cache    = CacheService.getScriptCache();
  var countStr = cache.get(M2_CONST.API_CACHE_KEY);
  var count    = countStr ? parseInt(countStr, 10) : 0;

  if (count >= (limit - 10)) {
    Utilities.sleep(1000);
    cache.put(M2_CONST.API_CACHE_KEY, '1', M2_CONST.API_CACHE_TTL_SEC);
    return;
  }
  cache.put(M2_CONST.API_CACHE_KEY, String(count + 1), M2_CONST.API_CACHE_TTL_SEC);
}


/* ═══════════════════════════════════════════════════════════════
   M2_InstrumentMaster.gs  —  Instrument pull + hard filters A–G
   ═══════════════════════════════════════════════════════════════ */

/* ── Exported ── */

function M2_runInstrumentMasterPull() {
  var fetchTs   = M2__nowIso_();
  var usdtZar   = M2_getUsdtZarRate();
  var minVolZar = M2__getUniverseMinVolZar_('RESEARCH');

  var markets = M2_valrPublicGet('/v1/public/marketsummary');
  var rows    = [];

  for (var i = 0; i < markets.length; i++) {
    var m   = markets[i];
    var sym = M2__normaliseSymbol_(m);
    if (!sym) continue;

    var marketType = M2__marketType_(sym);
    var quoteCcy   = M2__quoteCcy_(sym);
    var volQuote   = M2__calcVolQuote_(m);
    var volZar     = quoteCcy === 'USDT' ? volQuote * usdtZar : volQuote;
    var funding8h  = marketType === 'PERP'
                       ? (parseFloat(m.fundingRate8h || m.fundingRate || '0') || null)
                       : null;
    var maxLev     = M2__parseMaxLev_(m, marketType);
    var passAE     = M2__applyFiltersAtoE_(sym, m, volZar, minVolZar);

    rows.push([
      sym, marketType, quoteCcy, maxLev, 'CROSS',
      parseFloat(m.minBaseAmount || '0') || 0,
      parseFloat(m.tickSize || '0') || 0,
      volQuote, volZar, funding8h, passAE, fetchTs
    ]);
  }

  M2__clearDataRows_(M2_CONST.SHEETS.INSTRUMENTS);
  M2__writeFromRow2_(M2_CONST.SHEETS.INSTRUMENTS, rows);

  /* F/G filters need DATA_CLEAN; skipped automatically on bootstrap */
  M2__applyFiltersFG_();

  console.log('[M2] Instrument master complete. Rows: ' + rows.length);
}

function M2_getHardFilterPassSymbols() {
  var data = M2__readAll_(M2_CONST.SHEETS.INSTRUMENTS);
  var c    = M2_COL.INSTRUMENTS;
  var out  = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][c.Hard_Filter_Pass] === true) out.push(data[i][c.Symbol]);
  }
  return out;
}

/* ── Filters A–E (stateless, per-instrument) ── */

function M2__applyFiltersAtoE_(sym, m, volZar, minVolZar) {
  /* A – active / not delisted */
  var active = (m.active !== false) &&
               (m.status !== 'INACTIVE') &&
               (m.status !== 'DELISTED') &&
               (m.status !== 'SUSPENDED');
  if (!active) return false;

  /* B – minimum volume */
  if (volZar < minVolZar) return false;

  /* C – stablecoin-pair exclusion (pair-level, not base-level) */
  for (var i = 0; i < M2_CONST.STABLECOIN_PAIRS.length; i++) {
    if (sym === M2_CONST.STABLECOIN_PAIRS[i]) return false;
  }

  /* D – xStock substring exclusion (deterministic list only) */
  var up = sym.toUpperCase();
  for (var j = 0; j < M2_CONST.XSTOCK_SUBSTRINGS.length; j++) {
    if (up.indexOf(M2_CONST.XSTOCK_SUBSTRINGS[j]) !== -1) return false;
  }

  /* E – dust pair exclusion */
  for (var k = 0; k < M2_CONST.DUST_PAIRS.length; k++) {
    if (sym === M2_CONST.DUST_PAIRS[k]) return false;
  }

  return true;
}

/* ── Filters F–G (data-quality, require DATA_CLEAN) ── */
function M2__applyFiltersFG_() {
  var clean = M2__readAll_(M2_CONST.SHEETS.DATA_CLEAN);

  if (!clean || clean.length <= 1) {
    console.log('[M2] DATA_CLEAN empty — skipping F/G filters (bootstrap mode).');
    return;
  }

  var instSh = M2__sh_(M2_CONST.SHEETS.INSTRUMENTS);
  var inst = instSh.getDataRange().getValues();
  var cI = M2_COL.INSTRUMENTS;
  var cC = M2_COL.DATA_CLEAN;

  var nowMs = Date.now();
  var ms30d = 30 * 24 * 60 * 60 * 1000;
  var ms7d  = 7 * 24 * 60 * 60 * 1000;

  var wickAvgThreshold = M1_cfgGetNum('Universe_Wickiness_Filter_Threshold');
  if (!isFinite(wickAvgThreshold) || wickAvgThreshold <= 0) {
    wickAvgThreshold = M2_CONST.WICKINESS_FILTER_THRESHOLD;
  }

  var recentWickMax = M1_cfgGetNum('Universe_Max_Recent_Wick_Ratio');
  if (!isFinite(recentWickMax) || recentWickMax <= 0) recentWickMax = 3.5;

  var stats = {};

  for (var r = 1; r < clean.length; r++) {
    var row = clean[r];
    if (String(row[cC.Timeframe]) !== '4H') continue;

    var sym = String(row[cC.Symbol] || '').trim();
    if (!sym) continue;

    var ts = new Date(row[cC.Timestamp]).getTime();
    if (!isFinite(ts)) continue;

    var gap = (row[cC.Gap_Flag] === true || String(row[cC.Gap_Flag]).toUpperCase() === 'TRUE');
    var wick = parseFloat(row[cC.Wick_To_Body_Ratio] || '0') || 0;

    if (!stats[sym]) {
      stats[sym] = {
        nonGapTotal: 0,
        oldestNonGap: Infinity,
        wickSum30d: 0,
        wickN30d: 0,
        maxWick7d: 0
      };
    }

    if (!gap) {
      stats[sym].nonGapTotal++;

      if (ts < stats[sym].oldestNonGap) {
        stats[sym].oldestNonGap = ts;
      }

      if (ts >= (nowMs - ms30d)) {
        stats[sym].wickSum30d += wick;
        stats[sym].wickN30d++;
      }

      if (ts >= (nowMs - ms7d)) {
        if (wick > stats[sym].maxWick7d) stats[sym].maxWick7d = wick;
      }
    }
  }

  var updates = [];

  for (var i = 1; i < inst.length; i++) {
    if (inst[i][cI.Hard_Filter_Pass] !== true) {
      updates.push([false]);
      continue;
    }

    var symb = String(inst[i][cI.Symbol] || '').trim();
    var st = stats[symb];

    if (!st) {
      updates.push([false]);
      continue;
    }

    var hasEnough = st.nonGapTotal >= M2_CONST.MIN_4H_CANDLES_90D;
    if (!hasEnough) {
      updates.push([false]);
      continue;
    }

    var avgWick = st.wickN30d > 0 ? (st.wickSum30d / st.wickN30d) : 0;
    if (avgWick > wickAvgThreshold) {
      updates.push([false]);
      continue;
    }

    if (st.maxWick7d > recentWickMax) {
      updates.push([false]);
      continue;
    }

    updates.push([true]);
  }

  if (updates.length) {
    instSh.getRange(2, cI.Hard_Filter_Pass + 1, updates.length, 1).setValues(updates);
  }

  console.log('[M2] F/G filters applied. Updated rows: ' + updates.length);
}

function M2_fixApplyFiltersFG_and_RebuildUniverse() {
  M2_fixApplyFiltersFG_();
  M2_runSpsAndBuildUniverse();
}

function M2_fixApplyFiltersFG_() {
  var clean = M2__readAll_(M2_CONST.SHEETS.DATA_CLEAN);

  if (!clean || clean.length <= 1) {
    console.log('[M2] DATA_CLEAN empty — skipping F/G filters (bootstrap mode).');
    return;
  }

  var instSh = M2__sh_(M2_CONST.SHEETS.INSTRUMENTS);
  var inst = instSh.getDataRange().getValues();
  var cI = M2_COL.INSTRUMENTS;
  var cC = M2_COL.DATA_CLEAN;

  var nowMs = Date.now();
  var ms30d = 30 * 24 * 60 * 60 * 1000;
  var stats = {};

  for (var r = 1; r < clean.length; r++) {
    var row = clean[r];

    if (String(row[cC.Timeframe]) !== '4H') continue;

    var sym = String(row[cC.Symbol] || '').trim();
    if (!sym) continue;

    var ts = new Date(row[cC.Timestamp]).getTime();
    if (!isFinite(ts)) continue;

    var gap = (row[cC.Gap_Flag] === true);

    if (!stats[sym]) {
      stats[sym] = {
        nonGapTotal: 0,
        oldestNonGap: Infinity,
        wickSum30d: 0,
        wickN30d: 0
      };
    }

    if (!gap) {
      stats[sym].nonGapTotal++;

      if (ts < stats[sym].oldestNonGap) {
        stats[sym].oldestNonGap = ts;
      }

      if (ts >= (nowMs - ms30d)) {
        stats[sym].wickSum30d += parseFloat(row[cC.Wick_To_Body_Ratio] || '0') || 0;
        stats[sym].wickN30d++;
      }
    }
  }

  var updates = [];
  var passCount = 0;

  for (var i = 1; i < inst.length; i++) {
    if (inst[i][cI.Hard_Filter_Pass] !== true) {
      updates.push([false]);
      continue;
    }

    var symb = String(inst[i][cI.Symbol] || '').trim();
    var st = stats[symb];

    if (!st) {
      console.log('[M2][FG_FIX] ' + symb + ' FAIL → no DATA_CLEAN stats');
      updates.push([false]);
      continue;
    }

    var hasEnough = st.nonGapTotal >= M2_CONST.MIN_4H_CANDLES_90D;
    if (!hasEnough) {
      console.log('[M2][FG_FIX] ' + symb + ' FAIL → nonGapTotal=' + st.nonGapTotal +
                  ' < min=' + M2_CONST.MIN_4H_CANDLES_90D);
      updates.push([false]);
      continue;
    }

    var avgWick = st.wickN30d > 0 ? (st.wickSum30d / st.wickN30d) : 0;
    if (avgWick > M2_CONST.WICKINESS_FILTER_THRESHOLD) {
      console.log('[M2][FG_FIX] ' + symb + ' FAIL → avgWick=' + avgWick.toFixed(4) +
                  ' > threshold=' + M2_CONST.WICKINESS_FILTER_THRESHOLD);
      updates.push([false]);
      continue;
    }

    console.log('[M2][FG_FIX] ' + symb + ' PASS → nonGapTotal=' + st.nonGapTotal +
                ', avgWick=' + avgWick.toFixed(4));
    updates.push([true]);
    passCount++;
  }

  if (updates.length) {
    instSh.getRange(2, cI.Hard_Filter_Pass + 1, updates.length, 1).setValues(updates);
  }

  console.log('[M2] F/G repair applied. Survivors after F/G: ' + passCount);
}

/* ── Helpers ── */

function M2__calcVolQuote_(m) {
  var qv = parseFloat(m.quoteVolume || m.volumeQuote || '0') || 0;
  if (qv > 0) return qv;
  var baseVol = parseFloat(m.baseVolume || '0') || 0;
  var last    = parseFloat(m.lastTradedPrice || m.lastPrice || '1') || 1;
  return baseVol * last;
}

function M2__parseMaxLev_(m, marketType) {
  var ml = parseInt(m.maxLeverage, 10);
  if (ml > 0 && isFinite(ml)) return ml;
  return marketType === 'PERP' ? 60 : 10;
}


function M2_debugFilterFGStats_() {
  var clean = M2__readAll_(M2_CONST.SHEETS.DATA_CLEAN);
  var cC = M2_COL.DATA_CLEAN;
  var nowMs = Date.now();
  var ms30d = 30 * 24 * 60 * 60 * 1000;
  var stats = {};

  for (var r = 1; r < clean.length; r++) {
    var row = clean[r];
    if (String(row[cC.Timeframe]) !== '4H') continue;

    var sym = String(row[cC.Symbol] || '').trim();
    if (!sym) continue;

    var ts = new Date(row[cC.Timestamp]).getTime();
    if (!isFinite(ts)) continue;

    var gap = (row[cC.Gap_Flag] === true || String(row[cC.Gap_Flag]).toUpperCase() === 'TRUE');

    if (!stats[sym]) {
      stats[sym] = {
        nonGapTotal: 0,
        wickSum30d: 0,
        wickN30d: 0
      };
    }

    if (!gap) {
      stats[sym].nonGapTotal++;
      if (ts >= (nowMs - ms30d)) {
        stats[sym].wickSum30d += parseFloat(row[cC.Wick_To_Body_Ratio] || '0') || 0;
        stats[sym].wickN30d++;
      }
    }
  }

  var keys = Object.keys(stats).sort();
  for (var i = 0; i < keys.length; i++) {
    var st = stats[keys[i]];
    var avgWick = st.wickN30d > 0 ? (st.wickSum30d / st.wickN30d) : 0;
    Logger.log(
      '[M2][FGDEBUG] ' + keys[i] +
      ' nonGapTotal=' + st.nonGapTotal +
      ' wickN30d=' + st.wickN30d +
      ' avgWick=' + avgWick
    );
  }
}


/* ═══════════════════════════════════════════════════════════════
   M2_SpsCalculator.gs  —  Symbol Priority Score + UNIVERSE build
   ═══════════════════════════════════════════════════════════════ */
function M2_runSpsAndBuildUniverse() {
  var ts        = M2__nowIso_();
  var scanN     = M1_cfgGetNum('Universe_Scan_Size_N');
  var activeK   = M1_cfgGetNum('Universe_Active_Size_K');
  var minVolZar = M2__getUniverseMinVolZar_('RESEARCH');
  var maxFunding= M1_cfgGetNum('Max_Funding_Cost_Per_Day_Pct');
  var maxBorrow = M1_cfgGetNum('Max_Borrow_Cost_Per_Day_Pct');
  var maxLevCfg = M1_cfgGetNum('Max_Leverage_PREMIUM');

  var volAdjusted = String(M1_cfgGetStr('Universe_Vol_Adjusted_Ranking_Enabled') || 'TRUE').toUpperCase() === 'TRUE';
  var atrPctCap   = M1_cfgGetNum('Universe_Vol_Adjusted_ATR_Pct_Cap');
  if (!isFinite(atrPctCap) || atrPctCap <= 0) atrPctCap = 12.0;

  var inst      = M2__readAll_(M2_CONST.SHEETS.INSTRUMENTS);
  var survivors = M2__getInstSurvivors_(inst);
  if (survivors.length === 0) {
    console.log('[M2] No instruments passed hard filters — UNIVERSE empty.');
    return;
  }

  var clean      = M2__readAll_(M2_CONST.SHEETS.DATA_CLEAN);
  var indicators = M2__buildAllIndicators_(clean);

  var sortedVols = survivors
    .map(function(r) { return parseFloat(r[M2_COL.INSTRUMENTS.Vol_24h_ZAR]) || 0; })
    .sort(function(a, b) { return a - b; });

  var scored = [];
  for (var i = 0; i < survivors.length; i++) {
    var row       = survivors[i];
    var sym       = row[M2_COL.INSTRUMENTS.Symbol];
    var mkt       = row[M2_COL.INSTRUMENTS.Market_Type];
    var volZar    = parseFloat(row[M2_COL.INSTRUMENTS.Vol_24h_ZAR]) || 0;
    var funding8h = mkt === 'PERP'
      ? (parseFloat(row[M2_COL.INSTRUMENTS.Perp_Funding_Rate_8h]) || 0)
      : null;
    var valrMaxLev = parseInt(row[M2_COL.INSTRUMENTS.Max_Leverage_VALR], 10) || 10;
    var ind        = indicators[sym] || M2__emptyIndicators_();

    var sres = M2__computeSps_({
      marketType : mkt,
      volZar     : volZar,
      funding8h  : funding8h,
      sortedVols : sortedVols,
      minVolZar  : minVolZar,
      maxFunding : maxFunding,
      maxBorrow  : maxBorrow,
      ind        : ind
    });

    var rawSps = sres.sps;
    var atr4HPct = ind.atr4HPct;
    var adjSps = rawSps;

    if (volAdjusted) {
      var atrPenaltyBase = Math.max(1.0, Math.min(atrPctCap, atr4HPct || 1.0));
      adjSps = rawSps / atrPenaltyBase;
    }

    scored.push({
      sym: sym,
      marketType: mkt,
      sps: rawSps,
      rankScore: adjSps,
      volZar: volZar,
      atr4HPct: ind.atr4HPct,
      atrRatio: ind.atrRatio,
      bbSqueeze: ind.bbSqueeze,
      obvSlope20: ind.obvSlope20,
      dataReliable: ind.dataReliable,
      gapFreq30d: ind.gapFreq30d,
      fundingPenalty: sres.fundingPenaltyApplied,
      valrMaxLev: valrMaxLev,
      maxLevCfg: maxLevCfg
    });
  }

  scored.sort(function(a, b) { return b.rankScore - a.rankScore; });
  var limited = scored.slice(0, scanN);
  var out     = [];

  for (var j = 0; j < limited.length; j++) {
    var s = limited[j];
    out.push([
      s.sym,
      s.marketType,
      s.sps,              // keep raw SPS in sheet
      j + 1,
      j < activeK,
      s.atr4HPct,
      s.atrRatio,
      s.bbSqueeze,
      s.volZar,
      s.obvSlope20,
      s.dataReliable,
      s.gapFreq30d,
      s.fundingPenalty,
      M2__sectorTag_(s.sym),
      Math.min(s.valrMaxLev, s.maxLevCfg),
      s.marketType,
      'NEITHER',
      0,
      0,
      ts
    ]);
  }

  M2__clearDataRows_(M2_CONST.SHEETS.UNIVERSE);
  M2__writeFromRow2_(M2_CONST.SHEETS.UNIVERSE, out);
  console.log('[M2] UNIVERSE built. Rows: ' + out.length + ', Top-K: ' + activeK);
}

/* ── SPS formula ── */

function M2__computeSps_(ctx) {
  var ind = ctx.ind;

  /* Volatility (0-30) */
  var volScore = M2__linear_(ind.atr4HPct, 0.01, 0.05, 0, 15)
               + M2__linear_(ind.atr1DPct, 0.01, 0.05, 0, 15);

  /* Compression (0-25, inverted: low ratio = high score) */
  var comp = M2__linear_(ind.atrRatio, 0.5, 1.0, 25, 0);
  if (ind.bbSqueeze) comp = Math.min(25, comp + 5);

  /* Liquidity (0-25, percentile) */
  var liq = M2__percentileScore_(ctx.volZar, ctx.sortedVols, 25);

  /* Clean-data bonus (0-20) */
  var clean = 0;
  if (ind.obvSlope20 > 0)   clean += 7;
  if (ind.dataReliable)     clean += 7;
  if (ind.gapFreq30d < 0.05) clean += 6;

  /* Penalties */
  var penalty = 0, fp = false;
  if (ctx.marketType === 'PERP' && ctx.funding8h !== null) {
    var daily = Math.abs(ctx.funding8h) * 3;
    if (daily > (ctx.maxFunding * 3)) { penalty += 15; fp = true; }
  }
  if (ind.borrowRateDay > ctx.maxBorrow) penalty += 10;
  if (ind.missingCandles30d > 3)         penalty += 20;
  if (ctx.volZar < ctx.minVolZar * 2)    penalty += 10;
  if (ind.avgWick30d > M2_CONST.WICKINESS_PENALTY_THRESHOLD) penalty += 10;

  var sps = Math.max(0, Math.round(volScore + comp + liq + clean - penalty));
  return { sps: sps, fundingPenaltyApplied: fp };
}

/* ── Indicator builder (bulk, from all DATA_CLEAN rows) ── */

function M2__buildAllIndicators_(cleanAll) {
  var cm   = M2_COL.DATA_CLEAN;
  var nowMs = Date.now(), ms30d = 30 * 24 * 60 * 60 * 1000;
  var b4 = {}, b1 = {}, out = {};

  for (var i = 1; i < cleanAll.length; i++) {
    var r  = cleanAll[i];
    var sym = r[cm.Symbol], tf = r[cm.Timeframe];
    if (tf === '4H') { if (!b4[sym]) b4[sym] = []; b4[sym].push(r); }
    if (tf === '1D') { if (!b1[sym]) b1[sym] = []; b1[sym].push(r); }
  }

  var syms = Object.keys(b4);
  for (var s = 0; s < syms.length; s++) {
    var symb = syms[s];

    var c4 = (b4[symb] || []).slice().sort(function(a, b) {
      return new Date(a[cm.Timestamp]) - new Date(b[cm.Timestamp]);
    });
    var c1 = (b1[symb] || []).slice().sort(function(a, b) {
      return new Date(a[cm.Timestamp]) - new Date(b[cm.Timestamp]);
    });

    var ng4 = c4.filter(function(x) { return x[cm.Gap_Flag] !== true; });
    var ng1 = c1.filter(function(x) { return x[cm.Gap_Flag] !== true; });

    var atr4   = M2__calcAtr14_(ng4, cm);
    var close4 = ng4.length ? (parseFloat(ng4[ng4.length - 1][cm.Close]) || 1) : 1;
    var atr1   = M2__calcAtr14_(ng1, cm);
    var close1 = ng1.length ? (parseFloat(ng1[ng1.length - 1][cm.Close]) || 1) : 1;

    var cutoff30 = nowMs - ms30d;
    var all30 = c4.filter(function(x) {
      return new Date(x[cm.Timestamp]).getTime() >= cutoff30;
    });
    var gapCount = all30.filter(function(x) { return x[cm.Gap_Flag] === true; }).length;
    var total    = Math.max(all30.length, 1);
    var ng30     = all30.filter(function(x) { return x[cm.Gap_Flag] !== true; });
    var wickSum  = 0;
    for (var w = 0; w < ng30.length; w++)
      wickSum += parseFloat(ng30[w][cm.Wick_To_Body_Ratio] || '0');

    out[symb] = {
      atr4HPct       : close4 > 0 ? atr4 / close4 : 0,
      atr1DPct       : close1 > 0 ? atr1 / close1 : 0,
      atrRatio       : M2__calcAtrRatio_(ng4, cm),
      bbSqueeze      : M2__calcBbSqueeze_(ng4, cm),
      obvSlope20     : M2__calcObvSlope20_(ng4, cm),
      dataReliable   : M2__calcDataReliable_(c4, cm),
      gapFreq30d     : gapCount / total,
      missingCandles30d : gapCount,
      avgWick30d     : ng30.length ? (wickSum / ng30.length) : 0,
      borrowRateDay  : 0
    };
  }
  return out;
}

function M2__emptyIndicators_() {
  return {
    atr4HPct: 0, atr1DPct: 0, atrRatio: 1.0, bbSqueeze: false,
    obvSlope20: 0, dataReliable: false, gapFreq30d: 1.0,
    missingCandles30d: 999, avgWick30d: 999, borrowRateDay: 0
  };
}

/* ── Technical indicator primitives ── */

function M2__calcAtr14_(candles, cm) {
  var p = M2_CONST.ATR_PERIOD;
  if (candles.length < p + 1) return 0;
  var tr = [];
  for (var i = 1; i < candles.length; i++) {
    var h  = parseFloat(candles[i][cm.High]);
    var l  = parseFloat(candles[i][cm.Low]);
    var pc = parseFloat(candles[i - 1][cm.Close]);
    tr.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
  }
  var atr = 0;
  for (var j = 0; j < p; j++) atr += tr[j];
  atr /= p;
  for (var k = p; k < tr.length; k++)
    atr = (atr * (p - 1) + tr[k]) / p;          /* Wilder smooth */
  return atr;
}

function M2__calcAtrRatio_(candles, cm) {
  if (candles.length < 45) return 1.0;
  var atrRecent = M2__calcAtr14_(candles.slice(-15), cm);
  var lagEnd    = candles.length - 30;
  var lagSlice  = candles.slice(Math.max(0, lagEnd - 15), lagEnd);
  var atrLag    = M2__calcAtr14_(lagSlice, cm);
  if (!atrLag) return 1.0;
  return atrRecent / atrLag;
}

function M2__calcBbSqueeze_(candles, cm) {
  var p = M2_CONST.BB_PERIOD;
  if (candles.length < p + 1) return false;
  var widths = [];
  var start  = Math.max(p, candles.length - M2_CONST.BB_SQUEEZE_LOOKBACK);

  for (var i = start; i < candles.length; i++) {
    var slice = candles.slice(i - p, i);
    if (slice.length < p) continue;
    var closes = slice.map(function(c) { return parseFloat(c[cm.Close]); });
    var mean   = closes.reduce(function(a, b) { return a + b; }, 0) / p;
    var variance = closes.reduce(function(a, v) {
      return a + Math.pow(v - mean, 2);
    }, 0) / p;
    var sd    = Math.sqrt(variance);
    var width = mean > 0 ? (4 * sd / mean) : 0;   /* (upper-lower)/mean */
    widths.push(width);
  }

  if (widths.length < 10) return false;
  var current = widths[widths.length - 1];
  var sorted  = widths.slice().sort(function(a, b) { return a - b; });
  var p10     = sorted[Math.floor(sorted.length * M2_CONST.BB_SQUEEZE_PERCENTILE)];
  return current <= p10;
}

function M2__calcObvSlope20_(candles, cm) {
  var lb = M2_CONST.OBV_SLOPE_LOOKBACK;
  if (candles.length < lb + 1) return 0;
  var slice = candles.slice(-(lb + 1));
  var obv   = [0];

  for (var i = 1; i < slice.length; i++) {
    var c  = parseFloat(slice[i][cm.Close]);
    var pc = parseFloat(slice[i - 1][cm.Close]);
    var v  = parseFloat(slice[i][cm.Volume]);
    if      (c > pc) obv.push(obv[obv.length - 1] + v);
    else if (c < pc) obv.push(obv[obv.length - 1] - v);
    else             obv.push(obv[obv.length - 1]);
  }

  /* Least-squares slope */
  var n = obv.length, sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (var j = 0; j < n; j++) {
    sumX += j; sumY += obv[j]; sumXY += j * obv[j]; sumX2 += j * j;
  }
  var d = n * sumX2 - sumX * sumX;
  return d === 0 ? 0 : ((n * sumXY - sumX * sumY) / d);
}

function M2__calcDataReliable_(sortedCandles, cm) {
  var c = 0;
  for (var i = 0; i < sortedCandles.length; i++) {
    if (sortedCandles[i][cm.Gap_Flag] === true) {
      c++;
      if (c > M2_CONST.MAX_CONSECUTIVE_GAPS) return false;
    } else {
      c = 0;
    }
  }
  return true;
}

/* ── Helpers ── */

function M2__getInstSurvivors_(instData) {
  var c = M2_COL.INSTRUMENTS, out = [];
  for (var i = 1; i < instData.length; i++) {
    if (instData[i][c.Hard_Filter_Pass] === true) out.push(instData[i]);
  }
  return out;
}

function M2__buildInstIndex_(instData) {
  var c = M2_COL.INSTRUMENTS, idx = {};
  for (var i = 1; i < instData.length; i++)
    idx[instData[i][c.Symbol]] = i;
  return idx;
}

function M2__sectorTag_(sym) {
  var base = sym.split('/')[0].toUpperCase();
  var map  = {
    BTC:'BTC_Ecosystem', ETH:'ETH_Ecosystem',
    SOL:'SOL_Ecosystem', JUP:'SOL_Ecosystem', W:'SOL_Ecosystem', BOME:'SOL_Ecosystem',
    DOGE:'Meme', SHIB:'Meme', WIF:'Meme', FARTCOIN:'Meme', TRUMP:'Meme',
    NEIRO:'Meme', PENGU:'Meme', '1000PEPE':'Meme', POPCAT:'Meme',
    LINK:'DeFi', PYTH:'DeFi', ZRO:'DeFi', ORDER:'DeFi',
    AVAX:'L1', ADA:'L1', XRP:'L1', XLM:'L1', TRX:'L1', BNB:'L1', LTC:'L1', S:'L1',
    XAUT:'Other', WLFI:'Other', PUMP:'Other'
  };
  return map[base] || 'Other';
}



/* ═══════════════════════════════════════════════════════════════
   M2_DataPipeline.gs  —  Candle fetch, RAW→CLEAN, gap/stale
   ═══════════════════════════════════════════════════════════════ */

/* ── Exported ── */

function M2_fetchTopKCandlesIncremental() {
  var usdtZar = M2_getUsdtZarRate();
  var fetchTs = M2__nowIso_();
  var topK = M2__getTopKSymbols_();

  if (topK.length === 0) {
    console.log('[M2] No Top-K symbols — skipping incremental fetch.');
    return;
  }

  var persistAuditRaw = true;
  var maxAuditAppendPerRun = 200;
  var rawAudit = [];
  var stateMap = {};

  console.log('[M2] ═══════════════════════════════════════');
  console.log('[M2] Incremental Canonical Update Starting');
  console.log('[M2] Top-K symbols: ' + topK.length);
  console.log('[M2] ═══════════════════════════════════════');

  for (var i = 0; i < topK.length; i++) {
    var sym = topK[i].sym;
    var mkt = topK[i].mktType;

    console.log('[M2] Incremental fetch ' + sym + ' (' + (i + 1) + '/' + topK.length + ')...');

    try {
      var candles = M2__fetchNativeMinuteBuckets_(sym, 200);

      // In-memory canonical 4H/1D build
      M2__accumulateNativeMinuteIntoStates_(stateMap, candles, sym, mkt, usdtZar, fetchTs);

      // Keep a tiny audit sample only
      if (persistAuditRaw && rawAudit.length < maxAuditAppendPerRun) {
        var sample = M2__sampleRecentNativeRowsForAudit_(candles, sym, mkt, usdtZar, fetchTs, 5);
        for (var s = 0; s < sample.length && rawAudit.length < maxAuditAppendPerRun; s++) {
          rawAudit.push(sample[s]);
        }
      }

      console.log('[M2]   → native fetched=' + candles.length);
    } catch (e) {
      console.log('[M2]   → SKIP: ' + e.message);
    }

    Utilities.sleep(1000);
  }

  var incrementalClean = M2__stateMapsToCanonicalCleanRows_(stateMap);
  if (!incrementalClean.length) {
    console.log('[M2] No canonical rows produced during incremental run.');
    return;
  }

  var existingClean = M2__readAll_(M2_CONST.SHEETS.DATA_CLEAN);
  var cm = M2_COL.DATA_CLEAN;
  var mergedClean = M2__mergeAndDedup_(existingClean, incrementalClean, cm);

  mergedClean.sort(function(a, b) {
    var s = String(a[cm.Symbol]).localeCompare(String(b[cm.Symbol]));
    if (s) return s;
    var t = String(a[cm.Timeframe]).localeCompare(String(b[cm.Timeframe]));
    if (t) return t;
    return new Date(a[cm.Timestamp]).getTime() - new Date(b[cm.Timestamp]).getTime();
  });

  M2__validateCleanTimeframeIntegrity_(mergedClean, cm);

  var withGaps = M2__insertGapRows_(mergedClean, cm);
  var withStale = M2__recomputeStaleFlags_(withGaps, cm);

  M2__clearDataRows_(M2_CONST.SHEETS.DATA_CLEAN);
  M2__writeFromRow2_(M2_CONST.SHEETS.DATA_CLEAN, withStale);

  if (persistAuditRaw && rawAudit.length) {
    M2__appendRows_(M2_CONST.SHEETS.DATA_RAW, rawAudit);
  }

  M2__updateUniverseReliability_(withStale);

  try {
    M1_cfgSet('Last_Data_Fetch_Timestamp', fetchTs, 'M2_fetchTopKCandlesIncremental', false);
  } catch (e2) {}

  console.log('[M2] ═══════════════════════════════════════');
  console.log('[M2] Incremental Canonical Update Complete');
  console.log('[M2] Canonical rows merged: ' + incrementalClean.length);
  console.log('[M2] DATA_CLEAN rows now: ' + withStale.length);
  console.log('[M2] DATA_RAW audit rows appended: ' + rawAudit.length);
  console.log('[M2] ═══════════════════════════════════════');
}

function M2_fetchDailyCloseCandles() {
  console.log('[M2] Daily close fetch delegated to canonical incremental update.');
  M2_fetchTopKCandlesIncremental();
}

function M2_requireDataFreshness() {
  var last = M1_cfgGetStr('Last_Data_Fetch_Timestamp');
  if (!last) throw new Error('[M2] STALE_DATA: No fetch timestamp recorded.');
  var age    = Date.now() - new Date(last).getTime();
  var maxAge = M2_CONST.STALE_PERIODS * M2_CONST.PERIOD_MS['4H'];
  if (age > maxAge)
    throw new Error('[M2] STALE_DATA: Last fetch ' +
                    Math.round(age / 60000) + ' min ago exceeds limit.');
}

/* ── Candle fetch with endpoint fallback ── */
function M2__fetchCandlesFromValr_(sym, tf, limit) {
  return M2__fetchNativeMinuteBuckets_(sym, limit);
}

function M2__fetchNativeMinuteBuckets_(sym, limit) {
  var slug = sym.replace('/', '').toUpperCase();
  var cappedLimit = Math.min(limit || 200, 200);

  var url = '/v1/public/' + slug + '/buckets?limit=' + cappedLimit;
  var r = M2_valrPublicGet(url);

  var candles = [];
  if (Array.isArray(r)) candles = r;
  else if (r && Array.isArray(r.candles)) candles = r.candles;
  else if (r && Array.isArray(r.items)) candles = r.items;
  else throw new Error('[M2] Invalid native bucket payload for ' + sym);

  if (!candles.length) return [];

  var bucketSec = M2__inferBucketPeriodSeconds_(candles);
  if (bucketSec !== 60) {
    throw new Error('[M2] Expected native 60s buckets for ' + sym + ', got ' + bucketSec + ' seconds.');
  }

  return candles;
}

function M2__groupRawBySymbol_(rows, cSym) {
  var out = {};
  for (var i = 0; i < rows.length; i++) {
    var sym = String(rows[i][cSym] || '').trim();
    if (!sym) continue;
    if (!out[sym]) out[sym] = [];
    out[sym].push(rows[i]);
  }
  return out;
}


function M2__aggregateRowsToTimeframe_(rows, tf) {
  if (!rows || !rows.length) return [];

  var cr = M2_COL.DATA_RAW;
  var stepMs = M2_CONST.PERIOD_MS[tf];
  var buckets = {};

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];

    var ts = new Date(r[cr.Timestamp]).getTime();
    if (!isFinite(ts)) continue;

    var bucketMs = M2__bucketStartMs_(ts, tf);
    if (!isFinite(bucketMs)) continue;

    var key = String(bucketMs);

    var o = parseFloat(r[cr.Open]) || 0;
    var h = parseFloat(r[cr.High]) || 0;
    var l = parseFloat(r[cr.Low]) || 0;
    var c = parseFloat(r[cr.Close]) || 0;
    var v = parseFloat(r[cr.Volume]) || 0;
    var vq = parseFloat(r[cr.Volume_Quote]) || 0;
    var vz = parseFloat(r[cr.Volume_ZAR]) || 0;

    if (!(o > 0 && h > 0 && l > 0 && c > 0)) continue;

    if (!buckets[key]) {
      buckets[key] = {
        bucketMs: bucketMs,
        symbol: r[cr.Symbol],
        marketType: r[cr.Market_Type],
        timeframe: tf,
        open: o,
        high: h,
        low: l,
        close: c,
        volume: v,
        volumeQuote: vq,
        volumeZar: vz,
        fx: r[cr.USDT_ZAR_Rate_At_Fetch],
        source: r[cr.Source],
        fetchTs: r[cr.Fetch_Timestamp],
        firstTs: ts,
        lastTs: ts
      };
    } else {
      var b = buckets[key];

      if (ts < b.firstTs) {
        b.firstTs = ts;
        b.open = o;
      }
      if (ts > b.lastTs) {
        b.lastTs = ts;
        b.close = c;
      }

      if (h > b.high) b.high = h;
      if (l < b.low) b.low = l;

      b.volume += v;
      b.volumeQuote += vq;
      b.volumeZar += vz;

      if (ts >= b.lastTs) {
        b.fx = r[cr.USDT_ZAR_Rate_At_Fetch];
        b.fetchTs = r[cr.Fetch_Timestamp];
      }
    }
  }

  var keys = Object.keys(buckets).sort();
  var out = [];

  for (var j = 0; j < keys.length; j++) {
    var x = buckets[keys[j]];
    out.push([
      new Date(x.bucketMs).toISOString(),
      x.symbol,
      x.marketType,
      x.timeframe,
      x.open,
      x.high,
      x.low,
      x.close,
      x.volume,
      x.volumeQuote,
      x.volumeZar,
      x.fx,
      x.source,
      x.fetchTs
    ]);
  }

  return out;
}


function M2__buildCanonicalCleanRows_(rawRows) {
  var cr = M2_COL.DATA_RAW;
  var bySym = M2__groupRawBySymbol_(rawRows, cr.Symbol);
  var all = [];

  for (var sym in bySym) if (bySym.hasOwnProperty(sym)) {
    var rows = bySym[sym].slice().sort(function(a, b) {
      return new Date(a[cr.Timestamp]).getTime() - new Date(b[cr.Timestamp]).getTime();
    });

    var agg4h = M2__aggregateRowsToTimeframe_(rows, '4H');
    var agg1d = M2__aggregateRowsToTimeframe_(rows, '1D');

    all = all.concat(agg4h).concat(agg1d);
  }

  return M2__rawRowsToCleanRows_(all);
}

function M2__inferBucketPeriodSeconds_(candles) {
  if (!candles || !candles.length) return 0;

  var c0 = candles[0];
  if (c0.bucketPeriodInSeconds !== undefined && c0.bucketPeriodInSeconds !== null) {
    var direct = parseInt(c0.bucketPeriodInSeconds, 10);
    if (isFinite(direct) && direct > 0) return direct;
  }

  var times = [];
  for (var i = 0; i < candles.length; i++) {
    var c = candles[i];
    var ms = new Date(c.startTime || c.openTime || c.timestamp || c.time || c.date || '').getTime();
    if (isFinite(ms)) times.push(ms);
  }

  if (times.length < 2) return 0;
  times.sort(function(a, b) { return a - b; });

  var counts = {};
  var bestStep = 0;
  var bestCount = 0;

  for (i = 1; i < times.length; i++) {
    var d = times[i] - times[i - 1];
    if (!isFinite(d) || d <= 0) continue;
    counts[d] = (counts[d] || 0) + 1;
    if (counts[d] > bestCount) {
      bestCount = counts[d];
      bestStep = d;
    }
  }

  return bestStep > 0 ? Math.round(bestStep / 1000) : 0;
}




function M2__validateFetchedCandleSpacing_(candles, tf, sym) {
  if (!candles || candles.length < 3) return;

  var expectedMs = M2_CONST.PERIOD_MS[tf] || 0;
  if (!expectedMs) return;

  var seen = {};
  var times = [];

  for (var i = 0; i < candles.length; i++) {
    var c = candles[i];
    var tsNorm = M2__normaliseCandleTimestamp_(
      c.startTime || c.openTime || c.timestamp || c.time || '',
      tf
    );
    if (!tsNorm) continue;

    var ms = new Date(tsNorm).getTime();
    if (!isFinite(ms)) continue;

    if (!seen[ms]) {
      seen[ms] = true;
      times.push(ms);
    }
  }

  if (times.length < 3) return;
  times.sort(function(a, b) { return a - b; });

  var bad = 0, checked = 0;
  for (i = 1; i < times.length; i++) {
    var d = times[i] - times[i - 1];
    checked++;
    if (Math.abs(d - expectedMs) > 0.01 * expectedMs) bad++;
  }

  if (checked > 0 && bad / checked > 0.2) {
    throw new Error('[M2] Invalid normalized candle spacing from VALR for ' +
                    sym + ' ' + tf + '. Expected exact bucket spacing of ' +
                    expectedMs + ' ms.');
  }
}



/* ── Raw row builder ── */
function M2__buildRawRows_(candles, sym, mktType, tf, usdtZar, fetchTs) {
  var out = [];
  var isUsdt = M2__isUsdtQuoted_(sym);
  var byKey = {};

  for (var i = 0; i < candles.length; i++) {
    var c = candles[i];

    var tsRaw = M2__extractCandleTimestampRaw_(c);
    var tsIso = M2__toIsoUtc_(tsRaw);
    if (!tsIso) {
      Logger.log('[M2][WARN] Missing/invalid candle timestamp for ' + sym + ' ' + tf + ': ' + JSON.stringify(c));
      continue;
    }

    var tsNorm = M2__normaliseCandleTimestamp_(tsIso, tf);
    if (!tsNorm) {
      Logger.log('[M2][WARN] Failed to normalize candle timestamp for ' + sym + ' ' + tf + ': raw=' + tsRaw + ' iso=' + tsIso);
      continue;
    }

    var o = parseFloat(c.open || c.openPrice || '0');
    var h = parseFloat(c.high || c.highPrice || '0');
    var l = parseFloat(c.low || c.lowPrice || '0');
    var cl = parseFloat(c.close || c.closePrice || '0');
    var v = parseFloat(c.volume || c.baseVolume || '0');

    if (!(o > 0 && h > 0 && l > 0 && cl > 0)) continue;

    var vq = v * cl;
    var vz = isUsdt ? vq * usdtZar : vq;

    var row = [
      tsNorm, sym, mktType, tf, o, h, l, cl, v, vq, vz,
      isUsdt ? usdtZar : '', M2_CONST.SOURCE, fetchTs
    ];

    var key = sym + '|||' + tf + '|||' + tsNorm;

    // If same bucket appears multiple times, prefer the richer candle
    if (!byKey[key]) {
      byKey[key] = row;
    } else {
      var prev = byKey[key];
      var prevVol = parseFloat(prev[8] || 0);
      if (v > prevVol) byKey[key] = row;
    }
  }

  var keys = Object.keys(byKey);
  for (var j = 0; j < keys.length; j++) out.push(byKey[keys[j]]);

  out.sort(function(a, b) {
    return new Date(a[0]).getTime() - new Date(b[0]).getTime();
  });

  Logger.log('[M2][BUILD] ' + sym + ' ' + tf + ': fetched=' + candles.length + ' built=' + out.length);

  return out;
}

/* ── RAW → CLEAN pipeline ── */
function M2__processRawToClean_(newRawRows) {
  var cm = M2_COL.DATA_CLEAN;

  var existing = M2__readAll_(M2_CONST.SHEETS.DATA_RAW);
  var allRaw = [];

  if (existing.length > 1) {
    for (var i = 1; i < existing.length; i++) allRaw.push(existing[i]);
  }
  for (var j = 0; j < newRawRows.length; j++) allRaw.push(newRawRows[j]);

  var rawMerged = M2__mergeAndDedup_( [['hdr']], allRaw, M2_COL.DATA_RAW );

  var canonicalClean = M2__buildCanonicalCleanRows_(rawMerged);

  canonicalClean.sort(function(a, b) {
    var s = String(a[cm.Symbol]).localeCompare(String(b[cm.Symbol]));
    if (s) return s;
    var t = String(a[cm.Timeframe]).localeCompare(String(b[cm.Timeframe]));
    if (t) return t;
    return new Date(a[cm.Timestamp]).getTime() - new Date(b[cm.Timestamp]).getTime();
  });

  M2__validateCleanTimeframeIntegrity_(canonicalClean, cm);

  var withGaps = M2__insertGapRows_(canonicalClean, cm);
  var withStale = M2__recomputeStaleFlags_(withGaps, cm);

  M2__clearDataRows_(M2_CONST.SHEETS.DATA_CLEAN);
  M2__writeFromRow2_(M2_CONST.SHEETS.DATA_CLEAN, withStale);

  M2__updateUniverseReliability_(withStale);
}

function M2__validateCleanTimeframeIntegrity_(rows, cm) {
  var groups = {};
  var expected = {
    '4H': 4 * 60 * 60 * 1000,
    '1D': 24 * 60 * 60 * 1000
  };

  for (var i = 0; i < rows.length; i++) {
    var sym = String(rows[i][cm.Symbol] || '');
    var tf = String(rows[i][cm.Timeframe] || '');
    if (!expected[tf]) continue;

    var key = sym + '|' + tf;
    if (!groups[key]) groups[key] = [];
    groups[key].push(new Date(rows[i][cm.Timestamp]).getTime());
  }

  for (var k in groups) if (groups.hasOwnProperty(k)) {
    var arr = groups[k].sort(function(a, b) { return a - b; });
    if (arr.length < 3) continue;

    var exp = expected[k.split('|')[1]];
    var bad = 0, checked = 0;

    for (var j = 1; j < arr.length; j++) {
      var d = arr[j] - arr[j - 1];
      checked++;
      if (Math.abs(d - exp) > 0.2 * exp) bad++;
    }

    if (checked > 0 && bad / checked > 0.2) {
      throw new Error('[M2] DATA_CLEAN integrity failure for ' + k +
                      '. Rows tagged as timeframe are not properly spaced.');
    }
  }
}

function M2__rawRowsToCleanRows_(rawRows) {
  var cr = M2_COL.DATA_RAW, out = [];
  for (var i = 0; i < rawRows.length; i++) {
    var r = rawRows[i];
    var o = parseFloat(r[cr.Open])  || 0;
    var h = parseFloat(r[cr.High])  || 0;
    var l = parseFloat(r[cr.Low])   || 0;
    var c = parseFloat(r[cr.Close]) || 0;
    var body = Math.abs(c - o);
    var wick = body > 0 ? (h - l) / body : 0;

    out.push([
      M2__toIsoUtc_(r[cr.Timestamp]),
      r[cr.Symbol], r[cr.Market_Type], r[cr.Timeframe],
      o, h, l, c,
      r[cr.Volume], r[cr.Volume_Quote], r[cr.Volume_ZAR],
      r[cr.USDT_ZAR_Rate_At_Fetch],
      r[cr.Source], r[cr.Fetch_Timestamp],
      false,   /* Gap_Flag       */
      false,   /* Stale_Flag     */
      wick     /* Wick_To_Body   */
    ]);
  }
  return out;
}

/* ── Merge + dedup (keeps newer fetch_timestamp on collision) ── */

function M2__mergeAndDedup_(existing, newRows, cm) {
  var best = {};

  for (var i = 1; i < existing.length; i++) {
    var e = existing[i];
    best[M2__cleanKey_(e[cm.Symbol], e[cm.Timeframe], e[cm.Timestamp])] = e;
  }

  for (var j = 0; j < newRows.length; j++) {
    var n   = newRows[j];
    var k   = M2__cleanKey_(n[cm.Symbol], n[cm.Timeframe], n[cm.Timestamp]);
    var prev = best[k];
    if (!prev) { best[k] = n; continue; }
    var pft = new Date(prev[cm.Fetch_Timestamp]).getTime();
    var nft = new Date(n[cm.Fetch_Timestamp]).getTime();
    if (nft >= pft) best[k] = n;
  }

  /* Rhino-safe: avoid Object.values */
  var keys = Object.keys(best), result = [];
  for (var r = 0; r < keys.length; r++) result.push(best[keys[r]]);
  return result;
}

/* ── Gap-row insertion ── */
function M2__insertGapRows_(sorted, cm) {
  var out = [];
  var nowIso = M2__nowIso_();
  var seenGaps = {};

  for (var g = 0; g < sorted.length; g++) {
    if (sorted[g][cm.Gap_Flag] === true) {
      seenGaps[M2__cleanKey_(sorted[g][cm.Symbol], sorted[g][cm.Timeframe], sorted[g][cm.Timestamp])] = true;
    }
  }

  for (var x = 0; x < sorted.length; x++) {
    var cur = sorted[x];
    out.push(cur);

    if (x + 1 >= sorted.length) continue;

    var next = sorted[x + 1];
    if (cur[cm.Symbol] !== next[cm.Symbol] || cur[cm.Timeframe] !== next[cm.Timeframe]) continue;
    if (cur[cm.Gap_Flag] === true || next[cm.Gap_Flag] === true) continue;

    var tf = cur[cm.Timeframe];
    var step = M2_CONST.PERIOD_MS[tf];
    if (!step) continue;

    var t0 = new Date(cur[cm.Timestamp]).getTime();
    var t1 = new Date(next[cm.Timestamp]).getTime();
    if (!isFinite(t0) || !isFinite(t1) || t1 <= t0) continue;

    var expectedNext = t0 + step;
    while (expectedNext < t1) {
      var ts = new Date(expectedNext).toISOString();
      var gk = M2__cleanKey_(cur[cm.Symbol], tf, ts);

      if (!seenGaps[gk]) {
        seenGaps[gk] = true;
        out.push([
          ts, cur[cm.Symbol], cur[cm.Market_Type], tf,
          '', '', '', '', '', '', '', '',
          M2_CONST.SOURCE, nowIso,
          true,
          false,
          ''
        ]);
      }

      expectedNext += step;
    }
  }

  out.sort(function(a, b) {
    var s = String(a[cm.Symbol]).localeCompare(String(b[cm.Symbol]));
    if (s) return s;
    var t = String(a[cm.Timeframe]).localeCompare(String(b[cm.Timeframe]));
    if (t) return t;
    return new Date(a[cm.Timestamp]).getTime() - new Date(b[cm.Timestamp]).getTime();
  });

  return out;
}


/* ── Stale-flag recomputation (only the latest real candle) ── */

function M2__recomputeStaleFlags_(rows, cm) {
  /* Pass 1: reset all, find latest non-gap candle per sym+tf */
  var latest = {};
  for (var i = 0; i < rows.length; i++) {
    rows[i][cm.Stale_Flag] = false;
    if (rows[i][cm.Gap_Flag] === true) continue;

    var k  = rows[i][cm.Symbol] + '|||' + rows[i][cm.Timeframe];
    var ts = new Date(rows[i][cm.Timestamp]).getTime();
    if (!latest[k] || ts > latest[k].ts)
      latest[k] = { idx: i, ts: ts };
  }

  /* Pass 2: mark stale if latest candle is too old */
  var now  = Date.now();
  var keys = Object.keys(latest);
  for (var j = 0; j < keys.length; j++) {
    var obj  = latest[keys[j]];
    var tf   = rows[obj.idx][cm.Timeframe];
    var step = M2_CONST.PERIOD_MS[tf] || M2_CONST.PERIOD_MS['4H'];
    if (now - obj.ts > M2_CONST.STALE_PERIODS * step)
      rows[obj.idx][cm.Stale_Flag] = true;
  }
  return rows;
}

/* ── UNIVERSE reliability patch-back ── */

function M2__updateUniverseReliability_(cleanRows) {
  var cm   = M2_COL.DATA_CLEAN;
  var nowMs = Date.now(), ms30d = 30 * 24 * 60 * 60 * 1000;
  var stats = {};

  for (var i = 0; i < cleanRows.length; i++) {
    var r = cleanRows[i];
    if (r[cm.Timeframe] !== '4H') continue;
    var sym = r[cm.Symbol];
    var ts  = new Date(r[cm.Timestamp]).getTime();
    var gap = (r[cm.Gap_Flag] === true);

    if (!stats[sym]) stats[sym] = {
      gap30d: 0, total30d: 0, consec: 0, consecMax: 0
    };

    if (ts >= (nowMs - ms30d)) {
      stats[sym].total30d++;
      if (gap) stats[sym].gap30d++;
    }

    if (gap) {
      stats[sym].consec++;
      if (stats[sym].consec > stats[sym].consecMax)
        stats[sym].consecMax = stats[sym].consec;
    } else {
      stats[sym].consec = 0;
    }
  }

  var sh = M2__ss_().getSheetByName(M2_CONST.SHEETS.UNIVERSE);
  if (!sh || sh.getLastRow() < 2) return;
  var data = sh.getDataRange().getValues();
  var uc   = M2_COL.UNIVERSE;
  var rel  = [], gf = [];

  for (var u = 1; u < data.length; u++) {
    var symb = data[u][uc.Symbol], st = stats[symb];
    rel.push([st ? (st.consecMax <= M2_CONST.MAX_CONSECUTIVE_GAPS) : false]);
    gf.push([st && st.total30d > 0 ? (st.gap30d / st.total30d) : 1]);
  }

  sh.getRange(2, uc.Data_Reliable    + 1, rel.length, 1).setValues(rel);
  sh.getRange(2, uc.Gap_Frequency_30d + 1, gf.length,  1).setValues(gf);
}

/* ── Stale alert (delegates to M7 if present) ── */

function M2__emitStaleAlert_(sym, tf, ts) {
  try {
    if (typeof M7_sendAlert === 'function')
      M7_sendAlert('STALE_DATA', 'CRITICAL',
                   '[M2] Stale candle: ' + sym + ' ' + tf + ' last=' + ts,
                   null, null);
  } catch (ignore) {}
}

/* ── Top-K reader ── */

function M2__getTopKSymbols_() {
  var data = M2__readAll_(M2_CONST.SHEETS.UNIVERSE);
  var uc   = M2_COL.UNIVERSE, out = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][uc.In_Top_K] === true)
      out.push({ sym: data[i][uc.Symbol], mktType: data[i][uc.Market_Type] });
  }
  return out;
}






function M2_auditRebuiltData() {
  var raw = M2__readAll_(M2_CONST.SHEETS.DATA_RAW);
  var clean = M2__readAll_(M2_CONST.SHEETS.DATA_CLEAN);

  Logger.log('[M2][AUDIT] DATA_RAW rows=' + Math.max(0, raw.length - 1));
  Logger.log('[M2][AUDIT] DATA_CLEAN rows=' + Math.max(0, clean.length - 1));

  if (clean.length > 1) {
    var cm = M2_COL.DATA_CLEAN;
    var counts = {};
    var minTs = {};
    var maxTs = {};

    for (var i = 1; i < clean.length; i++) {
      var sym = String(clean[i][cm.Symbol] || '');
      var tf = String(clean[i][cm.Timeframe] || '');
      var key = sym + '|' + tf;
      var ms = new Date(clean[i][cm.Timestamp]).getTime();

      if (!counts[key]) {
        counts[key] = 0;
        minTs[key] = ms;
        maxTs[key] = ms;
      }

      counts[key]++;
      if (ms < minTs[key]) minTs[key] = ms;
      if (ms > maxTs[key]) maxTs[key] = ms;
    }

    for (var k in counts) if (counts.hasOwnProperty(k)) {
      Logger.log('[M2][AUDIT] ' + k +
                 ' rows=' + counts[k] +
                 ' first=' + new Date(minTs[k]).toISOString() +
                 ' last=' + new Date(maxTs[k]).toISOString());
    }
  }
}
/* ═══════════════════════════════════════════════════════════════
   M2_FundingAndTests.gs  —  Funding settlement polling + 13 tests
   ═══════════════════════════════════════════════════════════════ */

/* ══════════════  Funding  ══════════════ */

function M2_pollAndLogFundingSettlements() {
  var openPerps = M2__getOpenPerpPositions_();
  if (openPerps.length === 0) return;

  var usdtZar       = M2_getUsdtZarRate();
  var fundSheet     = M2__sh_(M2_CONST.SHEETS.FUNDING_LOG);
  var alreadyLogged = M2__buildFundingLogIndex_(fundSheet);
  var newRows       = [];

  for (var i = 0; i < openPerps.length; i++) {
    var p        = openPerps[i];
    var sym      = p.sym;
    var side     = p.side;
    var posId    = p.positionId;
    var pairSlug = sym.replace('/', '').toUpperCase();

    /* Endpoint fallback: try all known VALR funding-history paths */
    var endpoints = [
      '/v1/account/futures/'     + pairSlug + '/funding/history?limit=50',
      '/v1/account/perpetual/'   + pairSlug + '/funding/history?limit=50',
      '/v1/account/derivatives/' + pairSlug + '/funding/history?limit=50'
    ];

    var events = null;
    for (var e = 0; e < endpoints.length; e++) {
      try {
        var res = M2_valrAuthGet(endpoints[e]);
        if (Array.isArray(res))            { events = res;       break; }
        if (res && Array.isArray(res.items)) { events = res.items; break; }
      } catch (ignore) {}
    }
    if (!events || !Array.isArray(events)) {
      console.warn('[M2] No funding history endpoint responded for ' + sym);
      continue;
    }

    for (var j = 0; j < events.length; j++) {
      var ev  = events[j];
      var ts  = M2__toIsoUtc_(ev.createdAt || ev.timestamp || ev.settlementTime || '');
      var key = sym + '|||' + ts;
      if (alreadyLogged[key]) continue;

      var rate  = parseFloat(ev.fundingRate || '0');
      var daily = rate * 3;

      /* Amount observability: warn if field missing (tax-event visibility) */
      var hasAmount = !(ev.amount === undefined && ev.fundingAmount === undefined);
      if (!hasAmount) {
        console.warn('[M2] Funding event missing amount for ' + sym +
                     ' @ ' + ts + ' — skipped for tax safety.');
        continue;
      }

      var signed = parseFloat(ev.amount !== undefined ? ev.amount : ev.fundingAmount);
      if (!isFinite(signed)) {
        console.warn('[M2] Funding amount non-numeric for ' + sym +
                     ' @ ' + ts + ' — skipped.');
        continue;
      }

      var dir    = signed >= 0 ? 'RECEIVED' : 'PAID';
      var absAmt = Math.abs(signed);
      var zarAmt = absAmt * usdtZar;

      newRows.push([ts, sym, rate, daily, side, dir, absAmt, zarAmt, usdtZar, posId]);
      alreadyLogged[key] = true;
    }
  }

  if (newRows.length) {
    M2__appendRows_(M2_CONST.SHEETS.FUNDING_LOG, newRows);
    console.log('[M2] Logged ' + newRows.length + ' new funding settlements.');
  }
}


function M2_getCanonicalHistoryStatus() {
  if (M2__useSupabaseCanonicalHistory_()) {
    var datasetId = M2__activeCanonicalDatasetId_();
    var sb = M2_sbGetCanonicalHistoryStatus_(datasetId);

    var result = {
      ready: sb.ready,
      dataset_id: datasetId,
      symbols: {},
      min4HRequired: 80,
      min1DRequired: 30,
      summary: {
        symbolsReady: 0,
        totalSymbols: 0
      }
    };

    var symMap = {};

    for (var i = 0; i < sb.rows.length; i++) {
      var r = sb.rows[i];
      var sym = String(r.symbol || '');
      if (!symMap[sym]) {
        symMap[sym] = {
          rows4H: 0,
          rows1D: 0,
          first4H: null,
          last4H: null,
          first1D: null,
          last1D: null,
          ready: false
        };
      }

      if (String(r.timeframe) === '4H') {
        symMap[sym].rows4H = parseInt(r.row_count, 10) || 0;
        symMap[sym].first4H = r.first_ts || null;
        symMap[sym].last4H = r.last_ts || null;
      } else if (String(r.timeframe) === '1D') {
        symMap[sym].rows1D = parseInt(r.row_count, 10) || 0;
        symMap[sym].first1D = r.first_ts || null;
        symMap[sym].last1D = r.last_ts || null;
      }
    }

    var keys = Object.keys(symMap);
    result.summary.totalSymbols = keys.length;

    for (var j = 0; j < keys.length; j++) {
      var k = keys[j];
      var st = symMap[k];
      st.ready = (st.rows4H >= result.min4HRequired && st.rows1D >= result.min1DRequired);
      result.symbols[k] = st;
      if (st.ready) result.summary.symbolsReady++;
    }

    result.ready = result.summary.symbolsReady > 0;
    return result;
  }

  // fallback: old sheet-based behavior
  var clean = M2__readAll_(M2_CONST.SHEETS.DATA_CLEAN);
  var result = {
    ready: false,
    symbols: {},
    min4HRequired: 80,
    min1DRequired: 30,
    summary: {
      symbolsReady: 0,
      totalSymbols: 0
    }
  };
  if (!clean || clean.length < 2) return result;
  var cm = M2_COL.DATA_CLEAN;
  for (var i = 1; i < clean.length; i++) {
    var row = clean[i];
    if (row[cm.Gap_Flag] === true) continue;
    var sym = String(row[cm.Symbol] || '').trim();
    var tf = String(row[cm.Timeframe] || '').trim();
    var ms = new Date(row[cm.Timestamp]).getTime();
    if (!sym || !isFinite(ms)) continue;
    if (!result.symbols[sym]) {
      result.symbols[sym] = {
        rows4H: 0,
        rows1D: 0,
        first4H: null,
        last4H: null,
        first1D: null,
        last1D: null,
        ready: false
      };
    }
    var s = result.symbols[sym];
    if (tf === '4H') {
      s.rows4H++;
      if (s.first4H === null || ms < s.first4H) s.first4H = ms;
      if (s.last4H === null || ms > s.last4H) s.last4H = ms;
    } else if (tf === '1D') {
      s.rows1D++;
      if (s.first1D === null || ms < s.first1D) s.first1D = ms;
      if (s.last1D === null || ms > s.last1D) s.last1D = ms;
    }
  }
  var syms = Object.keys(result.symbols);
  result.summary.totalSymbols = syms.length;
  for (var j = 0; j < syms.length; j++) {
    var symb = syms[j];
    var st2 = result.symbols[symb];
    st2.ready = (st2.rows4H >= result.min4HRequired && st2.rows1D >= result.min1DRequired);
    if (st2.ready) result.summary.symbolsReady++;
    if (st2.first4H !== null) st2.first4H = new Date(st2.first4H).toISOString();
    if (st2.last4H !== null) st2.last4H = new Date(st2.last4H).toISOString();
    if (st2.first1D !== null) st2.first1D = new Date(st2.first1D).toISOString();
    if (st2.last1D !== null) st2.last1D = new Date(st2.last1D).toISOString();
  }
  result.ready = result.summary.symbolsReady > 0;
  return result;
}


function M2_logCanonicalHistoryStatus() {
  var hs = M2_getCanonicalHistoryStatus();
  Logger.log('[M2][HISTORY] ready=' + hs.ready +
             ' symbolsReady=' + hs.summary.symbolsReady +
             '/' + hs.summary.totalSymbols +
             ' min4H=' + hs.min4HRequired +
             ' min1D=' + hs.min1DRequired);

  var syms = Object.keys(hs.symbols);
  for (var i = 0; i < syms.length; i++) {
    var sym = syms[i];
    var s = hs.symbols[sym];
    Logger.log('[M2][HISTORY] ' + sym +
               ' ready=' + s.ready +
               ' rows4H=' + s.rows4H +
               ' rows1D=' + s.rows1D +
               ' first4H=' + s.first4H +
               ' last4H=' + s.last4H +
               ' first1D=' + s.first1D +
               ' last1D=' + s.last1D);
  }
}


function M2_requireCanonicalHistoryForBacktest() {
  if (M2__useSupabaseCanonicalHistory_()) {
    var datasetId = M2__activeCanonicalDatasetId_();
    return M2_sbRequireCanonicalHistoryForBacktest_(datasetId);
  }

  var hs = M2_getCanonicalHistoryStatus();
  if (!hs || !hs.ready) {
    throw new Error('[M2] BACKTEST_BLOCKED: No symbol has sufficient canonical history yet.');
  }
  var readySyms = [];
  var allSyms = Object.keys(hs.symbols);
  for (var i = 0; i < allSyms.length; i++) {
    if (hs.symbols[allSyms[i]].ready) readySyms.push(allSyms[i]);
  }
  if (!readySyms.length) {
    throw new Error('[M2] BACKTEST_BLOCKED: Canonical history exists but does not meet minimum 4H/1D depth.');
  }
  return readySyms;
}


function RUN_M2_verifyCanonicalHistorySwitchNow() {
  var hs = M2_getCanonicalHistoryStatus();
  Logger.log('[RUN][M2][VERIFY] dataset=' + String(hs.dataset_id || '(sheet-based)'));
  Logger.log('[RUN][M2][VERIFY] ready=' + hs.ready);
  Logger.log('[RUN][M2][VERIFY] symbolsReady=' + hs.summary.symbolsReady + '/' + hs.summary.totalSymbols);

  var ready = M2_requireCanonicalHistoryForBacktest();
  Logger.log('[RUN][M2][VERIFY] ready symbols: ' + JSON.stringify(ready));
}




function M2__bucketStartMs_(ms, tf) {
  if (!isFinite(ms)) return NaN;
  var step = M2_CONST.PERIOD_MS[tf];
  if (!step) return ms;
  return Math.floor(ms / step) * step;
}




function M2__accumulateNativeMinuteIntoStates_(stateMap, candles, sym, mktType, usdtZar, fetchTs) {
  if (!stateMap[sym]) {
    stateMap[sym] = { '4H': {}, '1D': {} };
  }

  for (var i = 0; i < candles.length; i++) {
    var c = candles[i];

    var tsIso = M2__toIsoUtc_(c.startTime || c.openTime || c.timestamp || c.time || c.date || '');
    if (!tsIso) continue;

    var tsMs = new Date(tsIso).getTime();
    if (!isFinite(tsMs)) continue;

    var o = parseFloat(c.open || c.openPrice || '0');
    var h = parseFloat(c.high || c.highPrice || '0');
    var l = parseFloat(c.low || c.lowPrice || '0');
    var cl = parseFloat(c.close || c.closePrice || '0');
    var v = parseFloat(c.volume || c.baseVolume || '0');
    if (!(o > 0 && h > 0 && l > 0 && cl > 0)) continue;

    var isUsdt = M2__isUsdtQuoted_(sym);
    var vq = v * cl;
    var vz = isUsdt ? (vq * usdtZar) : vq;
    var fx = isUsdt ? usdtZar : '';

    M2__accumulateOneTfState_(stateMap[sym]['4H'], tsMs, '4H', sym, mktType, o, h, l, cl, v, vq, vz, fx, fetchTs);
    M2__accumulateOneTfState_(stateMap[sym]['1D'], tsMs, '1D', sym, mktType, o, h, l, cl, v, vq, vz, fx, fetchTs);
  }
}


function M2__accumulateOneTfState_(bucketMap, tsMs, tf, sym, mktType, o, h, l, cl, v, vq, vz, fx, fetchTs) {
  var bucketMs = M2__bucketStartMs_(tsMs, tf);
  if (!isFinite(bucketMs)) return;

  var key = String(bucketMs);
  var b = bucketMap[key];

  if (!b) {
    bucketMap[key] = {
      bucketMs: bucketMs,
      sym: sym,
      mktType: mktType,
      tf: tf,
      open: o,
      high: h,
      low: l,
      close: cl,
      volume: v,
      volumeQuote: vq,
      volumeZar: vz,
      fx: fx,
      fetchTs: fetchTs,
      firstTs: tsMs,
      lastTs: tsMs
    };
    return;
  }

  if (tsMs < b.firstTs) {
    b.firstTs = tsMs;
    b.open = o;
  }
  if (tsMs > b.lastTs) {
    b.lastTs = tsMs;
    b.close = cl;
    b.fx = fx;
    b.fetchTs = fetchTs;
  }

  if (h > b.high) b.high = h;
  if (l < b.low) b.low = l;

  b.volume += v;
  b.volumeQuote += vq;
  b.volumeZar += vz;
}


function M2__stateMapsToCanonicalCleanRows_(stateMap) {
  var rows = [];
  var cmLen = 17;

  for (var sym in stateMap) if (stateMap.hasOwnProperty(sym)) {
    var tfMaps = stateMap[sym];

    var tfs = ['4H', '1D'];
    for (var t = 0; t < tfs.length; t++) {
      var tf = tfs[t];
      var bucketMap = tfMaps[tf];
      var keys = Object.keys(bucketMap).sort();

      for (var i = 0; i < keys.length; i++) {
        var b = bucketMap[keys[i]];
        var body = Math.abs(b.close - b.open);
        var wick = body > 0 ? ((b.high - b.low) / body) : 0;

        var row = new Array(cmLen);
        row[M2_COL.DATA_CLEAN.Timestamp] = new Date(b.bucketMs).toISOString();
        row[M2_COL.DATA_CLEAN.Symbol] = b.sym;
        row[M2_COL.DATA_CLEAN.Market_Type] = b.mktType;
        row[M2_COL.DATA_CLEAN.Timeframe] = b.tf;
        row[M2_COL.DATA_CLEAN.Open] = b.open;
        row[M2_COL.DATA_CLEAN.High] = b.high;
        row[M2_COL.DATA_CLEAN.Low] = b.low;
        row[M2_COL.DATA_CLEAN.Close] = b.close;
        row[M2_COL.DATA_CLEAN.Volume] = b.volume;
        row[M2_COL.DATA_CLEAN.Volume_Quote] = b.volumeQuote;
        row[M2_COL.DATA_CLEAN.Volume_ZAR] = b.volumeZar;
        row[M2_COL.DATA_CLEAN.USDT_ZAR_Rate_At_Fetch] = b.fx;
        row[M2_COL.DATA_CLEAN.Source] = M2_CONST.SOURCE;
        row[M2_COL.DATA_CLEAN.Fetch_Timestamp] = b.fetchTs;
        row[M2_COL.DATA_CLEAN.Gap_Flag] = false;
        row[M2_COL.DATA_CLEAN.Stale_Flag] = false;
        row[M2_COL.DATA_CLEAN.Wick_To_Body_Ratio] = wick;

        rows.push(row);
      }
    }
  }

  rows.sort(function(a, b) {
    var cm = M2_COL.DATA_CLEAN;
    var s = String(a[cm.Symbol]).localeCompare(String(b[cm.Symbol]));
    if (s) return s;
    var t = String(a[cm.Timeframe]).localeCompare(String(b[cm.Timeframe]));
    if (t) return t;
    return new Date(a[cm.Timestamp]).getTime() - new Date(b[cm.Timestamp]).getTime();
  });

  return rows;
}


function M2__sampleRecentNativeRowsForAudit_(candles, sym, mktType, usdtZar, fetchTs, maxRows) {
  var out = [];
  var isUsdt = M2__isUsdtQuoted_(sym);
  var take = Math.min(maxRows || 20, candles.length);

  for (var i = 0; i < take; i++) {
    var c = candles[i];
    var ts = M2__toIsoUtc_(c.startTime || c.openTime || c.timestamp || c.time || c.date || '');
    if (!ts) continue;

    var o = parseFloat(c.open || c.openPrice || '0');
    var h = parseFloat(c.high || c.highPrice || '0');
    var l = parseFloat(c.low || c.lowPrice || '0');
    var cl = parseFloat(c.close || c.closePrice || '0');
    var v = parseFloat(c.volume || c.baseVolume || '0');
    if (!(o > 0 && h > 0 && l > 0 && cl > 0)) continue;

    var vq = v * cl;
    var vz = isUsdt ? (vq * usdtZar) : vq;

    out.push([
      ts, sym, mktType, '1M', o, h, l, cl, v, vq, vz,
      isUsdt ? usdtZar : '', M2_CONST.SOURCE, fetchTs
    ]);
  }

  return out;
}


function M2__extractCandleTimestampRaw_(c) {
  if (c === null || c === undefined) return '';

  // Ordered from most likely true bucket-open to least likely
  if (c.startTime !== undefined && c.startTime !== null && c.startTime !== '') return c.startTime;
  if (c.openTime !== undefined && c.openTime !== null && c.openTime !== '') return c.openTime;
  if (c.bucketStart !== undefined && c.bucketStart !== null && c.bucketStart !== '') return c.bucketStart;
  if (c.candleTime !== undefined && c.candleTime !== null && c.candleTime !== '') return c.candleTime;
  if (c.timestamp !== undefined && c.timestamp !== null && c.timestamp !== '') return c.timestamp;
  if (c.time !== undefined && c.time !== null && c.time !== '') return c.time;
  if (c.date !== undefined && c.date !== null && c.date !== '') return c.date;

  return '';
}


function M2__getOpenPerpPositions_() {
  var ss = M2__ss_();
  var sh = ss.getSheetByName('POSITIONS');
  if (!sh || sh.getLastRow() < 2) return [];

  var data = sh.getDataRange().getValues();
  var h    = data[0];

  var colPosId = h.indexOf('Position_ID');
  var colSym   = h.indexOf('Symbol');
  var colDir   = h.indexOf('Direction');
  var colMkt   = h.indexOf('Market_Type');
  var colStat  = h.indexOf('Position_Status');

  if (colSym === -1 || colMkt === -1 || colStat === -1) return [];

  var out = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][colMkt] === 'PERP' && data[i][colStat] === 'OPEN') {
      out.push({
        positionId : (colPosId !== -1 ? data[i][colPosId] : ''),
        sym        : data[i][colSym],
        side       : (colDir !== -1 ? data[i][colDir] : 'LONG')
      });
    }
  }
  return out;
}

function M2__buildFundingLogIndex_(fundSheet) {
  var idx = {};
  if (fundSheet.getLastRow() < 2) return idx;
  var d  = fundSheet.getDataRange().getValues();
  var fc = M2_COL.FUNDING_LOG;
  for (var i = 1; i < d.length; i++)
    idx[d[i][fc.Symbol] + '|||' + d[i][fc.Timestamp]] = true;
  return idx;
}


/* ══════════════  Tests (13)  ══════════════ */

function M2_testRunAll() {
  var tests = [
    ['Sheet schemas',        M2__testSheetSchemas_],
    ['USDT/ZAR rate',        M2__testUsdtZarRate_],
    ['M2__linear_ math',     M2__testLinearScore_],
    ['Percentile score',     M2__testPercentileScore_],
    ['ATR14 Wilder',         M2__testAtr14_],
    ['ATR ratio',            M2__testAtrRatio_],
    ['OBV slope',            M2__testObvSlope20_],
    ['BB squeeze',           M2__testBbSqueeze_],
    ['Data_Reliable rule',   M2__testDataReliable_],
    ['Gap detection',        M2__testGapDetection_],
    ['Symbol normalisation', M2__testSymbolNormalisation_],
    ['Sector tags',          M2__testSectorTags_],
    ['Funding log dedup',    M2__testFundingLogDedup_]
  ];

  var pass = 0, fail = 0;
  for (var i = 0; i < tests.length; i++) {
    try {
      if (tests[i][1]()) {
        pass++;
        console.log('  ✓ ' + tests[i][0]);
      } else {
        fail++;
        console.log('  ✗ ' + tests[i][0] + ': returned false');
      }
    } catch (e) {
      fail++;
      console.log('  ✗ ' + tests[i][0] + ': ' + e.message);
    }
  }
  console.log('[M2] Tests passed: ' + pass + ' / ' + tests.length +
              (fail ? '  *** ' + fail + ' FAILED ***' : '  — ALL GREEN'));
  return fail === 0;
}

/* ── Individual tests ── */

function M2__testSheetSchemas_() {
  var req = {
    INSTRUMENTS: 12, UNIVERSE: 20,
    DATA_RAW: 14, DATA_CLEAN: 17, FUNDING_LOG: 10
  };
  var k = Object.keys(req);
  for (var i = 0; i < k.length; i++) M2__assertColumnCount_(k[i], req[k[i]]);
  return true;
}

function M2__testUsdtZarRate_() {
  var r = M2_getUsdtZarRate();
  if (typeof r !== 'number' || r < 10 || r > 50)
    throw new Error('Rate out of range: ' + r);
  return true;
}

function M2__testLinearScore_() {
  var ok = true;
  ok = ok && Math.abs(M2__linear_(0.05, 0.01, 0.05, 0, 15) - 15)  < 0.001;
  ok = ok && Math.abs(M2__linear_(0.01, 0.01, 0.05, 0, 15) - 0)   < 0.001;
  ok = ok && Math.abs(M2__linear_(0.03, 0.01, 0.05, 0, 15) - 7.5) < 0.01;
  ok = ok && Math.abs(M2__linear_(0.5,  0.5,  1.0, 25, 0) - 25)   < 0.001;
  ok = ok && Math.abs(M2__linear_(1.0,  0.5,  1.0, 25, 0) - 0)    < 0.001;
  return ok;
}

function M2__testPercentileScore_() {
  var vals = [];
  for (var i = 1; i <= 20; i++) vals.push(i * 10);
  var top = M2__percentileScore_(200, vals, 25);
  var bot = M2__percentileScore_(10,  vals, 25);
  var mid = M2__percentileScore_(100, vals, 25);
  return top >= 20 && bot <= 5 && mid >= 5 && mid <= 20;
}

function M2__testAtr14_() {
  var cm = M2_COL.DATA_CLEAN, c = [];
  for (var i = 0; i < 20; i++) {
    var r = new Array(17).fill('');
    r[cm.High] = 110; r[cm.Low] = 90; r[cm.Close] = 100;
    c.push(r);
  }
  return Math.abs(M2__calcAtr14_(c, cm) - 20) < 0.01;
}

function M2__testAtrRatio_() {
  var cm = M2_COL.DATA_CLEAN, c = [];
  for (var i = 0; i < 45; i++) {
    var r = new Array(17).fill('');
    if (i < 30) { r[cm.High] = 120; r[cm.Low] = 80; }
    else        { r[cm.High] = 105; r[cm.Low] = 95; }
    r[cm.Close] = 100;
    c.push(r);
  }
  var ratio = M2__calcAtrRatio_(c, cm);
  return ratio < 1.0 && ratio > 0;
}

function M2__testObvSlope20_() {
  var cm = M2_COL.DATA_CLEAN;
  var up = [], dn = [];
  for (var i = 0; i < 22; i++) {
    var r1 = new Array(17).fill(0);
    r1[cm.Close] = 100 + i; r1[cm.Volume] = 1000; up.push(r1);
  }
  for (var j = 0; j < 22; j++) {
    var r2 = new Array(17).fill(0);
    r2[cm.Close] = 100 - j; r2[cm.Volume] = 1000; dn.push(r2);
  }
  return M2__calcObvSlope20_(up, cm) > 0 && M2__calcObvSlope20_(dn, cm) < 0;
}

function M2__testBbSqueeze_() {
  var cm = M2_COL.DATA_CLEAN, c = [];
  /* Wide-ranging candles first */
  for (var i = 0; i < 60; i++) {
    var r = new Array(17).fill('');
    r[cm.Close] = 100 + (i % 2 === 0 ? 10 : -10);
    c.push(r);
  }
  /* Then tight squeeze */
  for (var j = 0; j < 22; j++) {
    var r2 = new Array(17).fill('');
    r2[cm.Close] = 100 + (j % 2 === 0 ? 0.1 : -0.1);
    c.push(r2);
  }
  return M2__calcBbSqueeze_(c, cm) === true;
}

function M2__testDataReliable_() {
  var cm = M2_COL.DATA_CLEAN;
  function mk(g) {
    var r = new Array(17).fill('');
    r[cm.Gap_Flag] = g;
    return r;
  }
  /* 4 consecutive gaps → unreliable (> MAX_CONSECUTIVE_GAPS=3) */
  if (M2__calcDataReliable_(
    [mk(false), mk(true), mk(true), mk(true), mk(true), mk(false)], cm
  ) !== false) return false;

  /* 3 consecutive gaps → still reliable (≤ 3) */
  if (M2__calcDataReliable_(
    [mk(false), mk(true), mk(true), mk(true), mk(false)], cm
  ) !== true) return false;

  return true;
}

function M2__testGapDetection_() {
  var cm = M2_COL.DATA_CLEAN;
  var p  = M2_CONST.PERIOD_MS['4H'];
  var b  = new Date('2026-01-01T00:00:00Z').getTime();

  function c(ts) {
    var r = new Array(17).fill('');
    r[cm.Timestamp]   = new Date(ts).toISOString();
    r[cm.Symbol]      = 'TEST/USDT';
    r[cm.Market_Type] = 'SPOT_MARGIN';
    r[cm.Timeframe]   = '4H';
    r[cm.Gap_Flag]    = false;
    r[cm.Close]       = 100;
    return r;
  }

  /* 2-period gap → 1 synthetic row inserted */
  var r1 = M2__insertGapRows_([c(b), c(b + 2 * p)], cm);
  if (r1.length !== 3) return false;
  if (r1[1][cm.Gap_Flag] !== true || r1[1][cm.Open] !== '') return false;

  /* 3-period gap → 2 synthetic rows */
  var r2 = M2__insertGapRows_([c(b), c(b + 3 * p)], cm);
  return r2.length === 4;
}

function M2__testSymbolNormalisation_() {
  var cases = [
    [{ currencyPair: 'BTCUSDT' },      'BTC/USDT'],
    [{ currencyPair: 'SOLUSDT' },       'SOL/USDT'],
    [{ currencyPair: 'BTCUSDTPERP' },   'BTC/USDTPERP'],
    [{ symbol: 'ETH/USDT' },            'ETH/USDT'],
    [{ currencyPair: 'XRPZAR' },        'XRP/ZAR']
  ];
  for (var i = 0; i < cases.length; i++) {
    if (M2__normaliseSymbol_(cases[i][0]) !== cases[i][1]) return false;
  }
  return true;
}

function M2__testSectorTags_() {
  return M2__sectorTag_('BTC/USDT')  === 'BTC_Ecosystem'
      && M2__sectorTag_('ETH/ZAR')   === 'ETH_Ecosystem'
      && M2__sectorTag_('WIF/USDT')  === 'Meme'
      && M2__sectorTag_('LINK/USDT') === 'DeFi'
      && M2__sectorTag_('LTC/ZAR')   === 'L1';
}

function M2__testFundingLogDedup_() {
  var mock = {
    getLastRow: function() { return 3; },
    getDataRange: function() {
      return { getValues: function() { return [
        ['Timestamp','Symbol','Funding_Rate','Daily_Rate_Equiv',
         'Position_Side','Cost_Direction','Amount_USDT','Amount_ZAR',
         'USDT_ZAR_Rate_At_Settlement','Linked_Position_ID'],
        ['2026-01-01T00:00:00Z','SOL/USDTPERP',0.0001,0.0003,
         'LONG','PAID',5,90,18,'POS001'],
        ['2026-01-01T08:00:00Z','SOL/USDTPERP',0.0002,0.0006,
         'LONG','RECEIVED',10,180,18,'POS001']
      ]; } };
    }
  };

  var idx = M2__buildFundingLogIndex_(mock);
  return !!idx['SOL/USDTPERP|||2026-01-01T00:00:00Z']
      && !!idx['SOL/USDTPERP|||2026-01-01T08:00:00Z']
      && !idx['SOL/USDTPERP|||2026-01-01T16:00:00Z'];
}




function M2_debugInspectOneCandlePayload() {
  var sym = 'BTC/ZAR';
  var tf = '4H';
  var candles = M2__fetchCandlesFromValr_(sym, tf, 5);

  Logger.log('[M2][DEBUG] candle count = ' + candles.length);

  for (var i = 0; i < candles.length; i++) {
    Logger.log('[M2][DEBUG] candle[' + i + '] = ' + JSON.stringify(candles[i]));
  }
}




function M2_rebuildHardFiltersFromBootstrapData_() {
  var instSh = M2__sh_(M2_CONST.SHEETS.INSTRUMENTS);
  var inst = instSh.getDataRange().getValues();
  var clean = M2__readAll_(M2_CONST.SHEETS.DATA_CLEAN);

  if (!inst || inst.length <= 1) {
    throw new Error('[M2] INSTRUMENTS empty.');
  }
  if (!clean || clean.length <= 1) {
    throw new Error('[M2] DATA_CLEAN empty.');
  }

  var cI = M2_COL.INSTRUMENTS;
  var cC = M2_COL.DATA_CLEAN;

  var minVolZar = M2__getUniverseMinVolZar_('RESEARCH');

  var nowMs = Date.now();
  var ms30d = 30 * 24 * 60 * 60 * 1000;

  /* Build per-symbol F/G stats from DATA_CLEAN 4H */
  var stats = {};
  for (var r = 1; r < clean.length; r++) {
    var row = clean[r];
    if (String(row[cC.Timeframe]) !== '4H') continue;

    var sym = String(row[cC.Symbol] || '').trim();
    if (!sym) continue;

    var ts = new Date(row[cC.Timestamp]).getTime();
    if (!isFinite(ts)) continue;

    var gap = (row[cC.Gap_Flag] === true || String(row[cC.Gap_Flag]).toUpperCase() === 'TRUE');

    if (!stats[sym]) {
      stats[sym] = {
        nonGapTotal: 0,
        wickSum30d: 0,
        wickN30d: 0
      };
    }

    if (!gap) {
      stats[sym].nonGapTotal++;

      if (ts >= (nowMs - ms30d)) {
        stats[sym].wickSum30d += parseFloat(row[cC.Wick_To_Body_Ratio] || '0') || 0;
        stats[sym].wickN30d++;
      }
    }
  }

  var updates = [];
  var passCount = 0;

  for (var i = 1; i < inst.length; i++) {
    var symb = String(inst[i][cI.Symbol] || '').trim();
    var marketType = String(inst[i][cI.Market_Type] || '').trim();
    var volZar = parseFloat(inst[i][cI.Vol_24h_ZAR]) || 0;

    if (!symb) {
      updates.push([false]);
      continue;
    }

    /* Rebuild A–E from row data */

    /* B – min volume */
    if (volZar < minVolZar) {
      updates.push([false]);
      continue;
    }

    /* C – stablecoin pair exclusion */
    var blocked = false;
    for (var a = 0; a < M2_CONST.STABLECOIN_PAIRS.length; a++) {
      if (symb === M2_CONST.STABLECOIN_PAIRS[a]) {
        blocked = true;
        break;
      }
    }
    if (blocked) {
      updates.push([false]);
      continue;
    }

    /* D – xStock exclusion */
    var up = symb.toUpperCase();
    for (var b = 0; b < M2_CONST.XSTOCK_SUBSTRINGS.length; b++) {
      if (up.indexOf(M2_CONST.XSTOCK_SUBSTRINGS[b]) !== -1) {
        blocked = true;
        break;
      }
    }
    if (blocked) {
      updates.push([false]);
      continue;
    }

    /* E – dust exclusion */
    for (var d = 0; d < M2_CONST.DUST_PAIRS.length; d++) {
      if (symb === M2_CONST.DUST_PAIRS[d]) {
        blocked = true;
        break;
      }
    }
    if (blocked) {
      updates.push([false]);
      continue;
    }

    /* F/G from DATA_CLEAN */
    var st = stats[symb];
    if (!st) {
      console.log('[M2][HF_REBUILD] ' + symb + ' FAIL → no 4H stats');
      updates.push([false]);
      continue;
    }

    if (st.nonGapTotal < M2_CONST.MIN_4H_CANDLES_90D) {
      console.log('[M2][HF_REBUILD] ' + symb + ' FAIL → nonGapTotal=' + st.nonGapTotal);
      updates.push([false]);
      continue;
    }

    var avgWick = st.wickN30d > 0 ? (st.wickSum30d / st.wickN30d) : 0;
    if (avgWick > M2_CONST.WICKINESS_FILTER_THRESHOLD) {
      console.log('[M2][HF_REBUILD] ' + symb + ' FAIL → avgWick=' + avgWick.toFixed(4));
      updates.push([false]);
      continue;
    }

    console.log('[M2][HF_REBUILD] ' + symb + ' PASS | mkt=' + marketType +
                ' | volZar=' + Math.round(volZar) +
                ' | nonGapTotal=' + st.nonGapTotal +
                ' | avgWick=' + avgWick.toFixed(4));

    updates.push([true]);
    passCount++;
  }

  instSh.getRange(2, cI.Hard_Filter_Pass + 1, updates.length, 1).setValues(updates);
  console.log('[M2] Hard filters rebuilt from bootstrap data. Survivors=' + passCount);
}




function M2__getHardFilterPassSymbolObjs_() {
  var data = M2__readAll_(M2_CONST.SHEETS.INSTRUMENTS);
  var c = M2_COL.INSTRUMENTS;
  var out = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][c.Hard_Filter_Pass] === true) {
      out.push({
        sym: String(data[i][c.Symbol] || '').trim(),
        mktType: String(data[i][c.Market_Type] || '').trim()
      });
    }
  }

  return out;
}


function M2_fetchResearchUniverseCandlesIncremental() {
  var usdtZar = M2_getUsdtZarRate();
  var fetchTs = M2__nowIso_();
  var symbols = M2__getHardFilterPassSymbolObjs_();

  if (!symbols.length) {
    console.log('[M2] No Hard_Filter_Pass symbols — skipping research-universe fetch.');
    return;
  }

  var persistAuditRaw = true;
  var maxAuditAppendPerRun = 500;
  var rawAudit = [];
  var stateMap = {};

  console.log('[M2] ═══════════════════════════════════════');
  console.log('[M2] Research Universe Canonical Update Starting');
  console.log('[M2] Hard-filter symbols: ' + symbols.length);
  console.log('[M2] ═══════════════════════════════════════');

  for (var i = 0; i < symbols.length; i++) {
    var sym = symbols[i].sym;
    var mkt = symbols[i].mktType;

    if (!sym) continue;

    console.log('[M2] Research fetch ' + sym + ' (' + (i + 1) + '/' + symbols.length + ')...');

    try {
      var candles = M2__fetchNativeMinuteBuckets_(sym, 200);

      M2__accumulateNativeMinuteIntoStates_(stateMap, candles, sym, mkt, usdtZar, fetchTs);

      if (persistAuditRaw && rawAudit.length < maxAuditAppendPerRun) {
        var sample = M2__sampleRecentNativeRowsForAudit_(candles, sym, mkt, usdtZar, fetchTs, 5);
        for (var s = 0; s < sample.length && rawAudit.length < maxAuditAppendPerRun; s++) {
          rawAudit.push(sample[s]);
        }
      }

      console.log('[M2]   → native fetched=' + candles.length);
    } catch (e) {
      console.log('[M2]   → SKIP: ' + e.message);
    }

    Utilities.sleep(1000);
  }

  var incrementalClean = M2__stateMapsToCanonicalCleanRows_(stateMap);
  if (!incrementalClean.length) {
    console.log('[M2] No canonical rows produced during research-universe run.');
    return;
  }

  var existingClean = M2__readAll_(M2_CONST.SHEETS.DATA_CLEAN);
  var cm = M2_COL.DATA_CLEAN;
  var mergedClean = M2__mergeAndDedup_([['hdr']], incrementalClean, cm);

  if (existingClean.length > 1) {
    var existingOnly = [];
    for (var e = 1; e < existingClean.length; e++) existingOnly.push(existingClean[e]);
    mergedClean = M2__mergeAndDedup_([['hdr']], existingOnly.concat(incrementalClean), cm);
  }

  mergedClean.sort(function(a, b) {
    var s = String(a[cm.Symbol]).localeCompare(String(b[cm.Symbol]));
    if (s) return s;
    var t = String(a[cm.Timeframe]).localeCompare(String(b[cm.Timeframe]));
    if (t) return t;
    return new Date(a[cm.Timestamp]).getTime() - new Date(b[cm.Timestamp]).getTime();
  });

  M2__validateCleanTimeframeIntegrity_(mergedClean, cm);

  var withGaps = M2__insertGapRows_(mergedClean, cm);
  var withStale = M2__recomputeStaleFlags_(withGaps, cm);

  M2__clearDataRows_(M2_CONST.SHEETS.DATA_CLEAN);
  M2__writeFromRow2_(M2_CONST.SHEETS.DATA_CLEAN, withStale);

  if (persistAuditRaw && rawAudit.length) {
    M2__appendRows_(M2_CONST.SHEETS.DATA_RAW, rawAudit);
  }

  M2__updateUniverseReliability_(withStale);

  try {
    M1_cfgSet('Last_Data_Fetch_Timestamp', fetchTs, 'M2_fetchResearchUniverseCandlesIncremental', false);
  } catch (e2) {}

  console.log('[M2] ═══════════════════════════════════════');
  console.log('[M2] Research Universe Canonical Update Complete');
  console.log('[M2] Canonical rows merged: ' + incrementalClean.length);
  console.log('[M2] DATA_CLEAN rows now: ' + withStale.length);
  console.log('[M2] DATA_RAW audit rows appended: ' + rawAudit.length);
  console.log('[M2] ═══════════════════════════════════════');
}

function M2_logHardFilterPassUniverse() {
  var objs = M2__getHardFilterPassSymbolObjs_();
  Logger.log('[M2][HF] Hard_Filter_Pass symbols=' + objs.length);
  for (var i = 0; i < objs.length; i++) {
    Logger.log('[M2][HF] ' + objs[i].sym + ' | ' + objs[i].mktType);
  }
}

function M2_diagHardFilterReasons() {
  var inst = M2__readAll_(M2_CONST.SHEETS.INSTRUMENTS);
  var clean = M2__readAll_(M2_CONST.SHEETS.DATA_CLEAN);

  if (!inst || inst.length <= 1) throw new Error('[M2] INSTRUMENTS empty.');
  if (!clean || clean.length <= 1) throw new Error('[M2] DATA_CLEAN empty.');

  var cI = M2_COL.INSTRUMENTS;
  var cC = M2_COL.DATA_CLEAN;

  var minVolZar = M2__getUniverseMinVolZar_('RESEARCH');

  var nowMs = Date.now();
  var ms30d = 30 * 24 * 60 * 60 * 1000;

  var stats = {};
  for (var r = 1; r < clean.length; r++) {
    var row = clean[r];
    if (String(row[cC.Timeframe]) !== '4H') continue;

    var sym = String(row[cC.Symbol] || '').trim();
    if (!sym) continue;

    var ts = new Date(row[cC.Timestamp]).getTime();
    if (!isFinite(ts)) continue;

    var gap = (row[cC.Gap_Flag] === true || String(row[cC.Gap_Flag]).toUpperCase() === 'TRUE');

    if (!stats[sym]) {
      stats[sym] = {
        nonGapTotal: 0,
        wickSum30d: 0,
        wickN30d: 0
      };
    }

    if (!gap) {
      stats[sym].nonGapTotal++;
      if (ts >= (nowMs - ms30d)) {
        stats[sym].wickSum30d += parseFloat(row[cC.Wick_To_Body_Ratio] || '0') || 0;
        stats[sym].wickN30d++;
      }
    }
  }

  Logger.log('[M2][HF_DIAG] ═══════════════════════════════════════');
  Logger.log('[M2][HF_DIAG] Min_Universe_Volume_ZAR=' + minVolZar);
  Logger.log('[M2][HF_DIAG] Wickiness threshold=' + M2_CONST.WICKINESS_FILTER_THRESHOLD);
  Logger.log('[M2][HF_DIAG] Min 4H candles=' + M2_CONST.MIN_4H_CANDLES_90D);

  var passCount = 0;

  for (var i = 1; i < inst.length; i++) {
    var symb = String(inst[i][cI.Symbol] || '').trim();
    var marketType = String(inst[i][cI.Market_Type] || '').trim();
    var volZar = parseFloat(inst[i][cI.Vol_24h_ZAR]) || 0;
    var up = symb.toUpperCase();

    var reasons = [];

    if (volZar < minVolZar) {
      reasons.push('FAIL_B_VOL');
    }

    for (var a = 0; a < M2_CONST.STABLECOIN_PAIRS.length; a++) {
      if (symb === M2_CONST.STABLECOIN_PAIRS[a]) {
        reasons.push('FAIL_C_STABLECOIN_PAIR');
        break;
      }
    }

    for (var b = 0; b < M2_CONST.XSTOCK_SUBSTRINGS.length; b++) {
      if (up.indexOf(M2_CONST.XSTOCK_SUBSTRINGS[b]) !== -1) {
        reasons.push('FAIL_D_XSTOCK');
        break;
      }
    }

    for (var d = 0; d < M2_CONST.DUST_PAIRS.length; d++) {
      if (symb === M2_CONST.DUST_PAIRS[d]) {
        reasons.push('FAIL_E_DUST');
        break;
      }
    }

    var st = stats[symb];
    var nonGapTotal = st ? st.nonGapTotal : 0;
    var avgWick = (st && st.wickN30d > 0) ? (st.wickSum30d / st.wickN30d) : 0;

    if (!st) {
      reasons.push('FAIL_FG_NO_STATS');
    } else {
      if (nonGapTotal < M2_CONST.MIN_4H_CANDLES_90D) {
        reasons.push('FAIL_F_NOT_ENOUGH_4H');
      }
      if (avgWick > M2_CONST.WICKINESS_FILTER_THRESHOLD) {
        reasons.push('FAIL_G_WICKINESS');
      }
    }

    var pass = (reasons.length === 0);
    if (pass) passCount++;

    Logger.log(
      '[M2][HF_DIAG] ' + symb +
      ' | mkt=' + marketType +
      ' | volZar=' + Math.round(volZar) +
      ' | nonGapTotal=' + nonGapTotal +
      ' | avgWick=' + avgWick.toFixed(4) +
      ' | currentPass=' + String(inst[i][cI.Hard_Filter_Pass]) +
      ' | result=' + (pass ? 'PASS' : 'FAIL') +
      ' | reasons=' + (reasons.length ? reasons.join(',') : 'PASS')
    );
  }

  Logger.log('[M2][HF_DIAG] Survivors if rebuilt now=' + passCount);
  Logger.log('[M2][HF_DIAG] ═══════════════════════════════════════');
}

function RUN_M2_rebuildHardFiltersAndUniverse_NOW() {
  Logger.log('[RUN][M2] Rebuilding hard filters from current DATA_CLEAN...');
  M2_rebuildHardFiltersFromBootstrapData_();

  Logger.log('[RUN][M2] Rebuilding UNIVERSE...');
  M2_runSpsAndBuildUniverse();

  Logger.log('[RUN][M2] Logging hard-filter survivors...');
  M2_logHardFilterPassUniverse();

  Logger.log('[RUN][M2] Logging canonical history status...');
  M2_logCanonicalHistoryStatus();

  Logger.log('[RUN][M2] Done.');
}

function M2__getUniverseMinVolZar_(contextTag) {
  var base = 0;
  var research = 0;

  try {
    base = M1_cfgGetNum('Min_Universe_Volume_ZAR') || 0;
  } catch (e1) {}

  try {
    research = M1_cfgGetNum('Research_Min_Universe_Volume_ZAR') || 0;
  } catch (e2) {}

  var ctx = String(contextTag || '').toUpperCase();

  if ((ctx === 'RESEARCH' || ctx === 'BACKTEST') && isFinite(research) && research > 0) {
    return research;
  }

  return base;
}


function RUN_M2_applyResearchUniverseVolumeAndRefresh(volumeZar) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('CONFIG');
  if (!sh) throw new Error('CONFIG sheet not found.');

  var target = parseFloat(volumeZar);
  if (!isFinite(target) || target < 0) {
    throw new Error('Research min universe volume must be numeric and >= 0.');
  }

  function upsertConfig_(key, value) {
    var data = sh.getDataRange().getValues();
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0] || '').trim() === key) {
        var oldVal = data[i][1];
        sh.getRange(i + 1, 2).setValue(value);
        Logger.log('[CFG] ' + key + ' updated: ' + oldVal + ' -> ' + value);
        return;
      }
    }
    var nextRow = sh.getLastRow() + 1;
    sh.getRange(nextRow, 1, 1, 2).setValues([[key, value]]);
    Logger.log('[CFG] ' + key + ' created: ' + value);
  }

  Logger.log('[RUN][M2] ═══════════════════════════════════════');
  Logger.log('[RUN][M2] Applying research universe volume override and refreshing');
  Logger.log('[RUN][M2] Research_Min_Universe_Volume_ZAR=' + target);

  upsertConfig_('Research_Min_Universe_Volume_ZAR', target);
  SpreadsheetApp.flush();

  Logger.log('[RUN][M2] Rebuilding hard filters from current DATA_CLEAN...');
  M2_rebuildHardFiltersFromBootstrapData_();

  Logger.log('[RUN][M2] Rebuilding UNIVERSE...');
  M2_runSpsAndBuildUniverse();

  Logger.log('[RUN][M2] Logging hard-filter survivors...');
  M2_logHardFilterPassUniverse();

  Logger.log('[RUN][M2] Expanding canonical history for research universe...');
  M2_fetchResearchUniverseCandlesIncremental();

  Logger.log('[RUN][M2] Logging canonical history status...');
  M2_logCanonicalHistoryStatus();

  Logger.log('[RUN][M2] Done.');
  Logger.log('[RUN][M2] ═══════════════════════════════════════');
}

function RUN_M2_refreshResearchUniverse_250k() {
  return RUN_M2_applyResearchUniverseVolumeAndRefresh(250000);
}

function RUN_M2_refreshResearchUniverse_500k() {
  return RUN_M2_applyResearchUniverseVolumeAndRefresh(500000);
}

function RUN_M2_refreshResearchUniverse_1m() {
  return RUN_M2_applyResearchUniverseVolumeAndRefresh(1000000);
}

function M2__getResearchSeedMinVolZar_() {
  var rows = [];
  try {
    rows = M2__readAll_(M2_CONST.SHEETS.CONFIG);
  } catch (e) {
    rows = [];
  }

  function cfgNumDirect_(key, dflt) {
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0] || '').trim() === key) {
        var n = parseFloat(rows[i][1]);
        return isFinite(n) ? n : dflt;
      }
    }
    return dflt;
  }

  var seed = cfgNumDirect_('Research_Seed_Min_Universe_Volume_ZAR', 0);
  var research = cfgNumDirect_('Research_Min_Universe_Volume_ZAR', 0);
  var base = cfgNumDirect_('Min_Universe_Volume_ZAR', 0);

  if (isFinite(seed) && seed > 0) return seed;
  if (isFinite(research) && research > 0) return research;
  return base;
}

function M2__passesResearchSeedStaticFilters_(sym) {
  var up = String(sym || '').toUpperCase().trim();
  if (!up) return false;

  for (var i = 0; i < M2_CONST.STABLECOIN_PAIRS.length; i++) {
    if (up === M2_CONST.STABLECOIN_PAIRS[i]) return false;
  }

  for (var j = 0; j < M2_CONST.XSTOCK_SUBSTRINGS.length; j++) {
    if (up.indexOf(M2_CONST.XSTOCK_SUBSTRINGS[j]) !== -1) return false;
  }

  for (var k = 0; k < M2_CONST.DUST_PAIRS.length; k++) {
    if (up === M2_CONST.DUST_PAIRS[k]) return false;
  }

  return true;
}

function M2__getResearchSeedSymbolObjs_() {
  var data = M2__readAll_(M2_CONST.SHEETS.INSTRUMENTS);
  var c = M2_COL.INSTRUMENTS;
  var minVolZar = M2__getResearchSeedMinVolZar_();
  var out = [];

  for (var i = 1; i < data.length; i++) {
    var sym = String(data[i][c.Symbol] || '').trim();
    var mktType = String(data[i][c.Market_Type] || '').trim();
    var volZar = parseFloat(data[i][c.Vol_24h_ZAR]) || 0;

    if (!sym) continue;
    if (!M2__passesResearchSeedStaticFilters_(sym)) continue;
    if (volZar < minVolZar) continue;

    out.push({
      sym: sym,
      mktType: mktType,
      volZar: volZar
    });
  }

  out.sort(function(a, b) { return b.volZar - a.volZar; });
  return out;
}

function M2_fetchResearchSeedUniverseCandlesIncremental() {
  var usdtZar = M2_getUsdtZarRate();
  var fetchTs = M2__nowIso_();
  var symbols = M2__getResearchSeedSymbolObjs_();

  if (!symbols.length) {
    console.log('[M2] No research-seed symbols — skipping seed-universe fetch.');
    return;
  }

  var persistAuditRaw = true;
  var maxAuditAppendPerRun = 1000;
  var rawAudit = [];
  var stateMap = {};

  console.log('[M2] ═══════════════════════════════════════');
  console.log('[M2] Research Seed Universe Canonical Update Starting');
  console.log('[M2] Seed symbols: ' + symbols.length +
              ' | seedMinVolZar=' + M2__getResearchSeedMinVolZar_());
  console.log('[M2] ═══════════════════════════════════════');

  for (var i = 0; i < symbols.length; i++) {
    var sym = symbols[i].sym;
    var mkt = symbols[i].mktType;

    console.log('[M2] Seed fetch ' + sym + ' (' + (i + 1) + '/' + symbols.length + ')...');

    try {
      var candles = M2__fetchNativeMinuteBuckets_(sym, 200);

      M2__accumulateNativeMinuteIntoStates_(stateMap, candles, sym, mkt, usdtZar, fetchTs);

      if (persistAuditRaw && rawAudit.length < maxAuditAppendPerRun) {
        var sample = M2__sampleRecentNativeRowsForAudit_(candles, sym, mkt, usdtZar, fetchTs, 5);
        for (var s = 0; s < sample.length && rawAudit.length < maxAuditAppendPerRun; s++) {
          rawAudit.push(sample[s]);
        }
      }

      console.log('[M2]   → native fetched=' + candles.length);
    } catch (e) {
      console.log('[M2]   → SKIP: ' + e.message);
    }

    Utilities.sleep(1000);
  }

  var incrementalClean = M2__stateMapsToCanonicalCleanRows_(stateMap);
  if (!incrementalClean.length) {
    console.log('[M2] No canonical rows produced during seed-universe run.');
    return;
  }

  var existingClean = M2__readAll_(M2_CONST.SHEETS.DATA_CLEAN);
  var cm = M2_COL.DATA_CLEAN;
  var mergedClean = M2__mergeAndDedup_([['hdr']], incrementalClean, cm);

  if (existingClean.length > 1) {
    var existingOnly = [];
    for (var e = 1; e < existingClean.length; e++) existingOnly.push(existingClean[e]);
    mergedClean = M2__mergeAndDedup_([['hdr']], existingOnly.concat(incrementalClean), cm);
  }

  mergedClean.sort(function(a, b) {
    var s = String(a[cm.Symbol]).localeCompare(String(b[cm.Symbol]));
    if (s) return s;
    var t = String(a[cm.Timeframe]).localeCompare(String(b[cm.Timeframe]));
    if (t) return t;
    return new Date(a[cm.Timestamp]).getTime() - new Date(b[cm.Timestamp]).getTime();
  });

  M2__validateCleanTimeframeIntegrity_(mergedClean, cm);

  var withGaps = M2__insertGapRows_(mergedClean, cm);
  var withStale = M2__recomputeStaleFlags_(withGaps, cm);

  M2__clearDataRows_(M2_CONST.SHEETS.DATA_CLEAN);
  M2__writeFromRow2_(M2_CONST.SHEETS.DATA_CLEAN, withStale);

  if (persistAuditRaw && rawAudit.length) {
    M2__appendRows_(M2_CONST.SHEETS.DATA_RAW, rawAudit);
  }

  M2__updateUniverseReliability_(withStale);

  try {
    M1_cfgSet('Last_Data_Fetch_Timestamp', fetchTs, 'M2_fetchResearchSeedUniverseCandlesIncremental', false);
  } catch (e2) {}

  console.log('[M2] ═══════════════════════════════════════');
  console.log('[M2] Research Seed Universe Canonical Update Complete');
  console.log('[M2] Canonical rows merged: ' + incrementalClean.length);
  console.log('[M2] DATA_CLEAN rows now: ' + withStale.length);
  console.log('[M2] DATA_RAW audit rows appended: ' + rawAudit.length);
  console.log('[M2] ═══════════════════════════════════════');
}

function M2_logResearchSeedUniverse() {
  var minVol = M2__getResearchSeedMinVolZar_();
  var objs = M2__getResearchSeedSymbolObjs_();

  Logger.log('[M2][SEED] Research seed symbols=' + objs.length +
             ' | minVolZar=' + minVol);

  for (var i = 0; i < objs.length; i++) {
    Logger.log('[M2][SEED] ' + objs[i].sym + ' | ' + objs[i].mktType +
               ' | volZar=' + Math.round(objs[i].volZar));
  }
}


function RUN_M2_seedResearchUniverse_250k() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('CONFIG');
  if (!sh) throw new Error('CONFIG sheet not found.');

  function upsertConfig_(key, value) {
    var data = sh.getDataRange().getValues();
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0] || '').trim() === key) {
        var oldVal = data[i][1];
        sh.getRange(i + 1, 2).setValue(value);
        Logger.log('[CFG] ' + key + ' updated: ' + oldVal + ' -> ' + value);
        return;
      }
    }
    var nextRow = sh.getLastRow() + 1;
    sh.getRange(nextRow, 1, 1, 2).setValues([[key, value]]);
    Logger.log('[CFG] ' + key + ' created: ' + value);
  }

  Logger.log('[RUN][M2] ═══════════════════════════════════════');
  Logger.log('[RUN][M2] Seed research universe @ 250k');
  Logger.log('[RUN][M2] ═══════════════════════════════════════');

  upsertConfig_('Research_Seed_Min_Universe_Volume_ZAR', 250000);
  SpreadsheetApp.flush();

  M2_logResearchSeedUniverse();
  M2_fetchResearchSeedUniverseCandlesIncremental();
  M2_logCanonicalHistoryStatus();

  Logger.log('[RUN][M2] Seed research universe complete.');
}

function M2_logDataCleanSymbolCounts() {
  var data = M2__readAll_(M2_CONST.SHEETS.DATA_CLEAN);
  var cm = M2_COL.DATA_CLEAN;
  var counts = {};

  for (var i = 1; i < data.length; i++) {
    var sym = String(data[i][cm.Symbol] || '').trim();
    var tf = String(data[i][cm.Timeframe] || '').trim();
    if (!sym || !tf) continue;

    var key = sym + ' | ' + tf;
    counts[key] = (counts[key] || 0) + 1;
  }

  var keys = Object.keys(counts).sort();
  Logger.log('[M2] DATA_CLEAN buckets=' + keys.length);

  for (var j = 0; j < keys.length; j++) {
    Logger.log('[M2] ' + keys[j] + ' -> ' + counts[keys[j]]);
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * M2B_Bootstrap.gs — v4.0.1
 *
 * Consolidated bootstrap: CryptoCompare data source.
 * This is the ONLY bootstrap file. Delete all others.
 *
 * ES5-only. Google Apps Script compatible.
 */

/* ═══════════════════════════════════════════════════════════
 * DATE UTILITIES
 * ═══════════════════════════════════════════════════════════ */

function M2B__normalizeConfigDateToYmd_(value, label) {
  if (value === null || value === undefined || value === '') {
    throw new Error('[M2B] Missing ' + label);
  }
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, 'UTC', 'yyyy-MM-dd');
  }
  var s = String(value).trim();
  if (!s) throw new Error('[M2B] Empty ' + label);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  var parsed = new Date(s);
  if (!isNaN(parsed.getTime())) return Utilities.formatDate(parsed, 'UTC', 'yyyy-MM-dd');
  throw new Error('[M2B] Could not parse ' + label + ': ' + s);
}

function M2B__ymdToUtcMs_(ymd) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || '').trim());
  if (!m) throw new Error('[M2B] Invalid YYYY-MM-DD date: ' + ymd);
  return Date.UTC(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10), 0, 0, 0, 0);
}

/* ═══════════════════════════════════════════════════════════
 * TARGET BUILDING
 * ═══════════════════════════════════════════════════════════ */
function M2B__buildBootstrapTargets_() {
  if (typeof M2_CONST === 'undefined' || !M2_CONST) {
    throw new Error('[M2B] M2_CONST is undefined.');
  }
  if (!M2_CONST.SHEETS || !M2_CONST.SHEETS.INSTRUMENTS) {
    throw new Error('[M2B] M2_CONST.SHEETS.INSTRUMENTS is undefined.');
  }
  if (typeof M2_COL === 'undefined' || !M2_COL || !M2_COL.INSTRUMENTS) {
    throw new Error('[M2B] M2_COL.INSTRUMENTS is undefined.');
  }

  var sheetName = M2_CONST.SHEETS.INSTRUMENTS;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(sheetName);
  if (!sh) {
    throw new Error('[M2B] INSTRUMENTS sheet not found: ' + sheetName);
  }

  var data = M2__readAll_(sheetName);
  if (!data || Object.prototype.toString.call(data) !== '[object Array]') {
    throw new Error('[M2B] Could not read INSTRUMENTS data.');
  }
  if (data.length < 2) {
    Logger.log('[M2B] buildTargets: sheet=' + sheetName + ' rows=' + data.length + ' → no data rows');
    return [];
  }

  var c = M2_COL.INSTRUMENTS;
  if (c.Symbol === undefined) throw new Error('[M2B] M2_COL.INSTRUMENTS.Symbol is undefined.');
  if (c.Market_Type === undefined) throw new Error('[M2B] M2_COL.INSTRUMENTS.Market_Type is undefined.');
  if (c.Vol_24h_ZAR === undefined) throw new Error('[M2B] M2_COL.INSTRUMENTS.Vol_24h_ZAR is undefined.');

  var minVol = M2B__getBootstrapMinVolZar_();

  var out = [];
  var seen = {};

  var blockedBases = [
    'USDT','USDC','RLUSD','EURC','BUSD','DAI','USDPC',
    'XAUT','BITGOLD','VALR10',
    'NVDAX','TSLAX','MSTRX','SPYX','HOODX','COINX','CRCLX',
    'WLFI','PUMP'
  ];

  var coreBases = {
    'BTC': true,
    'ETH': true,
    'SOL': true,
    'XRP': true,
    'BNB': true,
    'AVAX': true,
    'DOGE': true,
    'TRX': true,
    'XLM': true,
    'LINK': true,
    'LTC': true
  };

  var stats = {
    totalRows: data.length - 1,
    emptySymbol: 0,
    underMinVol: 0,
    duplicate: 0,
    badFormat: 0,
    blockedBase: 0,
    nonCoreBase: 0,
    xstock: 0,
    unsupportedMarketCombo: 0,
    accepted: 0
  };

  for (var i = 1; i < data.length; i++) {
    var row = data[i] || [];
    var sym = String(row[c.Symbol] || '').trim();
    var mkt = String(row[c.Market_Type] || '').trim();
    var vol = parseFloat(row[c.Vol_24h_ZAR]) || 0;

    if (!sym) {
      stats.emptySymbol++;
      continue;
    }

    if (minVol > 0 && vol < minVol) {
      stats.underMinVol++;
      continue;
    }

    if (seen[sym]) {
      stats.duplicate++;
      continue;
    }

    var parts = sym.split('/');
    if (parts.length < 2) {
      stats.badFormat++;
      Logger.log('[M2B][TARGETS][SKIP] bad symbol format: ' + sym);
      continue;
    }

    var base = String(parts[0] || '').toUpperCase();
    var quote = String(parts[1] || '').toUpperCase();
    var skip = false;

    for (var b = 0; b < blockedBases.length; b++) {
      if (base === blockedBases[b]) {
        stats.blockedBase++;
        skip = true;
        break;
      }
    }
    if (skip) continue;

    if (!coreBases[base]) {
      stats.nonCoreBase++;
      continue;
    }

    if (M2_CONST.XSTOCK_SUBSTRINGS) {
      for (var x = 0; x < M2_CONST.XSTOCK_SUBSTRINGS.length; x++) {
        if (sym.toUpperCase().indexOf(String(M2_CONST.XSTOCK_SUBSTRINGS[x]).toUpperCase()) !== -1) {
          stats.xstock++;
          skip = true;
          break;
        }
      }
    }
    if (skip) continue;

    seen[sym] = true;

    if (quote === 'USDT' && mkt === 'SPOT_MARGIN') {
      out.push({
        provider: 'BINANCE_SPOT',
        systemSymbol: sym,
        marketType: 'SPOT_MARGIN',
        ccBase: base
      });
      stats.accepted++;
    } else if (quote === 'USDTPERP' && mkt === 'PERP') {
      out.push({
        provider: 'BINANCE_PERP',
        systemSymbol: sym,
        marketType: 'PERP',
        ccBase: base
      });
      stats.accepted++;
    } else if (quote === 'ZAR' && mkt === 'SPOT_MARGIN') {
      out.push({
        provider: 'SYNTH_ZAR',
        systemSymbol: sym,
        marketType: 'SPOT_MARGIN',
        ccBase: base
      });
      stats.accepted++;
    } else {
      stats.unsupportedMarketCombo++;
      Logger.log('[M2B][TARGETS][SKIP] unsupported combo: sym=' + sym + ' mkt=' + mkt + ' vol=' + vol);
    }
  }

  Logger.log('[M2B][TARGETS] build complete'
    + ' | sheet=' + sheetName
    + ' | minVol=' + minVol
    + ' | totalRows=' + stats.totalRows
    + ' | accepted=' + stats.accepted
    + ' | emptySymbol=' + stats.emptySymbol
    + ' | underMinVol=' + stats.underMinVol
    + ' | duplicate=' + stats.duplicate
    + ' | badFormat=' + stats.badFormat
    + ' | blockedBase=' + stats.blockedBase
    + ' | nonCoreBase=' + stats.nonCoreBase
    + ' | xstock=' + stats.xstock
    + ' | unsupportedMarketCombo=' + stats.unsupportedMarketCombo);

  return out;
}


function M2B_debugBootstrapEnv() {
  Logger.log('[M2B][DEBUG] ═════════ ENV DEBUG START ═════════');

  Logger.log('[M2B][DEBUG] typeof M2_CONST = ' + typeof M2_CONST);
  Logger.log('[M2B][DEBUG] typeof M2_COL   = ' + typeof M2_COL);

  if (typeof M2_CONST !== 'undefined' && M2_CONST) {
    try {
      Logger.log('[M2B][DEBUG] M2_CONST = ' + JSON.stringify(M2_CONST));
    } catch (e1) {
      Logger.log('[M2B][DEBUG] M2_CONST stringify failed: ' + e1.message);
    }

    if (M2_CONST.SHEETS) {
      try {
        Logger.log('[M2B][DEBUG] M2_CONST.SHEETS = ' + JSON.stringify(M2_CONST.SHEETS));
      } catch (e2) {
        Logger.log('[M2B][DEBUG] M2_CONST.SHEETS stringify failed: ' + e2.message);
      }
      Logger.log('[M2B][DEBUG] INSTRUMENTS sheet name = ' + M2_CONST.SHEETS.INSTRUMENTS);
    } else {
      Logger.log('[M2B][DEBUG] M2_CONST.SHEETS is missing.');
    }
  } else {
    Logger.log('[M2B][DEBUG] M2_CONST missing.');
  }

  if (typeof M2_COL !== 'undefined' && M2_COL) {
    try {
      Logger.log('[M2B][DEBUG] M2_COL.INSTRUMENTS = ' + JSON.stringify(M2_COL.INSTRUMENTS));
    } catch (e3) {
      Logger.log('[M2B][DEBUG] M2_COL.INSTRUMENTS stringify failed: ' + e3.message);
    }
  } else {
    Logger.log('[M2B][DEBUG] M2_COL missing.');
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = '';
  try {
    sheetName = M2_CONST && M2_CONST.SHEETS ? M2_CONST.SHEETS.INSTRUMENTS : '';
  } catch (e4) {
    sheetName = '';
  }

  Logger.log('[M2B][DEBUG] Active spreadsheet = ' + ss.getName());
  Logger.log('[M2B][DEBUG] Expected INSTRUMENTS sheet = ' + sheetName);

  var allSheets = ss.getSheets();
  var names = [];
  for (var i = 0; i < allSheets.length; i++) names.push(allSheets[i].getName());
  Logger.log('[M2B][DEBUG] Available sheets = ' + names.join(', '));

  var sh = ss.getSheetByName(sheetName);
  Logger.log('[M2B][DEBUG] Sheet exists = ' + (!!sh));

  if (sh) {
    Logger.log('[M2B][DEBUG] Sheet lastRow=' + sh.getLastRow() + ' lastColumn=' + sh.getLastColumn());
    if (sh.getLastRow() >= 1 && sh.getLastColumn() >= 1) {
      var previewRows = Math.min(5, sh.getLastRow());
      var previewCols = Math.min(8, sh.getLastColumn());
      var preview = sh.getRange(1, 1, previewRows, previewCols).getValues();
      try {
        Logger.log('[M2B][DEBUG] Sheet preview = ' + JSON.stringify(preview));
      } catch (e5) {
        Logger.log('[M2B][DEBUG] Sheet preview stringify failed: ' + e5.message);
      }
    }
  }

  try {
    var data = M2__readAll_(sheetName);
    Logger.log('[M2B][DEBUG] readAll typeof = ' + typeof data);
    Logger.log('[M2B][DEBUG] readAll isArray = ' + (Object.prototype.toString.call(data) === '[object Array]'));
    Logger.log('[M2B][DEBUG] readAll length = ' + (data && data.length ? data.length : 0));
    if (data && data.length) {
      var sampleCount = Math.min(3, data.length);
      var sample = [];
      for (var j = 0; j < sampleCount; j++) sample.push(data[j]);
      try {
        Logger.log('[M2B][DEBUG] readAll sample = ' + JSON.stringify(sample));
      } catch (e6) {
        Logger.log('[M2B][DEBUG] readAll sample stringify failed: ' + e6.message);
      }
    }
  } catch (e7) {
    Logger.log('[M2B][DEBUG] readAll error = ' + e7.message);
  }

  Logger.log('[M2B][DEBUG] ═════════ ENV DEBUG END ═════════');
}

/* ═══════════════════════════════════════════════════════════
 * ROW BUILDER
 * ═══════════════════════════════════════════════════════════ */

function M2B__makeDataCleanRow_(obj) {
  var row = [];
  var cm = M2_COL.DATA_CLEAN;
  row[cm.Timestamp]               = obj.timestamp;
  row[cm.Symbol]                  = obj.symbol;
  row[cm.Market_Type]             = obj.marketType;
  row[cm.Timeframe]               = obj.timeframe;
  row[cm.Open]                    = obj.open;
  row[cm.High]                    = obj.high;
  row[cm.Low]                     = obj.low;
  row[cm.Close]                   = obj.close;
  row[cm.Volume]                  = obj.volume;
  row[cm.Volume_Quote]            = obj.volumeQuote;
  row[cm.Volume_ZAR]              = obj.volumeZar;
  row[cm.USDT_ZAR_Rate_At_Fetch]  = obj.fx;
  row[cm.Source]                  = obj.source;
  row[cm.Fetch_Timestamp]         = obj.fetchTs;
  row[cm.Gap_Flag]                = obj.gapFlag;
  row[cm.Stale_Flag]              = obj.staleFlag;
  row[cm.Wick_To_Body_Ratio]      = obj.wickRatio;
  return row;
}

/* ═══════════════════════════════════════════════════════════
 * HISTORICAL FX (USD→ZAR)
 * ═══════════════════════════════════════════════════════════ */

function M2B__fetchUsdZarDaily_(startDate, endDate) {
  var map = {};
  var fallback = 18.50;
  try { fallback = M2_getUsdtZarRate(); } catch (e) {}

  try {
    var url = 'https://api.frankfurter.app/' + startDate + '..' + endDate + '?from=USD&to=ZAR';
    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (resp.getResponseCode() === 200) {
      var data = JSON.parse(resp.getContentText());
      if (data && data.rates) {
        var keys = Object.keys(data.rates).sort();
        for (var i = 0; i < keys.length; i++) {
          map[keys[i]] = data.rates[keys[i]].ZAR;
        }
      }
    }
  } catch (e2) {
    Logger.log('[M2B] FX fetch failed, using fallback: ' + e2.message);
  }
  map.__fallback = fallback;
  return map;
}

function M2B__fxForDate_(fxMap, day) {
  if (fxMap[day]) return fxMap[day];
  var d = new Date(day + 'T00:00:00Z');
  for (var i = 0; i < 10; i++) {
    d.setUTCDate(d.getUTCDate() - 1);
    var k = d.toISOString().slice(0, 10);
    if (fxMap[k]) return fxMap[k];
  }
  return fxMap.__fallback || 18.50;
}

/* ═══════════════════════════════════════════════════════════
 * FX APPLICATION
 * ═══════════════════════════════════════════════════════════ */

function M2B__applyVolumeZar_(rows, fxMap) {
  var cm = M2_COL.DATA_CLEAN;
  for (var i = 0; i < rows.length; i++) {
    var day = String(rows[i][cm.Timestamp]).slice(0, 10);
    var fx = M2B__fxForDate_(fxMap, day);
    rows[i][cm.Volume_ZAR]              = (parseFloat(rows[i][cm.Volume_Quote]) || 0) * fx;
    rows[i][cm.USDT_ZAR_Rate_At_Fetch]  = fx;
  }
  return rows;
}

function M2B__convertUsdtRowsToZar_(rows, systemSymbol, fxMap) {
  var cm = M2_COL.DATA_CLEAN;
  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i].slice();
    var day = String(r[cm.Timestamp]).slice(0, 10);
    var fx = M2B__fxForDate_(fxMap, day);

    r[cm.Symbol]                  = systemSymbol;
    r[cm.Open]                    = (parseFloat(r[cm.Open]) || 0) * fx;
    r[cm.High]                    = (parseFloat(r[cm.High]) || 0) * fx;
    r[cm.Low]                     = (parseFloat(r[cm.Low]) || 0) * fx;
    r[cm.Close]                   = (parseFloat(r[cm.Close]) || 0) * fx;
    // Volume_Quote stays in USDT; Volume_ZAR is the converted value
    var vqUsdt                    = parseFloat(r[cm.Volume_Quote]) || 0;
    r[cm.Volume_ZAR]              = vqUsdt * fx;
    r[cm.USDT_ZAR_Rate_At_Fetch]  = fx;
    r[cm.Source]                  = 'CRYPTOCOMPARE_SYNTH_ZAR';
    out.push(r);
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════
 * DEDUP
 * ═══════════════════════════════════════════════════════════ */

function M2B__dedupRows_(rows) {
  var best = {};
  var cm = M2_COL.DATA_CLEAN;
  for (var i = 0; i < rows.length; i++) {
    var key = rows[i][cm.Symbol] + '|||' + rows[i][cm.Timeframe] + '|||' + rows[i][cm.Timestamp];
    best[key] = rows[i];
  }
  var out = [];
  var keys = Object.keys(best);
  for (var j = 0; j < keys.length; j++) out.push(best[keys[j]]);
  return out;
}

/* ═══════════════════════════════════════════════════════════
 * CRYPTOCOMPARE — PROBE
 * ═══════════════════════════════════════════════════════════ */

function M2B__probeCryptoCompare_(fsym, tsym, startTs) {
  try {
    var ccKey = M1_secGetCryptoCompareKey();
    var url = 'https://min-api.cryptocompare.com/data/v2/histohour'
      + '?fsym=' + fsym + '&tsym=' + tsym
      + '&limit=5'
      + '&toTs=' + (startTs + 6 * 3600)
      + '&api_key=' + ccKey;
    var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) {
      return { count: 0, message: 'HTTP ' + resp.getResponseCode() };
    }
    var body = JSON.parse(resp.getContentText());
    var d = (body.Data && body.Data.Data) || [];
    return { count: d.length, message: body.Response || 'OK' };
  } catch (e) {
    return { count: 0, message: e.message };
  }
}

/* ═══════════════════════════════════════════════════════════
 * CRYPTOCOMPARE — PAGED FETCH
 * ═══════════════════════════════════════════════════════════ */
function M2B__fetchCCPaged_(endpoint, fsym, tsym, systemSymbol,
                            marketType, tfSys, startTs, fetchTs) {

  var ccKey = M1_secGetCryptoCompareKey();

  var nowTs   = Math.floor(Date.now() / 1000);
  var cursor  = nowTs;
  var allCandles = [];
  var seen    = {};
  var maxPages = 80;

  var aggregate = 1;
  var limit     = 2000;

  if (endpoint === 'histohour' && tfSys === '4H') {
    aggregate = 4;
    limit     = 500;
  } else if (endpoint === 'histoday') {
    aggregate = 1;
    limit     = 2000;
  }

  for (var page = 0; page < maxPages; page++) {
    var url = 'https://min-api.cryptocompare.com/data/v2/' + endpoint
      + '?fsym='      + encodeURIComponent(fsym)
      + '&tsym='      + encodeURIComponent(tsym)
      + '&limit='     + limit
      + '&toTs='      + cursor
      + '&aggregate=' + aggregate
      + '&api_key='   + ccKey;

    var resp = M2B__fetchWithBackoff_(url, { muteHttpExceptions: true }, 5);

    if (resp.getResponseCode() !== 200) {
      throw new Error('CC HTTP ' + resp.getResponseCode() + ': ' +
                      resp.getContentText().substring(0, 200));
    }

    var body = JSON.parse(resp.getContentText());
    if (body.Response === 'Error') {
      throw new Error('CC API Error: ' +
        (body.Message || JSON.stringify(body)).substring(0, 200));
    }

    var candles = (body.Data && body.Data.Data) || [];
    if (!candles.length) break;

    var earliest = Infinity;
    for (var i = 0; i < candles.length; i++) {
      var c = candles[i];
      if (!c || c.time === undefined) continue;
      if (seen[c.time]) continue;
      if (c.open === 0 && c.high === 0 &&
          c.low  === 0 && c.close === 0) continue;

      seen[c.time] = true;
      if (c.time < earliest) earliest = c.time;
      if (c.time >= startTs)  allCandles.push(c);
    }

    if (earliest <= startTs) break;
    cursor = earliest - 1;

    Utilities.sleep(250);
  }

  allCandles.sort(function (a, b) { return a.time - b.time; });

  var out = [];
  for (var k = 0; k < allCandles.length; k++) {
    var cc = allCandles[k];
    var o  = parseFloat(cc.open)  || 0;
    var h  = parseFloat(cc.high)  || 0;
    var l  = parseFloat(cc.low)   || 0;
    var cl = parseFloat(cc.close) || 0;
    var vf = parseFloat(cc.volumefrom) || 0;
    var vt = parseFloat(cc.volumeto)   || 0;

    if (!(o > 0 && h > 0 && l > 0 && cl > 0)) continue;

    var bd   = Math.abs(cl - o);
    var wick = bd > 0 ? ((h - l) / bd) : 0;

    out.push(M2B__makeDataCleanRow_({
      timestamp:   new Date(cc.time * 1000).toISOString(),
      symbol:      systemSymbol,
      marketType:  marketType,
      timeframe:   tfSys,
      open:        o,
      high:        h,
      low:         l,
      close:       cl,
      volume:      vf,
      volumeQuote: vt,
      volumeZar:   0,
      fx:          '',
      source:      'CRYPTOCOMPARE',
      fetchTs:     fetchTs,
      gapFlag:     false,
      staleFlag:   false,
      wickRatio:   wick
    }));
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════
 * AGGREGATE 1H → 4H
 * ═══════════════════════════════════════════════════════════ */

function M2B__aggregateHourlyTo4H_(hourlyRows) {
  if (!hourlyRows.length) return [];
  var cm = M2_COL.DATA_CLEAN;

  var buckets = {};
  var bucketOrder = [];

  for (var i = 0; i < hourlyRows.length; i++) {
    var r = hourlyRows[i];
    var ts = new Date(r[cm.Timestamp]).getTime();
    var hr = Math.floor(ts / 3600000);
    var bucket = Math.floor(hr / 4) * 4;
    var bucketMs = bucket * 3600000;
    var key = String(bucketMs);

    if (!buckets[key]) {
      buckets[key] = [];
      bucketOrder.push(key);
    }
    buckets[key].push(r);
  }

  var out = [];
  for (var j = 0; j < bucketOrder.length; j++) {
    var grp = buckets[bucketOrder[j]];
    if (!grp.length) continue;

    var first = grp[0];
    var aggO = parseFloat(first[cm.Open]);
    var aggH = -Infinity;
    var aggL = Infinity;
    var aggC = parseFloat(grp[grp.length - 1][cm.Close]);
    var aggV = 0, aggVQ = 0;

    for (var k = 0; k < grp.length; k++) {
      var hh = parseFloat(grp[k][cm.High]);
      var ll = parseFloat(grp[k][cm.Low]);
      if (hh > aggH) aggH = hh;
      if (ll < aggL) aggL = ll;
      aggV  += parseFloat(grp[k][cm.Volume]) || 0;
      aggVQ += parseFloat(grp[k][cm.Volume_Quote]) || 0;
    }

    var bd = Math.abs(aggC - aggO);
    var wick = bd > 0 ? ((aggH - aggL) / bd) : 0;

    var row = first.slice();
    row[cm.Timestamp]          = new Date(parseInt(bucketOrder[j], 10)).toISOString();
    row[cm.Open]               = aggO;
    row[cm.High]               = aggH;
    row[cm.Low]                = aggL;
    row[cm.Close]              = aggC;
    row[cm.Volume]             = aggV;
    row[cm.Volume_Quote]       = aggVQ;
    row[cm.Wick_To_Body_Ratio] = wick;
    out.push(row);
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════
 * REFRESH INSTRUMENT VOLUMES
 * ═══════════════════════════════════════════════════════════ */

function M2B_refreshInstrumentVolumes() {
  var ss   = SpreadsheetApp.getActiveSpreadsheet();
  var dc   = M2__readAll_(M2_CONST.SHEETS.DATA_CLEAN);
  var cm   = M2_COL.DATA_CLEAN;
  var inst = ss.getSheetByName(M2_CONST.SHEETS.INSTRUMENTS);
  if (!inst) { Logger.log('[M2B] INSTRUMENTS sheet not found.'); return; }
  var iData = inst.getDataRange().getValues();
  var ic   = M2_COL.INSTRUMENTS;

  var daily = {};
  for (var i = 1; i < dc.length; i++) {
    if (String(dc[i][cm.Timeframe]) !== '1D') continue;
    var sym = String(dc[i][cm.Symbol]);
    if (!daily[sym]) daily[sym] = [];
    daily[sym].push({
      ts:  new Date(dc[i][cm.Timestamp]).getTime(),
      vol: parseFloat(dc[i][cm.Volume_ZAR]) || 0
    });
  }

  var volMap = {};
  var keys = Object.keys(daily);
  for (var k = 0; k < keys.length; k++) {
    var arr = daily[keys[k]];
    arr.sort(function(a, b) { return b.ts - a.ts; });
    var sum = 0;
    var n = Math.min(arr.length, 6);
    for (var j = 0; j < n; j++) sum += arr[j].vol;
    volMap[keys[k]] = n > 0 ? sum / n : 0;
  }

  var updated = 0;
  for (var r = 1; r < iData.length; r++) {
    var s = String(iData[r][ic.Symbol] || '').trim();
    if (s && volMap[s] !== undefined && volMap[s] > 0) {
      inst.getRange(r + 1, ic.Vol_24h_ZAR + 1).setValue(Math.round(volMap[s]));
      updated++;
    }
  }
  Logger.log('[M2B] Refreshed Vol_24h_ZAR for ' + updated + ' instruments.');
}

/* ═══════════════════════════════════════════════════════════
 * DOWNSTREAM CLEANUP
 * ═══════════════════════════════════════════════════════════ */

function M2B__clearDownstreamArtifacts_() {
  var tabs = ['LEVELS', 'INDICATORS', 'SIGNALS', 'BACKTEST_RESULTS'];
  for (var i = 0; i < tabs.length; i++) {
    try {
      M2__clearDataRows_(tabs[i]);
      Logger.log('[M2B] Cleared: ' + tabs[i]);
    } catch (e) {
      Logger.log('[M2B] Could not clear ' + tabs[i] + ': ' + e.message);
    }
  }
}

/* ═══════════════════════════════════════════════════════════
 * MAIN ENTRYPOINT
 * ═══════════════════════════════════════════════════════════ */

function M2B_bootstrapFullActiveUniverse() {
  Logger.log('[M2B] ════════════════════════════════════════════');
  Logger.log('[M2B] BOOTSTRAP v4.0.1 — STARTING (CryptoCompare)');
  Logger.log('[M2B] ════════════════════════════════════════════');

  // Verify key exists early and throw if missing
  M1_secGetCryptoCompareKey();

  var rawStartDate = '2022-01-01';
  try { rawStartDate = M1_cfgGetStr('Backtest_Start_Date') || rawStartDate; } catch (e) {}

  var startDate = M2B__normalizeConfigDateToYmd_(rawStartDate, 'Backtest_Start_Date');
  var startMs   = M2B__ymdToUtcMs_(startDate);
  var startTs   = Math.floor(startMs / 1000);
  var fetchTs   = new Date().toISOString();
  var today     = new Date().toISOString().slice(0, 10);

  Logger.log('[M2B] Backtest_Start_Date = ' + startDate);
  Logger.log('[M2B] startTs (unix sec)  = ' + startTs);

  if (!isFinite(startMs) || startMs > Date.now()) {
    throw new Error('[M2B] Invalid or future Backtest_Start_Date: ' + startDate);
  }

  var targets = M2B__buildBootstrapTargets_();
  if (!targets.length) throw new Error('[M2B] No bootstrap targets from INSTRUMENTS.');
  Logger.log('[M2B] Targets: ' + targets.length);

  var fxMap = M2B__fetchUsdZarDaily_(startDate, today);
  Logger.log('[M2B] FX map: ' + Object.keys(fxMap).length + ' entries');

  var probe = M2B__probeCryptoCompare_('BTC', 'USDT', startTs);
  Logger.log('[M2B] Probe count=' + probe.count + ' msg=' + probe.message);
  if (probe.count === 0) {
    throw new Error('[M2B] CryptoCompare probe returned 0 candles.');
  }

  var tfs = [
    { ccFunc: 'histohour', sys: '4H' },
    { ccFunc: 'histoday',  sys: '1D' }
  ];

  var allRows  = [];
  var failures = [];

  for (var i = 0; i < targets.length; i++) {
    var tgt = targets[i];
    for (var j = 0; j < tfs.length; j++) {
      var tf = tfs[j];
      Logger.log('[M2B] Fetch ' + tgt.systemSymbol + ' [' + tf.sys + ']...');
      try {
        var rows;
        if (tf.ccFunc === 'histoday') {
          rows = M2B__fetchCCPaged_('histoday', tgt.ccBase, 'USDT',
            tgt.systemSymbol, tgt.marketType, tf.sys, startTs, fetchTs);
        } else {
          var hourly = M2B__fetchCCPaged_('histohour', tgt.ccBase, 'USDT',
            tgt.systemSymbol, tgt.marketType, tf.sys, startTs, fetchTs);
          rows = M2B__aggregateHourlyTo4H_(hourly);
        }
        if (tgt.provider === 'SYNTH_ZAR') {
          rows = M2B__convertUsdtRowsToZar_(rows, tgt.systemSymbol, fxMap);
        } else {
          rows = M2B__applyVolumeZar_(rows, fxMap);
        }
        Logger.log('[M2B]   → rows=' + rows.length);
        allRows = allRows.concat(rows);
      } catch (e) {
        Logger.log('[M2B]   → FAILED: ' + e.message);
        failures.push(tgt.systemSymbol + ' [' + tf.sys + '] : ' + e.message);
      }
      Utilities.sleep(250);
    }
  }

  if (!allRows.length) throw new Error('[M2B] No rows fetched.');

  allRows = M2B__dedupRows_(allRows);

  var cm = M2_COL.DATA_CLEAN;
  allRows.sort(function(a, b) {
    var s = String(a[cm.Symbol]).localeCompare(String(b[cm.Symbol]));
    if (s) return s;
    var t = String(a[cm.Timeframe]).localeCompare(String(b[cm.Timeframe]));
    if (t) return t;
    return new Date(a[cm.Timestamp]).getTime() - new Date(b[cm.Timestamp]).getTime();
  });

  M2__validateCleanTimeframeIntegrity_(allRows, cm);

  Logger.log('[M2B] Writing ' + allRows.length + ' rows to DATA_CLEAN...');
  M2__clearDataRows_(M2_CONST.SHEETS.DATA_CLEAN);
  M2__writeFromRow2_(M2_CONST.SHEETS.DATA_CLEAN, allRows);

  try { M2__updateUniverseReliability_(allRows); } catch (e1) {}

  Logger.log('[M2B] ════════════════════════════════════════════');
  Logger.log('[M2B] BOOTSTRAP COMPLETE. Rows: ' + allRows.length);
  if (failures.length) Logger.log('[M2B] Failures: ' + JSON.stringify(failures));
  Logger.log('[M2B] ════════════════════════════════════════════');

  try { M2_auditRebuiltData(); }              catch (e2) {}
  try { M2_logCanonicalHistoryStatus(); }     catch (e3) {}
  try { M2_logBacktestReadyDateEstimate(); }  catch (e4) {}
}

/* ═══════════════════════════════════════════════════════════
 * ONE-SHOT RUNNER
 * ═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
 * SPLIT RUNNERS — avoids 6-minute timeout
 * ═══════════════════════════════════════════════════════════ */

/**
 * PHASE 1: Bootstrap + refresh + filters + indicators
 * Run this first. Takes ~4-5 minutes.
 */
function M2B_runPhase1_Bootstrap() {
  M2B_bootstrapFullActiveUniverse();
  M2B__clearDownstreamArtifacts_();

  try { M2B_refreshInstrumentVolumes(); }    catch (e0) { Logger.log('[M2B] volRefresh: ' + e0.message); }
  try { M2B__diagnoseFilterBlock_(); }       catch (ed) { Logger.log('[M2B] diagFilters: ' + ed.message); }
  try { M2__applyFiltersFG_(); }             catch (e1) { Logger.log('[M2B] filters: ' + e1.message); }
  try { M2_runSpsAndBuildUniverse(); }       catch (e2) { Logger.log('[M2B] SPS: ' + e2.message); }
  try { M3_runIndicatorsAndLevels(); }       catch (e3) { Logger.log('[M2B] indicators: ' + e3.message); }

  Logger.log('[M2B] Phase 1 complete. Now run M2B_runPhase2_Backtest().');
}

/**
 * PHASE 2: Backtest only.
 * Run this AFTER Phase 1 completes. Takes ~3-5 minutes.
 */
function M2B_runPhase2_Backtest() {
  try {
    var btId = M9_runWalkForwardBacktest();
    Logger.log('[M2B] Phase 2 complete. Backtest ID: ' + btId);
  } catch (e) {
    Logger.log('[M2B] Backtest error: ' + e.message);
  }
}

/**
 * COMBINED RUNNER — uses a time-trigger chain to avoid timeout.
 * Phase 1 runs now, Phase 2 auto-triggers 30 seconds later.
 */
function M2B_runBootstrapAndRebuild() {
  M2B_runPhase1_Bootstrap();

  // Auto-schedule Phase 2 to run after a short delay
  try {
    // Delete any old Phase 2 triggers
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === 'M2B_runPhase2_Backtest') {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }
    // Schedule Phase 2 in ~1 minute
    ScriptApp.newTrigger('M2B_runPhase2_Backtest')
      .timeBased()
      .after(60 * 1000)  // 60 seconds
      .create();
    Logger.log('[M2B] Phase 2 auto-scheduled in ~60 seconds.');
  } catch (eTrig) {
    Logger.log('[M2B] Could not auto-schedule Phase 2: ' + eTrig.message);
    Logger.log('[M2B] Run M2B_runPhase2_Backtest() manually.');
  }
}

/* ═══════════════════════════════════════════════════════════
 * FILTER DIAGNOSTICS — logs why instruments are being rejected
 * ═══════════════════════════════════════════════════════════ */

function M2B__diagnoseFilterBlock_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var inst = ss.getSheetByName(M2_CONST.SHEETS.INSTRUMENTS);
  if (!inst) { Logger.log('[M2B][DIAG] No INSTRUMENTS sheet.'); return; }

  var data = inst.getDataRange().getValues();
  var ic = M2_COL.INSTRUMENTS;

  // Read CONFIG thresholds
  var minVol = 0;
  try { minVol = M1_cfgGetNum('Min_Universe_Volume_ZAR') || 0; } catch (e) {}

  Logger.log('[M2B][DIAG] ═══ FILTER DIAGNOSTICS ═══');
  Logger.log('[M2B][DIAG] Min_Universe_Volume_ZAR threshold = ' + minVol);

  for (var i = 1; i < data.length; i++) {
    var sym = String(data[i][ic.Symbol] || '').trim();
    if (!sym) continue;

    var mkt = String(data[i][ic.Market_Type] || '').trim();
    var vol = parseFloat(data[i][ic.Vol_24h_ZAR]) || 0;

    // Check all columns we can see
    var status = 'PASS';
    var reasons = [];

    if (minVol > 0 && vol < minVol) {
      status = 'FAIL';
      reasons.push('Vol_24h_ZAR=' + Math.round(vol) + ' < threshold=' + minVol);
    }

    // Check for Filter_Hard column if it exists
    if (ic.Filter_Hard !== undefined && ic.Filter_Hard >= 0) {
      var fh = String(data[i][ic.Filter_Hard] || '').trim().toUpperCase();
      if (fh === 'FAIL' || fh === 'FALSE' || fh === 'EXCLUDED') {
        status = 'FAIL';
        reasons.push('Filter_Hard=' + fh);
      }
    }

    // Check Active column if it exists
    if (ic.Active !== undefined && ic.Active >= 0) {
      var act = String(data[i][ic.Active] || '').trim().toUpperCase();
      if (act === 'FALSE' || act === 'NO' || act === '0' || act === 'INACTIVE') {
        status = 'FAIL';
        reasons.push('Active=' + act);
      }
    }

    // Log all instruments regardless
    Logger.log('[M2B][DIAG] ' + sym + ' | mkt=' + mkt +
      ' | vol=' + Math.round(vol) +
      ' | ' + status +
      (reasons.length ? ' → ' + reasons.join(', ') : ''));
  }

  // Also dump CONFIG keys that might affect filters
  Logger.log('[M2B][DIAG] ═══ RELEVANT CONFIG KEYS ═══');
  var cfgSheet = ss.getSheetByName('CONFIG');
  if (cfgSheet) {
    var cfgData = cfgSheet.getDataRange().getValues();
    var filterKeys = [
      'Min_Universe_Volume_ZAR', 'Min_Volume_ZAR', 'Min_24h_Volume',
      'Min_Market_Cap', 'Max_Spread_Pct', 'Universe_Filter_Mode',
      'Hard_Filter_Enabled', 'Soft_Filter_Enabled'
    ];
    for (var j = 0; j < cfgData.length; j++) {
      var k = String(cfgData[j][0] || '').trim();
      for (var f = 0; f < filterKeys.length; f++) {
        if (k.toUpperCase().indexOf(filterKeys[f].toUpperCase()) >= 0) {
          Logger.log('[M2B][DIAG] CONFIG: ' + k + ' = ' + cfgData[j][1]);
        }
      }
    }
  }
}

/* ═══════════════════════════════════════════════════════════
 * OPTIONAL: VALR HISTORY AUDIT
 * ═══════════════════════════════════════════════════════════ */

function M2B_verifyValrHistoryDepthAudit() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('VALR_HISTORY_AUDIT') || ss.insertSheet('VALR_HISTORY_AUDIT');
  sh.clearContents();
  var header = ['Symbol','Days_Back','Window_Start','Window_End',
    'Returned_Count','Earliest_Returned','Latest_Returned',
    'Bucket_Sec','Range_Honored','Status'];
  var rows = [header];
  var symbols = ['BTCZAR', 'ETHZAR', 'BTCUSDT', 'XRPUSDT'];
  var daysList = [30, 90, 180, 365];
  for (var i = 0; i < symbols.length; i++) {
    for (var j = 0; j < daysList.length; j++) {
      var daysBack = daysList[j];
      var endMs = Date.now() - (daysBack * 86400000);
      var startMs = endMs - (7 * 86400000);
      var result = M2B__probeValrRange_(symbols[i], startMs, endMs);
      rows.push([symbols[i], daysBack, new Date(startMs).toISOString(),
        new Date(endMs).toISOString(), result.count, result.earliest,
        result.latest, result.bucketSec, result.rangeHonored, result.status]);
      Utilities.sleep(300);
    }
  }
  sh.getRange(1, 1, rows.length, header.length).setValues(rows);
  Logger.log('[M2B] VALR history audit complete.');
}

function M2B__probeValrRange_(slug, startMs, endMs) {
  var base = 'https://api.valr.com';
  var endpoints = [
    '/v1/public/' + slug + '/buckets?startTime=' + encodeURIComponent(new Date(startMs).toISOString()) + '&endTime=' + encodeURIComponent(new Date(endMs).toISOString()) + '&limit=200',
    '/v1/public/' + slug + '/buckets?from=' + encodeURIComponent(new Date(startMs).toISOString()) + '&to=' + encodeURIComponent(new Date(endMs).toISOString()) + '&limit=200'
  ];
  for (var i = 0; i < endpoints.length; i++) {
    try {
      var resp = UrlFetchApp.fetch(base + endpoints[i], { muteHttpExceptions: true });
      if (resp.getResponseCode() < 200 || resp.getResponseCode() >= 300) continue;
      var body = JSON.parse(resp.getContentText());
      var candles = Array.isArray(body) ? body : (body.items || body.candles || []);
      if (!candles.length) continue;
      var times = [];
      for (var k = 0; k < candles.length; k++) {
        var raw = candles[k].startTime || candles[k].openTime || candles[k].timestamp || '';
        var ms = new Date(raw).getTime();
        if (isFinite(ms)) times.push(ms);
      }
      if (!times.length) continue;
      times.sort(function(a, b) { return a - b; });
      var bucketSec = 0;
      if (candles[0].bucketPeriodInSeconds != null) bucketSec = parseInt(candles[0].bucketPeriodInSeconds, 10) || 0;
      else if (times.length >= 2) bucketSec = Math.round((times[1] - times[0]) / 1000);
      var slack = 60000;
      var honored = (times[0] >= startMs - slack && times[times.length - 1] <= endMs + slack);
      return { count: candles.length, earliest: new Date(times[0]).toISOString(),
        latest: new Date(times[times.length - 1]).toISOString(), bucketSec: bucketSec,
        rangeHonored: honored, status: honored ? 'OK' : 'IGNORED_OR_RECENT_ONLY' };
    } catch (e) {}
  }
  return { count: 0, earliest: '', latest: '', bucketSec: 0, rangeHonored: false, status: 'NO_HISTORICAL_MATCH' };
}


function M2B__getBootstrapMinVolZar_() {
  var seed = 0;
  var research = 0;
  var base = 0;

  try { seed = M1_cfgGetNum('Research_Seed_Min_Universe_Volume_ZAR') || 0; } catch (e1) {}
  try { research = M1_cfgGetNum('Research_Min_Universe_Volume_ZAR') || 0; } catch (e2) {}
  try { base = M1_cfgGetNum('Min_Universe_Volume_ZAR') || 0; } catch (e3) {}

  if (isFinite(seed) && seed > 0) return seed;
  if (isFinite(research) && research > 0) return research;
  return isFinite(base) ? base : 0;
}


function M2B_logBootstrapTargets() {
  var minVol = M2B__getBootstrapMinVolZar_();
  var targets = [];

  try {
    targets = M2B__buildBootstrapTargets_();
  } catch (e) {
    Logger.log('[M2B][TARGETS] ERROR: ' + e.message);
    return;
  }

  Logger.log('[M2B][TARGETS] Bootstrap target count=' + targets.length +
             ' | minVolZar=' + minVol);

  if (!targets.length) {
    Logger.log('[M2B][TARGETS] No targets found. Check INSTRUMENTS population, symbol format, market types, and volume thresholds.');
    return;
  }

  for (var i = 0; i < targets.length; i++) {
    Logger.log('[M2B][TARGETS] ' +
      targets[i].systemSymbol +
      ' | provider=' + targets[i].provider +
      ' | mkt=' + targets[i].marketType +
      ' | ccBase=' + targets[i].ccBase);
  }
}


function RUN_M2B_bootstrapResearchUniverse_250k() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('CONFIG');
  if (!sh) throw new Error('CONFIG sheet not found.');

  function upsertConfig_(key, value) {
    var data = sh.getDataRange().getValues();
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0] || '').trim() === key) {
        var oldVal = data[i][1];
        sh.getRange(i + 1, 2).setValue(value);
        Logger.log('[CFG] ' + key + ' updated: ' + oldVal + ' -> ' + value);
        return;
      }
    }
    var nextRow = sh.getLastRow() + 1;
    sh.getRange(nextRow, 1, 1, 2).setValues([[key, value]]);
    Logger.log('[CFG] ' + key + ' created: ' + value);
  }

  Logger.log('[RUN][M2B] ═══════════════════════════════════════');
  Logger.log('[RUN][M2B] Bootstrap research universe @ 250k');
  Logger.log('[RUN][M2B] ═══════════════════════════════════════');

  upsertConfig_('Research_Seed_Min_Universe_Volume_ZAR', 250000);
  SpreadsheetApp.flush();

  M2B_logBootstrapTargets();
  M2B_bootstrapFullActiveUniverse();
  M2_logCanonicalHistoryStatus();

  Logger.log('[RUN][M2B] Bootstrap research universe complete.');
}

function M2B__bootstrapTargetStateKey_() {
  return 'M2B_BOOTSTRAP_STATE';
}

function RUN_clearDataCleanRowsNow() {
  M2__clearDataRows_(M2_CONST.SHEETS.DATA_CLEAN);
  Logger.log('[RUN][M2B] DATA_CLEAN data rows cleared.');
}

function M2B__bootstrapSaveState_(state) {
  PropertiesService.getScriptProperties().setProperty(
    M2B__bootstrapTargetStateKey_(),
    JSON.stringify(state || {})
  );
}

function M2B__bootstrapLoadState_() {
  var raw = PropertiesService.getScriptProperties().getProperty(
    M2B__bootstrapTargetStateKey_()
  );
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function M2B__bootstrapDeleteState_() {
  PropertiesService.getScriptProperties().deleteProperty(
    M2B__bootstrapTargetStateKey_()
  );
}

function M2B__bootstrapDeleteTriggers_() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'M2B_bootstrapResearchUniverseResumableContinue') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

function M2B__bootstrapEnsureTrigger_() {
  M2B__bootstrapDeleteTriggers_();
  ScriptApp.newTrigger('M2B_bootstrapResearchUniverseResumableContinue')
    .timeBased()
    .after(60 * 1000)
    .create();
}

function M2B__fetchOneTargetBothTfs_(tgt, startTs, fetchTs, fxMap) {
  var allRows = [];

  // Direct 4H fetch
  var rows4h = M2B__fetchCCPaged_(
    'histohour',
    tgt.ccBase,
    'USDT',
    tgt.systemSymbol,
    tgt.marketType,
    '4H',
    startTs,
    fetchTs
  );

  // Daily fetch
  var rows1d = M2B__fetchCCPaged_(
    'histoday',
    tgt.ccBase,
    'USDT',
    tgt.systemSymbol,
    tgt.marketType,
    '1D',
    startTs,
    fetchTs
  );

  if (tgt.provider === 'SYNTH_ZAR') {
    rows4h = M2B__convertUsdtRowsToZar_(rows4h, tgt.systemSymbol, fxMap);
    rows1d = M2B__convertUsdtRowsToZar_(rows1d, tgt.systemSymbol, fxMap);
  } else {
    rows4h = M2B__applyVolumeZar_(rows4h, fxMap);
    rows1d = M2B__applyVolumeZar_(rows1d, fxMap);
  }

  allRows = allRows.concat(rows4h).concat(rows1d);
  return allRows;
}

function M2B_bootstrapResearchUniverseResumableStart() {

  var rawStartDate = '2022-01-01';
  try { rawStartDate = M1_cfgGetStr('Backtest_Start_Date') || rawStartDate; }
  catch (e) {}

  var startDate = M2B__normalizeConfigDateToYmd_(rawStartDate,
                                                  'Backtest_Start_Date');
  var startMs   = M2B__ymdToUtcMs_(startDate);
  var startTs   = Math.floor(startMs / 1000);
  var today     = new Date().toISOString().slice(0, 10);

  if (!isFinite(startMs) || startMs > Date.now()) {
    throw new Error('[M2B] Invalid or future Backtest_Start_Date: ' + startDate);
  }

  var targets = M2B__buildBootstrapTargets_();
  if (!targets.length) throw new Error('[M2B] No bootstrap targets.');

  /* quick CC smoke-test */
  var probe = M2B__probeCryptoCompare_('BTC', 'USDT', startTs);
  Logger.log('[M2B] Probe count=' + probe.count + ' msg=' + probe.message);
  if (probe.count === 0) {
    throw new Error('[M2B] CryptoCompare probe returned 0 candles.');
  }

  /* clean slate */
  M2B__bootstrapDeleteTriggers_();
  M2B__clearStagingSheet_();

  var state = {
    phase:        'FETCH',
    startDate:    startDate,
    startTs:      startTs,
    today:        today,
    idx:          0,
    targets:      targets,
    failures:     [],
    startedAt:    new Date().toISOString(),
    lastUpdateAt: new Date().toISOString(),
    totalTargets: targets.length
  };

  M2B__bootstrapSaveState_(state);

  Logger.log('[M2B] Resumable bootstrap start. targets=' +
             targets.length + ' startDate=' + startDate);

  return M2B_bootstrapResearchUniverseResumableContinue();
}


function M2B_bootstrapResearchUniverseResumableContinue() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    Logger.log('[M2B] Lock held by another execution. Rescheduling.');
    M2B__bootstrapEnsureTrigger_();
    return { status: 'LOCKED', idx: -1, total: -1 };
  }

  try {
    var state = M2B__bootstrapLoadState_();
    if (!state) {
      M2B__bootstrapDeleteTriggers_();
      throw new Error('[M2B] No bootstrap state. Run M2B_bootstrapResearchUniverseResumableStart() first.');
    }

    if (state.phase === 'READY_TO_FINALIZE') {
      Logger.log('[M2B] Bootstrap is paused at READY_TO_FINALIZE. Inspect staging, then run RUN_M2B_finalizeAfterStagingCheck().');
      return {
        status: 'READY_TO_FINALIZE',
        idx: state.idx,
        total: state.targets.length
      };
    }

    if (state.phase === 'FINALIZE') {
      return M2B_bootstrapResearchUniverseFinalize_();
    }

    if (state.phase === 'FINALIZE_POST') {
      return M2B_bootstrapResearchUniverseFinalizePost_();
    }

    var runStartMs = new Date().getTime();
    var maxRunMs = 4.5 * 60 * 1000;
    var reserveMs = 90 * 1000;
    var fetchTs = new Date().toISOString();
    var fxMap = M2B__fetchUsdZarDaily_(state.startDate, state.today);

    Logger.log('[M2B] ════════════════════════════════════════════');
    Logger.log('[M2B] Resumable bootstrap continue idx=' + state.idx + '/' + state.targets.length);
    Logger.log('[M2B] startDate=' + state.startDate);
    Logger.log('[M2B] ════════════════════════════════════════════');

    while (state.idx < state.targets.length) {
      var elapsed = new Date().getTime() - runStartMs;
      if (elapsed >= maxRunMs - reserveMs) {
        state.lastUpdateAt = new Date().toISOString();
        M2B__bootstrapSaveState_(state);
        M2B__bootstrapEnsureTrigger_();
        Logger.log('[M2B] Budget guard: pausing at idx=' +
                   state.idx + '/' + state.targets.length +
                   ' (elapsed=' + Math.round(elapsed / 1000) + 's)');
        return {
          status: 'PAUSED',
          idx: state.idx,
          total: state.targets.length
        };
      }

      var tgt = state.targets[state.idx];
      Logger.log('[M2B] Fetch ' + tgt.systemSymbol +
                 ' (' + (state.idx + 1) + '/' + state.targets.length + ')...');

      try {
        var rows = M2B__fetchOneTargetBothTfs_(tgt, state.startTs, fetchTs, fxMap);
        Logger.log('[M2B]   → rows=' + rows.length);

        if (rows && rows.length) {
          rows = M2B__dedupRows_(rows);
          M2B__appendToStaging_(rows);
        }
      } catch (e) {
        Logger.log('[M2B]   → FAILED: ' + e.message);
        if (!state.failures) state.failures = [];
        state.failures.push({
          idx: state.idx,
          symbol: tgt.systemSymbol,
          msg: String(e.message).substring(0, 120),
          at: new Date().toISOString()
        });
      }

      state.idx++;
      state.lastUpdateAt = new Date().toISOString();
      M2B__bootstrapSaveState_(state);

      Utilities.sleep(100);
    }

    Logger.log('[M2B] All targets fetched. Pausing for staging inspection...');
    state.phase = 'READY_TO_FINALIZE';
    state.lastUpdateAt = new Date().toISOString();
    M2B__bootstrapSaveState_(state);

    M2B__bootstrapDeleteTriggers_();

    Logger.log('[M2B] State set to READY_TO_FINALIZE. Run M2B_logStagingSymbolCounts(), then RUN_M2B_finalizeAfterStagingCheck().');

    return {
      status: 'READY_TO_FINALIZE',
      idx: state.idx,
      total: state.targets.length
    };

  } finally {
    try { lock.releaseLock(); } catch (e4) {}
  }
}

function RUN_M2B_finalizeAfterStagingCheck() {
  var state = M2B__bootstrapLoadState_();
  if (!state) throw new Error('[RUN][M2B] No bootstrap state found.');

  if (state.phase !== 'READY_TO_FINALIZE') {
    throw new Error('[RUN][M2B] Bootstrap is not at READY_TO_FINALIZE. Current phase=' + state.phase);
  }

  state.phase = 'FINALIZE';
  state.lastUpdateAt = new Date().toISOString();
  M2B__bootstrapSaveState_(state);

  Logger.log('[RUN][M2B] Phase advanced from READY_TO_FINALIZE → FINALIZE.');

  return M2B_bootstrapResearchUniverseResumableContinue();
}


function RUN_M2B_resetAndRestart_250k_2022() {
  Logger.log('[RUN][M2B] ═══════════════════════════════════════');
  Logger.log('[RUN][M2B] Reset + restart bootstrap (250k, 2022-01-01)');
  Logger.log('[RUN][M2B] ═══════════════════════════════════════');

  try { M2B_bootstrapResearchUniverseResumableCancel(); } catch (e1) { Logger.log('[RUN][M2B] cancel: ' + e1.message); }
  try { M2B__clearStagingSheet_(); } catch (e2) { Logger.log('[RUN][M2B] clearStaging: ' + e2.message); }
  try { M2__clearDataRows_(M2_CONST.SHEETS.DATA_CLEAN); } catch (e3) { Logger.log('[RUN][M2B] clearDataClean: ' + e3.message); }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('CONFIG');
  if (!sh) throw new Error('CONFIG sheet not found.');

  function upsertConfig_(key, value) {
    var data = sh.getDataRange().getValues();
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0] || '').trim() === key) {
        var oldVal = data[i][1];
        sh.getRange(i + 1, 2).setValue(value);
        Logger.log('[CFG] ' + key + ' updated: ' + oldVal + ' -> ' + value);
        return;
      }
    }
    var nextRow = sh.getLastRow() + 1;
    sh.getRange(nextRow, 1, 1, 2).setValues([[key, value]]);
    Logger.log('[CFG] ' + key + ' created: ' + value);
  }

  upsertConfig_('Research_Seed_Min_Universe_Volume_ZAR', 250000);
  upsertConfig_('Backtest_Start_Date', '2022-01-01');
  SpreadsheetApp.flush();

  M2B_logBootstrapTargets();

  return M2B_bootstrapResearchUniverseResumableStart();
}

function RUN_clearM2BStagingNow() {
  M2B__clearStagingSheet_();
}

function M2B_bootstrapResearchUniverseResumableCancel() {
  try { M2B__bootstrapDeleteTriggers_(); } catch (e1) { Logger.log('[M2B] deleteTriggers: ' + e1.message); }
  try { M2B__bootstrapDeleteState_(); } catch (e2) { Logger.log('[M2B] deleteState: ' + e2.message); }
  Logger.log('[M2B] Resumable bootstrap canceled.');
}

function RUN_M2B_bootstrapResearchUniverse_250k_resumable() {

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('CONFIG');
  if (!sh) throw new Error('CONFIG sheet not found.');

  function upsertConfig_(key, value) {
    var data = sh.getDataRange().getValues();
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0] || '').trim() === key) {
        var oldVal = data[i][1];
        sh.getRange(i + 1, 2).setValue(value);
        Logger.log('[CFG] ' + key + ' updated: ' + oldVal + ' -> ' + value);
        return;
      }
    }
    var nextRow = sh.getLastRow() + 1;
    sh.getRange(nextRow, 1, 1, 2).setValues([[key, value]]);
    Logger.log('[CFG] ' + key + ' created: ' + value);
  }

  Logger.log('[RUN][M2B] ═══════════════════════════════════════');
  Logger.log('[RUN][M2B] Bootstrap research universe resumable');
  Logger.log('[RUN][M2B] ═══════════════════════════════════════');

  upsertConfig_('Research_Seed_Min_Universe_Volume_ZAR', 250000);
  upsertConfig_('Backtest_Start_Date', '2022-01-01');
  SpreadsheetApp.flush();

  return M2B_bootstrapResearchUniverseResumableStart();
}


function M2B_bootstrapResearchUniverseResumableStatus() {

  var state = M2B__bootstrapLoadState_();
  if (!state) {
    Logger.log('[M2B] No active bootstrap state.');
    return { active: false };
  }

  var failCount = (state.failures ? state.failures.length : 0);

  Logger.log('[M2B] Bootstrap status:' +
    ' phase='        + (state.phase || 'FETCH') +
    ' idx='          + state.idx + '/' + state.targets.length +
    ' startDate='    + state.startDate +
    ' startedAt='    + state.startedAt +
    ' lastUpdateAt=' + state.lastUpdateAt +
    ' failures='     + failCount);

  if (state.failures && state.failures.length) {
    for (var i = 0; i < state.failures.length; i++) {
      Logger.log('[M2B]   FAIL: ' + state.failures[i].symbol +
                 ' — ' + state.failures[i].msg);
    }
  }

  return {
    active:       true,
    phase:        state.phase || 'FETCH',
    idx:          state.idx,
    total:        state.targets.length,
    startDate:    state.startDate,
    startedAt:    state.startedAt,
    lastUpdateAt: state.lastUpdateAt,
    failures:     failCount
  };
}


function M2B__stagingSheetName_() {
  return 'DATA_CLEAN_STAGING';
}

function M2B__ensureStagingSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(M2B__stagingSheetName_());
  if (!sh) {
    sh = ss.insertSheet(M2B__stagingSheetName_());
    var src = ss.getSheetByName(M2_CONST.SHEETS.DATA_CLEAN);
    if (src && src.getLastRow() >= 1) {
      var hdr = src.getRange(1, 1, 1, src.getLastColumn()).getValues();
      sh.getRange(1, 1, 1, hdr[0].length).setValues(hdr);
    }
  }
  return sh;
}


function M2B__clearStagingSheet_() {
  var sh = M2B__ensureStagingSheet_();
  var lastRow = sh.getLastRow();
  if (lastRow > 1) {
    sh.getRange(2, 1, lastRow - 1, sh.getLastColumn()).clearContent();
  }
}


function M2B__appendToStaging_(rows) {
  if (!rows || !rows.length) return;

  var sh = M2B__ensureStagingSheet_();
  var chunkSize = 2000;
  var width = rows[0].length;

  for (var i = 0; i < rows.length; i += chunkSize) {
    var chunk = rows.slice(i, i + chunkSize);
    var nextRow = sh.getLastRow() + 1;
    sh.getRange(nextRow, 1, chunk.length, width).setValues(chunk);
    SpreadsheetApp.flush();
    Utilities.sleep(50);
  }
}

function M2B_bootstrapResearchUniverseFinalize_() {
  var state = M2B__bootstrapLoadState_();
  if (!state) {
    throw new Error('[M2B] No bootstrap state for finalize.');
  }

  Logger.log('[M2B] ════════════════════════════════════════════');
  Logger.log('[M2B] FINALIZE PHASE 1 — resumable streaming transfer staging → DATA_CLEAN');
  Logger.log('[M2B] ════════════════════════════════════════════');

  var staging = M2B__ensureStagingSheet_();
  var cleanSh = M2__sh_(M2_CONST.SHEETS.DATA_CLEAN);

  var stagingLastRow = staging.getLastRow();
  var stagingLastCol = staging.getLastColumn();

  if (!stagingLastRow || stagingLastRow < 2) {
    throw new Error('[M2B] Staging sheet is empty — nothing to finalize.');
  }

  var runStartMs = new Date().getTime();
  var maxRunMs = 4.5 * 60 * 1000;
  var reserveMs = 60 * 1000;

  if (!state.finalizeTransfer) {
    Logger.log('[M2B] Initializing finalize transfer state...');
    M2__clearDataRows_(M2_CONST.SHEETS.DATA_CLEAN);

    state.finalizeTransfer = {
      srcRow: 2,
      targetRow: 2,
      totalMoved: 0,
      totalRows: stagingLastRow - 1,
      startedAt: new Date().toISOString()
    };
    M2B__bootstrapSaveState_(state);
  }

  var srcRow = state.finalizeTransfer.srcRow;
  var targetRow = state.finalizeTransfer.targetRow;
  var totalMoved = state.finalizeTransfer.totalMoved;
  var totalRows = state.finalizeTransfer.totalRows;

  Logger.log('[M2B] Finalize progress start: srcRow=' + srcRow +
             ' targetRow=' + targetRow +
             ' totalMoved=' + totalMoved +
             ' totalRows=' + totalRows);

  var chunkSize = 5000;

  while (srcRow <= stagingLastRow) {
    var elapsed = new Date().getTime() - runStartMs;
    if (elapsed >= maxRunMs - reserveMs) {
      state.finalizeTransfer.srcRow = srcRow;
      state.finalizeTransfer.targetRow = targetRow;
      state.finalizeTransfer.totalMoved = totalMoved;
      state.lastUpdateAt = new Date().toISOString();
      M2B__bootstrapSaveState_(state);
      M2B__bootstrapEnsureTrigger_();

      Logger.log('[M2B] Finalize budget guard: pausing transfer at totalMoved=' +
                 totalMoved + ' / ' + totalRows +
                 ' (elapsed=' + Math.round(elapsed / 1000) + 's)');

      return {
        status: 'FINALIZE_PAUSED',
        rows: totalMoved,
        total: totalRows
      };
    }

    var n = Math.min(chunkSize, stagingLastRow - srcRow + 1);
    var chunk = staging.getRange(srcRow, 1, n, stagingLastCol).getValues();

    cleanSh.getRange(targetRow, 1, n, stagingLastCol).setValues(chunk);
    staging.getRange(srcRow, 1, n, stagingLastCol).clearContent();

    totalMoved += n;
    srcRow += n;
    targetRow += n;

    state.finalizeTransfer.srcRow = srcRow;
    state.finalizeTransfer.targetRow = targetRow;
    state.finalizeTransfer.totalMoved = totalMoved;
    state.lastUpdateAt = new Date().toISOString();
    M2B__bootstrapSaveState_(state);

    SpreadsheetApp.flush();
    Utilities.sleep(100);

    Logger.log('[M2B] Moved chunk: rows=' + n + ' totalMoved=' + totalMoved + ' / ' + totalRows);
  }

  state.phase = 'FINALIZE_POST';
  state.finalizeRows = totalMoved;
  delete state.finalizeTransfer;
  state.lastUpdateAt = new Date().toISOString();
  M2B__bootstrapSaveState_(state);

  M2B__bootstrapEnsureTrigger_();

  Logger.log('[M2B] FINALIZE PHASE 1 complete. Moved rows=' + totalMoved + '. Scheduled FINALIZE_POST.');
  return {
    status: 'FINALIZE_POST_SCHEDULED',
    rows: totalMoved,
    failures: (state.failures || []).length
  };
}


function M2B_bootstrapResearchUniverseFinalizePost_() {
  var state = M2B__bootstrapLoadState_();
  if (!state) {
    throw new Error('[M2B] No bootstrap state for finalize post.');
  }

  Logger.log('[M2B] ════════════════════════════════════════════');
  Logger.log('[M2B] FINALIZE PHASE 2 — post-processing + cleanup');
  Logger.log('[M2B] ════════════════════════════════════════════');

  var rows = M2__readAll_(M2_CONST.SHEETS.DATA_CLEAN);
  var dataRows = rows && rows.length > 1 ? rows.slice(1) : [];

  Logger.log('[M2B] DATA_CLEAN rows read for post-processing: ' + dataRows.length);

  try { M2__updateUniverseReliability_(dataRows); } catch (e1) { Logger.log('[M2B] reliability: ' + e1.message); }
  try { M2_auditRebuiltData(); } catch (e2) { Logger.log('[M2B] audit: ' + e2.message); }
  try { M2_logCanonicalHistoryStatus(); } catch (e3) { Logger.log('[M2B] history: ' + e3.message); }
  try { M2_logBacktestReadyDateEstimate(); } catch (e4) { Logger.log('[M2B] readyDate: ' + e4.message); }

  if (state.failures && state.failures.length) {
    Logger.log('[M2B] ═══ FAILURES (' + state.failures.length + ') ═══');
    for (var f = 0; f < state.failures.length; f++) {
      Logger.log('[M2B]   ' + state.failures[f].symbol + ': ' + state.failures[f].msg);
    }
  }

  try { M2B__bootstrapDeleteTriggers_(); } catch (e5) { Logger.log('[M2B] deleteTriggers: ' + e5.message); }
  try { M2B__bootstrapDeleteState_(); } catch (e6) { Logger.log('[M2B] deleteState: ' + e6.message); }

  try {
    var staging = M2B__ensureStagingSheet_();
    var lr = staging.getLastRow();
    var lc = staging.getLastColumn();
    if (lr > 1 && lc > 0) {
      staging.getRange(2, 1, lr - 1, lc).clearContent();
    }
  } catch (e7) {
    Logger.log('[M2B] clearStaging: ' + e7.message);
  }

  Logger.log('[M2B] ════════════════════════════════════════════');
  Logger.log('[M2B] BOOTSTRAP COMPLETE. Rows: ' + dataRows.length +
             ' Failures: ' + (state.failures ? state.failures.length : 0));
  Logger.log('[M2B] ════════════════════════════════════════════');

  return {
    status: 'DONE',
    rows: dataRows.length,
    failures: (state.failures || []).length
  };
}

function M2B_logStagingSymbolCounts() {
  var sh = M2B__ensureStagingSheet_();
  var data = sh.getDataRange().getValues();
  var cm = M2_COL.DATA_CLEAN;
  var counts = {};

  if (!data || data.length < 2) {
    Logger.log('[M2B] STAGING empty.');
    return;
  }

  for (var i = 1; i < data.length; i++) {
    var sym = String(data[i][cm.Symbol] || '').trim();
    var tf = String(data[i][cm.Timeframe] || '').trim();
    if (!sym || !tf) continue;

    var key = sym + ' | ' + tf;
    counts[key] = (counts[key] || 0) + 1;
  }

  var keys = Object.keys(counts).sort();
  Logger.log('[M2B] STAGING buckets=' + keys.length);

  for (var j = 0; j < keys.length; j++) {
    Logger.log('[M2B] ' + keys[j] + ' -> ' + counts[keys[j]]);
  }
}


function M2B__fetchWithBackoff_(url, opts, maxAttempts) {
  var attempts = maxAttempts || 5;
  var lastErr = null;

  for (var i = 0; i < attempts; i++) {
    try {
      var resp = UrlFetchApp.fetch(url, opts || { muteHttpExceptions: true });
      var code = resp.getResponseCode();
      var body = resp.getContentText() || '';

      // Retry on obvious transient/rate/bandwidth failures
      if (code === 429 ||
          code === 408 ||
          code === 500 ||
          code === 502 ||
          code === 503 ||
          code === 504 ||
          body.indexOf('Bandwidth quota exceeded') !== -1 ||
          body.indexOf('rate limit') !== -1 ||
          body.indexOf('Rate limit') !== -1) {
        lastErr = new Error('Transient fetch error. HTTP=' + code + ' body=' + body.substring(0, 200));
      } else {
        return resp;
      }
    } catch (e) {
      lastErr = e;
    }

    var sleepMs = Math.min(16000, Math.pow(2, i) * 1000 + Math.floor(Math.random() * 500));
    Logger.log('[M2B] fetch retry ' + (i + 1) + '/' + attempts + ' after ' + sleepMs + 'ms');
    Utilities.sleep(sleepMs);
  }

  throw lastErr || new Error('[M2B] fetchWithBackoff failed without specific error');
}


function M2B_diagFetchOneTarget_(systemSymbol) {
  var rawStartDate = '2022-01-01';
  try { rawStartDate = M1_cfgGetStr('Backtest_Start_Date') || rawStartDate; } catch (e) {}

  var startDate = M2B__normalizeConfigDateToYmd_(rawStartDate, 'Backtest_Start_Date');
  var startTs = Math.floor(M2B__ymdToUtcMs_(startDate) / 1000);
  var fetchTs = new Date().toISOString();
  var today = new Date().toISOString().slice(0, 10);
  var fxMap = M2B__fetchUsdZarDaily_(startDate, today);

  var targets = M2B__buildBootstrapTargets_();
  var tgt = null;

  for (var i = 0; i < targets.length; i++) {
    if (targets[i].systemSymbol === systemSymbol) {
      tgt = targets[i];
      break;
    }
  }

  if (!tgt) throw new Error('[M2B] Target not found: ' + systemSymbol);

  Logger.log('[M2B][DIAG] Target=' + tgt.systemSymbol +
             ' provider=' + tgt.provider +
             ' marketType=' + tgt.marketType +
             ' ccBase=' + tgt.ccBase);

  var rows = M2B__fetchOneTargetBothTfs_(tgt, startTs, fetchTs, fxMap);

  Logger.log('[M2B][DIAG] fetched rows total=' + rows.length);

  var cm = M2_COL.DATA_CLEAN;
  var counts = {};
  var minTs = {};
  var maxTs = {};

  for (var r = 0; r < rows.length; r++) {
    var tf = String(rows[r][cm.Timeframe] || '');
    var key = tgt.systemSymbol + ' | ' + tf;
    var ms = new Date(rows[r][cm.Timestamp]).getTime();
    counts[key] = (counts[key] || 0) + 1;

    if (!minTs[key] || ms < minTs[key]) minTs[key] = ms;
    if (!maxTs[key] || ms > maxTs[key]) maxTs[key] = ms;
  }

  var keys = Object.keys(counts).sort();
  for (var j = 0; j < keys.length; j++) {
    Logger.log('[M2B][DIAG] ' + keys[j] +
               ' rows=' + counts[keys[j]] +
               ' first=' + new Date(minTs[keys[j]]).toISOString() +
               ' last=' + new Date(maxTs[keys[j]]).toISOString());
  }

  var sampleN = Math.min(10, rows.length);
  for (var s = 0; s < sampleN; s++) {
    Logger.log('[M2B][DIAG][ROW ' + s + '] ' + JSON.stringify(rows[s]));
  }
}


function M2B_diagFetchAllTargetsSummary() {
  var rawStartDate = '2022-01-01';
  try { rawStartDate = M1_cfgGetStr('Backtest_Start_Date') || rawStartDate; } catch (e) {}

  var startDate = M2B__normalizeConfigDateToYmd_(rawStartDate, 'Backtest_Start_Date');
  var startTs = Math.floor(M2B__ymdToUtcMs_(startDate) / 1000);
  var fetchTs = new Date().toISOString();
  var today = new Date().toISOString().slice(0, 10);
  var fxMap = M2B__fetchUsdZarDaily_(startDate, today);

  var targets = M2B__buildBootstrapTargets_();
  var cm = M2_COL.DATA_CLEAN;

  Logger.log('[M2B][DIAG] Fetch summary start. targets=' + targets.length);

  for (var i = 0; i < targets.length; i++) {
    var tgt = targets[i];
    try {
      var rows = M2B__fetchOneTargetBothTfs_(tgt, startTs, fetchTs, fxMap);

      var tfCounts = {};
      var min4 = null, max4 = null, min1 = null, max1 = null;

      for (var r = 0; r < rows.length; r++) {
        var tf = String(rows[r][cm.Timeframe] || '');
        var ms = new Date(rows[r][cm.Timestamp]).getTime();

        tfCounts[tf] = (tfCounts[tf] || 0) + 1;

        if (tf === '4H') {
          if (min4 === null || ms < min4) min4 = ms;
          if (max4 === null || ms > max4) max4 = ms;
        } else if (tf === '1D') {
          if (min1 === null || ms < min1) min1 = ms;
          if (max1 === null || ms > max1) max1 = ms;
        }
      }

      Logger.log('[M2B][DIAG] ' + tgt.systemSymbol +
        ' | 4H=' + (tfCounts['4H'] || 0) +
        ' | 1D=' + (tfCounts['1D'] || 0) +
        ' | first4H=' + (min4 === null ? '' : new Date(min4).toISOString()) +
        ' | last4H=' + (max4 === null ? '' : new Date(max4).toISOString()) +
        ' | first1D=' + (min1 === null ? '' : new Date(min1).toISOString()) +
        ' | last1D=' + (max1 === null ? '' : new Date(max1).toISOString()));
    } catch (e2) {
      Logger.log('[M2B][DIAG] ' + tgt.systemSymbol + ' FAILED: ' + e2.message);
    }

    Utilities.sleep(250);
  }

  Logger.log('[M2B][DIAG] Fetch summary complete.');
}

function RUN_M2B_diagFetch_BTC_USDTPERP() {
  M2B_diagFetchOneTarget_('BTC/USDTPERP');
}

function RUN_M2B_diagFetch_SOL_USDTPERP() {
  M2B_diagFetchOneTarget_('SOL/USDTPERP');
}







/*
══════════════════════════════════════════════════════════════
M2_SupabaseBridge.gs
Minimal read-only bridge from Supabase canonical history to Apps Script.
Phase 1 only: fetch candles, fetch coverage, audit dataset.
══════════════════════════════════════════════════════════════
*/

function M2__sbUrl_() {
  var v = '';
  try {
    var sp = PropertiesService.getScriptProperties();
    v =
      sp.getProperty('SUPABASE_URL') ||
      sp.getProperty('SB_URL') ||
      '';
  } catch (e1) {}

  if (!v) throw new Error('[M2][SB] Missing SUPABASE_URL in Script Properties.');
  return String(v).replace(/\/+$/, '');
}

function M2__sbKey_() {
  var v = '';
  try {
    var sp = PropertiesService.getScriptProperties();
    v =
      sp.getProperty('SUPABASE_API_KEY') ||
      sp.getProperty('SUPABASE_KEY') ||
      '';
  } catch (e1) {}

  if (!v) {
    throw new Error('[M2][SB] Missing Supabase API key in Script Properties.');
  }
  return v;
}

function M2__sbHeaders_() {
  var key = M2__sbKey_();
  return {
    'apikey': key,
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json'
  };
}

function M2__sbFetchJson_(path) {
  var url = M2__sbUrl_() + path;
  var resp = UrlFetchApp.fetch(url, {
    method: 'get',
    muteHttpExceptions: true,
    headers: M2__sbHeaders_()
  });

  var code = resp.getResponseCode();
  var body = resp.getContentText();

  if (code < 200 || code >= 300) {
    throw new Error('[M2][SB] HTTP ' + code + ' on ' + path + ': ' + body);
  }

  return JSON.parse(body);
}

function M2_sbGetCoverageRows_(datasetId) {
  if (!datasetId) throw new Error('[M2][SB] datasetId required');
  var q =
    '/rest/v1/dataset_symbol_coverage' +
    '?dataset_id=eq.' + encodeURIComponent(datasetId) +
    '&select=dataset_id,symbol,market_type,timeframe,first_ts,last_ts,row_count,gap_count,duplicate_count,freshness_lag_hours,is_ready,notes' +
    '&order=symbol.asc,timeframe.asc';
  return M2__sbFetchJson_(q);
}

function M2_sbGetCanonicalHistoryStatus_(datasetId) {
  var rows = M2_sbGetCoverageRows_(datasetId);
  var result = {
    ready: false,
    dataset_id: datasetId,
    rows: rows,
    summary: {
      totalRows: rows.length,
      readyRows: 0
    }
  };

  for (var i = 0; i < rows.length; i++) {
    if (rows[i].is_ready === true) result.summary.readyRows++;
  }

  result.ready = result.summary.readyRows > 0;
  return result;
}

function M2_sbFetchCandles_(datasetId, symbol, timeframe, marketType) {
  if (!datasetId) throw new Error('[M2][SB] datasetId required');
  if (!symbol) throw new Error('[M2][SB] symbol required');
  if (!timeframe) throw new Error('[M2][SB] timeframe required');
  if (!marketType) throw new Error('[M2][SB] marketType required');

  var all = [];
  var offset = 0;
  var pageSize = 1000;

  while (true) {
    var q =
      '/rest/v1/market_candles' +
      '?dataset_id=eq.' + encodeURIComponent(datasetId) +
      '&symbol=eq.' + encodeURIComponent(symbol) +
      '&timeframe=eq.' + encodeURIComponent(timeframe) +
      '&market_type=eq.' + encodeURIComponent(marketType) +
      '&select=dataset_id,symbol,market_type,timeframe,ts,open,high,low,close,volume,source,is_stale_filled' +
      '&order=ts.asc' +
      '&limit=' + pageSize +
      '&offset=' + offset;

    var rows = M2__sbFetchJson_(q);
    if (!rows || !rows.length) break;

    for (var i = 0; i < rows.length; i++) all.push(rows[i]);

    if (rows.length < pageSize) break;
    offset += pageSize;
  }

  return all;
}



function RUN_M2_sbAuditDatasetNow() {
  var datasetId = 'OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1';

  Logger.log('[RUN][M2][SB] ═══════════════════════════════════════');
  Logger.log('[RUN][M2][SB] Supabase dataset audit starting');
  Logger.log('[RUN][M2][SB] dataset=' + datasetId);
  Logger.log('[RUN][M2][SB] ═══════════════════════════════════════');

  var hs = M2_sbGetCanonicalHistoryStatus_(datasetId);
  Logger.log('[RUN][M2][SB] ready=' + hs.ready +
             ' readyRows=' + hs.summary.readyRows +
             ' totalRows=' + hs.summary.totalRows);

  M2_sbAuditOneSymbol_(datasetId, 'BTC');
  M2_sbAuditOneSymbol_(datasetId, 'ETH');
  M2_sbAuditOneSymbol_(datasetId, 'SOL');
  M2_sbAuditOneSymbol_(datasetId, 'XRP');
  M2_sbAuditOneSymbol_(datasetId, 'DOGE');

  Logger.log('[RUN][M2][SB] Supabase dataset audit complete');
}

function M2_sbCandlesToDataCleanRows_(sbRows) {
  var out = [];
  if (!sbRows || !sbRows.length) return out;

  for (var i = 0; i < sbRows.length; i++) {
    var r = sbRows[i];
    var o = parseFloat(r.open) || 0;
    var h = parseFloat(r.high) || 0;
    var l = parseFloat(r.low) || 0;
    var c = parseFloat(r.close) || 0;
    var v = parseFloat(r.volume) || 0;

    if (!(o > 0 && h > 0 && l > 0 && c > 0)) continue;

    var body = Math.abs(c - o);
    var wick = body > 0 ? ((h - l) / body) : 0;

    var row = new Array(17).fill('');
    row[M2_COL.DATA_CLEAN.Timestamp] = M2__toIsoUtc_(r.ts);
    row[M2_COL.DATA_CLEAN.Symbol] = String(r.symbol || '');
    row[M2_COL.DATA_CLEAN.Market_Type] = String(r.market_type || '').toUpperCase() === 'PERP' ? 'PERP' : 'SPOT_MARGIN';
    row[M2_COL.DATA_CLEAN.Timeframe] = String(r.timeframe || '');
    row[M2_COL.DATA_CLEAN.Open] = o;
    row[M2_COL.DATA_CLEAN.High] = h;
    row[M2_COL.DATA_CLEAN.Low] = l;
    row[M2_COL.DATA_CLEAN.Close] = c;
    row[M2_COL.DATA_CLEAN.Volume] = v;
    row[M2_COL.DATA_CLEAN.Volume_Quote] = '';
    row[M2_COL.DATA_CLEAN.Volume_ZAR] = '';
    row[M2_COL.DATA_CLEAN.USDT_ZAR_Rate_At_Fetch] = '';
    row[M2_COL.DATA_CLEAN.Source] = String(r.source || 'SUPABASE');
    row[M2_COL.DATA_CLEAN.Fetch_Timestamp] = M2__nowIso_();
    row[M2_COL.DATA_CLEAN.Gap_Flag] = false;
    row[M2_COL.DATA_CLEAN.Stale_Flag] = !!r.is_stale_filled;
    row[M2_COL.DATA_CLEAN.Wick_To_Body_Ratio] = wick;

    out.push(row);
  }

  return out;
}

function M2_sbFetchDataCleanRows_(datasetId, symbol, timeframe, marketType) {
  var sbRows = M2_sbFetchCandles_(datasetId, symbol, timeframe, marketType);
  return M2_sbCandlesToDataCleanRows_(sbRows);
}

function M2_sbRequireCanonicalHistoryForBacktest_(datasetId) {
  var hs = M2_sbGetCanonicalHistoryStatus_(datasetId);
  if (!hs || !hs.ready) {
    throw new Error('[M2][SB] BACKTEST_BLOCKED: No ready Supabase history for dataset ' + datasetId);
  }

  var ready = [];
  var seen = {};

  for (var i = 0; i < hs.rows.length; i++) {
    var r = hs.rows[i];
    if (r.is_ready === true) {
      var sym = String(r.symbol || '');
      if (sym && !seen[sym]) {
        seen[sym] = true;
        ready.push(sym);
      }
    }
  }

  if (!ready.length) {
    throw new Error('[M2][SB] BACKTEST_BLOCKED: No ready symbols found in coverage.');
  }

  return ready;
}

function M2_sbAuditOneSymbol_(datasetId, baseSymbol) {
  var checks = [
    { symbol: baseSymbol + '/USDT', marketType: 'spot', timeframe: '1D' },
    { symbol: baseSymbol + '/USDT', marketType: 'spot', timeframe: '4H' },
    { symbol: baseSymbol + '/USDTPERP', marketType: 'perp', timeframe: '1D' },
    { symbol: baseSymbol + '/USDTPERP', marketType: 'perp', timeframe: '4H' }
  ];

  Logger.log('[M2][SB][AUDIT] dataset=' + datasetId + ' base=' + baseSymbol);

  for (var i = 0; i < checks.length; i++) {
    var x = checks[i];
    try {
      var rows = M2_sbFetchCandles_(datasetId, x.symbol, x.timeframe, x.marketType);
      Logger.log('[M2][SB][AUDIT] ' +
        x.symbol + ' | ' + x.marketType + ' | ' + x.timeframe +
        ' | rows=' + rows.length);
      if (rows.length) {
        Logger.log('[M2][SB][AUDIT] first=' + rows[0].ts + ' last=' + rows[rows.length - 1].ts);
      }
    } catch (e) {
      Logger.log('[M2][SB][AUDIT] ERROR ' +
        x.symbol + ' | ' + x.marketType + ' | ' + x.timeframe +
        ' | ' + e.message);
    }
  }
}


function RUN_M2_sbAuditDatasetNow() {
  var datasetId = 'OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1';

  Logger.log('[RUN][M2][SB] ═══════════════════════════════════════');
  Logger.log('[RUN][M2][SB] Supabase dataset audit starting');
  Logger.log('[RUN][M2][SB] dataset=' + datasetId);
  Logger.log('[RUN][M2][SB] ═══════════════════════════════════════');

  var hs = M2_sbGetCanonicalHistoryStatus_(datasetId);
  Logger.log('[RUN][M2][SB] ready=' + hs.ready +
             ' readyRows=' + hs.summary.readyRows +
             ' totalRows=' + hs.summary.totalRows);

  M2_sbAuditOneSymbol_(datasetId, 'BTC');
  M2_sbAuditOneSymbol_(datasetId, 'ETH');
  M2_sbAuditOneSymbol_(datasetId, 'SOL');
  M2_sbAuditOneSymbol_(datasetId, 'XRP');
  M2_sbAuditOneSymbol_(datasetId, 'DOGE');

  Logger.log('[RUN][M2][SB] Supabase dataset audit complete');
}






function M2__activeCanonicalDatasetId_() {
  try {
    var sp = PropertiesService.getScriptProperties();
    var v =
      sp.getProperty('ACTIVE_DATASET_ID') ||
      '';
    if (v) return String(v).trim();
  } catch (e1) {}
  return 'OKX_MAJORSPOTPERP_USDT_2022_2026_SUPABASE_V1';
}

function M2__useSupabaseCanonicalHistory_() {
  try {
    var sp = PropertiesService.getScriptProperties();
    var v = sp.getProperty('USE_SUPABASE_CANONICAL_HISTORY') || 'TRUE';
    v = String(v).trim().toUpperCase();
    return (v === 'TRUE' || v === '1' || v === 'YES' || v === 'ON');
  } catch (e1) {}
  return true;
}
