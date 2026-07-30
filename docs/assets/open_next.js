globalThis.process||={env:{},platform:'browser',versions:{},argv:[],cwd:()=>'/'};
import{a as m,b as Y,c as x,d as y,e as d,f as b,g as w}from"./chunk-SAD7HS3V.js";var i=m(Y());var e=m(x()),u=[{key:"surprise",label:"Surprise me",test:()=>!0,empty:"Nothing on the rack matches those filters."},{key:"last",label:"Last bottle",test:o=>o.on_hand===1,empty:"No last bottles here \u2014 everything you own, you own more than one of."},{key:"untasted",label:"Never opened",test:o=>!o.notes_written,empty:"You've written a note on everything that matches. Impressive."},{key:"waiting",label:"Been waiting",test:o=>(o.years_on_rack??0)>=5,empty:"Nothing here has been on the rack five years."},{key:"loved",label:"You loved it",test:o=>(o.score??0)>=93,empty:"Nothing here scored 93 or better \u2014 or you haven't written it up yet."}];function O(o){let t=[];return o.on_hand===1&&t.push("Your last bottle"),o.notes_written||t.push("You've never opened one"),o.score>=95?t.push(`You scored it ${Math.round(o.score)}`):o.score>=93&&t.push(`You liked it \u2014 ${Math.round(o.score)} points`),(o.years_on_rack??0)>=8?t.push(`On the rack ${Math.round(o.years_on_rack)} years`):(o.years_on_rack??0)>=5&&t.push("Been waiting a while"),o.already_drunk>=12&&t.push(`You've had ${o.already_drunk} of these`),o.on_hand>=24&&t.push(`${o.on_hand} in stock \u2014 you can spare one`),t.length?t:["No particular reason. That's allowed."]}var S=o=>o==null?"\u2014":"$"+Math.round(o).toLocaleString(),L=o=>{if(!o)return null;let t=new Date(o);return isNaN(t)?null:t.toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"})},M=o=>{let t=[o.location,o.bin].filter(Boolean).join(" \xB7 ")||"unshelved";return o.bottle_size&&o.bottle_size!=="750ml"?`${t} (${o.bottle_size})`:t},$=`
/* Two hosts, two sets of theme variables: the bundled page defines site.css's
   --line/--card/--muted, and the dashboard runtime (which renders this in an
   iframe) defines --dash-*. Resolve each colour once here through both, with a
   literal last resort, so the card is bordered and legible either way \u2014 a card
   whose --line doesn't resolve loses every border and divider silently. */
.on{
  --edge:var(--dash-border,var(--line,#e4e6eb));
  --surface:var(--dash-panel-bg,var(--card,#fff));
  --dim:var(--dash-muted,var(--muted,#6b7280));
  --ink:var(--dash-fg,var(--fg,#16181d));
  --wine:#7b2436;--wine-soft:#f7eff1;
  color:var(--ink);max-width:820px;margin:0 auto;padding:34px 22px 64px}
@media(prefers-color-scheme:dark){.on{--wine:#e0899b;--wine-soft:#241a1d}}

.on h1{font-family:Georgia,"Iowan Old Style",serif;font-size:27px;font-weight:600;margin:0 0 4px}
.on .lede{color:var(--dim);font-size:14.5px;margin:0 0 20px}

.moods{display:flex;flex-wrap:wrap;gap:7px;margin:18px 0 20px}
.moods button{font:inherit;font-size:13px;padding:6px 13px;border-radius:999px;cursor:pointer;
  border:1px solid var(--edge);background:var(--surface);color:var(--ink);transition:.15s}
.moods button:hover{border-color:var(--wine)}
.moods button[aria-pressed="true"]{background:var(--wine);border-color:var(--wine);color:#fff}

.card{border:1px solid var(--edge);border-radius:16px;background:var(--surface);overflow:hidden}
.card .top{padding:26px 26px 22px;border-bottom:1px solid var(--edge)}
.vint{font-family:Georgia,serif;font-size:13px;letter-spacing:.1em;color:var(--wine);margin:0 0 7px}
.name{font-family:Georgia,"Iowan Old Style",serif;font-size:30px;line-height:1.22;font-weight:600;margin:0 0 10px}
.orig{color:var(--dim);font-size:14px;margin:0}

.why{display:flex;flex-wrap:wrap;gap:6px;margin:16px 0 0}
.why span{font-size:12.5px;padding:4px 11px;border-radius:999px;background:var(--wine-soft);color:var(--wine);font-weight:500}

.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:1px;background:var(--edge)}
.facts div{background:var(--surface);padding:15px 16px}
.facts dt{font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--dim);margin:0 0 4px}
.facts dd{margin:0;font-size:19px;font-family:Georgia,serif;font-variant-numeric:tabular-nums}

.sect{padding:20px 26px;border-top:1px solid var(--edge)}
.sect h3{font-size:11px;letter-spacing:.11em;text-transform:uppercase;color:var(--dim);font-weight:600;margin:0 0 10px}
.shelves{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:7px}
.shelves li{font-size:13px;padding:5px 11px;border:1px solid var(--edge);border-radius:8px}
.shelves b{font-variant-numeric:tabular-nums}
.shelves .more{color:var(--dim);border-style:dashed}
.note p{margin:0 0 6px;font-size:14.5px;line-height:1.6}
.note .meta{font-size:12.5px;color:var(--dim)}

.again{margin:22px 0 0;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.again button{font:inherit;font-size:14px;font-weight:550;padding:10px 20px;border-radius:10px;cursor:pointer;
  background:var(--wine);color:#fff;border:1px solid var(--wine)}
.again button:hover{opacity:.9}
.again .count{font-size:13px;color:var(--dim)}

.msg{padding:34px 26px;text-align:center;color:var(--dim);font-size:14.5px}
`;function f({givens:o}){let{rows:t,loading:p,error:l}=y({query:"open_next",givens:o}),[v,k]=(0,i.useState)("surprise"),[N,_]=(0,i.useState)(0),c=u.find(r=>r.key===v)??u[0],n=(0,i.useMemo)(()=>(t??[]).filter(c.test),[t,c]),a=(0,i.useMemo)(()=>n.length?n[Math.floor(Math.random()*n.length)]:null,[n,N]),s=a?.your_notes?.find(r=>r.note_text),z=(a?.shelves??[]).reduce((r,h)=>r+(h.bottles_here??0),0),g=(a?.on_hand??0)-z;return(0,e.jsxs)("main",{className:"on",children:[(0,e.jsx)("style",{children:$}),(0,e.jsx)("h1",{children:"Open Next"}),(0,e.jsx)("p",{className:"lede",children:"One bottle, chosen from what's actually on your rack."}),(0,e.jsxs)(b,{children:[(0,e.jsx)(d,{name:"CELLAR"}),(0,e.jsx)(d,{name:"REGION"}),(0,e.jsx)(d,{name:"PRODUCER"}),(0,e.jsx)(d,{name:"STYLE"})]}),(0,e.jsx)("div",{className:"moods",children:u.map(r=>(0,e.jsx)("button",{"aria-pressed":r.key===v,onClick:()=>k(r.key),children:r.label},r.key))}),p&&(0,e.jsx)("div",{className:"card",children:(0,e.jsx)("div",{className:"msg",children:"Looking through the cellar\u2026"})}),l&&(0,e.jsx)("div",{className:"card",children:(0,e.jsxs)("div",{className:"msg",children:["Couldn't read the cellar: ",String(l)]})}),!p&&!l&&!a&&(0,e.jsx)("div",{className:"card",children:(0,e.jsx)("div",{className:"msg",children:c.empty})}),!p&&!l&&a&&(0,e.jsxs)(e.Fragment,{children:[(0,e.jsxs)("article",{className:"card",children:[(0,e.jsxs)("div",{className:"top",children:[(0,e.jsx)("p",{className:"vint",children:a.vintage_label??"NV"}),(0,e.jsx)("h2",{className:"name",children:a.wine}),(0,e.jsx)("p",{className:"orig",children:[a.appellation||a.region,a.varietal].filter(Boolean).join(" \xB7 ")}),(0,e.jsx)("div",{className:"why",children:O(a).map(r=>(0,e.jsx)("span",{children:r},r))})]}),(0,e.jsxs)("dl",{className:"facts",children:[(0,e.jsxs)("div",{children:[(0,e.jsx)("dt",{children:"On the rack"}),(0,e.jsx)("dd",{children:a.on_hand})]}),(0,e.jsxs)("div",{children:[(0,e.jsx)("dt",{children:"You paid"}),(0,e.jsx)("dd",{children:S(a.price)})]}),(0,e.jsxs)("div",{children:[(0,e.jsx)("dt",{children:"Years held"}),(0,e.jsx)("dd",{children:a.years_on_rack==null?"\u2014":a.years_on_rack.toFixed(1)})]}),(0,e.jsxs)("div",{children:[(0,e.jsx)("dt",{children:"Your score"}),(0,e.jsx)("dd",{children:a.score==null?"\u2014":Math.round(a.score)})]}),(0,e.jsxs)("div",{children:[(0,e.jsx)("dt",{children:"Already drunk"}),(0,e.jsx)("dd",{children:a.already_drunk??0})]})]}),a.shelves?.length>0&&(0,e.jsxs)("div",{className:"sect",children:[(0,e.jsx)("h3",{children:"Where to look"}),(0,e.jsxs)("ul",{className:"shelves",children:[a.shelves.map((r,h)=>(0,e.jsxs)("li",{children:[M(r)," \u2014 ",(0,e.jsx)("b",{children:r.bottles_here})]},h)),g>0&&(0,e.jsxs)("li",{className:"more",children:["+",g," elsewhere"]})]})]}),(0,e.jsxs)("div",{className:"sect note",children:[(0,e.jsx)("h3",{children:s?"Last time you opened one":"Your notes"}),s?(0,e.jsxs)(e.Fragment,{children:[(0,e.jsxs)("p",{children:["\u201C",s.note_text,"\u201D"]}),(0,e.jsx)("p",{className:"meta",children:[L(s.note_date),s.note_score?`${s.note_score} points`:null].filter(Boolean).join(" \xB7 ")})]}):(0,e.jsx)("p",{className:"meta",children:"You've never written this one up. All the more reason."})]})]}),(0,e.jsxs)("div",{className:"again",children:[(0,e.jsx)("button",{onClick:()=>_(r=>r+1),children:"Pick another"}),(0,e.jsxs)("span",{className:"count",children:[n.length.toLocaleString()," ",n.length===1?"wine":"wines"," to choose from"]})]})]})]})}w(f);
