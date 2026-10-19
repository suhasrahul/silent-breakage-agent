# PROMPTS.md — paste these into Claude Code / Codex / Cline, one at a time

Rules for you (the human):
- Paste one prompt, let it finish, **run what it built**, then commit before the next one.
- If something breaks, paste the exact error back and say "fix only this, don't change anything else."
- Commit after every milestone: `git add -A && git commit -m "M<n>: <what>"`. This is your undo button.

---

## M0 — Orientation (2 min)

```
Read AGENTS.md fully. Then summarize in 5 bullets: the goal, the pipeline steps,
what already works, what you will build, and the hard rules for the fix step.
Do not write any code yet.
```

Check: it mentions "only edit demo-store/after.html" and "5 → 2". If not, tell it to reread section 3.

---

## M1 — Config + orchestrator skeleton (15 min)

```
Following AGENTS.md sections 4, 6 and 7:
1. Create config.py that loads .env with python-dotenv and exposes all settings
   with safe defaults (missing keys = None, never crash on import).
2. Create agent.py with the CLI flags from section 4 (--dry-run, --skip-fix,
   --no-post, --library, --from, --to). Steps 3-7 should be stubs that print
   "[n/6] <step> (not implemented yet)". Step 1-2 must call the existing
   scan_compare.py logic (import its functions, don't shell out) and write
   out/regressions.json.
3. Create the out/ folder handling and add out/ to .gitignore.
Run `python agent.py --dry-run` and show me the output.
```

Check: narrated output, says "Before: 0 problems. After: 5 problems."

---

## M2 — Research with Parallel (25 min)

```
Implement research.py per AGENTS.md section 5 (Step 3). Use the Parallel Python
SDK (pip package parallel-web, `from parallel import Parallel`). If unsure about
the API, fetch https://docs.parallel.ai/llms.txt and the Extract and Search
quickstarts (append .md to pages) instead of guessing.
Include the local-changelog fallback. Wire it into agent.py as step 2/6.
Run `python research.py` once with my key and once with PARALLEL_API_KEY unset,
and show both outputs.
```

Check: with key, it shows a real source URL (your GitHub raw CHANGELOG). Without key, it says "offline fallback".
Note: CHANGELOG_URL only works after your repo is pushed and public.

---

## M3 — Explain with an open-source model (25 min)

```
Implement explain.py per AGENTS.md section 5 (Step 4). Use the openai package
with base_url/api_key/model from config. Request strict JSON, strip code fences,
validate keys, retry once, and fall back to the rule-based mapping from the
table in section 3. Generate out/classified.json and a well-written
out/report.md. Wire into agent.py as step 3/6 and print
"X fixable in our code, Y belong upstream".
Run it and show me report.md.
```

Check: 3 our_code (image-alt, button-name, link-name), 2 upstream (label, color-contrast). Read report.md yourself: is it something you'd be proud to show a judge?

---

## M4 — Fix with Cline + verify (30 min)

```
Implement fix.py per AGENTS.md section 5 (Steps 5-6): clean-tree check, new
branch, precise Cline prompt built from classified.json, run
`cline -y --timeout 300 "<prompt>"`, revert any file changed outside
demo-store/after.html, re-scan, write out/verify.json, commit. Include the
fallback fixer if cline is missing or fails. Wire into agent.py as steps 4/6 and
5/6. Respect --dry-run and --skip-fix.
First run with --dry-run and show me the generated Cline prompt.
```

Then run for real: `python agent.py --no-post`. Check: "5 -> 2 remaining (both upstream)". Afterwards reset for the next run:
`git checkout main && git branch -D a11y/groove-ui-2.0.0`

---

## M5 — Report with Composio (30 min)

```
Step A: write tools_check.py per AGENTS.md section 5 (Step 7) that creates a
Composio session and uses tool search to print the exact slugs and input schemas
for: create GitHub issue, create pull request, comment on issue/PR, and Slack
send message. Fetch https://docs.composio.dev/llms.txt if unsure. Use only the
current session API. Run it and show me the output. Stop there.
```

```
Step B: using the verified slugs from tools_check.py, implement report.py:
create the GitHub issue with out/report.md as the body, then a PR from the fix
branch if it was pushed, then (optional) Slack. Include the local fallback and
result_type checks. Wire into agent.py as step 6/6. Print the issue URL.
```

Check: a real issue appears on your GitHub repo.

---

## M6 — Demo polish (20 min)

```
Make the full run demo-ready:
1. Add a short pause-free, clean narrated output (no stack traces; errors become
   one friendly line + fallback).
2. Add a `reset_demo.sh` that returns the repo to the starting state (checkout
   main, delete the fix branch, clear out/).
3. Time the full run and tell me how long it takes.
Run `./reset_demo.sh && python agent.py` and show me the whole console output.
```

---

## M7 — README for judges (15 min)

```
Update README.md per AGENTS.md section 9: pitch, a Mermaid architecture diagram,
why each sponsor tool is used, setup, demo command, example output, limitations
(automated checks catch only part of accessibility; human testing still needed),
and future work (run on every dependency PR, real WCAG law-change monitoring with
Parallel Monitor, upstream issue auto-filing). Keep it under 150 lines.
```

---

## Emergency prompts

**Something unrelated broke:**
```
Revert your last change. Then fix only <the error>, and show me the diff before running.
```

**Running out of time (after 2:30 PM):**
```
Stop adding features. Make sure `python agent.py --no-post` and
`python agent.py --dry-run` both run cleanly end to end. Nothing else.
```
