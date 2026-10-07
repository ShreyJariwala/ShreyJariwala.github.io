"""Tiny Lab icon set: one source of truth for the web sprite, standalone SVGs and iOS template images.

Grid 24x24, 2px safe margin, 1.75 stroke, round caps and joins. Filled accents use the stroke colour.
Run: python3 ios/TinyLab/design/build_icons.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ICONS = {
    # navigation
    "today": '<rect x="4" y="4" width="16" height="16" rx="4.5"/><path d="M8.6 12.3l2.4 2.4 4.6-5"/>',
    "lab": '<path d="M9.5 3.5h5M10.5 3.5v5.2L5.3 18.2a1.6 1.6 0 0 0 1.4 2.3h10.6a1.6 1.6 0 0 0 1.4-2.3L13.5 8.7V3.5"/><path d="M7.7 14.5h8.6"/>',
    "capability": '<path d="M3.5 20h5v-4.5h5V11h5V6.5h2"/><path d="M18.5 6.5V3l3 1.25-3 1.25"/>',
    "settings": '<path d="M4 7h8.5M17.5 7H20M4 17h2.5M11.5 17H20"/><circle cx="15" cy="7" r="2.5"/><circle cx="9" cy="17" r="2.5"/>',
    "back": '<path d="M14.5 5.5L8 12l6.5 6.5"/>',
    "chevron": '<path d="M9.5 5.5L16 12l-6.5 6.5"/>',
    "more": '<circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
    # actions
    "check": '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    "close": '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "minus": '<path d="M5 12h14"/>',
    "edit": '<path d="M4.5 19.5l1-4.5L15.6 4.9a2 2 0 0 1 2.8 0l.7.7a2 2 0 0 1 0 2.8L9 18.5z"/><path d="M13.5 7l3.5 3.5"/>',
    "trash": '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12.6a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7"/>',
    "note": '<path d="M5.5 3.5h9l4 4v13h-13z"/><path d="M14.5 3.5v4h4M8.5 12.5h7M8.5 16h4.5"/>',
    "copy": '<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
    "reset": '<path d="M5 12a7 7 0 1 0 2.05-4.95"/><path d="M5 4.5V8h3.5"/>',
    # pact lifecycle
    "streak": '<rect x="2.5" y="9" width="5.2" height="6" rx="1.6"/><rect x="9.4" y="9" width="5.2" height="6" rx="1.6"/><rect x="16.3" y="9" width="5.2" height="6" rx="1.6" fill="currentColor"/>',
    "persist": '<path d="M19 12a7 7 0 1 1-2.05-4.95"/><path d="M19 4.5V8h-3.5"/>',
    "pause": '<rect x="6.5" y="5" width="3.5" height="14" rx="1.2"/><rect x="14" y="5" width="3.5" height="14" rx="1.2"/>',
    "pivot": '<path d="M7 21V4"/><path d="M7 14a5 5 0 0 1 5-5h6.5"/><path d="M15.5 6l3 3-3 3"/>',
    "practice": '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 9.5h17M8 3v4M16 3v4M9 15l2 2 4-4"/>',
    "in-use": '<path d="M9 3v4.5M15 3v4.5M6.5 7.5h11v3.5a5.5 5.5 0 0 1-11 0z"/><path d="M12 16.5V21"/>',
    "question": '<path d="M5 18.5V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H8z"/><path d="M10.2 8.6a1.9 1.9 0 1 1 2.6 1.8c-.5.2-.8.6-.8 1.1v.2"/><circle cx="12" cy="13.9" r=".9" fill="currentColor" stroke="none"/>',
    "check-ok": '<circle cx="12" cy="12" r="8.5"/><path d="M8.2 12.3l2.6 2.6 5.1-5.3"/>',
    "check-todo": '<circle cx="12" cy="12" r="8.5" stroke-dasharray="2.6 2.4"/>',
    # Triple Check
    "head": '<path d="M14.5 20.5v-3h2a2 2 0 0 0 2-2v-2.3l1.7-.6-1.9-3.6A7 7 0 1 0 8 15.3v5.2"/><path d="M11 9.5a2 2 0 1 1 2.5 1.9"/>',
    "heart": '<path d="M12 19.5s-7.5-4.4-7.5-9.8A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7.5 2.5c0 5.4-7.5 9.8-7.5 9.8z"/>',
    "hand": '<path d="M7.5 12.5V7a1.5 1.5 0 0 1 3 0v4.5M10.5 11V5a1.5 1.5 0 0 1 3 0v6M13.5 11V6a1.5 1.5 0 0 1 3 0v6M16.5 12V9a1.5 1.5 0 0 1 3 0v5a7 7 0 0 1-7 7h-.6a6 6 0 0 1-4.8-2.4L4.3 15.4a1.5 1.5 0 0 1 2.3-1.9l.9 1"/>',
    "life": '<path d="M7.5 15.5a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17.4 8a3.75 3.75 0 0 1 .1 7.5z"/><path d="M9 18.5l-1 2M13 18.5l-1 2M17 18.5l-1 2"/>',
    # outputs
    "insight": '<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.1v.6h5v-.6c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3z"/>',
    "artifact": '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
    "data": '<path d="M3.5 20.5h17M6.5 17v-5M11 17V7M15.5 17v-7M20 17V4.5"/>',
    "link": '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
    # settings
    "bell": '<path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    "cloud": '<path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 17.6 9a4.5 4.5 0 0 1-.6 9z"/>',
    "export": '<path d="M12 14.5V3.5M8 7.5l4-4 4 4"/><path d="M5 12.5v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
    "import": '<path d="M12 3.5v11M8 10.5l4 4 4-4"/><path d="M5 12.5v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
    "guide": '<path d="M4.5 5.5a2 2 0 0 1 2-2h13v14h-13a2 2 0 0 0-2 2z"/><path d="M4.5 19.5a2 2 0 0 0 2 2h13v-4"/>',
}

STROKE = 'fill="none" stroke="{c}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"'


# Icons that sit inside a line of caption text on iOS (Text interpolation keeps the image's own size).
INLINE = {"streak": 12}


def standalone(body, colour, size=24):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" {STROKE.format(c=colour)}>{body.replace("currentColor", colour)}</svg>\n'


def write_imageset(cat, name, svg):
    d = os.path.join(cat, f"{name}.imageset")
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, f"{name}.svg"), "w") as f:
        f.write(svg)
    with open(os.path.join(d, "Contents.json"), "w") as f:
        json.dump({"images": [{"filename": f"{name}.svg", "idiom": "universal"}],
                   "info": {"author": "xcode", "version": 1},
                   "properties": {"preserves-vector-representation": True, "template-rendering-intent": "template"}}, f, indent=2)


def main():
    svg_dir = os.path.join(HERE, "icons")
    os.makedirs(svg_dir, exist_ok=True)
    for name, body in ICONS.items():
        with open(os.path.join(svg_dir, f"{name}.svg"), "w") as f:
            f.write(standalone(body, "currentColor"))

    symbols = "".join(f'<symbol id="i-{n}" viewBox="0 0 24 24">{b}</symbol>' for n, b in ICONS.items())
    with open(os.path.join(HERE, "sprite.svg"), "w") as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" style="display:none">{symbols}</svg>\n')

    # iOS: template image sets (black strokes; SwiftUI tints them with foregroundStyle).
    cat = os.path.join(HERE, "..", "TinyLab", "Assets.xcassets", "Icons")
    os.makedirs(cat, exist_ok=True)
    with open(os.path.join(cat, "Contents.json"), "w") as f:
        json.dump({"info": {"author": "xcode", "version": 1}, "properties": {"provides-namespace": False}}, f, indent=2)
    for name, body in ICONS.items():
        write_imageset(cat, f"tl-{name}", standalone(body, "#000000"))
    for name, size in INLINE.items():
        write_imageset(cat, f"tl-{name}-inline", standalone(ICONS[name], "#000000", size))
    print(f"{len(ICONS)} icons")


if __name__ == "__main__":
    main()
