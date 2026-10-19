# GAMEPLAN.md — your plan for today (for you, not the AI)

## Which coding tool to use

- **Claude Code** reads `CLAUDE.md` (which imports `AGENTS.md`). **Codex** reads `AGENTS.md`. **Cline** reads `.clinerules`. All three get the same context, so you can switch anytime.
- The rules allow any tool. But the Cline engineer is a judge and every attendee gets $50 in Cline credits, so consider doing at least one milestone in Cline. Your agent already uses **Cline CLI** for the fix step, so Cline is in the product either way. Say that clearly in the pitch.

---

## Part 1: Morning prep (before leaving home, ~60–75 min)

Do these in order. Stop wherever you run out of time; anything unfinished moves to the venue.

1. **Unzip and install** (10 min)
   ```bash
   cd a11y-agent
   pip install -r requirements.txt
   playwright install chromium
   npm install
   python scan_compare.py        # expect: 5 accessibility regression(s) found
   ```
2. **Push to a public GitHub repo** (5 min). The raw changelog URL must work for Parallel:
   `https://raw.githubusercontent.com/<you>/<repo>/main/demo-store/CHANGELOG.md`
   Open it in a browser to confirm.
3. **Keys into `.env`** (15 min): copy `.env.example` to `.env`, fill in `PARALLEL_API_KEY`, `COMPOSIO_API_KEY`, `GITHUB_REPO`, `CHANGELOG_URL`.
4. **Connect GitHub in Composio** (10 min) on the Composio platform. Slack is optional; skip it if short on time.
5. **Cline CLI** (10 min): `node -v` (needs 20+), `npm i -g cline`, `cline auth`. Test: `cline -y "create hello.py that prints hello"` in an empty folder.
6. **Backup open-source model** (10 min, optional but smart): install Ollama on your laptop and pull a small model (a 7B-class instruct model). If the event's model credits are slow to set up, set `MODEL_BASE_URL=http://localhost:11434/v1` and keep going. Still open source, still on theme.
7. **Optional:** if you have spare time, run prompts M0 and M1 from PROMPTS.md (orientation and skeleton only). Mention it to the organizers at kickoff. Leave everything else for the event.

Pack: laptop, charger, phone charger, water. Phone hotspot ready as Wi-Fi backup.

---

## Part 2: At the venue

| Time | What |
|---|---|
| 11:00 | Check in, swag, finish any leftover setup, test venue Wi-Fi with `python scan_compare.py` |
| 11:30 | Kickoff: **write down which open-source model provider and how to claim credits** |
| 11:30 | Tell an organizer: "I prepared a demo page and a scanner in advance, is that okay?" |
| 11:45 | M0 + M1 (orientation, skeleton) |
| 12:00 | M2 Parallel research |
| 12:25 | M3 Open-source model explanation (eat lunch while it runs) |
| 12:50 | M4 Cline fix + verify. **By ~1:20 you have the core demo.** |
| 1:20 | M5 Composio reporting |
| 1:50 | Buffer for whatever broke. Talk to sponsor engineers if stuck. |
| 2:15 | M6 demo polish + reset script |
| 2:35 | M7 README |
| 2:50 | **Stop coding.** Record a 90-second screen recording of a full run (backup if live demo fails). Push everything. |
| 3:00 | Submit (deadline 3:15). Practice the pitch twice out loud. |
| 3:35 | Demo |

**Golden rule:** if a milestone takes 15 minutes longer than planned, use its fallback and move on. A demo with a fallback beats an unfinished feature.

---

## Part 3: What to learn (about 45 minutes, on BART is fine)

You don't need to master these. You need to **explain them confidently in one sentence each**.

### 1. The 5 accessibility rules in your demo (10 min)
| Rule | One sentence |
|---|---|
| `image-alt` | Images need a text description, or screen reader users don't know what the picture shows. |
| `button-name` | Icon-only buttons need a name, or a screen reader just says "button." |
| `link-name` | Same idea for links: the heart icon must be announced as "Your wishlist." |
| `label` | Form boxes need a connected label, or users hear "edit text" with no idea what to type. |
| `color-contrast` | Text must be dark enough against its background (4.5:1 for normal text) for low-vision users. |

Also know: **WCAG** = the official accessibility guidelines. **axe-core** = free open-source engine that checks pages against them. Automated tools catch only part of accessibility problems; human testing is still needed. Say that honestly; it builds trust.

### 2. Parallel (10 min)
- **Search**: give it a goal in plain English ("objective") plus a few queries, it returns relevant excerpts already cleaned for an LLM.
- **Extract**: give it a URL, it returns clean markdown of that page.
- Why it matters for you: your agent reads the library's changelog to explain *why* things broke, not just *that* they broke.

### 3. Composio (15 min)
- **Toolkit** = an app (GitHub, Slack). **Tool** = one action (`GITHUB_CREATE_...`). **Connected account** = your logged-in GitHub. **Session** = the context your agent runs in for one user.
- Composio handles the login (OAuth) so your agent can act in GitHub without you writing auth code.
- Gotcha: old tutorials use outdated words ("actions", "entity", `ComposioToolSet`). Ignore those.

### 4. Cline CLI (10 min)
- `cline -y "task"` runs Cline headless (no questions asked) so a script can call it.
- `-y` means full autonomy, which is why your agent runs it on a separate branch, restricts it to one file, reverts anything else, and re-scans to verify. That safety story is a great judge talking point.

### 5. OpenAI-compatible APIs (5 min)
- Most open-source model hosts (and Ollama) accept the same request format as OpenAI. Your code just changes `base_url` and `model`. That's why switching providers is one line in `.env`.

---

## Part 4: The 2-minute pitch (practice out loud)

> **Problem (20s):** "When you update a UI library, your build passes, your tests pass, and the page looks the same. But blind and low-vision users can be silently locked out. Dependabot and the new AI upgrade agents all decide 'safe to merge' based on whether the build breaks. Accessibility breakage doesn't break the build."
>
> **Demo (60s):** "Here's a record store checkout. Same page, before and after updating groove-ui from 1.4 to 2.0. Looks identical. My agent scans both: zero problems before, five after. It uses **Parallel** to read the release notes and find the cause: two renamed props, a removed label element, a lighter gray. An **open-source model** explains who's affected and sorts the fixes: three are in my code, two are bugs in the library. **Cline** fixes my code on a separate branch, the agent re-scans to verify: five down to two. Then **Composio** opens a GitHub issue with the report, including a ready-to-send report for the library maintainers."
>
> **Why it matters (20s):** "Over 95% of top websites already have accessibility failures, and the number went up this year. This agent catches new ones at the moment they're introduced, and a human always approves the fix."
>
> **Close (10s):** "Open source, runs on open models, and it fits into the dependency tools teams already use."

---

## Part 5: Likely judge questions

- **"How is this different from GitHub's accessibility scanner?"** Theirs scans a page for problems in general. Mine is triggered by a dependency update and compares before vs after, so it isolates what *the update* broke, finds the cause in the changelog, and separates our-code fixes from upstream bugs.
- **"What if the AI fix is wrong?"** It works on a separate branch, can only touch the page file, re-scans to verify, and a human approves the PR. Nothing merges automatically.
- **"Why open-source models?"** Code and accessibility reports can contain private details; teams can run this fully self-hosted. It also keeps cost near zero for a check that runs on every update.
- **"What doesn't it catch?"** Things automated tools can't judge, like whether alt text is actually *good* or a flow makes sense with a screen reader. It handles the repetitive part so humans can focus on that.
- **"What's next?"** Run automatically on every Dependabot/Renovate PR, file upstream issues automatically, and use Parallel Monitor to watch libraries' release notes before you even upgrade.

---

## Part 6: Using this in job interviews later

Talking points this project gives you:
- **Agent design:** pipeline of deterministic tools + LLM only where judgment is needed (explanation, classification), with strict JSON output and fallbacks.
- **Safety and verification:** sandboxed changes, file-scope restrictions, automatic re-verification, human-in-the-loop.
- **Evaluation:** you had ground truth (5 planted regressions, expected 5 → 2) and verified against it.
- **Product thinking:** found a gap in existing tools by checking what they already do.

After the hackathon: clean the repo, add a demo GIF to the README, pin it on GitHub, and add it to your resume as a project.
