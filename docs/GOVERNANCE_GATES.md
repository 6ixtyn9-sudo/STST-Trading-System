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

### 3. Micro-Live Operational Gates
Used to determine whether the runtime may open new trades.

These gates are now critical because the project has moved into V9 micro-live readiness.

---

## Governance State Machine

### Core runtime states
- `ACTIVE`
- `PAUSED`
- `HARD_STOP`

### Interpretation
#### ACTIVE
Entries may be considered, but only after passing runtime pre-trade guard.

#### PAUSED
No new entries.
Open positions may still be managed or reconciled.
Pause usually reflects:
- temporary risk concern
- telemetry concern
- rolling metric concern
- operator review need

#### HARD_STOP
No new entries.
No implicit resumption.
Requires explicit human intervention and review.

---

## Runtime Entry Gate

### No new entry is allowed unless all are true:
- state is `ACTIVE`
- active config exists
- equity telemetry exists
- equity telemetry is fresh
- governance heartbeat is fresh
- no live kill-switch is active

This is now a first-class governance requirement.

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

This is now the dominant caution.

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

This distinction is now critical.

---

## Current Deployment Rule

The current strategy pair is approved for:
- shadow-live
- micro-live validation
- conservative runtime testing

It is not approved for:
- aggressive capital
- automatic scaling
- leverage increase
- treating the backtest as full production proof

---

## Current Gate Reality

### Strict gate result
The selected champion still fails the strict gate due to:
- DD-duration > 120 days

### Survival / micro-live result
The selected champion remains economically credible under medium friction and micro-live posture.

### Governance interpretation
This means:
- proceed only in validation posture
- use low heat
- maintain explicit runtime guardrails
- do not confuse “survives” with “comfortable”

---

## Practical Governance Sequence

Before allowing any new trade:
1. write equity snapshot
2. apply governance evaluation
3. update live state if needed
4. run pre-trade guard
5. only if allowed, evaluate entries

If any step fails, block entry.

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
- override M8 governance state
- override M9 empirical truth
- silently downgrade runtime safety concerns

---

## Strategic Summary

Governance gates now apply at three layers:
- research legitimacy
- candidate survival legitimacy
- runtime permission to act

The current strategy is good enough for:
- micro-live validation

It is not yet good enough for:
- carefree deployment

That distinction must remain explicit.
