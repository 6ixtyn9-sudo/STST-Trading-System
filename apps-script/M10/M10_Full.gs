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

  var m = payload.metrics || {};
  var d = payload.diagnostics || {};

  var body = {
    strategy_id: payload.strategy_id,
    run_name: payload.run_name,
    mode: payload.mode,
    universe_mode: payload.universe_mode,
    backtest_id: payload.backtest_id,

    config_snapshot: payload.config_snapshot || {},

    total_trades: m.total_trades || 0,
    oos_total_trades: m.oos_total_trades || 0,
    win_rate_total: m.win_rate_total || 0,
    profit_factor: m.profit_factor || 0,
    expectancy_r: m.expectancy_r || 0,
    max_drawdown_pct: m.max_drawdown_pct || 0,
    sharpe_ratio: m.sharpe_ratio || 0,
    oos_passed: !!m.oos_passed,
    oos_fail_reasons_json: m.oos_fail_reasons_json || [],

    setup_confirmed: d.setup_confirmed || 0,
    confirmed_queued: d.confirmed_queued || 0,
    rejected_dqs_after_confirm: d.rejected_dqs_after_confirm || 0,
    pending_filled: d.pending_filled || 0,

    dqs_summary: payload.dqs_summary || {}
  };

  var baseUrl = MEM__getSupabaseUrl_();
  var url = baseUrl + '/rest/v1/experiment_logs?on_conflict=backtest_id';

  var headers = MEM__getSupabaseHeaders_();
  headers.Prefer = 'resolution=merge-duplicates,return=representation';

  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    headers: headers,
    contentType: 'application/json',
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });

  var code = res.getResponseCode();
  var text = res.getContentText();

  if (code < 200 || code >= 300) {
    throw new Error('[M10] experiment_logs upsert failed Code=' + code + ' Body=' + text);
  }

  var rows = text ? JSON.parse(text) : null;
  Logger.log('[MEM] experiment_logs upserted rows=' + (rows ? rows.length : 0));
  return rows;
}


function M10_createPendingCouncilDeliberationNow() {
  var payload = MEM__buildLatestExperimentPayload_();
  var buildFactPack = (typeof M8_buildCouncilCandidateFactPack === 'function')
    ? M8_buildCouncilCandidateFactPack
    : M8_buildCouncilFactPack;
  var pack = buildFactPack(payload);

  var body = {
    backtest_id: payload.backtest_id,
    strategy_id: payload.strategy_id,
    governance_state: pack.governance && pack.governance.governance_state
      ? pack.governance.governance_state
      : 'NORMAL',

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
  try {
    policy = policy || (typeof M8_getCouncilDecisionPolicy === 'function' ? M8_getCouncilDecisionPolicy() : {});
  } catch (e) {
    policy = {};
  }

  var out = { vote: 'REJECTED', rationale: '' };

  var vote = String((d || {}).vote || '').toUpperCase().trim();
  var allowed = policy.output_contract && policy.output_contract.allowed_votes
    ? policy.output_contract.allowed_votes
    : ['APPROVED', 'REJECTED'];
  out.vote = (allowed.indexOf(vote) !== -1) ? vote : 'REJECTED';

  var rat = String((d || {}).rationale || '').trim();
  var cap = policy.output_contract && policy.output_contract.rationale_max_chars
    ? policy.output_contract.rationale_max_chars
    : 1200;
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

  var raw = M10__callLLMJson_(systemPrompt, userPrompt);
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

  var raw = M10__callLLMJson_(systemPrompt, userPrompt);
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

  var raw = M10__callLLMJson_(systemPrompt, userPrompt);
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


function M10__insertDeliberationStep_(deliberationId, backtestId, workerId, phase, outputJson) {
  var body = {
    deliberation_id: deliberationId,
    backtest_id: backtestId,
    worker_id: workerId,
    phase: phase,
    output_json: outputJson || {}
  };
  var rows = M10__sbFetchJson_('post', '/rest/v1/council_deliberation_steps', body);
  Logger.log('[M10] council_deliberation_steps inserted rows=' + (rows ? rows.length : 0));
  return rows;
}

function M10__getDeliberationSteps_(deliberationId) {
  var q = '/rest/v1/council_deliberation_steps'
        + '?deliberation_id=eq.' + encodeURIComponent(deliberationId)
        + '&select=*'
        + '&order=created_at.asc';
  var rows = M10__sbFetchJson_('get', q);
  return rows || [];
}

function M10__getLatestDeliberationStep_(deliberationId, workerId, phase) {
  var q = '/rest/v1/council_deliberation_steps'
        + '?deliberation_id=eq.' + encodeURIComponent(deliberationId)
        + '&worker_id=eq.' + encodeURIComponent(workerId)
        + '&phase=eq.' + encodeURIComponent(phase)
        + '&select=*'
        + '&order=created_at.desc'
        + '&limit=1';
  var rows = M10__sbFetchJson_('get', q);
  return (rows && rows.length) ? rows[0] : null;
}



function M10__normalizeInitialDecision_(d) {
  d = d || {};
  var vote = String(d.vote || '').toUpperCase().trim();
  if (vote !== 'APPROVED' && vote !== 'REJECTED') vote = 'REJECTED';

  return {
    vote: vote,
    rationale: String(d.rationale || '').trim(),
    confidence: Number(d.confidence || 0),
    key_points: Array.isArray(d.key_points) ? d.key_points : [],
    self_critique: Array.isArray(d.self_critique) ? d.self_critique : [],
    requests_for_peer_review: Array.isArray(d.requests_for_peer_review) ? d.requests_for_peer_review : []
  };
}

function M10__normalizeCrossReviewDecision_(d) {
  d = d || {};
  var vote = String(d.revised_vote || '').toUpperCase().trim();
  if (vote !== 'APPROVED' && vote !== 'REJECTED') vote = 'REJECTED';

  return {
    revised_vote: vote,
    changed_mind: (d.changed_mind === true),
    why_changed: String(d.why_changed || '').trim(),
    peer_critiques: Array.isArray(d.peer_critiques) ? d.peer_critiques : [],
    self_correction: Array.isArray(d.self_correction) ? d.self_correction : [],
    final_position: String(d.final_position || '').trim()
  };
}

function M10__normalizeSupervisorDecision_(d) {
  d = d || {};
  var finalDecision = String(d.final_decision || '').toUpperCase().trim();
  if (['APPROVED', 'REJECTED', 'HOLD'].indexOf(finalDecision) === -1) finalDecision = 'HOLD';

  return {
    final_decision: finalDecision,
    rationale: String(d.rationale || '').trim(),
    worker_summary: d.worker_summary || {},
    winning_arguments: Array.isArray(d.winning_arguments) ? d.winning_arguments : [],
    rejected_arguments: Array.isArray(d.rejected_arguments) ? d.rejected_arguments : [],
    policy_override_applied: (d.policy_override_applied === true)
  };
}



function M10__applySupervisorPolicyGuard_(pack, supervisorDecision) {
  var out = supervisorDecision || {};
  var hard = (pack && pack.evaluation && pack.evaluation.hard_reject_reasons) ? pack.evaluation.hard_reject_reasons : [];
  var metrics = (pack && pack.metrics) ? pack.metrics : {};
  var oosPassed = (metrics.oos_passed === true || String(metrics.oos_passed).toUpperCase() === 'TRUE');
  var oosTrades = parseFloat(metrics.oos_total_trades || 0);

  if (hard && hard.length) {
    out.final_decision = 'REJECTED';
    out.policy_override_applied = true;
    out.rationale = 'Hard-policy REJECTED: ' + hard.join(', ') + (out.rationale ? (' | Supervisor=' + out.rationale) : '');
    return out;
  }

  if (!oosPassed) {
    if (out.final_decision === 'APPROVED') {
      out.final_decision = 'REJECTED';
      out.policy_override_applied = true;
      out.rationale = 'Policy guard rejected APPROVED decision because oos_passed=false' + (out.rationale ? (' | Supervisor=' + out.rationale) : '');
    }
    return out;
  }

  if (isFinite(oosTrades) && oosTrades < 20) {
    if (out.final_decision === 'APPROVED') {
      out.final_decision = 'REJECTED';
      out.policy_override_applied = true;
      out.rationale = 'Policy guard rejected APPROVED decision because oos_total_trades<20' + (out.rationale ? (' | Supervisor=' + out.rationale) : '');
    }
    return out;
  }

  return out;
}


function M10__getInitialPromptByWorkerId_(workerId) {
  if (workerId === 'risk_officer') return M10_PROMPT_RISK_OFFICER_INITIAL;
  if (workerId === 'strategy_scout') return M10_PROMPT_STRATEGY_SCOUT_INITIAL;
  if (workerId === 'quant_auditor') return M10_PROMPT_QUANT_AUDITOR_INITIAL;
  throw new Error('[M10] Unknown initial workerId=' + workerId);
}

function M10__getCrossPromptByWorkerId_(workerId) {
  if (workerId === 'risk_officer') return M10_PROMPT_RISK_OFFICER_CROSS;
  if (workerId === 'strategy_scout') return M10_PROMPT_STRATEGY_SCOUT_CROSS;
  if (workerId === 'quant_auditor') return M10_PROMPT_QUANT_AUDITOR_CROSS;
  throw new Error('[M10] Unknown cross-review workerId=' + workerId);
}


function M10__buildDeliberationFactPack_(deliberationRow) {
  var exp = M10__getExperimentByBacktestId_(deliberationRow.backtest_id);
  if (!exp) exp = MEM__buildLatestExperimentPayload_();

  var normalizedExp = exp;
  if (exp && !exp.metrics && exp.backtest_id) {
    normalizedExp = M10__experimentLogRowToCouncilPayload_(exp);
  }

  var buildFactPack = (typeof M8_buildCouncilCandidateFactPack === 'function')
    ? M8_buildCouncilCandidateFactPack
    : M8_buildCouncilFactPack;
  var pack = buildFactPack(normalizedExp);

  return {
    deliberation_id: deliberationRow.id,
    backtest_id: deliberationRow.backtest_id,
    strategy_id: deliberationRow.strategy_id,
    governance_state: deliberationRow.governance_state,
    governance_packet: pack.governance || {},
    policy_packet: pack.policy || {},
    evaluation_packet: pack.evaluation || {},
    metrics: normalizedExp.metrics || {},
    diagnostics: normalizedExp.diagnostics || {},
    dqs_summary: normalizedExp.dqs_summary || {}
  };
}

function M10__buildCrossReviewPacket_(deliberationRow, workerId) {
  var factPack = M10__buildDeliberationFactPack_(deliberationRow);

  var myInitial = M10__getLatestDeliberationStep_(deliberationRow.id, workerId, 'initial');
  if (!myInitial) throw new Error('[M10] Missing initial step for worker=' + workerId + ' deliberation=' + deliberationRow.id);

  var allSteps = M10__getDeliberationSteps_(deliberationRow.id);
  var peerInitials = [];

  for (var i = 0; i < allSteps.length; i++) {
    var s = allSteps[i];
    if (s.phase !== 'initial') continue;
    if (s.worker_id === workerId) continue;
    peerInitials.push({
      worker_id: s.worker_id,
      output_json: s.output_json || {}
    });
  }

  return {
    role: workerId,
    phase: 'cross_review',
    fact_pack: factPack,
    own_initial_output: myInitial.output_json || {},
    peer_initial_outputs: peerInitials
  };
}



function M10__buildSupervisorPacket_(deliberationRow) {
  var factPack = M10__buildDeliberationFactPack_(deliberationRow);
  var allSteps = M10__getDeliberationSteps_(deliberationRow.id);

  var initials = [];
  var crosses = [];

  for (var i = 0; i < allSteps.length; i++) {
    var s = allSteps[i];
    if (s.phase === 'initial') {
      initials.push({ worker_id: s.worker_id, output_json: s.output_json || {} });
    } else if (s.phase === 'cross_review') {
      crosses.push({ worker_id: s.worker_id, output_json: s.output_json || {} });
    }
  }

  return {
    role: 'council_supervisor',
    phase: 'supervisor_finalize',
    fact_pack: factPack,
    initial_outputs: initials,
    cross_review_outputs: crosses
  };
}


function M10__runInitialWorker_(workerId, deliberationRow) {
  var factPack = M10__buildDeliberationFactPack_(deliberationRow);
  var systemPrompt = M10__getInitialPromptByWorkerId_(workerId);
  var userPrompt = JSON.stringify({
    role: workerId,
    phase: 'initial',
    fact_pack: factPack
  });

  var raw = M10__callLLMJson_(systemPrompt, userPrompt);
  var dec = M10__normalizeInitialDecision_(raw);

  var hard = factPack.evaluation_packet && factPack.evaluation_packet.hard_reject_reasons
    ? factPack.evaluation_packet.hard_reject_reasons
    : [];
  if (hard.length) {
    dec.vote = 'REJECTED';
    dec.rationale = 'Hard-policy REJECTED: ' + hard.join(', ') + (dec.rationale ? (' | LLM=' + dec.rationale) : '');
  }

  M10__insertDeliberationStep_(
    deliberationRow.id,
    deliberationRow.backtest_id,
    workerId,
    'initial',
    dec
  );

  var patch = {};
  if (workerId === 'risk_officer') {
    patch.risk_officer_vote = dec.vote;
    patch.risk_officer_rationale = dec.rationale;
  } else if (workerId === 'strategy_scout') {
    patch.strategy_scout_vote = dec.vote;
    patch.strategy_scout_rationale = dec.rationale;
  } else if (workerId === 'quant_auditor') {
    patch.quant_auditor_vote = dec.vote;
    patch.quant_auditor_rationale = dec.rationale;
  }
  M10__patchDeliberation_(deliberationRow.id, patch);

  Logger.log('[M10] Initial worker=' + workerId + ' vote=' + dec.vote);
  return dec;
}



function M10__runCrossReviewWorker_(workerId, deliberationRow) {
  var packet = M10__buildCrossReviewPacket_(deliberationRow, workerId);
  var systemPrompt = M10__getCrossPromptByWorkerId_(workerId);
  var userPrompt = JSON.stringify(packet);

  var raw = M10__callLLMJson_(systemPrompt, userPrompt);
  var dec = M10__normalizeCrossReviewDecision_(raw);

  var hard = packet.fact_pack && packet.fact_pack.evaluation_packet && packet.fact_pack.evaluation_packet.hard_reject_reasons
    ? packet.fact_pack.evaluation_packet.hard_reject_reasons
    : [];
  if (hard.length) {
    dec.revised_vote = 'REJECTED';
    dec.why_changed = 'Hard-policy REJECTED: ' + hard.join(', ') + (dec.why_changed ? (' | LLM=' + dec.why_changed) : '');
  }

  M10__insertDeliberationStep_(
    deliberationRow.id,
    deliberationRow.backtest_id,
    workerId,
    'cross_review',
    dec
  );

  Logger.log('[M10] Cross-review worker=' + workerId + ' revised_vote=' + dec.revised_vote);
  return dec;
}



function M10__runSupervisorFinalize_(deliberationRow) {
  var packet = M10__buildSupervisorPacket_(deliberationRow);
  var systemPrompt = M10_PROMPT_COUNCIL_SUPERVISOR;
  var userPrompt = JSON.stringify(packet);

  var raw = M10__callLLMJson_(systemPrompt, userPrompt);
  var dec = M10__normalizeSupervisorDecision_(raw);
  dec = M10__applySupervisorPolicyGuard_(packet.fact_pack, dec);

  M10__insertDeliberationStep_(
    deliberationRow.id,
    deliberationRow.backtest_id,
    'council_supervisor',
    'supervisor_finalize',
    dec
  );

  M10__patchDeliberation_(deliberationRow.id, {
    consensus_reached: (dec.final_decision !== 'HOLD'),
    final_decision: dec.final_decision
  });

  Logger.log('[M10] Supervisor final_decision=' + dec.final_decision);
  return dec;
}




function RUN_RiskOfficerInitialNow() {
  Logger.log('[M10] Risk Officer Initial: searching for PENDING...');
  var d = M10__getOldestPendingDeliberationForRole_('risk_officer_vote');
  if (!d) return Logger.log('[M10] Risk Officer Initial: none pending.');
  return M10__runInitialWorker_('risk_officer', d);
}

function RUN_StrategyScoutInitialNow() {
  Logger.log('[M10] Strategy Scout Initial: searching for PENDING...');
  var d = M10__getOldestPendingDeliberationForRole_('strategy_scout_vote');
  if (!d) return Logger.log('[M10] Strategy Scout Initial: none pending.');
  return M10__runInitialWorker_('strategy_scout', d);
}

function RUN_QuantAuditorInitialNow() {
  Logger.log('[M10] Quant Auditor Initial: searching for PENDING...');
  var d = M10__getOldestPendingDeliberationForRole_('quant_auditor_vote');
  if (!d) return Logger.log('[M10] Quant Auditor Initial: none pending.');
  return M10__runInitialWorker_('quant_auditor', d);
}

function RUN_RiskOfficerCrossReviewNow() {
  Logger.log('[M10] Risk Officer Cross-Review: searching...');
  var rows = M10__sbFetchJson_(
    'get',
    '/rest/v1/council_deliberations?consensus_reached=eq.false&select=*&order=created_at.asc&limit=10'
  ) || [];

  for (var i = 0; i < rows.length; i++) {
    var d = rows[i];
    var a = M10__getLatestDeliberationStep_(d.id, 'risk_officer', 'initial');
    var b = M10__getLatestDeliberationStep_(d.id, 'strategy_scout', 'initial');
    var c = M10__getLatestDeliberationStep_(d.id, 'quant_auditor', 'initial');
    var existing = M10__getLatestDeliberationStep_(d.id, 'risk_officer', 'cross_review');
    if (a && b && c && !existing) return M10__runCrossReviewWorker_('risk_officer', d);
  }
  Logger.log('[M10] Risk Officer Cross-Review: none ready.');
}

function RUN_StrategyScoutCrossReviewNow() {
  Logger.log('[M10] Strategy Scout Cross-Review: searching...');
  var rows = M10__sbFetchJson_(
    'get',
    '/rest/v1/council_deliberations?consensus_reached=eq.false&select=*&order=created_at.asc&limit=10'
  ) || [];

  for (var i = 0; i < rows.length; i++) {
    var d = rows[i];
    var a = M10__getLatestDeliberationStep_(d.id, 'risk_officer', 'initial');
    var b = M10__getLatestDeliberationStep_(d.id, 'strategy_scout', 'initial');
    var c = M10__getLatestDeliberationStep_(d.id, 'quant_auditor', 'initial');
    var existing = M10__getLatestDeliberationStep_(d.id, 'strategy_scout', 'cross_review');
    if (a && b && c && !existing) return M10__runCrossReviewWorker_('strategy_scout', d);
  }
  Logger.log('[M10] Strategy Scout Cross-Review: none ready.');
}

function RUN_QuantAuditorCrossReviewNow() {
  Logger.log('[M10] Quant Auditor Cross-Review: searching...');
  var rows = M10__sbFetchJson_(
    'get',
    '/rest/v1/council_deliberations?consensus_reached=eq.false&select=*&order=created_at.asc&limit=10'
  ) || [];

  for (var i = 0; i < rows.length; i++) {
    var d = rows[i];
    var a = M10__getLatestDeliberationStep_(d.id, 'risk_officer', 'initial');
    var b = M10__getLatestDeliberationStep_(d.id, 'strategy_scout', 'initial');
    var c = M10__getLatestDeliberationStep_(d.id, 'quant_auditor', 'initial');
    var existing = M10__getLatestDeliberationStep_(d.id, 'quant_auditor', 'cross_review');
    if (a && b && c && !existing) return M10__runCrossReviewWorker_('quant_auditor', d);
  }
  Logger.log('[M10] Quant Auditor Cross-Review: none ready.');
}

function RUN_CouncilSupervisorNow() {
  Logger.log('[M10] Council Supervisor: searching...');
  var rows = M10__sbFetchJson_(
    'get',
    '/rest/v1/council_deliberations?consensus_reached=eq.false&select=*&order=created_at.asc&limit=10'
  ) || [];

  for (var i = 0; i < rows.length; i++) {
    var d = rows[i];
    var r1 = M10__getLatestDeliberationStep_(d.id, 'risk_officer', 'cross_review');
    var s1 = M10__getLatestDeliberationStep_(d.id, 'strategy_scout', 'cross_review');
    var q1 = M10__getLatestDeliberationStep_(d.id, 'quant_auditor', 'cross_review');
    var existing = M10__getLatestDeliberationStep_(d.id, 'council_supervisor', 'supervisor_finalize');
    if (r1 && s1 && q1 && !existing) return M10__runSupervisorFinalize_(d);
  }
  Logger.log('[M10] Council Supervisor: none ready.');
}




function RUN_FireUpCouncilDeliberativeNow() {
  Logger.log('[M10] =======================================');
  Logger.log('[M10] Deliberative Council Session Start');
  Logger.log('[M10] =======================================');

  function safeRun_(fn, label) {
    try {
      fn();
    } catch (e) {
      var msg = (e && e.message) ? e.message : String(e);
      Logger.log('[M10] ' + label + ' failed: ' + msg);
    }
    Utilities.sleep(500);
  }

  // Initial round
  safeRun_(RUN_RiskOfficerInitialNow, 'Risk Officer Initial');
  safeRun_(RUN_StrategyScoutInitialNow, 'Strategy Scout Initial');
  safeRun_(RUN_QuantAuditorInitialNow, 'Quant Auditor Initial');

  // Cross review
  safeRun_(RUN_RiskOfficerCrossReviewNow, 'Risk Officer Cross-Review');
  safeRun_(RUN_StrategyScoutCrossReviewNow, 'Strategy Scout Cross-Review');
  safeRun_(RUN_QuantAuditorCrossReviewNow, 'Quant Auditor Cross-Review');

  // Supervisor
  safeRun_(RUN_CouncilSupervisorNow, 'Council Supervisor');

  Logger.log('[M10] =======================================');
  Logger.log('[M10] Deliberative Council Session End');
  Logger.log('[M10] =======================================');
}


function RUN_CouncilAnalyzeDeliberativeNow() {
  var bootstrap = RUN_pushToMemoryAndConveneCouncil();
  RUN_FireUpCouncilDeliberativeNow();
  return bootstrap;
}


/* ============================================================================
   M10 DELIBERATIVE COUNCIL V1 PROMPTS
   Safe Apps Script string constants
   ============================================================================ */

var M10_RESUME_TRIGGER_FUNCTION = 'RUN_ResumeDeliberativeCouncilNow';
var M10_STOP_PROP = 'M10_STOP_COUNCIL';
var M10_MAX_STEPS_PER_DELIBERATION_PROP = 'M10_MAX_STEPS_PER_DELIBERATION';
var M10_DEFAULT_MAX_STEPS_PER_DELIBERATION = 7; // 3 initial + 3 cross + 1 supervisor
var M10_MAX_DELIBERATION_AGE_MINUTES = 60;
var M10_LLM_PROVIDER = 'gemini>groq>openrouter';

var M10_PROMPT_RISK_OFFICER_INITIAL =
  'You are the Risk Officer for the $T$T council.\n' +
  '\n' +
  'Your objective is to reject unsafe, fragile, or governance-incompatible candidates.\n' +
  '\n' +
  'Rules:\n' +
  '- Use only supplied facts.\n' +
  '- Prioritize capital protection.\n' +
  '- Do not invent missing risk information.\n' +
  '- Do not override hard policy.\n' +
  '- Return JSON only.\n' +
  '\n' +
  'Required output shape:\n' +
  '{\n' +
  '  "vote": "APPROVED" or "REJECTED",\n' +
  '  "rationale": "short bounded explanation",\n' +
  '  "confidence": 0.0,\n' +
  '  "key_points": ["..."],\n' +
  '  "self_critique": ["..."],\n' +
  '  "requests_for_peer_review": ["..."]\n' +
  '}';

var M10_PROMPT_STRATEGY_SCOUT_INITIAL =
  'You are the Strategy Scout for the $T$T council.\n' +
  '\n' +
  'Your objective is to judge whether the supplied experiment appears strategically attractive.\n' +
  '\n' +
  'Rules:\n' +
  '- Use only supplied facts.\n' +
  '- Do not invent missing information.\n' +
  '- Do not ignore governance state.\n' +
  '- Do not override hard policy.\n' +
  '- Return JSON only.\n' +
  '\n' +
  'Required output shape:\n' +
  '{\n' +
  '  "vote": "APPROVED" or "REJECTED",\n' +
  '  "rationale": "short bounded explanation",\n' +
  '  "confidence": 0.0,\n' +
  '  "key_points": ["..."],\n' +
  '  "self_critique": ["..."],\n' +
  '  "requests_for_peer_review": ["..."]\n' +
  '}';

var M10_PROMPT_QUANT_AUDITOR_INITIAL =
  'You are the Quant Auditor for the $T$T council.\n' +
  '\n' +
  'Your objective is to judge empirical legitimacy using only the supplied experiment facts.\n' +
  '\n' +
  'Rules:\n' +
  '- Use only supplied facts.\n' +
  '- Be skeptical and evidence-first.\n' +
  '- Do not invent metrics.\n' +
  '- Do not override hard policy.\n' +
  '- Return JSON only.\n' +
  '\n' +
  'Required output shape:\n' +
  '{\n' +
  '  "vote": "APPROVED" or "REJECTED",\n' +
  '  "rationale": "short bounded explanation",\n' +
  '  "confidence": 0.0,\n' +
  '  "key_points": ["..."],\n' +
  '  "self_critique": ["..."],\n' +
  '  "requests_for_peer_review": ["..."]\n' +
  '}';

var M10_PROMPT_RISK_OFFICER_CROSS =
  'You are the Risk Officer for the $T$T council.\n' +
  '\n' +
  'You are in CROSS-REVIEW phase.\n' +
  '\n' +
  'You have:\n' +
  '- the original fact pack\n' +
  '- your own initial vote\n' +
  '- the initial votes of the Strategy Scout and Quant Auditor\n' +
  '\n' +
  'Your objective is to:\n' +
  '- reconsider your initial judgment\n' +
  '- critique peer reasoning\n' +
  '- identify whether your own reasoning missed anything material\n' +
  '\n' +
  'Rules:\n' +
  '- Use only supplied facts and supplied peer outputs.\n' +
  '- Do not invent metrics.\n' +
  '- Do not override hard policy.\n' +
  '- Return JSON only.\n' +
  '\n' +
  'Required output shape:\n' +
  '{\n' +
  '  "revised_vote": "APPROVED" or "REJECTED",\n' +
  '  "changed_mind": true or false,\n' +
  '  "why_changed": "short bounded explanation",\n' +
  '  "peer_critiques": [\n' +
  '    {\n' +
  '      "peer_worker_id": "strategy_scout" or "quant_auditor",\n' +
  '      "agreement": "agree" or "partial" or "disagree",\n' +
  '      "critique": "short bounded critique"\n' +
  '    }\n' +
  '  ],\n' +
  '  "self_correction": ["short bounded self-critique items"],\n' +
  '  "final_position": "short bounded final position"\n' +
  '}';

var M10_PROMPT_STRATEGY_SCOUT_CROSS =
  'You are the Strategy Scout for the $T$T council.\n' +
  '\n' +
  'You are in CROSS-REVIEW phase.\n' +
  '\n' +
  'You have:\n' +
  '- the original fact pack\n' +
  '- your own initial vote\n' +
  '- the initial votes of the Risk Officer and Quant Auditor\n' +
  '\n' +
  'Your objective is to:\n' +
  '- reconsider your initial judgment\n' +
  '- critique peer reasoning\n' +
  '- identify whether your own reasoning overreached\n' +
  '\n' +
  'Rules:\n' +
  '- Use only supplied facts and supplied peer outputs.\n' +
  '- Do not invent evidence.\n' +
  '- Do not ignore governance state.\n' +
  '- Do not override hard policy.\n' +
  '- Return JSON only.\n' +
  '\n' +
  'Required output shape:\n' +
  '{\n' +
  '  "revised_vote": "APPROVED" or "REJECTED",\n' +
  '  "changed_mind": true or false,\n' +
  '  "why_changed": "short bounded explanation",\n' +
  '  "peer_critiques": [\n' +
  '    {\n' +
  '      "peer_worker_id": "risk_officer" or "quant_auditor",\n' +
  '      "agreement": "agree" or "partial" or "disagree",\n' +
  '      "critique": "short bounded critique"\n' +
  '    }\n' +
  '  ],\n' +
  '  "self_correction": ["short bounded self-critique items"],\n' +
  '  "final_position": "short bounded final position"\n' +
  '}';

var M10_PROMPT_QUANT_AUDITOR_CROSS =
  'You are the Quant Auditor for the $T$T council.\n' +
  '\n' +
  'You are in CROSS-REVIEW phase.\n' +
  '\n' +
  'You have:\n' +
  '- the original fact pack\n' +
  '- your own initial vote\n' +
  '- the initial votes of the Risk Officer and Strategy Scout\n' +
  '\n' +
  'Your objective is to:\n' +
  '- reconsider your initial judgment\n' +
  '- critique peer reasoning\n' +
  '- identify whether your own empirical interpretation missed anything material\n' +
  '\n' +
  'Rules:\n' +
  '- Use only supplied facts and supplied peer outputs.\n' +
  '- Do not invent metrics.\n' +
  '- Do not override hard policy.\n' +
  '- Return JSON only.\n' +
  '\n' +
  'Required output shape:\n' +
  '{\n' +
  '  "revised_vote": "APPROVED" or "REJECTED",\n' +
  '  "changed_mind": true or false,\n' +
  '  "why_changed": "short bounded explanation",\n' +
  '  "peer_critiques": [\n' +
  '    {\n' +
  '      "peer_worker_id": "risk_officer" or "strategy_scout",\n' +
  '      "agreement": "agree" or "partial" or "disagree",\n' +
  '      "critique": "short bounded critique"\n' +
  '    }\n' +
  '  ],\n' +
  '  "self_correction": ["short bounded self-critique items"],\n' +
  '  "final_position": "short bounded final position"\n' +
  '}';

var M10_PROMPT_COUNCIL_SUPERVISOR =
  'You are the Council Supervisor for the $T$T system.\n' +
  '\n' +
  'You are the final bounded synthesis layer for a council deliberation.\n' +
  '\n' +
  'You receive:\n' +
  '- the original fact pack\n' +
  '- all initial worker outputs\n' +
  '- all cross-review worker outputs\n' +
  '- governance and policy context\n' +
  '\n' +
  'Your job is to:\n' +
  '- make the final bounded decision\n' +
  '- explain which arguments were strongest\n' +
  '- explain which arguments were rejected\n' +
  '- remain subordinate to hard policy\n' +
  '\n' +
  'Rules:\n' +
  '- Use only supplied facts and supplied worker outputs.\n' +
  '- Do not invent evidence.\n' +
  '- Do not override hard policy.\n' +
  '- If hard policy blocks approval, say so explicitly.\n' +
  '- Prefer HOLD or REJECT over unsupported approval.\n' +
  '- Return JSON only.\n' +
  '\n' +
  'Required output shape:\n' +
  '{\n' +
  '  "final_decision": "APPROVED" or "REJECTED" or "HOLD",\n' +
  '  "rationale": "short bounded explanation",\n' +
  '  "worker_summary": {\n' +
  '    "risk_officer": "APPROVED or REJECTED",\n' +
  '    "strategy_scout": "APPROVED or REJECTED",\n' +
  '    "quant_auditor": "APPROVED or REJECTED"\n' +
  '  },\n' +
  '  "winning_arguments": ["..."],\n' +
  '  "rejected_arguments": ["..."],\n' +
  '  "policy_override_applied": true or false\n' +
  '}';




function M10__getExperimentLogByBacktestId_(backtestId) {
  var q = '/rest/v1/experiment_logs'
        + '?backtest_id=eq.' + encodeURIComponent(backtestId)
        + '&select=*'
        + '&order=created_at.desc'
        + '&limit=1';

  var rows = M10__sbFetchJson_('get', q);
  return (rows && rows.length) ? rows[0] : null;
}



function M10__experimentLogRowToCouncilPayload_(row) {
  if (!row) throw new Error('[M10] Missing experiment log row.');

  return {
    strategy_id: row.strategy_id || 'unknown_strategy',
    run_name: row.run_name || '',
    mode: row.mode || '',
    universe_mode: row.universe_mode || '',
    backtest_id: row.backtest_id || '',

    config_snapshot: row.config_snapshot || {},

    metrics: {
      total_trades: row.total_trades || 0,
      oos_total_trades: row.oos_total_trades || 0,
      win_rate_total: row.win_rate_total || 0,
      profit_factor: row.profit_factor || 0,
      expectancy_r: row.expectancy_r || 0,
      max_drawdown_pct: row.max_drawdown_pct || 0,
      sharpe_ratio: row.sharpe_ratio || 0,
      oos_passed: !!row.oos_passed,
      oos_fail_reasons_json: row.oos_fail_reasons_json || []
    },

    diagnostics: {
      setup_confirmed: row.setup_confirmed || 0,
      confirmed_queued: row.confirmed_queued || 0,
      rejected_dqs_after_confirm: row.rejected_dqs_after_confirm || 0,
      pending_filled: row.pending_filled || 0
    },

    dqs_summary: row.dqs_summary || {}
  };
}


function M10_createPendingCouncilDeliberationForBacktestIdNow(backtestId) {
  var existing = M10__sbFetchJson_(
    'get',
    '/rest/v1/council_deliberations'
      + '?backtest_id=eq.' + encodeURIComponent(backtestId)
      + '&consensus_reached=eq.false'
      + '&select=*'
      + '&order=created_at.desc'
      + '&limit=1'
  ) || [];

  if (existing.length) {
    Logger.log('[M10] Reusing existing open deliberation id=' + existing[0].id + ' backtest_id=' + backtestId);
    return existing;
  }

  var expRow = M10__getExperimentLogByBacktestId_(backtestId);
  if (!expRow) {
    throw new Error('[M10] No experiment_logs row found for backtest_id=' + backtestId);
  }

  var payload = M10__experimentLogRowToCouncilPayload_(expRow);
  var buildFactPack = (typeof M8_buildCouncilCandidateFactPack === 'function')
    ? M8_buildCouncilCandidateFactPack
    : M8_buildCouncilFactPack;
  var pack = buildFactPack(payload);

  var body = {
    backtest_id: payload.backtest_id,
    strategy_id: payload.strategy_id,
    governance_state: pack.governance && pack.governance.governance_state
      ? pack.governance.governance_state
      : 'NORMAL',

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


function RUN_CouncilAnalyzeSpecificBacktestNow(targetBacktestId) {
  if (!targetBacktestId) throw new Error('[M10] targetBacktestId required.');

  M10__setCouncilStopRequested_(false);

  Logger.log('[M10] =======================================');
  Logger.log('[M10] Specific Backtest Council Review Start');
  Logger.log('[M10] backtest_id=' + targetBacktestId);
  Logger.log('[M10] =======================================');

  var insertedCouncil = M10_createPendingCouncilDeliberationForBacktestIdNow(targetBacktestId);

  Logger.log('[M10] Pending deliberation created. Processing first step only...');
  RUN_ProcessOneDeliberativeCouncilStepNow();

  Logger.log('[M10] =======================================');
  Logger.log('[M10] Specific Backtest Council Review Started');
  Logger.log('[M10] Resume trigger will continue remaining steps unless stopped.');
  Logger.log('[M10] =======================================');

  return insertedCouncil;
}


function RUN_CouncilAnalyzeCurrentChampionNow() {
  var backtestId = 'bt_8e24c2cd59f9ce9fa6e9128400b8d1c7';
  return RUN_CouncilAnalyzeSpecificBacktestNow(backtestId);
}

function TEST_ShowDeliberativeCouncilStatusNow() {
  var rows = M10__sbFetchJson_(
    'get',
    '/rest/v1/council_deliberations?select=*&order=created_at.desc&limit=10'
  ) || [];

  var out = [];
  for (var i = 0; i < rows.length; i++) {
    var d = rows[i];
    var steps = M10__getDeliberationSteps_(d.id) || [];
    out.push({
      deliberation_id: d.id,
      backtest_id: d.backtest_id,
      strategy_id: d.strategy_id,
      final_decision: d.final_decision,
      consensus_reached: d.consensus_reached,
      risk_officer_vote: d.risk_officer_vote,
      strategy_scout_vote: d.strategy_scout_vote,
      quant_auditor_vote: d.quant_auditor_vote,
      step_count: steps.length
    });
  }

  Logger.log(JSON.stringify(out, null, 2));
}


function M10__deliberativeStepExists_(deliberationId, workerId, phase) {
  var row = M10__getLatestDeliberationStep_(deliberationId, workerId, phase);
  return !!row;
}


function M10__findNextDeliberativeTask_() {
  var rows = M10__sbFetchJson_(
    'get',
    '/rest/v1/council_deliberations?consensus_reached=eq.false&select=*&order=created_at.desc&limit=20'
  ) || [];

  var maxSteps = M10__getMaxStepsPerDeliberation_();

  for (var i = 0; i < rows.length; i++) {
    var d = rows[i];

    // ignore stale legacy backtest ids immediately
    if (String(d.backtest_id || '').indexOf('BT-') === 0) {
      M10__markDeliberationStopped_(d, 'legacy_backtest_id_ignored');
      continue;
    }

    // stale deliberation
    if (M10__isDeliberationTooOld_(d)) {
      M10__markDeliberationStopped_(d, 'deliberation_too_old');
      continue;
    }

    // runaway
    var stepCount = M10__getDeliberationStepCount_(d.id);
    if (stepCount >= maxSteps) {
      M10__markDeliberationStopped_(d, 'step_count_exceeded max=' + maxSteps);
      continue;
    }

    if (!M10__deliberativeStepExists_(d.id, 'risk_officer', 'initial')) {
      return { deliberation: d, fnName: 'RUN_RiskOfficerInitialNow', label: 'risk_officer_initial' };
    }
    if (!M10__deliberativeStepExists_(d.id, 'strategy_scout', 'initial')) {
      return { deliberation: d, fnName: 'RUN_StrategyScoutInitialNow', label: 'strategy_scout_initial' };
    }
    if (!M10__deliberativeStepExists_(d.id, 'quant_auditor', 'initial')) {
      return { deliberation: d, fnName: 'RUN_QuantAuditorInitialNow', label: 'quant_auditor_initial' };
    }

    if (!M10__deliberativeStepExists_(d.id, 'risk_officer', 'cross_review')) {
      return { deliberation: d, fnName: 'RUN_RiskOfficerCrossReviewNow', label: 'risk_officer_cross_review' };
    }
    if (!M10__deliberativeStepExists_(d.id, 'strategy_scout', 'cross_review')) {
      return { deliberation: d, fnName: 'RUN_StrategyScoutCrossReviewNow', label: 'strategy_scout_cross_review' };
    }
    if (!M10__deliberativeStepExists_(d.id, 'quant_auditor', 'cross_review')) {
      return { deliberation: d, fnName: 'RUN_QuantAuditorCrossReviewNow', label: 'quant_auditor_cross_review' };
    }

    if (!M10__deliberativeStepExists_(d.id, 'council_supervisor', 'supervisor_finalize')) {
      return { deliberation: d, fnName: 'RUN_CouncilSupervisorNow', label: 'council_supervisor_finalize' };
    }
  }

  return null;
}


function RUN_DeleteLegacyCouncilDeliberationsNow() {
  var rows = M10__sbFetchJson_(
    'get',
    '/rest/v1/council_deliberations?select=*&order=created_at.asc&limit=100'
  ) || [];

  var deleted = [];
  for (var i = 0; i < rows.length; i++) {
    var d = rows[i];
    if (String(d.backtest_id || '').indexOf('BT-') === 0) {
      try {
        M10__sbFetchJson_(
          'delete',
          '/rest/v1/council_deliberation_steps?deliberation_id=eq.' + encodeURIComponent(d.id)
        );
      } catch (e1) {}

      try {
        M10__sbFetchJson_(
          'delete',
          '/rest/v1/council_deliberations?id=eq.' + encodeURIComponent(d.id)
        );
        deleted.push({ id: d.id, backtest_id: d.backtest_id });
      } catch (e2) {
        Logger.log('[M10] Failed deleting deliberation id=' + d.id + ' msg=' + e2.message);
      }
    }
  }

  Logger.log(JSON.stringify(deleted, null, 2));
  return deleted;
}




function M10__deleteTriggersByFunctionName_(functionName) {
  var triggers = ScriptApp.getProjectTriggers();
  var deleted = 0;

  for (var i = 0; i < triggers.length; i++) {
    try {
      if (triggers[i].getHandlerFunction() === functionName) {
        ScriptApp.deleteTrigger(triggers[i]);
        deleted++;
      }
    } catch (e) {
      Logger.log('[M10] Failed deleting trigger for ' + functionName + ': ' + ((e && e.message) ? e.message : e));
    }
  }

  Logger.log('[M10] Deleted triggers for ' + functionName + ': ' + deleted);
  return deleted;
}


function M10__getScriptProps_() {
  return PropertiesService.getScriptProperties();
}

function M10__isCouncilStopRequested_() {
  var props = M10__getScriptProps_();
  return String(props.getProperty(M10_STOP_PROP) || '') === '1';
}

function M10__setCouncilStopRequested_(flag) {
  var props = M10__getScriptProps_();
  if (flag) props.setProperty(M10_STOP_PROP, '1');
  else props.deleteProperty(M10_STOP_PROP);
}

function M10__getMaxStepsPerDeliberation_() {
  var props = M10__getScriptProps_();
  var raw = props.getProperty(M10_MAX_STEPS_PER_DELIBERATION_PROP);
  var n = parseInt(raw, 10);
  if (!isFinite(n) || n <= 0) return M10_DEFAULT_MAX_STEPS_PER_DELIBERATION;
  return n;
}


function RUN_StopDeliberativeCouncilNow() {
  M10__setCouncilStopRequested_(true);
  M10__deleteTriggersByFunctionName_(M10_RESUME_TRIGGER_FUNCTION);
  Logger.log('[M10] Deliberative council STOP requested. Future resume triggers removed.');
  return { ok: true, stopped: true };
}

function RUN_AllowDeliberativeCouncilNow() {
  M10__setCouncilStopRequested_(false);
  Logger.log('[M10] Deliberative council STOP cleared.');
  return { ok: true, stopped: false };
}

function RUN_StopAllProjectTriggersNow() {
  var triggers = ScriptApp.getProjectTriggers();
  var deleted = 0;
  for (var i = 0; i < triggers.length; i++) {
    try {
      ScriptApp.deleteTrigger(triggers[i]);
      deleted++;
    } catch (e) {
      Logger.log('[M10] Failed deleting trigger: ' + ((e && e.message) ? e.message : e));
    }
  }
  Logger.log('[M10] All project triggers deleted. count=' + deleted);
  return { ok: true, deleted: deleted };
}

function RUN_ShowCouncilControlStateNow() {
  var props = M10__getScriptProps_();
  var triggers = ScriptApp.getProjectTriggers();
  var resumeCount = 0;

  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === M10_RESUME_TRIGGER_FUNCTION) resumeCount++;
  }

  var out = {
    stop_requested: M10__isCouncilStopRequested_(),
    resume_trigger_count: resumeCount,
    max_steps_per_deliberation: M10__getMaxStepsPerDeliberation_()
  };

  Logger.log('[M10] Control State: ' + JSON.stringify(out, null, 2));
  return out;
}


function M10__parseDateSafe_(v) {
  if (!v) return null;
  var d = new Date(v);
  if (!d || isNaN(d.getTime())) return null;
  return d;
}

function M10__isDeliberationTooOld_(deliberationRow) {
  var created = M10__parseDateSafe_(deliberationRow && deliberationRow.created_at);
  if (!created) return false;

  var ageMs = new Date().getTime() - created.getTime();
  var ageMin = ageMs / 60000.0;
  return ageMin > M10_MAX_DELIBERATION_AGE_MINUTES;
}

function M10__getDeliberationStepCount_(deliberationId) {
  var steps = M10__getDeliberationSteps_(deliberationId);
  return steps ? steps.length : 0;
}

function M10__markDeliberationStopped_(deliberationRow, reason) {
  var patch = {
    consensus_reached: true,
    final_decision: 'HOLD',
    president_override: 'STOPPED'
  };

  try {
    M10__patchDeliberation_(deliberationRow.id, patch);
    Logger.log('[M10] Deliberation id=' + deliberationRow.id + ' marked stopped. reason=' + reason);
  } catch (e) {
    Logger.log('[M10] Failed marking deliberation stopped id=' + deliberationRow.id + ': ' + ((e && e.message) ? e.message : e));
  }

  try {
    M10__insertDeliberationStep_(
      deliberationRow.id,
      deliberationRow.backtest_id,
      'system_guard',
      'supervisor_finalize',
      {
        final_decision: 'HOLD',
        rationale: 'Stopped by system guard: ' + String(reason || ''),
        worker_summary: {},
        winning_arguments: [],
        rejected_arguments: ['Stopped by system guard'],
        policy_override_applied: true
      }
    );
  } catch (e2) {
    Logger.log('[M10] Failed inserting guard step id=' + deliberationRow.id + ': ' + ((e2 && e2.message) ? e2.message : e2));
  }
}

function M10__ensureSingleResumeTrigger_() {
  if (M10__isCouncilStopRequested_()) {
    Logger.log('[M10] Stop requested; not scheduling resume trigger.');
    M10__deleteTriggersByFunctionName_(M10_RESUME_TRIGGER_FUNCTION);
    return null;
  }

  M10__deleteTriggersByFunctionName_(M10_RESUME_TRIGGER_FUNCTION);

  var trigger = ScriptApp.newTrigger(M10_RESUME_TRIGGER_FUNCTION)
    .timeBased()
    .after(10 * 1000)
    .create();

  Logger.log('[M10] Resume trigger scheduled for ' + M10_RESUME_TRIGGER_FUNCTION);
  return trigger;
}


function RUN_ProcessOneDeliberativeCouncilStepNow() {
  if (M10__isCouncilStopRequested_()) {
    Logger.log('[M10] Kill switch active. Exiting without processing.');
    M10__deleteTriggersByFunctionName_(M10_RESUME_TRIGGER_FUNCTION);
    return { done: true, stopped: true, message: 'Stopped by kill switch.' };
  }

  Logger.log('[M10] ---------------------------------------');
  Logger.log('[M10] Process One Deliberative Step');
  Logger.log('[M10] ---------------------------------------');

  var task = M10__findNextDeliberativeTask_();

  if (!task) {
    Logger.log('[M10] No pending deliberative work found.');
    M10__deleteTriggersByFunctionName_(M10_RESUME_TRIGGER_FUNCTION);
    return { done: true, message: 'No pending work.' };
  }

  Logger.log('[M10] Next task: ' + task.label + ' | deliberation_id=' + task.deliberation.id);

  try {
    if (task.fnName === 'RUN_RiskOfficerInitialNow') {
      RUN_RiskOfficerInitialNow();
    } else if (task.fnName === 'RUN_StrategyScoutInitialNow') {
      RUN_StrategyScoutInitialNow();
    } else if (task.fnName === 'RUN_QuantAuditorInitialNow') {
      RUN_QuantAuditorInitialNow();
    } else if (task.fnName === 'RUN_RiskOfficerCrossReviewNow') {
      RUN_RiskOfficerCrossReviewNow();
    } else if (task.fnName === 'RUN_StrategyScoutCrossReviewNow') {
      RUN_StrategyScoutCrossReviewNow();
    } else if (task.fnName === 'RUN_QuantAuditorCrossReviewNow') {
      RUN_QuantAuditorCrossReviewNow();
    } else if (task.fnName === 'RUN_CouncilSupervisorNow') {
      RUN_CouncilSupervisorNow();
    } else {
      throw new Error('[M10] Unknown next task fnName=' + task.fnName);
    }
  } catch (e) {
    var msg = (e && e.message) ? e.message : String(e);
    Logger.log('[M10] Step failed: ' + msg);

    // Important: do NOT endlessly reschedule if stop requested
    if (M10__isCouncilStopRequested_()) {
      M10__deleteTriggersByFunctionName_(M10_RESUME_TRIGGER_FUNCTION);
      return { done: true, stopped: true, message: 'Stopped after failure because kill switch is active.' };
    }

    // Optional behavior: still schedule one retry later
    M10__ensureSingleResumeTrigger_();
    return { done: false, error: true, message: 'Step failed; retry scheduled.', error_message: msg };
  }

  if (M10__isCouncilStopRequested_()) {
    Logger.log('[M10] Kill switch became active after step completion. Not scheduling next step.');
    M10__deleteTriggersByFunctionName_(M10_RESUME_TRIGGER_FUNCTION);
    return { done: true, stopped: true, message: 'Stopped by kill switch after step.' };
  }

  var nextTask = M10__findNextDeliberativeTask_();
  if (nextTask) {
    M10__ensureSingleResumeTrigger_();
    return { done: false, message: 'Step completed; resume scheduled.', next: nextTask.label };
  } else {
    Logger.log('[M10] Deliberative council appears complete.');
    M10__deleteTriggersByFunctionName_(M10_RESUME_TRIGGER_FUNCTION);
    return { done: true, message: 'All steps complete.' };
  }
}

function RUN_ResumeDeliberativeCouncilNow() {
  if (M10__isCouncilStopRequested_()) {
    Logger.log('[M10] Resume called but kill switch is active. Exiting.');
    M10__deleteTriggersByFunctionName_(M10_RESUME_TRIGGER_FUNCTION);
    return { done: true, stopped: true, message: 'Stopped by kill switch.' };
  }
  return RUN_ProcessOneDeliberativeCouncilStepNow();
}

function M10__callGeminiJson_(systemPrompt, userPrompt) {
  var key = M1_secGetGeminiKey();
  if (!key) throw new Error('[M10] Missing Gemini API key.');

  var model = 'gemini-2.5-flash';
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + encodeURIComponent(key);

  var payload = {
    contents: [
      {
        parts: [
          {
            text: String(systemPrompt || '') + '\n\n' + String(userPrompt || '')
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json'
    }
  };

  var res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var code = res.getResponseCode();
  var text = res.getContentText();

  if (code < 200 || code >= 300) {
    throw new Error('[M10] Gemini error code=' + code + ' body=' + text.slice(0, 500));
  }

  var data = JSON.parse(text);
  var content = (((data || {}).candidates || [])[0] || {}).content || {};
  var parts = content.parts || [];
  var raw = parts.length ? String(parts[0].text || '') : '';

  if (!raw) throw new Error('[M10] Gemini returned no text content.');

  return M10__parseJsonLoose_(raw);
}


function M10__callGroqJson_(systemPrompt, userPrompt) {
  var key = M1_secGetGroqKey();
  if (!key) throw new Error('[M10] Missing Groq API key.');

  var url = 'https://api.groq.com/openai/v1/chat/completions';

  var payload = {
    model: 'llama-3.3-70b-versatile',
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
      Authorization: 'Bearer ' + key
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var code = res.getResponseCode();
  var text = res.getContentText();

  if (code < 200 || code >= 300) {
    throw new Error('[M10] Groq error code=' + code + ' body=' + text.slice(0, 500));
  }

  var data = JSON.parse(text);
  var msg = (((data || {}).choices || [])[0] || {}).message || {};
  var raw = String(msg.content || '');

  if (!raw) throw new Error('[M10] Groq returned no message content.');

  return M10__parseJsonLoose_(raw);
}


function M10__callLLMJson_(systemPrompt, userPrompt) {
  var providers = String(M10_LLM_PROVIDER || 'gemini').split('>');

  for (var i = 0; i < providers.length; i++) {
    var p = String(providers[i] || '').trim().toLowerCase();

    try {
      if (p === 'gemini') {
        return M10__callGeminiJson_(systemPrompt, userPrompt);
      }
      if (p === 'groq') {
        return M10__callGroqJson_(systemPrompt, userPrompt);
      }
      if (p === 'openrouter') {
        return M10__callOpenRouterJson_(systemPrompt, userPrompt);
      }
      throw new Error('[M10] Unknown LLM provider: ' + p);
    } catch (e) {
      var msg = (e && e.message) ? e.message : String(e);
      var isLast = (i === providers.length - 1);
      var looksRateLimited = (
        msg.indexOf('429') !== -1 ||
        msg.toLowerCase().indexOf('rate limit') !== -1 ||
        msg.toLowerCase().indexOf('quota') !== -1
      );

      if (!isLast && looksRateLimited) {
        Logger.log('[M10] Provider ' + p + ' rate-limited. Falling back...');
        continue;
      }

      if (!isLast) {
        Logger.log('[M10] Provider ' + p + ' failed. Falling back...');
        continue;
      }

      throw e;
    }
  }

  throw new Error('[M10] No LLM provider succeeded.');
}




function RUN_CouncilAnalyzeSpecificBacktest_ChampionNow() {
  return RUN_CouncilAnalyzeSpecificBacktestNow('bt_8e24c2cd59f9ce9fa6e9128400b8d1c7');
}


