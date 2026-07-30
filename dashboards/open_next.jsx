// "Open Next" — the page commits to one bottle.
//
// The .malloy file hands over a POOL (every wine with a bottle on the rack,
// with its shelf, its price, its history and your notes). Everything here is
// choosing from that pool and presenting the choice, which is why it's a
// component and not more Malloy: picking again is a client-side reshuffle, so
// the button is instant and never re-queries.
//
// Moods are the old "What to Open" tables in disguise — Last bottle, Never
// opened, Been waiting are the same three predicates that used to be three
// separate ranked tables, now applied to a pool and answered with one bottle.

import React, { useMemo, useState } from "react";
import { Controls, Given, useQuery } from "@malloyyo/dashboard";

const MOODS = [
  { key: "surprise", label: "Surprise me", test: () => true,
    empty: "Nothing on the rack matches those filters." },
  { key: "last", label: "Last bottle", test: (b) => b.on_hand === 1,
    empty: "No last bottles here — everything you own, you own more than one of." },
  { key: "untasted", label: "Never opened", test: (b) => !b.notes_written,
    empty: "You've written a note on everything that matches. Impressive." },
  { key: "waiting", label: "Been waiting", test: (b) => (b.years_on_rack ?? 0) >= 5,
    empty: "Nothing here has been on the rack five years." },
  { key: "loved", label: "You loved it", test: (b) => (b.score ?? 0) >= 93,
    empty: "Nothing here scored 93 or better — or you haven't written it up yet." },
];

// Every true thing about this bottle worth putting on the card, best first.
function reasons(b) {
  const out = [];
  if (b.on_hand === 1) out.push("Your last bottle");
  if (!b.notes_written) out.push("You've never opened one");
  if (b.score >= 95) out.push(`You scored it ${Math.round(b.score)}`);
  else if (b.score >= 93) out.push(`You liked it — ${Math.round(b.score)} points`);
  if ((b.years_on_rack ?? 0) >= 8) out.push(`On the rack ${Math.round(b.years_on_rack)} years`);
  else if ((b.years_on_rack ?? 0) >= 5) out.push("Been waiting a while");
  if (b.already_drunk >= 12) out.push(`You've had ${b.already_drunk} of these`);
  if (b.on_hand >= 24) out.push(`${b.on_hand} in stock — you can spare one`);
  return out.length ? out : ["No particular reason. That's allowed."];
}

const money = (n) =>
  n == null ? "—" : "$" + Math.round(n).toLocaleString();

const when = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d) ? null
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const shelfLabel = (s) =>
  [s.location, s.bin].filter(Boolean).join(" · ") || "unshelved";

const S = `
.on{--wine:#7b2436;--wine-soft:#f7eff1;max-width:820px;margin:0 auto;padding:34px 22px 64px}
@media(prefers-color-scheme:dark){.on{--wine:#e0899b;--wine-soft:#241a1d}}

.on h1{font-family:Georgia,"Iowan Old Style",serif;font-size:27px;font-weight:600;margin:0 0 4px}
.on .lede{color:var(--muted);font-size:14.5px;margin:0 0 20px}

.moods{display:flex;flex-wrap:wrap;gap:7px;margin:18px 0 20px}
.moods button{font:inherit;font-size:13px;padding:6px 13px;border-radius:999px;cursor:pointer;
  border:1px solid var(--line);background:var(--card);color:var(--fg);transition:.15s}
.moods button:hover{border-color:var(--wine)}
.moods button[aria-pressed="true"]{background:var(--wine);border-color:var(--wine);color:#fff}

.card{border:1px solid var(--line);border-radius:16px;background:var(--card);overflow:hidden}
.card .top{padding:26px 26px 22px;border-bottom:1px solid var(--line)}
.vint{font-family:Georgia,serif;font-size:13px;letter-spacing:.1em;color:var(--wine);margin:0 0 7px}
.name{font-family:Georgia,"Iowan Old Style",serif;font-size:30px;line-height:1.22;font-weight:600;margin:0 0 10px}
.orig{color:var(--muted);font-size:14px;margin:0}

.why{display:flex;flex-wrap:wrap;gap:6px;margin:16px 0 0}
.why span{font-size:12.5px;padding:4px 11px;border-radius:999px;background:var(--wine-soft);color:var(--wine);font-weight:500}

.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:1px;background:var(--line)}
.facts div{background:var(--card);padding:15px 16px}
.facts dt{font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin:0 0 4px}
.facts dd{margin:0;font-size:19px;font-family:Georgia,serif;font-variant-numeric:tabular-nums}

.sect{padding:20px 26px;border-top:1px solid var(--line)}
.sect h3{font-size:11px;letter-spacing:.11em;text-transform:uppercase;color:var(--muted);font-weight:600;margin:0 0 10px}
.shelves{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:7px}
.shelves li{font-size:13px;padding:5px 11px;border:1px solid var(--line);border-radius:8px}
.shelves b{font-variant-numeric:tabular-nums}
.note p{margin:0 0 6px;font-size:14.5px;line-height:1.6}
.note .meta{font-size:12.5px;color:var(--muted)}

.again{margin:22px 0 0;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.again button{font:inherit;font-size:14px;font-weight:550;padding:10px 20px;border-radius:10px;cursor:pointer;
  background:var(--wine);color:#fff;border:1px solid var(--wine)}
.again button:hover{opacity:.9}
.again .count{font-size:13px;color:var(--muted)}

.msg{padding:34px 26px;text-align:center;color:var(--muted);font-size:14.5px}
`;

export default function OpenNext({ givens }) {
  const { rows, loading, error } = useQuery({ query: "open_next", givens });
  const [mood, setMood] = useState("surprise");
  const [nonce, setNonce] = useState(0);

  const active = MOODS.find((m) => m.key === mood) ?? MOODS[0];
  const pool = useMemo(
    () => (rows ?? []).filter(active.test),
    [rows, active]
  );

  // Re-rolls when the button is pressed, the mood changes, or the filters
  // above change the pool underneath it.
  const bottle = useMemo(
    () => (pool.length ? pool[Math.floor(Math.random() * pool.length)] : null),
    [pool, nonce]
  );

  // Most recent note that actually has prose — the query asks for three so
  // there's something to fall back to.
  const note = bottle?.your_notes?.find((n) => n.note_text);

  return (
    <main className="on">
      <style>{S}</style>

      <h1>Open Next</h1>
      <p className="lede">One bottle, chosen from what's actually on your rack.</p>

      <Controls>
        <Given name="CELLAR" />
        <Given name="REGION" />
        <Given name="PRODUCER" />
        <Given name="STYLE" />
      </Controls>

      <div className="moods">
        {MOODS.map((m) => (
          <button key={m.key} aria-pressed={m.key === mood} onClick={() => setMood(m.key)}>
            {m.label}
          </button>
        ))}
      </div>

      {loading && <div className="card"><div className="msg">Looking through the cellar…</div></div>}

      {error && (
        <div className="card"><div className="msg">Couldn't read the cellar: {String(error)}</div></div>
      )}

      {!loading && !error && !bottle && (
        <div className="card"><div className="msg">{active.empty}</div></div>
      )}

      {!loading && !error && bottle && (
        <>
          <article className="card">
            <div className="top">
              <p className="vint">{bottle.vintage_label ?? "NV"}</p>
              <h2 className="name">{bottle.wine}</h2>
              <p className="orig">
                {[bottle.appellation || bottle.region, bottle.varietal]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className="why">
                {reasons(bottle).map((r) => <span key={r}>{r}</span>)}
              </div>
            </div>

            <dl className="facts">
              <div><dt>On the rack</dt><dd>{bottle.on_hand}</dd></div>
              <div><dt>You paid</dt><dd>{money(bottle.price)}</dd></div>
              <div><dt>Years held</dt>
                <dd>{bottle.years_on_rack == null ? "—" : bottle.years_on_rack.toFixed(1)}</dd></div>
              <div><dt>Your score</dt>
                <dd>{bottle.score == null ? "—" : Math.round(bottle.score)}</dd></div>
              <div><dt>Already drunk</dt><dd>{bottle.already_drunk ?? 0}</dd></div>
            </dl>

            {bottle.shelves?.length > 0 && (
              <div className="sect">
                <h3>Where to look</h3>
                <ul className="shelves">
                  {bottle.shelves.map((s, i) => (
                    <li key={i}>{shelfLabel(s)} — <b>{s.bottles_here}</b></li>
                  ))}
                </ul>
              </div>
            )}

            <div className="sect note">
              <h3>{note ? "Last time you opened one" : "Your notes"}</h3>
              {note ? (
                <>
                  <p>&ldquo;{note.note_text}&rdquo;</p>
                  <p className="meta">
                    {[when(note.note_date), note.note_score ? `${note.note_score} points` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </>
              ) : (
                <p className="meta">
                  You've never written this one up. All the more reason.
                </p>
              )}
            </div>
          </article>

          <div className="again">
            <button onClick={() => setNonce((n) => n + 1)}>Pick another</button>
            <span className="count">
              {pool.length.toLocaleString()} {pool.length === 1 ? "wine" : "wines"} to choose from
            </span>
          </div>
        </>
      )}
    </main>
  );
}
