# AGENTS.md — Silent Breakage Agent

This file is the single source of truth for any AI coding agent (Claude Code, Codex, Cline) working in this repo. Read it fully before writing code. `CLAUDE.md` and `.clinerules` point here.

---

## 1. What we are building

**One-line pitch:** Dependency bots check whether your app still *builds*. This agent checks whether people can still *use* it.

**The problem:** When a UI library is updated, the build passes, tests pass, and the page looks identical, but accessibility can silently break (missing labels, unnamed buttons, missing alt text, low contrast). Existing tools (Dependabot, fossabot, GitLab's breaking-change resolution, GitHub's accessibility scanner) decide "safe to merge" based on build/test failures, so these regressions slip through.

**The agent's job (pipeline):**

1. **Scan** the page before and after a dependency update (Playwright + axe-core). DONE.
2. **Compare** results to find regressions. DONE.
3. **Research** what changed in the library (Parallel Search + Extract on the changelog).
4. **Explain** each regression in plain language: who is affected, why, and whether the fix belongs in *our code* or *upstream in the library* (open-source LLM via an OpenAI-compatible API).
5. **Fix** the problems that belong in our code (Cline CLI in headless mode), on a new git branch.
6. **Verify** by re-scanning after the fix (expected: 5 regressions → 2 remaining, both upstream).
7. **Report** via Composio: open a GitHub issue (or PR) with the plain-language report; optionally post a Slack message.
8. **Human approves.** The agent never merges anything itself.

---

## 2. Hackathon context and constraints

- Event: Cline, Parallel & Composio Hackathon, Open Source AI Week, San Francisco, Mon Oct 19 2026.
- Theme: build your own **personal agent** with Cline, Composio, Parallel, and **open-source models**.
- The only rule: the project must be **open source** and shared (public GitHub repo, MIT license).
- Timeline: hacking 11:45 AM → submissions due 3:15 PM (about 3.5 hours). Demos 3:35 PM.
- Judges: one engineer each from Cline, Composio, and Parallel. Using all three tools meaningfully matters.
- Solo developer. **Scope ruthlessly.** A working end-to-end path beats extra features.

### Priorities (in order)
1. A reliable end-to-end demo run on the demo store.
2. Every external call has a graceful fallback so the demo never crashes on stage.
3. Clean, readable code and a good README (judges will read the repo).
4. Nice-to-haves only after 1–3 are done.

---

## 3. Current state of the repo (already built and tested)

```
a11y-agent/
├── AGENTS.md            # this file
├── CLAUDE.md            # imports AGENTS.md (Claude Code)
├── .clinerules          # copy of AGENTS.md (Cline)
├── README.md            # public-facing project description
├── GAMEPLAN.md          # human plan for the developer (not for agents)
├── PROMPTS.md           # copy-paste prompts, one per milestone
├── scan_compare.py      # steps 1–2, WORKING
├── requirements.txt
├── package.json         # axe-core dependency
├── .env.example
├── .gitignore
└── demo-store/
    ├── before.html      # loads lib/groove-ui-1.4.0.js -> 0 violations
    ├── after.html       # loads lib/groove-ui-2.0.0.js -> 5 regressions
    ├── CHANGELOG.md     # fake release notes for groove-ui 2.0.0
    └── lib/
        ├── groove-ui-1.4.0.js
        └── groove-ui-2.0.0.js
```

`python scan_compare.py` prints the regressions and writes `regressions.json`, a list of objects:

```json
{
  "rule": "button-name",
  "impact": "critical",
  "problem": "Buttons must have discernible text",
  "learn_more": "https://dequeuniversity.com/rules/axe/...",
  "elements_before": 0,
  "elements_after": 2,
  "examples": ["<button class=\"g-icon-btn\" ...>"]
}
```

### The 5 planted regressions (ground truth for testing)

| axe rule | Cause in groove-ui 2.0.0 | Fix location | Correct fix |
|---|---|---|---|
| `image-alt` | prop `alt` renamed to `altText` | **our code** | in `after.html`, change `"alt":` to `"altText":` in `data-props` of `cover` components |
| `button-name` | prop `label` renamed to `title` | **our code** | in `after.html`, change `"label":` to `"title":` for `iconButton` components |
| `link-name` | prop `label` renamed to `title` | **our code** | same, for the `iconLink` component |
| `label` | textField label is now a `<span>`, not a `<label>` | **upstream** | cannot be fixed via props; report to library maintainers or pin 1.4.0 |
| `color-contrast` | theme `muted` changed to `#B4B8C2` (~2:1) | **upstream** | report upstream; suggest `#5B6170` (6.3:1) |

**Hard rule for the fix step:** only edit `demo-store/after.html`. Never edit files in `demo-store/lib/` (that is third-party library code). `textField` components keep the prop name `label` (it was not renamed).

After a correct fix, re-running the scan must show exactly 2 remaining regressions: `label` and `color-contrast`.

---

## 4. Target architecture

Keep it as small Python modules plus one orchestrator. Every step reads/writes JSON or Markdown files in `out/` so each step can be run and debugged alone, and so a failed step can be skipped.

```
agent.py          # orchestrator: runs steps in order, prints a clean narrated log
scan_compare.py   # step 1-2 (exists) -> regressions.json  (move output to out/ if convenient)
research.py       # step 3 -> out/research.json
explain.py        # step 4 -> out/report.md + out/classified.json
fix.py            # step 5-6 -> git branch + out/verify.json
report.py         # step 7 -> GitHub issue / PR / Slack via Composio
config.py         # loads .env, shared settings
```

### CLI for `agent.py`
```
python agent.py                     # full run on the demo store
python agent.py --dry-run           # no git changes, no posting; print what would happen
python agent.py --skip-fix          # scan + research + explain + report only
python agent.py --no-post           # everything except Composio posting
python agent.py --library groove-ui --from 1.4.0 --to 2.0.0
```

Output should read like a story for the demo, e.g.:
```
[1/6] Scanning before and after groove-ui 1.4.0 -> 2.0.0 ...
      Before: 0 problems. After: 5 problems.
[2/6] Researching what changed (Parallel) ...
      Found release notes: 2 prop renames, label element removed, lighter muted color.
[3/6] Explaining impact (open-source model: <model name>) ...
      3 fixable in our code, 2 belong upstream.
[4/6] Fixing our code (Cline) on branch a11y/groove-ui-2.0.0 ...
[5/6] Verifying ... 5 -> 2 remaining (both upstream). 
[6/6] Reporting (Composio) ... Opened issue #12: <url>
```

---

## 5. Step specifications

### Step 3: `research.py` (Parallel)
- Input: library name, from/to versions, optional `--changelog-url`.
- Default for the demo: the raw GitHub URL of `demo-store/CHANGELOG.md` in this public repo (set `CHANGELOG_URL` in `.env`). Use **Extract** on that URL with an objective like "What changed in version 2.0.0 that could affect accessibility: renamed props, removed elements, color changes?"
- If no URL is given, use **Search** with an objective plus 2–3 `search_queries`, then Extract the best result.
- Use `mode="fast"` for Search.
- Fallback: if Parallel fails or no key, read the local `demo-store/CHANGELOG.md` and log `"(offline fallback: local changelog)"`.
- Output `out/research.json`: `{ "source_url", "summary", "excerpts": [...] }`.

### Step 4: `explain.py` (open-source model)
- Use the `openai` Python package with `base_url=MODEL_BASE_URL`, `api_key=MODEL_API_KEY`, `model=MODEL_NAME` (event credits provider, or local Ollama at `http://localhost:11434/v1`).
- Send: regressions + research summary. Ask for **strict JSON** per regression:
  `{ "rule", "who_is_affected", "plain_explanation", "likely_cause", "fix_location": "our_code" | "upstream", "suggested_fix" }`
- Strip code fences before `json.loads`. Validate keys. Retry once on bad JSON.
- Fallback: if the model fails, use a deterministic rule-based mapping for the 5 known rules (from the table in section 3) so the demo continues.
- Write `out/classified.json` and a human-readable `out/report.md` (title, summary line, table, per-issue sections: what broke, who it hurts, cause from changelog, fix).
- Keep the explanation human: "Screen reader users hear only 'button' and can't tell which album the Remove button deletes."

### Step 5–6: `fix.py` (Cline CLI)
- Preconditions: clean git working tree; create branch `a11y/<library>-<to_version>`.
- Build a precise task prompt from the `our_code` items in `classified.json` + research. The prompt must say: only edit `demo-store/after.html`, never edit `demo-store/lib/`, change `alt`→`altText` for `cover`, `label`→`title` for `iconButton` and `iconLink`, do not change `textField`.
- Run: `subprocess.run(["cline", "-y", "--timeout", "300", prompt], cwd=repo_root)`.
- Verify: run the scan again (after.html vs before.html). Record remaining regressions in `out/verify.json`.
- Safety: if any file outside `demo-store/after.html` changed (`git diff --name-only`), revert those files and log it.
- Commit with a clear message. Push branch if `PUSH=true` in `.env`.
- Fallback: if `cline` is not installed or fails, apply the known fix with a small Python string replacement on `data-props` (log `"(fallback fixer)"`), so the demo still verifies 5 → 2.

### Step 7: `report.py` (Composio)
- Use the **session** API (current v3 pattern):
  ```python
  from composio import Composio
  composio = Composio()                       # reads COMPOSIO_API_KEY
  session = composio.create(user_id=COMPOSIO_USER_ID)
  result = session.execute("<TOOL_SLUG>", arguments={...})
  ```
- Execute tools through `session.execute(...)`, **not** `composio.tools.execute(...)` (legacy direct path; session meta-tools fail there).
- Check `result.result_type` for `completed` vs `failed` (a failure may have an empty error).
- Do NOT use outdated APIs/terms: `ComposioToolSet`, `get_tools`, `entity_id`, "actions", "apps", "integrations".
- **Tool slugs and argument names must be verified, not guessed.** Before writing report.py, write `tools_check.py` that uses the session's tool search (e.g. `session.execute("COMPOSIO_SEARCH_TOOLS", arguments={"queries": [{"use_case": "create a GitHub issue"}]})`) and prints the exact slugs and input schemas for: create issue, create pull request, comment on issue/PR, and Slack send message. Then hardcode the verified slugs in `config.py`.
- Actions:
  1. Create a GitHub issue in this repo titled `Accessibility regressions from groove-ui 2.0.0` with `out/report.md` as the body.
  2. If a fix branch was pushed, create a PR from it referencing the issue.
  3. Optional: Slack message with a 3-line summary + links.
  4. Upstream items: include a ready-to-send "upstream issue" section in the report (we don't own the library repo).
- Fallback: if Composio fails, save `out/report.md` and print "Report saved locally (Composio unavailable)".

---

## 6. Coding rules

- Python 3.10+. Standard library + `requirements.txt` only. No frameworks (no LangChain) unless asked.
- All secrets from `.env` via `python-dotenv`. Never print or commit keys. `.env` is gitignored.
- Each module has a `main()` and can run alone: `python research.py`, etc.
- Every network call: timeout, try/except, clear one-line log on failure, fallback path.
- Small functions, docstrings, type hints where helpful. Readable over clever.
- Print concise, narrated progress (see section 4). No giant JSON dumps to the console.
- Don't add features beyond this spec without being asked.
- After each milestone, run it and show the output.

---

## 7. Environment variables (`.env`)

```
PARALLEL_API_KEY=
COMPOSIO_API_KEY=
COMPOSIO_USER_ID=suhas
GITHUB_REPO=<owner>/<repo>
CHANGELOG_URL=https://raw.githubusercontent.com/<owner>/<repo>/main/demo-store/CHANGELOG.md
MODEL_BASE_URL=
MODEL_API_KEY=
MODEL_NAME=
PUSH=false
```

---

## 8. Documentation for agents (fetch these instead of guessing)

- Parallel docs index: https://docs.parallel.ai/llms.txt (full text: https://docs.parallel.ai/llms-full.txt). Any page can be fetched as Markdown by appending `.md`.
  - Search: `client.search(objective=..., search_queries=[...], mode="fast")` → `results[].title/url/excerpts`. Install `pip install parallel-web`; import `from parallel import Parallel`.
  - Extract: `client.extract(urls=[...], objective=...)` → `results[]`. On `/v1/extract`, `full_content`, `fetch_policy`, `excerpt_settings` go inside `advanced_settings`.
- Composio docs index: https://docs.composio.dev/llms.txt ("How Composio works" page explains sessions).
- Cline docs index: https://docs.cline.bot/llms.txt. CLI: `npm i -g cline` (Node 20+), `cline auth`, headless via `-y`, `--json`, piped stdin, or redirected stdout. Flags: `-m` model, `-P` provider, `-t/--timeout`.
- axe-core rules reference: https://dequeuniversity.com/rules/axe/

---

## 9. Definition of done (demo-ready)

- `python agent.py` runs end to end on the demo store in under ~2 minutes.
- Console tells the story in 6 clear steps.
- Re-scan shows 5 → 2, and the 2 are correctly labeled upstream.
- A real GitHub issue (and ideally a PR) exists, created via Composio.
- `python agent.py --dry-run` works with no keys at all (all fallbacks).
- README updated with: pitch, architecture diagram (Mermaid is fine), setup, demo command, sponsor tools used and why, limitations, future work.
