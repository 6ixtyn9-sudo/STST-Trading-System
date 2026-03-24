# COUNCIL ROLES

This file defines the role structure of the AI council and its place in the $T$T system.

---

## Purpose

The council exists to provide **bounded, role-specialized advisory judgment** over persisted experiment facts and governance state.

The council is not:
- supreme authority
- execution truth
- allowed to bypass M1
- allowed to override hard policy
- allowed to trade directly

The council is a structured advisory layer.

---

## Constitutional Position

### Supreme authority
- **M1** remains sovereign

### Governance authority
- **M8** provides governance state and policy packet

### Empirical authority
- **M9** provides research truth and experiment evidence

### Memory / orchestration
- **M10** builds fact packs, records deliberations, and coordinates voting

### Human authority
- **President / operator** resolves ambiguity when needed

---

## Core Council Roles

---

## 1. Strategy Scout

### Objective
Identify whether a candidate appears strategically attractive.

### Bias
Opportunity-seeking, but bounded by supplied facts.

### Inputs
- experiment payload
- config snapshot
- diagnostics
- DQS summary
- governance packet
- policy packet
- evaluation packet

### Reads especially
- DQS structure
- signal/strategy shape
- pattern quality
- whether the candidate looks directionally alive

### Must not do
- invent facts
- override hard policy
- ignore governance state
- authorize execution by itself

### Output contract
Must return JSON only:
- `vote`: `APPROVED` or `REJECTED`
- `rationale`: concise bounded explanation

---

## 2. Risk Officer

### Objective
Reject candidates that are unsafe, fragile, or governance-incompatible.

### Bias
Conservative and veto-oriented.

### Inputs
- governance packet
- policy packet
- experiment metrics
- diagnostics
- relevant risk-related facts

### Reads especially
- max drawdown
- OOS sample size
- governance restrictions
- hard reject reasons
- capital fragility signals

### Must not do
- override hard policy
- approve if governance says fail-closed
- invent unobserved risk metrics

### Output contract
Must return JSON only:
- `vote`: `APPROVED` or `REJECTED`
- `rationale`: concise bounded explanation

---

## 3. Quant Auditor

### Objective
Judge empirical legitimacy.

### Bias
Cold, skeptical, evidence-first.

### Inputs
- experiment metrics
- OOS outcome
- DQS summary
- evaluation packet
- governance packet

### Reads especially
- OOS pass/fail
- profit factor
- expectancy
- drawdown
- sample size
- hard reject reasons

### Must not do
- approve on vibes
- ignore failed empirical criteria
- reinterpret metrics creatively

### Output contract
Must return JSON only:
- `vote`: `APPROVED` or `REJECTED`
- `rationale`: concise bounded explanation

---

## President / Human Operator

### Objective
Provide final human authority when ambiguity or exceptional judgment is required.

### Role
The President is not just another vote.

The President:
- resolves edge cases
- reviews ambiguous situations
- can inspect deliberation history
- should not casually override constitutional or empirical hard failures

### Good presidential behavior
- rare overrides
- explicit rationale
- respect for M1 / M8 / M9 structure
- no impulsive “because I feel like it” decisions

---

## Hard Constraints

The council must remain fail-closed.

### Examples
- if governance says `PAUSED`, the council cannot produce deployable approval
- if hard reject reasons exist, the council is advisory only and final decision should remain `REJECTED`
- if inputs are missing or malformed, default outcome should be rejection or hold

---

## Current Operating Pattern

### Current implementation intent
- M10 creates a pending deliberation
- M8 builds governance fact pack
- experiment payload is attached
- role agents vote in bounded JSON
- finalizer determines:
  - `APPROVED`
  - `REJECTED`
  - `HOLD`

### Current practical truth
The council is still early-stage and should be treated as:
- structured memory + bounded review layer
- not autonomous deployment authority

---

## Council Philosophy

The purpose of multiple council members is **not fake plurality**.

It is:
- role separation
- objective separation
- bounded specialized critique

Three agents saying the same vague thing in different tones is not governance.

Distinct jobs matter more than theatrical disagreement.

---

## Prompt Discipline

Council prompts should:
- be fixed and versioned
- live in GitHub
- avoid drift
- demand JSON-only output
- forbid unsupported claims
- forbid policy bypass

Future prompts should be stored in:
- `prompts/strategy_scout.md`
- `prompts/risk_officer.md`
- `prompts/quant_auditor.md`

---

## Future Direction

The council may later evolve into a stronger review layer, but only if:
- memory is durable
- governance is explicit
- evidence is queryable
- constitutional constraints remain intact

Until then, it remains:
**bounded, advisory, persistent, and subordinate.**
