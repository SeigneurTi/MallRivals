// Dessin du fond de carte, des bacs de cartes et du Game.state.menuLot d'une boutique.
// ================= Fond =================
function drawBoard(){
  const c=bctx;c.setTransform(Game.view.pixelRatio*Game.view.scale,0,0,Game.view.pixelRatio*Game.view.scale,Game.view.pixelRatio*Game.view.scale*BX,0);
  c.fillStyle='#d9dbd5';c.fillRect(0,0,BW,LH);
  const seg=([a,b],h)=>{const p=N[a],q=N[b];return[Math.min(p[0],q[0])-h,Math.min(p[1],q[1])-h,Math.abs(p[0]-q[0])+2*h,Math.abs(p[1]-q[1])+2*h]};
  c.fillStyle='#c6c9c1';for(const e of EDGES)c.fillRect(...seg(e,RH+2));
  c.fillStyle='#f5f5f1';for(const e of EDGES)c.fillRect(...seg(e,RH));
  for(const l of Game.state.lots){c.fillStyle='#b8bbb3';rrect(c,l.x,l.y,l.width,l.height,6);c.fill();c.fillStyle='rgba(255,255,255,.12)';rrect(c,l.x+3,l.y+3,l.width-6,l.height*.4,4);c.fill();
    if(l.isHot){const cx=l.x+l.width/2,cy=l.y+l.height/2,R=Math.min(l.width,l.height)*.46,g=c.createRadialGradient(cx,cy,0,cx,cy,R);g.addColorStop(0,'rgba(242,120,150,.6)');g.addColorStop(1,'rgba(242,120,150,0)');c.fillStyle=g;c.beginPath();c.arc(cx,cy,R,0,7);c.fill()}
    if(l.shop)Game.shops.drawBuilding(c,l)}
}

// ================= Bacs (même catalogue des deux côtés) =================
const cardRect=(p,i)=>{const x0=p?LW-TW:0,col=i%2,row=Math.floor(i/2);return[x0+8+col*59,50+row*58,55,44]};
function drawTray(p){
  const x0=p?LW-TW:0,c=ctx;
  c.fillStyle='#2a2e36';c.fillRect(x0,0,TW,LH);c.fillStyle=PCOL[p];c.fillRect(x0,0,TW,5);
  c.textAlign='center';c.textBaseline='middle';c.font='800 16px "Baloo 2", system-ui, sans-serif';c.fillStyle='#ffffff';c.fillText(PNAME[p],x0+TW/2,21);
  c.font='700 11px Nunito, system-ui, sans-serif';
  if(Game.state.selection&&Game.state.selection.p===p){c.fillStyle=PCOL[p];c.fillText(CATALOG[Game.state.selection.i].name,x0+TW/2,39)}else{c.fillStyle='#9aa2ad';c.fillText('Choisis une carte',x0+TW/2,39)}
  CATALOG.forEach((t,i)=>{const [x,y,w,h]=cardRect(p,i),on=Game.state.selection&&Game.state.selection.p===p&&Game.state.selection.i===i,ok=Game.state.bucks[p]>=t.price;
    c.globalAlpha=ok?1:.4;c.fillStyle=t.isAction?'#fde9e4':mix(t.color,.78);rrect(c,x,y,w,h,7);c.fill();
    if(on){c.strokeStyle='#ffffff';c.lineWidth=3;c.stroke();c.strokeStyle=PCOL[p];c.lineWidth=1.5;c.stroke()}
    if(t.isAction)drawActionIcon(c,t,x+w/2-13,y+3,26);else{O(c,x+w/2,y+16,12,'#ffffff');icon(c,t.icon,x+w/2,y+16,8.5,t.color)}
    c.fillStyle=t.isAction?'#c0392b':'#23272b';c.font='800 10.5px Nunito, system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(t.price+' $',x+w/2,y+h-7);c.fillStyle=on?PCOL[p]:'#c9ced6';c.font='700 8.5px Nunito, system-ui, sans-serif';c.fillText(t.name,x+w/2,y+h+6.5,w+2);c.globalAlpha=1});
  c.fillStyle='#ffffff';c.font='800 28px "Baloo 2", system-ui, sans-serif';c.fillText(Game.state.bucks[p],x0+TW/2,LH-40);
  c.fillStyle='#9aa2ad';c.font='700 12px Nunito, system-ui, sans-serif';c.fillText('bucks',x0+TW/2,LH-18);
}

// ================= Menu d'une boutique =================
function menuLayout(l){
  const tx=l.x,ty=l.y,w=220;
  const items=[];
  if(l.owner!=null){
    items.push({label:l.level<3?`Améliorer → niv. ${l.level+1}`:'Niveau max atteint',cost:l.level<3?upCost(l):null,act:l.level<3?'up':null});
    items.push({label:l.shields<3?`Bouclier (${l.shields}/3)`:'Boucliers au max',cost:l.shields<3?shieldCost(l):null,act:l.shields<3?'shield':null});
  }
  items.push({label:'Fermer',cost:null,act:'close'});
  const h=58+items.length*36;
  let x=tx+l.width/2-w/2,y=ty+l.height+8;if(y+h>LH-6)y=ty-h-8;x=Math.max(6,Math.min(BW-w-6,x));y=Math.max(6,y);
  items.forEach((it,k)=>it.r=[x+10,y+50+k*36,w-20,30]);
  return {x,y,width:w,height:h,items};
}
function drawMenu(c,l){
  const m=menuLayout(l);
  c.fillStyle='rgba(20,25,20,.25)';rrect(c,m.x+3,m.y+4,m.width,m.height,12);c.fill();
  c.fillStyle='#ffffff';rrect(c,m.x,m.y,m.width,m.height,12);c.fill();
  c.textAlign='left';c.textBaseline='middle';c.fillStyle='#23272b';c.font='800 17px "Baloo 2", system-ui, sans-serif';c.fillText(l.shop.name,m.x+12,m.y+18);
  c.fillStyle='#5d6560';c.font='600 12px Nunito, system-ui, sans-serif';
  c.font='600 11px Nunito, system-ui, sans-serif';c.fillText(`${l.owner!=null?PNAME[l.owner]:'Sans propriétaire'} · niv. ${l.level} · ${capOf(l.shop)} places · ${income(l)} $/client`,m.x+12,m.y+37,m.width-20);
  for(const it of m.items){const [x,y,w,h]=it.r,ok=it.act==='close'||(it.act&&Game.state.bucks[l.owner]>=it.cost);
    c.fillStyle=it.act==='close'?'#eef0ec':ok?(it.act==='shield'?'#e3edff':'#fff1e6'):'#f2f2f2';rrect(c,x,y,w,h,8);c.fill();
    c.fillStyle=ok?'#23272b':'#9aa0a6';c.font='700 13px Nunito, system-ui, sans-serif';c.textAlign='left';c.fillText(it.label,x+10,y+h/2+.5);
    if(it.cost!=null){c.textAlign='right';c.fillStyle=ok?'#c05621':'#9aa0a6';c.fillText(it.cost+' $',x+w-10,y+h/2+.5)}}
}

