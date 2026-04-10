# Skill Check — code-reviewer

## Skill check — code-reviewer

Check 1 — Frontmatter        ✅ PASS — frontmatter valid
  - name: kebab-case, no spaces ✅
  - description: present, under 1024 chars ✅
  - author: "sagun karanjit" ✅
  - Folder name matches: `.claude/skills/code-reviewer/SKILL.md` ✅

Check 2 — Description        ✅ PASS
  - States what it does: "Reviews code for logic bugs, style issues..." ✅
  - Trigger phrases: "review this", "check my code", "look at this PR" ✅
  - Negative triggers: "Does NOT trigger for general coding help, feature requests" ✅
  - Specific enough to distinguish from debug-detective and refactor-guide ✅

Check 3 — Trigger overlap    ⚠️ FLAG
  - "look at this PR" overlaps with pr-describer's "write a PR" context
  - Mitigation: code-reviewer description says "or pastes a file or diff
    without further instruction" while pr-describer requires explicit "write
    a PR description". The overlap is minor and well-bounded.
  - No fix needed — the negative triggers are sufficient.

Check 4 — Instruction quality ✅ PASS
  - 6 review dimensions with specific checks ✅
  - Output format explicitly defined with severity guide ✅
  - 3 examples with user input and expected actions ✅
  - Troubleshooting section covers 3 failure cases ✅
  - Follow-up behaviour defined (fix, re-review, etc.) ✅
  - Length: ~1500 words ✅

Check 5 — Progressive disclosure ✅ PASS
  - Frontmatter: metadata only ✅
  - Body: core instructions, not encyclopedic ✅
  - No reference material that should be extracted ✅

---

READY TO COMMIT

---

# Skill Check — perf-profiler

## Skill check — perf-profiler

Check 1 — Frontmatter        ⚠️ FLAG
  - Folder is named `pref-profiler` but frontmatter `name` is `perf-profiler`
  - This mismatch means the skill folder name doesn't match the `name` field
  - Fix: Rename folder from `pref-profiler/` to `perf-profiler/`

Check 2 — Description        ✅ PASS
  - States what it does: "Identifies performance bottlenecks" ✅
  - Trigger phrases: "this is slow", "page is sluggish", "queries taking too long" ✅
  - Negative triggers: "Does NOT trigger for optimisation without code/measurements" ✅

Check 3 — Trigger overlap    ✅ PASS
  - No significant overlap with other skills
  - Clear boundary with db-schema-reviewer ("Does NOT trigger for query
    optimisation — use perf-profiler") ✅

Check 4 — Instruction quality ✅ PASS
  - Classification system (DB/API/frontend/network) ✅
  - Severity levels with verify steps ✅
  - Examples included ✅
  - Troubleshooting section present ✅

Check 5 — Progressive disclosure ✅ PASS
  - Content appropriately distributed ✅

---

REVIEW FLAGS BEFORE COMMITTING

- Rename folder `pref-profiler/` to `perf-profiler/` to match frontmatter name

---

# Skill Check — security-auditor

## Skill check — security-auditor

Check 1 — Frontmatter        ✅ PASS — frontmatter valid

Check 2 — Description        ✅ PASS
  - Covers what, when, and exclusions ✅
  - Includes automatic trigger: "Also triggers when user shares auth,
    payment, or user-data handling code without a specific question" ✅
  - Clear disclaimer: "Does NOT replace a professional security audit" ✅

Check 3 — Trigger overlap    ✅ PASS
  - Security checks are unique to this skill
  - No overlap with code-reviewer's security dimension (code-reviewer
    does a quick check; security-auditor does a deep audit)

Check 4 — Instruction quality ✅ PASS
  - 8 attack vectors with specific code examples ✅
  - Severity guide with exploit path requirement ✅
  - Output format defined ✅
  - Examples and troubleshooting present ✅

Check 5 — Progressive disclosure ⚠️ FLAG
  - The 8-vector section is quite extensive (~2000 words). Could move
    the detailed patterns (SQL injection examples, safe patterns) to
    `references/attack-vectors.md` and keep only the vector names and
    check descriptions in the main body.
  - Not a blocker — the current length is within limits.

---

READY TO COMMIT (with optional improvement noted)
