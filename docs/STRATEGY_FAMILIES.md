# STRATEGY FAMILIES

This document defines the current strategy families, their operating hypotheses, and how they should be interpreted in research.

---

## Purpose

Strategy families should not live only in memory or dead chats.

This file exists so the system has a durable strategy taxonomy:
- names
- definitions
- operating logic
- what they need to see
- how inversion changes interpretation
- which family is currently the active lead

A strategy family is not just a label.
It is a market hypothesis.

---

## Current Active Lead Family

### Current lead
`BREAKOUT_LONG`

### Why
The current project has advanced through V7 / V8 / V9 with `BREAKOUT_LONG` as the active lead family.

It produced:
- the strongest robustness cluster in V7
- a credible survivor set under V8 medium-friction testing
- the selected V9 champion and backup

### Current selected operating zone
- universe: `TOP_SPS_WITH_DOGE`
- champion: `D2_A | P2_FAST | T2_BAL`
- backup: `D2_A | P1_BASE | T1_OPEN`

### Important note
This does **not** erase earlier observations about:
- `LOOSE_MOMO_LONG | INVERTED_MIRROR`
- `FAKEOUT_SHORT`

Those remain historically important and conceptually valid.
They are simply no longer the current active lead family.

---

## Master Table

| Strategy Name | Category | Definition | How It Operates | What It Needs to See |
|---|---|---|---|---|
| `BREAKOUT_LONG` | Continuation | Buy a breakout above resistance and seek follow-through | Looks for strength through resistance, then continuation after confirmation | Resistance break, confirmation, volume support, room to run |
| `BREAKDOWN_SHORT` | Continuation | Short a breakdown below support and seek follow-through | Bearish mirror of breakout logic | Support break, failed reclaim, bearish continuation |
| `TREND_PULLBACK_LONG` | Trend-following continuation | Buy retracements in an existing uptrend | Waits for pullback and seeks resumption rather than peak chase | Existing uptrend, controlled pullback, trend resumption |
| `LOOSE_MOMO_LONG` | Momentum continuation | Buy strong directional movement with looser structure requirements | Attempts to capture directional expansion early | Momentum burst, enough volume, enough follow-through |
| `FAKEOUT_SHORT` | Failure / trap / reversal | Short a failed bullish breakout | Sells when upside break fails and price reclaims below level | Failed breakout, rejection, trapped longs |
| `FAKEOUT_LONG` | Failure / trap / reversal | Buy a failed bearish breakdown | Long mirror of fakeout short | Failed breakdown, reclaim, trapped shorts |
| `EXHAUSTION_FADE_SHORT` | Exhaustion / mean-reversion | Short a stretched move vulnerable to reversal | Fades late-stage extension | Overextension, weakening continuation, reversal behavior |
| `EXHAUSTION_FADE_LONG` | Exhaustion / mean-reversion | Buy a downside capitulation / seller exhaustion event | Long mirror of exhaustion fade short | Capitulation, seller exhaustion, reclaim / reversal |
| `BREAKOUT_LONG_INVERTED_MIRROR` | Inversion-derived proxy | Opposite-side interpretation of breakout-long structure | Often behaves like failed-breakout logic | Signals that “breakout quality” is actually trap/exhaustion behavior |
| `TREND_PULLBACK_LONG_INVERTED_MIRROR` | Inversion-derived proxy | Opposite-side interpretation of pullback-long structure | Reveals when a pullback is actually weakness | Pullback failure and resumed downside |
| `LOOSE_MOMO_LONG_INVERTED_MIRROR` | Inversion-derived proxy | Opposite-side interpretation of loose momentum structure | Reveals when apparent momentum is actually overextension | Momentum burst that exhausts instead of continues |
| `FAKEOUT_SHORT_INVERTED_MIRROR` | Inversion-derived reversal proxy | Opposite-side interpretation of fakeout-short structure | Similar conceptual space to failed-breakdown buying | Failed downside break and bullish reclaim |
| `FAKEOUT_LONG_MOMO` | Hybrid | Failed breakdown reclaim with momentum-quality confirmation | Combines failure-pattern entry with momentum confirmation | Failed breakdown, reclaim, volume/momentum confirmation |

---

## Strategy Groupings

---

## 1. Continuation Families

These assume:
**the move is real and likely to continue**

### Includes
- `BREAKOUT_LONG`
- `BREAKDOWN_SHORT`
- `TREND_PULLBACK_LONG`
- `LOOSE_MOMO_LONG`

### Core belief
The market is offering continuation rather than trap behavior.

### Typical requirements
- enough room to run
- acceptable momentum quality
- no obvious exhaustion
- supportive confirmation

### Typical failure mode
The move is actually a trap or late-stage extension.

---

## 2. Failure / Trap Families

These assume:
**the obvious first move is false and trapped participants create the edge**

### Includes
- `FAKEOUT_SHORT`
- `FAKEOUT_LONG`
- some inversion-derived continuation mirrors

### Core belief
The first move is bait.
The second move is the trade.

### Typical requirements
- clear reference level
- obvious break through that level
- inability to hold beyond it
- reclaim / rejection back through level
- trapped traders on the wrong side

### Typical failure mode
The “fakeout” is actually a true breakout / breakdown.

---

## 3. Exhaustion / Fade Families

These assume:
**the move is stretched and continuation quality is deteriorating**

### Includes
- `EXHAUSTION_FADE_SHORT`
- `EXHAUSTION_FADE_LONG`

### Core belief
Continuation quality is deteriorating and mean reversion becomes more likely.

### Typical requirements
- extension
- stretched structure
- momentum deterioration
- reversal evidence

### Typical failure mode
The move is still early and strong, not exhausted.

---

## 4. Inversion-Derived Proxy Families

These are often research tools as much as native families.

### Includes
- `BREAKOUT_LONG_INVERTED_MIRROR`
- `TREND_PULLBACK_LONG_INVERTED_MIRROR`
- `LOOSE_MOMO_LONG_INVERTED_MIRROR`
- `FAKEOUT_SHORT_INVERTED_MIRROR`

### Core belief
The original family may still be detecting something real,
but the monetizable direction may be opposite.

### Why this matters
Inversion can reveal:
- hidden trap behavior
- continuation failure structure
- exhaustion disguised as strength

---

## Important Concept: Fakeout Long

### Definition
A fakeout long buys the failed breakdown.

### Sequence
1. price breaks below support
2. breakdown attracts sellers
3. price reclaims above support
4. trapped shorts are forced out
5. price moves upward

### Why it matters
This is a natural mirror family and remains conceptually important.

---

## Important Concept: Fakeout + Momentum Hybrid

### Example
A failed breakdown reclaims support with strong momentum and volume.

This is not just a fakeout.
It is a fakeout with momentum-quality confirmation.

This conceptual space is now partly represented by:
- `FAKEOUT_LONG_MOMO`

### Caution
Hybrid families should be treated as explicit hypotheses, not casual label mashups.

---

## Current Research Interpretation

### Current active truth
The active project lead is:
`BREAKOUT_LONG`

### Why
This family now has:
- the strongest validated center-of-mass
- the active V9 champion
- the active V9 backup

### Historical / secondary truth
Earlier phases showed that:
- many continuation families were weak
- some inverted mirrors looked relatively stronger
- `FAKEOUT_SHORT` and `LOOSE_MOMO_LONG | INVERTED_MIRROR` were historically important frontiers

These observations remain part of project memory, but they are no longer the current selected lead path.

### Current caution
Even though `BREAKOUT_LONG` is the active lead, it still carries one major operational weakness:
- prolonged drawdown duration / underwater time

So “current lead” does not mean “fully production-proven.”

---

## AI Worker Use Cases

This document should be used by:
- Strategy Taxonomist
- Mirror Interpreter
- Family Comparator
- Experiment Designer

---

## Rule

A strategy family is not just a name.
It is a market hypothesis.

This document exists so those hypotheses remain explicit and durable.
