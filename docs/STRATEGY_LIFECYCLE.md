# STRATEGY LIFECYCLE

This document defines how strategy ideas move from research into live eligibility, and how they should be maintained over time.

---

## Purpose

A strategy should not be treated as permanently valid because it looked good once.

Markets drift.
Edges decay.
Friction matters.
Execution reality matters.
Operational pain matters.

Therefore strategies require:
- discovery
- validation
- friction-aware stress testing
- governance review
- continuous maintenance
- possible quarantine or retirement

This project treats strategy lifecycle as a living process, not a one-time approval.

---

## Lifecycle Overview

A strategy should move through these states:

1. **Experimental**
2. **Candidate**
3. **Validated**
4. **Live Eligible**
5. **Micro-Live Active**
6. **Active**
7. **Restricted / Quarantined**
8. **Retired**

---

## 1. Experimental

### Meaning
The family is exploratory.

### Typical characteristics
- broad matrix runs
- unclear empirical support
- many failures
- family comparison still active
- inversion testing still useful

### Allowed actions
- broad research
- parameter sweeps
- family comparison
- symbol/universe exploration

### Not allowed
- live deployment
- strong capital assumptions
- narrative certainty

---

## 2. Candidate

### Meaning
The family is still not proven, but is among the strongest available directions.

### Typical characteristics
- repeatedly among best or least-bad rows
- recurring structure across runs
- enough coherence to justify narrower work

### Allowed actions
- narrower reruns
- cleaner data reruns
- family-specific testing
- tighter parameter neighborhood testing

### Promotion criteria
Move to **Validated** only if:
- the pattern survives deeper checks
- the cluster is not just one lucky row
- data refresh does not destroy the result

---

## 3. Validated

### Meaning
The family has survived stronger empirical scrutiny.

### Typical characteristics
- survives narrower reruns
- survives cleaner data
- parameter neighborhood has coherence
- stronger evidence than “least bad”

### Allowed actions
- friction stress
- maintenance framework setup
- governance preparation
- candidate selection

### Promotion criteria
Move to **Live Eligible** only if:
- friction-aware testing remains acceptable
- governance does not block candidate legitimacy
- operational risk is understood
- candidate selection is explicit

---

## 4. Live Eligible

### Meaning
The strategy is allowed to be considered for live use.

### Important
Live Eligible does **not** mean approved for unrestricted live deployment.

It means:
- a strategy may be selected for shadow or live use
- subject to governance interpretation
- subject to runtime protections
- subject to active monitoring

### Important distinction
A strategy may be live-eligible as a candidate
without the runtime being currently activation-ready.

That distinction matters.

---

## 5. Micro-Live Active

### Meaning
The strategy is approved for:
- shadow-live
- paper-live
- or tiny-risk micro-live validation

This remains the current project posture for the selected champion.

### Current approved champion
`BREAKOUT_LONG | TOP_SPS_WITH_DOGE | D2_A | P2_FAST | T2_BAL`

### Current backup
`BREAKOUT_LONG | TOP_SPS_WITH_DOGE | D2_A | P1_BASE | T1_OPEN`

### Important
Micro-Live Active does **not** imply:
- scaled capital
- strategy maturity beyond question
- immunity from quarantine
- guaranteed activation permission at this exact moment

It means:
- the edge is real enough to test in tightly governed conditions
- but still has unresolved operational risk

---

## 6. Active

### Meaning
The strategy is currently permitted for broader live deployment.

### Requirements
- still live eligible
- not degraded
- not quarantined
- governance permits
- telemetry is healthy
- runtime integrity is healthy
- live evidence supports continuation

### Important
An Active strategy must still be continuously re-evaluated.

---

## 7. Restricted / Quarantined

### Meaning
The strategy is temporarily or conditionally blocked.

### Reasons
- rolling live degradation
- DD-duration becoming operationally unacceptable
- PF / expectancy collapse
- Sharpe collapse
- telemetry failure
- governance restriction
- regime mismatch
- data integrity issues

### Allowed actions
- reduced-size simulation
- shadow-only operation
- revalidation
- diagnosis

### Not allowed
- unrestricted live deployment

---

## 8. Retired

### Meaning
The strategy is no longer worth operational capital.

### Reasons
- repeated degradation
- edge decay
- better families replace it
- friction realism destroys viability
- live maintenance repeatedly fails

### Allowed actions
- archive
- historical study
- re-test only if strong evidence justifies it

---

## Promotion / Demotion Logic

### Experimental → Candidate
Promote when:
- a family repeatedly appears among the strongest rows
- it is worth focused follow-up

### Candidate → Validated
Promote when:
- deeper checks do not destroy the pattern
- the cluster remains coherent under cleaner tests

### Validated → Live Eligible
Promote when:
- friction-aware testing still leaves a credible candidate set
- governance does not block candidate legitimacy
- a specific configuration can be selected

### Live Eligible → Micro-Live Active
Promote when:
- champion / backup are selected
- deploy bundle exists
- risk rules exist
- validation posture is explicitly acknowledged

### Micro-Live Active → Active
Promote only when:
- live evidence supports broader trust
- no major governance failures occur
- DD-duration behavior is acceptable in practice
- explicit review approves escalation

### Any live state → Restricted / Quarantined
Demote when:
- live metrics degrade materially
- telemetry is stale or missing
- governance blocks activation
- underwater duration becomes unacceptable
- strategy no longer justifies continued live risk

### Any state → Retired
Retire when:
- repeated evidence shows the edge is no longer worth capital or maintenance effort

---

## Current Lifecycle State

### Lead family
`BREAKOUT_LONG`

### Current state
**MICRO_LIVE_ACTIVE (VALIDATION POSTURE)**

This is more specific than “Validated” and more conservative than “Active.”

### Why
The current champion:
- survives medium friction
- has positive expectancy
- has positive PF and positive Sharpe
- has enough OOS trades
- but still fails the strict DD-duration threshold

Therefore it is:
- not merely experimental
- not merely validated
- not broadly active
- but appropriate for micro-live validation posture

---

## Current Review Target

### Main persisted champion review target
- `backtest_id = bt_8e24c2cd59f9ce9fa6e9128400b8d1c7`
- `run_name = V9_SANITY_RERUN_CHAMPION`

### Why this matters
Lifecycle interpretation should now prefer:
- explicit persisted candidate rows
over
- accidental latest-sheet-row inference

---

## Known Current Weakness

The current strategy’s primary unresolved weakness remains:

**drawdown duration / prolonged underwater time**

This is the dominant caution preventing broader confidence.

---

## Important Current Distinction

A strategy may be:
- candidate-valid
- micro-live-valid
- worthy of council review

without the system being currently permitted to:
- activate live entries immediately

That is the difference between:
- lifecycle/candidate status
and
- activation/runtime permission

This distinction should remain explicit.

---

## Maintenance Requirements

A strategy is never “approved forever.”

It must be monitored for:
- rolling PF
- rolling expectancy
- rolling Sharpe
- drawdown severity
- drawdown duration
- sample sufficiency
- telemetry health
- execution integrity
- governance health

If maintenance fails:
- reduce size
- restrict
- pause
- quarantine
- or retire

That is perpetual gate maintenance.

---

## Role of Modules in Lifecycle

### M9
Empirical validation and evidence authority

### M8
Governance-state authority

### M10
Memory / orchestration / continuity layer

### M5
Risk-law gate before deployment

### M6
Execution only after lawful approval

### M1
Constitutional supremacy over all of the above

---

## Strategic Implication

The system must continue evolving from:
- one-time backtest judgment

to:
- continuous discovery
- continuous validation
- friction-aware realism
- targeted candidate review
- telemetry-aware activation
- continuous maintenance
- controlled promotion and demotion

That is the real lifecycle.
