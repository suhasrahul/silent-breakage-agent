# Silent Breakage Agent

Dependency bots check whether your app still **builds**. This agent checks whether people can still **use** it.

When a UI library update ships, your tests can pass and the page can look identical while screen reader, keyboard, and low-vision users get locked out. This agent scans the page before and after the update, finds accessibility regressions, researches what changed, explains who is affected, writes the fix, and reports it.

Built at the Cline, Parallel & Composio Hackathon (Open Source AI Week 2026).

## How it works

1. **Scan** the page before and after the update with Playwright + axe-core
2. **Compare** results to find regressions (new or worse rule failures)
3. **Research** the library's release notes with Parallel
4. **Explain** the impact in plain language with an open-source model
5. **Fix** the code with Cline CLI
6. **Report** to GitHub / Slack with Composio, for a human to review and merge

## For AI coding agents

Claude Code, Codex, and Cline: read `AGENTS.md` for the full spec. Build prompts are in `PROMPTS.md`.

## Setup

```bash
pip install -r requirements.txt
playwright install chromium
npm install            # installs axe-core locally
cp .env.example .env   # then add your keys
```

## Run the scan

```bash
python scan_compare.py
```

Expected output on the demo store: 0 failures before, 5 regressions after.

## The demo store

`demo-store/` is a small record shop checkout page using a fake component library, `groove-ui`.

- `before.html` loads `groove-ui 1.4.0` (accessible)
- `after.html` loads `groove-ui 2.0.0` (the "update")
- `demo-store/CHANGELOG.md` holds the release notes the agent researches

The only difference between the two pages is one `<script>` line. Both look the same.

### What 2.0.0 breaks

| Rule | Impact | Cause in 2.0.0 | Who is affected |
|---|---|---|---|
| `image-alt` | critical | `alt` prop renamed to `altText` | Screen reader users hear no album name |
| `button-name` | critical | `label` prop renamed to `title` | Screen reader users hear only "button" on Remove |
| `link-name` | serious | same rename on `iconLink` | Wishlist link has no name |
| `label` | critical | form label is now a `<span>` not linked to the input | Screen reader users can't tell which box is which |
| `color-contrast` | serious | new muted gray `#B4B8C2` | Low-vision users can't read the shipping note |

### Two kinds of fixes (good pitch point)

- **Fix in your code:** the three prop renames. Update `label` to `title` and `alt` to `altText` in the page.
- **Fix belongs upstream:** the `label` and contrast bugs are inside the library. The agent should report them to the library maintainers (or pin to 1.4.0 until fixed) rather than hack around them.

## License

MIT
