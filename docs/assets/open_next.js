globalThis.process||={env:{},platform:'browser',versions:{},argv:[],cwd:()=>'/'};
import{a as u,b as _,c as v,d as g,e as d,f as x,g as y}from"./chunk-SAD7HS3V.js";var s=u(_());var e=u(v()),m=[{key:"surprise",label:"Surprise me",test:()=>!0,empty:"Nothing on the rack matches those filters."},{key:"last",label:"Last bottle",test:o=>o.on_hand===1,empty:"No last bottles here \u2014 everything you own, you own more than one of."},{key:"untasted",label:"Never opened",test:o=>!o.notes_written,empty:"You've written a note on everything that matches. Impressive."},{key:"waiting",label:"Been waiting",test:o=>(o.years_on_rack??0)>=5,empty:"Nothing here has been on the rack five years."},{key:"loved",label:"You loved it",test:o=>(o.score??0)>=93,empty:"Nothing here scored 93 or better \u2014 or you haven't written it up yet."}];function z(o){let a=[];return o.on_hand===1&&a.push("Your last bottle"),o.notes_written||a.push("You've never opened one"),o.score>=95?a.push(`You scored it ${Math.round(o.score)}`):o.score>=93&&a.push(`You liked it \u2014 ${Math.round(o.score)} points`),(o.years_on_rack??0)>=8?a.push(`On the rack ${Math.round(o.years_on_rack)} years`):(o.years_on_rack??0)>=5&&a.push("Been waiting a while"),o.already_drunk>=12&&a.push(`You've had ${o.already_drunk} of these`),o.on_hand>=24&&a.push(`${o.on_hand} in stock \u2014 you can spare one`),a.length?a:["No particular reason. That's allowed."]}var Y=o=>o==null?"\u2014":"$"+Math.round(o).toLocaleString(),O=o=>{if(!o)return null;let a=new Date(o);return isNaN(a)?null:a.toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"})},S=o=>[o.location,o.bin].filter(Boolean).join(" \xB7 ")||"unshelved",L=`
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
`;function h({givens:o}){let{rows:a,loading:p,error:l}=g({query:"open_next",givens:o}),[f,w]=(0,s.useState)("surprise"),[b,k]=(0,s.useState)(0),c=m.find(n=>n.key===f)??m[0],r=(0,s.useMemo)(()=>(a??[]).filter(c.test),[a,c]),t=(0,s.useMemo)(()=>r.length?r[Math.floor(Math.random()*r.length)]:null,[r,b]),i=t?.your_notes?.find(n=>n.note_text);return(0,e.jsxs)("main",{className:"on",children:[(0,e.jsx)("style",{children:L}),(0,e.jsx)("h1",{children:"Open Next"}),(0,e.jsx)("p",{className:"lede",children:"One bottle, chosen from what's actually on your rack."}),(0,e.jsxs)(x,{children:[(0,e.jsx)(d,{name:"CELLAR"}),(0,e.jsx)(d,{name:"REGION"}),(0,e.jsx)(d,{name:"PRODUCER"}),(0,e.jsx)(d,{name:"STYLE"})]}),(0,e.jsx)("div",{className:"moods",children:m.map(n=>(0,e.jsx)("button",{"aria-pressed":n.key===f,onClick:()=>w(n.key),children:n.label},n.key))}),p&&(0,e.jsx)("div",{className:"card",children:(0,e.jsx)("div",{className:"msg",children:"Looking through the cellar\u2026"})}),l&&(0,e.jsx)("div",{className:"card",children:(0,e.jsxs)("div",{className:"msg",children:["Couldn't read the cellar: ",String(l)]})}),!p&&!l&&!t&&(0,e.jsx)("div",{className:"card",children:(0,e.jsx)("div",{className:"msg",children:c.empty})}),!p&&!l&&t&&(0,e.jsxs)(e.Fragment,{children:[(0,e.jsxs)("article",{className:"card",children:[(0,e.jsxs)("div",{className:"top",children:[(0,e.jsx)("p",{className:"vint",children:t.vintage_label??"NV"}),(0,e.jsx)("h2",{className:"name",children:t.wine}),(0,e.jsx)("p",{className:"orig",children:[t.appellation||t.region,t.varietal].filter(Boolean).join(" \xB7 ")}),(0,e.jsx)("div",{className:"why",children:z(t).map(n=>(0,e.jsx)("span",{children:n},n))})]}),(0,e.jsxs)("dl",{className:"facts",children:[(0,e.jsxs)("div",{children:[(0,e.jsx)("dt",{children:"On the rack"}),(0,e.jsx)("dd",{children:t.on_hand})]}),(0,e.jsxs)("div",{children:[(0,e.jsx)("dt",{children:"You paid"}),(0,e.jsx)("dd",{children:Y(t.price)})]}),(0,e.jsxs)("div",{children:[(0,e.jsx)("dt",{children:"Years held"}),(0,e.jsx)("dd",{children:t.years_on_rack==null?"\u2014":t.years_on_rack.toFixed(1)})]}),(0,e.jsxs)("div",{children:[(0,e.jsx)("dt",{children:"Your score"}),(0,e.jsx)("dd",{children:t.score==null?"\u2014":Math.round(t.score)})]}),(0,e.jsxs)("div",{children:[(0,e.jsx)("dt",{children:"Already drunk"}),(0,e.jsx)("dd",{children:t.already_drunk??0})]})]}),t.shelves?.length>0&&(0,e.jsxs)("div",{className:"sect",children:[(0,e.jsx)("h3",{children:"Where to look"}),(0,e.jsx)("ul",{className:"shelves",children:t.shelves.map((n,N)=>(0,e.jsxs)("li",{children:[S(n)," \u2014 ",(0,e.jsx)("b",{children:n.bottles_here})]},N))})]}),(0,e.jsxs)("div",{className:"sect note",children:[(0,e.jsx)("h3",{children:i?"Last time you opened one":"Your notes"}),i?(0,e.jsxs)(e.Fragment,{children:[(0,e.jsxs)("p",{children:["\u201C",i.note_text,"\u201D"]}),(0,e.jsx)("p",{className:"meta",children:[O(i.note_date),i.note_score?`${i.note_score} points`:null].filter(Boolean).join(" \xB7 ")})]}):(0,e.jsx)("p",{className:"meta",children:"You've never written this one up. All the more reason."})]})]}),(0,e.jsxs)("div",{className:"again",children:[(0,e.jsx)("button",{onClick:()=>k(n=>n+1),children:"Pick another"}),(0,e.jsxs)("span",{className:"count",children:[r.length.toLocaleString()," ",r.length===1?"wine":"wines"," to choose from"]})]})]})]})}y(h);
