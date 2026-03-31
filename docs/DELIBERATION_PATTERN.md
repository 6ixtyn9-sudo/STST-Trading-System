# DELIBERATION PATTERN

This file defines the current V1 council deliberation pattern.

The goal is to upgrade the council from:
- three isolated votes
- one thin finalizer

into:
- three initial role judgments
- three cross-reviews
- one supervisor synthesis
- persisted deliberation history

---

## Purpose

The purpose of this pattern is not theatrical disagreement.

It exists to create:
- bounded role separation
- visible critique
- self-correction
- stronger persistence
- better final decision traceability

---

## Current V1 deliberative pattern

### Job type
Council deployment/governance review

### Current role set
1. Risk Officer
2. Strategy Scout
3. Quant Auditor
4. Council Supervisor

---

## Phase 1 — Initial review

Each of the three council workers receives:
- fact pack
- governance packet
- policy packet
- evaluation packet

Each worker returns:
- vote
- rationale
- confidence
- key_points
- self_critique
- requests_for_peer_review

Current initial prompts:
- `prompts/risk_officer.md`
- `prompts/strategy_scout.md`
- `prompts/quant_auditor.md`

---

## Phase 2 — Cross-review

Each worker then receives:
- the original fact pack
- its own initial output
- the other two workers’ initial outputs

Each worker returns:
- revised_vote
- changed_mind
- why_changed
- peer_critiques
- self_correction
- final_position

Current cross-review prompts:
- `prompts/risk_officer_cross_review.md`
- `prompts/strategy_scout_cross_review.md`
- `prompts/quant_auditor_cross_review.md`

---

## Phase 3 — Supervisor finalization

The Council Supervisor receives:
- fact pack
- all initial worker outputs
- all cross-review outputs
- governance and policy context

The supervisor returns:
- final_decision
- rationale
- worker_summary
- winning_arguments
- rejected_arguments
- policy_override_applied

Current supervisor prompt:
- `prompts/council_supervisor.md`

---

## Fail-closed rule

If any of the following are true:
- hard reject reasons exist
- governance is unsafe
- required facts are missing
- worker outputs are malformed
- council state is incomplete

then final decision must default to:
- `REJECTED`
- or `HOLD`

and never unsupported approval.

---

## Persistence rule

The final decision should not be the only thing stored.

Durable memory should include:
- initial worker outputs
- cross-review outputs
- supervisor output
- final summarized decision

This allows future inspection of:
- what changed
- where disagreement existed
- why the final outcome happened

---

## Current implementation direction

The current implementation home is:
- `apps-script/M10/M10_Full.gs`

The current persistence target is:
- `council_deliberations` for summary row
- `council_deliberation_steps` for per-phase worker history

---

## What this V1 does not do yet

This V1 does not yet:
- generalize deliberation to every worker job
- make all workers machine-readable contracts
- replace all M10 logic
- create autonomous execution authority

Those are later concerns.

Current priority is:
- make the council deliberation real
- make it inspectable
- make it persistent
- avoid scope creep

---

## Rule

The council is a bounded deliberation layer.

It is not:
- constitutional authority
- execution authority
- permission to bypass governance
- permission to bypass empirical hard failures
