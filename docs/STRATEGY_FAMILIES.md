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

A strategy family is not just a label.  
It is a market hypothesis.

---

## Master Table

| Strategy Name | Category | Definition | How It Operates | What It Needs to See |
|---|---|---|---|---|
| `BREAKOUT_LONG` | Continuation | Buy a breakout above resistance and seek follow-through | Looks for strength through resistance, then continuation after retest/confirmation | Resistance break, hold/retest, bullish confirmation, supportive volume, enough room to run |
| `BREAKDOWN_SHORT` | Continuation | Short a breakdown below support and seek follow-through lower | Bearish mirror of breakout logic; break support, retest from below, continue down | Support break, failed reclaim, bearish continuation, room to fall |
| `TREND_PULLBACK_LONG` | Trend-following continuation | Buy retracements in an existing uptrend instead of chasing peak breakout | Waits for pullback and seeks re-entry in trend direction | Existing trend strength, controlled pullback, supportive regime, resumption behavior |
| `LOOSE_MOMO_LONG` | Momentum continuation | Buy strong directional movement with looser structure requirements | Less strict than breakout thesis; attempts to capture directional expansion early | Momentum burst, enough volume, not too much structural weakness, some follow-through |
| `FAKEOUT_SHORT` | Failure / trap / reversal | Short a failed bullish breakout | Sells when an upside break cannot hold and reverses back below the level | Failed breakout, rejection above resistance, reclaim failure, trapped longs, bearish reversal |
| `FAKEOUT_LONG` *(future explicit family)* | Failure / trap / reversal | Buy a failed bearish breakdown | Long mirror of fakeout short; buy the failed downside break / reclaim | Failed breakdown, reclaim above support, trapped shorts, bullish recovery |
| `EXHAUSTION_FADE_SHORT` | Exhaustion / mean-reversion | Short a move that has become overextended and vulnerable to reversal | Fades late-stage strength when continuation quality is deteriorating | Overextension, stretched move, weakening continuation, reversal signal |
| `EXHAUSTION_FADE_LONG` *(future conceptual family)* | Exhaustion / mean-reversion | Buy a downside capitulation / seller exhaustion event | Long mirror of exhaustion fade short | Panic flush, stretched downside, signs of exhaustion, reclaim/reversal behavior |
| `BREAKOUT_LONG | INVERTED_MIRROR` | Inversion-derived failure proxy | Opposite-side version of breakout long, often behaving like failed-breakout short logic | Treats the original breakout setup as a possible trap rather than continuation | Signs that upside breakout is actually exhaustion/trap behavior |
| `TREND_PULLBACK_LONG | INVERTED_MIRROR` | Inversion-derived failure proxy | Opposite-side version of trend pullback long | Can reveal that a “pullback” is actually weakness, not healthy trend continuation | Pullback failure, resumed downside, weakness after expected support |
| `LOOSE_MOMO_LONG | INVERTED_MIRROR` | Inversion-derived failure / fade proxy | Opposite-side version of loose momentum long | Can reveal that apparent momentum is actually overextension ripe for fade | Momentum burst that exhausts rather than continues |
| `FAKEOUT_SHORT | INVERTED_MIRROR` *(conceptual)* | Reversal mirror | Opposite-side form of fakeout short, effectively similar to a fakeout long concept | If inverted, the strategy shifts from failed breakout shorting into failed breakdown buying | Failed downside break and bullish reclaim |

---

## Strategy Groupings

---

## 1. Continuation Families

These families assume:
**the move is real and likely to continue**

### Includes
- `BREAKOUT_LONG`
- `BREAKDOWN_SHORT`
- `TREND_PULLBACK_LONG`
- `LOOSE_MOMO_LONG`

### Core belief
The market is offering directional continuation rather than trap behavior.

### Typical requirements
- regime alignment
- enough volume
- enough room to run
- acceptable momentum quality
- no obvious exhaustion

### Typical failure mode
The breakout or continuation attempt is actually a trap or exhaustion event.

---

## 2. Failure / Trap Families

These families assume:
**the obvious move is false and trapped participants create the edge**

### Includes
- `FAKEOUT_SHORT`
- `FAKEOUT_LONG` (future)
- some inverted continuation families

### Core belief
The first move is bait.  
The second move is the trade.

### Typical requirements
- clear reference level
- obvious break through the level
- inability to hold beyond the level
- reclaim / rejection back through the level
- trapped traders on the wrong side

### Typical failure mode
The “fakeout” is actually a real breakout/breakdown and continues.

---

## 3. Exhaustion / Fade Families

These families assume:
**the move is late, stretched, and vulnerable**

### Includes
- `EXHAUSTION_FADE_SHORT`
- future `EXHAUSTION_FADE_LONG`

### Core belief
Continuation quality is deteriorating.  
Mean reversion or reversal becomes more likely.

### Typical requirements
- stretched ATR or structure
- overbought / oversold flavor
- weakening continuation quality
- reversal behavior

### Typical failure mode
The move is strong and early, not exhausted, and keeps running.

---

## 4. Inversion-Derived Proxy Families

These are not always “native” families.  
They are often research tools.

### Includes
- `BREAKOUT_LONG | INVERTED_MIRROR`
- `TREND_PULLBACK_LONG | INVERTED_MIRROR`
- `LOOSE_MOMO_LONG | INVERTED_MIRROR`

### Core belief
The original family may still be identifying something real,  
but the monetizable direction may be opposite.

### Why this matters
Inversion can reveal:
- trap behavior hidden inside continuation logic
- asymmetry in payoff behavior
- whether a family is fundamentally mistaking failure for strength

---

## Important Concept: Fakeout Long

### Definition
A **fakeout long** is the long-side mirror of a fakeout short.

### Plain English
Buy the failed breakdown.

### Sequence
1. price breaks below support
2. traders pile into the breakdown
3. price reclaims back above support
4. trapped shorts are forced out
5. price moves upward

### Why it matters
This is a natural future family candidate if fakeout short continues to look relatively alive.

---

## Important Concept: Fakeout + Momentum Hybrid

This is a potential future subfamily idea.

### Example
A failed breakdown reclaims support with unusually strong momentum and volume.

That is not just a fakeout.  
It is a fakeout with momentum-quality confirmation.

This could eventually become:
- `FAKEOUT_LONG_MOMO`
- `FAKEOUT_SHORT_MOMO`
or equivalent naming

### Caution
This should be treated as a new explicit family hypothesis, not just a casual word mix.

---

## Current Research Interpretation

As of the current experiment era:

### Broad read
- Many native long continuation families look weak.
- Several inverted mirrors look relatively stronger.
- `FAKEOUT_SHORT` emerging as a less-bad native short family is especially interesting.

### Current strongest practical frontier
The strongest active family cluster remains:
- `LOOSE_MOMO_LONG | INVERTED_MIRROR`
- `FAKEOUT_SHORT`

### Strategic implication
The system may be discovering that:
- continuation logic is often getting trapped
- failure-pattern or reversal-pattern logic may be closer to truth
- some inversions are revealing hidden fakeout behavior

### Important current caution
This is still a research pattern, not deployment proof.

---

## AI Worker Use Cases

This document should be used by AI workers for:

### Strategy Taxonomist
Maintain family definitions and relationships.

### Mirror Interpreter
Explain what an inverted family is becoming conceptually.

### Family Comparator
Compare native vs inverted family performance.

### Experiment Designer
Design narrower family-specific reruns.

---

## Rule

A strategy family is not just a name.  
It is a market hypothesis.

This document exists so those hypotheses are explicit.
