# STRATEGY LIFECYCLE

This document defines how strategy ideas should move from research into live eligibility, and how they should be maintained over time.

---

## Purpose

A strategy should not be treated as permanently valid just because it looked promising once.

Markets change.
Edges decay.
Regimes drift.

Therefore strategies need a lifecycle, not just a one-time approval.

---

## Lifecycle Overview

A strategy should move through the following states:

1. **Experimental**
2. **Candidate**
3. **Validated**
4. **Live Eligible**
5. **Active**
6. **Restricted / Quarantined**
7. **Retired**

---

## 1. Experimental

### Meaning
The family is still exploratory.

### Typical characteristics
- broad matrix runs
- unclear empirical support
- weak or mixed results
- many failures
- inversion testing still useful

### Allowed actions
- broad research
- parameter sweeps
- family comparison
- symbol-scope exploration

### Not allowed
- live deployment
- strong capital assumptions
- narrative certainty

---

## 2. Candidate

### Meaning
The family is not proven, but is less bad than the field.

### Typical characteristics
- repeatedly among best or least-worst rows
- evidence of some coherence
- maybe strong mirrored behavior
- worth narrower follow-up

### Allowed actions
- narrower reruns
- family-specific testing
- symbol-specific testing
- deeper data validation

### Promotion criteria
Move to **Validated** only if:
- performance survives deeper checks
- behavior is not a one-row fluke
- pattern persists with clearer controls

---

## 3. Validated

### Meaning
The family has survived stronger empirical scrutiny.

### Typical characteristics
- acceptable behavior across updated tests
- not just one lucky row
- clearer evidence under better data
- more stable parameter neighborhood

### Allowed actions
- repeat validation
- regime segmentation
- symbol-family specialization
- pre-live maintenance framework setup

### Promotion criteria
Move to **Live Eligible** only if:
- empirical gates are satisfied
- governance gates do not block
- risk profile is acceptable
- maintenance plan exists

---

## 4. Live Eligible

### Meaning
The strategy is allowed to be considered by the live machine.

### Important
Live eligible does **not** mean always active.

It means:
- the strategy may be selected for live deployment
- subject to current governance, current regime, and current maintenance status

### Requirements
- empirical pass state
- acceptable OOS behavior
- acceptable drawdown / duration
- acceptable sample size
- governance state not blocking deployment
- explicit approval in registry/state

---

## 5. Active

### Meaning
The strategy is currently permitted for live deployment.

### Requirements
- still live eligible
- not degraded
- not quarantined
- current governance permits operation
- current regime/use-case still makes sense

### Important
An active strategy must be continuously re-evaluated.

---

## 6. Restricted / Quarantined

### Meaning
The strategy is temporarily or conditionally blocked.

### Reasons this may happen
- rolling OOS degradation
- drawdown expansion
- Sharpe collapse
- sample quality deterioration
- current regime mismatch
- governance restriction
- data integrity concerns

### Allowed actions
- reduced-size simulation
- targeted revalidation
- further research only

### Not allowed
- unrestricted live deployment

---

## 7. Retired

### Meaning
The strategy is no longer worth operational capital.

### Reasons this may happen
- repeated empirical failure
- edge decay
- better families replace it
- data no longer supports it
- it was a temporary market artifact

### Allowed actions
- archive
- historical study
- possible future re-test only if strong reason emerges

---

## Lifecycle Promotion Logic

---

## Experimental → Candidate
Promote when:
- family consistently appears among least-bad or best rows
- results are not random one-offs
- there is enough reason to spend more research effort

---

## Candidate → Validated
Promote when:
- narrower reruns remain respectable
- deeper data does not destroy the pattern
- symbol/family behavior still has coherence
- parameter neighborhood is not absurdly fragile

---

## Validated → Live Eligible
Promote when:
- OOS gates pass
- risk profile acceptable
- governance permits
- maintenance rules defined
- explicit strategy registry state updated

---

## Live Eligible → Active
Promote when:
- current environment still supports deployment
- no quarantine flags exist
- governance state is acceptable
- live machine is authorized to use it

---

## Active → Restricted / Quarantined
Demote when:
- rolling degradation appears
- maintenance gates fail
- governance blocks
- strategy no longer fits current conditions

---

## Restricted / Quarantined → Active
Restore only after:
- revalidation
- governance clearance
- explicit status update

---

## Any State → Retired
Retire when:
- edge clearly dies
- repeated maintenance failure
- family no longer justifies research or capital

---

## Perpetual Gate Maintenance

Strategies should not be admitted once and trusted forever.

They must be monitored continuously.

### Maintenance checks should eventually include:
- rolling OOS pass/fail
- rolling Sharpe
- rolling PF
- rolling expectancy
- drawdown severity
- drawdown duration
- sample sufficiency
- regime fit
- degradation trend

### If maintenance fails:
- reduce size
- restrict
- quarantine
- retire

This is perpetual gate maintenance.

---

## Role of Modules in Lifecycle

### M9
Empirical truth and research validation

### M8
Governance state and gate restrictions

### M10
Persistent deliberation / orchestration / memory

### M5
Risk-law gate before deployment

### M6
Execution only after lawful approval

### M1
Supreme authority over all of the above

---

## Future Registry Suggestion

Eventually the `strategy_registry` should support fields like:
- strategy_id
- family
- lifecycle_state
- last_validated_at
- last_dataset_id
- last_oos_pass
- degradation_flag
- live_eligible
- active
- restricted_reason
- retired_reason

This will make the lifecycle machine-readable.

---

## Current Strategic Implication

Because experiments should be perpetual,
the system must evolve from:
- one-time backtest judgments

to:
- continuous discovery
- continuous validation
- continuous maintenance
- controlled promotion/demotion

That is the real destination.
