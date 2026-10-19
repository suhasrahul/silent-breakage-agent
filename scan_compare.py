"""
Scan two versions of a page with axe-core and report what got worse.

Usage:
    python scan_compare.py                       # uses the demo-store pages
    python scan_compare.py before.html after.html
    python scan_compare.py http://localhost:8000/before.html http://localhost:8000/after.html

Writes regressions.json for the next steps of the agent
(Parallel research, model explanation, Cline fix, Composio report).
"""

import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).parent
AXE_JS = ROOT / "node_modules" / "axe-core" / "axe.min.js"
WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]


def to_url(target: str) -> str:
    if target.startswith(("http://", "https://", "file://")):
        return target
    return Path(target).resolve().as_uri()


def scan(page, target: str) -> dict:
    """Return axe violations for one page, keyed by rule id."""
    page.goto(to_url(target))
    page.wait_for_load_state("networkidle")
    page.add_script_tag(path=str(AXE_JS))
    results = page.evaluate(
        "tags => axe.run(document, { runOnly: { type: 'tag', values: tags } })",
        WCAG_TAGS,
    )
    return {v["id"]: v for v in results["violations"]}


def compare(before: dict, after: dict) -> list:
    """A regression is a rule that is new, or a rule that now hits more elements."""
    regressions = []
    for rule_id, v in after.items():
        old_count = len(before[rule_id]["nodes"]) if rule_id in before else 0
        new_count = len(v["nodes"])
        if new_count > old_count:
            regressions.append({
                "rule": rule_id,
                "impact": v["impact"],
                "problem": v["help"],
                "learn_more": v["helpUrl"],
                "elements_before": old_count,
                "elements_after": new_count,
                "examples": [n["html"] for n in v["nodes"][:3]],
            })
    order = {"critical": 0, "serious": 1, "moderate": 2, "minor": 3}
    return sorted(regressions, key=lambda r: order.get(r["impact"], 4))


def main():
    if not AXE_JS.exists():
        sys.exit("axe-core not found. Run: npm install axe-core")

    before_target = sys.argv[1] if len(sys.argv) > 2 else str(ROOT / "demo-store" / "before.html")
    after_target = sys.argv[2] if len(sys.argv) > 2 else str(ROOT / "demo-store" / "after.html")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        before = scan(page, before_target)
        after = scan(page, after_target)
        browser.close()

    regressions = compare(before, after)

    print(f"Before: {len(before)} rule(s) failing")
    print(f"After:  {len(after)} rule(s) failing")
    if not regressions:
        print("\nNo accessibility regressions. Safe to merge.")
    else:
        print(f"\n{len(regressions)} accessibility regression(s) found:\n")
        for r in regressions:
            print(f"  [{r['impact']}] {r['rule']}: {r['problem']}")
            print(f"      affected elements: {r['elements_before']} -> {r['elements_after']}")
            print(f"      e.g. {r['examples'][0][:90]}")
            print()

    out = ROOT / "regressions.json"
    out.write_text(json.dumps(regressions, indent=2))
    print(f"Saved details to {out.name}")


if __name__ == "__main__":
    main()
