# Module icons

Square 2048×2048 tiles, orange to the edges, so the app rounds the corners
itself. One per game module: `cs2`, `valorant`, `rocket-league`, `bf6`,
`deadlock`, `dota-2`, `league-of-legends`, `minecraft`, `osu`, `tf2`,
`trackmania`, `chess`, `age-of-empires`.

`src/` holds the untouched exports. The files beside this README are the
processed ones — those are the icons to ship.

## Palette

Every icon uses the same colours, declared as CSS variables on its `<svg>`
element, each fill carrying a hex fallback so the file still renders on its
own:

    fill="var(--at-ink-700, #343435)"

| Variable | Hex | Used for |
| --- | --- | --- |
| `--at-ember` | `#ff6a3d` | the tile, and the accent inside the art |
| `--at-ember-light` / `-pale` / `-mist` | `#ff8f66` / `#ffb79b` / `#ffd9c9` | warm highlights |
| `--at-ember-deep` / `-dark` / `-ink` | `#d1512c` / `#8f3a20` / `#5c2614` | warm shadows |
| `--at-ink-0` … `--at-ink-900` | `#ffffff` … `#121213` | the greys, light to dark |

To re-hue the whole set, change the variables — in the files, or by
overriding `--at-*` from the page when the SVG is inlined. Nothing in the
paths needs touching.

## Rebuilding from a new export

Two scripts, in the session scratchpad, run in this order:

1. `tile.py` — rotates the export's orange onto `#ff6a3d`, snaps the tile to
   exactly that, and centres a non-square artboard on a square one.
2. `palette.py` — maps every fill to the nearest palette entry by lightness
   (warm or neutral) and writes the variables onto the `<svg>`.

Keep the exports square with the background baked in; a subject-only export
loses the dark masses that the background was carrying.

No strokes are added. Quick Look and ImageMagick draw hairline seams between
the facets, but that is their rasteriser, not the files: Chrome renders both
the raw exports and these cleanly. Check in a browser before "fixing" a seam.
