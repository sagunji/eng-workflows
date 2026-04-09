---
name: adr-writer
description: >
  Writes Architecture Decision Records (ADRs) for significant technical
  decisions. Captures context, options considered, decision made, and
  consequences. Use when user says "write an ADR", "document this decision",
  "we decided to use X", "help me record this architectural choice",
  "ADR for this", "why did we pick X over Y", or is about to make a
  significant technology, pattern, or infrastructure choice.
  Does NOT trigger for general architecture advice or comparisons without
  a decision being made. Does NOT trigger for documenting how something
  works — use doc-writer for that.
license: MIT
metadata:
  author: sagun karanjit
  version: 1.0.0
  category: documentation
---

# ADR writer

## Purpose
Capture significant technical decisions in a durable, immutable record
that future maintainers can read to understand not just what was decided,
but why — and what was ruled out and why.

The most valuable part of an ADR is what was rejected and the reasoning.
Anyone can read the codebase to see what was chosen. Only the ADR records
the road not taken.

---

## Step 1 — Qualify the decision

Not every technical choice warrants an ADR. Write one when the decision:

- Is **hard to reverse** — changing it later would require significant work
- Has **significant tradeoffs** — no option is clearly superior
- Will **confuse future developers** without context ("why on earth did
  they do it this way?")
- Affects **multiple teams or systems**
- Involves **choosing between real alternatives** that were genuinely considered

Skip an ADR for:
- Implementation details inside a single module
- Choices with no real alternatives
- Decisions that are easily reversible with low cost
- Style or formatting choices (use a linter config instead)

If the decision is borderline, write the ADR — the cost of writing one
unnecessarily is low; the cost of missing one is a confused codebase years later.

---

## Step 2 — Gather context

Before writing, determine:

1. **The decision** — what was chosen, specifically
2. **The problem** — what situation forced this decision?
3. **The alternatives** — what else was considered? (minimum 2)
4. **The reasoning** — why was this option chosen over the others?
5. **The consequences** — what becomes easier, harder, or different?
6. **The status** — is this proposed, already decided, or superseding
   a previous ADR?

If the user hasn't provided alternatives, ask:
> "What other options did you consider before choosing this? Even briefly
> explored ones are worth recording."

If they genuinely considered no alternatives, note that in the ADR —
it's honest and useful context.

---

## Step 3 — Assign a number

ADRs are numbered sequentially. Ask the user for the next number if
known, or use a placeholder:

```
ADR-NNN  ← replace with next sequential number in your /docs/adr/ folder
```

Convention: `ADR-001`, `ADR-002`, etc. Zero-padded to three digits so
they sort correctly in a file browser.

---

## Step 4 — Write the ADR

```markdown
# ADR-[NNN]: [Short, specific title — what was decided]

**Date:** YYYY-MM-DD
**Status:** [Proposed | Accepted | Deprecated | Superseded by ADR-NNN]
**Deciders:** [Names or roles of people involved in the decision]

---

## Context

[What situation made this decision necessary? What constraints, requirements,
or forces were at play? Write facts, not opinions. A future developer who
wasn't in the room should understand the situation completely after reading
this section.

Include:
- The problem or requirement that triggered the decision
- Any technical, organisational, or time constraints
- The state of the system at the time
- Any prior decisions this one depends on or responds to]

---

## Decision

[One clear statement of what was decided. No hedging, no justification
yet — just the decision itself.]

> We will use [X] for [purpose].

---

## Options considered

### Option A: [Name of chosen option] ← mark the chosen option

[Brief description: what it is and how it would work in this context.]

**Pros**
- [Specific advantage relevant to this situation]
- [Specific advantage]

**Cons**
- [Specific disadvantage or risk]
- [Specific disadvantage]

---

### Option B: [Name]

[Brief description.]

**Pros**
- [...]

**Cons**
- [...]

---

### Option C: [Name] (if applicable)

[Brief description.]

**Pros**
- [...]

**Cons**
- [...]

---

## Rationale

[Why Option A was chosen over the alternatives. Be specific about which
pros were decisive and which cons were accepted as worthwhile tradeoffs.
This is the most important section — it answers "why not the others?"

Do not just restate the pros list. Explain the reasoning process:
- What was the primary constraint or requirement that drove the choice?
- What made the rejected options unacceptable or less suitable?
- Were there any close calls or disagreements in the decision?]

---

## Consequences

### What becomes easier
- [Specific capability or workflow that improves]
- [...]

### What becomes harder
- [Specific tradeoff accepted]
- [Technical debt or limitation introduced]

### Follow-up decisions required
- [Any downstream decisions this creates — list as future ADRs if significant]
- [Any migrations, refactors, or config changes needed]

---

## References

- [Link to relevant issue, RFC, doc, or discussion]
- [Link to prior ADR if this supersedes or relates to one]
- [Link to external documentation for the chosen technology]
```

---

## Step 5 — Status lifecycle

ADRs move through these statuses. Never edit the content of an accepted
ADR — create a new one instead.

```
Proposed  →  Accepted  →  Deprecated
                       →  Superseded by ADR-NNN
```

- **Proposed** — written and under discussion, not yet committed
- **Accepted** — decision made and implemented or in progress
- **Deprecated** — no longer relevant (system removed, approach abandoned)
- **Superseded** — replaced by a newer ADR; always link to the superseding one

When writing a superseding ADR:
1. New ADR references the old one in Context: "This supersedes ADR-NNN
   which chose X. Since then, [reason for change]."
2. Old ADR status is updated to: `Superseded by ADR-NNN`
3. Old ADR content is never changed

---

## Step 6 — File location and naming

Standard convention for the repo:

```
docs/
└── adr/
    ├── ADR-001-use-postgres-for-primary-database.md
    ├── ADR-002-adopt-trunk-based-development.md
    └── ADR-003-use-redis-for-session-storage.md
```

Filename format: `ADR-NNN-short-slug-of-title.md`
- Kebab-case slug
- Short enough to read in a file listing (under 60 characters)
- Matches the title closely but doesn't have to be identical

Offer to generate the filename alongside the ADR.

---

## Examples

### Example 1 — Decision already made
**User:** "We decided to use Postgres instead of MongoDB. Write an ADR."

**Actions:**
1. Ask: "What were the main reasons you chose Postgres, and what made
   you rule out MongoDB?"
2. Write ADR with Postgres as chosen option, MongoDB as rejected option
3. At minimum two options — ask if DynamoDB, SQLite, or other options
   were briefly considered

### Example 2 — Decision in progress
**User:** "We're deciding between Kafka and SQS for our event bus. Help."

**Actions:**
1. Status: Proposed
2. Write balanced options section — do not push a recommendation
3. Leave Rationale and Decision blank or as placeholders:
   `[To be completed after decision is made]`
4. Offer to update the ADR once the decision is reached

### Example 3 — Revisiting a past decision
**User:** "We originally chose REST for our API but we're moving to GraphQL."

**Actions:**
1. Write new ADR superseding the old one
2. Context explains what changed since the original decision
3. Options: GraphQL vs. staying with REST vs. gRPC
4. Note: "Update ADR-NNN status to Superseded by ADR-NNN"

### Example 4 — Reluctant decision
**User:** "We're using a third-party auth provider because we don't have
time to build it ourselves."

**Actions:**
1. Context honestly captures the constraint: time and team capacity
2. Options: build vs. buy vs. specific providers considered
3. Cons of chosen option include: vendor dependency, cost at scale
4. Consequences include the follow-up decision: which provider specifically

---

## Troubleshooting

**User only wants to record one option — no alternatives:**
Write the ADR honestly. In Options Considered, note: "No formal alternatives
were evaluated." In Context, capture why — time pressure, clear consensus,
or a constrained environment. An honest single-option ADR is better than
a fabricated comparison.

**Decision was made years ago with no documentation:**
Write a retroactive ADR. Set the date to the approximate decision date,
status to Accepted, and note in Context: "This ADR was written retroactively
to document a decision made in [approximate period]." Reconstruct from
git history, code comments, and team knowledge as best as possible.

**Team disagrees on the decision:**
If the decision is still Proposed, capture the disagreement honestly in
Rationale: "There was not full consensus — [minority view] argued for
Option B because [reason]. The majority proceeded with Option A for
[reason]." Disagreement in an ADR is valuable historical context.

**ADR is getting very long:**
Split into two ADRs if the decision has two distinct parts. Keep each
ADR to one decision. Long ADRs usually mean either the context section
is too detailed (move to a separate design doc and link it) or two
decisions are being conflated.