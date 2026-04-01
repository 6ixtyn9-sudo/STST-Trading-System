# COUNCIL ROLES

This file defines the role structure of the AI council and its place in the system.

---

## Purpose

The council exists to provide **bounded, role-specialized advisory judgment** over:
- persisted experiment facts
- governance state
- candidate deployment readiness
- strategy maintenance / restriction questions

The council is not:
- supreme authority
- execution truth
- allowed to bypass M1
- allowed to override hard policy
- allowed to place trades
- allowed to silently upgrade a candidate into live approval

The council is a structured advisory layer.

---

## Constitutional Position

### Supreme authority
- **M1** remains sovereign

### Governance authority
- **M8** provides governance interpretation

### Empirical authority
- **M9** provides research truth and experiment evidence

### Memory / orchestration
- **M10** builds fact packs, records deliberations, and coordinates bounded review

### Human authority
- **President / operator** resolves ambiguity when needed

---

## Current Practical Position

The council should currently be treated as:
- a structured advisory layer
- a persistent review layer
- a bounded critique mechanism
- a memory-bearing deliberation layer

It should **not** currently be treated as:
- autonomous deployment authority
- direct execution authority
- constitutional override
- empirical override
- substitute for runtime permissioning

---

## Important Current Role Distinction

The council is most appropriate for:

### Candidate Review Questions
Examples:
- does this candidate deserve promotion into micro-live validation posture?
- what is the strongest bounded interpretation of this candidate’s risk?
- what minimum further proof is needed?
- should this strategy remain in validation posture or be restricted?

The council is less appropriate for:

### Activation Permission Questions
Examples:
- may the runtime open a new trade this minute?
- is telemetry fresh enough right now?
- should the system ignore a live hard-stop?

Those belong to:
- governance state
- telemetry
- runtime guard
- pre-trade guard
not to council vibes.

---

## Current Deliberative Pattern

The council now supports a deliberative review pattern with:

1. three initial worker judgments
2. three cross-reviews
3. one supervisor synthesis

This is an upgrade from:
- isolated single votes
- a thin finalizer

The purpose is:
- visible critique
- self-correction
- bounded disagreement
- durable review history

---

## Core Council Roles

---

## 1. Strategy Scout

### Objective
Identify whether a candidate appears strategically attractive.

### Bias
Opportunity-seeking, but bounded by supplied facts.

### Must not do
- invent facts
- override hard policy
- ignore governance state
- authorize execution by itself
- treat “interesting” as “approved”

---

## 2. Risk Officer

### Objective
Reject candidates that are unsafe, fragile, or governance-incompatible.

### Bias
Conservative and veto-oriented.

### Must not do
- override hard policy
- invent unobserved risk metrics
- confuse survivability with comfort
- manufacture approval

---

## 3. Quant Auditor

### Objective
Judge empirical legitimacy.

### Bias
Cold, skeptical, evidence-first.

### Must not do
- approve on vibes
- ignore failed empirical criteria
- reinterpret metrics creatively
- silently relax gates

---

## 4. Council Supervisor

### Objective
Review all worker outputs and produce the final bounded synthesis.

### Role
The supervisor is:
- not constitutional authority
- not empirical authority
- not runtime permission authority

The supervisor is:
- the final deliberation synthesizer
- the bounded decision writer
- the summarizer of agreement and disagreement

### Must not do
- invent evidence
- override hard policy
- convert weak evidence into approval
- ignore worker disagreement

---

## President / Human Operator

### Objective
Provide final human authority when ambiguity or exceptional judgment is required.

### Good behavior
- rare overrides
- explicit rationale
- respect for M1 / M8 / M9 structure
- no impulsive “because I feel like it” decisions

---

## Hard Constraints

The council must remain fail-closed.

### Examples
- if governance says `PAUSED` in an activation context, council cannot create live permission
- if hard reject reasons exist, the council cannot pretend they do not exist
- if inputs are missing or malformed, default should be rejection or hold
- if telemetry/governance runtime is unsafe, the council cannot substitute for runtime protection

---

## Current Operating Pattern

### Current implementation intent
- M10 creates a pending deliberation
- a fact pack is built
- initial role agents vote
- cross-review phase runs
- supervisor finalizes
- deliberation history is persisted

### Current practical truth
The council is still:
- bounded
- advisory
- persistent
- subordinate

It is not:
- live execution authority
- runtime guard
- substitute for activation permission

---

## Council Philosophy

The purpose of multiple council members is **not fake plurality**.

It is:
- role separation
- objective separation
- visible critique
- self-correction
- bounded synthesis

Three agents saying the same vague thing is not governance.

Distinct jobs matter more than theater.

---

## Prompt Discipline

Council prompts should:
- be fixed and versioned
- live in GitHub
- avoid drift
- demand JSON-only output
- forbid unsupported claims
- forbid policy bypass
- remain subordinate to constitutional and empirical limits

Current prompt files:
- `prompts/strategy_scout.md`
- `prompts/risk_officer.md`
- `prompts/quant_auditor.md`
- `prompts/strategy_scout_cross_review.md`
- `prompts/risk_officer_cross_review.md`
- `prompts/quant_auditor_cross_review.md`
- `prompts/council_supervisor.md`

---

## Future Direction

The council may evolve into a stronger review layer only if:
- memory remains durable
- governance remains explicit
- evidence remains queryable
- runtime state remains observable
- constitutional constraints remain intact

Until then, it remains:

**bounded, advisory, persistent, and subordinate**
