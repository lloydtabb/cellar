// Landing page for the published site (`malloyyo dashboard bundle`).
//
// Plain React — no Malloy, no DuckDB. The build injects `dashboards` as
// {name, title, description, href}. Deliberately carries no numbers: every
// figure on this site is computed live in the browser from the parquet, and a
// hardcoded headline here would be the one thing that could silently go stale.
//
// The nav bar above this page comes from assets/site.css; this page defines its
// own type and colour, and follows the viewer's light/dark preference.

const SOURCE = "https://github.com/lloydtabb/synthetic-cellars";
const MALLOY = "https://malloydata.dev/";

// The build hands `dashboards` over sorted by slug, which puts Buying first and
// the overview fourth. Read them in the order an owner would ask the questions:
// what do I have, what should I open, what am I spending, what am I drinking,
// what did I think. Anything not listed keeps its place at the end.
const ORDER = ["overview", "open_next", "buying", "drinking", "tasting"];
const rank = (d) => {
  const i = ORDER.indexOf(d.name);
  return i === -1 ? ORDER.length : i;
};

// One line per cellar, matching the personas in the source data's README.
const CELLARS = [
  {
    name: "The Auction Veteran",
    years: "13 years",
    line: "Buys at auction, mostly. Started in Bordeaux and California, ended up in Burgundy and Piedmont — and consigned 400 bottles of the early years back to the saleroom in 2022.",
  },
  {
    name: "The Allocation Diarist",
    years: "7 years",
    line: "Lives on mailing lists. West Coast Pinot, Oregon, grower Champagne. Writes a note for better than half of what gets opened, and opens something good on the kids' birthdays.",
  },
  {
    name: "The Champagne Newcomer",
    years: "3 years",
    line: "Three years in and already deep on grower Champagne — Roses de Jeanne, Ulysse Collin, seven different Krug editions. Most of the cellar has no vintage at all.",
  },
];

const S = `
.lp{--wine:#7b2436;--wine-soft:#f6eef0;max-width:800px;margin:0 auto;padding:56px 22px 72px}
@media(prefers-color-scheme:dark){.lp{--wine:#e0899b;--wine-soft:#241a1d}}

.lp .eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--wine);font-weight:600;margin:0 0 10px}
.lp h1{font-family:Georgia,"Iowan Old Style","Times New Roman",serif;font-size:38px;line-height:1.1;font-weight:600;margin:0 0 14px;letter-spacing:-.01em}
.lp .sub{color:var(--muted);font-size:16px;line-height:1.6;margin:0 0 8px;max-width:60ch}
.lp .rule{height:3px;width:56px;background:var(--wine);border-radius:2px;margin:26px 0 34px}

.lp h2{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:600;margin:44px 0 14px}

.cards{list-style:none;padding:0;margin:0;display:grid;gap:10px}
.cards a{display:flex;align-items:baseline;gap:15px;
  padding:16px 19px;border:1px solid var(--line);border-radius:13px;background:var(--card);
  text-decoration:none;color:inherit;transition:border-color .15s,transform .15s}
.cards a:hover{border-color:var(--wine);transform:translateY(-1px)}
.cards .n{flex:none;font-family:Georgia,serif;font-size:13px;color:var(--wine);
  font-variant-numeric:tabular-nums;opacity:.7;width:1.6em}
.cards .txt{display:flex;flex-direction:column;gap:3px;min-width:0}
.cards strong{font-size:16px;font-weight:600}
.cards .desc{font-size:13.5px;color:var(--muted);line-height:1.5}

.who{list-style:none;padding:0;margin:0;display:grid;gap:2px}
.who li{padding:14px 0;border-top:1px solid var(--line)}
.who li:last-child{border-bottom:1px solid var(--line)}
.who .hd{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin:0 0 3px}
.who b{font-size:14.5px;font-weight:600}
.who em{font-style:normal;font-size:12px;color:var(--wine);letter-spacing:.02em}
.who p{margin:0;font-size:13.5px;color:var(--muted);line-height:1.55;max-width:66ch}

.foot{border-top:1px solid var(--line);margin-top:46px;padding-top:20px;color:var(--muted);font-size:13px;line-height:1.6}
.foot p{margin:0 0 8px}
.foot a{color:var(--wine);text-decoration:none}
.foot a:hover{text-decoration:underline}
`;

export default function Landing({ dashboards = [] }) {
  return (
    <main className="lp">
      <style>{S}</style>

      <p className="eyebrow">Malloy · DuckDB · in your browser</p>
      <h1>Three cellars</h1>
      <p className="sub">
        Fifteen thousand bottles across three wine cellars — what&rsquo;s still on
        the rack, what was opened and when, what it cost, and what the owner
        thought of it. Pick a cellar from the control on any dashboard.
      </p>
      <div className="rule" />

      <h2>Dashboards</h2>
      <ul className="cards">
        {[...dashboards].sort((a, b) => rank(a) - rank(b)).map((d, i) => (
          <li key={d.name}>
            <a href={d.href}>
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
              <span className="txt">
                <strong>{d.title || d.name}</strong>
                {d.description ? <span className="desc">{d.description}</span> : null}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <h2>Whose cellars</h2>
      <ul className="who">
        {CELLARS.map((c) => (
          <li key={c.name}>
            <div className="hd">
              <b>{c.name}</b>
              <em>{c.years}</em>
            </div>
            <p>{c.line}</p>
          </li>
        ))}
      </ul>

      <div className="foot">
        <p>
          Cellar data is synthetic —{" "}
          <a href={SOURCE} target="_blank" rel="noopener noreferrer">
            lloydtabb/synthetic-cellars
          </a>
          , three fabricated CellarTracker exports that match the real export
          schema column for column. No real person&rsquo;s cellar is shown here.
        </p>
        <p>
          Modelled in{" "}
          <a href={MALLOY} target="_blank" rel="noopener noreferrer">
            Malloy
          </a>{" "}
          and published with Malloyyo. Every query runs locally in your browser
          against parquet files served from this site — nothing is sent anywhere.
        </p>
      </div>
    </main>
  );
}
