# cellars

Five browser-native dashboards over three wine cellars, built with
[Malloy](https://malloydata.dev/) and published with Malloyyo to GitHub Pages.

Every query runs in the visitor's own browser — DuckDB-WASM reads the parquet
files served alongside the site. There is no backend and no database server.

## The dashboards

| | | |
|---|---|---|
| **The Cellar** | `dashboards/overview.malloy` | What's on the rack: bottles, value, regions, price bands, where it's stored. |
| **Open Next** | `dashboards/open_next.malloy` + `.jsx` | Picks one bottle off your rack and tells you why — where it's shelved, what you paid, what you said last time. |
| **Buying** | `dashboards/buying.malloy` | Spend over time, merchants, what's still in transit, biggest lots. |
| **Drinking** | `dashboards/drinking.malloy` | Consumption rate, what you open and when, and what left the cellar some other way. |
| **Tasting Notes** | `dashboards/tasting.malloy` | A search page — find a note by wine, producer, region, score, or free text over what you wrote. |

Every dashboard is filtered by **Cellar** first — the three cellars are three
different people, and blending them isn't an overview of anything.

**Open Next** is the only page with a custom component. Its `.malloy` returns a
*pool* — every wine with a bottle on the rack, carrying its shelf, price,
history and notes — and `open_next.jsx` chooses from that pool and draws the
card. Choosing is interaction, not analysis, so it belongs in the component:
"pick another" is a client-side reshuffle that never re-queries. The mood chips
(Last bottle / Never opened / Been waiting / You loved it) are predicates over
the same pool.

**Tasting Notes** searches a `searchable` dimension on `tasting_notes` — the
wine, producer, event title and note text concatenated and lowercased once in
the model. That's what lets one box find "book club" (an event), "rousseau" (a
producer) and "forest floor" (the prose) without the user choosing a field.

## The model

`cellar.malloy` defines three grains:

| source | grain | answers |
|---|---|---|
| `bottles` | one row per bottle **ever** | what do I have / what did I drink |
| `purchases` | one row per purchase lot | what am I spending |
| `tasting_notes` | one row per note | what did I think |

`bottles` is the union of CellarTracker's `inventory.csv` and `consumed.csv`,
separated by a `status` column. Keeping them in one table is what makes the
interesting questions one-liners: buying and drinking land on a single timeline,
and "bought 8, drunk 5, 3 left" is one `group_by` rather than a stitch across two
tables. At ~15k rows DuckDB doesn't care, so nothing is pre-aggregated.

`tasting_notes` joins onto `bottles` on `(cellar, wine_id)`. That join fans out —
a wine with six bottles and two notes makes twelve rows — so the `rating` measure
on `bottles` is **bottle-weighted**. At the wine grain that's exactly the wine's
own average; at coarser grains read it as "the average score behind a bottle on
my rack". For an unweighted average over notes, query `tasting_notes` directly,
which is what the Tasting Notes dashboard does.

## The data

Synthetic, from [lloydtabb/synthetic-cellars](https://github.com/lloydtabb/synthetic-cellars):
three fabricated CellarTracker exports that match the real export schema column
for column. No real person's cellar appears here.

`scripts/build_data.py` turns those CSVs into the parquet the model reads:

```sh
git clone https://github.com/lloydtabb/synthetic-cellars /tmp/synthetic-cellars
python3 scripts/build_data.py /tmp/synthetic-cellars
```

It writes `docs/data/*.parquet`. A few things it fixes up on the way:

- **Dates.** CT writes `M/D/YYYY` with `QUOTE_ALL`, so every column arrives as
  text and gets parsed.
- **Vintage `1001`** is CT's sentinel for non-vintage. It becomes `NULL` plus an
  `is_non_vintage` flag, so year math isn't poisoned by a fake year.
- **Producer on consumed bottles.** The consumed export has no `Producer` column;
  it's recovered from the wine catalog assembled out of the other three files.
- **Purchase date on consumed bottles.** Also missing — recovered by matching the
  `OrderId` in `PurchaseNote` back to the purchase lots, which is what makes
  "how long did it sit before I opened it" work for bottles that are already gone.

Data lives under `docs/` rather than a separate `data/` because `docs/` is what
Pages publishes: one relative path works both for DuckDB reading off disk during
development and for the browser fetching from the deployed site.

## Working on it

```sh
npm install -g @malloydata/malloyyo

malloyyo dashboard dev      # live preview, hot-reloads .malloy and .jsx edits
malloyyo lint               # compile every dashboard, check drills and components
malloyyo dashboard bundle   # build the static site into docs/
```

`.mcp.json` points Claude at the local authoring MCP server (`malloyyo mcp
--develop`), so `cd cellars && claude` opens with `compile`/`query`/`yo_help`
against the model on disk.

DuckDB-WASM loads from jsDelivr, and DuckDB fetches its `parquet`, `json` and
`icu` extensions from `extensions.duckdb.org` at page load — so the published
site needs both hosts reachable from the visitor's browser. `--duckdb bundled`
self-hosts the WASM core instead, but adds 77 MB to the repo and doesn't remove
the extension fetch, so it isn't used here.

## Publishing

`docs/` is committed and GitHub Pages serves it from the default branch. Rebuild
the bundle and commit `docs/` to deploy.
