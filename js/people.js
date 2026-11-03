// Passants : trajets, entrée dans les boutiques, activités à l'intérieur.
// ================= Passants =================
const SHIRT=['#e85d4a','#3d7dd8','#f2b134','#47a36b','#9a5fd1','#ef7fb0','#2bb3b1','#ff8c42','#3b4a6b'];
const SKIN=['#f5d0b0','#e0ac80','#b97a52','#8a5536','#f0c8a0'], HAIR=['#2b1d14','#5a3a22','#c9a26b','#111111','#8b4513','#d6d6d6'];
const NAMES=['Léa','Hugo','Chloé','Louis','Inès','Jules','Manon','Adam','Zoé','Nathan','Camille','Lucas','Jade','Tom','Emma','Noé','Sarah','Malo','Lina','Gabin','Rose','Sacha','Yasmine','Théo','Alice','Bilal','Margot','Arthur'];
let target=40,speedMul=1,running=!reduce,hover=null;

function makePerson(prefill){
  const from=pick(exits);let to=pick(exits);if(to===from&&Math.random()<.8)to=pick(exits.filter(k=>k!==from));
  const m1=pick(inner),m2=pick(inner);
  const ids=[...bfs(from,m1),...bfs(m1,m2).slice(1),...bfs(m2,to).slice(1)];
  const p={ids,pts:ids.map(k=>N[k]),i:0,d:0,state:'path',from,to,visited:new Set(),lx:rr(-13,13),ly:rr(-13,13),sp:rr(28,46),ph:rr(0,6.28),
    shirt:pick(SHIRT),pants:pick(['#3b4a6b','#2d2d34','#6b5440']),skin:pick(SKIN),hair:pick(HAIR),name:pick(NAMES),x:0,y:0,dir:1};
  if(prefill){p.i=Math.floor(rr(1,p.pts.length-2));p.d=rr(0,1)*segLen(p)}
  place(p);return p;
}
const segLen=p=>{const a=p.pts[p.i],b=p.pts[p.i+1];return Math.hypot(b[0]-a[0],b[1]-a[1])};
function place(p){const a=p.pts[p.i],b=p.pts[p.i+1],L=segLen(p)||1,t=Math.min(1,p.d/L);p.x=a[0]+(b[0]-a[0])*t+p.lx;p.y=a[1]+(b[1]-a[1])*t+p.ly;if(b[0]!==a[0])p.dir=b[0]>a[0]?1:-1}
function release(p){const l=p.lot;if(l&&l.occ&&p.slot!=null&&l.occ[p.slot]===p)l.occ[p.slot]=null;p.slot=null}
function exitShop(p){release(p);p.x=p.door[0];p.y=p.door[1];p.state='fromShop';p.target=p.back;p.k=1;p.mode=null}
function leaveShop(p){release(p);p.state='leaving';p.target=p.door;p.mode=null}
function tryEnter(p,oldD){
  const a=p.ids[p.i],b=p.ids[p.i+1],list=EDGE_SHOPS[a+'|'+b];if(!list||!list.length)return false;
  const A=N[a],B=N[b],hz=A[1]===B[1],dir=hz?Math.sign(B[0]-A[0]):Math.sign(B[1]-A[1]),start=hz?A[0]:A[1];
  const s0=start+dir*oldD,s1=start+dir*p.d;
  for(const e of list){const l=lots[e.idx];if(!l.b||l.closed>0||p.visited.has(l)||!hasRoom(l))continue;
    if((e.along-s0)*dir>0&&(e.along-s1)*dir<=0){p.visited.add(l);
      if(Math.random()<attraction(l)){p.d=Math.abs(e.along-start);place(p);p.state='toShop';p.lot=l;p.door=e.door;p.back=[p.x,p.y];p.target=e.door;return true}}}
  return false;
}
function clampIn(l,[x,y]){const G=geomOf(l);return[x,Math.max(G.Y+15,Math.min(G.Y+G.H-1,y))]}
function slotTarget(p){const l=p.lot,s=SPEC[l.b.id].slots[p.slot];return clampIn(l,toWorld(l,s.u,s.v))}
function startAct(p,l){const sp=SPEC[l.b.id],s=sp.slots[p.slot],k=s.k||sp.kind;p.mode=k;
  p.stay={browse:rr(3,6),sit:rr(6,10),play:rr(6,9),lobby:rr(5,8),swim:rr(8,12),ride:rr(8,11)}[k]||6;
  if(k==='bowl'){p.throws=0;p.bph='aim';p.bt=1}}
function actStep(p,dt){
  const l=p.lot,sp=SPEC[l.b.id],s=sp.slots[p.slot];
  if(p.mode==='ride'){const a=gameT*.9+p.slot*Math.PI/4,G=geomOf(l),r=.3;[p.x,p.y]=clampIn(l,toWorld(l,.5+Math.cos(a)*r*G.H/G.W,.47+Math.sin(a)*r+.04))}
  if(p.mode==='swim'){[p.x,p.y]=clampIn(l,toWorld(l,.5+.38*Math.sin(gameT*.5+p.slot*1.9),s.v));p.dir=Math.cos(gameT*.5+p.slot*1.9)>0?1:-1}
  if(p.mode==='session'){if(p.done)leaveShop(p);return}
  if(p.mode==='bowl'){const ln=l.lanes[p.slot];p.bt-=dt;
    if(p.bph==='aim'&&p.bt<=0){p.bph='roll';ln.ball=0}
    else if(p.bph==='roll'){ln.ball+=dt/1.1;if(ln.ball>=1){ln.ball=-1;ln.down=1.4;p.bph='wait';p.bt=1.5;const n=Math.random()<.35?10:Math.floor(rr(4,10));float(l,n===10?'Strike !':n+' quilles','#d6336c')}}
    else if(p.bph==='wait'&&p.bt<=0){p.throws++;if(p.throws>=3)leaveShop(p);else{p.bph='aim';p.bt=1}}
    return}
  p.stay-=dt;if(p.stay<=0)leaveShop(p);
}
function moveTo(p,dt,f=1){const dx=p.target[0]-p.x,dy=p.target[1]-p.y,d=Math.hypot(dx,dy),st=p.sp*dt*f;p.ph+=st*.28;
  if(d<=st){p.x=p.target[0];p.y=p.target[1];return true}p.x+=dx/d*st;p.y+=dy/d*st;if(Math.abs(dx)>1)p.dir=dx>0?1:-1;return false}
function step(p,dt){
  if(p.state==='toShop'){if(moveTo(p,dt)){const l=p.lot,free=l.b?l.occ.map((o,i)=>o?-1:i).filter(i=>i>=0):[];
      if(!l.b||l.closed>0||!hasRoom(l)||!free.length){p.state='fromShop';p.target=p.back;return true}
      p.slot=pick(free);l.occ[p.slot]=p;p.state='inside';p.sub='walk';p.k=.8;p.done=false;p.target=slotTarget(p);
      const g=income(l);if(l.owner!=null)bucks[l.owner]+=g;float(l,'+'+g,l.owner!=null?PCOL[l.owner]:'#555')}return true}
  if(p.state==='inside'){
    if(!p.lot.b){exitShop(p);return true}
    if(p.sub==='walk'){p.target=slotTarget(p);if(moveTo(p,dt,.5)){p.sub='act';startAct(p,p.lot)}return true}
    actStep(p,dt);return true}
  if(p.state==='leaving'){if(moveTo(p,dt,.6)){p.state='fromShop';p.target=p.back;p.k=1}return true}
  if(p.state==='fromShop'){if(moveTo(p,dt)){p.state='path';p.lot=null}return true}
  const oldD=p.d;p.d+=p.sp*dt;p.ph+=p.sp*dt*.28;
  if(tryEnter(p,oldD))return true;
  while(p.d>=segLen(p)){p.d-=segLen(p);p.i++;if(p.i>=p.pts.length-1)return false}
  place(p);return true;
}
function drawPerson(p,hl){
  const k=p.k||1;ctx.save();ctx.translate(p.x,p.y);ctx.scale(k,k);
  if(p.mode==='swim'&&p.state==='inside'&&p.sub==='act'){ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,-2,7,3,0,0,7);ctx.stroke();O(ctx,0,-3,3.6,p.skin);O(ctx,0,-4,3.6*.9,p.hair);O(ctx,p.dir*2,-2.5,1.4,p.skin);ctx.restore();return}
  const c=ctx,x=0,y=0,sw=Math.sin(p.ph)*2.4,bob=Math.abs(Math.sin(p.ph));
  c.fillStyle='rgba(20,25,20,.25)';c.beginPath();c.ellipse(x,y,5,2,0,0,7);c.fill();
  if(hl){c.strokeStyle='#e8743b';c.lineWidth=2;c.beginPath();c.ellipse(x,y,9,3.5,0,0,7);c.stroke()}
  c.strokeStyle=p.pants;c.lineWidth=2.2;c.lineCap='round';c.beginPath();c.moveTo(x-1.5,y-6-bob);c.lineTo(x-1.5+sw,y-.5);c.moveTo(x+1.5,y-6-bob);c.lineTo(x+1.5-sw,y-.5);c.stroke();
  c.fillStyle=p.shirt;c.beginPath();c.roundRect(x-3.8,y-12.5-bob,7.6,7.5,2.5);c.fill();
  c.fillStyle=p.skin;c.beginPath();c.arc(x,y-16-bob,3.4,0,7);c.fill();
  c.fillStyle=p.hair;c.beginPath();c.arc(x,y-16.8-bob,3.5,Math.PI*1.05,Math.PI*1.95);c.fill();
  if(p.state==='fromShop'||p.state==='leaving'){c.fillStyle='#f2c14e';c.fillRect(x+3,y-10-bob,5,5);c.strokeStyle='#a0673c';c.lineWidth=1;c.strokeRect(x+3,y-10-bob,5,5)}
  ctx.restore();
}

