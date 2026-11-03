// Intérieur de chaque boutique, places disponibles, bowling, séances de cinéma.
// ================= Boutiques (vue de l'intérieur) =================
function checker(c,x,y,L,a,b,n){R(c,x,y,L,L,a);c.fillStyle=b;const q=L/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++)if((i+j)%2)c.fillRect(x+i*q,y+j*q,q,q)}
function planks(c,x,y,L,a,b){R(c,x,y,L,L,a);c.strokeStyle=b;c.lineWidth=1;for(let k=1;k<8;k++){c.beginPath();c.moveTo(x,y+k*L/8);c.lineTo(x+L,y+k*L/8);c.stroke()}}
function chairsTable(c,x,y,r,cloth,chair){for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;O(c,x+Math.cos(a)*r*1.45,y+Math.sin(a)*r*1.45,r*.45,chair)}O(c,x,y,r,cloth)}
function shelfH(c,x,y,w,h,cols){R(c,x,y,w,h,'#8b6440');const n=Math.max(3,Math.round(w/(h*.7)));for(let k=0;k<n;k++)R(c,x+1+k*(w-2)/n,y+1.2,Math.max(.5,(w-2)/n-.8),h-2.4,cols[k%cols.length])}
function shelfV(c,x,y,w,h,cols){R(c,x,y,w,h,'#8b6440');const n=Math.max(3,Math.round(h/(w*.7)));for(let k=0;k<n;k++)R(c,x+1.2,y+1+k*(h-2)/n,w-2.4,Math.max(.5,(h-2)/n-.8),cols[k%cols.length])}
const MAGS=['#e85d4a','#3d7dd8','#f2b134','#47a36b','#9a5fd1','#ffffff'];
// Chaque boutique : mobilier pleine largeur + emplacements (slots) où les clients s'installent.
// Coordonnées normalisées : u de gauche à droite, v du fond (0) jusqu'à la porte (1).
const Sl=(u,v,k)=>({u,v,k});
function checkerR(g,a,b,n){const {c,X,Y,W,H}=g;R(c,X,Y,W,H,a);c.fillStyle=b;const q=H/n;for(let i=0;i*q<W;i++)for(let j=0;j<n;j++)if((i+j)%2)c.fillRect(X+i*q,Y+j*q,Math.min(q,X+W-(X+i*q)),q)}
function planksR(g,a,b){const {c,X,Y,W,H}=g;R(c,X,Y,W,H,a);c.strokeStyle=b;c.lineWidth=1;for(let k=1;k<7;k++){c.beginPath();c.moveTo(X,Y+k*H/7);c.lineTo(X+W,Y+k*H/7);c.stroke()}}
const seatsAround=(us,v,d)=>us.flatMap(u=>[Sl(u-d,v),Sl(u+d,v)]);
const SPEC={
 fleuriste:{kind:'browse',slots:[Sl(.22,.45),Sl(.45,.45),Sl(.7,.45),Sl(.2,.75)],draw(g){const{c,x,y,w,h,m}=g;checkerR(g,'#eef5e6','#e1ecd6',7);
   for(let k=0;k<6;k++){const u=.09+k*.164;O(c,x(u),y(.17),m(.11),'#a0673c');O(c,x(u),y(.17),m(.085),'#4d9b42');for(let q=0;q<3;q++)O(c,x(u)+Math.cos(q*2.1+k)*m(.04),y(.17)+Math.sin(q*2.1+k)*m(.04),m(.03),['#e8578f','#f2c14e','#ffffff','#9a6fd6'][(q+k)%4])}
   for(const v of [.45,.7]){O(c,x(.05),y(v),m(.06),'#7aa0c8');O(c,x(.05),y(v),m(.04),'#ef7fb0')}R(c,x(.72),y(.62),w(.24),h(.13),'#c9a27a')}},
 kiosque:{kind:'browse',slots:[Sl(.22,.42),Sl(.5,.42),Sl(.82,.42)],draw(g){const{c,x,y,w,h}=g;checkerR(g,'#ece6d9','#e2dbcb',7);
   shelfH(c,x(.03),y(.05),w(.94),h(.17),MAGS);shelfV(c,x(.03),y(.35),w(.06),h(.42),MAGS);R(c,x(.7),y(.58),w(.26),h(.14),'#3d6fb6');for(let k=0;k<3;k++)R(c,x(.73+k*.075),y(.6),w(.055),h(.1),MAGS[k])}},
 boulangerie:{kind:'browse',slots:[Sl(.2,.45),Sl(.4,.45),Sl(.6,.45),Sl(.8,.45)],draw(g){const{c,x,y,w,h,m}=g;checkerR(g,'#f6ead7','#ead8bc',7);
   R(c,x(.04),y(.05),w(.92),h(.22),'#c08a4e');R(c,x(.06),y(.07),w(.88),h(.16),'rgba(210,240,255,.7)');for(let k=0;k<8;k++)E(c,x(.1+k*.115),y(.15),m(.06),m(.04),k%2?'#d99a4a':'#b8742f');
   shelfV(c,x(.02),y(.4),w(.05),h(.4),['#e0a85a','#d48a2c'])}},
 cafe:{kind:'sit',slots:seatsAround([.2,.5,.8],.58,.1),draw(g){const{c,x,y,w,h,m}=g;planksR(g,'#b98a5e','#a57850');
   R(c,x(.03),y(.05),w(.5),h(.16),'#5a3a22');R(c,x(.06),y(.07),w(.08),h(.11),'#c0c0c0');O(c,x(.22),y(.13),m(.03),'#fff');O(c,x(.3),y(.13),m(.03),'#fff');O(c,x(.92),y(.14),m(.08),'#4d9b42');
   for(const u of [.2,.5,.8]){for(const d of [-.1,.1])O(c,x(u+d),y(.58),m(.07),'#7a4a2a');O(c,x(u),y(.58),m(.1),'#f4efe6')}}},
 glacier:{kind:'sit',slots:seatsAround([.27,.73],.62,.1),draw(g){const{c,x,y,w,h,m}=g;checkerR(g,'#ffffff','#ffe0ea',7);
   R(c,x(.04),y(.05),w(.92),h(.2),'#cfe8f5');['#f7b2c4','#fff1c1','#a0673c','#b8e0d2','#f2c14e','#c9b6f2','#ef7fb0'].forEach((col,k)=>R(c,x(.07+k*.125),y(.08),w(.1),h(.13),col));
   for(const u of [.27,.73]){for(const d of [-.1,.1])O(c,x(u+d),y(.62),m(.07),'#ffffff');O(c,x(u),y(.62),m(.1),'#f07fa8')}}},
 librairie:{kind:'browse',slots:[Sl(.25,.36),Sl(.5,.36),Sl(.75,.36),Sl(.18,.68)],draw(g){const{c,x,y,w,h,m}=g;planksR(g,'#c9a27a','#b88f66');
   shelfH(c,x(.03),y(.04),w(.94),h(.14),MAGS);shelfV(c,x(.02),y(.25),w(.06),h(.5),MAGS);shelfV(c,x(.92),y(.25),w(.06),h(.5),MAGS.slice().reverse());E(c,x(.55),y(.62),w(.16),h(.12),'#a3473a');
   R(c,x(.72),y(.55),w(.1),h(.16),'#2f7d6d')}},
 pharmacie:{kind:'browse',slots:[Sl(.5,.4),Sl(.2,.55),Sl(.8,.55)],draw(g){const{c,x,y,w,h}=g;checkerR(g,'#f4f7f4','#e6eee6',7);const ph=['#ffffff','#27a35a','#bfe3f2','#f2c14e'];
   shelfV(c,x(.02),y(.06),w(.07),h(.72),ph);shelfV(c,x(.91),y(.06),w(.07),h(.72),ph);R(c,x(.3),y(.05),w(.4),h(.16),'#27a35a');R(c,x(.485),y(.07),w(.03),h(.12),'#fff');R(c,x(.465),y(.11),w(.07),h(.04),'#fff')}},
 pizzeria:{kind:'sit',slots:seatsAround([.2,.5,.8],.64,.1),draw(g){const{c,x,y,w,h,m}=g;checkerR(g,'#f1e3cf','#e3cfb3',7);
   O(c,x(.12),y(.2),m(.17),'#8c3b2a');O(c,x(.12),y(.2),m(.09),'#ff9a3c');O(c,x(.12),y(.2),m(.045),'#ffd27a');R(c,x(.3),y(.05),w(.66),h(.15),'#c8402f');
   for(const u of [.2,.5,.8]){for(const d of [-.1,.1])O(c,x(u+d),y(.64),m(.07),'#8b5e3c');O(c,x(u),y(.64),m(.1),'#e74c3c');O(c,x(u),y(.64),m(.045),'#ffffff')}}},
 jouets:{kind:'browse',slots:[Sl(.2,.38),Sl(.4,.38),Sl(.6,.38),Sl(.8,.38),Sl(.3,.72)],draw(g){const{c,x,y,w,h,m}=g;R(c,g.X,g.Y,g.W,g.H,'#e3eefb');
   for(let k=0;k<14;k++)O(c,x((k*37%100)/100),y((k*53%100)/100),m(.03),MAGS[k%5]+'55');shelfH(c,x(.03),y(.04),w(.94),h(.15),['#e74c3c','#f2c14e','#3d7dd8','#47a36b','#9a5fd1']);
   c.strokeStyle='#8b6440';c.lineWidth=m(.03);c.beginPath();c.ellipse(x(.62),y(.68),w(.14),h(.1),0,0,7);c.stroke();R(c,x(.5),y(.63),w(.05),h(.06),'#3d7dd8');
   O(c,x(.08),y(.5),m(.07),'#e74c3c');O(c,x(.92),y(.5),m(.07),'#a0673c');O(c,x(.89),y(.43),m(.03),'#a0673c');O(c,x(.95),y(.43),m(.03),'#a0673c')}},
 coiffeur:{kind:'sit',slots:[Sl(.2,.3),Sl(.5,.3),Sl(.8,.3)],draw(g){const{c,x,y,w,h,m}=g;checkerR(g,'#ffffff','#2d2d34',8);R(c,x(.04),y(.03),w(.92),h(.07),'#bfe3f2');
   for(const u of [.2,.5,.8]){O(c,x(u),y(.3),m(.1),'#6b4fb3');O(c,x(u),y(.3),m(.05),'#8f74d1')}R(c,x(.04),y(.74),w(.24),h(.11),'#a0673c');O(c,x(.92),y(.78),m(.08),'#4d9b42')}},
 burger:{kind:'sit',slots:seatsAround([.2,.5,.8],.55,.11),draw(g){const{c,x,y,w,h}=g;checkerR(g,'#ffffff','#f6d5c8',7);R(c,x(.03),y(.05),w(.94),h(.16),'#e2552a');
   for(let k=0;k<5;k++)R(c,x(.08+k*.18),y(.08),w(.12),h(.08),'#f2c14e');
   for(const u of [.2,.5,.8]){R(c,x(u-.15),y(.43),w(.05),h(.25),'#c0392b');R(c,x(u+.1),y(.43),w(.05),h(.25),'#c0392b');R(c,x(u-.06),y(.46),w(.12),h(.19),'#f2c14e')}}},
 vetements:{kind:'browse',slots:[Sl(.15,.44),Sl(.35,.44),Sl(.55,.44),Sl(.78,.5),Sl(.3,.74)],draw(g){const{c,x,y,w,h}=g;planksR(g,'#efe7da','#e2d7c6');
   for(const v of [.24,.6]){c.strokeStyle='#888';c.lineWidth=1.5;c.beginPath();c.moveTo(x(.05),y(v));c.lineTo(x(.64),y(v));c.stroke();
     for(let k=0;k<9;k++)R(c,x(.07+k*.064),y(v)-h(.07),w(.045),h(.14),['#2b8fbd','#e85d4a','#f2b134','#47a36b','#ffffff','#9a5fd1','#3b4a6b'][(k+Math.round(v*10))%7])}
   for(const u of [.71,.85]){R(c,x(u),y(.04),w(.12),h(.3),'#2b8fbd');R(c,x(u),y(.04),w(.025),h(.3),'#1d6a8e')}}},
 arcade:{kind:'play',slots:[0,1,2,3,4].map(k=>Sl(.17+k*.165,.42)),draw(g){const{c,x,y,w,h}=g;R(c,g.X,g.Y,g.W,g.H,'#2a2340');
   for(let k=0;k<5;k++){R(c,x(.1+k*.165),y(.04),w(.14),h(.24),'#1b1630');R(c,x(.12+k*.165),y(.07),w(.1),h(.1),'#3a3355')}
   c.strokeStyle='#8c3fd1';c.lineWidth=2;c.strokeRect(x(.02),y(.02),w(.96),h(.96))},
   live(g,l,t){const{c,x,y,w,h}=g;for(let k=0;k<5;k++){const on=!!l.occupants[k];R(c,x(.12+k*.165),y(.07),w(.1),h(.1),on?`hsl(${(t*120+k*70)%360},90%,60%)`:'#3a3355')}}},
 restaurant:{kind:'sit',slots:[.14,.38,.62,.86].flatMap(u=>[Sl(u,.25),Sl(u,.68)]),draw(g){const{c,x,y,w,h,m}=g;checkerR(g,'#8a3a48','#7d2a3a',6);
   for(const u of [.14,.38,.62,.86]){O(c,x(u),y(.25),m(.07),'#3a2a1a');O(c,x(u),y(.68),m(.07),'#3a2a1a');R(c,x(u-.08),y(.35),w(.16),h(.22),'#ffffff');O(c,x(u),y(.46),m(.035),'#f2c14e')}}},
 bowling:{kind:'bowl',slots:[.2,.5,.8].map(u=>Sl(u,.88)),draw(g){const{c,x,y,w,h}=g;R(c,g.X,g.Y,g.W,g.H,'#3a3f5c');
   for(const u of [.2,.5,.8]){R(c,x(u-.12),y(.03),w(.24),h(.76),'#8a8f9c');R(c,x(u-.09),y(.03),w(.18),h(.76),'#e2c08d');R(c,x(u-.12),y(.78),w(.24),h(.015),'#c0392b')}
   R(c,x(.0),y(.8),w(.06),h(.18),'#555')},
   live(g,l){const{c,x,y,m}=g;[.2,.5,.8].forEach((u,k)=>{const ln=l.bowlingLanes[k];
     for(let r=0;r<4;r++)for(let q=0;q<=r;q++){const px=x(u+(q-r/2)*.035),py=y(.07+r*.045);
       if(ln.down>0&&(q+r)%5!==4){c.strokeStyle='#cfcfcf';c.lineWidth=m(.025);c.beginPath();c.moveTo(px-m(.03),py);c.lineTo(px+m(.03),py+m(.01));c.stroke()}else O(c,px,py,m(.022),'#ffffff')}
     if(ln.ball>=0)O(c,x(u),y(.76-ln.ball*.66),m(.045),['#d6336c','#3d7dd8','#47a36b'][k])})}},
 cinema:{kind:'session',slots:[.34,.52,.7].flatMap(v=>[.1,.24,.38,.62,.76,.9].map(u=>Sl(u,v))),draw(g){const{c,x,y,w,h}=g;R(c,g.X,g.Y,g.W,g.H,'#2b1f2a');
   R(c,x(.05),y(.03),w(.9),h(.1),'#4a4048');
   for(const v of [.34,.52,.7])for(const u of [.1,.24,.38,.62,.76,.9]){R(c,x(u-.05),y(v-.06),w(.1),h(.11),'#d22f3b');R(c,x(u-.05),y(v-.06),w(.1),h(.03),'#9e1f29')}},
   live(g,l,t){const{c,x,y,w,h}=g;if(l.cinema.phase==='film'){for(let k=0;k<8;k++)R(c,x(.07+k*.1075),y(.045),w(.11),h(.07),`hsl(${(t*60+k*25+Math.sin(t*3+k)*40)%360},70%,${55+20*Math.sin(t*5+k)}%)`);
       c.fillStyle=`rgba(255,255,230,${.1+.06*Math.sin(t*7)})`;c.beginPath();c.moveTo(x(.07),y(.12));c.lineTo(x(.93),y(.12));c.lineTo(x(.98),y(.8));c.lineTo(x(.02),y(.8));c.closePath();c.fill()}
     else R(c,x(.07),y(.045),w(.86),h(.07),'#e9e6dc')}},
 bijouterie:{kind:'browse',slots:[Sl(.25,.38),Sl(.75,.38),Sl(.22,.7),Sl(.78,.7)],draw(g){const{c,x,y,w,h,m}=g;checkerR(g,'#f4efe4','#ebe3d2',6);
   R(c,x(.04),y(.05),w(.92),h(.16),'#cfeef3');for(let k=0;k<8;k++)O(c,x(.09+k*.117),y(.13),m(.03),k%2?'#f2c14e':'#2aa7b8');R(c,x(.02),y(.3),w(.06),h(.5),'#cfeef3');R(c,x(.92),y(.3),w(.06),h(.5),'#cfeef3');
   O(c,x(.5),y(.52),m(.14),'#cfeef3');O(c,x(.5),y(.52),m(.05),'#f2c14e')}},
 piscine:{kind:'mix',slots:[Sl(.5,.18,'swim'),Sl(.5,.38,'swim'),Sl(.5,.58,'swim'),Sl(.12,.86,'sit'),Sl(.88,.86,'sit')],draw(g){const{c,x,y,w,h}=g;R(c,g.X,g.Y,g.W,g.H,'#e9e2d0');
   R(c,x(.04),y(.05),w(.92),h(.64),'#4fa8de');c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=1;c.setLineDash([3,3]);for(const v of [.28,.48]){c.beginPath();c.moveTo(x(.05),y(v));c.lineTo(x(.95),y(v));c.stroke()}c.setLineDash([]);
   for(const u of [.06,.18,.82,.94])R(c,x(u-.04),y(.76),w(.08),h(.2),['#f2c14e','#ef7fb0','#2bb3b1','#ff8c42'][Math.round(u*10)%4])}},
 manege:{kind:'ride',slots:[0,1,2,3,4,5,6,7].map(k=>Sl(.5,.47,'ride')),draw(g){const{c,x,y,m}=g;R(c,g.X,g.Y,g.W,g.H,'#f6ebc6');O(c,x(.5),y(.47),m(.43),'#d9c48a');
   for(const u of [.06,.94])O(c,x(u),y(.2),m(.07),'#3f8a3a')},
   live(g,l,t){const{c,x,y,m}=g;const cx=x(.5),cy=y(.47),Rr=m(.4),a0=Game.state.gameTime*.9;for(let k=0;k<12;k++){c.fillStyle=k%2?'#ffffff':(k%4?'#e9b92e':'#d64560');c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,Rr,a0+k*Math.PI/6,a0+(k+1)*Math.PI/6);c.closePath();c.fill()}
     O(c,cx,cy,Rr*.2,'#d64560');O(c,cx,cy,Rr*.08,'#f2c14e')}},
 hotel:{kind:'lobby',slots:[Sl(.5,.36),Sl(.15,.4),Sl(.15,.62),Sl(.85,.4),Sl(.85,.62)],draw(g){const{c,x,y,w,h,m}=g;checkerR(g,'#efe9dc','#e4dccb',6);
   R(c,x(.3),y(.05),w(.4),h(.16),'#b08a2e');O(c,x(.65),y(.13),m(.025),'#fff');R(c,x(.03),y(.3),w(.07),h(.42),'#7d2a3a');R(c,x(.9),y(.3),w(.07),h(.42),'#7d2a3a');
   E(c,x(.5),y(.6),w(.16),h(.15),'#c8553d');E(c,x(.5),y(.6),w(.1),h(.09),'#e08a6a');O(c,x(.08),y(.13),m(.07),'#3f8a3a');O(c,x(.92),y(.13),m(.07),'#3f8a3a')}},
};
function geomOf(l){const wt=Math.max(3,l.h*.06);return{X:l.x+wt,Y:l.y+wt,W:l.w-2*wt,H:l.h-2*wt,flip:LOT_DOOR[l.index]==='top'}}
function withG(c,G,fn){c.save();if(G.flip){c.translate(0,2*G.Y+G.H);c.scale(1,-1)}
  const {X,Y,W,H}=G;fn({c,X,Y,W,H,x:u=>X+u*W,y:v=>Y+v*H,w:u=>u*W,h:v=>v*H,m:r=>r*H});c.restore()}
function toWorld(l,u,v){const G=geomOf(l);return[G.X+u*G.W,G.Y+(G.flip?1-v:v)*G.H]}
function drawShop(c,t,x,y,W,H,st){
  c.save();
  c.fillStyle='rgba(20,25,20,.22)';rrect(c,x+3,y+4,W,H,6);c.fill();
  const wt=Math.max(3,H*.06),wall=mix(t.color,-.3),side=st?LOT_DOOR[st.index]:'bottom';
  c.save();rrect(c,x,y,W,H,5);c.clip();R(c,x,y,W,H,wall);
  withG(c,{X:x+wt,Y:y+wt,W:W-2*wt,H:H-2*wt,flip:side==='top'},g=>SPEC[t.id].draw(g));
  c.restore();
  c.strokeStyle=wall;c.lineWidth=wt;rrect(c,x+wt/2,y+wt/2,W-wt,H-wt,4);c.stroke();
  if(st){const g=W*.24,m=(W-g)/2;c.fillStyle='#e9e3d6';if(side==='top')c.fillRect(x+m,y-1,g,wt+2);else c.fillRect(x+m,y+H-wt-1,g,wt+2)}
  const bx=x+W-H*.17,by=side==='top'?y+H*.2:y+H*.8,br=Math.max(7,H*.1);
  O(c,bx,by,br,'#ffffff');c.strokeStyle=wall;c.lineWidth=1.5;c.beginPath();c.arc(bx,by,br,0,7);c.stroke();icon(c,t.icon,bx,by,br*.72,t.color);
  if(st){
    if(st.owner!=null){c.strokeStyle=PCOL[st.owner];c.lineWidth=3;rrect(c,x-2,y-2,W+4,H+4,7);c.stroke()}
    const ty=side==='top'?y+H-19:y+4;
    if(st.level>1){const w=30,h=15;c.fillStyle='#f2c14e';rrect(c,x+4,ty,w,h,h/2);c.fill();
      c.fillStyle='#5a3d00';c.font='800 11px Nunito, system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('★'+st.level,x+4+w/2,ty+h/2+.5)}
    for(let k=0;k<st.shields;k++)shield(c,x+40+k*13,ty,10);
  }
  c.restore();
}
function drawLive(l,t){
  const sp=SPEC[l.shop.id];
  if(sp.live)withG(ctx,geomOf(l),g=>sp.live(g,l,t));
  const free=l.occupants.filter(o=>!o).length;let txt=null,col='#c0392b';
  if(sp.kind==='session'){const rem=Math.ceil((l.cinema.phase==='open'?CINE_OPEN:CINE_FILM)-l.cinema.elapsed);txt=l.cinema.phase==='open'?`Séance dans ${rem} s`:`Film · ${rem} s`;col=l.cinema.phase==='open'?'#2f7d6d':'#d22f3b'}
  else if(!free)txt='Complet';
  if(txt){ctx.font='800 10px Nunito, system-ui, sans-serif';const tw=ctx.measureText(txt).width+12,[px,py]=toWorld(l,.5,.93);
    ctx.fillStyle=col;rrect(ctx,px-tw/2,py-7,tw,14,7);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,px,py+.5)}
}
const CINE_OPEN=40,CINE_FILM=25;
function setShop(l,t,owner){l.shop=t;l.owner=owner;l.occupants=Array(SPEC[t.id].slots.length).fill(null);l.bowlingLanes=[0,1,2].map(()=>({ball:-1,down:0}));l.cinema={phase:'open',elapsed:0}}
function hasRoom(l){return l.shop&&l.occupants.some(o=>!o)&&!(SPEC[l.shop.id].kind==='session'&&l.cinema.phase!=='open')}
function updateShop(l,dt){
  if(!l.shop)return;
  for(const ln of l.bowlingLanes){if(ln.down>0)ln.down=Math.max(0,ln.down-dt)}
  if(SPEC[l.shop.id].kind==='session'){l.cinema.elapsed+=dt;
    if(l.cinema.phase==='open'&&l.cinema.elapsed>=CINE_OPEN){l.cinema.phase='film';l.cinema.elapsed=0}
    else if(l.cinema.phase==='film'&&l.cinema.elapsed>=CINE_FILM){l.cinema.phase='open';l.cinema.elapsed=0;for(const p of l.occupants)if(p)p.done=true}}
}
function shield(c,x,y,w){c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y);c.lineTo(x+w,y+w*.55);c.quadraticCurveTo(x+w,y+w*1.05,x+w/2,y+w*1.25);c.quadraticCurveTo(x,y+w*1.05,x,y+w*.55);c.closePath();
  c.fillStyle='#3a86ff';c.fill();c.strokeStyle='#fff';c.lineWidth=1.4;c.stroke()}
function drawActionIcon(c,t,x,y,s){
  c.save();c.fillStyle=t.id==='meteorite'?'#2b2440':'#cfe3c4';rrect(c,x,y,s,s,6);c.fill();
  if(t.id==='meteorite'){const g=c.createLinearGradient(x+s*.9,y+s*.1,x+s*.45,y+s*.55);g.addColorStop(0,'rgba(255,200,80,0)');g.addColorStop(1,'rgba(255,140,40,.95)');
    c.strokeStyle=g;c.lineWidth=s*.22;c.lineCap='round';c.beginPath();c.moveTo(x+s*.9,y+s*.1);c.lineTo(x+s*.45,y+s*.55);c.stroke();
    c.fillStyle='#7a5a44';c.beginPath();c.arc(x+s*.4,y+s*.6,s*.2,0,7);c.fill();c.fillStyle='#5a4030';c.beginPath();c.arc(x+s*.35,y+s*.58,s*.05,0,7);c.arc(x+s*.46,y+s*.67,s*.04,0,7);c.fill()}
  else{c.fillStyle='#8a8f86';c.fillRect(x,y+s*.4,s,s*.22);car(c,x+s/2,y+s*.51,0,s*.75,'#2c3e50')}
  c.restore()}
function car(c,x,y,ang,len,col){c.save();c.translate(x,y);c.rotate(ang);const w=len*.5;
  c.fillStyle='#222';for(const u of [-.3,.3])for(const v of [-1,1])c.fillRect(len*u-len*.08,v*w/2-(v>0?0:len*.05),len*.16,len*.05);
  c.fillStyle=col;rrect(c,-len/2,-w/2,len,w,len*.12);c.fill();
  c.fillStyle='#bfe3f2';c.fillRect(len*.05,-w*.38,len*.18,w*.76);c.fillRect(-len*.3,-w*.34,len*.12,w*.68);
  c.fillStyle='#111';c.fillRect(-len*.12,-w*.3,len*.12,w*.6);
  c.fillStyle='#fff3a0';c.fillRect(len*.44,-w*.4,len*.05,w*.18);c.fillRect(len*.44,w*.22,len*.05,w*.18);c.restore()}

Game.interiors = SPEC; // alias temporaire (retiré à la fin)
