"""Build a self-contained standalone.html (CSS + JS inlined).

The modular source files remain canonical; this generated file exists for
double-click opening, sharing and sandboxed previews that serve one file.

Usage: python build_standalone.py
"""

from __future__ import annotations

from pathlib import Path

HERE = Path(__file__).resolve().parent


def inline() -> str:
    html = (HERE / "index.html").read_text(encoding="utf-8")

    css = (HERE / "css" / "styles.css").read_text(encoding="utf-8")
    html = html.replace(
        '<link rel="stylesheet" href="css/styles.css" />',
        f"<style>\n{css}\n</style>",
    )

    for src in ["js/mock-data.js", "js/mock-engine.js", "js/api.js", "js/graph.js", "js/render.js", "js/app.js"]:
        code = (HERE / src).read_text(encoding="utf-8")
        tag = f'<script src="{src}"></script>'
        assert tag in html, f"missing tag {tag}"
        html = html.replace(tag, f"<script>\n{code}\n</script>")

    banner = (
        "<!-- GENERATED FILE — edit the modular sources (index.html, css/, js/) "
        "and re-run build_standalone.py instead. -->\n"
    )
    return banner + html


if __name__ == "__main__":
    out = HERE / "standalone.html"
    out.write_text(inline(), encoding="utf-8")
    print(f"wrote {out} ({out.stat().st_size} bytes)")
