# Build log

A record of the conversation that produced this repo, kept at the user's
request. Claude's side is summarised; the user's messages are verbatim.

---

**User:**

> I would like you to use Malloyyo to build set of dashboards using GitHub and
> Github pages in a new repository (cellars) using data you can find here:
> https://github.com/lloydtabb/synthetic-cellars . Install the Malloyyo
> commandline run Malloyyo init and use the malloyyo_authoring MCP server to
> guide you.

**Claude:** Looked at the environment, found the CLI is published as
`@malloydata/malloyyo` (not `malloyyo`), installed it globally, and attached +
cloned `lloydtabb/synthetic-cellars`. The data turned out to be three
CellarTracker-shaped cellars — `inventory` / `purchase` / `consumed` / `notes`
CSVs per persona, ~15k bottles total.

The `malloyyo_author` MCP server declared in `.mcp.json` is launched per-repo and
so wasn't connected to this session. Rather than skip it, drove it directly over
stdio with a small JSON-RPC client, which gave access to its `compile`,
`compile_file`, `query`, `prettify` and `yo_help` tools. `yo_help` supplied the
authoring guidance followed throughout (`writing-malloy-with-mcp`,
`develop/getting-started`, `dashboards/authoring`, `dashboards/givens-and-controls`,
`dashboards/grid-layout`, `dashboards/custom-components`, `dashboards/vega-charts`).

---

**User:**

> Please log this conversation (capturing what each of us said) in claude_log.md

**Claude:** This file.

---

**User:**

> You should create dashboards that will be useful to the owner of the cellars.

**Claude:** Re-aimed the dashboard set from "interesting properties of the
dataset" to the questions a cellar owner actually asks: what's on the rack, which
bottle to open tonight, what am I spending, what am I drinking, what did I think
of it. That's what produced **What to Open** — last bottles of wines rated 92+,
bottles bought and never opened, oldest vintages still on the rack — which is the
dashboard the framing earned.

---

**User:**

> Make them pretty

**Claude:** Took the visual side seriously: explicit `# label`s on every tile,
`# dashboard { columns=6 }` grids with deliberate colspans (KPIs 3-up, charts
2-up, detail tables full width), chart tags chosen per tile, and a hand-written
landing page (`dashboards/index.jsx`) with serif display type, a wine-red accent,
numbered cards and a section introducing the three cellars.

---

**User:**

> duckdb is fast enough to that I don't think you need rolluops

**User:**

> unioning them all might be enough

**Claude:** This landed while a precomputed `cellar_wines` rollup table
(one row per cellar+wine, with bottles-on-hand / drunk / rating columns) was
already written. Threw it away and took the suggestion, which was the better
model: `inventory` and `consumed` became one `bottles` table separated by a
`status` column.

That union is what the rest of the repo rests on. Buying and drinking sit on one
timeline, "bought 8, drunk 5, 3 left" is a single `group_by`, and the per-wine
questions the rollup existed to answer are now live aggregations — which DuckDB
does instantly at this size, exactly as the user said. It also removed a whole
class of staleness: nothing is precomputed, so nothing can disagree with the
source.

---

**User:**

> is there any way I can unblock you?

**Claude:** Yes — one thing. This sandbox's network policy allows only npm, PyPI
and GitHub, and DuckDB-WASM fetches its `parquet`, `json` and `icu` extensions
from `extensions.duckdb.org` at page load. So the dashboards render their chrome,
controls and nav locally, but the query panel stays empty and the charts can't be
seen. Allowing `extensions.duckdb.org` (and `cdn.jsdelivr.net`) in the
environment's network policy would make the dashboards fully renderable here, and
the layout could then be checked against real output rather than reasoned about.

What was verifiable was verified another way: all five dashboard queries were
executed server-side through the authoring MCP server against the same parquet
(correct KPIs and non-empty nests on every tile), `malloyyo lint` passes on all
five, and the landing page — pure React, no DuckDB — was screenshot-checked in
headless Chromium and had a real grid bug fixed as a result.

---

**User:** (after several rounds of unblocking — creating the repo, pushing the
bundle by hand, and finally granting the session write access)

> The tasting notes page page has a lot of repeat information. Let's just make
> it a list with search boxes and so people can find their notes that matter to
> them. Let's make a 'Open Next' dashboard that picks a bottle for you and tells
> you something about the bottle. Do this page in react.

**Claude:** Both, in one pass.

*Tasting Notes* lost the score histogram, the average-by-year line, the two
producer/region bars and two of the three tables — they restated each other and
none of them helped anyone find a note. It's now filters plus one list. The
interesting part is the search box: rather than searching note text alone, the
model gained a `searchable` dimension (wine + producer + event title + note
text, lowercased once), so a single box finds "book club" (208 notes, an event
title), "rousseau" (40, a producer) and "forest floor" (90, the prose).

*Open Next* replaced the three ranked tables with a page that commits to one
bottle. The `.malloy` returns a pool and `open_next.jsx` picks from it, so "pick
another" is a client-side reshuffle. Two modelling bugs surfaced while building
it and were fixed rather than shipped:

- Grouping by `(wine, location, bin)` split each wine across shelves, so
  `already_drunk` read 0 — a drunk bottle carries the location it was drunk
  from. Regrouped to the wine with shelves nested.
- `where: in_cellar` at the stage level zeroed every drinking measure before it
  could be computed. Removed it and used `having: on_hand > 0`, letting each
  measure's own status filter do the work.

Also excluded bottles CellarTracker marks `(pending)` — they have no shelf and
may not have arrived, so "go pull this one" doesn't apply to them.

---

**User:**

> can you verify with `malloyyo dashboard dev`, that should work for you

**Claude:** It did, and it was the single most useful correction in the whole
build. `dashboard dev` runs the queries **server-side** through the same node
DuckDB connection the MCP tools use, so the browser only renders results — none
of the WASM/CDN machinery that the sandbox blocks. Everything that had been
"reasoned about, not seen" became visible immediately.

Three real bugs in the first screenshot, none of which the earlier static
harness could have caught:

1. **The card had no borders, dividers or panel background.** It was styled with
   `var(--line)` / `var(--card)` / `var(--muted)` from `site.css`, but custom
   components render in an *iframe* where those don't exist — the runtime
   exposes `--dash-*` instead. Every border silently collapsed. Fixed by
   resolving each colour once through `var(--dash-border, var(--line, #e4e6eb))`
   so it works in both hosts.
2. **Duplicate shelf chips** — "Kitchen Cooler — 1" listed twice. The rows
   differed by `bottle_size` (750ml vs magnum), which the label didn't show.
   Whether a bottle is a 1.5L is exactly the sort of thing that decides if you
   open it tonight, so size joined the label.
3. **The shelves didn't add up.** "7 on the rack" sat above five chips
   accounting for five bottles, because the nest was capped at 5. Raised to 12
   and added a "+N elsewhere" chip for the remainder.

The lesson is the obvious one in hindsight: a component that compiles, queries
correctly and lays out in isolation can still be broken in the only context that
matters. Ask for the render.

---

**User:**

> by the way /web-setup is what fixed the problem

**Claude:** Noted for the record — after several wrong guesses on my part (the
GitHub App settings page, per-repo access), the thing that actually granted this
session write access was `/web-setup`. Worth knowing that read access can look
healthy while writes 403, because public repos clone without any credential at
all; that's what made the failure look repo-specific when it was session-wide.

---

## What got built

| file | what it is |
|---|---|
| `scripts/build_data.py` | CSV exports → `docs/data/*.parquet` |
| `storage.malloy` | table sources over the parquet |
| `cellar.malloy` | the semantic model — `bottles`, `purchases`, `tasting_notes` |
| `givens.malloy` | filter controls, with faceted suggestion queries |
| `index.malloy` | the published query surface |
| `dashboards/*.malloy` | five dashboards |
| `dashboards/index.jsx` | the landing page |

Two modelling decisions worth remembering:

- **The consumed export is missing columns the owner cares about.** No
  `Producer`, no purchase date. Both are recovered in `build_data.py` — producer
  from a wine catalog assembled out of the other three files, purchase date by
  matching the `OrderId` buried in `PurchaseNote` back to the purchase lots. That
  second one is what makes "how long did it sit before I opened it" work for
  bottles that are already gone.

- **The notes join fans out and Malloy does not dedupe it.** `notes.rating.avg()`
  through `join_many` compiles to a plain `AVG` over the fanned rows, so it is
  bottle-weighted. Verified against the raw numbers, then documented in the model
  rather than papered over: it's exact at the wine grain, and the Tasting Notes
  dashboard runs on `tasting_notes` directly to get the unweighted average.
