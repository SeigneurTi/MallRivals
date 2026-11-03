// Météorite, voiture-voleur, monstre, OVNI, incendie et leurs animations.
// ================= Attaques et événements =================
function launchMeteor(p,l){l.isBusy=true;const [cx,cy]=center(l);log(`${PNAME[p]} envoie une météorite sur ${nom(l)} de ${PNAME[l.owner]} !`);
  Game.state.animations.push({k:'meteor',t:0,dur:1.3,from:[cx+380,cy-520],to:[cx,cy],end(){boom(cx,cy);l.isBusy=false;
    if(!l.shop)return;if(l.shields>0){l.shields--;drawBoard();float(l,'Bouclier !','#3a86ff');log(`Le bouclier ${deNom(l)} a arrêté la météorite.`)}
    else{log(`${l.shop.name} détruit par la météorite !`);destroy(l)}}})}
function launchThief(p,l){l.isBusy=true;log(`${PNAME[p]} envoie une voiture-voleur vers ${nom(l)}…`);
  const street=Game.map.lotStreet[l.index];
  const pts=[...bfs(p?'east':'west',street.right).map(k=>N[k]),street.access.streetPoint,street.access.door];
  Game.state.animations.push({k:'car',pts,i:0,d:0,col:PCOL[p],end(){l.isBusy=false;if(!l.shop)return;
    const chance=Math.max(.1,.75-.22*l.shields);
    if(Math.random()<chance){const old=l.owner;l.owner=p;l.shields=0;drawBoard();float(l,'Volé !',PCOL[p]);log(`Vol réussi : ${l.shop.name} passe de ${PNAME[old]} à ${PNAME[p]} !`)}
    else{if(l.shields>0)l.shields--;drawBoard();float(l,'Raté !','#555');log(`Le voleur a échoué devant ${nom(l)}.`)}
    smoke(...center(l))}})}
function boom(x,y){Game.state.animations.push({k:'boom',t:0,dur:.7,x,y})}
function smoke(x,y){Game.state.animations.push({k:'smoke',t:0,dur:1,x,y})}

function randomEvent(kind){
  const cands=Game.state.lots.filter(l=>l.shop&&!l.isBusy);if(!cands.length)return;const l=pick(cands),[cx,cy]=center(l);l.isBusy=true;
  if(kind==='fire'){log(`Incendie ${aNom(l)} !`);
    Game.state.animations.push({k:'fire',t:0,dur:6,l,end(){l.isBusy=false;if(!l.shop)return;
      const burn=l.shields>0?.15:.45;
      if(Math.random()<burn){log(`${l.shop.name} a brûlé…`);smoke(cx,cy);destroy(l)}else{float(l,'Éteint !','#2b8fbd');log(`Les pompiers ont sauvé ${nom(l)}.`)}}})}
  else if(kind==='monster'){log(`Un monstre attaque ${nom(l)} !`);const side=Math.random()<.5;
    Game.state.animations.push({k:'monster',t:0,dur:2.6,from:[side?-60:BW+60,cy+rr(-80,80)],to:[cx,cy+8],end(){l.isBusy=false;boom(cx,cy);if(!l.shop)return;
      if(l.shields>0){l.shields--;drawBoard();float(l,'Bouclier !','#3a86ff');log(`Le bouclier ${deNom(l)} a repoussé le monstre.`)}
      else if(l.level>1){l.level--;drawBoard();float(l,'Niveau −1','#c0392b');log(`${l.shop.name} perd un niveau à cause du monstre.`)}
      else{log(`Le monstre a détruit ${nom(l)} !`);destroy(l)}
      Game.state.animations.push({k:'monster',t:0,dur:1.8,from:[cx,cy+8],to:[side?BW+60:-60,cy-40]})}})}
  else{log(`Un OVNI survole ${nom(l)}…`);
    Game.state.animations.push({k:'ufo',t:0,dur:2,from:[rr(0,BW),-80],to:[cx,cy-60],then(){
      Game.state.animations.push({k:'ufo',t:0,dur:2.6,from:[cx,cy-60],to:[cx,cy-60],beam:l,end(){l.isBusy=false;
        if(l.shop){const r=Math.random();
          if(r<.35&&l.shields===0){for(const p of Game.state.people)if(p.lot===l&&p.state==='inside'){Game.people.takeAway(p)}log(`L'OVNI a emporté ${nom(l)} !`);destroy(l)}
          else if(r<.35){l.shields--;drawBoard();log(`Le bouclier ${deNom(l)} a repoussé l'OVNI.`)}
          else{const g=Math.round(l.shop.price*.6);if(l.owner!=null)Game.state.bucks[l.owner]+=g;float(l,'+'+g,'#6ad07a');log(`Les extraterrestres ont fait leurs courses ${aNom(l)} : +${g} $ !`)}}
        Game.state.animations.push({k:'ufo',t:0,dur:1.4,from:[cx,cy-60],to:[rr(0,BW),-90]})}})}})}
}

function drawAnim(a){
  const c=ctx,u=Math.min(1,a.t/(a.dur||1));
  if(a.k==='meteor'){const x=a.from[0]+(a.to[0]-a.from[0])*u,y=a.from[1]+(a.to[1]-a.from[1])*u;
    const g=c.createLinearGradient(x+90,y-120,x,y);g.addColorStop(0,'rgba(255,200,80,0)');g.addColorStop(1,'rgba(255,120,30,.9)');
    c.strokeStyle=g;c.lineWidth=16;c.lineCap='round';c.beginPath();c.moveTo(x+90,y-122);c.lineTo(x,y);c.stroke();
    c.fillStyle='#7a5a44';c.beginPath();c.arc(x,y,14,0,7);c.fill();c.fillStyle='#5a4030';c.beginPath();c.arc(x-4,y-3,3,0,7);c.arc(x+5,y+4,2.5,0,7);c.fill()}
  else if(a.k==='boom'){const R=10+u*60;c.fillStyle=`rgba(255,170,40,${.7*(1-u)})`;c.beginPath();c.arc(a.x,a.y,R,0,7);c.fill();c.fillStyle=`rgba(255,240,150,${.8*(1-u)})`;c.beginPath();c.arc(a.x,a.y,R*.5,0,7);c.fill()}
  else if(a.k==='smoke'){for(let k=0;k<5;k++){c.fillStyle=`rgba(120,120,120,${.45*(1-u)})`;c.beginPath();c.arc(a.x+(k-2)*10,a.y-u*40-k*4,8+u*14,0,7);c.fill()}}
  else if(a.k==='car'){const p=a.pts[a.i],q=a.pts[Math.min(a.i+1,a.pts.length-1)],L=Math.hypot(q[0]-p[0],q[1]-p[1])||1,t=Math.min(1,a.d/L);
    car(c,p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,Math.atan2(q[1]-p[1],q[0]-p[0]),30,'#2c3e50');
    c.fillStyle=a.col;c.beginPath();c.arc(p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,3,0,7);c.fill()}
  else if(a.k==='fire'){const x=a.l.x,y=a.l.y,s=a.l.height,W=a.l.width;for(let k=0;k<7;k++){const fx=x+W*(.1+k*.13),h=s*(.3+.15*Math.sin(a.t*12+k*1.7)),fy=y+s*(.5+.25*Math.sin(k*2.3));
      c.fillStyle=k%2?'rgba(255,90,30,.9)':'rgba(255,190,40,.9)';c.beginPath();c.moveTo(fx-s*.07,fy);c.quadraticCurveTo(fx-s*.05,fy-h*.6,fx,fy-h);c.quadraticCurveTo(fx+s*.05,fy-h*.6,fx+s*.07,fy);c.closePath();c.fill()}
    c.fillStyle='rgba(90,90,90,.35)';c.beginPath();c.arc(x+W/2,y-10-(a.t*20%30),s*.18,0,7);c.fill()}
  else if(a.k==='monster'){const x=a.from[0]+(a.to[0]-a.from[0])*u,y=a.from[1]+(a.to[1]-a.from[1])*u-Math.abs(Math.sin(a.t*8))*8;
    c.fillStyle='rgba(20,25,20,.25)';c.beginPath();c.ellipse(x,a.from[1]+(a.to[1]-a.from[1])*u+20,26,8,0,0,7);c.fill();
    c.fillStyle='#6a3fb5';for(const v of [-1,1]){c.beginPath();c.moveTo(x+v*12,y-28);c.lineTo(x+v*20,y-46);c.lineTo(x+v*4,y-32);c.fill()}
    c.fillStyle='#5fb350';c.beginPath();c.ellipse(x,y-6,24,28,0,0,7);c.fill();
    c.strokeStyle='#5fb350';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(x-20,y-6);c.lineTo(x-34,y-20+Math.sin(a.t*10)*6);c.moveTo(x+20,y-6);c.lineTo(x+34,y-20-Math.sin(a.t*10)*6);c.stroke();
    c.fillStyle='#fff';c.beginPath();c.arc(x-9,y-14,6,0,7);c.arc(x+9,y-14,6,0,7);c.fill();c.fillStyle='#111';c.beginPath();c.arc(x-8,y-13,3,0,7);c.arc(x+10,y-13,3,0,7);c.fill();
    c.fillStyle='#2d5a26';c.beginPath();c.arc(x,y+4,9,0,Math.PI);c.fill();c.fillStyle='#fff';c.fillRect(x-6,y+4,4,4);c.fillRect(x+2,y+4,4,4)}
  else if(a.k==='ufo'){const x=a.from[0]+(a.to[0]-a.from[0])*u,y=a.from[1]+(a.to[1]-a.from[1])*u+Math.sin(a.t*4)*3;
    if(a.beam){const tx=a.beam.x,ty=a.beam.y,s=a.beam.height,sw2=a.beam.width,al=.25+.15*Math.sin(a.t*10),g=c.createLinearGradient(0,y,0,ty+s);g.addColorStop(0,`rgba(180,255,170,${al+.2})`);g.addColorStop(1,`rgba(180,255,170,${al*.4})`);
      c.fillStyle=g;c.beginPath();c.moveTo(x-12,y+6);c.lineTo(x+12,y+6);c.lineTo(tx+sw2+6,ty+s);c.lineTo(tx-6,ty+s);c.closePath();c.fill()}
    c.fillStyle='rgba(160,220,255,.85)';c.beginPath();c.ellipse(x,y-6,14,12,0,Math.PI,0);c.fill();
    c.fillStyle='#8e9aa8';c.beginPath();c.ellipse(x,y,36,10,0,0,7);c.fill();c.fillStyle='#c7d0da';c.beginPath();c.ellipse(x,y-2,30,6,0,0,7);c.fill();
    for(let k=0;k<5;k++){c.fillStyle=(Math.floor(a.t*6)+k)%2?'#ffe27a':'#ff6b6b';c.beginPath();c.arc(x-24+k*12,y+2,2.5,0,7);c.fill()}}
}
function updateAnim(a,dt){
  if(a.k==='car'){a.d+=170*dt;while(a.i<a.pts.length-1){const p=a.pts[a.i],q=a.pts[a.i+1],L=Math.hypot(q[0]-p[0],q[1]-p[1]);if(a.d<L)break;a.d-=L;a.i++}
    if(a.i>=a.pts.length-1){a.done=true;a.end&&a.end()}return}
  a.t+=dt;if(a.t>=a.dur){a.done=true;a.end&&a.end();a.then&&a.then()}
}

