// Boucle d'animation, interactions tactiles, réglages et démarrage du jeu.
// ================= Boucle =================
let last=0;
function frame(t){
  try{ if(!bg.width||!cv.width){resize();requestAnimationFrame(frame);return} frameInner(t) }catch(e){const el=document.getElementById('err');el.hidden=false;el.textContent='Erreur : '+e.message}
  requestAnimationFrame(frame);
}
function frameInner(t){
  const raw=Math.min(.05,(t-last)/1000||0);last=t;const dt=raw*Game.state.speedMultiplier;
  if(Game.state.isRunning){
    Game.state.gameTime+=dt;for(const l of Game.state.lots)updateShop(l,dt);
    Game.people.updateAll(dt);
    Game.people.spawnIfNeeded(dt);
    for(const a of Game.state.animations.slice())updateAnim(a,dt);Game.state.animations=Game.state.animations.filter(a=>!a.done);
    if(Math.random()<.004*dt)randomEvent('fire');
    if(Math.random()<.011*dt)randomEvent('monster');
    if(Math.random()<.009*dt)randomEvent('ufo');
  }
  Game.feedback.update(raw);

  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(bg,0,0);
  ctx.setTransform(Game.view.pixelRatio*Game.view.scale,0,0,Game.view.pixelRatio*Game.view.scale,0,0);
  ctx.save();ctx.translate(BX,0);ctx.beginPath();ctx.rect(0,0,BW,LH);ctx.clip();
  if(Game.state.selection){const card=CATALOG[Game.state.selection.i];ctx.lineWidth=2.5;ctx.setLineDash([8,6]);ctx.lineDashOffset=-t/40;
    for(const l of Game.state.lots){if(card.isAction?(l.shop&&l.owner===1-Game.state.selection.p&&!l.isBusy):!l.shop){ctx.strokeStyle=card.isAction?'#c0392b':PCOL[Game.state.selection.p];rrect(ctx,l.x+2,l.y+2,l.width-4,l.height-4,6);ctx.stroke()}}ctx.setLineDash([])}
  for(const l of Game.state.lots)if(l.shop)drawLive(l,t/1000);
  Game.people.drawAll(Game.state.hoveredPerson);
  for(const a of Game.state.animations)if(a.k!=='ufo'&&a.k!=='monster')drawAnim(a);
  for(const a of Game.state.animations)if(a.k==='ufo'||a.k==='monster')drawAnim(a);
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(const f of Game.state.floatingTexts){ctx.globalAlpha=1-f.age/1.4;ctx.font='800 18px "Baloo 2", system-ui, sans-serif';ctx.lineWidth=4;ctx.strokeStyle='#ffffff';ctx.strokeText(f.text,f.x,f.y-f.age*30);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y-f.age*30)}
  ctx.globalAlpha=1;
  if(Game.state.menuLot&&Game.state.menuLot.shop)drawMenu(ctx,Game.state.menuLot);
  if(Game.state.hoveredPerson&&Game.state.people.includes(Game.state.hoveredPerson)){
    const txt=(Game.state.hoveredPerson.state==='inside'||Game.state.hoveredPerson.state==='leaving')&&Game.state.hoveredPerson.lot&&Game.state.hoveredPerson.lot.shop?`${Game.state.hoveredPerson.name} · ${Game.state.hoveredPerson.lot.shop.name}`:`${Game.state.hoveredPerson.name} · de ${EXIT_LABEL[Game.state.hoveredPerson.from]} vers ${EXIT_LABEL[Game.state.hoveredPerson.to]}`;
    ctx.font='700 14px Nunito, system-ui, sans-serif';const w=ctx.measureText(txt).width+18,bx=Math.max(6,Math.min(BW-w-6,Game.state.hoveredPerson.x-w/2)),by=Math.max(6,Game.state.hoveredPerson.y-52);
    ctx.fillStyle='#ffffff';rrect(ctx,bx,by,w,26,8);ctx.fill();ctx.fillStyle='#23272b';ctx.textAlign='left';ctx.fillText(txt,bx+9,by+13.5)}
  if(Game.state.banner){ctx.font='800 16px Nunito, system-ui, sans-serif';const w=Math.min(BW-40,ctx.measureText(Game.state.banner.text).width+30),a=Math.min(1,Game.state.banner.age*4,(4-Game.state.banner.age)*2);
    ctx.globalAlpha=a;ctx.fillStyle='rgba(30,34,40,.88)';rrect(ctx,BW/2-w/2,LH-52,w,34,17);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(Game.state.banner.text,BW/2,LH-34.5,w-20);ctx.globalAlpha=1}
  if(!Game.state.isRunning){ctx.fillStyle='rgba(30,34,40,.75)';rrect(ctx,BW/2-50,14,100,30,15);ctx.fill();ctx.fillStyle='#fff';ctx.font='800 15px Nunito, system-ui, sans-serif';ctx.textAlign='center';ctx.fillText('Pause',BW/2,29.5)}
  ctx.restore();
  drawTray(0);drawTray(1);
}

// ================= Interactions =================
function toLogical(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/Game.view.scale,(e.clientY-r.top)/Game.view.scale]}
const inR=(x,y,[rx,ry,w,h])=>x>=rx&&x<=rx+w&&y>=ry&&y<=ry+h;
cv.addEventListener('pointerdown',e=>{
  const [x,y]=toLogical(e),bx=x-BX;
  if(Game.state.menuLot){const l=Game.state.menuLot,m=menuLayout(l);Game.state.menuLot=null;
    for(const it of m.items)if(inR(bx,y,it.r)){
      if(it.act==='up'&&Game.state.bucks[l.owner]>=it.cost){Game.state.bucks[l.owner]-=it.cost;l.level++;drawBoard();float(l,'Niveau '+l.level,'#b7791f');log(`${PNAME[l.owner]} améliore ${nom(l)} au niveau ${l.level}.`)}
      else if(it.act==='shield'&&Game.state.bucks[l.owner]>=it.cost){Game.state.bucks[l.owner]-=it.cost;l.shields++;drawBoard();float(l,'Bouclier +1','#3a86ff')}
      else if(it.act&&it.act!=='close'){Game.state.menuLot=l;float(l,'Pas assez de bucks','#c0392b')}
      return}
    if(inR(bx,y,[m.x,m.y,m.width,m.height]))return}
  for(const p of [0,1])for(let i=0;i<CATALOG.length;i++)if(inR(x,y,cardRect(p,i))){Game.state.selection=(Game.state.selection&&Game.state.selection.p===p&&Game.state.selection.i===i)?null:{p,i};return}
  const l=Game.state.lots.find(l=>inR(bx,y,[l.x,l.y,l.width,l.height]));
  if(Game.state.selection&&l){const card=CATALOG[Game.state.selection.i],p=Game.state.selection.p;
    if(Game.state.bucks[p]<card.price){float(l,'Pas assez de bucks','#c0392b');return}
    if(!card.isAction&&!l.shop){Game.state.bucks[p]-=card.price;setShop(l,card,p);Game.state.selection=null;drawBoard();log(`${PNAME[p]} ouvre ${nom(l)}.`);return}
    if(card.isAction&&l.shop&&!l.isBusy){
      if(l.owner!==1-p){float(l,'Vise une boutique adverse','#c0392b');return}
      Game.state.bucks[p]-=card.price;Game.state.selection=null;
      if(card.id==='meteorite')launchMeteor(p,l);else launchThief(p,l);return}
  }
  if(l&&l.shop&&!Game.state.selection){Game.state.menuLot=l;return}
  Game.state.hoveredPerson=nearest(bx,y);
});
function nearest(x,y){let best=null,bd=16;for(const p of Game.state.people){const d=Math.hypot(p.x-x,p.y-10-y);if(d<bd){bd=d;best=p}}return best}
cv.addEventListener('pointermove',e=>{const [x,y]=toLogical(e);Game.state.hoveredPerson=nearest(x-BX,y)});
cv.addEventListener('pointerleave',()=>Game.state.hoveredPerson=null);

function resize(){
  const w=cv.parentElement.clientWidth-parseFloat(getComputedStyle(cv.parentElement).paddingLeft)*2;
  if(!(w>0))return;
  Game.view.pixelRatio=Math.min(devicePixelRatio||1,2);Game.view.scale=w/LW;
  for(const c of [cv,bg]){c.width=Math.round(LW*Game.view.scale*Game.view.pixelRatio);c.height=Math.round(LH*Game.view.scale*Game.view.pixelRatio)}
  cv.style.height=Math.round(LH*Game.view.scale)+'px';drawBoard();
}
const pop=document.getElementById('pop'),spd=document.getElementById('spd'),play=document.getElementById('play');
pop.addEventListener('input',()=>{Game.state.targetPopulation=+pop.value;document.getElementById('popv').textContent=Game.state.targetPopulation});
spd.addEventListener('input',()=>{Game.state.speedMultiplier=+spd.value;document.getElementById('spdv').textContent='×'+Game.state.speedMultiplier});
play.addEventListener('click',()=>{Game.state.isRunning=!Game.state.isRunning;play.textContent=Game.state.isRunning?'Pause':'Lecture'});
document.getElementById('reset').addEventListener('click',reset);
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(resize,120)});
if(window.ResizeObserver){let lastW=0;new ResizeObserver(()=>{const w=cv.parentElement.clientWidth;if(w!==lastW){lastW=w;clearTimeout(rt);rt=setTimeout(resize,60)}}).observe(cv.parentElement)}

reset();resize();
play.textContent=Game.state.isRunning?'Pause':'Lecture';
requestAnimationFrame(frame);
