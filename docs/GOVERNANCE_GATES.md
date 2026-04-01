# GOVERNANCE GATES

This document summarizes how governance, empirical truth, and runtime protections constrain action in the system.

---

## Purpose

No strategy, council output, AI suggestion, or operator enthusiasm should float free of:
- constitutional authority
- governance state
- empirical evidence
- runtime safety
- telemetry integrity

This file exists to summarize those boundaries.

---

## Constitutional Order

1. **M1** — constitutional authority
2. **M8** — governance state authority
3. **M9** — empirical truth authority
4. **M10** — orchestration / continuity / memory
5. downstream advisory layers
6. execution layers only after lawful approval

---

## Governance Principles

### Principle 1 — Fail-Closed
If governance implies fail-closed behavior:
- AI may explain
- AI may summarize
- AI may recommend caution
- AI may not manufacture permission

### Principle 2 — Evidence First
If empirical evidence is weak or degraded:
- narrative cannot convert weakness into proof
- council cannot override empirical illegitimacy
- operator preference cannot silently become policy

### Principle 3 — Runtime Safety Is Part of Governance
A strategy is not governable if:
- telemetry is missing
- governance heartbeat is stale
- equity state is unknown
- the system is active but blind

---

## Important Current Distinction

The project now needs two distinct governance interpretations.

### 1. Candidate Review Governance
Question:
- does this strategy/candidate deserve promotion into shadow-live or micro-live validation posture?

This layer should focus on:
- empirical candidate quality
- friction realism
- bounded strategy governance context
- maintenance caution

This layer should **not** be hard-blocked merely because:
- operator mood journal is incomplete
- starting capital acknowledgment is missing
- leverage acknowledgment is missing

Those are activation-layer concerns, not candidate-legitimacy concerns.

---

### 2. Activation / Go-Live Governance
Question:
- may the runtime actually activate live behavior right now?

This layer should focus on:
- current governance state
- kill switch
- telemetry freshness
- live state machine
- operator/runtime readiness constraints
- actual go-live checklist requirements where still retained

This distinction is now critical.

---

## Classes of Gates

The system now effectively uses three distinct classes of gates:

### 1. Strict Research Gates
Used for research-grade passes.

Typical requirements:
- sufficient OOS trade count
- PF threshold
- expectancy threshold
- Sharpe threshold
- drawdown-duration threshold
- avg win/loss threshold

These determine whether a configuration is a true research pass.

---

### 2. Survival Gates
Used for friction-aware candidate selection.

Purpose:
- determine whether the edge remains economically alive under realistic friction
- identify strategies that may justify micro-live validation
- avoid pretending survival equals perfection

A strategy may fail strict gates but still survive survival gates.

---

### 3. Activation / Runtime Permission Gates
Used to determine whether the runtime may open new trades.

These are now critical because the project has moved into micro-live readiness.

---

## Governance State Machine

### Core runtime states
- `ACTIVE`
- `PAUSED`
- `HARD_STOP`

### Interpretation

#### ACTIVE
Entries may be considered, but only after runtime pre-trade guard passes.

#### PAUSED
No new entries.
Open positions may still be managed or reconciled.
Pause usually reflects:
- temporary risk concern
- telemetry concern
- runtime caution
- review need

#### HARD_STOP
No new entries.
No implicit resumption.
Requires explicit review.

---

## Runtime Entry Gate

### No new entry is allowed unless all are true:
- state is `ACTIVE`
- active config exists
- equity telemetry exists
- equity telemetry is fresh
- governance heartbeat is fresh
- no live kill-switch is active

This remains a first-class governance requirement.

### Important
An `ACTIVE` state without telemetry is not operationally trustworthy.
Therefore telemetry absence or staleness must be treated as a blocking condition.

---

## Telemetry Gate

### Required telemetry
At minimum:
- equity snapshots
- governance heartbeat
- realized trade logging

### Why
Without these, the system cannot reliably enforce:
- drawdown protection
- daily loss rules
- rolling PF / expectancy rules
- leverage or exposure monitoring

### Current policy direction
No telemetry → no new entries.

---

## Current Empirical Relevance

This matters now because the project has advanced from broad research into friction-aware candidate selection.

### Current empirical truth
- the selected strategy survives medium friction in a narrow cluster
- the edge is not fake
- friction modeling is active and meaningful
- leverage above the conservative cap adds no practical value in current board

### Current unresolved weakness
The main operational weakness is:

**drawdown duration / prolonged underwater time**

This remains the dominant caution.

---

## Research vs Deployment Rule

A strategy may be:
- interesting
- coherent
- validated enough for follow-up
- alive under friction
- acceptable for micro-live validation

without being:
- fully deployment-approved
- scale-ready
- operationally comfortable
- free of governance caution

This distinction must remain explicit.

---

## Current Candidate Rule

The current strategy pair is acceptable for:
- shadow-live
- micro-live validation
- conservative runtime testing

It is not acceptable for:
- aggressive capital
- automatic scaling
- leverage increase
- treating the backtest as full production proof

---

## Current Activation Rule

Even a candidate that is acceptable for micro-live validation may still be blocked from actual live activation if:
- runtime state is `PAUSED`
- runtime state is `HARD_STOP`
- telemetry is stale
- activation gating is not satisfied

This is not contradiction.
It is layered governance.

---

## Role of AI / Council

AI may:
- summarize
- critique
- compare candidate options
- clarify risks
- help enforce bounded governance interpretation

AI may not:
- override M1
- override M8 activation state
- override M9 empirical truth
- silently downgrade runtime safety concerns

---

## Strategic Summary

Governance gates now operate at multiple distinct layers:
- research legitimacy
- candidate survival legitimacy
- activation/runtime permission

The current strategy is good enough for:
- micro-live candidate posture

It is not yet good enough for:
- carefree deployment
- automatic activation
- unbounded trust

That distinction must remain explicit.
