#!/usr/bin/env python3
"""Turn the CellarTracker-shaped CSV exports into the parquet the model reads.

Source: https://github.com/lloydtabb/synthetic-cellars — three cellars, each
with the four CT-standard files (inventory / purchase / consumed / notes).

Everything lands in docs/data/ because docs/ is what GitHub Pages publishes:
the same relative path that DuckDB reads off disk during `dashboard dev` is
the path the browser fetches from the bundled site.

Usage: python3 scripts/build_data.py [path-to-synthetic-cellars]
"""
import os
import sys

import duckdb

SRC = sys.argv[1] if len(sys.argv) > 1 else "/workspace/synthetic-cellars"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs", "data")

# directory name -> (key, display name, one-line character sketch from the README)
CELLARS = {
    "a_auction_veteran": ("veteran", "The Auction Veteran",
                          "13 years of buying, mostly at auction. Bordeaux and California "
                          "early, Burgundy and Piedmont now."),
    "b_allocation_diarist": ("diarist", "The Allocation Diarist",
                             "7 years on mailing lists. Meticulous notes, family occasions, "
                             "West Coast Pinot and grower Champagne."),
    "c_champagne_newcomer": ("newcomer", "The Champagne Newcomer",
                             "3 years in, deep on grower Champagne and Krug editions."),
}

# CT writes M/D/YYYY with QUOTE_ALL, so every column arrives as VARCHAR.
DATE = "try_strptime(nullif({c}, ''), '%-m/%-d/%Y')::DATE"
NUM = "try_cast(nullif({c}, '') AS DOUBLE)"
INT = "try_cast(nullif({c}, '') AS INTEGER)"

# Vintage 1001 is CellarTracker's sentinel for non-vintage — keep it out of the
# numeric vintage so year math and averages aren't poisoned by a fake year.
VINTAGE = "CASE WHEN {c} = '1001' THEN NULL ELSE try_cast({c} AS INTEGER) END"


def d(c):
    return DATE.format(c=c)


def n(c):
    return NUM.format(c=c)


def i(c):
    return INT.format(c=c)


def v(c):
    return VINTAGE.format(c=c)


def csv(cellar_dir, name):
    return f"read_csv('{SRC}/{cellar_dir}/{name}.csv', all_varchar=true, header=true)"


def union(con, name, select_sql):
    """Run select_sql once per cellar with {tbl}/{key} substituted, UNION ALL."""
    parts = [
        select_sql.format(tbl=csv(dirname, name), key=f"'{key}'")
        for dirname, (key, _, _) in CELLARS.items()
    ]
    return con.sql("\nUNION ALL\n".join(parts))


def write(rel, sql):
    path = os.path.join(OUT, rel)
    con.sql(f"COPY ({sql}) TO '{path}' (FORMAT PARQUET, COMPRESSION ZSTD)")
    rows = con.sql(f"SELECT count(*) FROM read_parquet('{path}')").fetchone()[0]
    print(f"  {rel:24s} {rows:>7,} rows")


os.makedirs(OUT, exist_ok=True)
con = duckdb.connect()

print(f"reading {SRC}")

# ---------------------------------------------------------------- cellars ---
con.sql(
    "CREATE VIEW cellars AS "
    + "\nUNION ALL\n".join(
        f"SELECT '{k}' AS cellar, '{nm}' AS cellar_name, '{desc}' AS cellar_blurb"
        for _, (k, nm, desc) in CELLARS.items()
    )
)

# -------------------------------------------------------------- purchases ---
# One row per purchase LOT (Quantity bottles of one wine on one order).
con.sql(f"""CREATE VIEW purchases AS {union(con, 'purchase', f'''
  SELECT {{key}}                     AS cellar,
         {i('iPurchase')}            AS purchase_id,
         {i('iWine')}                AS wine_id,
         {d('PurchaseDate')}         AS purchase_date,
         {d('DeliveryDate')}         AS delivery_date,
         nullif(StoreName, '')       AS store_name,
         nullif(OrderNumber, '')     AS order_number,
         Delivered = 'True'          AS delivered,
         {n('Price')}                AS bottle_price,
         {i('Quantity')}             AS quantity,
         {i('Remaining')}            AS remaining,
         {n('Price')} * {i('Quantity')} AS lot_cost,
         nullif(Size, '')            AS bottle_size,
         {v('Vintage')}              AS vintage,
         Vintage = '1001'            AS is_non_vintage,
         nullif(Wine, '')            AS wine,
         nullif(Producer, '')        AS producer,
         nullif(Type, '')            AS wine_type,
         nullif(Color, '')           AS color,
         nullif(Category, '')        AS category,
         nullif(Varietal, '')        AS varietal,
         nullif(MasterVarietal, '')  AS master_varietal,
         nullif(Designation, '')     AS designation,
         nullif(Vineyard, '')        AS vineyard,
         nullif(Country, '')         AS country,
         nullif(Region, '')          AS region,
         nullif(SubRegion, '')       AS sub_region,
         nullif(Appellation, '')     AS appellation
  FROM {{tbl}}''').sql_query()}""")

# -------------------------------------------------------------- inventory ---
# One row per physical bottle still in the cellar.
con.sql(f"""CREATE VIEW inventory AS {union(con, 'inventory', f'''
  SELECT {{key}}                     AS cellar,
         {i('iInventory')}           AS bottle_id,
         {i('iWine')}                AS wine_id,
         {n('Price')}                AS bottle_price,
         nullif(Size, '')            AS bottle_size,
         {d('PurchaseDate')}         AS purchase_date,
         nullif(StoreName, '')       AS store_name,
         nullif(PurchaseNote, '')    AS order_number,
         nullif(Location, '')        AS location,
         nullif(Bin, '')             AS bin,
         nullif(Note, '')            AS bottle_note,
         Pending = '1'               AS pending,
         {v('Vintage')}              AS vintage,
         Vintage = '1001'            AS is_non_vintage,
         nullif(Wine, '')            AS wine,
         nullif(Producer, '')        AS producer,
         nullif(Type, '')            AS wine_type,
         nullif(Varietal, '')        AS varietal,
         nullif(Designation, '')     AS designation,
         nullif(Vineyard, '')        AS vineyard,
         nullif(Country, '')         AS country,
         nullif(Region, '')          AS region,
         nullif(SubRegion, '')       AS sub_region,
         nullif(Appellation, '')     AS appellation
  FROM {{tbl}}''').sql_query()}""")

# --------------------------------------------------------------- consumed ---
# One row per bottle that LEFT the cellar — drunk, sold, given, lost, flawed.
# Note the CT consumed export carries no Producer column; the model recovers it
# by joining to the wine catalog on wine_id.
con.sql(f"""CREATE VIEW consumed AS {union(con, 'consumed', f'''
  SELECT {{key}}                     AS cellar,
         {i('iConsumed')}            AS consumed_id,
         {i('iWine')}                AS wine_id,
         {d('Consumed')}             AS consumed_date,
         nullif(ShortType, '')       AS disposition,
         {n('Price')}                AS bottle_price,
         {n('Value')}                AS bottle_value,
         {n('Revenue')}              AS revenue,
         nullif(Size, '')            AS bottle_size,
         nullif(ConsumptionNote, '') AS occasion,
         nullif(BottleNote, '')      AS bottle_note,
         nullif(PurchaseNote, '')    AS order_number,
         nullif(Location, '')        AS location,
         nullif(Bin, '')             AS bin,
         {v('Vintage')}              AS vintage,
         Vintage = '1001'            AS is_non_vintage,
         nullif(Wine, '')            AS wine,
         nullif(Type, '')            AS wine_type,
         nullif(Color, '')           AS color,
         nullif(Category, '')        AS category,
         nullif(Varietal, '')        AS varietal,
         nullif(MasterVarietal, '')  AS master_varietal,
         nullif(Designation, '')     AS designation,
         nullif(Vineyard, '')        AS vineyard,
         nullif(Country, '')         AS country,
         nullif(Region, '')          AS region,
         nullif(SubRegion, '')       AS sub_region,
         nullif(Appellation, '')     AS appellation
  FROM {{tbl}}''').sql_query()}""")

# ------------------------------------------------------------------ notes ---
con.sql(f"""CREATE VIEW notes AS {union(con, 'notes', f'''
  SELECT {{key}}                     AS cellar,
         {i('iNote')}                AS note_id,
         {i('iWine')}                AS wine_id,
         {d('TastingDate')}          AS tasting_date,
         {i('Rating')}               AS rating,
         nullif(TastingNotes, '')    AS tasting_note,
         Defective = 'True'          AS defective,
         {i('iEvent')}               AS event_id,
         nullif(EventTitle, '')      AS event_title,
         {d('EventDate')}            AS event_date,
         nullif(EventLocation, '')   AS event_location,
         {v('Vintage')}              AS vintage,
         Vintage = '1001'            AS is_non_vintage,
         nullif(Wine, '')            AS wine,
         nullif(Producer, '')        AS producer,
         nullif(Type, '')            AS wine_type,
         nullif(Varietal, '')        AS varietal,
         nullif(MasterVarietal, '')  AS master_varietal,
         nullif(Designation, '')     AS designation,
         nullif(Vineyard, '')        AS vineyard,
         nullif(Country, '')         AS country,
         nullif(Region, '')          AS region,
         nullif(SubRegion, '')       AS sub_region,
         nullif(Appellation, '')     AS appellation
  FROM {{tbl}}''').sql_query()}""")

# ------------------------------------------------------------------ wines ---
# The wine catalog: one row per iWine, assembled from every file that names a
# producer. consumed.csv has no Producer column, so this is what gives consumed
# bottles a producer to group by.
con.sql("""CREATE VIEW wines AS
  WITH all_refs AS (
    SELECT wine_id, wine, producer, wine_type, varietal, designation, vineyard,
           country, region, sub_region, appellation, vintage, is_non_vintage
      FROM purchases
    UNION ALL
    SELECT wine_id, wine, producer, wine_type, varietal, designation, vineyard,
           country, region, sub_region, appellation, vintage, is_non_vintage
      FROM inventory
    UNION ALL
    SELECT wine_id, wine, producer, wine_type, varietal, designation, vineyard,
           country, region, sub_region, appellation, vintage, is_non_vintage
      FROM notes
  )
  SELECT wine_id,
         any_value(wine)          AS wine,
         any_value(producer)      AS producer,
         any_value(wine_type)     AS wine_type,
         any_value(varietal)      AS varietal,
         any_value(designation)   AS designation,
         any_value(vineyard)      AS vineyard,
         any_value(country)       AS country,
         any_value(region)        AS region,
         any_value(sub_region)    AS sub_region,
         any_value(appellation)   AS appellation,
         any_value(vintage)       AS vintage,
         bool_or(is_non_vintage)  AS is_non_vintage
  FROM all_refs
  WHERE wine_id IS NOT NULL
  GROUP BY wine_id""")

# ---------------------------------------------------------------- bottles ---
# EVERY bottle that has ever been in the cellar, in one table: the ones still on
# the rack and the ones that have left, distinguished by `status`. CellarTracker
# splits these into inventory.csv and consumed.csv, but for the owner they're one
# population — "bought 8, drunk 5, 3 left" is a single group-by, and buying and
# drinking land on one timeline instead of two that have to be stitched.
#
# consumed.csv has no purchase date, only the OrderId in PurchaseNote — so the
# purchase side is recovered from the purchase lots to make holding time work
# for bottles that are already gone.
con.sql("""CREATE VIEW order_lots AS
  SELECT cellar, order_number, wine_id,
         min(purchase_date) AS purchase_date,
         any_value(store_name) AS store_name
  FROM purchases
  WHERE order_number IS NOT NULL
  GROUP BY 1, 2, 3""")

con.sql("""CREATE VIEW bottles AS
  SELECT 'inv-' || i.bottle_id      AS bottle_key,
         i.cellar, i.wine_id,
         'In cellar'                AS status,
         true                       AS in_cellar,
         i.purchase_date, i.store_name, i.order_number,
         NULL::DATE                 AS exit_date,
         NULL::VARCHAR              AS occasion,
         NULL::DOUBLE               AS revenue,
         i.bottle_price, i.bottle_size, i.location, i.bin, i.bottle_note,
         i.wine, i.producer, i.wine_type, i.varietal, i.designation, i.vineyard,
         i.country, i.region, i.sub_region, i.appellation,
         i.vintage, i.is_non_vintage
  FROM inventory i

  UNION ALL

  SELECT 'con-' || c.consumed_id    AS bottle_key,
         c.cellar, c.wine_id,
         CASE c.disposition
           WHEN 'Drank from my cellar' THEN 'Drunk'
           WHEN 'Gave away'            THEN 'Given away'
           WHEN 'Missing'              THEN 'Lost'
           ELSE c.disposition
         END                        AS status,
         false                      AS in_cellar,
         l.purchase_date,
         l.store_name,
         c.order_number,
         c.consumed_date            AS exit_date,
         c.occasion,
         c.revenue,
         c.bottle_price, c.bottle_size, c.location, c.bin, c.bottle_note,
         coalesce(c.wine, w.wine)   AS wine,
         w.producer, c.wine_type, c.varietal, c.designation, c.vineyard,
         c.country, c.region, c.sub_region, c.appellation,
         c.vintage, c.is_non_vintage
  FROM consumed c
  LEFT JOIN wines w USING (wine_id)
  LEFT JOIN order_lots l
    ON l.cellar = c.cellar AND l.order_number = c.order_number AND l.wine_id = c.wine_id""")

print(f"writing {OUT}")
for name, sql in (
    ("cellars", "SELECT * FROM cellars"),
    ("wines", "SELECT * FROM wines"),
    ("bottles", "SELECT * FROM bottles"),
    ("purchases", "SELECT * FROM purchases"),
    ("notes", "SELECT * FROM notes"),
):
    write(f"{name}.parquet", sql)

print("done")
