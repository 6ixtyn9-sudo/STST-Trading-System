# WORKER REGISTRY

This file tracks the bounded AI workers that are actually defined or operational inside the $T$T system.

Its purpose is to reduce drift between:
- worker meaning in docs
- prompt files in `/prompts`
- orchestration logic in `M10`
- future persistence and contract work

This is the human-readable registry of current worker reality.

---

## Why this file exists

The system already has worker ideas in:
- `docs/AI_WORKER_JOBS.md`
- `docs/COUNCIL_ROLES.md`

But those documents are broad role descriptions.

This file is narrower.

It answers:
- which workers are actually being used now
- which prompt file each worker uses
- which phase each worker belongs to
- what status each worker is in

---

## Status meanings

- **documented** — role meaning exists in docs
- **prompted** — a concrete prompt file exists in `/prompts`
- **deliberative_v1** — included in the current 3-worker + supervisor council pattern
- **runtime_planned** — intended to be wired into `M10`
- **persisted_v2** — worker phase outputs are durably stored in Supabase

---

## Current V1 Deliberative Council Workers

| worker_id | role_name | purpose | prompt_file | phase | status | notes |
|---|---|---|---|---|---|---|
| risk_officer | Risk Officer | conservative risk review | `prompts/risk_officer.md` | initial | prompted | current initial-round council worker |
| strategy_scout | Strategy Scout | strategic attractiveness review | `prompts/strategy_scout.md` | initial | prompted | current initial-round council worker |
| quant_auditor | Quant Auditor | empirical legitimacy review | `prompts/quant_auditor.md` | initial | prompted | current initial-round council worker |
| risk_officer | Risk Officer | peer critique and self-correction | `prompts/risk_officer_cross_review.md` | cross_review | deliberative_v1 | new V1 cross-review prompt |
| strategy_scout | Strategy Scout | peer critique and self-correction | `prompts/strategy_scout_cross_review.md` | cross_review | deliberative_v1 | new V1 cross-review prompt |
| quant_auditor | Quant Auditor | peer critique and self-correction | `prompts/quant_auditor_cross_review.md` | cross_review | deliberative_v1 | new V1 cross-review prompt |
| council_supervisor | Council Supervisor | final bounded synthesis and decision | `prompts/council_supervisor.md` | supervisor_finalize | deliberative_v1 | new V1 supervisor prompt |

---

## Current V1 scope

The current worker upgrade applies only to:
- council-style deployment/governance review
- M10 orchestration
- persisted deliberation history

This V1 does **not** yet operationalize all workers listed in:
- `docs/AI_WORKER_JOBS.md`

That broader expansion is intentionally deferred to avoid scope creep.

---

## Current phase map

### Initial round
The following prompts are used as first-pass judgments:
- `prompts/risk_officer.md`
- `prompts/strategy_scout.md`
- `prompts/quant_auditor.md`

### Cross-review round
The following prompts are used after workers can see each other’s initial outputs:
- `prompts/risk_officer_cross_review.md`
- `prompts/strategy_scout_cross_review.md`
- `prompts/quant_auditor_cross_review.md`

### Final supervisor round
The following prompt is used for final bounded synthesis:
- `prompts/council_supervisor.md`

---

## Important authority rule

Workers remain subordinate to:
- M1 constitutional authority
- M8 governance authority
- M9 empirical truth
- hard fail-closed policy

Supervisor synthesis may summarize and finalize,
but may not override hard policy.

---

## V1 implementation home

Current implementation home:
- `apps-script/M10/M10_Full.gs`

Prompt canon:
- `/prompts`

Persistence layer:
- Supabase

Human-readable role meaning:
- `docs/AI_WORKER_JOBS.md`
- `docs/COUNCIL_ROLES.md`
- `docs/WORKER_REGISTRY.md`

---

## Rule

If a worker matters operationally, its prompt and its role should be visible in GitHub.

If its meaning only exists in chat or memory, it is not durable enough.
