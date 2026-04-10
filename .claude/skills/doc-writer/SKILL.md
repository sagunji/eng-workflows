---
name: doc-writer
description: >
  Writes and improves developer documentation: READMEs, inline docstrings,
  JSDoc, API references, and changelogs. Matches the existing doc style
  of the codebase. Use when user says "write a README", "document this",
  "add docstrings", "write a changelog", "document this API", "this needs
  comments", or pastes undocumented code and asks for docs.
  Does NOT trigger for Architecture Decision Records — use adr-writer for
  that. Does NOT trigger for code comments explaining how something works
  internally — use code-reviewer for that. Does NOT trigger for writing
  user-facing product documentation or marketing copy.
license: MIT
metadata:
  author: sagun karanjit
  version: 1.0.0
  category: documentation
---

# Doc writer

## Purpose
Write documentation that developers actually read. Clear, minimal, accurate,
and maintained alongside the code. The goal is never volume — it's the
right information in the right place.

---

## Step 1 — Identify the doc type

Determine what kind of documentation is needed. Each type has a different
audience, purpose, and format.

| Type | Audience | Trigger |
|------|----------|---------|
| README | New developer or user of the project | "write a README", new repo |
| Docstring / JSDoc | Developer calling the function | undocumented function or class |
| API reference | Developer integrating the API | routes, endpoints, public interfaces |
| ADR | Team / future maintainers | architectural decision being made |
| Changelog | Any developer or user upgrading | release, version bump |
| Inline comment | Developer reading the code | complex logic that needs explanation |

If ambiguous, ask once:
> "What kind of documentation do you need — a README, inline docstrings,
> an API reference, or something else?"

---

## Step 2 — Match existing style

Before writing, check for existing documentation in the conversation:
- What format does it use? (Markdown, reStructuredText, plain text)
- What tone? (formal, terse, conversational)
- Does it use a specific docstring format? (Google, NumPy, JSDoc, Sphinx)
- How detailed are existing comments?

Match these exactly. Do not introduce a new convention unless the user asks
for a style change or there is no existing style to follow.

---

## Step 3 — Write by type

---

### README

A README has one job: help someone understand what this is and get started
as fast as possible. Write only what a new developer needs in the first
10 minutes. Nothing more.

Required sections (in order):

```markdown
# [Project name]

[One sentence: what it does and who it's for.]

## Getting started
[Minimal steps to run it. Shell commands, not prose.]

## Usage
[The most common use case, with a real example.]

## Configuration
[Only if non-obvious. Key env vars or config options.]

## Contributing
[One paragraph or link to CONTRIBUTING.md.]
```

Optional — only include if genuinely needed:
- **Prerequisites** — if non-standard dependencies are required
- **API reference** — link out to separate doc rather than inline
- **Deployment** — if the project is a service, not a library
- **Licence** — one line at the bottom

Rules:
- No long "About" sections or feature lists — the usage example shows features
- No badges unless the project already uses them
- Code blocks for every command and code snippet
- Present tense throughout ("returns", not "will return")
- No "this project", "the tool", or "the application" — use the project name

---

### Docstring / JSDoc

Document the contract, not the implementation. The reader already has the
source — they want to know what to pass in, what comes back, and what can go
wrong.

**Python (Google style default):**
```python
def create_user(email: str, role: str = "viewer") -> User:
    """Create a new user and persist to the database.

    Args:
        email: Must be a valid email address. Raises ValueError if malformed.
        role: One of "admin", "editor", "viewer". Defaults to "viewer".

    Returns:
        The newly created User object with id populated.

    Raises:
        ValueError: If email is malformed or role is not recognised.
        DuplicateEmailError: If a user with this email already exists.

    Example:
        user = create_user("alice@example.com", role="admin")
    """
```

**JavaScript / TypeScript (JSDoc):**
```js
/**
 * Create a new user and persist to the database.
 *
 * @param {string} email - Valid email address.
 * @param {string} [role="viewer"] - One of "admin", "editor", "viewer".
 * @returns {Promise<User>} The newly created user with id populated.
 * @throws {ValueError} If email is malformed or role is unrecognised.
 * @throws {DuplicateEmailError} If a user with this email already exists.
 *
 * @example
 * const user = await createUser("alice@example.com", { role: "admin" })
 */
```

Rules:
- Always document: parameters, return value, exceptions/rejections
- Include one real example for non-trivial functions
- Do not restate the function name: `// Gets the user` above `getUser()` is noise
- For simple, self-explanatory functions (under 5 lines, no edge cases),
  a one-line summary is enough — don't pad

---

### API reference

For each endpoint or public interface:

```markdown
## POST /users

Create a new user.

**Request body**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | yes | Valid email address |
| role | string | no | One of `admin`, `editor`, `viewer`. Default: `viewer` |

**Response — 201 Created**
```json
{
  "id": "usr_01J...",
  "email": "alice@example.com",
  "role": "viewer",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

**Errors**
| Status | Code | Description |
|--------|------|-------------|
| 400 | invalid_email | Email is malformed |
| 409 | duplicate_email | A user with this email already exists |
| 422 | invalid_role | Role is not one of the allowed values |
```

Rules:
- Every endpoint: method, path, description, request, response, errors
- Show real example values, not `<string>` placeholders
- Document all error cases, not just the happy path
- If authentication is required, note it once at the top of the section

---

### ADR (Architecture Decision Record)

Use when a significant technical decision is being made that future
maintainers will need to understand.

```markdown
# ADR-[NNN]: [Short title of decision]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-NNN

## Context
[What situation or problem forced this decision? What constraints exist?
2–4 sentences. Facts only, no opinion yet.]

## Decision
[What was decided. One clear statement.]

## Options considered

### Option A: [Name]
[Brief description]
- Pro: [...]
- Con: [...]

### Option B: [Name]
[Brief description]
- Pro: [...]
- Con: [...]

## Consequences
- [What becomes easier as a result]
- [What becomes harder or is accepted as a tradeoff]
- [Any follow-up decisions this creates]
```

Rules:
- ADRs are immutable once accepted — never edit history, add a new ADR
  that supersedes it instead
- Keep context factual — ADRs are read by future developers who weren't
  in the room
- Record the options that were rejected and why — that's the most
  valuable part

---

### Changelog

Follow [Keep a Changelog](https://keepachangelog.com) conventions:

```markdown
# Changelog

## [1.2.0] — 2025-01-15

### Added
- User role management API (`POST /users/:id/role`)
- Support for webhook retry configuration

### Changed
- `createUser` now returns full User object instead of just `id`

### Fixed
- Race condition in session refresh when multiple tabs are open
- `calculateDiscount` returning incorrect value for `memberType: "vip"`

### Deprecated
- `GET /users/list` — use `GET /users` instead, removed in 2.0.0

## [1.1.0] — 2025-01-01
...
```

Rules:
- Sections: Added, Changed, Fixed, Deprecated, Removed, Security
- Include only sections that have entries
- Entries are user-facing consequences, not internal commit messages
- Link version numbers to diffs or tags where possible
- Most recent version at the top

---

### Inline comment

Write inline comments only for:
- Non-obvious algorithm or formula
- Deliberate workaround for a known issue (with a link or ticket reference)
- Business rule that isn't evident from the code
- "Why" not "what" — the code already shows what

```python
# Discount is applied before tax per legal requirement in EU jurisdictions
# See: https://example.com/legal/eu-pricing
price = apply_discount(base_price, discount_rate)
```

Never comment:
- What the next line obviously does (`i += 1  # increment i`)
- Placeholder comments that will never be filled in (`# TODO: fix this`)
- Commented-out code — delete it, git has history

---

## Step 4 — Audit mode

If the user asks "what's missing?" or "audit my docs" rather than asking
for new documentation:

1. List every public function, class, or endpoint that has no documentation
2. List every doc that is outdated (references removed params, wrong return type)
3. List every doc that is redundant (restates the obvious)
4. Prioritise: what would help a new developer most?

Format:
```
## Documentation audit

### Missing (highest priority first)
- `createUser()` — no docstring
- `POST /users` — no error cases documented

### Outdated
- `getUser()` docstring mentions `username` param — removed in v1.1

### Redundant
- Comment on line 42: "// loop through users" — obvious from the for loop

### Suggested priority
Write docstrings for `createUser`, `deleteUser`, `updateRole` first —
these are the most-called functions and most likely to be used by new
integrators.
```

---

## Examples

### Example 1 — Undocumented function
**User:** pastes a function with no docstring

**Actions:**
1. Infer language and existing style
2. Identify parameters, return value, exceptions, and any non-obvious behaviour
3. Write docstring in the detected format
4. Add one example if the function has non-trivial usage

### Example 2 — "Write a README for this repo"
**User:** shares code or describes a project

**Actions:**
1. Identify: what does it do, who runs it, how do you start it?
2. Write minimal README — getting started + one usage example
3. Leave optional sections out unless the project clearly needs them

### Example 3 — "Document this API"
**User:** shares route handlers or an OpenAPI-style description

**Actions:**
1. Generate reference for each route: method, path, request, response, errors
2. Use real example values
3. Group related routes under a heading

---

## Troubleshooting

**Existing docs are inconsistent or use mixed formats:**
Flag the inconsistency, pick the dominant style, and note it:
"I've used Google-style docstrings to match the majority of the codebase.
Three functions use NumPy style — worth standardising."

**User wants comprehensive docs for a large codebase:**
Audit first (Step 4), then prioritise. Don't attempt to document
everything at once — start with the public API surface.

**Code has changed but docs haven't:**
Point out the specific divergence. Never silently update docs to match
broken code — confirm the code is correct first.