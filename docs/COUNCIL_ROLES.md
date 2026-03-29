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
- **M8** provides governance state and policy packet

### Empirical authority
- **M9** provides research truth and experiment evidence

### Memory / orchestration
- **M10** builds fact packs, records deliberations, and coordinates bounded review

### Human authority
- **President / operator** resolves ambiguity when needed

---

## Current Practical Position

The council remains an early-to-mid maturity review layer.

It should currently be treated as:
- a structured advisory layer
- a persistent review layer
- a bounded critique mechanism
- a memory-bearing deliberation layer

It should **not** currently be treated as:
- autonomous deployment authority
- direct execution authority
- constitutional override
- empirical override
- live runtime permission layer

Runtime entry permission belongs to governance + telemetry + pre-trade guard, not to council vibes.

---

## Current Relevance

The council is now most relevant for questions like:
- does this candidate deserve promotion from research into micro-live validation?
- should a strategy remain in validation posture or be restricted?
- what is the strongest bounded interpretation of a candidate’s risk?
- what minimum further proof is needed?

It is less relevant for:
- minute-to-minute runtime permissioning
- direct trade execution decisions
- replacing telemetry-aware governance

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
- signal / strategy shape
- pattern quality
- whether the candidate looks directionally alive
- whether the edge appears worth further controlled validation

### Must not do
- invent facts
- override hard policy
- ignore governance state
- authorize execution by itself
- treat “interesting” as “approved”

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
- relevant risk facts

### Reads especially
- drawdown
- drawdown duration
- OOS sample size
- governance restrictions
- hard reject reasons
- capital fragility signals
- whether unresolved operational pain is being underpriced

### Must not do
- override hard policy
- approve if governance says fail-closed
- invent unobserved risk metrics
- confuse survivability with comfort

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
- PF
- expectancy
- drawdown
- drawdown duration
- sample size
- hard reject reasons
- whether friction-aware evidence still supports the claim

### Must not do
- approve on vibes
- ignore failed empirical criteria
- reinterpret metrics creatively
- silently relax gates

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

### Current best use
The operator is most useful when:
- deciding whether micro-live validation is justified
- deciding whether to pause / restrict / switch candidate strategy path
- deciding whether a boundary case deserves more proof rather than false certainty

---

## Hard Constraints

The council must remain fail-closed.

### Examples
- if governance says `PAUSED`, the council cannot create live permission
- if hard reject reasons exist, the council is advisory only and final decision should remain bounded
- if inputs are missing or malformed, default outcome should be rejection or hold
- if telemetry/governance runtime is unsafe, the council cannot substitute for operational protection

---

## Current Operating Pattern

### Current implementation intent
- M10 creates a pending deliberation
- M8 builds governance fact pack
- M9 evidence is attached
- role agents vote in bounded JSON
- finalizer determines:
  - `APPROVED`
  - `REJECTED`
  - `HOLD`

### Current practical truth
The council is still a bounded review layer.
It should be treated as:
- persistent review
- structured memory
- bounded critique

It should not be treated as:
- live execution authority
- runtime guard
- substitute for telemetry-aware governance

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
- remain subordinate to constitutional and empirical limits

Prompts should live in:
- `prompts/strategy_scout.md`
- `prompts/risk_officer.md`
- `prompts/quant_auditor.md`

---

## Machine-Readable Direction

The council should eventually move toward machine-readable role contracts including:
- role ID
- allowed inputs
- output schema
- invocation trigger
- authority limits
- storage location for votes
- fail-closed defaults when inputs are incomplete

This is not fully implemented yet, but it remains the intended discipline step.

---

## Future Direction

The council may later evolve into a stronger review layer, but only if:
- memory is durable
- governance is explicit
- evidence is queryable
- runtime state is observable
- constitutional constraints remain intact
- council I/O contracts are machine-readable and auditable

Until then, it remains:

**bounded, advisory, persistent, and subordinate**
