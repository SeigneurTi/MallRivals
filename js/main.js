// Boucle d'animation, interactions tactiles, réglages et démarrage du jeu.
// ================= Boucle =================
let last=0;
function frame(t){
  try{ if(!bg.width||!cv.width){resize();requestAnimationFrame(frame);return} frameInner(t) }catch(e){const el=document.getElementById('err');el.hidden=false;el.textContent='Erreur : '+e.message}
  requestAnimationFrame(frame);
}
function frameInner(t){
  const raw=Math.min(.05,(t-last)/1000||0);last=t;const dt=raw*speedMul;
  if(running){
    gameT+=dt;for(const l of lots)updateShop(l,dt);
    people=people.filter(p=>!p.gone&&step(p,dt));
    spawnT-=dt;if(people.length<target&&spawnT<=0){people.push(makePerson(false));spawnT=rr(.25,.7)}
    for(const a of anims.slice())updateAnim(a,dt);anims=anims.filter(a=>!a.done);
    if(Math.random()<.004*dt)randomEvent('fire');
    if(Math.random()<.011*dt)randomEvent('monster');
    if(Math.random()<.009*dt)randomEvent('ufo');
  }
  for(const f of floats)f.t+=raw;floats=floats.filter(f=>f.t<1.4);
  if(banner){banner.t+=raw;if(banner.t>4)banner=null}

  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(bg,0,0);
  ctx.setTransform(dpr*scale,0,0,dpr*scale,0,0);
  ctx.save();ctx.translate(BX,0);ctx.beginPath();ctx.rect(0,0,BW,LH);ctx.clip();
  if(sel){const card=CATALOG[sel.i];ctx.lineWidth=2.5;ctx.setLineDash([8,6]);ctx.lineDashOffset=-t/40;
    for(const l of lots){if(card.action?(l.b&&l.owner===1-sel.p&&!l.busy):!l.b){ctx.strokeStyle=card.action?'#c0392b':PCOL[sel.p];rrect(ctx,l.x+2,l.y+2,l.w-4,l.h-4,6);ctx.stroke()}}ctx.setLineDash([])}
  for(const l of lots)if(l.b)drawLive(l,t/1000);
  for(const p of people.slice().sort((a,b)=>a.y-b.y))drawPerson(p,p===hover);
  for(const a of anims)if(a.k!=='ufo'&&a.k!=='monster')drawAnim(a);
  for(const a of anims)if(a.k==='ufo'||a.k==='monster')drawAnim(a);
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(const f of floats){ctx.globalAlpha=1-f.t/1.4;ctx.font='800 18px "Baloo 2", system-ui, sans-serif';ctx.lineWidth=4;ctx.strokeStyle='#ffffff';ctx.strokeText(f.txt,f.x,f.y-f.t*30);ctx.fillStyle=f.col;ctx.fillText(f.txt,f.x,f.y-f.t*30)}
  ctx.globalAlpha=1;
  if(menu&&menu.b)drawMenu(ctx,menu);
  if(hover&&people.includes(hover)){
    const txt=(hover.state==='inside'||hover.state==='leaving')&&hover.lot&&hover.lot.b?`${hover.name} · ${hover.lot.b.name}`:`${hover.name} · de ${EXIT_LABEL[hover.from]} vers ${EXIT_LABEL[hover.to]}`;
    ctx.font='700 14px Nunito, system-ui, sans-serif';const w=ctx.measureText(txt).width+18,bx=Math.max(6,Math.min(BW-w-6,hover.x-w/2)),by=Math.max(6,hover.y-52);
    ctx.fillStyle='#ffffff';rrect(ctx,bx,by,w,26,8);ctx.fill();ctx.fillStyle='#23272b';ctx.textAlign='left';ctx.fillText(txt,bx+9,by+13.5)}
  if(banner){ctx.font='800 16px Nunito, system-ui, sans-serif';const w=Math.min(BW-40,ctx.measureText(banner.txt).width+30),a=Math.min(1,banner.t*4,(4-banner.t)*2);
    ctx.globalAlpha=a;ctx.fillStyle='rgba(30,34,40,.88)';rrect(ctx,BW/2-w/2,LH-52,w,34,17);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(banner.txt,BW/2,LH-34.5,w-20);ctx.globalAlpha=1}
  if(!running){ctx.fillStyle='rgba(30,34,40,.75)';rrect(ctx,BW/2-50,14,100,30,15);ctx.fill();ctx.fillStyle='#fff';ctx.font='800 15px Nunito, system-ui, sans-serif';ctx.textAlign='center';ctx.fillText('Pause',BW/2,29.5)}
  ctx.restore();
  drawTray(0);drawTray(1);
}

// ================= Interactions =================
function toLogical(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/scale,(e.clientY-r.top)/scale]}
const inR=(x,y,[rx,ry,w,h])=>x>=rx&&x<=rx+w&&y>=ry&&y<=ry+h;
cv.addEventListener('pointerdown',e=>{
  const [x,y]=toLogical(e),bx=x-BX;
  if(menu){const l=menu,m=menuLayout(l);menu=null;
    for(const it of m.items)if(inR(bx,y,it.r)){
      if(it.act==='up'&&bucks[l.owner]>=it.cost){bucks[l.owner]-=it.cost;l.level++;drawBoard();float(l,'Niveau '+l.level,'#b7791f');log(`${PNAME[l.owner]} améliore ${nom(l)} au niveau ${l.level}.`)}
      else if(it.act==='shield'&&bucks[l.owner]>=it.cost){bucks[l.owner]-=it.cost;l.shields++;drawBoard();float(l,'Bouclier +1','#3a86ff')}
      else if(it.act&&it.act!=='close'){menu=l;float(l,'Pas assez de bucks','#c0392b')}
      return}
    if(inR(bx,y,[m.x,m.y,m.w,m.h]))return}
  for(const p of [0,1])for(let i=0;i<CATALOG.length;i++)if(inR(x,y,cardRect(p,i))){sel=(sel&&sel.p===p&&sel.i===i)?null:{p,i};return}
  const l=lots.find(l=>inR(bx,y,[l.x,l.y,l.w,l.h]));
  if(sel&&l){const card=CATALOG[sel.i],p=sel.p;
    if(bucks[p]<card.price){float(l,'Pas assez de bucks','#c0392b');return}
    if(!card.action&&!l.b){bucks[p]-=card.price;setShop(l,card,p);sel=null;drawBoard();log(`${PNAME[p]} ouvre ${nom(l)}.`);return}
    if(card.action&&l.b&&!l.busy){
      if(l.owner!==1-p){float(l,'Vise une boutique adverse','#c0392b');return}
      bucks[p]-=card.price;sel=null;
      if(card.id==='meteorite')launchMeteor(p,l);else launchThief(p,l);return}
  }
  if(l&&l.b&&!sel){menu=l;return}
  hover=nearest(bx,y);
});
function nearest(x,y){let best=null,bd=16;for(const p of people){const d=Math.hypot(p.x-x,p.y-10-y);if(d<bd){bd=d;best=p}}return best}
cv.addEventListener('pointermove',e=>{const [x,y]=toLogical(e);hover=nearest(x-BX,y)});
cv.addEventListener('pointerleave',()=>hover=null);

function resize(){
  const w=cv.parentElement.clientWidth-parseFloat(getComputedStyle(cv.parentElement).paddingLeft)*2;
  if(!(w>0))return;
  dpr=Math.min(devicePixelRatio||1,2);scale=w/LW;
  for(const c of [cv,bg]){c.width=Math.round(LW*scale*dpr);c.height=Math.round(LH*scale*dpr)}
  cv.style.height=Math.round(LH*scale)+'px';drawBoard();
}
const pop=document.getElementById('pop'),spd=document.getElementById('spd'),play=document.getElementById('play');
pop.addEventListener('input',()=>{target=+pop.value;document.getElementById('popv').textContent=target});
spd.addEventListener('input',()=>{speedMul=+spd.value;document.getElementById('spdv').textContent='×'+speedMul});
play.addEventListener('click',()=>{running=!running;play.textContent=running?'Pause':'Lecture'});
document.getElementById('reset').addEventListener('click',reset);
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(resize,120)});
if(window.ResizeObserver){let lastW=0;new ResizeObserver(()=>{const w=cv.parentElement.clientWidth;if(w!==lastW){lastW=w;clearTimeout(rt);rt=setTimeout(resize,60)}}).observe(cv.parentElement)}

reset();resize();
play.textContent=running?'Pause':'Lecture';
requestAnimationFrame(frame);
