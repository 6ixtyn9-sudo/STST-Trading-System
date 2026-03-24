/* ============================================================================
   M10_Council.gs
   - Push latest EXPERIMENTS row into Supabase (experiment_logs)
   - Add a diagnostic note (diagnostic_notes)
   - Create a PENDING council deliberation (council_deliberations)
   - AI Council Brain (OpenRouter): 3 votes + finalize decision

   Requires (must exist elsewhere in your project):
     - M1_secGetSupabaseUrl()
     - M1_secGetSupabaseKey()
     - M1_secGetOpenRouterKey()
     - M8_getSystemGovernanceState()
     - RUN__getProps_()   // only used to read M9_DIAG_<backtest_id> (optional)
   ============================================================================ */

/* ----------------------------
   Supabase config (secure via M1)
   ---------------------------- */

function MEM__getSupabaseUrl_() {
  var v = M1_secGetSupabaseUrl();
  if (!v) throw new Error('[M10] Missing Supabase URL (M1_secGetSupabaseUrl empty).');
  return String(v).replace(/\/+$/, '');
}

function MEM__getSupabaseKey_() {
  var v = M1_secGetSupabaseKey();
  if (!v) throw new Error('[M10] Missing Supabase key (M1_secGetSupabaseKey empty).');
  return String(v);
}

function MEM__getSupabaseHeaders_() {
  var key = MEM__getSupabaseKey_();
  return {
    apikey: key,
    Authorization: 'Bearer ' + key,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Prefer: 'return=representation'
  };
}

/* ----------------------------
   Supabase fetch helper
   ---------------------------- */

function M10__sbFetchJson_(method, pathWithQuery, bodyObj) {
  var baseUrl = MEM__getSupabaseUrl_();
  var url = baseUrl + pathWithQuery;

  var params = {
    method: String(method || 'get').toLowerCase(),
    headers: MEM__getSupabaseHeaders_(),
    muteHttpExceptions: true
  };

  if (bodyObj !== undefined) {
    params.payload = JSON.stringify(bodyObj);
    params.contentType = 'application/json';
  }

  var res = UrlFetchApp.fetch(url, params);
  var code = res.getResponseCode();
  var text = res.getContentText();

  if (code < 200 || code >= 300) {
    throw new Error('[M10] Supabase request failed: ' + params.method.toUpperCase() + ' ' + pathWithQuery +
                    ' Code=' + code + ' Body=' + text);
  }

  if (!text) return null;
  return JSON.parse(text);
}

/* ----------------------------
   Strategy mapping
   ---------------------------- */

function MEM__strategyIdFromRunName_(runName) {
  var s = String(runName || '').toUpperCase();

  if (s.indexOf('BREAKDOWN_SHORT') !== -1) return 'breakdown_short_v1';
  if (s.indexOf('TREND_PULLBACK_LONG') !== -1) return 'trend_pullback_long_v1';
  if (s.indexOf('BREAKOUT_LONG') !== -1) return 'breakout_long_v2';
  if (s.indexOf('FAKEOUT_SHORT') !== -1) return 'fakeout_short_v1';
  if (s.indexOf('EXHAUSTION_FADE_SHORT') !== -1) return 'exhaustion_fade_short_v1';
  if (s.indexOf('LOOSE_MOMO_LONG') !== -1) return 'loose_momo_long_v1';

  return 'unknown_strategy';
}

/* ----------------------------
   Build latest EXPERIMENTS payload
   ---------------------------- */


function MEM_logLatestExperimentPayloadNow() {
  var payload = MEM__buildLatestExperimentPayload_();
  Logger.log(JSON.stringify(payload, null, 2));
}

/* ----------------------------
   Memory push: experiment_logs
   ---------------------------- */


/* ----------------------------
   Notes: diagnostic_notes
   ---------------------------- */

function MEM_addDiagnosticNoteNow(content, noteType, authorType) {
  var payload = MEM__buildLatestExperimentPayload_();

  var body = {
    backtest_id: payload.backtest_id,
    note_type: noteType || 'summary',
    author_type: authorType || 'human',
    content: String(content || '')
  };

  var rows = M10__sbFetchJson_('post', '/rest/v1/diagnostic_notes', body);
  Logger.log('[MEM] diagnostic_notes inserted rows=' + (rows ? rows.length : 0));
  return rows;
}


function TEST_newKeyFormat() {
  var key = M1_secGetSupabaseKey();
  Logger.log('Supabase key length=' + (key ? key.length : 0));
  Logger.log('Starts sb_=' + (key ? key.indexOf('sb_') === 0 : false));
  Logger.log('Starts sb_secret_=' + (key ? key.indexOf('sb_secret_') === 0 : false));
}

/* ============================================================================
   AI COUNCIL BRAIN (OpenRouter) — server-side fallbacks + retries + safe runner
   ============================================================================ */

/**
 * Server-side fallback chain:
 * - First try your preferred model.
 * - Then fall back to OpenRouter's free router to escape a single provider's 429.
 *
 * You can add more explicit models in between if you want, but keep it curated.
 */

function M10__sleepBackoff_(attemptIdx) {
  var pow = Math.min(6, attemptIdx);
  var delay = M10_OPENROUTER_BACKOFF_BASE_MS * Math.pow(2, pow);
  var jitter = Math.floor(Math.random() * 250);
  Utilities.sleep(Math.min(M10_OPENROUTER_BACKOFF_MAX_MS, delay + jitter));
}





function M10__getOldestPendingDeliberationForRole_(roleCol) {
  var q = '/rest/v1/council_deliberations'
        + '?' + encodeURIComponent(roleCol) + '=eq.PENDING'
        + '&select=*'
        + '&order=created_at.asc'
        + '&limit=1';

  var rows = M10__sbFetchJson_('get', q);
  return (rows && rows.length) ? rows[0] : null;
}

function M10__getExperimentByBacktestId_(backtestId) {
  var q = '/rest/v1/experiment_logs'
        + '?backtest_id=eq.' + encodeURIComponent(backtestId)
        + '&select=*'
        + '&order=created_at.desc'
        + '&limit=1';

  var rows = M10__sbFetchJson_('get', q);
  return (rows && rows.length) ? rows[0] : null;
}

function M10__patchDeliberation_(deliberationId, patchObj) {
  var q = '/rest/v1/council_deliberations?id=eq.' + encodeURIComponent(deliberationId);
  return M10__sbFetchJson_('patch', q, patchObj);
}






/* ----------------------------
   One-click runner (safe)
   ---------------------------- */

function RUN_FireUpCouncilNow() {
  Logger.log('[M10] ========================');
  Logger.log('[M10] Council Session Start');
  Logger.log('[M10] ========================');

  function safeRun_(fn, label) {
    try {
      fn();
    } catch (e) {
      var msg = (e && e.message) ? e.message : String(e);
      Logger.log('[M10] ' + label + ' failed (leaving as PENDING): ' + msg);
    }
    Utilities.sleep(400);
  }

  safeRun_(RUN_RiskOfficerVoteNow, 'Risk Officer');
  safeRun_(RUN_StrategyScoutVoteNow, 'Strategy Scout');
  safeRun_(RUN_QuantAuditorVoteNow, 'Quant Auditor');
  safeRun_(RUN_FinalizeCouncilIfReadyNow, 'Finalizer');

  Logger.log('[M10] ========================');
  Logger.log('[M10] Council Session End');
  Logger.log('[M10] ========================');
}


/**
 * M10_Council_Clean.gs
 * - Pulls compact DQS summary from properties (RUN__getDqsSummary_)
 * - Uses M8 fact pack + deterministic hard enforcement (fail-closed)
 * - LLM = advisor/rationale only
 */

function M10__safeJsonParse_(raw, fallback) {
  try { return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; }
}
function M10__sheetBool_(v) {
  if (v === true) return true;
  if (v === false) return false;
  var s = String(v || '').trim().toUpperCase();
  return (s === 'TRUE' || s === 'YES' || s === '1');
}

function MEM__buildLatestExperimentPayload_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var exp = ss.getSheetByName('EXPERIMENTS');
  if (!exp || exp.getLastRow() < 2) throw new Error('[M10] EXPERIMENTS sheet is empty.');

  var headers = exp.getRange(1, 1, 1, exp.getLastColumn()).getValues()[0];
  var row = exp.getRange(exp.getLastRow(), 1, 1, exp.getLastColumn()).getValues()[0];
  var hm = {};
  for (var i = 0; i < headers.length; i++) hm[String(headers[i] || '').trim()] = i;

  function pick(name, dflt) {
    if (hm[name] === undefined) return dflt;
    var v = row[hm[name]];
    return (v === '' || v === null || v === undefined) ? dflt : v;
  }

  var runName = String(pick('Run_Name', ''));
  var btId = String(pick('Backtest_ID', ''));

  var failReasons = pick('OOS_Fail_Reasons_JSON', '[]');
  if (typeof failReasons === 'string') failReasons = M10__safeJsonParse_(failReasons, [String(failReasons)]);

  var dqsSummary = {};
  try {
    if (typeof RUN__getDqsSummary_ === 'function') dqsSummary = RUN__getDqsSummary_(btId) || {};
  } catch (e2) {}

  return {
    strategy_id: MEM__strategyIdFromRunName_(runName),
    run_name: runName,
    mode: String(pick('Mode', '')),
    universe_mode: String(pick('Universe_Mode', '')),
    backtest_id: btId,

    config_snapshot: {
      dqs_gate_v2: pick('DQS_Gate_V2', ''),
      retest_window_candles: pick('V2_Retest_Window_Candles', ''),
      retest_max_deviation_atr: pick('V2_Retest_Max_Deviation_ATR', ''),
      volume_multiplier_threshold: pick('Volume_Multiplier_Threshold', ''),
      rsi_overbought_long: pick('RSI_Overbought_Long', ''),
      confirmation_body_min_frac: pick('V2_Confirmation_Body_Min_Frac', ''),
      breakout_buffer_atr: pick('V2_Breakout_Buffer_ATR', ''),
      invert_all_signals: pick('Invert_All_Signals', ''),
      v2_long_only: pick('V2_Long_Only', '')
    },

    metrics: {
      total_trades: pick('Total_Trades', 0),
      oos_total_trades: pick('OOS_Total_Trades', 0),
      win_rate_total: pick('Win_Rate_Total', 0),
      profit_factor: pick('Profit_Factor', 0),
      expectancy_r: pick('Expectancy_R', 0),
      max_drawdown_pct: pick('Max_Drawdown_Pct', 0),
      sharpe_ratio: pick('Sharpe_Ratio', 0),
      oos_passed: M10__sheetBool_(pick('OOS_Passed', false)),
      oos_fail_reasons_json: failReasons
    },

    diagnostics: {
      setup_confirmed: pick('setupConfirmed', 0),
      confirmed_queued: pick('confirmedQueued', 0),
      rejected_dqs_after_confirm: pick('rejectedDqsAfterConfirm', 0),
      pending_filled: pick('pendingFilled', 0)
    },

    dqs_summary: dqsSummary
  };
}

function MEM_pushLatestExperimentToSupabaseNow() {
  var payload = MEM__buildLatestExperimentPayload_();
  var body = {
    strategy_id: payload.strategy_id,
    run_name: payload.run_name,
    mode: payload.mode,
    universe_mode: payload.universe_mode,
    backtest_id: payload.backtest_id,
    config_snapshot: payload.config_snapshot,
    metrics: payload.metrics,
    diagnostics: payload.diagnostics,
    dqs_summary: payload.dqs_summary
  };
  var rows = M10__sbFetchJson_('post', '/rest/v1/experiment_logs', body);
  Logger.log('[MEM] experiment_logs inserted rows=' + (rows ? rows.length : 0));
  return rows;
}

function M10_createPendingCouncilDeliberationNow() {
  var payload = MEM__buildLatestExperimentPayload_();
  var pack = M8_buildCouncilFactPack(payload);

  var body = {
    backtest_id: payload.backtest_id,
    strategy_id: payload.strategy_id,
    governance_state: pack.governance.governance_state,
    governance_packet: pack.governance,
    policy_packet: pack.policy,
    evaluation: pack.evaluation,
    metrics: payload.metrics,
    diagnostics: payload.diagnostics,
    dqs_summary: payload.dqs_summary,

    risk_officer_vote: 'PENDING',
    risk_officer_rationale: null,
    strategy_scout_vote: 'PENDING',
    strategy_scout_rationale: null,
    quant_auditor_vote: 'PENDING',
    quant_auditor_rationale: null,
    consensus_reached: false,
    president_override: 'PENDING',
    final_decision: 'HOLD'
  };

  var rows = M10__sbFetchJson_('post', '/rest/v1/council_deliberations', body);
  Logger.log('[M10] council_deliberations inserted rows=' + (rows ? rows.length : 0));
  return rows;
}

var M10_OPENROUTER_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'openrouter/free'
];
var M10_OPENROUTER_MAX_RETRIES = 3;

function M10__parseJsonLoose_(text) {
  var s = String(text || '').trim();
  s = s.replace(/```/g, '').trim();
  try { return JSON.parse(s); } catch (e) {}
  var m = s.match(/{[\s\S]*}/);
  if (m && m[0]) return JSON.parse(m[0]);
  throw new Error('[M10] Could not parse JSON. Raw=' + s.slice(0, 500));
}

function M10__callOpenRouterJson_(systemPrompt, userPrompt) {
  var key = M1_secGetOpenRouterKey();
  if (!key) throw new Error('[M10] Missing OpenRouter key.');
  var url = 'https://openrouter.ai/api/v1/chat/completions';

  var lastErr = null;
  for (var attempt = 0; attempt < M10_OPENROUTER_MAX_RETRIES; attempt++) {
    try {
      var payload = {
        models: M10_OPENROUTER_MODELS,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: String(systemPrompt || '') },
          { role: 'user', content: String(userPrompt || '') }
        ]
      };

      var res = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        headers: {
          Authorization: 'Bearer ' + key,
          'HTTP-Referer': 'https://script.google.com',
          'X-Title': 'Trading Bot Council'
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });

      var code = res.getResponseCode();
      var text = res.getContentText();

      if (code >= 200 && code < 300) {
        var data = JSON.parse(text);
        var msg = (((data || {}).choices || [])[0] || {}).message || {};
        if (!msg.content) throw new Error('[M10] No message content.');
        return M10__parseJsonLoose_(msg.content);
      }

      if (code === 400) {
        var payload2 = JSON.parse(JSON.stringify(payload));
        delete payload2.response_format;
        var res2 = UrlFetchApp.fetch(url, {
          method: 'post',
          contentType: 'application/json',
          headers: {
            Authorization: 'Bearer ' + key,
            'HTTP-Referer': 'https://script.google.com',
            'X-Title': 'Trading Bot Council'
          },
          payload: JSON.stringify(payload2),
          muteHttpExceptions: true
        });
        var code2 = res2.getResponseCode();
        var text2 = res2.getContentText();
        if (code2 >= 200 && code2 < 300) {
          var data2 = JSON.parse(text2);
          var msg2 = (((data2 || {}).choices || [])[0] || {}).message || {};
          if (!msg2.content) throw new Error('[M10] No message content.');
          return M10__parseJsonLoose_(msg2.content);
        }
      }

      lastErr = new Error('[M10] OpenRouter error code=' + code + ' body=' + text.slice(0, 300));
      Utilities.sleep(700 + Math.floor(Math.random() * 200));
    } catch (e) {
      lastErr = e;
      Utilities.sleep(700 + Math.floor(Math.random() * 200));
    }
  }
  throw lastErr || new Error('[M10] OpenRouter failed.');
}

function M10__normalizeDecision_(d, policy) {
  policy = policy || M8_getCouncilDecisionPolicy();
  var out = { vote: 'REJECTED', rationale: '' };

  var vote = String((d || {}).vote || '').toUpperCase().trim();
  var allowed = policy.output_contract && policy.output_contract.allowed_votes ? policy.output_contract.allowed_votes : ['APPROVED','REJECTED'];
  out.vote = (allowed.indexOf(vote) !== -1) ? vote : 'REJECTED';

  var rat = String((d || {}).rationale || '').trim();
  var cap = policy.output_contract && policy.output_contract.rationale_max_chars ? policy.output_contract.rationale_max_chars : 1200;
  if (rat.length > cap) rat = rat.slice(0, cap);
  out.rationale = rat;

  return out;
}

function M10__enforceHardPolicy_(pack, decision) {
  var hard = pack && pack.evaluation && pack.evaluation.hard_reject_reasons ? pack.evaluation.hard_reject_reasons : [];
  if (hard && hard.length) {
    return {
      vote: 'REJECTED',
      rationale: 'Hard-policy REJECTED: ' + hard.join(', ') + (decision && decision.rationale ? (' | LLM=' + decision.rationale) : '')
    };
  }
  return decision;
}

function RUN_RiskOfficerVoteNow() {
  Logger.log('[M10] Risk Officer: searching for PENDING...');
  var d = M10__getOldestPendingDeliberationForRole_('risk_officer_vote');
  if (!d) return Logger.log('[M10] Risk Officer: none pending.');

  var exp = M10__getExperimentByBacktestId_(d.backtest_id);
  if (!exp) exp = MEM__buildLatestExperimentPayload_();

  var pack = M8_buildCouncilFactPack(exp);
  var policy = pack.policy;

  if (pack.evaluation && pack.evaluation.hard_reject_reasons && pack.evaluation.hard_reject_reasons.length) {
    var forced = M10__enforceHardPolicy_(pack, { vote: 'REJECTED', rationale: '' });
    M10__patchDeliberation_(d.id, { risk_officer_vote: forced.vote, risk_officer_rationale: forced.rationale });
    return Logger.log('[M10] Risk Officer forced=' + forced.vote);
  }

  var systemPrompt = 'You are the Chief Risk Officer. Use ONLY supplied facts. Return ONLY JSON.';
  var userPrompt = JSON.stringify({ role: 'risk_officer', fact_pack: pack });

  var raw = M10__callOpenRouterJson_(systemPrompt, userPrompt);
  var dec = M10__normalizeDecision_(raw, policy);
  dec = M10__enforceHardPolicy_(pack, dec);

  M10__patchDeliberation_(d.id, { risk_officer_vote: dec.vote, risk_officer_rationale: dec.rationale });
  Logger.log('[M10] Risk Officer vote=' + dec.vote);
}

function RUN_StrategyScoutVoteNow() {
  Logger.log('[M10] Strategy Scout: searching for PENDING...');
  var d = M10__getOldestPendingDeliberationForRole_('strategy_scout_vote');
  if (!d) return Logger.log('[M10] Strategy Scout: none pending.');

  var exp = M10__getExperimentByBacktestId_(d.backtest_id) || MEM__buildLatestExperimentPayload_();
  var pack = M8_buildCouncilFactPack(exp);
  var policy = pack.policy;

  if (pack.evaluation && pack.evaluation.hard_reject_reasons && pack.evaluation.hard_reject_reasons.length) {
    var forced = M10__enforceHardPolicy_(pack, { vote: 'REJECTED', rationale: '' });
    M10__patchDeliberation_(d.id, { strategy_scout_vote: forced.vote, strategy_scout_rationale: forced.rationale });
    return Logger.log('[M10] Strategy Scout forced=' + forced.vote);
  }

  var systemPrompt = 'You are the Strategy Scout. Use ONLY supplied facts. Return ONLY JSON.';
  var userPrompt = JSON.stringify({ role: 'strategy_scout', fact_pack: pack });

  var raw = M10__callOpenRouterJson_(systemPrompt, userPrompt);
  var dec = M10__normalizeDecision_(raw, policy);
  dec = M10__enforceHardPolicy_(pack, dec);

  M10__patchDeliberation_(d.id, { strategy_scout_vote: dec.vote, strategy_scout_rationale: dec.rationale });
  Logger.log('[M10] Strategy Scout vote=' + dec.vote);
}

function RUN_QuantAuditorVoteNow() {
  Logger.log('[M10] Quant Auditor: searching for PENDING...');
  var d = M10__getOldestPendingDeliberationForRole_('quant_auditor_vote');
  if (!d) return Logger.log('[M10] Quant Auditor: none pending.');

  var exp = M10__getExperimentByBacktestId_(d.backtest_id) || MEM__buildLatestExperimentPayload_();
  var pack = M8_buildCouncilFactPack(exp);
  var policy = pack.policy;

  if (pack.evaluation && pack.evaluation.hard_reject_reasons && pack.evaluation.hard_reject_reasons.length) {
    var forced = M10__enforceHardPolicy_(pack, { vote: 'REJECTED', rationale: '' });
    M10__patchDeliberation_(d.id, { quant_auditor_vote: forced.vote, quant_auditor_rationale: forced.rationale });
    return Logger.log('[M10] Quant Auditor forced=' + forced.vote);
  }

  var systemPrompt = 'You are the Quant Auditor. Use ONLY supplied facts. Return ONLY JSON.';
  var userPrompt = JSON.stringify({ role: 'quant_auditor', fact_pack: pack });

  var raw = M10__callOpenRouterJson_(systemPrompt, userPrompt);
  var dec = M10__normalizeDecision_(raw, policy);
  dec = M10__enforceHardPolicy_(pack, dec);

  M10__patchDeliberation_(d.id, { quant_auditor_vote: dec.vote, quant_auditor_rationale: dec.rationale });
  Logger.log('[M10] Quant Auditor vote=' + dec.vote);
}

function RUN_FinalizeCouncilIfReadyNow() {
  Logger.log('[M10] Finalizer: scanning deliberations needing finalize...');
  var rows = M10__sbFetchJson_(
    'get',
    '/rest/v1/council_deliberations?consensus_reached=eq.false&select=*&order=created_at.asc&limit=10'
  );
  if (!rows || !rows.length) return Logger.log('[M10] Finalizer: none to check.');

  for (var i = 0; i < rows.length; i++) {
    var d = rows[i];
    var votes = [d.risk_officer_vote, d.strategy_scout_vote, d.quant_auditor_vote];
    if (votes.indexOf('PENDING') !== -1) continue;

    var m = d.metrics || {};
    var oosPassed = (m.oos_passed === true || String(m.oos_passed).toUpperCase() === 'TRUE');
    var oosTrades = parseFloat(m.oos_total_trades || 0);

    var evalObj = d.evaluation || {};
    var hard = evalObj.hard_reject_reasons || [];
    var hardReject = (hard && hard.length) || (!oosPassed) || (isFinite(oosTrades) && oosTrades < 20);

    var allApproved = votes.every(function(v) { return String(v).toUpperCase() === 'APPROVED'; });
    var anyRejected = votes.some(function(v) { return String(v).toUpperCase() === 'REJECTED'; });

    var finalDecision = 'HOLD';
    if (hardReject) finalDecision = 'REJECTED';
    else if (allApproved) finalDecision = 'APPROVED';
    else if (anyRejected) finalDecision = 'REJECTED';

    M10__patchDeliberation_(d.id, {
      consensus_reached: (finalDecision !== 'HOLD'),
      final_decision: finalDecision
    });
    Logger.log('[M10] Finalizer: id=' + d.id + ' final_decision=' + finalDecision);
  }
}

function RUN_pushToMemoryAndConveneCouncil() {
  var insertedExperiment = MEM_pushLatestExperimentToSupabaseNow();
  var insertedCouncil = M10_createPendingCouncilDeliberationNow();
  Logger.log('[RUN] Memory + council bootstrap complete.');
  return { experiment: insertedExperiment, council: insertedCouncil };
}

function RUN_CouncilAnalyzeAndDeployNow() {
  var bootstrap = RUN_pushToMemoryAndConveneCouncil();
  RUN_FireUpCouncilNow();
  return bootstrap;
}
