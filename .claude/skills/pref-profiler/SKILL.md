---
name: perf-profiler
description: >
  Identifies performance bottlenecks in frontend and backend code: N+1
  queries, unindexed lookups, unnecessary re-renders, large bundle sizes,
  slow API responses, and memory leaks. Use when user says "this is slow",
  "the page is sluggish", "queries are taking too long", "the API is timing
  out", "performance is bad", "this feels laggy", "bundle is too large",
  "memory keeps growing", or shares profiler output, slow query logs, or
  network traces.
  Does NOT trigger for general optimisation advice without specific code or
  measurements. Does NOT trigger for infrastructure scaling questions.
license: MIT
metadata:
  author: sagun karanjit
  version: 1.0.0
  category: performance
---

# Perf profiler

## Purpose
Find the specific bottleneck causing a performance problem — not a list
of general optimisation tips. Every finding must be tied to evidence
(code, query, measurement) and come with a concrete fix.

---

## Core principle: measure before optimising

Never suggest optimisations based on instinct alone. Always start from:
- A measurement (slow query log, profiler output, network trace, timing)
- A specific symptom (timeout, high memory, slow render, large bundle)
- Actual code that can be analysed

If the user reports "it's slow" with no other context, ask:
> "Where is the slowness — browser, API response, database, or something
> else? And do you have any timing numbers, query logs, or profiler output?"

One targeted question. Then proceed with whatever is provided.

---

## Step 1 — Classify the performance domain

Different domains have different root causes and fixes.

### Domain A — Database / ORM
Symptoms: slow API responses, timeouts on data-heavy endpoints, high
DB CPU, queries taking seconds.

Common root causes:
- **N+1 queries** — loading a list then querying each item individually
- **Missing index** — full table scan on a filtered or joined column
- **Unbound result set** — no pagination, loading entire table into memory
- **Cartesian product** — missing JOIN condition producing row explosion
- **Over-fetching** — selecting all columns when only 2 are needed
- **Locking contention** — long-running transactions blocking others

### Domain B — API / Backend
Symptoms: high response times, timeouts, CPU spikes, memory growth.

Common root causes:
- **Synchronous blocking** — I/O or heavy computation on the main thread
- **Missing caching** — same expensive computation repeated per request
- **Unbounded loops** — processing grows linearly with data size
- **Large payload serialisation** — serialising more data than the client needs
- **Waterfall calls** — sequential awaits where parallel would work
- **Memory leak** — references held past their useful life (event listeners,
  closures, growing caches with no eviction)

### Domain C — Frontend / React
Symptoms: slow initial load, janky interactions, dropped frames, high
Time to Interactive.

Common root causes:
- **Unnecessary re-renders** — component re-renders on every parent update
  due to missing memoisation or unstable prop references
- **Large bundle** — importing entire libraries when only one function is
  needed, no code splitting on routes
- **Render-blocking work** — expensive computation in render path instead
  of useMemo or web worker
- **Waterfall data fetching** — child components fetch data sequentially
  instead of in parallel at the parent level
- **Layout thrash** — reading and writing DOM layout properties alternately
  in a loop

### Domain D — Network
Symptoms: slow page load, large transfer sizes, many round trips.

Common root causes:
- **Over-fetching** — REST endpoint returns more data than the page needs
- **Under-fetching** — multiple round trips to assemble one page's data
- **No compression** — responses not gzipped or brotli-compressed
- **No CDN / cache headers** — static assets re-fetched every request
- **Unoptimised images** — wrong format, no lazy loading, no responsive sizes

---

## Step 2 — Identify the bottleneck

Based on the domain and evidence provided, form a ranked hypothesis list.
Do not list every possible cause — only plausible ones given the evidence.

```
Bottleneck hypotheses (most → least likely):
1. [Specific hypothesis] — because [evidence]
2. [Specific hypothesis] — because [evidence]
```

Investigate the top hypothesis first. Confirm before proposing a fix.

---

## Step 3 — Confirm with evidence

Before recommending a fix, identify the confirming evidence:

For database problems:
- Show the query being generated (if ORM, show `.toSQL()` or equivalent)
- Identify the missing index using the query's WHERE / JOIN / ORDER columns
- For N+1: show the loop that triggers the repeated query

For backend problems:
- Identify the specific line or operation that blocks or repeats
- For memory leaks: identify what is being held and what holds it

For frontend problems:
- Identify which component re-renders unnecessarily and why
- For bundle size: identify the specific import causing the bloat
- For waterfall: show the fetch dependency chain

For network problems:
- Identify the endpoint returning excess data
- Show the response size and what proportion is actually used

---

## Step 4 — Produce findings

Format each finding as:

```
## Performance findings — [component / endpoint / query]

### [Finding name]
Domain: Database / API / Frontend / Network
Severity: Critical (>1s user-facing impact) / Major / Minor

Evidence:
[The specific code, query, or measurement that confirms the problem]

Impact:
[Concrete estimate: "adds ~200ms per request", "causes full table scan
on users (2M rows)", "re-renders the entire list on every keystroke"]

Fix:
[Specific corrected code or query]

Verify with:
[How to confirm the fix worked: EXPLAIN ANALYZE output, timing before/after,
bundle analyser, React DevTools Profiler]
```

---

## Step 5 — Quick wins vs. deep fixes

After findings, categorise recommended actions:

```
## Recommended actions

### Quick wins (< 1 hour each)
- [Fix] — [expected improvement]

### Deeper fixes (requires planning)
- [Fix] — [expected improvement] — [why it takes longer]

### Monitoring to add
- [What to measure going forward to catch this class of problem early]
```

---

## Domain-specific patterns

### N+1 detection and fix (ORM — any framework)

Signal: a loop that calls a query inside it.

```
// N+1 pattern — generates 1 + N queries
const orders = await Order.findAll()
for (const order of orders) {
  order.user = await User.findById(order.userId)  // 1 query per order
}

// Fix — eager load in a single query
const orders = await Order.findAll({
  include: [{ model: User }]
})
```

### Missing index

Signal: WHERE, JOIN, or ORDER BY on a column with no index.

```sql
-- Slow: full table scan
SELECT * FROM orders WHERE user_id = 123

-- Fix: add index on the filtered column
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Verify with EXPLAIN ANALYZE:
-- Before: Seq Scan on orders (cost=... rows=50000)
-- After:  Index Scan using idx_orders_user_id (cost=... rows=12)
```

### Waterfall → parallel (backend async)

Signal: sequential awaits where results are independent.

```
// Waterfall — total time = A + B + C
const user = await getUser(id)
const orders = await getOrders(id)
const prefs = await getPreferences(id)

// Fix — parallel — total time = max(A, B, C)
const [user, orders, prefs] = await Promise.all([
  getUser(id),
  getOrders(id),
  getPreferences(id)
])
```

### Unnecessary React re-render

Signal: component re-renders on every parent update despite same props.

```
// Problem: new object reference on every render
<UserList filters={{ active: true }} />

// Fix: stabilise the reference
const filters = useMemo(() => ({ active: true }), [])
<UserList filters={filters} />

// Also: wrap UserList in React.memo if it's expensive to render
```

### Bundle bloat

Signal: importing an entire library for one function.

```
// Bloated: imports entire lodash (~70kb)
import _ from 'lodash'
_.debounce(fn, 300)

// Fix: import only what's needed
import debounce from 'lodash/debounce'
debounce(fn, 300)

// Better: use native or a smaller alternative
// debounce is ~200 bytes inline vs 70kb
```

---

## Examples

### Example 1 — Slow API endpoint
**User:** "Our /api/orders endpoint takes 3–4 seconds"

**Actions:**
1. Ask for the route handler and ORM query if not provided
2. Look for N+1 (loop with query inside), missing eager load, unindexed
   column, or unbound result set
3. Show the generated SQL, identify the fix, provide EXPLAIN ANALYZE
   to verify

### Example 2 — React page feels laggy
**User:** "The dashboard re-renders constantly when I type in the search box"

**Actions:**
1. Domain C — unnecessary re-renders
2. Look for: unstable prop references, missing useMemo/useCallback,
   state updates too high in the tree, missing debounce on input
3. Identify the specific component and prop causing the cascade

### Example 3 — Memory keeps growing
**User:** "The Node service memory grows until it crashes overnight"

**Actions:**
1. Domain B — memory leak
2. Ask for: any event emitters, caches, or interval timers in the service
3. Common causes: event listeners added without removal, growing in-memory
   cache with no TTL or eviction, closures holding large objects

### Example 4 — Profiler output provided
**User:** shares a slow query log or Chrome DevTools flamechart

**Actions:**
1. Read the evidence first — do not hypothesise when data is available
2. Identify the specific operation taking the most time
3. Trace back to the code responsible
4. Fix that specific thing — do not suggest unrelated optimisations

---

## Troubleshooting

**User wants to optimise everything pre-emptively:**
Redirect to evidence-based optimisation. "Premature optimisation is the
root of all evil" — only fix what's measurably slow. Suggest adding
timing instrumentation first to find the actual bottleneck.

**Multiple bottlenecks found:**
Fix the biggest one first and re-measure. The second bottleneck may
disappear or change character once the first is resolved.

**Fix requires infrastructure change (caching layer, read replica):**
Note it clearly as an infrastructure fix, not a code fix. Provide the
code-level workaround alongside the infrastructure recommendation so
the user can ship a partial improvement while the infrastructure work
is planned.